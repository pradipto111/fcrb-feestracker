import type { Product } from "../data/products";

export const formatShopPrice = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
  })}`;

export const getPrimaryTag = (product: Product): string | undefined =>
  product.tags?.[0];

export const isFanLocked = (product: Product): boolean =>
  !!product.fanTierRequired;

