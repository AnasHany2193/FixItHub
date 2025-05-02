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
import { useDashboardSummary } from "@/hooks/useDashboard";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <HeaderPages
          title="Welcome Back!"
          subtitle="Here's your recent activity"
        />
        <div className="flex gap-2">
          <Button
            asChild
            className="gap-1.5 shadow-lg hover:shadow-indigo-700/20"
          >
            <Link to="/repairs/new">
              <Plus className="w-4 h-4" />
              <span>New Repair Request</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-indigo-700/30 hover:bg-indigo-700/5 hover:border-indigo-700/50"
          >
            <Link to="/marketplace/products" className="gap-1.5">
              <Package className="w-4 h-4" />
              <span>Browse Products</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: <Wrench className="text-amber-500" />,
            title: "Active Repairs",
            value: activeRepairs?.length,
          },
          {
            icon: <Package className="text-indigo-600" />,
            title: "Recent Orders",
            value: recentOrders?.length,
          },
          {
            icon: <Heart className="text-red-600" />,
            title: "Saved Favorites",
            value: favorites?.length,
          },
          {
            icon: <Wallet className="text-green-600" />,
            title: "Total Spent",
            value: `$${((summary?.stats?.repairs?.totalSpent || 0) + (summary?.stats?.marketplace?.totalSpent || 0)).toFixed(2)}`,
            tooltip: "Combined spending on repairs and marketplace",
          },
        ].map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            loading={
              stat.title === "Total Spent"
                ? summaryLoading
                : stat.title === "Active Repairs"
                  ? repairsLoading
                  : stat.title === "Recent Orders"
                    ? ordersLoading
                    : loadingFavorites
            }
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          <AnimatedCard delay={0.1}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Wrench className="w-5 h-5" />
                Active Repairs Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {repairsLoading ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)
              ) : (
                <RepairTimeline repairs={activeRepairs} />
              )}
            </CardContent>
            <CardFooter>
              <ViewAllLink to="/repairs/all" />
            </CardFooter>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Package className="w-5 h-5" />
                Recent Marketplace Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ordersLoading ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-36" />)
              ) : (
                <OrderStatus orders={recentOrders} />
              )}
            </CardContent>
            <CardFooter>
              <ViewAllLink to="/marketplace/orders" />
            </CardFooter>
          </AnimatedCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AnimatedCard delay={0.3}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Heart className="w-5 h-5" />
                Favorite Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductCarousel products={favorites} />
            </CardContent>
            <CardFooter>
              <ViewAllLink to="/marketplace/collections" />
            </CardFooter>
          </AnimatedCard>

          <AnimatedCard delay={0.4}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Clock className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DashboardButton to="/repairs/history">
                View Repair History
              </DashboardButton>
              <DashboardButton to="/marketplace/products">
                Browse Marketplace
              </DashboardButton>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </motion.div>
  );
}

const AnimatedCard = ({ delay = 0, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="overflow-hidden transition-shadow shadow-sm bg-gradient-to-br from-indigo-50/50 to-white dark:from-gray-800 dark:to-gray-900/50 hover:shadow-indigo-700/20 dark:hover:shadow-gray-700/30">
      {children}
    </Card>
  </motion.div>
);

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
    <div className="space-y-3">
      {repairs?.slice(-3).map((repair, index) => (
        <motion.div
          key={repair._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-3 p-3 transition-all bg-white border rounded-lg dark:bg-gray-800 border-indigo-100/50 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700/50"
        >
          <div className="flex-shrink-0 p-2 rounded-lg bg-indigo-50/50 dark:bg-gray-700">
            <div className={`p-2 rounded-full ${statusColors[repair.status]}`}>
              {statusIcons[repair.status]}
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium dark:text-white">{repair.title}</h3>
              <Badge
                variant="outline"
                className={`${statusColors[repair.status]} border-transparent`}
              >
                {repair.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70">
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
          color: "bg-green-900 text-green-500",
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
    <div className="space-y-3">
      {orders?.slice(-3).map((order, index) => (
        <motion.div
          key={order._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-3 transition-all bg-white border rounded-lg dark:bg-gray-800 border-indigo-100/50 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-full ${getStatusDetails(order.status).color} dark:bg-opacity-30`}
              >
                {getStatusDetails(order.status).icon}
              </div>
              <span className="font-medium dark:text-white">
                Order #{order._id.slice(-6).toUpperCase()}
              </span>
            </div>
            <Badge variant="premium" className="dark:border-indigo-700/50">
              ${order.total.toFixed(2)}
            </Badge>
          </div>

          <div className="space-y-2">
            {order.items.slice(-3).map((item) => (
              <div key={item.product._id} className="flex items-center gap-3">
                <div className="relative w-10 h-10 overflow-hidden rounded-md bg-indigo-50/50">
                  <img
                    src={item.product.images[0]?.url}
                    className="object-cover w-full h-full"
                    alt={item.product.name}
                  />
                </div>
                <div>
                  <p className="text-sm dark:text-white">{item.product.name}</p>
                  <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70">
                    Qty: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 text-xs text-indigo-700/70 dark:text-indigo-400/70">
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
    <div className="grid grid-cols-2 gap-3">
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
            className="block overflow-hidden transition-transform bg-white rounded-lg dark:bg-gray-800 hover:scale-[1.02]"
          >
            <div className="relative bg-indigo-50/50 aspect-square dark:bg-gray-700">
              <img
                src={product.images[0]?.url}
                className="object-cover w-full h-full transition-opacity opacity-90 hover:opacity-100"
                alt={product.name}
              />
              <Badge
                className="absolute text-xs top-2 left-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                variant="premium"
              >
                {product.category}
              </Badge>
            </div>

            <div className="p-2">
              <h3 className="text-sm font-medium truncate dark:text-white">
                {product.name}
              </h3>
              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

// ------------------------------ Shared Components -----------------------------
const DashboardButton = ({ to, children }) => (
  <Button
    variant="outline"
    asChild
    className="w-full gap-2 text-indigo-700/80 dark:text-indigo-400/80 hover:bg-indigo-50/50 dark:hover:bg-gray-700/50 border-indigo-100/50 dark:border-gray-700"
  >
    <Link to={to}>{children}</Link>
  </Button>
);

const ViewAllLink = ({ to }) => (
  <Button
    variant="link"
    asChild
    className="text-indigo-700/80 dark:text-indigo-400/80 hover:text-indigo-900 dark:hover:text-indigo-300"
  >
    <Link to={to}>View All →</Link>
  </Button>
);
