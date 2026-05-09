export type BeadPaletteColor = {
  id: string;
  brand: string;
  code: string;
  name: string;
  hex: string;
};

export type BeadPalette = {
  id: string;
  brand: string;
  name: string;
  description: string;
  colors: BeadPaletteColor[];
};

export const beadPalettes: BeadPalette[] = [
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

export const defaultBeadPaletteId = beadPalettes[0]?.id ?? "pinbead-starter";
