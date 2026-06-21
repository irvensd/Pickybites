import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { ui } from "@/constants/ui";
import { iconColors } from "@/constants/ui";
import { useThemeStore } from "@/store/useThemeStore";

export function ListPreviewCard({
  name,
  description,
  spotCount,
  previewNames,
  onPress,
}: {
  name: string;
  description: string;
  spotCount: number;
  previewNames: string[];
  onPress: () => void;
}) {
  const isDark = useThemeStore((s) => s.resolved) === "dark";

  return (
    <Pressable onPress={onPress}>
      <Card className="gap-3">
        <View className="flex-row items-start gap-3">
          <View className={`w-11 h-11 rounded-2xl items-center justify-center ${ui.surface.muted}`}>
            <Ionicons name="list" size={22} color={isDark ? iconColors.brandDark : iconColors.brand} />
          </View>
          <View className="flex-1 min-w-0">
            <Text className={`font-semibold text-base ${ui.text.primary}`} numberOfLines={1}>
              {name}
            </Text>
            {description ? (
              <Text className={`text-sm mt-0.5 ${ui.text.muted}`} numberOfLines={2}>
                {description}
              </Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? iconColors.mutedDark : iconColors.muted} />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className={`text-xs font-medium ${ui.text.secondary}`}>
            {spotCount} spot{spotCount === 1 ? "" : "s"}
          </Text>
          {previewNames.length > 0 ? (
            <Text className={`text-xs flex-1 text-right ml-3 ${ui.text.faint}`} numberOfLines={1}>
              {previewNames.slice(0, 3).join(" · ")}
            </Text>
          ) : (
            <Text className={`text-xs ${ui.text.faint}`}>Empty list</Text>
          )}
        </View>
      </Card>
    </Pressable>
  );
}
