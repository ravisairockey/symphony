"use client";

import { useCallback } from "react";

export function useHaptic(enabled: boolean) {
  const trigger = useCallback(
    (pattern: number | number[] = 50) => {
      if (!enabled) return;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(pattern);
        } catch {
          // Ignore haptic errors
        }
      }
    },
    [enabled]
  );

  const bust = useCallback(() => trigger([100, 50, 100]), [trigger]);
  const blackjack = useCallback(() => trigger([30, 30, 30, 30, 100]), [trigger]);
  const win = useCallback(() => trigger([40, 20, 60]), [trigger]);
  const click = useCallback(() => trigger(20), [trigger]);

  return { trigger, bust, blackjack, win, click };
}
