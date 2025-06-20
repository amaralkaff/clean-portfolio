"use client";
import React, { Suspense, useEffect, useState, useRef } from "react";
import { useAppViewModel } from "./viewModels/AppViewModel";
import { useTheme } from "./context/ThemeContext";

// Use next/dynamic instead of the import from 'next/dynamic'
import dynamic from "next/dynamic";

const AnimeLoader = dynamic(() => import("./components/AnimeLoader"), { 
  ssr: false
});
const MainContent = dynamic(() => import("./components/MainContent"), {
  ssr: false
});
const ProjectList = dynamic(() => import("./components/ProjectList"), {
  ssr: false
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

  // Immediate audio enablement on page load
  useEffect(() => {
    // Try to enable audio context immediately
    const enableAudioContext = async () => {
      try {
        // Create a silent audio context to bypass restrictions
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        // Try to play a silent audio to unlock audio playback
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0;
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.01);
        
        console.log("Audio context enabled successfully");
      } catch (error) {
        console.log("Audio context enablement failed");
      }
    };
    
    // Execute immediately
    enableAudioContext();
    
    // Also set up ultra-responsive interaction handler
    const immediateAudioEnable = () => {
      enableAudioContext();
    };
    
    // Multiple event types for maximum coverage
    const events = ['click', 'touchstart', 'keydown', 'mousemove', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, immediateAudioEnable, { 
        once: true, 
        passive: true,
        capture: true
      });
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, immediateAudioEnable);
      });
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
          <MainContent isVisible={!modalVisible} />
        </div>
      </Suspense>
      
      <Footer />
      <PhonkMusicPlayer autoPlay={true} />
    </div>
  );
};

export default Home;