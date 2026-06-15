import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View className="flex-1 items-center justify-center bg-savr-50 px-6">
        <Text className="text-xl font-bold text-savr-900">Page not found</Text>
        <Link href="/" className="mt-4"><Text className="text-savr-600 font-medium">Go home</Text></Link>
      </View>
    </>
  );
}
