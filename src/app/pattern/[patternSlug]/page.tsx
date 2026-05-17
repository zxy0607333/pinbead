import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { beadPalettes, defaultBeadPaletteId } from "@/data/bead-palettes";
import { OpenInEditorButton } from "@/components/patterns/open-in-editor-button";
import { PatternCard } from "@/components/patterns/pattern-card";
import {
  getPublishedPatternBySlug,
  getPublishedPatternSummaries,
  getPublishedPatternsByCategorySlug,
  type PublishedPatternDetail,
} from "@/lib/db/patterns";
import {
  pinbeadPatternModelVersion,
  type PinbeadPattern,
  type PinbeadPatternCell,
} from "@/lib/pattern/pattern-model";

export const dynamic = "force-dynamic";

type PatternPageProps = {
  params: Promise<{
    patternSlug: string;
  }>;
};

type ColorStat = {
  code: string;
  count: number;
  hex: string;
  id: string;
  name: string;
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isPatternCell(value: unknown): value is PinbeadPatternCell {
  return typeof value === "string" || value === null;
}

function normalizePatternJson(pattern: PublishedPatternDetail): PinbeadPattern {
  const value = pattern.cellsJson;
  const patternObject =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const cells = Array.isArray(patternObject.cells)
    ? patternObject.cells.filter(isPatternCell)
    : [];
  const expectedCellCount = pattern.width * pattern.height;
  const normalizedCells =
    cells.length === expectedCellCount
      ? cells
      : Array.from({ length: expectedCellCount }, () => null);

  return {
    version: pinbeadPatternModelVersion,
    title: pattern.title,
    width: pattern.width,
    height: pattern.height,
    paletteId: pattern.paletteId || defaultBeadPaletteId,
    source: "library",
    cells: normalizedCells,
  };
}

function getPatternColorStats(pattern: PinbeadPattern) {
  const palette =
    beadPalettes.find((beadPalette) => beadPalette.id === pattern.paletteId) ??
    beadPalettes.find((beadPalette) => beadPalette.id === defaultBeadPaletteId) ??
    beadPalettes[0];
  const colorMap = new Map(palette.colors.map((color) => [color.id, color]));
  const counts = pattern.cells.reduce((nextCounts, colorId) => {
    if (!colorId) {
      return nextCounts;
    }

    nextCounts.set(colorId, (nextCounts.get(colorId) ?? 0) + 1);
    return nextCounts;
  }, new Map<string, number>());
  const stats: ColorStat[] = Array.from(counts.entries()).map(
    ([colorId, count]) => {
      const color = colorMap.get(colorId);

      return {
        id: colorId,
        code: color?.code ?? colorId,
        name: color?.name ?? "Unknown color",
        hex: color?.hex ?? "#d9e1dc",
        count,
      };
    },
  );

  return stats.sort((firstStat, secondStat) => {
    if (secondStat.count !== firstStat.count) {
      return secondStat.count - firstStat.count;
    }

    return firstStat.code.localeCompare(secondStat.code);
  });
}

function PatternGridPreview({
  pattern,
  stats,
}: {
  pattern: PinbeadPattern;
  stats: ColorStat[];
}) {
  const colorMap = new Map(stats.map((stat) => [stat.id, stat.hex]));

  return (
    <div
      aria-label={`${pattern.title} bead grid preview`}
      className="grid aspect-square w-full overflow-hidden rounded-lg border border-[var(--border)] bg-white p-2 shadow-sm"
      role="img"
      style={{
        gridTemplateColumns: `repeat(${pattern.width}, minmax(0, 1fr))`,
      }}
    >
      {pattern.cells.map((cell, index) => (
        <span
          aria-hidden="true"
          className="aspect-square border border-[rgba(22,32,27,0.08)]"
          key={`${cell ?? "empty"}-${index}`}
          style={{
            backgroundColor: cell ? colorMap.get(cell) ?? "#d9e1dc" : "#ffffff",
          }}
        />
      ))}
    </div>
  );
}

function PatternPreview({
  pattern,
  normalizedPattern,
  stats,
}: {
  normalizedPattern: PinbeadPattern;
  pattern: PublishedPatternDetail;
  stats: ColorStat[];
}) {
  if (pattern.previewImageUrl) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] shadow-sm">
        <Image
          alt={`${pattern.title} bead pattern preview`}
          className="object-cover"
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          src={pattern.previewImageUrl}
        />
      </div>
    );
  }

  return <PatternGridPreview pattern={normalizedPattern} stats={stats} />;
}

function DescriptionBlock({ pattern }: { pattern: PublishedPatternDetail }) {
  const categoryName = pattern.category?.name ?? "printable";
  const description = pattern.description?.trim();

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <h2 className="text-2xl font-semibold">About this pattern</h2>
      {description ? (
        <div className="mt-4 whitespace-pre-line text-base leading-8 text-[var(--muted)]">
          {description}
        </div>
      ) : (
        <p className="mt-4 text-base leading-8 text-[var(--muted)]">
          {pattern.title} is a printable {categoryName.toLowerCase()} bead
          pattern designed for makers who want a clean chart, clear dimensions,
          and a manageable color list. The pattern uses a {pattern.width} by{" "}
          {pattern.height} grid, so it is easy to check against a pegboard before
          you start placing beads. Use the preview to understand the overall
          shape, then follow the color list to prepare the beads you need. If you
          want to customize the design, open it in the Pinbead editor and adjust
          the outline, colors, or small details before exporting your own
          printable version.
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold">Making notes</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Sort the beads by code before you begin, keep the preview nearby,
            and work row by row when the shape has small details. For larger
            charts, check the outer border first so the design stays aligned.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Printing notes</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Print the chart at a size where the grid and color list are easy to
            read. If you edit the pattern first, export a fresh PNG from the
            editor so the bead counts match your final version.
          </p>
        </div>
      </div>
    </section>
  );
}

export async function generateMetadata({
  params,
}: PatternPageProps): Promise<Metadata> {
  const { patternSlug } = await params;
  const pattern = await getPublishedPatternBySlug(patternSlug);

  if (!pattern) {
    return {
      title: "Pattern Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: pattern.seoTitle ?? `${pattern.title} Bead Pattern`,
    description:
      pattern.seoDescription ??
      pattern.summary ??
      `View ${pattern.title}, a printable bead pattern from Pinbead.`,
  };
}

export default async function PatternPage({ params }: PatternPageProps) {
  const { patternSlug } = await params;
  const pattern = await getPublishedPatternBySlug(patternSlug);

  if (!pattern) {
    notFound();
  }

  const normalizedPattern = normalizePatternJson(pattern);
  const stats = getPatternColorStats(normalizedPattern);
  const relatedPatterns = pattern.category?.slug
    ? (await getPublishedPatternsByCategorySlug(pattern.category.slug))
        .filter((relatedPattern) => relatedPattern.slug !== pattern.slug)
        .slice(0, 3)
    : (await getPublishedPatternSummaries())
        .filter((relatedPattern) => relatedPattern.slug !== pattern.slug)
        .slice(0, 3);
  const totalBeads =
    stats.reduce((total, stat) => total + stat.count, 0) || pattern.beadCount;

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-6 text-[var(--foreground)] md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--muted)]">
          <Link className="text-[var(--foreground)] hover:text-[var(--accent)]" href="/">
            Pinbead
          </Link>
          <span>/</span>
          <Link className="hover:text-[var(--accent)]" href="/patterns">
            Patterns
          </Link>
          {pattern.category ? (
            <>
              <span>/</span>
              <Link
                className="hover:text-[var(--accent)]"
                href={`/categories/${pattern.category.slug}`}
              >
                {pattern.category.name}
              </Link>
            </>
          ) : null}
        </nav>

        <section className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Printable bead pattern
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold">
              {pattern.title}
            </h1>
            {pattern.summary ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
                {pattern.summary}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <OpenInEditorButton pattern={normalizedPattern} />
              {pattern.downloadImageUrl ? (
                <a
                  className="rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  href={pattern.downloadImageUrl}
                >
                  Download file
                </a>
              ) : null}
              <Link
                className="rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href="/patterns"
              >
                Browse patterns
              </Link>
            </div>
          </div>

          <PatternPreview
            normalizedPattern={normalizedPattern}
            pattern={pattern}
            stats={stats}
          />
        </section>

        <section className="grid gap-4 border-y border-[var(--border)] py-6 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Size", `${pattern.width} x ${pattern.height}`],
            ["Difficulty", formatLabel(pattern.difficulty)],
            ["Colors", String(pattern.colorCount || stats.length)],
            ["Beads", String(totalBeads)],
            ["Source", formatLabel(pattern.sourceType)],
          ].map(([label, value]) => (
            <div
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
              key={label}
            >
              <dt className="text-sm font-semibold text-[var(--muted)]">
                {label}
              </dt>
              <dd className="mt-2 text-2xl font-semibold">{value}</dd>
            </div>
          ))}
        </section>

        <section className="grid gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <DescriptionBlock pattern={pattern} />

          <aside className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <h2 className="text-2xl font-semibold">Bead colors</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use this list to prepare your beads before following the chart.
            </p>
            {stats.length > 0 ? (
              <div className="mt-4 grid max-h-[520px] gap-2 overflow-auto pr-1">
                {stats.map((stat) => (
                  <div
                    className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
                    key={stat.id}
                  >
                    <span
                      aria-hidden="true"
                      className="h-8 w-8 rounded-md border border-black/10"
                      style={{ backgroundColor: stat.hex }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {stat.name}
                      </span>
                      <span className="block text-xs text-[var(--muted)]">
                        {stat.code} · {stat.hex}
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums">
                      {stat.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-md border border-dashed border-[var(--border)] bg-white px-3 py-4 text-sm text-[var(--muted)]">
                No filled bead cells are stored for this pattern yet.
              </p>
            )}
          </aside>
        </section>

        {relatedPatterns.length > 0 ? (
          <section className="border-t border-[var(--border)] py-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Related patterns</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Explore more printable bead patterns from the same library.
                </p>
              </div>
              <Link
                className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
                href="/patterns"
              >
                View all patterns
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPatterns.map((relatedPattern) => (
                <PatternCard key={relatedPattern.id} pattern={relatedPattern} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
