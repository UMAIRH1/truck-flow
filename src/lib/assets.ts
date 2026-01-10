import { Share } from "next/font/google";

export const ASSETS = {
  images: {
    icons: {
      logo: "/icons/Logo.svg",
      share: "/icons/Share.svg",
    },
  },

  videos: {},
  documents: {},
  audio: {},
} as const;

// Type-safe asset paths
export type AssetPath = typeof ASSETS;

// Helper function to get asset path with fallback
export function getAssetPath(path: string | undefined, fallback?: string): string {
  return path || fallback || "/images/placeholder.png";
}

// Asset validation helper
export function isValidAssetPath(path: string): boolean {
  return path.startsWith("/") && (path.includes("/images/") || path.includes("/videos/") || path.includes("/documents/") || path.includes("/audio/"));
}
