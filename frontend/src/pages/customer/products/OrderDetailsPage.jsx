// frontend/src/pages/customer/OrderDetailsPage.jsx
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import format from "date-fns/format";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useClearCart, useOrderDetails } from "@/hooks/useMarketplace";
import { useCreatePaymentSession } from "@/hooks/useMarketplace";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import { useToast } from "@/hooks/useToast";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

export default function OrderDetailsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const createPaymentSession = useCreatePaymentSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: order, isLoading, refetch } = useOrderDetails(orderId);
  const { mutate: clearCart } = useClearCart();

  const handleCheckout = async () => {
    await createPaymentSession.mutateAsync(orderId);
  };

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");

    if (paymentStatus === "success") {
      refetch(); // Refresh order data
      clearCart();
      toast({
        variant: "success",
        title: "Payment Successful! 🎉",
        description: "Your order has been successfully processed",
      });
      // Clean URL params
      searchParams.delete("payment");
      setSearchParams(searchParams, { replace: true });
    }

    if (paymentStatus === "cancelled") {
      clearCart();
      toast({
        variant: "destructive",
        title: "Payment Cancelled ❌",
        description: "Your payment was not completed - you can try again below",
      });
      searchParams.delete("payment");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, toast, refetch, clearCart]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-8 mx-auto max-w-7xl"
    >
      <Helmet>
        <title>Order Details | FixItHub</title>
      </Helmet>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/marketplace/orders")}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      ) : !order ? (
        <NotFoundStatus
          icon={<XCircle className="w-12 h-12" />}
          title="Order Not Found"
          message="Could not find the requested order"
        />
      ) : (
        <>
          {/* Order Header */}
          <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Order Details</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-mono">
                  #{order._id.slice(-6).toUpperCase()}
                </span>
                <Badge
                  variant={
                    order.status === "completed" ? "success" : "secondary"
                  }
                  className="gap-1"
                >
                  {order.status === "completed" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  {order.status}
                </Badge>
              </div>
            </div>

            {order.status === "processing" && (
              <Button
                size="lg"
                className="gap-2"
                onClick={handleCheckout}
                disabled={createPaymentSession.isPending}
              >
                <CreditCard className="w-5 h-5" />
                {createPaymentSession.isPending
                  ? "Processing..."
                  : "Complete Payment"}
              </Button>
            )}
          </div>

          {/* Order Timeline */}
          <div className="grid gap-4 p-6 mb-8 rounded-lg bg-muted/30 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">
                {format(new Date(order.createdAt), "MMM dd, yyyy - HH:mm")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {format(new Date(order.updatedAt), "MMM dd, yyyy - HH:mm")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <p className="font-medium">
                {order.status === "completed" ? "Paid" : "Pending"}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 space-y-6 rounded-lg bg-muted/30">
            <h2 className="text-2xl font-bold">Items</h2>
            <div className="space-y-6">
              {order?.items?.map((item, index) => (
                <motion.div
                  key={item.product?._id + index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex gap-4">
                    <img
                      src={
                        item.product?.images[0]?.url ||
                        "/placeholder-product.jpg"
                      }
                      alt={item.product?.name}
                      className="object-cover w-24 h-24 rounded-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-medium">
                            {item.product?.name}
                          </h3>
                          <p className="text-muted-foreground">
                            Seller: {item.product?.seller?.username}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-sm">
                          Qty: {item?.quantity}
                        </Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Unit Price: ${item?.product?.price.toFixed(2)}
                          </p>
                          {item.product?.specs?.map((spec, i) => (
                            <p
                              key={i}
                              className="text-sm text-muted-foreground"
                            >
                              {spec.name}: {spec.value}
                            </p>
                          ))}
                        </div>
                        <p className="font-medium">
                          ${(item?.product?.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {index < order.items.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="pt-6 space-y-4">
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
