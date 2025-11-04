import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Get Convex URL from environment
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";

// Check if we're in build mode (Next.js sets this during build)
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_CONVEX_URL;

// Lazy initialization to avoid build errors when URL is not set
let _convexHttp: ConvexHttpClient | null = null;

// Get or create Convex HTTP client (lazy initialization)
// This only creates the client when actually used, not during build
export const getConvexHttp = (): ConvexHttpClient => {
  if (!_convexHttp) {
    // During build time, if URL is not set, we use a placeholder
    // This allows the build to succeed, but runtime will fail if URL is missing
    if (isBuildTime && (!convexUrl || convexUrl.trim() === "")) {
      // Use a placeholder URL that will validate but fail at runtime
      // This prevents build errors while ensuring runtime errors if URL is missing
      _convexHttp = new ConvexHttpClient("https://build-placeholder.convex.cloud");
    } else if (!convexUrl || convexUrl.trim() === "") {
      throw new Error(
        "NEXT_PUBLIC_CONVEX_URL is not set. Please set NEXT_PUBLIC_CONVEX_URL environment variable."
      );
    } else {
      _convexHttp = new ConvexHttpClient(convexUrl);
    }
  }
  return _convexHttp;
};

// Export for backward compatibility (lazy getter)
// This Proxy delays client creation until actual property access
export const convexHttp = new Proxy({} as ConvexHttpClient, {
  get(_target, prop) {
    // Only create client when a property is actually accessed (runtime)
    // This prevents build-time errors when URL is not set
    return getConvexHttp()[prop as keyof ConvexHttpClient];
  },
});

// Export API reference for type safety
export { api };

// Helper to check if Convex is properly configured
export const isConvexConfigured = (): boolean => {
  return Boolean(convexUrl && convexUrl.trim() !== "");
};

