"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  playClickChime, 
  playKickSound, 
  playWhistleSound, 
  playTrophyFanfare 
} from '../utils/audio';

// Define Camera Presets
type CameraPreset = 'tactical' | 'broadcast' | 'goalline' | 'var-booth' | 'orbit';

interface CameraTarget {
  pos: [number, number, number];
  look: [number, number, number];
}

const PRESETS: Record<CameraPreset, CameraTarget> = {
  tactical: { pos: [0, 16, 0.1], look: [0, 0, 0] },
  broadcast: { pos: [0, 11, 15], look: [0, 0, 0] },
  goalline: { pos: [-14, 3, 0], look: [0, 1, 0] },
  'var-booth': { pos: [0, 4, 11.5], look: [0, 0.8, 9] },
  orbit: { pos: [10, 8, 10], look: [0, 0, 0] }
};

interface PlayerData {
  id: string;
  name: string;
  number: number;
  team: 'arg' | 'fra';
  position: [number, number, number];
}

// Formations Definitions
const ARG_FORMATIONS: Record<string, [number, number, number][]> = {
  '4-3-3': [
    [-12, 0, 0], // GK
    [-9, 0, 5], [-9.5, 0, 1.8], [-9.5, 0, -1.8], [-9, 0, -5], // Defenders
    [-5.5, 0, 2.2], [-7, 0, 0], [-5.5, 0, -2.2], // Midfielders
    [-2, 0, 3.2], [-1.5, 0, 0], [-2, 0, -3.2] // Attackers
  ],
  '3-5-2': [
    [-12, 0, 0], // GK
    [-9.5, 0, 2.5], [-10, 0, 0], [-9.5, 0, -2.5], // Defenders
    [-6, 0, 5.5], [-6, 0, 2], [-7.5, 0, 0], [-6, 0, -2], [-6, 0, -5.5], // Midfielders
    [-2, 0, 1.5], [-2, 0, -1.5] // Attackers
  ],
  '4-4-2': [
    [-12, 0, 0], // GK
    [-9, 0, 5], [-9.5, 0, 1.8], [-9.5, 0, -1.8], [-9, 0, -5], // Defenders
    [-5.5, 0, 4.5], [-6, 0, 1.5], [-6, 0, -1.5], [-5.5, 0, -4.5], // Midfielders
    [-2, 0, 1.2], [-2, 0, -1.2] // Attackers
  ]
};

const FRA_FORMATIONS: Record<string, [number, number, number][]> = {
  '4-2-3-1': [
    [12, 0, 0], // GK
    [9, 0, 5], [9.5, 0, 1.8], [9.5, 0, -1.8], [9, 0, -5], // Defenders
    [6, 0, 2], [6, 0, -2], // Midfielders
    [3, 0, 4.2], [3.5, 0, 0], [3, 0, -4.2], // AMs
    [1.5, 0, 0] // Striker
  ],
  '5-4-1': [
    [12, 0, 0], // GK
    [9, 0, 5.5], [9.5, 0, 2.5], [10, 0, 0], [9.5, 0, -2.5], [9, 0, -5.5], // Defenders
    [6, 0, 4], [6.5, 0, 1.5], [6.5, 0, -1.5], [6, 0, -4], // Midfielders
    [2, 0, 0] // Striker
  ],
  '4-3-3': [
    [12, 0, 0], // GK
    [9, 0, 5], [9.5, 0, 1.8], [9.5, 0, -1.8], [9, 0, -5], // Defenders
    [5.5, 0, 2.2], [7, 0, 0], [5.5, 0, -2.2], // Midfielders
    [2, 0, 3.2], [1.5, 0, 0], [2, 0, -3.2] // Attackers
  ]
};

const ARG_NAMES = [
  { name: 'E. Martínez', number: 23 },
  { name: 'N. Molina', number: 26 },
  { name: 'C. Romero', number: 13 },
  { name: 'N. Otamendi', number: 19 },
  { name: 'N. Tagliafico', number: 3 },
  { name: 'R. De Paul', number: 7 },
  { name: 'Enzo F.', number: 24 },
  { name: 'A. Mac Allister', number: 20 },
  { name: 'L. Messi', number: 10 },
  { name: 'J. Álvarez', number: 9 },
  { name: 'Á. Di María', number: 11 }
];

const FRA_NAMES = [
  { name: 'M. Maignan', number: 16 },
  { name: 'J. Koundé', number: 5 },
  { name: 'D. Upamecano', number: 4 },
  { name: 'I. Konaté', number: 24 },
  { name: 'T. Hernandez', number: 22 },
  { name: 'A. Tchouaméni', number: 8 },
  { name: 'A. Rabiot', number: 14 },
  { name: 'O. Dembélé', number: 11 },
  { name: 'A. Griezmann', number: 7 },
  { name: 'K. Mbappé', number: 10 },
  { name: 'O. Giroud', number: 9 }
];

// Camera Controller component
function CameraController({ preset }: { preset: CameraPreset }) {
  const { camera } = useThree();
  const target = PRESETS[preset];

  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.pos[0], 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, target.pos[1], 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, target.pos[2], 0.08);
    camera.lookAt(new THREE.Vector3(target.look[0], target.look[1], target.look[2]));
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

      {/* Grid Lines */}
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

      {/* 3D Goalposts */}
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

      {/* VAR Booth Side Monitor */}
      <group position={[0, 0, 8.8]}>
        {/* Stand */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 0.85, 0.05]}>
          <boxGeometry args={[0.7, 0.45, 0.08]} />
          <meshStandardMaterial color="#020617" roughness={0.2} />
        </mesh>
        {/* Glowing Screen Face */}
        <mesh position={[0, 0.85, 0.09]}>
          <planeGeometry args={[0.62, 0.38]} />
          <meshBasicMaterial color="#00ff87" transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

// 3D Player Component
function Player({ 
  player, 
  isBallHolder,
  ballPos
}: { 
  player: PlayerData; 
  isBallHolder: boolean;
  ballPos: THREE.Vector3;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const isArg = player.team === 'arg';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Natural running/swaying movement
      meshRef.current.position.y = Math.sin(t * 3.5 + player.number) * 0.06 + 0.15;
      
      // Dynamic positioning: move towards the ball slightly to show active gameplay tracking
      const targetX = THREE.MathUtils.lerp(player.position[0], ballPos.x, isBallHolder ? 0.25 : 0.08);
      const targetZ = THREE.MathUtils.lerp(player.position[2], ballPos.z, isBallHolder ? 0.25 : 0.08);

      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
      
      // Rotate threat rings
      const ring = meshRef.current.getObjectByName('threat-ring');
      if (ring) {
        const scale = (isBallHolder ? 1.6 : 1.0) + Math.sin(t * 1.8 + player.number) * 0.12;
        ring.scale.set(scale, scale, 1);
      }
    }
  });

  return (
    <group ref={meshRef} position={player.position}>
      {/* Threat Ring */}
      <mesh name="threat-ring" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.36, 0.44, 32]} />
        <meshBasicMaterial 
          color={isBallHolder ? "var(--color-gold)" : (isArg ? "var(--color-blue)" : "var(--color-purple)")} 
          side={THREE.DoubleSide} 
          transparent 
          opacity={0.8} 
        />
      </mesh>

      {/* Torso / Jersey */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.42, 0.65, 0.22]} />
        <meshStandardMaterial color={isArg ? "#00e5ff" : "#0e2b84"} roughness={0.4} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.5} />
      </mesh>

      {/* Shorts */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.44, 0.2, 0.24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* Name tag */}
      <Html distanceFactor={10} position={[0, 1.45, 0]}>
        <div style={{
          background: isBallHolder ? 'rgba(234, 179, 8, 0.95)' : 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(4px)',
          border: `1px solid ${isBallHolder ? '#ffffff' : (isArg ? '#00e5ff' : '#a855f7')}`,
          padding: '2px 5px',
          borderRadius: '4px',
          color: isBallHolder ? '#000000' : '#ffffff',
          fontSize: '9px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          <span style={{ opacity: 0.8 }}>{player.number}</span>
          <span>{player.name.split(' ').pop()}</span>
        </div>
      </Html>
    </group>
  );
}

// 3D Referee Component
function Referee({ ballPos, targetPos }: { ballPos: THREE.Vector3; targetPos: THREE.Vector3 }) {
  const refMesh = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (refMesh.current) {
      refMesh.current.position.y = Math.sin(t * 4) * 0.05 + 0.15;
      // Follow ball but keep distance (e.g. offset position)
      const refTargetX = THREE.MathUtils.lerp(targetPos.x, ballPos.x, 0.35);
      const refTargetZ = THREE.MathUtils.lerp(targetPos.z, ballPos.z - 2.5, 0.35);

      refMesh.current.position.x = THREE.MathUtils.lerp(refMesh.current.position.x, refTargetX, 0.08);
      refMesh.current.position.z = THREE.MathUtils.lerp(refMesh.current.position.z, refTargetZ, 0.08);
    }
  });

  return (
    <group ref={refMesh} position={[0, 0.15, -2]}>
      {/* Torso - Yellow Card jersey */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.38, 0.65, 0.2]} />
        <meshStandardMaterial color="#eab308" roughness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      {/* Shorts */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.2, 0.22]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <Html distanceFactor={10} position={[0, 1.4, 0]}>
        <span style={{ background: '#eab308', color: '#000000', fontSize: '8px', fontWeight: 800, padding: '2px 4px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
          🏁 REFEREE
        </span>
      </Html>
    </group>
  );
}

// 3D Ball
function Ball({ ballPosition }: { ballPosition: THREE.Vector3 }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(ballPosition, 0.2);
      meshRef.current.rotation.y += 0.05;
      meshRef.current.rotation.x += 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.22, 0]} castShadow>
      <sphereGeometry args={[0.2, 20, 20]} />
      <meshStandardMaterial color="#00ff87" emissive="#00ff87" emissiveIntensity={0.6} roughness={0.1} />
    </mesh>
  );
}

export default function Stadium3D() {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('broadcast');

  // Formations state
  const [argFormation, setArgFormation] = useState<string>('4-3-3');
  const [fraFormation, setFraFormation] = useState<string>('4-2-3-1');

  // Players
  const [players, setPlayers] = useState<PlayerData[]>([]);

  // Simulation states
  const [gameState, setGameState] = useState<'passing' | 'shooting' | 'goal' | 'saved' | 'foul' | 'var_check'>('passing');
  const [possTeam, setPossTeam] = useState<'arg' | 'fra'>('arg');
  const [possPlayerIdx, setPossPlayerIdx] = useState<number>(6); // DM starts
  const [targetPlayerIdx, setTargetPlayerIdx] = useState<number>(8); // pass to midfielder
  const [passProgress, setPassProgress] = useState<number>(0);
  const [ballPosition, setBallPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0.22, 0));
  
  // VAR state parameters
  const [varDecision, setVarDecision] = useState<string>("");
  const [varType, setVarType] = useState<'goal_check' | 'penalty_check'>('goal_check');

  // Referee custom target coordinates
  const [refereeTarget, setRefereeTarget] = useState<THREE.Vector3>(new THREE.Vector3(0, 0.15, 0));

  // HUD banner text
  const [bannerText, setBannerText] = useState<string>("Kickoff! Argentina maintains possession.");
  const [bannerColor, setBannerColor] = useState<string>("var(--color-blue)");
  const [passCount, setPassCount] = useState<number>(0);

  // Initialize players
  useEffect(() => {
    const argPos = ARG_FORMATIONS[argFormation];
    const fraPos = FRA_FORMATIONS[fraFormation];

    const currentPlayers: PlayerData[] = [
      ...ARG_NAMES.map((n, i) => ({
        id: `arg_${i}`,
        name: n.name,
        number: n.number,
        team: 'arg' as const,
        position: argPos[i]
      })),
      ...FRA_NAMES.map((n, i) => ({
        id: `fra_${i}`,
        name: n.name,
        number: n.number,
        team: 'fra' as const,
        position: fraPos[i]
      }))
    ];

    setPlayers(currentPlayers);
  }, [argFormation, fraFormation]);

  // Main Live match simulator cycle
  useEffect(() => {
    if (players.length === 0) return;

    const interval = setInterval(() => {
      if (gameState === 'passing') {
        const teamOffset = possTeam === 'arg' ? 0 : 11;
        const currentIdx = possPlayerIdx + teamOffset;
        const targetIdx = targetPlayerIdx + teamOffset;

        if (currentIdx >= players.length || targetIdx >= players.length) return;

        setPassProgress(prev => {
          if (prev >= 1) {
            // Pass has landed
            const newPossIdx = targetPlayerIdx;
            let nextTarget = Math.floor(Math.random() * 10) + 1;
            while (nextTarget === newPossIdx) {
              nextTarget = Math.floor(Math.random() * 10) + 1;
            }

            setPossPlayerIdx(newPossIdx);
            setTargetPlayerIdx(nextTarget);

            const newPassCount = passCount + 1;
            setPassCount(newPassCount);

            try {
              playKickSound();
            } catch (e) {}

            const currentPlayerObj = players[newPossIdx + (possTeam === 'arg' ? 0 : 11)];
            setBannerText(`Tiki-Taka: ${currentPlayerObj.name.split(' ').pop()} controls the pass.`);
            setBannerColor(possTeam === 'arg' ? 'var(--color-blue)' : 'var(--color-purple)');

            // Shot threshold
            if (newPassCount >= 3 && Math.random() > 0.4) {
              setGameState('shooting');
              setBannerText(`🔥 GOAL ATTEMPT: ${currentPlayerObj.name.split(' ').pop()} shoots towards the top corner!`);
              setBannerColor('var(--color-pink)');
              try {
                playKickSound();
              } catch (e) {}
              return 0;
            }

            // VAR Penalty Foul check trigger
            if (Math.random() > 0.88) {
              setGameState('var_check');
              setVarType('penalty_check');
              setCameraPreset('var-booth');
              setRefereeTarget(new THREE.Vector3(0, 0.15, 8.2)); // Move ref to VAR monitor
              setBannerText(`🚨 VAR REVIEW IN PROGRESS: Possible penalty in the box!`);
              setBannerColor('var(--color-gold)');
              try {
                playWhistleSound();
              } catch (e) {}
              return 0;
            }

            return 0; 
          }

          // Ball coordinate interpolation
          const p1 = players[currentIdx].position;
          const p2 = players[targetIdx].position;
          const arcHeight = Math.sin(prev * Math.PI) * 1.5;

          setBallPosition(new THREE.Vector3(
            p1[0] + (p2[0] - p1[0]) * prev,
            0.22 + arcHeight,
            p1[2] + (p2[2] - p1[2]) * prev
          ));

          return prev + 0.25; 
        });

      } else if (gameState === 'shooting') {
        const opponentGoalX = possTeam === 'arg' ? 13 : -13;
        const goalZ = (Math.random() - 0.5) * 2.8; 
        const goalY = Math.random() * 1.6 + 0.2;

        setBallPosition(new THREE.Vector3(opponentGoalX, goalY, goalZ));

        setTimeout(() => {
          // Trigger VAR goal review
          if (Math.random() > 0.5) {
            setGameState('var_check');
            setVarType('goal_check');
            setCameraPreset('var-booth');
            setRefereeTarget(new THREE.Vector3(0, 0.15, 8.2)); // Walk to VAR monitor
            setBannerText(`🚨 VAR CHECK: Reviewing potential offside/goal line clearance!`);
            setBannerColor('var(--color-gold)');
            try {
              playWhistleSound();
            } catch (e) {}
          } else {
            setGameState('saved');
            setBannerText(`🧤 STRETCH SAVE! Goalkeeper deflects the shot!`);
            setBannerColor('var(--color-blue)');
            try {
              playWhistleSound();
            } catch (e) {}
          }
        }, 800);

        setGameState('passing'); 
        setPassProgress(0);

      } else if (gameState === 'var_check') {
        // VAR simulation decision loop
        setTimeout(() => {
          const decision = Math.random() > 0.5;
          if (varType === 'goal_check') {
            if (decision) {
              setGameState('goal');
              setVarDecision("GOAL CONFIRMED!");
              setBannerText(`⚽ GOAL STANDS! VAR confirms the goal.`);
              setBannerColor('var(--color-green)');
              try {
                playTrophyFanfare();
              } catch (e) {}
            } else {
              setGameState('saved');
              setVarDecision("OFFSIDE! NO GOAL.");
              setBannerText(`❌ GOAL CANCELLED: VAR confirms offside!`);
              setBannerColor('var(--color-pink)');
              try {
                playWhistleSound();
              } catch (e) {}
            }
          } else {
            // Penalty check
            if (decision) {
              setGameState('goal'); // Simulate penalty converted
              setVarDecision("PENALTY DECISION GIVEN!");
              setBannerText(`⚽ PENALTY CONFIRMED! Penalty scored!`);
              setBannerColor('var(--color-green)');
              try {
                playTrophyFanfare();
              } catch (e) {}
            } else {
              setGameState('passing');
              setVarDecision("NO PENALTY. PLAY ON.");
              setBannerText(`🟢 VAR CHECK OVER: Clean tackle, play on.`);
              setBannerColor('var(--color-blue)');
            }
          }

          // Return camera to broadcast after review
          setTimeout(() => {
            setCameraPreset('broadcast');
            setVarDecision("");
            setGameState('passing');
            
            const newTeam = possTeam === 'arg' ? 'fra' : 'arg';
            setPossTeam(newTeam);
            setPossPlayerIdx(6); 
            setTargetPlayerIdx(8); 
            setPassCount(0);
            setPassProgress(0);
            setBallPosition(new THREE.Vector3(0, 0.22, 0));
            setRefereeTarget(new THREE.Vector3(0, 0.15, 0));
          }, 2000);

        }, 4000); // 4 seconds VAR deliberation delay

        setGameState('passing'); 
      }
    }, 150);

    return () => clearInterval(interval);
  }, [players, gameState, possTeam, possPlayerIdx, targetPlayerIdx, passProgress, passCount, varType]);

  const handleCameraChange = (preset: CameraPreset) => {
    setCameraPreset(preset);
    try {
      playClickChime();
    } catch (e) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Lineup / formations selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(0, 229, 255, 0.03)', border: '1px solid rgba(0, 229, 255, 0.12)', padding: '10px 16px', borderRadius: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-blue)' }}>🇦🇷 ARG Strategy:</span>
          <select 
            value={argFormation}
            onChange={(e) => {
              setArgFormation(e.target.value);
              try { playClickChime(); } catch(err){}
            }}
            style={{ background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontWeight: 600, outline: 'none' }}
          >
            <option value="4-3-3">4-3-3 Attacking</option>
            <option value="3-5-2">3-5-2 Defensive</option>
            <option value="4-4-2">4-4-2 Balanced</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(138, 43, 226, 0.03)', border: '1px solid rgba(138, 43, 226, 0.12)', padding: '10px 16px', borderRadius: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-purple)' }}>🇫🇷 FRA Strategy:</span>
          <select 
            value={fraFormation}
            onChange={(e) => {
              setFraFormation(e.target.value);
              try { playClickChime(); } catch(err){}
            }}
            style={{ background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontWeight: 600, outline: 'none' }}
          >
            <option value="4-2-3-1">4-2-3-1 Fluid</option>
            <option value="5-4-1">5-4-1 Park the Bus</option>
            <option value="4-3-3">4-3-3 Counter</option>
          </select>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div style={{ position: 'relative', width: '100%', height: '390px', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#020617', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        
        {/* VAR Flashing Ticker */}
        {varDecision && (
          <div style={{
            position: 'absolute',
            top: '55px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ef4444',
            border: '2px solid #ffffff',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.8)',
            padding: '8px 24px',
            borderRadius: '8px',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            animation: 'pulse 1s infinite'
          }}>
            <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
              🖥️ VAR DECISION
            </span>
            <span style={{ fontSize: '18px', color: '#ffffff', fontWeight: 900 }}>
              {varDecision}
            </span>
          </div>
        )}

        {/* Live HUD Alert Banner */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          backgroundColor: 'rgba(11, 19, 41, 0.9)',
          backdropFilter: 'blur(8px)',
          borderLeft: `4px solid ${bannerColor}`,
          padding: '10px 18px',
          borderRadius: '8px',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          transition: 'all 0.3s ease'
        }}>
          <span style={{ fontSize: '12.5px', color: '#ffffff', fontWeight: 700 }}>
            {bannerText}
          </span>
          <span style={{
            fontSize: '9px',
            textTransform: 'uppercase',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: bannerColor
          }}>
            {gameState.toUpperCase()}
          </span>
        </div>

        {/* View Controllers */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '6px' }}>
          {(['broadcast', 'tactical', 'goalline', 'var-booth', 'orbit'] as CameraPreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => handleCameraChange(preset)}
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
              {preset === 'goalline' ? 'Goal Line' : (preset === 'var-booth' ? 'VAR Monitor' : preset)}
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
          
          {/* Players */}
          {players.map((player, idx) => {
            const isArg = player.team === 'arg';
            const localIdx = isArg ? idx : idx - 11;
            const isHolder = possTeam === player.team && possPlayerIdx === localIdx;

            return (
              <Player 
                key={player.id} 
                player={player} 
                isBallHolder={isHolder}
                ballPos={ballPosition}
              />
            );
          })}

          {/* Referee */}
          <Referee ballPos={ballPosition} targetPos={refereeTarget} />

          <Ball ballPosition={ballPosition} />
          
          <Stars radius={120} depth={40} count={1200} factor={3} saturation={0.8} fade speed={1.2} />
          
          <CameraController preset={cameraPreset} />
          {cameraPreset === 'orbit' && <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} />}
        </Canvas>
      </div>
    </div>
  );
}
