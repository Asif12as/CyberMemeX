import React, { useEffect, useRef } from 'react';

const BackgroundEffects: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix rain effect
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00FFFF';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 100);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      {/* Matrix Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full opacity-10 pointer-events-none"
        style={{ zIndex: -1 }}
      />

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyber-blue rounded-full animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ zIndex: -1 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(transparent 50%, rgba(0, 255, 255, 0.03) 50%)',
            backgroundSize: '100% 4px',
          }}
        />
      </div>

      {/* Glitch overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-5 animate-pulse"
        style={{
          zIndex: -1,
          background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #00FFFF 2px, #00FFFF 4px)',
        }}
      />
    </>
  );
};

export default BackgroundEffects;