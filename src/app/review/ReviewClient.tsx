"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";

export function ReviewClient({ initialData, isDevelopment }: { initialData: any, isDevelopment: boolean }) {
  const [data, setData] = useState(initialData);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  
  const filteredReview = useMemo(() => {
    if (!query) return data.needsReview;
    return data.needsReview.filter((item: any) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  }, [data.needsReview, query]);

  const [selectedIssue, setSelectedIssue] = useState<any>(filteredReview[0] || null);

  return (
    <>
      <PageHeader
        title="数据修正"
        description="只写入本地外挂数据，刷新 GitHub 原始内容也不会丢失。"
        query={query}
        setQuery={setQuery}
      >
        {!isDevelopment && (
          <span className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full font-normal">
            只读模式
          </span>
        )}
      </PageHeader>
      
      <div className="flex gap-6 p-8 h-full min-h-[500px]">
        <div className="w-1/2 flex flex-col gap-3 overflow-y-auto pr-2">
          {filteredReview.map((issue: any) => (
            <button
              key={issue.issue}
              onClick={() => setSelectedIssue(issue)}
              className={`text-left p-4 rounded-xl transition-all border ${
                selectedIssue?.issue === issue.issue
                  ? "bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                  : "glass-panel hover:bg-foreground/5 border-border"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">#{issue.issue} {issue.title}</h4>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="chip">{issue.correctedStudentNames.join("、") || "待校对"}</span>
                <span className="chip">{issue.correctedCategory}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {issue.flags.map((f: string) => <span key={f} className="chip warn">{f}</span>)}
              </div>
            </button>
          ))}
          {filteredReview.length === 0 && <div className="text-muted-foreground">没有待校对项。</div>}
        </div>

        {selectedIssue && (
          <div className="w-1/2 glass-panel p-6 sticky top-0 h-fit">
            <h3 className="text-xl font-bold mb-6 flex justify-between items-center">
              修正选中项
              <a href={selectedIssue.issueUrl} target="_blank" rel="noreferrer" className="text-sm font-normal link-external">在 GitHub 查看</a>
            </h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!isDevelopment) return alert("生产环境不可编辑");
              
              const form = e.target as HTMLFormElement;
              const body = {
                issue: selectedIssue.issue,
                studentNames: (form.elements.namedItem("names") as HTMLInputElement).value,
                category: (form.elements.namedItem("category") as HTMLSelectElement).value,
                role: (form.elements.namedItem("role") as HTMLSelectElement).value,
                note: (form.elements.namedItem("note") as HTMLTextAreaElement).value,
                resolved: (form.elements.namedItem("resolved") as HTMLInputElement).checked,
              };
              
              setStatus("保存修正中...");
              try {
                const res = await fetch("/api/issue", {
                  method: "POST",
                  body: JSON.stringify(body),
                });
                if (!res.ok) throw new Error((await res.json()).error);
                setData(await res.json());
                setStatus("Issue 修正已保存");
                setTimeout(() => setStatus(""), 3000);
              } catch (err: any) {
                setStatus(`保存失败: ${err.message}`);
              }
            }} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Issue</label>
                <input disabled value={`#${selectedIssue.issue} ${selectedIssue.title}`} className="w-full input-glass px-3 py-2 rounded-lg text-sm opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">真实姓名 (多人用顿号分隔)</label>
                <input name="names" defaultValue={selectedIssue.correctedStudentNames.join("、")} className="w-full input-glass px-3 py-2 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">分类</label>
                <select name="category" defaultValue={selectedIssue.correctedCategory} className="w-full input-glass px-3 py-2 rounded-lg text-sm appearance-none bg-background">
                  {["老师/课程说明", "作业：课堂笔记/随记", "作业：AI 提问/模型观察", "作业：创意网页/音乐作品", "作业：图像复刻", "作业：色彩小组", "作业：专题介绍网站", "待处理/重复", "待处理/未分类"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">角色</label>
                <select name="role" defaultValue={selectedIssue.correctedRole} className="w-full input-glass px-3 py-2 rounded-lg text-sm appearance-none bg-background">
                  <option>学生/待校对</option>
                  <option>学生</option>
                  <option>老师</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">备注</label>
                <textarea name="note" defaultValue={selectedIssue.reviewNote} rows={3} className="w-full input-glass px-3 py-2 rounded-lg text-sm"></textarea>
              </div>
              <label className="flex items-center gap-2 text-sm mt-2 cursor-pointer">
                <input type="checkbox" name="resolved" defaultChecked={selectedIssue.resolved} className="rounded border-border bg-background text-primary focus:ring-primary/50" />
                <span>已校对 (隐藏在待处理列表)</span>
              </label>
              <div className="mt-4 flex items-center justify-between">
                <button type="submit" disabled={!isDevelopment} className="btn-primary py-2.5 px-6 rounded-lg font-medium">
                  保存 Issue 修正
                </button>
                <span className="text-sm text-green-500">{status}</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
