"use client";

import { defaultBeadPaletteId } from "@/data/bead-palettes";
import {
  matchRgbToBeadColor,
  preparedBeadPaletteMap,
  preparedBeadPalettes,
  type PreparedBeadPalette,
  type PreparedBeadPaletteColor,
} from "@/lib/bead-color-matching";
import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent } from "react";

const sizeOptions = [16, 24, 32, 48, 64];
const colorCountOptions = [8, 16, 24, 32];
const upcomingColorLimit = 24;
const acceptedTypes = ["image/png", "image/jpeg", "image/webp"];
const maxFileSize = 15 * 1024 * 1024;
const maxInputPixels = 36_000_000;
const previewMaxSize = 960;

type ImagePreview = {
  name: string;
  url: string;
  width: number;
  height: number;
  previewWidth: number;
  previewHeight: number;
  size: string;
};

type DecodedImage = {
  image: CanvasImageSource;
  width: number;
  height: number;
  close?: () => void;
};

type CropMode = "square" | "original";

type PatternSize = {
  width: number;
  height: number;
};

type MatchedPatternColor = {
  id: string;
  brand: string;
  code: string;
  name: string;
  hex: string;
  count: number;
};

type PixelPattern = PatternSize & {
  cells: string[];
  matchedColors: MatchedPatternColor[];
  paletteId: string;
  paletteName: string;
};

function getPatternSize(
  sourceWidth: number | undefined,
  sourceHeight: number | undefined,
  maxSide: number,
  cropMode: CropMode,
) {
  if (cropMode === "square" || !sourceWidth || !sourceHeight) {
    return {
      width: maxSide,
      height: maxSide,
    };
  }

  if (sourceWidth >= sourceHeight) {
    return {
      width: maxSide,
      height: Math.max(1, Math.round((sourceHeight / sourceWidth) * maxSide)),
    };
  }

  return {
    width: Math.max(1, Math.round((sourceWidth / sourceHeight) * maxSide)),
    height: maxSide,
  };
}

function getCropSourceRect(
  sourceWidth: number,
  sourceHeight: number,
  cropMode: CropMode,
) {
  if (cropMode === "original") {
    return {
      sx: 0,
      sy: 0,
      sw: sourceWidth,
      sh: sourceHeight,
    };
  }

  const size = Math.min(sourceWidth, sourceHeight);

  return {
    sx: Math.round((sourceWidth - size) / 2),
    sy: Math.round((sourceHeight - size) / 2),
    sw: size,
    sh: size,
  };
}

function componentToHex(value: number) {
  return value.toString(16).padStart(2, "0");
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${componentToHex(red)}${componentToHex(green)}${componentToHex(
    blue,
  )}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getPreviewSize(width: number, height: number) {
  const scale = Math.min(1, previewMaxSize / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function loadImageElement(file: File): Promise<DecodedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        image,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This image could not be read. Try another file."));
    };
    image.src = url;
  });
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file);

    return {
      image: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    };
  }

  return loadImageElement(file);
}

function loadImageUrl(url: string): Promise<DecodedImage> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve({
        image,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = () => {
      reject(new Error("This image could not be pixelated."));
    };
    image.src = url;
  });
}

function waitForNextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function createPreview(file: File): Promise<ImagePreview> {
  const decoded = await decodeImage(file);

  try {
    if (decoded.width * decoded.height > maxInputPixels) {
      throw new Error(
        "This image is very large. Please choose an image under 36 megapixels.",
      );
    }

    const previewSize = getPreviewSize(decoded.width, decoded.height);
    const canvas = document.createElement("canvas");
    canvas.width = previewSize.width;
    canvas.height = previewSize.height;

    const context = canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: false,
    });

    if (!context) {
      throw new Error("Your browser could not prepare the image preview.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(decoded.image, 0, 0, previewSize.width, previewSize.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((previewBlob) => {
        if (previewBlob) {
          resolve(previewBlob);
        } else {
          reject(new Error("Your browser could not create the image preview."));
        }
      }, "image/png");
    });

    return {
      name: file.name,
      url: URL.createObjectURL(blob),
      width: decoded.width,
      height: decoded.height,
      previewWidth: previewSize.width,
      previewHeight: previewSize.height,
      size: formatBytes(file.size),
    };
  } finally {
    decoded.close?.();
  }
}

async function createPixelPattern(
  imageUrl: string,
  patternSize: PatternSize,
  cropMode: CropMode,
  palette: PreparedBeadPalette,
): Promise<PixelPattern> {
  await waitForNextFrame();

  const decoded = await loadImageUrl(imageUrl);

  try {
    const canvas = document.createElement("canvas");
    canvas.width = patternSize.width;
    canvas.height = patternSize.height;

    const context = canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: true,
    });

    if (!context) {
      throw new Error("Your browser could not prepare the pixel pattern.");
    }

    const source = getCropSourceRect(decoded.width, decoded.height, cropMode);

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, patternSize.width, patternSize.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      decoded.image,
      source.sx,
      source.sy,
      source.sw,
      source.sh,
      0,
      0,
      patternSize.width,
      patternSize.height,
    );

    const { data } = context.getImageData(
      0,
      0,
      patternSize.width,
      patternSize.height,
    );
    const cells: string[] = [];
    const matchedColorCache = new Map<string, PreparedBeadPaletteColor>();
    const matchedColorCounts = new Map<string, number>();
    const paletteColorsById = new Map(
      palette.colors.map((color) => [color.id, color]),
    );

    for (let index = 0; index < data.length; index += 4) {
      const sourceRed = data[index];
      const sourceGreen = data[index + 1];
      const sourceBlue = data[index + 2];
      const sourceHex = rgbToHex(sourceRed, sourceGreen, sourceBlue);
      let matchedColor = matchedColorCache.get(sourceHex);

      if (!matchedColor) {
        matchedColor = matchRgbToBeadColor(
          sourceRed,
          sourceGreen,
          sourceBlue,
          palette,
        ).color;
        matchedColorCache.set(sourceHex, matchedColor);
      }

      cells.push(matchedColor.hex);
      matchedColorCounts.set(
        matchedColor.id,
        (matchedColorCounts.get(matchedColor.id) ?? 0) + 1,
      );
    }

    const matchedColors = Array.from(matchedColorCounts.entries())
      .map(([colorId, count]) => {
        const matchedColor = paletteColorsById.get(colorId);

        if (!matchedColor) {
          throw new Error("This bead palette could not be applied.");
        }

        return {
          id: matchedColor.id,
          brand: matchedColor.brand,
          code: matchedColor.code,
          name: matchedColor.name,
          hex: matchedColor.hex,
          count,
        };
      })
      .sort(
        (leftColor, rightColor) =>
          rightColor.count - leftColor.count ||
          leftColor.name.localeCompare(rightColor.name),
      );

    return {
      width: patternSize.width,
      height: patternSize.height,
      cells,
      matchedColors,
      paletteId: palette.id,
      paletteName: `${palette.brand} ${palette.name}`,
    };
  } finally {
    decoded.close?.();
  }
}

export function HomePatternMaker() {
  const fileInputId = useId();
  const previewRequestId = useRef(0);
  const pixelRequestId = useRef(0);
  const [preview, setPreview] = useState<ImagePreview | null>(null);
  const [pixelPattern, setPixelPattern] = useState<PixelPattern | null>(null);
  const [error, setError] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [isPixelating, setIsPixelating] = useState(false);
  const [pixelError, setPixelError] = useState("");
  const [cropMode, setCropMode] = useState<CropMode>("square");
  const [maxSide, setMaxSide] = useState(32);
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
        const nextPattern = await createPixelPattern(
          preview.url,
          {
            width: patternWidth,
            height: patternHeight,
          },
          cropMode,
          selectedPalette,
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
  }, [cropMode, patternHeight, patternWidth, preview, selectedPalette]);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const requestId = previewRequestId.current + 1;
    previewRequestId.current = requestId;
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      setPreview(null);
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      setPreview(null);
      setError("Please upload a PNG, JPG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > maxFileSize) {
      setPreview(null);
      setError("Please choose an image under 15 MB.");
      event.target.value = "";
      return;
    }

    setIsPreparing(true);

    try {
      const nextPreview = await createPreview(file);

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
            className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--muted)]"
            disabled
            value={upcomingColorLimit}
          >
            {colorCountOptions.map((count) => (
              <option key={count} value={count}>
                {count} colors
              </option>
            ))}
          </select>
          <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">
            Color-limit quantization is the next step. This release focuses on
            matching every cell to the selected bead palette.
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
        .
      </div>

      {preview ? (
        <>
          <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Pixel pattern preview
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Each square is one bead position in the target grid.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                {pixelPattern
                  ? `${pixelPattern.cells.length} cells`
                  : "Preparing"}
              </span>
            </div>

            <div aria-live="polite" className="mt-4 min-h-6" role="status">
              {isPixelating ? (
                <p className="text-sm font-medium text-[var(--accent)]">
                  Pixelating the selected crop and matching it to{" "}
                  {selectedPalette.brand} {selectedPalette.name}...
                </p>
              ) : null}
              {pixelError ? (
                <p className="text-sm font-medium text-[var(--accent-strong)]">
                  {pixelError}
                </p>
              ) : null}
            </div>

            {pixelPattern && !pixelError ? (
              <div
                aria-label={`Pixelated ${pixelPattern.width} by ${pixelPattern.height} bead pattern using ${pixelPattern.paletteName}`}
                className="mx-auto mt-4 grid aspect-square w-full max-w-[280px] overflow-hidden rounded-md border border-[var(--border)] bg-white shadow-sm"
                role="img"
                style={{
                  aspectRatio: `${pixelPattern.width} / ${pixelPattern.height}`,
                  gridTemplateColumns: `repeat(${pixelPattern.width}, minmax(0, 1fr))`,
                }}
              >
                {pixelPattern.cells.map((color, index) => (
                  <span
                    aria-hidden="true"
                    className="aspect-square"
                    key={`${color}-${index}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {pixelPattern && !pixelError ? (
            <div className="mt-5 rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Matched bead colors
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    {pixelPattern.paletteName} is applied as a fixed bead color
                    card, so the preview no longer uses arbitrary RGB values.
                  </p>
                </div>
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                  {pixelPattern.matchedColors.length} colors used
                </span>
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
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
