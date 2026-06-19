import { calculateTasteDNA } from "./taste-dna";
import type { Bookmark, Follow, Recommendation, Restaurant, Review, User } from "./types";
import type { TastePreferences } from "./taste-preferences";

export function getRecommendations(
  userId: string,
  reviews: Review[],
  restaurants: Restaurant[],
  follows: Follow[],
  limit = 5,
  user?: User | null,
  bookmarks: Bookmark[] = [],
  prefs?: TastePreferences | null,
): Recommendation[] {
  const myReviews = reviews.filter((r) => r.userId === userId);
  const reviewed = new Set(myReviews.map((r) => r.restaurantId));
  const unreviewed = restaurants.filter((r) => !reviewed.has(r.id));
  if (!unreviewed.length) return [];

  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const dna = calculateTasteDNA(userId, reviews, [], restaurants);
  const quizCuisines = user?.favoriteCuisines ?? [];
  const topCuisines = [...quizCuisines, ...dna.favoriteCuisines.map((c) => c.cuisine)]
    .filter((c, i, arr) => arr.indexOf(c) === i)
    .slice(0, 4);

  const savedRestaurantIds = new Set(
    bookmarks.filter((b) => b.userId === userId && b.restaurantId).map((b) => b.restaurantId!),
  );
  const savedCuisines = new Set(
    [...savedRestaurantIds]
      .map((id) => rMap.get(id)?.cuisine)
      .filter(Boolean),
  );

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
  const topTag = [...tagAffinity.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  return unreviewed
    .map((restaurant) => {
      let score = 40;
      const reasons: string[] = [];

      if (topCuisines.includes(restaurant.cuisine)) {
        score += quizCuisines.includes(restaurant.cuisine) ? 22 : 16;
        const loved = lovedByCuisine.get(restaurant.cuisine);
        if (loved && loved.rating >= 8) {
          reasons.push(`You rated ${restaurant.cuisine} restaurants highly.`);
        } else if (quizCuisines.includes(restaurant.cuisine)) {
          reasons.push(`You picked ${restaurant.cuisine} during onboarding.`);
        } else {
          reasons.push(`You rate ${restaurant.cuisine} highly.`);
        }
      }

      if (savedCuisines.has(restaurant.cuisine)) {
        score += 14;
        reasons.push("You frequently save similar spots.");
      }

      if (dna.preferredPriceLevel && restaurant.priceLevel === dna.preferredPriceLevel) {
        score += 12;
        if (reasons.length < 2) reasons.push("It matches your usual budget.");
      }

      if (prefs?.budgetRange && restaurant.priceLevel === prefs.budgetRange) {
        score += 10;
        if (reasons.length < 2) reasons.push("Fits your budget preference.");
      }

      if (friendRestaurants.has(restaurant.id)) {
        score += 15;
        reasons.push("Friends rated it 8.5+.");
      }

      if (topTag === "Hidden Gem" && restaurant.priceLevel <= 2) {
        score += 10;
        reasons.push("You liked similar hidden gems.");
      } else if (topTag === "Vegan Friendly" && myReviews.some((r) => r.tags.includes("Vegan Friendly"))) {
        score += 8;
        reasons.push("You often tag vegan-friendly spots.");
      } else if (topTag === "Date Night" && restaurant.priceLevel >= 3) {
        score += 8;
        reasons.push("Matches your date night taste.");
      }

      if (dna.dateNightScore > 30 && restaurant.priceLevel >= 3) score += 6;
      if (dna.hiddenGemScore > 40 && restaurant.priceLevel <= 2) score += 8;

      if (prefs?.foodGoals.includes("Find hidden gems") && restaurant.priceLevel <= 2) score += 6;
      if (prefs?.foodGoals.includes("Fine dining") && restaurant.priceLevel >= 4) score += 8;

      const reason =
        reasons.length > 0
          ? reasons.slice(0, 2).join(" ")
          : quizCuisines.length > 0
            ? `Based on your onboarding picks (${quizCuisines.slice(0, 2).join(", ")}).`
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
