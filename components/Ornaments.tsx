import React, { useLayoutEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ORNAMENT_COUNT, COLORS, TREE_CONFIG } from '../constants';
import { OrnamentData } from '../types';

interface OrnamentsProps {
  morphTarget: number;
}

const Ornaments: React.FC<OrnamentsProps> = ({ morphTarget }) => {
  const boxMeshRef = useRef<THREE.InstancedMesh>(null);
  const sphereMeshRef = useRef<THREE.InstancedMesh>(null);
  
  // Track current animation value separately from the prop to allow lerping
  const currentMorph = useRef(0);

  // Generate Data
  const { boxData, sphereData } = useMemo(() => {
    const boxes: OrnamentData[] = [];
    const spheres: OrnamentData[] = [];

    const total = ORNAMENT_COUNT;
    
    for (let i = 0; i < total; i++) {
      const isBox = Math.random() > 0.6; // 40% boxes, 60% spheres
      
      // Scatter Position
      const sPos = new THREE.Vector3(
        (Math.random() - 0.5) * TREE_CONFIG.scatterRadius * 2,
        (Math.random() - 0.5) * TREE_CONFIG.scatterRadius * 2,
        (Math.random() - 0.5) * TREE_CONFIG.scatterRadius * 2
      );

      // Tree Position
      const y = (Math.random() - 0.2) * (TREE_CONFIG.height * 0.9);
      const normY = 1 - (y + TREE_CONFIG.height * 0.2) / TREE_CONFIG.height;
      const rBase = Math.max(0, normY * TREE_CONFIG.radiusBase);
      const r = rBase + (Math.random() * 0.5); // Add slight thickness offset
      const angle = Math.random() * Math.PI * 2;
      
      const tPos = new THREE.Vector3(
        Math.cos(angle) * r,
        y,
        Math.sin(angle) * r
      );

      const color = Math.random() > 0.7 ? COLORS.gold : (Math.random() > 0.5 ? COLORS.redLuxury : COLORS.emeraldLight);
      
      const data: OrnamentData = {
        id: i,
        scatterPosition: sPos,
        treePosition: tPos,
        rotation: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        scale: Math.random() * 0.3 + 0.2,
        color: color,
        type: isBox ? 'box' : 'sphere',
        speed: Math.random() * 0.02 + 0.01
      };

      if (isBox) boxes.push(data);
      else spheres.push(data);
    }
    return { boxData: boxes, sphereData: spheres };
  }, []);

  useLayoutEffect(() => {
    // Initial color setting
    if (boxMeshRef.current) {
      boxData.forEach((data, i) => boxMeshRef.current!.setColorAt(i, data.color));
      boxMeshRef.current.instanceColor!.needsUpdate = true;
    }
    if (sphereMeshRef.current) {
      sphereData.forEach((data, i) => sphereMeshRef.current!.setColorAt(i, data.color));
      sphereMeshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [boxData, sphereData]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    // Lerp logic for smooth transition
    currentMorph.current = THREE.MathUtils.lerp(currentMorph.current, morphTarget, delta * 2.0);
    const m = currentMorph.current;
    const time = state.clock.elapsedTime;

    // Update Boxes
    if (boxMeshRef.current) {
      boxData.forEach((data, i) => {
        // Interpolate position
        dummy.position.lerpVectors(data.scatterPosition, data.treePosition, m);
        
        // Add floating noise
        const floatY = Math.sin(time * 2 + data.id) * 0.1 * (1 - m) + Math.sin(time + data.id) * 0.05;
        dummy.position.y += floatY;

        // Rotation: Spin fast when scattered, align when tree
        dummy.rotation.x = data.rotation.x + time * data.speed * (1 - m * 0.8);
        dummy.rotation.y = data.rotation.y + time * data.speed;
        dummy.rotation.z = data.rotation.z + time * data.speed * (1 - m * 0.8);

        dummy.scale.setScalar(data.scale * (0.8 + 0.2 * Math.sin(time * 3 + data.id))); // Subtle pulsing
        
        dummy.updateMatrix();
        boxMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      boxMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Spheres
    if (sphereMeshRef.current) {
      sphereData.forEach((data, i) => {
        dummy.position.lerpVectors(data.scatterPosition, data.treePosition, m);
         // Add floating noise
        const floatY = Math.cos(time * 1.5 + data.id) * 0.15 * (1 - m);
        dummy.position.y += floatY;
        
        dummy.rotation.set(0,0,0); // Spheres don't need much rotation unless textured
        dummy.scale.setScalar(data.scale);

        dummy.updateMatrix();
        sphereMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      sphereMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Gift Boxes */}
      <instancedMesh ref={boxMeshRef} args={[undefined, undefined, boxData.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          roughness={0.2} 
          metalness={0.8} 
          envMapIntensity={1.5}
        />
      </instancedMesh>

      {/* Ornaments */}
      <instancedMesh ref={sphereMeshRef} args={[undefined, undefined, sphereData.length]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          roughness={0.1} 
          metalness={0.9} 
          envMapIntensity={2.0} 
        />
      </instancedMesh>
    </group>
  );
};

export default Ornaments;