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
    <aside className="w-64 glass border-r flex flex-col shrink-0 h-screen overflow-hidden sticky top-0 relative z-20">
      <div className="p-8 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white">
            AI
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-lg tracking-wide truncate">课程名册</h1>
            <p className="text-xs text-muted-foreground truncate opacity-80" title={repoName}>{repoName}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
        {navs.map((nav) => {
          const isActive = pathname === nav.id;
          return (
            <Link
              key={nav.id}
              href={nav.id}
              className={`group relative w-full block text-left px-4 py-3.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-foreground/[0.03] text-foreground font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                  : "text-muted-foreground hover:bg-foreground/[0.02] hover:text-foreground border border-transparent"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full shadow-[0_0_10px_var(--color-primary)]" />
              )}
              {nav.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border/50 bg-foreground/[0.01]">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground font-medium">原始记录</span>
          <strong className="text-foreground bg-foreground/5 px-2 py-0.5 rounded-md">{rawCount}</strong>
        </div>
      </div>
    </aside>
  );
}
