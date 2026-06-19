import type { Cuisine, Dish, PriceLevel, RankingFilters, Restaurant, Review, ReviewTag } from "./types";

export type UserRestaurantRanking = {
  rank: number;
  restaurant_id: string;
  restaurant_name: string;
  image_url: string | null;
  cuisine: Cuisine;
  city: string;
  rating: number;
  review_count_by_user: number;
  last_visit_date: string;
  tags: ReviewTag[];
};

export type UserDishRanking = {
  rank: number;
  dish_id: string;
  dish_name: string;
  restaurant_name: string;
  restaurant_id: string;
  dish_rating: number;
  photo_url: string | null;
  is_favorite: boolean;
  dish_notes: string;
};

export type CommunityRestaurantScore = {
  average_rating: number;
  review_count: number;
  weighted_score: number;
};

export type CityRankingItem = {
  rank: number;
  restaurant: Restaurant;
  average_rating: number;
  review_count: number;
  weighted_score: number;
};

export type DishRanking = {
  dish: Dish;
  restaurant: Restaurant;
  review: Review;
  rating: number;
};

/** Weighted score: dampens single-review outliers. */
export function getCommunityRestaurantScore(
  restaurantId: string,
  reviews: Review[],
  priorMean = 7.0,
  priorWeight = 5,
): CommunityRestaurantScore {
  const all = reviews.filter((r) => r.restaurantId === restaurantId);
  if (!all.length) {
    return { average_rating: 0, review_count: 0, weighted_score: priorMean };
  }
  const average_rating = all.reduce((s, r) => s + r.rating, 0) / all.length;
  const review_count = all.length;
  const weighted_score =
    (average_rating * review_count + priorMean * priorWeight) / (review_count + priorWeight);
  return {
    average_rating: Math.round(average_rating * 10) / 10,
    review_count,
    weighted_score: Math.round(weighted_score * 10) / 10,
  };
}

export function getUserRestaurantRankings(
  userId: string,
  reviews: Review[],
  restaurants: Restaurant[],
  filters: RankingFilters = {},
): UserRestaurantRanking[] {
  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const byRestaurant = new Map<string, Review[]>();

  reviews
    .filter((r) => r.userId === userId)
    .filter((r) => !filters.tag || r.tags.includes(filters.tag!))
    .forEach((review) => {
      const arr = byRestaurant.get(review.restaurantId) ?? [];
      arr.push(review);
      byRestaurant.set(review.restaurantId, arr);
    });

  const items = [...byRestaurant.entries()]
    .map(([restaurantId, userReviews]) => {
      const restaurant = rMap.get(restaurantId);
      if (!restaurant) return null;
      if (filters.city && restaurant.city !== filters.city) return null;
      if (filters.cuisine && restaurant.cuisine !== filters.cuisine) return null;
      if (filters.priceLevel && restaurant.priceLevel !== filters.priceLevel) return null;

      const sorted = [...userReviews].sort(
        (a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime(),
      );
      const best = [...userReviews].sort((a, b) => b.rating - a.rating)[0];
      const tags = [...new Set(userReviews.flatMap((r) => r.tags))];

      return {
        restaurant,
        rating: best.rating,
        review_count_by_user: userReviews.length,
        last_visit_date: sorted[0].visitDate,
        tags,
      };
    })
    .filter(Boolean) as {
      restaurant: Restaurant;
      rating: number;
      review_count_by_user: number;
      last_visit_date: string;
      tags: ReviewTag[];
    }[];

  return items
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      const dateDiff =
        new Date(b.last_visit_date).getTime() - new Date(a.last_visit_date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.restaurant.name.localeCompare(b.restaurant.name);
    })
    .map((item, index) => ({
      rank: index + 1,
      restaurant_id: item.restaurant.id,
      restaurant_name: item.restaurant.name,
      image_url: item.restaurant.imageUrl,
      cuisine: item.restaurant.cuisine,
      city: item.restaurant.city,
      rating: item.rating,
      review_count_by_user: item.review_count_by_user,
      last_visit_date: item.last_visit_date,
      tags: item.tags,
    }));
}

export function getUserDishRankings(
  userId: string,
  reviews: Review[],
  dishes: Dish[],
  restaurants: Restaurant[],
  filters: RankingFilters = {},
): UserDishRanking[] {
  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const userReviewIds = new Set(reviews.filter((r) => r.userId === userId).map((r) => r.id));

  return dishes
    .filter((d) => userReviewIds.has(d.reviewId))
    .map((dish) => {
      const restaurant = rMap.get(dish.restaurantId);
      const review = reviews.find((r) => r.id === dish.reviewId);
      if (!restaurant || !review) return null;
      if (filters.tag && !review.tags.includes(filters.tag!)) return null;
      if (filters.city && restaurant.city !== filters.city) return null;
      if (filters.cuisine && restaurant.cuisine !== filters.cuisine) return null;
      return { dish, restaurant };
    })
    .filter(Boolean)
    .map((x) => x!)
    .sort((a, b) => {
      if (b.dish.rating !== a.dish.rating) return b.dish.rating - a.dish.rating;
      if (a.dish.isBestDish !== b.dish.isBestDish) return a.dish.isBestDish ? -1 : 1;
      return new Date(b.dish.createdAt).getTime() - new Date(a.dish.createdAt).getTime();
    })
    .map((item, index) => ({
      rank: index + 1,
      dish_id: item.dish.id,
      dish_name: item.dish.name,
      restaurant_name: item.restaurant.name,
      restaurant_id: item.restaurant.id,
      dish_rating: item.dish.rating,
      photo_url: item.dish.photoUrl,
      is_favorite: item.dish.isBestDish,
      dish_notes: item.dish.notes,
    }));
}

export function getCityRankings(
  city: string,
  reviews: Review[],
  restaurants: Restaurant[],
  cuisine?: Cuisine,
  limit = 20,
): CityRankingItem[] {
  const inCity = restaurants.filter(
    (r) => r.city.toLowerCase() === city.toLowerCase() && (!cuisine || r.cuisine === cuisine),
  );

  return inCity
    .map((restaurant) => {
      const score = getCommunityRestaurantScore(restaurant.id, reviews);
      return { restaurant, ...score };
    })
    .filter((x) => x.review_count > 0)
    .sort((a, b) => b.weighted_score - a.weighted_score)
    .slice(0, limit)
    .map((item, index) => ({
      rank: index + 1,
      restaurant: item.restaurant,
      average_rating: item.average_rating,
      review_count: item.review_count,
      weighted_score: item.weighted_score,
    }));
}

/** @deprecated Use getUserRestaurantRankings — kept for existing UI. */
export function getRestaurantRankings(
  userId: string,
  reviews: Review[],
  restaurants: Restaurant[],
  filters: RankingFilters = {},
  limit = 10,
) {
  return getUserRestaurantRankings(userId, reviews, restaurants, filters)
    .slice(0, limit)
    .map((item) => ({
      review: reviews.find(
        (r) => r.userId === userId && r.restaurantId === item.restaurant_id,
      )!,
      restaurant: restaurants.find((r) => r.id === item.restaurant_id)!,
      rating: item.rating,
    }))
    .filter((x) => x.review && x.restaurant);
}

/** @deprecated Use getUserDishRankings — kept for existing UI. */
export function getDishRankings(
  userId: string,
  reviews: Review[],
  dishes: Dish[],
  restaurants: Restaurant[],
  filters: RankingFilters = {},
  limit = 10,
): DishRanking[] {
  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const revMap = new Map(reviews.map((r) => [r.id, r]));
  return getUserDishRankings(userId, reviews, dishes, restaurants, filters)
    .slice(0, limit)
    .map((item) => ({
      dish: dishes.find((d) => d.id === item.dish_id)!,
      restaurant: rMap.get(item.restaurant_id)!,
      review: revMap.get(dishes.find((d) => d.id === item.dish_id)!.reviewId)!,
      rating: item.dish_rating,
    }))
    .filter((x) => x.dish && x.restaurant && x.review);
}
