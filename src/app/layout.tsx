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
              {/* Subtle Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_-20%,var(--color-primary),transparent_70%)] opacity-[0.03]" />
              
              <div className="flex-1 overflow-y-auto pb-24 relative z-0">
                {children}
              </div>
            </main>
          </div>
        </AudioProvider>
      </body>
    </html>
  );
}
