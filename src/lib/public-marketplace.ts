import {
  appBaseUrlForBrowser,
  appBaseUrlForServer,
  joinAppUrl,
} from "@/lib/cross-app-url";

export function marketplaceBaseUrl() {
  return appBaseUrlForServer("marketplace");
}

export function browserMarketplaceBaseUrl() {
  return appBaseUrlForBrowser("marketplace");
}

export function slugifyPublicTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function publicListingUrl(title: string, baseUrl = marketplaceBaseUrl(), exactSlug?: string) {
  const slug = exactSlug?.trim() || slugifyPublicTitle(title);
  return joinAppUrl(baseUrl, `listing/${encodeURIComponent(slug)}`);
}

export function publicSellerUrl(sellerId: string, baseUrl = marketplaceBaseUrl()) {
  return joinAppUrl(baseUrl, `seller/${encodeURIComponent(sellerId)}`);
}

export function publicMarketplaceAssetUrl(source: string, baseUrl = marketplaceBaseUrl()) {
  const value = source?.trim();
  if (!value) return "";
  if (/^(?:https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  return joinAppUrl(baseUrl, value);
}
