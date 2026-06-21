import type { Cuisine, Dish, PriceLevel, Restaurant, Review, TasteDNA, CoreTasteDna } from "./types";
import { getCommunityRestaurantScore } from "./rankings";
import { getReviewOverallRating, averageCategoryScore } from "./review-scores";
import { resolveFavoriteRestaurantType, resolveTastePersonality } from "./taste-personality";

const LOW_COMMUNITY_REVIEW_THRESHOLD = 25;
const SPICY_CUISINES: Cuisine[] = ["Indian", "Thai", "Mexican", "Korean", "Caribbean"];

const EMPTY_DNA: TasteDNA = {
  favoriteCuisines: [],
  averageRating: 0,
  categoryAverages: { foodQuality: 0, service: 0, atmosphere: 0, value: 0 },
  mostReviewedCuisine: null,
  topCuisine: null,
  top3Cuisines: [],
  mostVisitedCity: null,
  favoriteRestaurantType: "Mixed Style",
  cuisinesTried: 0,
  topCuisineShare: 0,
  spicyCuisineShare: 0,
  americanShare: 0,
  casualTagShare: 0,
  cityConcentration: 0,
  fineDiningShare: 0,
  preferredPriceLevel: null,
  adventureScore: 0,
  hiddenGemScore: 0,
  luxuryScore: 0,
  dateNightScore: 0,
  veganFriendlyScore: 0,
  topDishes: [],
  topRestaurants: [],
  personality: {
    label: "New Explorer",
    headline: "You are a New Explorer",
    explanation: "Write a few more reviews and your food personality will take shape automatically.",
  },
};

export function calculateTasteDNA(
  userId: string,
  reviews: Review[],
  dishes: Dish[],
  restaurants: Restaurant[],
): TasteDNA {
  const userReviews = reviews.filter((r) => r.userId === userId);
  if (!userReviews.length) {
    return { ...EMPTY_DNA };
  }

  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const reviewCount = userReviews.length;
  const cuisineStats = new Map<Cuisine, { count: number; total: number }>();
  const cityStats = new Map<string, number>();
  let spicyVisits = 0;
  let americanVisits = 0;
  let fineDiningVisits = 0;

  userReviews.forEach((rev) => {
    const rest = rMap.get(rev.restaurantId);
    if (!rest) return;

    const s = cuisineStats.get(rest.cuisine) ?? { count: 0, total: 0 };
    cuisineStats.set(rest.cuisine, { count: s.count + 1, total: s.total + getReviewOverallRating(rev) });

    if (rest.city) {
      cityStats.set(rest.city, (cityStats.get(rest.city) ?? 0) + 1);
    }
    if (SPICY_CUISINES.includes(rest.cuisine)) spicyVisits += 1;
    if (rest.cuisine === "American") americanVisits += 1;
    if (rest.priceLevel >= 4) fineDiningVisits += 1;
  });

  const favoriteCuisines = Array.from(cuisineStats.entries())
    .map(([cuisine, s]) => ({ cuisine, count: s.count, avgRating: s.total / s.count }))
    .sort((a, b) => b.count - a.count || b.avgRating - a.avgRating);

  const mostReviewed = favoriteCuisines[0] ?? null;
  const topCuisine = mostReviewed?.cuisine ?? null;
  const top3Cuisines = favoriteCuisines.slice(0, 3).map((c) => c.cuisine);
  const topCuisineShare = mostReviewed ? (mostReviewed.count / reviewCount) * 100 : 0;

  const sortedCities = [...cityStats.entries()].sort((a, b) => b[1] - a[1]);
  const mostVisitedCity = sortedCities[0]?.[0] ?? null;
  const cityConcentration = sortedCities[0] ? (sortedCities[0][1] / reviewCount) * 100 : 0;

  const prices = userReviews.map((r) => rMap.get(r.restaurantId)?.priceLevel).filter(Boolean) as PriceLevel[];
  const priceFreq = new Map<PriceLevel, number>();
  prices.forEach((p) => priceFreq.set(p, (priceFreq.get(p) ?? 0) + 1));

  const tagScore = (tag: string) =>
    Math.round((userReviews.filter((r) => r.tags.includes(tag as never)).length / reviewCount) * 100);

  const hiddenGemTagged = userReviews.filter((r) => r.tags.includes("Hidden Gem")).length;
  const hiddenGemLowCount = userReviews.filter((r) => {
    const count = getCommunityRestaurantScore(r.restaurantId, reviews).review_count;
    return count < LOW_COMMUNITY_REVIEW_THRESHOLD;
  }).length;
  const hiddenGemHits = hiddenGemTagged + hiddenGemLowCount;
  const hiddenGemScore = Math.min(100, Math.round((hiddenGemHits / reviewCount) * 100));

  const avgPrice = prices.length ? prices.reduce((s, p) => s + p, 0) / prices.length : 0;
  const uniqueCuisines = new Set(userReviews.map((r) => rMap.get(r.restaurantId)?.cuisine).filter(Boolean)).size;
  const reviewIds = new Set(userReviews.map((r) => r.id));
  const userDishes = dishes.filter((d) => reviewIds.has(d.reviewId));

  const partial: Omit<TasteDNA, "personality" | "favoriteRestaurantType"> = {
    favoriteCuisines,
    averageRating: userReviews.reduce((s, r) => s + getReviewOverallRating(r), 0) / reviewCount,
    categoryAverages: {
      foodQuality: averageCategoryScore(userReviews, "foodQuality"),
      service: averageCategoryScore(userReviews, "service"),
      atmosphere: averageCategoryScore(userReviews, "atmosphere"),
      value: averageCategoryScore(userReviews, "value"),
    },
    mostReviewedCuisine: mostReviewed?.cuisine ?? null,
    topCuisine,
    top3Cuisines,
    mostVisitedCity,
    cuisinesTried: uniqueCuisines,
    topCuisineShare: Math.round(topCuisineShare * 10) / 10,
    spicyCuisineShare: Math.round((spicyVisits / reviewCount) * 100),
    americanShare: Math.round((americanVisits / reviewCount) * 100),
    casualTagShare: tagScore("Casual"),
    cityConcentration: Math.round(cityConcentration * 10) / 10,
    fineDiningShare: Math.round((fineDiningVisits / reviewCount) * 100),
    preferredPriceLevel: Array.from(priceFreq.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    adventureScore: Math.min(100, uniqueCuisines * 12),
    hiddenGemScore,
    luxuryScore: Math.round((avgPrice / 4) * 100),
    dateNightScore: tagScore("Date Night"),
    veganFriendlyScore: tagScore("Vegan Friendly"),
    topDishes: [...userDishes].sort((a, b) => b.rating - a.rating).slice(0, 5),
    topRestaurants: userReviews
      .map((r) => ({ restaurant: rMap.get(r.restaurantId)!, rating: getReviewOverallRating(r) }))
      .filter((x) => x.restaurant)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5),
  };

  const favoriteRestaurantType = resolveFavoriteRestaurantType(partial as TasteDNA);
  const personality = resolveTastePersonality(
    { ...partial, favoriteRestaurantType, personality: EMPTY_DNA.personality } as TasteDNA,
    reviewCount,
  );

  return { ...partial, favoriteRestaurantType, personality };
}

function resolveTopCuisine(dna: TasteDNA): Cuisine | string {
  if (dna.topCuisine) return dna.topCuisine;
  if (!dna.favoriteCuisines.length) return "Not enough reviews yet";
  return dna.favoriteCuisines[0].cuisine;
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

  const formatScore = (score: number) => (totalReviews === 0 ? 0 : score);

  return {
    taste_label: legacy.personality.label,
    food_personality: legacy.personality.label,
    personality_headline: legacy.personality.headline,
    personality_explanation: legacy.personality.explanation,
    top_cuisine: resolveTopCuisine(legacy),
    top_3_cuisines: legacy.top3Cuisines,
    most_visited_city: legacy.mostVisitedCity,
    favorite_restaurant_type: legacy.favoriteRestaurantType,
    average_rating: totalReviews ? Math.round(legacy.averageRating * 10) / 10 : 0,
    total_reviews: totalReviews,
    total_dishes: totalDishes,
    cuisines_tried: legacy.cuisinesTried,
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

export { calculateFoodWrapped } from "./food-wrapped";
export { calculateTasteMatch, getTasteMatchDetails, sortUsersByTasteMatch } from "./taste-match";
export type { TasteMatchResult, TasteMatchFactors } from "./taste-match";
