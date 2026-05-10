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
      <div className="max-w-4xl mx-auto pb-24">
        <Link href="/" className="inline-flex items-center text-sm link-internal mb-8">
          &larr; 返回课程名册
        </Link>
        
        <div className="glass-panel p-8 mb-8 flex flex-col md:flex-row gap-8 items-start">
          <img src={person.avatarUrl} alt={person.login} className="w-32 h-32 rounded-2xl ring-4 ring-foreground/10 shadow-2xl" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{person.realName || "待校对"}</h1>
            <a href={`https://github.com/${person.login}`} target="_blank" rel="noreferrer" className="text-xl link-external mb-4">
              @{person.login}
            </a>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="chip px-3 py-1">{person.role}</span>
              <span className="chip px-3 py-1">{person.issueCount} 个提交</span>
            </div>
            
            {person.note && (
              <div className="text-muted-foreground p-4 bg-foreground/5 rounded-lg text-sm border border-border">
                <strong className="block text-foreground mb-1">备注：</strong>
                {person.note}
              </div>
            )}
          </div>
        </div>

        {audioUrl && (
          <ProfileAudioPlayer audioUrl={audioUrl} title={audioTitle} author={person.realName || person.login} />
        )}

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          作业提交记录
          <span className="bg-foreground/10 text-foreground text-sm px-3 py-1 rounded-full font-normal">
            {issues.length}
          </span>
        </h2>
        
        <div className="grid gap-4">
          {issues.map((issue) => (
            <div key={issue.issue} className="glass-panel p-6 hover:bg-foreground/[0.02] transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 flex gap-2 z-10">
                <span className="chip bg-foreground/10 backdrop-blur-md border border-border">{issue.correctedCategory}</span>
                <span className="chip bg-foreground/10 backdrop-blur-md border border-border">{issue.evidenceType}</span>
              </div>
              
              <div className="text-lg font-mono text-muted-foreground mb-2">#{issue.issue}</div>
              <h3 className="text-xl font-bold mb-4 pr-32">{issue.title}</h3>
              
              <div className="flex gap-4">
                <a href={issue.issueUrl} target="_blank" rel="noreferrer" className="link-external bg-foreground/5 py-1.5 px-3">
                  前往 GitHub 查看
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
