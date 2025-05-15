'use client';

import React, { useEffect } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';
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

  // Let the ViewModel handle audio configuration
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.preload = 'auto';
      audioRef.current.volume = 0.7;
    }
  }, []);

  // Auto-stop music after 5 minutes if user hasn't interacted with player
  useEffect(() => {
    if (isPlaying) {
      const autoStopTimer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          togglePlay();
        }
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearTimeout(autoStopTimer);
    }
  }, [isPlaying, togglePlay]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 backdrop-blur-sm text-white px-4 py-3 rounded-full flex items-center space-x-4 z-50 transition-all duration-300 hover:bg-opacity-100 shadow-lg">
      {/* Simple audio elements - let the ViewModel handle the complexity */}
      <audio 
        ref={audioRef} 
        preload="auto" 
        playsInline 
      />
      <audio 
        ref={nextAudioRef} 
        preload="auto" 
        style={{ display: 'none' }} 
      />
      
      <button 
        onClick={togglePlay}
        disabled={isLoading} 
        className={`focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isPlaying ? "Pause music" : "Play music"}
        title={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? <Pause size={20} className="text-red-400" /> : <Play size={20} className="text-green-400" />}
      </button>

      <div className="flex flex-col w-48 items-center">
        <div className="text-xs font-medium truncate text-center w-full">
          {isLoading ? 'Loading...' : error || tracks[currentTrack].name}
        </div>
        <div className="w-full h-1 bg-gray-600 rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button 
        onClick={nextTrack}
        disabled={isLoading} 
        className={`focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Next track"
        title="Next track"
      >
        <SkipForward size={20} className="text-blue-300" />
      </button>

      <button 
        onClick={togglePlay}
        disabled={isLoading} 
        className={`focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isPlaying ? "Stop music" : "Start music"}
        title={isPlaying ? "Stop music" : "Start music"}
      >
        {isPlaying ? 
          <VolumeX size={20} className="text-red-500" /> : 
          <Volume2 size={20} className="text-green-500" />
        }
      </button>
    </div>
  );
};

export default PhonkMusicPlayer;