import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "タレントマネジメント | TalentOS",
  description: "人材管理・スキル可視化・組織最適化ダッシュボード",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden bg-surface">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-surface-low">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
