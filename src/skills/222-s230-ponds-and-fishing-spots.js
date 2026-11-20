// ---- 230. Guild fishing ponds, and one angler per fishing spot ----
// Ponds: the Fishing guild quest's rewards (197's QK.fish.rw) are pond items gp_trout/salmon/sword/moon/koi, planted from the bank
// like saplings (197's plant/dig/canPlant know `gp_` keys: a 3x3 patch in front of you, stored as guilds/<g>/isl/<middle cell>).
// 197's applyNodes hands every gp_ entry to SQPONDS.apply, which turns those cells into water (R.tiles 0, originals kept in
// R._pondO and put back when a pond is dug up) and drops the island's baked ground chunks (049's RGCK) so it's redrawn.
// Fishing in a pond: entries at the front of window.SQFISHX (093b's catch hook, after 109's reel): while your bobber is in a pond
// of that kind and the pond still has fish for you, its fish bites with chance `p` (trout/salmon/swordfish 60%, moonfin 40% at
// any time of day, ancient koi 15%); otherwise the normal fish for your level. Bite speed and XP are the game's own. Each pond
// holds STOCK (30) catches per player, refilling one every REFILL s (120), kept in localStorage `sq_pond`. Pond catches are
// ordinary catches, so they count for the guild's Fishing quest, dailies and the weekly event. Library `ponds` =
// {p:{gp_x: chance}, stock, refill} overrides the numbers.
// One angler per spot (everywhere): a cast whose bobber tile is the bobber tile of another player in the same place who is fishing
// (presence `ak` 3-5; their bobber = their position + facing x 24, like front(24)) is called off with "Someone is already
// fishing there." If two casts land together, the one with the larger uid reels in within 3 s of casting.
(()=>{const CF={stock:30,refill:120,p:{gp_trout:.6,gp_salmon:.6,gp_sword:.6,gp_moon:.4,gp_koi:.15}};
 const FISHOF={gp_trout:['trout',10],gp_salmon:['salmon',20],gp_sword:['swordfish',35],gp_moon:['moonfin',70],gp_koi:['akoi',90]};
 const LS=()=>{try{return JSON.parse(localStorage.getItem('sq_pond')||'{}')||{}}catch(e){return{}}},SS=o=>{try{localStorage.setItem('sq_pond',JSON.stringify(o))}catch(e){self.SQERR&&SQERR(e,'222-1')}};
 // ---- the water ----
 function apply(R,want,cellsOf){const O=R._pondO||(R._pondO=new Map()),D=new Map();R._ponds=[];
  for(const k in want){const key=want[k];if(!FISHOF[key])continue;R._ponds.push({i:+k,key});for(const c of cellsOf(R,+k))if(c>=0&&c<R.tiles.length)D.set(c,key)}
  let ch=false;for(const[c,t]of[...O]){if(!D.has(c)){R.tiles[c]=t;O.delete(c);ch=true}}
  for(const[c]of D){if(!O.has(c)){O.set(c,R.tiles[c]);R.tiles[c]=0;ch=true}}
  if(ch){try{for(const k of[...RGCK.keys()])if(k.startsWith(R.key+':'))RGCK.delete(k)}catch(e){self.SQERR&&SQERR(e,'222-2')}}}
 function pondHere(){const R=SCENE&&SCENE.room;if(!FISH||!R||!R._ponds||!R._ponds.length)return null;const W=R.w,tx=Math.floor(FISH.bx/16),ty=Math.floor(FISH.by/16);
  for(const p of R._ponds){const x=p.i%W,y=(p.i/W)|0;if(Math.abs(tx-x)<=1&&Math.abs(ty-y)<=1)return{id:R.region+':'+p.i,key:p.key}}return null}
 function stock(id){const S=LS(),now=Date.now(),e=S[id]||{n:CF.stock,t:now},add=Math.floor((now-e.t)/(CF.refill*1000));if(add>0){e.n=Math.min(CF.stock,e.n+add);e.t=e.n>=CF.stock?now:e.t+add*CF.refill*1000}return e}
 function take(id){const S=LS(),e=stock(id);if(e.n>=CF.stock)e.t=Date.now();e.n=Math.max(0,e.n-1);S[id]=e;SS(S)}
 let told=0;
 const entries=Object.keys(FISHOF).map(key=>{const[k,lv]=FISHOF[key];let at=null;return{k,n:INAME[k]?INAME[k].replace(/^Raw /,''):k,lv,xp:0,get p(){return CF.p[key]||0},where:null,
  ok(){const h=pondHere();if(!h||h.key!==key)return false;if(stock(h.id).n<=0){if(Date.now()-told>60000){told=Date.now();say('This pond is fished out for now. It fills up again over time.')}return false}at=h.id;return true},
  got(){if(at)take(at);at=null}}});
 // XP: the game's own for that fish (FISH_T / 221's deep fish)
 for(const e of entries){const f=(typeof FISH_T!=='undefined'&&FISH_T.find(q=>q.k===e.k))||(window.SQDEEPFISH||[]).find(q=>q.k===e.k);e.xp=f?f.xp:50;if(f&&f.n)e.n=f.n}
 window.SQFISHX=entries.concat(window.SQFISHX||[]);
 try{if(window.SQA&&SQA.onApply)SQA.onApply(lib=>{const c=lib&&lib.ponds;CF.stock=30;CF.refill=120;CF.p={gp_trout:.6,gp_salmon:.6,gp_sword:.6,gp_moon:.4,gp_koi:.15};if(!c||typeof c!=='object')return;
  if(+c.stock>0)CF.stock=Math.min(500,+c.stock|0);if(+c.refill>0)CF.refill=Math.min(86400,+c.refill);if(c.p&&typeof c.p==='object')for(const k in CF.p)if(isFinite(+c.p[k]))CF.p[k]=Math.max(0,Math.min(1,+c.p[k]))})}catch(e){self.SQERR&&SQERR(e,'222-3')}
 window.SQPONDS={apply,CF,stock,pondHere,FISHOF};
 // ---- one angler per spot ----
 const me=()=>window.SQMP&&SQMP.user&&SQMP.user.uid;
 function others(tx,ty){const M=window.SQMP;if(!M||!M.players||!me())return[];let loc='';try{loc=mpLoc()}catch(e){return[]}const out=[],now=performance.now();
  for(const[u,r]of M.players){if(!r||u===me()||r.loc!==loc||!(r.ak>=3&&r.ak<=5))continue;if(r.seen&&now-r.seen>20000)continue;
   const f=r.d===2?[r.fl?-1:1,0]:[0,r.d===1?-1:1],x=(r.tx!=null?r.tx:r.x)+f[0]*24,y=(r.ty!=null?r.ty:r.y)+f[1]*24;
   if(Math.floor(x/16)===tx&&Math.floor(y/16)===ty)out.push(u)}return out}
 let castAt=0;
 {SQHIT.wrap('222 ponds and fishing spots',_a=>function(){const had=!!FISH;const out=_a.apply(this,arguments);try{if(!had&&FISH){const tx=Math.floor(FISH.bx/16),ty=Math.floor(FISH.by/16);
    if(others(tx,ty).length){FISH=null;say('Someone is already fishing there.');try{sfx('swish')}catch(e){self.SQERR&&SQERR(e,'222-4')}}else castAt=performance.now()}}catch(e){self.SQERR&&SQERR(e,'222-5')}return out})}
 {let acc=0;SQUPD.after('222',(dt)=>{try{acc+=dt;if(acc>.4){acc=0;if(FISH&&castAt&&performance.now()-castAt<3000){const o=others(Math.floor(FISH.bx/16),Math.floor(FISH.by/16));
     if(o.some(u=>u<me())){FISH=null;castAt=0;try{if(typeof SQDO!=='undefined'&&SQDO&&SQDO.kind==='reel')SQDO=null}catch(e){self.SQERR&&SQERR(e,'222-6')}say('Someone is already fishing there.')}}}}catch(e){self.SQERR&&SQERR(e,'222-7')}})}
})();
