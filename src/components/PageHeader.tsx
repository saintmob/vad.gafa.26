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
    <header className="px-8 py-6 glass border-b sticky top-0 z-10 flex justify-between items-center gap-4">
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-4">
          {title}
          {children}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="relative shrink-0">
        <input
          type="search"
          placeholder="搜索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-2 rounded-full input-glass text-sm w-64"
        />
        <svg className="w-4 h-4 absolute left-4 top-2.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </header>
  );
}
