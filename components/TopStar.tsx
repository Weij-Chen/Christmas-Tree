import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, TREE_CONFIG } from '../constants';

interface TopStarProps {
  morphTarget: number;
}

const TopStar: React.FC<TopStarProps> = ({ morphTarget }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentMorph = useRef(0);
  
  // Create a 5-pointed star shape
  const starGeometry = useMemo(() => {
    const starShape = new THREE.Shape();
    const outerRadius = 1.2;
    const innerRadius = 0.5;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      // Rotate -PI/2 to make the top point point upwards
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 2,
    };

    return new THREE.ExtrudeGeometry(starShape, extrudeSettings);
  }, []);

  // Calculate positions
  const { treePos, scatterPos } = useMemo(() => {
    // Top of the tree: Height * 0.8 is approx top foliage, so we go a bit higher
    const tPos = new THREE.Vector3(0, TREE_CONFIG.height * 0.82 + 1.0, 0); 
    
    // Random scatter pos
    const sPos = new THREE.Vector3(
      (Math.random() - 0.5) * TREE_CONFIG.scatterRadius,
      (Math.random() - 0.5) * TREE_CONFIG.scatterRadius,
      (Math.random() - 0.5) * TREE_CONFIG.scatterRadius
    );
    return { treePos: tPos, scatterPos: sPos };
  }, []);

  useFrame((state, delta) => {
    // Lerp morph value
    currentMorph.current = THREE.MathUtils.lerp(currentMorph.current, morphTarget, delta * 2.5);
    const m = currentMorph.current;
    
    if (meshRef.current) {
        // Interpolate Position
        meshRef.current.position.lerpVectors(scatterPos, treePos, m);
        
        // Floating animation
        meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.1;

        // Rotate
        // Spin fast when scattered (1-m), slow majestic spin when tree (m)
        meshRef.current.rotation.y += delta * (0.5 + 2.0 * (1 - m));
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1 * m; // Slight tilt when active
        
        // Scale 
        const s = 1.0 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
        meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={meshRef} geometry={starGeometry} castShadow>
        <meshStandardMaterial 
            color={COLORS.gold} 
            emissive={COLORS.goldHot}
            emissiveIntensity={2.0}
            roughness={0.1}
            metalness={1.0}
        />
        {/* Glow halo */}
        <pointLight intensity={2} color="#fff6b5" distance={5} decay={2} />
    </mesh>
  );
};

export default TopStar;