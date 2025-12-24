import { Color } from 'three';

// --- Configuration ---
export const FOLIAGE_COUNT = 12000;
export const ORNAMENT_COUNT = 280; // Increased from 150 for more gifts/balls
export const LIGHT_COUNT = 300;

export const COLORS = {
  emeraldDark: new Color('#002816'),
  emeraldLight: new Color('#0b6e40'),
  gold: new Color('#FFD700'),
  goldHot: new Color('#FFF6B5'),
  redLuxury: new Color('#8a1c1c'),
  bgGradientStart: '#001a0f',
  bgGradientEnd: '#000000',
};

export const TREE_CONFIG = {
  height: 12,
  radiusBase: 4.5,
  scatterRadius: 18,
};

// --- Shaders ---

// Foliage Vertex Shader: Handles morphing between scatter and tree positions
export const foliageVertexShader = `
  uniform float uTime;
  uniform float uMorph; // 0.0 = Scattered, 1.0 = Tree
  uniform float uPixelRatio;

  attribute vec3 aScatterPos;
  attribute vec3 aTreePos;
  attribute float aRandom;
  attribute float aSize;

  varying vec3 vColor;
  varying float vAlpha;

  // Classic Perlin noise 3D (simplified)
  float hash(float n) { return fract(sin(n) * 1e4); }
  float noise(vec3 x) {
      const vec3 step = vec3(110, 241, 171);
      vec3 i = floor(x);
      vec3 f = fract(x);
      float n = dot(i, step);
      vec3 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(0, 0, 1))), u.z),
                     mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(0, 1, 1))), u.z), u.y),
                 mix(mix( hash(n + dot(step, vec3(1, 0, 0))), hash(n + dot(step, vec3(1, 0, 1))), u.z),
                     mix( hash(n + dot(step, vec3(1, 1, 0))), hash(n + dot(step, vec3(1, 1, 1))), u.z), u.y), u.x);
  }

  void main() {
    // Interpolate position
    vec3 targetPos = mix(aScatterPos, aTreePos, uMorph);
    
    // Add "breathing" movement based on noise and time
    float breath = noise(targetPos * 0.5 + uTime * 0.5) * 0.3 * (1.0 - uMorph * 0.5); 
    
    // When scattered, move more chaotically. When tree, settle down.
    vec3 finalPos = targetPos + vec3(0.0, breath, 0.0);

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    gl_PointSize = aSize * uPixelRatio * (50.0 / -mvPosition.z);
    
    // Pass color data to fragment shader
    // Mix between dark emerald and bright gold/green based on noise
    float colorMix = noise(targetPos * 2.0 + uTime * 0.2);
    vColor = mix(vec3(0.02, 0.2, 0.1), vec3(0.8, 0.7, 0.2), step(0.9, colorMix));
    
    // Fade out slightly when scattered to look like dust
    vAlpha = 0.6 + 0.4 * uMorph; 
  }
`;

// Foliage Fragment Shader: Makes circular soft particles with glow
export const foliageFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Circular particle logic
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Soft edge glow
    float glow = 1.0 - (dist * 2.0);
    glow = pow(glow, 1.5);

    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;