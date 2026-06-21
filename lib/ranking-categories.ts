import type { Cuisine, Dish, Restaurant, Review, ReviewTag } from "./types";

export type CuisineRankingCategoryId =
  | "all"
  | "burgers"
  | "pizza"
  | "mexican"
  | "italian"
  | "jamaican"
  | "indian"
  | "vietnamese"
  | "thai"
  | "vegan";

export type TagRankingCategoryId =
  | "date-night"
  | "hidden-gem"
  | "worth-the-wait"
  | "family-friendly"
  | "quick-bite";

export type RankingCategoryId = CuisineRankingCategoryId | TagRankingCategoryId;

export type RankingCategory = {
  id: RankingCategoryId;
  label: string;
  group: "cuisine" | "tag";
};

export const CUISINE_RANKING_CATEGORIES: RankingCategory[] = [
  { id: "all", label: "All Restaurants", group: "cuisine" },
  { id: "burgers", label: "Burgers", group: "cuisine" },
  { id: "pizza", label: "Pizza", group: "cuisine" },
  { id: "mexican", label: "Mexican", group: "cuisine" },
  { id: "italian", label: "Italian", group: "cuisine" },
  { id: "jamaican", label: "Jamaican", group: "cuisine" },
  { id: "indian", label: "Indian", group: "cuisine" },
  { id: "vietnamese", label: "Vietnamese", group: "cuisine" },
  { id: "thai", label: "Thai", group: "cuisine" },
  { id: "vegan", label: "Vegan", group: "cuisine" },
];

export const TAG_RANKING_CATEGORIES: RankingCategory[] = [
  { id: "date-night", label: "Date Night", group: "tag" },
  { id: "hidden-gem", label: "Hidden Gem", group: "tag" },
  { id: "worth-the-wait", label: "Worth The Wait", group: "tag" },
  { id: "family-friendly", label: "Family Friendly", group: "tag" },
  { id: "quick-bite", label: "Quick Bite", group: "tag" },
];

export const ALL_RANKING_CATEGORIES = [...CUISINE_RANKING_CATEGORIES, ...TAG_RANKING_CATEGORIES];

const TAG_BY_CATEGORY: Partial<Record<TagRankingCategoryId, ReviewTag>> = {
  "date-night": "Date Night",
  "hidden-gem": "Hidden Gem",
  "worth-the-wait": "Worth the Wait",
  "family-friendly": "Family Friendly",
};

function includesAny(haystack: string, needles: string[]) {
  const lower = haystack.toLowerCase();
  return needles.some((n) => lower.includes(n));
}

function reviewDishes(reviewId: string, dishes: Dish[]) {
  return dishes.filter((d) => d.reviewId === reviewId);
}

function dishNamesMatch(dishes: Dish[], terms: string[]) {
  return dishes.some((d) => includesAny(d.name, terms));
}

function matchesCuisineCategory(
  category: CuisineRankingCategoryId,
  review: Review,
  restaurant: Restaurant,
  dishes: Dish[],
): boolean {
  const reviewDishList = reviewDishes(review.id, dishes);

  switch (category) {
    case "all":
      return true;
    case "burgers":
      return (
        includesAny(restaurant.name, ["burger", "smash", "patty"]) ||
        dishNamesMatch(reviewDishList, ["burger", "smash", "patty"]) ||
        (restaurant.cuisine === "American" &&
          (includesAny(restaurant.name, ["grill", "diner"]) ||
            dishNamesMatch(reviewDishList, ["burger", "cheeseburger", "slider"])))
      );
    case "pizza":
      return (
        includesAny(restaurant.name, ["pizza", "pizzeria"]) ||
        dishNamesMatch(reviewDishList, ["pizza", "margherita", "pepperoni"])
      );
    case "mexican":
      return restaurant.cuisine === "Mexican";
    case "italian":
      return restaurant.cuisine === "Italian";
    case "jamaican":
      return (
        restaurant.cuisine === "Caribbean" ||
        includesAny(restaurant.name, ["jamaican", "jerk"]) ||
        dishNamesMatch(reviewDishList, ["jerk", "jamaican"])
      );
    case "indian":
      return restaurant.cuisine === "Indian";
    case "vietnamese":
      return restaurant.cuisine === "Vietnamese";
    case "thai":
      return restaurant.cuisine === "Thai";
    case "vegan":
      return review.tags.includes("Vegan Friendly");
    default:
      return false;
  }
}

function matchesTagCategory(
  category: TagRankingCategoryId,
  review: Review,
  restaurant: Restaurant,
): boolean {
  if (category === "quick-bite") {
    return restaurant.priceLevel === 1 || (review.tags.includes("Casual") && restaurant.priceLevel <= 2);
  }

  const tag = TAG_BY_CATEGORY[category];
  return tag ? review.tags.includes(tag) : false;
}

export function reviewMatchesRankingCategory(
  categoryId: RankingCategoryId,
  review: Review,
  restaurant: Restaurant,
  dishes: Dish[],
): boolean {
  const category = ALL_RANKING_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return false;

  if (category.group === "tag") {
    return matchesTagCategory(categoryId as TagRankingCategoryId, review, restaurant);
  }

  return matchesCuisineCategory(categoryId as CuisineRankingCategoryId, review, restaurant, dishes);
}

export function getRankingCategoryLabel(categoryId: RankingCategoryId): string {
  return ALL_RANKING_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
}
