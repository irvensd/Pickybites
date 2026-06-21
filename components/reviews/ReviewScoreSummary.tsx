import { View, Text } from "react-native";
import type { Review } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/review-scores";
import { ui } from "@/constants/ui";

export function ReviewScoreSummary({ review, compact = false }: { review: Review; compact?: boolean }) {
  if (compact) {
    const top = CATEGORY_LABELS.map(({ key, label }) => ({
      label: label.split(" ")[0],
      value: review.categoryScores[key],
    }));
    return (
      <View className="flex-row flex-wrap gap-x-3 gap-y-1">
        {top.map((item) => (
          <Text key={item.label} className={`text-xs ${ui.text.muted}`}>
            {item.label} {item.value.toFixed(1)}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {CATEGORY_LABELS.map(({ key, label }) => (
        <View key={key} className="rounded-lg px-2.5 py-1.5 bg-savr-100 dark:bg-savr-800">
          <Text className={`text-[10px] uppercase ${ui.text.muted}`}>{label}</Text>
          <Text className={`text-sm font-semibold ${ui.text.primary}`}>
            {review.categoryScores[key].toFixed(1)}
          </Text>
        </View>
      ))}
    </View>
  );
}
