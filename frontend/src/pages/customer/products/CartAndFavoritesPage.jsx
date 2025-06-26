import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, X, ArrowRight, RefreshCw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useGetCart,
  useRemoveCartItem,
  useUpdateCartItem,
  useClearCart,
  useFavorites,
  useRemoveFromFavorites,
  useAddToCart,
  useCreatePaymentSession,
} from "@/hooks/useMarketplace";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import HeaderPages from "@/components/common/HeaderPages";
import { Helmet } from "react-helmet-async";

export default function CartAndFavoritesPage() {
  const [activeTab, setActiveTab] = useState("cart");
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: favorites, isLoading: favLoading } = useFavorites();

  return (
    <div>
      {/* Header with Tabs */}
      <div className="flex flex-col justify-between gap-5 mb-5 space-y-4 md:items-center md:flex-row">
        <HeaderPages
          title="Your Collections"
          subtitle="Manage your Cart and Favorites"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="cart">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart {cart?.items?.length > 0 && `(${cart.items.length})`}
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="w-4 h-4 mr-2" />
              Favorites {favorites?.length > 0 && `(${favorites.length})`}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "cart" ? (
            <CartSection cart={cart} isLoading={cartLoading} />
          ) : (
            <FavoritesSection favorites={favorites} isLoading={favLoading} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Cart Section Component
const CartSection = ({ cart, isLoading }) => {
  const removeItem = useRemoveCartItem();
  const updateItem = useUpdateCartItem();
  const clearCart = useClearCart();
  const paymentSession = useCreatePaymentSession();

  if (isLoading) return <LoadingSpinner className="mx-auto mt-12" size="lg" />;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Your Cart | FixItHub</title>
      </Helmet>
      {/* Cart Items */}
      {cart?.items?.length > 0 ? (
        <>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <motion.div
                key={item.product._id}
                layout
                whileHover={{ scale: 1.02 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  duration: 0.2,
                }}
                className="flex gap-4 p-4 overflow-hidden transition-all rounded-lg shadow-sm cursor-pointer bg-gray-300/50 dark:bg-muted/40 hover:shadow-lg hover:shadow-indigo-700/50 dark:hover:shadow-gray-700/50"
              >
                <img
                  src={
                    item.product.images?.[0]?.url || "/placeholder-product.jpg"
                  }
                  alt={item.product.name}
                  className="object-cover w-24 h-24 rounded-md"
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem.mutate(item.product._id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateItem.mutate({
                            productId: item.product._id,
                            action: "decrement",
                          })
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateItem.mutate({
                            productId: item.product._id,
                            action: "increment",
                          })
                        }
                        disabled={item.quantity >= item.product.stock}
                      >
                        +
                      </Button>
                    </div>
                    <span className="font-semibold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="p-6 space-y-4 rounded-lg bg-muted/30">
            <div className="flex justify-between font-semibold">
              <span>Total Items:</span>
              <span>
                {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total Price:</span>
              <span className="text-primary">
                $
                {cart.items
                  .reduce(
                    (acc, item) => acc + item.product.price * item.quantity,
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex gap-4">
              <Button
                variant="destructive"
                onClick={() => clearCart.mutate()}
                className="flex-1"
                disabled={clearCart.isPending}
              >
                {clearCart.isPending && (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                )}
                Clear Cart
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => paymentSession.mutate()}
                disabled={paymentSession.isPending}
              >
                Checkout
                {paymentSession.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          icon={<ShoppingCart className="w-16 h-16" />}
          title="Your cart is empty"
          description="Add items from the marketplace to get started"
        />
      )}
    </div>
  );
};

// Favorites Section Component
const FavoritesSection = ({ favorites, isLoading }) => {
  const removeFavorite = useRemoveFromFavorites();
  const addToCart = useAddToCart();

  if (isLoading) return <LoadingSpinner className="mx-auto mt-12" size="lg" />;

  return (
    <div className="space-y-4">
      <Helmet>
        <title>Your Favorites | FixItHub</title>
      </Helmet>
      {favorites?.length > 0 ? (
        favorites.map((product) => (
          <motion.div
            key={product._id}
            layout
            whileHover={{ scale: 1.02 }}
            transition={{
              type: "spring",
              stiffness: 300,
              duration: 0.2,
            }}
            className="flex gap-4 p-4 overflow-hidden transition-all rounded-lg shadow-sm cursor-pointer bg-gray-300/50 dark:bg-muted/40 hover:shadow-lg hover:shadow-indigo-700/50 dark:hover:shadow-gray-700/50"
          >
            <img
              src={product.images?.[0]?.url || "/placeholder-product.jpg"}
              alt={product.name}
              className="object-cover w-24 h-24 rounded-md"
            />

            <div className="flex flex-col flex-1 justify-evenly">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{product.name}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addToCart.mutate(product._id)}
                    disabled={product.stock <= 0}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite.mutate(product._id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">
                    ${product.price}
                  </span>
                  <Badge
                    variant={
                      product.stock > 10
                        ? "success"
                        : product.stock > 0
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Sold out"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <EmptyState
          icon={<Heart className="w-16 h-16" />}
          title="No favorites yet"
          description="Click the heart icon on products to save them here"
        />
      )}
    </div>
  );
};

// Shared Empty State Component
const EmptyState = ({ icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
    <div className="p-4 rounded-full bg-muted">{icon}</div>
    <h3 className="text-2xl font-semibold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);
