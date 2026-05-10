import { HomePatternMaker } from "@/components/home-pattern-maker";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Image to Bead Pattern Converter",
  description:
    "Convert an image into an editable pin bead pattern draft with palette matching, bead counts, and PNG export.",
};

export default function ConvertPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-6 text-[var(--foreground)] md:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <Link className="text-lg font-semibold" href="/">
            Pinbead
          </Link>
          <Link
            className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
            href="/editor"
          >
            Open editor
          </Link>
        </header>

        <section className="py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Image import
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">
            Convert an image into an editable bead pattern draft.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
            Automatic conversion is a starting point. Use the editor next to
            fix shapes, eyes, outlines, and colors before printing.
          </p>
        </section>

        <HomePatternMaker />
      </div>
    </main>
  );
}

