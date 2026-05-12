"use client";

import { beadPalettes, defaultBeadPaletteId } from "@/data/bead-palettes";
import {
  createPngBlob,
  downloadBlob,
  getEditorPatternExportFileName,
  getReadableTextColor,
  renderEditorPatternToCanvas,
} from "@/lib/pattern/pattern-export";
import { consumeEditorDraftPattern } from "@/lib/pattern/pattern-draft-storage";
import {
  createBlankPattern,
  fillPatternConnectedArea,
  getPatternColorCounts,
  getPatternColorStats,
  getPatternFilledCellCount,
  updatePatternCellColor,
} from "@/lib/pattern/pattern-model";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";

const canvasSizes = [16, 24, 32, 48, 64];
const minViewportScale = 0.35;
const maxViewportScale = 3;
const editorTools = [
  {
    id: "Hand",
    label: "Hand",
    shortcut: "H",
    hint: "Pan the canvas stage.",
  },
  {
    id: "Brush",
    label: "Brush",
    shortcut: "B",
    hint: "Paint cells with the selected bead color.",
  },
  {
    id: "Eraser",
    label: "Eraser",
    shortcut: "E",
    hint: "Clear beads from cells without changing the selected color.",
  },
  {
    id: "Fill",
    label: "Fill",
    shortcut: "F",
    hint: "Flood-fill a connected area with the selected bead color.",
  },
] as const;

type EditorTool = (typeof editorTools)[number]["id"];
type EditorViewport = {
  offsetX: number;
  offsetY: number;
  scale: number;
};
type PanDragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startOffsetX: number;
  startOffsetY: number;
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
function getCellCodeFontSize(size: number) {
  if (size >= 50) {
    return 8;
  }

  if (size >= 32) {
    return 8;
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
    return size >= 50 ? 620 : size >= 32 ? 520 : 420;
  }

  const minimumCellWidth =
    size >= 50 ? 34 : size >= 32 ? 30 : size >= 24 ? 28 : 32;

  return Math.max(560, size * minimumCellWidth + 64);
}

function clampViewportScale(scale: number) {
  return Math.min(maxViewportScale, Math.max(minViewportScale, scale));
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

export function PatternEditorShell() {
  const initialPalette = getDefaultPalette();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const patternCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoverCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoveredCellIndexRef = useRef<number | null>(null);
  const panDragRef = useRef<PanDragState | null>(null);
  const panFrameRef = useRef<number | null>(null);
  const pendingViewportRef = useRef<EditorViewport | null>(null);
  const isDrawingRef = useRef(false);
  const drawingPointerIdRef = useRef<number | null>(null);
  const [pattern, setPattern] = useState(() =>
    createBlankPattern({
      width: 24,
      height: 24,
      paletteId: initialPalette.id,
    }),
  );
  const [activeTool, setActiveTool] = useState<EditorTool>("Brush");
  const [activeColorId, setActiveColorId] = useState(
    initialPalette.colors[0]?.id ?? "",
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [draftStatus, setDraftStatus] = useState<
    "idle" | "loaded" | "missing"
  >("idle");
  const [showGridLines, setShowGridLines] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showColorCodes, setShowColorCodes] = useState(true);
  const [colorSearch, setColorSearch] = useState("");
  const [selectedColorFamily, setSelectedColorFamily] = useState("All");
  const [showUsedColorsOnly, setShowUsedColorsOnly] = useState(false);
  const [hoveredCellIndex, setHoveredCellIndex] = useState<number | null>(null);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [viewport, setViewport] = useState<EditorViewport>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });
  const [panDrag, setPanDrag] = useState<PanDragState | null>(null);
  const palette =
    beadPalettes.find((beadPalette) => beadPalette.id === pattern.paletteId) ??
    initialPalette;
  const activeColor =
    palette.colors.find((color) => color.id === activeColorId) ??
    palette.colors[0];
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
  const coordinateGutter = showCoordinates ? 28 : 0;
  const cellCodeFontSize = getCellCodeFontSize(canvasSize);
  const coordinateFontSize = getCoordinateFontSize(canvasSize);
  const shouldRenderCellCodes = showColorCodes;
  const boardMinWidth = getBoardMinWidth(canvasSize, shouldRenderCellCodes);
  const canvasBoardWidth = boardMinWidth;
  const canvasCellSize =
    (canvasBoardWidth - coordinateGutter * 2) / pattern.width;
  const canvasBoardHeight =
    pattern.height * canvasCellSize + coordinateGutter * 2;
  const colorFamilies = [
    "All",
    ...Array.from(
      new Set(palette.colors.map((color) => color.family ?? "Other")),
    ),
  ];
  const normalizedColorSearch = colorSearch.trim().toLowerCase();
  const visiblePaletteColors = palette.colors.filter((color) => {
    const matchesFamily =
      selectedColorFamily === "All" ||
      (color.family ?? "Other") === selectedColorFamily;
    const matchesUsed =
      !showUsedColorsOnly || (colorCounts.get(color.id) ?? 0) > 0;
    const matchesSearch =
      !normalizedColorSearch ||
      `${color.code} ${color.name} ${color.hex} ${color.family ?? ""}`
        .toLowerCase()
        .includes(normalizedColorSearch);

    return matchesFamily && matchesUsed && matchesSearch;
  });
  const hoveredCellColorId =
    hoveredCellIndex === null ? null : pattern.cells[hoveredCellIndex];
  const hoveredCellColor = hoveredCellColorId
    ? palette.colors.find((color) => color.id === hoveredCellColorId)
    : null;
  const hoveredCellRow =
    hoveredCellIndex === null
      ? null
      : Math.floor(hoveredCellIndex / pattern.width) + 1;
  const hoveredCellColumn =
    hoveredCellIndex === null ? null : (hoveredCellIndex % pattern.width) + 1;

  function cancelPendingPanFrame() {
    if (panFrameRef.current !== null) {
      window.cancelAnimationFrame(panFrameRef.current);
      panFrameRef.current = null;
    }

    pendingViewportRef.current = null;
  }

  function scheduleViewportUpdate(nextViewport: EditorViewport) {
    pendingViewportRef.current = nextViewport;

    if (panFrameRef.current !== null) {
      return;
    }

    panFrameRef.current = window.requestAnimationFrame(() => {
      panFrameRef.current = null;

      if (!pendingViewportRef.current) {
        return;
      }

      const pendingViewport = pendingViewportRef.current;
      pendingViewportRef.current = null;
      setViewport(pendingViewport);
    });
  }

  function drawHoverOverlay(cellIndex: number | null) {
    const canvas = hoverCanvasRef.current;

    if (!canvas) {
      return;
    }

    const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
    const canvasWidth = Math.round(canvasBoardWidth * pixelRatio);
    const canvasHeight = Math.round(canvasBoardHeight * pixelRatio);
    const context = canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: false,
    });

    if (!context) {
      return;
    }

    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.width = `${canvasBoardWidth}px`;
      canvas.style.height = `${canvasBoardHeight}px`;
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, canvasBoardWidth, canvasBoardHeight);

    if (cellIndex === null) {
      return;
    }

    const hoveredColumn = cellIndex % pattern.width;
    const hoveredRow = Math.floor(cellIndex / pattern.width);

    context.strokeStyle = "#24786a";
    context.lineWidth = 2;
    context.strokeRect(
      coordinateGutter + hoveredColumn * canvasCellSize + 1,
      coordinateGutter + hoveredRow * canvasCellSize + 1,
      canvasCellSize - 2,
      canvasCellSize - 2,
    );
  }

  function setHoveredCanvasCellIndex(nextCellIndex: number | null) {
    if (hoveredCellIndexRef.current === nextCellIndex) {
      return;
    }

    hoveredCellIndexRef.current = nextCellIndex;
    drawHoverOverlay(nextCellIndex);
    setHoveredCellIndex(nextCellIndex);
  }

  useEffect(() => () => cancelPendingPanFrame(), []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    if (!searchParams.has("draft")) {
      return;
    }

    const draftPattern = consumeEditorDraftPattern();

    if (!draftPattern) {
      window.history.replaceState(null, "", window.location.pathname);
      queueMicrotask(() => setDraftStatus("missing"));
      return;
    }

    const draftPalette =
      beadPalettes.find(
        (beadPalette) => beadPalette.id === draftPattern.paletteId,
      ) ?? initialPalette;
    const firstDraftColorId = draftPattern.cells.find(
      (cell): cell is string =>
        typeof cell === "string" &&
        draftPalette.colors.some((color) => color.id === cell),
    );

    window.history.replaceState(null, "", window.location.pathname);
    queueMicrotask(() => {
      setPattern(draftPattern);
      setActiveColorId(firstDraftColorId ?? draftPalette.colors[0]?.id ?? "");
      setDraftStatus("loaded");
    });
  }, [initialPalette]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const targetTagName = target?.tagName.toLowerCase();

      if (
        target?.isContentEditable ||
        targetTagName === "input" ||
        targetTagName === "select" ||
        targetTagName === "textarea"
      ) {
        return;
      }

      const matchingTool = editorTools.find(
        (tool) => tool.shortcut.toLowerCase() === event.key.toLowerCase(),
      );

      if (matchingTool) {
        event.preventDefault();
        setActiveTool(matchingTool.id);
        return;
      }

      if (event.key === "Escape") {
        isDrawingRef.current = false;
        drawingPointerIdRef.current = null;
        panDragRef.current = null;
        cancelPendingPanFrame();
        setPanDrag(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const stageElement = stageRef.current;

    if (!stageElement) {
      return;
    }

    const wheelTarget: HTMLDivElement = stageElement;

    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey) {
        return;
      }

      event.preventDefault();
      panDragRef.current = null;
      cancelPendingPanFrame();
      setPanDrag(null);

      const stageRect = wheelTarget.getBoundingClientRect();
      const pointerX = event.clientX - stageRect.left - stageRect.width / 2;
      const pointerY = event.clientY - stageRect.top - stageRect.height / 2;

      setViewport((currentViewport) => {
        const nextScale = clampViewportScale(
          currentViewport.scale * (event.deltaY > 0 ? 0.9 : 1.1),
        );
        const scaleRatio = nextScale / currentViewport.scale;

        return {
          offsetX:
            pointerX - (pointerX - currentViewport.offsetX) * scaleRatio,
          offsetY:
            pointerY - (pointerY - currentViewport.offsetY) * scaleRatio,
          scale: nextScale,
        };
      });
    }

    wheelTarget.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      wheelTarget.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    const canvas = patternCanvasRef.current;

    if (!canvas) {
      return;
    }

    const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
    const context = canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: false,
    });

    if (!context) {
      return;
    }

    const canvasColorMap = new Map(
      palette.colors.map((color) => [color.id, color]),
    );

    canvas.width = Math.round(canvasBoardWidth * pixelRatio);
    canvas.height = Math.round(canvasBoardHeight * pixelRatio);
    canvas.style.width = `${canvasBoardWidth}px`;
    canvas.style.height = `${canvasBoardHeight}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, canvasBoardWidth, canvasBoardHeight);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvasBoardWidth, canvasBoardHeight);

    if (showCoordinates) {
      const patternWidth = pattern.width * canvasCellSize;
      const patternHeight = pattern.height * canvasCellSize;

      context.fillStyle = "#eef5f1";
      context.fillRect(coordinateGutter, 0, patternWidth, coordinateGutter);
      context.fillRect(
        coordinateGutter,
        coordinateGutter + patternHeight,
        patternWidth,
        coordinateGutter,
      );
      context.fillRect(0, coordinateGutter, coordinateGutter, patternHeight);
      context.fillRect(
        coordinateGutter + patternWidth,
        coordinateGutter,
        coordinateGutter,
        patternHeight,
      );

      context.fillStyle = "#5b6b62";
      context.font = `700 ${coordinateFontSize}px Arial, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";

      for (let column = 0; column < pattern.width; column += 1) {
        const labelX = coordinateGutter + column * canvasCellSize + canvasCellSize / 2;
        const label = String(column + 1);

        context.fillText(label, labelX, coordinateGutter / 2);
        context.fillText(
          label,
          labelX,
          coordinateGutter + patternHeight + coordinateGutter / 2,
        );
      }

      for (let row = 0; row < pattern.height; row += 1) {
        const labelY = coordinateGutter + row * canvasCellSize + canvasCellSize / 2;
        const label = String(row + 1);

        context.fillText(label, coordinateGutter / 2, labelY);
        context.fillText(
          label,
          coordinateGutter + patternWidth + coordinateGutter / 2,
          labelY,
        );
      }
    }

    for (let row = 0; row < pattern.height; row += 1) {
      for (let column = 0; column < pattern.width; column += 1) {
        const cellIndex = row * pattern.width + column;
        const colorId = pattern.cells[cellIndex];
        const color = colorId ? canvasColorMap.get(colorId) : null;
        const cellX = coordinateGutter + column * canvasCellSize;
        const cellY = coordinateGutter + row * canvasCellSize;

        context.fillStyle = color?.hex ?? "#ffffff";
        context.fillRect(cellX, cellY, canvasCellSize, canvasCellSize);

        if (color && showColorCodes) {
          context.fillStyle = getReadableTextColor(color.hex);
          context.font = `700 ${cellCodeFontSize}px Arial, sans-serif`;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(
            color.code,
            cellX + canvasCellSize / 2,
            cellY + canvasCellSize / 2,
          );
        }
      }
    }

    if (showGridLines) {
      context.strokeStyle = "#d9e1dc";
      context.lineWidth = 1;

      for (let column = 0; column <= pattern.width; column += 1) {
        const lineX = coordinateGutter + column * canvasCellSize + 0.5;

        context.beginPath();
        context.moveTo(lineX, coordinateGutter);
        context.lineTo(lineX, coordinateGutter + pattern.height * canvasCellSize);
        context.stroke();
      }

      for (let row = 0; row <= pattern.height; row += 1) {
        const lineY = coordinateGutter + row * canvasCellSize + 0.5;

        context.beginPath();
        context.moveTo(coordinateGutter, lineY);
        context.lineTo(coordinateGutter + pattern.width * canvasCellSize, lineY);
        context.stroke();
      }
    }

  }, [
    canvasBoardHeight,
    canvasBoardWidth,
    canvasCellSize,
    cellCodeFontSize,
    coordinateFontSize,
    coordinateGutter,
    palette,
    pattern,
    showColorCodes,
    showCoordinates,
    showGridLines,
  ]);

  function handleCanvasSizeChange(size: number) {
    setHoveredCanvasCellIndex(null);
    setPattern(
      createBlankPattern({
        width: size,
        height: size,
        paletteId: palette.id,
        title: pattern.title,
      }),
    );
    resetViewport();
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

    if (activeTool === "Fill") {
      fillCell(index);
    }
  }

  function handleColorSelect(colorId: string) {
    setActiveColorId(colorId);
    setActiveTool("Brush");
  }

  function getCanvasCellIndexFromPointer(
    event: MouseEvent<HTMLCanvasElement> | PointerEvent<HTMLCanvasElement>,
  ) {
    const canvasRect = event.currentTarget.getBoundingClientRect();

    if (canvasRect.width <= 0 || canvasRect.height <= 0) {
      return -1;
    }

    const pointerX =
      (event.clientX - canvasRect.left) * (canvasBoardWidth / canvasRect.width);
    const pointerY =
      (event.clientY - canvasRect.top) *
      (canvasBoardHeight / canvasRect.height);
    const column = Math.floor((pointerX - coordinateGutter) / canvasCellSize);
    const row = Math.floor((pointerY - coordinateGutter) / canvasCellSize);

    if (
      column < 0 ||
      column >= pattern.width ||
      row < 0 ||
      row >= pattern.height
    ) {
      return -1;
    }

    return row * pattern.width + column;
  }

  function updateHoveredCanvasCell(
    event: MouseEvent<HTMLCanvasElement> | PointerEvent<HTMLCanvasElement>,
  ) {
    const cellIndex = getCanvasCellIndexFromPointer(event);
    const nextCellIndex = cellIndex >= 0 ? cellIndex : null;

    setHoveredCanvasCellIndex(nextCellIndex);
    return cellIndex;
  }

  function handleCanvasPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0 || activeTool === "Hand") {
      return;
    }

    const cellIndex = updateHoveredCanvasCell(event);

    if (cellIndex < 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingPointerIdRef.current = event.pointerId;
    isDrawingRef.current = activeTool !== "Fill";
    applyTool(cellIndex);
  }

  function handleCanvasPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const cellIndex = updateHoveredCanvasCell(event);

    if (
      cellIndex >= 0 &&
      isDrawingRef.current &&
      drawingPointerIdRef.current === event.pointerId &&
      (activeTool === "Brush" || activeTool === "Eraser")
    ) {
      applyTool(cellIndex);
    }
  }

  function handleCanvasPointerEnd(event: PointerEvent<HTMLCanvasElement>) {
    if (
      drawingPointerIdRef.current === event.pointerId &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    isDrawingRef.current = false;
    drawingPointerIdRef.current = null;
  }

  function handleCanvasContextMenu(event: MouseEvent<HTMLCanvasElement>) {
    if (activeTool === "Hand") {
      return;
    }

    event.preventDefault();
    const cellIndex = updateHoveredCanvasCell(event);

    if (cellIndex < 0) {
      return;
    }

    eraseCell(cellIndex);
    setActiveTool("Eraser");
  }

  function handleStagePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (activeTool !== "Hand" || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const nextPanDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: viewport.offsetX,
      startOffsetY: viewport.offsetY,
    };

    panDragRef.current = nextPanDrag;
    setPanDrag(nextPanDrag);
  }

  function handleStagePointerMove(event: PointerEvent<HTMLDivElement>) {
    const currentPanDrag = panDragRef.current;

    if (!currentPanDrag || currentPanDrag.pointerId !== event.pointerId) {
      return;
    }

    scheduleViewportUpdate({
      offsetX:
        currentPanDrag.startOffsetX + event.clientX - currentPanDrag.startX,
      offsetY:
        currentPanDrag.startOffsetY + event.clientY - currentPanDrag.startY,
      scale: viewport.scale,
    });
  }

  function stopPanning(event?: PointerEvent<HTMLDivElement>) {
    const currentPanDrag = panDragRef.current;

    if (
      event &&
      currentPanDrag?.pointerId === event.pointerId &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    panDragRef.current = null;
    setPanDrag(null);
  }

  function resetViewport() {
    panDragRef.current = null;
    cancelPendingPanFrame();
    setPanDrag(null);
    setViewport({
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    });
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

  const viewportScaleLabel = `${Math.round(viewport.scale * 100)}%`;
  const canvasCursor =
    activeTool === "Hand"
      ? panDrag
        ? "grabbing"
        : "grab"
      : activeTool === "Fill"
        ? "copy"
        : activeTool === "Eraser"
          ? "cell"
          : "crosshair";

  const activeColorLabel = activeColor
    ? `${activeColor.code} ${activeColor.name}`
    : "None";

  const activeColorHex = activeColor?.hex ?? "#ffffff";

  const filledPercent = Math.round(
    (filledCellCount / Math.max(1, pattern.cells.length)) * 100,
  );
  const hoveredCellLabel =
    hoveredCellRow && hoveredCellColumn
      ? `R${hoveredCellRow} C${hoveredCellColumn}: ${
          hoveredCellColor
            ? `${hoveredCellColor.code} ${hoveredCellColor.name}`
            : "Empty"
        }`
      : "No cell";
  const colorCodeViewLabel = showColorCodes ? "Codes on cells" : "Codes off";

  const patternCanvas = (
    <div
      aria-label={`${pattern.width} by ${pattern.height} editable bead pattern canvas`}
      className="relative rounded-md border border-[var(--border)] shadow-sm"
      role="img"
      style={{
        cursor: canvasCursor,
        height: canvasBoardHeight,
        width: canvasBoardWidth,
      }}
    >
      <canvas
        aria-hidden="true"
        className="absolute inset-0 block rounded-md"
        ref={patternCanvasRef}
        style={{
          height: canvasBoardHeight,
          pointerEvents: "none",
          width: canvasBoardWidth,
        }}
      />
      <canvas
        aria-hidden="true"
        className="absolute inset-0 block rounded-md"
        onContextMenu={handleCanvasContextMenu}
        onPointerCancel={handleCanvasPointerEnd}
        onPointerDown={handleCanvasPointerDown}
        onPointerLeave={() => {
          if (!isDrawingRef.current) {
            setHoveredCanvasCellIndex(null);
          }
        }}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerEnd}
        ref={hoverCanvasRef}
        style={{
          cursor: canvasCursor,
          height: canvasBoardHeight,
          width: canvasBoardWidth,
        }}
      />
    </div>
  );

  const floatingToolDock = (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-[var(--border)] bg-white p-1 shadow-lg">
        {editorTools.map((tool) => (
          <button
            aria-label={`${tool.label} tool, shortcut ${tool.shortcut}`}
            aria-pressed={activeTool === tool.id}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              activeTool === tool.id
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground)] hover:bg-[var(--surface-soft)] hover:text-[var(--accent)]"
            }`}
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            type="button"
          >
            {tool.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={`grid min-h-dvh flex-1 gap-0 xl:min-h-0 ${
        isLeftPanelCollapsed
          ? "xl:grid-cols-[64px_minmax(0,1fr)_280px]"
          : "xl:grid-cols-[220px_minmax(0,1fr)_280px]"
      }`}
    >
      <aside className="grid content-start gap-0 self-start border-r border-[var(--border)] bg-[var(--surface)] xl:h-full xl:min-h-0 xl:self-stretch xl:overflow-y-auto">
        <section className="border-b border-[var(--border)] bg-[var(--surface)] p-2">
          <div
            className={
              isLeftPanelCollapsed
                ? "grid gap-2"
                : "flex items-center justify-between gap-2"
            }
          >
            {isLeftPanelCollapsed ? (
              <Link
                aria-label="Go to Pinbead home"
                className="rounded-md border border-[var(--border)] bg-white px-2 py-2 text-center text-xs font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href="/"
                title="Pinbead home"
              >
                PB
              </Link>
            ) : (
              <Link
                className="min-w-0 truncate px-1 text-base font-semibold text-[var(--foreground)] transition hover:text-[var(--accent)]"
                href="/"
              >
                Pinbead
              </Link>
            )}
            <button
              aria-label={
                isLeftPanelCollapsed
                  ? "Expand left panel"
                  : "Collapse left panel"
              }
              className="rounded-md border border-[var(--border)] bg-white px-2 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              onClick={() => setIsLeftPanelCollapsed((current) => !current)}
              title={
                isLeftPanelCollapsed
                  ? "Expand left panel"
                  : "Collapse left panel"
              }
              type="button"
            >
              {isLeftPanelCollapsed ? ">>" : "<<"}
            </button>
          </div>
          {isLeftPanelCollapsed ? (
            <nav aria-label="Editor navigation" className="mt-2 grid gap-2">
              <Link
                className="rounded-md border border-[var(--border)] bg-white px-2 py-2 text-center text-xs font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href="/convert"
                title="Import image"
              >
                IMG
              </Link>
              <Link
                className="rounded-md border border-[var(--border)] bg-white px-2 py-2 text-center text-xs font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href="/patterns"
                title="Patterns"
              >
                PAT
              </Link>
            </nav>
          ) : (
            <nav aria-label="Editor navigation" className="mt-3 grid gap-2">
              <Link
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href="/convert"
              >
                Import image
              </Link>
              <Link
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href="/patterns"
              >
                Patterns
              </Link>
            </nav>
          )}
        </section>

        {isLeftPanelCollapsed ? (
          <div className="grid gap-0">
            <button
              className="border-b border-[var(--border)] bg-white px-2 py-3 text-xs font-semibold transition hover:text-[var(--accent)]"
              onClick={resetViewport}
              title="Center canvas"
              type="button"
            >
              0
            </button>
            <button
              className="bg-[var(--accent)] px-2 py-3 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isExporting}
              onClick={handleDownloadPng}
              title="Download PNG"
              type="button"
            >
              PNG
            </button>
          </div>
        ) : (
          <>
        <section className="border-b border-[var(--border)] bg-[var(--surface)] p-3">
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
          <button
            className="mt-3 w-full rounded-md border border-[var(--border)] bg-white px-3 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            onClick={resetViewport}
            type="button"
          >
            Center canvas
          </button>
        </section>

        <section className="border-b border-[var(--border)] bg-[var(--surface)] p-3">
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

        <section className="border-b border-[var(--border)] bg-[var(--surface)] p-3">
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
          </>
        )}
      </aside>

      <section className="relative min-h-[620px] min-w-0 overflow-hidden border-y border-[var(--border)] bg-[var(--surface-soft)] xl:h-full xl:min-h-0">
        <div
          className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_center,rgba(36,120,106,0.08)_0,rgba(36,120,106,0.08)_1px,transparent_1px)] [background-size:24px_24px]"
          ref={stageRef}
          onLostPointerCapture={() => {
            panDragRef.current = null;
            setPanDrag(null);
          }}
          onPointerCancel={stopPanning}
          onPointerDown={handleStagePointerDown}
          onPointerMove={handleStagePointerMove}
          onPointerUp={stopPanning}
          style={{ cursor: canvasCursor }}
        >
          <div
            className="absolute left-1/2 top-1/2 rounded-lg bg-white p-3 shadow-[0_18px_60px_rgba(15,17,16,0.16)] will-change-transform"
            style={{
              transform: `translate(calc(-50% + ${viewport.offsetX}px), calc(-50% + ${viewport.offsetY}px)) scale(${viewport.scale})`,
              transformOrigin: "center",
              width: canvasBoardWidth + 24,
            }}
          >
            {patternCanvas}
          </div>
        </div>

        <div className="pointer-events-none absolute left-4 right-4 top-4 z-20 flex flex-wrap items-start justify-between gap-3">
          <div className="rounded-lg border border-[var(--border)] bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
            <h1 className="text-lg font-semibold">Bead Pattern Editor</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {pattern.width} x {pattern.height} grid, {palette.brand}{" "}
              {palette.name}
            </p>
            {draftStatus === "loaded" ? (
              <p className="mt-2 text-xs font-semibold text-[var(--accent)]">
                Image draft loaded
              </p>
            ) : null}
            {draftStatus === "missing" ? (
              <p className="mt-2 text-xs font-semibold text-red-700">
                Temporary image draft not found
              </p>
            ) : null}
          </div>
          <span className="rounded-full border border-[var(--border)] bg-white/95 px-3 py-2 text-xs font-semibold text-[var(--accent)] shadow-sm backdrop-blur">
            {activeTool} / {activeColor?.code} / {viewportScaleLabel}
          </span>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 z-20 hidden max-w-[280px] rounded-lg border border-[var(--border)] bg-white/95 px-3 py-2 text-xs font-semibold text-[var(--muted)] shadow-sm backdrop-blur md:grid md:gap-1">
          <span className="text-[var(--foreground)]">
            {activeTool} / {activeColor?.code ?? "No color"}
          </span>
          <span>{hoveredCellLabel}</span>
          <span>{colorCodeViewLabel}</span>
          <span>Ctrl + wheel zoom: {viewportScaleLabel}</span>
        </div>

        {floatingToolDock}
      </section>

      <aside className="grid content-start gap-0 self-start border-l border-[var(--border)] bg-[var(--surface)] xl:h-full xl:min-h-0 xl:self-stretch xl:overflow-y-auto">
        <section className="border-b border-[var(--border)] bg-[var(--surface)] p-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Palette
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {palette.description}
          </p>
          <div className="mt-4 rounded-md border border-[var(--border)] bg-white px-3 py-3 text-sm">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-9 w-9 shrink-0 rounded-md border border-black/10"
                style={{ backgroundColor: activeColorHex }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-[var(--muted)]">
                  Selected color
                </span>
                <span className="block truncate font-semibold text-[var(--foreground)]">
                  {activeColorLabel}
                </span>
                <span className="block text-xs text-[var(--muted)]">
                  {activeColor?.family ?? "Other"} -{" "}
                  {activeColor?.hex ?? "#ffffff"}
                </span>
              </span>
              <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1 text-xs font-semibold tabular-nums text-[var(--accent)]">
                {selectedColorCount}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <label className="sr-only" htmlFor="palette-search">
              Search palette
            </label>
            <input
              className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
              id="palette-search"
              onChange={(event) => setColorSearch(event.target.value)}
              placeholder="Search code, name, hex"
              type="search"
              value={colorSearch}
            />
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <label className="sr-only" htmlFor="palette-family">
                Color family
              </label>
              <select
                className="min-w-0 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)]"
                id="palette-family"
                onChange={(event) => setSelectedColorFamily(event.target.value)}
                value={selectedColorFamily}
              >
                {colorFamilies.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>
              <button
                aria-pressed={showUsedColorsOnly}
                className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  showUsedColorsOnly
                    ? "border-[var(--accent)] bg-[var(--surface-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--accent)]"
                }`}
                onClick={() => setShowUsedColorsOnly((current) => !current)}
                type="button"
              >
                Used
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-[var(--muted)]">
            <span>
              {visiblePaletteColors.length} / {palette.colors.length} colors
            </span>
            <span>{colorStats.length} used</span>
          </div>

          {visiblePaletteColors.length > 0 ? (
            <div className="mt-3 grid max-h-[380px] grid-cols-6 gap-2 overflow-auto pr-1">
              {visiblePaletteColors.map((color) => {
                const colorUseCount = colorCounts.get(color.id) ?? 0;
                const isSelectedColor = activeColor?.id === color.id;

                return (
                  <button
                    aria-label={`${color.code} ${color.name}, ${color.hex}, ${colorUseCount} beads used`}
                    aria-pressed={isSelectedColor}
                    className={`relative aspect-square rounded-md border-2 transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 ${
                      isSelectedColor
                        ? "border-[var(--accent)]"
                        : "border-black/10 hover:border-[var(--accent)]"
                    }`}
                    key={color.id}
                    onClick={() => handleColorSelect(color.id)}
                    style={{ backgroundColor: color.hex }}
                    title={`${color.code} ${color.name} (${color.family ?? "Other"})`}
                    type="button"
                  >
                    {isSelectedColor ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2 bottom-1 h-1 rounded-full"
                        style={{
                          backgroundColor: getReadableTextColor(color.hex),
                        }}
                      />
                    ) : null}
                    {colorUseCount > 0 ? (
                      <span
                        aria-hidden="true"
                        className="absolute right-1 top-1 h-2 w-2 rounded-full border border-white bg-[var(--accent)]"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 rounded-md border border-dashed border-[var(--border)] bg-white px-3 py-4 text-sm text-[var(--muted)]">
              No colors match the current filters.
            </p>
          )}
        </section>

        <section className="border-b border-[var(--border)] bg-[var(--surface)] p-3">
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
