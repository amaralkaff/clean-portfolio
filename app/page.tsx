"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import LottieLoader
const LottieLoader = dynamic(() => import("./components/CustomLottie"), { ssr: false });

// Optimized dynamic imports
const MainContent = dynamic(() => import("./components/MainContent"), {
});

const ProjectList = dynamic(() => import("./components/ProjectList"), {
});

// Lazy load non-critical components
const Footer = dynamic(() => import("./components/Footer"));
const PhonkMusicPlayer = dynamic(() => import("./components/PhonkMusicPlayer"));

const Home = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);


  useEffect(() => {
    const timer = setTimeout(() => {
      setAssetsLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!assetsLoaded) {
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