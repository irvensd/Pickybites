import type { Dish, RankingFilters, Restaurant, Review } from "./types";

export function getRestaurantRankings(userId: string, reviews: Review[], restaurants: Restaurant[], filters: RankingFilters = {}, limit = 10) {
  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  let items = reviews.filter((r) => r.userId === userId);
  if (filters.tag) items = items.filter((r) => r.tags.includes(filters.tag!));
  return items.map((r) => ({ review: r, restaurant: rMap.get(r.restaurantId)!, rating: r.rating }))
    .filter((x) => x.restaurant)
    .filter((x) => !filters.city || x.restaurant.city === filters.city)
    .filter((x) => !filters.cuisine || x.restaurant.cuisine === filters.cuisine)
    .filter((x) => !filters.priceLevel || x.restaurant.priceLevel === filters.priceLevel)
    .sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export function getDishRankings(userId: string, reviews: Review[], dishes: Dish[], restaurants: Restaurant[], filters: RankingFilters = {}, limit = 10) {
  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const revMap = new Map(reviews.map((r) => [r.id, r]));
  const ids = new Set(reviews.filter((r) => r.userId === userId).map((r) => r.id));
  return dishes.filter((d) => ids.has(d.reviewId))
    .map((d) => ({ dish: d, restaurant: rMap.get(d.restaurantId)!, review: revMap.get(d.reviewId)!, rating: d.rating }))
    .filter((x) => x.restaurant)
    .filter((x) => !filters.tag || x.review?.tags.includes(filters.tag!))
    .filter((x) => !filters.city || x.restaurant.city === filters.city)
    .filter((x) => !filters.cuisine || x.restaurant.cuisine === filters.cuisine)
    .sort((a, b) => b.rating - a.rating).slice(0, limit);
}
