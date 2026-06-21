import type { Cuisine, Restaurant, Review } from "./types";
import { getReviewOverallRating } from "./review-scores";
import { calculateTasteDNA } from "./taste-dna";

export type TasteMatchFactors = {
  cuisine: number;
  ratings: number;
  budget: number;
  adventure: number;
  hiddenGem: number;
  overlap: number;
};

export type TasteMatchResult = {
  percent: number;
  explanations: string[];
  detail?: string;
  sharedRestaurants: number;
  sharedCuisines: number;
  factors: TasteMatchFactors;
};

const WEIGHTS = {
  overlap: 0.3,
  cuisine: 0.25,
  ratings: 0.15,
  budget: 0.15,
  adventure: 0.1,
  hiddenGem: 0.05,
} as const;

function topCuisines(userId: string, reviews: Review[], restaurants: Restaurant[], limit = 3): Cuisine[] {
  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const counts = new Map<Cuisine, number>();
  reviews
    .filter((r) => r.userId === userId)
    .forEach((r) => {
      const c = rMap.get(r.restaurantId)?.cuisine;
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([c]) => c);
}

function cuisineLabel(cuisine: Cuisine): string {
  if (cuisine === "Caribbean") return "Jamaican";
  return cuisine;
}

function buildExplanations(
  aId: string,
  bId: string,
  reviews: Review[],
  restaurants: Restaurant[],
  factors: TasteMatchFactors,
  sharedRestaurants: number,
  sharedCuisineList: Cuisine[],
): string[] {
  const explanations: string[] = [];
  const dnaA = calculateTasteDNA(aId, reviews, [], restaurants);
  const dnaB = calculateTasteDNA(bId, reviews, [], restaurants);

  const topA = topCuisines(aId, reviews, restaurants, 3);
  const topB = topCuisines(bId, reviews, restaurants, 3);
  const sharedTop = topA.filter((c) => topB.includes(c));

  if (sharedTop.length > 0 && factors.cuisine >= 55) {
    const label = cuisineLabel(sharedTop[0]);
    explanations.push(
      sharedTop.length === 1
        ? `You both love ${label} food.`
        : `You both gravitate toward ${sharedTop.map(cuisineLabel).join(", ")}.`,
    );
  } else if (sharedCuisineList.length > 0 && factors.cuisine >= 45) {
    explanations.push(
      `You share a taste for ${sharedCuisineList.slice(0, 2).map(cuisineLabel).join(" and ")}.`,
    );
  }

  if (dnaA.hiddenGemScore >= 35 && dnaB.hiddenGemScore >= 35 && factors.hiddenGem >= 50) {
    explanations.push("You both rate hidden gems highly.");
  }

  const budgetA = dnaA.preferredPriceLevel;
  const budgetB = dnaB.preferredPriceLevel;
  if (budgetA && budgetB && factors.budget >= 70) {
    if (budgetA <= 2 && budgetB <= 2) {
      explanations.push("You prefer budget-friendly restaurants.");
    } else if (budgetA >= 3 && budgetB >= 3) {
      explanations.push("You both splurge on upscale dining.");
    } else {
      explanations.push("Your budget preferences align.");
    }
  }

  if (sharedRestaurants > 0 && factors.overlap >= 60) {
    explanations.push(
      `You've rated ${sharedRestaurants} shared restaurant${sharedRestaurants === 1 ? "" : "s"} similarly.`,
    );
  }

  if (factors.adventure >= 65) {
    explanations.push("Your adventure levels match — you explore at a similar pace.");
  }

  if (factors.ratings >= 75) {
    explanations.push("You give similar ratings overall.");
  }

  if (explanations.length === 0 && sharedRestaurants > 0) {
    explanations.push(`Based on ${sharedRestaurants} shared spot${sharedRestaurants === 1 ? "" : "s"}.`);
  }

  return explanations.slice(0, 3);
}

export function calculateTasteMatch(
  a: string,
  b: string,
  reviews: Review[],
  restaurants: Restaurant[],
): number {
  return computeTasteMatch(a, b, reviews, restaurants).percent;
}

export function getTasteMatchDetails(
  a: string,
  b: string,
  reviews: Review[],
  restaurants: Restaurant[],
): TasteMatchResult {
  return computeTasteMatch(a, b, reviews, restaurants);
}

function computeTasteMatch(
  a: string,
  b: string,
  reviews: Review[],
  restaurants: Restaurant[],
): TasteMatchResult {
  const empty: TasteMatchResult = {
    percent: 0,
    explanations: [],
    sharedRestaurants: 0,
    sharedCuisines: 0,
    factors: { cuisine: 0, ratings: 0, budget: 0, adventure: 0, hiddenGem: 0, overlap: 0 },
  };

  const ra = reviews.filter((r) => r.userId === a);
  const rb = reviews.filter((r) => r.userId === b);
  if (!ra.length || !rb.length) return empty;

  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const dnaA = calculateTasteDNA(a, reviews, [], restaurants);
  const dnaB = calculateTasteDNA(b, reviews, [], restaurants);

  const ratingsA = new Map(ra.map((r) => [r.restaurantId, getReviewOverallRating(r)]));
  const sharedReviews = rb.filter((r) => ratingsA.has(r.restaurantId));
  const sharedRestaurants = sharedReviews.length;

  let overlapScore = 0;
  if (sharedReviews.length > 0) {
    const avgDiff =
      sharedReviews.reduce(
        (s, r) => s + Math.abs(ratingsA.get(r.restaurantId)! - getReviewOverallRating(r)),
        0,
      ) / sharedReviews.length;
    overlapScore = Math.max(0, 100 - avgDiff * 12);
    overlapScore = Math.min(100, overlapScore + Math.min(15, sharedReviews.length * 4));
  }

  const cuisinesA = new Set(ra.map((r) => rMap.get(r.restaurantId)?.cuisine).filter(Boolean) as Cuisine[]);
  const cuisinesB = new Set(rb.map((r) => rMap.get(r.restaurantId)?.cuisine).filter(Boolean) as Cuisine[]);
  const sharedCuisineList = [...cuisinesA].filter((c) => cuisinesB.has(c));
  const sharedCuisines = sharedCuisineList.length;

  const topA = topCuisines(a, reviews, restaurants, 3);
  const topB = topCuisines(b, reviews, restaurants, 3);
  const sharedTopCount = topA.filter((c) => topB.includes(c)).length;
  const cuisineOverlapRatio = sharedCuisines / Math.max(cuisinesA.size, cuisinesB.size, 1);
  const cuisineScore = Math.min(
    100,
    sharedTopCount * 28 + cuisineOverlapRatio * 45 + (sharedCuisines > 0 ? 15 : 0),
  );

  const avgA = ra.reduce((s, r) => s + getReviewOverallRating(r), 0) / ra.length;
  const avgB = rb.reduce((s, r) => s + getReviewOverallRating(r), 0) / rb.length;
  const ratingsScore = Math.max(0, 100 - Math.abs(avgA - avgB) * 14);

  let budgetScore = 50;
  if (dnaA.preferredPriceLevel && dnaB.preferredPriceLevel) {
    const diff = Math.abs(dnaA.preferredPriceLevel - dnaB.preferredPriceLevel);
    budgetScore = diff === 0 ? 100 : diff === 1 ? 72 : diff === 2 ? 45 : 20;
  }

  const adventureScore = Math.max(0, 100 - Math.abs(dnaA.adventureScore - dnaB.adventureScore) * 1.2);

  const hiddenGemScore = Math.min(
    100,
    (dnaA.hiddenGemScore + dnaB.hiddenGemScore) / 2 +
      (Math.abs(dnaA.hiddenGemScore - dnaB.hiddenGemScore) < 25 ? 15 : 0),
  );

  const factors: TasteMatchFactors = {
    overlap: Math.round(overlapScore),
    cuisine: Math.round(cuisineScore),
    ratings: Math.round(ratingsScore),
    budget: Math.round(budgetScore),
    adventure: Math.round(adventureScore),
    hiddenGem: Math.round(hiddenGemScore),
  };

  const weighted =
    factors.overlap * WEIGHTS.overlap +
    factors.cuisine * WEIGHTS.cuisine +
    factors.ratings * WEIGHTS.ratings +
    factors.budget * WEIGHTS.budget +
    factors.adventure * WEIGHTS.adventure +
    factors.hiddenGem * WEIGHTS.hiddenGem;

  const percent = Math.min(99, Math.max(0, Math.round(weighted)));
  const explanations = buildExplanations(a, b, reviews, restaurants, factors, sharedRestaurants, sharedCuisineList);

  const detail =
    explanations[0] ??
    (sharedRestaurants > 0
      ? `Based on ${sharedRestaurants} shared spot${sharedRestaurants === 1 ? "" : "s"}`
      : sharedCuisines > 0
        ? `Based on ${sharedCuisines} shared cuisine${sharedCuisines === 1 ? "" : "s"}`
        : undefined);

  return {
    percent,
    explanations,
    detail,
    sharedRestaurants,
    sharedCuisines,
    factors,
  };
}

export function sortUsersByTasteMatch(
  currentUserId: string,
  userIds: string[],
  reviews: Review[],
  restaurants: Restaurant[],
): { userId: string; match: TasteMatchResult }[] {
  return userIds
    .map((userId) => ({
      userId,
      match: getTasteMatchDetails(currentUserId, userId, reviews, restaurants),
    }))
    .sort((a, b) => b.match.percent - a.match.percent);
}
