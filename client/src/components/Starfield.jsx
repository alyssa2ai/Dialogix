import { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Stars
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.2,
      speed: Math.random() * 0.12 + 0.02,
      alpha: Math.random() * 0.8 + 0.2,
      flicker: Math.random() * Math.PI * 2,
    }));

    // Bright star clusters
    const brightStars = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 1,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? [147, 197, 253] : [196, 181, 253],
    }));

    let t = 0;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;

      // Ensure deep-space black base every frame.
      ctx.fillStyle = '#010208';
      ctx.fillRect(0, 0, W, H);
      t += 0.006;

      // Deep space base
      const bg = ctx.createRadialGradient(W * 0.7, H * 0.45, 0, W * 0.7, H * 0.45, W * 0.7);
      bg.addColorStop(0, 'rgba(45,20,90,0.25)');
      bg.addColorStop(0.3, 'rgba(20,8,50,0.15)');
      bg.addColorStop(0.6, 'rgba(5,3,20,0.1)');
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Gargantua black hole - right center of screen
      const cx = W * 0.72;
      const cy = H * 0.48;
      const R = Math.min(W, H) * 0.16;

      // Outer gravitational lens glow
      const lensGrad = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 2.2);
      lensGrad.addColorStop(0, 'rgba(88,28,135,0.0)');
      lensGrad.addColorStop(0.4, 'rgba(88,28,135,0.08)');
      lensGrad.addColorStop(0.7, 'rgba(109,40,217,0.06)');
      lensGrad.addColorStop(0.9, 'rgba(139,92,246,0.03)');
      lensGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lensGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Accretion disk - draw as ellipse rings
      const diskAngle = t * 0.15;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(diskAngle);

      [
        { rx: R * 1.9, ry: R * 0.18, alpha: 0.08, color: [245, 158, 11] },
        { rx: R * 1.65, ry: R * 0.14, alpha: 0.15, color: [251, 191, 36] },
        { rx: R * 1.4, ry: R * 0.1, alpha: 0.25, color: [252, 211, 77] },
        { rx: R * 1.18, ry: R * 0.07, alpha: 0.4, color: [255, 245, 180] },
      ].forEach(({ rx, ry, alpha, color }) => {
        const pulse = alpha * (0.85 + 0.15 * Math.sin(t * 2));
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${pulse})`;
        ctx.lineWidth = Math.max(1, ry * 0.4);
        ctx.stroke();
      });

      // Purple-cyan accent disk (counter-rotating)
      ctx.rotate(-diskAngle * 2.3);
      [
        { rx: R * 1.55, ry: R * 0.12, alpha: 0.1, color: [139, 92, 246] },
        { rx: R * 1.75, ry: R * 0.08, alpha: 0.07, color: [56, 189, 248] },
      ].forEach(({ rx, ry, alpha, color }) => {
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
        ctx.lineWidth = ry * 0.5;
        ctx.stroke();
      });

      ctx.restore();

      // Event horizon - pure black circle
      const horizonGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.82);
      horizonGrad.addColorStop(0, 'rgba(0,0,0,1)');
      horizonGrad.addColorStop(0.75, 'rgba(0,0,2,1)');
      horizonGrad.addColorStop(0.9, 'rgba(2,0,8,0.9)');
      horizonGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = horizonGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Inner photon ring - bright thin ring just outside horizon
      const ringPulse = 0.7 + 0.3 * Math.sin(t * 1.5);
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.87, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,240,180,${0.5 * ringPulse})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.9, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,200,100,${0.25 * ringPulse})`;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Gravitational lensing streaks
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 0.05;
        const x1 = cx + Math.cos(angle) * R * 0.9;
        const y1 = cy + Math.sin(angle) * R * 0.9;
        const x2 = cx + Math.cos(angle) * R * 1.4;
        const y2 = cy + Math.sin(angle) * R * 1.4;
        const streak = ctx.createLinearGradient(x1, y1, x2, y2);
        streak.addColorStop(0, `rgba(255,220,100,${0.3 * ringPulse})`);
        streak.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = streak;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Nebula clouds
      [
        { x: W * 0.15, y: H * 0.2, rx: W * 0.25, ry: H * 0.3, color: [88, 28, 135], alpha: 0.06 },
        { x: W * 0.85, y: H * 0.75, rx: W * 0.2, ry: H * 0.25, color: [6, 182, 212], alpha: 0.04 },
        { x: W * 0.5, y: H * 0.85, rx: W * 0.35, ry: H * 0.2, color: [124, 92, 191], alpha: 0.05 },
      ].forEach(({ x, y, rx, ry, color, alpha }) => {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
        const pulse = alpha * (0.8 + 0.2 * Math.sin(t * 0.4));
        grad.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${pulse})`);
        grad.addColorStop(0.5, `rgba(${color[0]},${color[1]},${color[2]},${pulse * 0.4})`);
        grad.addColorStop(1, 'transparent');
        ctx.save();
        ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(
          (x * Math.max(rx, ry)) / rx,
          (y * Math.max(rx, ry)) / ry,
          Math.max(rx, ry),
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      });

      // Stars
      stars.forEach((s) => {
        const alpha = s.alpha * (0.6 + 0.4 * Math.sin(t * 0.9 + s.flicker));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,255,${alpha})`;
        ctx.fill();
        s.y += s.speed;
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
      });

      // Bright stars with glow
      brightStars.forEach((s) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + s.phase);
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 8);
        grad.addColorStop(0, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${0.7 * pulse})`);
        grad.addColorStop(0.3, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${0.2 * pulse})`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,248,255,${pulse})`;
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
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}