"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  ContentStatus,
  PatternDifficulty,
  PatternSourceType,
} from "@/generated/prisma/enums";
import { beadPalettes, defaultBeadPaletteId } from "@/data/bead-palettes";

type PatternFormCategory = {
  id: string;
  name: string;
  slug: string;
};

type PatternFormState = {
  error?: string;
  success?: string;
};

type PatternFormAction = (
  previousState: PatternFormState,
  formData: FormData,
) => Promise<PatternFormState>;

type PatternFormPattern = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  categoryId: string | null;
  difficulty: PatternDifficulty;
  width: number;
  height: number;
  colorCount: number;
  beadCount: number;
  paletteId: string;
  cellsJson: unknown;
  previewImageUrl: string | null;
  downloadImageUrl: string | null;
  sourceType: PatternSourceType;
  seoTitle: string | null;
  seoDescription: string | null;
  status: ContentStatus;
};

const initialState: PatternFormState = {};

function FieldLabel({
  children,
  label,
}: Readonly<{
  children: React.ReactNode;
  label: string;
}>) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[var(--foreground)]">
      {label}
      {children}
    </label>
  );
}

function SubmitButton({
  children,
  intent,
  variant = "secondary",
}: Readonly<{
  children: React.ReactNode;
  intent: "archive" | "draft" | "publish";
  variant?: "primary" | "secondary";
}>) {
  const { pending } = useFormStatus();
  const className =
    variant === "primary"
      ? "rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      : "rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button
      className={className}
      disabled={pending}
      name="intent"
      type="submit"
      value={intent}
    >
      {pending ? "Saving..." : children}
    </button>
  );
}

function createDefaultPatternJson(pattern?: PatternFormPattern) {
  const width = pattern?.width ?? 24;
  const height = pattern?.height ?? 24;

  return {
    version: 1,
    title: pattern?.title ?? "Untitled Pattern",
    width,
    height,
    paletteId: pattern?.paletteId ?? defaultBeadPaletteId,
    source: "library",
    cells: Array.from({ length: width * height }, () => null),
  };
}

export function PatternForm({
  action,
  categories,
  pattern,
}: Readonly<{
  action: PatternFormAction;
  categories: PatternFormCategory[];
  pattern?: PatternFormPattern;
}>) {
  const [state, formAction] = useActionState(action, initialState);
  const cellsJson = JSON.stringify(
    pattern?.cellsJson ?? createDefaultPatternJson(pattern),
    null,
    2,
  );

  return (
    <form action={formAction} className="grid gap-6">
      <section className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <FieldLabel label="Title">
            <input
              className="rounded-md border border-[var(--border)] px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={pattern?.title ?? ""}
              name="title"
              required
            />
          </FieldLabel>
          <FieldLabel label="Slug">
            <input
              className="rounded-md border border-[var(--border)] px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={pattern?.slug ?? ""}
              name="slug"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
            />
          </FieldLabel>
        </div>

        <FieldLabel label="Summary">
          <textarea
            className="min-h-24 rounded-md border border-[var(--border)] px-3 py-3 font-normal leading-6 outline-none focus:border-[var(--accent)]"
            defaultValue={pattern?.summary ?? ""}
            name="summary"
          />
        </FieldLabel>

        <FieldLabel label="Description">
          <textarea
            className="min-h-40 rounded-md border border-[var(--border)] px-3 py-3 font-normal leading-6 outline-none focus:border-[var(--accent)]"
            defaultValue={pattern?.description ?? ""}
            name="description"
          />
        </FieldLabel>
      </section>

      <section className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <FieldLabel label="Category">
            <select
              className="rounded-md border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={pattern?.categoryId ?? ""}
              name="categoryId"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FieldLabel>

          <FieldLabel label="Difficulty">
            <select
              className="rounded-md border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={pattern?.difficulty ?? PatternDifficulty.BEGINNER}
              name="difficulty"
            >
              {Object.values(PatternDifficulty).map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.toLowerCase()}
                </option>
              ))}
            </select>
          </FieldLabel>

          <FieldLabel label="Status">
            <select
              className="rounded-md border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={pattern?.status ?? ContentStatus.DRAFT}
              name="status"
            >
              {Object.values(ContentStatus).map((status) => (
                <option key={status} value={status}>
                  {status.toLowerCase()}
                </option>
              ))}
            </select>
          </FieldLabel>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <FieldLabel label="Width">
            <input
              className="rounded-md border border-[var(--border)] px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={pattern?.width ?? 24}
              min={1}
              name="width"
              required
              type="number"
            />
          </FieldLabel>
          <FieldLabel label="Height">
            <input
              className="rounded-md border border-[var(--border)] px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={pattern?.height ?? 24}
              min={1}
              name="height"
              required
              type="number"
            />
          </FieldLabel>
          <FieldLabel label="Color count">
            <input
              className="rounded-md border border-[var(--border)] px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={pattern?.colorCount ?? 0}
              min={0}
              name="colorCount"
              type="number"
            />
          </FieldLabel>
          <FieldLabel label="Bead count">
            <input
              className="rounded-md border border-[var(--border)] px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={pattern?.beadCount ?? 0}
              min={0}
              name="beadCount"
              type="number"
            />
          </FieldLabel>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldLabel label="Palette">
            <select
              className="rounded-md border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={pattern?.paletteId ?? defaultBeadPaletteId}
              name="paletteId"
            >
              {beadPalettes.map((palette) => (
                <option key={palette.id} value={palette.id}>
                  {palette.name}
                </option>
              ))}
            </select>
          </FieldLabel>

          <FieldLabel label="Source type">
            <select
              className="rounded-md border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={pattern?.sourceType ?? PatternSourceType.ORIGINAL}
              name="sourceType"
            >
              {Object.values(PatternSourceType).map((sourceType) => (
                <option key={sourceType} value={sourceType}>
                  {sourceType.toLowerCase()}
                </option>
              ))}
            </select>
          </FieldLabel>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <FieldLabel label="Pattern JSON">
          <textarea
            className="min-h-80 rounded-md border border-[var(--border)] px-3 py-3 font-mono text-xs font-normal leading-5 outline-none focus:border-[var(--accent)]"
            defaultValue={cellsJson}
            name="cellsJson"
            spellCheck={false}
          />
        </FieldLabel>
      </section>

      <section className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <FieldLabel label="Preview image">
              <input
                accept="image/png,image/jpeg,image/webp"
                className="rounded-md border border-[var(--border)] bg-white px-3 py-3 font-normal"
                name="previewFile"
                type="file"
              />
            </FieldLabel>
            <input
              name="existingPreviewImageUrl"
              type="hidden"
              value={pattern?.previewImageUrl ?? ""}
            />
            {pattern?.previewImageUrl ? (
              <a
                className="text-sm font-semibold text-[var(--accent)]"
                href={pattern.previewImageUrl}
                rel="noreferrer"
                target="_blank"
              >
                Current preview
              </a>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FieldLabel label="Download file">
              <input
                accept="image/png,image/jpeg,image/webp,application/pdf,application/json"
                className="rounded-md border border-[var(--border)] bg-white px-3 py-3 font-normal"
                name="downloadFile"
                type="file"
              />
            </FieldLabel>
            <input
              name="existingDownloadImageUrl"
              type="hidden"
              value={pattern?.downloadImageUrl ?? ""}
            />
            {pattern?.downloadImageUrl ? (
              <a
                className="text-sm font-semibold text-[var(--accent)]"
                href={pattern.downloadImageUrl}
                rel="noreferrer"
                target="_blank"
              >
                Current download
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <FieldLabel label="SEO title">
            <input
              className="rounded-md border border-[var(--border)] px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={pattern?.seoTitle ?? ""}
              name="seoTitle"
            />
          </FieldLabel>
          <FieldLabel label="SEO description">
            <textarea
              className="min-h-24 rounded-md border border-[var(--border)] px-3 py-3 font-normal leading-6 outline-none focus:border-[var(--accent)]"
              defaultValue={pattern?.seoDescription ?? ""}
              name="seoDescription"
            />
          </FieldLabel>
        </div>
      </section>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        <SubmitButton intent="archive">Archive</SubmitButton>
        <SubmitButton intent="draft">Save draft</SubmitButton>
        <SubmitButton intent="publish" variant="primary">
          Publish
        </SubmitButton>
      </div>
    </form>
  );
}
