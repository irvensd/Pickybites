import type { Cuisine, Dish, PriceLevel, Restaurant, Review, TasteDNA } from "./types";

export function calculateTasteDNA(
  userId: string,
  reviews: Review[],
  dishes: Dish[],
  restaurants: Restaurant[]
): TasteDNA {
  const userReviews = reviews.filter((r) => r.userId === userId);
  if (!userReviews.length) {
    return { favoriteCuisines: [], averageRating: 0, mostReviewedCuisine: null, preferredPriceLevel: null, adventureScore: 0, hiddenGemScore: 0, dateNightScore: 0, veganFriendlyScore: 0, topDishes: [], topRestaurants: [] };
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
  const tagScore = (tag: string) => Math.round((userReviews.filter((r) => r.tags.includes(tag as never)).length / userReviews.length) * 100);
  const reviewIds = new Set(userReviews.map((r) => r.id));
  const userDishes = dishes.filter((d) => reviewIds.has(d.reviewId));
  return {
    favoriteCuisines,
    averageRating: userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length,
    mostReviewedCuisine: mostReviewed?.[0] ?? null,
    preferredPriceLevel: Array.from(priceFreq.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    adventureScore: Math.min(100, new Set(userReviews.map((r) => rMap.get(r.restaurantId)?.cuisine)).size * 10),
    hiddenGemScore: tagScore("Hidden Gem"),
    dateNightScore: tagScore("Date Night"),
    veganFriendlyScore: tagScore("Vegan Friendly"),
    topDishes: [...userDishes].sort((a, b) => b.rating - a.rating).slice(0, 5),
    topRestaurants: userReviews.map((r) => ({ restaurant: rMap.get(r.restaurantId)!, rating: r.rating })).filter((x) => x.restaurant).sort((a, b) => b.rating - a.rating).slice(0, 5),
  };
}

export function calculateTasteMatch(a: string, b: string, reviews: Review[], restaurants: Restaurant[]) {
  const ra = reviews.filter((r) => r.userId === a);
  const rb = reviews.filter((r) => r.userId === b);
  if (!ra.length || !rb.length) return 0;
  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const cuisinesA = new Map<Cuisine, number[]>();
  const cuisinesB = new Map<Cuisine, number[]>();
  ra.forEach((r) => { const c = rMap.get(r.restaurantId)?.cuisine; if (c) { const arr = cuisinesA.get(c) ?? []; arr.push(r.rating); cuisinesA.set(c, arr); } });
  rb.forEach((r) => { const c = rMap.get(r.restaurantId)?.cuisine; if (c) { const arr = cuisinesB.get(c) ?? []; arr.push(r.rating); cuisinesB.set(c, arr); } });
  const shared = Array.from(cuisinesA.keys()).filter((c) => cuisinesB.has(c));
  if (!shared.length) return Math.max(0, Math.round(100 - Math.abs(ra.reduce((s, r) => s + r.rating, 0) / ra.length - rb.reduce((s, r) => s + r.rating, 0) / rb.length) * 10));
  const diff = shared.reduce((s, c) => s + Math.abs(cuisinesA.get(c)!.reduce((a, x) => a + x, 0) / cuisinesA.get(c)!.length - cuisinesB.get(c)!.reduce((a, x) => a + x, 0) / cuisinesB.get(c)!.length), 0) / shared.length;
  return Math.round(Math.max(0, 100 - diff * 8) * 0.7 + (shared.length / Math.max(cuisinesA.size, cuisinesB.size)) * 30);
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
    highestRatedRestaurant: topR,
    highestRatedDish: topD,
    favoriteCuisine: Array.from(cuisines.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    mostVisitedCity: Array.from(cities.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    biggestSurprise: yr.filter((r) => r.tags.includes("Hidden Gem") && r.rating >= 8.5).map((r) => ({ restaurant: rMap.get(r.restaurantId)!, rating: r.rating })).filter((x) => x.restaurant).sort((a, b) => b.rating - a.rating)[0] ?? null,
    biggestDisappointment: yr.filter((r) => r.rating <= 7).map((r) => ({ restaurant: rMap.get(r.restaurantId)!, rating: r.rating })).filter((x) => x.restaurant).sort((a, b) => a.rating - b.rating)[0] ?? null,
  };
}
