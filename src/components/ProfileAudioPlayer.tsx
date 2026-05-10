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
    <div className="glass-panel p-6 mb-8 bg-primary/10 border-primary/20 flex flex-col md:flex-row items-center gap-6">
      <div className="flex-1">
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
          <span>🎵</span> 主题曲发现！
        </h3>
        <p className="text-sm text-muted-foreground">
          从该同学的作业提交中找到了音频，已将其添加至全局播放器。
        </p>
      </div>
      <button 
        onClick={() => playAudio(audioUrl, title, author)}
        className="btn-primary px-6 py-2.5 rounded-full font-medium flex items-center gap-2 shadow-lg"
      >
        {isCurrentTrack && isPlaying ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
            暂停播放
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            {autoplayFailed ? "点击播放 (浏览器限制自动播放)" : "播放主题曲"}
          </>
        )}
      </button>
    </div>
  );
}
