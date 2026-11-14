// ---- 186. More gear effects (Dev Suite > Gear / Gear stats) ----
// 111a2's gear rules fx (summed over everything worn by SQGEAR.fxSum) gained: mel/arc/mag (+% melee / arrow / spell damage),
// mreg (+% mana regeneration), hreg (heal 1 heart every 600/value s), hun (hunger drains value% slower), gold (+% gold from
// monsters). The on-hit ones (ls/burn/slow/crit), spd and xp stay in 111a2.
(()=>{const G=()=>window.SQGEAR,fx=k=>{const g=G();return g?g.fxSum(k)|0:0};
 {const _m=meleeFlat;meleeFlat=function(){const v=_m.apply(this,arguments),p=fx('mel');if(!p)return v;const tot=1+(TL.sword|0)+Math.floor(lvOf(0)/15)+v;return v+Math.round(tot*p/100)}}
 {const _a=arrowDmg;arrowDmg=function(){const v=_a.apply(this,arguments),p=fx('arc');return p?Math.max(1,Math.round(v*(1+p/100))):v}}
 {const _s=spellDmg;spellDmg=function(){const v=_s.apply(this,arguments),p=fx('mag');return p?Math.max(1,Math.round(v*(1+p/100))):v}}
 {const _e=killEnemy;killEnemy=function(){/* kill gold (021) + the monster's drops */const g0=GLD;const out=_e.apply(this,arguments);try{const p=fx('gold'),d=GLD-g0;if(p&&d>0)GLD+=Math.round(d*p/100)}catch(e){}return out}}
 let hr=0;
 {const _u=upd;upd=function(dt){const m0=MANA,h0=hunger;const out=_u.apply(this,arguments);try{
   const mr=fx('mreg'),dm=MANA-m0;if(mr&&dm>0&&dm<1)MANA=Math.min(maxMP(),MANA+dm*mr/100);
   const hu=fx('hun'),dh=h0-hunger;if(hu&&dh>0&&dh<2)hunger=Math.min(100,hunger+dh*Math.min(90,hu)/100);
   const hg=fx('hreg');if(hg&&!dead&&P.hp<6){hr+=dt;if(hr>=600/hg){hr=0;P.hp=Math.min(6,P.hp+1)}}else hr=0}catch(e){}return out}}
 window.SQGEARFX={fx}})();
