"use client";

import { defaultBeadPaletteId } from "@/data/bead-palettes";
import {
  preparedBeadPaletteMap,
  preparedBeadPalettes,
} from "@/lib/bead-color-matching";
import {
  acceptedImageTypes,
  createImageDraftPattern,
  createImagePreview,
  getPatternSize,
  maxImageFileSize,
  waitForNextFrame,
  type ImageCropMode,
  type ImageDraftPattern,
  type ImagePreview,
} from "@/lib/pattern/image-to-pattern";
import {
  createPngBlob,
  downloadBlob,
  getConvertedPatternExportFileName,
  renderConvertedPatternPreviewToCanvas,
  type ConvertedPatternPreviewMode,
} from "@/lib/pattern/pattern-export";
import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent } from "react";

const sizeOptions = [16, 24, 32, 48, 64];
const colorCountOptions = [8, 16, 24, 32];
const defaultColorLimit = 24;

export function ImagePatternConverter() {
  const fileInputId = useId();
  const previewRequestId = useRef(0);
  const pixelRequestId = useRef(0);
  const [preview, setPreview] = useState<ImagePreview | null>(null);
  const [pixelPattern, setPixelPattern] =
    useState<ImageDraftPattern | null>(null);
  const [error, setError] = useState("");
  const [exportError, setExportError] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPixelating, setIsPixelating] = useState(false);
  const [pixelError, setPixelError] = useState("");
  const [cropMode, setCropMode] = useState<ImageCropMode>("square");
  const [previewMode, setPreviewMode] =
    useState<ConvertedPatternPreviewMode>("pixels");
  const [showGridLines, setShowGridLines] = useState(true);
  const [maxSide, setMaxSide] = useState(32);
  const [selectedColorLimit, setSelectedColorLimit] =
    useState(defaultColorLimit);
  const [selectedPaletteId, setSelectedPaletteId] =
    useState(defaultBeadPaletteId);

  const selectedPalette =
    preparedBeadPaletteMap.get(selectedPaletteId) ?? preparedBeadPalettes[0];

  const patternSize = getPatternSize(
    preview?.width,
    preview?.height,
    maxSide,
    cropMode,
  );
  const patternWidth = patternSize.width;
  const patternHeight = patternSize.height;
  const cropPreviewRatio =
    cropMode === "square"
      ? "1 / 1"
      : `${patternWidth} / ${patternHeight}`;
  const totalBeadCount = pixelPattern
    ? pixelPattern.matchedColors.reduce(
        (totalCount, color) => totalCount + color.count,
        0,
      )
    : 0;
  const beadCountMatchesPreview = pixelPattern
    ? totalBeadCount === pixelPattern.pattern.cells.length
    : false;

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  useEffect(() => {
    const requestId = pixelRequestId.current + 1;
    pixelRequestId.current = requestId;

    if (!preview) {
      return;
    }

    const pixelate = async () => {
      await waitForNextFrame();

      if (pixelRequestId.current === requestId) {
        setPixelPattern(null);
        setIsPixelating(true);
        setPixelError("");
      }

      try {
        const nextPattern = await createImageDraftPattern(
          preview.url,
          {
            width: patternWidth,
            height: patternHeight,
          },
          cropMode,
          selectedPalette,
          selectedColorLimit,
        );

        if (pixelRequestId.current === requestId) {
          setPixelPattern(nextPattern);
        }
      } catch (patternError) {
        if (pixelRequestId.current === requestId) {
          setPixelPattern(null);
          setPixelError(
            patternError instanceof Error
              ? patternError.message
              : "This image could not be pixelated.",
          );
        }
      } finally {
        if (pixelRequestId.current === requestId) {
          setIsPixelating(false);
        }
      }
    };

    void pixelate();
  }, [
    cropMode,
    patternHeight,
    patternWidth,
    preview,
    selectedColorLimit,
    selectedPalette,
  ]);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const requestId = previewRequestId.current + 1;
    previewRequestId.current = requestId;
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      setPreview(null);
      return;
    }

    if (!acceptedImageTypes.includes(file.type)) {
      setPreview(null);
      setError("Please upload a PNG, JPG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > maxImageFileSize) {
      setPreview(null);
      setError("Please choose an image under 15 MB.");
      event.target.value = "";
      return;
    }

    setIsPreparing(true);

    try {
      const nextPreview = await createImagePreview(file);

      if (previewRequestId.current !== requestId) {
        URL.revokeObjectURL(nextPreview.url);
        return;
      }

      setPreview((currentPreview) => {
        if (currentPreview) {
          URL.revokeObjectURL(currentPreview.url);
        }

        return nextPreview;
      });
    } catch (previewError) {
      setPreview(null);
      setError(
        previewError instanceof Error
          ? previewError.message
          : "This image could not be prepared.",
      );
      event.target.value = "";
    } finally {
      if (previewRequestId.current === requestId) {
        setIsPreparing(false);
      }
    }
  }

  async function handlePngExport() {
    if (!pixelPattern) {
      return;
    }

    setExportError("");
    setIsExporting(true);

    try {
      const canvas = renderConvertedPatternPreviewToCanvas({
        pattern: pixelPattern,
        previewMode,
        showGridLines,
      });
      const exportBlob = await createPngBlob(canvas);

      downloadBlob(
        exportBlob,
        getConvertedPatternExportFileName(
          pixelPattern,
          previewMode,
          showGridLines,
        ),
      );
    } catch (pngExportError) {
      setExportError(
        pngExportError instanceof Error
          ? pngExportError.message
          : "This pattern could not be exported as PNG.",
      );
    } finally {
      setIsExporting(false);
    }
  }

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
          className="flex min-h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-[var(--accent)] bg-[var(--surface-soft)] px-5 py-6 text-center transition hover:border-[var(--accent-strong)] hover:bg-white"
          htmlFor={fileInputId}
        >
          {preview ? (
            <span className="grid w-full gap-4 text-left sm:grid-cols-[150px_1fr] sm:items-center">
              <span
                aria-label={`Preview of ${preview.name}`}
                className="block aspect-square w-full rounded-md border border-[var(--border)] bg-white bg-contain bg-center bg-no-repeat"
                role="img"
                style={{ backgroundImage: `url(${preview.url})` }}
              />
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold text-[var(--foreground)]">
                  {preview.name}
                </span>
                <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">
                  {preview.width} x {preview.height}px, {preview.size}
                </span>
                <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">
                  Preview resized to {preview.previewWidth} x{" "}
                  {preview.previewHeight}px for a smoother browser workflow.
                </span>
                <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                  Choose another image
                </span>
              </span>
            </span>
          ) : (
            <>
              <span className="text-base font-semibold text-[var(--foreground)]">
                Upload image
              </span>
              <span className="mt-2 text-sm leading-6 text-[var(--muted)]">
                PNG, JPG, or WebP works best.
              </span>
              <span className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--accent)]">
                Max 15 MB
              </span>
            </>
          )}
        </label>
        <input
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          id={fileInputId}
          onChange={handleImageChange}
          type="file"
        />
        <div aria-live="polite" className="mt-3 min-h-6" role="status">
          {isPreparing ? (
            <p className="text-sm font-medium text-[var(--accent)]">
              Preparing a local preview...
            </p>
          ) : null}
          {error ? (
            <p className="text-sm font-medium text-[var(--accent-strong)]">
              {error}
            </p>
          ) : null}
          {!isPreparing && !error ? (
            <p className="text-sm leading-6 text-[var(--muted)]">
              No upload happens here. The file is decoded in your browser for
              preview only.
            </p>
          ) : null}
        </div>
      </div>

      {preview ? (
        <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Crop preview
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Square crop uses the centered area. Original ratio keeps the
                full image shape.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              {patternWidth} x {patternHeight} beads
            </span>
          </div>

          <div
            aria-label={`${cropMode} crop preview for ${preview.name}`}
            className="mt-4 mx-auto w-full max-w-[240px] rounded-md border border-[var(--border)] bg-white bg-center bg-no-repeat shadow-sm"
            role="img"
            style={{
              aspectRatio: cropPreviewRatio,
              backgroundImage: `url(${preview.url})`,
              backgroundSize: cropMode === "square" ? "cover" : "contain",
            }}
          />
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <fieldset className="sm:col-span-3">
          <legend className="text-sm font-medium text-[var(--foreground)]">
            Crop
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-md border px-3 py-3 text-sm transition ${
                cropMode === "square"
                  ? "border-[var(--accent)] bg-[var(--surface-soft)] text-[var(--foreground)]"
                  : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
              }`}
            >
              <input
                checked={cropMode === "square"}
                className="sr-only"
                name="cropMode"
                onChange={() => setCropMode("square")}
                type="radio"
              />
              <span className="block font-semibold">Square crop</span>
              <span className="mt-1 block leading-5">
                Best for icons, keychains, and simple beginner patterns.
              </span>
            </label>
            <label
              className={`cursor-pointer rounded-md border px-3 py-3 text-sm transition ${
                cropMode === "original"
                  ? "border-[var(--accent)] bg-[var(--surface-soft)] text-[var(--foreground)]"
                  : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
              }`}
            >
              <input
                checked={cropMode === "original"}
                className="sr-only"
                name="cropMode"
                onChange={() => setCropMode("original")}
                type="radio"
              />
              <span className="block font-semibold">Original ratio</span>
              <span className="mt-1 block leading-5">
                Keeps the full image shape and adjusts the bead height.
              </span>
            </label>
          </div>
        </fieldset>

        <label className="text-sm font-medium text-[var(--foreground)]">
          Size
          <select
            className="mt-2 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
            onChange={(event) => setMaxSide(Number(event.target.value))}
            value={maxSide}
          >
            {sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} bead max side
              </option>
            ))}
          </select>
          <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">
            Larger grids keep more detail but need more beads and patience.
          </span>
        </label>
        <label className="text-sm font-medium text-[var(--foreground)]">
          Palette
          <select
            className="mt-2 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
            onChange={(event) => setSelectedPaletteId(event.target.value)}
            value={selectedPalette.id}
          >
            {preparedBeadPalettes.map((palette) => (
              <option key={palette.id} value={palette.id}>
                {palette.brand} {palette.name} ({palette.colors.length} colors)
              </option>
            ))}
          </select>
          <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">
            Each pixel is matched to the closest bead color using LAB color
            distance. More brand palettes can plug into this data structure
            later.
          </span>
        </label>
        <label className="text-sm font-medium text-[var(--foreground)]">
          Colors
          <select
            className="mt-2 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
            onChange={(event) =>
              setSelectedColorLimit(Number(event.target.value))
            }
            value={selectedColorLimit}
          >
            {colorCountOptions.map((count) => (
              <option key={count} value={count}>
                {count} colors
              </option>
            ))}
          </select>
          <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">
            Lower limits simplify the bead list for beginners. Higher limits
            keep more detail from the original image.
          </span>
        </label>
      </div>

      <div className="mt-5 rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--muted)]">
        Target pattern:{" "}
        <strong className="font-semibold text-[var(--foreground)]">
          {patternWidth} x {patternHeight} beads
        </strong>
        . Transparent pixels are placed on a white background, then matched to{" "}
        <strong className="font-semibold text-[var(--foreground)]">
          {selectedPalette.brand} {selectedPalette.name}
        </strong>
        with a target limit of{" "}
        <strong className="font-semibold text-[var(--foreground)]">
          {selectedColorLimit} colors
        </strong>
        .
      </div>

      {preview ? (
        <>
          <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Pattern preview
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Switch between a clean pixel grid and a round bead mockup
                  without changing the pattern size.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                  {pixelPattern
                    ? `${pixelPattern.pattern.cells.length} cells`
                    : "Preparing"}
                </span>
                <button
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!pixelPattern || isExporting || isPixelating}
                  onClick={handlePngExport}
                  type="button"
                >
                  {isExporting ? "Exporting PNG..." : "Download PNG"}
                </button>
              </div>
            </div>

            <div aria-live="polite" className="mt-4 min-h-6" role="status">
              {isPixelating ? (
                <p className="text-sm font-medium text-[var(--accent)]">
                  Pixelating the selected crop and matching it to{" "}
                  {selectedPalette.brand} {selectedPalette.name}, then reducing
                  it to up to {selectedColorLimit} colors...
                </p>
              ) : null}
              {pixelError ? (
                <p className="text-sm font-medium text-[var(--accent-strong)]">
                  {pixelError}
                </p>
              ) : null}
              {exportError ? (
                <p className="text-sm font-medium text-[var(--accent-strong)]">
                  {exportError}
                </p>
              ) : null}
              {!isPixelating && !pixelError && !exportError && pixelPattern ? (
                <p className="text-sm leading-6 text-[var(--muted)]">
                  PNG export uses the active preview mode and current grid-line
                  setting.
                </p>
              ) : null}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,180px)]">
              <fieldset>
                <legend className="text-sm font-medium text-[var(--foreground)]">
                  Preview mode
                </legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <label
                    className={`cursor-pointer rounded-md border px-3 py-3 text-sm transition ${
                      previewMode === "pixels"
                        ? "border-[var(--accent)] bg-white text-[var(--foreground)]"
                        : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)] hover:border-[var(--accent)]"
                    }`}
                  >
                    <input
                      checked={previewMode === "pixels"}
                      className="sr-only"
                      name="previewMode"
                      onChange={() => setPreviewMode("pixels")}
                      type="radio"
                    />
                    <span className="block font-semibold">Pixel grid</span>
                    <span className="mt-1 block leading-5">
                      Best for counting rows and checking the bead layout.
                    </span>
                  </label>
                  <label
                    className={`cursor-pointer rounded-md border px-3 py-3 text-sm transition ${
                      previewMode === "beads"
                        ? "border-[var(--accent)] bg-white text-[var(--foreground)]"
                        : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)] hover:border-[var(--accent)]"
                    }`}
                  >
                    <input
                      checked={previewMode === "beads"}
                      className="sr-only"
                      name="previewMode"
                      onChange={() => setPreviewMode("beads")}
                      type="radio"
                    />
                    <span className="block font-semibold">Round beads</span>
                    <span className="mt-1 block leading-5">
                      Simulates the finished bead look with circular pieces.
                    </span>
                  </label>
                </div>
              </fieldset>

              <label className="rounded-md border border-[var(--border)] bg-white px-3 py-3 text-sm text-[var(--foreground)]">
                <span className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block font-semibold">Grid lines</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
                      Helpful for row-by-row counting on both preview modes.
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      showGridLines
                        ? "bg-[var(--surface-soft)] text-[var(--accent)]"
                        : "bg-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    {showGridLines ? "On" : "Off"}
                  </span>
                </span>
                <input
                  checked={showGridLines}
                  className="sr-only"
                  onChange={(event) => setShowGridLines(event.target.checked)}
                  type="checkbox"
                />
              </label>
            </div>

            {pixelPattern && !pixelError ? (
              <div
                aria-label={`${previewMode === "beads" ? "Round bead" : "Pixel"} preview for a ${pixelPattern.pattern.width} by ${pixelPattern.pattern.height} bead pattern using ${pixelPattern.paletteName}${showGridLines ? " with grid lines" : ""}`}
                className="mx-auto mt-4 grid w-full max-w-[300px] overflow-hidden rounded-md border border-[var(--border)] shadow-sm sm:max-w-[360px]"
                role="img"
                style={{
                  aspectRatio: `${pixelPattern.pattern.width} / ${pixelPattern.pattern.height}`,
                  backgroundColor: showGridLines
                    ? "var(--border)"
                    : "var(--surface)",
                  gap: showGridLines ? "1px" : "0px",
                  gridTemplateColumns: `repeat(${pixelPattern.pattern.width}, minmax(0, 1fr))`,
                }}
              >
                {pixelPattern.cells.map((color, index) => (
                  <span
                    aria-hidden="true"
                    className={`aspect-square ${
                      previewMode === "beads"
                        ? "flex items-center justify-center"
                        : ""
                    }`}
                    key={`${color}-${index}`}
                    style={{
                      backgroundColor:
                        previewMode === "pixels"
                          ? color
                          : showGridLines
                            ? "var(--surface)"
                            : "transparent",
                    }}
                  >
                    {previewMode === "beads" ? (
                      <span
                        className="block h-[84%] w-[84%] rounded-full border border-black/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.65),0_1px_1px_rgba(15,17,16,0.08)]"
                        style={{ backgroundColor: color }}
                      />
                    ) : null}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {pixelPattern && !pixelError ? (
            <div className="mt-5 rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Bead count list
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    This color list is generated from the current preview, so
                    bead counts stay in sync when you change size, palette, or
                    color limit.
                  </p>
                </div>
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                  {totalBeadCount} total beads
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    Total beads
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                    {totalBeadCount}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    {pixelPattern.pattern.width} x {pixelPattern.pattern.height} pattern grid
                  </p>
                </div>

                <div className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    Colors used
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                    {pixelPattern.matchedColors.length}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    Up to {pixelPattern.effectiveColorLimit} colors allowed
                  </p>
                </div>

                <div className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    Active palette
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                    {pixelPattern.paletteName}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    {beadCountMatchesPreview
                      ? "The color counts below add up to the full preview."
                      : "The color counts are being recalculated for this preview."}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3 text-sm leading-6 text-[var(--muted)]">
                {pixelPattern.originalColorCount >
                pixelPattern.matchedColors.length ? (
                  <>
                    Reduced this crop from{" "}
                    <strong className="font-semibold text-[var(--foreground)]">
                      {pixelPattern.originalColorCount}
                    </strong>{" "}
                    matched bead colors down to{" "}
                    <strong className="font-semibold text-[var(--foreground)]">
                      {pixelPattern.matchedColors.length}
                    </strong>{" "}
                    to fit your current color limit.
                  </>
                ) : (
                  <>
                    This crop already fits within the selected{" "}
                    <strong className="font-semibold text-[var(--foreground)]">
                      {pixelPattern.selectedColorLimit}-color
                    </strong>{" "}
                    limit, so no extra reduction was needed.
                  </>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {pixelPattern.matchedColors.map((color) => (
                  <div
                    className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3"
                    key={color.id}
                  >
                    <span
                      aria-hidden="true"
                      className="h-10 w-10 rounded-md border border-black/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.55)]"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[var(--foreground)]">
                        {color.name}
                      </span>
                      <span className="block text-xs leading-5 text-[var(--muted)]">
                        {color.hex} - {color.code}
                      </span>
                    </span>
                    <span className="ml-auto whitespace-nowrap text-xs font-semibold text-[var(--accent)]">
                      {color.count} beads
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-md border border-dashed border-[var(--border)] bg-white px-3 py-3 text-xs leading-5 text-[var(--muted)]">
                Color counts sum to{" "}
                <strong className="font-semibold text-[var(--foreground)]">
                  {totalBeadCount}
                </strong>{" "}
                bead positions in the current pattern preview.
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

