// ---- 140. Leaderboard counts ----
// Monsters slain: falling used to reset your kill count to 0 (the respawn reset everything), so the Monsters board
// dropped every time you died; now it only starts from 0 on a new character. PvP kills: a duel you win counts as one.
// Quests: every quest you've finished counts, not only Elder Rowan's (village quests, voyages and Orla's too).
(()=>{
 {const _rs=reset;reset=function(){const keep=kills,fresh=typeof NEWG!=='undefined'&&NEWG;const out=_rs.apply(this,arguments);if(!fresh&&typeof keep==='number'&&keep>kills){kills=keep;try{lastK=kills}catch(e){}}return out}}
 window.SQDUELWIN=u=>{try{if(window.SQLB){SQLB.pk=(SQLB.pk|0)+1;SQLB.pubAt=-1e9;saveLocal(true)}}catch(e){}};
 window.SQQPTOTAL=()=>{let n=0;try{QS.forEach((q,i)=>{if(i<Q.i||(typeof QDONE!=='undefined'&&QDONE.has(q.n)))n++})}catch(e){}
  try{for(const t in SIDE_QS){const s=SQ_SIDE[t],L=SIDE_QS[t];if(s&&L)n+=s.completed?L.length:Math.min(L.length,s.index|0)}}catch(e){}
  try{const V=VQ();for(const q of VOYS)if(V[q.id]===99)n++}catch(e){}
  try{if((CHS.om|0)>=3)n++}catch(e){}
  return Math.max(n,(Q&&+Q.qp)||0)}})();
