"use client";

import {
  beadPalettes,
  defaultBeadPaletteId,
  type BeadPalette,
} from "@/data/bead-palettes";
import {
  createBlankPattern,
  fillPatternConnectedArea,
  getPatternColorCounts,
  getPatternColorStats,
  getPatternFilledCellCount,
  updatePatternCellColor,
  type PinbeadPattern,
  type PinbeadPatternColorStat,
} from "@/lib/pattern/pattern-model";
import { useState } from "react";

const canvasSizes = [16, 24, 32, 50];
const tools = ["Brush", "Eraser", "Fill"] as const;
const exportPaperColor = "#ffffff";
const exportSurfaceColor = "#f8fafc";
const exportSoftSurfaceColor = "#eef2f7";
const exportBorderColor = "#d6dde8";
const exportTextColor = "#111827";
const exportMutedTextColor = "#64748b";

type EditorTool = (typeof tools)[number];
type EditorPatternExportOptions = {
  pattern: PinbeadPattern;
  colorStats: PinbeadPatternColorStat[];
  palette: BeadPalette;
  showColorCodes: boolean;
  showCoordinates: boolean;
  showGridLines: boolean;
};
type ViewToggleButtonProps = {
  isActive: boolean;
  label: string;
  onClick: () => void;
};

function getDefaultPalette() {
  return (
    beadPalettes.find((palette) => palette.id === defaultBeadPaletteId) ??
    beadPalettes[0]
  );
}

function getReadableTextColor(hex: string) {
  const normalizedHex = hex.replace("#", "");
  const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness < 145 ? "#ffffff" : "#111827";
}

function getCellCodeFontSize(size: number) {
  if (size >= 50) {
    return 5;
  }

  if (size >= 32) {
    return 7;
  }

  if (size >= 24) {
    return 9;
  }

  return 11;
}

function getCoordinateFontSize(size: number) {
  if (size >= 50) {
    return 9;
  }

  if (size >= 32) {
    return 10;
  }

  return 11;
}

function getBoardMinWidth(size: number, showColorCodes: boolean) {
  if (!showColorCodes) {
    return size >= 50 ? 620 : 420;
  }

  if (size >= 32) {
    return 760;
  }

  if (size >= 24) {
    return 720;
  }

  return 560;
}

function ViewToggleButton({ isActive, label, onClick }: ViewToggleButtonProps) {
  return (
    <button
      aria-pressed={isActive}
      className="flex w-full items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-white px-3 py-3 text-left text-sm font-semibold transition hover:border-[var(--accent)]"
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-3 py-1 text-xs ${
          isActive
            ? "bg-[var(--surface-soft)] text-[var(--accent)]"
            : "bg-[var(--border)] text-[var(--muted)]"
        }`}
      >
        {isActive ? "On" : "Off"}
      </span>
    </button>
  );
}

function formatTimestampForFileName(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate(),
  )}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function getEditorPatternExportFileName(pattern: PinbeadPattern) {
  return `pinbead-${pattern.width}x${pattern.height}-${formatTimestampForFileName(
    new Date(),
  )}.png`;
}

function getExportCellSize(size: number, showColorCodes: boolean) {
  if (size >= 50) {
    return showColorCodes ? 26 : 22;
  }

  if (size >= 32) {
    return showColorCodes ? 30 : 26;
  }

  if (size >= 24) {
    return showColorCodes ? 36 : 30;
  }

  return showColorCodes ? 42 : 34;
}

function drawTextWithinWidth(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
) {
  if (context.measureText(text).width <= maxWidth) {
    context.fillText(text, x, y);
    return;
  }

  let truncatedText = text;

  while (
    truncatedText.length > 0 &&
    context.measureText(`${truncatedText}...`).width > maxWidth
  ) {
    truncatedText = truncatedText.slice(0, -1);
  }

  context.fillText(`${truncatedText}...`, x, y);
}

function renderEditorPatternToCanvas({
  colorStats,
  palette,
  pattern,
  showColorCodes,
  showCoordinates,
  showGridLines,
}: EditorPatternExportOptions) {
  const colorMap = new Map(palette.colors.map((color) => [color.id, color]));
  const cellSize = getExportCellSize(
    Math.max(pattern.width, pattern.height),
    showColorCodes,
  );
  const coordinateSize = showCoordinates ? 36 : 0;
  const padding = 48;
  const headerHeight = 88;
  const gridWidth = pattern.width * cellSize;
  const gridHeight = pattern.height * cellSize;
  const boardWidth = gridWidth + coordinateSize * 2;
  const boardHeight = gridHeight + coordinateSize * 2;
  const legendColumns = boardWidth >= 780 ? 2 : 1;
  const legendRows = Math.max(1, Math.ceil(colorStats.length / legendColumns));
  const legendHeaderHeight = 46;
  const legendRowHeight = 46;
  const legendHeight = legendHeaderHeight + legendRows * legendRowHeight;
  const canvasWidth = Math.max(880, boardWidth + padding * 2);
  const canvasHeight = padding + headerHeight + boardHeight + 32 + legendHeight + padding;
  const boardX = Math.round((canvasWidth - boardWidth) / 2);
  const boardY = padding + headerHeight;
  const patternX = boardX + coordinateSize;
  const patternY = boardY + coordinateSize;
  const canvas = document.createElement("canvas");

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const context = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: false,
  });

  if (!context) {
    throw new Error("Your browser could not prepare the PNG export.");
  }

  const totalBeads = colorStats.reduce((total, stat) => total + stat.count, 0);

  context.fillStyle = exportPaperColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = exportTextColor;
  context.font = "700 30px Arial, sans-serif";
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillText("Pinbead Pattern", padding, padding + 8);

  context.fillStyle = exportMutedTextColor;
  context.font = "16px Arial, sans-serif";
  context.fillText(
    `${pattern.width} x ${pattern.height} grid | ${totalBeads} beads | ${colorStats.length} colors`,
    padding,
    padding + 38,
  );

  context.textAlign = "right";
  context.fillText(
    `Palette: ${palette.brand} ${palette.name}`,
    canvasWidth - padding,
    padding + 38,
  );

  context.fillStyle = exportSurfaceColor;
  context.fillRect(boardX, boardY, boardWidth, boardHeight);

  if (showCoordinates) {
    context.fillStyle = exportSoftSurfaceColor;
    context.fillRect(patternX, boardY, gridWidth, coordinateSize);
    context.fillRect(patternX, patternY + gridHeight, gridWidth, coordinateSize);
    context.fillRect(boardX, patternY, coordinateSize, gridHeight);
    context.fillRect(patternX + gridWidth, patternY, coordinateSize, gridHeight);

    context.fillStyle = exportMutedTextColor;
    context.font = "700 14px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

    for (let coordinate = 1; coordinate <= pattern.width; coordinate += 1) {
      const offset = (coordinate - 1) * cellSize + cellSize / 2;

      context.fillText(String(coordinate), patternX + offset, boardY + coordinateSize / 2);
      context.fillText(
        String(coordinate),
        patternX + offset,
        patternY + gridHeight + coordinateSize / 2,
      );
    }

    for (let coordinate = 1; coordinate <= pattern.height; coordinate += 1) {
      const offset = (coordinate - 1) * cellSize + cellSize / 2;

      context.fillText(String(coordinate), boardX + coordinateSize / 2, patternY + offset);
      context.fillText(
        String(coordinate),
        patternX + gridWidth + coordinateSize / 2,
        patternY + offset,
      );
    }
  }

  for (let row = 0; row < pattern.height; row += 1) {
    for (let column = 0; column < pattern.width; column += 1) {
      const cellIndex = row * pattern.width + column;
      const colorId = pattern.cells[cellIndex];
      const color = colorId ? colorMap.get(colorId) : null;
      const x = patternX + column * cellSize;
      const y = patternY + row * cellSize;

      context.fillStyle = color?.hex ?? exportPaperColor;
      context.fillRect(x, y, cellSize, cellSize);

      if (color && showColorCodes) {
        context.fillStyle = getReadableTextColor(color.hex);
        context.font = `700 ${Math.max(8, Math.floor(cellSize * 0.34))}px Arial, sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(color.code, x + cellSize / 2, y + cellSize / 2);
      }
    }
  }

  if (showGridLines) {
    context.strokeStyle = exportBorderColor;
    context.lineWidth = 1;

    for (let line = 0; line <= pattern.width; line += 1) {
      const offset = patternX + line * cellSize + 0.5;

      context.beginPath();
      context.moveTo(offset, patternY);
      context.lineTo(offset, patternY + gridHeight);
      context.stroke();
    }

    for (let line = 0; line <= pattern.height; line += 1) {
      const offset = patternY + line * cellSize + 0.5;

      context.beginPath();
      context.moveTo(patternX, offset);
      context.lineTo(patternX + gridWidth, offset);
      context.stroke();
    }
  }

  context.strokeStyle = exportBorderColor;
  context.lineWidth = 2;
  context.strokeRect(boardX + 1, boardY + 1, boardWidth - 2, boardHeight - 2);

  const legendX = boardX;
  const legendY = boardY + boardHeight + 32;
  const legendWidth = boardWidth;
  const legendColumnGap = 24;
  const legendColumnWidth =
    (legendWidth - legendColumnGap * (legendColumns - 1)) / legendColumns;

  context.fillStyle = exportTextColor;
  context.font = "700 20px Arial, sans-serif";
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillText("Bead color list", legendX, legendY + 20);

  context.fillStyle = exportMutedTextColor;
  context.font = "14px Arial, sans-serif";
  context.textAlign = "right";
  context.fillText(`${totalBeads} total beads`, legendX + legendWidth, legendY + 20);

  if (colorStats.length === 0) {
    context.fillStyle = exportMutedTextColor;
    context.font = "15px Arial, sans-serif";
    context.textAlign = "left";
    context.fillText("No beads placed yet.", legendX, legendY + legendHeaderHeight + 24);

    return canvas;
  }

  colorStats.forEach((stat, index) => {
    const columnIndex = index % legendColumns;
    const rowIndex = Math.floor(index / legendColumns);
    const x = legendX + columnIndex * (legendColumnWidth + legendColumnGap);
    const y = legendY + legendHeaderHeight + rowIndex * legendRowHeight;
    const swatchSize = 26;

    context.fillStyle = exportPaperColor;
    context.fillRect(x, y, legendColumnWidth, legendRowHeight - 8);
    context.strokeStyle = exportBorderColor;
    context.lineWidth = 1;
    context.strokeRect(x + 0.5, y + 0.5, legendColumnWidth - 1, legendRowHeight - 9);

    context.fillStyle = stat.color.hex;
    context.fillRect(x + 10, y + 8, swatchSize, swatchSize);
    context.strokeStyle = "rgba(15, 17, 16, 0.18)";
    context.strokeRect(x + 10.5, y + 8.5, swatchSize - 1, swatchSize - 1);

    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.fillStyle = exportTextColor;
    context.font = "700 14px Arial, sans-serif";
    drawTextWithinWidth(
      context,
      `${stat.color.code} ${stat.color.name}`,
      x + 46,
      y + 20,
      legendColumnWidth - 112,
    );

    context.fillStyle = exportMutedTextColor;
    context.font = "12px Arial, sans-serif";
    context.fillText(stat.color.hex, x + 46, y + 36);

    context.textAlign = "right";
    context.fillStyle = exportTextColor;
    context.font = "700 14px Arial, sans-serif";
    context.fillText(String(stat.count), x + legendColumnWidth - 10, y + 26);
  });

  return canvas;
}

function createPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Your browser could not create the PNG export."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(blobUrl);
}

export function PatternEditorShell() {
  const palette = getDefaultPalette();
  const [pattern, setPattern] = useState(() =>
    createBlankPattern({
      width: 24,
      height: 24,
      paletteId: palette.id,
    }),
  );
  const [activeTool, setActiveTool] = useState<EditorTool>("Brush");
  const [activeColorId, setActiveColorId] = useState(
    palette.colors[0]?.id ?? "",
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [showGridLines, setShowGridLines] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showColorCodes, setShowColorCodes] = useState(true);
  const activeColor =
    palette.colors.find((color) => color.id === activeColorId) ??
    palette.colors[0];
  const colorMap = new Map(palette.colors.map((color) => [color.id, color]));
  const canvasSize = Math.max(pattern.width, pattern.height);
  const filledCellCount = getPatternFilledCellCount(pattern);
  const colorCounts = getPatternColorCounts(pattern);
  const colorStats = getPatternColorStats(pattern, palette);
  const countedBeadCount = colorStats.reduce(
    (total, stat) => total + stat.count,
    0,
  );
  const selectedColorCount = activeColor
    ? colorCounts.get(activeColor.id) ?? 0
    : 0;
  const columnCoordinates = Array.from(
    { length: pattern.width },
    (_, index) => index + 1,
  );
  const rowCoordinates = Array.from(
    { length: pattern.height },
    (_, index) => index + 1,
  );
  const coordinateGutter = showCoordinates ? 28 : 0;
  const cellCodeFontSize = getCellCodeFontSize(canvasSize);
  const coordinateFontSize = getCoordinateFontSize(canvasSize);
  const boardMinWidth = getBoardMinWidth(canvasSize, showColorCodes);

  function handleCanvasSizeChange(size: number) {
    setPattern(
      createBlankPattern({
        width: size,
        height: size,
        paletteId: palette.id,
        title: pattern.title,
      }),
    );
  }

  function paintCell(index: number) {
    if (!activeColor) {
      return;
    }

    setPattern((currentPattern) =>
      updatePatternCellColor(currentPattern, index, activeColor.id),
    );
  }

  function eraseCell(index: number) {
    setPattern((currentPattern) =>
      updatePatternCellColor(currentPattern, index, null),
    );
  }

  function fillCell(index: number) {
    setPattern((currentPattern) =>
      fillPatternConnectedArea(currentPattern, index, activeColor?.id ?? null),
    );
  }

  function applyTool(index: number) {
    if (activeTool === "Brush") {
      paintCell(index);
      return;
    }

    if (activeTool === "Eraser") {
      eraseCell(index);
      return;
    }

    fillCell(index);
  }

  function handleCellPointerDown(index: number) {
    setIsDrawing(activeTool !== "Fill");
    applyTool(index);
  }

  function handleCellPointerEnter(index: number) {
    if (isDrawing && activeTool !== "Fill") {
      applyTool(index);
    }
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  async function handleDownloadPng() {
    setIsExporting(true);
    setExportError("");

    try {
      const canvas = renderEditorPatternToCanvas({
        colorStats,
        palette,
        pattern,
        showColorCodes,
        showCoordinates,
        showGridLines,
      });
      const pngBlob = await createPngBlob(canvas);

      downloadBlob(pngBlob, getEditorPatternExportFileName(pattern));
    } catch (pngExportError) {
      setExportError(
        pngExportError instanceof Error
          ? pngExportError.message
          : "This pattern could not be exported as PNG.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  const gridBackground = showGridLines ? "var(--border)" : "transparent";
  const gridGap = showGridLines ? "1px" : "0px";

  const gridCells = pattern.cells.map((colorId, index) => {
    const color = colorId ? colorMap.get(colorId) : null;
    const row = Math.floor(index / pattern.width) + 1;
    const column = (index % pattern.width) + 1;

    return (
      <button
        aria-label={
          color
            ? `Row ${row}, column ${column}, ${color.code} ${color.name}`
            : `Empty cell, row ${row}, column ${column}`
        }
        aria-colindex={column}
        aria-rowindex={row}
        className="flex aspect-square touch-none items-center justify-center overflow-hidden bg-white"
        key={index}
        onPointerDown={() => handleCellPointerDown(index)}
        onPointerEnter={() => handleCellPointerEnter(index)}
        onPointerUp={stopDrawing}
        role="gridcell"
        style={{ backgroundColor: color?.hex ?? "#ffffff" }}
        type="button"
      >
        {color && showColorCodes ? (
          <span
            aria-hidden="true"
            className="select-none font-semibold tabular-nums"
            style={{
              color: getReadableTextColor(color.hex),
              fontSize: cellCodeFontSize,
              letterSpacing: 0,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {color.code}
          </span>
        ) : null}
      </button>
    );
  });

  const toolHints: Record<EditorTool, string> = {
    Brush: "Click or drag across cells to paint with the selected color.",
    Eraser: "Click or drag across cells to clear beads from the canvas.",
    Fill: "Click a cell to fill its connected color area with the selected bead color.",
  };

  const currentToolHint = toolHints[activeTool];

  const activeColorLabel = activeColor
    ? `${activeColor.code} ${activeColor.name}`
    : "None";

  const activeColorHex = activeColor?.hex ?? "#ffffff";

  const filledPercent = Math.round(
    (filledCellCount / Math.max(1, pattern.cells.length)) * 100,
  );

  const patternCanvas = (
    <div
      aria-colcount={pattern.width}
      aria-label={`${pattern.width} by ${pattern.height} editable bead pattern canvas`}
      aria-rowcount={pattern.height}
      className="grid overflow-hidden rounded-md border border-[var(--border)] shadow-sm"
      onPointerCancel={stopDrawing}
      onPointerLeave={stopDrawing}
      onPointerUp={stopDrawing}
      role="grid"
      style={{
        backgroundColor: gridBackground,
        gap: gridGap,
        aspectRatio: `${pattern.width} / ${pattern.height}`,
        gridTemplateColumns: `repeat(${pattern.width}, minmax(0, 1fr))`,
      }}
    >
      {gridCells}
    </div>
  );

  const coordinateLabelClass =
    "flex min-w-0 items-center justify-center overflow-hidden bg-[var(--surface-soft)] font-semibold tabular-nums text-[var(--muted)]";

  function renderCoordinateLabels(coordinates: number[]) {
    return coordinates.map((coordinate) => (
      <span
        className={coordinateLabelClass}
        key={coordinate}
        style={{
          fontSize: coordinateFontSize,
          letterSpacing: 0,
          lineHeight: 1,
        }}
      >
        {coordinate}
      </span>
    ));
  }

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
                  pattern.width === size && pattern.height === size
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
          <div className="mt-3 grid gap-2">
            <ViewToggleButton
              isActive={showGridLines}
              label="Grid lines"
              onClick={() => setShowGridLines((current) => !current)}
            />
            <ViewToggleButton
              isActive={showCoordinates}
              label="Coordinates"
              onClick={() => setShowCoordinates((current) => !current)}
            />
            <ViewToggleButton
              isActive={showColorCodes}
              label="Color codes"
              onClick={() => setShowColorCodes((current) => !current)}
            />
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Export
          </p>
          <button
            className="mt-3 w-full rounded-md border border-[var(--accent)] bg-[var(--accent)] px-3 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isExporting}
            onClick={handleDownloadPng}
            type="button"
          >
            {isExporting ? "Exporting PNG..." : "Download PNG"}
          </button>
          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
            PNG uses the current grid, coordinate, and color code settings, plus
            the bead color list.
          </p>
          {exportError ? (
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
              {exportError}
            </p>
          ) : null}
        </section>
      </aside>

      <section className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <h1 className="text-xl font-semibold">Bead Pattern Editor</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {pattern.width} x {pattern.height} grid, {palette.brand}{" "}
              {palette.name}
            </p>
          </div>
          <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            {activeTool} / {activeColor?.code}
          </span>
        </div>

        <div className="mt-5 overflow-auto pb-2">
          <div
            className="mx-auto max-w-[760px]"
            style={{ minWidth: boardMinWidth }}
          >
            {showCoordinates ? (
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `${coordinateGutter}px minmax(0, 1fr) ${coordinateGutter}px`,
                  gridTemplateRows: `${coordinateGutter}px minmax(0, 1fr) ${coordinateGutter}px`,
                }}
              >
                <span aria-hidden="true" />
                <div
                  aria-hidden="true"
                  className="grid border-x border-t border-[var(--border)]"
                  style={{
                    gridTemplateColumns: `repeat(${pattern.width}, minmax(0, 1fr))`,
                  }}
                >
                  {renderCoordinateLabels(columnCoordinates)}
                </div>
                <span aria-hidden="true" />
                <div
                  aria-hidden="true"
                  className="grid border-y border-l border-[var(--border)]"
                  style={{
                    gridTemplateRows: `repeat(${pattern.height}, minmax(0, 1fr))`,
                  }}
                >
                  {renderCoordinateLabels(rowCoordinates)}
                </div>
                {patternCanvas}
                <div
                  aria-hidden="true"
                  className="grid border-y border-r border-[var(--border)]"
                  style={{
                    gridTemplateRows: `repeat(${pattern.height}, minmax(0, 1fr))`,
                  }}
                >
                  {renderCoordinateLabels(rowCoordinates)}
                </div>
                <span aria-hidden="true" />
                <div
                  aria-hidden="true"
                  className="grid border-x border-b border-[var(--border)]"
                  style={{
                    gridTemplateColumns: `repeat(${pattern.width}, minmax(0, 1fr))`,
                  }}
                >
                  {renderCoordinateLabels(columnCoordinates)}
                </div>
                <span aria-hidden="true" />
              </div>
            ) : (
              patternCanvas
            )}
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
            {palette.colors.map((color) => {
              const colorUseCount = colorCounts.get(color.id) ?? 0;
              const isSelectedColor = activeColor?.id === color.id;

              return (
                <button
                  aria-label={`${color.code} ${color.name}, ${color.hex}, ${colorUseCount} beads used`}
                  aria-pressed={isSelectedColor}
                  className={`flex items-center gap-3 rounded-md border px-3 py-2 text-left transition ${
                    isSelectedColor
                      ? "border-[var(--accent)] bg-[var(--surface-soft)]"
                      : "border-[var(--border)] bg-white hover:border-[var(--accent)]"
                  }`}
                  key={color.id}
                  onClick={() => setActiveColorId(color.id)}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="h-7 w-7 shrink-0 rounded-md border border-black/10"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[var(--foreground)]">
                      {color.name}
                    </span>
                    <span className="block text-xs text-[var(--muted)]">
                      {color.code} - {color.hex}
                    </span>
                  </span>
                  <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1 text-xs font-semibold tabular-nums text-[var(--muted)]">
                    {colorUseCount}
                  </span>
                </button>
              );
            })}
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
                {pattern.width} x {pattern.height}
              </span>
            </div>
            <div className="flex justify-between gap-3 rounded-md bg-[var(--surface-soft)] px-3 py-2">
              <span className="text-[var(--muted)]">Total beads</span>
              <span className="font-semibold">
                {countedBeadCount} / {pattern.cells.length}
              </span>
            </div>
            <div className="flex justify-between gap-3 rounded-md bg-[var(--surface-soft)] px-3 py-2">
              <span className="text-[var(--muted)]">Used colors</span>
              <span className="font-semibold">
                {colorStats.length} / {palette.colors.length}
              </span>
            </div>
            <div className="flex justify-between gap-3 rounded-md bg-[var(--surface-soft)] px-3 py-2">
              <span className="text-[var(--muted)]">Filled</span>
              <span className="font-semibold">{filledPercent}%</span>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-[var(--border)] bg-white px-3 py-3 text-sm">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-8 w-8 shrink-0 rounded-md border border-black/10"
                style={{ backgroundColor: activeColorHex }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-[var(--muted)]">
                  Selected color
                </span>
                <span className="block truncate font-semibold">
                  {activeColorLabel}
                </span>
                <span className="block text-xs text-[var(--muted)]">
                  {activeColor?.hex ?? "#ffffff"}
                </span>
              </span>
              <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1 text-xs font-semibold tabular-nums text-[var(--accent)]">
                {selectedColorCount}
              </span>
            </div>
          </div>

          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Color count
              </p>
              <span className="text-xs font-semibold tabular-nums text-[var(--muted)]">
                {countedBeadCount} beads
              </span>
            </div>

            {colorStats.length > 0 ? (
              <div className="mt-3 grid max-h-[320px] gap-2 overflow-auto pr-1">
                {colorStats.map((stat) => {
                  const percentage = Math.round(
                    (stat.count / Math.max(1, countedBeadCount)) * 100,
                  );

                  return (
                    <div
                      className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
                      key={stat.color.id}
                    >
                      <span
                        aria-hidden="true"
                        className="h-7 w-7 rounded-md border border-black/10"
                        style={{ backgroundColor: stat.color.hex }}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-[var(--foreground)]">
                          {stat.color.name}
                        </span>
                        <span className="block text-xs text-[var(--muted)]">
                          {stat.color.code} - {stat.color.hex}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block font-semibold tabular-nums text-[var(--foreground)]">
                          {stat.count}
                        </span>
                        <span className="block text-xs tabular-nums text-[var(--muted)]">
                          {percentage}%
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 rounded-md border border-dashed border-[var(--border)] bg-white px-3 py-4 text-sm text-[var(--muted)]">
                No beads placed yet.
              </p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
