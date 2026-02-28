import { useEffect, useRef } from 'react';

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>{}[]|/\\!@#$%^&*';
const FONT_SIZE = 15;

export default function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let columns, drops, brightness;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      columns    = Math.floor(canvas.width / FONT_SIZE);
      drops      = Array.from({ length: columns }, () => Math.random() * -100);
      brightness = Array.from({ length: columns }, () => Math.floor(120 + Math.random() * 135));
    }

    function draw() {
      ctx.fillStyle = 'rgba(5,10,15,0.065)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `bold ${FONT_SIZE}px "Share Tech Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        if (drops[i] >= 0 && drops[i] <= 1) {
          ctx.fillStyle   = '#e0f8ff';
          ctx.shadowColor = '#00d4ff';
          ctx.shadowBlur  = 18;
        } else {
          const b = brightness[i];
          ctx.fillStyle   = `rgb(${Math.floor(b * 0.02)},${Math.floor(b * 0.72)},${b})`;
          ctx.shadowColor = 'rgba(0,212,255,0.6)';
          ctx.shadowBlur  = Math.random() > 0.92 ? 12 : 4;
        }

        ctx.fillText(char, x, y);

        if (Math.random() > 0.97) brightness[i] = Math.floor(100 + Math.random() * 155);
        if (y > canvas.height && Math.random() > 0.97) {
          drops[i]      = 0;
          brightness[i] = Math.floor(120 + Math.random() * 135);
        }
        drops[i] += 0.6 + Math.random() * 0.4;
      }
      ctx.shadowBlur = 0;
    }

    resize();
    window.addEventListener('resize', resize);
    const interval = setInterval(draw, 40);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-canvas" />;
}
