// ---- 210. Combat balance: melee speed ----
// Melee used to swing every 0.25 s (holding R2 or Space repeats as fast as `swing` allows), which made it far stronger than
// bows (0.35 s a shot, arrows cost materials) and wands (mana runs out). A swing that would hit a monster now waits until
// MELEE_GAP seconds after the last one that hit something. Chopping, mining, fishing and swings at nothing keep their speed.
(()=>{const MELEE_GAP=.4;let lastHit=-1e9;
 const nowS=()=>performance.now()/1000;
 // the same reach as the game's swing (004/014: 16 px around the point 13 px in front; bigger monsters 24 px), a little wider
 const target=()=>{try{const[fx,fy]=front(13);for(const n of en){if(!n||n.dead)continue;const r=(n.type==='boss'||n.big||n._wb)?30:20;if(Math.hypot(n.x-fx,n.y-fy)<r)return n}}catch(e){}return null};
 const _a=attack;attack=function(){
  if(target()){if(nowS()-lastHit<MELEE_GAP)return;const hp0=new Map(en.map(n=>[n,n.hp])),out=_a.apply(this,arguments);
   for(const[n,h]of hp0)if(n.hp<h||n.dead&&h>0){lastHit=nowS();break}return out}
  return _a.apply(this,arguments)};
 window.SQCOMBAT={MELEE_GAP,get lastHit(){return lastHit}};
})();
