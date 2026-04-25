export type Suit = "spade" | "heart" | "diamond" | "club";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  id: string;
}

export type GamePhase =
  | "idle"
  | "betting"
  | "dealing"
  | "playerTurn"
  | "dealerTurn"
  | "settlement"
  | "roundEnd";

export type PlayerAction = "hit" | "stand" | "double" | "split" | "surrender";

export type HandResult = "win" | "loss" | "push" | "blackjack" | "bust" | "surrender";

export interface Hand {
  cards: Card[];
  bet: number;
  result: HandResult | null;
  isStanding: boolean;
  isBusted: boolean;
  isBlackjack: boolean;
  isDoubled: boolean;
  isSurrendered: boolean;
  id: string;
}

export interface PlayerSeat {
  id: number;
  name: string;
  balance: number;
  hands: Hand[];
  activeHandIndex: number;
  isActive: boolean;
}

export interface DealerState {
  hand: Hand;
  isRevealed: boolean;
  isThinking: boolean;
}

export interface FairnessData {
  clientSeed: string;
  serverSeedHash: string;
  serverSeed: string | null;
  nonce: number;
  revealed: boolean;
}

export interface GameHistoryEntry {
  timestamp: number;
  result: HandResult;
  amount: number;
  balanceAfter: number;
  playerHand: string;
  dealerHand: string;
  fairness: FairnessData;
}

export interface PlayerProfile {
  name: string;
  balance: number;
  totalWagered: number;
  totalWon: number;
  handsPlayed: number;
  blackjacks: number;
  highestWin: number;
  history: GameHistoryEntry[];
}
