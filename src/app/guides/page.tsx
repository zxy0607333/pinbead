import type { Metadata } from "next";
import Link from "next/link";

import {
  getPublishedGuideSummaries,
  type PublishedGuideSummary,
} from "@/lib/db/guides";

export const metadata: Metadata = {
  title: "Bead Pattern Guides",
  description:
    "Learn how to make bead patterns, convert photos, use the Pinbead editor, choose colors, and follow printable charts.",
};

export const dynamic = "force-dynamic";

function formatGuideDate(date: Date | null) {
  return date
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently updated";
}

function GuideCard({ guide }: { guide: PublishedGuideSummary }) {
  return (
    <Link
      className="grid gap-3 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--accent)]"
      href={`/guides/${guide.slug}`}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
        Guide
      </span>
      <h2 className="text-xl font-semibold">{guide.title}</h2>
      {guide.summary ? (
        <p className="text-sm leading-6 text-[var(--muted)]">{guide.summary}</p>
      ) : null}
      <span className="text-sm font-semibold text-[var(--foreground)]">
        Read guide
        <span className="ml-2 text-[var(--muted)]">
          {formatGuideDate(guide.publishedAt)}
        </span>
      </span>
    </Link>
  );
}

export default async function GuidesPage() {
  const guides = await getPublishedGuideSummaries();

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-6 text-[var(--foreground)] md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link className="text-lg font-semibold" href="/">
          Pinbead
        </Link>

        <section className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Bead pattern guides
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold">
              Learn to design, print, and follow bead patterns
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              Practical Pinbead tutorials for makers who want cleaner charts,
              better color choices, and patterns that are useful at the table,
              not only on a screen.
            </p>
          </div>

          <aside className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <p className="text-sm font-semibold">Start here</p>
            <div className="mt-4 grid gap-2 text-sm">
              <Link
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2 font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href="/editor"
              >
                Open the editor
              </Link>
              <Link
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2 font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href="/convert"
              >
                Convert an image
              </Link>
              <Link
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2 font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href="/patterns"
              >
                Browse patterns
              </Link>
            </div>
          </aside>
        </section>

        <section className="border-y border-[var(--border)] py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Latest guides</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Each guide is written to support a real project workflow:
                choosing a pattern, preparing beads, editing small details, and
                exporting a chart you can follow.
              </p>
            </div>
            <span className="rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold">
              {guides.length} published
            </span>
          </div>

          {guides.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <GuideCard guide={guide} key={guide.id} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-10">
              <h2 className="text-xl font-semibold">
                The guide library is being prepared.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Pinbead tutorials will appear here after they are published
                from the admin CMS. Until then, you can still start a custom
                chart in the editor or convert an image into an editable bead
                pattern draft.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  className="rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                  href="/editor"
                >
                  Start designing
                </Link>
                <Link
                  className="rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  href="/convert"
                >
                  Convert image
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-4 py-10 md:grid-cols-3">
          {[
            [
              "Design",
              "Learn how to turn ideas into bead grids with clear shapes and readable color areas.",
            ],
            [
              "Convert",
              "Use image conversion as a draft, then refine outlines, colors, and details by hand.",
            ],
            [
              "Make",
              "Print charts, count beads, sort colors, and follow patterns without losing your place.",
            ],
          ].map(([title, description]) => (
            <div
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
              key={title}
            >
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {description}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
