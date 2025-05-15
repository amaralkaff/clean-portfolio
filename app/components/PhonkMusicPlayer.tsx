'use client';

import React, { useEffect } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { usePhonkMusicViewModel } from '../viewModels/PhonkMusicViewModel';

interface PhonkMusicPlayerProps {
  autoPlay?: boolean;
}

const PhonkMusicPlayer: React.FC<PhonkMusicPlayerProps> = ({ 
  autoPlay = true 
}) => {
  const [state, actions] = usePhonkMusicViewModel(autoPlay);
  const { isPlaying, progress, currentTrack, isLoading, error, tracks } = state;
  const { togglePlay, nextTrack, audioRef, nextAudioRef } = actions;

  // Use effect to set audio element properties
  useEffect(() => {
    if (audioRef.current) {
      // Setting muted initially helps with auto-play policies
      audioRef.current.muted = false;
      audioRef.current.volume = 0.5;
      audioRef.current.preload = 'auto';
    }
  }, []);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray bg-opacity-80 backdrop-blur-sm text-black px-4 py-2 rounded-full flex items-center space-x-4 z-50 transition-all duration-300 hover:bg-opacity-100">
      {/* The loop attribute helps with continuous playback */}
      <audio ref={audioRef} preload="auto" muted={false} loop={false} />
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