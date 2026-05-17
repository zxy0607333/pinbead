import type { Metadata } from "next";
import Link from "next/link";

import { PatternCard } from "@/components/patterns/pattern-card";
import { getPublishedCategories } from "@/lib/db/categories";
import { getPublishedPatternSummaries } from "@/lib/db/patterns";

export const metadata: Metadata = {
  title: "Free Printable Bead Patterns",
  description:
    "Browse beginner-friendly printable pin bead patterns, categories, and featured design ideas.",
};

export const dynamic = "force-dynamic";

export default async function PatternsPage() {
  const [patterns, categories] = await Promise.all([
    getPublishedPatternSummaries(),
    getPublishedCategories(),
  ]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-6 text-[var(--foreground)] md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link className="text-lg font-semibold" href="/">
          Pinbead
        </Link>

        <section className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Pattern library
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold">
              Free printable bead patterns
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              Browse original and editor-ready bead patterns published by
              Pinbead. Each pattern is designed to be printable, easy to scan,
              and useful for real fuse bead projects rather than just a pretty
              pixel preview.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <p className="text-sm font-semibold">Library status</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[var(--muted)]">Published</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {patterns.length}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Categories</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {categories.length}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="border-y border-[var(--border)] py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Browse by category</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Start with a focused collection when you know what you want to
                make.
              </p>
            </div>
            <Link
              className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
              href="/editor"
            >
              Create your own
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {categories.map((category) => (
                <Link
                  className="rounded-lg border border-[var(--border)] bg-white px-4 py-4 font-semibold shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  href={`/categories/${category.slug}`}
                  key={category.id}
                >
                  {category.name}
                  {category.description ? (
                    <span className="mt-2 block text-sm font-normal leading-5 text-[var(--muted)]">
                      {category.description}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-sm leading-6 text-[var(--muted)]">
              Categories will appear here after the first published patterns are
              organized in the admin CMS.
            </p>
          )}
        </section>

        <section className="py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Latest patterns</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Published patterns include size, difficulty, bead counts, color
                counts, and a preview image when available.
              </p>
            </div>
            <Link
              className="rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href="/convert"
            >
              Convert image
            </Link>
          </div>

          {patterns.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {patterns.map((pattern) => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-10">
              <h2 className="text-xl font-semibold">
                The public library is almost ready.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Pinbead is preparing original beginner-friendly patterns for
                this page. Once a pattern is published from the admin CMS, it
                will automatically appear here with its preview, category,
                dimensions, and making details.
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
      </div>
    </main>
  );
}
