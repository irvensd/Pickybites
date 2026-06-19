export function calculateTasteLevel(reviewCount: number, restaurantCount: number, cuisineCount: number) {
  const base = Math.floor(reviewCount / 10);
  const breadth = Math.floor(restaurantCount / 8);
  const variety = Math.floor(cuisineCount / 3);
  return Math.max(1, base + breadth + variety);
}
