import type { ReactNode } from "react";
import { UpcomingFeature } from "@/components/admin/upcoming-feature";
import { releaseFeatures } from "@/lib/release-features";

export default function SubscriptionsLayout({children}:{children:ReactNode}) {
  return releaseFeatures.payments ? children : <UpcomingFeature feature="payments"/>;
}
