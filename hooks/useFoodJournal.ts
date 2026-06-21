import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getFoodJournal, FOOD_JOURNAL_EMPTY } from "@/lib/foodJournal";

export function useFoodJournal() {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const reviews = useAppStore((s) => s.reviews);
  const restaurants = useAppStore((s) => s.restaurants);
  const dishes = useAppStore((s) => s.dishes);
  const reviewPhotos = useAppStore((s) => s.reviewPhotos);
  const isDataLoaded = useAppStore((s) => s.isDataLoaded);

  const journal = useMemo(
    () =>
      currentUserId
        ? getFoodJournal(currentUserId, reviews, restaurants, dishes, reviewPhotos)
        : [],
    [currentUserId, reviews, restaurants, dishes, reviewPhotos],
  );

  return {
    journal,
    isLoading: !isDataLoaded,
    isEmpty: journal.length === 0,
    emptyMessage: FOOD_JOURNAL_EMPTY,
  };
}

