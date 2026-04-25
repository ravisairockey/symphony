import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../../lib/audio/AudioManager';
import { useGameStore } from '../../stores/gameStore';

type Suit = 'spade' | 'heart' | 'diamond' | 'club';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
interface Card { suit: Suit; rank: Rank; value: number }

const SUITS: Suit[] = ['spade','heart','diamond','club'];
const RANKS: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SYM: Record<Suit,string> = {spade:'♠',heart:'♥',diamond:'♦',club:'♣'};
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
      className={`w-14 h-20 rounded-lg border-2 flex flex-col items-center justify-center ${hidden?'bg-gradient-to-br from-red-900 to-red-800 border-red-700':'bg-gradient-to-br from-white/90 to-white/70 border-white/40'}`}
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
            <div className="text-center"><span className="text-yellow-400 font-mono text-2xl font-bold">${balance}</span></div>
            <div className="flex items-center gap-3">
              <span className="text-red-300 font-mono text-sm">Bet:</span>
              {[25,50,100,250,500].map(b=>(
                <button key={b} onClick={()=>setBet(Math.min(b,balance))} className={`px-3 py-1.5 rounded font-mono text-xs border transition-all ${bet===Math.min(b,balance)?'bg-red-500/30 border-red-400 text-red-200':'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'}`}>${b}</button>
              ))}
            </div>
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={deal} disabled={bet>balance} className="px-8 py-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 font-mono disabled:opacity-30">DEAL</motion.button>
          </motion.div>
        )}
        {state==='playing'&&(
          <motion.div key="play" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center gap-4 w-full">
            <div className="flex justify-between w-full px-2">
              <span className="text-red-400 font-mono text-sm">${balance}</span>
              <span className="text-yellow-400 font-mono text-sm">Bet: ${bet}</span>
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
            <h2 className={`text-2xl font-bold ${message.includes('win')||message.includes('BLACKJACK')?'text-green-400':message.includes('Push')?'text-yellow-400':'text-red-400'}`}>{message}</h2>
            <div className="w-full bg-red-950/20 rounded-xl p-2 border border-red-500/10">
              <span className="text-red-400 font-mono text-xs">DEALER ({handVal(dealerHand)}):</span>
              <div className="flex gap-1 mt-1">{dealerHand.map((c,i)=><CV key={i} card={c}/>)}</div>
            </div>
            <div className="w-full bg-red-950/10 rounded-xl p-2 border border-red-500/10">
              <span className="text-green-400 font-mono text-xs">YOU ({handVal(playerHand)}):</span>
              <div className="flex gap-1 mt-1">{playerHand.map((c,i)=><CV key={i} card={c}/>)}</div>
            </div>
            <div className="text-center"><span className="text-yellow-400 font-mono text-xl font-bold">${balance}</span></div>
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={newRound} className="px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 font-mono">NEW HAND</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
