import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
}

const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ isOpen, onClose, pdfUrl }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black md:bg-black/50 md:p-4"
      >
        {/* Mobile header bar */}
        <div className="flex items-center justify-between bg-[#262626] p-4 md:hidden">
          <button
            onClick={onClose}
            className="text-white p-1"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="text-white font-medium">Resume</div>
          <div className="w-6" /> {/* Spacer for alignment */}
        </div>

        {/* Desktop close button */}
        <button
          onClick={onClose}
          className="hidden md:block absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="h-[calc(100%-6rem)] md:h-[80vh] w-full md:max-w-4xl mx-auto mt-0 md:mt-8 bg-white md:rounded-lg overflow-hidden shadow-xl"
        >
          <iframe
            src={`${pdfUrl}#view=FitH`}
            className="w-full h-full"
            title="Resume PDF"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PDFViewerModal;