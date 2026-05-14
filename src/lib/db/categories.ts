import { ContentStatus, type Prisma } from "@/generated/prisma/client";

import { prisma } from "./prisma";

export const categorySelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  seoTitle: true,
  seoDescription: true,
  sortOrder: true,
} satisfies Prisma.CategorySelect;

export type PublishedCategory = Prisma.CategoryGetPayload<{
  select: typeof categorySelect;
}>;

export function getPublishedCategories() {
  return prisma.category.findMany({
    where: {
      status: ContentStatus.PUBLISHED,
      patterns: {
        some: {
          status: ContentStatus.PUBLISHED,
        },
      },
    },
    select: categorySelect,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export function getPublishedCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: {
      slug,
      status: ContentStatus.PUBLISHED,
    },
    select: categorySelect,
  });
}
