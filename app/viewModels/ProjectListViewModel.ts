'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { projects, Project } from '../models/ProjectData';

export interface ProjectListState {
  selectedProject: number | null;
  isMobile: boolean;
  isActive: boolean;
  isVideoLoading: boolean;
  projects: Project[];
  isDataLoaded: boolean;
}

export interface ProjectListActions {
  handleInteraction: (index: number) => Promise<void>;
  closeModal: () => void;
  setIsActive: (isActive: boolean) => void;
  loadProjectData: () => void;
}

export function useProjectListViewModel(
  onModalToggle: (isVisible: boolean) => void
): [ProjectListState, ProjectListActions] {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [projectsData, setProjectsData] = useState<Project[]>([]);
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

  // Load project data when needed
  const loadProjectData = useCallback(() => {
    if (!isDataLoaded) {
      // Simulate loading delay for heavy data
      setTimeout(() => {
        setProjectsData(projects);
        setIsDataLoaded(true);
      }, 100);
    }
  }, [isDataLoaded]);

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
      
      // Small delay to allow cleanup
      await new Promise(resolve => setTimeout(resolve, 50));
      
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
      closeTimerRef.current = setTimeout(closeModal, 200);
    }
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, [isActive, closeModal, selectedProject]);

  // Set videoRef for external access
  const setVideoRefExternal = (ref: HTMLVideoElement | null) => {
    videoRef.current = ref;
  };

  return [
    { 
      selectedProject, 
      isMobile, 
      isActive, 
      isVideoLoading,
      projects: isDataLoaded ? projectsData : projects.map(p => ({ ...p, name: p.name, year: p.year, techStack: [], video: '' })), // Only show basic info until loaded
      isDataLoaded 
    },
    {
      handleInteraction,
      closeModal,
      setIsActive,
      loadProjectData
    }
  ];
} 