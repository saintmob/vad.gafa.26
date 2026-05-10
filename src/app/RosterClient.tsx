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
      <div className="px-8 py-4 grid grid-cols-4 gap-4 border-b border-border">
        <div className="glass-panel p-4 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">成员</span>
          <strong className="text-2xl font-light">{initialData.counts.people}</strong>
        </div>
        <div className="glass-panel p-4 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">待校对</span>
          <strong className="text-2xl font-light text-red-400">{initialData.counts.needsReview}</strong>
        </div>
        <div className="glass-panel p-4 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">人员修正</span>
          <strong className="text-2xl font-light">{initialData.counts.correctedPeople}</strong>
        </div>
        <div className="glass-panel p-4 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Issue 修正</span>
          <strong className="text-2xl font-light">{initialData.counts.correctedIssues}</strong>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPeople.map((person: any) => (
            <div key={person.login} className="glass-panel p-5 hover:bg-foreground/[0.02] transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <img src={person.avatarUrl} alt={person.login} className="w-14 h-14 rounded-full ring-2 ring-foreground/10" />
                <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate">{person.realName || "待校对"}</h3>
                  <a href={`https://github.com/${person.login}`} target="_blank" rel="noreferrer" className="text-sm link-external truncate block w-fit">@{person.login}</a>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="chip">{person.role}</span>
                <span className="chip">{person.issueCount} issues</span>
                {person.manuallyCorrected && <span className="chip text-purple-500 border-purple-500/30 bg-purple-500/10">已修正</span>}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {person.categories.slice(0, 3).map((c: string) => <span key={c} className="chip bg-foreground/5">{c}</span>)}
                {person.flags.length > 0 && <span className="chip warn">{person.flags.length} 个待校对</span>}
              </div>
              <div className="pt-4 border-t border-border flex gap-3">
                <Link href={`/people/${person.login}`} className="text-sm link-internal">
                  查看个人主页 &rarr;
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
