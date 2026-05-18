"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ContentStatus } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/admin/auth";
import { assertSameOriginRequest } from "@/lib/admin/request-security";
import { prisma } from "@/lib/db/prisma";

export type GuideFormState = {
  error?: string;
  success?: string;
};

const starterGuides = [
  {
    slug: "how-to-make-a-bead-pattern",
    title: "How to Make a Bead Pattern",
    summary:
      "Learn the basic workflow for turning a simple idea into a printable bead pattern.",
  },
  {
    slug: "how-to-turn-a-photo-into-a-bead-pattern",
    title: "How to Turn a Photo into a Bead Pattern",
    summary:
      "Use image conversion as a draft, then edit colors and details before making the final chart.",
  },
  {
    slug: "how-to-use-the-pinbead-editor",
    title: "How to Use the Pinbead Editor",
    summary:
      "A beginner walkthrough for drawing, filling, choosing colors, and exporting a Pinbead pattern.",
  },
  {
    slug: "bead-color-chart",
    title: "Bead Color Chart",
    summary:
      "Understand color codes, palette limits, and how to choose bead colors for printable patterns.",
  },
  {
    slug: "how-to-print-and-follow-a-bead-pattern",
    title: "How to Print and Follow a Bead Pattern",
    summary:
      "Tips for printing a chart, reading coordinates, sorting beads, and following a pattern row by row.",
  },
];

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function validateSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug 只能使用小写字母、数字和连字符。");
  }
}

function getStatus(formData: FormData) {
  const intent = getFormString(formData, "intent");
  const selectedStatus = getFormString(formData, "status");

  if (intent === "publish") {
    return ContentStatus.PUBLISHED;
  }

  if (intent === "archive") {
    return ContentStatus.ARCHIVED;
  }

  if (intent === "draft") {
    return ContentStatus.DRAFT;
  }

  return Object.values(ContentStatus).includes(selectedStatus as ContentStatus)
    ? (selectedStatus as ContentStatus)
    : ContentStatus.DRAFT;
}

async function getGuideFormData(formData: FormData, existingGuideId?: string) {
  await requireAdminSession();
  await assertSameOriginRequest();

  const title = getFormString(formData, "title");
  const slug = getFormString(formData, "slug").toLowerCase();
  const summary = getFormString(formData, "summary") || null;
  const content = getFormString(formData, "content") || null;
  const seoTitle = getFormString(formData, "seoTitle") || null;
  const seoDescription = getFormString(formData, "seoDescription") || null;
  const status = getStatus(formData);

  if (!title) {
    throw new Error("请填写标题。");
  }

  if (!slug) {
    throw new Error("请填写 slug。");
  }

  validateSlug(slug);

  const existingSlugGuide = await prisma.guide.findFirst({
    where: {
      slug,
      id: existingGuideId ? { not: existingGuideId } : undefined,
    },
    select: {
      id: true,
    },
  });

  if (existingSlugGuide) {
    throw new Error("这个 slug 已经被其他教程使用。");
  }

  if (status === ContentStatus.PUBLISHED) {
    if (!summary || !content || !seoTitle || !seoDescription) {
      throw new Error("发布教程前必须填写摘要、正文内容和 SEO 字段。");
    }
  }

  return {
    slug,
    title,
    summary,
    content,
    seoTitle,
    seoDescription,
    status,
    publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null,
  };
}

function revalidateGuidePaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/guides");
  revalidatePath("/guides");
}

export async function createGuideAction(
  _previousState: GuideFormState,
  formData: FormData,
): Promise<GuideFormState> {
  let createdGuideId: string;

  try {
    const guideData = await getGuideFormData(formData);
    const guide = await prisma.guide.create({
      data: guideData,
      select: {
        id: true,
      },
    });

    createdGuideId = guide.id;
    revalidateGuidePaths();
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "教程创建失败。",
    };
  }

  redirect(`/admin/guides/${createdGuideId}`);
}

export async function updateGuideAction(
  guideId: string,
  _previousState: GuideFormState,
  formData: FormData,
): Promise<GuideFormState> {
  try {
    const guideData = await getGuideFormData(formData, guideId);

    await prisma.guide.update({
      where: {
        id: guideId,
      },
      data: guideData,
    });

    revalidateGuidePaths();
    revalidatePath(`/admin/guides/${guideId}`);

    return {
      success: "教程已保存。",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "教程保存失败。",
    };
  }
}

export async function seedStarterGuidesAction() {
  await requireAdminSession();
  await assertSameOriginRequest();

  await Promise.all(
    starterGuides.map((guide) =>
      prisma.guide.upsert({
        where: {
          slug: guide.slug,
        },
        create: {
          ...guide,
          content: [
            guide.summary,
            "",
            "Use this draft as a starting point. Add practical steps, screenshots, example patterns, and links to the editor, converter, and pattern library before publishing.",
            "",
            "Helpful links:",
            "- /editor",
            "- /convert",
            "- /patterns",
          ].join("\n"),
          seoTitle: guide.title,
          seoDescription: guide.summary,
          status: ContentStatus.DRAFT,
        },
        update: {
          title: guide.title,
          summary: guide.summary,
        },
      }),
    ),
  );

  revalidateGuidePaths();
}
