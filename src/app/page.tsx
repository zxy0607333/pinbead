import { BeadMosaic } from "@/components/bead-mosaic";
import { siteConfig } from "@/lib/site";

const featureLinks = [
  "Image to bead pattern",
  "Printable pattern library",
  "Color and bead counts",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-6 py-10 md:grid-cols-[1fr_420px] md:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            {siteConfig.name}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-balance md:text-6xl">
            Pin bead patterns from images, ready to print.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
            A focused workspace for turning photos into bead patterns and
            publishing original beginner-friendly designs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {featureLinks.map((item) => (
              <span
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <BeadMosaic />
      </section>
    </main>
  );
}

