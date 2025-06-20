'use client';

import React, {
  Suspense,
  useRef,
  ReactElement,
  forwardRef,
} from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ProgressiveImage from "./ProgressiveImage";
import CircuitAnimation from "./CircuitAnimation";
import { useProjectListViewModel } from "../viewModels/ProjectListViewModel";
import { Project } from "../models/ProjectData";
import { useTheme } from "../context/ThemeContext";

const LocalVideo = React.lazy(() => import("./LocalVideo"));

interface ProjectListProps {
  onModalToggle: (isVisible: boolean) => void;
  isAppHovered: boolean;
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ProjectList: React.FC<ProjectListProps> = ({
  onModalToggle,
  isAppHovered,
}): ReactElement => {
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const projectListRef = useRef<HTMLDivElement>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const [state, actions] = useProjectListViewModel(onModalToggle);
  const { selectedProject, isMobile, isActive, projects } = state;
  const { handleInteraction, closeModal, setIsActive } = actions;
  const { theme } = useTheme();
  
  // Track which project is being hovered
  const [hoveredProjectIndex, setHoveredProjectIndex] = React.useState<number | null>(null);
  // Track if hovering over project list area specifically
  const [isHoveringProjectList, setIsHoveringProjectList] = React.useState<boolean>(false);

  return (
    <div className="relative flex flex-col w-full h-screen items-center px-4 overflow-auto justify-center md:w-2/3 min-h-screen">
      <CircuitAnimation 
        isActive={(isAppHovered && isHoveringProjectList) || selectedProject !== null} 
        targetRef={
          selectedProject !== null ? 
            videoContainerRef as React.RefObject<HTMLElement> :
            hoveredProjectIndex !== null ? 
              { current: projectRefs.current[hoveredProjectIndex] } as React.RefObject<HTMLElement> : 
              projectListRef as React.RefObject<HTMLElement>
        }
      />
      
      <div
        ref={projectListRef}
        className={`space-y-2 w-full z-10 ${
          isMobile && selectedProject !== null ? "hidden" : ""
        }`}
        onMouseEnter={() => {
          setIsActive(true);
          setIsHoveringProjectList(true);
        }}
        onMouseLeave={() => {
          setIsHoveringProjectList(false);
        }}
      >
        {projects.map((project, index) => (
          <motion.div
            key={index}
            ref={(el) => {
              projectRefs.current[index] = el;
            }}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.0 }}
            onMouseEnter={() => {
              if (!isMobile) {
                setHoveredProjectIndex(index);
                handleInteraction(index);
              }
            }}
            onMouseLeave={() => {
              if (!isMobile) {
                setHoveredProjectIndex(null);
              }
            }}
            onClick={() => isMobile && handleInteraction(index)}
            className={`relative flex justify-between items-center w-full p-4 rounded-xl cursor-pointer bg-transparent transition-all duration-300 ease-out group overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 after:absolute after:inset-0 after:bg-gradient-to-r after:translate-x-[-100%] after:skew-x-12 after:transition-transform after:duration-700 hover:after:translate-x-[100%] after:pointer-events-none ${
              theme === 'dark' 
                ? 'hover:bg-white/[0.02] border border-transparent hover:border-white/20 hover:backdrop-blur-xl hover:shadow-[0_4px_16px_rgba(255,255,255,0.1)] before:from-white/[0.03] before:via-white/[0.01] before:to-transparent after:from-transparent after:via-white/10 after:to-transparent' 
                : 'hover:bg-white/[0.15] border border-transparent hover:border-gray/30 hover:backdrop-blur-xl hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] before:from-gray/[0.08] before:via-gray/[0.03] before:to-transparent after:from-transparent after:via-black/15 after:to-transparent'
            }`}
          >
            <span className="relative z-10 text-[var(--text-primary)] text-md font-medium w-1/2 truncate transition-all duration-300 group-hover:text-opacity-90 group-hover:drop-shadow-sm">
              {project.name}
            </span>
            <span className="relative z-10 text-gray-400 text-sm md:text-base w-1/4 text-right transition-all duration-300 group-hover:text-opacity-80 group-hover:drop-shadow-sm">
              {project.year}
            </span>
          </motion.div>
        ))}
      </div>

      {selectedProject !== null && (
        <motion.div
          ref={modalRef}
          className={`fixed w-full md:w-2/5 lg:w-2/4 h-auto rounded-2xl flex flex-col justify-center items-center transition-all duration-500 md:right-12 p-6 z-20 overflow-hidden ${
            theme === 'dark' 
              ? 'bg-black/10 backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]' 
              : 'bg-white/10 backdrop-blur-2xl border border-black/20 shadow-[0_20px_60px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.5)]'
          } ${
            isMobile ? "inset-0 bg-black/20 backdrop-blur-lg" : ""
          } before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-30 ${
            theme === 'dark' 
              ? 'before:from-white/5 before:via-transparent before:to-white/10' 
              : 'before:from-white/20 before:via-transparent before:to-black/5'
          }`}
          variants={fadeUpVariant}
          transition={{ duration: 0.5 }}
          onMouseLeave={closeModal}
        >
          <button
            className={`fixed top-16 md:top-6 right-3 rounded-full p-2 z-50 md:hidden transition-all duration-300 backdrop-blur-lg border ${
              theme === 'dark' 
                ? 'bg-black/20 hover:bg-black/30 border-white/20 text-gray-300 hover:text-white shadow-[0_4px_16px_rgba(255,255,255,0.1)]' 
                : 'bg-white/20 hover:bg-white/30 border-black/20 text-black hover:text-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.1)]'
            }`}
            onClick={closeModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
              <div className="space-y-4">
                <div className="flex flex-wrap justify-center gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-[30px] h-[30px] rounded-full bg-gray-200 animate-pulse" />
                      <div className="w-[60px] h-[16px] bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <div
              ref={videoContainerRef}
              className={`relative ${
                projects[selectedProject]?.name === "Bang Abah"
                  ? "aspect-w-9 aspect-h-16"
                  : "aspect-w-16 aspect-h-9"
              } w-full rounded-2xl overflow-hidden bg-gradient-to-br ${
                theme === 'dark' 
                  ? 'from-white/5 to-white/10' 
                  : 'from-black/5 to-black/10'
              } backdrop-blur-sm border ${
                theme === 'dark' ? 'border-white/20' : 'border-black/20'
              } shadow-[0_8px_32px_rgba(0,0,0,0.2)] before:absolute before:inset-0 before:bg-gradient-to-t before:from-transparent before:via-transparent before:to-white/10 before:pointer-events-none before:z-10`}
            >
              <LocalVideo
                ref={videoRef}
                src={projects[selectedProject]?.video}
                autoplay={true}
                controls={false}
                muted={true}
                loop={true}
                className="w-full h-full rounded-2xl object-cover relative z-0"
                preload="auto"
              />
            </div>
            <div className="flex flex-wrap justify-center mt-4">
              {projects[selectedProject]?.techStack.map((tech, index) => (
                <div key={index} className="flex items-center m-2">
                  <Link href={tech.url} passHref target="_blank" rel="noopener noreferrer">
                    <ProgressiveImage
                      src={tech.logo}
                      alt={tech.name}
                      width={30}
                      height={30}
                      className="mr-2 hover:opacity-80 transition-opacity duration-200"
                      lazyLoad={true}
                    />
                  </Link>
                  <span className={`text-md ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                  }`}>
                    {tech.name}
                  </span>
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