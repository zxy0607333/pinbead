import {
  matchRgbToBeadColor,
  reduceMatchedBeadColors,
  type PreparedBeadPalette,
  type PreparedBeadPaletteColor,
} from "@/lib/bead-color-matching";
import { createPattern, type PinbeadPattern } from "@/lib/pattern/pattern-model";

export const acceptedImageTypes = ["image/png", "image/jpeg", "image/webp"];
export const maxImageFileSize = 15 * 1024 * 1024;

const maxInputPixels = 36_000_000;
const previewMaxSize = 960;

export type ImageCropMode = "square" | "original";

export type ImagePreview = {
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

export type ImageDraftPattern = PatternSize & {
  cells: string[];
  matchedColors: MatchedPatternColor[];
  paletteId: string;
  paletteName: string;
  pattern: PinbeadPattern;
  selectedColorLimit: number;
  effectiveColorLimit: number;
  originalColorCount: number;
};

export function getPatternSize(
  sourceWidth: number | undefined,
  sourceHeight: number | undefined,
  maxSide: number,
  cropMode: ImageCropMode,
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
  cropMode: ImageCropMode,
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

export function waitForNextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

export async function createImagePreview(file: File): Promise<ImagePreview> {
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
    context.drawImage(
      decoded.image,
      0,
      0,
      previewSize.width,
      previewSize.height,
    );

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

export async function createImageDraftPattern(
  imageUrl: string,
  patternSize: PatternSize,
  cropMode: ImageCropMode,
  palette: PreparedBeadPalette,
  maxColors: number,
): Promise<ImageDraftPattern> {
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
    const matchedColorCache = new Map<string, PreparedBeadPaletteColor>();
    const matchedColorIds: string[] = [];
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

      matchedColorIds.push(matchedColor.id);
    }

    const reducedPattern = reduceMatchedBeadColors(
      matchedColorIds,
      palette,
      maxColors,
    );
    const pattern = createPattern({
      width: patternSize.width,
      height: patternSize.height,
      paletteId: palette.id,
      source: "image-draft",
      title: "Image draft",
      cells: reducedPattern.colorIds,
    });
    const cells = reducedPattern.colorIds.map((colorId) => {
      const matchedColor = paletteColorsById.get(colorId);

      if (!matchedColor) {
        throw new Error("This bead palette could not be applied.");
      }

      return matchedColor.hex;
    });
    const matchedColors = reducedPattern.matchedColors.map(
      ({ color: matchedColor, count }) => {
        return {
          id: matchedColor.id,
          brand: matchedColor.brand,
          code: matchedColor.code,
          name: matchedColor.name,
          hex: matchedColor.hex,
          count,
        };
      },
    );

    return {
      width: patternSize.width,
      height: patternSize.height,
      cells,
      matchedColors,
      paletteId: palette.id,
      paletteName: `${palette.brand} ${palette.name}`,
      pattern,
      selectedColorLimit: maxColors,
      effectiveColorLimit: reducedPattern.effectiveMaxColors,
      originalColorCount: reducedPattern.originalUsedColorCount,
    };
  } finally {
    decoded.close?.();
  }
}
