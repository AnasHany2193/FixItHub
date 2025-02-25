import { formatDistanceToNow } from "date-fns";
import { Gavel, Truck, CreditCard, Wrench } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const RepairDetailsDialog = ({ repair, StatItem, statusConfig }) => (
  <DialogContent className="max-w-[90%] rounded-xl max-h-[90vh] overflow-auto font-JosefinSans">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
        {repair.title}
      </DialogTitle>
      <DialogDescription className="text-gray-600 capitalize dark:text-gray-400">
        {repair.itemType} · {repair.category}
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-6">
      {/* Status & Metadata */}
      <div className="grid grid-cols-2 gap-4">
        <StatItem
          label="Status"
          value={
            <Badge className={`text-sm ${statusConfig[repair.status].color}`}>
              {statusConfig[repair.status].icon}
              <span className="ml-1.5">
                {statusConfig[repair.status].label}
              </span>
            </Badge>
          }
        />
        <StatItem
          label="Created"
          value={new Date(repair.createdAt).toLocaleDateString()}
        />
      </div>

      {/* Problem & Visuals Section */}
      <section className="p-4 space-y-4 bg-gray-100 rounded-xl dark:bg-gray-700/50">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Problem Details
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {repair.issueDescription || "No description provided"}
        </p>

        {repair.photos?.length > 0 && (
          <div className="grid grid-cols-3 gap-3 pt-4">
            {repair.photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo.url}
                  alt={`Repair evidence ${index + 1}`}
                  className="object-cover w-full rounded-lg aspect-square"
                />
                <div className="absolute inset-0 transition-opacity rounded-lg opacity-0 bg-black/20 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Timeline Section */}
      <section className="p-4 bg-gray-100 rounded-xl dark:bg-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <Truck className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Repair Timeline
          </h3>
        </div>

        <div className="space-y-4">
          {repair.trackingUpdates?.map((update, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex flex-col items-center pt-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {index < repair.trackingUpdates.length - 1 && (
                  <div className="w-px h-6 my-1 bg-gray-200 dark:bg-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {update.status.replace(/_/g, " ")}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(update.timestamp).toLocaleDateString()}
                  {update.location && ` · ${update.location}`}
                </p>
              </div>
            </div>
          ))}

          {!repair.trackingUpdates?.length && (
            <p className="text-gray-500 dark:text-gray-400">
              No timeline updates available
            </p>
          )}
        </div>
      </section>

      {/* Auction & Payment Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Auction Details */}
        <section className="p-4 bg-gray-100 rounded-xl dark:bg-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <Gavel className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Auction Details
            </h3>
          </div>
          <div className="space-y-3">
            <StatItem
              label="Starting Price"
              value={`$${repair.auction?.startingMaxPrice?.toFixed(2) || "0.00"}`}
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
            />
            <StatItem label="Total Bids" value={repair.bids?.length || 0} />
          </div>
        </section>

        {/* Payment Details */}
        <section className="p-4 bg-gray-100 rounded-xl dark:bg-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment Details
            </h3>
          </div>
          <div className="space-y-3">
            <StatItem
              label="Status"
              value={repair.paymentStatus || "Pending"}
            />
            <StatItem
              label="Amount"
              value={`$${repair.paymentAmount?.toFixed(2) || "0.00"}`}
            />
            <StatItem
              label="Method"
              value={repair.paymentDetails?.method || "Not specified"}
            />
          </div>
        </section>
      </div>
    </div>
  </DialogContent>
);

export default RepairDetailsDialog;
