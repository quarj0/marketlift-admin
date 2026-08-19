"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useSyncExternalStore } from "react";
import { Icons } from "@/lib/icons";
import {
  browserMarketplaceBaseUrl,
  marketplaceBaseUrl,
  publicMarketplaceAssetUrl,
} from "@/lib/public-marketplace";

function subscribeToBrowserLocation() {
  return () => {};
}

function useMarketplaceBaseUrl() {
  return useSyncExternalStore(
    subscribeToBrowserLocation,
    browserMarketplaceBaseUrl,
    marketplaceBaseUrl,
  );
}

export function MarketplaceImage({
  src,
  alt,
  className = "",
  fallbackClassName = "",
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const marketplaceBase = useMarketplaceBaseUrl();
  const [failed, setFailed] = useState(false);
  const resolved = src ? publicMarketplaceAssetUrl(src, marketplaceBase) : "";

  if (!resolved || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt} image unavailable`}
        className={`grid place-items-center bg-slate-100 text-slate-400 ${fallbackClassName || className}`}
      >
        <Icons.image size={24} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
