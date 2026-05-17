import type { Metadata } from "next";

import { logoutAdminAction } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/admin/auth";

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
  const session = await requireAdminSession();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
              Pinbead Admin
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{session.email}</p>
          </div>
          <form action={logoutAdminAction}>
            <button
              className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold">Content dashboard</h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            This private workspace will manage the pattern library, categories,
            and guide content before public pages read from the database.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {adminSections.map((section) => (
            <article
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
              key={section.title}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                {section.status}
              </span>
              <h2 className="mt-3 text-xl font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {section.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
