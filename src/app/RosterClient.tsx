"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export function RosterClient({ initialData }: { initialData: any }) {
  const [query, setQuery] = useState("");

  const filteredPeople = useMemo(() => {
    if (!query) return initialData.people;
    return initialData.people.filter((item: any) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  }, [initialData.people, query]);

  return (
    <>
      <PageHeader
        title="师生名册"
        description="展示头像、GitHub 名称、真实姓名和作业提交概况。"
        query={query}
        setQuery={setQuery}
      />
      
      {/* Stats */}
      <div className="px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-border/50 bg-foreground/[0.01]">
        <div className="glass-panel p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-medium">总成员</span>
          <strong className="text-4xl font-light tracking-tight">{initialData.counts.people}</strong>
        </div>
        <div className="glass-panel p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-500" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-medium">待校对项</span>
          <strong className="text-4xl font-light tracking-tight text-red-500">{initialData.counts.needsReview}</strong>
        </div>
        <div className="glass-panel p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-medium">人员修正</span>
          <strong className="text-4xl font-light tracking-tight">{initialData.counts.correctedPeople}</strong>
        </div>
        <div className="glass-panel p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-medium">Issue 修正</span>
          <strong className="text-4xl font-light tracking-tight">{initialData.counts.correctedIssues}</strong>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPeople.map((person: any, index: number) => (
            <div 
              key={person.login} 
              className="glass-panel p-6 group animate-stagger-item relative overflow-hidden flex flex-col"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center gap-5 mb-5 min-w-0">
                <div className="relative shrink-0">
                  <img src={person.avatarUrl} alt={person.login} className="w-16 h-16 rounded-2xl ring-2 ring-border group-hover:ring-primary/30 transition-all duration-300 shadow-sm" />
                  <div className="absolute inset-0 rounded-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] pointer-events-none" />
                  {person.hasMusic && (
                    <div className="absolute -right-2 -top-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] shadow-lg animate-pulse">
                      🎵
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-xl truncate tracking-tight flex items-center gap-2">
                    {person.realName || "待校对"}
                  </h3>
                  <a 
                    href={`https://github.com/${person.login}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-sm link-external truncate block mt-1"
                    title={`@${person.login}`}
                  >
                    @{person.login}
                  </a>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2 mb-4">
                <span className="chip bg-primary/10 text-primary border-primary/20">{person.role}</span>
                <span className="chip">{person.issueCount} issues</span>
                {person.manuallyCorrected && <span className="chip text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10">已修正</span>}
              </div>
              <div className="relative z-10 flex flex-wrap gap-1.5 mb-5 flex-1 content-start">
                {person.categories.slice(0, 3).map((c: string) => <span key={c} className="chip bg-foreground/[0.03] text-xs">{c}</span>)}
                {person.flags.length > 0 && <span className="chip warn text-xs">{person.flags.length} 个待校对</span>}
              </div>
              <div className="relative z-10 pt-4 border-t border-border/60 flex justify-between items-center mt-auto">
                <Link href={`/people/${person.login}`} className="text-sm link-internal group-hover:text-blue-500 transition-colors">
                  查看主页 <span className="inline-block transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
            </div>
          ))}
          {filteredPeople.length === 0 && <div className="text-muted-foreground">没有匹配的成员。</div>}
        </div>
      </div>
    </>
  );
}
