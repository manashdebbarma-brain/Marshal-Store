"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, UserCheck } from "lucide-react";

interface PlayerVerificationFormProps {
  gameSlug: string;
  hasServerId?: boolean;
  onVerified?: (data: { playerId: string; serverId: string; username: string }) => void;
}

export default function PlayerVerificationForm({
  gameSlug,
  hasServerId = true,
  onVerified,
}: PlayerVerificationFormProps) {
  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [inGameName, setInGameName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!playerId) {
      setError("Please enter your Player ID");
      return;
    }

    if (hasServerId && !serverId) {
      setError("Please enter your Server / Zone ID");
      return;
    }

    setLoading(true);
    setError(null);
    setInGameName(null);

    try {
      const res = await fetch("/api/validate-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: playerId.trim(),
          serverId: serverId.trim(),
          gameSlug,
        }),
      });

      const data = await res.json();

      if (data.success && data.username) {
        setInGameName(data.username);
        if (onVerified) {
          onVerified({
            playerId: playerId.trim(),
            serverId: serverId.trim(),
            username: data.username,
          });
        }
      } else {
        setError(data.error || "Account not found. Please check your details.");
      }
    } catch (err) {
      setError("Unable to reach verification server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-6 space-y-4">
      <div className="flex items-center gap-2 text-cyan-400">
        <UserCheck size={20} />
        <h3 className="text-lg font-black text-white">Account Verification</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Player ID
          </label>
          <input
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="e.g. 12345678"
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        {hasServerId && (
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Server ID / Zone ID
            </label>
            <input
              type="text"
              value={serverId}
              onChange={(e) => setServerId(e.target.value)}
              placeholder="e.g. 1234"
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleVerify}
        disabled={loading || !playerId}
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-cyan-400 py-3 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Verifying Account...
          </>
        ) : (
          "Check Username"
        )}
      </button>

      {/* Verified Username Banner */}
      {inGameName && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 animate-in fade-in">
          <CheckCircle2 size={20} className="shrink-0" />
          <div>
            <p className="text-xs font-semibold text-emerald-300/80">Account Found</p>
            <p className="text-sm font-black text-emerald-400">{inGameName}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-400 animate-in fade-in">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}
    </div>
  );
}