import { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate stars
    const stars = Array.from({ length: 180 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.2 + 0.2,
      speed: Math.random() * 0.15 + 0.03,
      alpha: Math.random() * 0.7 + 0.2,
      flicker: Math.random() * Math.PI * 2, // phase offset
    }));

    // A few larger "bright" stars
    const brightStars = Array.from({ length: 12 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.8 + 1,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;

      // Regular stars — slow drift downward
      stars.forEach(s => {
        const alpha = s.alpha * (0.7 + 0.3 * Math.sin(t * 0.8 + s.flicker));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,255,${alpha})`;
        ctx.fill();

        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      });

      // Bright stars with glow
      brightStars.forEach(s => {
        const pulse = 0.6 + 0.4 * Math.sin(t + s.phase);
        // Glow
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
        grad.addColorStop(0,   `rgba(147,197,253,${0.6 * pulse})`);
        grad.addColorStop(0.4, `rgba(167,139,250,${0.2 * pulse})`);
        grad.addColorStop(1,   'transparent');
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        // Core
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,230,255,${pulse})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}