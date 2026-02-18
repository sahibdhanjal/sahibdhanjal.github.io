/**
 * Aceternity Cover Effect (Warp Speed / Starfield)
 * Implements a 3D starfield that accelerates on hover.
 */

class CoverEffect {
  constructor(canvasId, sectionId) {
    this.canvas = document.getElementById(canvasId);
    this.section = document.getElementById(sectionId);

    if (!this.canvas) {
      console.error('Canvas element not found:', canvasId);
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.numStars = 400; // Number of beams
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.focalLength = this.width / 2;
    this.baseSpeed = 2;
    this.warpSpeed = 20;
    this.speed = this.baseSpeed;
    this.rafId = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Create stars
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push(this.createStar());
    }

    // Event listeners for hover effect -
    // Uncomment to enable warp speed on hover
    // if (this.section) {
    //   this.section.addEventListener('mouseenter', () => {
    //     this.targetSpeed = this.warpSpeed;
    //   });
    //   this.section.addEventListener('mouseleave', () => {
    //     this.targetSpeed = this.baseSpeed;
    //   });
    // }

    this.targetSpeed = this.baseSpeed;

    this.animate();
  }

  createStar() {
    return {
      x: Math.random() * this.width - this.centerX,
      y: Math.random() * this.height - this.centerY,
      z: Math.random() * this.width, // Depth
      oX: 0, // Old X for trail
      oY: 0, // Old Y for trail
      oZ: 0  // Old Z
    };
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight; // Or specific section height if needed, but 'beams' look best full screen or localized
    if (this.section) {
      this.height = this.section.offsetHeight;
      this.width = this.section.offsetWidth;
    }

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.focalLength = this.width / 2;
  }

  animate() {
    // Smooth speed transition
    this.speed += (this.targetSpeed - this.speed) * 0.1;

    // Clear canvas with fade effect for trails? 
    // Actually for pure "beams" usually we clear completely and draw lines from prevZ to currZ
    this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.stars.forEach(star => {
      // Keep old position for trail start
      // We need to project the OLD z to get the trail start point
      // But since z changes, we can calculate the old z based on speed

      // Move star
      star.z -= this.speed;

      // Reset if passed camera
      if (star.z <= 0) {
        star.x = Math.random() * this.width - this.centerX;
        star.y = Math.random() * this.height - this.centerY;
        star.z = this.width;
        star.oZ = star.z + this.speed; // Reset old Z
      }

      // Project current position
      const scale = this.focalLength / star.z;
      const x2d = this.centerX + star.x * scale;
      const y2d = this.centerY + star.y * scale;

      // Project old position (position before this frame's move)
      // Ideally we draw a "streak" based on speed.
      // A simple way is to use a slightly larger Z for the tail
      const tailZ = star.z + this.speed * 2; // Trail length factor
      const scaleTail = this.focalLength / tailZ;
      const x2dTail = this.centerX + star.x * scaleTail;
      const y2dTail = this.centerY + star.y * scaleTail;

      // Draw beam
      // Only draw if within bounds (optional, but good for performance/glitches)
      if (x2d >= 0 && x2d <= this.width && y2d >= 0 && y2d <= this.height) {
        const alpha = (1 - star.z / this.width); // Fade out at distance

        this.ctx.beginPath();
        this.ctx.lineWidth = Math.max(0.5, scale * 0.5); // Thicker as it gets closer
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.lineCap = 'round';

        this.ctx.moveTo(x2dTail, y2dTail);
        this.ctx.lineTo(x2d, y2d);
        this.ctx.stroke();
      }
    });

    this.rafId = requestAnimationFrame(() => this.animate());
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if element exists before init
  if (document.getElementById('cover-canvas')) {
    new CoverEffect('cover-canvas', 'home');
  }
});
