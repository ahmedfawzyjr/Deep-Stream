"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Define Camera Presets
type CameraPreset = 'tactical' | 'broadcast' | 'goalline' | 'orbit';

interface CameraTarget {
  pos: [number, number, number];
  look: [number, number, number];
}

const PRESETS: Record<CameraPreset, CameraTarget> = {
  tactical: { pos: [0, 16, 0.1], look: [0, 0, 0] },
  broadcast: { pos: [0, 10, 14], look: [0, 0, 0] },
  goalline: { pos: [-14, 3, 0], look: [0, 1, 0] },
  orbit: { pos: [10, 8, 10], look: [0, 0, 0] }
};

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
          <cylinderGeometry args={[0.06, 0.06, 2, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 1, 1.5]}>
          <cylinderGeometry args={[0.06, 0.06, 2, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 3, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      </group>

      {/* 3D Goalposts Right */}
      <group position={[13, 0, 0]}>
        <mesh position={[0, 1, -1.5]}>
          <cylinderGeometry args={[0.06, 0.06, 2, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 1, 1.5]}>
          <cylinderGeometry args={[0.06, 0.06, 2, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 3, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// 3D Players and Soccer ball
function SpatialTrackingElements() {
  const groupRef = useRef<THREE.Group>(null);
  const ballRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Animate players with dynamic tactical movements
      groupRef.current.children.forEach((child, i) => {
        if (child.name === 'arg' || child.name === 'fra') {
          // Micro floating
          child.position.y = 0.5 + Math.sin(t * 1.5 + i) * 0.08;
          // Tactical shifting back and forth
          child.position.x += Math.sin(t * 0.4 + i) * 0.006;
          child.position.z += Math.cos(t * 0.3 + i) * 0.004;

          // Animate the threat ring size
          const ring = child.getObjectByName('threat-ring');
          if (ring) {
            const scale = 1.0 + Math.sin(t * 2 + i) * 0.15;
            ring.scale.set(scale, scale, 1);
          }
        }
      });
    }

    if (ballRef.current) {
      // Ball arcs/spins with dynamic movement towards Goal area
      ballRef.current.position.x = Math.sin(t * 0.8) * 8;
      ballRef.current.position.z = Math.cos(t * 0.5) * 3;
      ballRef.current.position.y = 0.25 + Math.abs(Math.sin(t * 2)) * 1.5;
      ballRef.current.rotation.y += 0.05;
      ballRef.current.rotation.x += 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Argentina (Blue) Players */}
      <group name="arg" position={[-6, 0.5, 3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.9, 16]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.2} roughness={0.2} />
        </mesh>
        <mesh name="threat-ring" rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      </group>

      <group name="arg" position={[-3, 0.5, -2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.9, 16]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.2} roughness={0.2} />
        </mesh>
        <mesh name="threat-ring" rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      </group>

      <group name="arg" position={[-8, 0.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.9, 16]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.2} roughness={0.2} />
        </mesh>
        <mesh name="threat-ring" rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* France (Purple) Players */}
      <group name="fra" position={[6, 0.5, -3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.9, 16]} />
          <meshStandardMaterial color="#8a2be2" emissive="#8a2be2" emissiveIntensity={0.2} roughness={0.2} />
        </mesh>
        <mesh name="threat-ring" rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#8a2be2" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      </group>

      <group name="fra" position={[3, 0.5, 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.9, 16]} />
          <meshStandardMaterial color="#8a2be2" emissive="#8a2be2" emissiveIntensity={0.2} roughness={0.2} />
        </mesh>
        <mesh name="threat-ring" rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#8a2be2" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      </group>

      <group name="fra" position={[8, 0.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.9, 16]} />
          <meshStandardMaterial color="#8a2be2" emissive="#8a2be2" emissiveIntensity={0.2} roughness={0.2} />
        </mesh>
        <mesh name="threat-ring" rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#8a2be2" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Soccer Ball with glow */}
      <mesh ref={ballRef} position={[0, 0.25, 0]} castShadow>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial color="#00ff87" emissive="#00ff87" emissiveIntensity={0.5} roughness={0.1} />
      </mesh>
    </group>
  );
}

export default function Stadium3D() {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('broadcast');

  return (
    <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#020617', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
      {/* Floating Controls Overlay */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '6px' }}>
        {(['broadcast', 'tactical', 'goalline', 'orbit'] as CameraPreset[]).map((preset) => (
          <button
            key={preset}
            onClick={() => setCameraPreset(preset)}
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
        <SpatialTrackingElements />
        <Stars radius={120} depth={40} count={1200} factor={3} saturation={0.8} fade speed={1.2} />
        
        <CameraController preset={cameraPreset} />
        {cameraPreset === 'orbit' && <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} />}
      </Canvas>
    </div>
  );
}
