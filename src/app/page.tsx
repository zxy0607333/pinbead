import { BeadMosaic } from "@/components/bead-mosaic";
import { HomePatternMaker } from "@/components/home-pattern-maker";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pinbead Pattern Maker",
  description:
    "Turn any image into a printable pin bead pattern and browse beginner-friendly bead designs.",
};

const featuredPatterns = [
  {
    title: "Cute Cat",
    detail: "24 x 24, beginner",
    palette: ["#16201b", "#f6d7c8", "#ffffff"],
  },
  {
    title: "Tiny Strawberry",
    detail: "16 x 16, keychain",
    palette: ["#d95d39", "#24786a", "#ffffff"],
  },
  {
    title: "Cozy Snowman",
    detail: "32 x 32, holiday",
    palette: ["#ffffff", "#2f4f7f", "#e7b548"],
  },
];

const categories = [
  "Animals",
  "Food",
  "Holidays",
  "Cute Icons",
  "Beginner Patterns",
];

const guides = [
  "How to turn a photo into a bead pattern",
  "How to choose the right bead pattern size",
  "Beginner pin bead tips",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <Link className="text-lg font-semibold text-[var(--foreground)]" href="/">
          {siteConfig.name}
        </Link>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 text-sm font-medium text-[var(--muted)] sm:flex"
        >
          <a className="hover:text-[var(--foreground)]" href="#tool">
            Maker
          </a>
          <a className="hover:text-[var(--foreground)]" href="#patterns">
            Patterns
          </a>
          <a className="hover:text-[var(--foreground)]" href="#guides">
            Guides
          </a>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-10 pt-3 md:grid-cols-[minmax(0,1fr)_380px] md:px-8 lg:grid-cols-[minmax(0,1fr)_430px]">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Image to bead pattern
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-balance md:text-6xl">
            Pinbead Pattern Maker
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Turn any image into a printable pin bead pattern with bead counts,
            palette choices, and beginner-friendly pattern ideas.
          </p>
          <div className="mt-7" id="tool">
            <HomePatternMaker />
          </div>
        </div>

        <div className="md:pt-14">
          <BeadMosaic />
        </div>
      </section>

      <section
        className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-8"
        id="patterns"
      >
        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Featured patterns
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Free printable bead patterns
              </h2>
            </div>
            <a
              className="hidden text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)] sm:block"
              href="#patterns"
            >
              Browse all
            </a>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {featuredPatterns.map((patternItem) => (
              <article
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
                key={patternItem.title}
              >
                <div className="grid aspect-square grid-cols-3 gap-2 rounded-md bg-[var(--surface-soft)] p-4">
                  {patternItem.palette.map((color) => (
                    <span
                      className="rounded-full border border-black/10"
                      key={color}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  {patternItem.palette.map((color) => (
                    <span
                      className="rounded-full border border-black/10"
                      key={`${color}-repeat`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  {patternItem.palette.map((color) => (
                    <span
                      className="rounded-full border border-black/10"
                      key={`${color}-third`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <h3 className="mt-4 font-semibold">{patternItem.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {patternItem.detail}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside className="grid gap-5">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Popular categories</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <a
                  className="rounded-full border border-[var(--border)] px-3 py-2 text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  href="#patterns"
                  key={category}
                >
                  {category}
                </a>
              ))}
            </div>
          </div>

          <div
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
            id="guides"
          >
            <h2 className="text-lg font-semibold">Beginner guides</h2>
            <div className="mt-4 grid gap-3">
              {guides.map((guide) => (
                <a
                  className="rounded-md border border-[var(--border)] px-3 py-3 text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  href="#guides"
                  key={guide}
                >
                  {guide}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
