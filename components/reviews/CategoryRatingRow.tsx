import { View, Text, Pressable } from "react-native";
import { clampRating } from "@/lib/review-validation";
import { ui } from "@/constants/ui";
import { cn } from "@/lib/utils";

export function CategoryRatingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const step = (delta: number) => onChange(clampRating(value + delta));

  return (
    <View className="flex-row items-center justify-between gap-3 py-2">
      <Text className={`flex-1 text-sm font-medium ${ui.text.secondary}`}>{label}</Text>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => step(-0.5)}
          className={cn("w-9 h-9 rounded-xl items-center justify-center", ui.surface.muted)}
        >
          <Text className={`text-lg ${ui.text.primary}`}>−</Text>
        </Pressable>
        <Text className={`w-10 text-center font-bold ${ui.text.primary}`}>{value.toFixed(1)}</Text>
        <Pressable
          onPress={() => step(0.5)}
          className={cn("w-9 h-9 rounded-xl items-center justify-center", ui.surface.muted)}
        >
          <Text className={`text-lg ${ui.text.primary}`}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
