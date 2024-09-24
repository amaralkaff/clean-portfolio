import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';

const PhonkMusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tracks = [
    { path: '/music/Montagem Do Cosmos.mp3', name: 'Montagem Do Cosmos' },
    { path: '/music/AURA.mp3', name: 'AURA' },
    { path: '/music/EEYUH! x Fluxxwave.mp3', name: 'EEYUH! x Fluxxwave' },
    { path: '/music/FUNK UNIVERSO.mp3', name: 'FUNK UNIVERSO' },
    { path: '/music/LDRR.mp3', name: 'LDRR' },
  ];

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.src = tracks[currentTrack].path;
      if (isPlaying) {
        audio.play().catch(error => console.error("Error playing audio:", error));
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.play().catch(error => console.error("Error playing audio:", error));
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateProgress = () => {
        const value = (audio.currentTime / audio.duration) * 100;
        setProgress(value);
      };
      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);
    }
  }, []);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray bg-opacity-80 backdrop-blur-sm text-black px-4 py-2 rounded-full flex items-center space-x-4 z-50 transition-all duration-300 hover:bg-opacity-100">
      <audio ref={audioRef}>
        <source src={tracks[currentTrack].path} type="audio/mpeg" />
      </audio>
      <button 
        onClick={togglePlay} 
        className="focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <div className="flex flex-col w-48 items-center"> {/* Added items-center here */}
        <div className="text-xs font-medium truncate text-center w-full"> {/* Added text-center and w-full here */}
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
        className="focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110"
      >
        <SkipForward size={18} />
      </button>
    </div>
  );
};

export default PhonkMusicPlayer;