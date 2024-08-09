// LocalVideo.jsx
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
}

const LocalVideo = forwardRef<HTMLVideoElement, LocalVideoProps>(
  ({ src, autoplay = false, loop = false, muted = true, controls = true, className = '', poster = '', preload = "auto" }, ref) => {
    return (
      <video
        ref={ref}
        src={src}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        controls={controls}
        className={className}
        poster={poster}
        preload={preload}
      >
        Your browser does not support the video tag.
      </video>
    );
  }
);

LocalVideo.displayName = 'LocalVideo';

export default LocalVideo;
