import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updatePatternAction } from "@/app/admin/patterns/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { PatternForm } from "@/components/admin/pattern-form";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "编辑图纸",
};

type EditPatternPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPatternPage({ params }: EditPatternPageProps) {
  await requireAdminSession();

  const { id } = await params;
  const [pattern, categories] = await Promise.all([
    prisma.pattern.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        description: true,
        categoryId: true,
        difficulty: true,
        width: true,
        height: true,
        colorCount: true,
        beadCount: true,
        paletteId: true,
        cellsJson: true,
        previewImageUrl: true,
        downloadImageUrl: true,
        sourceType: true,
        seoTitle: true,
        seoDescription: true,
        status: true,
      },
    }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  if (!pattern) {
    notFound();
  }

  return (
    <AdminShell>
      <section className="mx-auto w-full max-w-4xl px-5 py-8 md:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">编辑图纸</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            更新图纸元数据、图纸 JSON、上传文件和发布状态。
          </p>
        </div>
        <PatternForm
          action={updatePatternAction.bind(null, pattern.id)}
          categories={categories}
          pattern={pattern}
        />
      </section>
    </AdminShell>
  );
}
