import React, { useState, useCallback } from 'react';
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
                <button key={n} onClick={()=>setNumDisks(n)} className={`w-8 h-8 rounded font-mono text-sm border transition-all ${numDisks===n?'bg-yellow-500/30 border-yellow-400 text-yellow-200':'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'}`}>{n}</button>
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
                  <div className={`w-full h-48 flex flex-col-reverse items-center gap-1 p-2 rounded-xl transition-all ${selected===tIdx?'bg-yellow-500/10 border-2 border-yellow-500/30':'bg-white/[0.02] border border-white/[0.05]'}`}>
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
