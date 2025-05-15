'use client';

import { useState, useRef, useEffect } from 'react';

export interface MusicTrack {
  path: string;
  name: string;
}

export interface PhonkMusicState {
  isPlaying: boolean;
  progress: number;
  currentTrack: number;
  isLoading: boolean;
  error: string | null;
  tracks: MusicTrack[];
}

export interface PhonkMusicActions {
  togglePlay: () => Promise<void>;
  nextTrack: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  nextAudioRef: React.RefObject<HTMLAudioElement | null>;
}

export function usePhonkMusicViewModel(autoPlay: boolean = true): [PhonkMusicState, PhonkMusicActions] {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const playRequestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tracks: MusicTrack[] = [
    { path: '/music/FUNK MI CAMINO.mp3', name: 'FUNK MI CAMINO' },
    { path: '/music/X-TALI.mp3', name: 'X-TALI'},
    { path: '/music/Montagem Do Cosmos.mp3', name: 'Montagem Do Cosmos' },
    { path: '/music/AURA.mp3', name: 'AURA' },
    { path: '/music/EEYUH! x Fluxxwave.mp3', name: 'EEYUH! x Fluxxwave' },
    { path: '/music/FUNK UNIVERSO.mp3', name: 'FUNK UNIVERSO' },
    { path: '/music/LDRR.mp3', name: 'LDRR' },
  ];

  // Safe play function to avoid interruption errors
  const safePlay = async (audioElement: HTMLAudioElement) => {
    if (isLoadingTrack) return false;
    
    try {
      // Check if the audio element is actually ready
      if (audioElement.readyState >= 2) {
        await audioElement.play();
        return true;
      } else {
        // Wait for the audio to be ready
        return new Promise<boolean>((resolve) => {
          const canPlayHandler = async () => {
            try {
              await audioElement.play();
              resolve(true);
            } catch (error) {
              console.error('Play error after canplay:', error);
              resolve(false);
            }
            audioElement.removeEventListener('canplay', canPlayHandler);
          };
          
          audioElement.addEventListener('canplay', canPlayHandler, { once: true });
          
          // Add a timeout in case 'canplay' never fires
          setTimeout(() => {
            audioElement.removeEventListener('canplay', canPlayHandler);
            resolve(false);
          }, 3000);
        });
      }
    } catch (error) {
      console.error('Safe play error:', error);
      return false;
    }
  };

  // Setup inactivity detection to auto-stop music
  useEffect(() => {
    // Track user activity
    const updateActivity = () => {
      setLastInteractionTime(Date.now());
    };

    // Listen for user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Check for inactivity - if user hasn't interacted for 3 minutes, stop the music
    const inactivityCheck = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastInteractionTime;
      const inactivityThreshold = 3 * 60 * 1000; // 3 minutes

      if (isPlaying && inactiveTime > inactivityThreshold) {
        // User has been inactive, pause the music
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => {
      // Clean up
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityCheck);
    };
  }, [isPlaying, lastInteractionTime]);

  // Preload next track
  useEffect(() => {
    const nextTrackIndex = (currentTrack + 1) % tracks.length;
    if (nextAudioRef.current) {
      nextAudioRef.current.src = tracks[nextTrackIndex].path;
      nextAudioRef.current.load();
    }
  }, [currentTrack]);

  // Try to auto-play on component mount - only once
  useEffect(() => {
    let attemptTimeout: NodeJS.Timeout | null = null;
    
    if (autoPlay && !hasInteracted) {
      setHasInteracted(true);
      
      // Only try once after a delay to let everything initialize
      attemptTimeout = setTimeout(async () => {
        if (audioRef.current && !isPlaying && !isLoadingTrack) {
          const success = await safePlay(audioRef.current);
          if (success) {
            setIsPlaying(true);
          }
        }
      }, 1000);
    }
    
    return () => {
      if (attemptTimeout) clearTimeout(attemptTimeout);
    };
  }, [autoPlay]);

  // For user interaction to trigger auto-play
  useEffect(() => {
    // Try to play on user interaction
    const handleUserInteraction = async () => {
      if (autoPlay && !isPlaying && !isLoadingTrack && audioRef.current) {
        const success = await safePlay(audioRef.current);
        if (success) {
          setIsPlaying(true);
        }
      }
      
      // Update last interaction time
      setLastInteractionTime(Date.now());
    };

    // Use just a few key events to prevent multiple handlers firing
    const interactionEvents = ['click', 'keydown'];
    
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [autoPlay, isPlaying, isLoadingTrack]);

  // Handle audio loading and track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const loadAudio = async () => {
      if (isLoadingTrack) return; // Prevent multiple simultaneous loads
      
      setIsLoadingTrack(true);
      setIsLoading(true);
      setError(null);
      
      try {
        // Pause any current playback before changing source
        if (audio.played.length > 0) {
          audio.pause();
        }
        
        // Update source and reload
        audio.src = tracks[currentTrack].path;
        audio.load();
        
        // Wait for the audio to be ready
        await new Promise<void>((resolve, reject) => {
          const loadedHandler = () => {
            resolve();
            audio.removeEventListener('canplaythrough', loadedHandler);
          };
          
          const errorHandler = (e: Event) => {
            reject(new Error('Failed to load audio'));
            audio.removeEventListener('error', errorHandler);
          };
          
          audio.addEventListener('canplaythrough', loadedHandler, { once: true });
          audio.addEventListener('error', errorHandler, { once: true });
          
          // Add a timeout in case events never fire
          setTimeout(() => {
            audio.removeEventListener('canplaythrough', loadedHandler);
            audio.removeEventListener('error', errorHandler);
            resolve(); // Resolve anyway to prevent hanging
          }, 5000);
        });
        
        setIsLoading(false);
        
        // If already playing, continue playing the new track
        if (isPlaying) {
          // Add a small delay to ensure the audio is fully ready
          if (playRequestTimeoutRef.current) {
            clearTimeout(playRequestTimeoutRef.current);
          }
          
          playRequestTimeoutRef.current = setTimeout(async () => {
            try {
              await safePlay(audio);
            } catch (error) {
              console.error('Play error after loading:', error);
              setIsPlaying(false);
            }
          }, 100);
        }
      } catch (error) {
        console.error('Audio loading error:', error);
        setError('Failed to load audio');
        setIsPlaying(false);
      } finally {
        setIsLoadingTrack(false);
      }
    };

    loadAudio();

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      if (playRequestTimeoutRef.current) {
        clearTimeout(playRequestTimeoutRef.current);
      }
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (!audio.duration) return;
      const value = (audio.currentTime / audio.duration) * 100;
      setProgress(value || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || isLoading || isLoadingTrack) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        const success = await safePlay(audio);
        if (success) {
          setIsPlaying(true);
        }
      }
      
      // Update last interaction time when user manually toggles
      setLastInteractionTime(Date.now());
    } catch (error) {
      console.error('Playback error:', error);
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  };

  const nextTrack = () => {
    if (isLoadingTrack) return; // Prevent changing tracks during loading
    
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
    
    // Update last interaction time when user changes track
    setLastInteractionTime(Date.now());
  };

  return [
    {
      isPlaying,
      progress,
      currentTrack,
      isLoading,
      error,
      tracks
    },
    {
      togglePlay,
      nextTrack,
      audioRef,
      nextAudioRef
    }
  ];
} 