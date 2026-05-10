import { loadData } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileAudioPlayer } from "@/components/ProfileAudioPlayer";

export default async function PersonProfile({ params }: { params: Promise<{ login: string }> }) {
  const login = (await params).login;
  const data = await loadData();
  const person = data.people.find((p) => p.login === login);
  
  if (!person) {
    notFound();
  }

  const issues = data.issues.filter((issue) => person.issueNumbers.includes(issue.issue));
  
  // Find an audio link from issues
  let audioUrl = null;
  let audioTitle = "";
  for (const issue of issues) {
    const text = `${issue.title}\n${issue.body || ""}`;
    const links = issue.links || [];
    
    // Check extracted links
    const mp3Link = links.find((link: string) => link.toLowerCase().endsWith(".mp3") || link.toLowerCase().endsWith(".wav"));
    if (mp3Link) {
      audioUrl = mp3Link;
      audioTitle = issue.title;
      break;
    }
    
    // Check raw text for markdown links just in case
    const match = text.match(/https?:\/\/[^\s)\]<"']+\.(mp3|wav)/i);
    if (match) {
      audioUrl = match[0];
      audioTitle = issue.title;
      break;
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto pb-24 relative z-10">
        <Link href="/" className="inline-flex items-center text-sm link-internal mb-6 bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 shadow-sm">
          &larr; 返回名册
        </Link>
        
        <div className="glass-panel relative overflow-hidden mb-12">
          {/* Banner Background */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20" />
          
          <div className="px-8 pt-20 pb-8 relative flex items-end gap-6 flex-wrap sm:flex-nowrap">
            <img src={person.avatarUrl} alt={person.login} className="w-32 h-32 rounded-3xl ring-4 ring-background shadow-2xl bg-background" />
            <div className="flex-1 min-w-0 pb-2">
              <h1 className="text-4xl font-bold mb-2 tracking-tight">{person.realName || "待校对"}</h1>
              <a href={`https://github.com/${person.login}`} target="_blank" rel="noreferrer" className="text-lg link-external mb-4">
                @{person.login}
              </a>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="chip bg-primary/10 text-primary border-primary/20 text-sm py-1 px-3">{person.role}</span>
                <span className="chip bg-secondary text-secondary-foreground text-sm py-1 px-3">{person.issueCount} 个作业记录</span>
                {person.manuallyCorrected && <span className="chip text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10 text-sm py-1 px-3">已修正</span>}
              </div>
            </div>
            
            <div className="flex flex-col gap-2 pb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-widest text-right">名册数据</span>
              <div className="flex gap-1.5 flex-wrap justify-end max-w-[200px]">
                {person.categories.map((c: string) => <span key={c} className="chip bg-foreground/[0.03] text-xs">{c}</span>)}
              </div>
            </div>
          </div>
        </div>

        {audioUrl && (
          <ProfileAudioPlayer audioUrl={audioUrl} title={audioTitle} author={person.realName || person.login} />
        )}

        <div className="space-y-8 relative">
          {/* Timeline connecting line */}
          <div className="absolute left-6 top-8 bottom-8 w-px bg-border/50 hidden sm:block" />
          
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
            作业记录 ({issues.length})
          </h2>
          
          <div className="flex flex-col gap-6">
            {issues.map((issue: any, index: number) => {
              const isMedia = issue.category.includes("网页/音乐") || issue.evidenceType.includes("链接");
              return (
                <div key={issue.issue} 
                  className="relative sm:pl-16 animate-stagger-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 top-6 w-3 h-3 rounded-full bg-border border-4 border-background hidden sm:block transform -translate-x-1.5" />
                  
                  <div className="glass-panel p-6 sm:p-8 hover:bg-foreground/[0.02] transition-colors group">
                    <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-muted-foreground bg-foreground/5 px-2 py-1 rounded-md">#{issue.issue}</span>
                        <span className="chip bg-background">{issue.correctedCategory}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-5 tracking-tight group-hover:text-primary transition-colors">{issue.title}</h3>
                    
                    <div className="flex flex-wrap gap-4 items-center">
                      <a href={issue.issueUrl} target="_blank" rel="noreferrer" className="link-external bg-foreground/[0.03] border-border/50 py-2 px-4 shadow-sm hover:shadow-md transition-all">
                        前往 GitHub 查看
                      </a>
                      {isMedia && <span className="text-sm text-muted-foreground flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> 包含多媒体附件</span>}
                    </div>
                    
                    {issue.flags.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-border/50 flex gap-2 flex-wrap">
                        {issue.flags.map((f: string) => <span key={f} className="chip warn text-xs">{f}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
