import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { CountUpText } from "@/components/ui/CountUpText";
import { FadeInView } from "@/components/ui/FadeInView";
import { formatPrice } from "@/lib/utils";
import type { TasteDNA } from "@/lib/types";
import { formatScoreMetric, getTastePersonality } from "@/lib/taste-personality";
import { ui } from "@/constants/ui";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon,
  numericValue,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  numericValue?: number;
}) {
  return (
    <Card className="flex-1 p-4 gap-2 min-h-[108px] justify-between">
      <Ionicons name={icon} size={20} color="#A85D3F" />
      <View>
        <Text className={`text-xs ${ui.text.muted}`}>{label}</Text>
        {numericValue != null && numericValue > 0 && value === String(numericValue) ? (
          <CountUpText value={numericValue} className={`text-lg font-bold mt-0.5 ${ui.text.primary}`} />
        ) : (
          <Text className={`text-lg font-bold mt-0.5 ${ui.text.primary}`}>{value}</Text>
        )}
      </View>
    </Card>
  );
}

export function TasteProfileSection({
  dna,
  quizCuisines,
  reviewCount,
  tasteLabel,
}: {
  dna: TasteDNA;
  quizCuisines: string[];
  reviewCount: number;
  tasteLabel?: string;
}) {
  const topCuisine =
    dna.favoriteCuisines[0]?.cuisine ?? quizCuisines[0] ?? dna.mostReviewedCuisine ?? "Calculating...";
  const budget = dna.preferredPriceLevel ? formatPrice(dna.preferredPriceLevel) : "$$";
  const personality = tasteLabel ?? getTastePersonality(dna, reviewCount, quizCuisines);
  const adventure = formatScoreMetric(dna.adventureScore, reviewCount, "adventure");
  const hiddenGem = formatScoreMetric(dna.hiddenGemScore, reviewCount, "hidden-gem");

  return (
    <FadeInView className="gap-3 px-4">
      <Text className={`text-lg font-semibold ${ui.text.primary}`}>Your Taste Profile</Text>

      <Card className={cn("items-center py-5 px-4 gap-1", ui.accentCard)}>
        <Text className={`text-xs uppercase tracking-widest font-semibold ${ui.text.muted}`}>You are a</Text>
        <Text className={`text-2xl font-black ${ui.text.primary}`}>{personality}</Text>
      </Card>

      <View className="flex-row gap-3">
        <StatCard label="Top Cuisine" value={topCuisine} icon="restaurant-outline" />
        <StatCard
          label="Adventure Score"
          value={adventure}
          icon="compass-outline"
          numericValue={dna.adventureScore > 0 ? dna.adventureScore : undefined}
        />
      </View>
      <View className="flex-row gap-3">
        <StatCard
          label="Hidden Gem Hunter"
          value={hiddenGem}
          icon="diamond-outline"
          numericValue={dna.hiddenGemScore > 0 ? dna.hiddenGemScore : undefined}
        />
        <StatCard label="Budget Style" value={budget} icon="wallet-outline" />
      </View>
    </FadeInView>
  );
}
