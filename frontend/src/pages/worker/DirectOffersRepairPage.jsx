// NonAuctionRepairPage.jsx
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Wrench, User, DollarSign, Clock } from "lucide-react";

import { useDirectOffersRepairDetails } from "@/hooks/useRepair";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCarousel } from "@/components/common/ImageCarousel";

export default function DirectOffersRepairPage() {
  const { id } = useParams();
  const { data: repair, isLoading } = useDirectOffersRepairDetails(id);

  if (isLoading) return <PageSkeleton />;
  if (!repair) return <div>Repair not found</div>;

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <ImageCarousel images={repair.photos} />
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <h1 className="text-2xl font-semibold">{repair.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{repair.category}</Badge>
                <Badge variant="success">Direct Offer</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="prose dark:prose-invert">
                <h3>Repair Details</h3>
                <p>{repair.issueDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatItem
                  icon={<User className="w-5 h-5 text-indigo-600" />}
                  label="Requested By"
                  value={repair.customer?.username || "Not assigned"}
                />
                <StatItem
                  icon={<Clock className="w-5 h-5 text-amber-600" />}
                  label="Posted"
                  value={format(new Date(repair.createdAt), "MMM dd, yyyy")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Offer Details</h2>
              <StatItem
                icon={<DollarSign className="w-5 h-5 text-green-600" />}
                label="Average Offer"
                value={
                  repair.offers?.length
                    ? `$${repair.averageOffer}`
                    : "No offers yet"
                }
              />

              <Button className="w-full" variant="default">
                Submit Offer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Item Information</h2>
              <StatItem
                label="Item Type"
                value={repair.itemType}
                icon={<Wrench className="w-5 h-5 text-blue-600" />}
              />
              <StatItem
                label="Shipping Required"
                value={repair.shippingRequired ? "Yes" : "No"}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const PageSkeleton = () => (
  <div className="px-4 py-8 mx-auto space-y-8 max-w-7xl">
    <Skeleton className="w-1/2 h-10 rounded-lg" />
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <div className="space-y-8">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  </div>
);

const StatItem = ({ icon, label, value, highlight = false }) => (
  <div
    className={`p-2 flex rounded-lg ${highlight ? "bg-indigo-50 dark:bg-gray-700" : "bg-gray-50 dark:bg-gray-800"}`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-300">{label}</p>
        <p
          className={`font-medium ${highlight ? "text-indigo-600 dark:text-indigo-300" : "text-gray-900 dark:text-white"}`}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
);
