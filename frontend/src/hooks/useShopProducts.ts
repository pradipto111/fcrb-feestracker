import { useState, useEffect, useMemo } from "react";
import { api } from "../api/client";
import { products as localProducts, productsByCategory as localProductsByCategory, type ProductCategory, type Product as LocalProduct } from "../data/products";

// API Product structure from backend
interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  images: string[];
  price: number; // in paise
  currency: string;
  sizes: string[];
  variants?: any;
  stock?: number | null;
  category?: string | null;
  tags: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Map API product to shop product format
const mapApiProductToShopProduct = (apiProduct: ApiProduct): LocalProduct => {
  // Map category string to ProductCategory enum
  const categoryMap: Record<string, ProductCategory> = {
    "MATCHDAY_KITS": "MATCHDAY_KITS",
    "TRAINING_WEAR": "TRAINING_WEAR",
    "LIFESTYLE": "LIFESTYLE",
    "ACCESSORIES": "ACCESSORIES",
    "FAN_EXCLUSIVES": "FAN_EXCLUSIVES",
    "LIMITED_DROPS": "LIMITED_DROPS",
  };

  return {
    id: apiProduct.slug, // Use slug as ID for routing
    name: apiProduct.name,
    price: apiProduct.price, // Already in paise
    category: (apiProduct.category && categoryMap[apiProduct.category]) || "LIFESTYLE",
    image: apiProduct.images?.[0] || "",
    tags: apiProduct.tags || [],
    available: apiProduct.isActive,
    // Store original API data for ProductDetailPage
    _apiData: {
      id: apiProduct.id,
      slug: apiProduct.slug,
      description: apiProduct.description,
      images: apiProduct.images,
      sizes: apiProduct.sizes,
      stock: apiProduct.stock,
    },
  };
};

export const useShopProducts = () => {
  const [apiProducts, setApiProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: ApiProduct[] = await api.getProducts();
      
      // Map API products to shop format
      const mapped = data
        .filter((p) => p.isActive) // Only active products
        .map(mapApiProductToShopProduct);
      
      setApiProducts(mapped);
    } catch (err: any) {
      console.warn("Failed to load products from API, using local products:", err.message);
      setError(err.message);
      // Fallback to local products if API fails
      setApiProducts(localProducts);
    } finally {
      setLoading(false);
    }
  };

  // Use API products if available, otherwise fallback to local
  const allProducts = useMemo(() => {
    return apiProducts.length > 0 ? apiProducts : localProducts;
  }, [apiProducts]);

  // Group by category
  const byCategory = useMemo(() => {
    const grouped: Record<ProductCategory, LocalProduct[]> = {
      MATCHDAY_KITS: [],
      TRAINING_WEAR: [],
      LIFESTYLE: [],
      ACCESSORIES: [],
      FAN_EXCLUSIVES: [],
      LIMITED_DROPS: [],
    };

    allProducts.forEach((product) => {
      if (product.category && grouped[product.category]) {
        grouped[product.category].push(product);
      }
    });

    return grouped;
  }, [allProducts]);

  return {
    products: allProducts,
    productsByCategory: byCategory,
    loading,
    error,
    refetch: loadProducts,
  };
};

