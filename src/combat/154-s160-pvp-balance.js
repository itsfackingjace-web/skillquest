// ---- 160. PvP balance ----
// Fights between players used to last forever: every hit did 1 heart (2 with a tier 6+ sword) whatever your gear and
// levels, you couldn't be hurt again for a full second, blocks could cancel 60%+ of hits, and food healed faster than
// anyone could deal damage. Now (064's pvHit/pvIncoming call these hooks; they're inside the MP block, so they can't be
// wrapped from here):
// - SQPVDMG(kind,el): damage comes from the same melee/arrow/spell numbers used on monsters, turned into hearts
//   (under 7 = 1, 7-13 = 2, 14+ = 3; an ultimate counts +4). The receiver accepts up to 3.
// - SQPVARM(d): heavy armour (12+ armour points) takes 1 off hits of 2 or more.
// - SQPVIF: after a player's hit you can be hurt again after 0.5 s instead of 1 s.
// - SQPVBLK: block chance against players is at most 25%.
// - While fighting a player (a duel, or PvP damage dealt/taken in the last 10 s): food heals half (fractions carry
//   over) and the eating cooldown is 5 s; any other healing (pets, campfires, perks, regen) is halved the same way in
//   the outermost upd (also healing that happened between frames).
// - Duels: after 60 s of fighting it's SUDDEN DEATH, no healing at all for either side (shown on the duel bar).
(()=>{const SD=60,EATPV=5,WIN=10000;
 const melee=()=>1+(TL.sword|0)+Math.floor(lvOf(0)/15)+(typeof meleeFlat==='function'?meleeFlat():0);
 const arrow=()=>{try{return arrowDmg()}catch(e){return 2}};
 const spell=el=>{try{return spellDmg(el||WAND||'fire')}catch(e){return 2}};
 const hearts=p=>p>=14?3:p>=7?2:1;
 window.SQPVDMG=function(kind,el){let p;
  if(kind==='sw')p=melee();else if(kind==='ar')p=arrow();else if(kind==='sp')p=spell(el);
  else if(kind==='ul')p=Math.max(melee(),TL.bow?arrow():0,WAND?spell(WAND):0)+4;else p=1;
  return hearts(p)};
 window.SQPVARM=d=>d>=2&&typeof armorPts==='function'&&armorPts()>=12?d-1:d;
 window.SQPVIF=.5;window.SQPVBLK=.25;
 const duel=()=>!!(window.SQDUEL&&SQDUEL.fighting);
 const fighting=()=>{if(duel())return true;const PV=window.SQPVP;return!!(PV&&PV.on&&PV.fight&&performance.now()-PV.fight<WIN)};
 const sudden=()=>{if(!duel())return false;const D=SQDUEL.state;return!!(D&&D.t0&&performance.now()-D.t0>SD*1000)};
 let carry=0,base=null,last=null,sdSaid=false;
 // healing while fighting a player: half (or none in sudden death); h0 = health before the healing
 function damp(h0){if(dead||!(h0>0)||P.hp<=h0)return;if(!fighting()){carry=0;return}
  if(sudden()){P.hp=h0;return}
  const g=(P.hp-h0)/2+carry,w=Math.floor(g);carry=g-w;P.hp=Math.min(6,h0+w)}
 window.SQPVHEAL={fighting,sudden,damp};
 {const _e=eat;eat=function(){if(!fighting()||dead||menuOpen||pnOpen)return _e.apply(this,arguments);
   if(sudden()){say('Sudden death: no healing!');return}
   const c0=EATCD,h0=P.hp,r=_e.apply(this,arguments);
   if(EATCD>c0)EATCD=EATPV;damp(h0);base=last=P.hp;return r}}
 {const _u=upd;upd=function(dt){try{if(last!==null&&P.hp>last)damp(last)}catch(e){}// healing between frames (timers, clicks)
   base=P.hp;const wd=duel(),r=_u.apply(this,arguments);
   try{if(base!==null&&!(wd&&!duel()))damp(base);base=null;last=P.hp;// a duel that just ended restores your health: leave that alone
    if(sudden()){const b=document.getElementById('dlbar');if(b&&b.textContent.indexOf('SUDDEN')<0)b.textContent+=' · SUDDEN DEATH';
     if(!sdSaid){sdSaid=true;say('Sudden death! No more healing.');try{sfx('quest')}catch(e){}}}
    else sdSaid=false}catch(e){}
   return r}}})();
