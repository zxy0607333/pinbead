export type BeadPaletteColor = {
  id: string;
  brand: string;
  code: string;
  name: string;
  hex: string;
  family?: string;
};

export type BeadPalette = {
  id: string;
  brand: string;
  name: string;
  description: string;
  colors: BeadPaletteColor[];
};

type FixedMarketColor = {
  family: string;
  hex: string;
  name: string;
};

type HueSeriesConfig = {
  family: string;
  hueEnd: number;
  hueStart: number;
  lightnesses: number[];
  prefix: string;
  saturations: number[];
  count: number;
  wrapHue?: boolean;
};

const toneNames = [
  "Deep",
  "Dark",
  "Rich",
  "Classic",
  "Bright",
  "Light",
  "Soft",
  "Pale",
];

function normalizeHue(hue: number) {
  return ((hue % 360) + 360) % 360;
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const normalizedHue = normalizeHue(hue);
  const normalizedSaturation = saturation / 100;
  const normalizedLightness = lightness / 100;
  const chroma =
    (1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation;
  const hueSegment = normalizedHue / 60;
  const x = chroma * (1 - Math.abs((hueSegment % 2) - 1));
  const match = normalizedLightness - chroma / 2;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (hueSegment >= 0 && hueSegment < 1) {
    red = chroma;
    green = x;
  } else if (hueSegment >= 1 && hueSegment < 2) {
    red = x;
    green = chroma;
  } else if (hueSegment >= 2 && hueSegment < 3) {
    green = chroma;
    blue = x;
  } else if (hueSegment >= 3 && hueSegment < 4) {
    green = x;
    blue = chroma;
  } else if (hueSegment >= 4 && hueSegment < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const toHex = (channel: number) =>
    Math.round((channel + match) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function createMarketColor(
  color: FixedMarketColor,
  index: number,
): BeadPaletteColor {
  const codeNumber = String(index + 1).padStart(3, "0");

  return {
    id: `pinbead-market-${codeNumber}`,
    brand: "Pinbead",
    code: `P${index + 1}`,
    family: color.family,
    name: color.name,
    hex: color.hex,
  };
}

function createFixedColors(colors: FixedMarketColor[]) {
  return colors;
}

function createHueSeries(config: HueSeriesConfig): FixedMarketColor[] {
  return Array.from({ length: config.count }, (_, index) => {
    const progress = config.count === 1 ? 0 : index / (config.count - 1);
    let hueDelta = config.hueEnd - config.hueStart;

    if (config.wrapHue && Math.abs(hueDelta) > 180) {
      hueDelta += hueDelta > 0 ? -360 : 360;
    }

    const hue = config.hueStart + hueDelta * progress;
    const saturation = config.saturations[index % config.saturations.length];
    const lightness = config.lightnesses[index % config.lightnesses.length];
    const tone = toneNames[index % toneNames.length];
    const batch = Math.floor(index / toneNames.length) + 1;

    return {
      family: config.family,
      name: `${tone} ${config.prefix} ${batch}`,
      hex: hslToHex(hue, saturation, lightness),
    };
  });
}

const marketPaletteColorSeeds: FixedMarketColor[] = [
  ...createFixedColors([
    { family: "Neutral", name: "Black", hex: "#111111" },
    { family: "Neutral", name: "Soft Black", hex: "#252525" },
    { family: "Neutral", name: "Charcoal", hex: "#3c3f42" },
    { family: "Neutral", name: "Dark Gray", hex: "#565a5d" },
    { family: "Neutral", name: "Steel Gray", hex: "#70757a" },
    { family: "Neutral", name: "Medium Gray", hex: "#8a9094" },
    { family: "Neutral", name: "Warm Gray", hex: "#9c9991" },
    { family: "Neutral", name: "Light Gray", hex: "#b7bbbd" },
    { family: "Neutral", name: "Silver", hex: "#c7c9c8" },
    { family: "Neutral", name: "Pale Gray", hex: "#d8dcdb" },
    { family: "Neutral", name: "Frost", hex: "#e9eeee" },
    { family: "Neutral", name: "Soft White", hex: "#f5f4ef" },
    { family: "Neutral", name: "White", hex: "#fbfbf7" },
    { family: "Neutral", name: "Cream", hex: "#f2e8c7" },
    { family: "Neutral", name: "Ivory", hex: "#fff3d7" },
    { family: "Neutral", name: "Pearl White", hex: "#eee6dc" },
    { family: "Neutral", name: "Glow White", hex: "#eff4d2" },
    { family: "Neutral", name: "Clear Frost", hex: "#edf7ff" },
  ]),
  ...createHueSeries({
    family: "Red",
    hueStart: 348,
    hueEnd: 8,
    lightnesses: [26, 34, 43, 52, 62, 72],
    prefix: "Red",
    saturations: [78, 88, 66],
    count: 18,
    wrapHue: true,
  }),
  ...createHueSeries({
    family: "Orange",
    hueStart: 14,
    hueEnd: 35,
    lightnesses: [28, 36, 45, 54, 64, 74, 82, 48],
    prefix: "Orange",
    saturations: [82, 92, 70, 58],
    count: 16,
  }),
  ...createHueSeries({
    family: "Yellow",
    hueStart: 43,
    hueEnd: 60,
    lightnesses: [34, 42, 50, 60, 70, 80, 86, 54],
    prefix: "Yellow",
    saturations: [72, 88, 96, 58],
    count: 16,
  }),
  ...createHueSeries({
    family: "Green",
    hueStart: 82,
    hueEnd: 150,
    lightnesses: [22, 30, 38, 47, 58, 68],
    prefix: "Green",
    saturations: [50, 68, 82, 58],
    count: 24,
  }),
  ...createHueSeries({
    family: "Teal",
    hueStart: 158,
    hueEnd: 188,
    lightnesses: [24, 32, 42, 52, 64, 74],
    prefix: "Teal",
    saturations: [52, 70, 84],
    count: 18,
  }),
  ...createHueSeries({
    family: "Blue",
    hueStart: 195,
    hueEnd: 235,
    lightnesses: [24, 32, 42, 52, 64, 76],
    prefix: "Blue",
    saturations: [56, 76, 88, 64],
    count: 24,
  }),
  ...createHueSeries({
    family: "Purple",
    hueStart: 250,
    hueEnd: 286,
    lightnesses: [25, 34, 44, 54, 66],
    prefix: "Purple",
    saturations: [48, 66, 82, 58],
    count: 20,
  }),
  ...createHueSeries({
    family: "Pink",
    hueStart: 304,
    hueEnd: 342,
    lightnesses: [31, 40, 50, 60, 72],
    prefix: "Pink",
    saturations: [56, 74, 90, 64],
    count: 20,
  }),
  ...createHueSeries({
    family: "Brown",
    hueStart: 18,
    hueEnd: 38,
    lightnesses: [20, 28, 36, 45, 56, 68],
    prefix: "Brown",
    saturations: [28, 42, 55],
    count: 18,
  }),
  ...createFixedColors([
    { family: "Skin", name: "Porcelain Skin", hex: "#f8dccc" },
    { family: "Skin", name: "Fair Skin", hex: "#f0c8b5" },
    { family: "Skin", name: "Peach Skin", hex: "#e9ad94" },
    { family: "Skin", name: "Warm Peach", hex: "#d99072" },
    { family: "Skin", name: "Tan Skin", hex: "#bf765d" },
    { family: "Skin", name: "Caramel Skin", hex: "#a95f45" },
    { family: "Skin", name: "Amber Skin", hex: "#8f5039" },
    { family: "Skin", name: "Chestnut Skin", hex: "#744031" },
    { family: "Skin", name: "Deep Skin", hex: "#563126" },
    { family: "Skin", name: "Rosy Skin", hex: "#f0b3aa" },
    { family: "Skin", name: "Blush Skin", hex: "#f6c7c3" },
    { family: "Skin", name: "Sienna Skin", hex: "#9d5b43" },
  ]),
  ...createHueSeries({
    family: "Pastel",
    hueStart: 0,
    hueEnd: 330,
    lightnesses: [78, 82, 86, 88, 80, 84, 90],
    prefix: "Pastel",
    saturations: [38, 46, 54, 42],
    count: 14,
  }),
  ...createFixedColors([
    { family: "Neon", name: "Neon Red", hex: "#ff2851" },
    { family: "Neon", name: "Neon Orange", hex: "#ff7a00" },
    { family: "Neon", name: "Neon Yellow", hex: "#eaff00" },
    { family: "Neon", name: "Neon Green", hex: "#39ff14" },
    { family: "Neon", name: "Neon Cyan", hex: "#00f0ff" },
    { family: "Neon", name: "Neon Blue", hex: "#2f55ff" },
    { family: "Neon", name: "Neon Pink", hex: "#ff42cc" },
  ]),
];

const marketPaletteColors = marketPaletteColorSeeds.map((color, index) =>
  createMarketColor(color, index),
);

export const beadPalettes: BeadPalette[] = [
  {
    id: "pinbead-market-225",
    brand: "Pinbead",
    name: "Market 225 Palette",
    description:
      "A 225-color working palette inspired by large retail fuse bead assortments, grouped for pattern editing and photo conversion.",
    colors: marketPaletteColors,
  },
  {
    id: "pinbead-starter",
    brand: "Pinbead",
    name: "Starter Palette",
    description:
      "A balanced 32-color starter set for beginner patterns and photo conversions.",
    colors: [
      {
        id: "pinbead-onyx-black",
        brand: "Pinbead",
        code: "PB-01",
        name: "Onyx Black",
        hex: "#0f1110",
      },
      {
        id: "pinbead-charcoal",
        brand: "Pinbead",
        code: "PB-02",
        name: "Charcoal",
        hex: "#1d2421",
      },
      {
        id: "pinbead-stone-gray",
        brand: "Pinbead",
        code: "PB-03",
        name: "Stone Gray",
        hex: "#7b807b",
      },
      {
        id: "pinbead-cloud-gray",
        brand: "Pinbead",
        code: "PB-04",
        name: "Cloud Gray",
        hex: "#c9cbc7",
      },
      {
        id: "pinbead-soft-white",
        brand: "Pinbead",
        code: "PB-05",
        name: "Soft White",
        hex: "#f8f7f2",
      },
      {
        id: "pinbead-cocoa-brown",
        brand: "Pinbead",
        code: "PB-06",
        name: "Cocoa Brown",
        hex: "#6a4d38",
      },
      {
        id: "pinbead-sand-beige",
        brand: "Pinbead",
        code: "PB-07",
        name: "Sand Beige",
        hex: "#cda883",
      },
      {
        id: "pinbead-peach",
        brand: "Pinbead",
        code: "PB-08",
        name: "Peach",
        hex: "#f4c8b5",
      },
      {
        id: "pinbead-coral",
        brand: "Pinbead",
        code: "PB-09",
        name: "Coral",
        hex: "#d95d39",
      },
      {
        id: "pinbead-berry-red",
        brand: "Pinbead",
        code: "PB-10",
        name: "Berry Red",
        hex: "#c94a52",
      },
      {
        id: "pinbead-tangerine",
        brand: "Pinbead",
        code: "PB-11",
        name: "Tangerine",
        hex: "#e98b2a",
      },
      {
        id: "pinbead-marigold",
        brand: "Pinbead",
        code: "PB-12",
        name: "Marigold",
        hex: "#e7b548",
      },
      {
        id: "pinbead-lemon-cream",
        brand: "Pinbead",
        code: "PB-13",
        name: "Lemon Cream",
        hex: "#f0de79",
      },
      {
        id: "pinbead-mint",
        brand: "Pinbead",
        code: "PB-14",
        name: "Mint",
        hex: "#b5dfb5",
      },
      {
        id: "pinbead-meadow-green",
        brand: "Pinbead",
        code: "PB-15",
        name: "Meadow Green",
        hex: "#75b06d",
      },
      {
        id: "pinbead-forest-green",
        brand: "Pinbead",
        code: "PB-16",
        name: "Forest Green",
        hex: "#24786a",
      },
      {
        id: "pinbead-aqua",
        brand: "Pinbead",
        code: "PB-17",
        name: "Aqua",
        hex: "#77cfc4",
      },
      {
        id: "pinbead-sky-blue",
        brand: "Pinbead",
        code: "PB-18",
        name: "Sky Blue",
        hex: "#77b7f2",
      },
      {
        id: "pinbead-ocean-blue",
        brand: "Pinbead",
        code: "PB-19",
        name: "Ocean Blue",
        hex: "#4a8fd8",
      },
      {
        id: "pinbead-navy-ink",
        brand: "Pinbead",
        code: "PB-20",
        name: "Navy Ink",
        hex: "#2f4f7f",
      },
      {
        id: "pinbead-lavender",
        brand: "Pinbead",
        code: "PB-21",
        name: "Lavender",
        hex: "#b6a5dd",
      },
      {
        id: "pinbead-plum",
        brand: "Pinbead",
        code: "PB-22",
        name: "Plum",
        hex: "#7a5aa8",
      },
      {
        id: "pinbead-rose-petal",
        brand: "Pinbead",
        code: "PB-23",
        name: "Rose Petal",
        hex: "#d97aa7",
      },
      {
        id: "pinbead-warm-apricot",
        brand: "Pinbead",
        code: "PB-24",
        name: "Warm Apricot",
        hex: "#f0a575",
      },
      {
        id: "pinbead-brick-red",
        brand: "Pinbead",
        code: "PB-25",
        name: "Brick Red",
        hex: "#a64438",
      },
      {
        id: "pinbead-buttercream",
        brand: "Pinbead",
        code: "PB-26",
        name: "Buttercream",
        hex: "#fff0b0",
      },
      {
        id: "pinbead-moss-olive",
        brand: "Pinbead",
        code: "PB-27",
        name: "Moss Olive",
        hex: "#7d8a43",
      },
      {
        id: "pinbead-sage-mist",
        brand: "Pinbead",
        code: "PB-28",
        name: "Sage Mist",
        hex: "#9fc8a8",
      },
      {
        id: "pinbead-deep-teal",
        brand: "Pinbead",
        code: "PB-29",
        name: "Deep Teal",
        hex: "#1f6368",
      },
      {
        id: "pinbead-powder-blue",
        brand: "Pinbead",
        code: "PB-30",
        name: "Powder Blue",
        hex: "#bfd5f2",
      },
      {
        id: "pinbead-violet-blue",
        brand: "Pinbead",
        code: "PB-31",
        name: "Violet Blue",
        hex: "#5b67c8",
      },
      {
        id: "pinbead-blush-pink",
        brand: "Pinbead",
        code: "PB-32",
        name: "Blush Pink",
        hex: "#efb8cf",
      },
    ],
  },
];

export const defaultBeadPaletteId = "pinbead-market-225";
