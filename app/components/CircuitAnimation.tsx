import { useRef, useEffect, useCallback } from 'react';

// Define Particle class before using it
class Particle {
    x: number;
    y: number;
    speed: { x: number; y: number };
    color: string;
    target: { x: number; y: number };
  
    constructor(x: number, y: number, target: { x: number; y: number }, color: string) {
      this.x = x;
      this.y = y;
      this.target = target;
      this.color = color;
      
      const dx = this.target.x - x;
      const dy = this.target.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const speed = 2;
      this.speed = {
        x: (dx / dist) * speed,
        y: (dy / dist) * speed
      };
    }
  
    update(ctx: CanvasRenderingContext2D) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      
      this.x += this.speed.x;
      this.y += this.speed.y;
      
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    }
  
    hasReachedTarget(): boolean {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      return Math.abs(dx) < 5 && Math.abs(dy) < 5;
    }
  }
  
  // Canvas Animation Component
  const CircuitAnimation = ({ isActive, targetRef }: { isActive: boolean; targetRef: React.RefObject<HTMLElement> }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const animationRef = useRef<number | null>(null);
    const ctx = useRef<CanvasRenderingContext2D | null>(null);
  
    const clearCanvas = useCallback(() => {
      if (!canvasRef.current || !ctx.current) return;
      ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }, []);
  
    const resetAnimation = useCallback(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      particles.current = [];
      clearCanvas();
    }, [clearCanvas]);
  
    useEffect(() => {
      if (!canvasRef.current) return;
  
      ctx.current = canvasRef.current.getContext('2d');
      
      const resizeCanvas = () => {
        if (!canvasRef.current) return;
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      };
  
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
  
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        resetAnimation();
      };
    }, [resetAnimation]);
  
    useEffect(() => {
      if (!isActive) {
        resetAnimation();
        return;
      }
    }, [isActive, resetAnimation]);
  
    const createParticles = useCallback(() => {
      if (!targetRef.current || !canvasRef.current) return;
      
      const rect = targetRef.current.getBoundingClientRect();
      const videoCenter = {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
      };
  
      const numParticles = 12;
      const positions = [
        // Top edge
        ...Array(numParticles/4).fill(0).map((_, i) => ({
          x: (canvasRef.current!.width / (numParticles/4)) * i,
          y: 0
        })),
        // Bottom edge
        ...Array(numParticles/4).fill(0).map((_, i) => ({
          x: (canvasRef.current!.width / (numParticles/4)) * i,
          y: canvasRef.current!.height
        })),
        // Left edge
        ...Array(numParticles/4).fill(0).map((_, i) => ({
          x: 0,
          y: (canvasRef.current!.height / (numParticles/4)) * i
        })),
        // Right edge
        ...Array(numParticles/4).fill(0).map((_, i) => ({
          x: canvasRef.current!.width,
          y: (canvasRef.current!.height / (numParticles/4)) * i
        }))
      ];
  
      positions.forEach(pos => {
        particles.current.push(
          new Particle(
            pos.x,
            pos.y,
            videoCenter,
            'rgb(128, 128, 128)'
          )
        );
      });
    }, [targetRef]);
  
    useEffect(() => {
      if (!isActive || !ctx.current) return;
  
      const animate = () => {
        if (!ctx.current) return;
        
        // Add slight transparency to create fade effect
        ctx.current.fillStyle = "rgba(255, 255, 255, 0.07)";
        ctx.current.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        
        particles.current = particles.current.filter(particle => {
          if (particle.hasReachedTarget()) {
            return false;
          }
          particle.update(ctx.current!);
          return true;
        });
  
        if (isActive && particles.current.length < 12) {
          createParticles();
        }
  
        animationRef.current = requestAnimationFrame(animate);
      };
  
      animate();
  
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isActive, createParticles]);
  
    return (
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'transparent' }}
      />
    );
  };
  
  export default CircuitAnimation;