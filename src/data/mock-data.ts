import { marketplaceDomain } from "@/data/marketplace-domain.generated";

export type Status = "Active" | "Suspended" | "Pending" | "Verified" | "Review" | "Rejected" | "Removed" | "Resolved" | "Dismissed" | "Open" | "Paid" | "Failed" | "Refunded" | "Expired" | "Draft";

export const dashboardStats = [
  { label: "Total users", value: "24,850", change: "+8.4%", trend: "up", meta: "vs. last month" },
  { label: "Active sellers", value: "4,281", change: "+5.2%", trend: "up", meta: "vs. last month" },
  { label: "Active listings", value: "18,420", change: "+11.7%", trend: "up", meta: "vs. last month" },
  { label: "Monthly revenue", value: "R$ 84,300", change: "+6.1%", trend: "up", meta: "vs. last month" },
];

export const attentionItems = [
  { label: "Verification requests", count: 18, href: "/verifications", tone: "amber" },
  { label: "Flagged listings", count: 24, href: "/moderation", tone: "red" },
  { label: "Open reports", count: 31, href: "/reports", tone: "orange" },
  { label: "Payment issues", count: 6, href: "/payments", tone: "red" },
  { label: "Support tickets", count: 12, href: "/support", tone: "blue" },
  { label: "Listings under review", count: 9, href: "/listings", tone: "amber" },
];

export const users = [
  { id: "USR-10482", name: "João Silva", email: "joao.silva@email.com", type: "Buyer & Seller", status: "Active" as Status, joined: "18 Aug 2026", location: "São Paulo, SP", avatar: "JS", orders: 0 },
  { id: "USR-10481", name: "Mariana Costa", email: "mariana.costa@email.com", type: "Buyer", status: "Active" as Status, joined: "18 Aug 2026", location: "Rio de Janeiro, RJ", avatar: "MC", orders: 0 },
  { id: "USR-10480", name: "Rafael Oliveira", email: "rafael.o@email.com", type: "Seller", status: "Pending" as Status, joined: "17 Aug 2026", location: "Belo Horizonte, MG", avatar: "RO", orders: 0 },
  { id: "USR-10479", name: "Ana Souza", email: "ana.souza@email.com", type: "Buyer", status: "Suspended" as Status, joined: "17 Aug 2026", location: "Curitiba, PR", avatar: "AS", orders: 0 },
  { id: "USR-10478", name: "Carlos Santos", email: "carlos.s@email.com", type: "Buyer & Seller", status: "Active" as Status, joined: "16 Aug 2026", location: "Salvador, BA", avatar: "CS", orders: 0 },
  { id: "USR-10477", name: "Fernanda Lima", email: "fernanda.l@email.com", type: "Buyer", status: "Active" as Status, joined: "16 Aug 2026", location: "Recife, PE", avatar: "FL", orders: 0 },
];

// BEGIN MARKETLIFT DOMAIN SYNC: sellers
const sellerAdminFallbackPlans = marketplaceDomain.plans.map((p) => p.name);
export const sellers = marketplaceDomain.sellers.map((seller, index) => ({
  id: seller.id,
  publicSellerId: seller.id,
  name: seller.name,
  owner: seller.owner || "Marketplace account holder",
  plan: seller.plan || sellerAdminFallbackPlans[index % Math.max(sellerAdminFallbackPlans.length, 1)] || "—",
  status: (seller.status || (seller.verified ? "Verified" : "Pending")) as Status,
  listings: marketplaceDomain.listings.filter((listing) => listing.sellerId === seller.id).length,
  rating: seller.rating == null ? "—" : String(seller.rating),
  revenue: "R$ 0",
  location: seller.location || "Brazil",
  joined: seller.memberSince || "—",
  avatar: seller.avatar,
}));
// END MARKETLIFT DOMAIN SYNC: sellers

// BEGIN MARKETLIFT DOMAIN SYNC: listings
const listingOperationalSeed = [
  { status: "Active" as Status, created: "5 min ago", reports: 0 },
  { status: "Review" as Status, created: "12 min ago", reports: 2 },
  { status: "Active" as Status, created: "19 min ago", reports: 0 },
  { status: "Pending" as Status, created: "31 min ago", reports: 0 },
  { status: "Rejected" as Status, created: "44 min ago", reports: 4 },
  { status: "Active" as Status, created: "1 hr ago", reports: 0 },
];
export const listings = marketplaceDomain.listings.map((listing, index) => {
  const operational = listingOperationalSeed[index % listingOperationalSeed.length];
  return {
    id: listing.id,
    publicId: listing.id,
    publicSlug: listing.slug,
    publicSellerId: listing.sellerId,
    title: listing.title,
    seller: listing.sellerName,
    category: listing.categoryName,
    categorySlug: listing.categoryId,
    price: typeof listing.price === "number"
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(listing.price).replace(/\u00a0/g, " ")
      : String(listing.price),
    images: [...listing.images],
    image: listing.images[0] || "",
    description: listing.description,
    condition: listing.condition || "—",
    location: listing.location || "Brazil",
    status: operational.status,
    created: operational.created,
    reports: operational.reports,
  };
});
// END MARKETLIFT DOMAIN SYNC: listings

// BEGIN MARKETLIFT DOMAIN SYNC: reports
const reportOperationalSeed = [
  { id: "RPT-3104", type: "Listing", reporter: "Marcos P.", status: "Open" as Status, created: "8 min ago", priority: "High" },
  { id: "RPT-3103", type: "Seller", reporter: "Beatriz A.", status: "Open" as Status, created: "26 min ago", priority: "High" },
  { id: "RPT-3102", type: "Listing", reporter: "Pedro M.", status: "Review" as Status, created: "1 hr ago", priority: "Medium" },
  { id: "RPT-3101", type: "User", reporter: "Ana C.", status: "Resolved" as Status, created: "2 hrs ago", priority: "Low" },
];
export const reports = reportOperationalSeed.map((report, index) => ({
  ...report,
  target: report.type === "Listing"
    ? (listings[index % Math.max(listings.length, 1)]?.title ?? "Marketplace listing")
    : report.type === "Seller"
      ? (sellers[index % Math.max(sellers.length, 1)]?.name ?? "Marketplace seller")
      : "Marketplace user",
  reason: marketplaceDomain.reportReasons[index % Math.max(marketplaceDomain.reportReasons.length, 1)] ?? "Other",
}));
// END MARKETLIFT DOMAIN SYNC: reports

// BEGIN MARKETLIFT DOMAIN SYNC: verifications
const verificationOperationalSeed = [
  { id: "VER-2081", submitted: "17 Aug 2026, 18:42", status: "Pending" as Status, risk: "Low" },
  { id: "VER-2080", submitted: "17 Aug 2026, 16:15", status: "Review" as Status, risk: "Medium" },
  { id: "VER-2079", submitted: "17 Aug 2026, 13:02", status: "Pending" as Status, risk: "Low" },
  { id: "VER-2078", submitted: "16 Aug 2026, 22:18", status: "Rejected" as Status, risk: "High" },
];
export const verifications = verificationOperationalSeed.map((verification, index) => {
  const seller = sellers[index % Math.max(sellers.length, 1)];
  return {
    ...verification,
    seller: seller?.name ?? "Marketplace seller",
    owner: seller?.owner ?? "Marketplace account holder",
    document: marketplaceDomain.verificationDocumentTypes[index % Math.max(marketplaceDomain.verificationDocumentTypes.length, 1)] ?? "Identity document",
  };
});
// END MARKETLIFT DOMAIN SYNC: verifications

// BEGIN MARKETLIFT DOMAIN SYNC: payments
const paymentOperationalSeed = [
  { id: "PAY-4912", method: "Pix", status: "Paid" as Status, date: "18 Aug 2026, 19:04" },
  { id: "PAY-4911", method: "Credit card", status: "Paid" as Status, date: "18 Aug 2026, 17:22" },
  { id: "PAY-4910", method: "Credit card", status: "Failed" as Status, date: "18 Aug 2026, 15:48" },
  { id: "PAY-4909", method: "Pix", status: "Refunded" as Status, date: "18 Aug 2026, 11:31" },
];
export const payments = paymentOperationalSeed.map((payment, index) => {
  const seller = sellers[index % Math.max(sellers.length, 1)];
  const plan = marketplaceDomain.plans[index % Math.max(marketplaceDomain.plans.length, 1)];
  const promotion = marketplaceDomain.promotionProducts[index % Math.max(marketplaceDomain.promotionProducts.length, 1)];
  const subscription = index % 2 === 0;
  return {
    ...payment,
    seller: seller?.name ?? "Marketplace seller",
    type: subscription ? (plan?.name ?? "Seller") + " subscription" : (promotion?.name ?? "Listing") + " promotion",
    amount: subscription ? (plan?.price ?? "R$ —") : (promotion?.price ?? "R$ —"),
  };
});
// END MARKETLIFT DOMAIN SYNC: payments

export const supportTickets = [
  { id: "TKT-1208", user: "Mariana Costa", subject: "Can't access my seller account", category: "Account", priority: "High", status: "Open" as Status, updated: "4 min ago" },
  { id: "TKT-1207", user: "Lucas Ferreira", subject: "Payment charged twice", category: "Billing", priority: "High", status: "Open" as Status, updated: "21 min ago" },
  { id: "TKT-1206", user: "João Silva", subject: "How do featured listings work?", category: "Listings", priority: "Normal", status: "Review" as Status, updated: "1 hr ago" },
  { id: "TKT-1205", user: "Ana Souza", subject: "Appeal account suspension", category: "Account", priority: "Normal", status: "Open" as Status, updated: "2 hrs ago" },
];

// BEGIN MARKETLIFT DOMAIN SYNC: categories
export const categories = marketplaceDomain.categories.map((category) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  listings: marketplaceDomain.listings.filter((listing) => listing.categoryId === category.id || listing.categoryId === category.slug).length,
  active: category.active,
  icon: category.icon,
  subcategories: category.subcategories.map((subcategory) => ({ ...subcategory })),
}));
// END MARKETLIFT DOMAIN SYNC: categories

// BEGIN MARKETLIFT DOMAIN SYNC: activityLog
export const activityLog = [
  { admin: "Ana Martins", action: "Approved seller verification", target: (sellers[0]?.id ?? "seller") + " · " + (sellers[0]?.name ?? "Marketplace seller"), time: "2 min ago", ip: "177.42.18.20" },
  { admin: "System", action: "Flagged listing automatically", target: (listings[1]?.id ?? listings[0]?.id ?? "listing") + " · " + (listings[1]?.title ?? listings[0]?.title ?? "Marketplace listing"), time: "12 min ago", ip: "—" },
  { admin: "Carlos Mendes", action: "Suspended selling access", target: (sellers[1]?.id ?? sellers[0]?.id ?? "seller") + " · " + (sellers[1]?.name ?? sellers[0]?.name ?? "Marketplace seller"), time: "34 min ago", ip: "201.17.92.44" },
  { admin: "Mariana Alves", action: "Resolved report", target: (reports[0]?.id ?? "report") + " · " + (reports[0]?.target ?? "Marketplace report"), time: "1 hr ago", ip: "189.9.100.51" },
  { admin: "Ana Martins", action: "Removed listing", target: (listings[2]?.id ?? listings[0]?.id ?? "listing") + " · " + (listings[2]?.title ?? listings[0]?.title ?? "Marketplace listing"), time: "2 hrs ago", ip: "177.42.18.20" },
];
// END MARKETLIFT DOMAIN SYNC: activityLog

// BEGIN MARKETLIFT DOMAIN SYNC: plans
export const plans = marketplaceDomain.plans.map((plan) => ({
  id: plan.id,
  name: plan.name,
  price: plan.price,
  period: plan.period,
  sellers: marketplaceDomain.sellers.filter((seller) => seller.plan === plan.name).length,
  listings: plan.listingLimit,
  featured: plan.featured,
  badge: plan.badge || "",
}));

export const promotionProducts = marketplaceDomain.promotionProducts.map((product) => ({ ...product }));
export const reportReasons = [...marketplaceDomain.reportReasons];
export const listingConditions = [...marketplaceDomain.listingConditions];
export const verificationDocumentTypes = [...marketplaceDomain.verificationDocumentTypes];
export const marketplaceLocations = marketplaceDomain.locations.map((location) => ({ ...location, cities: [...location.cities] }));
// END MARKETLIFT DOMAIN SYNC: plans







