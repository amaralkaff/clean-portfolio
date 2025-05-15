"use client";
import React, { Suspense, useEffect } from "react";
import { useAppViewModel } from "./viewModels/AppViewModel";

// Use next/dynamic instead of the import from 'next/dynamic'
import dynamic from "next/dynamic";

const LottieLoader = dynamic(() => import("./components/CustomLottie"), { 
  ssr: false 
});
const MainContent = dynamic(() => import("./components/MainContent"));
const ProjectList = dynamic(() => import("./components/ProjectList"));
const Footer = dynamic(() => import("./components/Footer"));
const PhonkMusicPlayer = dynamic(() => import("./components/PhonkMusicPlayer"));

const Home = () => {
  const [state, actions] = useAppViewModel();
  const { modalVisible, isLoading } = state;
  const { setModalVisible } = actions;

  // This effect helps enable auto-play by adding a page-level click handler
  useEffect(() => {
    // Add a one-time click handler to the entire document
    // This helps with browser auto-play policies
    const enableAudio = () => {
      // This click will trigger the audio to play
      // through the event listeners in PhonkMusicViewModel
      document.removeEventListener('click', enableAudio);
    };
    
    document.addEventListener('click', enableAudio, { once: true });
    
    return () => {
      document.removeEventListener('click', enableAudio);
    };
  }, []);

  if (isLoading) {
    return <LottieLoader />;
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-screen bg-gray-50">
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