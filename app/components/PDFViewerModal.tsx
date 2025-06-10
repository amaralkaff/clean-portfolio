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
          className="fixed inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl backdrop-saturate-200 flex items-center justify-center z-50"
          onClick={handleClose}
        >
          {/* Close button positioned in top-right corner of screen */}
          <button
            className="fixed top-4 right-4 text-white bg-gradient-to-br from-black/60 via-black/40 to-black/20 backdrop-blur-md border border-white/10 hover:from-black/80 hover:via-black/60 hover:to-black/40 rounded-full p-2 z-[60] transition-all duration-300 transform hover:scale-110 hover:rotate-90"
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
            initial={{ scale: 0.8, opacity: 0, rotateX: 10, y: 50 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateX: -10, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.3 },
              scale: { duration: 0.4 },
              rotateX: { duration: 0.4 },
              y: { duration: 0.4 }
            }}
            className="liquid-glass-modal bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-2xl shadow-black/10 p-4 rounded-3xl w-11/12 h-5/6 relative overflow-hidden"
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

            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
              <iframe
                src={props.pdfUrl}
                className="w-full h-full rounded-2xl"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent via-transparent to-white/5 rounded-2xl" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PDFViewerModal;