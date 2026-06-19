import { View } from "react-native";
import { Tag } from "@/components/ui/Tag";
import type { RestaurantCommunityTag } from "@/lib/restaurant-tags";

const TAG_COLORS: Partial<Record<RestaurantCommunityTag, string>> = {
  Trending: "bg-orange-100 dark:bg-orange-900/40",
  "Hidden Gem": "bg-emerald-100 dark:bg-emerald-900/40",
  "Date Night": "bg-pink-100 dark:bg-pink-900/40",
};

export function RestaurantTagRow({ tags }: { tags: RestaurantCommunityTag[] }) {
  if (!tags.length) return null;

  return (
    <View className="flex-row flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Tag key={tag} label={tag} size="sm" />
      ))}
    </View>
  );
}
