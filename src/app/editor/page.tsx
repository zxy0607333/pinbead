import { PatternEditorShell } from "@/components/editor/pattern-editor-shell";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bead Pattern Editor",
  description:
    "Design custom pin bead patterns with editable grids, palettes, color counts, and printable exports.",
};

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-7xl px-5 py-6 md:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link className="text-lg font-semibold" href="/">
            Pinbead
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              className="rounded-md border border-[var(--border)] bg-white px-3 py-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href="/convert"
            >
              Import image
            </Link>
            <Link
              className="rounded-md border border-[var(--border)] bg-white px-3 py-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href="/patterns"
            >
              Patterns
            </Link>
          </nav>
        </header>

        <PatternEditorShell />
      </div>
    </main>
  );
}
