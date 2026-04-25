"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useBlackjackStore } from "@/stores/blackjackStore";
import { Card } from "./Card";
import { handValue } from "@/core/scoring";
import { Sparkles } from "lucide-react";

export function DealerHandDisplay() {
  const { dealer, phase } = useBlackjackStore();
  const { hand, isRevealed, isThinking } = dealer;

  const visibleValue = isRevealed
    ? handValue(hand.cards)
    : hand.cards[0]?.value ?? 0;

  return (
    <motion.div
      layout
      className="liquid-glass rounded-2xl p-4 sm:p-6 w-full max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs font-mono uppercase tracking-wider">
            Dealer
          </span>
          {hand.isBlackjack && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-neon-gold text-xs font-bold px-2 py-0.5 rounded-full bg-neon-gold/10 border border-neon-gold/30"
            >
              BLACKJACK
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isThinking && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-neon-purple" />
              <span className="text-neon-purple text-xs font-mono">Thinking...</span>
            </motion.div>
          )}
          <span className="text-white/80 font-mono text-lg font-bold tabular-nums">
            {isRevealed || phase === "roundEnd" || phase === "settlement"
              ? visibleValue
              : "?"}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex justify-center gap-2 sm:gap-3 min-h-[110px] sm:min-h-[130px]">
        <AnimatePresence mode="popLayout">
          {hand.cards.map((card, index) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: -40, rotateY: 180 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: index * 0.1 }}
            >
              <Card
                card={card}
                hidden={index === 1 && !isRevealed && phase !== "roundEnd" && phase !== "settlement"}
                index={index}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Status */}
      {hand.isBusted && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-neon-red font-bold mt-3 text-sm"
        >
          BUST
        </motion.p>
      )}
    </motion.div>
  );
}
