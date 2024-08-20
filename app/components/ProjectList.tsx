import React, { useState, useEffect, Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// Debounce function to handle resize events efficiently
function debounce(func: () => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (this: any, ...args: any) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

const LocalVideo = React.lazy(() => import("./LocalVideo"));

interface ProjectListProps {
  onModalToggle: (isVisible: boolean) => void;
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ProjectList: React.FC<ProjectListProps> = ({ onModalToggle }) => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Only run this effect on the client-side
  useEffect(() => {
    const updateMedia = debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 200);

    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  // Memoize the projects array to prevent unnecessary re-renders
  const projects = useMemo(
    () => [
      {
        name: "Bang Abah",
        year: 2024,
        video: "/video/bang-abah-mobile-app.webm",
        techStack: [
          { name: "React Native", logo: "/logos/react.png" },
          { name: "Redux", logo: "/logos/redux.png" },
          { name: "Socket.io", logo: "/logos/socket.png" },
          { name: "Google Maps", logo: "/logos/googlemap.png" },
        ],
      },
      {
        name: "Gomoku Game",
        year: 2023,
        video: "/video/gomoku-game.webm",
        techStack: [
          { name: "React", logo: "/logos/react.png" },
          { name: "JavaScript", logo: "/logos/javascript.png" },
          { name: "Firebase Realtime Database", logo: "/logos/firebase.png" },
        ],
      },
      {
        name: "Parion",
        year: 2023,
        video: "/video/parion.webm",
        techStack: [
          { name: "MongoDB", logo: "/logos/mongodb.png" },
          { name: "NextJS", logo: "/logos/nextjs.png" },
          { name: "Xendit", logo: "/logos/xendit.png" },
          { name: "OpenAI", logo: "/logos/openai.png" },
          { name: "Firestore", logo: "/logos/firebase.png" },
        ],
      },
    ],
    []
  );

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
            className="flex justify-between items-center w-full p-4 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <span className="text-black text-md font-medium w-1/2 truncate">
              {project.name}
            </span>
            <span className="text-gray-400 text-sm md:text-base w-1/4 text-right">
              {project.year}
            </span>
          </motion.div>
        ))}
      </div>
      {selectedProject !== null && (
        <motion.div
          className="fixed w-full md:w-2/5 lg:w-2/4 h-auto bg-transparent rounded-lg flex flex-col justify-center items-center transition-all duration-300 md:right-12 p-4"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <Suspense
            fallback={
              <div
                className={`relative w-full h-full ${
                  projects[selectedProject]?.name === "Bang Abah"
                    ? "aspect-w-9 aspect-h-16"
                    : "aspect-w-16 aspect-h-9"
                } bg-gray-200 rounded-lg`}
              />
            }
          >
            <div
              className={`relative ${
                projects[selectedProject]?.name === "Bang Abah"
                  ? "aspect-w-9 aspect-h-16"
                  : "aspect-w-16 aspect-h-9"
              } w-full`}
            >
              <LocalVideo
                src={projects[selectedProject]?.video}
                autoplay
                controls={false}
                muted={true}
                className="w-full h-full rounded-lg object-cover"
                preload="metadata"
              />
            </div>
            <div className="flex flex-wrap justify-center mt-4">
              {projects[selectedProject]?.techStack.map((tech, index) => (
                <div key={index} className="flex items-center m-2">
                  <Image
                    src={tech.logo}
                    alt={tech.name}
                    width={24} // Define image width explicitly for better optimization
                    height={24} // Define image height explicitly for better optimization
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-800">{tech.name}</span>
                </div>
              ))}
            </div>
          </Suspense>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectList;
