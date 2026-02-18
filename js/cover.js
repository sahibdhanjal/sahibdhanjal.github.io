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

    // Clear canvas
    this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.stars.forEach(star => {
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

      // Project old position
      const tailZ = star.z + this.speed * 2; // Trail length factor
      const scaleTail = this.focalLength / tailZ;
      const x2dTail = this.centerX + star.x * scaleTail;
      const y2dTail = this.centerY + star.y * scaleTail;

      // Draw beam
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

/**
 * Typewriter Effect
 * Types out words, waits, then backspaces them.
 */
class TypewriterEffect {
  constructor(elementId, texts, options = {}) {
    this.element = document.getElementById(elementId);
    this.texts = texts;
    this.typeSpeed = options.typeSpeed || 100;
    this.deleteSpeed = options.deleteSpeed || 50;
    this.waitBeforeDelete = options.waitBeforeDelete || 2000;
    this.waitBeforeType = options.waitBeforeType || 500;

    this.txt = '';
    this.wordIndex = 0;
    this.isDeleting = false;
    this.timerId = null;

    if (!this.element) {
      console.error('TypewriterEffect: Element not found', elementId);
      return;
    }

    this.type();
  }

  type() {
    const current = this.wordIndex % this.texts.length;
    const fullTxt = this.texts[current];

    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.element.innerHTML = `<span class="wrap">${this.txt}</span><span class="cursor">_</span>`;

    let typeSpeed = this.typeSpeed;

    if (this.isDeleting) {
      typeSpeed = this.deleteSpeed;
    }

    if (!this.isDeleting && this.txt === fullTxt) {
      typeSpeed = this.waitBeforeDelete;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
      this.isDeleting = false;
      this.wordIndex++;
      typeSpeed = this.waitBeforeType;
    }

    this.timerId = setTimeout(() => this.type(), typeSpeed);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Header Scroll Logic
  try {
    const toggleHeaderScrolled = () => {
      if (window.scrollY > 100) {
        document.body.classList.add('header-scrolled');
      } else {
        document.body.classList.remove('header-scrolled');
      }
    };

    window.addEventListener('scroll', toggleHeaderScrolled);
    toggleHeaderScrolled(); // Initial check
  } catch (e) {
    console.error('Error in Header Scroll Logic:', e);
  }

  // Initialize Typewriter Effect for 'robots'
  try {
    const textElement = document.getElementById('changing-text');
    if (textElement) {
      // Add cursor style if not present
      if (!document.getElementById('typewriter-cursor-style')) {
        const style = document.createElement('style');
        style.id = 'typewriter-cursor-style';
        style.innerHTML = `
                    .cursor {
                        animation: blink 1s infinite;
                        font-weight: 100;
                        margin-left: 2px;
                    }
                    @keyframes blink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0; }
                    }
                `;
        document.head.appendChild(style);
      }

      new TypewriterEffect('changing-text', ['robots', 'cars', 'devices'], {
        typeSpeed: 150,
        deleteSpeed: 100,
        waitBeforeDelete: 5000
      });
    } else {
      console.warn('TypewriterEffect: #changing-text not found');
    }
  } catch (e) {
    console.error('Error initializing TypewriterEffect:', e);
  }

  // Initialize Cover Effect with error handling
  try {
    if (document.getElementById('cover-canvas')) {
      new CoverEffect('cover-canvas', 'home');
    }
  } catch (e) {
    console.error('Error initializing CoverEffect:', e);
  }
});
