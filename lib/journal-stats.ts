import type { Cuisine, Dish, Restaurant, Review } from "./types";
import { getReviewOverallRating } from "./review-scores";

export type MonthStats = {
  monthKey: string;
  monthLabel: string;
  restaurantsVisited: number;
  newCuisines: number;
  averageRating: number;
  topMeal: { name: string; restaurantName: string; rating: number } | null;
};

function monthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function getCurrentMonthKey() {
  return monthKey(new Date().toISOString());
}

export function getMonthStats(
  userId: string,
  reviews: Review[],
  restaurants: Restaurant[],
  dishes: Dish[],
  targetMonthKey = getCurrentMonthKey(),
): MonthStats {
  const mine = reviews.filter((r) => r.userId === userId && monthKey(r.visitDate) === targetMonthKey);
  const rMap = new Map(restaurants.map((r) => [r.id, r]));

  const cuisinesBefore = new Set(
    reviews
      .filter((r) => r.userId === userId && monthKey(r.visitDate) < targetMonthKey)
      .map((r) => rMap.get(r.restaurantId)?.cuisine)
      .filter(Boolean),
  );

  const cuisinesThisMonth = mine
    .map((r) => rMap.get(r.restaurantId)?.cuisine)
    .filter(Boolean) as Cuisine[];

  const newCuisines = new Set(cuisinesThisMonth.filter((c) => !cuisinesBefore.has(c))).size;

  const avg = mine.length ? mine.reduce((s, r) => s + getReviewOverallRating(r), 0) / mine.length : 0;

  const reviewIds = new Set(mine.map((r) => r.id));
  const monthDishes = dishes.filter((d) => reviewIds.has(d.reviewId));
  const topDish = [...monthDishes].sort((a, b) => b.rating - a.rating)[0];
  const topReview = [...mine].sort((a, b) => getReviewOverallRating(b) - getReviewOverallRating(a))[0];

  let topMeal: MonthStats["topMeal"] = null;
  if (topDish) {
    topMeal = {
      name: topDish.name,
      restaurantName: rMap.get(topDish.restaurantId)?.name ?? "Restaurant",
      rating: topDish.rating,
    };
  } else if (topReview) {
    topMeal = {
      name: rMap.get(topReview.restaurantId)?.name ?? "Top spot",
      restaurantName: rMap.get(topReview.restaurantId)?.name ?? "Restaurant",
      rating: getReviewOverallRating(topReview),
    };
  }

  return {
    monthKey: targetMonthKey,
    monthLabel: monthLabel(targetMonthKey),
    restaurantsVisited: mine.length,
    newCuisines,
    averageRating: avg,
    topMeal,
  };
}
