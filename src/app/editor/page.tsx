import { PatternEditorShell } from "@/components/editor/pattern-editor-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bead Pattern Editor",
  description:
    "Design custom pin bead patterns with editable grids, palettes, color counts, and printable exports.",
};

export default function EditorPage() {
  return (
    <main className="min-h-dvh bg-[var(--background)] text-[var(--foreground)] xl:h-dvh xl:overflow-hidden">
      <div className="mx-auto flex min-h-dvh w-full max-w-none flex-col xl:h-full xl:min-h-0">
        <PatternEditorShell />
      </div>
    </main>
  );
}
