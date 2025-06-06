// components/LocalVideo.tsx
import React, { forwardRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const LottieLoader = dynamic(() => import('./CustomLottie'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-[var(--bg-card)] rounded-lg animate-pulse">
      <div className="w-10 h-10 border-4 border-[var(--text-secondary)] border-t-[var(--text-primary)] rounded-full animate-spin" />
    </div>
  ),
});

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

    useEffect(() => {
      const videoElement = (ref as React.RefObject<HTMLVideoElement>)?.current;
      if (!videoElement || !shouldLoad) return;

      setIsLoading(true);
      setHasError(false);

      const handleLoadedData = () => {
        setIsLoading(false);
        if (autoplay) {
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.log("Playback failed:", error);
              setHasError(true);
            });
          }
        }
      };

      const handleError = () => {
        setIsLoading(false);
        setHasError(true);
      };

      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('error', handleError);

      // Force reload when src changes
      videoElement.load();

      return () => {
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('error', handleError);
      };
    }, [ref, src, autoplay, shouldLoad]);

    return (
      <div ref={targetRef as React.RefObject<HTMLDivElement>} className="relative w-full h-full">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <LottieLoader />
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)] rounded-lg">
            <div className="text-center text-[var(--text-primary)]">
              <svg 
                className="mx-auto h-12 w-12 text-[var(--text-secondary)]"
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
              <p className="mt-2 text-[var(--text-primary)]">Failed to load video</p>
            </div>
          </div>
        )}

        {/* Video Element */}
        {shouldLoad ? (
          <video
            ref={ref}
            key={src} // Force remount when src changes
            src={lowResSrc || src}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            controls={controls}
            className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            poster={poster}
            preload={lazyLoad ? "none" : preload}
            playsInline
            webkit-playsinline="true"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg`} />
        )}
      </div>
    );
  }
);

LocalVideo.displayName = 'LocalVideo';

export default LocalVideo;