import React, { useState, useRef, useEffect, ReactElement, useCallback, useMemo } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';

const PhonkMusicPlayer: React.FC = (): ReactElement => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const tracks = useMemo(() => [
    {path: '/music/X-TALI.mp3', name: 'X-TALI'},
    { path: '/music/Montagem Do Cosmos.mp3', name: 'Montagem Do Cosmos' },
    { path: '/music/AURA.mp3', name: 'AURA' },
    { path: '/music/EEYUH! x Fluxxwave.mp3', name: 'EEYUH! x Fluxxwave' },
    { path: '/music/FUNK UNIVERSO.mp3', name: 'FUNK UNIVERSO' },
    { path: '/music/LDRR.mp3', name: 'LDRR' },
  ], []);

  const handlePlay = useCallback(async (audio: HTMLAudioElement | null) => {
    if (!audio || isLoading) return null;
    
    try {
      setIsLoading(true);
      
      await playPromiseRef.current?.catch(() => null);
      
      audio.currentTime = 0;
      audio.src = tracks[currentTrack].path;
      
      await new Promise<void>((resolve) => {
        const canPlayHandler = () => {
          audio?.removeEventListener('canplay', canPlayHandler);
          resolve();
        };
        audio?.addEventListener('canplay', canPlayHandler);
      });

      playPromiseRef.current = audio?.play() ?? null;
      await playPromiseRef.current;
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      return null;
    } finally {
      setIsLoading(false);
      playPromiseRef.current = null;
    }
  }, [isLoading, currentTrack, tracks]);

  const handlePause = useCallback(async (audio: HTMLAudioElement | null) => {
    if (!audio || isLoading) return null;
    
    try {
      await playPromiseRef.current?.catch(() => null);
      audio?.pause();
      setIsPlaying(false);
    } catch {
      return null;
    } finally {
      playPromiseRef.current = null;
    }
  }, [isLoading]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTrackChange = async () => {
      try {
        await playPromiseRef.current?.catch(() => null);
        audio?.pause();

        audio.src = tracks[currentTrack].path;
        isPlaying && await handlePlay(audio);
      } catch {
        setIsPlaying(false);
      }
    };

    handleTrackChange();

    const currentAudio = audio;
    return () => {
      playPromiseRef.current?.catch(() => null);
      currentAudio?.pause();
    };
  }, [currentTrack, isPlaying, handlePlay, tracks]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const value = (audio.currentTime / (audio.duration || 1)) * 100;
      setProgress(value || 0);
    };

    const currentAudio = audio;
    currentAudio.addEventListener('timeupdate', updateProgress);
    return () => currentAudio.removeEventListener('timeupdate', updateProgress);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentAudio = audio;
    return () => {
      playPromiseRef.current?.catch(() => null);
      currentAudio.pause();
      currentAudio.src = '';
      setIsPlaying(false);
      setIsLoading(false);
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    try {
      if (isPlaying) {
        await handlePause(audio);
      } else {
        await handlePlay(audio);
      }
    } catch {
      setIsPlaying(false);
    }
  }, [isPlaying, isLoading, handlePlay, handlePause]);

  const nextTrack = useCallback(() => {
    if (isLoading) return;
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  }, [isLoading, tracks.length]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray bg-opacity-80 backdrop-blur-sm text-black px-4 rounded-full flex items-center space-x-4 z-50 transition-all duration-300 hover:bg-opacity-100">
      <audio 
        ref={audioRef}
        preload="auto"
      />
      <button 
        onClick={togglePlay}
        disabled={isLoading}
        className="focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 disabled:opacity-50"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <div className="flex flex-col w-48 items-center">
        <div className="text-xs font-medium truncate text-center w-full">
          {tracks[currentTrack].name}
        </div>
        <div className="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-black rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button 
        onClick={nextTrack}
        disabled={isLoading}
        className="focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 disabled:opacity-50"
      >
        <SkipForward size={18} />
      </button>
    </div>
  );
};

export default PhonkMusicPlayer;