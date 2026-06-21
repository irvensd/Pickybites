import type { Dish, Restaurant, Review, ReviewPhoto, ReviewTag, ReviewCategoryScores, WaitTime } from "./types";
import { getReviewOverallRating } from "./review-scores";

export type FoodJournalEntry = {
  review_id: string;
  restaurant_id: string;
  restaurant_name: string;
  cuisine: string;
  city: string;
  rating: number;
  category_scores: ReviewCategoryScores;
  rating_manual_override: boolean;
  wait_time: WaitTime | null;
  would_return: boolean | null;
  would_recommend: boolean | null;
  visit_date: string;
  review_text: string;
  tags: ReviewTag[];
  photos: string[];
  dishes: {
    dish_id: string;
    dish_name: string;
    dish_rating: number;
    dish_notes: string;
    is_favorite: boolean;
    photo_url: string | null;
  }[];
};

export type FoodJournalMonth = {
  month: string;
  month_key: string;
  total_visits: number;
  unique_cuisines: number;
  average_rating: number;
  top_meal: string | null;
  entries: FoodJournalEntry[];
};

export const FOOD_JOURNAL_EMPTY =
  "No food memories yet. Write your first review to start your timeline.";

function monthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function getFoodJournal(
  userId: string,
  reviews: Review[],
  restaurants: Restaurant[],
  dishes: Dish[],
  reviewPhotos: ReviewPhoto[],
): FoodJournalMonth[] {
  const rMap = new Map(restaurants.map((r) => [r.id, r]));
  const userReviews = reviews
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

  const groups = new Map<string, Review[]>();
  userReviews.forEach((review) => {
    const key = monthKey(review.visitDate);
    const arr = groups.get(key) ?? [];
    arr.push(review);
    groups.set(key, arr);
  });

  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, monthReviews]) => {
      const cuisines = new Set(
        monthReviews.map((r) => rMap.get(r.restaurantId)?.cuisine).filter(Boolean),
      );
      const avg =
        monthReviews.reduce((s, r) => s + getReviewOverallRating(r), 0) / Math.max(monthReviews.length, 1);

      const entries: FoodJournalEntry[] = monthReviews.map((review) => {
        const restaurant = rMap.get(review.restaurantId);
        const reviewDishes = dishes.filter((d) => d.reviewId === review.id);
        const photos = reviewPhotos.filter((p) => p.reviewId === review.id).map((p) => p.url);

        return {
          review_id: review.id,
          restaurant_id: review.restaurantId,
          restaurant_name: restaurant?.name ?? "Unknown",
          cuisine: restaurant?.cuisine ?? "Unknown",
          city: restaurant?.city ?? "",
          rating: getReviewOverallRating(review),
          category_scores: review.categoryScores,
          rating_manual_override: review.ratingManualOverride,
          wait_time: review.waitTime,
          would_return: review.wouldReturn,
          would_recommend: review.wouldRecommend,
          visit_date: review.visitDate,
          review_text: review.text,
          tags: review.tags,
          photos,
          dishes: reviewDishes.map((d) => ({
            dish_id: d.id,
            dish_name: d.name,
            dish_rating: d.rating,
            dish_notes: d.notes,
            is_favorite: d.isBestDish,
            photo_url: d.photoUrl,
          })),
        };
      });

      const topDish = entries
        .flatMap((e) => e.dishes)
        .sort((a, b) => b.dish_rating - a.dish_rating)[0];
      const topRestaurant = [...entries].sort((a, b) => b.rating - a.rating)[0];

      return {
        month: monthLabel(key),
        month_key: key,
        total_visits: monthReviews.length,
        unique_cuisines: cuisines.size,
        average_rating: Math.round(avg * 10) / 10,
        top_meal: topDish?.dish_name ?? topRestaurant?.restaurant_name ?? null,
        entries,
      };
    });
}
