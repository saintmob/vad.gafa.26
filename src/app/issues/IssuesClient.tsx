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
          className="btn-primary text-sm px-4 py-1.5 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              同步中...
            </>
          ) : (
            "刷新 Issues"
          )}
        </button>
      </PageHeader>
      
      <div className="flex flex-col gap-3 p-8">
        {filteredIssues.map((issue: any) => (
          <div key={issue.issue} className="glass-panel p-4 flex items-center gap-4 hover:bg-foreground/[0.02] transition-colors">
            <div className="text-lg font-mono text-muted-foreground w-12 shrink-0">#{issue.issue}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate mb-2">{issue.title}</h4>
              <div className="flex flex-wrap gap-2">
                <span className="chip">{issue.correctedStudentNames.join("、") || "待校对"}</span>
                <span className="chip">{issue.correctedCategory}</span>
                <span className="chip bg-foreground/5">{issue.state}</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-3">
              <a href={issue.issueUrl} target="_blank" rel="noreferrer" className="link-external px-4 py-2 bg-foreground/5">
                GitHub
              </a>
            </div>
          </div>
        ))}
        {filteredIssues.length === 0 && <div className="text-muted-foreground">没有匹配的 issue。</div>}
      </div>
    </>
  );
}
