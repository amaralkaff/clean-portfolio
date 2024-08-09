"use client";
import React, { forwardRef } from 'react';

interface LocalVideoProps {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
}

const LocalVideo = forwardRef<HTMLVideoElement, LocalVideoProps>(({ src, autoplay = false, loop = false, muted = false, className = '' }, ref) => {
  return (
    <video
      ref={ref}
      src={src}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      className={`w-full h-full ${className}`}
    >
      Your browser does not support the video tag.
    </video>
  );
});

LocalVideo.displayName = 'LocalVideo';

export default LocalVideo;
