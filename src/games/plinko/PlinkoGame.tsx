import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Matter from 'matter-js';
import { audioManager } from '../../lib/audio/AudioManager';
import { useGameStore } from '../../stores/gameStore';

const W = 350, H = 500;
const MULTIPLIERS = [100, 50, 25, 10, 5, 3, 1, 0.5, 0.5, 1, 3, 5, 10, 25, 50, 100];
const MULT_COLORS = ['#FF006E','#FF4500','#FFB700','#FFB700','#00FF88','#00F5FF','#9D4EDD','#666','#666','#9D4EDD','#00F5FF','#00FF88','#FFB700','#FFB700','#FF4500','#FF006E'];

export default function PlinkoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'menu'|'playing'>('menu');
  const [score, setScore] = useState(0);
  const [dropCount, setDropCount] = useState(0);
  const engineRef = useRef<Matter.Engine | null>(null);
  const ballsRef = useRef<Matter.Body[]>([]);
  const pegsRef = useRef<Matter.Body[]>([]);
  const scoreRef = useRef(0);
  const particlesRef = useRef<Array<{x:number;y:number;vx:number;vy:number;life:number;color:string}>>([]);
  const { audioEnabled, setHighScore } = useGameStore();
  const ROWS = 12;

  const init = useCallback(() => {
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0.8 } });
    engineRef.current = engine;
    const walls = [
      Matter.Bodies.rectangle(W/2, -10, W, 20, { isStatic: true, label: 'wall' }),
      Matter.Bodies.rectangle(-10, H/2, 20, H*2, { isStatic: true, label: 'wall' }),
      Matter.Bodies.rectangle(W+10, H/2, 20, H*2, { isStatic: true, label: 'wall' }),
    ];
    const pegs: Matter.Body[] = [];
    const startY = 80;
    const pegSpacing = 30;
    for (let row = 0; row < ROWS; row++) {
      const cols = row + 3;
      const rowWidth = (cols - 1) * 28;
      const startX = (W - rowWidth) / 2;
      for (let col = 0; col < cols; col++) {
        const x = startX + col * 28;
        const y = startY + row * pegSpacing;
        const shapeType = (row + col) % 3;
        let peg;
        if (shapeType === 0) {
          peg = Matter.Bodies.circle(x, y, 5, { isStatic: true, restitution: 0.8, label: 'peg-circle', friction: 0 });
        } else if (shapeType === 1) {
          peg = Matter.Bodies.circle(x, y, 6, { isStatic: true, restitution: 0.6, label: 'peg-hex', friction: 0 });
        } else {
          peg = Matter.Bodies.circle(x, y, 4, { isStatic: true, restitution: 1.0, label: 'peg-diamond', friction: 0 });
        }
        pegs.push(peg);
      }
    }
    pegsRef.current = pegs;
    const dividers: Matter.Body[] = [];
    const divCount = MULTIPLIERS.length;
    const divSpacing = W / divCount;
    for (let i = 0; i <= divCount; i++) {
      dividers.push(Matter.Bodies.rectangle(i * divSpacing, H - 30, 3, 50, { isStatic: true, label: 'divider' }));
    }
    const floor = Matter.Bodies.rectangle(W/2, H + 10, W + 40, 20, { isStatic: true, label: 'floor' });
    Matter.Composite.add(engine.world, [...walls, ...pegs, ...dividers, floor]);
    Matter.Events.on(engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const ball = pair.bodyA.label === 'ball' ? pair.bodyA : pair.bodyB.label === 'ball' ? pair.bodyB : null;
        const other = ball === pair.bodyA ? pair.bodyB : pair.bodyA;
        if (ball && other) {
          if (['peg-circle','peg-hex','peg-diamond'].includes(other.label)) {
            if (audioEnabled) audioManager.play('bounce');
            for (let i = 0; i < 3; i++) {
              particlesRef.current.push({
                x: ball.position.x, y: ball.position.y,
                vx: (Math.random()-0.5)*3, vy: (Math.random()-0.5)*3,
                life: 0.8,
                color: other.label === 'peg-circle' ? '#00F5FF' : other.label === 'peg-hex' ? '#9D4EDD' : '#FFB700'
              });
            }
          }
        }
      }
    });
    scoreRef.current = 0;
    setScore(0);
    setDropCount(0);
    setState('playing');
    ballsRef.current = [];
    if (audioEnabled) audioManager.play('game-start');
  }, [audioEnabled]);

  const dropBall = useCallback((x: number) => {
    if (!engineRef.current) return;
    const ball = Matter.Bodies.circle(x, 30, 6, { restitution: 0.5, density: 0.002, label: 'ball', friction: 0 });
    Matter.Composite.add(engineRef.current.world, ball);
    ballsRef.current.push(ball);
    setDropCount(c => c + 1);
    if (audioEnabled) audioManager.play('chip-drop');
  }, [audioEnabled]);

  useEffect(() => {
    if (state !== 'playing' || !engineRef.current) return;
    const interval = setInterval(() => {
      const toRemove: Matter.Body[] = [];
      for (const ball of ballsRef.current) {
        if (ball.position.y > H - 60) {
          const bi = Math.min(MULTIPLIERS.length - 1, Math.max(0, Math.floor(ball.position.x / (W / MULTIPLIERS.length))));
          const mult = MULTIPLIERS[bi];
          scoreRef.current += mult;
          setScore(scoreRef.current);
          toRemove.push(ball);
          if (mult >= 25) {
            for (let i = 0; i < 15; i++) {
              particlesRef.current.push({
                x: ball.position.x, y: ball.position.y,
                vx: (Math.random()-0.5)*8, vy: -Math.random()*5,
                life: 1.5, color: MULT_COLORS[bi]
              });
            }
          }
          if (audioEnabled) {
            if (mult >= 25) audioManager.play('win');
            else if (mult >= 5) audioManager.play('score-up');
            else audioManager.play('coin');
          }
        }
      }
      for (const b of toRemove) {
        if (engineRef.current) Matter.Composite.remove(engineRef.current.world, b);
        ballsRef.current = ballsRef.current.filter(br => br !== b);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [state, audioEnabled]);

  useEffect(() => {
    if (state !== 'playing') return;
    let animId = 0;
    const render = () => {
      if (!engineRef.current) return;
      Matter.Engine.update(engineRef.current, 1000 / 60);
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, W, H);
      const zoneW = W / MULTIPLIERS.length;
      for (let i = 0; i < MULTIPLIERS.length; i++) {
        ctx.fillStyle = `${MULT_COLORS[i]}15`;
        ctx.fillRect(i * zoneW, H - 55, zoneW, 55);
        ctx.fillStyle = MULT_COLORS[i];
        ctx.font = `${MULTIPLIERS[i] >= 25 ? 'bold ' : ''}9px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`${MULTIPLIERS[i]}x`, i * zoneW + zoneW / 2, H - 8);
      }
      for (const peg of pegsRef.current) {
        const glow = Math.sin(Date.now() / 400 + peg.position.x * 0.1) * 0.2 + 0.8;
        if (peg.label === 'peg-circle') {
          ctx.beginPath();
          ctx.arc(peg.position.x, peg.position.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,245,255,${glow})`;
          ctx.fill();
          ctx.strokeStyle = '#00F5FF';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (peg.label === 'peg-hex') {
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const angle = (a / 6) * Math.PI * 2 - Math.PI / 6;
            const hx = peg.position.x + 6 * Math.cos(angle);
            const hy = peg.position.y + 6 * Math.sin(angle);
            if (a === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.fillStyle = `rgba(157,78,221,${glow})`;
          ctx.fill();
          ctx.strokeStyle = '#9D4EDD';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(peg.position.x, peg.position.y - 5);
          ctx.lineTo(peg.position.x + 4, peg.position.y);
          ctx.lineTo(peg.position.x, peg.position.y + 5);
          ctx.lineTo(peg.position.x - 4, peg.position.y);
          ctx.closePath();
          ctx.fillStyle = `rgba(255,183,0,${glow})`;
          ctx.fill();
          ctx.strokeStyle = '#FFB700';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      for (const ball of ballsRef.current) {
        ctx.beginPath();
        ctx.arc(ball.position.x, ball.position.y, 6, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(ball.position.x - 1, ball.position.y - 1, 0, ball.position.x, ball.position.y, 6);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(1, '#00BFFF');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#00BFFF';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      particlesRef.current = particlesRef.current.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.02 })).filter(p => p.life > 0);
      for (const p of particlesRef.current) {
        ctx.globalAlpha = Math.min(1, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(0,191,255,0.4)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Click to drop ball', W / 2, 20);
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [state]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state !== 'playing') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * W;
    dropBall(Math.max(20, Math.min(W - 20, x)));
  }, [state, dropBall]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-[350px] px-2">
        <span className="text-blue-400 font-mono text-sm">🎱 SCORE: <span className="text-blue-200 font-bold">{score}</span></span>
        <span className="text-blue-500/50 font-mono text-xs">Drops: {dropCount}</span>
      </div>
      <div className="relative rounded-xl overflow-hidden border-2 border-blue-500/30 shadow-[0_0_30px_rgba(0,191,255,0.2)]">
        <canvas ref={canvasRef} width={W} height={H} className="block cursor-pointer" onClick={handleCanvasClick} />
        <AnimatePresence>
          {state === 'menu' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
              <h2 className="text-4xl font-bold text-blue-400 mb-2" style={{ textShadow: '0 0 20px #00BFFF' }}>🎱 PLINKO</h2>
              <p className="text-blue-300/70 font-mono text-sm mb-2">Click to drop balls</p>
              <p className="text-blue-400/50 font-mono text-xs mb-6">● Circles ⬡ Hexagons ◆ Diamonds</p>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={init}
                className="px-6 py-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 font-mono">
                START
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button onClick={() => { setHighScore('plinko', scoreRef.current); setState('menu'); }}
        className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 font-mono text-xs hover:bg-blue-500/20">
        END GAME
      </button>
    </div>
  );
}