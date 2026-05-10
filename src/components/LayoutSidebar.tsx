"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LayoutSidebar({ repoName, rawCount }: { repoName: string, rawCount: number }) {
  const pathname = usePathname();

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
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-secondary uppercase tracking-[0.2em] font-bold">Exhibit Count</span>
          <strong className="text-2xl font-serif leading-none">{rawCount}</strong>
        </div>
      </div>
    </aside>
  );
}
