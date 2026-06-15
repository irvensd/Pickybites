# Savr

A **native** iOS and Android food review app built with Expo and React Native. Track restaurants, rate dishes, follow friends, and get personalized recommendations based on your Taste DNA.

## Tech Stack

- Expo SDK 56 + React Native
- TypeScript + Expo Router
- NativeWind (Tailwind for React Native)
- Zustand (state management)
- Supabase-ready (auth, database, storage)
- Expo Image Picker + Expo Location
- React Native Reanimated

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) on your phone (for quick testing)
- Android Studio (for Android emulator / Play Store builds)
- Mac + Xcode (for iOS simulator / App Store builds)

### Install & Run

```bash
npm install
npx expo start
```

> **Expo Go compatibility:** This project uses **Expo SDK 54**. Make sure your Expo Go app is the matching SDK 54 build.

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS).

**Demo login:** Tap **"Try Demo — Alex Rivera"** on onboarding, login, or signup — no email needed. Or sign in manually with `alex@example.com` (any password).

### Run on Emulator

```bash
npx expo start --android   # Android emulator
npx expo start --ios       # iOS simulator (Mac only)
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
lib/                  # Types, mock data, algorithms
store/                # Zustand store
supabase/             # Database schema
```

## Supabase Setup

1. Copy `.env.example` to `.env`
2. Run `supabase/schema.sql` in Supabase SQL Editor
3. Create a `review-photos` storage bucket
4. Search for `TODO: Supabase` in the codebase and wire up integrations

## Building for App Stores

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure and build
eas build:configure
eas build --platform android
eas build --platform ios
```

See [Expo EAS Build docs](https://docs.expo.dev/build/introduction/) for store submission.

## Features (Mock Data)

All features work with local mock state:

- Email/password auth flow
- Restaurant & dish reviews (1.0–10.0 ratings)
- Photo picker (camera roll)
- Location tagging
- Friend feed, likes, comments, follow
- Rankings with filters
- Taste DNA & Taste Match
- Personalized recommendations
- Food Journal & Food Wrapped

## License

MIT
