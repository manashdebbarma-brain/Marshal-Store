'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface Package {
  id: string;
  name: string;
  price: number;
}

interface Game {
  slug: string;
  name: string;
  code: string;
  packages: Package[];
}

const GAMES_DATA: Record<string, Game> = {
  'bgmi': {
    slug: 'bgmi',
    name: 'BGMI UC',
    code: 'bgmi',
    packages: [
      { id: '50', name: '50 UC', price: 45 },
      { id: '300', name: '300 UC', price: 249 },
      { id: '600', name: '600 UC', price: 479 },
      { id: '1500', name: '1500 UC', price: 1190 },
    ],
  },
  'free-fire': {
    slug: 'free-fire',
    name: 'Free Fire Diamonds',
    code: 'free-fire',
    packages: [
      { id: '50', name: '50 Diamonds', price: 89 },
      { id: '150', name: '150 Diamonds', price: 260 },
      { id: '250', name: '250 Diamonds', price: 420 },
      { id: '500', name: '500 Diamonds', price: 840 },
    ],
  },
};

export default function TopUpPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const game = GAMES_DATA[resolvedParams.slug] || GAMES_DATA['bgmi'];

  const [playerId, setPlayerId] = useState('');
  const [serverCode, setServerCode] = useState('');
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(game.packages[0] || null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-verify player when typing ID
  useEffect(() => {
    if (!playerId || playerId.length < 5) {
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
        } else {
          setVerifyError(data.error || 'Failed to connect to verification servers.');
          setPlayerName(null);
        }
      } catch (err) {
        setVerifyError('Failed to connect to verification servers.');
        setPlayerName(null);
      } finally {
        setIsVerifying(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [playerId, serverCode, game.code]);

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || !selectedPkg) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
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
        alert('Razorpay SDK failed to load. Are you online?');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">{game.name} Top Up</h1>
        <p className="text-slate-400 text-sm mb-6">Enter your credentials and select your package to instantly top up.</p>

        <form onSubmit={handleCheckout} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">1. Enter Account Details</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter Player ID"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              {game.code === 'genshin' && (
                <div>
                  <input
                    type="text"
                    placeholder="Server Code (e.g. os_asia)"
                    value={serverCode}
                    onChange={(e) => setServerCode(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            {isVerifying && <p className="text-xs text-indigo-400 mt-2">Verifying player ID...</p>}
            {playerName && <p className="text-xs text-emerald-400 mt-2 font-medium">Verified Player: {playerName}</p>}
            {verifyError && <p className="text-xs text-rose-500 mt-2">{verifyError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">2. Select Recharge Amount</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {game.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedPkg?.id === pkg.id
                      ? 'border-indigo-500 bg-indigo-950/30 shadow-lg'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-sm">{pkg.name}</div>
                  <div className="text-indigo-400 font-bold mt-2">₹{pkg.price}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Selected Option</span>
              <span className="text-sm font-bold">
                {selectedPkg ? `${selectedPkg.name} — ₹${selectedPkg.price}` : 'None selected'}
              </span>
            </div>
            <button
              type="submit"
              disabled={!playerId || !selectedPkg || isProcessing}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              {isProcessing ? 'Processing...' : selectedPkg ? `Pay ₹${selectedPkg.price}` : 'Select a Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}