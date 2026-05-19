"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAudio } from "./AudioProvider";

export function LayoutSidebar({ repoName, rawCount }: { repoName: string, rawCount: number }) {
  const pathname = usePathname();
  const { currentTrack, isPlayerCollapsed, setIsPlayerCollapsed } = useAudio();

  const navs = [
    { id: "/", label: "师生名册" },
    { id: "/review", label: "数据修正" },
    { id: "/issues", label: "原始 Issues" },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 h-screen overflow-hidden sticky top-0 relative z-20">
      <div className="p-10 border-b border-border">
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 bg-foreground flex items-center justify-center font-serif text-2xl text-background">
            M
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-serif tracking-tight leading-none mb-1">Museé</h1>
            <p className="text-[10px] text-secondary uppercase tracking-[0.2em] font-medium opacity-80" title={repoName}>Archive</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-8 space-y-4 overflow-y-auto">
        <p className="text-[10px] text-secondary uppercase tracking-[0.2em] mb-6 font-bold">Navigation</p>
        {navs.map((nav) => {
          const isActive = pathname === nav.id;
          return (
            <Link
              key={nav.id}
              href={nav.id}
              className={`group relative w-full block text-left py-2 transition-all duration-300 ${
                isActive
                  ? "text-foreground font-semibold"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              <span className={`text-sm tracking-wide ${isActive ? 'underline underline-offset-8 decoration-accent-vermillion decoration-2' : ''}`}>
                {nav.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t border-border bg-background">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] text-secondary uppercase tracking-[0.2em] font-bold">Exhibit Count</span>
            <strong className="text-2xl font-serif leading-none">{rawCount}</strong>
          </div>
          {currentTrack && (
            <button
              onClick={() => setIsPlayerCollapsed(!isPlayerCollapsed)}
              className="shrink-0 w-10 h-10 rounded-full bg-card border border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-all active:scale-95"
              title={isPlayerCollapsed ? "EXPAND PLAYER" : "COLLAPSE PLAYER"}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                {isPlayerCollapsed ? (
                  <path d="M8 5v14l11-7z"/>
                ) : (
                  <path d="M19 9l-7 7-7-7"/>
                )}
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
