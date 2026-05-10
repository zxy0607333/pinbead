import type { BeadPalette } from "@/data/bead-palettes";
import type {
  PinbeadPattern,
  PinbeadPatternColorStat,
} from "@/lib/pattern/pattern-model";

const exportPaperColor = "#ffffff";
const exportSurfaceColor = "#f8fafc";
const exportSoftSurfaceColor = "#eef2f7";
const exportBorderColor = "#d6dde8";
const exportTextColor = "#111827";
const exportMutedTextColor = "#64748b";
const convertedPatternSurfaceColor = "#ffffff";
const convertedPatternBorderColor = "#d9e1dc";
const convertedPatternPadding = 28;

export type ConvertedPatternPreviewMode = "pixels" | "beads";

type EditorPatternExportOptions = {
  pattern: PinbeadPattern;
  colorStats: PinbeadPatternColorStat[];
  palette: BeadPalette;
  showColorCodes: boolean;
  showCoordinates: boolean;
  showGridLines: boolean;
};

type ConvertedPatternRenderOptions = {
  pattern: {
    width: number;
    height: number;
    cells: string[];
  };
  previewMode: ConvertedPatternPreviewMode;
  showGridLines: boolean;
};

export function getReadableTextColor(hex: string) {
  const normalizedHex = hex.replace("#", "");
  const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness < 145 ? "#ffffff" : "#111827";
}

function formatTimestampForFileName(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate(),
  )}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export function getEditorPatternExportFileName(pattern: PinbeadPattern) {
  return `pinbead-${pattern.width}x${pattern.height}-${formatTimestampForFileName(
    new Date(),
  )}.png`;
}

export function getConvertedPatternExportFileName(
  pattern: { width: number; height: number },
  previewMode: ConvertedPatternPreviewMode,
  showGridLines: boolean,
) {
  const modeSegment = previewMode === "beads" ? "beads" : "pixels";
  const gridSegment = showGridLines ? "grid" : "plain";

  return `pinbead-${pattern.width}x${pattern.height}-${modeSegment}-${gridSegment}-${formatTimestampForFileName(
    new Date(),
  )}.png`;
}

function getEditorExportCellSize(size: number, showColorCodes: boolean) {
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

function getConvertedPatternCellSize(width: number, height: number) {
  const largestSide = Math.max(width, height);

  return Math.max(14, Math.min(28, Math.floor(1400 / largestSide)));
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

export function renderEditorPatternToCanvas({
  colorStats,
  palette,
  pattern,
  showColorCodes,
  showCoordinates,
  showGridLines,
}: EditorPatternExportOptions) {
  const colorMap = new Map(palette.colors.map((color) => [color.id, color]));
  const cellSize = getEditorExportCellSize(
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
  const canvasHeight =
    padding + headerHeight + boardHeight + 32 + legendHeight + padding;
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

      context.fillText(
        String(coordinate),
        patternX + offset,
        boardY + coordinateSize / 2,
      );
      context.fillText(
        String(coordinate),
        patternX + offset,
        patternY + gridHeight + coordinateSize / 2,
      );
    }

    for (let coordinate = 1; coordinate <= pattern.height; coordinate += 1) {
      const offset = (coordinate - 1) * cellSize + cellSize / 2;

      context.fillText(
        String(coordinate),
        boardX + coordinateSize / 2,
        patternY + offset,
      );
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
        context.font = `700 ${Math.max(
          8,
          Math.floor(cellSize * 0.34),
        )}px Arial, sans-serif`;
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
  context.fillText(
    `${totalBeads} total beads`,
    legendX + legendWidth,
    legendY + 20,
  );

  if (colorStats.length === 0) {
    context.fillStyle = exportMutedTextColor;
    context.font = "15px Arial, sans-serif";
    context.textAlign = "left";
    context.fillText(
      "No beads placed yet.",
      legendX,
      legendY + legendHeaderHeight + 24,
    );

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
    context.strokeRect(
      x + 0.5,
      y + 0.5,
      legendColumnWidth - 1,
      legendRowHeight - 9,
    );

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

export function renderConvertedPatternPreviewToCanvas({
  pattern,
  previewMode,
  showGridLines,
}: ConvertedPatternRenderOptions) {
  const cellSize = getConvertedPatternCellSize(pattern.width, pattern.height);
  const gridThickness = showGridLines
    ? Math.max(1, Math.round(cellSize * 0.08))
    : 0;
  const patternPixelWidth =
    pattern.width * cellSize + Math.max(0, pattern.width - 1) * gridThickness;
  const patternPixelHeight =
    pattern.height * cellSize + Math.max(0, pattern.height - 1) * gridThickness;
  const canvas = document.createElement("canvas");

  canvas.width = patternPixelWidth + convertedPatternPadding * 2;
  canvas.height = patternPixelHeight + convertedPatternPadding * 2;

  const context = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: false,
  });

  if (!context) {
    throw new Error("Your browser could not prepare the PNG export.");
  }

  context.fillStyle = showGridLines
    ? convertedPatternBorderColor
    : convertedPatternSurfaceColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < pattern.height; row += 1) {
    for (let column = 0; column < pattern.width; column += 1) {
      const cellIndex = row * pattern.width + column;
      const cellColor = pattern.cells[cellIndex];
      const cellX =
        convertedPatternPadding + column * (cellSize + gridThickness);
      const cellY = convertedPatternPadding + row * (cellSize + gridThickness);

      if (previewMode === "pixels") {
        context.fillStyle = cellColor;
        context.fillRect(cellX, cellY, cellSize, cellSize);
        continue;
      }

      if (showGridLines) {
        context.fillStyle = convertedPatternSurfaceColor;
        context.fillRect(cellX, cellY, cellSize, cellSize);
      }

      const beadRadius = cellSize * 0.42;
      const beadCenterX = cellX + cellSize / 2;
      const beadCenterY = cellY + cellSize / 2;

      context.beginPath();
      context.arc(beadCenterX, beadCenterY, beadRadius, 0, Math.PI * 2);
      context.fillStyle = cellColor;
      context.fill();
      context.lineWidth = Math.max(1, cellSize * 0.04);
      context.strokeStyle = "rgba(15, 17, 16, 0.12)";
      context.stroke();

      context.beginPath();
      context.arc(
        beadCenterX - cellSize * 0.1,
        beadCenterY - cellSize * 0.12,
        cellSize * 0.13,
        0,
        Math.PI * 2,
      );
      context.fillStyle = "rgba(255, 255, 255, 0.35)";
      context.fill();
    }
  }

  return canvas;
}

export function createPngBlob(canvas: HTMLCanvasElement) {
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

export function downloadBlob(blob: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(blobUrl);
}
