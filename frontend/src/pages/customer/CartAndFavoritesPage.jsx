import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, X, ArrowRight } from "lucide-react";
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

const MotionDiv = motion.div;

export default function CartAndFavoritesPage() {
  const [activeTab, setActiveTab] = useState("cart");
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: favorites, isLoading: favLoading } = useFavorites();

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      {/* Header with Tabs */}
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-primary to-purple-600 bg-clip-text">
          Your Collections
        </h1>

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
        <MotionDiv
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
        </MotionDiv>
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
      {/* Cart Items */}
      {cart?.items?.length > 0 ? (
        <>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <MotionDiv
                key={item.product._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 p-4 rounded-lg bg-muted/30"
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
              </MotionDiv>
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
              >
                Clear Cart
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => paymentSession.mutate()}
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
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
      {favorites?.length > 0 ? (
        favorites.map((product) => (
          <MotionDiv
            key={product._id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-4 p-4 rounded-lg bg-muted/30"
          >
            <img
              src={product.images?.[0]?.url || "/placeholder-product.jpg"}
              alt={product.name}
              className="object-cover w-24 h-24 rounded-md"
            />

            <div className="flex-1">
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
          </MotionDiv>
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
