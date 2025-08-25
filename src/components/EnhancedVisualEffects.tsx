
import React, { useEffect, useRef } from 'react';

interface ParticleSystemProps {
  className?: string;
  particleCount?: number;
  color?: string;
}

const DISABLE_EFFECTS = true;
export function ParticleSystem({ 
  className = '', 
  particleCount = 50,
  color = 'hsl(160, 51%, 58%)'
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (DISABLE_EFFECTS) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      fadeDirection: number;
    }> = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        fadeDirection: Math.random() > 0.5 ? 1 : -1
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Update opacity for twinkling effect
        particle.opacity += particle.fadeDirection * 0.01;
        if (particle.opacity <= 0.1 || particle.opacity >= 0.9) {
          particle.fadeDirection *= -1;
        }

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [particleCount, color]);

  return DISABLE_EFFECTS ? null : (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    />
  );
}

interface FloatingElementsProps {
  children: React.ReactNode;
  className?: string;
}

export function FloatingElements({ children, className = '' }: FloatingElementsProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface GlowEffectProps {
  children: React.ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export function GlowEffect({ 
  children, 
  color = 'emerald', 
  intensity = 'medium',
  className = ''
}: GlowEffectProps) {
  const intensityClasses = {
    low: 'shadow-sm',
    medium: 'shadow-glow',
    high: 'shadow-neon'
  };

  return (
    <div 
      className={`${intensityClasses[intensity]} transition-all duration-500 hover:scale-105 ${className}`}
      style={{
        filter: `drop-shadow(0 0 10px hsl(var(--${color}) / 0.3))`
      }}
    >
      {children}
    </div>
  );
}

interface AnimatedBackgroundProps {
  pattern?: 'mesh' | 'waves' | 'geometric';
  className?: string;
}

export function AnimatedBackground({ pattern = 'mesh', className = '' }: AnimatedBackgroundProps) {
  const patterns = {
    mesh: 'bg-gradient-to-br from-surface via-surface-hover to-surface',
    waves: 'bg-gradient-to-r from-emerald/10 via-cyan/10 to-purple/10',
    geometric: 'bg-gradient-radial from-emerald/5 via-transparent to-purple/5'
  };

  return DISABLE_EFFECTS ? null : (
    <div className={`absolute inset-0 ${patterns[pattern]} ${className}`}>
      {/* Visual effects disabled globally */}
    </div>
  );
}

interface MatrixRainProps {
  className?: string;
  speed?: number;
}

export function MatrixRain({ className = '', speed = 50 }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (DISABLE_EFFECTS) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = '01'.split('');
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    let animationId: number;

    const draw = () => {
      ctx.fillStyle = 'hsl(218, 50%, 6%)';
      ctx.globalAlpha = 0.05;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'hsl(160, 51%, 58%)';
      ctx.globalAlpha = 0.8;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      setTimeout(() => {
        animationId = requestAnimationFrame(draw);
      }, speed);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [speed]);

  return DISABLE_EFFECTS ? null : (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none opacity-20 ${className}`}
      style={{ zIndex: -2 }}
    />
  );
}
