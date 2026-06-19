import type { Bookmark, Restaurant, Review } from "./types";

export type DiscoverTab =
  | "for-you"
  | "trending"
  | "hidden-gems"
  | "date-night"
  | "vegan"
  | "worth-the-drive";

export const DISCOVER_TABS: { value: DiscoverTab; label: string }[] = [
  { value: "for-you", label: "For You" },
  { value: "trending", label: "Trending" },
  { value: "hidden-gems", label: "Hidden Gems" },
  { value: "date-night", label: "Date Night" },
  { value: "vegan", label: "Vegan" },
  { value: "worth-the-drive", label: "Worth The Drive" },
];

function avgRating(reviews: Review[], restaurantId: string) {
  const rs = reviews.filter((r) => r.restaurantId === restaurantId);
  if (!rs.length) return 0;
  return rs.reduce((s, r) => s + r.rating, 0) / rs.length;
}

export function filterRestaurantsForTab(
  tab: DiscoverTab,
  restaurants: Restaurant[],
  reviews: Review[],
  bookmarks: Bookmark[],
  userId: string | null,
  opts?: { userCoords?: { latitude: number; longitude: number } | null },
): Restaurant[] {
  const weekAgo = Date.now() - 7 * 86400000;
  const thirtyDaysAgo = Date.now() - 30 * 86400000;

  switch (tab) {
    case "trending": {
      const thirtyDaysAgo = Date.now() - 30 * 86400000;
      const counts = new Map<string, number>();
      reviews
        .filter((r) => new Date(r.createdAt).getTime() > thirtyDaysAgo)
        .forEach((r) => counts.set(r.restaurantId, (counts.get(r.restaurantId) ?? 0) + 1));
      return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => restaurants.find((r) => r.id === id))
        .filter(Boolean) as Restaurant[];
    }
    case "hidden-gems":
      return restaurants.filter((r) => {
        const rs = reviews.filter((rev) => rev.restaurantId === r.id);
        const tagged = rs.some((rev) => rev.tags.includes("Hidden Gem"));
        const affordable = r.priceLevel <= 2;
        const rated = avgRating(reviews, r.id);
        return tagged || (affordable && rated >= 8);
      });
    case "date-night":
      return restaurants.filter((r) => {
        const rs = reviews.filter((rev) => rev.restaurantId === r.id);
        return rs.some((rev) => rev.tags.includes("Date Night")) || r.priceLevel >= 3;
      });
    case "vegan":
      return restaurants.filter((r) => {
        const rs = reviews.filter((rev) => rev.restaurantId === r.id);
        return rs.some((rev) => rev.tags.includes("Vegan Friendly"));
      });
    case "worth-the-drive":
      return restaurants.filter((r) => {
        const userReview = reviews.find((rev) => rev.userId === userId && rev.restaurantId === r.id);
        const community = reviews.filter((rev) => rev.restaurantId === r.id);
        const avg = community.length
          ? community.reduce((s, rev) => s + rev.rating, 0) / community.length
          : 0;
        const tagged = community.some((rev) => rev.tags.includes("Worth Traveling For"));
        const highRated = avg >= 9 || (userReview?.rating ?? 0) >= 9;
        if (!highRated && !tagged) return false;
        if (!opts?.userCoords || r.latitude == null || r.longitude == null) return highRated || tagged;
        const miles =
          Math.sqrt(
            (opts.userCoords.latitude - r.latitude) ** 2 + (opts.userCoords.longitude - r.longitude) ** 2,
          ) * 69;
        return miles > 5;
      });
    case "for-you":
    default: {
      const savedIds = new Set(
        bookmarks.filter((b) => b.userId === userId).map((b) => b.restaurantId).filter(Boolean),
      );
      const reviewed = new Set(reviews.filter((r) => r.userId === userId).map((r) => r.restaurantId));
      return restaurants.filter((r) => savedIds.has(r.id) || !reviewed.has(r.id));
    }
  }
}
