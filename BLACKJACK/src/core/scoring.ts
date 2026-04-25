import type { Card, Hand } from "./types";

export function handValue(cards: Card[]): number {
  let total = cards.reduce((sum, card) => sum + card.value, 0);
  let aces = cards.filter((c) => c.rank === "A").length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards) === 21;
}

export function isBust(cards: Card[]): boolean {
  return handValue(cards) > 21;
}

export function isSoft17(cards: Card[]): boolean {
  const val = handValue(cards);
  if (val !== 17) return false;
  // Check if it's a soft 17 (contains an Ace counted as 11)
  let total = cards.reduce((sum, card) => sum + card.value, 0);
  let aces = cards.filter((c) => c.rank === "A").length;
  while (total > 17 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total === 17 && cards.some((c) => c.rank === "A");
}

export function canSplit(hand: Hand): boolean {
  return (
    hand.cards.length === 2 &&
    hand.cards[0].rank === hand.cards[1].rank &&
    !hand.isDoubled &&
    !hand.isSurrendered
  );
}

export function canDouble(hand: Hand): boolean {
  return hand.cards.length === 2 && !hand.isDoubled && !hand.isSurrendered;
}

export function canSurrender(hand: Hand, isFirstAction: boolean): boolean {
  return isFirstAction && hand.cards.length === 2 && !hand.isDoubled && !hand.isSurrendered;
}

export function formatHand(cards: Card[]): string {
  return cards.map((c) => `${c.rank}${c.suit[0].toUpperCase()}`).join(" ");
}
