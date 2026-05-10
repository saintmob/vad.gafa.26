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
    <aside className="w-64 glass border-r flex flex-col shrink-0 h-screen overflow-hidden sticky top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg text-white">
            AI
          </div>
          <div className="min-w-0">
            <h1 className="font-bold tracking-wide truncate">课程名册</h1>
            <p className="text-xs text-muted-foreground truncate" title={repoName}>{repoName}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navs.map((nav) => {
          const isActive = pathname === nav.id;
          return (
            <Link
              key={nav.id}
              href={nav.id}
              className={`w-full block text-left px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-primary/20 text-primary font-medium border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground border border-transparent"
              }`}
            >
              {nav.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">原始数据记录</span>
          <strong className="text-foreground">{rawCount}</strong>
        </div>
      </div>
    </aside>
  );
}
