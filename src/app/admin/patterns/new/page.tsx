import type { Metadata } from "next";

import { createPatternAction } from "@/app/admin/patterns/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { PatternForm } from "@/components/admin/pattern-form";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "New Pattern",
};

export default async function NewPatternPage() {
  await requireAdminSession();

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return (
    <AdminShell>
      <section className="mx-auto w-full max-w-4xl px-5 py-8 md:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">New pattern</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Create a draft, add the pattern JSON, and publish when metadata and
            assets are ready.
          </p>
        </div>
        <PatternForm action={createPatternAction} categories={categories} />
      </section>
    </AdminShell>
  );
}
