import type { MetadataRoute } from "next";

const BASE = "https://www.allengirlsadventures.com"; // ← update to your production domain

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep auth/app surfaces out of the index; marketing pages carry SEO.
        disallow: ["/account/", "/rewards", "/parent", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
