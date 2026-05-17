"use client";

import { saveEditorDraftPattern } from "@/lib/pattern/pattern-draft-storage";
import type { PinbeadPattern } from "@/lib/pattern/pattern-model";

export function OpenInEditorButton({ pattern }: { pattern: PinbeadPattern }) {
  function handleOpenInEditor() {
    saveEditorDraftPattern(pattern);
    window.location.href = "/editor?draft=1";
  }

  return (
    <button
      className="rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
      onClick={handleOpenInEditor}
      type="button"
    >
      Open in editor
    </button>
  );
}
