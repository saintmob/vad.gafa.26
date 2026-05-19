"use client";

import { useEffect, useState } from "react";
import { useAudio } from "./AudioProvider";

export function ProfileAudioPlayer({ audioUrl, title, author }: { audioUrl: string, title: string, author: string }) {
  const { playAudio, currentTrack, isPlaying } = useAudio();
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  useEffect(() => {
    // Try to autoplay when component mounts
    // Using setTimeout to ensure AudioContext is ready or DOM is painted
    const timer = setTimeout(() => {
      try {
        if (currentTrack?.url !== audioUrl) {
          playAudio(audioUrl, title, author);
        }
      } catch (e) {
        console.warn("Autoplay blocked by browser", e);
        setAutoplayFailed(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [audioUrl, title, author, playAudio, currentTrack?.url]);

  const isCurrentTrack = currentTrack?.url === audioUrl;

  return (
    <div className="bg-card border border-foreground p-10 flex flex-col md:flex-row items-center gap-10 shadow-gallery-low">
      <div className="flex-1">
        <h3 className="text-2xl font-serif mb-3">{title}</h3>
        <p className="text-xs uppercase tracking-widest text-secondary leading-relaxed">
          {author}
        </p>
      </div>
      <button 
        onClick={() => playAudio(audioUrl, title, author)}
        className="btn-vermillion min-w-[200px]"
      >
        {isCurrentTrack && isPlaying ? (
          <>
            <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
            HALT EXHIBIT
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-3 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            {autoplayFailed ? "ACTIVATE AUDIO" : "BEGIN EXHIBITION"}
          </>
        )}
      </button>
    </div>
  );
}
