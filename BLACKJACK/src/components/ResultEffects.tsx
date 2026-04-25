"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useBlackjackStore } from "@/stores/blackjackStore";
import { Sparkles, Trophy, Skull, Scale } from "lucide-react";

export function ResultEffects() {
  const { phase, seats, message } = useBlackjackStore();
  const seat = seats[0];
  const activeHand = seat?.hands[seat.activeHandIndex];

  const isRoundEnd = phase === "roundEnd";
  const result = activeHand?.result;

  return (
    <AnimatePresence>
      {isRoundEnd && result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
        >
          {/* Background flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 1.5 }}
            className={`absolute inset-0 ${
              result === "blackjack" || result === "win"
                ? "bg-neon-green"
                : result === "push"
                ? "bg-white"
                : "bg-neon-red"
            }`}
          />

          {/* Result Badge */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            className={`liquid-glass-strong rounded-2xl px-8 py-5 text-center pointer-events-auto ${
              result === "blackjack" || result === "win"
                ? "border-neon-green/30 shadow-[0_0_40px_rgba(0,255,136,0.15)]"
                : result === "push"
                ? "border-white/20"
                : "border-neon-red/30 shadow-[0_0_40px_rgba(255,51,51,0.15)]"
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 20 }}
              className="flex justify-center mb-3"
            >
              {result === "blackjack" && (
                <div className="w-14 h-14 rounded-full bg-neon-gold/10 border border-neon-gold/30 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-neon-gold" />
                </div>
              )}
              {result === "win" && (
                <div className="w-14 h-14 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-neon-green" />
                </div>
              )}
              {result === "push" && (
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <Scale className="w-7 h-7 text-white/70" />
                </div>
              )}
              {(result === "loss" || result === "bust") && (
                <div className="w-14 h-14 rounded-full bg-neon-red/10 border border-neon-red/30 flex items-center justify-center">
                  <Skull className="w-7 h-7 text-neon-red" />
                </div>
              )}
              {result === "surrender" && (
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <Scale className="w-7 h-7 text-white/50" />
                </div>
              )}
            </motion.div>

            <h2
              className={`text-3xl font-bold mb-1 ${
                result === "blackjack"
                  ? "text-neon-gold text-neon"
                  : result === "win"
                  ? "text-neon-green text-neon"
                  : result === "push"
                  ? "text-white/70"
                  : "text-neon-red text-neon-soft"
              }`}
            >
              {result === "blackjack" ? "BLACKJACK!" : result.toUpperCase()}
            </h2>

            {message && (
              <p className="text-white/50 text-sm font-mono mt-2">{message}</p>
            )}
          </motion.div>

          {/* Floating particles */}
          {result === "blackjack" && <Particles color="#FFD700" count={30} />}
          {result === "win" && <Particles color="#00FF88" count={20} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Particles({ color, count }: { color: string; count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            opacity: 0,
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400 - 100,
            scale: 0,
          }}
          transition={{
            duration: 1.5 + Math.random(),
            delay: Math.random() * 0.3,
            ease: "easeOut",
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </>
  );
}
