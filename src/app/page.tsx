import { BeadMosaic } from "@/components/bead-mosaic";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pinbead Pattern Maker",
  description:
    "Design printable bead patterns from scratch, convert images into editable drafts, and browse beginner-friendly bead designs.",
};

const categories = [
  { name: "Animals", href: "/categories/animals", count: "12 patterns" },
  { name: "Food", href: "/categories/food", count: "8 patterns" },
  { name: "Holidays", href: "/categories/holidays", count: "10 patterns" },
  { name: "Beginner", href: "/categories/beginner", count: "16 patterns" },
  { name: "Cute", href: "/categories/cute", count: "9 patterns" },
  { name: "Nature", href: "/categories/nature", count: "7 patterns" },
];

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

const featuredPatterns = [
  {
    title: "Cute Cat",
    href: "/pattern/cute-cat",
    meta: "24 x 24, beginner",
    colors: ["#16201b", "#f6d7c8", "#ffffff"],
  },
  {
    title: "Tiny Strawberry",
    href: "/pattern/tiny-strawberry",
    meta: "16 x 16, keychain",
    colors: ["#d95d39", "#24786a", "#ffffff"],
  },
  {
    title: "Cozy Snowman",
    href: "/pattern/cozy-snowman",
    meta: "32 x 32, holiday",
    colors: ["#ffffff", "#2f4f7f", "#e7b548"],
  },
  {
    title: "Simple Flower",
    href: "/pattern/simple-flower",
    meta: "24 x 24, easy",
    colors: ["#e7b548", "#d97aa7", "#75b06d"],
  },
];

const guides = [
  {
    title: "How to make a bead pattern",
    href: "/guides/how-to-make-a-bead-pattern",
  },
  {
    title: "How to turn a photo into a bead pattern",
    href: "/guides/how-to-turn-a-photo-into-a-bead-pattern",
  },
  {
    title: "Bead color chart",
    href: "/guides/bead-color-chart",
  },
];

const masonryPatterns = [
  ["Rainbow Star", "Beginner", "24 x 24", "#e7b548", "h-44"],
  ["Blue Whale", "Animals", "32 x 24", "#4a8fd8", "h-56"],
  ["Mushroom", "Cute", "24 x 32", "#d95d39", "h-64"],
  ["Pumpkin", "Holidays", "32 x 32", "#e98b2a", "h-48"],
  ["Happy Frog", "Animals", "24 x 24", "#75b06d", "h-60"],
  ["Cupcake", "Food", "32 x 32", "#efb8cf", "h-52"],
  ["Moon Cloud", "Nature", "24 x 24", "#bfd5f2", "h-44"],
  ["Tiny Pizza", "Food", "16 x 16", "#e7b548", "h-56"],
  ["Heart Charm", "Beginner", "16 x 16", "#c94a52", "h-48"],
  ["Winter Tree", "Holidays", "32 x 40", "#24786a", "h-64"],
  ["Sleepy Fox", "Animals", "32 x 32", "#f0a575", "h-52"],
  ["Letter A", "Letters", "16 x 16", "#7a5aa8", "h-44"],
] as const;

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

function PatternSwatchCard({
  pattern,
}: {
  pattern: (typeof featuredPatterns)[number];
}) {
  return (
    <Link
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition hover:border-[var(--accent)]"
      href={pattern.href}
    >
      <span className="grid aspect-square grid-cols-3 gap-2 rounded-md bg-[var(--surface-soft)] p-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            className="rounded-full border border-black/10"
            key={`${pattern.title}-${index}`}
            style={{ backgroundColor: pattern.colors[index % 3] }}
          />
        ))}
      </span>
      <span className="mt-4 block font-semibold">{pattern.title}</span>
      <span className="mt-1 block text-sm text-[var(--muted)]">
        {pattern.meta}
      </span>
    </Link>
  );
}

export default function Home() {
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
          {categories.map((category) => (
            <Link
              className="rounded-md border border-[var(--border)] bg-white px-3 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href={category.href}
              key={category.name}
            >
              {category.name}
              <span className="mt-1 block text-xs font-medium text-[var(--muted)]">
                {category.count}
              </span>
            </Link>
          ))}
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredPatterns.map((pattern) => (
            <PatternSwatchCard key={pattern.title} pattern={pattern} />
          ))}
        </div>
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
          <div className="grid gap-3 sm:grid-cols-3">
            {guides.map((guide) => (
              <Link
                className="rounded-lg border border-[var(--border)] bg-white px-4 py-4 text-sm font-semibold shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href={guide.href}
                key={guide.title}
              >
                {guide.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Featured feed
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            Pattern picks for your next board.
          </h2>
        </div>
        <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {masonryPatterns.map(([title, category, size, color, height]) => (
            <Link
              className={`mb-4 inline-block w-full break-inside-avoid rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition hover:border-[var(--accent)] ${height}`}
              href="/patterns"
              key={title}
            >
              <span
                className="flex h-full min-h-28 flex-col justify-between rounded-md border border-black/10 p-4"
                style={{ backgroundColor: color }}
              >
                <span className="text-sm font-semibold text-white drop-shadow">
                  {category}
                </span>
                <span>
                  <span className="block text-lg font-semibold text-white drop-shadow">
                    {title}
                  </span>
                  <span className="mt-1 block text-sm font-medium text-white drop-shadow">
                    {size}
                  </span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

