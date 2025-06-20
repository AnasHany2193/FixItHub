import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Wrench,
  Box,
  Package,
  Star,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useAdminDashboardStats, useRecentActivities } from "@/hooks/useAdmin";
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

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useAdminDashboardStats();
  const { data: activities, isLoading: loadingActivities } =
    useRecentActivities();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <HeaderPages
          title="Admin Dashboard"
          subtitle="System overview and management"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<Users className="text-blue-500 dark:text-blue-400" />}
          title="Total Users"
          value={stats?.totalUsers || 0}
          loading={loadingStats}
        />
        <StatCard
          icon={<Wrench className="text-indigo-600 dark:text-indigo-400" />}
          title="Total Repairs"
          value={stats?.totalRepairs || 0}
          loading={loadingStats}
        />
        <StatCard
          icon={<Box className="text-purple-600 dark:text-purple-400" />}
          title="Total Products"
          value={stats?.totalProducts || 0}
          loading={loadingStats}
        />
        <StatCard
          icon={<Package className="text-green-500 dark:text-green-400" />}
          title="Total Orders"
          value={stats?.totalOrders || 0}
          loading={loadingStats}
        />
        <StatCard
          icon={<Star className="text-amber-500 dark:text-amber-400" />}
          title="Total Reviews"
          value={stats?.totalReviews || 0}
          loading={loadingStats}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AnimatedCard delay={0.1}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <AlertCircle className="w-5 h-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {/* Placeholder for additional overview content */}
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Clock className="w-5 h-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingActivities ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)
              ) : (
                <RecentActivities activities={activities} />
              )}
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild>
                <Link to="/admin/logs">View Full Logs</Link>
              </Button>
            </CardFooter>
          </AnimatedCard>
        </div>

        <div className="space-y-6">
          <AnimatedCard delay={0.3}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Star className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DashboardButton to="/admin/users">Manage Users</DashboardButton>
              <DashboardButton to="/admin/repairs">
                Manage Repairs
              </DashboardButton>
              <DashboardButton to="/admin/products">
                Manage Products
              </DashboardButton>
              <DashboardButton to="/admin/orders">
                Manage Orders
              </DashboardButton>
              <DashboardButton to="/admin/reviews">
                Manage Reviews
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

const RecentActivities = ({ activities }) => (
  <div className="space-y-3">
    {activities?.recentRepairs?.slice(-2)?.map((repair, index) => (
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
    {activities?.recentOrders?.slice(-2)?.map((order, index) => (
      <motion.div
        key={order._id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: (activities.recentRepairs.length + index) * 0.1 }}
        className="flex items-center gap-3 p-3 bg-white border rounded-lg dark:bg-gray-800 border-indigo-100/50 dark:border-gray-700"
      >
        <div className="flex-shrink-0 p-2 rounded-lg bg-indigo-50/50 dark:bg-gray-700">
          <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium dark:text-white">
            Order #{order._id.slice(-6)}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="dark:border-gray-600">
              {order.status}
            </Badge>
            <span className="text-xs text-indigo-700/70 dark:text-indigo-400/70">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </motion.div>
    ))}
    {activities?.recentReviews?.slice(-2)?.map((review, index) => (
      <motion.div
        key={review._id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          delay:
            (activities.recentRepairs.length +
              activities.recentOrders.length +
              index) *
            0.1,
        }}
        className="flex items-center gap-3 p-3 bg-white border rounded-lg dark:bg-gray-800 border-indigo-100/50 dark:border-gray-700"
      >
        <div className="flex-shrink-0 p-2 rounded-lg bg-indigo-50/50 dark:bg-gray-700">
          <Star className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium dark:text-white">Review</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="dark:border-gray-600">
              {review.rating} stars
            </Badge>
            <span className="text-xs text-indigo-700/70 dark:text-indigo-400/70">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </motion.div>
    ))}
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
