import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { HeaderBackButtonProps } from "@react-navigation/elements";
import type { Href } from "expo-router";
import { goBackOr } from "@/lib/navigation";

type StackBackButtonProps = Partial<HeaderBackButtonProps> & {
  fallback?: Href;
};

/** Reliable back for stack screens — always tappable; pops history or navigates to fallback. */
export function StackBackButton({
  fallback = "/(tabs)/profile",
  tintColor = "#1E2330",
}: StackBackButtonProps) {
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => goBackOr(fallback, navigation)}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      className="px-1 py-1 -ml-1"
    >
      <Ionicons name="chevron-back" size={28} color={tintColor} />
    </Pressable>
  );
}
