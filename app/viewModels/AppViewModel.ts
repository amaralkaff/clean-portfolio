'use client';

import { useState, useEffect } from 'react';

export interface AppState {
  modalVisible: boolean;
  isLoading: boolean;
}

export interface AppActions {
  setModalVisible: (isVisible: boolean) => void;
}

export function useAppViewModel(): [AppState, AppActions] {
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple loading timeout for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 seconds for a polished feel

    return () => clearTimeout(timer);
  }, []);

  return [
    {
      modalVisible,
      isLoading
    },
    {
      setModalVisible
    }
  ];
} 