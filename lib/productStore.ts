import { products as mockProducts } from "@/lib/mockData";

export type AdminProduct = (typeof mockProducts)[number];

const PRODUCTS_KEY = "marshal-store-products";

export function getAllProducts(): AdminProduct[] {
  if (typeof window === "undefined") return mockProducts;

  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (!stored) return mockProducts;

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return mockProducts;
  } catch {
    return mockProducts;
  }
}

export function saveAllProducts(items: AdminProduct[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("products-updated"));
}

export function resetProducts() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PRODUCTS_KEY);
  window.dispatchEvent(new Event("products-updated"));
}

export function updateProduct(
  slug: string,
  updates: Partial<AdminProduct>
) {
  const all = getAllProducts();
  const next = all.map((p) =>
    p.slug === slug ? { ...p, ...updates } : p
  );
  saveAllProducts(next);
}

export function addProduct(product: AdminProduct) {
  const all = getAllProducts();
  saveAllProducts([...all, product]);
}

export function deleteProduct(slug: string) {
  const all = getAllProducts();
  saveAllProducts(all.filter((p) => p.slug !== slug));
}