import type { Cuisine, Dish, PriceLevel, Restaurant, Review, TasteDNA, CoreTasteDna } from "./types";
import { getCommunityRestaurantScore } from "./rankings";

const LOW_COMMUNITY_REVIEW_THRESHOLD = 25;

export function calculateTasteDNA(
  userId: string,
  reviews: Review[],
  dishes: Dish[],
  restaurants: Restaurant[]
): TasteDNA {
  const userReviews = reviews.filter((r) => r.userId === userId);
  if (!userReviews.length) {
    return { favoriteCuisines: [], averageRating: 0, mostReviewedCuisine: null, preferredPriceLevel: null, adventureScore: 0, hiddenGemScore: 0, luxuryScore: 0, dateNightScore: 0, veganFriendlyScore: 0, topDishes: [], topRestaurants: [] };
  }
  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const cuisineStats = new Map<Cuisine, { count: number; total: number }>();
  userReviews.forEach((rev) => {
    const rest = rMap.get(rev.restaurantId);
    if (!rest) return;
    const s = cuisineStats.get(rest.cuisine) ?? { count: 0, total: 0 };
    cuisineStats.set(rest.cuisine, { count: s.count + 1, total: s.total + rev.rating });
  });
  const favoriteCuisines = Array.from(cuisineStats.entries())
    .map(([cuisine, s]) => ({ cuisine, count: s.count, avgRating: s.total / s.count }))
    .sort((a, b) => b.avgRating - a.avgRating);
  const mostReviewed = Array.from(cuisineStats.entries()).sort((a, b) => b[1].count - a[1].count)[0];
  const prices = userReviews.map((r) => rMap.get(r.restaurantId)?.priceLevel).filter(Boolean) as PriceLevel[];
  const priceFreq = new Map<PriceLevel, number>();
  prices.forEach((p) => priceFreq.set(p, (priceFreq.get(p) ?? 0) + 1));
  const tagScore = (tag: string) =>
    Math.round((userReviews.filter((r) => r.tags.includes(tag as never)).length / userReviews.length) * 100);

  const hiddenGemTagged = userReviews.filter((r) => r.tags.includes("Hidden Gem")).length;
  const hiddenGemLowCount = userReviews.filter((r) => {
    const count = getCommunityRestaurantScore(r.restaurantId, reviews).review_count;
    return count < LOW_COMMUNITY_REVIEW_THRESHOLD;
  }).length;
  const hiddenGemHits = hiddenGemTagged + hiddenGemLowCount;
  const hiddenGemScore = Math.min(100, Math.round((hiddenGemHits / userReviews.length) * 100));

  const avgPrice = prices.length ? prices.reduce((s, p) => s + p, 0) / prices.length : 0;
  const uniqueCuisines = new Set(userReviews.map((r) => rMap.get(r.restaurantId)?.cuisine).filter(Boolean)).size;
  const reviewIds = new Set(userReviews.map((r) => r.id));
  const userDishes = dishes.filter((d) => reviewIds.has(d.reviewId));
  return {
    favoriteCuisines,
    averageRating: userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length,
    mostReviewedCuisine: mostReviewed?.[0] ?? null,
    preferredPriceLevel: Array.from(priceFreq.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    adventureScore: Math.min(100, uniqueCuisines * 12),
    hiddenGemScore,
    luxuryScore: Math.round((avgPrice / 4) * 100),
    dateNightScore: tagScore("Date Night"),
    veganFriendlyScore: tagScore("Vegan Friendly"),
    topDishes: [...userDishes].sort((a, b) => b.rating - a.rating).slice(0, 5),
    topRestaurants: userReviews.map((r) => ({ restaurant: rMap.get(r.restaurantId)!, rating: r.rating })).filter((x) => x.restaurant).sort((a, b) => b.rating - a.rating).slice(0, 5),
  };
}

function resolveTasteLabel(dna: TasteDNA, totalReviews: number): string {
  if (totalReviews < 1) return "New Explorer";
  if (dna.adventureScore >= 75) return "Flavor Explorer";
  if (dna.hiddenGemScore >= 60) return "Hidden Gem Hunter";
  if (dna.dateNightScore >= 50) return "Date Night Curator";
  if (dna.veganFriendlyScore >= 50) return "Plant-Based Scout";
  if (dna.averageRating >= 8.5) return "Selective Taster";
  return "Comfort Food Regular";
}

function resolveTopCuisine(dna: TasteDNA): Cuisine | string {
  if (!dna.favoriteCuisines.length) return "Not enough reviews yet";
  const byCount = [...dna.favoriteCuisines].sort((a, b) => b.count - a.count);
  const topCount = byCount[0].count;
  const tied = byCount.filter((c) => c.count === topCount);
  if (tied.length === 1) return tied[0].cuisine;
  return tied.sort((a, b) => b.avgRating - a.avgRating)[0].cuisine;
}

/** Spec-aligned Taste DNA engine. Never exposes raw zero scores when total_reviews is 0. */
export function calculateCoreTasteDna(
  userId: string,
  reviews: Review[],
  dishes: Dish[],
  restaurants: Restaurant[],
): CoreTasteDna {
  const legacy = calculateTasteDNA(userId, reviews, dishes, restaurants);
  const totalReviews = reviews.filter((r) => r.userId === userId).length;
  const reviewIds = new Set(reviews.filter((r) => r.userId === userId).map((r) => r.id));
  const totalDishes = dishes.filter((d) => reviewIds.has(d.reviewId)).length;
  const cuisinesTried = new Set(
    reviews
      .filter((r) => r.userId === userId)
      .map((r) => restaurants.find((x) => x.id === r.restaurantId)?.cuisine)
      .filter(Boolean),
  ).size;

  const formatScore = (score: number) => (totalReviews === 0 ? 0 : score);

  return {
    taste_label: resolveTasteLabel(legacy, totalReviews),
    top_cuisine: resolveTopCuisine(legacy),
    average_rating: totalReviews ? Math.round(legacy.averageRating * 10) / 10 : 0,
    total_reviews: totalReviews,
    total_dishes: totalDishes,
    cuisines_tried: cuisinesTried,
    preferred_price_level: legacy.preferredPriceLevel,
    adventure_score: formatScore(legacy.adventureScore),
    hidden_gem_score: formatScore(legacy.hiddenGemScore),
    date_night_score: formatScore(legacy.dateNightScore),
    vegan_score: formatScore(legacy.veganFriendlyScore),
    top_restaurants: legacy.topRestaurants,
    top_dishes: legacy.topDishes,
    legacy,
  };
}

/** Display helper — never show raw zeros for empty profiles. */
export function formatTasteScoreDisplay(score: number, totalReviews: number, fallback = "Not enough reviews yet") {
  if (totalReviews === 0 || score === 0) return fallback;
  return String(score);
}

export function calculateTasteMatch(a: string, b: string, reviews: Review[], restaurants: Restaurant[]) {
  const ra = reviews.filter((r) => r.userId === a);
  const rb = reviews.filter((r) => r.userId === b);
  if (!ra.length || !rb.length) return 0;

  const ratingsA = new Map(ra.map((r) => [r.restaurantId, r.rating]));
  const sharedRestaurantReviews = rb.filter((r) => ratingsA.has(r.restaurantId));

  if (sharedRestaurantReviews.length > 0) {
    const avgDiff =
      sharedRestaurantReviews.reduce((s, r) => s + Math.abs(ratingsA.get(r.restaurantId)! - r.rating), 0) /
      sharedRestaurantReviews.length;
    const base = Math.max(0, 100 - avgDiff * 12);
    const overlapBonus = Math.min(15, sharedRestaurantReviews.length * 4);
    return Math.min(99, Math.round(base + overlapBonus));
  }

  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const cuisinesA = new Map<Cuisine, number[]>();
  const cuisinesB = new Map<Cuisine, number[]>();
  ra.forEach((r) => {
    const c = rMap.get(r.restaurantId)?.cuisine;
    if (c) {
      const arr = cuisinesA.get(c) ?? [];
      arr.push(r.rating);
      cuisinesA.set(c, arr);
    }
  });
  rb.forEach((r) => {
    const c = rMap.get(r.restaurantId)?.cuisine;
    if (c) {
      const arr = cuisinesB.get(c) ?? [];
      arr.push(r.rating);
      cuisinesB.set(c, arr);
    }
  });
  const shared = Array.from(cuisinesA.keys()).filter((c) => cuisinesB.has(c));
  if (!shared.length) {
    return Math.max(
      0,
      Math.round(
        100 -
          Math.abs(
            ra.reduce((s, r) => s + r.rating, 0) / ra.length - rb.reduce((s, r) => s + r.rating, 0) / rb.length
          ) *
            10
      )
    );
  }
  const diff =
    shared.reduce(
      (s, c) =>
        s +
        Math.abs(
          cuisinesA.get(c)!.reduce((x, v) => x + v, 0) / cuisinesA.get(c)!.length -
            cuisinesB.get(c)!.reduce((x, v) => x + v, 0) / cuisinesB.get(c)!.length
        ),
      0
    ) / shared.length;
  return Math.round(Math.max(0, 100 - diff * 8) * 0.7 + (shared.length / Math.max(cuisinesA.size, cuisinesB.size)) * 30);
}

export function getTasteMatchDetails(a: string, b: string, reviews: Review[], restaurants: Restaurant[]) {
  const ra = reviews.filter((r) => r.userId === a);
  const rb = reviews.filter((r) => r.userId === b);
  const ratingsA = new Map(ra.map((r) => [r.restaurantId, r.rating]));
  const sharedRestaurants = rb.filter((r) => ratingsA.has(r.restaurantId)).length;

  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const cuisinesA = new Set(ra.map((r) => rMap.get(r.restaurantId)?.cuisine).filter(Boolean));
  const cuisinesB = new Set(rb.map((r) => rMap.get(r.restaurantId)?.cuisine).filter(Boolean));
  const sharedCuisines = [...cuisinesA].filter((c) => cuisinesB.has(c)).length;

  const percent = calculateTasteMatch(a, b, reviews, restaurants);
  const detail =
    sharedRestaurants > 0
      ? `Based on ${sharedRestaurants} shared spot${sharedRestaurants === 1 ? "" : "s"}`
      : sharedCuisines > 0
        ? `Based on ${sharedCuisines} shared cuisine${sharedCuisines === 1 ? "" : "s"}`
        : undefined;

  return { percent, sharedRestaurants, sharedCuisines, detail };
}

export function calculateFoodWrapped(userId: string, year: number, reviews: Review[], dishes: Dish[], restaurants: Restaurant[]) {
  const yr = reviews.filter((r) => r.userId === userId && new Date(r.visitDate).getFullYear() === year);
  const ids = new Set(yr.map((r) => r.id));
  const yrDishes = dishes.filter((d) => ids.has(d.reviewId));
  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const cuisines = new Map<Cuisine, number>();
  const cities = new Map<string, number>();
  yr.forEach((r) => { const rest = rMap.get(r.restaurantId); if (rest) { cuisines.set(rest.cuisine, (cuisines.get(rest.cuisine) ?? 0) + 1); cities.set(rest.city, (cities.get(rest.city) ?? 0) + 1); } });
  const topR = yr.map((r) => ({ restaurant: rMap.get(r.restaurantId)!, rating: r.rating })).filter((x) => x.restaurant).sort((a, b) => b.rating - a.rating)[0] ?? null;
  const topD = yrDishes.map((d) => ({ dish: d, restaurant: rMap.get(d.restaurantId)! })).filter((x) => x.restaurant).sort((a, b) => b.dish.rating - a.dish.rating)[0] ?? null;
  return {
    year, totalRestaurants: yr.length, totalDishes: yrDishes.length,
    priorYearRestaurants: reviews.filter((r) => r.userId === userId && new Date(r.visitDate).getFullYear() === year - 1).length,
    highestRatedRestaurant: topR,
    highestRatedDish: topD,
    favoriteCuisine: Array.from(cuisines.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    mostVisitedCity: Array.from(cities.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    biggestSurprise: yr.filter((r) => r.tags.includes("Hidden Gem") && r.rating >= 8.5).map((r) => ({ restaurant: rMap.get(r.restaurantId)!, rating: r.rating })).filter((x) => x.restaurant).sort((a, b) => b.rating - a.rating)[0] ?? null,
    biggestDisappointment: yr.filter((r) => r.rating <= 7).map((r) => ({ restaurant: rMap.get(r.restaurantId)!, rating: r.rating })).filter((x) => x.restaurant).sort((a, b) => a.rating - b.rating)[0] ?? null,
  };
}
