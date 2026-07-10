import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

import { SiteTopNav } from "@/components/site-top-nav";
import { ScrollMascotGuide } from "@/components/scroll-mascot-guide";
//deployment
export const metadata: Metadata = {
  title: "Allen Girls Adventures",
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
  description: "Join Maya, Alana & Natalia on epic learning adventures through dinosaurs, space, history and more!",
  authors: [{ name: "Allen Girls Adventures" }],
  openGraph: {
    type: "website",
    title: "Allen Girls Adventures",
    description: "Join three amazing sisters as they explore dinosaurs, blast into space, and discover the magic of learning together!",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Allen Girls Adventures",
    description: "Join three amazing sisters as they explore dinosaurs, blast into space, and discover the magic of learning!",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ScrollMascotGuide />

        <SiteTopNav />

        <div className="site-wrapper">
          <main className="site-main" style={{ flex: 1 }}>
            {children}
          </main>

          <footer className="site-footer">
            <div className="site-footer-inner">
              <div>
                <div className="footer-brand">
                  <span>✨</span> Allen Girls Adventures
                </div>
                <p className="footer-desc">
                  Follow three amazing sisters on incredible adventures through time, space, and imagination!
                </p>
              </div>
              <div>
                <div className="footer-heading"><span>☆</span> Explore</div>
                <Link href="/" className="footer-link">
                  Home
                </Link>
                <Link href="/characters" className="footer-link">
                  Characters
                </Link>
                <Link href="/episodes" className="footer-link">
                  Adventures
                </Link>
                <Link href="/parent" className="footer-link">
                  About Us
                </Link>
              </div>
              <div>
                <div className="footer-heading"><span>☆</span> Connect</div>
                <p className="footer-desc" style={{ marginBottom: "0.75rem" }}>
                  Follow us for behind-the-scenes fun and new adventure announcements!
                </p>
                <div className="footer-social">
                  <a href="#" className="footer-social-btn">
                    YouTube
                  </a>
                  <a href="#" className="footer-social-btn">
                    Instagram
                  </a>
                  <a href="#" className="footer-social-btn">
                    TikTok
                  </a>
                </div>
              </div>
            </div>
            <div className="footer-bottom" suppressHydrationWarning>
              © {new Date().getFullYear()} Allen Girls Adventures. All rights reserved. ✨
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
