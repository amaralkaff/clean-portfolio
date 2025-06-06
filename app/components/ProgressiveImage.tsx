import React, { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  lowQualitySrc?: string;
  lazyLoad?: boolean;
  style?: React.CSSProperties;
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  lowQualitySrc,
  lazyLoad = true,
  style,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazyLoad);
  const [hasError, setHasError] = useState(false);
  const { targetRef, isIntersecting, hasIntersected } = useIntersectionObserver({
    rootMargin: '100px',
    threshold: 0.1,
  });

  // Update shouldLoad when intersection occurs
  useEffect(() => {
    if (lazyLoad && (isIntersecting || hasIntersected)) {
      setShouldLoad(true);
    }
  }, [isIntersecting, hasIntersected, lazyLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  if (!shouldLoad) {
    return (
      <div
        ref={targetRef as React.RefObject<HTMLDivElement>}
        className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse rounded`}
        style={{ width, height, ...style }}
      />
    );
  }

  return (
    <div ref={targetRef as React.RefObject<HTMLDivElement>} className="relative" style={{ width, height }}>
      {/* Low quality placeholder */}
      {lowQualitySrc && !isLoaded && !hasError && (
        <Image
          src={lowQualitySrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} filter blur-sm transition-opacity duration-300`}
          style={style}
          onError={handleError}
        />
      )}

      {/* Loading skeleton */}
      {!lowQualitySrc && !isLoaded && !hasError && (
        <div
          className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse rounded absolute inset-0`}
          style={style}
        />
      )}

      {/* Main image */}
      {shouldLoad && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={style}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazyLoad ? 'lazy' : 'eager'}
          priority={!lazyLoad}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyBhtI"
        />
      )}

      {/* Error state */}
      {hasError && (
        <div
          className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded`}
          style={{ width, height, ...style }}
        >
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default memo(ProgressiveImage);