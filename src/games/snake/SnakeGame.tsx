import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../../lib/audio/AudioManager';
import { useGameStore } from '../../stores/gameStore';

const COLS = 20, ROWS = 20, SZ = 16;
const W = COLS * SZ, H = ROWS * SZ;

type Dir = [number, number];
type Pos = { x: number; y: number };

const DIRS: Record<string, Dir> = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
};

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const snakeRef = useRef<Pos[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Dir>([1, 0]);
  const nextDirRef = useRef<Dir>([1, 0]);
  const foodRef = useRef<Pos>({ x: 15, y: 10 });
  const loopRef = useRef(0);
  const lastRef = useRef(0);
  const tickRef = useRef(0);
  const stateRef = useRef(state);
  const scoreRef = useRef(0);
  const { audioEnabled, setHighScore } = useGameStore();

  const spawnFood = useCallback((snake: Pos[]) => {
    let pos: Pos;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const init = useCallback(() => {
    const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    snakeRef.current = snake;
    dirRef.current = [1, 0];
    nextDirRef.current = [1, 0];
    foodRef.current = spawnFood(snake);
    scoreRef.current = 0;
    setScore(0);
    setState('playing');
    stateRef.current = 'playing';
    tickRef.current = 0;
    if (audioEnabled) audioManager.play('retro-start');
  }, [audioEnabled, spawnFood]);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(0,255,0,0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * SZ, 0); ctx.lineTo(i * SZ, H); ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * SZ); ctx.lineTo(W, i * SZ); ctx.stroke();
    }

    // Snake
    const snake = snakeRef.current;
    for (let i = snake.length - 1; i >= 0; i--) {
      const s = snake[i];
      const t = i / snake.length;
      if (i === 0) {
        ctx.fillStyle = '#00FF88';
        ctx.shadowColor = '#00FF88';
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = `rgba(0,255,100,${0.3 + t * 0.7})`;
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(s.x * SZ + 1, s.y * SZ + 1, SZ - 2, SZ - 2);
      if (i === 0) ctx.shadowBlur = 0;
    }

    // Food
    const f = foodRef.current;
    const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255,0,110,${pulse})`;
    ctx.shadowColor = '#FF006E';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(f.x * SZ + SZ / 2, f.y * SZ + SZ / 2, SZ / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = '#00FF8820';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, W, H);
  }, []);

  const update = useCallback(() => {
    if (stateRef.current !== 'playing') return;
    const snake = snakeRef.current;
    const dir = nextDirRef.current;
    dirRef.current = dir;

    const head = { x: (snake[0].x + dir[0] + COLS) % COLS, y: (snake[0].y + dir[1] + ROWS) % ROWS };

    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      stateRef.current = 'gameover';
      setState('gameover');
      setHighScore('snake', scoreRef.current);
      if (audioEnabled) audioManager.play('retro-die');
      return;
    }

    snake.unshift(head);

    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      foodRef.current = spawnFood(snake);
      if (audioEnabled) audioManager.play('retro-eat');
    } else {
      snake.pop();
    }
  }, [audioEnabled, spawnFood, setHighScore]);

  const gameLoop = useCallback((ts: number) => {
    if (!lastRef.current) lastRef.current = ts;
    const dt = ts - lastRef.current;
    lastRef.current = ts;
    tickRef.current += dt;
    const speed = Math.max(60, 120 - scoreRef.current * 0.5);
    if (tickRef.current >= speed) {
      tickRef.current = 0;
      update();
    }
    draw();
    loopRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  useEffect(() => {
    loopRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(loopRef.current);
  }, [gameLoop]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const d = DIRS[e.key];
      if (d && stateRef.current === 'playing') {
        if (d[0] !== -dirRef.current[0] || d[1] !== -dirRef.current[1]) {
          nextDirRef.current = d;
        }
        e.preventDefault();
      }
      if ((e.key === ' ' || e.key === 'Enter') && stateRef.current !== 'playing') {
        init(); e.preventDefault();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [init]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-[320px] px-2">
        <span className="text-green-400 font-mono text-sm">🐍 SCORE: <span className="text-green-200 font-bold">{score}</span></span>
      </div>
      <div className="relative rounded-xl overflow-hidden border-2 border-green-500/30 shadow-[0_0_30px_rgba(0,255,100,0.15)]">
        <canvas ref={canvasRef} width={W} height={H} className="block" />
        <AnimatePresence>
          {state === 'menu' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
              <h2 className="text-4xl font-bold text-green-400 mb-2" style={{ textShadow: '0 0 20px #00FF88' }}>🐍 SNAKE</h2>
              <p className="text-green-300/70 font-mono text-sm mb-6">Arrow Keys / WASD</p>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={init}
                className="px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 font-mono">START</motion.button>
            </motion.div>
          )}
          {state === 'gameover' && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-red-400 mb-2" style={{ textShadow: '0 0 20px #ff006e' }}>GAME OVER</h2>
              <p className="text-green-300 font-mono mb-4">Score: {score}</p>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={init}
                className="px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 font-mono">PLAY AGAIN</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}