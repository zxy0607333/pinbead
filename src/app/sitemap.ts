import type { MetadataRoute } from "next";

import { getPublishedCategories } from "@/lib/db/categories";
import { getPublishedGuideSummaries } from "@/lib/db/guides";
import { getPublishedPatternSummaries } from "@/lib/db/patterns";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

function route(path: string, priority: number): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    route("/", 1),
    route("/patterns", 0.9),
    route("/guides", 0.8),
    route("/editor", 0.7),
    route("/convert", 0.7),
    route("/privacy", 0.2),
    route("/terms", 0.2),
    route("/contact", 0.2),
    route("/copyright", 0.2),
  ];

  try {
    const [categories, patterns, guides] = await Promise.all([
      getPublishedCategories(),
      getPublishedPatternSummaries(),
      getPublishedGuideSummaries(),
    ]);

    return [
      ...staticRoutes,
      ...categories.map((category) => route(`/categories/${category.slug}`, 0.8)),
      ...patterns.map((pattern) => ({
        ...route(`/pattern/${pattern.slug}`, 0.9),
        lastModified: pattern.publishedAt ?? new Date(),
      })),
      ...guides.map((guide) => ({
        ...route(`/guides/${guide.slug}`, 0.8),
        lastModified: guide.publishedAt ?? new Date(),
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
