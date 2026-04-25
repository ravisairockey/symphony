import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  GamePhase,
  PlayerSeat,
  DealerState,
  Hand,
  Card,
  FairnessData,
  PlayerProfile,
  GameHistoryEntry,
  PlayerAction,
} from "@/core/types";
import { DeckEngine } from "@/core/deck";
import {
  handValue,
  isBlackjack,
  isBust,
  canSplit,
  canDouble,
  canSurrender,
} from "@/core/scoring";
import {
  validateAction,
  determineHandResult,
  getNextPhase,
  getPayoutMultiplier,
} from "@/core/state-machine";
import { dealerDecide } from "@/core/dealer-ai";
import { combineSeeds, createFairnessRound, sha256 } from "@/core/fairness";
import { generateId } from "@/lib/utils";

const DEFAULT_BALANCE = 5000;
const MIN_BET = 25;

function createEmptyHand(): Hand {
  return {
    cards: [],
    bet: 0,
    result: null,
    isStanding: false,
    isBusted: false,
    isBlackjack: false,
    isDoubled: false,
    isSurrendered: false,
    id: generateId(),
  };
}

function createPlayerSeat(id: number, name: string, balance: number): PlayerSeat {
  return {
    id,
    name,
    balance,
    hands: [createEmptyHand()],
    activeHandIndex: 0,
    isActive: true,
  };
}

function createDealer(): DealerState {
  return {
    hand: createEmptyHand(),
    isRevealed: false,
    isThinking: false,
  };
}

function loadProfile(): PlayerProfile {
  if (typeof window === "undefined") {
    return {
      name: "Player",
      balance: DEFAULT_BALANCE,
      totalWagered: 0,
      totalWon: 0,
      handsPlayed: 0,
      blackjacks: 0,
      highestWin: 0,
      history: [],
    };
  }
  const raw = localStorage.getItem("blackjack_profile");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return { ...parsed, balance: parsed.balance ?? DEFAULT_BALANCE };
    } catch {
      /* fallthrough */
    }
  }
  return {
    name: "Player",
    balance: DEFAULT_BALANCE,
    totalWagered: 0,
    totalWon: 0,
    handsPlayed: 0,
    blackjacks: 0,
    highestWin: 0,
    history: [],
  };
}

function saveProfile(profile: PlayerProfile) {
  if (typeof window !== "undefined") {
    localStorage.setItem("blackjack_profile", JSON.stringify(profile));
  }
}

interface BlackjackState {
  phase: GamePhase;
  seats: PlayerSeat[];
  dealer: DealerState;
  deck: DeckEngine | null;
  currentBet: number;
  fairness: FairnessData | null;
  nonce: number;
  profile: PlayerProfile;
  message: string;
  showFairnessModal: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;

  // Actions
  initGame: () => Promise<void>;
  setBet: (amount: number) => void;
  placeBet: () => void;
  deal: () => void;
  playerAction: (action: PlayerAction) => void;
  dealerPlay: () => Promise<void>;
  settle: () => void;
  newRound: () => void;
  toggleFairnessModal: () => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  resetBalance: () => void;
}

export const useBlackjackStore = create<BlackjackState>()(
  immer((set, get) => ({
    phase: "idle",
    seats: [createPlayerSeat(1, "Player", DEFAULT_BALANCE)],
    dealer: createDealer(),
    deck: null,
    currentBet: MIN_BET,
    fairness: null,
    nonce: 0,
    profile: loadProfile(),
    message: "",
    showFairnessModal: false,
    soundEnabled: true,
    hapticEnabled: true,

    initGame: async () => {
      const profile = loadProfile();
      const fairnessData = await createFairnessRound(0);
      const seed = combineSeeds(
        fairnessData.clientSeed,
        fairnessData.serverSeed,
        0
      );
      set((state) => {
        state.profile = profile;
        state.seats = [
          createPlayerSeat(1, profile.name, profile.balance),
        ];
        state.dealer = createDealer();
        state.deck = new DeckEngine(seed);
        state.fairness = {
          clientSeed: fairnessData.clientSeed,
          serverSeedHash: fairnessData.serverSeedHash,
          serverSeed: fairnessData.serverSeed,
          nonce: 0,
          revealed: false,
        };
        state.phase = "betting";
        state.nonce = 0;
        state.message = "Place your bet";
      });
    },

    setBet: (amount) => {
      set((state) => {
        const maxBet = state.seats[0]?.balance ?? 0;
        state.currentBet = Math.max(MIN_BET, Math.min(amount, maxBet));
      });
    },

    placeBet: () => {
      set((state) => {
        const seat = state.seats[0];
        if (!seat || seat.balance < state.currentBet) return;
        seat.balance -= state.currentBet;
        seat.hands[0].bet = state.currentBet;
        state.profile.balance = seat.balance;
        state.profile.totalWagered += state.currentBet;
        state.phase = "dealing";
        state.message = "Dealing cards...";
      });
      get().deal();
    },

    deal: () => {
      set((state) => {
        const deck = state.deck;
        if (!deck) return;

        const seat = state.seats[0];
        const dealer = state.dealer;

        // Deal initial cards: Player, Dealer, Player, Dealer
        seat.hands[0].cards.push(deck.deal());
        dealer.hand.cards.push(deck.deal());
        seat.hands[0].cards.push(deck.deal());
        dealer.hand.cards.push(deck.deal());

        // Check for blackjacks
        const playerBJ = isBlackjack(seat.hands[0].cards);
        const dealerBJ = isBlackjack(dealer.hand.cards);

        seat.hands[0].isBlackjack = playerBJ;
        dealer.hand.isBlackjack = dealerBJ;

        if (playerBJ || dealerBJ) {
          dealer.isRevealed = true;
          state.phase = "settlement";
        } else {
          state.phase = "playerTurn";
          state.message = "Your turn";
        }
      });

      const state = get();
      if (state.phase === "settlement") {
        get().settle();
      }
    },

    playerAction: (action) => {
      const state = get();
      const seat = state.seats[0];
      if (!seat) return;

      const hand = seat.hands[seat.activeHandIndex];
      const isFirstAction = hand.cards.length === 2;

      try {
        validateAction(state.phase, action, seat, hand, isFirstAction);
      } catch (err) {
        console.warn("Invalid action:", err);
        return;
      }

      set((s) => {
        const currentSeat = s.seats[0];
        const currentHand = currentSeat.hands[currentSeat.activeHandIndex];
        const deck = s.deck;
        if (!deck) return;

        switch (action) {
          case "hit": {
            currentHand.cards.push(deck.deal());
            if (isBust(currentHand.cards)) {
              currentHand.isBusted = true;
              // Move to next hand or dealer
              if (currentSeat.activeHandIndex < currentSeat.hands.length - 1) {
                currentSeat.activeHandIndex++;
              } else {
                s.dealer.isRevealed = true;
                s.phase = "dealerTurn";
                s.message = "Dealer's turn";
              }
            }
            break;
          }
          case "stand": {
            currentHand.isStanding = true;
            if (currentSeat.activeHandIndex < currentSeat.hands.length - 1) {
              currentSeat.activeHandIndex++;
            } else {
              s.dealer.isRevealed = true;
              s.phase = "dealerTurn";
              s.message = "Dealer's turn";
            }
            break;
          }
          case "double": {
            currentSeat.balance -= currentHand.bet;
            s.profile.balance = currentSeat.balance;
            s.profile.totalWagered += currentHand.bet;
            currentHand.bet *= 2;
            currentHand.isDoubled = true;
            currentHand.cards.push(deck.deal());
            if (isBust(currentHand.cards)) {
              currentHand.isBusted = true;
            } else {
              currentHand.isStanding = true;
            }
            if (currentSeat.activeHandIndex < currentSeat.hands.length - 1) {
              currentSeat.activeHandIndex++;
            } else {
              s.dealer.isRevealed = true;
              s.phase = "dealerTurn";
              s.message = "Dealer's turn";
            }
            break;
          }
          case "split": {
            if (!canSplit(currentHand)) return;
            currentSeat.balance -= currentHand.bet;
            s.profile.balance = currentSeat.balance;
            s.profile.totalWagered += currentHand.bet;

            const card1 = currentHand.cards[0];
            const card2 = currentHand.cards[1];

            const newHand1: Hand = {
              ...createEmptyHand(),
              cards: [card1, deck.deal()],
              bet: currentHand.bet,
            };
            const newHand2: Hand = {
              ...createEmptyHand(),
              cards: [card2, deck.deal()],
              bet: currentHand.bet,
            };

            currentSeat.hands.splice(currentSeat.activeHandIndex, 1, newHand1, newHand2);
            break;
          }
          case "surrender": {
            if (!canSurrender(currentHand, isFirstAction)) return;
            currentHand.isSurrendered = true;
            currentSeat.balance += Math.floor(currentHand.bet * 0.5);
            s.profile.balance = currentSeat.balance;
            s.dealer.isRevealed = true;
            s.phase = "dealerTurn";
            s.message = "Dealer's turn";
            break;
          }
        }
      });

      const afterState = get();
      if (afterState.phase === "dealerTurn") {
        get().dealerPlay();
      }
    },

    dealerPlay: async () => {
      const state = get();
      if (state.phase !== "dealerTurn") return;

      set((s) => {
        s.dealer.isThinking = true;
      });

      let currentState = get();
      while (currentState.phase === "dealerTurn") {
        const decision = dealerDecide(currentState.dealer.hand);

        await new Promise((resolve) => setTimeout(resolve, decision.delayMs));

        if (decision.action === "stand") {
          set((s) => {
            s.dealer.isThinking = false;
            s.phase = "settlement";
          });
          break;
        }

        set((s) => {
          const deck = s.deck;
          if (!deck) return;
          s.dealer.hand.cards.push(deck.deal());
          if (isBust(s.dealer.hand.cards)) {
            s.dealer.hand.isBusted = true;
            s.dealer.isThinking = false;
            s.phase = "settlement";
          }
        });

        currentState = get();
      }

      get().settle();
    },

    settle: () => {
      set((state) => {
        const seat = state.seats[0];
        const dealer = state.dealer;
        let totalWin = 0;
        let messageParts: string[] = [];

        for (const hand of seat.hands) {
          const result = determineHandResult(hand, dealer.hand, dealer.isRevealed);
          hand.result = result;

          const multiplier = getPayoutMultiplier(result);
          const winAmount = Math.floor(hand.bet * multiplier);
          const netWin = winAmount - hand.bet;

          if (result === "win" || result === "blackjack") {
            seat.balance += winAmount;
            totalWin += netWin;
            state.profile.totalWon += netWin;
            if (result === "blackjack") {
              state.profile.blackjacks++;
            }
            if (netWin > state.profile.highestWin) {
              state.profile.highestWin = netWin;
            }
          } else if (result === "push") {
            seat.balance += hand.bet;
          } else if (result === "surrender") {
            seat.balance += Math.floor(hand.bet * 0.5);
          }

          messageParts.push(formatResultMessage(result, hand.bet, netWin));
          state.profile.handsPlayed++;

          // Record history
          const historyEntry: GameHistoryEntry = {
            timestamp: Date.now(),
            result,
            amount: netWin,
            balanceAfter: seat.balance,
            playerHand: hand.cards.map((c) => `${c.rank}${c.suit[0].toUpperCase()}`).join(" "),
            dealerHand: dealer.hand.cards.map((c) => `${c.rank}${c.suit[0].toUpperCase()}`).join(" "),
            fairness: state.fairness!,
          };
          state.profile.history.unshift(historyEntry);
          if (state.profile.history.length > 100) {
            state.profile.history.pop();
          }
        }

        state.profile.balance = seat.balance;
        saveProfile(state.profile);

        state.phase = "roundEnd";
        state.message = messageParts.join(" | ");

        // Reveal fairness seed
        if (state.fairness) {
          state.fairness.revealed = true;
        }
      });
    },

    newRound: async () => {
      const state = get();
      const newNonce = state.nonce + 1;
      const fairnessData = await createFairnessRound(newNonce);
      const seed = combineSeeds(
        fairnessData.clientSeed,
        fairnessData.serverSeed,
        newNonce
      );

      set((s) => {
        const seat = s.seats[0];
        if (seat.balance <= 0) {
          seat.balance = DEFAULT_BALANCE;
          s.profile.balance = DEFAULT_BALANCE;
        }
        seat.hands = [createEmptyHand()];
        seat.activeHandIndex = 0;
        seat.isActive = true;
        s.dealer = createDealer();
        s.deck = new DeckEngine(seed);
        s.fairness = {
          clientSeed: fairnessData.clientSeed,
          serverSeedHash: fairnessData.serverSeedHash,
          serverSeed: fairnessData.serverSeed,
          nonce: newNonce,
          revealed: false,
        };
        s.phase = "betting";
        s.nonce = newNonce;
        s.currentBet = Math.min(s.currentBet, seat.balance);
        s.message = "Place your bet";
      });
    },

    toggleFairnessModal: () => {
      set((state) => {
        state.showFairnessModal = !state.showFairnessModal;
      });
    },

    toggleSound: () => {
      set((state) => {
        state.soundEnabled = !state.soundEnabled;
      });
    },

    toggleHaptic: () => {
      set((state) => {
        state.hapticEnabled = !state.hapticEnabled;
      });
    },

    resetBalance: () => {
      set((state) => {
        state.profile.balance = DEFAULT_BALANCE;
        state.seats[0].balance = DEFAULT_BALANCE;
        saveProfile(state.profile);
      });
    },
  }))
);

function formatResultMessage(result: string, bet: number, netWin: number): string {
  switch (result) {
    case "blackjack":
      return `Blackjack! +$${netWin}`;
    case "win":
      return `Win! +$${netWin}`;
    case "push":
      return "Push";
    case "surrender":
      return `Surrender -$${Math.floor(bet * 0.5)}`;
    case "bust":
      return `Bust -$${bet}`;
    case "loss":
      return `Loss -$${bet}`;
    default:
      return result;
  }
}
