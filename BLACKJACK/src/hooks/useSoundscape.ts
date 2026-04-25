"use client";

import { useCallback, useRef } from "react";

// Minimalist Web Audio API soundscape — no external audio files needed
export function useSoundscape(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) => {
      if (!enabled) return;
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      } catch {
        // Ignore audio errors
      }
    },
    [enabled, getCtx]
  );

  const cardFlip = useCallback(() => {
    playTone(800, 0.08, "sine", 0.08);
    setTimeout(() => playTone(1200, 0.05, "sine", 0.06), 40);
  }, [playTone]);

  const cardSlide = useCallback(() => {
    playTone(400, 0.1, "triangle", 0.05);
  }, [playTone]);

  const win = useCallback(() => {
    playTone(523, 0.15, "sine", 0.12);
    setTimeout(() => playTone(659, 0.15, "sine", 0.12), 120);
    setTimeout(() => playTone(784, 0.25, "sine", 0.15), 240);
  }, [playTone]);

  const blackjackSound = useCallback(() => {
    playTone(523, 0.12, "sine", 0.12);
    setTimeout(() => playTone(659, 0.12, "sine", 0.12), 100);
    setTimeout(() => playTone(784, 0.12, "sine", 0.12), 200);
    setTimeout(() => playTone(1047, 0.35, "sine", 0.18), 300);
  }, [playTone]);

  const lose = useCallback(() => {
    playTone(300, 0.2, "sawtooth", 0.08);
    setTimeout(() => playTone(200, 0.35, "sawtooth", 0.06), 150);
  }, [playTone]);

  const bust = useCallback(() => {
    playTone(150, 0.3, "square", 0.08);
    setTimeout(() => playTone(100, 0.4, "square", 0.06), 200);
  }, [playTone]);

  const chipClick = useCallback(() => {
    playTone(2000, 0.04, "sine", 0.06);
  }, [playTone]);

  const glassClick = useCallback(() => {
    playTone(3000, 0.03, "sine", 0.04);
    setTimeout(() => playTone(4500, 0.02, "sine", 0.03), 20);
  }, [playTone]);

  return {
    cardFlip,
    cardSlide,
    win,
    blackjack: blackjackSound,
    lose,
    bust,
    chipClick,
    glassClick,
  };
}
