'use client';

import { useState, useEffect } from 'react';

export interface AppState {
  modalVisible: boolean;
}

export interface AppActions {
  setModalVisible: (isVisible: boolean) => void;
}

export function useAppViewModel(): [AppState, AppActions] {
  const [modalVisible, setModalVisible] = useState(false);

  return [
    {
      modalVisible
    },
    {
      setModalVisible
    }
  ];
} 