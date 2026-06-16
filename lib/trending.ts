import type { Restaurant, Review } from "./types";

export type TrendingSpot = {
  restaurant: Restaurant;
  reviewCount: number;
};

export function getTrendingRestaurants(
  city: string | null | undefined,
  reviews: Review[],
  restaurants: Restaurant[],
  limit = 5
): TrendingSpot[] {
  const weekAgo = Date.now() - 7 * 86400000;
  const recent = reviews.filter((r) => new Date(r.createdAt).getTime() > weekAgo);
  const counts = new Map<string, number>();
  recent.forEach((r) => counts.set(r.restaurantId, (counts.get(r.restaurantId) ?? 0) + 1));

  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, reviewCount]) => ({ restaurant: rMap.get(id)!, reviewCount }))
    .filter((x) => x.restaurant && (!city || x.restaurant.city.toLowerCase() === city.toLowerCase()))
    .slice(0, limit);
}
