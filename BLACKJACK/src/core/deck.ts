import seedrandom from "seedrandom";
import type { Card, Suit, Rank } from "./types";
import { generateId } from "@/lib/utils";

const SUITS: Suit[] = ["spade", "heart", "diamond", "club"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function getCardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return parseInt(rank, 10);
}

function createStandardDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        value: getCardValue(rank),
        id: generateId(),
      });
    }
  }
  return deck;
}

export class DeckEngine {
  private cards: Card[] = [];
  private rng: seedrandom.PRNG;
  private numDecks: number;
  private seed: string;

  constructor(seed: string, numDecks = 6) {
    this.seed = seed;
    this.numDecks = numDecks;
    this.rng = seedrandom(seed);
    this.shuffle();
  }

  shuffle(): void {
    const baseDeck = createStandardDeck();
    this.cards = [];
    for (let d = 0; d < this.numDecks; d++) {
      this.cards.push(...baseDeck.map((c) => ({ ...c, id: generateId() })));
    }
    // Fisher-Yates with seeded PRNG
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(): Card {
    if (this.cards.length === 0) {
      this.shuffle();
    }
    return this.cards.pop()!;
  }

  peek(count: number): Card[] {
    return this.cards.slice(-count);
  }

  remaining(): number {
    return this.cards.length;
  }

  getSeed(): string {
    return this.seed;
  }

  // Estimate true count for adaptive ambient lighting
  getRunningCount(): number {
    // Hi-Lo simplified count estimate based on remaining cards
    // Not cryptographically relevant, just for visual ambience
    return 0;
  }
}
