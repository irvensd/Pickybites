import { useState, useMemo } from "react";
import { View, Text, ScrollView, TextInput } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { JournalVisitCard } from "@/components/journal/JournalVisitCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tag } from "@/components/ui/Tag";
import { CUISINES, REVIEW_TAGS, type Cuisine, type ReviewTag } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";
import { useFoodJournal } from "@/hooks/useFoodJournal";
import { FOOD_JOURNAL_EMPTY } from "@/lib/foodJournal";
import { cn } from "@/lib/utils";

export default function JournalScreen() {
  const colors = useThemedColors();
  const { journal, isLoading, isEmpty, emptyMessage } = useFoodJournal();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [cuisine, setCuisine] = useState<Cuisine | null>(null);
  const [tag, setTag] = useState<ReviewTag | null>(null);

  const filtered = useMemo(() => {
    let months = journal;
    if (!query && !city && !cuisine && !tag) return months;

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
        if (tag) entries = entries.filter((e) => e.tags.includes(tag));
        return { ...month, entries };
      })
      .filter((m) => m.entries.length > 0);
  }, [journal, query, city, cuisine, tag]);

  const cities = useMemo(
    () => Array.from(new Set(journal.flatMap((m) => m.entries.map((e) => e.city)).filter(Boolean))),
    [journal],
  );

  return (
    <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
    <ScrollView contentContainerClassName="px-4 pb-28 gap-5 pt-2">
      <View>
        <Text className={`text-2xl font-bold ${ui.text.primary}`}>Food Journal</Text>
        <Text className={`text-sm mt-1 ${ui.text.muted}`}>Your personal timeline of every meal</Text>
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
            <View className="gap-1">
              <Text className={`text-lg font-bold ${ui.text.primary}`}>{month.month}</Text>
              <Text className={`text-sm ${ui.text.muted}`}>
                Visited {month.total_visits} restaurant{month.total_visits === 1 ? "" : "s"}
              </Text>
            </View>
            {month.entries.map((entry) => (
              <JournalVisitCard
                key={entry.review_id}
                review={{
                  id: entry.review_id,
                  userId: "",
                  restaurantId: "",
                  rating: entry.rating,
                  text: entry.review_text,
                  visitDate: entry.visit_date,
                  tags: entry.tags,
                  createdAt: entry.visit_date,
                }}
                restaurant={{
                  id: entry.review_id,
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
