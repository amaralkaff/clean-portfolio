import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import "./ProjectList.css";

const LocalVideo = React.lazy(() => import("./LocalVideo"));

interface ProjectListProps {
  onModalToggle: (isVisible: boolean) => void;
}

const projects = [
  { name: 'Bang Abah', year: 2024, video: '/video/bang-abah-mobile-app.webm' },
  { name: 'Gomoku Game', year: 2023, video: '/video/gomoku-game.webm' },
  { name: 'Parion', year: 2023, video: '/video/parion.webm' },
];

const ProjectList: React.FC<ProjectListProps> = ({ onModalToggle }) => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMedia = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', updateMedia);
    updateMedia();
    return () => window.removeEventListener('resize', updateMedia);
  }, []);

  const closeModal = () => {
    setSelectedProject(null);
    onModalToggle(false);
  };

  const handleInteraction = (index: number) => {
    setSelectedProject(index);
    onModalToggle(true);
  };

  return (
    <div className="relative flex flex-col w-full h-screen items-center p-8 overflow-auto justify-center">
      <div className="space-y-4 w-full">
        {projects.map((project, index) => (
          <div
            key={index}
            onClick={() => handleInteraction(index)}
            onMouseEnter={() => !isMobile && handleInteraction(index)}
            onMouseLeave={() => !isMobile && closeModal()}
            className="button-style flex justify-between items-center w-full p-4 rounded-lg cursor-pointer hover:bg-gray-100"
          >
            <span className="text-black text-md font-medium">{project.name}</span>
            <span className="text-gray-400 text-sm md:text-base">{project.year}</span>
          </div>
        ))}
      </div>
      {selectedProject !== null && (
        <motion.div
          className="modal modalVisible"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            className="close-button md:hidden fixed top-5 right-5 text-white bg-black rounded-full p-2 hover:text-gray-300"
            onClick={closeModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="black"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Suspense fallback={<div className="w-full h-full bg-gray-200 rounded-lg" />}>
            <LocalVideo
              src={projects[selectedProject].video}
              autoplay
              controls={false}
              muted={true}
              className="w-full h-full rounded-lg"
              preload="metadata"
            />
          </Suspense>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectList;
