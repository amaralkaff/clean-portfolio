import React, {
  useState,
  useEffect,
  Suspense,
  useMemo,
  useRef,
  ReactElement,
} from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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

const ProjectList: React.FC<ProjectListProps> = ({
  onModalToggle,
}): ReactElement => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const modalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

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
          {
            name: "React Native",
            logo: "/logos/react.png",
            url: "https://reactnative.dev",
          },
          {
            name: "TypeScript",
            logo: "/logos/typescript.png",
            url: "https://www.typescriptlang.org",
          }
          {
            name: "Redux",
            logo: "/logos/redux.png",
            url: "https://redux.js.org",
          },
          {
            name: "Socket.io",
            logo: "/logos/socket.png",
            url: "https://socket.io",
          },
          {
            name: "Google Maps",
            logo: "/logos/googlemap.png",
            url: "https://maps.google.com",
          },
        ],
      },
      {
        name: "Gomoku Game",
        year: 2023,
        video: "/video/gomoku-game.webm",
        techStack: [
          {
            name: "React",
            logo: "/logos/react.png",
            url: "https://reactjs.org",
          },
          {
            name: "JavaScript",
            logo: "/logos/javascript.png",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
          },
          {
            name: "Firebase Realtime Database",
            logo: "/logos/firebase.png",
            url: "https://firebase.google.com",
          },
        ],
      },
      {
        name: "Parion",
        year: 2023,
        video: "/video/parion.webm",
        techStack: [
          {
            name: "MongoDB",
            logo: "/logos/mongodb.png",
            url: "https://mongodb.com",
          },
          {
            name: "NextJS",
            logo: "/logos/nextjs.png",
            url: "https://nextjs.org",
          },
          {
            name: "Xendit",
            logo: "/logos/xendit.png",
            url: "https://xendit.co",
          },
          {
            name: "OpenAI",
            logo: "/logos/openai.png",
            url: "https://openai.com",
          },
          {
            name: "Firestore",
            logo: "/logos/firebase.png",
            url: "https://firebase.google.com/docs/firestore",
          },
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
    clearTimeout(modalTimeoutRef.current!);
    setSelectedProject(index);
    onModalToggle(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Ensure e.relatedTarget is a valid Node and check if it is inside modal or list container
    if (
      modalRef.current &&
      e.relatedTarget instanceof Node &&
      !modalRef.current.contains(e.relatedTarget) &&
      !e.currentTarget.contains(e.relatedTarget)
    ) {
      e.stopPropagation(); // Stop event propagation
      modalTimeoutRef.current = setTimeout(() => {
        closeModal();
      }, 5000); // 5 seconds delay
    }
  };

  return (
    <div
      className="relative flex flex-col w-full h-screen items-center px-4 overflow-auto justify-center md:w-2/3 min-h-screen"
      onMouseLeave={handleMouseLeave}
    >
      <div className="space-y-2 w-full cursor-none">
        {" "}
        {/* Hides cursor when hovering over the list */}
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            onMouseEnter={() => handleInteraction(index)}
            className="flex justify-between items-center w-full p-4 rounded-lg hover:bg-gray-100 cursor-default" // Changed cursor to default
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
          className="fixed w-full md:w-2/5 lg:w-2/4 h-auto bg-transparent rounded-lg flex flex-col justify-center items-center transition-all duration-300 md:right-12 p-4"
          variants={fadeUpVariant}
          transition={{ duration: 0.5 }}
          onMouseLeave={handleMouseLeave} // Also handle mouse leave from the modal
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
                  <Link href={tech.url} passHref>
                    <Image
                      src={tech.logo}
                      alt={tech.name}
                      width={30} // Increased image width
                      height={30} // Increased image height
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
