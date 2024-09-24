// File: app/components/LottieWrapper.tsx
import React from 'react';
import Lottie from 'react-lottie';
import animationData from '../../public/loading.json'; // Ensure this path is correct

interface LottieWrapperProps {
  width?: number;
  height?: number;
}

const LottieWrapper: React.FC<LottieWrapperProps> = ({ width = 200, height = 200 }) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return <Lottie options={defaultOptions} height={height} width={width} />;
};

export default LottieWrapper;