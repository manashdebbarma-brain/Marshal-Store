"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, UserCheck } from "lucide-react";

interface PlayerVerificationFormProps {
  gameSlug: string;
  hasServerId?: boolean;
  onVerified?: (data: { playerId: string; serverId: string; username: string }) => void;
  onReset?: () => void;
}

export default function PlayerVerificationForm({
  gameSlug,
  hasServerId = true,
  onVerified,
  onReset,
}: PlayerVerificationFormProps) {
  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (pId: string = playerId, sId: string = serverId) => {
    const trimmedPId = pId.trim();
    const trimmedSId = sId.trim();

    if (!trimmedPId) {
      setError("Please enter your Player ID");
      return;
    }

    if (hasServerId && !trimmedSId) {
      setError("Please enter your Server ID");
      return;
    }

    setLoading(true);
    setError(null);
    setUsername(null);
    if (onReset) onReset();

    try {
      const res = await fetch("/api/validate-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: trimmedPId,
          serverId: trimmedSId,
          gameSlug,
        }),
      });

      const data = await res.json();

      if (data.success && data.username) {
        setUsername(data.username);
        if (onVerified) {
          onVerified({
            playerId: trimmedPId,
            serverId: trimmedSId,
            username: data.username,
          });
        }
      } else {
        setError(data.error || "Player ID or Server ID not found.");
      }
    } catch (err) {
      setError("Failed to connect to verification server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger verification when both values are available
  useEffect(() => {
    if (playerId.trim() && (!hasServerId || serverId.trim())) {
      const timer = setTimeout(() => {
        handleVerify(playerId, serverId);
      }, 600); // 600ms debounce
      return () => clearTimeout(timer);
    }
  }, [playerId, serverId]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-6 space-y-4">
      <div className="flex items-center gap-2 text-cyan-400">
        <UserCheck size={20} />
        <h3 className="text-lg font-extrabold text-white">Enter Account Details</h3>
      </div>
      <p className="text-xs text-slate-400">
        Enter the details required to verify and deliver your digital product.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Player ID
          </label>
          <input
            type="text"
            value={playerId}
            onChange={(e) => {
              setPlayerId(e.target.value);
              setUsername(null);
              setError(null);
            }}
            placeholder="e.g. 155733610"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        {hasServerId && (
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Server ID
            </label>
            <input
              type="text"
              value={serverId}
              onChange={(e) => {
                setServerId(e.target.value);
                setUsername(null);
                setError(null);
              }}
              placeholder="e.g. 2800"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold py-1">
          <Loader2 size={16} className="animate-spin" />
          <span>Verifying in-game nickname...</span>
        </div>
      )}

      {/* Verified Live Username Banner */}
      {username && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-emerald-400 animate-in fade-in">
          <CheckCircle2 size={20} className="shrink-0" />
          <div>
            <p className="text-xs font-semibold text-emerald-300/80">Verified Account</p>
            <p className="text-sm font-black text-emerald-400">{username}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-rose-400 animate-in fade-in">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Manual Verify Action */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={() => handleVerify()}
          disabled={loading || !playerId || (hasServerId && !serverId)}
          className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-bold text-black hover:bg-cyan-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Verify Now
        </button>
      </div>
    </div>
  );
}