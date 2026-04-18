import React, { useEffect, useRef } from 'react';

export function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      time += 0.005;

      const w = canvas.width;
      const h = canvas.height;

      // Clear with very dark background
      ctx.fillStyle = '#010101';
      ctx.fillRect(0, 0, w, h);

      // Gray and slightly light blue, almost not consciously visible
      const blobs = [
        {
          x: w * 0.3 + Math.sin(time * 0.5) * w * 0.2,
          y: h * 0.4 + Math.cos(time * 0.3) * h * 0.2,
          r: w * 0.6,
          color: [20, 25, 35, 0.06] // Subtle light blue-gray
        },
        {
          x: w * 0.7 + Math.sin(time * 0.4 + 2) * w * 0.2,
          y: h * 0.6 + Math.cos(time * 0.6 + 1) * h * 0.2,
          r: w * 0.5,
          color: [15, 15, 15, 0.08] // Pure dark gray
        },
        {
          x: w * 0.5 + Math.sin(time * 0.6 + 4) * w * 0.3,
          y: h * 0.5 + Math.cos(time * 0.2 + 3) * h * 0.3,
          r: w * 0.7,
          color: [18, 22, 28, 0.05] // Another touch of light blue
        },
        {
          x: w * 0.2 + Math.cos(time * 0.7 + 1) * w * 0.2,
          y: h * 0.8 + Math.sin(time * 0.5 + 5) * h * 0.2,
          r: w * 0.4,
          color: [10, 10, 10, 0.12] // Darker gray anchor
        }
      ];

      blobs.forEach(blob => {
        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
        gradient.addColorStop(0, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, ${blob.color[3]})`);
        gradient.addColorStop(1, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#000000]">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        style={{ filter: 'blur(30px)' }}
      />
      {/* Pure clean fractal noise - totally desaturated */}
      <div 
        className="absolute inset-0 opacity-[0.25] mix-blend-overlay z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}