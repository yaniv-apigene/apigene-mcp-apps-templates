// Wrapper to load Three.js and expose it globally
// This allows ES modules (LDrawLoader, OrbitControls) to import from 'three'

// Load Three.js from bundled file
import('./three.min.js').then(module => {
  // Three.js UMD build exposes THREE globally
  if (typeof window !== 'undefined' && window.THREE) {
    window.threeJsLoaded = true;
    window.dispatchEvent(new CustomEvent('threejs-loaded'));
  } else {
    // Fallback: try to get THREE from module
    if (module && module.THREE) {
      window.THREE = module.THREE;
      window.threeJsLoaded = true;
      window.dispatchEvent(new CustomEvent('threejs-loaded'));
    }
  }
}).catch(err => {
  console.error('Failed to load Three.js:', err);
  window.threeJsLoadError = true;
  window.dispatchEvent(new CustomEvent('threejs-load-error'));
});
