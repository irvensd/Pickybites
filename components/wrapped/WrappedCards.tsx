import { View, Text } from "react-native";
import type { FoodWrappedSummary } from "@/lib/food-wrapped";
import {
  WrappedCardShell,
  WrappedEyebrow,
  WrappedHeroText,
  WrappedStat,
  WrappedFooter,
  WRAPPED_GRADIENTS,
} from "./WrappedCardShell";
import { formatPrice } from "@/lib/utils";

type CardProps = {
  summary: FoodWrappedSummary;
  displayName: string;
  shareMode?: boolean;
};

export function WrappedIntroCard({ summary, displayName, shareMode }: CardProps) {
  return (
    <WrappedCardShell gradient={WRAPPED_GRADIENTS.intro} shareMode={shareMode}>
      <View style={{ gap: 16, flex: 1, justifyContent: "center" }}>
        <WrappedEyebrow>PickyBites Wrapped</WrappedEyebrow>
        <WrappedHeroText size="xxl">{summary.headline}</WrappedHeroText>
        <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 26 }}>
          {displayName}&apos;s taste story — {summary.periodLabel}
        </Text>
      </View>
      <WrappedFooter />
    </WrappedCardShell>
  );
}

export function WrappedRestaurantsCard({ summary, shareMode }: CardProps) {
  const yoy =
    summary.priorPeriodRestaurants > 0
      ? summary.restaurantsVisited - summary.priorPeriodRestaurants
      : null;

  return (
    <WrappedCardShell gradient={WRAPPED_GRADIENTS.stats} shareMode={shareMode}>
      <View style={{ gap: 20, flex: 1, justifyContent: "center" }}>
        <WrappedEyebrow>You ate out</WrappedEyebrow>
        <WrappedStat value={String(summary.restaurantsVisited)} label="restaurants visited" />
        <View style={{ flexDirection: "row", gap: 24 }}>
          <View>
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800" }}>{summary.cuisinesTried}</Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>cuisines tried</Text>
          </View>
          <View>
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800" }}>{summary.averageRating.toFixed(1)}</Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>avg rating</Text>
          </View>
        </View>
        {yoy != null && yoy !== 0 ? (
          <Text style={{ color: "#FDE68A", fontSize: 16, fontWeight: "700" }}>
            {yoy > 0 ? `+${yoy}` : yoy} vs last period
          </Text>
        ) : null}
      </View>
      <WrappedFooter />
    </WrappedCardShell>
  );
}

export function WrappedCuisineCard({ summary, shareMode }: CardProps) {
  return (
    <WrappedCardShell gradient={WRAPPED_GRADIENTS.cuisine} shareMode={shareMode}>
      <View style={{ gap: 16, flex: 1, justifyContent: "center" }}>
        <WrappedEyebrow>Favorite Cuisine</WrappedEyebrow>
        <WrappedHeroText size="xxl">{summary.favoriteCuisine ?? "—"}</WrappedHeroText>
        {summary.mostVisitedCuisine && summary.mostVisitedRestaurant ? (
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 17, lineHeight: 24 }}>
            You kept going back to {summary.mostVisitedRestaurant.restaurant.name} —{" "}
            {summary.mostVisitedRestaurant.visitCount} visit
            {summary.mostVisitedRestaurant.visitCount === 1 ? "" : "s"}.
          </Text>
        ) : null}
      </View>
      <WrappedFooter />
    </WrappedCardShell>
  );
}

export function WrappedBestRestaurantCard({ summary, shareMode }: CardProps) {
  const best = summary.highestRatedRestaurant;
  return (
    <WrappedCardShell gradient={WRAPPED_GRADIENTS.best} shareMode={shareMode}>
      <View style={{ gap: 16, flex: 1, justifyContent: "center" }}>
        <WrappedEyebrow>Best Restaurant</WrappedEyebrow>
        <WrappedHeroText size="xl">{best?.restaurant.name ?? "—"}</WrappedHeroText>
        {best ? (
          <>
            <Text style={{ color: "#FEF08A", fontSize: 48, fontWeight: "900" }}>{best.rating.toFixed(1)}</Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
              {best.restaurant.cuisine} · {best.restaurant.city}
            </Text>
          </>
        ) : null}
      </View>
      <WrappedFooter />
    </WrappedCardShell>
  );
}

export function WrappedHiddenGemCard({ summary, shareMode }: CardProps) {
  const gem = summary.hiddenGemOfPeriod;
  return (
    <WrappedCardShell gradient={WRAPPED_GRADIENTS.hidden} shareMode={shareMode}>
      <View style={{ gap: 16, flex: 1, justifyContent: "center" }}>
        <WrappedEyebrow>Hidden Gem of the Period</WrappedEyebrow>
        <WrappedHeroText size="xl">{gem?.restaurant.name ?? "Still searching"}</WrappedHeroText>
        <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 26 }}>
          {summary.hiddenGemsDiscovered} hidden gem{summary.hiddenGemsDiscovered === 1 ? "" : "s"} discovered
          {gem ? ` · rated ${gem.rating.toFixed(1)}` : ""}.
        </Text>
      </View>
      <WrappedFooter />
    </WrappedCardShell>
  );
}

export function WrappedTasteDnaCard({ summary, shareMode }: CardProps) {
  return (
    <WrappedCardShell gradient={WRAPPED_GRADIENTS.dna} shareMode={shareMode}>
      <View style={{ gap: 16, flex: 1, justifyContent: "center" }}>
        <WrappedEyebrow>Taste DNA Evolution</WrappedEyebrow>
        <WrappedHeroText size="lg">{summary.tasteDnaLabel}</WrappedHeroText>
        <Text style={{ color: "rgba(255,255,255,0.88)", fontSize: 17, lineHeight: 26 }}>
          {summary.tasteDnaExplanation}
        </Text>
        <View style={{ flexDirection: "row", gap: 20, marginTop: 8 }}>
          <View>
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}>{summary.adventureScore}</Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>adventure</Text>
          </View>
          {summary.adventureScoreGrowth != null ? (
            <View>
              <Text style={{ color: "#F9A8D4", fontSize: 24, fontWeight: "800" }}>
                {summary.adventureScoreGrowth > 0 ? "+" : ""}
                {summary.adventureScoreGrowth}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>cuisine growth</Text>
            </View>
          ) : null}
        </View>
        {summary.priorTasteDnaLabel && summary.priorTasteDnaLabel !== summary.tasteDnaLabel ? (
          <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>
            Was {summary.priorTasteDnaLabel} last period
          </Text>
        ) : null}
      </View>
      <WrappedFooter />
    </WrappedCardShell>
  );
}

export function WrappedTop5Card({ summary, shareMode }: CardProps) {
  return (
    <WrappedCardShell gradient={WRAPPED_GRADIENTS.top5} shareMode={shareMode}>
      <View style={{ gap: 14, flex: 1, justifyContent: "center" }}>
        <WrappedEyebrow>Top 5 Restaurants</WrappedEyebrow>
        {summary.top5Restaurants.length === 0 ? (
          <WrappedHeroText size="lg">No rankings yet</WrappedHeroText>
        ) : (
          summary.top5Restaurants.map((item, index) => (
            <View key={item.restaurant.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ color: "#E9D5FF", fontSize: 22, fontWeight: "900", width: 28 }}>{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }} numberOfLines={1}>
                  {item.restaurant.name}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{item.restaurant.cuisine}</Text>
              </View>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>{item.rating.toFixed(1)}</Text>
            </View>
          ))
        )}
      </View>
      <WrappedFooter />
    </WrappedCardShell>
  );
}

export function WrappedSummaryCard({ summary, displayName, shareMode }: CardProps) {
  return (
    <WrappedCardShell gradient={WRAPPED_GRADIENTS.finale} shareMode={shareMode}>
      <View style={{ gap: 14, flex: 1, justifyContent: "center" }}>
        <WrappedEyebrow>Final Summary</WrappedEyebrow>
        <WrappedHeroText size="lg">{`${displayName}'s ${summary.periodLabel}`}</WrappedHeroText>
        <View style={{ gap: 10 }}>
          <SummaryRow label="Restaurants" value={String(summary.restaurantsVisited)} />
          <SummaryRow label="Favorite cuisine" value={summary.favoriteCuisine ?? "—"} />
          <SummaryRow label="Best spot" value={summary.highestRatedRestaurant?.restaurant.name ?? "—"} />
          <SummaryRow label="Neighborhood" value={summary.favoriteNeighborhood ?? "—"} />
          <SummaryRow
            label="Best value"
            value={summary.bestValueRestaurant?.restaurant.name ?? "—"}
          />
          <SummaryRow
            label="Splurge meal"
            value={
              summary.mostExpensiveMeal
                ? `${summary.mostExpensiveMeal.restaurant.name} (${formatPrice(summary.mostExpensiveMeal.restaurant.priceLevel)})`
                : "—"
            }
          />
          <SummaryRow label="Taste DNA" value={summary.tasteDnaLabel} />
        </View>
      </View>
      <WrappedFooter />
    </WrappedCardShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{label}</Text>
      <Text
        style={{ color: "#fff", fontSize: 14, fontWeight: "700", flex: 1, textAlign: "right" }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export const WRAPPED_CARD_COUNT = 8;

export function renderWrappedCard(
  index: number,
  summary: FoodWrappedSummary,
  displayName: string,
  shareMode = false,
) {
  const props = { summary, displayName, shareMode };
  switch (index) {
    case 0:
      return <WrappedIntroCard {...props} />;
    case 1:
      return <WrappedRestaurantsCard {...props} />;
    case 2:
      return <WrappedCuisineCard {...props} />;
    case 3:
      return <WrappedBestRestaurantCard {...props} />;
    case 4:
      return <WrappedHiddenGemCard {...props} />;
    case 5:
      return <WrappedTasteDnaCard {...props} />;
    case 6:
      return <WrappedTop5Card {...props} />;
    case 7:
      return <WrappedSummaryCard {...props} />;
    default:
      return null;
  }
}
