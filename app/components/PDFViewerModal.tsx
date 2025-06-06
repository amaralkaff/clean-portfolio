'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFViewerModalProps, usePDFViewerModalViewModel } from '../viewModels/PDFViewerModalViewModel';

const PDFViewerModal: React.FC<PDFViewerModalProps> = (props) => {
  const [state, actions] = usePDFViewerModalViewModel(props);
  const { isLoading, error, isMobile } = state;
  const { handleIframeLoad, handleIframeError, handleClose } = actions;

  return (
    <AnimatePresence>
      {props.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50"
          onClick={handleClose}
        >
          {/* Close button positioned in top-right corner of screen */}
          <button
            className="fixed top-4 right-4 text-white bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 z-[60] transition-all duration-200"
            onClick={handleClose}
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
          
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white p-4 rounded-lg w-11/12 h-5/6 relative"
            onClick={e => e.stopPropagation()}
          >
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center text-red-500">
                {error}
              </div>
            )}

            <iframe
              src={props.pdfUrl}
              className="w-full h-full"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PDFViewerModal;