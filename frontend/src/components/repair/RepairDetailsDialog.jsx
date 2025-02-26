import { formatDistanceToNow } from "date-fns";
import {
  Gavel,
  Truck,
  CreditCard,
  Wrench,
  Box,
  Clock,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const RepairDetailsDialog = ({ repair, StatItem, statusStages }) => {
  const currentStatus = statusStages[repair.status] || statusStages.pending;

  return (
    <DialogContent className="max-w-[90vw]  md:max-w-4xl rounded-2xl max-h-[90dvh] overflow-auto p-0 font-JosefinSans">
      {/* Header Section */}
      <div className="relative text-white bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-gray-800 dark:to-gray-900">
        <div className="p-6 space-y-2">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">
              {repair.title}
            </DialogTitle>
            <DialogDescription className="text-indigo-100 dark:text-gray-300">
              {repair.itemType} · {repair.category}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-4 pt-4">
            <Badge variant="premium" className="gap-1.5 backdrop-blur-sm">
              <Box className="w-4 h-4" />
              {repair.shippingRequired ? "Shipping Required" : "Local Service"}
            </Badge>
            <Badge variant="premium" className="gap-1.5 backdrop-blur-sm">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(repair.createdAt), {
                addSuffix: true,
              })}
            </Badge>
          </div>
        </div>

        {/* Progress Rail */}
        <div className="px-6 pb-6">
          <div className="flex justify-between mb-2 text-sm font-medium text-indigo-100 dark:text-gray-300">
            <span>Repair Progress</span>
            <span>Step {currentStatus.step} of 4</span>
          </div>
          <Progress
            value={(currentStatus.step / 4) * 100}
            className="h-2 bg-white/20 dark:bg-gray-700"
            indicatorClassName={currentStatus.color}
          />
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        {/* Visual Evidence Carousel */}
        {repair.photos?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            <Carousel className="overflow-hidden shadow-xl rounded-xl">
              <CarouselContent>
                {repair.photos.map((photo) => (
                  <CarouselItem key={photo.public_id}>
                    <div className="relative aspect-video">
                      <img
                        src={photo.url}
                        alt="Repair evidence"
                        className="object-cover w-full h-full rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Thumbnail Strip */}
              <div className="absolute -translate-x-1/2 bottom-4 left-1/2">
                <div className="flex gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                  {repair.photos.map((photo, idx) => (
                    <button
                      key={photo.public_id}
                      className="w-8 h-8 transition-opacity hover:opacity-100"
                      style={{ opacity: idx === 0 ? 1 : 0.6 }}
                    >
                      <img
                        src={photo.url}
                        className="object-cover w-full h-full rounded"
                        alt={`Thumbnail ${idx + 1}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </Carousel>
          </motion.div>
        )}

        {/* Problem & Status Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Problem Details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 space-y-4 bg-white border border-indigo-100 dark:bg-gray-800 rounded-xl dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-2xl font-semibold">Issue Breakdown</h3>
            </div>
            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
              {repair.issueDescription}
            </p>
          </motion.div>

          {/* Status Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 space-y-4 bg-white border border-indigo-100 dark:bg-gray-800 rounded-xl dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg dark:bg-gray-700">
                <Truck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-semibold">Service Journey</h3>
            </div>

            <div className="pl-4 space-y-4 border-l-2 border-indigo-200 dark:border-gray-700">
              {repair.trackingUpdates?.map((update, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  className="relative pl-6"
                >
                  <div className="absolute left-0 top-4 w-2 h-2 bg-indigo-500 rounded-full -translate-x-[calc(0.75rem+1px)]" />
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {update.status.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(update.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {update.location && (
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="w-4 h-4" />
                        {update.location}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}

              {!repair.trackingUpdates?.length && (
                <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                  <p>No tracking updates available</p>
                  <p className="mt-1 text-sm">
                    Updates will appear here as work progresses
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Auction & Payment Dashboard */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Auction Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white border border-indigo-100 dark:bg-gray-800 rounded-xl dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg dark:bg-gray-700">
                <Gavel className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-semibold">Bidding Activity</h3>
            </div>

            <div className="space-y-4">
              <StatItem
                label="Current Offer"
                value={
                  repair.bids.length > 0
                    ? `$${Math.min(...repair.bids.map((b) => b.bidPrice))}`
                    : "No active bids"
                }
                icon={
                  <span className="text-emerald-600 dark:text-emerald-400">
                    ↓
                  </span>
                }
              />
              <StatItem
                label="Time Remaining"
                value={
                  repair.auction?.expiresAt
                    ? formatDistanceToNow(new Date(repair.auction.expiresAt), {
                        addSuffix: true,
                      })
                    : "N/A"
                }
                icon={
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                }
              />
              <StatItem
                label="Total Offers"
                value={repair.bids.length}
                icon={
                  <span className="text-indigo-600 dark:text-indigo-400">
                    📨
                  </span>
                }
              />
            </div>
          </motion.div>

          {/* Payment Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white border border-indigo-100 dark:bg-gray-800 rounded-xl dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg dark:bg-gray-700">
                <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-semibold">Payment Overview</h3>
            </div>

            <div className="space-y-4">
              <StatItem
                label="Status"
                value={
                  <span
                    className={`font-semibold ${
                      repair.paymentStatus === "pending"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {repair.paymentStatus}
                  </span>
                }
              />
              <StatItem
                label="Amount Reserved"
                value={`$${repair.auction?.startingMaxPrice?.toFixed(2)}`}
              />
              <StatItem
                label="Payment Method"
                value={repair.paymentDetails?.method || "Not specified"}
                icon={
                  <span className="text-lg">
                    {repair.paymentDetails?.method === "credit_card"
                      ? "💳"
                      : "📝"}
                  </span>
                }
              />
            </div>
          </motion.div>
        </div>
      </div>
    </DialogContent>
  );
};

export default RepairDetailsDialog;
