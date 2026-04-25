import type { Card, Hand } from "./types";
import { handValue, isSoft17 } from "./scoring";

export interface DealerDecision {
  action: "hit" | "stand";
  delayMs: number;
}

export function dealerDecide(hand: Hand): DealerDecision {
  const value = handValue(hand.cards);

  // Dealer must hit on soft 17, stand on hard 17+
  if (value < 17) {
    return { action: "hit", delayMs: 800 + Math.random() * 400 };
  }

  if (value === 17 && isSoft17(hand.cards)) {
    return { action: "hit", delayMs: 1000 + Math.random() * 300 };
  }

  return { action: "stand", delayMs: 500 };
}

export function shouldDealerReveal(dealerHand: Hand, phase: string): boolean {
  return phase !== "dealing" && phase !== "playerTurn";
}
