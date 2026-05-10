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
        <div className="fixed bottom-12 left-12 z-[60] animate-stagger-item">
          <div className="bg-card border border-foreground px-6 py-4 flex items-center gap-6 shadow-gallery-high min-w-[320px]">
            <div className={`shrink-0 w-12 h-12 bg-foreground text-background flex items-center justify-center font-serif text-xl ${isPlaying ? 'animate-pulse' : ''}`}>
              {isPlaying ? '♪' : '■'}
            </div>
            
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-secondary mb-1 font-bold">Now Exhibiting</p>
              <p className="text-sm font-serif truncate text-foreground leading-tight">{currentTrack.title}</p>
              <p className="text-[10px] uppercase tracking-widest text-secondary truncate mt-1">{currentTrack.author}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => playAudio(currentTrack.url, currentTrack.title, currentTrack.author)}
                className="w-10 h-10 bg-accent-vermillion text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
              >
                {isPlaying ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                ) : (
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <button 
                onClick={() => {
                  stopAudio();
                  setCurrentTrack(null);
                }}
                className="text-secondary hover:text-foreground transition-colors p-1"
                title="CLOSE"
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
