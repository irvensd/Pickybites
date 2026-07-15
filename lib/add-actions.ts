import type { Href } from "expo-router";

export type AddAction = {
  href: Href;
  title: string;
  description: string;
};

/** Creation workflows opened from the center plus button / Add tab. */
export const ADD_ACTIONS: AddAction[] = [
  {
    href: "/add-review",
    title: "Restaurant Review",
    description: "Rate a spot, add dishes, photos, and tags",
  },
  {
    href: "/add-dish",
    title: "Quick Dish Log",
    description: "Add a dish to an existing review",
  },
  {
    href: "/(tabs)/discover",
    title: "Save To Bites",
    description: "Save a restaurant before you visit",
  },
];
