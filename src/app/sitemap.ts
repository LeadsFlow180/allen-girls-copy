import type { MetadataRoute } from "next";

const BASE = "https://www.allengirlsadventures.com"; // ← update to your production domain

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1.0 },
    { path: "/curriculum", priority: 0.9 },
    { path: "/our-approach", priority: 0.9 },
    { path: "/families", priority: 0.9 },
    { path: "/educators", priority: 0.9 },
    { path: "/grade-4", priority: 0.9 },
    { path: "/compare", priority: 0.8 },
    { path: "/characters", priority: 0.8 },
    { path: "/blog", priority: 0.8 },
    { path: "/about", priority: 0.7 },
    { path: "/diversity", priority: 0.7 },
    { path: "/partners", priority: 0.7 },
    { path: "/faq", priority: 0.7 },
    { path: "/blog/is-ai-safe-for-kids-learning-apps", priority: 0.7 },
    { path: "/episodes", priority: 0.6 },
    { path: "/worlds", priority: 0.6 },
    { path: "/games", priority: 0.6 },
  ];
  return routes.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: r.priority,
  }));
}
