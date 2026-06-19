import { useMemo, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { PlaceResult } from "@/lib/places/types";
import type { Restaurant } from "@/lib/types";

export function useSavedRestaurants() {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const isDataLoaded = useAppStore((s) => s.isDataLoaded);
  const toggleBookmark = useAppStore((s) => s.toggleBookmark);
  const toggleRestaurantBookmark = useAppStore((s) => s.toggleRestaurantBookmark);
  const isBookmarked = useAppStore((s) => s.isBookmarked);
  const isRestaurantBookmarked = useAppStore((s) => s.isRestaurantBookmarked);
  const removeBookmark = useAppStore((s) => s.removeBookmark);

  const saved = useMemo(
    () =>
      bookmarks
        .filter((b) => b.userId === currentUserId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [bookmarks, currentUserId],
  );

  const savePlace = useCallback(
    (place: PlaceResult) => toggleBookmark(place),
    [toggleBookmark],
  );

  const saveRestaurant = useCallback(
    (restaurant: Restaurant) => toggleRestaurantBookmark(restaurant),
    [toggleRestaurantBookmark],
  );

  return {
    saved,
    count: saved.length,
    isLoading: !isDataLoaded,
    isEmpty: saved.length === 0,
    emptyMessage: "Save restaurants you want to visit.",
    savePlace,
    saveRestaurant,
    remove: removeBookmark,
    isPlaceSaved: isBookmarked,
    isRestaurantSaved: isRestaurantBookmarked,
  };
}
