let initialized = false;

/**
 * Crash reporting placeholder. Sentry requires an EAS development build
 * (not Expo Go). Add @sentry/react-native when you ship via EAS Build.
 */
export async function initMonitoring() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn || dsn.includes("your-sentry-dsn")) return;
  // Sentry disabled for Expo Go compatibility — enable in production builds.
  console.info("Sentry DSN set but skipped (Expo Go / add Sentry in EAS builds).");
  initialized = false;
}

export function isMonitoringEnabled(): boolean {
  return initialized;
}

