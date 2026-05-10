import { BeadMosaic } from "@/components/bead-mosaic";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bead Pattern Editor",
  description:
    "Design custom pin bead patterns with editable grids, palettes, color counts, and printable exports.",
};

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-6 text-[var(--foreground)] md:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-[1fr_360px] md:items-center">
        <section>
          <Link className="text-lg font-semibold" href="/">
            Pinbead
          </Link>
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Editor workspace
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">
            The editor is next.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
            This page is ready for the dedicated grid editor. The current image
            conversion prototype has been moved off the homepage so the editor
            can become the core workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-strong)]"
              href="/convert"
            >
              Import image draft
            </Link>
            <Link
              className="rounded-md border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href="/patterns"
            >
              Browse patterns
            </Link>
          </div>
        </section>
        <BeadMosaic />
      </div>
    </main>
  );
}

