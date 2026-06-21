import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { ui } from "@/constants/ui";

export default function AddScreen() {
  return (
    <SafeAreaView className={`flex-1 ${ui.screen} px-4 pb-28`} edges={["top"]}>
      <View className="pt-2 mb-6">
        <Text className={`text-2xl font-bold text-center ${ui.text.primary}`}>Add</Text>
        <Text className={`text-sm text-center mt-1 ${ui.text.muted}`}>What do you want to log?</Text>
      </View>

      <Pressable onPress={() => router.push("/add-review")}>
        <Card className="flex-row items-center gap-4 mb-4">
          <View className="w-14 h-14 rounded-2xl bg-savr-600 items-center justify-center">
            <Ionicons name="create" size={28} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className={`font-semibold text-lg ${ui.text.primary}`}>Restaurant Review</Text>
            <Text className={`text-sm ${ui.text.muted}`}>Rate a spot, add dishes, photos, and tags</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#B8956F" />
        </Card>
      </Pressable>

      <Pressable onPress={() => router.push("/add-dish")}>
        <Card className="flex-row items-center gap-4 mb-4">
          <View className="w-14 h-14 rounded-2xl bg-savr-200 dark:bg-savr-700 items-center justify-center">
            <Ionicons name="fast-food" size={28} color="#A85D3F" />
          </View>
          <View className="flex-1">
            <Text className={`font-semibold text-lg ${ui.text.primary}`}>Quick Dish Log</Text>
            <Text className={`text-sm ${ui.text.muted}`}>Add a dish to an existing review</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#B8956F" />
        </Card>
      </Pressable>

      <Pressable onPress={() => router.push("/(tabs)/discover")}>
        <Card className="flex-row items-center gap-4">
          <View className="w-14 h-14 rounded-2xl bg-savr-100 dark:bg-savr-800 items-center justify-center">
            <Ionicons name="bookmark-outline" size={28} color="#A85D3F" />
          </View>
          <View className="flex-1">
            <Text className={`font-semibold text-lg ${ui.text.primary}`}>Save To Want To Try</Text>
            <Text className={`text-sm ${ui.text.muted}`}>Save a restaurant before you visit</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#B8956F" />
        </Card>
      </Pressable>
    </SafeAreaView>
  );
}
