const beadColors = [
  "#24786a",
  "#e7b548",
  "#d95d39",
  "#2f4f7f",
  "#f6d7c8",
  "#6f5aa7",
  "#ffffff",
  "#16201b",
];

const pattern = [
  6, 6, 0, 0, 6, 6, 6, 1, 1, 6, 6, 6,
  6, 0, 0, 0, 0, 6, 1, 1, 1, 1, 6, 6,
  0, 0, 7, 0, 0, 6, 1, 7, 1, 1, 1, 6,
  0, 0, 0, 0, 0, 6, 1, 1, 1, 7, 1, 6,
  6, 0, 2, 2, 6, 6, 6, 1, 3, 3, 6, 6,
  6, 6, 2, 2, 2, 6, 3, 3, 3, 6, 6, 6,
  6, 4, 4, 2, 2, 2, 3, 3, 5, 5, 6, 6,
  4, 4, 4, 4, 2, 6, 6, 5, 5, 5, 5, 6,
  6, 4, 7, 4, 6, 6, 6, 5, 7, 5, 6, 6,
  6, 4, 4, 6, 6, 6, 6, 6, 5, 5, 6, 6,
  6, 6, 6, 6, 0, 0, 1, 1, 6, 6, 6, 6,
  6, 6, 6, 0, 0, 0, 1, 1, 1, 6, 6, 6,
];

export function BeadMosaic() {
  return (
    <div
      aria-label="A bead pattern preview"
      className="grid aspect-square w-full max-w-[420px] grid-cols-12 gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
      role="img"
    >
      {pattern.map((colorIndex, index) => (
        <span
          className="aspect-square rounded-full border border-black/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.65)]"
          key={`${colorIndex}-${index}`}
          style={{ backgroundColor: beadColors[colorIndex] }}
        />
      ))}
    </div>
  );
}

