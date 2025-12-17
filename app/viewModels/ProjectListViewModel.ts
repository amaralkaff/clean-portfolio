'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface ProjectListState {
  selectedProject: number | null;
  isMobile: boolean;
  isActive: boolean;
  isVideoLoading: boolean;
}

export interface ProjectListActions {
  handleInteraction: (index: number) => Promise<void>;
  closeModal: () => void;
  setIsActive: (isActive: boolean) => void;
}

export function useProjectListViewModel(
  onModalToggle: (isVisible: boolean) => void
): [ProjectListState, ProjectListActions] {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const updateMedia = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedProject(null);
    onModalToggle(false);
    setIsActive(false);
  }, [onModalToggle]);

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


      setSelectedProject(index);
      setIsActive(true);
      onModalToggle(true);
    }
  };

  // Effect to handle video loading when project changes
  useEffect(() => {
    if (videoRef.current && selectedProject !== null) {
      videoRef.current.load();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (!isActive && selectedProject !== null) {
      closeModal();
    }
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, [isActive, closeModal, selectedProject]);

  return [
    {
      selectedProject,
      isMobile,
      isActive,
      isVideoLoading
    },
    {
      handleInteraction,
      closeModal,
      setIsActive
    }
  ];
} 