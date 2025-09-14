'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

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
  const currentTimeRef = useRef<number>(0);

  const tracks: MusicTrack[] = useMemo(() => [
    { path: '/music/MONTAGEM XONADA.mp3', name: 'MONTAGEM XONADA' },
    { path: '/music/FUNK MI CAMINO.mp3', name: 'FUNK MI CAMINO' },
    { path: '/music/X-TALI.mp3', name: 'X-TALI'},
    { path: '/music/Montagem Do Cosmos.mp3', name: 'Montagem Do Cosmos' },
    { path: '/music/AURA.mp3', name: 'AURA' },
    { path: '/music/EEYUH! x Fluxxwave.mp3', name: 'EEYUH! x Fluxxwave' },
    { path: '/music/FUNK UNIVERSO.mp3', name: 'FUNK UNIVERSO' },
    { path: '/music/LDRR.mp3', name: 'LDRR' },
  ], []);

  // Simple autoplay attempt once on load
  useEffect(() => {
    if (!autoPlay || autoPlayAttempted || isLoading) return;
    
    setAutoPlayAttempted(true);
    
    const tryAutoPlay = async () => {
      try {
        if (audioRef.current) {
          audioRef.current.volume = 0.5;
          audioRef.current.muted = false;
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        // Autoplay failed - wait for user interaction
        console.log("Autoplay blocked by browser - waiting for user interaction");
      }
    };

    tryAutoPlay();
  }, [autoPlay, autoPlayAttempted, isLoading, audioRef]);

  // Force unmuted playback after silent play succeeds
  const forceUnmutedPlayback = async () => {
    if (!mutedAutoPlayStarted || !audioRef.current || isPlaying || userPaused) return;
    
    try {
      // First, try to play with the current audio
      if (audioRef.current) {
        // Make sure it's not muted
        audioRef.current.muted = false;
        audioRef.current.volume = 0.5;
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
  }, [currentTrack, tracks]);


  // Single user interaction handler for autoplay
  useEffect(() => {
    if (!autoPlay || isPlaying || autoPlayAttempted) return;
    
    const handleFirstInteraction = async () => {
      try {
        if (audioRef.current && !isPlaying) {
          await audioRef.current.play();
          setIsPlaying(true);
          setUserPaused(false);
        }
      } catch (error) {
        console.log("Play failed after user interaction");
      }
    };

    // Simple click handler only
    document.addEventListener('click', handleFirstInteraction, { 
      once: true, 
      passive: true 
    });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, [autoPlay, isPlaying, autoPlayAttempted, audioRef]);

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

  // Define nextTrack before it's used in useEffect
  const nextTrack = useCallback(() => {
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
  }, [userPaused, tracks.length]);

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
  }, [currentTrack, isPlaying, trackChangedProgrammatically, autoPlayAttempted, tracks, nextTrack]);

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

  const previousTrack = useCallback(() => {
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
  }, [userPaused, tracks.length]);

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