import type { BeadPalette, BeadPaletteColor } from "@/data/bead-palettes";

export const pinbeadPatternModelVersion = 1;

export type PinbeadPatternCell = string | null;

export type PinbeadPatternSource = "blank" | "image-draft" | "library";

export type PinbeadPattern = {
  version: typeof pinbeadPatternModelVersion;
  title: string;
  width: number;
  height: number;
  paletteId: string;
  source: PinbeadPatternSource;
  cells: PinbeadPatternCell[];
};

export type PinbeadPatternColorStat = {
  color: BeadPaletteColor;
  count: number;
};

type CreateBlankPatternOptions = {
  height: number;
  paletteId: string;
  title?: string;
  width: number;
};

type CreatePatternOptions = CreateBlankPatternOptions & {
  cells?: PinbeadPatternCell[];
  source?: PinbeadPatternSource;
};

type PatternCellPosition = {
  column: number;
  row: number;
};

export function getPatternCellCount(pattern: PinbeadPattern) {
  return pattern.width * pattern.height;
}

export function createBlankPattern({
  height,
  paletteId,
  title = "Untitled Pinbead Pattern",
  width,
}: CreateBlankPatternOptions): PinbeadPattern {
  return createPattern({
    width,
    height,
    paletteId,
    title,
    source: "blank",
  });
}

export function createPattern({
  cells,
  height,
  paletteId,
  source = "blank",
  title = "Untitled Pinbead Pattern",
  width,
}: CreatePatternOptions): PinbeadPattern {
  const expectedCellCount = width * height;
  const patternCells =
    cells ?? Array.from({ length: expectedCellCount }, () => null);

  if (patternCells.length !== expectedCellCount) {
    throw new Error(
      `Pattern cell count does not match ${width} x ${height}.`,
    );
  }

  return {
    version: pinbeadPatternModelVersion,
    title,
    width,
    height,
    paletteId,
    source,
    cells: patternCells,
  };
}

export function getPatternCellIndex(
  pattern: PinbeadPattern,
  { column, row }: PatternCellPosition,
) {
  if (
    row < 0 ||
    row >= pattern.height ||
    column < 0 ||
    column >= pattern.width
  ) {
    return -1;
  }

  return row * pattern.width + column;
}

export function getPatternCellPosition(
  pattern: PinbeadPattern,
  index: number,
): PatternCellPosition {
  return {
    row: Math.floor(index / pattern.width),
    column: index % pattern.width,
  };
}

export function getPatternNeighborIndexes(
  pattern: PinbeadPattern,
  index: number,
) {
  const { column, row } = getPatternCellPosition(pattern, index);
  const neighbors: number[] = [];
  const candidates = [
    { row: row - 1, column },
    { row: row + 1, column },
    { row, column: column - 1 },
    { row, column: column + 1 },
  ];

  for (const candidate of candidates) {
    const candidateIndex = getPatternCellIndex(pattern, candidate);

    if (candidateIndex >= 0) {
      neighbors.push(candidateIndex);
    }
  }

  return neighbors;
}

export function updatePatternCellColor(
  pattern: PinbeadPattern,
  index: number,
  nextColorId: PinbeadPatternCell,
): PinbeadPattern {
  if (pattern.cells[index] === nextColorId) {
    return pattern;
  }

  const nextCells = [...pattern.cells];
  nextCells[index] = nextColorId;

  return {
    ...pattern,
    cells: nextCells,
  };
}

export function fillPatternConnectedArea(
  pattern: PinbeadPattern,
  startIndex: number,
  nextColorId: PinbeadPatternCell,
): PinbeadPattern {
  const targetColorId = pattern.cells[startIndex];

  if (targetColorId === nextColorId) {
    return pattern;
  }

  const nextCells = [...pattern.cells];
  const queue = [startIndex];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const currentIndex = queue.shift();

    if (currentIndex === undefined || visited.has(currentIndex)) {
      continue;
    }

    visited.add(currentIndex);

    if (nextCells[currentIndex] !== targetColorId) {
      continue;
    }

    nextCells[currentIndex] = nextColorId;

    for (const neighborIndex of getPatternNeighborIndexes(pattern, currentIndex)) {
      if (!visited.has(neighborIndex)) {
        queue.push(neighborIndex);
      }
    }
  }

  return {
    ...pattern,
    cells: nextCells,
  };
}

export function getPatternColorCounts(pattern: PinbeadPattern) {
  return pattern.cells.reduce((counts, colorId) => {
    if (!colorId) {
      return counts;
    }

    counts.set(colorId, (counts.get(colorId) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
}

export function getPatternColorStats(
  pattern: PinbeadPattern,
  palette: BeadPalette,
): PinbeadPatternColorStat[] {
  const colorCounts = getPatternColorCounts(pattern);

  return palette.colors
    .map((color) => ({
      color,
      count: colorCounts.get(color.id) ?? 0,
    }))
    .filter((stat) => stat.count > 0)
    .sort((firstStat, secondStat) => {
      if (secondStat.count !== firstStat.count) {
        return secondStat.count - firstStat.count;
      }

      return firstStat.color.code.localeCompare(secondStat.color.code);
    });
}

export function getPatternFilledCellCount(pattern: PinbeadPattern) {
  return pattern.cells.filter(Boolean).length;
}
