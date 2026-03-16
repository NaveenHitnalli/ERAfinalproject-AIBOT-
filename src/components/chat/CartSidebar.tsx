import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, totalPrice, refreshCart, isAuthenticated } = useCart();

  const updateQuantity = async (productId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) return;

    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: newQty <= 0
              ? `Remove product ${productId} from my cart`
              : `Update quantity of product ${productId} to ${newQty}`,
          },
        ],
      }),
    });

    await refreshCart();
  };

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN")}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-background z-50 flex flex-col shadow-card"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-foreground" />
                <h2 className="text-sm font-medium text-foreground">
                  Cart ({items.length})
                </h2>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-surface rounded-md transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Please log in to view your cart
                </p>
              )}
              {isAuthenticated && items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Your cart is empty
                </p>
              )}
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-surface">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-14 h-14 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs font-mono text-muted-foreground tabular-nums">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center bg-background hover:bg-accent transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-medium tabular-nums w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center bg-background hover:bg-accent transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-mono font-medium tabular-nums text-foreground">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-border space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-base font-mono font-semibold tabular-nums text-foreground">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <button className="w-full py-2.5 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity active:scale-[0.98]">
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
