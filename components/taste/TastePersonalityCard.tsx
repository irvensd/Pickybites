import { View, Text } from "react-native";
import type { TastePersonalityProfile } from "@/lib/taste-personality";
import { Card } from "@/components/ui/Card";
import { ui } from "@/constants/ui";
import { cn } from "@/lib/utils";

export function TastePersonalityCard({
  personality,
  compact = false,
  className,
}: {
  personality: TastePersonalityProfile;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn(compact ? "gap-2 p-4" : "gap-3 p-5", className, ui.accentCard)}>
      <Text className={`text-xs uppercase tracking-widest font-semibold ${ui.text.muted}`}>
        Food personality
      </Text>
      <Text className={cn(compact ? "text-xl" : "text-2xl", `font-black ${ui.text.primary}`)}>
        {personality.headline}
      </Text>
      <Text className={`text-sm leading-5 ${ui.text.secondary}`} numberOfLines={compact ? 3 : undefined}>
        {personality.explanation}
      </Text>
    </Card>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 min-w-[46%] gap-1 rounded-xl px-3 py-3 bg-savr-100 dark:bg-savr-800">
      <Text className={`text-[10px] uppercase ${ui.text.muted}`}>{label}</Text>
      <Text className={`text-sm font-semibold ${ui.text.primary}`} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function TasteDNAStatsGrid({
  topCuisine,
  top3Cuisines,
  budgetStyle,
  adventureScore,
  mostVisitedCity,
  averageRating,
  favoriteRestaurantType,
  reviewCount,
}: {
  topCuisine: string;
  top3Cuisines: string[];
  budgetStyle: string;
  adventureScore: number;
  mostVisitedCity: string | null;
  averageRating: number;
  favoriteRestaurantType: string;
  reviewCount: number;
}) {
  const top3 = top3Cuisines.length ? top3Cuisines.join(", ") : "—";
  const adventure = reviewCount >= 3 ? String(adventureScore) : "Building profile";
  const avg = reviewCount > 0 ? averageRating.toFixed(1) : "—";

  return (
    <View className="flex-row flex-wrap gap-2">
      <StatTile label="Top Cuisine" value={topCuisine} />
      <StatTile label="Top 3 Cuisines" value={top3} />
      <StatTile label="Budget Style" value={budgetStyle} />
      <StatTile label="Adventure Score" value={adventure} />
      <StatTile label="Most Visited City" value={mostVisitedCity ?? "—"} />
      <StatTile label="Avg Rating Given" value={avg} />
      <StatTile label="Favorite Restaurant Type" value={favoriteRestaurantType} />
    </View>
  );
}
