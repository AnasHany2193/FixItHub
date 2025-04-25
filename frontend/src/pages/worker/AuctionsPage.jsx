import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Gavel, Clock, DollarSign, Zap, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useOpenAuctions } from "@/hooks/useRepair";

const auctionFilters = [
  { value: "all", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "appliances", label: "Appliances" },
  { value: "other", label: "Other" },
];

export default function AuctionsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: "all",
    maxPrice: "",
    sortBy: "price",
  });

  const { data: auctions, isLoading } = useOpenAuctions(filters);

  return (
    <div className="px-4 py-6 mx-auto md:px-6 lg:px-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text md:text-3xl font-JosefinSans">
            Live Auctions
          </h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-300">
            Bid on available repair opportunities
          </p>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          className="grid items-center gap-4 mb-6 md:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
            icon={
              <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            }
            className="bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
          />

          <Select
            value={filters.category}
            onValueChange={(value) =>
              setFilters({ ...filters, category: value })
            }
          >
            <SelectTrigger className="w-full bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              {auctionFilters.map((filter) => (
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
            <TabsList className="grid grid-cols-2 bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <TabsTrigger
                value="price"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-indigo-sm dark:data-[state=active]:bg-indigo-700"
              >
                Starting Price
              </TabsTrigger>
              <TabsTrigger
                value="expiry"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-purple-sm dark:data-[state=active]:bg-purple-700"
              >
                Time Remaining
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>
      </div>

      {/* Auction Grid */}
      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {isLoading ? (
          [1, 2, 3].map((i) => <AuctionCardSkeleton key={i} />)
        ) : auctions?.length === 0 ? (
          <EmptyState />
        ) : (
          auctions?.map((auction) => (
            <AuctionCard
              key={auction._id}
              auction={auction}
              onClick={() => navigate(`/repairs/auctions/${auction._id}`)}
            />
          ))
        )}
      </motion.div>
    </div>
  );
}

// const AuctionCard = ({ auction, onClick }) => {
//   const repair = auction.repairRequest;
//   const timeLeft = formatDistanceToNow(new Date(auction.expiresAt));

//   return (
//     <motion.div
//       whileHover={{ scale: 1.02 }}
//       whileTap={{ scale: 0.98 }}
//       className="cursor-pointer"
//       onClick={onClick}
//     >
//       <Card className="h-full overflow-hidden transition-shadow border shadow-sm dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:shadow-md">
//         <CardContent className="p-0">
//           <div className="relative aspect-video group">
//             {repair.photos[0]?.url ? (
//               <img
//                 src={repair.photos[0].url}
//                 alt={repair.title}
//                 className="object-cover w-full h-full transition-opacity group-hover:opacity-90"
//               />
//             ) : (
//               <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
//                 <Zap className="w-8 h-8 text-gray-400 dark:text-gray-500" />
//               </div>
//             )}
//             <Badge
//               variant="indigo"
//               className="absolute border border-gray-200 top-2 right-2 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 dark:border-gray-700"
//             >
//               {repair.category}
//             </Badge>
//             <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent" />
//           </div>

//           <div className="p-4 space-y-3">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
//               {repair.title}
//             </h3>

//             <div className="flex items-center gap-2 text-sm">
//               <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
//               <span className="text-gray-600 dark:text-gray-300">
//                 {timeLeft} remaining
//               </span>
//             </div>

//             <div className="flex items-center gap-2 text-sm">
//               <Gavel className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
//               <span className="font-medium text-gray-900 dark:text-white">
//                 Starting at ${auction.startingMaxPrice}
//               </span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// };

// Main changes in AuctionCard component
const AuctionCard = ({ auction, onClick }) => {
  console.log("auction", auction);
  const repair = auction.repair;
  const timeLeft = formatDistanceToNow(new Date(auction.expiresAt));
  const currentBid =
    auction.currentLowestBid?.bidPrice || auction.startingMaxPrice;

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

            <div className="absolute flex gap-2 right-2 top-2">
              <Badge
                variant="premium"
                className="border border-gray-200 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 dark:border-gray-700"
              >
                {repair.category}
              </Badge>
              <Badge
                variant="success"
                className="border border-gray-200 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 dark:border-gray-700"
              >
                {auction.status === "open" ? "Active" : "Closed"}
              </Badge>
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
                icon={
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                }
                label="Time Left"
                value={timeLeft}
              />

              <StatItem
                icon={
                  <Gavel className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                }
                label={
                  auction.bids?.length > 0 ? "Current Bid" : "Starting Price"
                }
                value={`$${currentBid}`}
                highlight={!!auction.bids?.length}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 capitalize">
                <User className="w-4 h-4" />
                {auction.customer?.username || "Anonymous"}
              </span>
              <Badge variant="outline">{auction.bids?.length || 0} bids</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// New StatItem component with highlight capability
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

const AuctionCardSkeleton = () => (
  <div className="p-4 space-y-4 border rounded-xl dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
    <Skeleton className="rounded-lg aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
    <div className="space-y-2">
      <Skeleton className="w-3/4 h-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
      <Skeleton className="w-1/2 h-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
    </div>
    <Skeleton className="w-full h-8 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
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
      No Active Auctions
    </h3>
    <p className="text-gray-600 dark:text-gray-300">
      Check back later for new repair opportunities
    </p>
  </motion.div>
);
