import { useState, useMemo } from "react";
import { View, Text, ScrollView, TextInput } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { JournalVisitCard } from "@/components/journal/JournalVisitCard";
import { JournalMonthSummary } from "@/components/journal/JournalMonthSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tag } from "@/components/ui/Tag";
import { CUISINES, type Cuisine } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";
import { useFoodJournal } from "@/hooks/useFoodJournal";
import { useAppStore } from "@/store/useAppStore";
import { FOOD_JOURNAL_EMPTY } from "@/lib/foodJournal";
import { cn } from "@/lib/utils";

export default function JournalScreen() {
  const colors = useThemedColors();
  const currentUserId = useAppStore((s) => s.currentUserId);
  const { journal, isLoading, isEmpty, emptyMessage } = useFoodJournal();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [cuisine, setCuisine] = useState<Cuisine | null>(null);

  const filtered = useMemo(() => {
    let months = journal;
    if (!query && !city && !cuisine) return months;

    return months
      .map((month) => {
        let entries = month.entries;
        if (query) {
          const q = query.toLowerCase();
          entries = entries.filter(
            (e) =>
              e.restaurant_name.toLowerCase().includes(q) ||
              e.review_text.toLowerCase().includes(q) ||
              e.city.toLowerCase().includes(q),
          );
        }
        if (city) entries = entries.filter((e) => e.city === city);
        if (cuisine) entries = entries.filter((e) => e.cuisine === cuisine);
        return { ...month, entries };
      })
      .filter((m) => m.entries.length > 0);
  }, [journal, query, city, cuisine]);

  const cities = useMemo(
    () => Array.from(new Set(journal.flatMap((m) => m.entries.map((e) => e.city)).filter(Boolean))),
    [journal],
  );

  return (
    <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
      <ScrollView contentContainerClassName="px-4 pb-28 gap-5 pt-2">
        <View>
          <Text className={`text-2xl font-bold ${ui.text.primary}`}>Journal</Text>
          <Text className={`text-sm mt-1 ${ui.text.muted}`}>What have I eaten?</Text>
        </View>

        <View className={cn("flex-row items-center rounded-2xl px-4 min-h-[52px]", ui.surface.search)}>
          <Ionicons name="search" size={20} color={colors.iconMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search visits..."
            className={`flex-1 ml-2 text-base ${ui.text.primary}`}
            placeholderTextColor={colors.placeholder}
          />
        </View>

        {cities.length > 0 && (
          <View className="gap-2">
            <Text className={`text-xs font-semibold uppercase ${ui.text.muted}`}>City</Text>
            <View className="flex-row flex-wrap gap-2">
              <Tag label="All" active={!city} onPress={() => setCity(null)} size="sm" />
              {cities.map((c) => (
                <Tag key={c} label={c} active={city === c} onPress={() => setCity(city === c ? null : c)} size="sm" />
              ))}
            </View>
          </View>
        )}

        <View className="gap-2">
          <Text className={`text-xs font-semibold uppercase ${ui.text.muted}`}>Cuisine</Text>
          <View className="flex-row flex-wrap gap-2">
            <Tag label="All" active={!cuisine} onPress={() => setCuisine(null)} size="sm" />
            {CUISINES.slice(0, 8).map((c) => (
              <Tag key={c} label={c} active={cuisine === c} onPress={() => setCuisine(cuisine === c ? null : c)} size="sm" />
            ))}
          </View>
        </View>

        {isLoading ? (
          <Text className={`text-center py-8 ${ui.text.muted}`}>Loading your journal…</Text>
        ) : isEmpty ? (
          <EmptyState
            icon="book-outline"
            title="Your journal is empty"
            description={emptyMessage || FOOD_JOURNAL_EMPTY}
            actionLabel="Write Your First Review"
            onAction={() => router.push("/add-review")}
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon="search-outline" title="No matches" description="Try adjusting your filters or search term." />
        ) : (
          filtered.map((month) => (
            <View key={month.month_key} className="gap-4">
              <JournalMonthSummary month={month} />
              {month.entries.map((entry) => (
                <JournalVisitCard
                  key={entry.review_id}
                  entry={entry}
                  review={{
                    id: entry.review_id,
                    userId: currentUserId ?? "",
                    restaurantId: entry.restaurant_id ?? "",
                    rating: entry.rating,
                    categoryScores: entry.category_scores,
                    ratingManualOverride: entry.rating_manual_override,
                    waitTime: entry.wait_time,
                    wouldReturn: entry.would_return,
                    wouldRecommend: entry.would_recommend,
                    text: entry.review_text,
                    visitDate: entry.visit_date,
                    tags: entry.tags,
                    createdAt: entry.visit_date,
                  }}
                  restaurant={{
                    id: entry.restaurant_id ?? entry.review_id,
                    name: entry.restaurant_name,
                    address: "",
                    city: entry.city,
                    cuisine: entry.cuisine as Cuisine,
                    priceLevel: 2,
                    imageUrl: entry.photos[0] ?? null,
                    createdAt: entry.visit_date,
                  }}
                  photoUrl={entry.photos[0]}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
