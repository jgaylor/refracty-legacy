import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { InsightCapture } from "@/components/InsightCapture";
import { ToasterWrapper } from "@/components/ToasterWrapper";
import { getUser } from "@/lib/supabase/auth";
import { getUserProfile } from "@/lib/supabase/profile";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Refracty",
  description: "Refracty application",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const isLoggedIn = !!user;
  let profile = null;
  try {
    profile = isLoggedIn ? await getUserProfile() : null;
  } catch (error) {
    // Gracefully handle error - app should still work without profile
    profile = null;
  }

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} h-full flex flex-col`}>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          src="/theme-init.js"
        />
        <ThemeProvider initialAppearance={profile?.appearance}>
          <ToasterWrapper />
          <Header />
          {isLoggedIn ? (
            <div className="flex flex-1 min-h-0">
              <Sidebar initialUser={user} />
              <main className="flex-1 min-w-0 pt-8 pb-32 overflow-auto [scrollbar-gutter:stable]">
                {children}
                <InsightCapture />
              </main>
            </div>
          ) : (
            <>
              <div className="pt-32 pb-16">
                {children}
              </div>
              <Footer />
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
