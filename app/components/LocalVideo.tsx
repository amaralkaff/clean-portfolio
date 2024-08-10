// components/LocalVideo.tsx
import React, { forwardRef } from 'react';

interface LocalVideoProps {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  poster?: string;
  preload?: "none" | "metadata" | "auto";
  lowResSrc?: string;
}

const LocalVideo = forwardRef<HTMLVideoElement, LocalVideoProps>(
  ({
    src,
    autoplay = false,
    loop = false,
    muted = true,
    controls = true,
    className = '',
    poster = '',
    preload = "metadata",
    lowResSrc,
  }, ref) => {

    return (
      <video
        ref={ref}
        src={lowResSrc || src}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        controls={controls}
        className={className}
        poster={poster}
        preload={preload}
        playsInline  // Disable fullscreen on iPhone
        webkit-playsinline  // Additional iPhone support
      >
        Your browser does not support the video tag.
      </video>
    );
  }
);

LocalVideo.displayName = 'LocalVideo';

export default LocalVideo;