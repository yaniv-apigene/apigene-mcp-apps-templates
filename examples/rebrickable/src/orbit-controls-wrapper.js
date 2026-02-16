/**
 * OrbitControls Wrapper
 * 
 * This wrapper adapts the ES module OrbitControls to work with global THREE object.
 */

// Basic OrbitControls implementation using THREE
// This is a simplified version - full implementation would require
// the complete OrbitControls ES module adapted for global THREE

function initOrbitControls() {
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not available, OrbitControls cannot be initialized');
    return null;
  }

  class OrbitControlsWrapper {
    constructor(camera, domElement) {
      this.camera = camera;
      this.domElement = domElement;
      this.enableDamping = false;
      this.dampingFactor = 0.05;
      this.minDistance = 0;
      this.maxDistance = Infinity;
      
      this.target = new THREE.Vector3();
      this.spherical = new THREE.Spherical();
      this.sphericalDelta = new THREE.Spherical();
      
      this.rotateSpeed = 1.0;
      this.zoomSpeed = 1.0;
      this.panSpeed = 1.0;
      
      this.isMouseDown = false;
      this.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      };
      
      this.setupEventListeners();
    }

    setupEventListeners() {
      this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
      this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
      this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
      this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
    }

    onMouseDown(event) {
      this.isMouseDown = true;
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    }

    onMouseMove(event) {
      if (!this.isMouseDown) return;
      
      const deltaX = event.clientX - this.mouseX;
      const deltaY = event.clientY - this.mouseY;
      
      this.sphericalDelta.theta -= deltaX * 0.01 * this.rotateSpeed;
      this.sphericalDelta.phi -= deltaY * 0.01 * this.rotateSpeed;
      
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
      
      this.update();
    }

    onMouseUp() {
      this.isMouseDown = false;
    }

    onMouseWheel(event) {
      event.preventDefault();
      const delta = event.deltaY * 0.01 * this.zoomSpeed;
      this.spherical.radius += delta;
      this.update();
    }

    update() {
      const offset = new THREE.Vector3();
      offset.copy(this.camera.position).sub(this.target);
      
      this.spherical.setFromVector3(offset);
      this.spherical.theta += this.sphericalDelta.theta;
      this.spherical.phi += this.sphericalDelta.phi;
      this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
      
      offset.setFromSpherical(this.spherical);
      this.camera.position.copy(this.target).add(offset);
      this.camera.lookAt(this.target);
      
      if (this.enableDamping) {
        this.sphericalDelta.theta *= (1 - this.dampingFactor);
        this.sphericalDelta.phi *= (1 - this.dampingFactor);
      } else {
        this.sphericalDelta.set(0, 0, 0);
      }
    }
  }

  return OrbitControlsWrapper;
}

// Export for use in TypeScript
if (typeof window !== 'undefined') {
  // Initialize and expose OrbitControls class
  window.initOrbitControls = initOrbitControls;
  // Create the class when Three.js is available
  if (typeof THREE !== 'undefined') {
    const ControlsClass = initOrbitControls();
    if (ControlsClass) {
      window.OrbitControls = ControlsClass;
    }
  }
}
