import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
  itemCount: number;
  isLoading: boolean;
}

interface CartContextType extends CartState {
  refreshCart: () => Promise<void>;
  session: Session | null;
  isAuthenticated: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [cart, setCart] = useState<CartState>({
    items: [],
    totalPrice: 0,
    itemCount: 0,
    isLoading: false,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const refreshCart = useCallback(async () => {
    if (!session) {
      setCart({ items: [], totalPrice: 0, itemCount: 0, isLoading: false });
      return;
    }

    setCart((prev) => ({ ...prev, isLoading: true }));

    try {
      const { data: cartData } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!cartData) {
        setCart({ items: [], totalPrice: 0, itemCount: 0, isLoading: false });
        return;
      }

      const { data: items } = await supabase
        .from("cart_items")
        .select("*, products(*)")
        .eq("cart_id", cartData.id);

      const mappedItems: CartItem[] =
        items?.map((item: Record<string, unknown>) => {
          const product = item.products as Record<string, unknown>;
          return {
            id: item.id as string,
            product_id: product.id as string,
            name: product.name as string,
            price: product.price as number,
            quantity: item.quantity as number,
            image_url: product.image_url as string,
            subtotal: (item.quantity as number) * (product.price as number),
          };
        }) || [];

      const totalPrice = mappedItems.reduce((sum, item) => sum + item.subtotal, 0);

      setCart({
        items: mappedItems,
        totalPrice,
        itemCount: mappedItems.length,
        isLoading: false,
      });
    } catch {
      setCart((prev) => ({ ...prev, isLoading: false }));
    }
  }, [session]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ ...cart, refreshCart, session, isAuthenticated: !!session }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
