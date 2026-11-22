// ---- 273. Mana stops refilling for a moment after you use it (window.SQMANAPAUSE) ----
// Nov 21 (Jace: "Mana regen at my level is way faster than i can even deplete it" ... "what if we put a short pause on mana regen
// after casting a spell?"). Since 202 tripled regen from Magic 25 and cut spell costs by 1, a mage in mage armour got more mana back
// than holding CAST spends (measured: 4.8/s at Magic 47, 6.5/s at 99 vs 2.5/s spent), so mana never ran out. Now any mana spent
// (a spell, an ultimate) stops the refill for PAUSE seconds. Holding CAST (a cast every 0.4 s) drains the bar; stop casting and
// the full refill comes back after the pause.
// One wrap on the frame, outside every regen step (028 base, 036 level bonus, 086 sapphire, 179 gear, 202's tripling): mana that
// went down since the last frame or during this one starts the pause; while paused, a small gain (< 1.5 a frame, as 202 tells regen
// apart) is taken back. Bigger gains (Siphon's +2 on a kill, potions, gifts) are kept.
(()=>{const PAUSE=1.5;let until=0,last=null;
 SQUPD.wrap('265 mana pause',next=>function(dt){
  const m0=typeof MANA==='number'?MANA:null,now=performance.now();
  if(m0!==null&&last!==null&&m0<last-1e-6)until=now+PAUSE*1000;// spent between frames (a tap, a key, the controller)
  const out=next.apply(this,arguments);
  try{if(m0!==null&&typeof MANA==='number'){
   if(MANA<m0-1e-6)until=performance.now()+PAUSE*1000;// spent during the frame (holding CAST, R1)
   else if(performance.now()<until){const g=MANA-m0;if(g>0&&g<1.5)MANA=m0}
   last=MANA}}catch(e){self.SQERR&&SQERR(e,'265-1')}
  return out});
 window.SQMANAPAUSE={PAUSE,get paused(){return performance.now()<until},get left(){return Math.max(0,(until-performance.now())/1000)}}})();
