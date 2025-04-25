import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, User, Gavel, Zap } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDirectOffers } from "@/hooks/useRepair";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "appliances", label: "Appliances" },
  { value: "other", label: "Other" },
];

export default function DirectOffersPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ category: "all", sort: "newest" });
  const { data: repairs, isLoading } = useDirectOffers(filters);

  return (
    <div className="px-4 py-6 mx-auto md:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col mb-8 gap-y-4 md:flex-row md:items-center md:justify-between">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text md:text-3xl font-JosefinSans">
            Direct Repair Offers
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Available repair requests accepting direct offers
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2">
          <Tabs
            value={filters.sort}
            onValueChange={(sort) => setFilters((prev) => ({ ...prev, sort }))}
          >
            <TabsList className="bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="newest">Newest</TabsTrigger>
              <TabsTrigger value="price">Price</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={filters.category}
            onValueChange={(category) =>
              setFilters((prev) => ({ ...prev, category }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {isLoading ? (
          [1, 2, 3].map((i) => <DirectRepairCardSkeleton key={i} />)
        ) : repairs?.length === 0 ? (
          <EmptyState />
        ) : (
          repairs?.map((repair) => (
            <RepairCard
              key={repair._id}
              repair={repair}
              onClick={() => navigate(`/repairs/direct/${repair._id}`)}
            />
          ))
        )}
      </motion.div>
    </div>
  );
}

// const RepairCard = ({ repair, onClick }) => (
//   <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//     <Card className="cursor-pointer">
//       <CardContent className="p-4 space-y-4">
//         <div className="flex items-center gap-3">
//           <Avatar className="border-2 border-emerald-100 dark:border-emerald-900/20">
//             <AvatarImage src={repair.customer?.profile?.avatar?.url} />
//             <AvatarFallback>{repair.customer?.username?.[0]}</AvatarFallback>
//           </Avatar>
//           <div>
//             <h3 className="font-semibold">{repair.title}</h3>
//             <p className="text-sm text-muted-foreground">{repair.itemType}</p>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           <StatItem
//             icon={
//               <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
//             }
//             label="Avg. Offer"
//             value={
//               repair.averageOffer ? `$${repair.averageOffer}` : "No offers"
//             }
//           />
//           <StatItem
//             icon={
//               <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
//             }
//             label="Posted"
//             value={formatDistanceToNow(new Date(repair.createdAt), {
//               addSuffix: true,
//             })}
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <Badge variant="secondary">{repair.category}</Badge>
//           {repair.offerCount > 0 && (
//             <Badge variant="default">{repair.offerCount} offers</Badge>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   </motion.div>
// );

const RepairCard = ({ repair, onClick }) => {
  const customer = repair.customer;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-full overflow-hidden transition-shadow border shadow-sm dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:shadow-md">
        <CardContent className="p-0">
          <div className="relative aspect-video group">
            {repair.photos?.length > 0 ? (
              <div className="relative h-full">
                <img
                  src={repair.photos[0].url}
                  alt={repair.title}
                  className="object-cover w-full h-full transition-opacity group-hover:opacity-90"
                />
                {repair.photos.length > 1 && (
                  <Badge
                    variant="secondary"
                    className="absolute px-2 py-1 text-xs bottom-2 left-2"
                  >
                    +{repair.photos.length - 1} more
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <Zap className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
            )}

            <div className="absolute flex gap-2 top-2 right-2">
              <Badge variant="premium">{repair.category}</Badge>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                {repair.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {repair.issueDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatItem
                icon={<User className="w-4 h-4" />}
                label={"Posted"}
                value={formatDistanceToNow(new Date(repair.createdAt))}
              />

              <StatItem
                icon={<DollarSign className="w-4 h-4" />}
                label={"Avg. Offer"}
                value={`$${repair.averageOffer || "N/A"}`}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {customer?.profile?.avatar?.url ? (
                  <img
                    src={customer.profile.avatar.url}
                    className="w-6 h-6 rounded-full"
                    alt={customer.username}
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="capitalize">
                  {customer?.username || "Anonymous"}
                </span>
              </div>
              <Badge variant="outline">
                {`${repair.offerCount || 0} offers`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DirectRepairCardSkeleton = () => (
  <div className="p-4 space-y-4 border rounded-xl dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
    <Skeleton className="rounded-lg aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
    <div className="space-y-2">
      <Skeleton className="w-3/4 h-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
      <Skeleton className="w-1/2 h-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
    </div>
    <Skeleton className="w-full h-8 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
  </div>
);

const StatItem = ({ icon, label, value, highlight = false }) => (
  <div
    className={`p-2 rounded-lg ${highlight ? "bg-indigo-50 dark:bg-gray-700" : "bg-gray-50 dark:bg-gray-800"}`}
  >
    <div className="flex items-center gap-2">
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

const EmptyState = () => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="py-12 text-center col-span-full"
  >
    <div className="p-4 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-800 w-fit">
      <Gavel className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
    </div>
    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
      No Direct Repairs
    </h3>
    <p className="text-gray-600 dark:text-gray-300">
      Check back later for new repair opportunities
    </p>
  </motion.div>
);
