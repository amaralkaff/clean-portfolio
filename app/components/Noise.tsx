'use client';

import { useRef, useEffect } from 'react';

interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
}

const Noise = ({
  patternSize = 250,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 15,
}: NoiseProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = patternSize * patternScaleX;
    canvas.height = patternSize * patternScaleY;

    // Generate noise pattern once
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = patternAlpha;
    }

    ctx.putImageData(imageData, 0, 0);

    // Set as background image
    const dataUrl = canvas.toDataURL();
    container.style.backgroundImage = `url(${dataUrl})`;
    container.style.backgroundRepeat = 'repeat';

    // Animation loop
    let frame = 0;
    let animationId: number;

    const loop = () => {
      if (frame % patternRefreshInterval === 0) {
        // Shift background position randomly to create static effect
        const x = Math.floor(Math.random() * patternSize);
        const y = Math.floor(Math.random() * patternSize);
        container.style.backgroundPosition = `${x}px ${y}px`;
      }
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{
        opacity: 1,
      }}
    />
  );
};

export default Noise;
