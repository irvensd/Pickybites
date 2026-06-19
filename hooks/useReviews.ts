import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { Review } from "@/lib/types";

export function useReviews() {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const reviews = useAppStore((s) => s.reviews);
  const follows = useAppStore((s) => s.follows);
  const isDataLoaded = useAppStore((s) => s.isDataLoaded);
  const isRefreshing = useAppStore((s) => s.isRefreshing);
  const refreshFeed = useAppStore((s) => s.refreshFeed);
  const addReview = useAppStore((s) => s.addReview);
  const updateReview = useAppStore((s) => s.updateReview);
  const deleteReview = useAppStore((s) => s.deleteReview);

  const myReviews = useMemo(
    () => reviews.filter((r) => r.userId === currentUserId),
    [reviews, currentUserId],
  );

  const activityFeed = useMemo(() => {
    if (!currentUserId) return [] as Review[];
    const followingIds = new Set(
      follows.filter((f) => f.followerId === currentUserId).map((f) => f.followingId),
    );
    return reviews
      .filter((r) => followingIds.has(r.userId) || r.userId === currentUserId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews, follows, currentUserId]);

  return {
    reviews,
    myReviews,
    myReviewCount: myReviews.length,
    activityFeed,
    isLoading: !isDataLoaded,
    isRefreshing,
    refresh: refreshFeed,
    addReview,
    updateReview,
    deleteReview,
  };
}
