"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useBlackjackStore } from "@/stores/blackjackStore";
import { MagneticButton } from "./MagneticButton";
import { Shield, X, Copy, Check } from "lucide-react";
import { useState } from "react";

export function FairnessModal() {
  const { showFairnessModal, toggleFairnessModal, fairness, profile } = useBlackjackStore();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Ignore copy errors
    }
  };

  return (
    <AnimatePresence>
      {showFairnessModal && fairness && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={toggleFairnessModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative liquid-glass-strong rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[80vh] overflow-y-auto"
          >
            {/* Close */}
            <button
              onClick={toggleFairnessModal}
              className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Provably Fair</h2>
                <p className="text-white/40 text-xs">SHA-256 seeded randomness</p>
              </div>
            </div>

            {/* Seed Data */}
            <div className="space-y-4">
              <SeedField
                label="Client Seed"
                value={fairness.clientSeed}
                copied={copied === "client"}
                onCopy={() => copyToClipboard(fairness.clientSeed, "client")}
              />
              <SeedField
                label="Server Seed Hash (pre-round)"
                value={fairness.serverSeedHash}
                copied={copied === "hash"}
                onCopy={() => copyToClipboard(fairness.serverSeedHash, "hash")}
              />
              {fairness.revealed && fairness.serverSeed && (
                <SeedField
                  label="Server Seed (revealed)"
                  value={fairness.serverSeed}
                  copied={copied === "server"}
                  onCopy={() => copyToClipboard(fairness.serverSeed!, "server")}
                  highlight
                />
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-white/50 text-xs font-mono">Nonce</span>
                <span className="text-white/80 font-mono text-sm">{fairness.nonce}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Session Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="Hands Played" value={profile.handsPlayed} />
                <StatBox label="Blackjacks" value={profile.blackjacks} />
                <StatBox
                  label="Total Wagered"
                  value={`$${profile.totalWagered.toLocaleString()}`}
                />
                <StatBox label="Highest Win" value={`$${profile.highestWin.toLocaleString()}`} />
              </div>
            </div>

            {/* History */}
            {profile.history.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-sm font-semibold text-white/70 mb-3">Recent History</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {profile.history.slice(0, 10).map((entry, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            entry.result === "win" || entry.result === "blackjack"
                              ? "text-neon-green"
                              : entry.result === "push"
                              ? "text-white/50"
                              : "text-neon-red"
                          }`}
                        >
                          {entry.result.toUpperCase()}
                        </span>
                        <span className="text-white/30 font-mono">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          entry.amount >= 0 ? "text-neon-green" : "text-neon-red"
                        }`}
                      >
                        {entry.amount >= 0 ? "+" : ""}${entry.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <MagneticButton variant="ghost" onClick={toggleFairnessModal}>
                Close
              </MagneticButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SeedField({
  label,
  value,
  copied,
  onCopy,
  highlight,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 border ${
        highlight
          ? "bg-neon-cyan/5 border-neon-cyan/20"
          : "bg-white/[0.03] border-white/10"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-white/50 text-xs font-mono">{label}</span>
        <button
          onClick={onCopy}
          className="text-white/30 hover:text-white/70 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <p className="text-white/80 font-mono text-xs break-all leading-relaxed">{value}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl p-3 bg-white/[0.03] border border-white/10 text-center">
      <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white font-mono font-bold text-sm">{value}</p>
    </div>
  );
}
