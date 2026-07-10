"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, BookOpen, Users, Sparkles, Star, Mail, ChevronLeft, ChevronRight } from "lucide-react";

import heroImg from "@/assets/images/AGA_action_pose.png";
import gameZoneImg from "@/assets/images/AGA Game Card.png";
import libraryImg from "@/assets/images/flova_Shot_Library_Labyrinth_start_img_202601282313_a0ee44.jpeg";
import heroSlide2 from "@/assets/images/68_flova_Shot_04_end_img_202601261749_0880cd.png";
import heroSlide3 from "@/assets/images/105_flova_Shot_09_start_img_202601270555_1af013.png";
import heroSlide4 from "@/assets/images/Screenshot 2026-01-27 192708.png";
import landOfLanguagesImg from "@/assets/images/Gemini_Generated_Image_yiqnn4yiqnn4yiqn.png";
import brainBoostersImg from "@/assets/images/Workbooks & Activities_Clean.png";
import shopImg from "@/assets/images/Shop_Clean.png";

import styles from "./home-page.module.css";

const heroSlides = [heroSlide3, heroSlide2, heroImg, heroSlide4];

const features = [
  { icon: Rocket, label: "Explore Adventures", color: "bg-adventure-blue", desc: "Travel through time and space!" },
  { icon: BookOpen, label: "Learn & Play", color: "bg-adventure-green", desc: "Fun lessons in every episode!" },
  { icon: Users, label: "Meet the Girls", color: "bg-secondary", desc: "Three sisters, endless fun!" },
];

const adventures = [
  { img: heroImg, title: "Let's Go! Your Adventure Awaits", theme: "Choose Your World", href: "/worlds" },
  { img: gameZoneImg, title: "Power Up & Play!", theme: "Game Zone", href: "/games" },
  { img: libraryImg, title: "Visit The Library Labyrinth", theme: "Story Time", href: "/learn/library" },
  { img: landOfLanguagesImg, title: "Say Words In A New Way", theme: "Land of Languages", href: "/learn/explore" },
  { img: brainBoostersImg, title: "Worksheets & Activities", theme: "Brain Boosters", href: "/learn/worksheets" },
  { img: shopImg, title: "Shop Allen Girls Adventures", theme: "Shop", href: "/store" },
];

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [mounted]);

  const goTo = (idx: number) => {
    setDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
  };
  const prev = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };
  const next = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  if (!mounted) return null;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={{
                enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className={styles.heroSlide}
            >
              <Image
                src={heroSlides[currentSlide]}
                alt={`Hero slide ${currentSlide + 1}`}
                fill
                priority={currentSlide === 0}
                className={styles.heroImage}
              />
            </motion.div>
          </AnimatePresence>

          <div className={styles.heroOverlay} />
        </div>

        <button type="button" onClick={prev} className={styles.heroArrow} aria-label="Previous slide">
          <ChevronLeft className={styles.heroArrowIcon} />
        </button>
        <button type="button" onClick={next} className={styles.heroArrowNext} aria-label="Next slide">
          <ChevronRight className={styles.heroArrowIcon} />
        </button>

        <div className={styles.heroDots}>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === currentSlide ? "true" : undefined}
              style={{
                width: i === currentSlide ? "2rem" : "0.65rem",
                height: "0.65rem",
                borderRadius: "999px",
                background: i === currentSlide ? "#f5c518" : "rgba(255,255,255,0.5)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>

        <div className={styles.heroBlobBottom} aria-hidden />
        <div className={styles.heroBlobTop} aria-hidden />

        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.heroCopy}
          >
            <h1 className={`font-fredoka ${styles.heroTitle}`}>
              Adventure Awaits!{" "}
              <Sparkles className={`animate-sparkle ${styles.heroSparkle}`} aria-hidden />
            </h1>

            <p className={`font-nunito ${styles.heroLead}`}>
              Join three amazing sisters as they explore dinosaurs, blast into space,
              and discover the magic of learning together!
            </p>

            <div className={styles.heroCtas}>
              <Link href="/worlds">
                <motion.span whileHover={{ scale: 1.05 }} className={styles.heroCtaPrimary}>
                  <Rocket className={styles.heroCtaIcon} aria-hidden />
                  Start Your Adventure
                </motion.span>
              </Link>

              <Link href="/characters">
                <motion.span whileHover={{ scale: 1.05 }} className={styles.heroCtaSecondary}>
                  <Star className={styles.heroCtaIcon} aria-hidden />
                  Meet the Girls
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
                className={`${f.color} ${styles.featureCard}`}
              >
                <div className={styles.featureIconWrap}>
                  <f.icon className={styles.featureIcon} aria-hidden />
                </div>
                <div>
                  <div className={`font-fredoka ${styles.featureLabel}`}>{f.label}</div>
                  <div className={`font-nunito ${styles.featureDesc}`}>{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.trailer}>
        <div className={styles.trailerInner}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.trailerHead}
          >
            <h2 className={`font-fredoka ${styles.trailerTitle}`}>See the show</h2>
            <p className={`font-nunito ${styles.trailerSub}`}>Watch the Allen Girls Adventures intro</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={styles.trailerFrame}
          >
            <iframe
              id="vimeo-trailer"
              src="https://player.vimeo.com/video/1167108459?badge=0&autopause=0&player_id=0&app_id=58479&byline=0&portrait=0"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              className={styles.trailerIframe}
              title="Allen Girls Adventures - TV Show Intro"
            />
          </motion.div>
        </div>
        <Script
          src="https://player.vimeo.com/api/player.js"
          strategy="lazyOnload"
          onLoad={() => {
            const iframe = document.getElementById("vimeo-trailer") as HTMLIFrameElement | null;
            const vimeo = (window as unknown as { Vimeo?: { Player: new (el: HTMLIFrameElement) => { on: (e: string, fn: () => void) => void } } }).Vimeo;
            if (iframe && vimeo) {
              const player = new vimeo.Player(iframe);
              player.on("ended", () => {
                window.location.replace("/");
              });
            }
          }}
        />
      </section>

      <section className={styles.adventures}>
        <div className={styles.adventuresInner}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={styles.adventuresHead}
          >
            <h2 className={`font-fredoka ${styles.adventuresTitle}`}>
              Explore Amazing Adventures{" "}
              <Sparkles className={styles.adventuresSparkle} aria-hidden />
            </h2>
            <p className={`font-nunito ${styles.adventuresSub}`}>
              From prehistoric jungles to outer space — every episode is a new discovery!
            </p>
          </motion.div>

          <div className={styles.adventuresGrid}>
            {adventures.map((a, i) => (
              <Link key={a.title} href={a.href} className={styles.adventureLink}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 48px rgba(0,0,0,0.22)" }}
                  className={styles.adventureCard}
                >
                  <div className={styles.adventureMedia}>
                    <Image
                      src={a.img}
                      alt={a.title}
                      width={800}
                      height={450}
                      className={styles.adventureImage}
                    />
                  </div>
                  <div className={styles.adventureOverlay}>
                    <span className={styles.adventureTheme}>{a.theme}</span>
                    <div className={styles.adventureTitle}>{a.title}</div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.newsletter}>
        <div className={styles.newsletterInner}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Mail className={styles.newsletterIcon} aria-hidden />

            <h2 className={`font-fredoka ${styles.newsletterTitle}`}>Never Miss an Adventure!</h2>
            <p className={`font-nunito ${styles.newsletterSub}`}>
              Sign up for updates, fun activities, and be the first to know about new episodes!
            </p>

            <div className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Enter your email ✉️"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.newsletterInput}
                onFocus={(e) => {
                  e.target.style.borderColor = "#f5c518";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                }}
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  if (email) {
                    alert("Thanks for subscribing! 🎉");
                    setEmail("");
                  }
                }}
                className={styles.newsletterBtn}
              >
                Subscribe! <Sparkles className={styles.newsletterBtnIcon} aria-hidden />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
