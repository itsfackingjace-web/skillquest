// ---- 122. Monster rules from the Dev Suite (Monsters tab): health, speed, gold and an extra drop ----
// mobs.<key> in the asset library, keyed like monster looks (SQPROPS.mkey: 'm:wolf:briar'):
//   hp  health in % of the game's own (100 = unchanged), applied once when the monster first appears
//   spd speed in % of the game's own: each frame its movement is scaled (knockback too)
//   gold extra gold when it's beaten; dk/dn/dc an extra drop: item key, how many, chance in %
// Monsters other players share with you (proxies) are left alone: their owner's game already applied the rules.
(()=>{if(!window.SQA||!window.SQPROPS)return;const A=SQA,MR={};
 const num=(v,lo,hi,d)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v)):d};
 A.onApply(lib=>{for(const k in MR)delete MR[k];const M=lib&&lib.mobs||{};for(const k in M){const r=M[k];if(!r||typeof r!=='object')continue;
  const o={hp:num(r.hp,10,1000,100),spd:num(r.spd,10,400,100),gold:num(r.gold,0,100000,0)|0};if(typeof r.dk==='string'&&INAME[r.dk]){o.dk=r.dk;o.dn=num(r.dn,1,1000,1)|0;o.dc=num(r.dc,0,100,100)}MR[k]=o}});
 const rule=n=>n&&!n._rp?MR[SQPROPS.mkey(n)]:null;
 const _u=upd;upd=function(dt){let pos=null;if(Object.keys(MR).length){pos=[];for(const n of en){const r=rule(n);if(!r)continue;
   if(!n._mr){n._mr=1;if(r.hp!==100){n.hp=Math.max(1,Math.round(n.hp*r.hp/100));if(n.mhp)n.mhp=Math.max(1,Math.round(n.mhp*r.hp/100))}}if(r.spd!==100)pos.push([n,n.x,n.y,r.spd/100])}}
  const out=_u.apply(this,arguments);
  if(pos)for(const[n,x,y,k]of pos){if(n.dead)continue;const nx=x+(n.x-x)*k,ny=y+(n.y-y)*k;if(!solid(nx,n.y))n.x=nx;if(!solid(n.x,ny))n.y=ny}return out};
 const _ed=enemyDrop;enemyDrop=function(n){const out=_ed.apply(this,arguments);try{const r=rule(n);if(r){if(r.gold){GLD+=r.gold}
   if(r.dk&&Math.random()*100<r.dc){inv[r.dk]=(inv[r.dk]|0)+r.dn;say('+'+r.dn+' '+INAME[r.dk])}}}catch(e){}return out};
 window.SQMOBRULES={get rules(){return MR},rule}})();
