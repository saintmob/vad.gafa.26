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
      
      {/* Stats Section */}
      <div className="px-12 py-12 grid grid-cols-2 md:grid-cols-4 gap-12 border-b border-border">
        <div className="flex flex-col">
          <span className="text-[10px] text-secondary uppercase tracking-[0.2em] mb-3 font-bold">Total People</span>
          <strong className="text-5xl font-serif leading-none tracking-tighter">{initialData.counts.people}</strong>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-secondary uppercase tracking-[0.2em] mb-3 font-bold">Pending Review</span>
          <strong className="text-5xl font-serif leading-none tracking-tighter text-accent-vermillion">{initialData.counts.needsReview}</strong>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-secondary uppercase tracking-[0.2em] mb-3 font-bold">People Corrected</span>
          <strong className="text-5xl font-serif leading-none tracking-tighter">{initialData.counts.correctedPeople}</strong>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-secondary uppercase tracking-[0.2em] mb-3 font-bold">Issues Corrected</span>
          <strong className="text-5xl font-serif leading-none tracking-tighter">{initialData.counts.correctedIssues}</strong>
        </div>
      </div>

      <div className="p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-12">
          {filteredPeople.map((person: any, index: number) => (
            <div 
              key={person.login} 
              className="gallery-card group animate-stagger-item flex flex-col h-full"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="relative mb-8 aspect-square overflow-hidden bg-background border border-border">
                <img 
                  src={person.avatarUrl} 
                  alt={person.login} 
                  className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700" 
                />
                {person.hasMusic && (
                  <div className="absolute top-4 right-4 bg-foreground text-background w-8 h-8 flex items-center justify-center text-xs">
                    🎵
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-serif leading-none">{person.realName || "UNKNOWN"}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-secondary pt-1">{person.role}</span>
                </div>

                <a 
                  href={`https://github.com/${person.login}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs link-external-gallery block mb-6 w-fit truncate max-w-full"
                >
                  @{person.login}
                </a>

                <div className="flex flex-wrap gap-2 mb-8">
                  {person.categories.slice(0, 2).map((c: string) => (
                    <span key={c} className="chip-minimal">{c}</span>
                  ))}
                  {person.flags.length > 0 && (
                    <span className="chip-minimal border-accent-vermillion text-accent-vermillion">{person.flags.length} FLAGS</span>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-between items-center">
                <Link href={`/people/${person.login}`} className="text-xs uppercase tracking-[0.2em] font-bold hover:text-accent-vermillion transition-colors">
                  VIEW ENTRY &rarr;
                </Link>
                <span className="text-[10px] text-secondary font-mono">{person.issueCount} ISSUES</span>
              </div>
            </div>
          ))}
          {filteredPeople.length === 0 && <div className="text-secondary uppercase tracking-widest text-xs">No matching entries found.</div>}
        </div>
        <div className="empty-space" />
      </div>
    </>
  );
}
