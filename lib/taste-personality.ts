import type { TasteDNA } from "./types";

export const FOOD_PERSONALITIES = [
  "Hidden Gem Hunter",
  "Comfort Food Loyalist",
  "Spice Chaser",
  "Date Night Curator",
  "Neighborhood Scout",
  "Burger Specialist",
  "World Explorer",
  "Fine Dining Explorer",
] as const;

export type FoodPersonality = (typeof FOOD_PERSONALITIES)[number];
export type TastePersonalityLabel = FoodPersonality | "New Explorer";

export type TastePersonalityProfile = {
  label: TastePersonalityLabel;
  headline: string;
  explanation: string;
};

const EXPLANATIONS: Record<FoodPersonality, string> = {
  "Hidden Gem Hunter":
    "You skip the hype and hunt for under-the-radar spots — low review counts and Hidden Gem tags are your compass.",
  "Comfort Food Loyalist":
    "You know what you love and stick with it. Your visits cluster around a few go-to cuisines you trust.",
  "Spice Chaser":
    "Heat is a feature, not a bug. Indian, Thai, Mexican, Korean, and Caribbean kitchens keep you coming back.",
  "Date Night Curator":
    "Ambiance matters. You pick restaurants built for lingering — date-night tags and upscale vibes show up often.",
  "Neighborhood Scout":
    "You eat local. Most of your visits stay in one city, exploring casual corners and familiar streets.",
  "Burger Specialist":
    "All-American comfort is your lane — burgers, diners, and casual American spots dominate your timeline.",
  "World Explorer":
    "Variety is the point. You spread reviews across many cuisines and rarely eat the same flavor twice.",
  "Fine Dining Explorer":
    "You invest in the experience — higher price points, polished service, and special-occasion energy.",
};

type PersonalityCandidate = {
  label: FoodPersonality;
  score: number;
  qualifies: boolean;
};

function buildCandidates(dna: TasteDNA, reviewCount: number): PersonalityCandidate[] {
  const avgPrice = dna.preferredPriceLevel ?? 2;
  const fineDiningVisits = dna.fineDiningShare ?? 0;

  return [
    {
      label: "Hidden Gem Hunter",
      score: dna.hiddenGemScore,
      qualifies: dna.hiddenGemScore >= 45,
    },
    {
      label: "Comfort Food Loyalist",
      score: (100 - dna.adventureScore) * 0.4 + dna.topCuisineShare * 0.6,
      qualifies:
        dna.adventureScore < 45 &&
        (dna.topCuisineShare >= 35 || (dna.cuisinesTried <= 2 && dna.topCuisineShare >= 28)),
    },
    {
      label: "Spice Chaser",
      score: dna.spicyCuisineShare,
      qualifies: dna.spicyCuisineShare >= 40,
    },
    {
      label: "Date Night Curator",
      score: dna.dateNightScore + (dna.luxuryScore >= 50 ? 15 : 0),
      qualifies:
        dna.dateNightScore >= 35 ||
        (dna.dateNightScore >= 22 && avgPrice >= 3),
    },
    {
      label: "Neighborhood Scout",
      score: dna.cityConcentration * 0.65 + dna.casualTagShare * 0.35,
      qualifies:
        reviewCount >= 3 &&
        dna.cityConcentration >= 60 &&
        (dna.casualTagShare >= 20 || dna.hiddenGemScore >= 18),
    },
    {
      label: "Burger Specialist",
      score: dna.americanShare,
      qualifies: dna.americanShare >= 35,
    },
    {
      label: "World Explorer",
      score: dna.adventureScore + (dna.cuisinesTried >= 6 ? 18 : dna.cuisinesTried >= 4 ? 8 : 0),
      qualifies:
        dna.adventureScore >= 55 ||
        dna.cuisinesTried >= 6 ||
        (dna.cuisinesTried >= 4 && dna.topCuisineShare <= 28),
    },
    {
      label: "Fine Dining Explorer",
      score: dna.luxuryScore + fineDiningVisits * 0.35,
      qualifies: dna.luxuryScore >= 55 || fineDiningVisits >= 25,
    },
  ];
}

export function resolveTastePersonality(
  dna: TasteDNA,
  reviewCount: number,
): TastePersonalityProfile {
  if (reviewCount < 2) {
    return {
      label: "New Explorer",
      headline: "You are a New Explorer",
      explanation: "Write a few more reviews and your food personality will take shape automatically.",
    };
  }

  const candidates = buildCandidates(dna, reviewCount);
  const qualified = candidates.filter((c) => c.qualifies);

  const pool = qualified.length > 0 ? qualified : candidates;
  const winner = [...pool].sort((a, b) => b.score - a.score)[0];
  const label = winner.label;

  return {
    label,
    headline: `You are a ${label}`,
    explanation: EXPLANATIONS[label],
  };
}

/** @deprecated Use resolveTastePersonality or dna.personality */
export type TastePersonality = TastePersonalityLabel;

export function formatScoreMetric(
  score: number,
  reviewCount: number,
  kind: "adventure" | "hidden-gem" | "generic" = "generic",
): string {
  if (reviewCount === 0) return "Calculating...";
  if (reviewCount < 3) {
    if (kind === "adventure") return "Building profile";
    if (kind === "hidden-gem") return "Not enough reviews";
    return "Not enough reviews";
  }
  if (score === 0) {
    if (kind === "adventure") return "Building profile";
    return "Not enough reviews";
  }
  return String(score);
}

export function getTastePersonality(
  dna: TasteDNA,
  reviewCount: number,
  _quizCuisines: string[] = [],
): TastePersonalityLabel {
  return dna.personality?.label ?? resolveTastePersonality(dna, reviewCount).label;
}

export function getFirstTasteLabel(dna: TasteDNA, reviewCount: number): string {
  return resolveTastePersonality(dna, reviewCount).label;
}

export function resolveFavoriteRestaurantType(dna: TasteDNA): string {
  const types: { label: string; score: number }[] = [
    { label: "Fine Dining", score: dna.luxuryScore },
    { label: "Casual Eatery", score: dna.casualTagShare + (dna.preferredPriceLevel != null && dna.preferredPriceLevel <= 2 ? 35 : 10) },
    { label: "Neighborhood Spot", score: dna.hiddenGemScore * 0.6 + dna.cityConcentration * 0.4 },
    { label: "Date Night Spot", score: dna.dateNightScore },
    { label: "Quick Bite", score: dna.preferredPriceLevel === 1 ? 85 : 0 },
  ];

  const top = types.sort((a, b) => b.score - a.score)[0];
  if (!top || top.score < 25) return "Mixed Style";
  return top.label;
}
