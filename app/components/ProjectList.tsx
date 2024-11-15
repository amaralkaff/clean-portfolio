import React, {
  useState,
  useEffect,
  Suspense,
  useRef,
  ReactElement,
} from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import CircuitAnimation from "./CircuitAnimation";
import { projects } from "./ProjectData";

const LocalVideo = React.lazy(() => import("./LocalVideo"));

interface ProjectListProps {
  onModalToggle: (isVisible: boolean) => void;
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ProjectList: React.FC<ProjectListProps> = ({
  onModalToggle,
}): ReactElement => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const updateMedia = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  const closeModal = () => {
    setSelectedProject(null);
    onModalToggle(false);
    setIsActive(false);
  };

  const handleInteraction = async (index: number) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    setIsVideoLoading(true);
    
    if (selectedProject !== index) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
      
      // Small delay to allow cleanup
      await new Promise(resolve => setTimeout(resolve, 50));
      
      setSelectedProject(index);
      setIsActive(true);
      onModalToggle(true);
    }
  };

  // Effect to handle video playback when project changes
  useEffect(() => {
    if (videoRef.current && selectedProject !== null) {
      videoRef.current.load();
      videoRef.current.play();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (!isActive && selectedProject !== null) {
      closeTimerRef.current = setTimeout(closeModal, 200);
    }
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, [isActive]);

  return (
    <div
      className="relative flex flex-col w-full h-screen items-center px-4 overflow-auto justify-center md:w-2/3 min-h-screen"
      onMouseLeave={() => setIsActive(false)}
    >
      <CircuitAnimation 
        isActive={selectedProject !== null} 
        targetRef={modalRef} 
      />
      
      <div
        className={`space-y-2 w-full cursor-none z-10 ${
          isMobile && selectedProject !== null ? "hidden" : ""
        }`}
        onMouseEnter={() => setIsActive(true)}
      >
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            onMouseEnter={() => !isMobile && handleInteraction(index)}
            onClick={() => isMobile && handleInteraction(index)}
            className="flex justify-between items-center w-full p-4 rounded-lg hover:bg-gray-100 cursor-default"
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
          ref={modalRef}
          className={`fixed w-full md:w-2/5 lg:w-2/4 h-auto bg-white rounded-lg flex flex-col justify-center items-center transition-all duration-300 md:right-12 p-4 z-20 ${
            isMobile ? "inset-0 bg-black bg-opacity-50" : ""
          }`}
          variants={fadeUpVariant}
          transition={{ duration: 0.5 }}
        >
          <button
            className="fixed top-12 md:top-3 right-3 text-white bg-black rounded-full p-2 hover:text-gray-300 z-50 md:hidden"
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
                } bg-gray-100 rounded-lg animate-pulse`}
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
                ref={videoRef}
                src={projects[selectedProject]?.video}
                autoplay={true}
                controls={false}
                muted={true}
                loop={true}
                className="w-full h-full rounded-lg object-cover"
                preload="auto"
              />
            </div>
            <div className="flex flex-wrap justify-center mt-4">
              {projects[selectedProject]?.techStack.map((tech, index) => (
                <div key={index} className="flex items-center m-2">
                  <Link href={tech.url} passHref>
                    <Image
                      src={tech.logo}
                      alt={tech.name}
                      width={30}
                      height={30}
                      className="mr-2 hover:opacity-80"
                    />
                  </Link>
                  <span className="text-md text-gray-800">{tech.name}</span>
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