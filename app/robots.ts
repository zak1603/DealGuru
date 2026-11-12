import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Keeps search engine crawlers from registering as affiliate clicks. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/api/" }, sitemap: `${siteUrl}/sitemap.xml` };
}
