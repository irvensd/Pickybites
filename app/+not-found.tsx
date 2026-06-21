import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";
import { ui } from "@/constants/ui";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View className={`flex-1 items-center justify-center px-6 ${ui.screen}`}>
        <Text className={`text-xl font-bold ${ui.text.primary}`}>Page not found</Text>
        <Link href="/" className="mt-4">
          <Text className={`font-medium ${ui.text.secondary}`}>Go home</Text>
        </Link>
      </View>
    </>
  );
}

