import type { MetadataRoute } from "next";
import { stores } from "@/data/stores";
import { isBlackFridayOver } from "@/lib/campaign";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    ...(isBlackFridayOver()
      ? []
      : [{ url: `${siteUrl}/black-friday`, changeFrequency: "daily" as const, priority: 0.9 }]),
    { url: `${siteUrl}/stores`, changeFrequency: "weekly", priority: 0.7 },
    ...stores.map((store) => ({
      url: `${siteUrl}/stores/${store.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    { url: `${siteUrl}/advertise`, changeFrequency: "monthly", priority: 0.3 },
  ];
}
