import { APP_NAME, SUPPORT_EMAIL } from "./branding";

export const PRIVACY_SECTIONS = [
  {
    title: "Overview",
    body: `${APP_NAME} ("we", "us") respects your privacy. This policy explains what we collect, why we collect it, and how you can control your data.`,
  },
  {
    title: "Information we collect",
    body: `Account info: email, username, display name, city, profile photo, and taste preferences you provide.\n\nContent you create: restaurant reviews, dish ratings, photos, comments, lists, and bookmarks.\n\nLocation: when you allow it, we use your device location to show nearby restaurants. We do not sell your location data.\n\nUsage data: basic app diagnostics to keep the service reliable.`,
  },
  {
    title: "How we use your data",
    body: `To operate your account and sync your reviews across devices.\n\nTo personalize recommendations and taste match scores.\n\nTo show your activity to people you follow, according to your sharing settings.\n\nTo send notifications you opt into (likes, follows, comments).`,
  },
  {
    title: "Third-party services",
    body: `We use Supabase for authentication and data storage, and Google Places for restaurant search. These providers process data under their own privacy policies. API requests may include location or search queries.`,
  },
  {
    title: "Your choices",
    body: `You can update or delete your profile, revoke location permission in device settings, and request account deletion by emailing ${SUPPORT_EMAIL}.`,
  },
  {
    title: "Contact",
    body: `Questions about privacy? Email ${SUPPORT_EMAIL}.`,
  },
];

export const TERMS_SECTIONS = [
  {
    title: "Acceptance",
    body: `By creating an account or using ${APP_NAME}, you agree to these Terms of Service.`,
  },
  {
    title: "Your account",
    body: `You are responsible for your login credentials and for activity on your account. You must be at least 13 years old to use ${APP_NAME}.`,
  },
  {
    title: "Your content",
    body: `You retain ownership of reviews, photos, and other content you post. You grant ${APP_NAME} a license to display and distribute that content within the app so friends and followers can see it.\n\nDo not post illegal, harassing, or misleading content. We may remove content that violates these terms.`,
  },
  {
    title: "Acceptable use",
    body: `Do not scrape, spam, reverse-engineer, or attempt to disrupt the service. Do not impersonate others or post false reviews.`,
  },
  {
    title: "Disclaimers",
    body: `Restaurant information and ratings come from users and third-party sources. ${APP_NAME} does not guarantee accuracy of hours, menus, or scores. Use your own judgment when dining out.`,
  },
  {
    title: "Changes",
    body: `We may update these terms. Continued use after changes means you accept the updated terms.`,
  },
  {
    title: "Contact",
    body: `Questions? Email ${SUPPORT_EMAIL}.`,
  },
];

