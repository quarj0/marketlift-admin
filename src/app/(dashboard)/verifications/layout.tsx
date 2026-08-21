import type { ReactNode } from "react";
import { UpcomingFeature } from "@/components/admin/upcoming-feature";
import { releaseFeatures } from "@/lib/release-features";

export default function VerificationsLayout({children}:{children:ReactNode}) {
  return releaseFeatures.cpfVerification ? children : <UpcomingFeature feature="verification"/>;
}
