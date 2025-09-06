import React, { useEffect, useRef, useState } from 'react';
import { animate, createTimer } from 'animejs';
import { useTheme } from '../context/ThemeContext';

interface AnimeLoaderProps {
  onComplete?: () => void;
  fadeOut?: boolean;
}

const AnimeLoader: React.FC<AnimeLoaderProps> = ({ onComplete, fadeOut = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (fadeOut) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        onComplete?.();
      }, 500); // Match the CSS transition duration
      
      return () => clearTimeout(timer);
    }
  }, [fadeOut, onComplete]);

  useEffect(() => {
    if (!svgRef.current) return;

    // Create a timer that syncs with the animations
    const timer = createTimer({
      duration: 3000,
      loop: true,
      frameRate: 60,
      onUpdate: (self) => {
        // Timer is running in sync with animations
        // Can be used for additional synchronized effects
      },
      onLoop: (self) => {
        // Called each time the timer completes a loop
        console.log('Timer loop:', self._currentIteration);
      }
    });

    // Sync both animations to start together with the timer
    const turbulenceAnimation = animate(['feTurbulence', 'feDisplacementMap'], {
      baseFrequency: [0.02, 0.05, 0.02],
      scale: [10, 15, 10],
      duration: 3000,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });

    const petalAnimation = animate('ellipse', {
      rx: [3, 5, 3],
      ry: [12, 16, 12],
      duration: 3000,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });

    const rotationAnimation = animate('g[transform*="translate(64, 52)"]', {
      rotate: [0, 360],
      duration: 6000,
      loop: true,
      easing: 'linear'
    });

    // Proper cleanup function to prevent memory leaks
    return () => {
      timer.pause();
      timer.reset();
      
      // Properly pause and reset animations
      turbulenceAnimation.pause();
      turbulenceAnimation.reset();
      
      petalAnimation.pause();
      petalAnimation.reset();
      
      rotationAnimation.pause();
      rotationAnimation.reset();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 flex items-center justify-center transition-opacity duration-500 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        zIndex: 9999,
        backgroundSize: '300% 300%',
        backgroundImage: `linear-gradient(-45deg, ${theme === 'dark' ? '#1a1a1a 0%, #2d3748 25%, #1a1a1a 50%, #2d3748 75%' : '#ffff 0%, #E5E7EB 25%, #ffff 50%, #E5E7EB 75%'})`,
        animation: 'background-shift 10s ease infinite'
      }}
    >
      {/* Grain overlay matching body::before */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: theme === 'dark' 
            ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' seed='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.5 1'/%3E%3C/feComponentTransfer%3E%3CfeGaussianBlur stdDeviation='0.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23999999' filter='url(%23n)' opacity='0.8'/%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' seed='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.5 1'/%3E%3C/feComponentTransfer%3E%3CfeGaussianBlur stdDeviation='0.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23222222' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          mixBlendMode: theme === 'dark' ? 'screen' : 'multiply',
          opacity: theme === 'dark' ? 0.08 : 0.3,
          filter: theme === 'dark' ? 'contrast(1.2)' : 'contrast(2.5) brightness(0.8)'
        }}
      />
      <div className="relative w-40 h-40 md:w-40 md:h-40">
        {/* Animated SVG with filters - responsive sizing */}
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 160 160"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Turbulence filter for liquid effect */}
            <filter id="liquidEffect" x="-50%" y="-50%" width="200%" height="200%">
              <feTurbulence
                baseFrequency="0.02"
                numOctaves="3"
                result="noise"
                seed="1"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="10"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            
            {/* Glow effect */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Animated radial flower pattern with liquid effect */}
          <g transform="translate(80, 80)">
            {/* Create 12 petals in a radial pattern */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30) * (Math.PI / 180); // 30 degrees apart
              
              return (
                <g key={i} transform={`rotate(${i * 30})`}>
                  {/* Main petal - positioned along the radius */}
                  <ellipse
                    cx="0"
                    cy="-25"
                    rx="4"
                    ry="15"
                    fill={theme === 'dark' ? '#ffffff' : '#000000'}
                    filter="url(#liquidEffect) url(#glow)"
                    opacity="0.8"
                  />
                  {/* Secondary smaller petal */}
                  <ellipse
                    cx="0"
                    cy="-45"
                    rx="3"
                    ry="10"
                    fill={theme === 'dark' ? '#ffffff' : '#000000'}
                    filter="url(#liquidEffect)"
                    opacity="0.6"
                  />
                </g>
              );
            })}
            
            {/* Center circle */}
            <circle
              cx="0"
              cy="0"
              r="6"
              fill={theme === 'dark' ? '#ffffff' : '#000000'}
              filter="url(#glow)"
              opacity="0.9"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default React.memo(AnimeLoader); 