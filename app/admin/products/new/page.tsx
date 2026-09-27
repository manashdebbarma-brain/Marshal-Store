"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, Plus, Trash2, PackagePlus } from "lucide-react";

import { isAdminLoggedIn, hasPermission } from "@/lib/admin";
import { addProduct, AdminProduct } from "@/lib/productStore";
import { categories } from "@/lib/mockData";
import { toast } from "@/components/Toast";

// A blank package template for new rows
const emptyPackage = {
  id: "",
  title: "",
  amount: 0,
  bonus: "",
  popular: false,
  outOfStock: false,
};

export default function NewProductPage() {
  const router = useRouter();

  // ---- FORM STATE ----
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    publisher: "",
    parentId: 84,
    category: "Game Top-Up",
    description: "",
    discount: 0,
    fields: { playerId: true, serverId: false },
  });

  const [packages, setPackages] = useState([{ ...emptyPackage }]);

  // ---- HELPERS ----
  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateNestedField = (parent: string, key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: { ...prev[parent], [key]: value },
    }));
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData((prev) => ({ ...prev, name: value, slug }));
  };

  // ---- PACKAGE HANDLERS ----
  const addPackageRow = () => {
    setPackages([...packages, { ...emptyPackage }]);
  };

  const updatePackageRow = (index: number, key: string, value: any) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [key]: value };
    setPackages(updated);
  };

  const removePackageRow = (index: number) => {
    if (packages.length === 1) {
      toast("You need at least one package", "error");
      return;
    }
    setPackages(packages.filter((_, i) => i !== index));
  };

  // ---- SAVE ----
  const handleSave = () => {
    // Validation
    if (!formData.name || !formData.slug || !formData.publisher) {
      toast("Please fill in Name, Slug, and Publisher", "error");
      return;
    }
    if (packages.some((p) => !p.title || p.amount <= 0)) {
      toast("All packages need a title and a valid amount", "error");
      return;
    }

    // Build the final product object
    const newProduct: AdminProduct = {
      ...formData,
      discount: formData.discount || undefined,
      id: formData.slug,
      packages: packages.map((p) => ({
        ...p,
        id:
          p.id ||
          `${formData.slug}-${p.title.toLowerCase().replace(/\s+/g, "-")}`,
        bonus: p.bonus || undefined,
      })),
    };

    addProduct(newProduct);
    toast("Product added successfully!", "success");
    router.push("/admin/products");
  };

  // ---- AUTH + PERMISSION CHECK ----
  if (typeof window !== "undefined") {
    if (!isAdminLoggedIn()) {
      router.push("/admin/login");
      return null;
    }
    if (!hasPermission("create_products")) {
      router.push("/admin");
      toast("You don't have permission to add products", "error");
      return null;
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.03] border border-white/10 text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-black">Add New Product</h1>
            <p className="text-sm text-slate-500">
              Create a new product for your store
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-400"
        >
          <Save size={15} />
          Save Product
        </button>
      </div>

      {/* BASIC INFO */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <h2 className="text-lg font-black text-cyan-400">Basic Information</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Mobile Legends"
          />
          <Input
            label="Slug (URL)"
            value={formData.slug}
            onChange={(v: string) => updateField("slug", v)}
            placeholder="mobile-legends"
          />
          <Input
            label="Publisher"
            value={formData.publisher}
            onChange={(v: string) => updateField("publisher", v)}
            placeholder="Moonton"
          />
          <Input
            label="Discount (%)"
            type="number"
            value={formData.discount}
            onChange={(v: string) => updateField("discount", Number(v))}
            placeholder="10"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Category
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => {
                const cat = categories.find(
                  (c) => c.id === Number(e.target.value)
                );
                updateField("parentId", Number(e.target.value));
                if (cat) updateField("category", cat.name);
              }}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Category Label"
            value={formData.category}
            onChange={(v: string) => updateField("category", v)}
            placeholder="Game Top-Up"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Purchase Diamonds for Mobile Legends instantly."
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>
      </motion.div>

      {/* FIELDS CONFIG */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <h2 className="mb-4 text-lg font-black text-cyan-400">
          Required User Inputs
        </h2>
        <div className="flex gap-6">
          <Toggle
            label="Require Player ID"
            checked={formData.fields.playerId}
            onChange={(v: boolean) =>
              updateNestedField("fields", "playerId", v)
            }
          />
          <Toggle
            label="Require Server ID"
            checked={formData.fields.serverId}
            onChange={(v: boolean) =>
              updateNestedField("fields", "serverId", v)
            }
          />
        </div>
      </motion.div>

      {/* PACKAGES */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-cyan-400">Packages</h2>
          <button
            onClick={addPackageRow}
            className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-400 transition hover:bg-cyan-500/20"
          >
            <Plus size={14} />
            Add Package
          </button>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 md:grid-cols-12"
              >
                <div className="md:col-span-4">
                  <Input
                    label="Title"
                    value={pkg.title}
                    onChange={(v: string) =>
                      updatePackageRow(index, "title", v)
                    }
                    placeholder="86 Diamonds"
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Price (₹)"
                    type="number"
                    value={pkg.amount}
                    onChange={(v: string) =>
                      updatePackageRow(index, "amount", Number(v))
                    }
                    placeholder="89"
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    label="Bonus (optional)"
                    value={pkg.bonus}
                    onChange={(v: string) =>
                      updatePackageRow(index, "bonus", v)
                    }
                    placeholder="+5 Bonus"
                  />
                </div>
                <div className="flex items-end gap-2 md:col-span-3">
                  <Toggle
                    label="Popular"
                    checked={!!pkg.popular}
                    onChange={(v: boolean) =>
                      updatePackageRow(index, "popular", v)
                    }
                    compact
                  />
                  <button
                    onClick={() => removePackageRow(index)}
                    className="grid h-10 w-10 place-items-center rounded-lg bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* BOTTOM SAVE */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-cyan-400"
        >
          <PackagePlus size={16} />
          Save & Publish Product
        </button>
      </div>
    </main>
  );
}

/* =========================
   REUSABLE UI COMPONENTS
========================= */

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  compact = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 ${
        compact ? "" : "rounded-xl border border-white/10 bg-black/40 px-4 py-3"
      }`}
    >
      <div
        className={`relative h-5 w-9 rounded-full transition ${
          checked ? "bg-cyan-500" : "bg-slate-700"
        }`}
      >
        <div
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition"
          style={{ left: checked ? "18px" : "2px" }}
        />
      </div>
      <span
        className={`text-xs font-bold uppercase tracking-widest ${
          checked ? "text-cyan-400" : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
