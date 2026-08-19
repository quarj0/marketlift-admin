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

export function publicListingUrl(title: string, baseUrl = marketplaceBaseUrl()) {
  return joinAppUrl(baseUrl, `listing/${slugifyPublicTitle(title)}`);
}

export function publicSellerUrl(sellerId: string, baseUrl = marketplaceBaseUrl()) {
  return joinAppUrl(baseUrl, `seller/${encodeURIComponent(sellerId)}`);
}
