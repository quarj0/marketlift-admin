export function marketplaceBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_MARKETPLACE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://marketlift.br";
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

export function publicListingUrl(title: string) {
  return `${marketplaceBaseUrl()}/listing/${slugifyPublicTitle(title)}`;
}

export function publicSellerUrl(sellerId: string) {
  return `${marketplaceBaseUrl()}/seller/${encodeURIComponent(sellerId)}`;
}
