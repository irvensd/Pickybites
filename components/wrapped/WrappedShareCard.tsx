import type { FoodWrappedSummary } from "@/lib/food-wrapped";
import { WrappedSummaryCard } from "./WrappedCards";

/** Shareable 9:16 story card — uses final summary slide. */
export function WrappedShareCard({
  summary,
  displayName,
}: {
  summary: FoodWrappedSummary;
  displayName: string;
}) {
  return <WrappedSummaryCard summary={summary} displayName={displayName} shareMode />;
}
