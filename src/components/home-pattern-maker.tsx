"use client";

import { useId, useState } from "react";

const sizes = ["16 x 16", "24 x 24", "32 x 32", "48 x 48"];
const colorCounts = ["8 colors", "16 colors", "24 colors", "32 colors"];
const palettes = ["Pinbead starter", "Perler", "Hama", "Artkal"];

export function HomePatternMaker() {
  const fileInputId = useId();
  const [fileName, setFileName] = useState("");

  return (
    <section
      aria-label="Image to bead pattern maker"
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Pattern maker
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Private by default. Your image stays in this browser until you
            choose to share.
          </p>
        </div>
        <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
          Local
        </span>
      </div>

      <div className="mt-5">
        <label
          className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--accent)] bg-[var(--surface-soft)] px-5 py-6 text-center transition hover:border-[var(--accent-strong)] hover:bg-white"
          htmlFor={fileInputId}
        >
          <span className="text-base font-semibold text-[var(--foreground)]">
            Upload image
          </span>
          <span className="mt-2 text-sm leading-6 text-[var(--muted)]">
            PNG, JPG, or WebP works best.
          </span>
          {fileName ? (
            <span className="mt-3 max-w-full truncate rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--accent)]">
              {fileName}
            </span>
          ) : null}
        </label>
        <input
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          id={fileInputId}
          onChange={(event) => {
            setFileName(event.target.files?.[0]?.name ?? "");
          }}
          type="file"
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-medium text-[var(--foreground)]">
          Size
          <select className="mt-2 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)]">
            {sizes.map((size) => (
              <option key={size}>{size}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-[var(--foreground)]">
          Palette
          <select className="mt-2 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)]">
            {palettes.map((palette) => (
              <option key={palette}>{palette}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-[var(--foreground)]">
          Colors
          <select className="mt-2 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)]">
            {colorCounts.map((count) => (
              <option key={count}>{count}</option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
