// components/LocalVideo.tsx
import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';


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
  lazyLoad?: boolean;
}

const LocalVideo = forwardRef<HTMLVideoElement, LocalVideoProps>(
  ({
    src,
    autoplay = true,
    loop = true,
    muted = true,
    controls = false,
    className = '',
    poster = '',
    preload = "auto",
    lowResSrc,
    lazyLoad = true,
  }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(!lazyLoad);
    const [autoplayBlocked, setAutoplayBlocked] = useState(false);
    const { targetRef, isIntersecting, hasIntersected } = useIntersectionObserver({
      rootMargin: '200px',
      threshold: 0.1,
    });

    // Update shouldLoad when intersection occurs
    useEffect(() => {
      if (lazyLoad && (isIntersecting || hasIntersected)) {
        setShouldLoad(true);
      }
    }, [isIntersecting, hasIntersected, lazyLoad]);

    // Attempt to play video with retry logic
    const attemptPlay = useCallback((videoElement: HTMLVideoElement) => {
      if (!videoElement || !autoplay) return;

      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAutoplayBlocked(false);
          })
          .catch((error) => {
            if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
              console.log("Autoplay blocked by browser policy, waiting for user interaction:", error);
              setAutoplayBlocked(true);
            } else {
              console.error("Video play error:", error);
            }
          });
      }
    }, [autoplay]);

    useEffect(() => {
      const videoElement = (ref as React.RefObject<HTMLVideoElement>)?.current;
      if (!videoElement || !shouldLoad) return;

      setIsLoading(true);
      setHasError(false);

      if (muted) {
        videoElement.defaultMuted = true;
        videoElement.muted = true;
      }

      const handleLoadedData = () => {
        setIsLoading(false);
        // Attempt autoplay after video is loaded
        attemptPlay(videoElement);
      };

      const handleCanPlay = () => {
        // Additional attempt when video can play
        attemptPlay(videoElement);
      };

      const handleError = () => {
        setIsLoading(false);
        setHasError(true);
      };

      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('error', handleError);

      // Force reload when src changes
      videoElement.load();

      return () => {
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('error', handleError);
      };
    }, [ref, src, shouldLoad, attemptPlay]);

    // Enhanced user interaction handler for autoplay fallback
    const handleUserInteraction = useCallback(() => {
      const videoElement = (ref as React.RefObject<HTMLVideoElement>)?.current;
      if (videoElement && videoElement.paused && autoplay) {
        attemptPlay(videoElement);
      }
    }, [ref, autoplay, attemptPlay]);

    // Set up global interaction listeners for autoplay retry
    useEffect(() => {
      if (!autoplayBlocked) return;

      const videoElement = (ref as React.RefObject<HTMLVideoElement>)?.current;
      if (!videoElement) return;

      // Retry autoplay on any user interaction
      const events = ['click', 'touchstart', 'keydown'];
      const retryPlay = () => {
        if (videoElement.paused) {
          attemptPlay(videoElement);
        }
      };

      events.forEach(event => {
        document.addEventListener(event, retryPlay, { once: true, passive: true });
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, retryPlay);
        });
      };
    }, [autoplayBlocked, ref, attemptPlay]);

    return (
      <div
        ref={targetRef as React.RefObject<HTMLDivElement>}
        className="relative w-full h-full"
        onClick={handleUserInteraction}
      >
        {/* Loading State with AnimeLoader */}


        {/* Autoplay Blocked Indicator */}
        {autoplayBlocked && !isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl cursor-pointer z-10 transition-opacity duration-300 hover:bg-black/50"
            onClick={handleUserInteraction}
          >
            <div className="text-center text-white">
              <svg
                className="mx-auto h-16 w-16 text-white drop-shadow-lg animate-pulse"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-2 text-sm drop-shadow-md">Click to play</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-500/20 via-red-400/10 to-transparent backdrop-blur-xl rounded-2xl border border-red-300/20">
            <div className="text-center text-white bg-gradient-to-br from-red-500/30 via-red-400/20 to-red-300/10 backdrop-blur-md rounded-xl p-6 border border-red-300/30">
              <svg
                className="mx-auto h-12 w-12 text-red-300 drop-shadow-lg"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="mt-2 text-white drop-shadow-md">Failed to load video</p>
            </div>
          </div>
        )}

        {/* Video Element */}
        {shouldLoad && (src || lowResSrc) ? (
          <video
            ref={ref}
            key={src} // Force remount when src changes
            src={lowResSrc || src}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            controls={controls}
            className={`${className} rounded-2xl ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            poster={poster}
            preload={lazyLoad ? "none" : preload}
            playsInline={true}
            disablePictureInPicture
            controlsList="nodownload"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className={`${className}`} />
        )}
      </div>
    );
  }
);

LocalVideo.displayName = 'LocalVideo';

export default React.memo(LocalVideo);