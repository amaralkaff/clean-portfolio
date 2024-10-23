// File: app/components/AssetLoader.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const loadImages = async (imageUrls: string[]): Promise<boolean> => {
  const loadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => reject();
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

    const load = async () => {
      // Start loading animation
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        if (mounted && currentProgress < 90) {
          currentProgress += 10;
          setProgress(currentProgress);
        }
      }, 100);

      // Load all images
      await loadImages(logoUrls);

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