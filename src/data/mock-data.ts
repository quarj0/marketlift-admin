export type Status =
  | "Active"
  | "Suspended"
  | "Pending"
  | "Verified"
  | "Not verified"
  | "Rejected"
  | "Resolved"
  | "Dismissed"
  | "Open"
  | "Paid"
  | "Failed"
  | "Cancelled"
  | "Published"
  | "Paused"
  | "Sold"
  | "Expired"
  | "Under review"
  | "Removed"
  | "Draft";

export const dashboardStats = [
  { label: "Total users", value: "24,850", change: "+8.4%", trend: "up", meta: "vs. last month" },
  { label: "Selling enabled", value: "4,281", change: "+5.2%", trend: "up", meta: "users with seller profiles" },
  { label: "Published listings", value: "18,420", change: "+11.7%", trend: "up", meta: "currently visible" },
  { label: "Service revenue", value: "R$ 84,3k", change: "+6.1%", trend: "up", meta: "plans + promotions" },
];

export const attentionItems = [
  { label: "Verification requests", count: 18, href: "/verifications", tone: "amber" },
  { label: "Flagged listings", count: 24, href: "/moderation", tone: "red" },
  { label: "Open reports", count: 31, href: "/reports", tone: "orange" },
  { label: "Availability reports", count: 7, href: "/reports", tone: "blue" },
  { label: "Payment issues", count: 6, href: "/payments", tone: "red" },
  { label: "Support tickets", count: 12, href: "/support", tone: "blue" },
];

export const users = [
  { id: "USR-10482", name: "João Silva", email: "joao.silva@email.com", type: "Selling enabled", status: "Active" as Status, joined: "18 Aug 2026", location: "São Paulo, SP", avatar: "JS", orders: 0 },
  { id: "USR-10481", name: "Mariana Costa", email: "mariana.costa@email.com", type: "Marketplace user", status: "Active" as Status, joined: "18 Aug 2026", location: "Rio de Janeiro, RJ", avatar: "MC", orders: 0 },
  { id: "USR-10480", name: "Rafael Oliveira", email: "rafael.o@email.com", type: "Selling enabled", status: "Active" as Status, joined: "17 Aug 2026", location: "Belo Horizonte, MG", avatar: "RO", orders: 0 },
  { id: "USR-10479", name: "Ana Souza", email: "ana.souza@email.com", type: "Marketplace user", status: "Suspended" as Status, joined: "17 Aug 2026", location: "Curitiba, PR", avatar: "AS", orders: 0 },
  { id: "USR-10478", name: "Carlos Santos", email: "carlos.s@email.com", type: "Selling enabled", status: "Active" as Status, joined: "16 Aug 2026", location: "Salvador, BA", avatar: "CS", orders: 0 },
  { id: "USR-10477", name: "Fernanda Lima", email: "fernanda.l@email.com", type: "Selling enabled", status: "Active" as Status, joined: "16 Aug 2026", location: "Recife, PE", avatar: "FL", orders: 0 },
];

export const sellers = [
  { id: "SEL-1842", name: "TechZone Brasil", owner: "João Silva", plan: "Pro", status: "Active" as Status, verification: "Verified" as Status, listings: 42, rating: "4.9", revenue: "R$ 89,90", location: "São Paulo, SP", joined: "12 Jan 2026" },
  { id: "SEL-1841", name: "AutoMax Veículos", owner: "Carlos Santos", plan: "Business", status: "Active" as Status, verification: "Verified" as Status, listings: 118, rating: "4.8", revenue: "R$ 199,90", location: "Campinas, SP", joined: "03 Feb 2026" },
  { id: "SEL-1840", name: "Casa & Charme", owner: "Rafael Oliveira", plan: "Free", status: "Active" as Status, verification: "Pending" as Status, listings: 5, rating: "—", revenue: "R$ 0", location: "Belo Horizonte, MG", joined: "17 Aug 2026" },
  { id: "SEL-1839", name: "Mundo Mobile", owner: "Fernanda Lima", plan: "Pro", status: "Active" as Status, verification: "Verified" as Status, listings: 63, rating: "4.7", revenue: "R$ 89,90", location: "Recife, PE", joined: "21 Apr 2026" },
  { id: "SEL-1838", name: "Fashion Lab", owner: "Mariana Costa", plan: "Basic", status: "Suspended" as Status, verification: "Not verified" as Status, listings: 12, rating: "4.1", revenue: "R$ 39,90", location: "Rio de Janeiro, RJ", joined: "08 May 2026" },
];

export type ListingRecord = {
  id: string;
  slug: string;
  title: string;
  sellerId: string;
  seller: string;
  sellerType: "Individual" | "Business";
  categoryId: string;
  category: string;
  price: string;
  status: Status;
  created: string;
  updated: string;
  location: string;
  condition: string;
  reports: number;
  availabilityReports: number;
  promoted: boolean;
  promotion?: "Featured" | "Top of Search" | "Urgent" | "Homepage Featured";
  views: number;
  saves: number;
  photos: number;
  risk: "Low" | "Medium" | "High";
  description: string;
};

export const listings: ListingRecord[] = [
  { id: "LST-9012", slug: "iphone-16-pro-max-256gb-9012", title: "iPhone 16 Pro Max 256GB", sellerId: "SEL-1842", seller: "TechZone Brasil", sellerType: "Business", categoryId: "phones", category: "Mobile Phones", price: "R$ 8.499", status: "Published", created: "5 min ago", updated: "2 min ago", location: "São Paulo, SP", condition: "Like new", reports: 0, availabilityReports: 0, promoted: true, promotion: "Featured", views: 842, saves: 61, photos: 8, risk: "Low", description: "Well-kept iPhone with original box, charger and detailed device information supplied by the seller." },
  { id: "LST-9011", slug: "toyota-corolla-xei-2024-9011", title: "Toyota Corolla XEi 2024", sellerId: "SEL-1841", seller: "AutoMax Veículos", sellerType: "Business", categoryId: "vehicles", category: "Vehicles", price: "R$ 146.900", status: "Under review", created: "12 min ago", updated: "7 min ago", location: "Campinas, SP", condition: "Used", reports: 2, availabilityReports: 0, promoted: false, views: 496, saves: 28, photos: 12, risk: "High", description: "2024 Corolla listed with service history, transfer documentation and dealership contact information." },
  { id: "LST-9010", slug: "macbook-pro-m4-14-9010", title: "MacBook Pro M4 14-inch", sellerId: "SEL-1842", seller: "TechZone Brasil", sellerType: "Business", categoryId: "computers", category: "Computers", price: "R$ 13.500", status: "Published", created: "19 min ago", updated: "15 min ago", location: "São Paulo, SP", condition: "New", reports: 0, availabilityReports: 0, promoted: true, promotion: "Top of Search", views: 625, saves: 44, photos: 7, risk: "Low", description: "Sealed MacBook Pro M4 with invoice and manufacturer warranty details." },
  { id: "LST-9009", slug: "sofa-retratil-3-lugares-9009", title: "Sofá Retrátil 3 Lugares", sellerId: "SEL-1840", seller: "Casa & Charme", sellerType: "Business", categoryId: "home", category: "Home & Garden", price: "R$ 2.390", status: "Draft", created: "31 min ago", updated: "31 min ago", location: "Belo Horizonte, MG", condition: "New", reports: 0, availabilityReports: 0, promoted: false, views: 0, saves: 0, photos: 5, risk: "Low", description: "Draft furniture listing with dimensions, fabric and delivery information still being completed." },
  { id: "LST-9008", slug: "nike-air-jordan-1-9008", title: "Tênis Nike Air Jordan 1", sellerId: "SEL-1838", seller: "Fashion Lab", sellerType: "Business", categoryId: "fashion", category: "Fashion", price: "R$ 1.299", status: "Rejected", created: "44 min ago", updated: "20 min ago", location: "Rio de Janeiro, RJ", condition: "New", reports: 4, availabilityReports: 0, promoted: false, views: 211, saves: 13, photos: 6, risk: "High", description: "Fashion listing rejected after authenticity concerns were raised by multiple marketplace reports." },
  { id: "LST-9007", slug: "samsung-galaxy-s26-ultra-9007", title: "Samsung Galaxy S26 Ultra", sellerId: "SEL-1839", seller: "Mundo Mobile", sellerType: "Business", categoryId: "phones", category: "Mobile Phones", price: "R$ 7.899", status: "Published", created: "1 hr ago", updated: "48 min ago", location: "Recife, PE", condition: "New", reports: 0, availabilityReports: 0, promoted: true, promotion: "Homepage Featured", views: 1192, saves: 89, photos: 9, risk: "Low", description: "New Galaxy device with store warranty, accessories and pickup information." },
  { id: "LST-9006", slug: "residential-land-goiania-9006", title: "Residential Land in Goiânia", sellerId: "SEL-1840", seller: "Casa & Charme", sellerType: "Business", categoryId: "land", category: "Land", price: "R$ 240.000", status: "Paused", created: "2 hrs ago", updated: "35 min ago", location: "Goiânia, GO", condition: "Not applicable", reports: 1, availabilityReports: 0, promoted: false, views: 184, saves: 11, photos: 4, risk: "Medium", description: "Residential land listing with documentation, road access and utility information." },
  { id: "LST-9005", slug: "apartamento-vila-mariana-9005", title: "Apartamento 2 Quartos Vila Mariana", sellerId: "SEL-1840", seller: "Casa & Charme", sellerType: "Business", categoryId: "properties", category: "Properties", price: "R$ 695.000", status: "Sold", created: "3 hrs ago", updated: "18 min ago", location: "São Paulo, SP", condition: "Not applicable", reports: 0, availabilityReports: 0, promoted: false, views: 953, saves: 73, photos: 14, risk: "Low", description: "Two-bedroom apartment listing marked sold by the seller after a completed off-platform transaction." },
  { id: "LST-9004", slug: "lg-dual-inverter-12000-9004", title: "LG Dual Inverter Air Conditioner 12000 BTU", sellerId: "SEL-1840", seller: "Casa & Charme", sellerType: "Business", categoryId: "electronics", category: "Electronics", price: "R$ 2.250", status: "Published", created: "4 hrs ago", updated: "11 min ago", location: "Rio de Janeiro, RJ", condition: "Used", reports: 0, availabilityReports: 2, promoted: false, views: 72, saves: 6, photos: 3, risk: "Medium", description: "Energy-efficient split air conditioner. Buyers have recently reported that the seller said it may no longer be available." },
  { id: "LST-9003", slug: "trator-massey-ferguson-9003", title: "Trator Massey Ferguson 4275", sellerId: "SEL-1841", seller: "AutoMax Veículos", sellerType: "Business", categoryId: "agriculture", category: "Agriculture", price: "R$ 188.000", status: "Published", created: "5 hrs ago", updated: "2 hrs ago", location: "Ribeirão Preto, SP", condition: "Used", reports: 0, availabilityReports: 0, promoted: true, promotion: "Featured", views: 318, saves: 19, photos: 11, risk: "Low", description: "Farm tractor with operating hours, maintenance records and inspection availability." },
  { id: "LST-9002", slug: "website-institucional-9002", title: "Website Institucional para Pequenas Empresas", sellerId: "SEL-1842", seller: "TechZone Brasil", sellerType: "Business", categoryId: "services", category: "Services", price: "R$ 1.800", status: "Published", created: "6 hrs ago", updated: "5 hrs ago", location: "São Paulo, SP", condition: "Not applicable", reports: 0, availabilityReports: 0, promoted: false, views: 126, saves: 8, photos: 3, risk: "Low", description: "Website design and implementation service with scope, delivery time and included revisions." },
  { id: "LST-9001", slug: "consultor-vendas-recife-9001", title: "Consultor(a) de Vendas - Recife", sellerId: "SEL-1839", seller: "Mundo Mobile", sellerType: "Business", categoryId: "jobs", category: "Jobs", price: "R$ 3.200/mês", status: "Expired", created: "1 day ago", updated: "1 hr ago", location: "Recife, PE", condition: "Not applicable", reports: 0, availabilityReports: 0, promoted: false, views: 412, saves: 21, photos: 1, risk: "Low", description: "Expired sales vacancy with compensation range, responsibilities and application instructions." },
  { id: "LST-9000", slug: "equipamentos-cafeteria-9000", title: "Kit Completo para Cafeteria", sellerId: "SEL-1841", seller: "AutoMax Veículos", sellerType: "Business", categoryId: "business", category: "Business", price: "R$ 36.000", status: "Published", created: "1 day ago", updated: "8 hrs ago", location: "Campinas, SP", condition: "Used", reports: 1, availabilityReports: 0, promoted: false, views: 278, saves: 17, photos: 10, risk: "Medium", description: "Commercial coffee equipment package with inventory list, working condition and pickup details." },
  { id: "LST-8999", slug: "bicicleta-eletrica-8999", title: "Bicicleta Elétrica Urbana 500W", sellerId: "SEL-1840", seller: "Casa & Charme", sellerType: "Individual", categoryId: "other", category: "Other", price: "R$ 4.400", status: "Published", created: "1 day ago", updated: "9 hrs ago", location: "Belo Horizonte, MG", condition: "Like new", reports: 0, availabilityReports: 0, promoted: false, views: 346, saves: 26, photos: 6, risk: "Low", description: "Urban e-bike with battery range, charger and usage history." },
  { id: "LST-8998", slug: "iphone-15-pro-8998", title: "iPhone 15 Pro 256GB", sellerId: "SEL-1842", seller: "TechZone Brasil", sellerType: "Business", categoryId: "phones", category: "Mobile Phones", price: "R$ 6.200", status: "Paused", created: "1 day ago", updated: "3 hrs ago", location: "São Paulo, SP", condition: "Like new", reports: 0, availabilityReports: 0, promoted: false, views: 721, saves: 58, photos: 8, risk: "Low", description: "Seller-paused iPhone listing retained in admin inventory for history and potential reactivation." },
  { id: "LST-8997", slug: "tv-lg-oled-55-8997", title: "TV LG OLED 55\" C4", sellerId: "SEL-1839", seller: "Mundo Mobile", sellerType: "Business", categoryId: "electronics", category: "Electronics", price: "R$ 6.990", status: "Removed", created: "2 days ago", updated: "6 hrs ago", location: "Recife, PE", condition: "New", reports: 3, availabilityReports: 0, promoted: false, views: 544, saves: 29, photos: 5, risk: "High", description: "Listing removed after moderation found policy issues in the supplied product information." },
  { id: "LST-8996", slug: "dell-xps-13-8996", title: "Dell XPS 13 Plus", sellerId: "SEL-1842", seller: "TechZone Brasil", sellerType: "Business", categoryId: "computers", category: "Computers", price: "R$ 7.300", status: "Published", created: "2 days ago", updated: "1 day ago", location: "São Paulo, SP", condition: "Used", reports: 0, availabilityReports: 0, promoted: false, views: 381, saves: 22, photos: 6, risk: "Low", description: "Used Dell laptop with battery health, specifications and original charger." },
  { id: "LST-8995", slug: "honda-civic-exl-2018-8995", title: "Honda Civic EXL 2018 Automatic", sellerId: "SEL-1841", seller: "AutoMax Veículos", sellerType: "Business", categoryId: "vehicles", category: "Vehicles", price: "R$ 89.000", status: "Published", created: "2 days ago", updated: "1 day ago", location: "São Paulo, SP", condition: "Used", reports: 0, availabilityReports: 0, promoted: true, promotion: "Urgent", views: 428, saves: 37, photos: 8, risk: "Low", description: "Well-maintained Civic with service history, mileage, transmission and transfer documentation." },
  { id: "LST-8994", slug: "casa-condominio-curitiba-8994", title: "Casa em Condomínio - Curitiba", sellerId: "SEL-1840", seller: "Casa & Charme", sellerType: "Business", categoryId: "properties", category: "Properties", price: "R$ 1.180.000", status: "Under review", created: "3 days ago", updated: "2 hrs ago", location: "Curitiba, PR", condition: "Not applicable", reports: 1, availabilityReports: 1, promoted: false, views: 689, saves: 49, photos: 18, risk: "Medium", description: "Property listing placed under review after conflicting availability and ownership information was reported." },
  { id: "LST-8993", slug: "mesa-jantar-madeira-8993", title: "Mesa de Jantar Madeira Maciça", sellerId: "SEL-1840", seller: "Casa & Charme", sellerType: "Individual", categoryId: "home", category: "Home & Garden", price: "R$ 1.450", status: "Published", created: "3 days ago", updated: "2 days ago", location: "Belo Horizonte, MG", condition: "Used", reports: 0, availabilityReports: 0, promoted: false, views: 147, saves: 12, photos: 5, risk: "Low", description: "Solid wood dining table with dimensions and pickup details." },
  { id: "LST-8992", slug: "vestido-festa-azul-8992", title: "Vestido de Festa Azul Marinho", sellerId: "SEL-1838", seller: "Fashion Lab", sellerType: "Individual", categoryId: "fashion", category: "Fashion", price: "R$ 380", status: "Published", created: "4 days ago", updated: "3 days ago", location: "Rio de Janeiro, RJ", condition: "Like new", reports: 0, availabilityReports: 0, promoted: false, views: 194, saves: 31, photos: 6, risk: "Low", description: "Formal dress with size, material and condition information." },
  { id: "LST-8991", slug: "instalacao-ar-condicionado-8991", title: "Instalação de Ar-Condicionado Split", sellerId: "SEL-1839", seller: "Mundo Mobile", sellerType: "Individual", categoryId: "services", category: "Services", price: "R$ 450", status: "Published", created: "4 days ago", updated: "3 days ago", location: "Recife, PE", condition: "Not applicable", reports: 0, availabilityReports: 0, promoted: false, views: 88, saves: 4, photos: 2, risk: "Low", description: "Local installation service listing with coverage area and included labor details." },
  { id: "LST-8990", slug: "vaga-backend-python-8990", title: "Desenvolvedor(a) Backend Python", sellerId: "SEL-1842", seller: "TechZone Brasil", sellerType: "Business", categoryId: "jobs", category: "Jobs", price: "R$ 10.000/mês", status: "Published", created: "5 days ago", updated: "4 days ago", location: "Remote, Brazil", condition: "Not applicable", reports: 0, availabilityReports: 0, promoted: true, promotion: "Top of Search", views: 963, saves: 103, photos: 1, risk: "Low", description: "Backend engineering vacancy with salary range, stack and remote-work requirements." },
  { id: "LST-8989", slug: "sementes-milho-hibrido-8989", title: "Sementes de Milho Híbrido - 20kg", sellerId: "SEL-1841", seller: "AutoMax Veículos", sellerType: "Business", categoryId: "agriculture", category: "Agriculture", price: "R$ 620", status: "Published", created: "5 days ago", updated: "5 days ago", location: "Uberlândia, MG", condition: "New", reports: 0, availabilityReports: 0, promoted: false, views: 95, saves: 7, photos: 4, risk: "Low", description: "Agricultural seed listing with package size, batch and pickup details." },
  { id: "LST-8988", slug: "salon-equipment-8988", title: "Equipamentos para Salão de Beleza", sellerId: "SEL-1838", seller: "Fashion Lab", sellerType: "Business", categoryId: "business", category: "Business", price: "R$ 18.500", status: "Draft", created: "6 days ago", updated: "2 days ago", location: "Rio de Janeiro, RJ", condition: "Used", reports: 0, availabilityReports: 0, promoted: false, views: 0, saves: 0, photos: 9, risk: "Low", description: "Draft business-equipment listing awaiting final inventory and pricing details." },
  { id: "LST-8987", slug: "colecao-vinil-8987", title: "Coleção de Discos de Vinil", sellerId: "SEL-1840", seller: "Casa & Charme", sellerType: "Individual", categoryId: "other", category: "Other", price: "R$ 1.200", status: "Sold", created: "1 week ago", updated: "1 day ago", location: "Belo Horizonte, MG", condition: "Used", reports: 0, availabilityReports: 0, promoted: false, views: 329, saves: 24, photos: 10, risk: "Low", description: "Record collection sold by the seller; kept in admin history for audit and marketplace analytics." },
  { id: "LST-8986", slug: "terreno-industrial-guarulhos-8986", title: "Terreno Industrial em Guarulhos", sellerId: "SEL-1841", seller: "AutoMax Veículos", sellerType: "Business", categoryId: "land", category: "Land", price: "R$ 2.450.000", status: "Expired", created: "2 weeks ago", updated: "1 day ago", location: "Guarulhos, SP", condition: "Not applicable", reports: 0, availabilityReports: 0, promoted: false, views: 411, saves: 15, photos: 7, risk: "Low", description: "Expired industrial land listing retained for history, moderation and seller analytics." },
  { id: "LST-8985", slug: "camera-canon-r6-8985", title: "Canon EOS R6 Mark II", sellerId: "SEL-1842", seller: "TechZone Brasil", sellerType: "Business", categoryId: "electronics", category: "Electronics", price: "R$ 14.900", status: "Published", created: "2 weeks ago", updated: "2 days ago", location: "São Paulo, SP", condition: "Like new", reports: 1, availabilityReports: 0, promoted: true, promotion: "Featured", views: 772, saves: 66, photos: 9, risk: "Medium", description: "Mirrorless camera listing with shutter count, included batteries and lens compatibility details." },
  { id: "LST-8984", slug: "motorola-edge-60-8984", title: "Motorola Edge 60 Pro 512GB", sellerId: "SEL-1839", seller: "Mundo Mobile", sellerType: "Business", categoryId: "phones", category: "Mobile Phones", price: "R$ 4.399", status: "Removed", created: "3 weeks ago", updated: "4 days ago", location: "Recife, PE", condition: "New", reports: 5, availabilityReports: 1, promoted: false, views: 634, saves: 43, photos: 6, risk: "High", description: "Removed phone listing retained for moderation history after multiple policy and availability reports." },
];

export const reports = [
  { id: "RPT-3105", target: "LG Dual Inverter Air Conditioner 12000 BTU", type: "Listing", reason: "Item reported unavailable", reporter: "Bruno T.", status: "Open" as Status, created: "4 min ago", priority: "Medium" },
  { id: "RPT-3104", target: "Toyota Corolla XEi 2024", type: "Listing", reason: "Suspected fraud", reporter: "Marcos P.", status: "Open" as Status, created: "8 min ago", priority: "High" },
  { id: "RPT-3103", target: "Fashion Lab", type: "Seller", reason: "Counterfeit goods", reporter: "Beatriz A.", status: "Open" as Status, created: "26 min ago", priority: "High" },
  { id: "RPT-3102", target: "iPhone 15 Pro 128GB", type: "Listing", reason: "Incorrect information", reporter: "Pedro M.", status: "Open" as Status, created: "1 hr ago", priority: "Medium" },
  { id: "RPT-3101", target: "User USR-9132", type: "User", reason: "Spam messages", reporter: "Ana C.", status: "Resolved" as Status, created: "2 hrs ago", priority: "Low" },
];

export const verifications = [
  { id: "VER-2081", seller: "Casa & Charme", owner: "Rafael Oliveira", document: "National ID", submitted: "17 Aug 2026, 18:42", status: "Pending" as Status, risk: "Low" },
  { id: "VER-2080", seller: "Urban Bikes", owner: "Lucas Ferreira", document: "Driver's licence", submitted: "17 Aug 2026, 16:15", status: "Pending" as Status, risk: "Medium" },
  { id: "VER-2079", seller: "Bella Beauty", owner: "Juliana Rocha", document: "National ID", submitted: "17 Aug 2026, 13:02", status: "Pending" as Status, risk: "Low" },
  { id: "VER-2078", seller: "Premium Imports", owner: "Diego Martins", document: "Passport", submitted: "16 Aug 2026, 22:18", status: "Rejected" as Status, risk: "High" },
];

export const payments = [
  { id: "PAY-4912", seller: "AutoMax Veículos", type: "Business subscription · monthly", amount: "R$ 199,90", method: "Pix", status: "Paid" as Status, date: "18 Aug 2026, 19:04" },
  { id: "PAY-4911", seller: "TechZone Brasil", type: "Featured promotion · 7 days", amount: "R$ 19,90", method: "Card", status: "Paid" as Status, date: "18 Aug 2026, 17:22" },
  { id: "PAY-4910", seller: "Mundo Mobile", type: "Pro subscription · monthly", amount: "R$ 89,90", method: "Card", status: "Failed" as Status, date: "18 Aug 2026, 15:48" },
  { id: "PAY-4909", seller: "Fashion Lab", type: "Basic subscription · monthly", amount: "R$ 39,90", method: "Pix", status: "Cancelled" as Status, date: "18 Aug 2026, 11:31" },
  { id: "PAY-4908", seller: "Casa Decor", type: "Top of Search promotion · 3 days", amount: "R$ 14,90", method: "Boleto", status: "Paid" as Status, date: "17 Aug 2026, 23:18" },
];

export const supportTickets = [
  { id: "TKT-1208", user: "Mariana Costa", subject: "Can't access my selling tools", category: "Account", priority: "High", status: "Open" as Status, updated: "4 min ago" },
  { id: "TKT-1207", user: "Lucas Ferreira", subject: "Payment charged twice", category: "Billing", priority: "High", status: "Open" as Status, updated: "21 min ago" },
  { id: "TKT-1206", user: "João Silva", subject: "How do featured listings work?", category: "Listings", priority: "Normal", status: "Open" as Status, updated: "1 hr ago" },
  { id: "TKT-1205", user: "Ana Souza", subject: "Appeal account suspension", category: "Account", priority: "Normal", status: "Open" as Status, updated: "2 hrs ago" },
];

export const categories = [
  { name: "Mobile Phones", slug: "phones", listings: 3211, active: true, icon: "📱" },
  { name: "Electronics", slug: "electronics", listings: 2840, active: true, icon: "📺" },
  { name: "Computers", slug: "computers", listings: 1980, active: true, icon: "💻" },
  { name: "Vehicles", slug: "vehicles", listings: 3820, active: true, icon: "🚗" },
  { name: "Properties", slug: "properties", listings: 1740, active: true, icon: "🏢" },
  { name: "Land", slug: "land", listings: 620, active: true, icon: "🗺️" },
  { name: "Home & Garden", slug: "home", listings: 2351, active: true, icon: "🛋️" },
  { name: "Fashion", slug: "fashion", listings: 2198, active: true, icon: "👕" },
  { name: "Services", slug: "services", listings: 730, active: true, icon: "🛠️" },
  { name: "Jobs", slug: "jobs", listings: 250, active: true, icon: "💼" },
  { name: "Agriculture", slug: "agriculture", listings: 410, active: true, icon: "🚜" },
  { name: "Business", slug: "business", listings: 540, active: true, icon: "🏪" },
  { name: "Other", slug: "other", listings: 1280, active: true, icon: "📦" },
];

export const activityLog = [
  { admin: "Ana Martins", action: "Approved seller verification", target: "VER-2077 · Nova Tech", time: "2 min ago", ip: "177.42.18.20" },
  { admin: "System", action: "Flagged listing automatically", target: "LST-9011 · Toyota Corolla XEi 2024", time: "12 min ago", ip: "—" },
  { admin: "Carlos Mendes", action: "Suspended selling access", target: "SEL-1838 · Fashion Lab", time: "34 min ago", ip: "201.17.92.44" },
  { admin: "Mariana Alves", action: "Reviewed availability report", target: "RPT-3105 · LG Dual Inverter", time: "46 min ago", ip: "189.9.100.51" },
  { admin: "Ana Martins", action: "Rejected listing", target: "LST-9008 · Air Jordan 1", time: "2 hrs ago", ip: "177.42.18.20" },
];

export const plans = [
  { id: "free", name: "Free", monthlyPrice: 0, yearlyPrice: 0, price: "R$ 0", period: "/month", sellers: 2130, listings: "5", featured: "0", visibility: "1.0×", badge: "Default", recommended: false },
  { id: "basic", name: "Basic", monthlyPrice: 39.9, yearlyPrice: 399, price: "R$ 39,90", period: "/month", sellers: 1074, listings: "25", featured: "0", visibility: "1.1×", badge: "Entry capacity", recommended: false },
  { id: "pro", name: "Pro", monthlyPrice: 89.9, yearlyPrice: 899, price: "R$ 89,90", period: "/month", sellers: 751, listings: "100", featured: "4", visibility: "1.35×", badge: "Recommended", recommended: true },
  { id: "business", name: "Business", monthlyPrice: 199.9, yearlyPrice: 1999, price: "R$ 199,90", period: "/month", sellers: 326, listings: "300", featured: "12", visibility: "1.6×", badge: "Scale", recommended: false },
];

export const promotionProducts = [
  { id: "featured", name: "Featured", price: "R$ 19,90", amount: 19.9, duration: "7 days", description: "Premium Featured badge with stronger marketplace placement." },
  { id: "top_search", name: "Top of Search", price: "R$ 14,90", amount: 14.9, duration: "3 days", description: "Higher placement in relevant search results." },
  { id: "urgent", name: "Urgent", price: "R$ 9,90", amount: 9.9, duration: "7 days", description: "Urgent badge for listings where the seller wants faster attention." },
  { id: "homepage", name: "Homepage Featured", price: "R$ 29,90", amount: 29.9, duration: "3 days", description: "Eligibility for premium placement on the Marketlift homepage." },
];
