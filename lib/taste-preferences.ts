import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PriceLevel } from "./types";

export type DietPreference = "None" | "Vegetarian" | "Vegan" | "Pescatarian" | "Gluten-Free";

export type FoodGoal =
  | "Try new cuisines"
  | "Find hidden gems"
  | "Date night spots"
  | "Eat healthier"
  | "Budget-friendly"
  | "Fine dining";

export type TastePreferences = {
  dietPreferences: DietPreference[];
  budgetRange: PriceLevel | null;
  favoriteRestaurant: string;
  foodGoals: FoodGoal[];
};

export const DIET_OPTIONS: DietPreference[] = ["None", "Vegetarian", "Vegan", "Pescatarian", "Gluten-Free"];

export const FOOD_GOAL_OPTIONS: FoodGoal[] = [
  "Try new cuisines",
  "Find hidden gems",
  "Date night spots",
  "Eat healthier",
  "Budget-friendly",
  "Fine dining",
];

export const BUDGET_OPTIONS: { label: string; value: PriceLevel }[] = [
  { label: "$", value: 1 },
  { label: "$$", value: 2 },
  { label: "$$$", value: 3 },
  { label: "$$$$", value: 4 },
];

const key = (userId: string) => `@forkloop/taste_prefs/${userId}`;

export async function loadTastePreferences(userId: string): Promise<TastePreferences | null> {
  const raw = await AsyncStorage.getItem(key(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TastePreferences;
  } catch {
    return null;
  }
}

export async function saveTastePreferences(userId: string, prefs: TastePreferences): Promise<void> {
  await AsyncStorage.setItem(key(userId), JSON.stringify(prefs));
}
