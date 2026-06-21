import type { Cuisine, Dish, PriceLevel, Restaurant, Review } from "./types";
import { getReviewOverallRating } from "./review-scores";
import { calculateTasteDNA } from "./taste-dna";
import { resolveTastePersonality } from "./taste-personality";

export type WrappedPeriodType = "year" | "month" | "all-time";

export type WrappedPeriod = {
  type: WrappedPeriodType;
  year: number;
  month: number;
};

export type RestaurantHighlight = {
  restaurant: Restaurant;
  rating: number;
};

export type FoodWrappedSummary = {
  period: WrappedPeriod;
  periodLabel: string;
  headline: string;
  restaurantsVisited: number;
  cuisinesTried: number;
  averageRating: number;
  totalDishes: number;
  priorPeriodRestaurants: number;
  highestRatedRestaurant: RestaurantHighlight | null;
  lowestRatedRestaurant: RestaurantHighlight | null;
  mostVisitedRestaurant: { restaurant: Restaurant; visitCount: number } | null;
  mostVisitedCuisine: Cuisine | null;
  favoriteCuisine: Cuisine | null;
  mostExpensiveMeal: RestaurantHighlight | null;
  bestValueRestaurant: RestaurantHighlight | null;
  adventureScore: number;
  adventureScoreGrowth: number | null;
  hiddenGemsDiscovered: number;
  hiddenGemOfPeriod: RestaurantHighlight | null;
  favoriteNeighborhood: string | null;
  tasteDnaLabel: string;
  tasteDnaExplanation: string;
  priorTasteDnaLabel: string | null;
  top5Restaurants: RestaurantHighlight[];
};

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function reviewMonthKey(visitDate: string) {
  const d = new Date(visitDate);
  return monthKey(d.getFullYear(), d.getMonth() + 1);
}

function filterReviewsForPeriod(userId: string, reviews: Review[], period: WrappedPeriod): Review[] {
  const mine = reviews.filter((r) => r.userId === userId);
  if (period.type === "all-time") return mine;

  if (period.type === "year") {
    return mine.filter((r) => new Date(r.visitDate).getFullYear() === period.year);
  }

  return mine.filter((r) => reviewMonthKey(r.visitDate) === monthKey(period.year, period.month));
}

function priorPeriod(period: WrappedPeriod): WrappedPeriod | null {
  if (period.type === "all-time") return null;
  if (period.type === "year") {
    return { type: "year", year: period.year - 1, month: period.month };
  }
  const d = new Date(period.year, period.month - 1, 1);
  d.setMonth(d.getMonth() - 1);
  return { type: "month", year: d.getFullYear(), month: d.getMonth() + 1 };
}

function periodLabel(period: WrappedPeriod): string {
  if (period.type === "all-time") return "All Time";
  if (period.type === "year") return String(period.year);
  return new Date(period.year, period.month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function periodHeadline(period: WrappedPeriod): string {
  if (period.type === "all-time") return "Your All-Time Food Journey";
  if (period.type === "year") return `Your ${period.year} In Food`;
  const month = new Date(period.year, period.month - 1, 1).toLocaleDateString(undefined, { month: "long" });
  return `Your ${month} In Food`;
}

function uniqueCuisines(periodReviews: Review[], rMap: Map<string, Restaurant>) {
  return new Set(periodReviews.map((r) => rMap.get(r.restaurantId)?.cuisine).filter(Boolean)).size;
}

function tasteDnaForReviews(
  userId: string,
  subset: Review[],
  allReviews: Review[],
  dishes: Dish[],
  restaurants: Restaurant[],
) {
  const dna = calculateTasteDNA(userId, subset.length ? subset : [], dishes, restaurants);
  const personality = resolveTastePersonality(dna, subset.length);
  return {
    adventureScore: subset.length ? dna.adventureScore : 0,
    label: personality.label,
    explanation: personality.explanation,
  };
}

export function getDefaultWrappedPeriod(): WrappedPeriod {
  const now = new Date();
  return { type: "year", year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function calculateFoodWrappedSummary(
  userId: string,
  period: WrappedPeriod,
  reviews: Review[],
  dishes: Dish[],
  restaurants: Restaurant[],
): FoodWrappedSummary | null {
  const periodReviews = filterReviewsForPeriod(userId, reviews, period);
  if (!periodReviews.length) return null;

  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const reviewIds = new Set(periodReviews.map((r) => r.id));
  const periodDishes = dishes.filter((d) => reviewIds.has(d.reviewId));

  const cuisines = new Map<Cuisine, number>();
  const cities = new Map<string, number>();
  const restaurantVisits = new Map<string, { restaurant: Restaurant; visits: Review[] }>();

  periodReviews.forEach((review) => {
    const restaurant = rMap.get(review.restaurantId);
    if (!restaurant) return;

    cuisines.set(restaurant.cuisine, (cuisines.get(restaurant.cuisine) ?? 0) + 1);
    if (restaurant.city) {
      cities.set(restaurant.city, (cities.get(restaurant.city) ?? 0) + 1);
    }

    const bucket = restaurantVisits.get(restaurant.id) ?? { restaurant, visits: [] };
    bucket.visits.push(review);
    restaurantVisits.set(restaurant.id, bucket);
  });

  const rated = periodReviews
    .map((r) => {
      const restaurant = rMap.get(r.restaurantId);
      if (!restaurant) return null;
      return { restaurant, rating: getReviewOverallRating(r), review: r };
    })
    .filter(Boolean) as { restaurant: Restaurant; rating: number; review: Review }[];

  const highestRatedRestaurant =
    [...rated].sort((a, b) => b.rating - a.rating)[0] ?? null;
  const lowestRatedRestaurant =
    [...rated].sort((a, b) => a.rating - b.rating)[0] ?? null;

  const mostVisitedEntry = [...restaurantVisits.values()].sort(
    (a, b) => b.visits.length - a.visits.length,
  )[0];
  const mostVisitedRestaurant = mostVisitedEntry
    ? { restaurant: mostVisitedEntry.restaurant, visitCount: mostVisitedEntry.visits.length }
    : null;

  const favoriteCuisine =
    [...cuisines.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const mostVisitedCuisine = favoriteCuisine;

  const mostExpensive = [...rated].sort(
    (a, b) => b.restaurant.priceLevel - a.restaurant.priceLevel || b.rating - a.rating,
  )[0];

  const bestValue = [...rated]
    .map((item) => ({
      ...item,
      valueIndex: item.review.categoryScores.value / Math.max(item.restaurant.priceLevel, 1),
    }))
    .sort((a, b) => b.valueIndex - a.valueIndex)[0];

  const hiddenGemReviews = periodReviews.filter(
    (r) => r.tags.includes("Hidden Gem") || getReviewOverallRating(r) >= 8.5,
  );
  const hiddenGemsDiscovered = new Set(hiddenGemReviews.map((r) => r.restaurantId)).size;
  const hiddenGemOfPeriod =
    hiddenGemReviews
      .map((r) => {
        const restaurant = rMap.get(r.restaurantId);
        if (!restaurant) return null;
        return { restaurant, rating: getReviewOverallRating(r) };
      })
      .filter(Boolean)
      .sort((a, b) => b!.rating - a!.rating)[0] ?? null;

  const restaurantAverages = [...restaurantVisits.values()]
    .map(({ restaurant, visits }) => ({
      restaurant,
      rating:
        visits.reduce((s, r) => s + getReviewOverallRating(r), 0) / visits.length,
    }))
    .sort((a, b) => b.rating - a.rating);

  const top5Restaurants = restaurantAverages.slice(0, 5);

  const averageRating =
    periodReviews.reduce((s, r) => s + getReviewOverallRating(r), 0) / periodReviews.length;

  const prior = priorPeriod(period);
  const priorReviews = prior ? filterReviewsForPeriod(userId, reviews, prior) : [];
  const priorPeriodRestaurants = priorReviews.length;

  const currentTaste = tasteDnaForReviews(userId, periodReviews, reviews, dishes, restaurants);
  const priorTaste = prior
    ? tasteDnaForReviews(userId, priorReviews, reviews, dishes, restaurants)
    : null;

  const adventureScoreGrowth =
    prior && priorReviews.length > 0
      ? uniqueCuisines(periodReviews, rMap) - uniqueCuisines(priorReviews, rMap)
      : null;

  return {
    period,
    periodLabel: periodLabel(period),
    headline: periodHeadline(period),
    restaurantsVisited: periodReviews.length,
    cuisinesTried: uniqueCuisines(periodReviews, rMap),
    averageRating: Math.round(averageRating * 10) / 10,
    totalDishes: periodDishes.length,
    priorPeriodRestaurants,
    highestRatedRestaurant,
    lowestRatedRestaurant,
    mostVisitedRestaurant,
    mostVisitedCuisine,
    favoriteCuisine,
    mostExpensiveMeal: mostExpensive ?? null,
    bestValueRestaurant: bestValue
      ? { restaurant: bestValue.restaurant, rating: bestValue.rating }
      : null,
    adventureScore: currentTaste.adventureScore,
    adventureScoreGrowth,
    hiddenGemsDiscovered,
    hiddenGemOfPeriod: hiddenGemOfPeriod,
    favoriteNeighborhood:
      [...cities.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    tasteDnaLabel: currentTaste.label,
    tasteDnaExplanation: currentTaste.explanation,
    priorTasteDnaLabel: priorTaste?.label ?? null,
    top5Restaurants,
  };
}

/** @deprecated Use calculateFoodWrappedSummary */
export function calculateFoodWrapped(
  userId: string,
  year: number,
  reviews: Review[],
  dishes: Dish[],
  restaurants: Restaurant[],
) {
  const summary = calculateFoodWrappedSummary(
    userId,
    { type: "year", year, month: 1 },
    reviews,
    dishes,
    restaurants,
  );
  if (!summary) {
    return {
      year,
      totalRestaurants: 0,
      totalDishes: 0,
      priorYearRestaurants: 0,
      highestRatedRestaurant: null,
      highestRatedDish: null,
      favoriteCuisine: null,
      mostVisitedCity: null,
      biggestSurprise: null,
      biggestDisappointment: null,
    };
  }

  const periodReviews = filterReviewsForPeriod(userId, reviews, { type: "year", year, month: 1 });
  const ids = new Set(periodReviews.map((r) => r.id));
  const yrDishes = dishes.filter((d) => ids.has(d.reviewId));
  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const topD =
    yrDishes
      .map((d) => ({ dish: d, restaurant: rMap.get(d.restaurantId)! }))
      .filter((x) => x.restaurant)
      .sort((a, b) => b.dish.rating - a.dish.rating)[0] ?? null;

  return {
    year,
    totalRestaurants: summary.restaurantsVisited,
    totalDishes: summary.totalDishes,
    priorYearRestaurants: summary.priorPeriodRestaurants,
    highestRatedRestaurant: summary.highestRatedRestaurant,
    highestRatedDish: topD,
    favoriteCuisine: summary.favoriteCuisine,
    mostVisitedCity: summary.favoriteNeighborhood,
    biggestSurprise: summary.hiddenGemOfPeriod,
    biggestDisappointment: summary.lowestRatedRestaurant,
  };
}

export function buildWrappedShareMessage(summary: FoodWrappedSummary, displayName: string) {
  const growth =
    summary.adventureScoreGrowth != null && summary.adventureScoreGrowth !== 0
      ? ` · +${summary.adventureScoreGrowth} cuisines explored`
      : "";
  return `${displayName}'s ${summary.periodLabel} Food Wrapped: ${summary.restaurantsVisited} restaurants, ${summary.cuisinesTried} cuisines, ${summary.averageRating} avg rating${growth}. ${summary.tasteDnaLabel}!`;
}
