import type { Bookmark, Restaurant, Review } from "./types";

export type TrendingSpot = {
  restaurant: Restaurant;
  reviewCount: number;
  avgRating?: number;
  saveCount?: number;
};

export function getTrendingRestaurants(
  city: string | null | undefined,
  reviews: Review[],
  restaurants: Restaurant[],
  limit = 5,
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

export function getMostSavedThisWeek(
  bookmarks: Bookmark[],
  restaurants: Restaurant[],
  limit = 5,
): TrendingSpot[] {
  const weekAgo = Date.now() - 7 * 86400000;
  const recent = bookmarks.filter((b) => new Date(b.createdAt).getTime() > weekAgo);
  const counts = new Map<string, number>();
  recent.forEach((b) => {
    const id = b.restaurantId ?? b.googlePlaceId ?? b.id;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });

  const byId = new Map(restaurants.map((r) => [r.id, r]));
  const byGoogle = new Map(restaurants.filter((r) => r.googlePlaceId).map((r) => [r.googlePlaceId!, r]));

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, saveCount]) => {
      const restaurant = byId.get(id) ?? byGoogle.get(id);
      if (!restaurant) return null;
      return { restaurant, reviewCount: 0, saveCount };
    })
    .filter(Boolean)
    .slice(0, limit) as TrendingSpot[];
}

export function getHighestRatedThisWeek(
  city: string | null | undefined,
  reviews: Review[],
  restaurants: Restaurant[],
  limit = 5,
): TrendingSpot[] {
  const weekAgo = Date.now() - 7 * 86400000;
  const recent = reviews.filter((r) => new Date(r.createdAt).getTime() > weekAgo);
  const byRestaurant = new Map<string, number[]>();
  recent.forEach((r) => {
    const arr = byRestaurant.get(r.restaurantId) ?? [];
    arr.push(r.rating);
    byRestaurant.set(r.restaurantId, arr);
  });

  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  return [...byRestaurant.entries()]
    .map(([id, ratings]) => ({
      restaurant: rMap.get(id)!,
      reviewCount: ratings.length,
      avgRating: ratings.reduce((s, v) => s + v, 0) / ratings.length,
    }))
    .filter((x) => x.restaurant && (!city || x.restaurant.city.toLowerCase() === city.toLowerCase()))
    .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    .slice(0, limit);
}
