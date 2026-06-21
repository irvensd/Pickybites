import { distanceMeters } from "./location";
import type { Coordinates } from "./places/types";
import type { Cuisine, Dish, Restaurant, Review } from "./types";

export type DishDiscovery = {
  dish: Dish;
  restaurant: Restaurant;
  avgRating: number;
  reviewCount: number;
  reason: string;
};

export function getDishDiscoveries(
  userId: string,
  reviews: Review[],
  dishes: Dish[],
  restaurants: Restaurant[],
  opts?: { cuisine?: Cuisine; coords?: Coordinates; radiusMeters?: number; limit?: number },
): DishDiscovery[] {
  const limit = opts?.limit ?? 8;
  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const myReviews = reviews.filter((r) => r.userId === userId);
  const myCuisines = new Set(
    myReviews.map((r) => rMap.get(r.restaurantId)?.cuisine).filter(Boolean) as Cuisine[],
  );
  const targetCuisine = opts?.cuisine ?? [...myCuisines][0];

  const byName = new Map<string, { dish: Dish; ratings: number[]; restaurant: Restaurant }>();

  dishes.forEach((d) => {
    const restaurant = rMap.get(d.restaurantId);
    if (!restaurant) return;
    if (targetCuisine && restaurant.cuisine !== targetCuisine) return;
    if (opts?.coords && opts.radiusMeters && restaurant.latitude != null && restaurant.longitude != null) {
      if (distanceMeters(opts.coords, { latitude: restaurant.latitude, longitude: restaurant.longitude }) > opts.radiusMeters) {
        return;
      }
    }
    const key = `${restaurant.cuisine}::${d.name.toLowerCase()}`;
    const entry = byName.get(key) ?? { dish: d, ratings: [], restaurant };
    entry.ratings.push(d.rating);
    if (d.rating > entry.dish.rating) entry.dish = d;
    byName.set(key, entry);
  });

  const myDishNames = new Set(
    dishes
      .filter((d) => myReviews.some((r) => r.id === d.reviewId))
      .map((d) => d.name.toLowerCase()),
  );

  return [...byName.values()]
    .map(({ dish, ratings, restaurant }) => {
      const avgRating = ratings.reduce((s, v) => s + v, 0) / ratings.length;
      const reasonParts = [reviewCountLabel(ratings.length)];
      if (targetCuisine) reasonParts.push(`top ${targetCuisine.toLowerCase()} pick`);
      if (myDishNames.has(dish.name.toLowerCase())) reasonParts.push("similar to dishes you've loved");

      return {
        dish,
        restaurant,
        avgRating,
        reviewCount: ratings.length,
        reason: reasonParts.join(" · "),
      };
    })
    .filter((d) => d.avgRating >= 7.5)
    .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

function reviewCountLabel(n: number) {
  if (n === 1) return "Community favorite";
  return `${n} foodies rated this`;
}

