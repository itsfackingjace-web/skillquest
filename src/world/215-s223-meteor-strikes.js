// ---- 223. Meteor strikes ----
// A rare shared event outdoors on Hollow or one of the four big islands (since Nov 16; LOCS): a meteor falls at a random time and place, leaves a big crater with meteorite
// veins and a glowing core, and everyone online races there.
//   Timing: the clock is cut into windows of CFG.win hours; a hash of each window decides whether it has a strike (CFG.per)
//     and when (1 h + up to win-6 h into it). A strike less than GAP (12 h) after the previous real one is skipped, and none comes
//     within 6 h of a summoned one (SUM), so strikes are never back to back (since Nov 16: win 24, per .85 = about 0.8 a day). Dev command /meteorite (or /meteorite here,
//     /meteorite stop) writes `events/met` {t,x,y,id} (dev-only write, signed-in read, already in the rules) for a strike
//     60 s later, at the chosen tile. Every game works the same strike out, so nothing else needs to be sent.
//   Where: an open patch of wild Hollow ground (no water, roads, bridges, protected/town/village tiles, buildings, objects)
//     at least MARGIN tiles from villages, towns, roads, buildings and every house in HOUSES. Scheduled strikes: each
//     game picks a tile from the window's hash and writes it to `wb/mts<id>/d/<uid>`; everyone uses the value written by the
//     smallest uid, so games that know different houses still agree.
//   Mining: veins (Mining CFG.vlv, steel pickaxe+) take CFG.vhp hits in total from everyone (`wb/mtv<id>_<i>/d/<uid>` =
//     your hits), and the hit that breaks one gives 1-3 meteorite ore. The core (any level, any pickaxe) takes damage
//     1 + pickaxe tier + Mining/10 a hit (`wb/mtc<id>/d/<uid>`); core health = CFG.hp - everyone's damage, shown on the
//     banner. When it breaks every game ranks the damage list and pays itself once (save `mtp`): 1st/2nd/3rd = REW, anyone
//     else who hit it = REW[3], in the best ore your Mining level can mine (iron/gold/mithril/adamant) plus a tenth of that
//     in meteorite ore. Writes are sent at most once a second; the `wb` rules (any slot, own uid, number) already allow it.
//   Stardust: sparkles on the rim; HIT one for 1-2 stardust (once each per strike).
//   Items: meteorore, stardust, metbar (furnace: 15 meteorite ore + 15 adamant ore + 3 stardust, Smithing 80).
//   Library `meteor` = {per, win, hp, vhp, vlv, rew:[[ore,met]x4]} overrides CFG (SQA.onApply).
//   Islands (since Nov 16): each scheduled window picks a place from LOCS by its hash (Hollow 3 in 7, else Ashfall, Briarwood,
//     Ironcrest, the Shattered Expanse). Island strikes have ids 'i<k>' (Hollow keeps 's<k>'), their spot is a tile index
//     y*R.w+x on that island, picked only by games standing on it (okR: open land, not rgQuiet, no roads) and agreed the same
//     way through `wb/mts<id>`; games elsewhere see the banner ("on Ashfall Coast") until someone there picks the spot. Drawn
//     from the outermost ROOMBG on that island (GROUNDHOOK on Hollow). `/meteorite here` works on an island too (rec.loc).
//   Achievements (129's SQACH.A, group 'Meteors'): counters mtcore (cores you helped break), mttop (most damage), mtvein,
//     mtdust, mtisl (a core on an island).
(()=>{if(typeof attack!=='function'||typeof GROUNDHOOK==='undefined')return;
 const CFG={per:.85,win:24,hp:20000,vhp:40,vlv:70,rew:[[750,75],[500,50],[300,30],[100,10]]},DEF=JSON.parse(JSON.stringify(CFG));
 const WARN=60000,HOT=15*60000,MARGIN=8,RX=72,RY=38,MI=SKN.indexOf('Mining');
 const LOCS=['hollow','hollow','hollow','ashfall','briarwood','ironcrest','shattered'];
 const RNAME=l=>{try{return WORLD_REGIONS[l].name}catch(e){return l}};
 const ROOM=()=>{const R=SCENE&&SCENE.room;return R&&R.region?R:null};
 const at=loc=>loc==='hollow'?!SCENE:!!(ROOM()&&ROOM().region===loc);// standing outdoors where that strike is
 const VEINS=[[-44,-10],[38,-14],[-22,14],[46,10],[6,-24],[-52,6],[20,20]];
 const h01=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v)};
 const now=()=>{try{if(window.SQMP&&SQMP.on&&typeof mpNow==='function')return mpNow()}catch(e){}return Date.now()};
 const Fb=()=>window.SQFB,me=()=>{const m=window.SQMP;return m&&m.user?m.user.uid:''};
 const lv=()=>{try{return lvOf(MI)}catch(e){return 1}};
 // ---- items ----
 const ITEMS={meteorore:['Meteorite ore','meteorite ore',300,'A chunk of a fallen star, shot through with shimmering colour. 15 of them, 15 adamant ore and 3 stardust smelt into a meteorite bar (Smithing 80).'],
  stardust:['Stardust','stardust',40,'Glittering dust from the rim of a meteor crater. Used to smelt meteorite bars.'],
  metbar:['Meteorite bar','meteorite bars',6000,'The finest metal there is, smelted from meteorite ore. Used for meteorite gear.']};
 for(const k in ITEMS){const[n,sh,v,d]=ITEMS[k];if(!INVK.includes(k))INVK.push(k);INAME[k]=n;SN[k]=n;SHORT[k]=sh;SELLP[k]=v;IDESC[k]=d;inv[k]=inv[k]|0;
  if(!EXTRA_BAG.includes(k)){const j=EXTRA_BAG.indexOf('adamore');EXTRA_BAG.splice(j>=0?j+1:EXTRA_BAG.length,0,k)}}
 try{if(!SM.some(r=>r.k==='metbar'))SM.push({k:'metbar',n:'Meteorite bar',smelt:1,c:{meteorore:15,adamore:15,stardust:3},lv:80,xp:600})}catch(e){}
 {const _ic=iconURL;iconURL=function(k,col){if(!ITEMS[k])return _ic.apply(this,arguments);const key='g223'+k;if(ICONC[key])return ICONC[key];
   const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
   if(k==='meteorore'){r(3,4,8,7,'#120e14');r(2,5,10,5,'#120e14');r(3,5,8,5,'#3a3248');r(4,4,6,1,'#4a4058');r(3,9,8,1,'#2c2638');r(4,6,1,1,'#ff80d8');r(7,5,1,1,'#70e8ff');r(9,7,1,1,'#e070ff');r(6,8,1,1,'#70e8ff');r(5,7,1,1,'#ffffff')}
   else if(k==='stardust'){r(3,9,8,3,'#4a3878');r(4,8,6,1,'#6a50a8');r(5,7,4,1,'#8868d8');r(6,2,1,4,'#ffffff');r(4,4,5,1,'#ffffff');r(6,4,1,1,'#fff0ff');r(10,6,1,1,'#c8a8ff');r(2,7,1,1,'#c8a8ff');r(8,10,1,1,'#ffffff')}
   else{r(1,5,12,5,'#120e14');r(2,6,10,3,'#3a3050');r(2,6,10,1,'#6a5a88');r(3,7,2,1,'#ff80d8');r(7,7,1,1,'#70e8ff');r(9,6,2,1,'#e070ff');r(11,6,1,3,'#2a2238')}
   return ICONC[key]=c.toDataURL()}}
 // ---- settings from the library ----
 try{if(window.SQA&&SQA.onApply)SQA.onApply(L=>{const m=L&&L.meteor;Object.assign(CFG,JSON.parse(JSON.stringify(DEF)));if(m&&typeof m==='object'){
   for(const k of['per','win','hp','vhp','vlv'])if(typeof m[k]==='number'&&isFinite(m[k]))CFG[k]=m[k];
   if(Array.isArray(m.rew))m.rew.slice(0,4).forEach((p,i)=>{if(Array.isArray(p))CFG.rew[i]=[Math.max(0,p[0]|0),Math.max(0,p[1]|0)]})}
  CFG.per=Math.max(0,Math.min(1,CFG.per));CFG.win=Math.max(7,Math.min(72,CFG.win));CFG.hp=Math.max(100,Math.min(190000,CFG.hp|0));CFG.vhp=Math.max(1,Math.min(1000,CFG.vhp|0));CFG.vlv=Math.max(1,Math.min(99,CFG.vlv|0))})}catch(e){}
 // ---- where a crater may go ----
 const near=(x,y,r,f)=>{for(let b=y-r;b<=y+r;b++)for(let a=x-r;a<=x+r;a++){if(a<0||b<0||a>=N||b>=N)return true;if(f(a,b,b*N+a))return true}return false};
 const has=(S,i)=>{try{return!!(S&&S.has&&S.has(i))}catch(e){return false}};
 const hard=(a,b,i)=>has(window.PROT||(typeof PROT!=='undefined'?PROT:null),i)||has(typeof BS!=='undefined'?BS:null,i)||has(typeof TOWNZ!=='undefined'?TOWNZ:null,i)||has(typeof ROADS!=='undefined'?ROADS:null,i)||has(typeof BRIDGE!=='undefined'?BRIDGE:null,i)||(typeof inVillage==='function'&&inVillage(a,b));
 function houseNear(x,y){try{for(const h of(typeof HOUSES!=='undefined'?HOUSES:[])){const hx=(h.x|0)+((h.w|0)>>1),hy=h.y|0;if(Math.abs(hx-x)<MARGIN+6&&Math.abs(hy-y)<MARGIN+5)return true}}catch(e){}return false}
 function ok(x,y){if(x<12||y<12||x>=N-12||y>=N-12)return false;
  // the crater itself: about 9 x 5 tiles of open land
  for(let b=y-3;b<=y+3;b++)for(let a=x-5;a<=x+5;a++){const i=b*N+a;if(tile[i]===0||tile[i]===3||obj[i]||hard(a,b,i)||solid(a*16+8,b*16+8))return false}
  if(near(x,y,MARGIN+4,hard))return false;if(houseNear(x,y))return false;return true}
 function okR(R,x,y){const W=R.w;if(x<8||y<6||x>=W-8||y>=R.h-6)return false;
  for(let b=y-3;b<=y+3;b++)for(let a=x-5;a<=x+5;a++){const i=b*W+a,t=R.tiles[i];if(t===0||t===14)return false;if(R.solid.has(i)){if(!rgObjAt(R,a,b))return false}else if(solid(a*16+8,b*16+8))return false}
  for(let b=y-5;b<=y+5;b++)for(let a=x-8;a<=x+8;a++){if(a<0||b<0||a>=W||b>=R.h)return false;const t=R.tiles[b*W+a];if(t===14)return false;try{if(typeof rgQuiet==='function'&&rgQuiet(R,a,b))return false}catch(e){}}
  return true}
 function pickR(R,seed){for(let k=0;k<2500;k++){const x=8+Math.floor(h01(seed,k*1.7)*(R.w-16)),y=6+Math.floor(h01(seed+.37,k*2.3)*(R.h-12));if(okR(R,x,y))return y*R.w+x}return-1}
 function nearestOkR(R,x,y){for(let r=0;r<40;r++)for(let b=y-r;b<=y+r;b++)for(let a=x-r;a<=x+r;a++){if(Math.max(Math.abs(a-x),Math.abs(b-y))!==r)continue;if(okR(R,a,b))return b*R.w+a}return-1}
 function pick(seed){// a hashed walk over the island until a good spot turns up
  for(let k=0;k<1500;k++){const x=12+Math.floor(h01(seed,k*1.7)*(N-24)),y=12+Math.floor(h01(seed+.37,k*2.3)*(N-24));if(ok(x,y))return y*N+x}return-1}
 function nearestOk(x,y){for(let r=0;r<40;r++)for(let b=y-r;b<=y+r;b++)for(let a=x-r;a<=x+r;a++){if(Math.max(Math.abs(a-x),Math.abs(b-y))!==r)continue;if(ok(a,b))return b*N+a}return-1}
 // ---- the strike happening now (scheduled or summoned) ----
 let SUM=null;// summoned record {t,x,y,id}
 const GAP=12*3600000,SUMGAP=6*3600000;// at least 12 h between scheduled strikes, and none within 6 h of a summoned one
 function rawAt(k){const W=CFG.win*3600000;if(h01(k,9.1)>=CFG.per)return null;return k*W+3600000+h01(k,4.4)*(W-6*3600000)}
 function realAt(k,depth){const r=rawAt(k);if(r==null)return null;if(depth>0){for(let j=k-1;j>=k-4;j--){const p=realAt(j,depth-1);if(p!=null){if(r-p<GAP)return null;break}}}return r}
 function sched(t){const W=CFG.win*3600000,w=Math.floor(t/W);const out=[];for(const k of[w-1,w]){const a=realAt(k,4);if(a==null)continue;if(SUM&&Math.abs(a-SUM.t)<SUMGAP)continue;const loc=LOCS[Math.floor(h01(k,7.7)*LOCS.length)];out.push({t:a,id:(loc==='hollow'?'s':'i')+k,seed:k,loc})}return out}
 function current(){const t=now(),L=[];if(SUM&&t>=SUM.t-WARN&&t<SUM.t+HOT)L.push({t:SUM.t,id:SUM.id,x:SUM.x,y:SUM.y,sum:1,loc:SUM.loc||'hollow'});
  for(const s of sched(t))if(t>=s.t-WARN&&t<s.t+HOT)L.push(s);return L.sort((a,b)=>a.t-b.t)[0]||null}
 // ---- island craters flatten the trees, rocks and bushes (`_obj` items) under them while the strike lasts ----
 let FLAT=[];// [R, item, cell]
 function unflatten(){for(const[R,it,i]of FLAT){R._mtf=null;if(!it._mtf)continue;it._mtf=0;it.gone=false;R.solid.add(i);try{rgCellAdd(R,it)}catch(e){}}FLAT=[]}
 function flatten(){if(!CUR||!CUR.known||CUR.loc==='hollow'||CUR.since<0||!at(CUR.loc)){if(FLAT.length)unflatten();return}const R=ROOM();if(FLAT.length&&FLAT[0][0]!==R)FLAT=[];if(R._mtf===CUR.s.id)return;R._mtf=CUR.s.id;
  for(let b=CUR.ty-4;b<=CUR.ty+5;b++)for(let a=CUR.tx-6;a<=CUR.tx+6;a++){if(((a-CUR.tx)/6.5)**2+((b-CUR.ty-.5)/4.8)**2>1)continue;const it=rgObjAt(R,a,b);if(!it)continue;const i=b*R.w+a;it.gone=true;it._mtf=1;R.solid.delete(i);try{rgCellDel(R,it)}catch(e){}FLAT.push([R,it,i])}}
 // ---- shared numbers: wb/<slot>/d/<uid> ----
 const ST={id:'',tile:-1,spots:{},core:{},veins:VEINS.map(()=>({})),mine:{c:0,v:VEINS.map(()=>0)},sent:{},subs:[],star:new Set(),paid:false,broke:new Set(),done:false,told:{}};
 let PAID=[];// save field mtp: ids already paid
 function reset(id){for(const u of ST.subs)try{u()}catch(e){}ST.subs=[];Object.assign(ST,{id,tile:-1,spots:{},core:{},veins:VEINS.map(()=>({})),mine:{c:0,v:VEINS.map(()=>0)},sent:{},star:new Set(),broke:new Set(),done:false,paid:PAID.includes(id)})}
 function listen(slot,cb){const F=Fb();if(!F||!me())return;try{const r=F.db.ref(F.D,'wb/'+slot+'/d');const u=F.db.onValue(r,s=>{try{cb(s.val()||{})}catch(e){}},()=>{});ST.subs.push(u)}catch(e){}}
 function send(slot,v){const F=Fb(),u=me();if(!F||!u)return;if(ST.sent[slot]===v)return;ST.sent[slot]=v;try{F.db.set(F.db.ref(F.D,'wb/'+slot+'/d/'+u),v).catch(()=>{delete ST.sent[slot]})}catch(e){}}
 function subscribe(s){const id=s.id;listen('mtc'+id,v=>{ST.core=v});VEINS.forEach((_,i)=>listen('mtv'+id+'_'+i,v=>{ST.veins[i]=v}));if(!s.sum)listen('mts'+id,v=>{ST.spots=v})}
 const sumOf=(o,mine)=>{let t=0;const u=me();for(const k in o)if(k!==u)t+=+o[k]||0;return t+(mine||0)};
 const coreLeft=()=>Math.max(0,CFG.hp-sumOf(ST.core,ST.mine.c));
 const veinHits=i=>sumOf(ST.veins[i],ST.mine.v[i]);
 const veinGone=i=>veinHits(i)>=CFG.vhp;
 // the agreed tile for a scheduled strike: the smallest uid's choice, else ours
 // a strike's tile as [tx,ty], or null while unknown (an island strike nobody standing there has placed yet)
 function spotOf(s){if(s.sum)return[s.x,s.y];const isl=s.loc!=='hollow',R=ROOM(),W=isl?(R&&R.region===s.loc?R.w:0):N;
  const ks=Object.keys(ST.spots).filter(k=>+ST.spots[k]>=0).sort();
  if(ks.length){const v=+ST.spots[ks[0]];if(!isl)return[v%N,(v/N)|0];if(W)return[v%W,(v/W)|0];return null}
  if(!W)return null;
  if(ST.tile===-1){ST.tile=isl?pickR(R,s.seed+.123):pick(s.seed+.123);if(ST.tile<0)ST.tile=-2;else if(me())send('mts'+s.id,ST.tile)}
  return ST.tile>=0?[ST.tile%W,(ST.tile/W)|0]:null}
 let CUR=null;// {s, x, y (world px of the centre), phase 'warn'|'hot'|'cold', at}
 function tick(){try{flatten()}catch(e){}const s=current();if(!s){if(ST.id){reset('');CUR=null;hideBanner()}return}
  if(ST.id!==s.id){reset(s.id);subscribe(s)}
  const sp=spotOf(s),n=now();if(!sp&&s.loc==='hollow'){CUR=null;return}const tx=sp?sp[0]:-1,ty=sp?sp[1]:-1;
  CUR={s,loc:s.loc,known:!!sp,x:tx*16+8,y:ty*16+8,tx,ty,phase:n<s.t?'warn':(coreLeft()<=0?'cold':'hot'),left:n<s.t?s.t-n:s.t+HOT-n,since:n-s.t};
  // chat once per strike
  if(!ST.told.w&&CUR.phase==='warn'){ST.told.w=1;tell('☄️ Something is burning across the sky... a meteor is coming down '+where(tx,ty)+'!')}
  if(!ST.told.h&&n>=s.t&&n<s.t+60000){ST.told.h=1;tell('☄️ A meteor crashed down '+where(tx,ty)+'! Mine its core and veins before it cools.')}
  // writes, at most once a second
  if(n-(ST.lastSend||0)>1000){ST.lastSend=n;if(ST.mine.c>0)send('mtc'+s.id,Math.min(190000,ST.mine.c));ST.mine.v.forEach((v,i)=>{if(v>0)send('mtv'+s.id+'_'+i,Math.min(1000,v))})}
  if(CUR.phase==='cold'&&!ST.paid)payCore();
  banner()}
function where(tx,ty){if(CUR&&CUR.loc&&CUR.loc!=='hollow')return'on '+RNAME(CUR.loc);const dx=tx-VX,dy=ty-VY,d=Math.hypot(dx,dy);if(d<20)return'near Hollow village';const a=Math.atan2(dy,dx)*180/Math.PI;
  const dirs=['east','south-east','south','south-west','west','north-west','north','north-east'];return dirs[((Math.round(a/45)%8)+8)%8]+' of Hollow village'}
 function tell(m){try{if(typeof SQMPLOG==='function')SQMPLOG('game',m);else if(window.SQMPLOG)window.SQMPLOG('game',m)}catch(e){}try{say(m)}catch(e){}}
 // ---- rewards when the core breaks ----
 function bestOre(){const L=lv();return L>=60?'adamore':L>=45?'mithore':L>=30?'goldore':'iron'}
 function payCore(){if(ST.paid)return;ST.paid=true;const u=me()||'me',all=Object.assign({},ST.core);if(ST.mine.c>0)all[u]=ST.mine.c;
  if(!(all[u]>0))return;try{SQACH.add('mtcore');if(CUR&&CUR.loc!=='hollow')SQACH.add('mtisl')}catch(e){}const rank=Object.keys(all).filter(k=>all[k]>0).sort((a,b)=>(all[b]-all[a])||(a<b?-1:1)).indexOf(u);const r=CFG.rew[Math.min(3,rank)];if(rank===0)try{SQACH.add('mttop')}catch(e){}
  const ore=bestOre();inv[ore]=(inv[ore]|0)+r[0];inv.meteorore=(inv.meteorore|0)+r[1];PAID.push(ST.id);PAID=PAID.slice(-20);
  try{addXp(MI,Math.round(800+r[1]*20))}catch(e){}
  const pl=['1st','2nd','3rd'][rank];try{sfx('coin')}catch(e){}
  tell('☄️ The meteor core shattered! '+(pl?'You did the '+(rank===0?'most':pl)+' damage: ':'Your share: ')+'+'+r[0].toLocaleString()+' '+(SHORT[ore]||ore)+' and +'+r[1]+' meteorite ore.');
  try{saveLocal(true)}catch(e){}}
 {SQSAVE.after('215:mtp',o=>{try{o.mtp=PAID.slice(-20)}catch(e){}})}
 {SQLOAD.after('215',(sv)=>{try{PAID=Array.isArray(sv&&sv.mtp)?sv.mtp.filter(x=>typeof x==='string').slice(-20):[];ST.paid=PAID.includes(ST.id)}catch(e){}})}
 // ---- hit boxes (world px) ----
 const here=()=>!!(CUR&&CUR.known&&at(CUR.loc));
 const active=()=>here()&&(CUR.phase==='hot'||CUR.phase==='cold')&&CUR.since>=0;
 const inCore=(x,y)=>CUR&&CUR.phase==='hot'&&Math.abs(x-CUR.x)<14&&y>CUR.y-12&&y<CUR.y+8;
 const veinAt=(x,y)=>{if(!CUR)return-1;for(let i=0;i<VEINS.length;i++){if(veinGone(i))continue;const vx=CUR.x+VEINS[i][0],vy=CUR.y+VEINS[i][1];if(Math.abs(x-vx)<8&&y>vy-7&&y<vy+4)return i}return-1};
 const STAR=[];for(let i=0;i<14;i++){const a=i/14*6.283+.2,rr=1.03+((i*5)%3)*.04;STAR.push([Math.cos(a)*RX*rr,Math.sin(a)*RY*rr])}
 const starAt=(x,y)=>{if(!CUR)return-1;for(let i=0;i<STAR.length;i++){if(ST.star.has(i))continue;if(Math.hypot(x-(CUR.x+STAR[i][0]),y-(CUR.y+STAR[i][1]))<9)return i}return-1};
 {const _so=solid;solid=function(px,py){try{if(active()&&(inCore(px,py)||veinAt(px,py)>=0))return true}catch(e){}return _so.apply(this,arguments)}}
 function target(){if(!active())return null;const[fx,fy]=front(13);if(inCore(fx,fy))return{k:'core'};const v=veinAt(fx,fy);if(v>=0)return{k:'vein',i:v};const s=starAt(fx,fy);if(s>=0)return{k:'star',i:s};
  const[gx,gy]=front(6);const s2=starAt(gx,gy);if(s2>=0)return{k:'star',i:s2};return null}
 window.SQHITWORD=()=>{try{const t=target();if(!t)return'';return t.k==='star'?'PICK':'MINE'}catch(e){return''}};
 let LAST=0;
 {SQHIT.wrap('215 meteor strikes',_at=>function(){let t=null;try{t=target()}catch(e){}if(!t||BUILD||pnOpen)return _at.apply(this,arguments);
   const n=performance.now();if(swing>0||n-LAST<330)return;LAST=n;
   if(t.k==='star'){ST.star.add(t.i);const c=1+(Math.random()<.5?1:0);inv.stardust=(inv.stardust|0)+c;try{SQACH.add('mtdust',c)}catch(e){}try{sfx('pickup')}catch(e){}try{gTxt(P.x,P.y-30,'+'+c+' stardust','#c8a8ff')}catch(e){say('+'+c+' stardust')}return}
   if(!(TL.pick>0)){say('You need a pickaxe.');return}
   if(t.k==='vein'){if(lv()<CFG.vlv){say('You need Mining '+CFG.vlv+' to mine meteorite veins.');return}if(TL.pick<4){say('You need a steel pickaxe or better for meteorite.');return}}
   swing=.25;try{ACTN={type:'mine',t:0,dur:.32,face:[face[0],face[1]],tx:Math.floor(CUR.x/16),ty:Math.floor(CUR.y/16),hit:false}}catch(e){}try{sfx('mine')}catch(e){}
   if(t.k==='vein'){const was=veinGone(t.i);ST.mine.v[t.i]++;try{addXp(MI,30)}catch(e){}
    if(!was&&veinGone(t.i)&&!ST.broke.has(t.i)){ST.broke.add(t.i);try{SQACH.add('mtvein')}catch(e){}const c=1+Math.floor(Math.random()*3);inv.meteorore=(inv.meteorore|0)+c;try{addXp(MI,400)}catch(e){}
     try{gTxt(P.x,P.y-30,'+'+c+' meteorite ore','#ff80d8')}catch(e){}say('The vein crumbles. +'+c+' meteorite ore!')}
    else{const left=Math.max(0,CFG.vhp-veinHits(t.i));if(left%10===0)say('The vein is cracking... ('+left+' hits left)')}}
   else{const d=1+(TL.pick|0)+Math.floor(lv()/10);ST.mine.c=Math.min(190000,ST.mine.c+d);try{addXp(MI,6+d)}catch(e){}try{gTxt(CUR.x,CUR.y-26,'-'+d,'#ffb060')}catch(e){}
    if(coreLeft()<=0)payCore()}})}
 // ---- drawing ----
 const sx=x=>(x-camX())*Z,sy=y=>(y-camY())*Z,px=(x,y,c,s)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),s,s)};
 let VF=null;function veinFrames(){if(VF)return VF;let S=null;try{S=hdSprites()}catch(e){}if(!S||!S.ore||!S.ore.length)return null;
  const pals=[['#e070ff','#70e8ff','#ff80d8','#fff0ff'],['#70e8ff','#ff80d8','#e070ff','#ffffff'],['#ff80d8','#e070ff','#70e8ff','#f0ffff']];
  VF=pals.map(pl=>S.ore.map(sp=>{const c=document.createElement('canvas');c.width=sp.width;c.height=sp.height;const x=c.getContext('2d');x.drawImage(sp,0,0);const d=x.getImageData(0,0,c.width,c.height),a=d.data;
   for(let i=0;i<a.length;i+=4){if(!a[i+3])continue;const r=a[i],gg=a[i+1],b=a[i+2],p=(i/4)%c.width+((i/4/c.width)|0),l=(r+gg+b)/3;
    if(r>gg+25&&r>b+40){const h=pl[(p+(r>230?3:0))%4],k=l<110?.6:1;a[i]=parseInt(h.slice(1,3),16)*k;a[i+1]=parseInt(h.slice(3,5),16)*k;a[i+2]=parseInt(h.slice(5,7),16)*k}
    else if(Math.abs(r-gg)<30&&Math.abs(gg-b)<30&&l>40){a[i]=Math.round(l*.55);a[i+1]=Math.round(l*.5);a[i+2]=Math.round(l*.75)}}
   x.putImageData(d,0,0);return c}));return VF}
 const RUB=[[-6,0,'#3a3248'],[-2,-2,'#2c2638'],[3,0,'#3a3248'],[0,1,'#4a4058'],[5,-1,'#2c2638'],[-4,-1,'#ff80d8']];
 const ROCK=['....oooooo....','..oorrmmrroo..','.orrmhhmmrrro.','ormmhyyhmmmrro','ormhyyyhhmmrro','orrmhhyhmhhmro','ormmmhhmhyyhmo','.ormmmmmhyhmo.','..oormmmmmoo..','....oooooo....'];
 function drawVein(i,tm){const F=veinFrames(),vx=CUR.x+VEINS[i][0],vy=CUR.y+VEINS[i][1];
  if(veinGone(i)){for(const[a,b,c]of RUB)px(sx(vx+a),sy(vy+b),c,Z*2);return}
  if(!F)return;const fr=F[Math.floor(tm*3)%3],sp=fr[i%fr.length],w=16*Z,h=w*sp.height/sp.width;g.drawImage(sp,Math.round(sx(vx)-w/2),Math.round(sy(vy)-h+4*Z),w,h)}
 function drawCore(tm){const z=Z*2,hot=CUR.phase==='hot',rx=sx(CUR.x-14),ry=sy(CUR.y-14),pulse=hot?.5+.5*Math.sin(tm*5):0,cool=CUR.left<120000;
  if(!hot){for(const[a,b,c]of RUB)px(sx(CUR.x+a*1.6),sy(CUR.y+b*1.6),c,z);return}
  const RC={o:'#120e14',r:'#4a4058',m:'#2c2638',h:cool?'#8a4030':(pulse>.5?'#ff7020':'#e04818'),y:cool?'#a85a38':(pulse>.5?'#fff0a0':'#ffc040')};
  ROCK.forEach((row,j)=>{for(let i=0;i<row.length;i++){const k=row[i];if(k!=='.'){g.fillStyle=RC[k];g.fillRect(Math.round(rx+i*z),Math.round(ry+j*z),z,z)}}})}
 function drawCrater(tm){const q=2,zq=Z*q,cx=CUR.x,cy=CUR.y,hot=CUR.phase==='hot';
  for(let y=-RY-10;y<=RY+10;y+=q)for(let x=-RX-14;x<=RX+14;x+=q){const d=(x/(RX+14))**2+(y/(RY+10))**2,d0=(x/RX)**2+(y/RY)**2;if(d>1||d0<=1)continue;if(((x*7+y*13)&15)<(d<.9?9:4)){g.fillStyle='#5e4a2e';g.fillRect(Math.round(sx(cx+x)),Math.round(sy(cy+y)),zq,zq)}}
  for(let y=-RY;y<=RY;y+=q)for(let x=-RX;x<=RX;x+=q){const d=(x/RX)**2+(y/RY)**2;if(d>1)continue;let c;
   if(d>.86)c=y<0?'#a88458':'#8a6a44';else if(d>.74)c=y<0?'#5a4430':'#7a5a3c';else if(d>.6)c=y<0?'#3e3026':'#58422e';else c=((x+y)&6)===0&&d<.5?'#2a2220':'#32281f';
   g.fillStyle=c;g.fillRect(Math.round(sx(cx+x)),Math.round(sy(cy+y)),zq,zq)}
  if(hot){const p=Math.sin(tm*4)>0;for(let y=-14;y<=12;y+=q)for(let x=-24;x<=24;x+=q){const d=(x/24)**2+(y/13)**2;if(d>1)continue;g.fillStyle=d<.45?(p?'#7a3418':'#6a2c16'):'#4a2418';g.fillRect(Math.round(sx(cx+x)),Math.round(sy(cy+y)),zq,zq)}}
  // stardust sparkles
  STAR.forEach(([a,b],i)=>{if(ST.star.has(i))return;const ph=(tm*2+i*.37)%1;if(ph>=.55)return;const X=sx(cx+a),Y=sy(cy+b),u=Z;px(X,Y,ph<.2?'#ffffff':'#c8a8ff',u);if(ph<.3){px(X-u,Y,'#8868d8',u);px(X+u,Y,'#8868d8',u);px(X,Y-u,'#8868d8',u);px(X,Y+u,'#8868d8',u)}})}
 const order=()=>{const L=VEINS.map((v,i)=>({y:CUR.y+v[1],f:tm=>drawVein(i,tm)}));L.push({y:CUR.y,f:drawCore});return L.sort((a,b)=>a.y-b.y)};
 const onScreen=()=>CUR&&Math.abs(CUR.x-P.x)<W/Z/2+RX+40&&Math.abs(CUR.y-P.y)<H/Z/2+RY+60;
 function drawGround(){if(!active()||!onScreen())return;const tm=performance.now()/1000;g.save();g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;
   try{drawCrater(tm);for(const o of order())o.f(tm)}catch(e){}g.restore()}
 {const _gh=GROUNDHOOK;GROUNDHOOK=function(){if(_gh)_gh.apply(this,arguments);if(!SCENE)drawGround()}}
 if(typeof ROOMBG!=='undefined'){const _rb=ROOMBG;ROOMBG=function(R2){const out=_rb?_rb.apply(this,arguments):undefined;try{if(R2&&R2.region&&R2===ROOM())drawGround()}catch(e){}return out}}
 // veins and the core in front of you are drawn again over you
 {const _pp=pP;pP=function(){const out=_pp.apply(this,arguments);if(!active()||!onScreen())return out;const tm=performance.now()/1000;g.save();g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;
   try{for(const o of order())if(o.y>P.y+2&&Math.abs(o.y-P.y)<30)o.f(tm)}catch(e){}g.restore();return out}}
 // sky streak, impact flash and ring, smoke (screen space, over the world)
 function fireball(hx,hy,dx,dy,u,len){const cols=['#fff8d0','#ffe060','#ffa020','#f05818','#c02810','#702018','#504048','#383038'];
  for(let i=len;i>=0;i--){const k=Math.min(cols.length-1,Math.floor(i/len*cols.length)),w=Math.max(1,Math.round((1-i/len)*4+1)),jx=((i*7)%3-1)*.6,jy=((i*5)%3-1)*.6;
   for(let a=0;a<w;a++)for(let b=0;b<w;b++)px(hx-dx*i*u*1.1+(a-w/2+jx)*u,hy-dy*i*u*1.1+(b-w/2+jy)*u,cols[k],u)}
  for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)if(a*a+b*b<=5)px(hx+a*u,hy+b*u,a*a+b*b<=1?'#ffffff':a*a+b*b<=2?'#fff8a0':'#ffc030',u)}
 let SHOOK='';
 {const _dh=drawHUD;drawHUD=function(){if(here()&&!dead){g.save();g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;try{const tm=performance.now()/1000;
   if(CUR.phase==='warn'&&CUR.left<10000){const p=1-CUR.left/10000,u=Math.max(2,Math.round(Z*1.1)),cx0=sx(CUR.x),cy0=sy(CUR.y),onS=cx0>0&&cx0<W&&cy0>0&&cy0<H,vx=cx0-W/2,vy=cy0-H/2,vl=Math.hypot(vx,vy)||1,ux=vx/vl,uy=vy/vl,ed=Math.min(W/2/Math.max(.01,Math.abs(ux)),H/2/Math.max(.01,Math.abs(uy)))*1.05,tx=onS?cx0:W/2+ux*ed,ty=onS?cy0:H/2+uy*ed,st={x:W/2-ux*W*.55,y:-H*.08};
    g.fillStyle='rgba(255,110,30,'+(.1+.2*p).toFixed(3)+')';g.fillRect(0,0,W,H);const hx=st.x+(tx-st.x)*p,hy=st.y+(ty-st.y)*p,d=Math.hypot(tx-st.x,ty-st.y);fireball(hx,hy,(tx-st.x)/d,(ty-st.y)/d,u,Math.round(20+40*p))}
   if(CUR.since>=0&&CUR.since<1600&&onScreen()){const k=CUR.since/1600;g.fillStyle='rgba(255,250,235,'+(.5*(1-k)).toFixed(3)+')';g.fillRect(0,0,W,H);const r=20+k*110,n=60;
    g.fillStyle='rgba(255,230,180,'+(1-k).toFixed(3)+')';for(let i=0;i<n;i++){const a=i/n*6.283;g.fillRect(Math.round(sx(CUR.x+Math.cos(a)*r)),Math.round(sy(CUR.y+Math.sin(a)*r*.55)),Z*2,Z*2)}
    if(SHOOK!==CUR.s.id){SHOOK=CUR.s.id;try{shakeScreen(8)}catch(e){}knock()}}
   if(CUR.phase==='hot'&&onScreen())for(let i=0;i<7;i++){const ph=(tm*.35+i/7)%1,X=sx(CUR.x-2+Math.sin(i*2.1+tm)*4+ph*10),Y=sy(CUR.y-18-ph*60),s=Math.round(Z*(3+ph*5));g.fillStyle='rgba(90,84,96,'+(.55*(1-ph)).toFixed(3)+')';g.fillRect(Math.round(X-s/2),Math.round(Y-s/2),s,s)}
  }catch(e){}g.restore()}return _dh.apply(this,arguments)}}
 // knocked back from the landing spot, and never left inside a vein or the core
 function knock(){if(!here())return;const d=Math.hypot(P.x-CUR.x,(P.y-CUR.y)*1.8);if(d>RX+10)return;const a=Math.atan2(P.y-CUR.y,P.x-CUR.x)||Math.PI/2;
  for(let r=RX+14;r<RX+140;r+=8){const x=CUR.x+Math.cos(a)*r,y=CUR.y+Math.sin(a)*r*.6;if(!solid(x,y)){P.x=x;P.y=y;return}}}
 function unstick(){if(!active())return;if(!(inCore(P.x,P.y)||veinAt(P.x,P.y)>=0))return;for(let r=6;r<60;r+=3)for(const[a,b]of[[0,1],[1,0],[-1,0],[0,-1]]){const x=P.x+a*r,y=P.y+b*r;if(!solid(x,y)){P.x=x;P.y=y;return}}}
 // ---- banner ----
 const css=document.createElement('style');css.textContent='#mtb{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 6px);z-index:9;display:none;width:min(340px,calc(100vw - 24px));box-sizing:border-box;padding:6px 10px 8px;font:700 13px "Pixelify Sans",monospace;pointer-events:none;text-align:center;background:#1e1830;color:#f0e8ff;border:2px solid #000;box-shadow:inset 0 0 0 2px #8868d8}#mtb .t{display:flex;justify-content:space-between;gap:8px}#mtb .bar{height:9px;margin-top:5px;background:#100c18;border:2px solid #000;position:relative}#mtb .bar i{position:absolute;left:0;top:0;bottom:0;background:#e04830}#mtb small{display:block;font-weight:500;font-size:11px;opacity:.85;margin-top:3px}body.sqmtb #wbb{top:calc(env(safe-area-inset-top,0px) + 74px)!important}';document.head.appendChild(css);
 const bn=document.createElement('div');bn.id='mtb';document.body.appendChild(bn);let BL='';
 const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
 function hideBanner(){if(bn.style.display!=='none'){bn.style.display='none';document.body.classList.remove('sqmtb');BL=''}}
 function banner(){let show=CUR&&!pnOpen&&!menuOpen&&!(window.SQTITLE&&SQTITLE());if(show&&CUR.phase==='cold'&&now()-(ST.coldAt||(ST.coldAt=now()))>20000)show=false;
  if(!show){hideBanner();return}let h;const w=where(CUR.tx,CUR.ty);
  if(CUR.phase==='warn')h='<div class="t"><span>☄️ A METEOR IS FALLING</span><span>'+mmss(CUR.left)+'</span></div><small>Coming down '+w+'</small>';
  else if(CUR.phase==='hot'){const L=coreLeft();h='<div class="t"><span>☄️ METEOR STRIKE</span><span>'+mmss(CUR.left)+'</span></div><div class="bar"><i style="width:'+(L/CFG.hp*100).toFixed(1)+'%"></i></div><small>Meteor core '+L.toLocaleString()+' / '+CFG.hp.toLocaleString()+' · '+w+'</small>'}
  else h='<div class="t"><span>☄️ THE METEOR CORE SHATTERED</span><span></span></div><small>'+w+' · the veins are still there until it cools</small>';
  if(h!==BL){BL=h;bn.innerHTML=h}bn.style.display='block';document.body.classList.add('sqmtb')}
 // ---- maps ----
 function mark(x,cx,cy,s){const t=performance.now()/1000,pr=s*(1.1+.35*Math.abs(Math.sin(t*3)));x.save();x.lineWidth=Math.max(1.5,s*.18);x.strokeStyle='rgba(200,150,255,.95)';x.beginPath();x.arc(cx,cy,pr,0,6.283);x.stroke();
  x.fillStyle='rgba(20,12,32,.85)';x.beginPath();x.arc(cx,cy,s*.8,0,6.283);x.fill();x.font=Math.round(s*1.15)+'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('☄️',cx,cy+s*.05);x.restore()}
 if(typeof drawMini52==='function'){const _dm=drawMini52;drawMini52=function(){const out=_dm.apply(this,arguments);try{if(!here())return out;const t=miniTarget();if(!t||(t.k==='hollow')!==(CUR.loc==='hollow'))return out;const L=hudLayout(),U=L.U,w=(L.mw||L.dw),hh=w*t.h/t.w,x0=L.dx+L.dw-w,y0=L.top+L.dh+46*U;
   g.save();g.setTransform(1,0,0,1,0,0);mark(g,x0+CUR.tx/t.w*w,y0+CUR.ty/t.h*hh,4*U);g.restore()}catch(e){}return out}}
 if(typeof drawMap==='function'){const _dmp=drawMap;drawMap=function(){const out=_dmp.apply(this,arguments);try{if(!here()||CUR.loc!=='hollow'||(typeof MAPVIEW!=='undefined'&&MAPVIEW==='world'))return out;const c=document.getElementById('mpc');if(!c)return out;mark(c.getContext('2d'),CUR.tx,CUR.ty,Math.max(3,c.width/45))}catch(e){}return out}}
 // ---- the dev command: /meteorite [here|stop] ----
 function summon(how){const F=Fb();if(!(window.SQDEV&&SQDEV()))return false;if(!F||!me()){say('Sign in first.');return true}
  if(how==='stop'){F.db.set(F.db.ref(F.D,'events/met'),null).then(()=>say('Meteor called off.')).catch(e=>say('Couldn\'t stop it: '+(e&&e.message||e)));return true}
  let t=-1,loc='hollow';const R=ROOM();if(how==='here'){if(SCENE&&!R){say('Go outside first.');return true}if(R){loc=R.region;t=nearestOkR(R,Math.floor(P.x/16),Math.floor(P.y/16))}else t=nearestOk(Math.floor(P.x/16),Math.floor(P.y/16))}else t=pick(Math.random()*1000);
  if(t<0){say('No clear spot for a crater there. Try somewhere more open.');return true}
  const W0=loc==='hollow'?N:R.w,tt=now()+WARN,rec={t:tt,x:t%W0,y:(t/W0)|0,id:'d'+tt,loc};CUR=null;
  F.db.set(F.db.ref(F.D,'events/met'),rec).then(()=>say('☄️ Meteor summoned: it lands '+(loc==='hollow'?where(rec.x,rec.y):'on '+RNAME(loc))+' in 60 seconds.')).catch(e=>say('Couldn\'t summon it: '+(e&&e.message||e)));return true}
 if(typeof window.mpSend==='function'){const _ms=window.mpSend;window.mpSend=function(t){const m=/^\/meteor(?:ite)?(?:\s+(here|stop))?\s*$/i.exec(String(t||'').trim());if(m&&summon((m[1]||'').toLowerCase()))return;return _ms.apply(this,arguments)}}
 // the summoned record
 let subbed=false;function watch(){if(subbed)return;const F=Fb();if(!F||!me())return;subbed=true;try{F.db.onValue(F.db.ref(F.D,'events/met'),s=>{const v=s.val();const loc=v&&LOCS.includes(v.loc)?v.loc:'hollow';SUM=v&&typeof v.t==='number'&&v.x>=0&&v.y>=0&&v.x<400&&v.y<400&&(loc!=='hollow'||(v.x<N&&v.y<N))?{t:v.t,x:v.x|0,y:v.y|0,loc,id:String(v.id||('d'+v.t)).replace(/[^a-z0-9]/gi,'').slice(0,20)}:null},()=>{subbed=false})}catch(e){subbed=false}}
 let lastT=0;
 {SQUPD.after('215',()=>{const n=performance.now();if(n-lastT>250){lastT=n;try{watch();tick()}catch(e){console.warn('meteor',e)}}try{unstick()}catch(e){}})}
 // ---- achievements ----
 try{const A=SQACH.A,c=k=>()=>SQACH.counters[k]|0,ad=(id,n,d,k,goal,gold)=>{if(!A.some(a=>a.id===id))A.push({g:'Meteors',id,n,d,val:c(k),goal,gold})};
  ad('met1','Starfall','Help break a meteor core','mtcore',1,300);ad('met10','Meteor Chaser','Help break 10 meteor cores','mtcore',10,2500);
  ad('mettop','Biggest Hitter','Do the most damage to a meteor core','mttop',1,1000);ad('metvein','Star Miner','Break 25 meteorite veins','mtvein',25,1500);
  ad('metdust','Stardust Collector','Pick up 50 stardust','mtdust',50,500);ad('metisl','Far From Home','Help break a meteor core on an island','mtisl',1,750)}catch(e){}
 window.SQMETEOR={CFG,ST,LOCS,flat:()=>FLAT.length,cur:()=>CUR,pick,ok,okR,pickR,nearestOk,sched,current,summon,coreLeft,veinGone,
  test:(dt,tile)=>{const a=now()+(dt==null?WARN:dt),R=ROOM(),loc=R?R.region:'hollow',W0=R?R.w:N,t=tile!=null?tile:(R?nearestOkR(R,Math.floor(P.x/16),Math.floor(P.y/16)):nearestOk(Math.floor(P.x/16),Math.floor(P.y/16)));CUR=null;SUM={t:a,x:t%W0,y:(t/W0)|0,loc,id:'t'+Math.round(a)};return SUM}}})();
