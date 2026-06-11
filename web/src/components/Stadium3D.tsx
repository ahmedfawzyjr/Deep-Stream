"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { playClickChime, playKickSound } from '../utils/audio';

// Define Camera Presets
type CameraPreset = 'tactical' | 'broadcast' | 'goalline' | 'orbit';

interface CameraTarget {
  pos: [number, number, number];
  look: [number, number, number];
}

const PRESETS: Record<CameraPreset, CameraTarget> = {
  tactical: { pos: [0, 16, 0.1], look: [0, 0, 0] },
  broadcast: { pos: [0, 11, 15], look: [0, 0, 0] },
  goalline: { pos: [-14, 3, 0], look: [0, 1, 0] },
  orbit: { pos: [10, 8, 10], look: [0, 0, 0] }
};

interface PlayerData {
  id: string;
  name: string;
  number: number;
  team: 'arg' | 'fra';
  position: [number, number, number];
}

// 11 Players for Argentina (4-3-3 Attacking)
const ARGENTINA_PLAYERS: PlayerData[] = [
  { id: 'arg_1', name: 'E. Martínez', number: 23, team: 'arg', position: [-12, 0, 0] },     // GK
  { id: 'arg_2', name: 'N. Molina', number: 26, team: 'arg', position: [-9, 0, 4.5] },       // RB
  { id: 'arg_3', name: 'C. Romero', number: 13, team: 'arg', position: [-9.5, 0, 1.8] },     // RCB
  { id: 'arg_4', name: 'N. Otamendi', number: 19, team: 'arg', position: [-9.5, 0, -1.8] },   // LCB
  { id: 'arg_5', name: 'N. Tagliafico', number: 3, team: 'arg', position: [-9, 0, -4.5] },   // LB
  { id: 'arg_6', name: 'R. De Paul', number: 7, team: 'arg', position: [-5.5, 0, 2.2] },     // RCM
  { id: 'arg_7', name: 'Enzo F.', number: 24, team: 'arg', position: [-7.0, 0, 0] },         // DM
  { id: 'arg_8', name: 'A. Mac Allister', number: 20, team: 'arg', position: [-5.5, 0, -2.2] },// LCM
  { id: 'arg_9', name: 'L. Messi', number: 10, team: 'arg', position: [-2.0, 0, 3.2] },      // RW
  { id: 'arg_10', name: 'J. Álvarez', number: 9, team: 'arg', position: [-1.5, 0, 0] },      // ST
  { id: 'arg_11', name: 'Á. Di María', number: 11, team: 'arg', position: [-2.0, 0, -3.2] }   // LW
];

// 11 Players for France (4-2-3-1 Fluid)
const FRANCE_PLAYERS: PlayerData[] = [
  { id: 'fra_1', name: 'M. Maignan', number: 16, team: 'fra', position: [12, 0, 0] },        // GK
  { id: 'fra_2', name: 'J. Koundé', number: 5, team: 'fra', position: [9, 0, 4.5] },         // RB
  { id: 'fra_3', name: 'D. Upamecano', number: 4, team: 'fra', position: [9.5, 0, 1.8] },    // RCB
  { id: 'fra_4', name: 'I. Konaté', number: 24, team: 'fra', position: [9.5, 0, -1.8] },      // LCB
  { id: 'fra_5', name: 'T. Hernandez', number: 22, team: 'fra', position: [9, 0, -4.5] },    // LB
  { id: 'fra_6', name: 'A. Tchouaméni', number: 8, team: 'fra', position: [6.0, 0, 1.6] },   // RDM
  { id: 'fra_7', name: 'A. Rabiot', number: 14, team: 'fra', position: [6.0, 0, -1.6] },      // LDM
  { id: 'fra_8', name: 'O. Dembélé', number: 11, team: 'fra', position: [3.0, 0, 4.0] },      // RAM
  { id: 'fra_9', name: 'A. Griezmann', number: 7, team: 'fra', position: [3.2, 0, 0] },      // AM
  { id: 'fra_10', name: 'K. Mbappé', number: 10, team: 'fra', position: [2.5, 0, -4.0] },     // LAM
  { id: 'fra_11', name: 'O. Giroud', number: 9, team: 'fra', position: [1.5, 0, 0] }         // ST
];

// Camera Controller component to lerp position & lookAt
function CameraController({ preset }: { preset: CameraPreset }) {
  const { camera } = useThree();
  const target = PRESETS[preset];

  useFrame(() => {
    // Lerp camera position
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.pos[0], 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, target.pos[1], 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, target.pos[2], 0.08);

    // Let camera point to target look location
    const currentLook = new THREE.Vector3(0, 0, 0);
    camera.lookAt(currentLook);
  });

  return null;
}

function PitchGrid() {
  return (
    <group>
      {/* Outer Pitch Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 18]} />
        <meshStandardMaterial color="#0c1d12" roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Grass Playing Field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[26, 16]} />
        <meshStandardMaterial color="#10321c" roughness={0.7} />
      </mesh>

      {/* Grid Pattern Lines (Tactical visualizer feel) */}
      {Array.from({ length: 13 }).map((_, i) => (
        <mesh key={`grid-h-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-13 + i * 2, 0.012, 0]}>
          <planeGeometry args={[0.02, 16]} />
          <meshBasicMaterial color="#00ff87" transparent opacity={0.1} />
        </mesh>
      ))}

      {/* Center Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      
      {/* Center Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[2.95, 3.05, 64]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>

      {/* Goal Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-13, 0.015, 0]}>
        <planeGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[13, 0.015, 0]}>
        <planeGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>

      {/* Penalty Area Left */}
      <group position={[-13, 0.016, 0]}>
        {/* Penalty Box Outer */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0, 0]}>
          <planeGeometry args={[0.08, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.25, 0, -4]}>
          <planeGeometry args={[2.5, 0.08]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.25, 0, 4]}>
          <planeGeometry args={[2.5, 0.08]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Penalty Area Right */}
      <group position={[13, 0.016, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0, 0]}>
          <planeGeometry args={[0.08, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.25, 0, -4]}>
          <planeGeometry args={[2.5, 0.08]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.25, 0, 4]}>
          <planeGeometry args={[2.5, 0.08]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* 3D Goalposts Left */}
      <group position={[-13, 0, 0]}>
        <mesh position={[0, 1, -1.5]}>
          <cylinderGeometry args={[0.04, 0.04, 2, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 1, 1.5]}>
          <cylinderGeometry args={[0.04, 0.04, 2, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 3, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      </group>

      {/* 3D Goalposts Right */}
      <group position={[13, 0, 0]}>
        <mesh position={[0, 1, -1.5]}>
          <cylinderGeometry args={[0.04, 0.04, 2, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 1, 1.5]}>
          <cylinderGeometry args={[0.04, 0.04, 2, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 3, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// 3D Player Object
function Player({ player }: { player: PlayerData }) {
  const meshRef = useRef<THREE.Group>(null);
  const isArg = player.team === 'arg';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Natural running/swaying movement
      meshRef.current.position.y = Math.sin(t * 2.2 + player.number) * 0.04 + 0.15;
      
      const offset = Math.sin(t * 0.4 + player.number) * 0.18;
      meshRef.current.position.x = player.position[0] + offset;
      
      // Rotate threat rings
      const ring = meshRef.current.getObjectByName('threat-ring');
      if (ring) {
        const scale = 1.0 + Math.sin(t * 1.8 + player.number) * 0.12;
        ring.scale.set(scale, scale, 1);
      }
    }
  });

  return (
    <group ref={meshRef} position={player.position}>
      {/* Dynamic Threat Ring */}
      <mesh name="threat-ring" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.36, 0.44, 32]} />
        <meshBasicMaterial color={isArg ? "var(--color-blue)" : "var(--color-purple)"} side={THREE.DoubleSide} transparent opacity={0.65} />
      </mesh>

      {/* Torso / Jersey */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.42, 0.65, 0.22]} />
        {isArg ? (
          <meshStandardMaterial color="#00e5ff" roughness={0.4} />
        ) : (
          <meshStandardMaterial color="#38bdf8" roughness={0.4} />
        )}
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.5} />
      </mesh>

      {/* Left arm */}
      <mesh position={[-0.26, 0.7, 0]} rotation={[0, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.45, 8]} />
        <meshStandardMaterial color={isArg ? "#00e5ff" : "#38bdf8"} />
      </mesh>

      {/* Right arm */}
      <mesh position={[0.26, 0.7, 0]} rotation={[0, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.45, 8]} />
        <meshStandardMaterial color={isArg ? "#00e5ff" : "#38bdf8"} />
      </mesh>

      {/* Shorts */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.44, 0.2, 0.24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* HTML Tag Overlay */}
      <Html distanceFactor={10} position={[0, 1.45, 0]}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(4px)',
          border: `1px solid ${isArg ? '#00e5ff' : '#a855f7'}`,
          padding: '2px 5px',
          borderRadius: '4px',
          color: '#ffffff',
          fontSize: '9px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          <span style={{ color: isArg ? '#00e5ff' : '#d8b4fe' }}>{player.number}</span>
          <span>{player.name.split(' ').pop()}</span>
        </div>
      </Html>
    </group>
  );
}

// 3D Ball with path rebound sounds
function Ball() {
  const ballRef = useRef<THREE.Mesh>(null);
  const lastDirRef = useRef<number>(1);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (ballRef.current) {
      // Ball arcs/spins with dynamic movement towards Goal area
      const x = Math.sin(t * 0.8) * 8;
      ballRef.current.position.x = x;
      ballRef.current.position.z = Math.cos(t * 0.5) * 3;
      ballRef.current.position.y = 0.25 + Math.abs(Math.sin(t * 2)) * 1.5;
      ballRef.current.rotation.y += 0.05;
      ballRef.current.rotation.x += 0.03;

      // Rebound/kick sound trigger
      const currentDir = Math.cos(t * 0.8) >= 0 ? 1 : -1;
      if (currentDir !== lastDirRef.current) {
        lastDirRef.current = currentDir;
        try {
          playKickSound();
        } catch (e) {}
      }
    }
  });

  return (
    <mesh ref={ballRef} position={[0, 0.25, 0]} castShadow>
      <sphereGeometry args={[0.22, 20, 20]} />
      <meshStandardMaterial color="#00ff87" emissive="#00ff87" emissiveIntensity={0.5} roughness={0.1} />
    </mesh>
  );
}

export default function Stadium3D() {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('broadcast');

  return (
    <div style={{ position: 'relative', width: '100%', height: '380px', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#020617', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
      {/* Floating Controls Overlay */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '6px' }}>
        {(['broadcast', 'tactical', 'goalline', 'orbit'] as CameraPreset[]).map((preset) => (
          <button
            key={preset}
            onClick={() => {
              setCameraPreset(preset);
              try {
                playClickChime();
              } catch (e) {}
            }}
            style={{
              background: cameraPreset === preset ? 'var(--color-green)' : 'rgba(15, 23, 42, 0.85)',
              color: cameraPreset === preset ? '#020617' : '#f8fafc',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 800,
              borderRadius: '6px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease'
            }}
          >
            {preset === 'goalline' ? 'Goal Line' : preset}
          </button>
        ))}
      </div>

      <Canvas shadows camera={{ position: PRESETS.broadcast.pos, fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[12, 18, 12]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024} 
        />
        <pointLight position={[-12, 8, -12]} intensity={0.6} color="var(--color-blue)" />
        <pointLight position={[12, 8, 12]} intensity={0.6} color="var(--color-purple)" />
        
        <PitchGrid />
        
        {/* Render all 11 Argentina players */}
        {ARGENTINA_PLAYERS.map(player => (
          <Player key={player.id} player={player} />
        ))}

        {/* Render all 11 France players */}
        {FRANCE_PLAYERS.map(player => (
          <Player key={player.id} player={player} />
        ))}

        <Ball />
        
        <Stars radius={120} depth={40} count={1200} factor={3} saturation={0.8} fade speed={1.2} />
        
        <CameraController preset={cameraPreset} />
        {cameraPreset === 'orbit' && <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} />}
      </Canvas>
    </div>
  );
}
