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
    controls = false,  // Controls set to false
    className = '',
    poster = '',
    preload = "metadata",
    lowResSrc,
  }, ref) => {

    const [isHighRes, setIsHighRes] = React.useState(false);

    const handleLoadedMetadata = () => {
      setIsHighRes(true);
    };

    const handlePlay = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      // Disable fullscreen on mobile
      const videoElement = e.currentTarget;
      videoElement.setAttribute('playsinline', 'true');
      videoElement.setAttribute('webkit-playsinline', 'true');
    };

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
        onPlay={handlePlay}
      >
        Your browser does not support the video tag.
      </video>
    );
  }
);

LocalVideo.displayName = 'LocalVideo';

export default LocalVideo;
