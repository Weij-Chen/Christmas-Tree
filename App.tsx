import React, { useState } from 'react';
import Experience from './components/Experience';
import Overlay from './components/Overlay';
import { TreeMorphState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeMorphState>(TreeMorphState.SCATTERED);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeMorphState.SCATTERED 
        ? TreeMorphState.TREE_SHAPE 
        : TreeMorphState.SCATTERED
    );
  };

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Experience treeState={treeState} />
      </div>

      {/* UI Overlay Layer */}
      <Overlay treeState={treeState} toggleState={toggleState} />
      
      {/* Decorative Border (Vignette frame) */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-[#C5A059]/20 m-4 z-20 mix-blend-overlay" />
    </div>
  );
};

export default App;
