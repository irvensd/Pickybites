import type { Cuisine } from "@/lib/types";

const TYPE_MAP: Record<string, Cuisine> = {
  italian_restaurant: "Italian",
  japanese_restaurant: "Japanese",
  sushi_restaurant: "Japanese",
  ramen_restaurant: "Japanese",
  mexican_restaurant: "Mexican",
  thai_restaurant: "Thai",
  indian_restaurant: "Indian",
  french_restaurant: "French",
  american_restaurant: "American",
  hamburger_restaurant: "American",
  steak_house: "American",
  korean_restaurant: "Korean",
  chinese_restaurant: "Chinese",
  mediterranean_restaurant: "Mediterranean",
  greek_restaurant: "Greek",
  spanish_restaurant: "Spanish",
  vietnamese_restaurant: "Vietnamese",
  caribbean_restaurant: "Caribbean",
  seafood_restaurant: "American",
  pizza_restaurant: "Italian",
  cafe: "American",
  bar: "American",
  restaurant: "American",
};

export function cuisineFromGoogleTypes(types: string[] = [], primaryType?: string): Cuisine {
  if (primaryType && TYPE_MAP[primaryType]) return TYPE_MAP[primaryType];
  for (const t of types) {
    if (TYPE_MAP[t]) return TYPE_MAP[t];
  }
  return "American";
}

export function priceLevelFromGoogle(level?: string | number | null): 1 | 2 | 3 | 4 {
  if (level == null || level === "") return 2;

  if (typeof level === "number" || /^\d+$/.test(String(level))) {
    const n = Number(level);
    switch (n) {
      case 0:
        return 2;
      case 1:
        return 1;
      case 2:
        return 1;
      case 3:
        return 2;
      case 4:
        return 3;
      case 5:
        return 4;
      default:
        return 2;
    }
  }

  switch (String(level)) {
    case "PRICE_LEVEL_FREE":
    case "PRICE_LEVEL_INEXPENSIVE":
      return 1;
    case "PRICE_LEVEL_MODERATE":
      return 2;
    case "PRICE_LEVEL_EXPENSIVE":
      return 3;
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return 4;
    default:
      return 2;
  }
}

export function cityFromAddress(address: string): string {
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 3) {
    return parts[parts.length - 3] ?? parts[1] ?? "";
  }
  if (parts.length >= 2) return parts[parts.length - 2] ?? "";
  return parts[0] ?? "";
}

