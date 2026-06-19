import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";

export function HomeSectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const colors = useThemedColors();
  return (
    <View className="gap-1">
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={18} color={colors.brand} />
        <Text className={`text-lg font-semibold ${ui.text.primary}`}>{title}</Text>
      </View>
      {subtitle ? <Text className={`text-sm ${ui.text.muted}`}>{subtitle}</Text> : null}
    </View>
  );
}
