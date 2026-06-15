import { create } from "zustand";
import {
  CURRENT_USER_ID, DEMO_EMAIL, MOCK_COMMENTS, MOCK_DISHES, MOCK_FOLLOWS,
  MOCK_LIKES, MOCK_LIST_ITEMS, MOCK_LISTS, MOCK_RESTAURANTS,
  MOCK_REVIEW_PHOTOS, MOCK_REVIEWS, MOCK_USERS,
} from "@/lib/mock-data";
import type { Comment, Dish, Follow, Like, List, ListItem, Restaurant, Review, ReviewPhoto, ReviewTag, User } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface AppState {
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean;
  currentUserId: string | null;
  users: User[];
  restaurants: Restaurant[];
  reviews: Review[];
  dishes: Dish[];
  likes: Like[];
  comments: Comment[];
  follows: Follow[];
  lists: List[];
  listItems: ListItem[];
  reviewPhotos: ReviewPhoto[];
  isRefreshing: boolean;
  feedVersion: number;
  completeOnboarding: () => void;
  login: (email: string, password: string) => boolean;
  demoLogin: () => boolean;
  signup: (data: { email: string; password: string; username: string; displayName: string; city: string }) => boolean;
  logout: () => void;
  refreshFeed: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  addReview: (data: {
    restaurantName: string; address: string; city: string;
    cuisine: Restaurant["cuisine"]; priceLevel: Restaurant["priceLevel"];
    rating: number; text: string; visitDate: string; tags: ReviewTag[];
    dishes: Omit<Dish, "id" | "reviewId" | "restaurantId" | "createdAt">[];
  }) => { reviewId: string; restaurantId: string };
  toggleLike: (reviewId: string) => void;
  addComment: (reviewId: string, text: string) => void;
  toggleFollow: (userId: string) => void;
  getUser: (id: string) => User | undefined;
  getRestaurant: (id: string) => Restaurant | undefined;
  getReview: (id: string) => Review | undefined;
  getDish: (id: string) => Dish | undefined;
  getReviewPhoto: (reviewId: string) => ReviewPhoto | undefined;
  isFollowing: (id: string) => boolean;
  isLiked: (reviewId: string) => boolean;
  likeCount: (reviewId: string) => number;
  getComments: (reviewId: string) => Comment[];
}

export const useAppStore = create<AppState>((set, get) => ({
  hasSeenOnboarding: false,
  isAuthenticated: false,
  currentUserId: null,
  users: MOCK_USERS,
  restaurants: MOCK_RESTAURANTS,
  reviews: MOCK_REVIEWS,
  dishes: MOCK_DISHES,
  likes: MOCK_LIKES,
  comments: MOCK_COMMENTS,
  follows: MOCK_FOLLOWS,
  lists: MOCK_LISTS,
  listItems: MOCK_LIST_ITEMS,
  reviewPhotos: MOCK_REVIEW_PHOTOS,
  isRefreshing: false,
  feedVersion: 0,

  completeOnboarding: () => set({ hasSeenOnboarding: true }),

  login: (email) => {
    // TODO: Supabase auth.signInWithPassword
    const user = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) return false;
    set({ isAuthenticated: true, currentUserId: user.id });
    return true;
  },

  demoLogin: () => {
    const user = get().users.find((u) => u.id === CURRENT_USER_ID);
    if (!user) return false;
    set({ hasSeenOnboarding: true, isAuthenticated: true, currentUserId: user.id });
    return true;
  },

  signup: (data) => {
    // TODO: Supabase auth.signUp + profile insert
    if (get().users.some((u) => u.email === data.email || u.username === data.username)) return false;
    const user: User = { id: generateId("user"), email: data.email, username: data.username, displayName: data.displayName, avatarUrl: null, city: data.city, bio: "", createdAt: new Date().toISOString() };
    set((s) => ({ users: [...s.users, user], isAuthenticated: true, currentUserId: user.id }));
    return true;
  },

  logout: () => {
    // TODO: Supabase auth.signOut
    set({ isAuthenticated: false, currentUserId: null });
  },

  refreshFeed: async () => {
    set({ isRefreshing: true });
    await new Promise((r) => setTimeout(r, 900));
    set((s) => ({ isRefreshing: false, feedVersion: s.feedVersion + 1 }));
  },

  updateProfile: (updates) => {
    // TODO: Supabase users table update
    set((s) => ({ users: s.users.map((u) => u.id === s.currentUserId ? { ...u, ...updates } : u) }));
  },

  addReview: (data) => {
    // TODO: Supabase inserts for restaurant, review, dishes, photos
    const restaurantId = generateId("rest");
    const reviewId = generateId("rev");
    const uid = get().currentUserId!;
    const restaurant: Restaurant = { id: restaurantId, name: data.restaurantName, address: data.address, city: data.city, cuisine: data.cuisine, priceLevel: data.priceLevel, imageUrl: null, createdAt: new Date().toISOString() };
    const review: Review = { id: reviewId, userId: uid, restaurantId, rating: data.rating, text: data.text, visitDate: data.visitDate, tags: data.tags, createdAt: new Date().toISOString() };
    const newDishes = data.dishes.map((d) => ({ ...d, id: generateId("dish"), reviewId, restaurantId, createdAt: new Date().toISOString() }));
    set((s) => ({ restaurants: [...s.restaurants, restaurant], reviews: [...s.reviews, review], dishes: [...s.dishes, ...newDishes] }));
    return { reviewId, restaurantId };
  },

  toggleLike: (reviewId) => {
    // TODO: Supabase likes insert/delete
    const uid = get().currentUserId;
    if (!uid) return;
    const existing = get().likes.find((l) => l.reviewId === reviewId && l.userId === uid);
    if (existing) set((s) => ({ likes: s.likes.filter((l) => l.id !== existing.id) }));
    else set((s) => ({ likes: [...s.likes, { id: generateId("like"), reviewId, userId: uid, createdAt: new Date().toISOString() }] }));
  },

  addComment: (reviewId, text) => {
    // TODO: Supabase comments insert
    const uid = get().currentUserId;
    if (!uid || !text.trim()) return;
    set((s) => ({ comments: [...s.comments, { id: generateId("c"), reviewId, userId: uid, text: text.trim(), createdAt: new Date().toISOString() }] }));
  },

  toggleFollow: (userId) => {
    // TODO: Supabase follows insert/delete
    const uid = get().currentUserId;
    if (!uid || uid === userId) return;
    const existing = get().follows.find((f) => f.followerId === uid && f.followingId === userId);
    if (existing) set((s) => ({ follows: s.follows.filter((f) => f.id !== existing.id) }));
    else set((s) => ({ follows: [...s.follows, { id: generateId("f"), followerId: uid, followingId: userId, createdAt: new Date().toISOString() }] }));
  },

  getUser: (id) => get().users.find((u) => u.id === id),
  getRestaurant: (id) => get().restaurants.find((r) => r.id === id),
  getReview: (id) => get().reviews.find((r) => r.id === id),
  getDish: (id) => get().dishes.find((d) => d.id === id),
  getReviewPhoto: (reviewId) => get().reviewPhotos.find((p) => p.reviewId === reviewId),
  isFollowing: (id) => get().follows.some((f) => f.followerId === get().currentUserId && f.followingId === id),
  isLiked: (reviewId) => get().likes.some((l) => l.reviewId === reviewId && l.userId === get().currentUserId),
  likeCount: (reviewId) => get().likes.filter((l) => l.reviewId === reviewId).length,
  getComments: (reviewId) => get().comments.filter((c) => c.reviewId === reviewId),
}));
