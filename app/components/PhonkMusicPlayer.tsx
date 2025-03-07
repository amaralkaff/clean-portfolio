import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';

const PhonkMusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);

  const tracks = [
    {path: '/music/X-TALI.mp3', name: 'X-TALI'},
    { path: '/music/Montagem Do Cosmos.mp3', name: 'Montagem Do Cosmos' },
    { path: '/music/AURA.mp3', name: 'AURA' },
    { path: '/music/EEYUH! x Fluxxwave.mp3', name: 'EEYUH! x Fluxxwave' },
    { path: '/music/FUNK UNIVERSO.mp3', name: 'FUNK UNIVERSO' },
    { path: '/music/LDRR.mp3', name: 'LDRR' },
  ];

  // Preload next track
  useEffect(() => {
    const nextTrackIndex = (currentTrack + 1) % tracks.length;
    if (nextAudioRef.current) {
      nextAudioRef.current.src = tracks[nextTrackIndex].path;
      nextAudioRef.current.load();
    }
  }, [currentTrack]);

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
    if (!audio || isLoading) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
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
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray bg-opacity-80 backdrop-blur-sm text-black px-4 py-2 rounded-full flex items-center space-x-4 z-50 transition-all duration-300 hover:bg-opacity-100">
      <audio ref={audioRef} preload="auto" />
      <audio ref={nextAudioRef} preload="auto" style={{ display: 'none' }} />
      
      <button 
        onClick={togglePlay}
        disabled={isLoading} 
        className={`focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>

      <div className="flex flex-col w-48 items-center">
        <div className="text-xs font-medium truncate text-center w-full">
          {isLoading ? 'Loading...' : error || tracks[currentTrack].name}
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
        className={`focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <SkipForward size={18} />
      </button>
    </div>
  );
};

export default PhonkMusicPlayer;