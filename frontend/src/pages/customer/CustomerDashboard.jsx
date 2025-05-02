import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  Wrench,
  Package,
  Heart,
  Plus,
  DollarSign,
  Hammer,
  CheckCircle,
  Wallet,
} from "lucide-react";
import {
  useDashboardSummary,
  useMarketplaceActivity,
} from "@/hooks/useDashboard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import HeaderPages from "@/components/common/HeaderPages";
import { Badge } from "@/components/ui/badge";
import { useCustomerOrders, useFavorites } from "@/hooks/useMarketplace";
import { useRepairRequests } from "@/hooks/useRepair";

export default function CustomerDashboard() {
  const { data: favorites, isLoading: loadingFavorites } = useFavorites();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: recentOrders, isLoading: ordersLoading } = useCustomerOrders();
  const { data: activeRepairs, isLoading: repairsLoading } =
    useRepairRequests();
  const { data: marketplaceActivity, isLoading: activityLoading } =
    useMarketplaceActivity();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between">
        <HeaderPages title="Welcome Back!" />
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/repairs/new">
              <Plus className="w-4 h-4 mr-2" />
              New Repair Request
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/marketplace/products">
              <Package className="w-4 h-4 mr-2" />
              Browse Products
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Wrench />}
          title="Active Repairs"
          value={activeRepairs?.length || 0}
          loading={repairsLoading}
        />
        <StatCard
          icon={<Package />}
          title="Recent Orders"
          value={recentOrders?.length || 0}
          loading={ordersLoading}
        />
        <StatCard
          icon={<Heart />}
          title="Saved Favorites"
          value={favorites?.length || 0}
          loading={loadingFavorites}
        />
        <StatCard
          icon={<Wallet />}
          title="Total Spent"
          value={`$${(
            (summary?.stats?.repairs?.totalSpent || 0) +
            (summary?.stats?.marketplace?.totalSpent || 0)
          ).toFixed(2)}`}
          loading={summaryLoading}
          tooltip="Combined spending on repairs and marketplace"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="bg-gradient-to-r from-primary/5 to-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Active Repairs Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {repairsLoading ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)
              ) : (
                <div>
                  <RepairTimeline repairs={activeRepairs} />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild>
                <Link to="/repairs/all">View All Repairs</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-r from-primary/5 to-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Recent Marketplace Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activityLoading ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-36" />)
              ) : (
                <div>
                  <OrderStatus orders={marketplaceActivity} />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild>
                <Link to="/marketplace/orders">View All Orders</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-primary/5 to-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Favorite Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductCarousel products={favorites} />
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild>
                <Link to="/marketplace/collections">View All Favorites</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-r from-primary/5 to-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/repairs/history">View Repair History</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/marketplace/products">Browse Marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

const StatCard = ({ icon, title, value, loading }) => (
  <Card className="transition-all shadow-sm bg-gradient-to-r from-primary/5 to-muted/50 hover:shadow-lg hover:shadow-indigo-700/50 dark:hover:shadow-gray-700/50 hover:scale-95">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="w-1/2 h-8" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

// -------------------------------- Repair --------------------------------
const statusIcons = {
  awaiting_assignment: <Clock className="w-4 h-4" />,
  in_progress: <Wrench className="w-4 h-4" />,
  awaiting_payment: <DollarSign className="w-4 h-4" />,
  auction_open: <Hammer className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
};

const statusColors = {
  awaiting_assignment:
    "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300",
  in_progress:
    "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300",
  awaiting_payment:
    "bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-300",
  auction_open:
    "bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300",
};

const RepairTimeline = ({ repairs }) => {
  return (
    <div className="space-y-4">
      {repairs?.slice(-3).map((repair, index) => (
        <motion.div
          key={repair._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-4 p-4 transition-all border rounded-lg shadow-sm dark:border-gray-700 hover:shadow-lg hover:shadow-indigo-700/50 dark:hover:shadow-gray-700/50 hover:scale-125"
        >
          <div className="flex-shrink-0 ">
            <div className={`p-2 rounded-full ${statusColors[repair.status]}`}>
              {statusIcons[repair.status]}
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium dark:text-white">{repair.title}</h3>
              <Badge variant="outline" className={statusColors[repair.status]}>
                {repair.status.replace(/_/g, " ")}
              </Badge>
            </div>

            <p className="mt-1 text-xs">
              Created: {new Date(repair.createdAt).toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// -------------------------------- Order  --------------------------------
const OrderStatus = ({ orders }) => {
  const getStatusDetails = (status) => {
    switch (status) {
      case "completed":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: "bg-green-100 text-green-800",
        };
      case "processing":
        return {
          icon: <Clock className="w-4 h-4" />,
          color: "bg-blue-100 text-blue-800",
        };
      default:
        return {
          icon: <Package className="w-4 h-4" />,
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  return (
    <div className="space-y-4">
      {orders?.slice(-3).map((order, index) => (
        <motion.div
          key={order._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 transition-all border rounded-lg shadow-sm dark:border-gray-700 hover:shadow-lg hover:shadow-indigo-700/50 dark:hover:shadow-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-full dark:bg-opacity-30 ${getStatusDetails(order.status).color}`}
              >
                {getStatusDetails(order.status).icon}
              </div>
              <span className="font-medium dark:text-white">
                Order #{order._id.slice(-6).toUpperCase()}
              </span>
            </div>
            <Badge variant="outline" className="dark:border-gray-600">
              ${order.total.toFixed(2)}
            </Badge>
          </div>

          <div className="space-y-2">
            {order.items.slice(-3).map((item) => (
              <div key={item.product._id} className="flex items-center gap-3">
                <img
                  src={item.product.images[0]?.url}
                  className="object-cover w-10 h-10 rounded-md"
                  alt={item.product.name}
                />
                <div>
                  <p className="text-sm dark:text-white">{item.product.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Qty: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Ordered: {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ------------------------------ Products --------------------------------
const ProductCarousel = ({ products }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {products?.slice(-8).map((product, index) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          <Link
            to={`/marketplace/products/${product._id}`}
            className="block overflow-hidden transition-shadow border rounded-lg dark:border-gray-700 hover:shadow-lg"
          >
            <div className="relative bg-gray-100 aspect-square dark:bg-gray-800">
              <img
                src={product.images[0]?.url}
                className="object-cover w-full h-full"
                alt={product.name}
              />
              <Badge
                className="absolute text-xs top-2 left-2 dark:border-gray-600"
                variant="premium"
              >
                {product.category}
              </Badge>
            </div>

            <div className="p-3">
              <h3 className="text-sm font-medium truncate dark:text-white">
                {product.name}
              </h3>
              <p className="mt-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};
