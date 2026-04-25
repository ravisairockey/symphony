import type { GamePhase, PlayerAction, PlayerSeat, Hand, DealerState, HandResult } from "./types";
import { handValue, isBlackjack, isBust, canSplit, canDouble, canSurrender } from "./scoring";

export class StateMachineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StateMachineError";
  }
}

export function validateAction(
  phase: GamePhase,
  action: PlayerAction,
  seat: PlayerSeat,
  hand: Hand,
  isFirstAction: boolean
): void {
  if (phase !== "playerTurn") {
    throw new StateMachineError(`Cannot ${action} during ${phase}`);
  }

  if (!seat.isActive) {
    throw new StateMachineError("Seat is not active");
  }

  if (hand.isStanding || hand.isBusted || hand.isSurrendered) {
    throw new StateMachineError("Hand is already resolved");
  }

  switch (action) {
    case "split":
      if (!canSplit(hand)) {
        throw new StateMachineError("Cannot split this hand");
      }
      if (seat.balance < hand.bet) {
        throw new StateMachineError("Insufficient balance to split");
      }
      break;
    case "double":
      if (!canDouble(hand)) {
        throw new StateMachineError("Cannot double this hand");
      }
      if (seat.balance < hand.bet) {
        throw new StateMachineError("Insufficient balance to double");
      }
      break;
    case "surrender":
      if (!canSurrender(hand, isFirstAction)) {
        throw new StateMachineError("Cannot surrender this hand");
      }
      break;
    case "hit":
    case "stand":
      // Always valid if hand is active
      break;
  }
}

export function determineHandResult(
  playerHand: Hand,
  dealerHand: Hand,
  dealerRevealed: boolean
): HandResult {
  if (playerHand.isSurrendered) return "surrender";
  if (playerHand.isBusted) return "bust";

  const playerValue = handValue(playerHand.cards);
  const dealerValue = handValue(dealerHand.cards);
  const playerBJ = isBlackjack(playerHand.cards);
  const dealerBJ = isBlackjack(dealerHand.cards);

  if (playerBJ && dealerBJ) return "push";
  if (playerBJ) return "blackjack";
  if (dealerBJ) return "loss";
  if (!dealerRevealed) return playerHand.result ?? "push"; // Fallback

  if (dealerValue > 21) return "win";
  if (playerValue > dealerValue) return "win";
  if (playerValue < dealerValue) return "loss";
  return "push";
}

export function getNextPhase(
  currentPhase: GamePhase,
  seats: PlayerSeat[],
  dealer: DealerState
): GamePhase {
  switch (currentPhase) {
    case "betting":
      return "dealing";
    case "dealing":
      return "playerTurn";
    case "playerTurn": {
      const allDone = seats.every(
        (s) =>
          !s.isActive ||
          s.hands.every((h) => h.isStanding || h.isBusted || h.isSurrendered)
      );
      return allDone ? "dealerTurn" : "playerTurn";
    }
    case "dealerTurn":
      return "settlement";
    case "settlement":
      return "roundEnd";
    case "roundEnd":
      return "betting";
    default:
      return currentPhase;
  }
}

export function getPayoutMultiplier(result: HandResult): number {
  switch (result) {
    case "blackjack":
      return 2.5; // 3:2 payout
    case "win":
      return 2.0; // 1:1 payout
    case "push":
      return 1.0; // Return bet
    case "surrender":
      return 0.5; // Half bet returned
    case "loss":
    case "bust":
      return 0;
    default:
      return 0;
  }
}
