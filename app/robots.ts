import type { MetadataRoute } from "next";

/** Keeps search engine crawlers out of affiliate links and the admin page. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: ["/api/", "/admin"] } };
}
