export type MarketliftApp = "marketplace" | "admin";

const productionOrigins: Record<MarketliftApp, string> = {
  marketplace: "https://marketlift.com.br",
  admin: "https://dash.marketlift.com.br",
};

const localPorts: Record<MarketliftApp, string> = {
  marketplace: "3001",
  admin: "3000",
};

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function configuredOrigin(app: MarketliftApp) {
  const value =
    app === "marketplace"
      ? process.env.NEXT_PUBLIC_MARKETPLACE_URL
      : process.env.NEXT_PUBLIC_ADMIN_URL;
  if (!value?.trim()) return null;

  try {
    const parsed = new URL(value.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return stripTrailingSlash(parsed.origin + parsed.pathname.replace(/\/+$/, ''));
  } catch {
    return null;
  }
}

function isLocalHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]"
  );
}

function peerLocalOrigin(app: MarketliftApp, location: Location) {
  const currentPort = location.port;
  let targetPort = localPorts[app];

  if (currentPort === "3000") targetPort = "3001";
  else if (currentPort === "3001") targetPort = "3000";

  return `${location.protocol}//${location.hostname}:${targetPort}`;
}

export function appBaseUrlForServer(app: MarketliftApp) {
  return configuredOrigin(app) ?? productionOrigins[app];
}

export function appBaseUrlForBrowser(app: MarketliftApp) {
  if (typeof window === "undefined") return appBaseUrlForServer(app);

  const configured = configuredOrigin(app);

  if (process.env.NODE_ENV === "development") {
    if (configured) {
      try {
        const configuredUrl = new URL(configured);
        const looksLocal =
          isLocalHostname(configuredUrl.hostname) ||
          configuredUrl.hostname === window.location.hostname;
        if (!looksLocal)
          return stripTrailingSlash(
            configuredUrl.origin + configuredUrl.pathname,
          );
      } catch {
        // Invalid overrides fall through to the safe local peer origin.
      }
    }

    return peerLocalOrigin(app, window.location);
  }

  return configured ?? productionOrigins[app];
}

export function joinAppUrl(baseUrl: string, path = "") {
  const base = stripTrailingSlash(baseUrl);
  if (!path) return base;
  return `${base}/${path.replace(/^\/+/, "")}`;
}
