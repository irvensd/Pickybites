# ForkLoop

A **native** iOS and Android food review app built with Expo and React Native. Track restaurants, rate dishes, follow friends, and get personalized recommendations based on your Taste DNA.

## Tech Stack

- Expo SDK 54 + React Native
- TypeScript + Expo Router
- NativeWind (Tailwind for React Native)
- Zustand (state management)
- **Supabase** (auth, PostgreSQL, storage)
- **Google Places API** (restaurant discovery)
- Expo Image Picker + Expo Location
- React Native Reanimated

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) on your phone (for quick testing)
- A [Supabase](https://supabase.com) project

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

Your project: [ikevuuzfgyciqxrzgkbk](https://supabase.com/dashboard/project/ikevuuzfgyciqxrzgkbk)

1. Copy `.env.example` to `.env`
2. In Supabase → **Settings → API**, copy the **anon public** key into `.env`
3. In Supabase → **SQL Editor**, run `supabase/schema.sql` (creates tables, RLS, storage)
4. Run `supabase/seed.sql` (seeds 15 restaurants for Discover)
5. In **Authentication → Providers → Email**, disable **Confirm email** (for instant signup/demo)
6. If you already ran schema.sql, also run `supabase/migrations/001_google_places.sql`

### 3. Set up Google Places (real restaurants near you)

| Layer | Role |
|-------|------|
| **Google Places API** | Discovery — find restaurants by location & name |
| **Supabase** | Your ratings, reviews, photos, social feed |

Savr scores are **yours** (1.0–10.0), not Google/Yelp stars.

1. [Google Cloud Console](https://console.cloud.google.com/) → create/select project
2. Enable **[Places API (New)](https://console.cloud.google.com/apis/library/places.googleapis.com)**
3. **Credentials** → Create API key → restrict to Places API (New)
4. Add to `.env`: `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your-key`
5. Restart: `npx expo start --clear`

Google includes **$200/month free** — enough for testing.

### 4. Run the app

```bash
npx expo start
```

> **Expo Go compatibility:** This project uses **Expo SDK 54**.

**Demo login:** Tap **"Try Demo — Alex Rivera"** — auto-creates `alex@example.com` / `Demo1234!` if needed.

### Run on Emulator

```bash
npx expo start --android
npx expo start --ios
```

## Screens

| Screen | Route |
|--------|-------|
| Onboarding | `/onboarding` |
| Login / Sign Up | `/login`, `/signup` |
| Home | `/(tabs)` |
| Discover | `/(tabs)/discover` |
| Add Review | `/(tabs)/add` → `/add-review` |
| Rankings | `/(tabs)/rankings` |
| Profile | `/(tabs)/profile` |
| Restaurant | `/restaurant/[id]` |
| Dish | `/dish/[id]` |
| User | `/user/[id]` |
| Lists | `/lists` |
| Friends | `/friends` |
| Taste DNA | `/taste-dna` |
| Food Journal | `/journal` |
| Food Wrapped | `/wrapped` |
| Settings | `/settings` |
| Edit Profile | `/edit-profile` |

## Project Structure

```
app/                  # Expo Router screens
components/           # Reusable UI components
lib/                  # Types, algorithms, Supabase client
store/                # Zustand store
supabase/             # schema.sql + seed.sql
```

## What's wired to Supabase

- Email/password auth (signup, login, logout, session persistence)
- User profiles (auto-created on signup, editable)
- Restaurants, reviews, dishes
- Review photo uploads (`review-photos` bucket)
- Avatar uploads (`avatars` bucket)
- Likes, comments, follows
- Lists & list items
- Row Level Security on all tables

## Production setup (Tier 3)

### 1. Move Google Places server-side

The app calls a Supabase **Edge Function** (`places`) instead of bundling your Google API key. Only signed-in users can search.

**One-time setup:**

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and log in:
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref ikevuuzfgyciqxrzgkbk
   ```

2. Store your Google key as a **secret** (never commit this):
   ```bash
   supabase secrets set GOOGLE_PLACES_API_KEY=your-google-places-api-key
   ```

3. Deploy the function:
   ```bash
   supabase functions deploy places
   ```

4. **Remove** `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` from your `.env` (optional key remains for local dev without the function).

5. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), restrict the key to **Places API (New)** only. You can remove iOS/Android app restrictions since the key now lives on Supabase servers.

**How it works:** `lib/places/google.ts` → `lib/places/remote.ts` → `supabase.functions.invoke('places')` → Google Places API.

### 2. Sentry crash reporting (optional)

1. Create a free project at [sentry.io](https://sentry.io).
2. Add to `.env`:
   ```
   EXPO_PUBLIC_SENTRY_DSN=https://your-key@o000000.ingest.sentry.io/0000000
   ```
3. Restart Expo. Crashes are reported automatically when the DSN is set.

### 3. App Store / Play Store assets

Draft listing copy lives in `constants/branding.ts` (`APP_STORE_DESCRIPTION`).

**Screenshots** (take on a real device or simulator):

| Screen | What to capture |
|--------|-----------------|
| Onboarding | ForkLoop logo + tagline |
| Discover | Map or Near You with restaurants |
| Home | Activity feed + notifications |
| Restaurant | Ratings breakdown + photos |
| Profile | Taste DNA / lists |

- **iOS:** 6.7" and 6.5" iPhone screenshots required ([App Store Connect](https://appstoreconnect.apple.com))
- **Android:** Phone screenshots + feature graphic ([Play Console](https://play.google.com/console))

### 4. Supabase Auth redirect

In Supabase → **Authentication → URL Configuration**, add:

```
forkloop://reset-password
```

## Building for App Stores

```bash
npm install -g eas-cli
eas build:configure
eas build --platform android --profile preview
eas build --platform ios --profile production
eas submit --platform ios
```

See [Expo EAS Build docs](https://docs.expo.dev/build/introduction/).

## Fallback mode

If `.env` is missing, the app falls back to local mock data (no persistence).

## License

MIT
