"use client";
import React, { Suspense, useEffect } from "react";
import { useAppViewModel } from "./viewModels/AppViewModel";
import { useTheme } from "./context/ThemeContext";

// Use next/dynamic instead of the import from 'next/dynamic'
import dynamic from "next/dynamic";

const LottieLoader = dynamic(() => import("./components/CustomLottie"), { 
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center">Loading...</div>
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
    return <LottieLoader />;
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-screen pt-14 md:pt-0">
      <ThemeToggle />
      
      <Suspense fallback={<LottieLoader />}>
        <div
          className={`order-2 md:order-1 w-full md:w-1/2 h-screen overflow-auto transition-all duration-500 ${
            modalVisible ? "md:w-full" : ""
          }`}
        >
          <ProjectList onModalToggle={setModalVisible} />
        </div>
      </Suspense>
      
      <Suspense fallback={<LottieLoader />}>
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