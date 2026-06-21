export function friendlyError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;

  const msg = error.message.toLowerCase();
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("offline") || msg.includes("failed to fetch")) {
    return "You're offline. Check your connection and try again.";
  }
  if (msg.includes("timeout")) {
    return "Request timed out. Please try again.";
  }
  return error.message || fallback;
}

