import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, COLORS } from '../constants';

interface MascotsProps {
  morphTarget: number;
}

const MASCOT_COUNT = 24;

const Mascots: React.FC<MascotsProps> = ({ morphTarget }) => {
  // Generate data for N mascots
  const mascotsData = useMemo(() => {
    return new Array(MASCOT_COUNT).fill(0).map((_, i) => {
      const type = i % 2 === 0 ? 'starboy' : 'foxgirl';
      
      // Tree Position: Distributed somewhat evenly but randomly in the volume
      const y = (Math.random() - 0.2) * (TREE_CONFIG.height * 0.8);
      const normY = 1 - (y + TREE_CONFIG.height * 0.2) / TREE_CONFIG.height;
      const rBase = Math.max(0, normY * TREE_CONFIG.radiusBase);
      const r = rBase + 0.8; // Stick out a bit more than ornaments
      const angle = Math.random() * Math.PI * 2;
      
      const treePos = new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
      
      // Scatter Position
      const scatterPos = new THREE.Vector3(
        (Math.random() - 0.5) * TREE_CONFIG.scatterRadius * 1.8,
        (Math.random() - 0.5) * TREE_CONFIG.scatterRadius * 1.8,
        (Math.random() - 0.5) * TREE_CONFIG.scatterRadius * 1.8
      );

      return {
        id: i,
        type,
        treePos,
        scatterPos,
        rotationOffset: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5
      };
    });
  }, []);

  return (
    <group>
      {mascotsData.map((data) => (
        <MascotItem key={data.id} data={data} morphTarget={morphTarget} />
      ))}
    </group>
  );
};

const MascotItem = ({ data, morphTarget }: { data: any, morphTarget: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentMorph = useRef(0);

  // Re-use star geometry logic from TopStar but simplified
  const starGeom = useMemo(() => {
    const starShape = new THREE.Shape();
    const outerRadius = 0.3;
    const innerRadius = 0.15;
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();
    return new THREE.ExtrudeGeometry(starShape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
  }, []);

  useFrame((state, delta) => {
    // Lerp
    currentMorph.current = THREE.MathUtils.lerp(currentMorph.current, morphTarget, delta * 2.0);
    const m = currentMorph.current;
    
    if (groupRef.current) {
        // Position
        groupRef.current.position.lerpVectors(data.scatterPos, data.treePos, m);

        // Rotation
        // When scattered: spin randomly
        // When tree: face outward roughly (simplified to just looking forward + slight idle spin)
        const idleRot = Math.sin(state.clock.elapsedTime * data.speed) * 0.2;
        groupRef.current.rotation.y = data.rotationOffset + (state.clock.elapsedTime * (1 - m)) + idleRot * m;
        groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * data.speed) * 0.1 * m;
        
        // Scale pulse
        const s = 1.0 + Math.sin(state.clock.elapsedTime * 3 + data.id) * 0.05;
        groupRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      {data.type === 'starboy' ? (
        <group>
            {/* Head */}
            <mesh geometry={starGeom} position={[0, 0.25, 0]}>
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Body */}
            <mesh position={[0, -0.1, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
        </group>
      ) : (
        <group>
             {/* Head (Pink Fox) */}
            <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial color="#ff9aa2" roughness={0.3} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.15, 0.3, 0]} rotation={[0, 0, 0.5]}>
                <coneGeometry args={[0.08, 0.2, 16]} />
                <meshStandardMaterial color="#ff9aa2" roughness={0.3} />
            </mesh>
            <mesh position={[0.15, 0.3, 0]} rotation={[0, 0, -0.5]}>
                <coneGeometry args={[0.08, 0.2, 16]} />
                <meshStandardMaterial color="#ff9aa2" roughness={0.3} />
            </mesh>
             {/* Muzzle */}
             <mesh position={[0, 0.1, 0.15]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
             {/* Body */}
             <mesh position={[0, -0.15, 0]}>
                <capsuleGeometry args={[0.12, 0.2, 4, 8]} />
                <meshStandardMaterial color="#ffb7b2" roughness={0.5} />
            </mesh>
        </group>
      )}
    </group>
  );
};

export default Mascots;