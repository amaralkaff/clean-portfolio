import React, { forwardRef, useEffect, useState } from 'react';

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
    controls = false,  // Controls are now disabled by default
    className = '',
    poster = '',
    preload = "metadata",
    lowResSrc,
  }, ref) => {

    const [isHighRes, setIsHighRes] = useState(false);

    const handleLoadedMetadata = () => {
      setIsHighRes(true);
    };

    useEffect(() => {
      const videoElement = ref?.current as HTMLVideoElement;

      // Disable fullscreen on iOS
      if (videoElement) {
        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('webkit-playsinline', 'true');
      }
    }, [ref]);

    return (
      <video
        ref={ref}
        src={isHighRes ? src : (lowResSrc || src)}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        controls={controls}
        className={className}
        poster={poster}
        preload={preload}
        onLoadedMetadata={handleLoadedMetadata}
        playsInline  // This will help prevent fullscreen on iOS
        webkit-playsinline  // Specific to Safari
      >
        Your browser does not support the video tag.
      </video>
    );
  }
);

LocalVideo.displayName = 'LocalVideo';

export default LocalVideo;
