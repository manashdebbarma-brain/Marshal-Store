"use client";

import {
  CheckCircle,
  Printer,
  Receipt,
} from "lucide-react";

import { StoredOrder } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";

type OrderReceiptProps = {
  order: StoredOrder;
};

export default function OrderReceipt({
  order,
}: OrderReceiptProps) {
  function printReceipt() {
    window.print();
  }

  const orderDate = new Date(
    order.timestamp
  ).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="mx-auto w-full max-w-2xl">

      {/* RECEIPT */}

      <div
        id="order-receipt"
        className="glass rounded-3xl border border-white/10 p-6 md:p-8"
      >

        {/* HEADER */}

        <div className="border-b border-white/10 pb-6">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan/10">

                <Receipt
                  size={22}
                  className="text-cyan"
                />

              </div>

              <div>

                <h2 className="font-black">
                  Marshal
                  <span className="text-cyan">
                    Store
                  </span>
                </h2>

                <p className="text-xs text-slate-500">
                  Order Receipt
                </p>

              </div>

            </div>

            <CheckCircle
              size={30}
              className="text-emerald-400"
            />

          </div>

        </div>

        {/* ORDER ID */}

        <div className="py-6 text-center">

          <p className="text-xs uppercase tracking-widest text-slate-500">
            Order ID
          </p>

          <p className="mt-2 font-mono text-xl font-black text-cyan">
            {order.orderId}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {orderDate}
          </p>

        </div>

        {/* DETAILS */}

        <div className="space-y-4 border-y border-white/10 py-6">

          <div className="flex justify-between gap-4">

            <span className="text-sm text-slate-500">
              Product
            </span>

            <span className="text-right text-sm font-semibold">
              {order.productName}
            </span>

          </div>

          <div className="flex justify-between gap-4">

            <span className="text-sm text-slate-500">
              Package
            </span>

            <span className="text-right text-sm font-semibold">
              {order.packageName}
            </span>

          </div>

          {order.playerId && (
            <div className="flex justify-between gap-4">

              <span className="text-sm text-slate-500">
                Player ID
              </span>

              <span className="text-sm font-semibold">
                {order.playerId}
              </span>

            </div>
          )}

          {order.serverId && (
            <div className="flex justify-between gap-4">

              <span className="text-sm text-slate-500">
                Server ID
              </span>

              <span className="text-sm font-semibold">
                {order.serverId}
              </span>

            </div>
          )}

          <div className="flex justify-between gap-4">

            <span className="text-sm text-slate-500">
              Payment Method
            </span>

            <span className="text-right text-sm font-semibold">
              {order.paymentMethod}
            </span>

          </div>

        </div>

        {/* PRICE */}

        <div className="space-y-3 py-6">

          <div className="flex justify-between text-sm">

            <span className="text-slate-500">
              Subtotal
            </span>

            <span>
              {formatCurrency(order.subtotal)}
            </span>

          </div>

          <div className="flex justify-between text-sm">

            <span className="text-slate-500">
              Processing Fee
            </span>

            <span>
              {formatCurrency(order.processingFee)}
            </span>

          </div>

          <div className="flex justify-between border-t border-white/10 pt-4">

            <span className="font-bold">
              Total Paid
            </span>

            <span className="text-xl font-black text-cyan">
              {formatCurrency(order.total)}
            </span>

          </div>

        </div>

        {/* STATUS */}

        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-center">

          <p className="text-xs uppercase tracking-widest text-emerald-400">
            Order Status
          </p>

          <p className="mt-1 font-bold">
            Payment Received
          </p>

        </div>

      </div>

      {/* PRINT BUTTON */}

      <button
        onClick={printReceipt}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan px-5 py-3 font-bold text-black transition hover:scale-[1.01]"
      >

        <Printer size={18} />

        Print / Save Receipt

      </button>

      {/* PRINT STYLES */}

      <style jsx global>{`

        @media print {

          body {
            background: white !important;
            color: black !important;
          }

          body * {
            visibility: hidden;
          }

          #order-receipt,
          #order-receipt * {
            visibility: visible;
          }

          #order-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
          }

          #order-receipt .text-slate-500 {
            color: #555 !important;
          }

          button {
            display: none !important;
          }
        }

      `}</style>

    </div>
  );
}