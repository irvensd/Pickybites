import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CUISINES, type Cuisine } from "@/lib/types";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { ui } from "@/constants/ui";
import { hapticSuccess } from "@/lib/haptics";

export default function TasteQuizScreen() {
  const completeTasteQuiz = useAppStore((s) => s.completeTasteQuiz);
  const reviews = useAppStore((s) => s.reviews);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const [selected, setSelected] = useState<Cuisine[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = (cuisine: Cuisine) => {
    setSelected((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : prev.length < 5 ? [...prev, cuisine] : prev
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const result = await completeTasteQuiz(selected);
    setLoading(false);
    if (!result.ok) setError(result.error);
    else {
      hapticSuccess();
      const myReviews = reviews.filter((r) => r.userId === currentUserId);
      if (myReviews.length === 0) router.replace("/add-review");
      else router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-savr-50 dark:bg-savr-950">
      <ScrollView contentContainerClassName="px-6 py-8 gap-5">
        <Text className="text-3xl font-bold text-savr-900 dark:text-savr-100">What do you love?</Text>
        <Text className="text-savr-600 dark:text-savr-400">
          Pick at least 3 cuisines so we can personalize your feed.
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {CUISINES.map((c) => (
            <Tag
              key={c}
              label={c}
              active={selected.includes(c)}
              onPress={() => toggle(c)}
            />
          ))}
        </View>
        <Text className={`text-sm ${ui.text.muted}`}>{selected.length} selected (min 3)</Text>
        {error ? <Text className="text-red-500 text-sm">{error}</Text> : null}
        <Button label="Continue" onPress={handleSubmit} loading={loading} disabled={selected.length < 3} />
      </ScrollView>
    </SafeAreaView>
  );
}
