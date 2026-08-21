export type AdminRole = "super_admin" | "admin" | "moderator" | "support" | "finance";
export type AdminArea = "dashboard" | "users" | "sellers" | "listings" | "categories" | "moderation" | "verifications" | "reports" | "subscriptions" | "payments" | "promotions" | "analytics" | "support" | "activity" | "settings";

const access: Record<AdminArea, AdminRole[]> = {
  dashboard: ["super_admin", "admin", "moderator", "support", "finance"],
  users: ["super_admin", "admin", "moderator", "support"],
  sellers: ["super_admin", "admin", "moderator", "support"],
  listings: ["super_admin", "admin", "moderator", "support"],
  categories: ["super_admin", "admin"],
  moderation: ["super_admin", "admin", "moderator"],
  verifications: ["super_admin", "admin", "moderator"],
  reports: ["super_admin", "admin", "moderator"],
  subscriptions: ["super_admin", "admin", "finance"],
  payments: ["super_admin", "admin", "finance"],
  promotions: ["super_admin", "admin", "finance"],
  analytics: ["super_admin", "admin", "moderator", "support", "finance"],
  support: ["super_admin", "admin", "support"],
  activity: ["super_admin", "admin", "moderator"],
  settings: ["super_admin", "admin"],
};

export function normalizeAdminRole(role?: string | null, isSuperuser = false): AdminRole | null {
  if (isSuperuser) return "super_admin";
  if (!role) return null;
  return (["super_admin", "admin", "moderator", "support", "finance"] as string[]).includes(role) ? role as AdminRole : null;
}

export function canAccessAdminArea(role: string | null | undefined, area: AdminArea, isSuperuser = false) {
  const normalized = normalizeAdminRole(role, isSuperuser);
  return normalized ? access[area].includes(normalized) : false;
}

export function areaForPath(pathname: string): AdminArea {
  const head = pathname.split("/").filter(Boolean)[0] || "dashboard";
  return (["users","sellers","listings","categories","moderation","verifications","reports","subscriptions","payments","promotions","analytics","support","activity","settings"] as AdminArea[]).includes(head as AdminArea) ? head as AdminArea : "dashboard";
}
