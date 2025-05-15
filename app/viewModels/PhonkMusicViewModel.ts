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
  previousTrack: () => void;
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
  // Add a new flag to prevent auto-play loops
  const [autoPlayAttempted, setAutoPlayAttempted] = useState(false);
  // Add a flag to track when a track change happens via nextTrack
  const [trackChangedProgrammatically, setTrackChangedProgrammatically] = useState(false);
  
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

  // Create a silent audio element to bypass browser restrictions - only once when component mounts
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

    // Start silent playback immediately but only once
    if (autoPlay && !userPaused && !autoPlayAttempted) {
      setAutoPlayAttempted(true); // Mark as attempted
      playSilent();
    }

    return () => {
      if (silentAudioRef.current) {
        silentAudioRef.current.pause();
        silentAudioRef.current = null;
      }
    };
  }, []); // Empty dependency array means this only runs once

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
      console.log("Unmuted auto-play failed. Will try again on user interaction");
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

  // Try to auto-play only on initial component mount
  useEffect(() => {
    // Only try auto-play once when the audio is first loaded
    if (!isLoading && autoPlay && !isPlaying && !userPaused && !autoPlayAttempted) {
      setAutoPlayAttempted(true); // Mark that we've tried
      
      // Just attempt once instead of intervals
      const attemptPlay = async () => {
        try {
          if (audioRef.current) {
            audioRef.current.muted = false; 
            audioRef.current.volume = 0.7;
            await audioRef.current.play();
            setIsPlaying(true);
          }
        } catch (error) {
          console.log('Initial auto-play attempt failed');
        }
      };
      
      attemptPlay();
    }
  }, [isLoading, autoPlay, isPlaying, userPaused, autoPlayAttempted]);

  // For auto-play when site loads - user interaction method (once only)
  useEffect(() => {
    // Only set up once and only if not already played
    if (hasInteracted || !autoPlay || isPlaying || userPaused || autoPlayAttempted) {
      return; // Skip if already handled
    }
    
    // Try to play on first user interaction only
    const handleUserInteraction = async () => {
      setHasInteracted(true);
      setAutoPlayAttempted(true);
      
      try {
        if (audioRef.current && !isPlaying && !userPaused) {
          audioRef.current.muted = false;
          audioRef.current.volume = 0.7;
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.log("Play failed even after user interaction");
      }
      
      // Remove all listeners after first interaction
      cleanupListeners();
    };

    // Multiple event types to catch any user interaction
    const interactionEvents = [
      'click', 'touchstart', 'touchend', 'mousedown', 
      'keydown', 'scroll', 'mousemove'
    ];
    
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    const cleanupListeners = () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };

    return cleanupListeners;
  }, [autoPlay, hasInteracted, isPlaying, userPaused, autoPlayAttempted]);

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

  // Handle track loading - but prevent infinite loops with tracked flags
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Only load audio if track changed programmatically or on initial mount
    const shouldLoadAudio = trackChangedProgrammatically || !autoPlayAttempted;
    
    if (!shouldLoadAudio) {
      return; // Skip loading to prevent infinite loop
    }
    
    const loadAudio = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Update audio source directly rather than creating a new Audio element
        audio.src = tracks[currentTrack].path;
        audio.load();
        setIsLoading(false);

        // Only auto-play if it was already playing or this was a programmatic change
        if (isPlaying || trackChangedProgrammatically) {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch (playError) {
            console.error('Play error:', playError);
            setIsPlaying(false);
          }
        }
        
        // Reset the flag
        if (trackChangedProgrammatically) {
          setTrackChangedProgrammatically(false);
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
  }, [currentTrack, isPlaying, trackChangedProgrammatically]);

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
        setIsPlaying(false);
      } else {
        // If resuming playback, set to the previous position
        if (currentTimeRef.current > 0 && userPaused) {
          audio.currentTime = currentTimeRef.current;
        }
        await audio.play();
        setIsPlaying(true);
        // Clear userPaused when user manually plays
        if (userPaused) {
          setUserPaused(false);
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  };

  const nextTrack = () => {
    // Save current state of userPaused to avoid unintended auto-play
    const wasPaused = userPaused;
    
    // Set this flag to true to indicate this was an intentional track change
    setTrackChangedProgrammatically(true);
    
    // Change the track
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
    
    // Reset currentTime when changing tracks
    currentTimeRef.current = 0;
    
    // Keep userPaused state across track changes
    setUserPaused(wasPaused);
  };

  const previousTrack = () => {
    // Save current state of userPaused to avoid unintended auto-play
    const wasPaused = userPaused;
    
    // Set this flag to true to indicate this was an intentional track change
    setTrackChangedProgrammatically(true);
    
    // Change to previous track with wraparound
    setCurrentTrack((prev) => (prev === 0 ? tracks.length - 1 : prev - 1));
    
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
      previousTrack,
      audioRef,
      nextAudioRef
    }
  ];
} 