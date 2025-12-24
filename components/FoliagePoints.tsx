import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FOLIAGE_COUNT, TREE_CONFIG, foliageFragmentShader, foliageVertexShader } from '../constants';
import * as maath from 'maath/random';

interface FoliagePointsProps {
  morphTarget: number; // 0 to 1
}

const FoliagePoints: React.FC<FoliagePointsProps> = ({ morphTarget }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  // Generate Geometry Data once
  const { positions, scatterPos, treePos, randoms, sizes } = useMemo(() => {
    const positions = new Float32Array(FOLIAGE_COUNT * 3);
    const scatterPos = new Float32Array(FOLIAGE_COUNT * 3);
    const treePos = new Float32Array(FOLIAGE_COUNT * 3);
    const randoms = new Float32Array(FOLIAGE_COUNT);
    const sizes = new Float32Array(FOLIAGE_COUNT);

    // Helper: Random point in sphere
    const sphereBox = maath.inSphere(new Float32Array(FOLIAGE_COUNT * 3), { radius: TREE_CONFIG.scatterRadius });

    for (let i = 0; i < FOLIAGE_COUNT; i++) {
      const i3 = i * 3;

      // Scatter Position
      scatterPos[i3] = sphereBox[i3];
      scatterPos[i3 + 1] = sphereBox[i3 + 1];
      scatterPos[i3 + 2] = sphereBox[i3 + 2];

      // Tree Position (Cone Logic)
      // height from -H/2 to H/2
      const y = (Math.random() - 0.2) * TREE_CONFIG.height; 
      // Normalized height (0 at top, 1 at bottom approx) for radius calc
      const normY = 1 - (y + TREE_CONFIG.height * 0.2) / TREE_CONFIG.height;
      const radiusAtHeight = Math.max(0, normY * TREE_CONFIG.radiusBase);
      
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radiusAtHeight; // Uniform distribution on disk

      treePos[i3] = Math.cos(angle) * r;
      treePos[i3 + 1] = y;
      treePos[i3 + 2] = Math.sin(angle) * r;

      // Initial buffer position (placeholder, shader handles actual pos)
      positions[i3] = 0; positions[i3+1] = 0; positions[i3+2] = 0;

      randoms[i] = Math.random();
      sizes[i] = Math.random() * 0.5 + 0.5; // Variation in particle size
    }

    return { positions, scatterPos, treePos, randoms, sizes };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uPixelRatio: { value: typeof window !== 'undefined' ? window.devicePixelRatio : 1 }
  }), []);

  useFrame((state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value += delta;
      
      // Smoothly interpolate the morph uniform towards the target
      // Using a simple lerp for the visual transition
      const current = shaderRef.current.uniforms.uMorph.value;
      shaderRef.current.uniforms.uMorph.value = THREE.MathUtils.lerp(current, morphTarget, delta * 2.5);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={FOLIAGE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={FOLIAGE_COUNT}
          array={scatterPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={FOLIAGE_COUNT}
          array={treePos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={FOLIAGE_COUNT}
          array={randoms}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={FOLIAGE_COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={foliageVertexShader}
        fragmentShader={foliageFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </points>
  );
};

export default FoliagePoints;
