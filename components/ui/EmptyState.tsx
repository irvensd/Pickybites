import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./Button";

type IconName = keyof typeof Ionicons.glyphMap;

export function EmptyState({
  icon = "restaurant-outline",
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="items-center justify-center py-12 px-6">
      <View className="w-20 h-20 rounded-full bg-savr-100 dark:bg-savr-800 items-center justify-center mb-4">
        <Ionicons name={icon} size={36} color="#A85D3F" />
      </View>
      <Text className="text-lg font-semibold text-savr-900 dark:text-savr-100 text-center">{title}</Text>
      {description && (
        <Text className="text-sm text-savr-500 dark:text-savr-400 text-center mt-2 leading-5 max-w-[280px]">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <View className="mt-6 w-full">
          <Button label={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}
