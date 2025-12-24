import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LIGHT_COUNT, TREE_CONFIG, COLORS } from '../constants';

interface LightsProps {
  morphTarget: number;
}

const Lights: React.FC<LightsProps> = ({ morphTarget }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const currentMorph = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const lightsData = useMemo(() => {
    return new Array(LIGHT_COUNT).fill(0).map((_, i) => {
        // Spiral distribution for lights on tree
        const y = (Math.random() - 0.2) * (TREE_CONFIG.height * 0.95);
        const normY = 1 - (y + TREE_CONFIG.height * 0.2) / TREE_CONFIG.height;
        const rBase = Math.max(0, normY * TREE_CONFIG.radiusBase);
        
        // Slightly recessed into tree for depth
        const r = rBase * 0.9; 
        const angle = Math.random() * Math.PI * 2;
        
        const tPos = new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
        const sPos = new THREE.Vector3(
             (Math.random() - 0.5) * TREE_CONFIG.scatterRadius * 1.5,
             (Math.random() - 0.5) * TREE_CONFIG.scatterRadius * 1.5,
             (Math.random() - 0.5) * TREE_CONFIG.scatterRadius * 1.5
        );

        return {
            id: i,
            treePos: tPos,
            scatterPos: sPos,
            phase: Math.random() * Math.PI * 2
        };
    });
  }, []);

  useFrame((state, delta) => {
    currentMorph.current = THREE.MathUtils.lerp(currentMorph.current, morphTarget, delta * 3.0);
    const m = currentMorph.current;
    const time = state.clock.elapsedTime;

    if (meshRef.current) {
        lightsData.forEach((data, i) => {
            dummy.position.lerpVectors(data.scatterPos, data.treePos, m);
            
            // Blink effect
            const blink = Math.sin(time * 3 + data.phase) * 0.5 + 0.5;
            // Scale up when tree formed, smaller when scattered
            const scale = (0.1 + 0.1 * blink) * m; 
            
            dummy.scale.setScalar(scale > 0 ? scale : 0.001);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);

            // Change color intensity based on blink
            // Reduced intensity multiplier from 2.0 to 1.2 for softer glow
            const intensity = 0.8 + blink * 1.2;
            const col = COLORS.goldHot.clone().multiplyScalar(intensity);
            meshRef.current!.setColorAt(i, col);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        meshRef.current.instanceColor!.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, LIGHT_COUNT]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial toneMapped={false} color={COLORS.goldHot} />
    </instancedMesh>
  );
};

export default Lights;