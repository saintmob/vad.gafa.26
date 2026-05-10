"use client";

import { ReactNode } from "react";

export function PageHeader({ 
  title, 
  description, 
  query, 
  setQuery, 
  children 
}: { 
  title: string; 
  description: string; 
  query: string; 
  setQuery: (q: string) => void;
  children?: ReactNode;
}) {
  return (
    <header className="px-12 py-10 bg-background border-b border-border sticky top-0 z-10 flex justify-between items-end gap-4">
      <div className="flex-1">
        <h2 className="text-5xl font-serif mb-2 tracking-tight flex items-baseline gap-6">
          {title}
          {children && <span className="text-sm font-sans uppercase tracking-widest text-secondary font-medium">{children}</span>}
        </h2>
        <p className="text-xs text-secondary uppercase tracking-[0.1em] font-medium">{description}</p>
      </div>
      <div className="relative shrink-0 mb-1">
        <input
          type="search"
          placeholder="SEARCH ARCHIVE..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-0 pr-4 py-2 bg-transparent border-b border-border focus:border-foreground outline-none text-xs tracking-widest w-48 transition-all"
        />
        <svg className="w-3 h-3 absolute right-0 top-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </header>
  );
}
