import { ListingsManagement } from "@/components/admin/listings-management";
import { PageHeader } from "@/components/ui/page-header";

export default function ListingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings"
        description="Access every marketplace listing across all sellers and lifecycle states. Ordinary listings publish after automated validation; admin review is reserved for exceptions."
      />
      <ListingsManagement />
    </div>
  );
}
