/** Curated Unsplash food/restaurant images for mock data */
export const FOOD_IMAGES = {
  japanese: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
  italian: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
  mexican: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
  indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  caribbean: "https://images.unsplash.com/photo-1608039756161-2460f4a6f986?w=800&q=80",
  mediterranean: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
  thai: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
  korean: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&q=80",
  french: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  american: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
  chinese: "https://images.unsplash.com/photo-1526318896985-4d5495bdd9c7?w=800&q=80",
  vietnamese: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
  spanish: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800&q=80",
  greek: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80",
  sushi: "https://images.unsplash.com/photo-1611145437679-9624a4fe20da?w=800&q=80",
  tacos: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80",
  pasta: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  ramen: "https://images.unsplash.com/photo-1569718212165-3a8278dfe5bf?w=800&q=80",
  dessert: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80",
} as const;

export function cuisineImage(cuisine: string): string {
  const key = cuisine.toLowerCase() as keyof typeof FOOD_IMAGES;
  return FOOD_IMAGES[key] ?? FOOD_IMAGES.american;
}

