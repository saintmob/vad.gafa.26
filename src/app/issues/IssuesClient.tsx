"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useRouter } from "next/navigation";

export function IssuesClient({ initialData, isDevelopment }: { initialData: any, isDevelopment: boolean }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filteredIssues = useMemo(() => {
    if (!query) return initialData.issues;
    return initialData.issues.filter((item: any) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  }, [initialData.issues, query]);

  const refreshIssues = async () => {
    if (!isDevelopment) return alert("生产环境无法拉取最新 Issues");
    setLoading(true);
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error);
      router.refresh(); // Refresh Server Components to fetch new data
    } catch (err: any) {
      alert(`刷新失败：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="原始 Issues"
        description="按修正后的姓名和分类展示全部公开 issues。"
        query={query}
        setQuery={setQuery}
      >
        <button
          onClick={refreshIssues}
          disabled={loading || !isDevelopment}
          className="btn-vermillion text-[10px] tracking-widest px-6 py-2 h-fit"
        >
          {loading ? "SYNCHRONIZING..." : "REFRESH ARCHIVE"}
        </button>
      </PageHeader>
      
      <div className="grid grid-cols-1 gap-1px bg-border border-b border-border">
        {filteredIssues.map((issue: any) => (
          <div key={issue.issue} className="bg-card p-8 flex items-center gap-12 hover:bg-background transition-colors group">
            <div className="text-xl font-serif text-secondary w-20 shrink-0">#{issue.issue}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-serif truncate mb-3 group-hover:text-accent-vermillion transition-colors">{issue.title}</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <span className="chip-minimal">{issue.correctedStudentNames.join(", ") || "UNIDENTIFIED"}</span>
                <span className="chip-minimal">{issue.correctedCategory}</span>
                <span className="text-[10px] uppercase tracking-widest text-secondary font-medium">{issue.state}</span>
              </div>
            </div>
            <div className="flex shrink-0">
              <a href={issue.issueUrl} target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 decoration-border hover:decoration-foreground transition-all">
                Entry &rarr;
              </a>
            </div>
          </div>
        ))}
        {filteredIssues.length === 0 && <div className="p-12 text-secondary uppercase tracking-widest text-xs">No matching archives found.</div>}
      </div>
      <div className="empty-space" />
    </>
  );
}
