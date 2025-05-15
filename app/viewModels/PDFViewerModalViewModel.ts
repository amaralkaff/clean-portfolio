'use client';

import { useState, useEffect } from 'react';

export interface PDFViewerModalState {
  isLoading: boolean;
  error: string | null;
  isMobile: boolean;
}

export interface PDFViewerModalActions {
  handleIframeLoad: () => void;
  handleIframeError: () => void;
  handleClose: () => void;
}

export interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
}

export function usePDFViewerModalViewModel(props: PDFViewerModalProps): [PDFViewerModalState, PDFViewerModalActions] {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMedia = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load PDF');
  };

  const handleClose = () => {
    props.onClose();
  };

  return [
    {
      isLoading,
      error,
      isMobile
    },
    {
      handleIframeLoad,
      handleIframeError,
      handleClose
    }
  ];
} 