import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  productId: string | number; // Support both string (local products) and number (API products)
  productName: string;
  productSlug: string;
  productImage?: string;
  variant?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "totalPrice">) => void;
  removeItem: (productId: string | number, variant?: string, size?: string) => void;
  updateQuantity: (productId: string | number, quantity: number, variant?: string, size?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "totalPrice">) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.variant === item.variant &&
          i.size === item.size
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
        return updated;
      }

      return [
        ...prev,
        {
          ...item,
          totalPrice: item.quantity * item.unitPrice,
        },
      ];
    });
  };

  const removeItem = (productId: string | number, variant?: string, size?: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.productId === productId &&
            i.variant === variant &&
            i.size === size
          )
      )
    );
  };

  const updateQuantity = (productId: string | number, quantity: number, variant?: string, size?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variant, size);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (
          i.productId === productId &&
          i.variant === variant &&
          i.size === size
        ) {
          return {
            ...i,
            quantity,
            totalPrice: quantity * i.unitPrice,
          };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};


