import { View, Text } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { hapticSuccess } from "@/lib/haptics";

const slides = [
  { icon: "star" as const, title: "Rate every bite", desc: "Score restaurants and dishes from 1.0 to 10.0" },
  { icon: "trophy" as const, title: "Build your rankings", desc: "Auto-ranked top 10 restaurants and dishes" },
  { icon: "sparkles" as const, title: "Discover your Taste DNA", desc: "Personalized picks based on your palate" },
];

export default function Onboarding() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const demoLogin = useAppStore((s) => s.demoLogin);

  const handleDemo = () => {
    if (demoLogin()) {
      hapticSuccess();
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-savr-50 dark:bg-savr-950">
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-2xl bg-savr-600 items-center justify-center mb-4">
            <Text className="text-white text-2xl font-bold">S</Text>
          </View>
          <Text className="text-4xl font-bold text-savr-900 dark:text-savr-100 text-center">Savr</Text>
          <Text className="text-lg text-savr-600 dark:text-savr-400 text-center mt-2">Your taste, mapped.</Text>
        </View>
        <View className="gap-4">
          {slides.map((s) => (
            <View key={s.title} className="flex-row gap-4 bg-white dark:bg-savr-800 rounded-2xl p-4 border border-savr-100 dark:border-savr-700">
              <Ionicons name={s.icon} size={24} color="#A85D3F" />
              <View className="flex-1">
                <Text className="font-semibold text-savr-900 dark:text-savr-100">{s.title}</Text>
                <Text className="text-sm text-savr-500 dark:text-savr-400 mt-0.5">{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View className="px-6 pb-6 gap-3">
        <Button label="Try Demo — Skip Setup" variant="demo" onPress={handleDemo} />
        <Button label="Get Started" onPress={() => { completeOnboarding(); router.replace("/signup"); }} />
        <Button label="I have an account" variant="secondary" onPress={() => { completeOnboarding(); router.replace("/login"); }} />
      </View>
    </SafeAreaView>
  );
}
