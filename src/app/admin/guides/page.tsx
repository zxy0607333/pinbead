import type { Metadata } from "next";
import Link from "next/link";

import { seedStarterGuidesAction } from "@/app/admin/guides/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContentStatus, Prisma } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Guides",
};

type AdminGuidesPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

function getStatusFilter(status?: string) {
  if (!status || status === "all") {
    return undefined;
  }

  return Object.values(ContentStatus).includes(status as ContentStatus)
    ? (status as ContentStatus)
    : undefined;
}

export default async function AdminGuidesPage({
  searchParams,
}: AdminGuidesPageProps) {
  await requireAdminSession();

  const { q = "", status = "all" } = await searchParams;
  const query = q.trim();
  const statusFilter = getStatusFilter(status);
  const where: Prisma.GuideWhereInput = {
    status: statusFilter,
    OR: query
      ? [
          { title: { contains: query } },
          { slug: { contains: query } },
          { summary: { contains: query } },
        ]
      : undefined,
  };
  const guides = await prisma.guide.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <AdminShell>
      <section className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Guides</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Manage tutorial drafts, SEO fields, and publishing status.
            </p>
          </div>
          <Link
            className="rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            href="/admin/guides/new"
          >
            New guide
          </Link>
        </div>

        {guides.length === 0 && !query && status === "all" ? (
          <form
            action={seedStarterGuidesAction}
            className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
          >
            <p className="text-sm leading-6 text-[var(--muted)]">
              No guides exist yet. Seed the first five guide drafts from the
              launch plan.
            </p>
            <button
              className="mt-3 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              type="submit"
            >
              Create starter guide drafts
            </button>
          </form>
        ) : null}

        <form className="mt-6 grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm md:grid-cols-[1fr_180px_auto]">
          <input
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            defaultValue={query}
            name="q"
            placeholder="Search title, slug, summary"
          />
          <select
            className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            defaultValue={status}
            name="status"
          >
            <option value="all">All status</option>
            {Object.values(ContentStatus).map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption.toLowerCase()}
              </option>
            ))}
          </select>
          <button
            className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            type="submit"
          >
            Filter
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="grid grid-cols-[1fr_130px_120px] gap-4 border-b border-[var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            <span>Guide</span>
            <span>Status</span>
            <span>Updated</span>
          </div>
          {guides.length > 0 ? (
            guides.map((guide) => (
              <Link
                className="grid grid-cols-[1fr_130px_120px] gap-4 border-b border-[var(--border)] px-4 py-4 text-sm last:border-b-0 hover:bg-[var(--surface-soft)]"
                href={`/admin/guides/${guide.id}`}
                key={guide.id}
              >
                <span>
                  <span className="block font-semibold">{guide.title}</span>
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    /guides/{guide.slug}
                  </span>
                </span>
                <span className="font-semibold">{guide.status.toLowerCase()}</span>
                <span>{guide.updatedAt.toLocaleDateString("en-US")}</span>
              </Link>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-[var(--muted)]">
              No guides found.
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
