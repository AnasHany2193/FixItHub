import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, User, Gavel, Zap, Wrench, Clock } from "lucide-react";

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
import { useRepairList } from "@/hooks/useRepair";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import NotFoundStatus from "@/components/common/NotFoundStatus";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "appliances", label: "Appliances" },
  { value: "other", label: "Other" },
];

export default function FindRepairsPage({ type }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: "all",
    ...(type === "auctions" && { maxPrice: "", sortBy: "price" }),
    ...(type === "direct-offers" && { sortBy: "newest" }),
  });

  const { data: repairs, isLoading } = useRepairList(type, filters);

  return (
    <div className="px-4 py-6 mx-auto md:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <RepairListHeader type={type} filters={filters} setFilters={setFilters} />

      {/* Content */}
      {isLoading ? (
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </motion.div>
      ) : repairs?.length === 0 ? (
        <NotFoundStatus
          icon={type === "auctions" ? <Gavel /> : <Wrench />}
          title={
            type === "auctions"
              ? "No Active Auctions"
              : "No Direct Offers Available"
          }
          message={"Check back later for new repair opportunities"}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {repairs?.map((repair) => (
            <RepairCard
              key={repair._id}
              repair={repair}
              type={type}
              onClick={() => navigate(`/repairs/${type}/${repair._id}`)}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

const RepairListHeader = ({ type, filters, setFilters }) => {
  const headerConfig = {
    auctions: {
      title: "Live Auctions",
      subtitle: "Bid on available repair opportunities",
      sortOptions: [
        { value: "price", label: "Starting Price" },
        { value: "expiry", label: "Time Remaining" },
      ],
      showPriceFilter: true,
    },
    "direct-offers": {
      title: "Direct Repair Offers",
      subtitle: "Available repair requests accepting direct offers",
      sortOptions: [
        { value: "newest", label: "Newest" },
        { value: "price", label: "Price" },
      ],
      showPriceFilter: false,
    },
  };

  const { title, subtitle, sortOptions, showPriceFilter } = headerConfig[type];

  return (
    <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text md:text-3xl font-JosefinSans">
          {title}
        </h1>
        <p className="mt-1.5 text-gray-600 dark:text-gray-300">{subtitle}</p>
      </motion.div>

      <motion.div
        className={`grid items-center gap-4 mb-6 ${type === "auctions" ? "md:grid-cols-3" : "md:grid-cols-2"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {showPriceFilter && (
          <Input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
            startIcon={
              <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            }
            className="bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
          />
        )}

        <Select
          value={filters.category}
          onValueChange={(value) => setFilters({ ...filters, category: value })}
        >
          <SelectTrigger className="w-full bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            {categories.map((filter) => (
              <SelectItem
                key={filter.value}
                value={filter.value}
                className="hover:bg-indigo-50 dark:hover:bg-gray-700"
              >
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs
          value={filters.sortBy}
          onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
          className="w-full md:w-auto"
        >
          <TabsList className="grid-cols-2 bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            {sortOptions.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-indigo-sm dark:data-[state=active]:bg-indigo-700 px-5"
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>
    </div>
  );
};

const RepairCard = ({ repair, onClick, type }) => {
  // Normalize data structure
  const isAuction = type === "auctions";
  const repairData = isAuction ? repair.repairRequest : repair;
  const customer = repairData.customer || repair.customer;

  // Calculate dynamic values
  const currentPrice = isAuction
    ? repair.currentLowestBid?.bidPrice || repair.startingMaxPrice
    : repair.averageOffer || "N/A";

  const timeLabel = isAuction ? "Time Left" : "Posted";
  const timeValue = isAuction
    ? formatDistanceToNow(new Date(repair.expiresAt))
    : formatDistanceToNow(new Date(repairData.createdAt), { addSuffix: true });

  const interactionCount = isAuction ? repair.bidCount : repair.offerCount;
  const interactionLabel = isAuction ? "bids" : "offers";

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
            {/* Image Gallery */}
            {repairData.photos?.[0]?.url ? (
              <div className="relative h-full">
                <img
                  src={repairData.photos[0].url}
                  alt={repairData.title}
                  className="object-cover w-full h-full transition-opacity group-hover:opacity-90"
                />
                {repairData.photos.length > 1 && (
                  <Badge
                    variant="secondary"
                    className="absolute px-2 py-1 text-xs bottom-2 left-2"
                  >
                    +{repairData.photos.length - 1}
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <Zap className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
            )}

            <div className="absolute flex gap-2 right-2 top-2">
              <Badge variant="premium">{repairData.category}</Badge>
              {isAuction && (
                <Badge
                  variant={repair.status === "open" ? "success" : "destructive"}
                  className="border border-gray-200 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 dark:border-gray-700"
                >
                  {repair.status === "open" ? "Active" : "Closed"}
                </Badge>
              )}
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                {repairData.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {repairData.issueDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatItem
                icon={
                  isAuction ? (
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  )
                }
                label={timeLabel}
                value={timeValue}
              />

              <StatItem
                icon={
                  isAuction ? (
                    <Gavel className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )
                }
                label={
                  isAuction
                    ? repair.bidCount
                      ? "Current Bid"
                      : "Starting Price"
                    : "Avg. Offer"
                }
                value={`$${currentPrice}${!isAuction && typeof currentPrice === "number" ? "" : ""}`}
                highlight={!!interactionCount}
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
                {interactionCount || 0} {interactionLabel}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CardSkeleton = () => (
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
