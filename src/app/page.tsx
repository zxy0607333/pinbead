import { BeadMosaic } from "@/components/bead-mosaic";
import { PatternCard } from "@/components/patterns/pattern-card";
import { getPublishedCategories } from "@/lib/db/categories";
import { getPublishedGuideSummaries } from "@/lib/db/guides";
import { getPublishedPatternSummaries } from "@/lib/db/patterns";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pinbead Pattern Maker",
  description:
    "Design printable bead patterns from scratch, convert images into editable drafts, and browse beginner-friendly bead designs.",
};

export const dynamic = "force-dynamic";

const steps = [
  {
    title: "Start with a grid",
    text: "Choose a bead canvas size and draw directly on the editor.",
  },
  {
    title: "Import a draft",
    text: "Convert an image into an editable pattern instead of a final answer.",
  },
  {
    title: "Fix the details",
    text: "Adjust eyes, outlines, colors, and bead codes by hand.",
  },
  {
    title: "Export to make",
    text: "Download a printable chart with counts and a clean preview.",
  },
];

function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
      <Link className="text-lg font-semibold text-[var(--foreground)]" href="/">
        {siteConfig.name}
      </Link>
      <nav
        aria-label="Primary navigation"
        className="hidden items-center gap-6 text-sm font-medium text-[var(--muted)] sm:flex"
      >
        <Link className="hover:text-[var(--foreground)]" href="/patterns">
          Patterns
        </Link>
        <Link className="hover:text-[var(--foreground)]" href="/editor">
          Editor
        </Link>
        <Link className="hover:text-[var(--foreground)]" href="/convert">
          Convert
        </Link>
        <Link className="hover:text-[var(--foreground)]" href="/guides">
          Guides
        </Link>
      </nav>
    </header>
  );
}

function EditorPreview() {
  const cells = [
    "PB-05",
    "PB-05",
    "PB-01",
    "PB-01",
    "PB-05",
    "PB-05",
    "PB-05",
    "PB-01",
    "PB-08",
    "PB-08",
    "PB-01",
    "PB-05",
    "PB-01",
    "PB-08",
    "PB-23",
    "PB-23",
    "PB-08",
    "PB-01",
    "PB-01",
    "PB-08",
    "PB-08",
    "PB-08",
    "PB-08",
    "PB-01",
    "PB-05",
    "PB-01",
    "PB-08",
    "PB-08",
    "PB-01",
    "PB-05",
    "PB-05",
    "PB-05",
    "PB-01",
    "PB-01",
    "PB-05",
    "PB-05",
  ];
  const colorMap: Record<string, string> = {
    "PB-01": "#16201b",
    "PB-05": "#f8f7f2",
    "PB-08": "#f4c8b5",
    "PB-23": "#d97aa7",
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="grid grid-cols-[28px_repeat(6,minmax(0,1fr))_28px] gap-1 text-center text-xs font-semibold text-[var(--muted)]">
        <span />
        {[1, 2, 3, 4, 5, 6].map((number) => (
          <span key={`top-${number}`}>{number}</span>
        ))}
        <span />
        {[1, 2, 3, 4, 5, 6].map((row) => (
          <div className="contents" key={`row-${row}`}>
            <span className="flex items-center justify-center">{row}</span>
            {cells.slice((row - 1) * 6, row * 6).map((code, index) => (
              <span
                className="flex aspect-square items-center justify-center border border-[var(--border)] text-[10px] font-semibold"
                key={`${row}-${index}`}
                style={{
                  backgroundColor: colorMap[code],
                  color: code === "PB-01" ? "#ffffff" : "#16201b",
                }}
              >
                {code.replace("PB-", "")}
              </span>
            ))}
            <span className="flex items-center justify-center">{row}</span>
          </div>
        ))}
        <span />
        {[1, 2, 3, 4, 5, 6].map((number) => (
          <span key={`bottom-${number}`}>{number}</span>
        ))}
        <span />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold sm:grid-cols-4">
        {Object.entries(colorMap).map(([code, color]) => (
          <span
            className="rounded-md border border-[var(--border)] px-2 py-2"
            key={code}
          >
            <span
              aria-hidden="true"
              className="mr-2 inline-block h-3 w-3 rounded-sm border border-black/10 align-middle"
              style={{ backgroundColor: color }}
            />
            {code}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  const [categories, publishedPatterns, guides] = await Promise.all([
    getPublishedCategories(),
    getPublishedPatternSummaries(),
    getPublishedGuideSummaries(),
  ]);
  const featuredPatterns = publishedPatterns.slice(0, 4);
  const patternFeed = publishedPatterns.slice(0, 12);
  const featuredGuides = guides.slice(0, 3);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-12 pt-6 md:grid-cols-[minmax(0,1fr)_390px] md:px-8 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Bead pattern editor and printable library
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-balance md:text-6xl">
            Design bead patterns that are ready to make.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Create patterns from scratch, turn images into editable drafts, and
            export clean printable charts with bead counts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-strong)]"
              href="/editor"
            >
              Start designing
            </Link>
            <Link
              className="rounded-md border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href="/convert"
            >
              Convert image
            </Link>
            <Link
              className="rounded-md border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href="/patterns"
            >
              Browse patterns
            </Link>
          </div>
        </div>

        <EditorPreview />
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid w-full max-w-6xl gap-3 px-5 py-5 sm:grid-cols-3 md:grid-cols-6 md:px-8">
          {categories.length > 0 ? (
            categories.slice(0, 6).map((category) => (
              <Link
                className="rounded-md border border-[var(--border)] bg-white px-3 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href={`/categories/${category.slug}`}
                key={category.id}
              >
                {category.name}
                {category.description ? (
                  <span className="mt-1 line-clamp-2 block text-xs font-medium text-[var(--muted)]">
                    {category.description}
                  </span>
                ) : null}
              </Link>
            ))
          ) : (
            <div className="rounded-md border border-dashed border-[var(--border)] bg-white px-4 py-4 text-sm leading-6 text-[var(--muted)] sm:col-span-3 md:col-span-6">
              Published categories will appear here after the first pattern
              library content is ready.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              How Pinbead works
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Convert less, edit more.
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              Image conversion is useful for a first draft, but real bead
              charts need hand editing. Pinbead keeps the draft editable so the
              final pattern can actually be followed.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {steps.map((step) => (
              <article
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
                key={step.title}
              >
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface-soft)]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 md:grid-cols-[minmax(0,1fr)_360px] md:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Editor first
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Build charts with codes, counts, and clean grids.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              The editor is designed around the way bead makers actually work:
              cells, color codes, coordinates, and printable output.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Grid codes", "Color counts", "Printable export"].map(
                (item) => (
                  <span
                    className="rounded-md border border-[var(--border)] bg-white px-3 py-3 text-sm font-semibold"
                    key={item}
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
          <BeadMosaic />
        </div>
      </section>

      <section
        className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-12 md:px-8"
        id="featured-patterns"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Featured patterns
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Beginner-friendly printable ideas
            </h2>
          </div>
          <Link
            className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
            href="/patterns"
          >
            Browse all patterns
          </Link>
        </div>

        {featuredPatterns.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPatterns.map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-8">
            <h2 className="text-xl font-semibold">
              The public pattern library is being prepared.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Featured patterns will appear here after they are published from
              the admin CMS. Until then, Pinbead still offers the editor and
              image converter as usable tools.
            </p>
          </div>
        )}
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-10 md:grid-cols-[0.7fr_1.3fr] md:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Guides
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Learn the basics before you print.
            </h2>
          </div>
          {featuredGuides.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {featuredGuides.map((guide) => (
                <Link
                  className="rounded-lg border border-[var(--border)] bg-white px-4 py-4 text-sm font-semibold shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  href={`/guides/${guide.slug}`}
                  key={guide.id}
                >
                  {guide.title}
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-white px-4 py-4 text-sm leading-6 text-[var(--muted)]">
              Published guides will appear here after the first tutorial drafts
              are reviewed and published.
            </div>
          )}
        </div>
      </section>

      {patternFeed.length > 4 ? (
        <section className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Featured feed
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Pattern picks for your next board.
            </h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patternFeed.slice(4).map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
