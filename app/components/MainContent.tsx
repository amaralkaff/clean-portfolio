'use client';

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import PDFViewerModal from "./PDFViewerModal";
import TextType from "./TextType";
import { useMainContentViewModel } from "../viewModels/MainContentViewModel";
import { useTheme } from "../context/ThemeContext";

interface MainContentProps {
  isVisible: boolean;
  priority?: boolean;
}

const fadeUpVariant = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95,
    rotateX: 10,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    rotateX: 0,
    filter: "blur(0px)"
  }
};

const MainContent: React.FC<MainContentProps> = ({ isVisible }) => {
  const [state, actions] = useMainContentViewModel();
  const { isPDFModalOpen, personalInfo } = state;
  const { handleResumeClick, setIsPDFModalOpen } = actions;
  const { theme } = useTheme();

  return (
    <>
      <motion.div
        className="pt-20 md:pt-12 flex items-center justify-center h-full w-full md:w-2/3"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={fadeUpVariant}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 25,
          duration: 0.8,
          opacity: { duration: 0.6 },
          scale: { duration: 0.7 },
          rotateX: { duration: 0.6 },
          filter: { duration: 0.5 }
        }}
      >
        <div className="text-center" data-text-content style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <motion.div
            className="text-lg font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <TextType
              text={personalInfo.name}
              className="text-[var(--text-primary)]"
              typingSpeed={100}
              showCursor={false}
              loop={false}
            />
            <br />
            <TextType
              text={personalInfo.tagline}
              className="text-[var(--text-secondary)]"
              typingSpeed={75}
              initialDelay={personalInfo.name.length * 100}
              showCursor={true}
              cursorCharacter="|"
              loop={false}
            />
          </motion.div>
          <motion.div 
            className="mt-2 space-x-4 text-[var(--text-secondary)]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {personalInfo.contactLinks.map((link, index) => (
              link.type === 'resume' ? (
                <button
                  key={index}
                  onClick={handleResumeClick}
                  className={`hover:underline cursor-pointer hover:text-[var(--text-primary)] hover:brightness-125 transition-all duration-200`}
                  style={{ 
                    textShadow: "0 0 8px transparent",
                    color: `var(--text-secondary)` 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textShadow = `0 0 8px var(--text-primary)`;
                    e.currentTarget.style.color = `var(--text-primary)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textShadow = "0 0 8px transparent";
                    e.currentTarget.style.color = `var(--text-secondary)`;
                  }}
                >
                  {link.label}
                </button>
              ) : (
                <Link 
                  key={index}
                  href={link.url} 
                  className={`hover:underline transition-all duration-200`}
                  rel="noopener noreferrer"
                  target={link.type !== 'email' ? '_blank' : undefined}
                  style={{ 
                    textShadow: "0 0 8px transparent",
                    color: `var(--text-secondary)` 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textShadow = `0 0 8px var(--text-primary)`;
                    e.currentTarget.style.color = `var(--text-primary)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textShadow = "0 0 8px transparent";
                    e.currentTarget.style.color = `var(--text-secondary)`;
                  }}
                >
                  {link.label}
                </Link>
              )
            ))}
          </motion.div>
        </div>
      </motion.div>

      <PDFViewerModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        pdfUrl="/ABU_AMMAR_RESUME.pdf"
      />
    </>
  );
};

export default React.memo(MainContent);