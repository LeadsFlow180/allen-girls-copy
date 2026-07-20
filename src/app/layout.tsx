import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { Nunito, Fredoka } from "next/font/google";
import { Facebook, Youtube } from "lucide-react";
import "./globals.css";
// Side-effect import — styles the /about, /our-approach, /educators,
// /families, /diversity, /partners, /compare, /faq pages. DO NOT REMOVE.
import "./styles/marketing.css";

import { SiteTopNav } from "@/components/site-top-nav";
import { ScrollMascotGuide } from "@/components/scroll-mascot-guide";
import logo from "@/assets/images/logo2026.png";

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
              <div className="footer-brand-block">
                <div className="footer-brand">
                  <Image
                    src={logo}
                    alt=""
                    width={40}
                    height={40}
                    className="footer-brand-mark"
                  />
                  Allen Girls Adventures
                </div>
                <p className="footer-desc">
                  Learning feels like an adventure—because it is.
                </p>
                <div className="footer-social">
                  <a
                    href="https://www.youtube.com/@AllenGirlAdventures-ii6tr"
                    className="footer-social-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                  >
                    <Youtube strokeWidth={2} aria-hidden />
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61588148717114"
                    className="footer-social-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <Facebook strokeWidth={2} aria-hidden />
                  </a>
                  {/* Instagram / TikTok: re-add icon buttons when accounts exist */}
                </div>
              </div>
              <div>
                <div className="footer-heading">Explore</div>
                <Link href="/" className="footer-link">
                  Home
                </Link>
                <Link href="/characters" className="footer-link">
                  Characters
                </Link>
                <Link href="/worlds" className="footer-link">
                  Adventures
                </Link>
                <Link href="/episodes" className="footer-link">
                  See the Show
                </Link>
                <Link href="/about" className="footer-link">
                  About Us
                </Link>
                <Link href="/games" className="footer-link">
                  Game Zone
                </Link>
                <Link href="/learn/library" className="footer-link">
                  Story Time
                </Link>
                <Link href="/store" className="footer-link">
                  Shop
                </Link>
              </div>
              <div>
                <div className="footer-heading">Learning</div>
                <Link href="/our-approach" className="footer-link">
                  Our Approach
                </Link>
                <Link href="/curriculum" className="footer-link">
                  Curriculum
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
                <Link href="/families" className="footer-link">
                  For Parents
                </Link>
                <Link href="/educators" className="footer-link">
                  For Educators
                </Link>
              </div>
              <div>
                <div className="footer-heading">Company</div>
                <Link href="/faq" className="footer-link">
                  Contact
                </Link>
                <Link href="/faq" className="footer-link">
                  FAQ
                </Link>
                <Link href="/faq" className="footer-link">
                  Privacy
                </Link>
                <Link href="/faq" className="footer-link">
                  Terms
                </Link>
              </div>
            </div>
            <div className="footer-bottom" suppressHydrationWarning>
              <span>
                © {new Date().getFullYear()} Allen Girls Adventures. All rights
                reserved.
              </span>
              <div className="footer-bottom-links">
                <Link href="/faq">Privacy</Link>
                <span className="footer-bottom-sep" aria-hidden>
                  |
                </span>
                <Link href="/faq">Terms</Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
