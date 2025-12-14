// File: app/components/AssetLoader.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Noise from './Noise';
import CountUp from './CountUp';
import { useTheme } from '../context/ThemeContext';

const loadImages = async (
  imageUrls: string[],
  onProgress: (loaded: number, total: number) => void
): Promise<string[]> => {
  const loadImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();

      const handleLoad = () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
        resolve(true);
      };

      const handleError = () => {
        console.error(`Failed to load image: ${url}`);
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
        resolve(false);
      };

      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);

      // Add cache busting parameter to prevent caching issues
      img.src = `${url}?t=${Date.now()}`;
    });
  };

  const failedUrls: string[] = [];
  let loadedCount = 0;

  for (const url of imageUrls) {
    const success = await loadImage(url);
    if (!success) {
      failedUrls.push(url);
    }
    loadedCount++;
    onProgress(loadedCount, imageUrls.length);
  }
  return failedUrls;
};

const AssetLoader: React.FC<{ onLoadComplete: () => void }> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const { theme } = useTheme();

  useEffect(() => {
    const logoUrls = [
      '/logos/react.png',
      '/logos/typescript.png',
      '/logos/firebase.png',
      '/logos/mapbox.png',
      '/logos/bmkg.png',
      '/logos/redux.png',
      '/logos/socket.png',
      '/logos/googlemap.png',
      '/logos/javascript.png',
      '/logos/nextjs.svg',
      '/logos/mongodb.png',
      '/logos/xendit.png',
      '/logos/openai.png'
    ];

    let mounted = true;

    const load = async () => {
      try {
        const failedUrls = await loadImages(logoUrls, (loaded, total) => {
          if (mounted) {
            const percentage = Math.round((loaded / total) * 100);
            setProgress(percentage);
          }
        });

        if (mounted) {
          setFailedImages(failedUrls);

          if (failedUrls.length > 0 && retryCount < maxRetries) {
            console.log(`Retrying failed images (attempt ${retryCount + 1}/${maxRetries})`);
            setRetryCount((prev) => prev + 1);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
            await load(); // Retry loading
            return;
          }

          setTimeout(() => {
            onLoadComplete();
          }, 500);
        }
      } catch (error) {
        console.error('Error during image loading:', error);
        if (mounted) {
          setTimeout(() => {
            onLoadComplete();
          }, 500);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [onLoadComplete, retryCount]);

  return (
    <motion.div
      className={`fixed inset-0 bg-[var(--bg-gradient-light-1)] z-50 flex flex-col items-center justify-center`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Noise patternAlpha={theme === 'dark' ? 8 : 15} />
      <div className="relative z-10 flex flex-col items-center">
        <CountUp
          to={progress}
          duration={0.01}
          className={`text-6xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}
        />
        <span className={`text-2xl mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>%</span>
        {failedImages.length > 0 && retryCount < maxRetries && (
          <span className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Retrying... ({retryCount + 1}/{maxRetries})
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(AssetLoader);