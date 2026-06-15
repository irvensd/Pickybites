import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AddScreen() {
  return (
    <SafeAreaView className="flex-1 bg-savr-50 dark:bg-savr-950 px-4 pb-28" edges={["top"]}>
      <Text className="text-2xl font-bold text-savr-900 dark:text-savr-100 pt-2 text-center">Add Review</Text>
      <Text className="text-sm text-savr-500 dark:text-savr-400 text-center mt-1 mb-6">Log a new food experience</Text>
      <Pressable onPress={() => router.push("/add-review")}>
        <Card className="flex-row items-center gap-4 mb-4">
          <View className="w-14 h-14 rounded-2xl bg-savr-600 items-center justify-center">
            <Ionicons name="create" size={28} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-lg text-savr-900">Restaurant Review</Text>
            <Text className="text-sm text-savr-500">Rate a spot, add dishes, photos, and tags</Text>
          </View>
        </Card>
      </Pressable>
      <Card className="flex-row items-center gap-4 opacity-50">
        <View className="w-14 h-14 rounded-2xl bg-savr-200 items-center justify-center">
          <Ionicons name="fast-food" size={28} color="#A85D3F" />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-lg text-savr-900">Quick Dish Log</Text>
          <Text className="text-sm text-savr-500">Add a dish to an existing review</Text>
        </View>
      </Card>
      <View className="mt-8">
        <Button label="Write a Review" onPress={() => router.push("/add-review")} />
      </View>
    </SafeAreaView>
  );
}
