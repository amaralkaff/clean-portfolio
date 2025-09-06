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

  // Simplified audio setup with user interaction handling
  useEffect(() => {
    if (!audioRef.current || !autoPlay) return;
    
    const audio = audioRef.current;
    audio.volume = 0.5;
    audio.preload = 'auto';
    
    // Single play attempt on load
    const attemptAutoPlay = async () => {
      try {
        await audio.play();
      } catch (error) {
        // Set up single interaction listener for browsers that block autoplay
        const playOnFirstInteraction = async () => {
          try {
            await audio.play();
            // Remove listener after successful play
            document.removeEventListener('click', playOnFirstInteraction);
            document.removeEventListener('touchstart', playOnFirstInteraction);
          } catch (e) {
            console.log('Audio play failed:', e);
          }
        };
        
        document.addEventListener('click', playOnFirstInteraction, { once: true, passive: true });
        document.addEventListener('touchstart', playOnFirstInteraction, { once: true, passive: true });
      }
    };
    
    attemptAutoPlay();
  }, [audioRef, autoPlay]);

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

  // Optimized visualizer bars with requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) return;
    
    let animationId: number;
    let lastUpdate = 0;
    
    const updateBars = (timestamp: number) => {
      if (timestamp - lastUpdate > 400) { // Reduce update frequency from 300ms to 400ms
        setVisualizerBars([
          Math.random() * 0.7 + 0.3,
          Math.random() * 0.7 + 0.3,
          Math.random() * 0.7 + 0.3
        ]);
        lastUpdate = timestamp;
      }
      animationId = requestAnimationFrame(updateBars);
    };
    
    animationId = requestAnimationFrame(updateBars);
    
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  // Optimized pulse animation with longer intervals
  useEffect(() => {
    if (isExpanded) return;
    
    const pulseInterval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, 3000); // Increased from 2000ms to 3000ms to reduce main thread usage
    
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
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
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
            aria-label="Next track" 
            className={`focus:outline-none transition-all duration-300 ease-out transform hover:scale-110 active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:translate-x-1'}`}
          >
            <SkipForward size={18} className={theme === 'dark' ? 'text-white' : ''} />
          </button>
          
          <button 
            onClick={toggleExpanded}
            aria-label="Minimize music player" 
            className={`focus:outline-none transition-all duration-300 ease-out transform hover:scale-110 active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:-rotate-12'}`}
          >
            <Minimize2 size={18} className={theme === 'dark' ? 'text-white' : ''} />
          </button>
        </div>
      ) : (
        // Collapsed player
        <div 
          onClick={toggleExpanded}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleExpanded()}
          aria-label="Expand music player" 
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

export default React.memo(PhonkMusicPlayer);