import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ASSETS } from "./assets";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveIconPath(icon: string | undefined | null): string {
  if (!icon) return "";

  // If it's already a valid path, return it
  if (icon.startsWith("/") || icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("data:")) {
    return icon;
  }

  // Map icon key to ASSETS path
  const iconMap: Record<string, string> = {};

  return iconMap[icon] || "";
}

export function getImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl || imageUrl.trim() === "") {
    return "";
  }

  const trimmedUrl = imageUrl.trim();

  // If it's already a full URL (http or https), return as-is
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  // If it's a data URL, return as-is
  if (trimmedUrl.startsWith("data:")) {
    return trimmedUrl;
  }

  // If it's a relative path to uploads, prepend API base URL
  if (trimmedUrl.startsWith("/uploads/")) {
    const apiBaseUrl = getApiBaseUrl();
    return `${apiBaseUrl}${trimmedUrl}`;
  }

  // If it's a relative path starting with uploads (without leading slash), add it
  if (trimmedUrl.startsWith("uploads/")) {
    const apiBaseUrl = getApiBaseUrl();
    return `${apiBaseUrl}/${trimmedUrl}`;
  }

  // If it's a local asset path (starts with /), return as-is
  if (trimmedUrl.startsWith("/")) {
    return trimmedUrl;
  }

  // For any other case, assume it might be a relative path and prepend API URL
  // This handles cases where just the filename is stored
  const apiBaseUrl = getApiBaseUrl();
  return `${apiBaseUrl}/uploads/public/${trimmedUrl}`;
}
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}
