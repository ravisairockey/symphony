"use client";

import { motion } from "framer-motion";
import type { Card as CardType } from "@/core/types";
import { SPRING_CONFIG } from "@/lib/utils";

const SUIT_SYMBOLS: Record<string, string> = {
  spade: "♠",
  heart: "♥",
  diamond: "♦",
  club: "♣",
};

const SUIT_COLORS: Record<string, string> = {
  spade: "#1a1a2e",
  club: "#1a1a2e",
  heart: "#FF006E",
  diamond: "#FF4500",
};

interface CardProps {
  card: CardType;
  hidden?: boolean;
  index?: number;
  animate?: boolean;
}

export function Card({ card, hidden = false, index = 0, animate = true }: CardProps) {
  const isRed = card.suit === "heart" || card.suit === "diamond";

  return (
    <motion.div
      layoutId={card.id}
      initial={animate ? { scale: 0, y: -200, rotate: -20, opacity: 0 } : false}
      animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
      transition={{
        ...SPRING_CONFIG.card,
        delay: index * 0.1,
      }}
      className="relative w-16 h-24 sm:w-20 sm:h-28 perspective-1000"
    >
      <motion.div
        animate={{ rotateY: hidden ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="w-full h-full preserve-3d relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Face - Glass Frosted Shader Texture */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl overflow-hidden flex flex-col justify-between p-2"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.75))",
            backdropFilter: "blur(20px) saturate(1.2)",
            WebkitBackdropFilter: "blur(20px) saturate(1.2)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.3),
              inset 0 1px 0 rgba(255,255,255,0.8),
              inset 0 -1px 0 rgba(255,255,255,0.3)
            `,
          }}
        >
          {!hidden && (
            <>
              {/* Top Left - Rank & Suit */}
              <div className="flex flex-col items-start leading-none">
                <span
                  className="text-base sm:text-lg font-bold font-mono"
                  style={{ color: SUIT_COLORS[card.suit] }}
                >
                  {card.rank}
                </span>
                <span
                  className="text-lg sm:text-xl"
                  style={{ color: SUIT_COLORS[card.suit] }}
                >
                  {SUIT_SYMBOLS[card.suit]}
                </span>
              </div>

              {/* Center - Large Suit with Frost Pattern */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
                <span
                  className="text-5xl sm:text-6xl"
                  style={{ color: SUIT_COLORS[card.suit] }}
                >
                  {SUIT_SYMBOLS[card.suit]}
                </span>
              </div>

              {/* Glass Frost Texture Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background: `
                    radial-gradient(circle at 30% 20%, rgba(255,255,255,0.8) 0%, transparent 50%),
                    radial-gradient(circle at 70% 80%, rgba(255,255,255,0.4) 0%, transparent 40%),
                    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)
                  `,
                }}
              />

              {/* Shine Effect */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)",
                }}
              />

              {/* Bottom Right - Rank & Suit (Rotated) */}
              <div className="flex flex-col items-end leading-none rotate-180">
                <span
                  className="text-base sm:text-lg font-bold font-mono"
                  style={{ color: SUIT_COLORS[card.suit] }}
                >
                  {card.rank}
                </span>
                <span
                  className="text-lg sm:text-xl"
                  style={{ color: SUIT_COLORS[card.suit] }}
                >
                  {SUIT_SYMBOLS[card.suit]}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Back Face - Dark Glass with Frosted Texture */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl overflow-hidden p-1.5"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(135deg, rgba(26,10,46,0.95), rgba(13,6,32,0.98))",
            backdropFilter: "blur(30px) saturate(1.5)",
            WebkitBackdropFilter: "blur(30px) saturate(1.5)",
            border: "1px solid rgba(157,78,221,0.4)",
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.1),
              inset 0 0 30px rgba(157,78,221,0.15)
            `,
          }}
        >
          {/* Inner Border with Frost Effect */}
          <div
            className="w-full h-full rounded-lg border flex items-center justify-center relative overflow-hidden"
            style={{
              borderColor: "rgba(157,78,221,0.3)",
              background: `
                radial-gradient(circle at 30% 30%, rgba(157,78,221,0.15) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(0,245,255,0.1) 0%, transparent 50%)
              `,
            }}
          >
            {/* Frost Texture Pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(255,255,255,0.03) 10px,
                    rgba(255,255,255,0.03) 20px
                  )
                `,
              }}
            />

            {/* Neon Element */}
            <div className="relative">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: "rgba(0,245,255,0.4)",
                  background: "radial-gradient(circle, rgba(0,245,255,0.2) 0%, transparent 70%)",
                  boxShadow: "0 0 20px rgba(0,245,255,0.3)",
                }}
              >
                <span
                  className="text-lg sm:text-xl font-bold"
                  style={{
                    color: "#00f5ff",
                    textShadow: "0 0 10px rgba(0,245,255,0.8)",
                  }}
                >
                  ♠
                </span>
              </div>
            </div>

            {/* Corner Accents */}
            <div
              className="absolute top-2 left-2 w-2 h-2 rounded-full"
              style={{ background: "rgba(157,78,221,0.6)" }}
            />
            <div
              className="absolute top-2 right-2 w-2 h-2 rounded-full"
              style={{ background: "rgba(0,245,255,0.6)" }}
            />
            <div
              className="absolute bottom-2 left-2 w-2 h-2 rounded-full"
              style={{ background: "rgba(0,245,255,0.6)" }}
            />
            <div
              className="absolute bottom-2 right-2 w-2 h-2 rounded-full"
              style={{ background: "rgba(157,78,221,0.6)" }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
