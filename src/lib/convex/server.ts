import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Get Convex URL from environment
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";

if (!convexUrl) {
  console.warn(
    "⚠️ NEXT_PUBLIC_CONVEX_URL is not set. Convex server features will not work."
  );
}

// Create Convex HTTP client for server-side operations
export const convexHttp = new ConvexHttpClient(convexUrl);

// Export API reference for type safety
export { api };

// Helper to check if Convex is properly configured
export const isConvexConfigured = (): boolean => {
  return Boolean(convexUrl);
};

