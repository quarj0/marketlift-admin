import {
  appBaseUrlForBrowser,
  appBaseUrlForServer,
  joinAppUrl,
} from "@/lib/cross-app-url";
import {
  publicListingSlugByTitle,
  publicSellerIdByAdminId,
} from "@/data/public-marketplace-catalog.generated";

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

export function publicListingUrl(title: string, baseUrl = marketplaceBaseUrl()) {
  const exactSlug = publicListingSlugByTitle[title];
  const slug = exactSlug || slugifyPublicTitle(title);
  return joinAppUrl(baseUrl, `listing/${encodeURIComponent(slug)}`);
}

export function publicSellerUrl(sellerId: string, baseUrl = marketplaceBaseUrl()) {
  const publicSellerId = publicSellerIdByAdminId[sellerId] || sellerId;
  return joinAppUrl(baseUrl, `seller/${encodeURIComponent(publicSellerId)}`);
}

export function publicMarketplaceAssetUrl(source: string, baseUrl = marketplaceBaseUrl()) {
  const value = source?.trim();
  if (!value) return "";
  if (/^(?:https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  return joinAppUrl(baseUrl, value);
}
