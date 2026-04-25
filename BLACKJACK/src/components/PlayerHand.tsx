"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useBlackjackStore } from "@/stores/blackjackStore";
import { Card } from "./Card";
import { handValue } from "@/core/scoring";
import { canSplit, canDouble, canSurrender } from "@/core/scoring";
import { MagneticButton } from "./MagneticButton";
import { useSoundscape } from "@/hooks/useSoundscape";
import { useHaptic } from "@/hooks/useHaptic";
import { Swords, Hand, ChevronUp, Copy, Flag } from "lucide-react";
import { useEffect } from "react";

export function PlayerHandDisplay() {
  const {
    seats,
    phase,
    playerAction,
    soundEnabled,
    hapticEnabled,
  } = useBlackjackStore();

  const seat = seats[0];
  const sound = useSoundscape(soundEnabled);
  const haptic = useHaptic(hapticEnabled);

  const activeHand = seat?.hands[seat.activeHandIndex];
  const isPlayerTurn = phase === "playerTurn";
  const isFirstAction = activeHand?.cards.length === 2;

  useEffect(() => {
    if (phase === "roundEnd" && activeHand) {
      if (activeHand.isBusted) {
        haptic.bust();
        sound.bust();
      } else if (activeHand.isBlackjack) {
        haptic.blackjack();
        sound.blackjack();
      } else if (activeHand.result === "win" || activeHand.result === "blackjack") {
        haptic.win();
        sound.win();
      } else if (activeHand.result === "loss" || activeHand.result === "bust") {
        sound.lose();
      }
    }
  }, [phase, activeHand, haptic, sound]);

  if (!seat) return null;

  return (
    <motion.div
      layout
      className="liquid-glass rounded-2xl p-4 sm:p-6 w-full max-w-xl mx-auto space-y-4"
    >
      {/* Hands */}
      {seat.hands.map((hand, handIndex) => {
        const isActive = isPlayerTurn && handIndex === seat.activeHandIndex;
        const val = handValue(hand.cards);

        return (
          <div
            key={hand.id}
            className={`relative rounded-xl p-3 transition-all duration-300 ${
              isActive
                ? "bg-neon-cyan/5 border border-neon-cyan/20"
                : "bg-white/[0.02] border border-transparent"
            }`}
          >
            {/* Hand header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-xs font-mono uppercase">
                  {seat.hands.length > 1 ? `Hand ${handIndex + 1}` : "Your Hand"}
                </span>
                {hand.isDoubled && (
                  <span className="text-neon-purple text-[10px] font-bold px-1.5 py-0.5 rounded bg-neon-purple/10 border border-neon-purple/20">
                    2x
                  </span>
                )}
                {hand.isSurrendered && (
                  <span className="text-white/40 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                    SURRENDER
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hand.isBlackjack && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-neon-gold text-xs font-bold px-2 py-0.5 rounded-full bg-neon-gold/10 border border-neon-gold/30"
                  >
                    BLACKJACK
                  </motion.span>
                )}
                {hand.isBusted && (
                  <span className="text-neon-red text-xs font-bold">BUST</span>
                )}
                {hand.result && hand.result !== "bust" && hand.result !== "blackjack" && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      hand.result === "win"
                        ? "text-neon-green bg-neon-green/10 border-neon-green/20"
                        : hand.result === "push"
                        ? "text-white/60 bg-white/5 border-white/10"
                        : hand.result === "surrender"
                        ? "text-white/40 bg-white/5 border-white/10"
                        : "text-neon-red bg-neon-red/10 border-neon-red/20"
                    }`}
                  >
                    {hand.result.toUpperCase()}
                  </span>
                )}
                <span className="text-white/80 font-mono text-lg font-bold tabular-nums">
                  {val}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex justify-center gap-2 sm:gap-3 min-h-[110px] sm:min-h-[130px]">
              <AnimatePresence mode="popLayout">
                {hand.cards.map((card, cardIndex) => (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, y: -40, rotateY: 180 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      delay: cardIndex * 0.08,
                    }}
                  >
                    <Card card={card} index={cardIndex} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bet indicator */}
            <div className="text-center mt-2">
              <span className="text-neon-gold/70 font-mono text-xs">
                Bet: ${hand.bet}
              </span>
            </div>
          </div>
        );
      })}

      {/* Action Buttons */}
      <AnimatePresence>
        {isPlayerTurn && activeHand && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-2"
          >
            <MagneticButton
              variant="primary"
              onClick={() => {
                sound.cardSlide();
                haptic.click();
                playerAction("hit");
              }}
            >
              <Swords className="w-4 h-4 inline mr-1.5" />
              Hit
            </MagneticButton>

            <MagneticButton
              variant="secondary"
              onClick={() => {
                sound.glassClick();
                haptic.click();
                playerAction("stand");
              }}
            >
              <Hand className="w-4 h-4 inline mr-1.5" />
              Stand
            </MagneticButton>

            {canDouble(activeHand) && seat.balance >= activeHand.bet && (
              <MagneticButton
                variant="success"
                onClick={() => {
                  sound.chipClick();
                  haptic.click();
                  playerAction("double");
                }}
              >
                <ChevronUp className="w-4 h-4 inline mr-1.5" />
                Double
              </MagneticButton>
            )}

            {canSplit(activeHand) && seat.balance >= activeHand.bet && (
              <MagneticButton
                variant="ghost"
                onClick={() => {
                  sound.cardSlide();
                  haptic.click();
                  playerAction("split");
                }}
              >
                <Copy className="w-4 h-4 inline mr-1.5" />
                Split
              </MagneticButton>
            )}

            {canSurrender(activeHand, isFirstAction) && (
              <MagneticButton
                variant="danger"
                onClick={() => {
                  sound.glassClick();
                  haptic.click();
                  playerAction("surrender");
                }}
              >
                <Flag className="w-4 h-4 inline mr-1.5" />
                Surrender
              </MagneticButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
