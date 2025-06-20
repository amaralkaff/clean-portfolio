"use client";

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { animate, createTimeline, createTimer, stagger, utils } from 'animejs';

interface CreatureAnimationProps {
  className?: string;
  readabilityMode?: boolean;
}

const CreatureAnimation: React.FC<CreatureAnimationProps> = ({ className, readabilityMode = true }) => {
  const creatureRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [isHoveringText, setIsHoveringText] = useState(false);

  useEffect(() => {
    if (!creatureRef.current || !wrapperRef.current) return;

    const creatureEl = creatureRef.current;
    const viewport = { w: window.innerWidth * .5, h: window.innerHeight * .5 };
    const cursor = { x: 0, y: 0 };
    const rows = 13;
    const grid = [rows, rows];
    const from = 'center';
    const scaleStagger = stagger([2, 5], { ease: 'inQuad', grid, from });
    const opacityStagger = stagger([1, .1], { grid, from }); // Keep original opacity values

    // Clear existing children
    creatureEl.innerHTML = '';

    for (let i = 0; i < (rows * rows); i++) {
      creatureEl.appendChild(document.createElement('div'));
    }

    const particleEls = creatureEl.querySelectorAll('div');

    utils.set(creatureEl, {
      width: rows * 10 + 'em',
      height: rows * 10 + 'em'
    });

    // Get CSS custom properties for theme colors
    const rootStyles = getComputedStyle(document.documentElement);
    const textColor = rootStyles.getPropertyValue('--text-primary').trim();
    const isDark = theme === 'dark';

    utils.set(particleEls, {
      x: 0,
      y: 0,
      scale: scaleStagger,
      opacity: opacityStagger,
      background: stagger([80, 20], { 
        grid, 
        from,
        modifier: v => isDark 
          ? `hsl(200, 30%, ${v}%)` 
          : `hsl(220, 25%, ${Math.max(100 - v, 20)}%)`
      }),
      boxShadow: stagger([8, 1], { 
        grid, 
        from,
        modifier: v => `0px 0px ${utils.round(v, 0)}em 0px ${textColor}40`
      }),
      zIndex: stagger([rows * rows, 1], { grid, from, modifier: v => utils.round(v, 0) }),
    });

    const pulse = () => {
      animate(particleEls, {
        keyframes: [
          {
            scale: 5,
            opacity: 1,
            delay: stagger(90, { start: 1650, grid, from }),
            duration: 150,
          }, {
            scale: scaleStagger,
            opacity: opacityStagger,
            ease: 'inOutQuad',
            duration: 600
          }
        ],
      });
    };

    const mainLoop = createTimer({
      frameRate: 30, // Faster frame rate for smoother following
      onUpdate: () => {
        animate(particleEls, {
          x: cursor.x,
          y: cursor.y,
          delay: stagger(20, { grid, from }), // Faster delay
          duration: stagger(60, { start: 300, ease: 'inQuad', grid, from }), // Much faster duration
          ease: 'inOut',
          composition: 'blend', // This allows the animations to overlap nicely
        });
      }
    });

    const autoMove = createTimeline()
    .add(cursor, {
      x: [-viewport.w * .45, viewport.w * .45],
      modifier: x => x + Math.sin(mainLoop.currentTime * .0007) * viewport.w * .5,
      duration: 3000,
      ease: 'inOutExpo',
      alternate: true,
      loop: true,
      onBegin: pulse,
      onLoop: pulse,
    }, 0)
    .add(cursor, {
      y: [-viewport.h * .45, viewport.h * .45],
      modifier: y => y + Math.cos(mainLoop.currentTime * .00012) * viewport.h * .5,
      duration: 1000,
      ease: 'inOutQuad',
      alternate: true,
      loop: true,
    }, 0);

    const manualMovementTimeout = createTimer({
      duration: 1500,
      onComplete: () => autoMove.play(),
    });

    const followPointer = (e: MouseEvent | TouchEvent) => {
      const event = e.type === 'touchmove' ? (e as TouchEvent).touches[0] : e as MouseEvent;
      cursor.x = event.pageX - viewport.w;
      cursor.y = event.pageY - viewport.h;
      autoMove.pause();
      manualMovementTimeout.restart();
    };

    document.addEventListener('mousemove', followPointer);
    document.addEventListener('touchmove', followPointer);

    // Start auto movement
    autoMove.play();

    return () => {
      document.removeEventListener('mousemove', followPointer);
      document.removeEventListener('touchmove', followPointer);
      mainLoop.pause();
      autoMove.pause();
      manualMovementTimeout.pause();
    };
  }, [theme]); // Remove readabilityMode and isHoveringText dependencies to prevent resets

  // Separate effect for smooth opacity transitions without resetting the animation
  useEffect(() => {
    if (!creatureRef.current || !readabilityMode) return;

    const particleEls = creatureRef.current.querySelectorAll('div');
    if (particleEls.length === 0) return;

    // Smoothly animate opacity changes without disrupting the main animation
    const grid = [13, 13];
    const from = 'center';
    const originalOpacityStagger = stagger([1, .1], { grid, from });
    
    animate(particleEls, {
      opacity: (el: any, i: number) => {
        const originalOpacity = typeof originalOpacityStagger === 'function' 
          ? originalOpacityStagger(el, i) 
          : originalOpacityStagger;
        const opacity = typeof originalOpacity === 'number' ? originalOpacity : 1;
        return isHoveringText ? opacity * 0.3 : opacity;
      },
      duration: 300,
      ease: 'easeInOutQuad',
    });
  }, [isHoveringText, readabilityMode]);

  // Detect when mouse cursor is hovering over text elements
  useEffect(() => {
    if (!readabilityMode) return;

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if the target or any parent is a text element
      const isTextElement = target.closest('[data-text-content], .text-center, h1, h2, h3, p, span, a, button') !== null;
      
      // Also check if the element has text content
      const hasTextContent = target.textContent && target.textContent.trim().length > 0;
      
      setIsHoveringText(Boolean(isTextElement && hasTextContent));
    };

    const handleMouseOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const relatedTarget = event.relatedTarget as HTMLElement;
      
      // Only set to false if we're not moving to another text element
      if (!relatedTarget || !relatedTarget.closest('[data-text-content], .text-center, h1, h2, h3, p, span, a, button')) {
        setIsHoveringText(false);
      }
    };

    // Add global mouse event listeners
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    
    // Also listen for mouse leave on the document to ensure we reset
    document.addEventListener('mouseleave', () => setIsHoveringText(false));

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseleave', () => setIsHoveringText(false));
    };
  }, [readabilityMode]);

  return (
    <div 
      ref={wrapperRef}
      id="creature-wrapper"
      className={`fixed inset-0 pointer-events-none z-0 transition-all duration-300 ease-out ${className}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        filter: readabilityMode && isHoveringText ? 'blur(0.5px)' : 'none',
        transform: readabilityMode && isHoveringText ? 'scale(0.98)' : 'scale(1)',
      }}
    >
      <div 
        ref={creatureRef}
        id="creature"
        style={{
          fontSize: '.15vh', // Smaller than original .2vh
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '120em', // Smaller than original 150em
          height: '120em',
          flexWrap: 'wrap',
        }}
      >
      </div>
    </div>
  );
};

export default CreatureAnimation;