import { calculateTasteDNA } from "./taste-dna";
import type { Follow, Recommendation, Restaurant, Review, User } from "./types";

export function getRecommendations(
  userId: string,
  reviews: Review[],
  restaurants: Restaurant[],
  follows: Follow[],
  limit = 5,
  user?: User | null,
): Recommendation[] {
  const myReviews = reviews.filter((r) => r.userId === userId);
  const reviewed = new Set(myReviews.map((r) => r.restaurantId));
  const unreviewed = restaurants.filter((r) => !reviewed.has(r.id));
  if (!unreviewed.length) return [];

  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const dna = calculateTasteDNA(userId, reviews, [], restaurants);
  const quizCuisines = user?.favoriteCuisines ?? [];
  const topCuisines = [
    ...quizCuisines,
    ...dna.favoriteCuisines.map((c) => c.cuisine),
  ].filter((c, i, arr) => arr.indexOf(c) === i).slice(0, 4);

  const lovedByCuisine = new Map<string, { name: string; rating: number }>();
  myReviews.forEach((rev) => {
    const rest = rMap.get(rev.restaurantId);
    if (!rest) return;
    const prev = lovedByCuisine.get(rest.cuisine);
    if (!prev || rev.rating > prev.rating) {
      lovedByCuisine.set(rest.cuisine, { name: rest.name, rating: rev.rating });
    }
  });

  const friendIds = follows.filter((f) => f.followerId === userId).map((f) => f.followingId);
  const friendRestaurants = new Set(
    reviews.filter((r) => friendIds.includes(r.userId) && r.rating >= 8.5).map((r) => r.restaurantId),
  );

  const tagAffinity = new Map<string, number>();
  myReviews.forEach((r) => r.tags.forEach((t) => tagAffinity.set(t, (tagAffinity.get(t) ?? 0) + 1)));

  return unreviewed
    .map((restaurant) => {
      let score = 40;
      const reasons: string[] = [];

      if (topCuisines.includes(restaurant.cuisine)) {
        score += quizCuisines.includes(restaurant.cuisine) ? 22 : 16;
        const loved = lovedByCuisine.get(restaurant.cuisine);
        if (loved && loved.rating >= 8) {
          reasons.push(`you loved ${loved.name}`);
        } else if (quizCuisines.includes(restaurant.cuisine)) {
          reasons.push(`you picked ${restaurant.cuisine} in your taste quiz`);
        } else {
          reasons.push(`you rate ${restaurant.cuisine} highly`);
        }
      }

      if (dna.preferredPriceLevel && restaurant.priceLevel === dna.preferredPriceLevel) {
        score += 12;
        reasons.push("it matches your usual price range");
      }

      if (friendRestaurants.has(restaurant.id)) {
        score += 15;
        reasons.push("friends rated it 8.5+");
      }

      if (dna.dateNightScore > 30 && restaurant.priceLevel >= 3) score += 6;
      if (dna.hiddenGemScore > 40 && restaurant.priceLevel <= 2) score += 8;

      const reason =
        reasons.length > 0
          ? `Because you loved similar spots — ${reasons.slice(0, 2).join(" and ")}.`
          : quizCuisines.length > 0
            ? `Picked for your taste quiz favorites (${quizCuisines.slice(0, 2).join(", ")}).`
            : "Based on your taste profile.";

      return {
        restaurant,
        confidence: Math.min(95, score),
        reason,
      };
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}
