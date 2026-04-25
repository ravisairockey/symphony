"use client";

import { motion } from "framer-motion";
import { useBlackjackStore } from "@/stores/blackjackStore";
import { MagneticButton } from "./MagneticButton";
import { useSoundscape } from "@/hooks/useSoundscape";
import { Coins, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const CHIP_VALUES = [25, 50, 100, 250, 500, 1000];

export function BetControls() {
  const { currentBet, setBet, placeBet, seats, phase, resetBalance, soundEnabled } =
    useBlackjackStore();
  const seat = seats[0];
  const balance = seat?.balance ?? 0;
  const sound = useSoundscape(soundEnabled);

  const canBet = phase === "betting" && balance >= currentBet && currentBet > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto"
    >
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-4xl sm:text-5xl font-bold text-neon-cyan text-neon tracking-tight">
          BLACKJACK
        </h1>
        <p className="text-white/40 text-xs font-mono tracking-widest uppercase">
          Provably Fair &middot; Seeded Shuffle
        </p>
      </div>

      {/* Balance */}
      <div className="liquid-glass rounded-2xl px-8 py-4 text-center">
        <p className="text-white/50 text-xs font-mono uppercase tracking-wider mb-1">Balance</p>
        <p className="text-3xl font-bold font-mono text-neon-gold text-neon-soft">
          {formatCurrency(balance)}
        </p>
      </div>

      {/* Bet Display */}
      <div className="flex items-center gap-3">
        <Coins className="w-5 h-5 text-neon-gold/70" />
        <span className="text-white/70 font-mono text-sm">Current Bet:</span>
        <span className="text-neon-gold font-mono text-xl font-bold text-neon-soft">
          {formatCurrency(currentBet)}
        </span>
      </div>

      {/* Chip Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {CHIP_VALUES.map((value) => {
          const isActive = currentBet === value;
          const isDisabled = value > balance;
          return (
            <motion.button
              key={value}
              whileHover={{ scale: isDisabled ? 1 : 1.1, y: isDisabled ? 0 : -4 }}
              whileTap={{ scale: isDisabled ? 1 : 0.95 }}
              onClick={() => {
                if (!isDisabled) {
                  sound.chipClick();
                  setBet(value);
                }
              }}
              disabled={isDisabled}
              className={`
                relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center
                font-mono font-bold text-xs sm:text-sm
                transition-all duration-200
                ${
                  isActive
                    ? "bg-neon-gold/20 border-neon-gold text-neon-gold shadow-neon-gold scale-110"
                    : isDisabled
                    ? "bg-white/5 border-white/10 text-white/20 cursor-not-allowed"
                    : "bg-white/5 border-white/15 text-white/70 hover:bg-white/10 hover:border-white/25 hover:text-white"
                }
              `}
            >
              <span className="relative z-10">${value}</span>
              {isActive && (
                <motion.div
                  layoutId="active-chip"
                  className="absolute inset-0 rounded-full border-2 border-neon-gold/50"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Custom bet input */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={25}
          max={Math.min(balance, 5000)}
          step={25}
          value={currentBet}
          onChange={(e) => setBet(Number(e.target.value))}
          className="w-48 h-1 bg-white/10 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-neon-gold
            [&::-webkit-slider-thumb]:shadow-neon-gold
          "
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <MagneticButton
          variant="success"
          size="lg"
          onClick={() => {
            sound.glassClick();
            placeBet();
          }}
          disabled={!canBet}
          className="min-w-[140px]"
        >
          DEAL
        </MagneticButton>
        <MagneticButton
          variant="ghost"
          size="md"
          onClick={() => {
            sound.glassClick();
            resetBalance();
          }}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </MagneticButton>
      </div>
    </motion.div>
  );
}
