import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateGuideAction } from "@/app/admin/guides/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { GuideForm } from "@/components/admin/guide-form";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Edit Guide",
};

type EditGuidePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditGuidePage({ params }: EditGuidePageProps) {
  await requireAdminSession();

  const { id } = await params;
  const guide = await prisma.guide.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      content: true,
      seoTitle: true,
      seoDescription: true,
      status: true,
    },
  });

  if (!guide) {
    notFound();
  }

  return (
    <AdminShell>
      <section className="mx-auto w-full max-w-4xl px-5 py-8 md:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">Edit guide</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Update tutorial content, SEO fields, and publishing status.
          </p>
        </div>
        <GuideForm action={updateGuideAction.bind(null, guide.id)} guide={guide} />
      </section>
    </AdminShell>
  );
}
