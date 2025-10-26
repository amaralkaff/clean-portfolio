// components/LocalVideo.tsx
import React, { forwardRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const AnimeLoader = dynamic(() => import('./AnimeLoader'), {
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

    // Debug log to track src value
    console.log('LocalVideo rendered with src:', src, 'shouldLoad:', shouldLoad);

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

      let loadingTimeout: NodeJS.Timeout;

      const handleCanPlay = () => {
        console.log("Video can play, setting loading to false");
        setIsLoading(false);
        if (autoplay && videoElement.paused) {
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.log("Playback failed:", error);
              // Don't set error state for autoplay failures, just log it
            });
          }
        }
      };

      const handleLoadStart = () => {
        console.log("Video load start");
        setIsLoading(true);
        setHasError(false);
      };

      const handleError = (e: Event) => {
        console.error("Video loading error:", e);
        setIsLoading(false);
        setHasError(true);
      };

      const handleStalled = () => {
        console.log("Video loading stalled, attempting to continue...");
      };

      const handleProgress = () => {
        console.log("Video loading progress");
      };

      // Add timeout to prevent infinite loading
      loadingTimeout = setTimeout(() => {
        console.warn("Video loading timeout, forcing play attempt");
        setIsLoading(false);
        // Try to play anyway
        if (autoplay && videoElement.paused) {
          videoElement.play().catch(console.error);
        }
      }, 10000); // 10 second timeout

      // Add event listeners
      videoElement.addEventListener('loadstart', handleLoadStart);
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('error', handleError);
      videoElement.addEventListener('stalled', handleStalled);
      videoElement.addEventListener('progress', handleProgress);

      // Load the video
      console.log("Loading video with src:", src);
      videoElement.load();

      return () => {
        clearTimeout(loadingTimeout);
        videoElement.removeEventListener('loadstart', handleLoadStart);
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('error', handleError);
        videoElement.removeEventListener('stalled', handleStalled);
        videoElement.removeEventListener('progress', handleProgress);
      };
    }, [ref, src, lowResSrc, autoplay, shouldLoad]);

    return (
      <div ref={targetRef as React.RefObject<HTMLDivElement>} className="relative w-full h-full">
        {/* Loading State with AnimeLoader */}
        {isLoading && shouldLoad && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl overflow-hidden">
            <AnimeLoader />
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
        {shouldLoad && src && src.trim() !== '' ? (
          <video
            ref={ref}
            key={src} // Force remount when src changes
            src={src.trim() || undefined}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            controls={controls}
            className={`${className} rounded-2xl ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            poster={poster}
            preload={lazyLoad ? "none" : preload}
            playsInline
            webkit-playsinline="true"
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