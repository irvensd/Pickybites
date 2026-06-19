import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  getUserRestaurantRankings,
  getUserDishRankings,
  getCommunityRestaurantScore,
  getCityRankings,
} from "@/lib/rankings";
import type { Cuisine, RankingFilters } from "@/lib/types";

export function useRankings(filters: RankingFilters = {}) {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const reviews = useAppStore((s) => s.reviews);
  const dishes = useAppStore((s) => s.dishes);
  const restaurants = useAppStore((s) => s.restaurants);
  const isDataLoaded = useAppStore((s) => s.isDataLoaded);

  const myReviews = useMemo(
    () => (currentUserId ? reviews.filter((r) => r.userId === currentUserId) : []),
    [reviews, currentUserId],
  );

  const restaurantRankings = useMemo(
    () => (currentUserId ? getUserRestaurantRankings(currentUserId, reviews, restaurants, filters) : []),
    [currentUserId, reviews, restaurants, filters],
  );

  const dishRankings = useMemo(
    () => (currentUserId ? getUserDishRankings(currentUserId, reviews, dishes, restaurants, filters) : []),
    [currentUserId, reviews, dishes, restaurants, filters],
  );

  const avgScore = myReviews.length
    ? myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length
    : 0;

  return {
    restaurantRankings,
    dishRankings,
    totalReviews: myReviews.length,
    averageScore: avgScore,
    totalDishes: dishRankings.length,
    isLoading: !isDataLoaded,
    isEmpty: restaurantRankings.length === 0 && dishRankings.length === 0,
    getCommunityScore: (restaurantId: string) => getCommunityRestaurantScore(restaurantId, reviews),
    getCityRankings: (city: string, cuisine?: Cuisine) => getCityRankings(city, reviews, restaurants, cuisine),
  };
}
