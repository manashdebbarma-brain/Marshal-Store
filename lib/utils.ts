import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function generateOrderId() {
  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `MS-${Date.now().toString().slice(-6)}-${random}`;
}