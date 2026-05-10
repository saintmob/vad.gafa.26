import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/AudioProvider";
import { loadData } from "@/lib/data";
import { LayoutSidebar } from "@/components/LayoutSidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
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
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AudioProvider>
          <div className="flex h-screen overflow-hidden font-sans">
            <LayoutSidebar repoName={data.repo} rawCount={data.rawCount} />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
              <div className="flex-1 overflow-y-auto relative z-0">
                {children}
              </div>
            </main>
          </div>
        </AudioProvider>
      </body>
    </html>
  );
}
