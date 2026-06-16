import type {
  Comment, Dish, Follow, Like, List, ListItem, ListCollaborator,
  Restaurant, Review, ReviewPhoto, ReviewTag, User, Cuisine, PriceLevel,
  AppNotification, NotificationType, Bookmark,
} from "@/lib/types";

type DbUser = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  city: string;
  bio: string;
  favorite_cuisines?: string[];
  has_completed_taste_quiz?: boolean;
  created_at: string;
};

type DbRestaurant = {
  id: string;
  google_place_id: string | null;
  name: string;
  address: string;
  city: string;
  cuisine: string;
  price_level: number;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

type DbReview = {
  id: string;
  user_id: string;
  restaurant_id: string;
  rating: number;
  text: string;
  visit_date: string;
  tags: string[];
  created_at: string;
};

type DbDish = {
  id: string;
  review_id: string;
  restaurant_id: string;
  name: string;
  rating: number;
  notes: string;
  photo_url: string | null;
  is_best_dish: boolean;
  created_at: string;
};

type DbReviewPhoto = {
  id: string;
  review_id: string;
  url: string;
  created_at: string;
};

type DbFollow = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
};

type DbLike = {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
};

type DbComment = {
  id: string;
  review_id: string;
  user_id: string;
  text: string;
  created_at: string;
};

type DbList = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
};

type DbListItem = {
  id: string;
  list_id: string;
  restaurant_id: string;
  note: string;
  position: number;
  created_at: string;
};

function clampPriceLevel(level: number | null | undefined): PriceLevel {
  const n = Number(level);
  if (!Number.isFinite(n)) return 2;
  return Math.min(4, Math.max(1, Math.round(n))) as PriceLevel;
}

export function mapUser(row: DbUser): User {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    city: row.city ?? "",
    bio: row.bio ?? "",
    favoriteCuisines: (row.favorite_cuisines ?? []) as Cuisine[],
    hasCompletedTasteQuiz: row.has_completed_taste_quiz ?? false,
    createdAt: row.created_at,
  };
}

export function mapRestaurant(row: DbRestaurant): Restaurant {
  return {
    id: row.id,
    googlePlaceId: row.google_place_id,
    name: row.name,
    address: row.address ?? "",
    city: row.city,
    cuisine: row.cuisine as Cuisine,
    priceLevel: clampPriceLevel(row.price_level),
    imageUrl: row.image_url,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at,
  };
}

export function mapReview(row: DbReview): Review {
  return {
    id: row.id,
    userId: row.user_id,
    restaurantId: row.restaurant_id,
    rating: Number(row.rating),
    text: row.text ?? "",
    visitDate: row.visit_date,
    tags: (row.tags ?? []) as ReviewTag[],
    createdAt: row.created_at,
  };
}

export function mapDish(row: DbDish): Dish {
  return {
    id: row.id,
    reviewId: row.review_id,
    restaurantId: row.restaurant_id,
    name: row.name,
    rating: Number(row.rating),
    notes: row.notes ?? "",
    photoUrl: row.photo_url,
    isBestDish: row.is_best_dish,
    createdAt: row.created_at,
  };
}

export function mapReviewPhoto(row: DbReviewPhoto): ReviewPhoto {
  return {
    id: row.id,
    reviewId: row.review_id,
    url: row.url,
    createdAt: row.created_at,
  };
}

export function mapFollow(row: DbFollow): Follow {
  return {
    id: row.id,
    followerId: row.follower_id,
    followingId: row.following_id,
    createdAt: row.created_at,
  };
}

export function mapLike(row: DbLike): Like {
  return {
    id: row.id,
    reviewId: row.review_id,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

export function mapComment(row: DbComment): Comment {
  return {
    id: row.id,
    reviewId: row.review_id,
    userId: row.user_id,
    text: row.text,
    createdAt: row.created_at,
  };
}

export function mapList(row: DbList): List {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description ?? "",
    isPublic: row.is_public,
    createdAt: row.created_at,
  };
}

export function mapListItem(row: DbListItem): ListItem {
  return {
    id: row.id,
    listId: row.list_id,
    restaurantId: row.restaurant_id,
    note: row.note ?? "",
    position: row.position,
    createdAt: row.created_at,
  };
}

type DbListCollaborator = {
  id: string;
  list_id: string;
  user_id: string;
  created_at: string;
};

export function mapListCollaborator(row: DbListCollaborator): ListCollaborator {
  return {
    id: row.id,
    listId: row.list_id,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

type DbNotification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  review_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

export function mapNotification(row: DbNotification): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    actorId: row.actor_id,
    type: row.type,
    reviewId: row.review_id,
    message: row.message,
    read: row.read,
    createdAt: row.created_at,
  };
}

type DbBookmark = {
  id: string;
  user_id: string;
  restaurant_id: string | null;
  google_place_id: string | null;
  place_name: string;
  place_address: string;
  place_city: string;
  place_cuisine: string | null;
  place_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export function mapBookmark(row: DbBookmark): Bookmark {
  return {
    id: row.id,
    userId: row.user_id,
    restaurantId: row.restaurant_id,
    googlePlaceId: row.google_place_id,
    placeName: row.place_name,
    placeAddress: row.place_address,
    placeCity: row.place_city,
    placeCuisine: (row.place_cuisine as Cuisine) ?? null,
    placeImageUrl: row.place_image_url,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at,
  };
}
