'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFViewerModalProps, usePDFViewerModalViewModel } from '../viewModels/PDFViewerModalViewModel';
import { useTheme } from '../context/ThemeContext';

const PDFViewerModal: React.FC<PDFViewerModalProps> = (props) => {
  const [state, actions] = usePDFViewerModalViewModel(props);
  const { isLoading, error, isMobile } = state;
  const { handleIframeLoad, handleIframeError, handleClose } = actions;
  const { theme } = useTheme();

  return (
    <AnimatePresence>
      {props.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-2xl backdrop-saturate-150 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-black/20 via-black/10 to-transparent'
              : 'bg-gradient-to-br from-white/15 via-white/8 to-transparent'
          }`}
          onClick={handleClose}
        >
          {/* Close button positioned in top-right corner of screen */}
          <button
            className={`fixed top-4 right-4 rounded-full p-2 z-[60] transition-all duration-300 backdrop-blur-lg border ${
              theme === 'dark'
                ? 'bg-black/20 hover:bg-black/30 border-white/20 text-white hover:text-gray-100 shadow-[0_4px_16px_rgba(255,255,255,0.1)]'
                : 'bg-white/20 hover:bg-white/30 border-black/20 text-black hover:text-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.1)]'
            }`}
            onClick={handleClose}
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
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.2
            }}
            className={`liquid-glass-modal p-4 rounded-3xl w-11/12 h-5/6 relative overflow-hidden backdrop-blur-2xl backdrop-saturate-150 border shadow-2xl ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-black/30 via-black/20 to-black/10 border-white/20 shadow-white/10'
                : 'bg-gradient-to-br from-white/30 via-white/20 to-white/10 border-black/20 shadow-black/10'
            } before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-30 before:pointer-events-none ${
              theme === 'dark'
                ? 'before:from-white/5 before:via-transparent before:to-white/10'
                : 'before:from-white/20 before:via-transparent before:to-black/5'
            }`}
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

            <div className={`relative w-full h-full rounded-2xl overflow-hidden backdrop-blur-sm border shadow-inner ${
              theme === 'dark'
                ? 'border-white/20 bg-black/10 shadow-white/5'
                : 'border-black/20 bg-white/10 shadow-black/5'
            } before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-20 before:pointer-events-none before:z-10 ${
              theme === 'dark'
                ? 'before:from-white/10 before:via-transparent before:to-white/5'
                : 'before:from-white/30 before:via-transparent before:to-black/10'
            }`}>
              <iframe
                src={props.pdfUrl}
                className="w-full h-full rounded-2xl relative z-0"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
              <div className={`absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-t ${
                theme === 'dark'
                  ? 'from-transparent via-transparent to-white/3'
                  : 'from-transparent via-transparent to-black/5'
              }`} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(PDFViewerModal);