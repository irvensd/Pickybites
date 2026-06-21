import { View, Text } from "react-native";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { TasteDNA } from "@/lib/types";
import { formatScoreMetric } from "@/lib/taste-personality";
import { TastePersonalityCard } from "@/components/taste/TastePersonalityCard";
import { ui } from "@/constants/ui";
import { cn } from "@/lib/utils";

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-0.5">
      <Text className={`text-xs ${ui.text.muted}`}>{label}</Text>
      <Text className={`text-sm font-semibold ${ui.text.primary}`} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function TasteDNAPreviewSection({
  dna,
  quizCuisines,
  reviewCount,
}: {
  dna: TasteDNA;
  quizCuisines: string[];
  reviewCount: number;
  tasteLabel?: string;
}) {
  const topCuisine = dna.topCuisine ?? quizCuisines[0] ?? dna.mostReviewedCuisine ?? "—";
  const budget = dna.preferredPriceLevel ? formatPrice(dna.preferredPriceLevel) : "$$";
  const adventure = formatScoreMetric(dna.adventureScore, reviewCount, "adventure");

  return (
    <View className="gap-3 px-4">
      <Text className={`text-lg font-semibold ${ui.text.primary}`}>Taste DNA Preview</Text>

      <Card className={cn("gap-4 p-5", ui.accentCard)}>
        <TastePersonalityCard personality={dna.personality} compact />

        <View className="flex-row gap-4">
          <PreviewStat label="Top cuisine" value={topCuisine} />
          <PreviewStat label="Budget style" value={budget} />
          <PreviewStat label="Adventure" value={adventure} />
        </View>

        <Button label="View Taste DNA" variant="secondary" onPress={() => router.push("/taste-dna")} />
      </Card>
    </View>
  );
}
