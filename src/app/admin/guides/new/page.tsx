import type { Metadata } from "next";

import { createGuideAction } from "@/app/admin/guides/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { GuideForm } from "@/components/admin/guide-form";
import { requireAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "New Guide",
};

export default async function NewGuidePage() {
  await requireAdminSession();

  return (
    <AdminShell>
      <section className="mx-auto w-full max-w-4xl px-5 py-8 md:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">New guide</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Create a tutorial draft and publish it when content and SEO fields
            are ready.
          </p>
        </div>
        <GuideForm action={createGuideAction} />
      </section>
    </AdminShell>
  );
}
