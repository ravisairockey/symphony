"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBlackjackStore } from "@/stores/blackjackStore";
import { AmbientBackground } from "@/components/AmbientBackground";
import { HUD } from "@/components/HUD";
import { BetControls } from "@/components/BetControls";
import { DealerHandDisplay } from "@/components/DealerHand";
import { PlayerHandDisplay } from "@/components/PlayerHand";
import { ResultEffects } from "@/components/ResultEffects";
import { FairnessModal } from "@/components/FairnessModal";
import { MagneticButton } from "@/components/MagneticButton";
import { useSoundscape } from "@/hooks/useSoundscape";
import { Play } from "lucide-react";

export default function Home() {
  const {
    phase,
    initGame,
    soundEnabled,
    message,
  } = useBlackjackStore();

  const sound = useSoundscape(soundEnabled);

  useEffect(() => {
    // Auto-init on first load if in idle
    if (phase === "idle") {
      initGame();
    }
  }, [phase, initGame]);

  const isBetting = phase === "betting" || phase === "idle";
  const isPlaying =
    phase === "dealing" ||
    phase === "playerTurn" ||
    phase === "dealerTurn" ||
    phase === "settlement" ||
    phase === "roundEnd";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBackground />

      {/* HUD */}
      <HUD />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-8">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          {/* Dealer Area */}
          <AnimatePresence mode="wait">
            {isPlaying && (
              <motion.div
                key="dealer"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              >
                <DealerHandDisplay />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center Message */}
          <AnimatePresence mode="wait">
            {message && phase !== "roundEnd" && (
              <motion.div
                key={message}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <span className="text-white/40 text-xs font-mono uppercase tracking-widest">
                  {message}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player Area */}
          <AnimatePresence mode="wait">
            {isPlaying && (
              <motion.div
                key="player"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.1 }}
              >
                <PlayerHandDisplay />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Betting Controls */}
          <AnimatePresence mode="wait">
            {isBetting && (
              <motion.div
                key="betting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              >
                {phase === "idle" ? (
                  <div className="flex flex-col items-center gap-6">
                    <div className="text-center space-y-2">
                      <h1 className="text-5xl sm:text-6xl font-bold text-neon-cyan text-neon tracking-tight">
                        BLACKJACK
                      </h1>
                      <p className="text-white/40 text-sm font-mono tracking-widest uppercase">
                        Neon-Glass Edition
                      </p>
                    </div>
                    <MagneticButton
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        sound.glassClick();
                        initGame();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Start Game
                    </MagneticButton>
                  </div>
                ) : (
                  <BetControls />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Result Overlay */}
      <ResultEffects />

      {/* Fairness Modal */}
      <FairnessModal />
    </main>
  );
}
