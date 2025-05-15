'use client';

import { useState } from 'react';

export interface MainContentState {
  isPDFModalOpen: boolean;
  personalInfo: {
    name: string;
    tagline: string;
    contactLinks: {
      type: string;
      url: string;
      label: string;
    }[];
  };
}

export interface MainContentActions {
  handleResumeClick: (e: React.MouseEvent) => void;
  setIsPDFModalOpen: (isOpen: boolean) => void;
}

export function useMainContentViewModel(): [MainContentState, MainContentActions] {
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  const personalInfo = {
    name: "Abu Ammar",
    tagline: "Human side of zero and one",
    contactLinks: [
      {
        type: "resume",
        url: "#",
        label: "Resume"
      },
      {
        type: "email",
        url: "mailto:amaralkaff@gmail.com",
        label: "Email"
      },
      {
        type: "linkedin",
        url: "https://www.linkedin.com/in/amaralkaff/",
        label: "LinkedIn"
      },
      {
        type: "github",
        url: "https://github.com/amaralkaff",
        label: "GitHub"
      }
    ]
  };

  const handleResumeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPDFModalOpen(true);
  };

  return [
    {
      isPDFModalOpen,
      personalInfo
    },
    {
      handleResumeClick,
      setIsPDFModalOpen
    }
  ];
} 