"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ShieldCheck,
  Eye,
  X,
  User,
  Lock,
  Save,
  Users,
} from "lucide-react";

import {
  isAdminLoggedIn,
  hasPermission,
  getAllAdmins,
  addCustomAdmin,
  removeCustomAdmin,
  updateCustomAdmin,
  hashPassword,
  AdminAccount,
  AdminRole,
} from "@/lib/admin";
import { toast } from "@/components/Toast";

export default function AdminManagementPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<AdminRole>("PETITION");
  const [formPassword, setFormPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ---- AUTH + LOAD ----
  useEffect(() => {
    setMounted(true);

    if (!isAdminLoggedIn()) {
      router.push("/admin/login");
      return;
    }

    if (!hasPermission("manage_admins")) {
      router.push("/admin");
      toast("Only the boss can manage admins", "error");
      return;
    }

    loadAdmins();
  }, [router]);

  const loadAdmins = () => {
    setAdmins(getAllAdmins());
  };

  // ---- OPEN MODAL (add) ----
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormId("");
    setFormName("");
    setFormRole("PETITION");
    setFormPassword("");
    setShowPassword(false);
    setShowModal(true);
  };

  // ---- OPEN MODAL (edit) ----
  const handleOpenEdit = (admin: AdminAccount) => {
    if (admin.isDefault) {
      toast("Default admins can't be edited", "error");
      return;
    }
    setEditingId(admin.id);
    setFormId(admin.id);
    setFormName(admin.name);
    setFormRole(admin.role);
    setFormPassword(""); // leave empty to keep existing
    setShowPassword(false);
    setShowModal(true);
  };

  // ---- SAVE ----
  const handleSave = () => {
    if (!formId.trim() || !formName.trim()) {
      toast("Please fill in Admin ID and Name", "error");
      return;
    }
    if (!editingId && !formPassword.trim()) {
      toast("Please set a password", "error");
      return;
    }

    if (editingId) {
      // Update existing
      const updates: Partial<AdminAccount> = {
        id: formId,
        name: formName,
        role: formRole,
      };
      if (formPassword.trim()) {
        updates.passwordHash = hashPassword(formPassword);
      }
      const result = updateCustomAdmin(editingId, updates);
      if (!result.ok) {
        toast(result.error || "Failed to update admin", "error");
        return;
      }
      toast("Admin updated successfully", "success");
    } else {
      // Add new
      const result = addCustomAdmin({
        id: formId,
        name: formName,
        role: formRole,
        passwordHash: hashPassword(formPassword),
      });
      if (!result.ok) {
        toast(result.error || "Failed to add admin", "error");
        return;
      }
      toast("Admin added successfully", "success");
    }

    setShowModal(false);
    loadAdmins();
  };

  // ---- DELETE ----
  const handleDelete = (admin: AdminAccount) => {
    if (admin.isDefault) {
      toast("Default admins can't be deleted", "error");
      return;
    }
    if (
      !confirm(
        `Are you sure you want to remove "${admin.name}" (${admin.id})? They will lose all access immediately.`
      )
    ) {
      return;
    }
    const result = removeCustomAdmin(admin.id);
    if (!result.ok) {
      toast(result.error || "Failed to delete admin", "error");
      return;
    }
    toast("Admin removed", "success");
    loadAdmins();
  };

  if (!mounted) return null;

  return (
    <main className="mx-auto w-full px-4 py-8 md:px-6">
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
            <h1 className="text-3xl font-black">Manage Admins</h1>
            <p className="text-sm text-slate-500">
              Add or remove team members — boss only
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-400"
        >
          <Plus size={15} />
          Add New Admin
        </button>
      </div>

      {/* STATS */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-400 text-black">
            <Users size={18} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Total Admins
          </p>
          <p className="mt-1 text-xl font-black">{admins.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-black">
            <ShieldCheck size={18} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Authors (Bosses)
          </p>
          <p className="mt-1 text-xl font-black">
            {admins.filter((a) => a.role === "AUTHOR").length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-black">
            <Eye size={18} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Petitions (Co-Admins)
          </p>
          <p className="mt-1 text-xl font-black">
            {admins.filter((a) => a.role === "PETITION").length}
          </p>
        </div>
      </div>

      {/* ADMINS TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Admin</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="transition hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-10 w-10 place-items-center rounded-xl font-black ${
                          admin.role === "AUTHOR"
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "bg-purple-500/10 text-purple-400"
                        }`}
                      >
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          {admin.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          @{admin.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                        admin.role === "AUTHOR"
                          ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-400"
                          : "border-purple-400/30 bg-purple-500/10 text-purple-400"
                      }`}
                    >
                      {admin.role === "AUTHOR" ? (
                        <ShieldCheck size={10} />
                      ) : (
                        <Eye size={10} />
                      )}
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {admin.isDefault ? (
                      <span className="text-xs font-bold text-emerald-400">
                        Default (protected)
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">
                        Custom
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      {!admin.isDefault && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(admin)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-400 transition hover:border-indigo-400/40 hover:text-indigo-400"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(admin)}
                            className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                      {admin.isDefault && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                          Protected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-8 backdrop-blur-xl"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>

              <h2 className="text-2xl font-black">
                {editingId ? "Edit Admin" : "Add New Admin"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {editingId
                  ? "Update this admin's details"
                  : "Create a new admin account"}
              </p>

              <div className="mt-6 space-y-4">
                {/* Admin ID */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Admin ID
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type="text"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      placeholder="e.g. rahul"
                      autoComplete="off"
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Display Name
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      autoComplete="off"
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    {editingId
                      ? "New Password (leave blank to keep current)"
                      : "Password"}
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={editingId ? "Leave blank to keep" : "Set a password"}
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-11 text-sm text-white outline-none transition focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                    >
                      {showPassword ? <Eye size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormRole("AUTHOR")}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                        formRole === "AUTHOR"
                          ? "border-cyan-400 bg-cyan-500/10"
                          : "border-white/10 bg-black/40 hover:border-white/20"
                      }`}
                    >
                      <ShieldCheck
                        size={20}
                        className={
                          formRole === "AUTHOR"
                            ? "text-cyan-400"
                            : "text-slate-500"
                        }
                      />
                      <span
                        className={`text-xs font-black uppercase tracking-widest ${
                          formRole === "AUTHOR"
                            ? "text-cyan-400"
                            : "text-slate-500"
                        }`}
                      >
                        Author
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormRole("PETITION")}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                        formRole === "PETITION"
                          ? "border-purple-400 bg-purple-500/10"
                          : "border-white/10 bg-black/40 hover:border-white/20"
                      }`}
                    >
                      <Eye
                        size={20}
                        className={
                          formRole === "PETITION"
                            ? "text-purple-400"
                            : "text-slate-500"
                        }
                      />
                      <span
                        className={`text-xs font-black uppercase tracking-widest ${
                          formRole === "PETITION"
                            ? "text-purple-400"
                            : "text-slate-500"
                        }`}
                      >
                        Petition
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-400"
              >
                <Save size={15} />
                {editingId ? "Save Changes" : "Create Admin"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}