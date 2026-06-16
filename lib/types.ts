export type PriceLevel = 1 | 2 | 3 | 4;

export type ReviewTag =
  | "Date Night"
  | "Casual"
  | "Hidden Gem"
  | "Vegan Friendly"
  | "Worth the Wait"
  | "Overrated"
  | "Great Service"
  | "Bad Service";

export const REVIEW_TAGS: ReviewTag[] = [
  "Date Night",
  "Casual",
  "Hidden Gem",
  "Vegan Friendly",
  "Worth the Wait",
  "Overrated",
  "Great Service",
  "Bad Service",
];

export const CUISINES = [
  "Italian",
  "Japanese",
  "Mexican",
  "Thai",
  "Indian",
  "French",
  "American",
  "Korean",
  "Chinese",
  "Mediterranean",
  "Vietnamese",
  "Caribbean",
  "Spanish",
  "Greek",
] as const;

export type Cuisine = (typeof CUISINES)[number];

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  city: string;
  bio: string;
  favoriteCuisines: Cuisine[];
  hasCompletedTasteQuiz: boolean;
  createdAt: string;
}

export type NotificationType = "like" | "comment" | "follow";

export interface AppNotification {
  id: string;
  userId: string;
  actorId: string | null;
  type: NotificationType;
  reviewId: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  restaurantId: string | null;
  googlePlaceId: string | null;
  placeName: string;
  placeAddress: string;
  placeCity: string;
  placeCuisine: Cuisine | null;
  placeImageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  googlePlaceId?: string | null;
  name: string;
  address: string;
  city: string;
  cuisine: Cuisine;
  priceLevel: PriceLevel;
  imageUrl: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
}

export interface Dish {
  id: string;
  reviewId: string;
  restaurantId: string;
  name: string;
  rating: number;
  notes: string;
  photoUrl: string | null;
  isBestDish: boolean;
  createdAt: string;
}

export interface ReviewPhoto {
  id: string;
  reviewId: string;
  url: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  rating: number;
  text: string;
  visitDate: string;
  tags: ReviewTag[];
  createdAt: string;
}

export interface Comment {
  id: string;
  reviewId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Like {
  id: string;
  reviewId: string;
  userId: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface ListCollaborator {
  id: string;
  listId: string;
  userId: string;
  createdAt: string;
}

export interface List {
  id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
}

export interface ListItem {
  id: string;
  listId: string;
  restaurantId: string;
  note: string;
  position: number;
  createdAt: string;
}

export interface TasteDNA {
  favoriteCuisines: { cuisine: Cuisine; count: number; avgRating: number }[];
  averageRating: number;
  mostReviewedCuisine: Cuisine | null;
  preferredPriceLevel: PriceLevel | null;
  adventureScore: number;
  hiddenGemScore: number;
  dateNightScore: number;
  veganFriendlyScore: number;
  topDishes: Dish[];
  topRestaurants: { restaurant: Restaurant; rating: number }[];
}

export interface Recommendation {
  restaurant: Restaurant;
  confidence: number;
  reason: string;
}

export interface RankingFilters {
  city?: string;
  cuisine?: Cuisine;
  priceLevel?: PriceLevel;
  tag?: ReviewTag;
}
