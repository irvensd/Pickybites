import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { ADD_ACTIONS } from "@/lib/add-actions";
import { ui } from "@/constants/ui";

const ACTION_ICONS = ["create", "fast-food", "bookmark-outline"] as const;
const ACTION_TONES = ["primary", "secondary", "muted"] as const;

export default function AddScreen() {
  return (
    <SafeAreaView className={`flex-1 ${ui.screen} px-4 pb-28`} edges={["top"]}>
      <View className="pt-2 mb-6">
        <Text className={`text-2xl font-bold text-center ${ui.text.primary}`}>Add</Text>
        <Text className={`text-sm text-center mt-1 ${ui.text.muted}`}>What do you want to log?</Text>
      </View>

      {ADD_ACTIONS.map((action, index) => {
        const tone = ACTION_TONES[index] ?? "muted";
        const icon = ACTION_ICONS[index] ?? "add";
        return (
          <Pressable key={action.title} onPress={() => router.push(action.href)} className="mb-4">
            <Card className="flex-row items-center gap-4">
              <View
                className={
                  tone === "primary"
                    ? "w-14 h-14 rounded-2xl bg-savr-600 items-center justify-center"
                    : tone === "secondary"
                      ? "w-14 h-14 rounded-2xl bg-savr-200 dark:bg-savr-700 items-center justify-center"
                      : "w-14 h-14 rounded-2xl bg-savr-100 dark:bg-savr-800 items-center justify-center"
                }
              >
                <Ionicons name={icon} size={28} color={tone === "primary" ? "#fff" : "#A85D3F"} />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold text-lg ${ui.text.primary}`}>{action.title}</Text>
                <Text className={`text-sm ${ui.text.muted}`}>{action.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B8956F" />
            </Card>
          </Pressable>
        );
      })}
    </SafeAreaView>
  );
}
