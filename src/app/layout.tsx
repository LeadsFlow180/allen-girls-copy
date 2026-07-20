import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";
// Side-effect import — styles the /about, /our-approach, /educators,
// /families, /diversity, /partners, /compare, /faq pages. DO NOT REMOVE.
import "./styles/marketing.css";

import { SiteTopNav } from "@/components/site-top-nav";
import { ScrollMascotGuide } from "@/components/scroll-mascot-guide";

/** Phone + desktop: correct width, notch-safe, no surprise zoom issues */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1a0a40",
};

// Move 6: self-hosted via next/font (no render-blocking <link>, no FOUT).
// Fredoka replaces the single-weight "Fredoka One" — it is a variable font,
// so headings no longer need font-weight:400 overrides to look right.
// Fallback is system-ui, sans-serif — never cursive (renders as Comic Sans).
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--nf-nunito",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--nf-fredoka",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
//deployment
export const metadata: Metadata = {
  metadataBase: new URL("https://www.allengirlsadventures.com"),
  title: {
    default: "Allen Girls Adventures | Story-Based Learning for Grades 3–6",
    template: "%s | Allen Girls Adventures",
  },
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
  description: "Join Maya, Alana & Natalia on epic learning adventures through dinosaurs, space, history and more!",
  authors: [{ name: "Allen Girls Adventures" }],
  openGraph: {
    type: "website",
    siteName: "Allen Girls Adventures",
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
    <html lang="en" className={`${nunito.variable} ${fredoka.variable}`}>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "Allen Girls Adventures",
              url: "https://www.allengirlsadventures.com",
              logo: "https://www.allengirlsadventures.com/favicon.png",
              slogan: "Bold Girls. Big Adventures.",
              sameAs: [
                "https://www.youtube.com/@AllenGirlAdventures-ii6tr",
                "https://www.facebook.com/profile.php?id=61588148717114",
              ],
            }),
          }}
        />

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
                <Link href="/about" className="footer-link">
                  About Us
                </Link>
              </div>
              <div>
                <div className="footer-heading"><span>☆</span> Learn More</div>
                <Link href="/our-approach" className="footer-link">
                  Our Approach
                </Link>
                <Link href="/curriculum" className="footer-link">
                  Curriculum
                </Link>
                <Link href="/families" className="footer-link">
                  For Families
                </Link>
                <Link href="/educators" className="footer-link">
                  For Educators
                </Link>
                <Link href="/compare" className="footer-link">
                  Compare Platforms
                </Link>
                <Link href="/diversity" className="footer-link">
                  Diversity
                </Link>
                <Link href="/partners" className="footer-link">
                  Partners
                </Link>
                <Link href="/blog" className="footer-link">
                  Blog
                </Link>
                <Link href="/grade-3" className="footer-link">
                  3rd Grade
                </Link>
                <Link href="/grade-4" className="footer-link">
                  4th Grade
                </Link>
                <Link href="/grade-5" className="footer-link">
                  5th Grade
                </Link>
                <Link href="/grade-6" className="footer-link">
                  6th Grade
                </Link>
                <Link href="/faq" className="footer-link">
                  FAQ
                </Link>
              </div>
              <div>
                <div className="footer-heading"><span>☆</span> Connect</div>
                <p className="footer-desc" style={{ marginBottom: "0.75rem" }}>
                  Follow us for behind-the-scenes fun and new adventure announcements!
                </p>
                <div className="footer-social">
                  <a
                    href="https://www.youtube.com/@AllenGirlAdventures-ii6tr"
                    className="footer-social-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    YouTube
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61588148717114"
                    className="footer-social-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </a>
                  {/* TikTok: re-add when account exists */}
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
