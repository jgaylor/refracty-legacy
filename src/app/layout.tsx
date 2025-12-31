import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { SidebarDrawer } from "@/components/SidebarDrawer";
import { MobileHeaderProvider } from "@/components/MobileHeaderProvider";
import { DrawerProvider } from "@/components/DrawerContext";
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

  const themeScript = `
    (function() {
      try {
        var appearance = localStorage.getItem('appearance-preference') || 'dark';
        var theme = 'dark';
        if (appearance === 'light') {
          theme = 'light';
        } else if (appearance === 'dark') {
          theme = 'dark';
        } else {
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    })();
  `;

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} h-full flex flex-col`}>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <ThemeProvider initialAppearance={profile?.appearance}>
          <DrawerProvider>
            <MobileHeaderProvider>
              <ToasterWrapper />
              <Header />
              <MobileHeader />
              {isLoggedIn ? (
                <>
                  <SidebarDrawer initialUser={user} />
                  <div className="flex flex-1 min-h-0">
                    <Sidebar initialUser={user} />
                    <main className="flex-1 min-w-0 pt-20 pb-32 overflow-auto [scrollbar-gutter:stable] md:pt-8">
                      {children}
                      <InsightCapture />
                    </main>
                  </div>
                </>
              ) : (
                <>
                  <div className="pt-20 pb-16 md:pt-32">
                    {children}
                  </div>
                  <Footer />
                </>
              )}
            </MobileHeaderProvider>
          </DrawerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
