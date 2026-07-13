import { useEffect, useRef } from 'react';

export default function ParticleCanvas({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class definition
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        
        this.x = Math.random() * width;
        
        // Spawn locations depending on theme
        if (theme === 'sunset') {
          // Embers rise from bottom
          this.y = height + Math.random() * 20;
          this.vy = -0.4 - Math.random() * 1.2;
          this.vx = (Math.random() - 0.5) * 0.4;
        } else if (theme === 'frost') {
          // Snow drifts from top
          this.y = -Math.random() * 20;
          this.vy = 0.4 + Math.random() * 1.0;
          this.vx = (Math.random() - 0.3) * 0.7;
        } else {
          // General floating particles
          this.y = Math.random() * height;
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() - 0.5) * 0.5;
        }

        this.size = Math.random() * 2.5 + 0.8;
        this.alpha = Math.random() * 0.4 + 0.08;
        this.color = this.getRandomColor();
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.008 + Math.random() * 0.015;
      }

      getRandomColor() {
        switch (theme) {
          case 'rosegold':
            return Math.random() > 0.5 ? '244, 114, 182' : '226, 167, 111'; // Pink or Gold
          case 'emerald':
            return Math.random() > 0.4 ? '52, 211, 153' : '251, 191, 36'; // Emerald or Amber
          case 'frost':
            return Math.random() > 0.6 ? '255, 255, 255' : '186, 230, 253'; // White or Light Blue
          case 'sunset':
            return Math.random() > 0.5 ? '249, 115, 22' : '239, 68, 68'; // Orange or Red
          case 'amethyst':
            return Math.random() > 0.4 ? '167, 139, 250' : '240, 171, 252'; // Violet or Fuchsia
          case 'aurora':
          default:
            const rand = Math.random();
            if (rand < 0.33) return '56, 189, 248';   // Sky
            if (rand < 0.66) return '167, 139, 250';  // Violet
            return '52, 211, 153';                     // Emerald
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Add subtle wave wobble for snow and embers
        if (theme === 'frost') {
          this.wobble += this.wobbleSpeed;
          this.x += Math.sin(this.wobble) * 0.25;
        }

        // Fade out as sunset embers rise
        if (theme === 'sunset') {
          this.alpha -= 0.0015;
          if (this.alpha <= 0) {
            this.reset();
          }
        }

        // Boundary checks
        if (
          this.x < 0 ||
          this.x > width ||
          this.y < -30 ||
          this.y > height + 30
        ) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Add glow to aurora, amethyst, and sunset particles
        if (theme === 'aurora' || theme === 'amethyst' || theme === 'sunset') {
          ctx.shadowBlur = this.size * 2.5;
          ctx.shadowColor = `rgba(${this.color}, 0.7)`;
        }
        
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize particles
    const particleCount = Math.min(60, Math.floor((width * height) / 25000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Amethyst theme draws a slow-rotating cosmos glow
      if (theme === 'amethyst') {
        const grad = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, Math.max(width, height));
        grad.addColorStop(0, 'rgba(46, 16, 101, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="particles-canvas" />;
}
