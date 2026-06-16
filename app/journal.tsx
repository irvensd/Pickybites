import { useState, useMemo } from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tag } from "@/components/ui/Tag";
import { CUISINES, REVIEW_TAGS, type Cuisine, type ReviewTag } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";
import { cn } from "@/lib/utils";

function monthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function JournalScreen() {
  const colors = useThemedColors();
  const { currentUserId, reviews, restaurants } = useAppStore();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [cuisine, setCuisine] = useState<Cuisine | null>(null);
  const [tag, setTag] = useState<ReviewTag | null>(null);

  const myReviews = reviews.filter((r) => r.userId === currentUserId);

  const cities = useMemo(
    () => Array.from(new Set(myReviews.map((r) => restaurants.find((x) => x.id === r.restaurantId)?.city).filter(Boolean))) as string[],
    [myReviews, restaurants],
  );

  const filtered = useMemo(() => {
    let items = myReviews;
    if (query) {
      const q = query.toLowerCase();
      items = items.filter((r) => {
        const rest = restaurants.find((x) => x.id === r.restaurantId);
        return r.text.toLowerCase().includes(q) || rest?.name.toLowerCase().includes(q) || rest?.city.toLowerCase().includes(q);
      });
    }
    if (city) items = items.filter((r) => restaurants.find((x) => x.id === r.restaurantId)?.city === city);
    if (cuisine) items = items.filter((r) => restaurants.find((x) => x.id === r.restaurantId)?.cuisine === cuisine);
    if (tag) items = items.filter((r) => r.tags.includes(tag));
    return items.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  }, [myReviews, restaurants, query, city, cuisine, tag]);

  const timeline = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    filtered.forEach((r) => {
      const key = monthKey(r.visitDate);
      const arr = groups.get(key) ?? [];
      arr.push(r);
      groups.set(key, arr);
    });
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <ScrollView className="flex-1 bg-savr-50 dark:bg-savr-950" contentContainerClassName="px-4 pb-6 gap-4">
      <View className={cn("flex-row items-center rounded-xl px-3 min-h-[52px]", ui.surface.search)}>
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
          {CUISINES.slice(0, 6).map((c) => (
            <Tag key={c} label={c} active={cuisine === c} onPress={() => setCuisine(cuisine === c ? null : c)} size="sm" />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <Text className={`text-xs font-semibold uppercase ${ui.text.muted}`}>Tag</Text>
        <View className="flex-row flex-wrap gap-2">
          <Tag label="All" active={!tag} onPress={() => setTag(null)} size="sm" />
          {REVIEW_TAGS.slice(0, 5).map((t) => (
            <Tag key={t} label={t} active={tag === t} onPress={() => setTag(tag === t ? null : t)} size="sm" />
          ))}
        </View>
      </View>

      {myReviews.length === 0 ? (
        <EmptyState
          icon="book-outline"
          title="Your journal is empty"
          description="Every review you write shows up here — your personal log of everywhere you've eaten."
          actionLabel="Write Your First Review"
          onAction={() => router.push("/add-review")}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="search-outline" title="No matches" description="Try adjusting your filters or search term." />
      ) : (
        timeline.map(([month, entries]) => (
          <View key={month} className="gap-3">
            <Text className="text-sm font-bold text-savr-700 dark:text-savr-300 uppercase tracking-wide">{monthLabel(month)}</Text>
            {entries.map((r) => <ReviewCard key={r.id} review={r} />)}
          </View>
        ))
      )}
    </ScrollView>
  );
}
