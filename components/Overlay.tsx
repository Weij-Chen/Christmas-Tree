import React from 'react';
import { TreeMorphState } from '../types';
import { motion } from 'framer-motion';

interface OverlayProps {
  treeState: TreeMorphState;
  toggleState: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ treeState, toggleState }) => {
  const isTree = treeState === TreeMorphState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between items-center p-8 z-10">
      
      {/* Header */}
      <header className="text-center mt-4">
        <h1 className="text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-[#FFF6B5] to-[#C5A059] font-[Cinzel] tracking-widest drop-shadow-[0_2px_10px_rgba(255,215,0,0.3)] uppercase">
          Christmas Tree
        </h1>
        <h2 className="text-[#0b6e40] font-[Playfair Display] italic text-xl md:text-2xl mt-2 tracking-wide opacity-80">
          Merry Christmas
        </h2>
      </header>

      {/* Controls */}
      <div className="mb-12 pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleState}
          className={`
            relative px-8 py-3 text-sm md:text-lg tracking-[0.2em] font-bold border border-[#C5A059]
            transition-all duration-500 overflow-hidden group bg-opacity-20 backdrop-blur-sm
            ${isTree ? 'bg-[#002816] text-[#FFD700]' : 'bg-transparent text-[#FFD700]'}
          `}
        >
          {/* Animated Background Fill */}
          <span className={`absolute inset-0 w-full h-full bg-[#C5A059] transition-transform duration-500 origin-left ${isTree ? 'scale-x-0' : 'scale-x-0'}`} />
          
          <span className="relative z-10 flex items-center gap-2 font-[Cinzel]">
            {isTree ? 'SCATTER ESSENCE' : 'ASSEMBLE FORM'}
          </span>
          
          {/* Glow effect */}
          <div className="absolute inset-0 shadow-[0_0_20px_rgba(197,160,89,0.3)] rounded-sm" />
        </motion.button>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-4 left-4 text-[#0b6e40] text-xs font-[Cinzel] tracking-widest opacity-50">
        INTERACTIVE 3D EXPERIENCE
      </div>
    </div>
  );
};

export default Overlay;