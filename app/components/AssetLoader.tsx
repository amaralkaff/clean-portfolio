// File: app/components/AssetLoader.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const loadImages = async (imageUrls: string[]): Promise<boolean> => {
  const loadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        // Resolve instead of reject to continue loading other images
        resolve();
      };
    });
  };

  try {
    await Promise.all(imageUrls.map(url => loadImage(url)));
    return true;
  } catch (error) {
    console.error('Error loading images:', error);
    return false;
  }
};

const AssetLoader: React.FC<{ onLoadComplete: () => void }> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);

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
      '/logos/nextjs.png',
      '/logos/mongodb.png',
      '/logos/xendit.png',
      '/logos/openai.png'
    ];

    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const load = async () => {
      // Start loading animation
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        if (mounted && currentProgress < 90) {
          currentProgress += 10;
          setProgress(currentProgress);
        }
      }, 100);

      // Load all images with retry logic
      const loadWithRetry = async () => {
        const failed: string[] = [];
        
        for (const url of logoUrls) {
          try {
            await new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = () => {
                failed.push(url);
                resolve(); // Resolve to continue with other images
              };
              img.src = url;
            });
          } catch {
            failed.push(url);
          }
        }

        if (failed.length > 0 && retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying failed images (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          return loadWithRetry();
        }

        return failed;
      };

      const failedUrls = await loadWithRetry();
      setFailedImages(failedUrls);

      // Complete loading
      clearInterval(progressInterval);
      if (mounted) {
        setProgress(100);
        setTimeout(() => {
          onLoadComplete();
        }, 500);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [onLoadComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-black"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className="mt-4 text-gray-600">Loading assets... {progress}%</span>
    </motion.div>
  );
};

export default AssetLoader;