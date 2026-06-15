import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatRating } from "@/lib/utils";

export function Rating({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: 14, md: 16, lg: 20 };
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-lg" };
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name="star" size={sizes[size]} color="#C4785A" />
      <Text className={`font-bold text-savr-900 ${textSize[size]}`}>{formatRating(value)}</Text>
    </View>
  );
}
