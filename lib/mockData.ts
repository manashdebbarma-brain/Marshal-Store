// =========================================================
// 🎯 TYPES
// =========================================================

export type Category = {
  id: number;
  name: string;
  description: string;
};

export type Package = {
  id: string;
  title: string;
  amount: number;
  bonus?: string;
  popular?: boolean;
  outOfStock?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  publisher: string;
  parentId: number;
  category: string;
  description: string;
  discount?: number;
  fields: {
    playerId: boolean;
    serverId: boolean;
  };
  packages: Package[];
};

export type PaymentChannel = {
  id: string;
  name: string;
  fee: number;
};

// =========================================================
// 📂 CATEGORIES
// =========================================================

export const categories: Category[] = [
  {
    id: 84,
    name: "Popular Game Top-Ups",
    description: "Instant game credits, diamonds and vouchers",
  },
  {
    id: 12,
    name: "Gift Cards",
    description: "Digital gift cards and gaming vouchers",
  },
  {
    id: 45,
    name: "OTT Subscriptions",
    description: "Entertainment subscriptions",
  },
];

// =========================================================
// 🎮 PRODUCTS
// =========================================================

export const products: Product[] = [
  {
    id: "mlbb",
    slug: "mobile-legends",
    name: "Mobile Legends: Bang Bang",
    publisher: "Moonton",
    parentId: 84,
    category: "Game Top-Up",
    description: "Purchase Diamonds for Mobile Legends instantly.",
    discount: 10,
    fields: {
      playerId: true,
      serverId: true,
    },
    packages: [
      {
        id: "mlbb-86",
        title: "86 Diamonds",
        amount: 89,
        bonus: "+5 Bonus",
        outOfStock: false,
      },
      {
        id: "mlbb-172",
        title: "172 Diamonds",
        amount: 169,
        bonus: "+10 Bonus",
        popular: false,
      },
      {
        id: "mlbb-257",
        title: "257 Diamonds",
        amount: 249,
        bonus: "+20 Bonus",
      },
      {
        id: "mlbb-344",
        title: "344 Diamonds",
        amount: 329,
        bonus: "+30 Bonus",
      },
    ],
  },
  {
    id: "genshin",
    slug: "genshin-impact",
    name: "Genshin Impact",
    publisher: "HoYoverse",
    parentId: 84,
    category: "Game Top-Up",
    description: "Purchase Genesis Crystals for Genshin Impact.",
    discount: 5,
    fields: {
      playerId: true,
      serverId: true,
    },
    packages: [
      {
        id: "genshin-60",
        title: "60 Genesis Crystals",
        amount: 99,
      },
      {
        id: "genshin-300",
        title: "300 + 30 Genesis Crystals",
        amount: 479,
        popular: true,
      },
      {
        id: "genshin-980",
        title: "980 + 110 Genesis Crystals",
        amount: 1499,
      },
      {
        id: "genshin-1980",
        title: "1980 + 260 Genesis Crystals",
        amount: 2999,
      },
    ],
  },
];

// =========================================================
// 💳 PAYMENT CHANNELS
// =========================================================

export const paymentChannels: PaymentChannel[] = [
  {
    id: "upi",
    name: "UPI",
    fee: 0,
  },
  {
    id: "wallet",
    name: "Marshal Wallet",
    fee: 0,
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    fee: 2,
  },
  {
    id: "netbanking",
    name: "NetBanking",
    fee: 1,
  },
  {
    id: "crypto",
    name: "Crypto",
    fee: 2.5,
  },
];