import { View, Text } from "react-native";

export function TasteMatchBadge({
  percent,
  detail,
  size = "md",
}: {
  percent: number;
  detail?: string;
  size?: "sm" | "md" | "lg";
}) {
  if (percent <= 0) return null;

  const color =
    percent >= 80 ? "bg-emerald-100 dark:bg-emerald-900/40" :
    percent >= 60 ? "bg-savr-100 dark:bg-savr-800" :
    "bg-amber-100 dark:bg-amber-900/40";

  const textColor =
    percent >= 80 ? "text-emerald-800 dark:text-emerald-200" :
    percent >= 60 ? "text-savr-800 dark:text-savr-200" :
    "text-amber-800 dark:text-amber-200";

  const textSize = size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs";
  const percentSize = size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm";

  return (
    <View className={`${color} px-4 py-2 rounded-2xl items-center`}>
      <View className="flex-row items-baseline gap-1">
        <Text className={`${percentSize} font-bold ${textColor}`}>{percent}%</Text>
        <Text className={`${textSize} ${textColor}`}>taste match</Text>
      </View>
      {detail ? <Text className={`text-xs ${textColor} opacity-80 mt-0.5`}>{detail}</Text> : null}
    </View>
  );
}
