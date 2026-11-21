// ---- 267. Drop Cards: other players can look at your collection; Drop Cards on the leaderboard (window.SQCARDSHARE) ----
// Nov 20 (Jace's picks): "viewing another player's binder" (anyone, from the player menu; collection only, decks stay private) and
// "collection counts on the leaderboard" (different cards earned: Starter Deck cards don't count).
// - `cards/<uid>` = {v: "key:n:s,key:n:s,..." (earned copies n, shiny copies s), n: different cards, t}: written only when the
//   collection changed, checked every 20 s while online (small and rare: no listener, players read one when they open it).
// - The leaderboard row (068) gets `dc` = different cards (SQLBX); 068 shows it as the "Drop Cards" category.
// - The player menu (130's SQPMX hook) gets a DROP CARDS button that reads their `cards/<uid>` and opens 254's binder read-only.
(()=>{const D=window.SQDROPCARD,B=window.SQBINDER;if(!D||!B)return;
 const keys=()=>B.ORDER();
 function summary(){const parts=[];let n=0;for(const k of keys()){const C=D.ITEM[k],sh=C&&C.key===k?C.sh:null,c=inv[k]|0,s=sh?inv[sh]|0:0;if(c+s>0){n++;parts.push(k+':'+c+':'+s)}}return{v:parts.join(','),n}}
 const distinct=()=>summary().n;
 (window.SQLBX=window.SQLBX||[]).push(row=>{const n=distinct();if(n>0)row.dc=n});
 let last='',busy=false;
 async function publish(force){const M=window.SQMP,F=window.SQFB;if(!M||!M.on||!M.user||!F||busy)return false;const s=summary();if(!s.n&&!last)return false;const sig=s.v;if(!force&&sig===last)return false;
  busy=true;try{await F.db.set(F.db.ref(F.D,'cards/'+M.user.uid),{v:s.v.slice(0,6000),n:s.n,t:F.db.serverTimestamp()});last=sig;return true}catch(e){self.SQERR&&SQERR(e,'259-1');return false}finally{busy=false}}
 setInterval(()=>{try{publish()}catch(e){self.SQERR&&SQERR(e,'259-2')}},20000);
 const parse=v=>{const c={},s={};for(const p of String(v||'').split(',')){const[k,a,b]=p.split(':');if(!k||!/^(dc|pc)_[\w-]+$/.test(k))continue;c[k]=Math.max(0,a|0);s[k]=Math.max(0,b|0)}return{c,s}};
 async function view(u,name){const F=window.SQFB;if(!F)return;try{const v=(await F.db.get(F.db.ref(F.D,'cards/'+u))).val();const p=parse(v&&v.v);B.peek(name,p.c,p.s);if(!v)say(name+' hasn\'t found any Drop Cards yet.')}catch(e){self.SQERR&&SQERR(e,'259-3');say('Couldn\'t load their cards. Try again in a moment.')}}
 (window.SQPMX=window.SQPMX||[]).push(u=>'<button class="sb" data-dcpm="'+String(u).replace(/[^\w-]/g,'')+'">DROP CARDS</button>');
 pbd.addEventListener('click',e=>{const b=e.target.closest('[data-dcpm]');if(!b)return;e.stopPropagation();e.preventDefault();const u=b.dataset.dcpm;
  let nm='Player';try{const M=window.SQMP,pl=M&&M.players&&M.players.get(u);nm=(pl&&pl.n)||nm}catch(x){self.SQERR&&SQERR(x,'259-4')}view(u,nm)},true);
 window.SQCARDSHARE={summary,parse,publish,view,distinct}})();
