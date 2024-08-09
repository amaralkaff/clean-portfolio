"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import TickerDigit from "../app/components/TickerDigit";
import Footer from "./components/Footer";

// Dynamically load non-critical components
const ProjectList = dynamic(() => import("./components/ProjectList"), {
  ssr: false, // Disable server-side rendering
});
const MainContent = dynamic(() => import("./components/MainContent"), {
  ssr: false,
});

const Home = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const projects = [
    { name: "Bang Abah", year: 2024, video: "/video/bang-abah-mobile-app.webm" },
    { name: "Gomoku Game", year: 2023, video: "/video/gomoku-game.webm" },
    { name: "Parion", year: 2023, video: "/video/parion.webm" },
  ];

  useEffect(() => {
    const preloadVideos = async () => {
      const videoPromises = projects.map((project) => {
        return new Promise<void>((resolve) => {
          const video = document.createElement("video");
          video.src = project.video;
          video.onloadeddata = () => {
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
  }, []);

  if (!assetsLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <TickerDigit countTo={loadingProgress} duration={1000} />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-screen">
      <div className="order-2 md:order-1 w-full md:w-1/2 h-screen overflow-auto">
        <ProjectList onModalToggle={setModalVisible} />
      </div>
      <div className="order-1 md:order-2 w-full md:w-1/2">
        <MainContent isVisible={!modalVisible} />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
