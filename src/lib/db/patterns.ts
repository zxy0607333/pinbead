import { ContentStatus, type Prisma } from "@/generated/prisma/client";

import { prisma } from "./prisma";

export const patternSummarySelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  difficulty: true,
  width: true,
  height: true,
  colorCount: true,
  beadCount: true,
  paletteId: true,
  previewImageUrl: true,
  sourceType: true,
  publishedAt: true,
  category: {
    select: {
      slug: true,
      name: true,
    },
  },
} satisfies Prisma.PatternSelect;

export const patternDetailSelect = {
  ...patternSummarySelect,
  description: true,
  cellsJson: true,
  downloadImageUrl: true,
  seoTitle: true,
  seoDescription: true,
} satisfies Prisma.PatternSelect;

export type PublishedPatternSummary = Prisma.PatternGetPayload<{
  select: typeof patternSummarySelect;
}>;

export type PublishedPatternDetail = Prisma.PatternGetPayload<{
  select: typeof patternDetailSelect;
}>;

export function getPublishedPatternSummaries() {
  return prisma.pattern.findMany({
    where: {
      status: ContentStatus.PUBLISHED,
    },
    select: patternSummarySelect,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export function getPublishedPatternBySlug(slug: string) {
  return prisma.pattern.findFirst({
    where: {
      slug,
      status: ContentStatus.PUBLISHED,
    },
    select: patternDetailSelect,
  });
}

export function getPublishedPatternsByCategorySlug(categorySlug: string) {
  return prisma.pattern.findMany({
    where: {
      status: ContentStatus.PUBLISHED,
      category: {
        slug: categorySlug,
        status: ContentStatus.PUBLISHED,
      },
    },
    select: patternSummarySelect,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}
