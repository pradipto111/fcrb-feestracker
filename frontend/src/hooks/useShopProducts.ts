import { useMemo } from "react";
import { products, productsByCategory } from "../data/products";

export const useShopProducts = () => {
  // Placeholder for future API integration / admin-driven catalog.
  // Centralising here keeps the Shop page ready for a backend swap.
  const all = useMemo(() => products, []);
  const byCategory = useMemo(() => productsByCategory, []);

  return {
    products: all,
    productsByCategory: byCategory,
  };
};

