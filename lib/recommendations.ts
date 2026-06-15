import { calculateTasteDNA } from "./taste-dna";
import type { Follow, Recommendation, Restaurant, Review } from "./types";

export function getRecommendations(
  userId: string,
  reviews: Review[],
  restaurants: Restaurant[],
  follows: Follow[],
  limit = 5
): Recommendation[] {
  const reviewed = new Set(reviews.filter((r) => r.userId === userId).map((r) => r.restaurantId));
  const unreviewed = restaurants.filter((r) => !reviewed.has(r.id));
  if (!unreviewed.length) return [];
  const dna = calculateTasteDNA(userId, reviews, [], restaurants);
  const topCuisines = dna.favoriteCuisines.slice(0, 3).map((c) => c.cuisine);
  const friendIds = follows.filter((f) => f.followerId === userId).map((f) => f.followingId);
  const friendRestaurants = new Set(reviews.filter((r) => friendIds.includes(r.userId) && r.rating >= 8.5).map((r) => r.restaurantId));

  return unreviewed.map((restaurant) => {
    let score = 50;
    const reasons: string[] = [];
    if (topCuisines.includes(restaurant.cuisine)) {
      score += 20;
      reasons.push(`you rated similar ${restaurant.cuisine} spots highly`);
    }
    if (dna.preferredPriceLevel && restaurant.priceLevel === dna.preferredPriceLevel) {
      score += 12;
      reasons.push("it matches your price preference");
    }
    if (friendRestaurants.has(restaurant.id)) {
      score += 15;
      reasons.push("your friends loved it");
    }
    if (dna.hiddenGemScore > 40 && restaurant.priceLevel <= 2) score += 8;
    return {
      restaurant,
      confidence: Math.min(95, score),
      reason: reasons.length ? `You may like this because ${reasons.slice(0, 2).join(" and ")}.` : "Based on your taste profile.",
    };
  }).sort((a, b) => b.confidence - a.confidence).slice(0, limit);
}
