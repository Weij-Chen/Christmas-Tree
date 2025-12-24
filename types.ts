import { Vector3, Color } from 'three';

export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface DualPosition {
  scatterPos: Float32Array; // [x, y, z]
  treePos: Float32Array;    // [x, y, z]
}

export interface OrnamentData {
  id: number;
  scatterPosition: Vector3;
  treePosition: Vector3;
  rotation: Vector3;
  scale: number;
  color: Color;
  type: 'box' | 'sphere' | 'light';
  speed: number; // For rotation or floating variation
}

export interface ExperienceProps {
  treeState: TreeMorphState;
}
