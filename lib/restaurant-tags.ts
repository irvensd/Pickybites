import type { Bookmark, Restaurant, Review } from "./types";

export type RestaurantCommunityTag =
  | "Hidden Gem"
  | "Trending"
  | "Date Night"
  | "Worth The Drive"
  | "Vegan Favorite"
  | "Local Favorite";

export function getCommunityRating(restaurantId: string, reviews: Review[]) {
  const all = reviews.filter((r) => r.restaurantId === restaurantId);
  if (!all.length) return { avgRating: null as number | null, reviewCount: 0 };
  return {
    avgRating: all.reduce((s, r) => s + r.rating, 0) / all.length,
    reviewCount: all.length,
  };
}

export function getRestaurantCommunityTags(
  restaurant: Restaurant,
  reviews: Review[],
  bookmarks: Bookmark[],
  userCity?: string | null,
  limit = 3,
): RestaurantCommunityTag[] {
  const tags: RestaurantCommunityTag[] = [];
  const restReviews = reviews.filter((r) => r.restaurantId === restaurant.id);
  const weekAgo = Date.now() - 7 * 86400000;

  if (restReviews.some((r) => r.tags.includes("Hidden Gem"))) tags.push("Hidden Gem");
  if (restReviews.filter((r) => new Date(r.createdAt).getTime() > weekAgo).length >= 2) tags.push("Trending");
  if (restReviews.some((r) => r.tags.includes("Date Night")) || restaurant.priceLevel >= 3) tags.push("Date Night");
  if (restReviews.some((r) => r.tags.includes("Worth Traveling For"))) tags.push("Worth The Drive");
  if (restReviews.some((r) => r.tags.includes("Vegan Friendly"))) tags.push("Vegan Favorite");
  if (userCity && restaurant.city.toLowerCase() === userCity.toLowerCase() && restReviews.length >= 2) {
    tags.push("Local Favorite");
  }

  const saveCount = bookmarks.filter((b) => b.restaurantId === restaurant.id).length;
  if (saveCount >= 2 && !tags.includes("Trending")) tags.push("Trending");

  return [...new Set(tags)].slice(0, limit);
}
