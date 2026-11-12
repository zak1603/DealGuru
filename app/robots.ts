import type { MetadataRoute } from "next";

/** Keeps search engine crawlers out of affiliate links, the admin page and pages opened from emails. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: ["/api/", "/admin", "/reset-password", "/unsubscribe"] } };
}
