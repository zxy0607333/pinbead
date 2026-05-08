"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent } from "react";

const sizes = ["16 x 16", "24 x 24", "32 x 32", "48 x 48"];
const colorCounts = ["8 colors", "16 colors", "24 colors", "32 colors"];
const palettes = ["Pinbead starter", "Perler", "Hama", "Artkal"];
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

export function HomePatternMaker() {
  const fileInputId = useId();
  const previewRequestId = useRef(0);
  const [preview, setPreview] = useState<ImagePreview | null>(null);
  const [error, setError] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

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
