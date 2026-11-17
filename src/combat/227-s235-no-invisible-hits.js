// ---- No hits from monsters you can't see (Nov 16) ----
// Two players on the Shattered Expanse were both hit once a second ("Ouch!", 001's touch damage) by something that wasn't on
// screen. 001's touch check counts anything in `en` within 10 px, and a monster whose position isn't a number counts as 1 px
// away (Math.hypot(NaN)||1) while being drawn nowhere. This section:
//  - keeps a monster that isn't drawn (no pS call in the last 0.4 s while it's right next to you) or has no real position
//    out of the inner update's reach for that frame, so it can't touch you (bosses and big monsters only by the position rule);
//  - takes monsters without a real position out of `en` for good (a shared copy is put back at its owner's spot);
//  - sends one automatic bug report a session describing the culprit, so the cause can be found (window.SQGHOSTHIT).
(()=>{const SEEN=new WeakMap(),BORN=new WeakMap(),LOG=[];let reported=false;
 const fin=n=>Number.isFinite(n.x)&&Number.isFinite(n.y);
 {const _p=pS;pS=function(n,tm){try{if(n&&fin(n))SEEN.set(n,performance.now())}catch(e){}return _p.apply(this,arguments)}}
 const exempt=n=>n.big||n.boss||n.type==='boss'||n.type==='ib'||n._wb||n.cb||n.under||n._pet;
 function describe(n,why){const o={why,type:n.type,rk:n.rk,x:n.x,y:n.y,hp:n.hp,dead:n.dead};for(const k of['_rp','_owner','_dev','_ev','zc','zi','rg','night','tx','ty','summon'])if(n[k]!=null)o[k]=n[k];
  o.keys=Object.keys(n).join(',').slice(0,300);const s=SEEN.get(n);o.seen=s?Math.round(performance.now()-s):-1;return o}
 function report(list){if(reported)return;reported=true;try{const MP=window.SQMP,F=window.SQFB;if(!MP||!MP.user||!F)return;const d=F.db,R=SCENE&&SCENE.room;
   const others=MP.players?[...MP.players.values()].filter(p=>p&&p.loc===(typeof mpLoc==='function'?mpLoc():'')).length:0;
   const what=('[auto] Invisible monster touching the player (blocked). '+JSON.stringify({where:R&&R.region||(SCENE&&SCENE.id)||'hollow',px:Math.round(P.x),py:Math.round(P.y),others,dark:+dark().toFixed(2),ver:window.SQVER,m:list.slice(0,3)})).slice(0,1500);
   d.push(d.ref(F.D,'bugs'),{what,u:MP.user.uid,n:String(MP.user.displayName||'').split(' ')[0].slice(0,12),t:d.serverTimestamp()}).catch(()=>{})}catch(e){}}
 const _u=upd;upd=function(dt){
  if(dead||menuOpen||pnOpen||!Array.isArray(en))return _u.apply(this,arguments);
  const now=performance.now(),moved=[];let bad=null;
  for(let i=en.length-1;i>=0;i--){const n=en[i];if(!n||n.dead)continue;if(!BORN.has(n))BORN.set(n,now);
   if(!fin(n)){bad=bad||[];bad.push(describe(n,'nan'));en.splice(i,1);
    if(n._rp&&Number.isFinite(n.tx)&&Number.isFinite(n.ty)){n.x=n.tx;n.y=n.ty;n._px=n.tx;n._py=n.ty;n.kx=n.ky=0}else{n.dead=1;n.dropped=1}continue}
   if(exempt(n))continue;const d=Math.hypot(n.x-P.x,n.y-P.y);if(d>=16)continue;
   const s=SEEN.get(n)||0;if(now-BORN.get(n)<600||now-s<400)continue;
   // right next to you and not drawn for 0.4 s: keep it out of reach for this update
   bad=bad||[];bad.push(describe(n,'undrawn'));moved.push([n,n.x,n.y]);n.x=P.x+4000;n.y=P.y+4000}
  if(bad){LOG.push(...bad);if(LOG.length>20)LOG.splice(0,LOG.length-20);report(bad)}
  try{return _u.apply(this,arguments)}finally{for(const[n,x,y]of moved)if(Math.abs(n.x-(P.x+4000))<200){n.x=x;n.y=y}}};
 window.SQGHOSTHIT={log:LOG,get reported(){return reported}};
})();
