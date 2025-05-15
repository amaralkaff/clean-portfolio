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
  const [mutedAutoPlayStarted, setMutedAutoPlayStarted] = useState(false);
  // Track if user manually stopped the music
  const [userPaused, setUserPaused] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTimeRef = useRef<number>(0);

  const tracks: MusicTrack[] = [
    { path: '/music/FUNK MI CAMINO.mp3', name: 'FUNK MI CAMINO' },
    { path: '/music/X-TALI.mp3', name: 'X-TALI'},
    { path: '/music/Montagem Do Cosmos.mp3', name: 'Montagem Do Cosmos' },
    { path: '/music/AURA.mp3', name: 'AURA' },
    { path: '/music/EEYUH! x Fluxxwave.mp3', name: 'EEYUH! x Fluxxwave' },
    { path: '/music/FUNK UNIVERSO.mp3', name: 'FUNK UNIVERSO' },
    { path: '/music/LDRR.mp3', name: 'LDRR' },
  ];

  // Create a silent audio element to bypass browser restrictions
  useEffect(() => {
    // Create a silent audio element (this can often auto-play when muted)
    const silentAudio = new Audio();
    silentAudio.src = tracks[currentTrack].path;
    silentAudio.muted = true;
    silentAudio.loop = true;
    silentAudioRef.current = silentAudio;

    // Try to play the silent audio
    const playSilent = async () => {
      try {
        await silentAudio.play();
        setMutedAutoPlayStarted(true);
        
        // After muted auto-play succeeds, try to unmute and play the real audio
        setTimeout(forceUnmutedPlayback, 500);
      } catch (error) {
        console.log("Silent auto-play failed, will try on user interaction");
      }
    };

    // Start silent playback immediately
    if (autoPlay && !userPaused) {
      playSilent();
    }

    return () => {
      if (silentAudioRef.current) {
        silentAudioRef.current.pause();
        silentAudioRef.current = null;
      }
    };
  }, []);

  // Force unmuted playback after silent play succeeds
  const forceUnmutedPlayback = async () => {
    if (!mutedAutoPlayStarted || !audioRef.current || isPlaying || userPaused) return;
    
    try {
      // First, try to play with the current audio
      if (audioRef.current) {
        // Make sure it's not muted
        audioRef.current.muted = false;
        audioRef.current.volume = 0.7;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log("Unmuted auto-play failed. Will try again on user interaction.");
    }
  };

  // Preload next track
  useEffect(() => {
    const nextTrackIndex = (currentTrack + 1) % tracks.length;
    if (nextAudioRef.current) {
      nextAudioRef.current.src = tracks[nextTrackIndex].path;
      nextAudioRef.current.load();
    }
  }, [currentTrack]);

  // Try to auto-play on component mount
  useEffect(() => {
    // Try immediately after audio is loaded
    if (!isLoading && autoPlay && !isPlaying && !userPaused) {
      // Aggressive auto-play attempts every second for the first 5 seconds
      let attempts = 0;
      const maxAttempts = 5;
      
      const attemptInterval = setInterval(async () => {
        attempts++;
        
        if (isPlaying || attempts > maxAttempts || userPaused) {
          clearInterval(attemptInterval);
          return;
        }
        
        try {
          if (audioRef.current) {
            // Try with both muted and unmuted
            audioRef.current.muted = false; 
            audioRef.current.volume = 0.7;
            await audioRef.current.play();
            setIsPlaying(true);
            clearInterval(attemptInterval);
          }
        } catch (error) {
          // Keep trying
          console.log(`Auto-play attempt ${attempts} failed`);
        }
      }, 1000);
      
      return () => clearInterval(attemptInterval);
    }
  }, [isLoading, autoPlay, isPlaying, userPaused]);

  // For auto-play when site loads - user interaction method
  useEffect(() => {
    // Try to play on any user interaction
    const handleUserInteraction = async () => {
      if (!hasInteracted && autoPlay && !isPlaying && !userPaused) {
        setHasInteracted(true);
        
        try {
          if (audioRef.current) {
            audioRef.current.muted = false;
            audioRef.current.volume = 0.7;
            await audioRef.current.play();
            setIsPlaying(true);
          }
        } catch (error) {
          console.log("Play failed even after user interaction");
        }
      }
    };

    // Multiple event types to catch any user interaction
    const interactionEvents = [
      'click', 'touchstart', 'touchend', 'mousedown', 
      'keydown', 'scroll', 'mousemove'
    ];
    
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [autoPlay, hasInteracted, isPlaying, userPaused]);

  // Save current time position when audio is paused
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      if (audio) {
        currentTimeRef.current = audio.currentTime;
      }
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const loadAudio = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Create a new Audio element and attempt to load it
        const tempAudio = new Audio();
        tempAudio.src = tracks[currentTrack].path;
        
        await new Promise((resolve, reject) => {
          tempAudio.oncanplaythrough = resolve;
          tempAudio.onerror = reject;
          tempAudio.load();
        });

        // If successful, update the actual audio element
        audio.src = tracks[currentTrack].path;
        setIsLoading(false);

        if (isPlaying) {
          try {
            await audio.play();
          } catch (playError) {
            console.error('Play error:', playError);
            setIsPlaying(false);
          }
        } else if (autoPlay && !hasInteracted && !userPaused) {
          // Try to start playback again
          try {
            audio.muted = false;
            audio.volume = 0.7;
            await audio.play();
            setIsPlaying(true);
          } catch (error) {
            // Ignore, we'll keep trying
          }
        }
      } catch (error) {
        console.error('Audio loading error:', error);
        setError('Failed to load audio');
        setIsLoading(false);
        setIsPlaying(false);
      }
    };

    loadAudio();

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, isPlaying, autoPlay, hasInteracted, userPaused]);

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
    if (!audio || isLoading) return;

    try {
      if (isPlaying) {
        // Mark that user has manually paused
        setUserPaused(true);
        // Store current position
        currentTimeRef.current = audio.currentTime;
        audio.pause();
      } else {
        // If resuming playback, set to the previous position
        if (currentTimeRef.current > 0 && userPaused) {
          audio.currentTime = currentTimeRef.current;
        }
        await audio.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  };

  const nextTrack = () => {
    // Save current state of userPaused to avoid unintended auto-play
    const wasPaused = userPaused;
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
    // Reset currentTime when changing tracks
    currentTimeRef.current = 0;
    // Keep userPaused state across track changes
    setUserPaused(wasPaused);
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