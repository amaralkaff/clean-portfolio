"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LocalVideo from './LocalVideo';

const projects = [
  { name: 'Bang Abah', year: 2024, video: '/video/bang-abah-mobile-app.mp4' },
  { name: 'iNES', year: 2024, video: '/video/ines.mp4' },
  { name: 'SLAM', year: 2023, video: '/video/slam.mp4' },
];

const modalVariants = {
  hidden: { opacity: 0, transition: { ease: "easeOut", duration: 0.5 } },
  visible: { opacity: 1, transition: { ease: "easeIn", duration: 0.5 } },
  exit: { opacity: 0, transition: { ease: "easeOut", duration: 0.5 } },
};

const ProjectList: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClick = (index: number) => {
    setSelectedProject(index);
  };

  const handleClose = () => {
    setSelectedProject(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      handleClose();
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleClose();
    }
  };

  useEffect(() => {
    if (selectedProject !== null) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside, handleKeyDown, selectedProject]);

  return (
    <div className="relative w-full md:w-1/2 max-w-4xl mx-auto p-6 md:order-1 order-2">
      <ul className="space-y-4 md:space-y-6">
        {projects.map((project, index) => (
          <motion.li
            key={index}
            className="flex justify-between items-center p-4 rounded-full cursor-pointer transition-transform hover:shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => handleClick(index)}
          >
            <span className="text-black text-md">{project.name}</span>
            <span className="text-gray-400 text-sm md:text-base">{project.year}</span>
          </motion.li>
        ))}
      </ul>
      <AnimatePresence>
        {selectedProject !== null && (
          <motion.div
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md transition-opacity duration-300 ease-in-out"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <div
              ref={modalRef}
              className="relative w-2/3 md:w-1/2 lg:w-1/3 bg-white p-4 rounded-lg shadow-lg"
            >
              <LocalVideo
                ref={videoRef}
                src={projects[selectedProject].video}
                autoplay
                loop
                muted
                className="w-full h-full rounded-lg p-4"
              />
              <button
                className="absolute top-1 right-2 text-2xl text-gray-400 hover:text-gray-600"
                onClick={handleClose}
              >
                &times;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectList;
