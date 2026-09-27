export type PromoResult =
  | { ok: true; code: string; discount: number; label: string }
  | { ok: false; error: string };

export const AVAILABLE_CODES = [
  {
    code: "SAVE10",
    label: "10% off your order",
    minAmount: 0,
    type: "percent" as const,
    value: 10,
  },
  {
    code: "WELCOME50",
    label: "₹50 off (min ₹200)",
    minAmount: 200,
    type: "flat" as const,
    value: 50,
  },
  {
    code: "FIRST100",
    label: "₹100 off (min ₹500)",
    minAmount: 500,
    type: "flat" as const,
    value: 100,
  },
];

export function applyPromo(code: string, subtotal: number): PromoResult {
  const clean = code.trim().toUpperCase();
  if (!clean) return { ok: false, error: "Enter a code" };

  const found = AVAILABLE_CODES.find((c) => c.code === clean);
  if (!found) return { ok: false, error: "Invalid promo code" };

  if (subtotal < found.minAmount) {
    return {
      ok: false,
      error: `Minimum order ₹${found.minAmount} required`,
    };
  }

  let discount = 0;
  if (found.type === "percent") {
    discount = Number(((subtotal * found.value) / 100).toFixed(2));
  } else {
    discount = found.value;
  }

  // Never discount more than subtotal
  if (discount > subtotal) discount = subtotal;

  return {
    ok: true,
    code: found.code,
    discount,
    label: found.label,
  };
}