'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, Minimize2 } from 'lucide-react';
import { usePhonkMusicViewModel } from '../viewModels/PhonkMusicViewModel';
import { useTheme } from '../context/ThemeContext';

interface PhonkMusicPlayerProps {
  autoPlay?: boolean;
}

const PhonkMusicPlayer: React.FC<PhonkMusicPlayerProps> = ({ 
  autoPlay = true 
}) => {
  const [state, actions] = usePhonkMusicViewModel(autoPlay);
  const { isPlaying, progress, currentTrack, isLoading, error, tracks } = state;
  const { togglePlay, nextTrack, audioRef, nextAudioRef } = actions;
  const initCompleteRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState([0.3, 0.8, 0.5]);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const { theme } = useTheme();

  // Aggressive audio setup and immediate play attempt
  useEffect(() => {
    if (audioRef.current) {
      // Configure audio for best auto-play success
      audioRef.current.muted = false;
      audioRef.current.volume = 0.5;
      audioRef.current.preload = 'auto';
      audioRef.current.autoplay = true;
      
      // Multiple immediate play strategies
      const aggressiveAutoPlay = async () => {
        if (!audioRef.current) return;
        
        // Strategy 1: Direct play
        try {
          await audioRef.current.play();
          return;
        } catch (error) {
          console.log("Direct play failed, trying alternative approaches");
        }
        
        // Strategy 2: Muted play then unmute
        try {
          audioRef.current.muted = true;
          await audioRef.current.play();
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.muted = false;
              audioRef.current.volume = 0.5;
            }
          }, 100);
          return;
        } catch (error) {
          console.log("Muted play failed");
        }
        
        // Strategy 3: Set up for immediate interaction response
        const playOnInteraction = async () => {
          try {
            if (audioRef.current) {
              audioRef.current.muted = false;
              audioRef.current.volume = 0.5;
              await audioRef.current.play();
            }
          } catch (error) {
            console.log("Interaction play failed");
          }
        };
        
        // Add ultra-responsive interaction listener
        const events = ['click', 'touchstart', 'keydown', 'mousemove'];
        events.forEach(event => {
          document.addEventListener(event, playOnInteraction, { 
            once: true, 
            passive: true 
          });
        });
      };
      
      // Execute immediately and on next tick
      aggressiveAutoPlay();
      setTimeout(aggressiveAutoPlay, 10);
      setTimeout(aggressiveAutoPlay, 100);
    }
  }, [audioRef]);

  // Auto-play next track when current track ends
  useEffect(() => {
    const currentAudio = audioRef.current;
    if (!currentAudio) return;

    const handleEnded = () => {
      nextTrack();
    };

    currentAudio.addEventListener('ended', handleEnded);

    return () => {
      currentAudio.removeEventListener('ended', handleEnded);
    };
  }, [nextTrack, audioRef]);

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

  // Pulse animation for minimized state
  useEffect(() => {
    if (isExpanded) return;
    
    const pulseInterval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, 2000);
    
    return () => clearInterval(pulseInterval);
  }, [isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    // Start playing music when expanded if currently paused
    if (!isExpanded && !isPlaying && !isLoading) {
      togglePlay();
    }
  };

  return (
    <div 
      className={`fixed transition-all duration-300 z-50 ${
        isExpanded 
          ? "top-2 left-[50%] transform -translate-x-1/2"
          : "top-6 left-8 w-16 h-16"
      }`}
    >
      {/* Hidden audio elements */}
      <audio ref={audioRef} preload="auto" muted={false} loop={false} />
      <audio ref={nextAudioRef} preload="auto" style={{ display: 'none' }} />
      
      {isExpanded ? (
        // Expanded player
        <div className="bg-gray bg-opacity-80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-4 transition-all duration-300 hover:bg-opacity-100">
          <button 
            onClick={togglePlay}
            disabled={isLoading} 
            className={`focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPlaying ? <Pause size={18} className={theme === 'dark' ? 'text-white' : ''} /> : <Play size={18} className={theme === 'dark' ? 'text-white' : ''} />}
          </button>

          <div className="flex flex-col w-48 items-center">
            <div className={`text-xs font-medium truncate text-center w-full ${theme === 'dark' ? 'text-white' : ''}`}>
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
            <SkipForward size={18} className={theme === 'dark' ? 'text-white' : ''} />
          </button>
          
          <button 
            onClick={toggleExpanded} 
            className={`focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Minimize2 size={18} className={theme === 'dark' ? 'text-white' : ''} />
          </button>
        </div>
      ) : (
        // Collapsed player
        <div 
          onClick={toggleExpanded} 
          className={`bg-gray bg-opacity-80 backdrop-blur-sm rounded-lg w-full h-full flex items-center justify-center cursor-pointer hover:bg-opacity-100 transition-all duration-500 relative overflow-hidden shadow-lg hover:shadow-xl ${pulseAnimation ? 'scale-105' : 'scale-100'}`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden">
            <div 
              className={`h-full ${theme === 'dark' ? 'bg-white' : 'bg-black'} transition-all duration-300 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center h-6 space-x-0.5 mb-1">
              <div 
                className={`w-1 ${theme === 'dark' ? 'bg-white' : 'bg-black'} rounded-sm transition-all duration-300`}
                style={{ height: isPlaying ? `${visualizerBars[0] * 24}px` : '16px' }}
              ></div>
              <div 
                className={`w-1 ${theme === 'dark' ? 'bg-white' : 'bg-black'} rounded-sm transition-all duration-300`}
                style={{ height: isPlaying ? `${visualizerBars[1] * 24}px` : '10px' }}
              ></div>
              <div 
                className={`w-1 ${theme === 'dark' ? 'bg-white' : 'bg-black'} rounded-sm transition-all duration-300`}
                style={{ height: isPlaying ? `${visualizerBars[2] * 24}px` : '5px' }}
              ></div>
            </div>
            
            <div className={`text-[8px] font-bold ${theme === 'dark' ? 'text-white' : 'text-black'} ${isPlaying ? 'opacity-100' : 'opacity-70'}`}>
              {isPlaying ? "NOW PLAYING" : "CLICK TO PLAY"}
            </div>
          </div>
          
          {/* Subtle glow effect */}
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-white' : 'bg-black'} opacity-0 hover:opacity-10 transition-opacity duration-300 rounded-lg ${pulseAnimation && !isPlaying ? `ring-2 ${theme === 'dark' ? 'ring-white' : 'ring-black'} ring-opacity-30` : ''}`}></div>
        </div>
      )}
    </div>
  );
};

export default PhonkMusicPlayer;