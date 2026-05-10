"use client";

import { beadPalettes, defaultBeadPaletteId } from "@/data/bead-palettes";
import { useMemo, useState } from "react";

const canvasSizes = [16, 24, 32, 50];
const tools = ["Brush", "Eraser", "Fill"] as const;

type EditorTool = (typeof tools)[number];

function getDefaultPalette() {
  return (
    beadPalettes.find((palette) => palette.id === defaultBeadPaletteId) ??
    beadPalettes[0]
  );
}

export function PatternEditorShell() {
  const palette = getDefaultPalette();
  const [canvasSize, setCanvasSize] = useState(24);
  const [activeTool, setActiveTool] = useState<EditorTool>("Brush");
  const [activeColorId, setActiveColorId] = useState(
    palette.colors[0]?.id ?? "",
  );
  const activeColor =
    palette.colors.find((color) => color.id === activeColorId) ??
    palette.colors[0];
  const cells = useMemo(
    () => Array.from({ length: canvasSize * canvasSize }),
    [canvasSize],
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
      <aside className="grid gap-4 self-start">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Canvas
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {canvasSizes.map((size) => (
              <button
                className={`rounded-md border px-3 py-3 text-sm font-semibold transition ${
                  canvasSize === size
                    ? "border-[var(--accent)] bg-[var(--surface-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--accent)]"
                }`}
                key={size}
                onClick={() => setCanvasSize(size)}
                type="button"
              >
                {size} x {size}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Tools
          </p>
          <div className="mt-3 grid gap-2">
            {tools.map((tool) => (
              <button
                className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                  activeTool === tool
                    ? "border-[var(--accent)] bg-[var(--surface-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--accent)]"
                }`}
                key={tool}
                onClick={() => setActiveTool(tool)}
                type="button"
              >
                {tool}
              </button>
            ))}
          </div>
        </section>
      </aside>

      <section className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <h1 className="text-xl font-semibold">Bead Pattern Editor</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {canvasSize} x {canvasSize} grid, {palette.brand} {palette.name}
            </p>
          </div>
          <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            {activeTool}
          </span>
        </div>

        <div className="mt-5 overflow-auto">
          <div className="mx-auto min-w-[320px] max-w-[680px]">
            <div
              aria-label={`${canvasSize} by ${canvasSize} blank bead pattern canvas`}
              className="grid aspect-square overflow-hidden rounded-md border border-[var(--border)] bg-[var(--border)] shadow-sm"
              role="grid"
              style={{
                gridTemplateColumns: `repeat(${canvasSize}, minmax(0, 1fr))`,
              }}
            >
              {cells.map((_, index) => (
                <span
                  aria-label={`Empty cell ${index + 1}`}
                  className="aspect-square bg-white"
                  key={index}
                  role="gridcell"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <aside className="grid gap-4 self-start">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Palette
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {palette.description}
          </p>
          <div className="mt-4 grid max-h-[360px] gap-2 overflow-auto pr-1">
            {palette.colors.map((color) => (
              <button
                className={`flex items-center gap-3 rounded-md border px-3 py-2 text-left transition ${
                  activeColor?.id === color.id
                    ? "border-[var(--accent)] bg-[var(--surface-soft)]"
                    : "border-[var(--border)] bg-white hover:border-[var(--accent)]"
                }`}
                key={color.id}
                onClick={() => setActiveColorId(color.id)}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="h-7 w-7 rounded-md border border-black/10"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[var(--foreground)]">
                    {color.name}
                  </span>
                  <span className="block text-xs text-[var(--muted)]">
                    {color.code} - {color.hex}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Pattern summary
          </p>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between gap-3 rounded-md bg-[var(--surface-soft)] px-3 py-2">
              <span className="text-[var(--muted)]">Canvas</span>
              <span className="font-semibold">
                {canvasSize} x {canvasSize}
              </span>
            </div>
            <div className="flex justify-between gap-3 rounded-md bg-[var(--surface-soft)] px-3 py-2">
              <span className="text-[var(--muted)]">Filled cells</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between gap-3 rounded-md bg-[var(--surface-soft)] px-3 py-2">
              <span className="text-[var(--muted)]">Selected color</span>
              <span className="font-semibold">{activeColor?.code}</span>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}

