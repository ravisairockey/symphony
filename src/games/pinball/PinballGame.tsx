import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Matter from 'matter-js';
import { audioManager } from '../../lib/audio/AudioManager';
import { useGameStore } from '../../stores/gameStore';

const W = 300, H = 500;

export default function PinballGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'menu'|'playing'|'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState(3);
  const engineRef = useRef<Matter.Engine | null>(null);
  const ballRef = useRef<Matter.Body | null>(null);
  const flipLRef = useRef<Matter.Body | null>(null);
  const flipRRef = useRef<Matter.Body | null>(null);
  const bumpersRef = useRef<Matter.Body[]>([]);
  const scoreRef = useRef(0);
  const ballsRef = useRef(3);
  const launchRef = useRef(false);
  const particlesRef = useRef<Array<{x:number;y:number;vx:number;vy:number;life:number;color:string}>>([]);
  const { audioEnabled, setHighScore } = useGameStore();

  const init = useCallback(() => {
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1 } });
    engineRef.current = engine;

    const walls = [
      Matter.Bodies.rectangle(W/2, H+10, W+40, 20, { isStatic: true, label: 'bottom' }),
      Matter.Bodies.rectangle(-10, H/2, 20, H, { isStatic: true, label: 'wall' }),
      Matter.Bodies.rectangle(W+10, H/2, 20, H, { isStatic: true, label: 'wall' }),
      Matter.Bodies.rectangle(W/2, -10, W+40, 20, { isStatic: true, label: 'wall' }),
    ];

    const bumperPos = [
      { x: 100, y: 150, r: 20 },
      { x: 200, y: 150, r: 20 },
      { x: 150, y: 220, r: 20 },
      { x: 80, y: 280, r: 15 },
      { x: 220, y: 280, r: 15 },
    ];
    const bumpers = bumperPos.map(bp =>
      Matter.Bodies.circle(bp.x, bp.y, bp.r, {
        isStatic: true, restitution: 1.2, label: 'bumper'
      })
    );
    bumpersRef.current = bumpers;

    const flipL = Matter.Bodies.rectangle(100, 440, 70, 10, {
      isStatic: true, angle: 0.4, label: 'flipperL', chamfer: { radius: 5 }
    });
    const flipR = Matter.Bodies.rectangle(200, 440, 70, 10, {
      isStatic: true, angle: -0.4, label: 'flipperR', chamfer: { radius: 5 }
    });
    flipLRef.current = flipL;
    flipRRef.current = flipR;

    const guides = [
      Matter.Bodies.rectangle(40, 420, 80, 10, { isStatic: true, angle: 0.6, label: 'wall' }),
      Matter.Bodies.rectangle(260, 420, 80, 10, { isStatic: true, angle: -0.6, label: 'wall' }),
    ];

    Matter.Composite.add(engine.world, [...walls, ...bumpers, flipL, flipR, ...guides]);

    Matter.Events.on(engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        if (pair.bodyA.label === 'bumper' || pair.bodyB.label === 'bumper') {
          scoreRef.current += 100;
          setScore(scoreRef.current);
          if (audioEnabled) audioManager.play('bounce');
          const bx = (pair.bodyA.position.x + pair.bodyB.position.x) / 2;
          const by = (pair.bodyA.position.y + pair.bodyB.position.y) / 2;
          for (let i = 0; i < 6; i++) {
            particlesRef.current.push({
              x: bx, y: by,
              vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5,
              life: 1,
              color: ['#ff006e','#00f5ff','#ffb700','#9d4edd'][Math.floor(Math.random()*4)]
            });
          }
        }
        if (pair.bodyA.label === 'bottom' || pair.bodyB.label === 'bottom') {
          if (pair.bodyA.label === 'ball' || pair.bodyB.label === 'ball') {
            ballsRef.current--;
            setBalls(ballsRef.current);
            if (audioEnabled) audioManager.play('collision');
            if (ballsRef.current <= 0) {
              setState('gameover');
              setHighScore('pinball', scoreRef.current);
              if (audioEnabled) audioManager.play('game-over');
            } else {
              launchBall();
            }
          }
        }
      }
    });

    scoreRef.current = 0;
    ballsRef.current = 3;
    setScore(0);
    setBalls(3);
    setState('playing');
    launchBall();
    if (audioEnabled) audioManager.play('game-start');
  }, [audioEnabled, setHighScore]);

  const launchBall = useCallback(() => {
    if (!engineRef.current) return;
    if (ballRef.current) Matter.Composite.remove(engineRef.current.world, ballRef.current);
    const ball = Matter.Bodies.circle(W - 25, H - 60, 8, {
      restitution: 0.6, density: 0.001, label: 'ball'
    });
    ballRef.current = ball;
    Matter.Composite.add(engineRef.current.world, ball);
    launchRef.current = false;
  }, []);

  useEffect(() => {
    if (state !== 'playing' || !engineRef.current) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'ArrowLeft') {
        if (flipLRef.current) { Matter.Body.setAngle(flipLRef.current, -0.5); if (audioEnabled) audioManager.play('bounce'); }
      }
      if (e.key === 'd' || e.key === 'ArrowRight') {
        if (flipRRef.current) { Matter.Body.setAngle(flipRRef.current, 0.5); if (audioEnabled) audioManager.play('bounce'); }
      }
      if (e.key === ' ') {
        if (!launchRef.current && ballRef.current) {
          Matter.Body.setVelocity(ballRef.current, { x: 0, y: -15 });
          launchRef.current = true;
          if (audioEnabled) audioManager.play('jump');
        }
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.key === 'a' || e.key === 'ArrowLeft') && flipLRef.current) Matter.Body.setAngle(flipLRef.current, 0.4);
      if ((e.key === 'd' || e.key === 'ArrowRight') && flipRRef.current) Matter.Body.setAngle(flipRRef.current, -0.4);
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKeyUp); };
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

      // Bumpers
      for (const b of bumpersRef.current) {
        const glow = Math.sin(Date.now()/300 + b.position.x) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(b.position.x, b.position.y, 20, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,0,110,${glow*0.3})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(b.position.x, b.position.y, 15, 0, Math.PI*2);
        const grad = ctx.createRadialGradient(b.position.x, b.position.y, 0, b.position.x, b.position.y, 15);
        grad.addColorStop(0, '#ff4d9a');
        grad.addColorStop(1, '#ff006e');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#ff80aa';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Flippers
      for (const fRef of [flipLRef, flipRRef]) {
        const f = fRef.current;
        if (!f) continue;
        ctx.save();
        ctx.translate(f.position.x, f.position.y);
        ctx.rotate(f.angle);
        ctx.fillStyle = '#00f5ff';
        ctx.shadowColor = '#00f5ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(-35, -5, 70, 10, 5);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Ball
      if (ballRef.current) {
        const b = ballRef.current;
        ctx.beginPath();
        ctx.arc(b.position.x, b.position.y, 8, 0, Math.PI*2);
        const bGrad = ctx.createRadialGradient(b.position.x-2, b.position.y-2, 0, b.position.x, b.position.y, 8);
        bGrad.addColorStop(0, '#fff');
        bGrad.addColorStop(1, '#ccc');
        ctx.fillStyle = bGrad;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
        // Trail
        ctx.beginPath();
        ctx.arc(b.position.x - b.velocity.x*2, b.position.y - b.velocity.y*2, 4, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fill();
      }

      // Particles
      particlesRef.current = particlesRef.current
        .map(p => ({ ...p, x: p.x+p.vx, y: p.y+p.vy, life: p.life-0.02 }))
        .filter(p => p.life > 0);
      for (const p of particlesRef.current) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2*p.life, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!launchRef.current && ballRef.current) {
        ctx.fillStyle = 'rgba(255,183,0,0.5)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SPACE TO LAUNCH', W/2, H-10);
      }

      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [state]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-[300px] px-2">
        <span className="text-orange-400 font-mono text-sm">
          ⚡ SCORE: <span className="text-orange-200 font-bold">{score}</span>
        </span>
        <span className="text-orange-500/50 font-mono text-xs">🏀 {balls}</span>
      </div>
      <div className="relative rounded-xl overflow-hidden border-2 border-orange-500/30 shadow-[0_0_30px_rgba(255,69,0,0.2)]">
        <canvas ref={canvasRef} width={W} height={H} className="block" />
        <AnimatePresence>
          {state === 'menu' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <h2 className="text-4xl font-bold text-orange-400 mb-2" style={{ textShadow: '0 0 20px #FF4500' }}>
                ⚡ PINBALL
              </h2>
              <p className="text-orange-300/70 font-mono text-xs mb-2">A/D = Flippers | SPACE = Launch</p>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={init}
                className="px-6 py-3 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-300 font-mono"
              >
                START
              </motion.button>
            </motion.div>
          )}
          {state === 'gameover' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <h2 className="text-3xl font-bold text-red-400 mb-2" style={{ textShadow: '0 0 20px #ff006e' }}>
                GAME OVER
              </h2>
              <p className="text-orange-300 font-mono mb-1">Score: {score}</p>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={init}
                className="px-6 py-3 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-300 font-mono mt-4"
              >
                PLAY AGAIN
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}