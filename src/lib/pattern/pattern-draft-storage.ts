import {
  createPattern,
  type PinbeadPattern,
  type PinbeadPatternCell,
  type PinbeadPatternSource,
} from "@/lib/pattern/pattern-model";

const editorDraftStorageKey = "pinbead.editorDraft.v1";

type StoredEditorDraft = {
  pattern: PinbeadPattern;
  savedAt: string;
};

function isPatternSource(value: unknown): value is PinbeadPatternSource {
  return value === "blank" || value === "image-draft" || value === "library";
}

function isPatternCell(value: unknown): value is PinbeadPatternCell {
  return typeof value === "string" || value === null;
}

function normalizeStoredPattern(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const pattern = value as Partial<PinbeadPattern>;

  if (
    typeof pattern.width !== "number" ||
    typeof pattern.height !== "number" ||
    typeof pattern.paletteId !== "string" ||
    !Array.isArray(pattern.cells)
  ) {
    return null;
  }

  if (!pattern.cells.every(isPatternCell)) {
    return null;
  }

  return createPattern({
    width: pattern.width,
    height: pattern.height,
    paletteId: pattern.paletteId,
    title:
      typeof pattern.title === "string" ? pattern.title : "Image draft",
    source: isPatternSource(pattern.source) ? pattern.source : "image-draft",
    cells: pattern.cells,
  });
}

export function saveEditorDraftPattern(pattern: PinbeadPattern) {
  const storedDraft: StoredEditorDraft = {
    pattern,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(editorDraftStorageKey, JSON.stringify(storedDraft));
}

export function consumeEditorDraftPattern() {
  const rawDraft = localStorage.getItem(editorDraftStorageKey);

  if (!rawDraft) {
    return null;
  }

  localStorage.removeItem(editorDraftStorageKey);

  try {
    const parsedDraft = JSON.parse(rawDraft) as Partial<StoredEditorDraft>;

    return normalizeStoredPattern(parsedDraft.pattern);
  } catch {
    return null;
  }
}
