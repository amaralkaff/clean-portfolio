"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { animate, createTimer, stagger, utils } from 'animejs';
  
interface CircuitAnimationProps {
  isActive: boolean;
  targetRef: React.RefObject<HTMLElement>;
  sourceRef?: React.RefObject<HTMLElement>; // Optional source element
  chargeLevel?: number; // 0-100 for charging intensity
}

const CircuitAnimation = ({ isActive, targetRef, sourceRef, chargeLevel = 0 }: CircuitAnimationProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationTimer = useRef<any>(null);
  const persistentLines = useRef<SVGPathElement[]>([]);
  const { theme } = useTheme();

  const createPersistentCircuitLines = useCallback(() => {
    if (!targetRef.current || !svgRef.current) return;

    // Clear existing persistent lines
    persistentLines.current.forEach(line => line.remove());
    persistentLines.current = [];

    const rect = targetRef.current.getBoundingClientRect();
    const target = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
    
    // Ensure target coordinates are valid
    if (!isFinite(target.x) || !isFinite(target.y)) {
      console.warn('CircuitAnimation: Invalid target coordinates, using fallback');
      target.x = window.innerWidth / 2;
      target.y = window.innerHeight / 2;
    }

    const svg = svgRef.current;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // If sourceRef is provided, create one line from source to target first
    if (sourceRef && sourceRef.current) {
      const sourceRect = sourceRef.current.getBoundingClientRect();
      const source = {
        x: sourceRect.x + sourceRect.width / 2,
        y: sourceRect.y + sourceRect.height / 2
      };
      
      // Create the main connection line from source to target
      const mainPathData = createCircuitPath(source.x, source.y, target.x, target.y);
      
      const mainLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      mainLine.setAttribute('d', mainPathData);
      
      // Get theme colors from CSS variables
      const rootStyles = getComputedStyle(document.documentElement);
      const textColor = rootStyles.getPropertyValue('--text-primary').trim();
      
      mainLine.setAttribute('stroke', textColor);
      mainLine.setAttribute('stroke-width', '2');
      mainLine.setAttribute('fill', 'none');
      mainLine.setAttribute('opacity', '0');
      mainLine.style.filter = `drop-shadow(0 0 3px ${textColor})`;
      
      svg.appendChild(mainLine);
      persistentLines.current.push(mainLine);

      // Animate the main line first
      const mainPathLength = mainLine.getTotalLength?.() || 1000;
      mainLine.style.strokeDasharray = mainPathLength.toString();
      mainLine.style.strokeDashoffset = mainPathLength.toString();
      
      animate(mainLine, {
        strokeDashoffset: [mainPathLength, 0],
        opacity: [0, 0.6],
        duration: 1500,
        ease: 'easeInOutQuad',
        complete: () => {
          // After main line is drawn, create circuits around the target
          createCircuitsAroundTarget(target, rect);
        }
      });
    } else {
      // Use original edge positions when no source is specified
      const startPositions = [
        { x: w * 0.2, y: 0 },
        { x: w * 0.5, y: 0 },
        { x: w * 0.8, y: 0 },
        { x: w, y: h * 0.3 },
        { x: w, y: h * 0.7 },
        { x: w * 0.3, y: h },
        { x: w * 0.7, y: h },
        { x: 0, y: h * 0.4 },
        { x: 0, y: h * 0.6 }
      ];

      const numCircuits = Math.min(6, startPositions.length);
      
      for (let i = 0; i < numCircuits; i++) {
        const startPos = startPositions[i];
        const pathData = createCircuitPath(startPos.x, startPos.y, target.x, target.y);
        
        // Create persistent SVG path element
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', pathData);
        
        // Get theme colors from CSS variables
        const rootStyles = getComputedStyle(document.documentElement);
        const textColor = rootStyles.getPropertyValue('--text-primary').trim();
        
        line.setAttribute('stroke', textColor);
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('fill', 'none');
        line.setAttribute('opacity', '0.3');
        line.style.filter = `drop-shadow(0 0 2px ${textColor})`;
        
        svg.appendChild(line);
        persistentLines.current.push(line);

        // Animate initial line drawing
        const pathLength = line.getTotalLength?.() || 1000;
        line.style.strokeDasharray = pathLength.toString();
        line.style.strokeDashoffset = pathLength.toString();
        
        animate(line, {
          strokeDashoffset: [pathLength, 0],
          opacity: [0, 0.3],
          duration: 2000,
          delay: i * 200,
          ease: 'easeInOutQuad'
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef, sourceRef]);

  // Function to create circuits around the target element
  const createCircuitsAroundTarget = useCallback((target: { x: number; y: number }, targetRect: DOMRect) => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const rootStyles = getComputedStyle(document.documentElement);
    const textColor = rootStyles.getPropertyValue('--text-primary').trim();
    
    // Create circuit lines around the target (modal video)
    const radius = Math.max(targetRect.width, targetRect.height) * 0.8;
    const numCircuits = 8;
    
    for (let i = 0; i < numCircuits; i++) {
      const angle = (i / numCircuits) * Math.PI * 2;
      const startX = target.x + Math.cos(angle) * radius;
      const startY = target.y + Math.sin(angle) * radius;
      
      // Create a circuit that goes around the target
      const pathData = createCircularPath(startX, startY, target.x, target.y, radius * 0.3);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('d', pathData);
      line.setAttribute('stroke', textColor);
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('fill', 'none');
      line.setAttribute('opacity', '0');
      line.style.filter = `drop-shadow(0 0 2px ${textColor})`;
      
      svg.appendChild(line);
      persistentLines.current.push(line);

      // Animate the surrounding circuits
      const pathLength = line.getTotalLength?.() || 500;
      line.style.strokeDasharray = pathLength.toString();
      line.style.strokeDashoffset = pathLength.toString();
      
      animate(line, {
        strokeDashoffset: [pathLength, 0],
        opacity: [0, 0.4],
        duration: 1000,
        delay: i * 100,
        ease: 'easeInOutQuad'
      });
    }
  }, []);

  const createChargingEffect = useCallback(() => {
    if (!svgRef.current || persistentLines.current.length === 0) return;
    
    const svg = svgRef.current;
    const intensity = Math.max(chargeLevel / 100, 0.1);
    const numParticles = chargeLevel > 0 ? Math.floor(chargeLevel / 20) + 1 : 0; // 1-6 particles based on charge
    
    // Get theme colors
    const rootStyles = getComputedStyle(document.documentElement);
    const gradientColor1 = rootStyles.getPropertyValue('--bg-gradient-light-1').trim();
    const gradientColor2 = rootStyles.getPropertyValue('--bg-gradient-light-2').trim();
    
    persistentLines.current.forEach((line, lineIndex) => {
      const pathData = line.getAttribute('d');
      if (!pathData) return;
      
      // Update line intensity based on charge level
      const currentOpacity = parseFloat(line.getAttribute('opacity') || '0.3');
      const currentStrokeWidth = parseFloat(line.getAttribute('stroke-width') || '1.5');
      
      // Rollback effect when charge level is 0
      if (chargeLevel === 0) {
        // Animate lines fading out and rolling back
        animate(line, {
          opacity: [currentOpacity, 0.1, 0],
          strokeWidth: [currentStrokeWidth, 1, 0.5],
          duration: 1500,
          ease: 'easeInQuad',
          complete: () => {
            // After rollback animation, remove the line
            line.remove();
          }
        });
        
        // Create rollback particles that flow in reverse
        if (sourceRef && sourceRef.current) {
          createRollbackParticles(pathData, lineIndex);
        }
        return; // Skip normal particle creation for rollback
      }
      
      animate(line, {
        opacity: [currentOpacity, 0.3 + intensity * 0.5],
        strokeWidth: [currentStrokeWidth, 1.5 + intensity * 2],
        duration: 500,
        ease: 'easeOutQuad'
      });
      
      // Create charging particles only when charge level > 0
      for (let i = 0; i < numParticles; i++) {
        const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        particle.setAttribute('r', (2 + intensity * 3).toString());
        particle.setAttribute('fill', theme === 'dark' ? gradientColor2 : gradientColor1);
        particle.setAttribute('opacity', '0');
        particle.style.filter = `drop-shadow(0 0 ${4 + intensity * 8}px ${theme === 'dark' ? gradientColor2 : gradientColor1})`;
        
        svg.appendChild(particle);

        // Animate particle along the persistent path
        // Parse path data to get coordinates for manual animation
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', pathData);
        
        // Safely get path length with fallback
        let pathLength = 1000;
        try {
          pathLength = pathElement.getTotalLength?.() || 1000;
          if (!isFinite(pathLength) || pathLength <= 0) {
            pathLength = 1000;
          }
        } catch (e) {
          console.warn('CircuitAnimation: Could not get path length, using fallback');
          pathLength = 1000;
        }
        
        // Get start and end points safely
        let startPoint = { x: 0, y: 0 };
        let endPoint = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        
        try {
          const startPt = pathElement.getPointAtLength?.(0);
          const endPt = pathElement.getPointAtLength?.(pathLength);
          
          if (startPt && isFinite(startPt.x) && isFinite(startPt.y)) {
            startPoint = startPt;
          }
          if (endPt && isFinite(endPt.x) && isFinite(endPt.y)) {
            endPoint = endPt;
          }
        } catch (e) {
          console.warn('CircuitAnimation: Could not get path points, using fallbacks');
        }
        
        // Set initial position
        particle.setAttribute('cx', startPoint.x.toString());
        particle.setAttribute('cy', startPoint.y.toString());
        
        animate(particle, {
          scale: [0, 1 + intensity, 0.5 + intensity * 0.5, 0],
          opacity: [0, intensity, intensity * 0.8, 0],
          duration: Math.max(1000, 2000 - (intensity * 800)), // Ensure minimum duration
          delay: lineIndex * 100 + i * 300,
          ease: 'easeInOutQuad',
          update: (anim: any) => {
            try {
              const progress = Math.max(0, Math.min(1, anim.progress / 100));
              const point = pathElement.getPointAtLength?.(pathLength * progress);
              
              if (point && isFinite(point.x) && isFinite(point.y)) {
                particle.setAttribute('cx', point.x.toString());
                particle.setAttribute('cy', point.y.toString());
              } else {
                // Fallback to linear interpolation between start and end
                const x = startPoint.x + (endPoint.x - startPoint.x) * progress;
                const y = startPoint.y + (endPoint.y - startPoint.y) * progress;
                particle.setAttribute('cx', x.toString());
                particle.setAttribute('cy', y.toString());
              }
            } catch (e) {
              console.warn('CircuitAnimation: Error in particle update, using fallback position');
            }
          },
          complete: () => {
            particle.remove();
          }
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargeLevel, theme, sourceRef]);

  // Function to create rollback particles that flow in reverse
  const createRollbackParticles = useCallback((pathData: string, lineIndex: number) => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const rootStyles = getComputedStyle(document.documentElement);
    const gradientColor1 = rootStyles.getPropertyValue('--bg-gradient-light-1').trim();
    const gradientColor2 = rootStyles.getPropertyValue('--bg-gradient-light-2').trim();
    
    // Create fewer particles for rollback effect
    const numRollbackParticles = 3;
    
    for (let i = 0; i < numRollbackParticles; i++) {
      const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      particle.setAttribute('r', '2');
      particle.setAttribute('fill', theme === 'dark' ? gradientColor1 : gradientColor2);
      particle.setAttribute('opacity', '0');
      particle.style.filter = `drop-shadow(0 0 4px ${theme === 'dark' ? gradientColor1 : gradientColor2})`;
      
      svg.appendChild(particle);

      // Parse path data for rollback animation
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', pathData);
      
      let pathLength = 1000;
      try {
        pathLength = pathElement.getTotalLength?.() || 1000;
        if (!isFinite(pathLength) || pathLength <= 0) {
          pathLength = 1000;
        }
      } catch (e) {
        pathLength = 1000;
      }
      
      // Start from the end point (target) and move to start (source)
      let startPoint = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      let endPoint = { x: 0, y: 0 };
      
      try {
        const startPt = pathElement.getPointAtLength?.(pathLength); // End of path
        const endPt = pathElement.getPointAtLength?.(0); // Start of path
        
        if (startPt && isFinite(startPt.x) && isFinite(startPt.y)) {
          startPoint = startPt;
        }
        if (endPt && isFinite(endPt.x) && isFinite(endPt.y)) {
          endPoint = endPt;
        }
      } catch (e) {
        // Use fallbacks
      }
      
      // Set initial position at the end of the path
      particle.setAttribute('cx', startPoint.x.toString());
      particle.setAttribute('cy', startPoint.y.toString());
      
      animate(particle, {
        scale: [0, 1, 0.5, 0],
        opacity: [0, 0.8, 0.6, 0],
        duration: 1200,
        delay: lineIndex * 50 + i * 150,
        ease: 'easeInQuad',
        update: (anim: any) => {
          try {
            // Reverse progress: start from 1 and go to 0
            const progress = 1 - Math.max(0, Math.min(1, anim.progress / 100));
            const point = pathElement.getPointAtLength?.(pathLength * progress);
            
            if (point && isFinite(point.x) && isFinite(point.y)) {
              particle.setAttribute('cx', point.x.toString());
              particle.setAttribute('cy', point.y.toString());
            } else {
              // Fallback to linear interpolation in reverse
              const x = startPoint.x + (endPoint.x - startPoint.x) * (1 - progress);
              const y = startPoint.y + (endPoint.y - startPoint.y) * (1 - progress);
              particle.setAttribute('cx', x.toString());
              particle.setAttribute('cy', y.toString());
            }
          } catch (e) {
            // Silent fallback
          }
        },
        complete: () => {
          particle.remove();
        }
      });
    }
  }, [theme]);

  // Helper function to create focused circuit-like paths that converge on target
  const createCircuitPath = (startX: number, startY: number, endX: number, endY: number): string => {
    // Ensure all coordinates are finite numbers
    if (!isFinite(startX) || !isFinite(startY) || !isFinite(endX) || !isFinite(endY)) {
      console.warn('CircuitAnimation: Invalid coordinates provided to createCircuitPath');
      return `M 0 0 L ${window.innerWidth / 2} ${window.innerHeight / 2}`;
    }
    
    const segments: string[] = [`M ${startX} ${startY}`];
    
    let currentX = startX;
    let currentY = startY;
    
    // Calculate direct path to target with minimal deviation
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    // Create 2-3 intermediate points that focus toward the target
    const steps = 2;
    
    for (let i = 0; i < steps; i++) {
      const progress = (i + 1) / (steps + 1);
      
      // Calculate intermediate points with slight offset toward target
      const targetX = startX + deltaX * progress;
      const targetY = startY + deltaY * progress;
      
      // Add minimal deviation to create circuit-like appearance but still focus on target
      const maxOffset = 50; // Reduced from 100 for more focused paths
      const offsetX = (Math.random() - 0.5) * maxOffset * (1 - progress); // Less deviation as we get closer
      const offsetY = (Math.random() - 0.5) * maxOffset * (1 - progress);
      
      const nextX = targetX + offsetX;
      const nextY = targetY + offsetY;
      
      // Create right-angle turns but favor direct path to target
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal movement dominant - go horizontal first
        segments.push(`L ${nextX} ${currentY}`);
        segments.push(`L ${nextX} ${nextY}`);
      } else {
        // Vertical movement dominant - go vertical first
        segments.push(`L ${currentX} ${nextY}`);
        segments.push(`L ${nextX} ${nextY}`);
      }
      
      currentX = nextX;
      currentY = nextY;
    }
    
    // Final direct segment to target (no deviation)
    if (Math.abs(endX - currentX) > Math.abs(endY - currentY)) {
      segments.push(`L ${endX} ${currentY}`);
      segments.push(`L ${endX} ${endY}`);
    } else {
      segments.push(`L ${currentX} ${endY}`);
      segments.push(`L ${endX} ${endY}`);
    }
    
    return segments.join(' ');
  };

  // Helper function to create circular paths around the target
  const createCircularPath = (startX: number, startY: number, centerX: number, centerY: number, radius: number): string => {
    // Ensure all coordinates are finite numbers
    if (!isFinite(startX) || !isFinite(startY) || !isFinite(centerX) || !isFinite(centerY) || !isFinite(radius)) {
      console.warn('CircuitAnimation: Invalid coordinates provided to createCircularPath');
      return `M ${centerX - 50} ${centerY} A 50 50 0 1 1 ${centerX + 50} ${centerY}`;
    }
    
    // Create a curved path that goes around the center point
    const controlRadius = radius * 1.5;
    const angle1 = Math.atan2(startY - centerY, startX - centerX);
    const angle2 = angle1 + Math.PI * 0.8; // Create an arc
    
    const controlX1 = centerX + Math.cos(angle1 + Math.PI * 0.3) * controlRadius;
    const controlY1 = centerY + Math.sin(angle1 + Math.PI * 0.3) * controlRadius;
    const controlX2 = centerX + Math.cos(angle2 - Math.PI * 0.3) * controlRadius;
    const controlY2 = centerY + Math.sin(angle2 - Math.PI * 0.3) * controlRadius;
    
    const endX = centerX + Math.cos(angle2) * radius;
    const endY = centerY + Math.sin(angle2) * radius;
    
    // Create a smooth curved path using cubic bezier
    return `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
  };



  // Add function to fade out circuit lines smoothly
  const fadeOutCircuitLines = useCallback(() => {
    if (persistentLines.current.length === 0) return;
    
    // Simply fade out all persistent lines
    persistentLines.current.forEach((line, index) => {
      const currentOpacity = parseFloat(line.getAttribute('opacity') || '0.3');
      const currentStrokeWidth = parseFloat(line.getAttribute('stroke-width') || '1.5');
      
      animate(line, {
        opacity: [currentOpacity, 0],
        strokeWidth: [currentStrokeWidth, 0],
        duration: 600,
        delay: index * 50,
        ease: 'easeOutQuad',
        complete: () => {
          line.remove();
        }
      });
    });
    
    // Clear the array after starting animations
    persistentLines.current = [];
  }, []);

  // Handle isActive state changes
  useEffect(() => {
    if (isActive) {
      // Only create lines when becoming active
      const timer = setTimeout(() => {
        createPersistentCircuitLines();
      }, 100);
      
      return () => clearTimeout(timer);
    } else if (persistentLines.current.length > 0) {
      // Fade out when becoming inactive
      fadeOutCircuitLines();
      
      // Stop any ongoing charging effects
      if (animationTimer.current) {
        animationTimer.current.pause();
        animationTimer.current = null;
      }
    }
  }, [isActive, createPersistentCircuitLines, fadeOutCircuitLines]);

  // Handle charging effects only when active
  useEffect(() => {
    if (isActive && chargeLevel > 0 && persistentLines.current.length > 0) {
      createChargingEffect();
      
      // Create timer for continuous charging effects
      animationTimer.current = createTimer({
        duration: 3000,
        loop: true,
        onLoop: createChargingEffect
      });
    }
    
    return () => {
      if (animationTimer.current) {
        animationTimer.current.pause();
      }
    };
  }, [isActive, chargeLevel, createChargingEffect]);

  // Handle window resize only when active
  useEffect(() => {
    const handleResize = () => {
      if (isActive && persistentLines.current.length > 0) {
        // Clear existing lines first
        persistentLines.current.forEach(line => line.remove());
        persistentLines.current = [];
        // Recreate lines with new dimensions
        createPersistentCircuitLines();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive, createPersistentCircuitLines]);

  // Update when theme changes (only if active)
  useEffect(() => {
    if (isActive && persistentLines.current.length > 0) {
      // Clear existing lines first
      persistentLines.current.forEach(line => line.remove());
      persistentLines.current = [];
      // Recreate lines with new theme colors
      createPersistentCircuitLines();
    }
  }, [theme, isActive, createPersistentCircuitLines]);

  return (
    <svg
      ref={svgRef}
      className="fixed inset-0 pointer-events-none z-0"
      width="100%"
      height="100%"
      style={{ overflow: 'hidden' }}
    />
  );
};
  
export default React.memo(CircuitAnimation);