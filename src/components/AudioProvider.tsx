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
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);

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
      {/* Global Audio Player Dock */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 glass-panel border-t border-b-0 border-x-0 rounded-none p-4 z-50 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
              🎵
            </div>
            <div className="min-w-0">
              <p className="font-bold truncate text-foreground">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.author}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 flex-1">
            <button 
              onClick={() => playAudio(currentTrack.url, currentTrack.title, currentTrack.author)}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-blue-600 hover:scale-105 transition-all shadow-md"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
              ) : (
                <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <span className="text-xs text-muted-foreground border border-muted-foreground/30 px-2 py-0.5 rounded-full">
              默认温和音量
            </span>
          </div>

          <div className="flex-1 flex justify-end">
            <button 
              onClick={() => {
                stopAudio();
                setCurrentTrack(null);
              }}
              className="text-muted-foreground hover:text-foreground p-2"
              title="关闭播放器"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      )}
    </AudioPlayerContext.Provider>
  );
}
