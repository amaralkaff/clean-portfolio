"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import LocalVideo from './LocalVideo';

const projects = [
  { name: 'Bang Abah Mobile App', year: 2024, video: '/video/bang-abah-mobile-app.mp4' },
  { name: 'iNES', year: 2024, video: '/video/ines.mp4' },
  { name: 'SLAM', year: 2023, video: '/video/slam.mp4' },
];

const ProjectList: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setSelectedProject(index);
  };

  const handleClose = () => {
    setSelectedProject(null);
  };

  return (
    <div className="relative w-full md:w-1/2 max-w-4xl mx-auto">
      <ul className="space-y-4">
        {projects.map((project, index) => (
          <motion.li
            key={index}
            className="flex justify-between items-center p-4 rounded-lg cursor-pointer transition-transform hover:shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => handleClick(index)}
          >
            <span className="text-black text-lg md:text-xl">{project.name}</span>
            <span className="text-gray-400 text-sm md:text-base">{project.year}</span>
          </motion.li>
        ))}
      </ul>
      {selectedProject !== null && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out">
          <div className="relative w-2/3 md:w-1/2 lg:w-1/3 bg-white p-4 rounded-lg shadow-lg">
            <LocalVideo
              src={projects[selectedProject].video}
              autoplay
              loop
              muted
              className="w-full h-full object-cover"
            />
            <button
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
              onClick={handleClose}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
