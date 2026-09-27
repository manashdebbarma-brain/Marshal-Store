"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Edit, Trash2, RotateCcw } from "lucide-react";

import { isAdminLoggedIn, hasPermission } from "@/lib/admin";
import {
  getAllProducts,
  deleteProduct,
  resetProducts,
  AdminProduct,
} from "@/lib/productStore";
import { toast } from "@/components/Toast";

export default function AdminProductsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [perms, setPerms] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canReset: false,
  });

  useEffect(() => {
    setMounted(true);

    if (!isAdminLoggedIn()) {
      router.push("/admin/login");
      return;
    }

    setPerms({
      canCreate: hasPermission("create_products"),
      canEdit: hasPermission("edit_products"),
      canDelete: hasPermission("delete_products"),
      canReset: hasPermission("reset_products"),
    });

    loadProducts();
  }, [router]);

  const loadProducts = () => {
    setProducts(getAllProducts());
  };

  const handleDelete = (slug: string) => {
    if (!hasPermission("delete_products")) {
      toast("Only the boss can delete products", "error");
      return;
    }
    if (
      confirm(
        "Are you sure you want to delete this product? This cannot be undone."
      )
    ) {
      deleteProduct(slug);
      loadProducts();
      toast("Product deleted successfully", "success");
    }
  };

  const handleReset = () => {
    if (!hasPermission("reset_products")) {
      toast("Only the boss can reset products", "error");
      return;
    }
    if (
      confirm(
        "This will wipe all local changes and restore the default mock data. Continue?"
      )
    ) {
      resetProducts();
      loadProducts();
      toast("Products reset to default", "info");
    }
  };

  if (!mounted) return null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      {/* HEADER */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.03] border border-white/10 text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-black">Manage Products</h1>
            <p className="text-sm text-slate-500">
              {perms.canDelete
                ? "Full control — add, edit, delete and reset"
                : "Add and edit products (no delete/reset)"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Reset — BOSS ONLY */}
          {perms.canReset && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-2.5 text-sm font-bold text-red-400 transition hover:bg-red-500/15"
            >
              <RotateCcw size={15} />
              Reset Default
            </button>
          )}

          {/* Add — AUTHOR + PETITION */}
          {perms.canCreate && (
            <Link
              href="/admin/products/new"
              className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-bold text-cyan-400 transition hover:bg-cyan-500/20"
            >
              <Plus size={15} />
              Add Product
            </Link>
          )}
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Discount</th>
                <th className="px-6 py-4 font-bold">Packages</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.slug}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        /{product.slug}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <span className="rounded-md bg-white/5 px-2 py-1 text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {product.discount ? (
                        <span className="font-bold text-emerald-400">
                          {product.discount}% OFF
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {product.packages.length} items
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {/* Edit — AUTHOR + PETITION */}
                        {perms.canEdit && (
                          <Link
                            href={`/admin/products/edit/${product.slug}`}
                            className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500/10 text-indigo-400 transition hover:bg-indigo-500/20"
                          >
                            <Edit size={15} />
                          </Link>
                        )}

                        {/* Delete — BOSS ONLY */}
                        {perms.canDelete && (
                          <button
                            onClick={() => handleDelete(product.slug)}
                            className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}

                        {/* If neither → show "View Only" */}
                        {!perms.canEdit && !perms.canDelete && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                            View Only
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </main>
  );
}