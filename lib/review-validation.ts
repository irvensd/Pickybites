import type { Cuisine, PriceLevel, ReviewCategoryScores, ReviewTag, WaitTime } from "./types";
import { validateCategoryScores } from "./review-scores";

export type ReviewSubmitPayload = {
  restaurantName?: string;
  restaurantId?: string;
  placeName?: string;
  rating: number;
  categoryScores: ReviewCategoryScores;
  ratingManualOverride?: boolean;
  waitTime?: WaitTime | null;
  wouldReturn?: boolean | null;
  wouldRecommend?: boolean | null;
  text: string;
  visitDate: string;
  cuisine?: Cuisine;
  city?: string;
  state?: string;
  priceLevel?: PriceLevel;
  tags: ReviewTag[];
  dishes: { name: string; rating: number; notes?: string; isBestDish?: boolean }[];
};

export type ReviewValidationResult = { ok: true } | { ok: false; error: string };

const MAX_REVIEW_TEXT = 500;

export function validateReviewSubmit(data: ReviewSubmitPayload): ReviewValidationResult {
  const hasRestaurant =
    Boolean(data.restaurantId?.trim()) ||
    Boolean(data.placeName?.trim()) ||
    Boolean(data.restaurantName?.trim());

  if (!hasRestaurant) {
    return { ok: false, error: "Restaurant name is required." };
  }

  const categoryError = validateCategoryScores(data.categoryScores);
  if (categoryError) {
    return { ok: false, error: categoryError };
  }

  if (!Number.isFinite(data.rating) || data.rating < 1 || data.rating > 10) {
    return { ok: false, error: "Overall rating must be between 1.0 and 10.0." };
  }

  if (!data.visitDate?.trim()) {
    return { ok: false, error: "Visit date is required." };
  }

  if (data.text.length > MAX_REVIEW_TEXT) {
    return { ok: false, error: `Review text must be ${MAX_REVIEW_TEXT} characters or less.` };
  }

  if (!data.restaurantId && !data.cuisine) {
    return { ok: false, error: "At least one cuisine is required for a new restaurant." };
  }

  for (const dish of data.dishes) {
    if (!dish.name.trim()) continue;
    if (!Number.isFinite(dish.rating) || dish.rating < 1 || dish.rating > 10) {
      return { ok: false, error: `Dish rating for "${dish.name}" must be between 1.0 and 10.0.` };
    }
  }

  return { ok: true };
}

export function clampRating(value: number) {
  return Math.min(10, Math.max(1, Math.round(value * 10) / 10));
}
