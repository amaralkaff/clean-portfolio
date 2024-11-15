"use client";
import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

const LottieLoader = dynamic(() => import("./components/CustomLottie"), { 
  ssr: false 
});
const MainContent = dynamic(() => import("./components/MainContent"));
const ProjectList = dynamic(() => import("./components/ProjectList"));
const Footer = dynamic(() => import("./components/Footer"));
const PhonkMusicPlayer = dynamic(() => import("./components/PhonkMusicPlayer"));

const Home = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple loading timeout for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2 seconds is enough for a polished feel

    return () => clearTimeout(timer);
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
      <PhonkMusicPlayer />
    </div>
  );
};

export default Home;