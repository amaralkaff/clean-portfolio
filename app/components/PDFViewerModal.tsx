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
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
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

          {/* PDF Viewer */}
          <div className="w-full h-[80vh] rounded-lg overflow-hidden">
            <iframe
              src={`${pdfUrl}#view=FitH`}
              className="w-full h-full"
              title="Resume PDF"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PDFViewerModal;