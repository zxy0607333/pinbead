import { beadPalettes, type BeadPalette, type BeadPaletteColor } from "@/data/bead-palettes";

type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

type LabColor = {
  l: number;
  a: number;
  b: number;
};

export type PreparedBeadPaletteColor = BeadPaletteColor & {
  lab: LabColor;
};

export type PreparedBeadPalette = Omit<BeadPalette, "colors"> & {
  colors: PreparedBeadPaletteColor[];
};

function normalizeHex(hex: string) {
  return hex.replace("#", "");
}

function hexToRgb(hex: string): RgbColor {
  const normalizedHex = normalizeHex(hex);

  if (normalizedHex.length !== 6) {
    throw new Error(`Unsupported hex color: ${hex}`);
  }

  return {
    red: Number.parseInt(normalizedHex.slice(0, 2), 16),
    green: Number.parseInt(normalizedHex.slice(2, 4), 16),
    blue: Number.parseInt(normalizedHex.slice(4, 6), 16),
  };
}

function srgbToLinear(channel: number) {
  const normalizedChannel = channel / 255;

  if (normalizedChannel <= 0.04045) {
    return normalizedChannel / 12.92;
  }

  return ((normalizedChannel + 0.055) / 1.055) ** 2.4;
}

function rgbToXyz(red: number, green: number, blue: number) {
  const linearRed = srgbToLinear(red);
  const linearGreen = srgbToLinear(green);
  const linearBlue = srgbToLinear(blue);

  return {
    x:
      (linearRed * 0.4124564 +
        linearGreen * 0.3575761 +
        linearBlue * 0.1804375) *
      100,
    y:
      (linearRed * 0.2126729 +
        linearGreen * 0.7151522 +
        linearBlue * 0.072175) *
      100,
    z:
      (linearRed * 0.0193339 +
        linearGreen * 0.119192 +
        linearBlue * 0.9503041) *
      100,
  };
}

function xyzToLab(x: number, y: number, z: number): LabColor {
  const referenceWhite = {
    x: 95.047,
    y: 100,
    z: 108.883,
  };

  const transform = (value: number) => {
    if (value > 0.008856) {
      return value ** (1 / 3);
    }

    return 7.787 * value + 16 / 116;
  };

  const transformedX = transform(x / referenceWhite.x);
  const transformedY = transform(y / referenceWhite.y);
  const transformedZ = transform(z / referenceWhite.z);

  return {
    l: 116 * transformedY - 16,
    a: 500 * (transformedX - transformedY),
    b: 200 * (transformedY - transformedZ),
  };
}

export function rgbToLab(red: number, green: number, blue: number): LabColor {
  const xyzColor = rgbToXyz(red, green, blue);

  return xyzToLab(xyzColor.x, xyzColor.y, xyzColor.z);
}

function hexToLab(hex: string) {
  const rgbColor = hexToRgb(hex);

  return rgbToLab(rgbColor.red, rgbColor.green, rgbColor.blue);
}

function getLabDistance(leftColor: LabColor, rightColor: LabColor) {
  const deltaL = leftColor.l - rightColor.l;
  const deltaA = leftColor.a - rightColor.a;
  const deltaB = leftColor.b - rightColor.b;

  return Math.sqrt(
    deltaL * deltaL + deltaA * deltaA + deltaB * deltaB,
  );
}

function preparePalette(palette: BeadPalette): PreparedBeadPalette {
  return {
    ...palette,
    colors: palette.colors.map((color) => ({
      ...color,
      lab: hexToLab(color.hex),
    })),
  };
}

export const preparedBeadPalettes = beadPalettes.map(preparePalette);

export const preparedBeadPaletteMap = new Map(
  preparedBeadPalettes.map((palette) => [palette.id, palette]),
);

export function matchRgbToBeadColor(
  red: number,
  green: number,
  blue: number,
  palette: PreparedBeadPalette,
) {
  const sourceColor = rgbToLab(red, green, blue);
  let closestColor = palette.colors[0];
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const paletteColor of palette.colors) {
    const colorDistance = getLabDistance(sourceColor, paletteColor.lab);

    if (colorDistance < closestDistance) {
      closestColor = paletteColor;
      closestDistance = colorDistance;
    }
  }

  return {
    color: closestColor,
    distance: closestDistance,
  };
}
