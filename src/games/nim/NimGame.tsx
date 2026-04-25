import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../../lib/audio/AudioManager';
import { useGameStore } from '../../stores/gameStore';

const ROWS = [1, 3, 5, 7];

export default function NimGame() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [piles, setPiles] = useState<number[]>([...ROWS]);
  const [selectedPile, setSelectedPile] = useState<number | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [message, setMessage] = useState('Your turn - select a pile, then remove items');
  const { audioEnabled, setHighScore } = useGameStore();

  const calculateNimSum = (p: number[]) => p.reduce((a, b) => a ^ b, 0);

  const init = useCallback(() => {
    setPiles([...ROWS]);
    setSelectedPile(null);
    setSelectedCount(0);
    setIsPlayerTurn(true);
    setGameState('playing');
    setMessage('Your turn - select a pile, then remove items');
    if (audioEnabled) audioManager.play('game-start');
  }, [audioEnabled]);

  const aiMove = useCallback((currentPiles: number[]) => {
    const ns = currentPiles.reduce((a, b) => a ^ b, 0);
    if (ns === 0) {
      const maxIdx = currentPiles.indexOf(Math.max(...currentPiles));
      const newPiles = [...currentPiles];
      newPiles[maxIdx] = Math.max(0, newPiles[maxIdx] - 1);
      return newPiles;
    }
    for (let i = 0; i < currentPiles.length; i++) {
      const target = currentPiles[i] ^ ns;
      if (target < currentPiles[i]) {
        const newPiles = [...currentPiles];
        newPiles[i] = target;
        return newPiles;
      }
    }
    const maxIdx = currentPiles.indexOf(Math.max(...currentPiles));
    const newPiles = [...currentPiles];
    newPiles[maxIdx] = Math.max(0, newPiles[maxIdx] - 1);
    return newPiles;
  }, []);

  const confirmMove = useCallback(() => {
    if (selectedPile === null || selectedCount === 0) return;
    const newPiles = [...piles];
    newPiles[selectedPile] = Math.max(0, newPiles[selectedPile] - selectedCount);
    if (audioEnabled) audioManager.play('chip-drop');
    if (newPiles.every(p => p === 0)) {
      setGameState('gameover');
      setMessage('You Win!');
      setPiles(newPiles);
      if (audioEnabled) audioManager.play('win');
      return;
    }
    setPiles(newPiles);
    setSelectedPile(null);
    setSelectedCount(0);
    setIsPlayerTurn(false);
    setMessage('AI is thinking...');
    setTimeout(() => {
      const afterAi = aiMove(newPiles);
      setPiles(afterAi);
      setIsPlayerTurn(true);
      if (afterAi.every(p => p === 0)) {
        setGameState('gameover');
        setMessage('AI Wins!');
        if (audioEnabled) audioManager.play('lose');
      } else {
        setMessage('Your turn - select a pile');
      }
    }, 800);
  }, [selectedPile, selectedCount, piles, audioEnabled, aiMove]);

  const selectPileItem = (pileIdx: number, itemIdx: number) => {
    if (!isPlayerTurn) return;
    setSelectedPile(pileIdx);
    setSelectedCount(itemIdx + 1);
    if (audioEnabled) audioManager.play('menu-click');
  };

  const pileColors = ['#FF006E', '#00F5FF', '#9D4EDD', '#FFB700'];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6">
            <h2 className="text-4xl font-bold text-purple-400" style={{ textShadow: '0 0 20px #9D4EDD' }}>
              NIM
            </h2>
            <p className="text-purple-300/70 font-mono text-sm text-center">
              Remove items from piles. Take the last item to win!<br />
              The AI plays optimally using XOR strategy.
            </p>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={init}
              className="px-6 py-3 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-300 font-mono">
              START
            </motion.button>
          </motion.div>
        )}
        {gameState === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 w-full">
            <div className="text-purple-400/70 font-mono text-sm text-center">{message}</div>
            <div className="flex gap-6 items-end justify-center">
              {piles.map((count, pileIdx) => (
                <div key={pileIdx} className="flex flex-col items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: pileColors[pileIdx] }}>
                    Pile {pileIdx + 1}
                  </span>
                  <div className="flex flex-col-reverse gap-1 items-center">
                    {Array.from({ length: count }).map((_, itemIdx) => (
                      <motion.div key={itemIdx}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => selectPileItem(pileIdx, itemIdx)}
                        className="w-8 h-3 rounded-sm cursor-pointer transition-all"
                        style={{
                          background: selectedPile === pileIdx && itemIdx < selectedCount
                            ? pileColors[pileIdx]
                            : `${pileColors[pileIdx]}40`,
                          boxShadow: selectedPile === pileIdx && itemIdx < selectedCount
                            ? `0 0 10px ${pileColors[pileIdx]}80`
                            : 'none',
                          border: `1px solid ${pileColors[pileIdx]}60`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-white/30 text-xs font-mono">{count}</span>
                </div>
              ))}
            </div>
            {isPlayerTurn && selectedCount > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={confirmMove}
                className="px-6 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-300 font-mono text-sm">
                Remove {selectedCount} from Pile {(selectedPile ?? 0) + 1}
              </motion.button>
            )}
            <div className="text-white/20 font-mono text-xs">
              Nim-Sum: {calculateNimSum(piles)} | {calculateNimSum(piles) === 0 ? 'Losing' : 'Winning'} position
            </div>
          </motion.div>
        )}
        {gameState === 'gameover' && (
          <motion.div key="gameover" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6">
            <h2 className={`text-3xl font-bold ${message.includes('You') ? 'text-green-400' : 'text-red-400'}`}
              style={{ textShadow: `0 0 20px ${message.includes('You') ? '#00FF88' : '#FF006E'}` }}>
              {message}
            </h2>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={init}
              className="px-6 py-3 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-300 font-mono">
              PLAY AGAIN
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}