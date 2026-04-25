import React, { useState, useCallback, useRef } from 'react'; import { motion, AnimatePresence } from 'framer-motion'; import { audioManager } from '../../lib/audio/AudioManager'; import { useGameStore } from '../../stores/gameStore'; type Cell = 0 | 1 | 2;
type Board = Cell[][];
const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

function createBoard(): Board { const b: Board = Array(8).fill(0).map(() => Array(8).fill(0) as Cell[]); b[3][3]=2;b[3][4]=1;b[4][3]=1;b[4][4]=2; return b; }

function getFlips(board: Board, r: number, c: number, p: Cell): [number,number][] {
  if (board[r][c] !== 0) return [];
  const opp: Cell = p === 1 ? 2 : 1;
  const all: [number,number][] = [];
  for (const [dr,dc] of DIRS) {
    const flips: [number,number][] = [];
    let rr=r+dr, cc=c+dc;
    while (rr>=0&&rr<8&&cc>=0&&cc<8&&board[rr][cc]===opp) { flips.push([rr,cc]); rr+=dr; cc+=dc; }
    if (flips.length>0&&rr>=0&&rr<8&&cc>=0&&cc<8&&board[rr][cc]===p) all.push(...flips);
  }
  return all;
}

function validMoves(board: Board, p: Cell): [number,number][] {
  const m: [number,number][] = [];
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) if (getFlips(board,r,c,p).length>0) m.push([r,c]);
  return m;
}

function applyMove(board: Board, r: number, c: number, p: Cell): Board {
  const flips = getFlips(board,r,c,p);
  const nb = board.map(row=>[...row]) as Board;
  nb[r][c]=p;
  for (const [fr,fc] of flips) nb[fr][fc]=p;
  return nb;
}

function count(board: Board): [number,number] {
  let b=0,w=0;
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) { if(board[r][c]===1)b++; if(board[r][c]===2)w++; }
  return [b,w];
}

function evaluate(board: Board, p: Cell): number {
  const [b,w] = count(board);
  const mine = p===1?b:w, theirs = p===1?w:b;
  const corners = [[0,0],[0,7],[7,0],[7,7]];
  let cs = 0;
  for (const [r,c] of corners) { if(board[r][c]===p)cs+=25; else if(board[r][c]!==0)cs-=25; }
  return (mine-theirs)+cs+validMoves(board,p).length*2;
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maxing: boolean, ai: Cell): number {
  if (depth===0) return evaluate(board,ai);
  const cur = maxing?ai:(ai===1?2:1);
  const moves = validMoves(board,cur);
  if (moves.length===0) { const om=validMoves(board,cur===1?2:1); if(om.length===0) return evaluate(board,ai); return minimax(board,depth-1,alpha,beta,!maxing,ai); }
  if (maxing) { let mx=-Infinity; for(const [r,c] of moves){mx=Math.max(mx,minimax(applyMove(board,r,c,cur),depth-1,alpha,beta,false,ai));alpha=Math.max(alpha,mx);if(beta<=alpha)break;} return mx; }
  else { let mn=Infinity; for(const [r,c] of moves){mn=Math.min(mn,minimax(applyMove(board,r,c,cur),depth-1,alpha,beta,true,ai));beta=Math.min(beta,mn);if(beta<=alpha)break;} return mn; }
}

function bestMove(board: Board, ai: Cell, depth=3): [number,number]|null {
  const moves = validMoves(board,ai);
  if (!moves.length) return null;
  let best=moves[0], bs=-Infinity;
  for (const [r,c] of moves) { const s=minimax(applyMove(board,r,c,ai),depth-1,-Infinity,Infinity,false,ai); if(s>bs){bs=s;best=[r,c];} }
  return best;
}

export default function ReversiGame() {
  const [board,setBoard]=useState<Board>(createBoard);
  const [state,setState]=useState<'menu'|'playing'|'gameover'>('menu');
  const [myTurn,setMyTurn]=useState(true);
  const [last,setLast]=useState<[number,number]|null>(null);
  const [flipping,setFlipping]=useState<[number,number][]>([]);
  const [diff,setDiff]=useState(3);
  const aiRef=useRef<number>(0);
  const {audioEnabled,setHighScore}=useGameStore();
  const moves=validMoves(board,1);
  const [bk,wh]=count(board);

  const init=useCallback(()=>{setBoard(createBoard());setMyTurn(true);setLast(null);setFlipping([]);setState('playing');if(audioEnabled)audioManager.play('game-start');},[audioEnabled]);

  const click=useCallback((r:number,c:number)=>{
    if(!myTurn||state!=='playing') return;
    const flips=getFlips(board,r,c,1);
    if(!flips.length) return;
    const nb=applyMove(board,r,c,1);
    setBoard(nb);setLast([r,c]);setFlipping(flips);
    if(audioEnabled)audioManager.play('score-up');
    setTimeout(()=>setFlipping([]),400);
    const aiM=validMoves(nb,2), plM=validMoves(nb,1);
    const [b2,w2]=count(nb);
    if(b2+w2===64||(!aiM.length&&!plM.length)){setState('gameover');if(b2>w2){if(audioEnabled)audioManager.play('win');setHighScore('reversi',b2);}else if(audioEnabled)audioManager.play('lose');return;}
    if(!aiM.length) return;
    setMyTurn(false);
    aiRef.current=window.setTimeout(()=>{
      const m=bestMove(nb,2,diff);
      if(m){const[nr,nc]=m;const af=getFlips(nb,nr,nc,2);const ab=applyMove(nb,nr,nc,2);setBoard(ab);setLast([nr,nc]);setFlipping(af);if(audioEnabled)audioManager.play('move');setTimeout(()=>setFlipping([]),400);
      const pm=validMoves(ab,1),am=validMoves(ab,2);const[b3,w3]=count(ab);
      if(b3+w3===64||(!pm.length&&!am.length)){setState('gameover');if(b3>w3){if(audioEnabled)audioManager.play('win');setHighScore('reversi',b3);}else if(audioEnabled)audioManager.play('lose');return;}
      if(pm.length)setMyTurn(true);
      }
    },500);
  },[myTurn,state,board,audioEnabled,diff,setHighScore]);

  const isFlipping=(r:number,c:number)=>flipping.some(([fr,fc])=>fr===r&&fc===c);
  const isValid=(r:number,c:number)=>moves.some(([mr,mc])=>mr===r&&mc===c);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence mode="wait">
        {state==='menu'&&(
          <motion.div key="m" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold text-pink-400" style={{textShadow:'0 0 20px #FF006E'}}>⚫ REVERSI</h2>
            <p className="text-pink-300/70 text-sm text-center">Classic Othello - outflank your opponent!</p>
            <div className="flex gap-2">{[2,3,4].map(d=>(
              <button key={d} onClick={()=>setDiff(d)} className={`px-4 py-2 rounded-lg font-mono text-sm border transition-all ${diff===d?'bg-pink-500/30 border-pink-400 text-pink-200':'bg-pink-500/10 border-pink-500/30 text-pink-400 hover:bg-pink-500/20'}`}>
                {d===2?'Easy':d===3?'Medium':'Hard'}
              </button>
            ))}</div>
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={init} className="px-8 py-3 bg-pink-500/20 border border-pink-500/50 rounded-lg text-pink-200 font-mono hover:bg-pink-500/30">START</motion.button>
          </motion.div>
        )}
        {state==='playing'&&(
          <motion.div key="p" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center gap-3">
            <div className="flex justify-between w-64">
              <span className="font-mono text-sm">⚫ {bk}</span>
              <span className={`font-mono text-xs ${myTurn?'text-pink-300':'text-white/50'}`}>{myTurn?'YOUR TURN':'AI THINKING...'}</span>
              <span className="font-mono text-sm">⚪ {wh}</span>
            </div>
            <div className="grid grid-cols-8 gap-0.5 bg-pink-900/20 p-1 rounded-xl border border-pink-500/20">
              {board.flatMap((row,r)=>row.map((cell,c)=>(
                <motion.div key={`${r}${c}`}
                  onClick={()=>click(r,c)}
                  className={`w-8 h-8 rounded-sm flex items-center justify-center cursor-pointer transition-all
                    ${isValid(r,c)&&myTurn?'bg-pink-500/10 hover:bg-pink-500/20':'bg-black/30'}
                    ${last&&last[0]===r&&last[1]===c?'ring-1 ring-pink-400/50':''}`}
                >
                  {cell!==0&&(
                    <motion.div initial={{scale:0,rotate:isFlipping(r,c)?180:0}} animate={{scale:1,rotate:0}}
                      transition={{duration:0.3}}
                      className={`w-6 h-6 rounded-full shadow-lg ${cell===1?'bg-gray-900 border-2 border-gray-600':'bg-white border-2 border-gray-200'}`}
                      style={{boxShadow:cell===1?'0 0 8px rgba(0,0,0,0.5)':'0 0 8px rgba(255,255,255,0.3)'}}
                    />
                  )}
                  {isValid(r,c)&&cell===0&&myTurn&&<div className="w-2 h-2 rounded-full bg-pink-400/40"/>}
                </motion.div>
              )))}
            </div>
          </motion.div>
        )}
        {state==='gameover'&&(
          <motion.div key="g" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="flex flex-col items-center gap-6">
            <h2 className={`text-3xl font-bold ${bk>wh?'text-green-400':'text-red-400'}`} style={{textShadow:`0 0 20px ${bk>wh?'#00FF88':'#FF006E'}`}}>
              {bk>wh?'🎉 YOU WIN!':'💀 AI WINS!'}
            </h2>
            <p className="font-mono text-pink-300">⚫ {bk} - ⚪ {wh}</p>
            <div className="flex gap-3">
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={init} className="px-6 py-3 bg-pink-500/20 border border-pink-500/50 rounded-lg text-pink-200 font-mono hover:bg-pink-500/30">PLAY AGAIN</motion.button>
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={()=>setState('menu')} className="px-6 py-3 bg-pink-500/10 border border-pink-500/30 rounded-lg text-pink-400 font-mono hover:bg-pink-500/20">MENU</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}