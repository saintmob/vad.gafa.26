"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface AudioContextType {
  playAudio: (url: string, title: string, author: string) => void;
  stopAudio: () => void;
  currentTrack: { url: string; title: string; author: string } | null;
  isPlaying: boolean;
}

const AudioPlayerContext = createContext<AudioContextType | null>(null);

export function useAudio() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<{ url: string; title: string; author: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Initialize audio element
    const audio = new Audio();
    // Removed audio.crossOrigin = "anonymous" to fix GitHub AWS S3 CORS issues
    audio.volume = 0.6; // Set a gentle default volume to prevent jump scares since we can't use Web Audio API compressor
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const playAudio = (url: string, title: string, author: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.url === url) {
      // Toggle play/pause if it's the same track
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    } else {
      // Play new track
      audio.src = url;
      audio.play();
      setCurrentTrack({ url, title, author });
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <AudioPlayerContext.Provider value={{ playAudio, stopAudio, currentTrack, isPlaying }}>
      {children}
      {/* Global Audio Player Pill */}
      {currentTrack && (
        <div className="fixed bottom-6 left-6 z-[60] animate-stagger-item">
          <div className="glass-panel px-4 py-3 flex items-center gap-4 shadow-2xl min-w-[280px] max-w-[360px] border-primary/20">
            <div className={`shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-inner ${isPlaying ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate text-foreground leading-tight">{currentTrack.title}</p>
              <p className="text-[11px] text-muted-foreground truncate opacity-80 mt-0.5">{currentTrack.author}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => playAudio(currentTrack.url, currentTrack.title, currentTrack.author)}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                ) : (
                  <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <button 
                onClick={() => {
                  stopAudio();
                  setCurrentTrack(null);
                }}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                title="关闭"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </AudioPlayerContext.Provider>
  );
}
