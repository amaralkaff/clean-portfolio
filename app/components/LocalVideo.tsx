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
  lowResSrc?: string; // Add a prop for a low-resolution video source
  onClose?: () => void; // Add an onClose prop to handle modal close
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
    preload = "metadata", // Default to metadata for faster initial load
    lowResSrc,
    onClose, // Receive the onClose prop
  }, ref) => {

    const [isHighRes, setIsHighRes] = React.useState(false);

    const handleLoadedMetadata = () => {
      // Optional: Load high-res version after the low-res is loaded
      setIsHighRes(true);
    };

    useEffect(() => {
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement && onClose) {
          onClose(); // Call the onClose prop when exiting fullscreen
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
        src={isHighRes ? src : (lowResSrc || src)} // Load low-res first if available
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
