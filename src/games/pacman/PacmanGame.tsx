import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../../lib/audio/AudioManager';
import { useGameStore } from '../../stores/gameStore';

const COLS = 19, ROWS = 21, SZ = 16;
const W = COLS * SZ, H = ROWS * SZ;
const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,3,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,3,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
  [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
  [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,3,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,3,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

type Dir = [number, number];
const DIRS: Record<string, Dir> = {
  ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0],
  w:[0,-1], s:[0,1], a:[-1,0], d:[1,0]
};

interface Ghost { x:number; y:number; dir:Dir; color:string; scared:number; }

export default function PacmanGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'menu'|'playing'|'gameover'|'win'>('menu');
  const [score, setScore] = useState(0);
  const stateRef = useRef(state);
  const pacmanRef = useRef({x:9,y:15,dir:[1,0]as Dir,nextDir:[1,0]as Dir,mouth:0});
  const ghostsRef = useRef<Ghost[]>([]);
  const dotsRef = useRef<number[][]>([]);
  const loopRef = useRef(0);
  const lastRef = useRef(0);
  const tickRef = useRef(0);
  const scoreRef = useRef(0);
  const { audioEnabled, setHighScore } = useGameStore();

  const init = useCallback(() => {
    const dots = MAP.map(r => [...r]);
    dotsRef.current = dots;
    pacmanRef.current = {x:9,y:15,dir:[1,0],nextDir:[1,0],mouth:0};
    ghostsRef.current = [
      {x:9,y:9,dir:[0,-1],color:'#FF0000',scared:0},
      {x:8,y:9,dir:[1,0],color:'#FFB8FF',scared:0},
      {x:10,y:9,dir:[-1,0],color:'#00FFFF',scared:0},
      {x:9,y:10,dir:[0,1],color:'#FFB700',scared:0},
    ];
    scoreRef.current = 0;
    setScore(0);
    setState('playing');
    stateRef.current = 'playing';
    tickRef.current = 0;
    if (audioEnabled) audioManager.play('retro-start');
  }, [audioEnabled]);

  const canMove = useCallback((x:number, y:number) => {
    const c = ((x % COLS) + COLS) % COLS;
    return MAP[y]?.[c] !== 1;
  }, []);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    const dots = dotsRef.current;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = dots[r]?.[c];
        if (v === 1) {
          ctx.fillStyle = '#0000ff';
          ctx.fillRect(c*SZ+1, r*SZ+1, SZ-2, SZ-2);
          ctx.fillStyle = '#000080';
          ctx.fillRect(c*SZ+3, r*SZ+3, SZ-6, SZ-6);
        } else if (v === 0) {
          ctx.fillStyle = '#ffb700';
          ctx.beginPath();
          ctx.arc(c*SZ+SZ/2, r*SZ+SZ/2, 2, 0, Math.PI*2);
          ctx.fill();
        } else if (v === 3) {
          const p = Math.sin(Date.now()/200)*0.3+0.7;
          ctx.fillStyle = `rgba(255,184,0,${p})`;
          ctx.beginPath();
          ctx.arc(c*SZ+SZ/2, r*SZ+SZ/2, 5, 0, Math.PI*2);
          ctx.fill();
        }
      }
    }

    const pm = pacmanRef.current;
    const px = pm.x*SZ+SZ/2, py = pm.y*SZ+SZ/2;
    const angle = Math.atan2(pm.dir[1], pm.dir[0]);
    const mouth = Math.abs(Math.sin(pm.mouth)) * 0.4;
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, SZ/2-1, angle+mouth, angle+Math.PI*2-mouth);
    ctx.fill();
    ctx.shadowBlur = 0;

    for (const g of ghostsRef.current) {
      const gx = g.x*SZ+SZ/2, gy = g.y*SZ+SZ/2;
      ctx.fillStyle = g.scared > 0 ? '#2222ff' : g.color;
      ctx.beginPath();
      ctx.arc(gx, gy-2, SZ/2-1, Math.PI, 0);
      ctx.lineTo(gx+SZ/2-1, gy+SZ/2-1);
      ctx.lineTo(gx-SZ/2+1, gy+SZ/2-1);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(gx-3, gy-3, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(gx+3, gy-3, 3, 0, Math.PI*2); ctx.fill();
      if (g.scared <= 0) {
        ctx.fillStyle = '#00f';
        ctx.beginPath(); ctx.arc(gx-3+g.dir[0], gy-3+g.dir[1], 1.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(gx+3+g.dir[0], gy-3+g.dir[1], 1.5, 0, Math.PI*2); ctx.fill();
      }
    }
  }, []);

  const update = useCallback(() => {
    if (stateRef.current !== 'playing') return;
    const p = pacmanRef.current;
    p.mouth += 0.3;

    if (p.nextDir[0] !== 0 || p.nextDir[1] !== 0) {
      const nx = p.x + p.nextDir[0], ny = p.y + p.nextDir[1];
      if (canMove(nx, ny)) p.dir = [...p.nextDir] as Dir;
    }
    const nx = p.x + p.dir[0], ny = p.y + p.dir[1];
    if (canMove(nx, ny)) {
      p.x = ((nx % COLS) + COLS) % COLS;
      p.y = ny;
    }

    const d = dotsRef.current[p.y]?.[p.x];
    if (d === 0) {
      dotsRef.current[p.y][p.x] = 2;
      scoreRef.current += 10;
      setScore(scoreRef.current);
      if (audioEnabled) audioManager.play('retro-eat');
    }
    if (d === 3) {
      dotsRef.current[p.y][p.x] = 2;
      scoreRef.current += 50;
      setScore(scoreRef.current);
      if (audioEnabled) audioManager.play('power-up');
      ghostsRef.current.forEach(g => g.scared = 200);
    }

    if (!dotsRef.current.flat().includes(0) && !dotsRef.current.flat().includes(3)) {
      stateRef.current = 'win';
      setState('win');
      if (audioEnabled) audioManager.play('win');
      return;
    }

    for (const g of ghostsRef.current) {
      if (g.scared > 0) g.scared--;
      const dx = p.x - g.x, dy = p.y - g.y;
      const dirs: Dir[] = [[1,0],[-1,0],[0,1],[0,-1]];
      let choices = dirs.filter(([cx,cy]) => canMove(g.x+cx, g.y+cy));
      if (choices.length) {
        if (g.scared > 0) {
          const pick = choices[Math.floor(Math.random()*choices.length)];
          g.dir = pick;
        } else {
          choices.sort((a,b) => {
            const da = Math.abs(g.x+a[0]-p.x)+Math.abs(g.y+a[1]-p.y);
            const db = Math.abs(g.x+b[0]-p.x)+Math.abs(g.y+b[1]-p.y);
            return da - db;
          });
          g.dir = choices[0];
        }
        g.x = ((g.x+g.dir[0])%COLS+COLS)%COLS;
        g.y += g.dir[1];
      }

      if (g.x === p.x && g.y === p.y) {
        if (g.scared > 0) {
          g.x = 9; g.y = 9; g.scared = 0;
          scoreRef.current += 200;
          setScore(scoreRef.current);
          if (audioEnabled) audioManager.play('retro-coin');
        } else {
          stateRef.current = 'gameover';
          setState('gameover');
          setHighScore('pacman', scoreRef.current);
          if (audioEnabled) audioManager.play('retro-die');
          return;
        }
      }
    }
  }, [audioEnabled, canMove, setHighScore]);

  const gameLoop = useCallback((ts: number) => {
    if (!lastRef.current) lastRef.current = ts;
    const dt = ts - lastRef.current;
    lastRef.current = ts;
    tickRef.current += dt;
    if (tickRef.current >= 120) {
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
        pacmanRef.current.nextDir = d;
        e.preventDefault();
      }
      if ((e.key === ' ' || e.key === 'Enter') && stateRef.current !== 'playing') {
        init();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [init]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-[305px] px-2">
        <span className="text-yellow-400 font-mono text-sm">
          👻 SCORE: <span className="text-yellow-200 font-bold">{score}</span>
        </span>
      </div>
      <div className="relative rounded-xl overflow-hidden border-2 border-yellow-500/30 shadow-[0_0_30px_rgba(255,215,0,0.2)]">
        <canvas ref={canvasRef} width={W} height={H} className="block" />
        <AnimatePresence>
          {state === 'menu' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
              <h2 className="text-4xl font-bold text-yellow-400 mb-2" style={{textShadow:'0 0 20px #FFD700'}}>
                👻 PACMAN
              </h2>
              <p className="text-yellow-300/70 font-mono text-sm mb-6">Arrow Keys / WASD</p>
              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={init}
                className="px-6 py-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 font-mono">
                START
              </motion.button>
            </motion.div>
          )}
          {state === 'gameover' && (
            <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-red-400 mb-2" style={{textShadow:'0 0 20px #ff006e'}}>
                GAME OVER
              </h2>
              <p className="text-yellow-300 font-mono mb-4">Score: {score}</p>
              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={init}
                className="px-6 py-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 font-mono">
                PLAY AGAIN
              </motion.button>
            </motion.div>
          )}
          {state === 'win' && (
            <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-green-400 mb-2" style={{textShadow:'0 0 20px #00FF88'}}>
                🎉 YOU WIN!
              </h2>
              <p className="text-yellow-300 font-mono mb-4">Score: {score}</p>
              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={init}
                className="px-6 py-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 font-mono">
                PLAY AGAIN
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}