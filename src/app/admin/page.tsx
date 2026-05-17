import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Admin",
};

const adminSections = [
  {
    title: "Patterns",
    text: "Create drafts, update metadata, and publish library patterns.",
    status: "Next",
  },
  {
    title: "Categories",
    text: "Manage SEO categories for the public pattern library.",
    status: "Planned",
  },
  {
    title: "Guides",
    text: "Prepare tutorial articles for long-tail search pages.",
    status: "Planned",
  },
];

export default async function AdminPage() {
  return (
    <AdminShell>
      <section className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold">Content dashboard</h1>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              This private workspace manages the pattern library, categories,
              and guide content before public pages read from the database.
            </p>
          </div>
          <Link
            className="rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            href="/admin/patterns/new"
          >
            New pattern
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {adminSections.map((section) => (
            <Link
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
              href={section.title === "Patterns" ? "/admin/patterns" : "/admin"}
              key={section.title}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                {section.status}
              </span>
              <h2 className="mt-3 text-xl font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {section.text}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
