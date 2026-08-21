"use client";

import { useSyncExternalStore } from "react";
import { Icons } from "@/lib/icons";
import {
  browserMarketplaceBaseUrl,
  marketplaceBaseUrl,
  publicListingUrl,
  publicSellerUrl,
} from "@/lib/public-marketplace";

type CommonProps = {
  className?: string;
};

const baseClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

function subscribeToBrowserLocation() {
  // The app origin/port cannot change during an SPA session. A full navigation
  // remounts the application, so there is nothing to subscribe to here.
  return () => {};
}

function useMarketplaceBaseUrl() {
  return useSyncExternalStore(
    subscribeToBrowserLocation,
    browserMarketplaceBaseUrl,
    marketplaceBaseUrl,
  );
}

export function PublicListingLink({
  title,
  className = "",
  label = "View public listing",
  slug,
}: CommonProps & { title: string; label?: string; slug?: string }) {
  const marketplaceBase = useMarketplaceBaseUrl();
  const href = publicListingUrl(title, marketplaceBase, slug);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClass} ${className}`}
      aria-label={`${label}: ${title} (opens in a new tab)`}
    >
      <Icons.external size={15} aria-hidden="true" />
      {label}
    </a>
  );
}

export function PublicSellerLink({
  sellerId,
  sellerName,
  className = "",
}: CommonProps & { sellerId: string; sellerName: string }) {
  const marketplaceBase = useMarketplaceBaseUrl();
  const href = publicSellerUrl(sellerId, marketplaceBase);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClass} ${className}`}
      aria-label={`View public seller profile: ${sellerName} (opens in a new tab)`}
    >
      <Icons.external size={15} aria-hidden="true" />
      View public seller profile
    </a>
  );
}
