"use client";

import { beadPalettes, defaultBeadPaletteId } from "@/data/bead-palettes";
import { useMemo, useState } from "react";
import type { PointerEvent } from "react";

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
  const [cells, setCells] = useState<Array<string | null>>(
    Array.from({ length: 24 * 24 }, () => null),
  );
  const [activeTool, setActiveTool] = useState<EditorTool>("Brush");
  const [activeColorId, setActiveColorId] = useState(
    palette.colors[0]?.id ?? "",
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGridLines, setShowGridLines] = useState(true);
  const activeColor =
    palette.colors.find((color) => color.id === activeColorId) ??
    palette.colors[0];
  const colorMap = useMemo(
    () => new Map(palette.colors.map((color) => [color.id, color])),
    [palette.colors],
  );
  const filledCellCount = cells.filter(Boolean).length;

  function handleCanvasSizeChange(size: number) {
    setCanvasSize(size);
    setCells(Array.from({ length: size * size }, () => null));
  }

  function paintCell(index: number) {
    if (!activeColor) {
      return;
    }

    setCells((currentCells) => {
      if (currentCells[index] === activeColor.id) {
        return currentCells;
      }

      const nextCells = [...currentCells];
      nextCells[index] = activeColor.id;
      return nextCells;
    });
  }

  function handleCellPointerDown(
    event: PointerEvent<HTMLButtonElement>,
    index: number,
  ) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDrawing(true);
    paintCell(index);
  }

  function handleCellPointerEnter(index: number) {
    if (isDrawing) {
      paintCell(index);
    }
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  const gridBackground = showGridLines ? "var(--border)" : "transparent";
  const gridGap = showGridLines ? "1px" : "0px";

  const gridCells = cells.map((colorId, index) => {
    const color = colorId ? colorMap.get(colorId) : null;

    return (
      <button
        aria-label={
          color
            ? `Cell ${index + 1}, ${color.code} ${color.name}`
            : `Empty cell ${index + 1}`
        }
        className="aspect-square touch-none bg-white"
        key={index}
        onPointerDown={(event) => handleCellPointerDown(event, index)}
        onPointerEnter={() => handleCellPointerEnter(index)}
        onPointerUp={stopDrawing}
        style={{ backgroundColor: color?.hex ?? "#ffffff" }}
        type="button"
      />
    );
  });

  const currentToolHint =
    activeTool === "Brush"
      ? "Click or drag across cells to paint with the selected color."
      : "This tool will be wired in the next editor task.";

  const activeColorLabel = activeColor
    ? `${activeColor.code} ${activeColor.name}`
    : "None";

  const activeColorHex = activeColor?.hex ?? "#ffffff";

  const gridLineLabel = showGridLines ? "Grid on" : "Grid off";

  const filledPercent = Math.round(
    (filledCellCount / Math.max(1, cells.length)) * 100,
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
                onClick={() => handleCanvasSizeChange(size)}
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

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            View
          </p>
          <button
            className="mt-3 flex w-full items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-white px-3 py-3 text-left text-sm font-semibold transition hover:border-[var(--accent)]"
            onClick={() => setShowGridLines((current) => !current)}
            type="button"
          >
            <span>{gridLineLabel}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                showGridLines
                  ? "bg-[var(--surface-soft)] text-[var(--accent)]"
                  : "bg-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {showGridLines ? "On" : "Off"}
            </span>
          </button>
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
            {activeTool} · {activeColor?.code}
          </span>
        </div>

        <div className="mt-5 overflow-auto">
          <div className="mx-auto min-w-[320px] max-w-[680px]">
            <div
              aria-label={`${canvasSize} by ${canvasSize} editable bead pattern canvas`}
              className="grid aspect-square overflow-hidden rounded-md border border-[var(--border)] shadow-sm"
              onPointerCancel={stopDrawing}
              onPointerLeave={stopDrawing}
              onPointerUp={stopDrawing}
              role="grid"
              style={{
                backgroundColor: gridBackground,
                gap: gridGap,
                gridTemplateColumns: `repeat(${canvasSize}, minmax(0, 1fr))`,
              }}
            >
              {gridCells}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
          {currentToolHint}
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
              <span className="font-semibold">
                {filledCellCount} / {cells.length}
              </span>
            </div>
            <div className="flex justify-between gap-3 rounded-md bg-[var(--surface-soft)] px-3 py-2">
              <span className="text-[var(--muted)]">Selected color</span>
              <span className="font-semibold">{activeColor?.code}</span>
            </div>
            <div className="flex justify-between gap-3 rounded-md bg-[var(--surface-soft)] px-3 py-2">
              <span className="text-[var(--muted)]">Filled</span>
              <span className="font-semibold">{filledPercent}%</span>
            </div>
          </div>
          <div className="mt-4 rounded-md border border-[var(--border)] bg-white px-3 py-3 text-sm">
            <span
              aria-hidden="true"
              className="mr-2 inline-block h-4 w-4 rounded-sm border border-black/10 align-middle"
              style={{ backgroundColor: activeColorHex }}
            />
            <span className="font-semibold">{activeColorLabel}</span>
          </div>
        </section>
      </aside>
    </div>
  );
}
