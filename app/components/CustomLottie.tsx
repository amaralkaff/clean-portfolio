import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import animationData from '../../public/loading.json';

const LottieLoader: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData,
      });

      return () => anim.destroy();
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div ref={containerRef} style={{ width: 200, height: 200 }} />
    </div>
  );
};

export default LottieLoader;