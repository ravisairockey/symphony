const fs = require('fs');
const path = require('path');

// Helper to write file ensuring proper newlines
function writeFile(filePath, content) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  const lines = content.split('\n').length;
  console.log(`${filePath}: ${lines} lines written`);
}

// ===== BLACKJACK =====
writeFile('src/games/blackjack/BlackjackGame.tsx', `import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../../lib/audio/AudioManager';
import { useGameStore } from '../../stores/gameStore';

type Suit = 'spade' | 'heart' | 'diamond' | 'club';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
interface Card { suit: Suit; rank: Rank; value: number }

const SUITS: Suit[] = ['spade','heart','diamond','club'];
const RANKS: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SYM: Record<Suit,string> = {spade:'\u2660',heart:'\u2665',diamond:'\u2666',club:'\u2663'};
const CLR: Record<Suit,string> = {spade:'#aaa',club:'#aaa',heart:'#ff006e',diamond:'#ff4500'};

function createDeck(): Card[] {
  const d: Card[] = [];
  for (const s of SUITS) for (const r of RANKS) {
    let v = parseInt(r as string);
    if (r==='A') v=11; else if (['J','Q','K'].includes(r)) v=10;
    d.push({suit:s,rank:r,value:v});
  }
  for (let i=d.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]; }
  return d;
}

function handVal(c: Card[]): number {
  let t=c.reduce((s,x)=>s+x.value,0), a=c.filter(x=>x.rank==='A').length;
  while(t>21&&a>0){t-=10;a--;} return t;
}
function isBJ(c: Card[]): boolean { return c.length===2&&handVal(c)===21; }

function CV({card,hidden}:{card:Card;hidden?:boolean}) {
  return (
    <motion.div initial={{rotateY:90,scale:0.8}} animate={{rotateY:0,scale:1}}
      className={\`w-14 h-20 rounded-lg border-2 flex flex-col items-center justify-center \${hidden?'bg-gradient-to-br from-red-900 to-red-800 border-red-700':'bg-gradient-to-br from-white/90 to-white/70 border-white/40'}\`}
      style={{boxShadow:hidden?'0 0 10px rgba(220,20,60,0.3)':'0 4px 15px rgba(0,0,0,0.3)'}}>
      {hidden?<div className="text-red-400/50 text-2xl">?</div>:(
        <><span className="text-xs font-bold" style={{color:CLR[card.suit]}}>{card.rank}</span>
        <span className="text-lg" style={{color:CLR[card.suit]}}>{SYM[card.suit]}</span></>
      )}
    </motion.div>
  );
}

export default function BlackjackGame() {
  const [state,setState]=useState<'betting'|'playing'|'result'>('betting');
  const [deck,setDeck]=useState<Card[]>(createDeck());
  const [playerHand,setPlayerHand]=useState<Card[]>([]);
  const [dealerHand,setDealerHand]=useState<Card[]>([]);
  const [balance,setBalance]=useState(1000);
  const [bet,setBet]=useState(100);
  const [message,setMessage]=useState('');
  const [dealerRevealed,setDealerRevealed]=useState(false);
  const {audioEnabled}=useGameStore();

  const deal=useCallback(()=>{
    let d=[...deck]; if(d.length<20) d=createDeck();
    setPlayerHand([d[0],d[2]]); setDealerHand([d[1],d[3]]);
    setDeck(d.slice(4)); setDealerRevealed(false);
    setState('playing'); setMessage('');
    if(audioEnabled) audioManager.play('card-flip');
  },[deck,audioEnabled]);

  const stand=useCallback(()=>{
    setDealerRevealed(true);
    let d=[...deck],dl=[...dealerHand];
    while(handVal(dl)<17){if(d.length<5)d=[...d,...createDeck()];dl.push(d[0]);d=d.slice(1);}
    setDeck(d);setDealerHand(dl);
    const pv=handVal(playerHand),dv=handVal(dl);
    const pBJ=isBJ(playerHand),dBJ=isBJ(dl);
    if(dBJ&&!pBJ){setMessage('Dealer Blackjack!');setBalance(b=>Math.max(0,b-bet));if(audioEnabled)audioManager.play('lose');}
    else if(pBJ&&!dBJ){setMessage('BLACKJACK!');setBalance(b=>b+Math.floor(bet*1.5));if(audioEnabled)audioManager.play('win');}
    else if(dv>21){setMessage('Dealer busts! You win!');setBalance(b=>b+bet);if(audioEnabled)audioManager.play('win');}
    else if(pv>dv){setMessage('You win!');setBalance(b=>b+bet);if(audioEnabled)audioManager.play('win');}
    else if(pv<dv){setMessage('Dealer wins');setBalance(b=>Math.max(0,b-bet));if(audioEnabled)audioManager.play('lose');}
    else{setMessage('Push!');}
    setState('result');
  },[deck,dealerHand,playerHand,bet,audioEnabled]);

  const hit=useCallback(()=>{
    let d=[...deck];if(d.length<5)d=[...d,...createDeck()];
    const card=d[0];d=d.slice(1);setDeck(d);
    const nh=[...playerHand,card];setPlayerHand(nh);
    if(audioEnabled)audioManager.play('card-flip');
    if(handVal(nh)>21){setMessage('BUST!');setState('result');setDealerRevealed(true);setBalance(b=>Math.max(0,b-bet));if(audioEnabled)audioManager.play('lose');}
    else if(handVal(nh)===21){stand();}
  },[deck,playerHand,bet,audioEnabled,stand]);

  const newRound=useCallback(()=>{
    if(balance<=0){setBalance(1000);setBet(100);}
    setBet(b=>Math.min(b,balance>0?balance:1000));
    setState('betting');setPlayerHand([]);setDealerHand([]);
  },[balance]);

  const pv=handVal(playerHand),dv=dealerRevealed?handVal(dealerHand):dealerHand[0]?.value||0;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <AnimatePresence mode="wait">
        {state==='betting'&&(
          <motion.div key="bet" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold text-red-500" style={{textShadow:'0 0 20px #DC143C'}}>BLACKJACK</h2>
            <p className="text-red-300/70 font-mono text-xs text-center">True Random - No Cheating</p>
            <div className="text-center"><span className="text-yellow-400 font-mono text-2xl font-bold">${'$'}{balance}</span></div>
            <div className="flex items-center gap-3">
              <span className="text-red-300 font-mono text-sm">Bet:</span>
              {[25,50,100,250,500].map(b=>(
                <button key={b} onClick={()=>setBet(Math.min(b,balance))} className={\`px-3 py-1.5 rounded font-mono text-xs border transition-all \${bet===Math.min(b,balance)?'bg-red-500/30 border-red-400 text-red-200':'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'}\`}>${'$'}{b}</button>
              ))}
            </div>
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={deal} disabled={bet>balance} className="px-8 py-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 font-mono disabled:opacity-30">DEAL</motion.button>
          </motion.div>
        )}
        {state==='playing'&&(
          <motion.div key="play" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center gap-4 w-full">
            <div className="flex justify-between w-full px-2">
              <span className="text-red-400 font-mono text-sm">${'$'}{balance}</span>
              <span className="text-yellow-400 font-mono text-sm">Bet: ${'$'}{bet}</span>
            </div>
            <div className="w-full bg-red-950/20 rounded-xl p-3 border border-red-500/10">
              <span className="text-red-400 font-mono text-xs">DEALER {dealerRevealed?dv:'?'}</span>
              <div className="flex gap-2 mt-2">{dealerHand.map((c,i)=><CV key={i} card={c} hidden={i===1&&!dealerRevealed}/>)}</div>
            </div>
            <div className="w-full bg-red-950/10 rounded-xl p-3 border border-red-500/10">
              <span className="text-green-400 font-mono text-xs">YOU {pv}</span>
              <div className="flex gap-2 mt-2">{playerHand.map((c,i)=><CV key={i} card={c}/>)}</div>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={hit} className="px-5 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 font-mono text-sm">HIT</motion.button>
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={stand} className="px-5 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 font-mono text-sm">STAND</motion.button>
            </div>
          </motion.div>
        )}
        {state==='result'&&(
          <motion.div key="result" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="flex flex-col items-center gap-4 w-full">
            <h2 className={\`text-2xl font-bold \${message.includes('win')||message.includes('BLACKJACK')?'text-green-400':message.includes('Push')?'text-yellow-400':'text-red-400'}\`}>{message}</h2>
            <div className="w-full bg-red-950/20 rounded-xl p-2 border border-red-500/10">
              <span className="text-red-400 font-mono text-xs">DEALER ({handVal(dealerHand)}):</span>
              <div className="flex gap-1 mt-1">{dealerHand.map((c,i)=><CV key={i} card={c}/>)}</div>
            </div>
            <div className="w-full bg-red-950/10 rounded-xl p-2 border border-red-500/10">
              <span className="text-green-400 font-mono text-xs">YOU ({handVal(playerHand)}):</span>
              <div className="flex gap-1 mt-1">{playerHand.map((c,i)=><CV key={i} card={c}/>)}</div>
            </div>
            <div className="text-center"><span className="text-yellow-400 font-mono text-xl font-bold">${'$'}{balance}</span></div>
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={newRound} className="px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 font-mono">NEW HAND</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
`);

// ===== FROGGER =====
writeFile('src/games/frogger/FroggerGame.tsx', `import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../../lib/audio/AudioManager';
import { useGameStore } from '../../stores/gameStore';

const W=320,H=400,SZ=20,COLS=W/SZ,ROWS=20;

export default function FroggerGame() {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [state,setState]=useState<'menu'|'playing'|'gameover'|'win'>('menu');
  const [score,setScore]=useState(0);
  const [lives,setLives]=useState(3);
  const frogRef=useRef({x:7,y:ROWS-1});
  const stateRef=useRef(state);
  const scoreRef=useRef(0);
  const livesRef=useRef(3);
  const goalsRef=useRef([false,false,false,false,false]);
  const loopRef=useRef(0);
  const {audioEnabled,setHighScore}=useGameStore();

  const lanesRef=useRef([
    {objs:[0,4,8],speed:0.8,dir:1,type:'goal'},
    {objs:[2,6,10],speed:1.0,dir:-1,type:'log'},
    {objs:[1,5,9],speed:0.6,dir:1,type:'log'},
    {objs:[0,4,8,12],speed:1.2,dir:-1,type:'turtle'},
    {objs:[3,9],speed:0.5,dir:1,type:'log'},
    {objs:[],speed:0,dir:0,type:'safe'},
    {objs:[1,5,9,13],speed:1.5,dir:-1,type:'car'},
    {objs:[0,6,12],speed:1.0,dir:1,type:'truck'},
    {objs:[2,7,12],speed:2.0,dir:-1,type:'car'},
    {objs:[1,5,10],speed:0.8,dir:1,type:'car'},
    {objs:[],speed:0,dir:0,type:'safe'},
  ]);

  const init=useCallback(()=>{
    frogRef.current={x:7,y:ROWS-1};
    goalsRef.current=[false,false,false,false,false];
    scoreRef.current=0;livesRef.current=3;
    setScore(0);setLives(3);setState('playing');stateRef.current='playing';
    if(audioEnabled)audioManager.play('retro-start');
  },[audioEnabled]);

  const draw=useCallback(()=>{
    const ctx=canvasRef.current?.getContext('2d');if(!ctx)return;
    ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,W,H);
    const lanes=lanesRef.current;
    const carColors=['#FF006E','#FFB700','#00F5FF','#9D4EDD'];
    for(let r=0;r<lanes.length;r++){
      const lane=lanes[r];const y=r*SZ;
      if(lane.type==='safe'){ctx.fillStyle='#1a1a2e';ctx.fillRect(0,y,W,SZ);continue;}
      if(lane.type==='goal'){
        ctx.fillStyle='#0a2a0a';ctx.fillRect(0,y,W,SZ);
        for(let g=0;g<5;g++){
          const gx=(g*3+1)*SZ;
          ctx.fillStyle=goalsRef.current[g]?'#00FF88':'#003300';
          ctx.fillRect(gx,y+2,SZ*1.5,SZ-4);
        }
        continue;
      }
      const isWater=lane.type==='log'||lane.type==='turtle';
      ctx.fillStyle=isWater?'#001a33':'#1a1a1a';
      ctx.fillRect(0,y,W,SZ);
      if(!isWater){ctx.strokeStyle='#333';ctx.lineWidth=0.5;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(0,y+SZ/2);ctx.lineTo(W,y+SZ/2);ctx.stroke();ctx.setLineDash([]);}
      for(let oi=0;oi<lane.objs.length;oi++){
        const ox=lane.objs[oi];
        const x=((ox*SZ+(Date.now()*lane.speed*lane.dir*0.02))%(W+SZ*4))-SZ*2;
        const vw=lane.type==='truck'?SZ*2:lane.type==='log'?SZ*2.5:lane.type==='turtle'?SZ*2:SZ*1.2;
        if(lane.type==='log'){ctx.fillStyle='#8B4513';ctx.fillRect(x,y+2,vw,SZ-4);}
        else if(lane.type==='turtle'){ctx.fillStyle='#2E8B57';ctx.beginPath();ctx.arc(x+SZ,y+SZ/2,SZ/2-2,0,Math.PI*2);ctx.fill();}
        else{ctx.fillStyle=carColors[oi%carColors.length];ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=4;ctx.fillRect(x,y+3,vw,SZ-6);ctx.shadowBlur=0;}
      }
    }
    const f=frogRef.current;
    ctx.fillStyle='#00FF88';ctx.shadowColor='#00FF88';ctx.shadowBlur=12;
    ctx.font=(SZ-4)+'px serif';ctx.textAlign='center';
    ctx.fillText('\uD83D\uDC38',f.x*SZ+SZ/2,f.y*SZ+SZ-2);ctx.shadowBlur=0;
  },[]);

  const update=useCallback(()=>{
    if(stateRef.current!=='playing')return;
    const f=frogRef.current;const lanes=lanesRef.current;
    const li=ROWS-1-f.y;if(li<0||li>=lanes.length)return;
    const lane=lanes[li];
    if(lane.type==='car'||lane.type==='truck'){
      for(const ox of lane.objs){
        const vx=((ox*SZ+(Date.now()*lane.speed*lane.dir*0.02))%(W+SZ*4))-SZ*2;
        const vw=lane.type==='truck'?SZ*2:SZ*1.2;
        if(f.x*SZ+SZ>vx&&f.x*SZ<vx+vw){
          livesRef.current--;setLives(livesRef.current);
          if(audioEnabled)audioManager.play('collision');
          if(livesRef.current<=0){stateRef.current='gameover';setState('gameover');setHighScore('frogger',scoreRef.current);if(audioEnabled)audioManager.play('game-over');}
          else{frogRef.current={x:7,y:ROWS-1};}
          return;
        }
      }
    }
    if(lane.type==='log'||lane.type==='turtle'){
      let onPlat=false;
      for(const ox of lane.objs){
        const vx=((ox*SZ+(Date.now()*lane.speed*lane.dir*0.02))%(W+SZ*4))-SZ*2;
        const vw=lane.type==='log'?SZ*2.5:SZ*2;
        if(f.x*SZ+SZ>vx&&f.x*SZ<vx+vw){onPlat=true;break;}
      }
      if(!onPlat){
        livesRef.current--;setLives(livesRef.current);
        if(audioEnabled)audioManager.play('splash');
        if(livesRef.current<=0){stateRef.current='gameover';setState('gameover');setHighScore('frogger',scoreRef.current);if(audioEnabled)audioManager.play('game-over');}
        else{frogRef.current={x:7,y:ROWS-1};}
      }
    }
  },[audioEnabled,setHighScore]);

  const gameLoop=useCallback((ts:number)=>{
    update();draw();loopRef.current=requestAnimationFrame(gameLoop);
  },[update,draw]);

  useEffect(()=>{loopRef.current=requestAnimationFrame(gameLoop);return()=>cancelAnimationFrame(loopRef.current);},[gameLoop]);

  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      if(stateRef.current!=='playing'){if(e.key===' '||e.key==='Enter'){init();e.preventDefault();}return;}
      const f=frogRef.current;
      if(e.key==='ArrowUp'||e.key==='w'){f.y=Math.max(0,f.y-1);scoreRef.current+=10;setScore(scoreRef.current);if(audioEnabled)audioManager.play('jump');
        if(f.y===0){const gi=Math.floor(f.x/3);if(gi>=0&&gi<5&&!goalsRef.current[gi]){goalsRef.current[gi]=true;scoreRef.current+=200;setScore(scoreRef.current);if(audioEnabled)audioManager.play('score-up');if(goalsRef.current.every(g=>g)){stateRef.current='win';setState('win');if(audioEnabled)audioManager.play('win');}else{frogRef.current={x:7,y:ROWS-1};}}else{frogRef.current={x:7,y:ROWS-1};}}}
      if(e.key==='ArrowDown'||e.key==='s')f.y=Math.min(ROWS-1,f.y+1);
      if(e.key==='ArrowLeft'||e.key==='a')f.x=Math.max(0,f.x-1);
      if(e.key==='ArrowRight'||e.key==='d')f.x=Math.min(COLS-1,f.x+1);
      e.preventDefault();
    };
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);
  },[init,audioEnabled]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-[320px] px-2">
        <span className="text-green-400 font-mono text-sm">SCORE: <span className="text-green-200 font-bold">{score}</span></span>
        <span className="text-green-500/50 font-mono text-xs">{lives} lives</span>
      </div>
      <div className="relative rounded-xl overflow-hidden border-2 border-green-500/30 shadow-[0_0_30px_rgba(0,255,100,0.15)]">
        <canvas ref={canvasRef} width={W} height={H} className="block"/>
        <AnimatePresence>
          {state==='menu'&&(
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
              <h2 className="text-4xl font-bold text-green-400 mb-2" style={{textShadow:'0 0 20px #00FF88'}}>FROGGER</h2>
              <p className="text-green-300/70 font-mono text-sm mb-6">Arrow Keys / WASD</p>
              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={init} className="px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 font-mono">START</motion.button>
            </motion.div>
          )}
          {(state==='gameover'||state==='win')&&(
            <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
              <h2 className={\`text-3xl font-bold mb-2 \${state==='win'?'text-green-400':'text-red-400'}\`} style={{textShadow:'0 0 20px '+(state==='win'?'#00FF88':'#ff006e')}}>{state==='win'?'YOU WIN!':'GAME OVER'}</h2>
              <p className="text-green-300 font-mono mb-4">Score: {score}</p>
              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={init} className="px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 font-mono">PLAY AGAIN</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
`);

// ===== TOWER OF HANOI =====
writeFile('src/games/tower-of-hanoi/TowerOfHanoiGame.tsx', `import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../../lib/audio/AudioManager';
import { useGameStore } from '../../stores/gameStore';

interface Tower { disks: number[] }

export default function TowerOfHanoiGame() {
  const [towers,setTowers]=useState<Tower[]>([{disks:[5,4,3,2,1]},{disks:[]},{disks:[]}]);
  const [selected,setSelected]=useState<number|null>(null);
  const [moves,setMoves]=useState(0);
  const [state,setState]=useState<'menu'|'playing'|'win'>('menu');
  const [numDisks,setNumDisks]=useState(5);
  const {audioEnabled,setHighScore}=useGameStore();
  const minMoves=Math.pow(2,numDisks)-1;

  const init=useCallback(()=>{
    const start=Array.from({length:numDisks},(_,i)=>numDisks-i);
    setTowers([{disks:start},{disks:[]},{disks:[]}]);
    setSelected(null);setMoves(0);setState('playing');
    if(audioEnabled)audioManager.play('game-start');
  },[numDisks,audioEnabled]);

  const selectTower=useCallback((idx:number)=>{
    if(state!=='playing')return;
    if(selected===null){if(towers[idx].disks.length>0){setSelected(idx);if(audioEnabled)audioManager.play('menu-click');}return;}
    if(selected===idx){setSelected(null);return;}
    const nt=towers.map(t=>({...t,disks:[...t.disks]}));
    const from=nt[selected].disks,to=nt[idx].disks;
    const disk=from[from.length-1];
    if(to.length===0||to[to.length-1]>disk){
      from.pop();to.push(disk);setTowers(nt);setMoves(m=>m+1);setSelected(null);
      if(audioEnabled)audioManager.play('chip-drop');
      if(idx===2&&nt[2].disks.length===numDisks){setState('win');if(audioEnabled)audioManager.play('win');}
    }else{setSelected(null);if(audioEnabled)audioManager.play('collision');}
  },[selected,towers,state,numDisks,audioEnabled]);

  const names=['A','B','C'];
  const colors=['#FF006E','#FF4500','#FFB700','#00FF88','#00F5FF','#9D4EDD','#FF69B4'];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg">
      <AnimatePresence mode="wait">
        {state==='menu'&&(
          <motion.div key="menu" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center gap-6">
            <h2 className="text-4xl font-bold text-yellow-400" style={{textShadow:'0 0 20px #FFB700'}}>TOWER OF HANOI</h2>
            <p className="text-yellow-300/70 font-mono text-sm text-center">Move all disks from Tower A to Tower C.<br/>A larger disk cannot be placed on a smaller one.</p>
            <div className="flex items-center gap-3">
              <span className="text-yellow-300 font-mono text-sm">Disks:</span>
              {[3,4,5,6,7].map(n=>(
                <button key={n} onClick={()=>setNumDisks(n)} className={\`w-8 h-8 rounded font-mono text-sm border transition-all \${numDisks===n?'bg-yellow-500/30 border-yellow-400 text-yellow-200':'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'}\`}>{n}</button>
              ))}
            </div>
            <p className="text-yellow-400/50 font-mono text-xs">Minimum moves: {minMoves}</p>
            <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={init} className="px-6 py-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 font-mono">START</motion.button>
          </motion.div>
        )}
        {state==='playing'&&(
          <motion.div key="playing" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center gap-4 w-full">
            <div className="flex justify-between w-full px-2">
              <span className="text-yellow-400 font-mono text-sm">Moves: <span className="text-yellow-200 font-bold">{moves}</span></span>
              <span className="text-yellow-500/50 font-mono text-xs">Min: {minMoves}</span>
            </div>
            <div className="flex gap-4 justify-center w-full">
              {towers.map((tower,tIdx)=>(
                <motion.div key={tIdx} whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={()=>selectTower(tIdx)} className="flex flex-col items-center cursor-pointer flex-1">
                  <div className={\`w-full h-48 flex flex-col-reverse items-center gap-1 p-2 rounded-xl transition-all \${selected===tIdx?'bg-yellow-500/10 border-2 border-yellow-500/30':'bg-white/[0.02] border border-white/[0.05]'}\`}>
                    {tower.disks.map((disk)=>(
                      <motion.div key={disk} layout initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="relative z-10 rounded-lg"
                        style={{width:disk*12+20+'px',height:'20px',background:'linear-gradient(135deg,'+colors[disk-1]+','+colors[disk-1]+'88)',boxShadow:'0 2px 8px '+colors[disk-1]+'40',border:'1px solid '+colors[disk-1]+'60'}}/>
                    ))}
                  </div>
                  <span className="text-yellow-400/70 font-mono text-xs mt-1">Tower {names[tIdx]}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-yellow-400/40 font-mono text-xs">Click a tower to pick up the top disk, then click another to place it</p>
          </motion.div>
        )}
        {state==='win'&&(
          <motion.div key="win" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold text-green-400" style={{textShadow:'0 0 20px #00FF88'}}>YOU WIN!</h2>
            <p className="text-yellow-300 font-mono">Moves: {moves} (Min: {minMoves})</p>
            {moves===minMoves&&<p className="text-green-400 font-mono text-sm">Perfect! Optimal solution!</p>}
            <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={init} className="px-6 py-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 font-mono">PLAY AGAIN</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
`);

console.log('All 3 files written successfully!');