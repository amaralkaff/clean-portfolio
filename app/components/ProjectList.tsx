import React, { useState, useEffect, Suspense, useMemo } from "react";
import { motion } from "framer-motion";


// Debounce function
function debounce(func: { (): void; apply?: any; }, wait: number | undefined) {
  let timeout: string | number | NodeJS.Timeout | undefined;
  return  function(this: any, ...args: any) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

const LocalVideo = React.lazy(() => import("./LocalVideo"));

interface ProjectListProps {
  onModalToggle: (isVisible: boolean) => void;
}

const projects = useMemo(() => [
  { name: "Bang Abah", year: 2024, video: "/video/bang-abah-mobile-app.webm" },
  { name: "Gomoku Game", year: 2023, video: "/video/gomoku-game.webm" },
  { name: "Parion", year: 2023, video: "/video/parion.webm" },
], []);


const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ProjectList: React.FC<ProjectListProps> = ({ onModalToggle }) => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMedia = debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 200);

    updateMedia();
    window.addEventListener('resize', updateMedia);
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
    <div className="relative flex flex-col w-full h-screen items-center px-4 overflow-auto justify-center md:w-2/3 min-h-screen">
      <div className="space-y-2 w-full">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => handleInteraction(index)}
            onMouseEnter={() => !isMobile && handleInteraction(index)}
            onMouseLeave={() => !isMobile && closeModal()}
            className="flex justify-between items-center w-full p-4 rounded-lg hover:bg-gray-100"
          >
            <span className="text-black text-md font-medium w-1/2 truncate">{project.name}</span>
            <span className="text-gray-400 text-sm md:text-base w-1/4 text-right">{project.year}</span>
          </motion.div>
        ))}
      </div>
      {selectedProject !== null && (
        <motion.div
          className="fixed w-full md:w-2/5 lg:w-2/4 h-auto bg-white bg-opacity-50 backdrop-blur-lg rounded-lg flex justify-center items-center shadow-lg transition-all duration-300 md:right-12"
          variants={fadeUpVariant}
          transition={{ duration: 0.5 }}
        >
          <button
            className="fixed top-3 right-3 text-white bg-black rounded-full p-2 hover:text-gray-300 z-50 md:hidden"
            onClick={closeModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Suspense fallback={
            <div className={`relative w-full h-full ${projects[selectedProject]?.name === 'Bang Abah' ? 'aspect-w-9 aspect-h-16' : 'aspect-w-16 aspect-h-9'} bg-gray-200 rounded-lg`} />
          }>
            <div className={`relative ${projects[selectedProject]?.name === 'Bang Abah' ? 'aspect-w-9 aspect-h-16' : 'aspect-w-16 aspect-h-9'}`}>
              <LocalVideo
                src={projects[selectedProject]?.video}
                autoplay
                controls={false}
                muted={true}
                className="w-full h-full rounded-lg object-cover"
                preload="metadata"
              />
            </div>
          </Suspense>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectList;
