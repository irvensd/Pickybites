import { View, Text } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";

export default function AddDishScreen() {
  return (
    <View className="flex-1 bg-savr-50 items-center justify-center px-6 gap-4">
      <Text className="text-lg font-semibold text-savr-900 text-center">Add dishes from a restaurant review</Text>
      <Text className="text-sm text-savr-500 text-center">Use Add Review to log dishes with your restaurant visit.</Text>
      <Button label="Write a Review" onPress={() => router.replace("/add-review")} />
    </View>
  );
}
