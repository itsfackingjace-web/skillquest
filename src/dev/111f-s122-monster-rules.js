// ---- 122. Monster rules from the Dev Suite (Monsters tab): health, speed, gold and an extra drop ----
// mobs.<key> in the asset library, keyed like monster looks (SQPROPS.mkey: 'm:wolf:briar'):
//   hp  health in % of the game's own (100 = unchanged), applied once when the monster first appears
//   spd speed in % of the game's own: each frame its movement is scaled (knockback too)
//   dmg damage in % of the game's own: health you lose in a frame is scaled when a monster with a rule is within 40 px
//       (monsters hurt you in many places, so it goes by who is standing next to you)
//   gold extra gold when it's beaten; dr = drops [{k item, n..x how many, c chance %}] (older rules: one drop dk/dn/dc)
//   rep  instead of the game's own drops: what the game gave at the kill (items, gold, a dungeon boss's golden chest) is
//        taken back before the rule's drops are given. XP and quest progress are left alone.
// Kills that go through enemyDrop are handled there; Thornroot and the Emberlord pay out in their own update, so upd also
// looks for those two having paid out this frame (n._rew) (n._mrd marks the ones already paid).
// Monsters other players share with you (proxies) are left alone: their owner's game already applied the rules.
(()=>{if(!window.SQA||!window.SQPROPS)return;const A=SQA,MR={};
 const num=(v,lo,hi,d)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v)):d};
 A.onApply(lib=>{for(const k in MR)delete MR[k];const M=lib&&lib.mobs||{};for(const k in M){const r=M[k];if(!r||typeof r!=='object')continue;
  const o={hp:num(r.hp,10,1000,100),spd:num(r.spd,10,400,100),dmg:num(r.dmg,0,1000,100),gold:num(r.gold,0,100000,0)|0,dr:[],rep:!!r.rep};
  const L=Array.isArray(r.dr)?r.dr:(r.dr&&typeof r.dr==='object'?Object.values(r.dr):r.dk?[{k:r.dk,n:r.dn,x:r.dn,c:r.dc}]:[]);
  for(const d of L.slice(0,8)){if(!d||typeof d.k!=='string'||!INAME[d.k])continue;const n=num(d.n,1,1000,1)|0;o.dr.push({k:d.k,n,x:Math.max(n,num(d.x,1,1000,n)|0),c:num(d.c,0,100,100)})}MR[k]=o}});
 const rule=n=>n&&!n._rp?MR[SQPROPS.mkey(n)]:null;
 function give(n,r){if(n._mrd)return;n._mrd=1;const got=[];if(r.gold){GLD+=r.gold;got.push(r.gold+' gold')}
  for(const d of r.dr)if(Math.random()*100<d.c){const c=d.n+Math.floor(Math.random()*(d.x-d.n+1));inv[d.k]=(inv[d.k]|0)+c;got.push(c+' × '+INAME[d.k].toLowerCase())}
  if(got.length)setTimeout(()=>{try{say('+'+got.join(', +'));sfx('pickup')}catch(e){}},r.rep?0:900)}
 const snapInv=()=>({inv:Object.assign({},inv),g:GLD,items:(SCENE&&SCENE.room&&SCENE.room.items)?SCENE.room.items.length:-1,room:SCENE&&SCENE.room});
 function takeBack(s0){for(const k in inv){const d=(inv[k]|0)-(s0.inv[k]|0);if(d>0)inv[k]-=d}if(GLD>s0.g)GLD=s0.g;
  const R=s0.room;if(R&&R.items&&s0.items>=0)for(let i=R.items.length-1;i>=s0.items;i--)if(R.items[i]&&R.items[i].t==='dchest')R.items.splice(i,1)}
 const _u=upd;upd=function(dt){let pos=null,watch=null,s0=null;if(Object.keys(MR).length){pos=[];for(const n of en){const r=rule(n);if(!r)continue;
   if(!n._mrd&&!n.dead&&n.hp>0)(watch=watch||[]).push([n,r]);
   if(!n._mr){n._mr=1;if(r.hp!==100){n.hp=Math.max(1,Math.round(n.hp*r.hp/100));if(n.mhp)n.mhp=Math.max(1,Math.round(n.mhp*r.hp/100))}}if(r.spd!==100)pos.push([n,n.x,n.y,r.spd/100])}}
  if(watch&&watch.some(w=>w[1].rep))s0=snapInv();
  const hp0=P.hp,cand=[];if(Object.keys(MR).length)for(const n of en){if(!n||n.dead)continue;const r=rule(n);if(r&&r.dmg!==100)cand.push([n,r])}// (the frame may clear monsters out of en)
  const out=_u.apply(this,arguments);
  try{if(P.hp<hp0&&!dead&&Object.keys(MR).length){let best=null,bd=40;for(const[n,r]of cand){const d=Math.hypot(n.x-P.x,n.y-P.y);if(d<bd){bd=d;best=r}}
   if(best){const loss=hp0-P.hp,want=loss*best.dmg/100,k=Math.floor(want)+(Math.random()<want%1?1:0);P.hp=hp0-k}}}catch(e){}
  if(watch)for(const[n,r]of watch){if(n._mrd||!(n.type==='thorn'||n.type==='emberl')||!n._rew)continue;if(r.rep&&s0)takeBack(s0);give(n,r)}
  if(pos)for(const[n,x,y,k]of pos){if(n.dead)continue;const nx=x+(n.x-x)*k,ny=y+(n.y-y)*k;if(!solid(nx,n.y))n.x=nx;if(!solid(n.x,ny))n.y=ny}return out};
 const _ed=enemyDrop;enemyDrop=function(n){const r=rule(n);if(!r||n._mrd)return _ed.apply(this,arguments);const s0=r.rep?snapInv():null;const out=_ed.apply(this,arguments);
  try{if(s0)takeBack(s0);give(n,r)}catch(e){}return out};
 window.SQMOBRULES={get rules(){return MR},rule}})();
