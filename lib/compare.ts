import { getRestaurantRankings } from "./rankings";
import type { Restaurant, Review } from "./types";

export type CompareEntry = {
  rank: number;
  restaurant: Restaurant;
  rating: number;
};

export type CompareResult = {
  mine: CompareEntry[];
  theirs: CompareEntry[];
  shared: { restaurant: Restaurant; myRating: number; theirRating: number; diff: number }[];
};

export function getCompareRankings(
  userId: string,
  friendId: string,
  reviews: Review[],
  restaurants: Restaurant[],
  limit = 10,
): CompareResult {
  const mine = getRestaurantRankings(userId, reviews, restaurants, {}, limit).map((x, i) => ({
    rank: i + 1,
    restaurant: x.restaurant,
    rating: x.rating,
  }));
  const theirs = getRestaurantRankings(friendId, reviews, restaurants, {}, limit).map((x, i) => ({
    rank: i + 1,
    restaurant: x.restaurant,
    rating: x.rating,
  }));

  const myRatings = new Map(
    reviews.filter((r) => r.userId === userId).map((r) => [r.restaurantId, r.rating]),
  );
  const theirRatings = new Map(
    reviews.filter((r) => r.userId === friendId).map((r) => [r.restaurantId, r.rating]),
  );
  const rMap = new Map(restaurants.map((r) => [r.id, r]));

  const shared = [...myRatings.entries()]
    .filter(([id]) => theirRatings.has(id))
    .map(([id, myRating]) => {
      const theirRating = theirRatings.get(id)!;
      const restaurant = rMap.get(id)!;
      return { restaurant, myRating, theirRating, diff: Math.abs(myRating - theirRating) };
    })
    .filter((x) => x.restaurant)
    .sort((a, b) => a.diff - b.diff);

  return { mine, theirs, shared };
}

