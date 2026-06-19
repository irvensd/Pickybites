import type { TasteDNA } from "./types";

export type TastePersonality =
  | "Explorer"
  | "Comfort Food Lover"
  | "Hidden Gem Hunter"
  | "Date Night Expert"
  | "Budget Foodie"
  | "Luxury Taster"
  | "Beginner Explorer";

export function formatScoreMetric(
  score: number,
  reviewCount: number,
  kind: "adventure" | "hidden-gem" | "generic" = "generic",
): string {
  if (reviewCount === 0) return "Calculating...";
  if (reviewCount < 3) {
    if (kind === "adventure") return "Beginner Explorer";
    if (kind === "hidden-gem") return "Not enough reviews";
    return "Not enough reviews";
  }
  if (score === 0) {
    if (kind === "adventure") return "Beginner Explorer";
    return "Not enough reviews";
  }
  return String(score);
}

export function getTastePersonality(dna: TasteDNA, reviewCount: number, quizCuisines: string[]): TastePersonality {
  if (reviewCount === 0 && quizCuisines.length > 0) return "Beginner Explorer";
  if (reviewCount < 2) return "Beginner Explorer";

  const scores: { label: TastePersonality; value: number }[] = [
    { label: "Explorer", value: dna.adventureScore },
    { label: "Hidden Gem Hunter", value: dna.hiddenGemScore },
    { label: "Date Night Expert", value: dna.dateNightScore },
    { label: "Luxury Taster", value: dna.luxuryScore },
    { label: "Budget Foodie", value: dna.preferredPriceLevel != null && dna.preferredPriceLevel <= 2 ? 70 : 20 },
  ];

  if (dna.favoriteCuisines.length === 1 && dna.adventureScore < 30) {
    return "Comfort Food Lover";
  }

  const top = scores.sort((a, b) => b.value - a.value)[0];
  if (!top || top.value < 15) return reviewCount < 3 ? "Beginner Explorer" : "Explorer";
  return top.label;
}

export function getFirstTasteLabel(dna: TasteDNA, reviewCount: number): string {
  return getTastePersonality(dna, reviewCount, []);
}
