import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Printable Bead Patterns",
  description:
    "Browse beginner-friendly printable pin bead patterns, categories, and featured design ideas.",
};

const categoryLinks = [
  ["Animals", "/categories/animals"],
  ["Food", "/categories/food"],
  ["Holidays", "/categories/holidays"],
  ["Beginner", "/categories/beginner"],
] as const;

export default function PatternsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-6 text-[var(--foreground)] md:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Link className="text-lg font-semibold" href="/">
          Pinbead
        </Link>
        <section className="py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Pattern library
          </p>
          <h1 className="mt-3 text-4xl font-semibold">
            Free printable bead patterns
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
            The full library is being organized around original, printable
            beginner patterns and clean category pages.
          </p>
        </section>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {categoryLinks.map(([name, href]) => (
            <Link
              className="rounded-lg border border-[var(--border)] bg-white px-4 py-4 font-semibold shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href={href}
              key={name}
            >
              {name}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

