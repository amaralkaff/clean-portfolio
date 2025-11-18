// File: app/components/AssetLoader.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const loadImages = async (imageUrls: string[]): Promise<string[]> => {
  const loadImage = (url: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      
      const handleLoad = () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
        resolve();
      };

      const handleError = () => {
        console.error(`Failed to load image: ${url}`);
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
        resolve(); // Resolve instead of reject to continue loading other images
      };

      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
      
      // Add cache busting parameter to prevent caching issues
      img.src = `${url}?t=${Date.now()}`;
    });
  };

  const failedUrls: string[] = [];
  for (const url of imageUrls) {
    try {
      await loadImage(url);
    } catch {
      failedUrls.push(url);
    }
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
      // Start loading animation
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        if (mounted && currentProgress < 90) {
          currentProgress += 10;
          setProgress(currentProgress);
        }
      }, 100);

      try {
        const failedUrls = await loadImages(logoUrls);
        
        if (mounted) {
          setFailedImages(failedUrls);
          
          if (failedUrls.length > 0 && retryCount < maxRetries) {
            console.log(`Retrying failed images (attempt ${retryCount + 1}/${maxRetries})`);
            setRetryCount(prev => prev + 1);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            await load(); // Retry loading
            return;
          }
        }
      } catch (error) {
        console.error('Error during image loading:', error);
      } finally {
        if (mounted) {
          clearInterval(progressInterval);
          setProgress(100);
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
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        Loading assets... {progress}%
        {failedImages.length > 0 && retryCount < maxRetries && (
          <span className={`block text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
            Retrying failed images... ({retryCount + 1}/{maxRetries})
          </span>
        )}
      </span>
    </motion.div>
  );
};

export default React.memo(AssetLoader);