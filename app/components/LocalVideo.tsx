import React, { forwardRef, useEffect } from 'react';

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
  onClose?: () => void;
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
    onClose, 
  }, ref) => {

    const [isHighRes, setIsHighRes] = React.useState(false);

    const handleLoadedMetadata = () => {
      setIsHighRes(true);
    };

    useEffect(() => {
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement && onClose) {
          onClose();
        }
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
    }, [onClose]);

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
      >
        Your browser does not support the video tag.
      </video>
    );
  }
);

LocalVideo.displayName = 'LocalVideo';

export default LocalVideo;
