"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet as WalletIcon } from "lucide-react";

import BalanceCard from "@/components/BalanceCard";
import AddMoneyModal from "@/components/AddMoneyModal";
import TransactionList from "@/components/TransactionList";

import {
  addWalletBalance,
  getWalletBalance,
  getWalletTransactions,
  type WalletTransaction,
} from "@/lib/storage";

export default function WalletPage() {
  const router = useRouter();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    function refresh() {
      setBalance(getWalletBalance());
      setTransactions(getWalletTransactions());
    }

    refresh();

    window.addEventListener("wallet-updated", refresh);
    window.addEventListener("wallet-history-updated", refresh);

    return () => {
      window.removeEventListener("wallet-updated", refresh);
      window.removeEventListener("wallet-history-updated", refresh);
    };
  }, []);

  function handleAddMoney(amount: number) {
    addWalletBalance(amount);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <button
        onClick={() => router.push("/")}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={17} />
        Back to Store
      </button>

      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-400">
          <WalletIcon size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black">My Wallet</h1>
          <p className="text-sm text-slate-500">
            Manage your balance and transactions
          </p>
        </div>
      </div>

      <BalanceCard
        balance={balance}
        transactions={transactions}
        onAddMoney={() => setModalOpen(true)}
      />

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-black">Transaction History</h2>
        <TransactionList transactions={transactions} />
      </section>

      <AddMoneyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddMoney}
      />
    </main>
  );
}