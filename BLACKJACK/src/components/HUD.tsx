"use client";

import { motion } from "framer-motion";
import { useBlackjackStore } from "@/stores/blackjackStore";
import { MagneticButton } from "./MagneticButton";
import { useSoundscape } from "@/hooks/useSoundscape";
import {
  Shield,
  Volume2,
  VolumeX,
  Smartphone,
  Wallet,
  BellOff,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function HUD() {
  const {
    phase,
    seats,
    soundEnabled,
    hapticEnabled,
    toggleSound,
    toggleHaptic,
    toggleFairnessModal,
    newRound,
  } = useBlackjackStore();

  const seat = seats[0];
  const balance = seat?.balance ?? 0;
  const sound = useSoundscape(soundEnabled);

  const showNewRound = phase === "roundEnd";

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed top-0 left-0 right-0 z-30 px-4 py-3"
    >
      <div className="liquid-glass rounded-xl px-4 py-2.5 flex items-center justify-between max-w-4xl mx-auto">
        {/* Left: Balance */}
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-neon-gold/70" />
          <span className="text-white/80 font-mono text-sm font-bold tabular-nums">
            {formatCurrency(balance)}
          </span>
        </div>

        {/* Center: Status */}
        <div className="hidden sm:block">
          <span className="text-white/40 text-xs font-mono uppercase tracking-widest">
            {phase === "betting" && "Place Your Bet"}
            {phase === "dealing" && "Dealing..."}
            {phase === "playerTurn" && "Your Turn"}
            {phase === "dealerTurn" && "Dealer's Turn"}
            {phase === "settlement" && "Settling..."}
            {phase === "roundEnd" && "Round Complete"}
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5">
          {showNewRound && (
            <MagneticButton
              variant="success"
              size="sm"
              onClick={() => {
                sound.glassClick();
                newRound();
              }}
              className="mr-2"
            >
              New Round
            </MagneticButton>
          )}

          <button
            onClick={() => {
              sound.glassClick();
              toggleSound();
            }}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sound.glassClick();
              toggleHaptic();
            }}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
          >
            {hapticEnabled ? <Smartphone className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sound.glassClick();
              toggleFairnessModal();
            }}
            className="w-8 h-8 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan/60 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
