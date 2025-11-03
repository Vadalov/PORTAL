import { ConvexReactClient } from "convex/react";

// Get Convex URL from environment
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";

if (!convexUrl && typeof window !== "undefined") {
  console.warn(
    "⚠️ NEXT_PUBLIC_CONVEX_URL is not set. Convex features will not work."
  );
}

// Create Convex client with proper configuration
export const convex = new ConvexReactClient(convexUrl, {
  // Optional: Configure websocket connection
  // unsavedChangesWarning: false,
});

// Helper to check if Convex is properly configured
export const isConvexConfigured = (): boolean => {
  return Boolean(convexUrl);
};

// Export Convex URL for debugging
export const getConvexUrl = (): string => {
  return convexUrl;
};

