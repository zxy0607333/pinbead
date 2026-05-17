import Image from "next/image";
import Link from "next/link";

import type { PublishedPatternSummary } from "@/lib/db/patterns";

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function PatternPlaceholder({ pattern }: { pattern: PublishedPatternSummary }) {
  const cells = Array.from({ length: 36 }, (_, index) => {
    if (index % 7 === 0 || index % 11 === 0) {
      return "#24786a";
    }

    if (index % 5 === 0) {
      return "#d95d39";
    }

    return "#f8f7f2";
  });

  return (
    <div
      aria-label={`${pattern.title} placeholder preview`}
      className="grid aspect-square grid-cols-6 gap-1 rounded-md border border-[var(--border)] bg-[var(--surface-soft)] p-4"
      role="img"
    >
      {cells.map((color, index) => (
        <span
          aria-hidden="true"
          className="rounded-sm border border-black/10"
          key={`${pattern.id}-${index}`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

export function PatternCard({ pattern }: { pattern: PublishedPatternSummary }) {
  return (
    <Link
      className="group rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition hover:border-[var(--accent)]"
      href={`/pattern/${pattern.slug}`}
    >
      {pattern.previewImageUrl ? (
        <div className="relative aspect-square overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface-soft)]">
          <Image
            alt={`${pattern.title} bead pattern preview`}
            className="object-cover transition group-hover:scale-[1.02]"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            src={pattern.previewImageUrl}
          />
        </div>
      ) : (
        <PatternPlaceholder pattern={pattern} />
      )}

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
          {pattern.category?.name ?? "Uncategorized"}
        </p>
        <h2 className="mt-2 text-lg font-semibold">{pattern.title}</h2>
        {pattern.summary ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
            {pattern.summary}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--muted)]">
          <span className="rounded-md bg-[var(--surface-soft)] px-2 py-1">
            {pattern.width} x {pattern.height}
          </span>
          <span className="rounded-md bg-[var(--surface-soft)] px-2 py-1">
            {formatLabel(pattern.difficulty)}
          </span>
          <span className="rounded-md bg-[var(--surface-soft)] px-2 py-1">
            {pattern.colorCount} colors
          </span>
          <span className="rounded-md bg-[var(--surface-soft)] px-2 py-1">
            {pattern.beadCount} beads
          </span>
        </div>
      </div>
    </Link>
  );
}
