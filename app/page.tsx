"use client";
import React, { Suspense, useEffect, useState, useRef } from "react";
import { useAppViewModel } from "./viewModels/AppViewModel";
import { useTheme } from "./context/ThemeContext";

// Use next/dynamic for lazy loading heavy components
import dynamic from "next/dynamic";

// Lazy load heavy components with AnimeLoader fallbacks
const AnimeLoader = dynamic(() => import("./components/AnimeLoader"), { 
  ssr: false
});
const MainContent = dynamic(() => import("./components/MainContent"), {
  ssr: false,
  loading: () => <AnimeLoader />
});
const ProjectList = dynamic(() => import("./components/ProjectList"), {
  ssr: false,
  loading: () => <AnimeLoader />
});
const Footer = dynamic(() => import("./components/Footer"), {
  ssr: false
});
const PhonkMusicPlayer = dynamic(() => import("./components/PhonkMusicPlayer"), {
  ssr: false
});
const ThemeToggle = dynamic(() => import("./components/ThemeToggle"), {
  ssr: false
});

const Home = () => {
  const [state, actions] = useAppViewModel();
  const { modalVisible, isLoading } = state;
  const { setModalVisible } = actions;
  const { theme } = useTheme();
  
  // Track if hovering over the main app area
  const [isHoveringApp, setIsHoveringApp] = useState(false);
  const appFadeOutTimer = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (appFadeOutTimer.current) {
        clearTimeout(appFadeOutTimer.current);
      }
    };
  }, []);

  // Simple audio context initialization
  useEffect(() => {
    const enableAudioOnInteraction = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      } catch (error) {
        console.log('Audio context setup failed:', error);
      }
    };
    
    // Single interaction listener for audio context
    document.addEventListener('click', enableAudioOnInteraction, { once: true, passive: true });
    
    return () => {
      document.removeEventListener('click', enableAudioOnInteraction);
    };
  }, []);

  if (isLoading) {
    return <AnimeLoader />;
  }

  return (
    <div 
      className="flex flex-col md:flex-row justify-center items-center min-h-screen pt-14 md:pt-0"
      onMouseEnter={() => {
        // Cancel any pending fade out when entering the app area
        if (appFadeOutTimer.current) {
          clearTimeout(appFadeOutTimer.current);
          appFadeOutTimer.current = null;
        }
        setIsHoveringApp(true);
      }}
      onMouseLeave={() => {
        // Add delay before deactivating circuit when leaving the entire app
        appFadeOutTimer.current = setTimeout(() => {
          setIsHoveringApp(false);
        }, 1500); // 1.5 second delay when leaving the entire app area
      }}
    >
      <ThemeToggle />
      
      <Suspense fallback={<AnimeLoader />}>
        <div
          className={`order-2 md:order-1 w-full md:w-1/2 h-screen overflow-auto transition-all duration-500 ${
            modalVisible ? "md:w-full" : ""
          }`}
        >
          <ProjectList onModalToggle={setModalVisible} isAppHovered={isHoveringApp} />
        </div>
      </Suspense>
      
      <Suspense fallback={<AnimeLoader />}>
        <div
          className={`order-1 md:order-2 w-full md:w-1/2 transition-all duration-500 ${
            modalVisible ? "hidden md:block" : ""
          }`}
        >
          <MainContent isVisible={!modalVisible} priority={true} />
        </div>
      </Suspense>
      
      <Footer />
      <PhonkMusicPlayer autoPlay={true} />
    </div>
  );
};

export default Home;