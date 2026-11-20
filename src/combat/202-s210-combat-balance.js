// ---- 210. Combat balance: melee speed, magic mana, arrows ----
// Melee used to swing every 0.25 s (holding R2 or Space repeats as fast as `swing` allows), which made it far stronger than
// bows (0.35 s a shot, arrows cost materials) and wands (mana runs out). A swing that would hit a monster now waits until
// MELEE_GAP seconds after the last one that hit something. Chopping, mining, fishing and swings at nothing keep their speed.
(()=>{const MELEE_GAP=.4;let lastHit=-1e9;
 const nowS=()=>performance.now()/1000;
 // the same reach as the game's swing (004/014: 16 px around the point 13 px in front; bigger monsters 24 px), a little wider
 const target=()=>{try{const[fx,fy]=front(13);for(const n of en){if(!n||n.dead)continue;const r=(n.type==='boss'||n.big||n._wb)?30:20;if(Math.hypot(n.x-fx,n.y-fy)<r)return n}}catch(e){self.SQERR&&SQERR(e,'202-1')}return null};
 SQHIT.wrap('202 combat balance',_a=>function(){
  if(target()&&!window.SQSTABNOW){if(nowS()-lastHit<MELEE_GAP)return;const hp0=new Map(en.map(n=>[n,n.hp])),out=_a.apply(this,arguments);
   for(const[n,h]of hp0)if(n.hp<h||n.dead&&h>0){lastHit=nowS();break}return out}
  return _a.apply(this,arguments)});
 // Magic: every spell costs 1 mana less (fire/ice 1, storm/void 2, never below 1). `cost` becomes an accessor, so 111a2's setCosts
 // (which writes the base cost, or a Dev Suite rule's `mp`) and every description reading WSP[el].cost see the lower number.
 for(const el in WSP){let b=WSP[el].cost;Object.defineProperty(WSP[el],'cost',{get(){return Math.max(1,b-1)},set(v){b=v},enumerable:true,configurable:true})}
 // ...and mana comes back 3x as fast: the frame's own regen (small rises) is added twice more; potions and other big gains aren't
 const MREG=3;{SQUPD.wrap('202',_u=>function(dt){const m0=typeof MANA==='number'?MANA:null;const out=_u.apply(this,arguments);
   try{if(m0!=null&&!dead){const g=MANA-m0;if(g>0&&g<1.5&&MANA<maxMP())MANA=Math.min(maxMP(),MANA+g*(MREG-1))}}catch(e){self.SQERR&&SQERR(e,'202-2')}return out})}
 // Archery and Magic: +1 damage on every arrow and spell (early bows and wands lagged well behind melee)
 {const _ad=arrowDmg;arrowDmg=function(){return _ad.apply(this,arguments)+1}}
 {const _sd=spellDmg;spellDmg=function(){return _sd.apply(this,arguments)+1}}
 window.SQCOMBAT={MELEE_GAP,MREG,get lastHit(){return lastHit}};
})();
