import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { calculateCoreTasteDna } from "@/lib/taste-dna";

export function useTasteDna() {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const reviews = useAppStore((s) => s.reviews);
  const dishes = useAppStore((s) => s.dishes);
  const restaurants = useAppStore((s) => s.restaurants);
  const isDataLoaded = useAppStore((s) => s.isDataLoaded);

  const dna = useMemo(
    () =>
      currentUserId ? calculateCoreTasteDna(currentUserId, reviews, dishes, restaurants) : null,
    [currentUserId, reviews, dishes, restaurants],
  );

  return {
    dna,
    legacy: dna?.legacy ?? null,
    tasteLabel: dna?.taste_label ?? "New Explorer",
    topCuisine: dna?.top_cuisine ?? "Not enough reviews yet",
    isLoading: !isDataLoaded,
    isEmpty: !dna || dna.total_reviews === 0,
    emptyMessage: "Review your first restaurant to unlock your Taste DNA.",
  };
}
