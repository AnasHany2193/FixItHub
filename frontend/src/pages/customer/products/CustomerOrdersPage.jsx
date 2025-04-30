import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Filter, Package } from "lucide-react";
import format from "date-fns/format";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCustomerOrders } from "@/hooks/useMarketplace";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import HeaderPages from "@/components/common/HeaderPages";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "total-asc", label: "Total: Low to High" },
  { value: "total-desc", label: "Total: High to Low" },
];

export default function CustomerOrdersPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: "all",
    sort: "newest",
    startDate: null,
    endDate: null,
  });

  const { data: orders, isLoading } = useCustomerOrders(filters);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      {/* Header */}
      <HeaderPages
        title="Order History"
        subtitle="View and manage your purchase history"
      />

      {/* Filters */}
      <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger>
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, sort: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Start Date Input */}
        <Input
          type="date"
          name="startDate"
          value={filters.startDate || ""}
          startIcon={<Calendar className="w-4 h-4" />}
          onChange={handleDateChange}
          placeholder="Start Date (YYYY-MM-DD)"
        />

        {/* End Date Input */}
        <Input
          type="date"
          name="endDate"
          value={filters.endDate || ""}
          onChange={handleDateChange}
          placeholder="End Date (YYYY-MM-DD)"
          startIcon={<Calendar className="w-4 h-4" />}
          min={filters.startDate}
        />
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : orders?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Package className="w-16 h-16 text-muted-foreground" />
          <h3 className="text-2xl font-semibold">No Orders Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or shop our marketplace
          </p>
        </div>
      ) : (
        <motion.div className="space-y-4">
          {orders?.map((order) => (
            <motion.div
              key={order._id}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate(`/marketplace/orders/${order._id}`)}
              className="cursor-pointer"
            >
              <div className="p-4 overflow-hidden transition-all border rounded-lg shadow-sm cursor-pointer hover:shadow-lg bg-background hover:shadow-indigo-700/50 dark:hover:shadow-gray-700/50">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <Badge
                        variant={
                          order.status === "completed" ? "success" : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(
                        new Date(order.createdAt),
                        "MMM dd, yyyy - HH:mm"
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      ${order.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.items.length} items
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid gap-4 sm:grid-cols-2">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img
                        src={
                          item.product.images?.[0]?.url ||
                          "/placeholder-product.jpg"
                        }
                        alt={item.product.name}
                        className="object-cover w-12 h-12 rounded-md"
                      />
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Seller: {item.product.seller.username}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
