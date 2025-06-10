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
  const [isTransitioning, setIsTransitioning] = useState(false);
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
    setIsTransitioning(true);
    setIsExpanded(!isExpanded);
    
    // Smooth transition timing
    setTimeout(() => {
      setIsTransitioning(false);
    }, 450);
    
    // Start playing music when expanded if currently paused
    if (!isExpanded && !isPlaying && !isLoading) {
      setTimeout(() => {
        togglePlay();
      }, 300);
    }
  };

  return (
    <div 
      className={`fixed transition-all duration-500 ease-in-out z-50 transform ${
        isExpanded 
          ? "top-2 left-[50%] -translate-x-1/2 scale-100"
          : "top-6 left-8 w-16 h-16 scale-100"
      } ${isTransitioning ? 'will-change-transform' : ''}`}
      style={{ 
        transformOrigin: isExpanded ? 'center top' : 'left top',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      {/* Hidden audio elements */}
      <audio ref={audioRef} preload="auto" muted={false} loop={false} />
      <audio ref={nextAudioRef} preload="auto" style={{ display: 'none' }} />
      
      {isExpanded ? (
        // Expanded player
        <div className={`px-4 py-2 rounded-lg flex items-center space-x-4 transition-all duration-500 ease-out transform backdrop-blur-md ${isTransitioning ? 'will-change-transform scale-105' : 'scale-100'}`}>
          <button 
            onClick={togglePlay}
            disabled={isLoading} 
            className={`focus:outline-none transition-all duration-300 ease-out transform hover:scale-110 active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:rotate-12'}`}
          >
            {isPlaying ? <Pause size={18} className={theme === 'dark' ? 'text-white' : ''} /> : <Play size={18} className={theme === 'dark' ? 'text-white' : ''} />}
          </button>

          <div className="flex flex-col w-48 items-center">
            <div className={`text-xs font-medium truncate text-center w-full ${theme === 'dark' ? 'text-white' : ''}`}>
              {isLoading ? 'Loading...' : error || tracks[currentTrack].name}
            </div>
            <div className={`w-full h-1 rounded-full mt-1 overflow-hidden backdrop-blur-sm ${theme === 'dark' ? 'bg-white/20' : 'bg-black/20'}`}>
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${theme === 'dark' ? 'from-blue-400 via-purple-400 to-pink-400' : 'from-blue-600 via-purple-600 to-pink-600'} shadow-sm`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button 
            onClick={nextTrack}
            disabled={isLoading} 
            className={`focus:outline-none transition-all duration-300 ease-out transform hover:scale-110 active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:translate-x-1'}`}
          >
            <SkipForward size={18} className={theme === 'dark' ? 'text-white' : ''} />
          </button>
          
          <button 
            onClick={toggleExpanded} 
            className={`focus:outline-none transition-all duration-300 ease-out transform hover:scale-110 active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:-rotate-12'}`}
          >
            <Minimize2 size={18} className={theme === 'dark' ? 'text-white' : ''} />
          </button>
        </div>
      ) : (
        // Collapsed player
        <div 
          onClick={toggleExpanded} 
          className={`rounded-lg w-full h-full flex items-center justify-center cursor-pointer transition-all duration-500 ease-out relative overflow-hidden transform backdrop-blur-md ${pulseAnimation ? 'scale-105' : 'scale-100'} ${isTransitioning ? 'will-change-transform rotate-1' : 'rotate-0'}`}
        >
          <div className={`absolute top-0 left-0 right-0 h-1 overflow-hidden backdrop-blur-sm ${theme === 'dark' ? 'bg-white/20' : 'bg-black/20'}`}>
            <div 
              className={`h-full transition-all duration-500 ease-out bg-gradient-to-r ${theme === 'dark' ? 'from-blue-400 via-purple-400 to-pink-400' : 'from-blue-600 via-purple-600 to-pink-600'} shadow-sm`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center h-6 space-x-0.5 mb-1">
              <div 
                className={`w-1 rounded-sm transition-all duration-700 ease-out ${theme === 'dark' ? 'bg-gradient-to-t from-blue-400 to-purple-400' : 'bg-gradient-to-t from-blue-600 to-purple-600'} shadow-sm transform ${isTransitioning ? 'scale-y-125' : 'scale-y-100'}`}
                style={{ 
                  height: isPlaying ? `${visualizerBars[0] * 24}px` : '16px',
                  transformOrigin: 'bottom'
                }}
              ></div>
              <div 
                className={`w-1 rounded-sm transition-all duration-700 ease-out ${theme === 'dark' ? 'bg-gradient-to-t from-purple-400 to-pink-400' : 'bg-gradient-to-t from-purple-600 to-pink-600'} shadow-sm transform ${isTransitioning ? 'scale-y-125' : 'scale-y-100'}`}
                style={{ 
                  height: isPlaying ? `${visualizerBars[1] * 24}px` : '10px',
                  transformOrigin: 'bottom'
                }}
              ></div>
              <div 
                className={`w-1 rounded-sm transition-all duration-700 ease-out ${theme === 'dark' ? 'bg-gradient-to-t from-pink-400 to-blue-400' : 'bg-gradient-to-t from-pink-600 to-blue-600'} shadow-sm transform ${isTransitioning ? 'scale-y-125' : 'scale-y-100'}`}
                style={{ 
                  height: isPlaying ? `${visualizerBars[2] * 24}px` : '5px',
                  transformOrigin: 'bottom'
                }}
              ></div>
            </div>
            
            <div className={`text-[8px] font-bold ${theme === 'dark' ? 'text-white' : 'text-black'} ${isPlaying ? 'opacity-100' : 'opacity-70'}`}>
              {isPlaying ? "NOW PLAYING" : "CLICK TO PLAY"}
            </div>
          </div>
          
          {/* Subtle glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br opacity-0 hover:opacity-20 transition-opacity duration-700 rounded-lg ${theme === 'dark' ? 'from-blue-500/30 via-purple-500/30 to-pink-500/30' : 'from-blue-600/20 via-purple-600/20 to-pink-600/20'} ${pulseAnimation && !isPlaying ? `ring-2 ring-gradient-to-r ${theme === 'dark' ? 'ring-purple-400/40' : 'ring-purple-600/40'}` : ''}`}></div>
        </div>
      )}
    </div>
  );
};

export default PhonkMusicPlayer;