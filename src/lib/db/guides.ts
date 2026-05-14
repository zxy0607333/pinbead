import { ContentStatus, type Prisma } from "@/generated/prisma/client";

import { prisma } from "./prisma";

export const guideSummarySelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  publishedAt: true,
} satisfies Prisma.GuideSelect;

export const guideDetailSelect = {
  ...guideSummarySelect,
  content: true,
  seoTitle: true,
  seoDescription: true,
} satisfies Prisma.GuideSelect;

export type PublishedGuideSummary = Prisma.GuideGetPayload<{
  select: typeof guideSummarySelect;
}>;

export type PublishedGuideDetail = Prisma.GuideGetPayload<{
  select: typeof guideDetailSelect;
}>;

export function getPublishedGuideSummaries() {
  return prisma.guide.findMany({
    where: {
      status: ContentStatus.PUBLISHED,
    },
    select: guideSummarySelect,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export function getPublishedGuideBySlug(slug: string) {
  return prisma.guide.findFirst({
    where: {
      slug,
      status: ContentStatus.PUBLISHED,
    },
    select: guideDetailSelect,
  });
}
