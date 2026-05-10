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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-12 py-16">
        <Link href="/" className="text-xs uppercase tracking-[0.2em] font-bold hover:text-accent-vermillion transition-colors mb-12 block">
          &larr; Back to Archive
        </Link>
        
        <header className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24 items-start">
          <div className="md:col-span-4 aspect-square bg-white border border-border p-4 shadow-gallery-low group">
            <div className="w-full h-full overflow-hidden border border-border">
              <img 
                src={person.avatarUrl} 
                alt={person.login} 
                className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-1000" 
              />
            </div>
          </div>
          
          <div className="md:col-span-8 pt-4">
            <div className="flex flex-col gap-6">
              <div className="flex items-baseline justify-between flex-wrap gap-4 border-b border-foreground pb-8">
                <h1 className="text-h1">{person.realName || "UNKNOWN EXHIBITOR"}</h1>
                <span className="text-label text-secondary">{person.role}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-12 pt-4">
                <div className="flex flex-col gap-3">
                  <span className="text-label text-secondary">Registry Name</span>
                  <a href={`https://github.com/${person.login}`} target="_blank" rel="noreferrer" className="text-xl link-external-gallery w-fit">
                    @{person.login}
                  </a>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-label text-secondary">Assignment Count</span>
                  <span className="text-xl font-serif">{person.issueCount} Records</span>
                </div>
              </div>

              <div className="pt-8 flex flex-wrap gap-2">
                {person.categories.map((c: string) => (
                  <span key={c} className="chip-minimal">{c}</span>
                ))}
                {person.manuallyCorrected && (
                  <span className="chip-minimal border-accent-viridian text-accent-viridian">Manual Correction Verified</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {audioUrl && (
          <div className="mb-24">
            <span className="text-label text-secondary mb-6 block">Audio Exhibition</span>
            <ProfileAudioPlayer audioUrl={audioUrl} title={audioTitle} author={person.realName || person.login} />
          </div>
        )}

        <section className="border-t border-border pt-16">
          <div className="flex justify-between items-baseline mb-16">
            <h2 className="text-h2">Submission Archive</h2>
            <span className="text-label text-secondary">{issues.length} Items</span>
          </div>
          
          <div className="grid grid-cols-1 gap-1px bg-border border border-border overflow-hidden">
            {issues.map((issue: any, index: number) => {
              const isMedia = issue.category.includes("网页/音乐") || issue.evidenceType.includes("链接");
              return (
                <div key={issue.issue} 
                  className="bg-card p-12 hover:bg-background transition-colors group animate-stagger-item"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    <div className="md:col-span-1">
                      <span className="text-label text-secondary font-mono">#{issue.issue}</span>
                    </div>
                    
                    <div className="md:col-span-8">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="chip-minimal text-[9px]">{issue.correctedCategory}</span>
                        <span className="text-[10px] text-secondary uppercase tracking-widest">{new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-2xl font-serif mb-6 group-hover:text-accent-vermillion transition-colors">{issue.title}</h3>
                      
                      <div className="flex flex-wrap gap-8 items-center">
                        <a href={issue.issueUrl} target="_blank" rel="noreferrer" className="text-xs uppercase tracking-widest font-bold underline underline-offset-4 decoration-border hover:decoration-foreground transition-all">
                          Browse Documentation &rarr;
                        </a>
                        {isMedia && (
                          <span className="text-[10px] text-secondary uppercase tracking-widest flex items-center gap-2">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> 
                            Multimedia Exhibit Included
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="md:col-span-3 flex justify-end gap-2">
                      {issue.flags.map((f: string) => (
                        <span key={f} className="chip-minimal border-accent-vermillion text-accent-vermillion">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        
        <div className="empty-space" />
      </div>
    </div>
  );
}
