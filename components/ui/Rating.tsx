import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatRating } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { iconColors } from "@/constants/ui";

export function Rating({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const isDark = useThemeStore((s) => s.resolved) === "dark";
  const sizes = { sm: 14, md: 16, lg: 20 };
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-lg" };
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name="star" size={sizes[size]} color={isDark ? iconColors.starDark : iconColors.star} />
      <Text className={`font-bold text-savr-900 dark:text-savr-100 ${textSize[size]}`}>{formatRating(value)}</Text>
    </View>
  );
}

