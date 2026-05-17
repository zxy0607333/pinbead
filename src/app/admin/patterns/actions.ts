"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  ContentStatus,
  PatternDifficulty,
  PatternSourceType,
  Prisma,
} from "@/generated/prisma/client";
import { assertSameOriginRequest } from "@/lib/admin/request-security";
import { requireAdminSession } from "@/lib/admin/auth";
import { storeAdminUpload } from "@/lib/admin/uploads";
import { prisma } from "@/lib/db/prisma";
import { defaultBeadPaletteId } from "@/data/bead-palettes";
import { pinbeadPatternModelVersion } from "@/lib/pattern/pattern-model";

export type PatternFormState = {
  error?: string;
  success?: string;
};

const starterCategories = [
  {
    slug: "animals",
    name: "Animals",
    description: "Printable bead patterns inspired by animals and pets.",
    sortOrder: 10,
  },
  {
    slug: "food",
    name: "Food",
    description: "Cute food and snack bead pattern ideas.",
    sortOrder: 20,
  },
  {
    slug: "holidays",
    name: "Holidays",
    description: "Seasonal bead patterns for holidays and celebrations.",
    sortOrder: 30,
  },
  {
    slug: "beginner",
    name: "Beginner",
    description: "Small, simple bead patterns for first projects.",
    sortOrder: 40,
  },
  {
    slug: "cute",
    name: "Cute",
    description: "Kawaii and cute bead pattern designs.",
    sortOrder: 50,
  },
  {
    slug: "nature",
    name: "Nature",
    description: "Flowers, plants, weather, and outdoor bead patterns.",
    sortOrder: 60,
  },
  {
    slug: "letters-numbers",
    name: "Letters & Numbers",
    description: "Alphabet and number bead charts for custom projects.",
    sortOrder: 70,
  },
];

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getFormFile(formData: FormData, key: string) {
  const value = formData.get(key);

  return value instanceof File && value.size > 0 ? value : null;
}

function parsePositiveInteger(value: string, fieldName: string) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${fieldName} must be a positive number.`);
  }

  return parsedValue;
}

function parseOptionalNonNegativeInteger(value: string, fieldName: string) {
  if (!value) {
    return 0;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new Error(`${fieldName} must be zero or a positive number.`);
  }

  return parsedValue;
}

function parseEnumValue<T extends Record<string, string>>(
  enumObject: T,
  value: string,
  fallback: T[keyof T],
) {
  const values = Object.values(enumObject);

  return values.includes(value) ? (value as T[keyof T]) : fallback;
}

function createBlankPatternJson({
  height,
  paletteId,
  title,
  width,
}: {
  height: number;
  paletteId: string;
  title: string;
  width: number;
}) {
  return {
    version: pinbeadPatternModelVersion,
    title,
    width,
    height,
    paletteId,
    source: "library",
    cells: Array.from({ length: width * height }, () => null),
  };
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizePatternJson({
  cellsJsonText,
  height,
  paletteId,
  title,
  width,
}: {
  cellsJsonText: string;
  height: number;
  paletteId: string;
  title: string;
  width: number;
}) {
  const parsedJson = cellsJsonText
    ? (JSON.parse(cellsJsonText) as unknown)
    : createBlankPatternJson({ height, paletteId, title, width });

  const patternJson = Array.isArray(parsedJson)
    ? createBlankPatternJson({ height, paletteId, title, width })
    : parsedJson;

  if (!isJsonObject(patternJson)) {
    throw new Error("Pattern JSON must be an object.");
  }

  const cells = patternJson.cells;

  if (!Array.isArray(cells)) {
    throw new Error("Pattern JSON must include a cells array.");
  }

  if (cells.length !== width * height) {
    throw new Error("Pattern JSON cell count must match width x height.");
  }

  const normalizedCells = cells.map((cell) =>
    typeof cell === "string" && cell ? cell : null,
  );
  const colorIds = new Set(normalizedCells.filter(Boolean));

  return {
    json: {
      ...patternJson,
      version: pinbeadPatternModelVersion,
      title,
      width,
      height,
      paletteId,
      source: "library",
      cells: normalizedCells,
    } satisfies Prisma.InputJsonValue,
    beadCount: normalizedCells.filter(Boolean).length,
    colorCount: colorIds.size,
  };
}

function validateSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug must use lowercase letters, numbers, and hyphens.");
  }
}

async function getPatternFormData(
  formData: FormData,
  existingPatternId?: string,
) {
  await requireAdminSession();
  await assertSameOriginRequest();

  const title = getFormString(formData, "title");
  const slug = getFormString(formData, "slug").toLowerCase();
  const summary = getFormString(formData, "summary") || null;
  const description = getFormString(formData, "description") || null;
  const categoryId = getFormString(formData, "categoryId") || null;
  const width = parsePositiveInteger(getFormString(formData, "width"), "Width");
  const height = parsePositiveInteger(
    getFormString(formData, "height"),
    "Height",
  );
  const paletteId = getFormString(formData, "paletteId") || defaultBeadPaletteId;
  const cellsJsonText = getFormString(formData, "cellsJson");
  const seoTitle = getFormString(formData, "seoTitle") || null;
  const seoDescription = getFormString(formData, "seoDescription") || null;
  const sourceType = parseEnumValue(
    PatternSourceType,
    getFormString(formData, "sourceType"),
    PatternSourceType.ORIGINAL,
  );
  const difficulty = parseEnumValue(
    PatternDifficulty,
    getFormString(formData, "difficulty"),
    PatternDifficulty.BEGINNER,
  );
  const intent = getFormString(formData, "intent");
  const selectedStatus = parseEnumValue(
    ContentStatus,
    getFormString(formData, "status"),
    ContentStatus.DRAFT,
  );
  const status =
    intent === "publish"
      ? ContentStatus.PUBLISHED
      : intent === "archive"
        ? ContentStatus.ARCHIVED
        : intent === "draft"
          ? ContentStatus.DRAFT
          : selectedStatus;

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!slug) {
    throw new Error("Slug is required.");
  }

  validateSlug(slug);

  const existingSlugPattern = await prisma.pattern.findFirst({
    where: {
      slug,
      id: existingPatternId ? { not: existingPatternId } : undefined,
    },
    select: {
      id: true,
    },
  });

  if (existingSlugPattern) {
    throw new Error("Slug is already used by another pattern.");
  }

  const normalizedPatternJson = normalizePatternJson({
    cellsJsonText,
    height,
    paletteId,
    title,
    width,
  });

  const manualColorCount = parseOptionalNonNegativeInteger(
    getFormString(formData, "colorCount"),
    "Color count",
  );
  const manualBeadCount = parseOptionalNonNegativeInteger(
    getFormString(formData, "beadCount"),
    "Bead count",
  );
  const previewImageUrl = getFormString(formData, "existingPreviewImageUrl");
  const downloadImageUrl = getFormString(formData, "existingDownloadImageUrl");
  const previewFile = getFormFile(formData, "previewFile");
  const downloadFile = getFormFile(formData, "downloadFile");
  const nextPreviewImageUrl =
    ((previewFile ? await storeAdminUpload(previewFile, "previews") : null) ??
      previewImageUrl) ||
    null;
  const nextDownloadImageUrl =
    ((downloadFile ? await storeAdminUpload(downloadFile, "downloads") : null) ??
      downloadImageUrl) ||
    null;

  if (status === ContentStatus.PUBLISHED) {
    if (!categoryId) {
      throw new Error("Published patterns need a category.");
    }

    if (!summary || !description || !seoTitle || !seoDescription) {
      throw new Error("Published patterns need summary, description, and SEO fields.");
    }

    if (!nextPreviewImageUrl) {
      throw new Error("Published patterns need a preview image.");
    }
  }

  return {
    slug,
    title,
    summary,
    description,
    categoryId,
    difficulty,
    width,
    height,
    colorCount: normalizedPatternJson.colorCount || manualColorCount,
    beadCount: normalizedPatternJson.beadCount || manualBeadCount,
    paletteId,
    cellsJson: normalizedPatternJson.json,
    previewImageUrl: nextPreviewImageUrl,
    downloadImageUrl: nextDownloadImageUrl,
    sourceType,
    seoTitle,
    seoDescription,
    status,
    publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null,
  };
}

function revalidateAdminPatternPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/patterns");
  revalidatePath("/patterns");
}

export async function createPatternAction(
  _previousState: PatternFormState,
  formData: FormData,
): Promise<PatternFormState> {
  let createdPatternId: string;

  try {
    const patternData = await getPatternFormData(formData);
    const pattern = await prisma.pattern.create({
      data: patternData,
      select: {
        id: true,
      },
    });

    createdPatternId = pattern.id;
    revalidateAdminPatternPaths();
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Pattern could not be created.",
    };
  }

  redirect(`/admin/patterns/${createdPatternId}`);
}

export async function updatePatternAction(
  patternId: string,
  _previousState: PatternFormState,
  formData: FormData,
): Promise<PatternFormState> {
  try {
    const patternData = await getPatternFormData(formData, patternId);

    await prisma.pattern.update({
      where: {
        id: patternId,
      },
      data: patternData,
    });

    revalidateAdminPatternPaths();
    revalidatePath(`/admin/patterns/${patternId}`);

    return {
      success: "Pattern saved.",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Pattern could not be saved.",
    };
  }
}

export async function seedStarterCategoriesAction() {
  await requireAdminSession();
  await assertSameOriginRequest();

  await Promise.all(
    starterCategories.map((category) =>
      prisma.category.upsert({
        where: {
          slug: category.slug,
        },
        create: {
          ...category,
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
        },
        update: category,
      }),
    ),
  );

  revalidatePath("/admin/patterns");
}
