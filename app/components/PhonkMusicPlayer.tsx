'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Minimize2 } from 'lucide-react';
import { usePhonkMusicViewModel } from '../viewModels/PhonkMusicViewModel';

interface PhonkMusicPlayerProps {
  autoPlay?: boolean;
}

const PhonkMusicPlayer: React.FC<PhonkMusicPlayerProps> = ({ 
  autoPlay = true 
}) => {
  const [state, actions] = usePhonkMusicViewModel(autoPlay);
  const { isPlaying, progress, currentTrack, isLoading, error, tracks } = state;
  const { togglePlay, nextTrack, previousTrack, audioRef, nextAudioRef } = actions;
  const initCompleteRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState([0.3, 0.8, 0.5]);

  // Set up audio element only once when the component mounts
  useEffect(() => {
    if (audioRef.current) {
      // Setting volume and preload properties
      audioRef.current.muted = false;
      audioRef.current.volume = 0.5;
      audioRef.current.preload = 'auto';
    }
  }, []);

  // Animate visualizer bars
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setVisualizerBars([
        Math.random() * 0.7 + 0.3,
        Math.random() * 0.7 + 0.3,
        Math.random() * 0.7 + 0.3
      ]);
    }, 300);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`fixed transition-all duration-300 z-50 ${
        isExpanded 
          ? "top-4 left-1/2 transform -translate-x-1/2"
          : "bottom-8 right-8 w-16 h-16"
      }`}
    >
      {/* Hidden audio elements */}
      <audio ref={audioRef} preload="auto" muted={false} loop={false} />
      <audio ref={nextAudioRef} preload="auto" style={{ display: 'none' }} />
      
      {isExpanded ? (
        // Expanded player
        <div className="bg-gray bg-opacity-80 backdrop-blur-sm text-black px-4 py-2 rounded-full flex items-center space-x-4 transition-all duration-300 hover:bg-opacity-100">
          <button 
            onClick={previousTrack}
            disabled={isLoading} 
            className={`focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <SkipBack size={18} />
          </button>
          
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
          
          <button 
            onClick={toggleExpanded} 
            className={`focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Minimize2 size={18} />
          </button>
        </div>
      ) : (
        // Collapsed player
        <div 
          onClick={toggleExpanded} 
          className="bg-gray bg-opacity-80 backdrop-blur-sm rounded-lg w-full h-full flex items-center justify-center cursor-pointer hover:bg-opacity-100 transition-colors relative overflow-hidden shadow-lg"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden">
            <div 
              className="h-full bg-black transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-center h-6 space-x-0.5">
            <div 
              className="w-1 bg-black rounded-sm transition-all duration-300"
              style={{ height: isPlaying ? `${visualizerBars[0] * 24}px` : '16px' }}
            ></div>
            <div 
              className="w-1 bg-black rounded-sm transition-all duration-300"
              style={{ height: isPlaying ? `${visualizerBars[1] * 24}px` : '10px' }}
            ></div>
            <div 
              className="w-1 bg-black rounded-sm transition-all duration-300"
              style={{ height: isPlaying ? `${visualizerBars[2] * 24}px` : '5px' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhonkMusicPlayer;