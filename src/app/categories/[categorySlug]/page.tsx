import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PatternCard } from "@/components/patterns/pattern-card";
import { getPublishedCategoryBySlug } from "@/lib/db/categories";
import { getPublishedPatternsByCategorySlug } from "@/lib/db/patterns";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getPublishedCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: "Category Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: category.seoTitle ?? `${category.name} Bead Patterns`,
    description:
      category.seoDescription ??
      category.description ??
      `Browse printable ${category.name.toLowerCase()} bead patterns from Pinbead.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const [category, patterns] = await Promise.all([
    getPublishedCategoryBySlug(categorySlug),
    getPublishedPatternsByCategorySlug(categorySlug),
  ]);

  if (!category || patterns.length === 0) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-6 text-[var(--foreground)] md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--muted)]">
          <Link className="text-[var(--foreground)] hover:text-[var(--accent)]" href="/">
            Pinbead
          </Link>
          <span>/</span>
          <Link className="hover:text-[var(--accent)]" href="/patterns">
            Patterns
          </Link>
          <span>/</span>
          <span>{category.name}</span>
        </nav>

        <section className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Pattern category
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold">
              {category.name} bead patterns
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              {category.description ??
                `Browse printable ${category.name.toLowerCase()} bead patterns with clean previews, dimensions, difficulty labels, and bead counts.`}
            </p>
          </div>

          <aside className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <p className="text-sm font-semibold">Category summary</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[var(--muted)]">Patterns</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {patterns.length}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Sort order</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {category.sortOrder}
                </dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className="border-y border-[var(--border)] py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                Printable {category.name.toLowerCase()} patterns
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Open a pattern to view its making details, preview image, and
                export options.
              </p>
            </div>
            <Link
              className="rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href="/patterns"
            >
              All patterns
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patterns.map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        </section>

        <section className="py-10">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Make your own design</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Use the Pinbead editor to create a custom chart from scratch, or
              convert an image into an editable bead pattern draft before
              refining the details.
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
        </section>
      </div>
    </main>
  );
}
