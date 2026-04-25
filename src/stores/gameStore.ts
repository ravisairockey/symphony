import { create } from 'zustand';

export type GameId = 'snake' | 'nim' | 'tower-of-hanoi' | 'reversi' | 'frogger' | 'pacman' | 'pinball' | 'plinko' | 'blackjack';

export interface GameInfo {
  id: GameId;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  category: 'retro' | 'puzzle' | 'casino' | 'physics';
  controls: string;
}

export const GAMES: GameInfo[] = [
  { id: 'snake', name: 'Snake', description: 'Classic retro snake with synth sounds', icon: '🐍', color: '#00FF88', gradient: 'from-green-500 to-emerald-400', category: 'retro', controls: 'Arrow Keys / WASD' },
  { id: 'nim', name: 'Nim', description: 'Strategic math game vs AI', icon: '🧮', color: '#9D4EDD', gradient: 'from-purple-500 to-violet-400', category: 'puzzle', controls: 'Click to remove items' },
  { id: 'tower-of-hanoi', name: 'Tower of Hanoi', description: 'Move discs with minimal moves', icon: '🏗️', color: '#FFB700', gradient: 'from-amber-500 to-yellow-400', category: 'puzzle', controls: 'Click source then target peg' },
  { id: 'reversi', name: 'Reversi', description: 'Classic Othello board game vs AI', icon: '⚫', color: '#FF006E', gradient: 'from-pink-500 to-rose-400', category: 'puzzle', controls: 'Click to place pieces' },
  { id: 'frogger', name: 'Frogger', description: 'Dodge traffic, cross the river', icon: '🐸', color: '#00F5FF', gradient: 'from-cyan-500 to-teal-400', category: 'retro', controls: 'Arrow Keys' },
  { id: 'pacman', name: 'Pacman', description: 'Eat dots, avoid ghosts', icon: '👻', color: '#FFD700', gradient: 'from-yellow-500 to-amber-400', category: 'retro', controls: 'Arrow Keys / WASD' },
  { id: 'pinball', name: 'Pinball', description: 'Physics-based pinball action', icon: '⚡', color: '#FF4500', gradient: 'from-orange-500 to-red-400', category: 'physics', controls: 'A=Left Flip, D=Right Flip, Space=Launch' },
  { id: 'plinko', name: 'Plinko', description: 'Drop balls for multipliers', icon: '🎱', color: '#00BFFF', gradient: 'from-blue-500 to-cyan-400', category: 'physics', controls: 'Click to drop ball' },
  { id: 'blackjack', name: 'Blackjack', description: 'True random card dealing', icon: '🃏', color: '#DC143C', gradient: 'from-red-600 to-rose-500', category: 'casino', controls: 'Hit/Stand/Double/Split' },
];

interface GameState {
  activeGame: GameId | null;
  highScores: Record<string, number>;
  audioEnabled: boolean;
  volume: number;
  setActiveGame: (game: GameId | null) => void;
  setHighScore: (game: GameId, score: number) => void;
  toggleAudio: () => void;
  setVolume: (vol: number) => void;
}

export const useGameStore = create<GameState>()((set) => ({
  activeGame: null,
  highScores: {},
  audioEnabled: true,
  volume: 0.7,
  setActiveGame: (game) => set({ activeGame: game }),
  setHighScore: (game, score) =>
    set((state) => {
      const current = state.highScores[game] || 0;
      if (score > current) {
        return { highScores: { ...state.highScores, [game]: score } };
      }
      return state;
    }),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  setVolume: (vol) => set({ volume: Math.max(0, Math.min(1, vol)) }),
}));