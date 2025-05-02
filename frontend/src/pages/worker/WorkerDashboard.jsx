import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wrench,
  Package,
  Clock,
  Hammer,
  Wallet,
  Star,
  Box,
  Plus,
  AlertCircle,
} from "lucide-react";
import { useWorkerDashboard } from "@/hooks/useDashboard";
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
import { useWorkerHistory } from "@/hooks/useRepair";

export default function WorkerDashboard() {
  const { data, isLoading } = useWorkerDashboard();

  const { data: completedRepairs, isLoading: loadingCompleteRepairs } =
    useWorkerHistory({ status: "completed" });
  const { data: historyRepairs, isLoading: loadingHistoryRepairs } =
    useWorkerHistory();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <HeaderPages
          title="Worker Dashboard"
          subtitle="Your performance overview"
        />

        <div className="flex gap-2">
          <Button asChild className="gap-1.5 shadow-lg">
            <Link to="/repairs/active">
              <Wrench className="w-4 h-4" />
              <span>Active Repairs</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-indigo-700/30 hover:bg-indigo-700/5"
          >
            <Link to="/marketplace/new-product" className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span>New Product</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Wallet className="text-green-500 dark:text-green-400" />}
          title="Total Earnings"
          value={`$${(data?.stats.repairs.totalEarnings + data?.stats.products.totalRevenue || 0).toFixed(2)}`}
          loading={isLoading}
          tooltip="Combined repair and product earnings"
        />
        <StatCard
          icon={<Wrench className="text-indigo-600 dark:text-indigo-400" />}
          title="Completed Repairs"
          value={completedRepairs?.count || 0}
          loading={loadingCompleteRepairs}
        />
        <StatCard
          icon={<Box className="text-purple-600 dark:text-purple-400" />}
          title="Products Sold"
          value={data?.stats.products.totalSold || 0}
          loading={isLoading}
        />
        <StatCard
          icon={<Star className="text-amber-500 dark:text-amber-400" />}
          title="Average Rating"
          value={(data?.stats.reviews.avgRating || 0).toFixed(1)}
          loading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          <AnimatedCard delay={0.1}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <AlertCircle className="w-5 h-5" />
                Current Workload
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="p-4 space-y-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">Active Repairs</span>
                  <Badge
                    variant="premium"
                    className="ml-auto bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                  >
                    {data?.currentStatus.activeRepairs || 0}
                  </Badge>
                </div>
                <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70">
                  In progress or awaiting payment
                </p>
              </div>

              <div className="p-4 space-y-2 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium">Pending Orders</span>
                  <Badge className="ml-auto text-purple-700 bg-purple-100 dark:bg-purple-900/50 dark:text-purple-300">
                    {data?.currentStatus.pendingOrders || 0}
                  </Badge>
                </div>
                <p className="text-sm text-purple-700/70 dark:text-purple-400/70">
                  Unshipped product orders
                </p>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingHistoryRepairs ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)
              ) : (
                <RecentActivity repairs={historyRepairs.data} />
              )}
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild>
                <Link to="/repairs/worker-history">View Full History</Link>
              </Button>
            </CardFooter>
          </AnimatedCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AnimatedCard delay={0.3}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Hammer className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetricItem
                label="Avg. Repair Time"
                value={`${(data?.stats.repairs.avgRepairTime || 0).toFixed(1)}h`}
                icon={
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                }
                loading={isLoading}
              />
              <MetricItem
                label="Product Revenue"
                value={`$${(data?.stats.products.totalRevenue || 0).toFixed(2)}`}
                icon={
                  <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                }
                loading={isLoading}
              />
              <MetricItem
                label="Total Reviews"
                value={data?.stats.reviews.totalReviews || 0}
                icon={
                  <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                }
                loading={isLoading}
              />
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.4}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Star className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DashboardButton to="/marketplace/my-products">
                Manage Products
              </DashboardButton>
              <DashboardButton to="/repairs/auctions">
                View Auctions
              </DashboardButton>
              <DashboardButton to="/repairs/direct-offers">
                Direct Offers
              </DashboardButton>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </motion.div>
  );
}

// -------------------------------- Components --------------------------------
const AnimatedCard = ({ delay = 0, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="transition-shadow shadow-sm bg-gradient-to-br from-indigo-50/50 to-white dark:from-gray-800 dark:to-gray-900/50 hover:shadow-indigo-700/20">
      {children}
    </Card>
  </motion.div>
);

const StatCard = ({ icon, title, value, loading, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="relative overflow-hidden transition-all shadow-sm group bg-gradient-to-br from-indigo-50/50 to-white dark:from-gray-800 dark:to-gray-900/50 hover:shadow-indigo-700/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-indigo-700/80 dark:text-indigo-400/80">
          {title}
        </CardTitle>
        <div className="text-indigo-700/60 dark:text-indigo-400/60">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-1/2 h-8 bg-indigo-100/50 dark:bg-gray-700" />
        ) : (
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
            {value}
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const RecentActivity = ({ repairs }) => (
  <div className="space-y-3">
    {repairs?.map((repair, index) => (
      <motion.div
        key={repair._id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex items-center gap-3 p-3 bg-white border rounded-lg dark:bg-gray-800 border-indigo-100/50 dark:border-gray-700"
      >
        <div className="flex-shrink-0 p-2 rounded-lg bg-indigo-50/50 dark:bg-gray-700">
          <Wrench className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium dark:text-white">{repair.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="dark:border-gray-600">
              {repair.status.replace(/_/g, " ")}
            </Badge>
            <span className="text-xs text-indigo-700/70 dark:text-indigo-400/70">
              {new Date(repair.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

const MetricItem = ({ label, value, icon, loading }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/50 dark:bg-gray-800">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm text-indigo-700/80 dark:text-indigo-400/80">
        {label}
      </span>
    </div>
    {loading ? (
      <Skeleton className="w-20 h-6 bg-indigo-100/50 dark:bg-gray-700" />
    ) : (
      <span className="font-medium text-indigo-700 dark:text-indigo-400">
        {value}
      </span>
    )}
  </div>
);

const DashboardButton = ({ to, children }) => (
  <Button
    variant="outline"
    asChild
    className="justify-start w-full gap-2 text-indigo-700/80 dark:text-indigo-400/80 hover:bg-indigo-50/50 dark:hover:bg-gray-700/50 border-indigo-100/50 dark:border-gray-700"
  >
    <Link to={to}>{children}</Link>
  </Button>
);
