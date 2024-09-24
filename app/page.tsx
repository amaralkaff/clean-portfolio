// File: app/page.tsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Footer from "./components/Footer";
import PhonkMusicPlayer from "./components/PhonkMusicPlayer";

const MainContent = dynamic(() => import("./components/MainContent"), {
  ssr: false,
});
const ProjectList = dynamic(() => import("./components/ProjectList"), {
  ssr: false,
});
const LottieWrapper = dynamic(() => import("./components/LottieWrapper"), {
  ssr: false,
});

const Home = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const projects = useMemo(
    () => [
      {
        name: "Bang Abah",
        year: 2024,
        video: "/video/bang-abah-mobile-app.webm",
      },
      { name: "Gomoku Game", year: 2023, video: "/video/gomoku-game.webm" },
      { name: "Parion", year: 2023, video: "/video/parion.webm" },
    ],
    []
  );

  useEffect(() => {
    const preloadVideos = async () => {
      const videoPromises = projects.map((project) => {
        return new Promise<void>((resolve) => {
          const video = document.createElement("video");
          video.src = project.video;
          video.preload = "auto";
          video.oncanplaythrough = () => {
            resolve();
            setLoadingProgress((prev) =>
              Math.min(prev + Math.floor(100 / projects.length), 100)
            );
          };
        });
      });
      await Promise.all(videoPromises);
      setLoadingProgress(100);
      setTimeout(() => setAssetsLoaded(true), 500);
    };
    preloadVideos();
  }, [projects]);

  if (!assetsLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <LottieWrapper />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-screen bg-gray-50">
      <div
        className={`order-2 md:order-1 w-full md:w-1/2 h-screen overflow-auto transition-all duration-500 ${
          modalVisible ? "md:w-full" : ""
        }`}
      >
        <ProjectList onModalToggle={setModalVisible} />
      </div>
      <div
        className={`order-1 md:order-2 w-full md:w-1/2 transition-all duration-500 ${
          modalVisible ? "hidden md:block" : ""
        }`}
      >
        <MainContent isVisible={!modalVisible} />
      </div>
      <Footer />
      <PhonkMusicPlayer />
    </div>
  );
};

export default Home;