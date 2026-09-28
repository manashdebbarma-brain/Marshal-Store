'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';
import { toast } from '@/components/Toast';

interface Package {
  id: string;
  name: string;
  bonus?: string;
  originalPrice?: number;
  price: number;
  outOfStock?: boolean;
}

interface Game {
  slug: string;
  name: string;
  code: string;
  icon?: string;
  packages: Package[];
}

// ============================================================
// 🎯 EDIT OUT-OF-STOCK HERE
// Add or remove `outOfStock: true` on any package to toggle it.
// - outOfStock: true  → ❌ shows "OUT OF STOCK", not clickable
// - outOfStock: false → ✅ normal clickable package
// - (missing)         → ✅ defaults to available
// ============================================================
const GAMES_DATA: Record<string, Game> = {
  'bgmi': {
    slug: 'bgmi',
    name: 'BGMI UC Top Up',
    code: 'bgmi',
    icon: '/games/bgmi.jpg',
    packages: [
      { id: '50',   name: '50 UC',   price: 45,   originalPrice: 50,   outOfStock: false },
      { id: '300',  name: '300 UC',  price: 249,  originalPrice: 280,  outOfStock: false },
      { id: '600',  name: '600 UC',  price: 479,  originalPrice: 520,  outOfStock: false },
      { id: '1500', name: '1500 UC', price: 1190, originalPrice: 1300, outOfStock: false },
    ],
  },

  'free-fire': {
    slug: 'free-fire',
    name: 'Free Fire Diamonds Top Up',
    code: 'free-fire',
    icon: '/games/free-fire.jpg',
    packages: [
      { id: '50',  name: '50 Diamonds',  price: 89,  originalPrice: 100, outOfStock: false },
      { id: '150', name: '150 Diamonds', price: 260, originalPrice: 290, outOfStock: false },
      { id: '250', name: '250 Diamonds', price: 420, originalPrice: 460, outOfStock: false },
      { id: '500', name: '500 Diamonds', price: 840, originalPrice: 900, outOfStock: false },
    ],
  },

  'mobile-legends': {
    slug: 'mobile-legends',
    name: 'Mobile Legends Diamonds Top Up',
    code: 'mlbb',
    icon: '/games/mobile-legends.jpg',
    packages: [
      { id: '5',           name: '5 Diamonds',                              price: 11,  originalPrice: 20,   outOfStock: true },
      { id: '11',          name: '11 Diamonds', bonus: '10+1 Bonus',        price: 23,  originalPrice: 30,   outOfStock: false },
      { id: '15',          name: '15 Diamonds + Super Value Gift Pack', bonus: 'Chance for hero', price: 29, originalPrice: 35, outOfStock: false  },
      { id: '22',          name: '22 Diamonds', bonus: '20+2 Bonus',        price: 45,  originalPrice: 46,   outOfStock: false },
      { id: 'weekly-elite',name: 'Weekly Elite Package', bonus: 'Available Once a Week', price: 80, originalPrice: 90, outOfStock: false },
      { id: '86',          name: '86 Diamonds', bonus: '78+8 Bonus',        price: 125, originalPrice: 149,  outOfStock: false },
      { id: 'weekly-pass', name: 'Weekly Diamond Pass',                     price: 147, originalPrice: 180,  outOfStock: false },
      { id: '172',         name: '172 Diamonds', bonus: '156+16 Bonus',     price: 249, originalPrice: 288,  outOfStock: false },
      { id: '257',         name: '257 Diamonds', bonus: '234+23 Bonus',     price: 359, originalPrice: 400,  outOfStock: false },
      { id: '706',         name: '706 Diamonds', bonus: '625+81 Bonus',     price: 977, originalPrice: 1090, outOfStock: false },
    ],
  },
};

export default function TopUpPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const game = GAMES_DATA[params.slug] || GAMES_DATA['mobile-legends'];

  const [playerId, setPlayerId] = useState('');
  const [serverCode, setServerCode] = useState('');
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const user = localStorage.getItem('marshal_user');
      setIsLoggedIn(!!user);
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  useEffect(() => {
    if (!playerId || playerId.length < 4) {
      setPlayerName(null);
      setVerifyError('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsVerifying(true);
      setVerifyError('');
      try {
        const res = await fetch('/api/verify-player', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, gameCode: game.code, serverCode }),
        });
        const data = await res.json();

        if (res.ok && (data.username || data.name || data.player_name)) {
          setPlayerName(data.username || data.name || data.player_name);
        } else if (data.error) {
          setVerifyError(data.error);
          setPlayerName(null);
        } else {
          setVerifyError('Player not found');
          setPlayerName(null);
        }
      } catch (err) {
        setVerifyError('Failed to verify player');
        setPlayerName(null);
      } finally {
        setIsVerifying(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [playerId, serverCode, game.code]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePackageSelect = (pkg: Package) => {
    // ✅ Block selection if out of stock
    if (pkg.outOfStock) return;

    const user = localStorage.getItem('marshal_user');
    if (!user) {
      toast('Please login or signup to continue', 'info');
      setIsLoginOpen(true);
      return;
    }

    setSelectedPkg(pkg);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || !selectedPkg || selectedPkg.outOfStock) return;

    const user = localStorage.getItem('marshal_user');
    if (!user) {
      toast('Please login to complete your purchase', 'info');
      setIsLoginOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: game.code === 'mlbb' ? `${playerId}(${serverCode})` : playerId,
          gameCode: game.code,
          packageId: selectedPkg.id,
          amount: selectedPkg.price,
          packageName: selectedPkg.name,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        alert(orderData.error || 'Failed to create order');
        setIsProcessing(false);
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_ThRdaDVKRm3oym',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Marshal Store',
        description: `${game.name} - ${selectedPkg.name}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          router.push(`/orders?orderId=${orderData.receipt}&success=true`);
        },
        prefill: {
          name: playerName || 'Gaming Customer',
        },
        theme: {
          color: '#6366f1',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert('Something went wrong during checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-200 bg-white dark:bg-slate-950 text-black dark:text-white">
      <div className="w-full mx-auto pt-6 px-4 sm:px-6 lg:px-10 space-y-6 pb-16">

        {/* Back Button Centered */}
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="bg-cyan-600/95 hover:bg-cyan-500 text-white font-medium text-xs sm:text-sm px-5 py-2 rounded-full shadow-md transition-all tracking-wide flex items-center space-x-2"
          >
            <span>← Back to Subcategories</span>
          </Link>
        </div>

        {/* Game Header */}
        <div className="border shadow-md rounded-2xl p-6 flex items-center space-x-4 transition-colors
                        bg-white dark:bg-slate-900
                        border-slate-200 dark:border-slate-800
                        text-black dark:text-white
                        shadow-sm dark:shadow-xl">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center border shadow-inner flex-shrink-0
                          bg-slate-100 dark:bg-slate-800
                          border-slate-200 dark:border-slate-700">
            <img
              src={game.icon}
              alt={game.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white">{game.name}</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Enter your credentials and select your package below.</p>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="border shadow-md rounded-2xl p-6 transition-colors
                        bg-white dark:bg-slate-900
                        border-slate-200 dark:border-slate-800
                        text-black dark:text-white
                        shadow-sm dark:shadow-xl">
          <label className="block text-sm font-semibold mb-3 text-indigo-600 dark:text-indigo-400">1. Enter Account Credentials</label>
          <div className={`grid grid-cols-1 ${game.code === 'mlbb' ? 'sm:grid-cols-2' : ''} gap-4`}>
            <div>
              <input
                type="text"
                placeholder={game.code === 'mlbb' ? 'Enter User ID (e.g. 155733610)' : 'Enter Player ID'}
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                required
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500
                           bg-slate-50 dark:bg-slate-950
                           border-slate-300 dark:border-slate-800
                           text-black dark:text-white
                           placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            {game.code === 'mlbb' && (
              <div>
                <input
                  type="text"
                  placeholder="Zone ID (e.g. 2800)"
                  value={serverCode}
                  onChange={(e) => setServerCode(e.target.value)}
                  required
                  className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500
                             bg-slate-50 dark:bg-slate-950
                             border-slate-300 dark:border-slate-800
                             text-black dark:text-white
                             placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            )}
          </div>
          {isVerifying && <p className="text-xs mt-2 text-indigo-600 dark:text-indigo-400">Verifying player ID...</p>}
          {playerName && <p className="text-xs text-emerald-500 mt-2 font-medium">Verified Player: {playerName}</p>}
          {verifyError && <p className="text-xs text-rose-500 mt-2">{verifyError}</p>}
        </div>

        {/* Packages Grid */}
        <div className="border shadow-md rounded-2xl p-6 transition-colors
                        bg-white dark:bg-slate-900
                        border-slate-200 dark:border-slate-800
                        text-black dark:text-white
                        shadow-sm dark:shadow-xl">
          <label className="block text-sm font-semibold mb-4 text-indigo-600 dark:text-indigo-400">2. Select Recharge Package</label>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {game.packages.map((pkg) => {
              const isOutOfStock = !!pkg.outOfStock;
              const isSelected = selectedPkg?.id === pkg.id;

              return (
                <div
                  key={pkg.id}
                  onClick={() => !isOutOfStock && handlePackageSelect(pkg)}
                  className={`relative border rounded-xl p-4 flex flex-col justify-between transition-all ${
                    isOutOfStock
                      ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                      : isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-lg cursor-pointer'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  {/* Out-of-stock overlay badge */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl z-10 bg-white/60 dark:bg-black/60 pointer-events-none">
                      <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow">
                        Out of Stock
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="font-bold text-sm text-black dark:text-white">{pkg.name}</div>
                    {pkg.bonus && (
                      <div className="text-xs mt-1 text-indigo-600 dark:text-indigo-400">{pkg.bonus}</div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t flex items-center justify-between border-slate-200 dark:border-slate-800/80">
                    <div>
                      {pkg.originalPrice && (
                        <span className="text-xs text-slate-400 line-through mr-2">₹{pkg.originalPrice}</span>
                      )}
                      <span className="text-emerald-500 font-bold text-sm">₹{pkg.price}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : isOutOfStock
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {isSelected ? 'Selected' : isOutOfStock ? 'Sold' : 'Buy'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Bar */}
          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs block text-slate-600 dark:text-slate-400">Selected Option</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">
                {selectedPkg ? `${selectedPkg.name} — ₹${selectedPkg.price}` : 'None selected'}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={!playerId || (game.code === 'mlbb' && !serverCode) || !selectedPkg || isProcessing}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
            >
              {isProcessing ? 'Processing...' : selectedPkg ? `Pay ₹${selectedPkg.price}` : 'Select a Package'}
            </button>
          </div>
        </div>

        <LoginModal
          open={isLoginOpen}
          onClose={() => {
            setIsLoginOpen(false);
            const user = localStorage.getItem('marshal_user');
            if (user) setIsLoggedIn(true);
          }}
        />
      </div>
    </div>
  );
}