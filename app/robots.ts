import type { MetadataRoute } from "next";

/** Keeps search engine crawlers from registering as affiliate clicks. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/api/" } };
}
