import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/AudioProvider";
import { loadData } from "@/lib/data";
import { LayoutSidebar } from "@/components/LayoutSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 课程名册",
  description: "AI Course Roster",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await loadData();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AudioProvider>
          <div className="flex h-screen overflow-hidden font-sans">
            <LayoutSidebar repoName={data.repo} rawCount={data.rawCount} />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background -z-10" />
              <div className="flex-1 overflow-y-auto pb-24 relative">
                {children}
              </div>
            </main>
          </div>
        </AudioProvider>
      </body>
    </html>
  );
}
