import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeMorphState } from '../types';
import FoliagePoints from './FoliagePoints';
import Ornaments from './Ornaments';
import Lights from './Lights';
import TopStar from './TopStar';
import Mascots from './Mascots';

interface ExperienceProps {
  treeState: TreeMorphState;
}

const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  // Convert Enum state to a 0-1 target value
  const morphTarget = treeState === TreeMorphState.TREE_SHAPE ? 1.0 : 0.0;

  return (
    <Canvas 
      gl={{ antialias: false, alpha: false }} 
      dpr={[1, 2]} // Optimize for pixel ratio
      shadows
    >
      <color attach="background" args={['#000502']} />
      
      <PerspectiveCamera makeDefault position={[0, 2, 18]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minDistance={8} 
        maxDistance={25} 
        maxPolarAngle={Math.PI / 1.4}
        autoRotate={treeState === TreeMorphState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      {/* --- Environment & Lighting --- */}
      <Environment preset="city" /> 
      <ambientLight intensity={0.2} color="#001a0f" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        color="#fff0d6" 
        castShadow 
      />
      <pointLight position={[-10, -5, -10]} intensity={1} color="#0b6e40" />

      {/* --- Scene Content --- */}
      <group position={[0, -4, 0]}>
        <FoliagePoints morphTarget={morphTarget} />
        <Ornaments morphTarget={morphTarget} />
        <Mascots morphTarget={morphTarget} />
        <Lights morphTarget={morphTarget} />
        <TopStar morphTarget={morphTarget} />
      </group>

      {/* --- Background particles --- */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={20} size={2} speed={0.4} opacity={0.5} color="#ffd700" />

      {/* --- Post Processing --- */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={1.4} // Raised threshold so only very bright bits glow
          mipmapBlur 
          intensity={0.8} // Reduced from 1.5 to be less blinding
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </Canvas>
  );
};

export default Experience;