import React, { useRef, useEffect, useState, useCallback } from 'react';
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
    ctx.fillText('🐸',f.x*SZ+SZ/2,f.y*SZ+SZ-2);ctx.shadowBlur=0;
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
              <h2 className={`text-3xl font-bold mb-2 ${state==='win'?'text-green-400':'text-red-400'}`} style={{textShadow:'0 0 20px '+(state==='win'?'#00FF88':'#ff006e')}}>{state==='win'?'YOU WIN!':'GAME OVER'}</h2>
              <p className="text-green-300 font-mono mb-4">Score: {score}</p>
              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={init} className="px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 font-mono">PLAY AGAIN</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
