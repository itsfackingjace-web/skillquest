// ---------------------------------------------------------------- 88. Islands update, part 2
// Fishing and weather on every island, each island's own fish, calmer monsters, the Ironcrest caves and mines,
// ores and trees that look like what they drop, wolf and tree pets, Shattered Expanse sharks, and how castles look.
{
// ---- Fishing: each island's own fish (the water check itself now reads the island you're on) ----
const RFISH={briarwood:[{k:'pike',n:'Pike',lv:15,xp:55,heal:3,hun:50,raw:10,ckv:22,c:'#7a9a50',cc:'#a8783c'},{k:'gcarp',n:'Golden carp',lv:30,xp:85,heal:3,hun:60,raw:24,ckv:40,c:'#f0b030',cc:'#c88830'}],
 ashfall:[{k:'eeel',n:'Ember eel',lv:30,xp:90,heal:4,hun:65,raw:18,ckv:36,c:'#e85a28',cc:'#a84020'},{k:'lsnap',n:'Lava snapper',lv:45,xp:120,heal:4,hun:75,raw:28,ckv:50,c:'#c83838',cc:'#902818'}],
 ironcrest:[{k:'icod',n:'Ice cod',lv:40,xp:110,heal:4,hun:70,raw:22,ckv:44,c:'#a8d0f0',cc:'#b8a080'},{k:'gchar',n:'Glacier char',lv:55,xp:150,heal:5,hun:85,raw:34,ckv:62,c:'#68b0c8',cc:'#c07850'}],
 shattered:[{k:'vray',n:'Void ray',lv:60,xp:170,heal:5,hun:85,raw:40,ckv:70,c:'#7048b8',cc:'#584078'},{k:'cangl',n:'Crystal angler',lv:75,xp:220,heal:6,hun:95,raw:60,ckv:100,c:'#c0a8f8',cc:'#9878c0'}]};
const FCOL={};
for(const id in RFISH)for(const f of RFISH[id]){const isle=WORLD_REGIONS[id].name;INVK.push(f.k,'c'+f.k);if(typeof EXTRA_BAG!=='undefined')EXTRA_BAG.push(f.k,'c'+f.k);
 INAME[f.k]='Raw '+f.n.toLowerCase();INAME['c'+f.k]='Cooked '+f.n.toLowerCase();IDESC[f.k]='Only bites in the waters of '+isle+' (Fishing '+f.lv+'). Cook it at a campfire (Cooking '+f.lv+').';
 IDESC['c'+f.k]='A hearty fish from '+isle+'. Restores food and '+f.heal+' hearts.';SELLP[f.k]=f.raw;SELLP['c'+f.k]=f.ckv;SN[f.k]='Raw '+f.n.toLowerCase();SN['c'+f.k]='Cooked '+f.n.toLowerCase();
 if(typeof SHORT!=='undefined'){SHORT[f.k]='raw '+f.n.toLowerCase();SHORT['c'+f.k]='cooked '+f.n.toLowerCase()}
 COOKS.push({raw:f.k,ck:'c'+f.k,n:f.n.toLowerCase(),lv:f.lv,xp:Math.round(f.xp*1.3)});FOODS.push({k:'c'+f.k,n:'cooked '+f.n.toLowerCase(),heal:f.heal,hun:f.hun});FCOL[f.k]=f.c;FCOL['c'+f.k]=f.cc}
FOODS.sort((a,b)=>b.heal-a.heal||b.hun-a.hun);
{const _ic=iconURL;iconURL=function(k,col){if(!FCOL[k])return _ic(k,col);const key='rf_'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),cl=FCOL[k];
  const r=(a,b,w,h,q)=>{x.fillStyle=q;x.fillRect(a+1,b+1,w,h)},e=(cx,cy,rx,ry,q)=>{x.fillStyle=q;for(let j=0;j<12;j++)for(let i=0;i<12;i++)if(((i+.5-cx)/rx)**2+((j+.5-cy)/ry)**2<=1)x.fillRect(i+1,j+1,1,1)};
  e(5.5,6,4.7,2.8,'#202838');e(5.5,6,4.3,2.4,cl);r(9,4,2,1,cl);r(10,5,1,2,cl);r(9,7,2,1,cl);r(2,5,1,1,'#202020');r(3,7,4,1,'#ffffff40');if(k[0]==='c')r(4,4,3,1,'#00000030');
  return ICONC[key]=c.toDataURL()}}
const _cf=catchFish;catchFish=function(){const R=SCENE&&SCENE.room,L=lvOf(9),list=R&&R.region&&RFISH[R.region]?RFISH[R.region].filter(f=>L>=f.lv):[];
 if(!list.length||Math.random()>.5)return _cf();const f=list[Math.random()<.7?0:list.length-1];
 if(Math.random()<Math.min(.85,.45+L*.01)){inv[f.k]=(inv[f.k]|0)+1;addXp(9,f.xp);say('You catch a '+f.n.toLowerCase()+'!');sfx('pickup');try{gTxt(FISH.bx,FISH.by-24,f.n,'#58a8ff')}catch(e){}}else say('It got away...');
 FISH.t=0;FISH.bite=0;FISH.wait=(2+Math.random()*3)*Math.max(.6,1-L*.006)};
window.SQRFISH=RFISH;
// casting on the other islands (their attack goes through the island's own handler, which never reached fishing)
{const _a=attack;attack=function(){const R=SCENE&&SCENE.room;if(R&&R.region&&!dead&&!menuOpen&&!pnOpen&&!BUILD){
   if(FISH){FISH=null;say('You reel in your line');return}
   if(swing<=0&&!facingNpc()){const[fx,fy]=front(14),tx=Math.floor(fx/16),ty=Math.floor(fy/16);
    if(fishWaterAt(tx,ty)&&!en.some(n=>!n.dead&&Math.hypot(n.x-fx,n.y-fy)<18)&&!(window.SQSHK&&SQSHK.list.some(q=>!q.dead&&Math.hypot(q.x-fx,q.y-fy)<22))){
     if(!TL.rod){say('You need a fishing rod - buy one at the general store');return}
     const[bx,by]=front(24);FISH={px:P.x,py:P.y,bx,by,t:0,wait:2+Math.random()*3,bite:0};sfx('cast');say('You cast your line...');return}}}
  return _a()}}
// the line and bobber, drawn on the other islands too
{const _dr=drawRoom;drawRoom=function(tm){_dr(tm);const R=SCENE&&SCENE.room;if(!FISH||!R||!R.region)return;
  const hx=Math.round(P.x+face[0]*6),hy=Math.round(P.y-3+(face[1]>0?2:0)),rx=Math.round(P.x+face[0]*13+(face[1]?4:0)),ry=Math.round(P.y-13+face[1]*7),bx=Math.round(FISH.bx),by=Math.round(FISH.by)+(FISH.bite>0?2:Math.round(Math.sin(tm*3)));
  pline(hx,hy,rx,ry,'#7a4a20');pline(rx,ry,bx,by-1,'rgba(240,240,255,.75)');
  if(FISH.bite>0){const r=3+Math.round((.45-FISH.bite)*14);for(let k=0;k<12;k++){const an=k/12*6.283;Rg(bx+Math.cos(an)*r,by+1+Math.sin(an)*r*.5,1,1,'#e8f8ff')}}
  Rg(bx-2,by-3,4,5,O);Rg(bx-1,by-2,2,2,'#e83030');Rg(bx-1,by,2,1,'#fff')}}

// ---- Weather on every island: rain in Briarwood and the Shattered Expanse, snow in Ironcrest's high country, ash haze on Ashfall ----
{const _b=biomeHere;biomeHere=function(){const R=SCENE&&SCENE.room;if(!(R&&R.region))return _b();if(R.region==='ashfall')return'desert';
  if(R.region==='ironcrest'){const x=Math.floor(P.x/16),y=Math.floor(P.y/16);let s=0;for(let dy=-4;dy<=4;dy+=2)for(let dx=-5;dx<=5;dx+=2){const t=R.tiles[(y+dy)*R.w+x+dx];if(t===4||t===12)s++}return s>=10?'snow':'grass'}return'grass'}}

// ---- Calmer monsters ----
// Fewer of them (a small fixed number at night on Hollow, lower caps everywhere else), they only come for you once you're
// close (or you hit them), they chase more slowly, and after a hit you get a moment longer before the next one lands.
for(const id in RG_FAUNA){const F=RG_FAUNA[id];F.cap={day:Math.max(2,Math.round(F.cap.day*.5)),night:Math.max(3,Math.round(F.cap.night*.55))}}
{const AG=95,PROV=6;const _u=upd;upd=function(dt){const pre=new Map(),live=!dead&&!menuOpen&&!pnOpen;
  if(live)for(const n of en){if(n.dead||n._rp||n._wb||n.type==='boss'||n.type==='bonelord'||n.big||n.summon||n._pet)continue;pre.set(n,[n.x,n.y,n.hp])}
  const hp0=P.hp;_u(dt);
  for(const[n,[x,y,h]]of pre){if(n.dead)continue;if(n.hp<h)n._prov=PROV;else if(n._prov>0)n._prov-=dt;
   const d0=Math.hypot(x-P.x,y-P.y),d1=Math.hypot(n.x-P.x,n.y-P.y),calm=d0>AG&&!(n._prov>0);
   if(calm&&n.tcd!==undefined)n.tcd=Math.max(n.tcd,.4);
   if(d1<d0){if(calm){n.x=x;n.y=y}else{n.x=x+(n.x-x)*.72;n.y=y+(n.y-y)*.72}}}
  if(live&&P.hp<hp0)hurt=Math.max(hurt,1.5)}}

// ---- Ironcrest caves and mines ----
// Two mines (by the abandoned mining camps) and two caves (in the cliffs set aside for them). Each is three floors,
// rebuilt every day, with ore veins (gold, mithril and adamant deeper down), chests and Ironcrest's creatures.
// Campfires work inside them: build one to cook, heal and keep the monsters back. Walk out (or take the exit door at
// the bottom) to come back out on Ironcrest.
const ICMOB=[['wolf:snow',.35],['skel:rime',.6],['slime:frost',.85],['bat',1]],BWMOB=[['slime:moss',.3],['wolf:briar',.6],['bat',.8],['skel',1]];
const ICV={icmine:{name:'Old Ironcrest Mine',floor:['#6e5c48','#665440'],wall:'#4e4034',trim:'#2e2620',W:56,H:40,mine:1,at:'mcamp0',rg:'ironcrest',floors:6,noboss:1,mob:ICMOB},
 icmine2:{name:'Deepvein Mine',floor:['#605448','#584c40'],wall:'#463c32',trim:'#28221c',W:58,H:42,mine:1,at:'mcamp1',rg:'ironcrest',floors:6,noboss:1,mob:ICMOB},
 icave:{name:'Frostvein Cave',floor:['#7c8ea0','#748698'],wall:'#506478',trim:'#2c3848',W:60,H:44,at:'dungeon0',rg:'ironcrest',floors:6,noboss:1,cavey:1,mob:ICMOB},
 icave2:{name:'Howling Cavern',floor:['#6c7a88','#647280'],wall:'#46525e',trim:'#262e38',W:62,H:44,at:'dungeon1',rg:'ironcrest',floors:6,noboss:1,cavey:1,mob:ICMOB},
 bwroot:{name:'Thornroot Hollow',floor:['#4e5e3a','#465632'],wall:'#2e3a24',trim:'#18200f',W:60,H:44,at:'dungeon0',rg:'briarwood',floors:6,cavey:1,mob:BWMOB,ore:4}};
for(const k in ICV)DKIND[k]=ICV[k];
const isIcv=k=>!!ICV[k];
window.fireKey64=()=>SCENE&&SCENE.room&&SCENE.room.icv?'icv:'+SCENE.id:curRegion();
{const _bf=buildFloor;buildFloor=function(kind,f){const R=_bf(kind,f);if(!isIcv(kind))return R;R.icv=1;const D=R.dun,W=R.w,G=D.G;D.bossSpawned=1;D.label=ICV[kind].name.replace(/^Old /,'');
  const rnd=dRng(today()*131+f*977+kind.length*7),cells=[];for(let i=0;i<W*R.h;i++){const x=i%W,y=(i/W)|0;if(!G[i]&&!R.solid.has(i)&&x>2&&y>3&&x<W-3&&y<R.h-4&&(Math.abs(x-R.ex)>3||y<R.h-6))cells.push(i)}
  const used=new Set(R.items.map(it=>it.y*W+it.x)),free=i=>{const x=i%W,y=(i/W)|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const j=(y+dy)*W+x+dx;if(G[j]||used.has(j))return false}return true};
  // mines: wooden supports instead of tomb pillars, carts instead of urns
  for(const it of R.items){if(ICV[kind].mine){if(it.t==='pillar')it.t='ic_beam';else if(it.t==='urn')it.t='ic_cart'}}
  // ore veins (a lot in the mines)
  const nOre=ICV[kind].ore!=null?ICV[kind].ore+f:ICV[kind].mine?12+3*f:6+2*f;let placed=0;
  for(let t=0;t<800&&placed<nOre;t++){const i=cells[Math.floor(rnd()*cells.length)];if(i===undefined||!free(i))continue;const r=rnd(),deep=f/3;
   const ty=r<.25?'rock':r<.5?'ore':r<.5+.22*(1-deep*.5)?'gold':r<.88?'mith':'adam';R.items.push({t:'_obj',o:{t:ty,hp:OHP[ty]||4},x:i%W,y:(i/W)|0,solid:true,dmine:1});R.solid.add(i);used.add(i);placed++}
  // Ironcrest's creatures (fewer than a tomb's)
  R.mobs.length=0;const nm=5+2*f,MT=ICV[kind].mob||ICMOB;for(let t=0;t<600&&R.mobs.length<nm;t++){const i=cells[Math.floor(rnd()*cells.length)];if(i===undefined||used.has(i))continue;const x=(i%W)*16+8,y=((i/W)|0)*16+8;
   if(Math.hypot(x-R.ex*16,y-R.h*16)<200)continue;const r=rnd(),hp=(ICV[kind].rg==='briarwood'?8:12)+5*f,e=MT.find(q=>r<q[1])||MT[MT.length-1];
   const m=rgMake(e[0],e[0]==='bat'?Math.round(hp*.7):hp,x,y);m.icv=1;R.mobs.push(m)}
  return R}}
// going in (and every floor keeps the way back out to Ironcrest)
{const _es=enterScene;enterScene=function(id,house,ret){const carry=SCENE&&SCENE.prev&&SCENE.room&&SCENE.room.icv?SCENE.prev:null;_es(id,house,ret);if(carry&&SCENE&&!SCENE.prev&&SCENE.room&&SCENE.room.icv)SCENE.prev=carry}}
{const _ls=leaveScene;leaveScene=function(){const R=SCENE&&SCENE.room;if(R&&R.icv&&R.dun&&R.dun.f>1){dGo(R.dun.kind,R.dun.f-1,'below');return}return _ls()}}
function icvEnter(it){if(dead||TRAVEL49)return;const kind=it.kind,R=dFloor(kind,1);enterScene(dKey(kind,1),null,{x:it.x*16+8,y:(it.y+1)*16+8});dArrive(R,null);
 say('You enter '+ICV[kind].name+'. Six floors deep'+(ICV[kind].noboss?', rich in ore':', and something old waits at the bottom')+'. Campfires work down here.');msgT=5}
// the entrances on Ironcrest
function icvPlace(R){if(R._icv||!R.region)return;R._icv=1;const W=R.w,walk=(x,y)=>x>1&&y>1&&x<W-2&&y<R.h-2&&RG_WALK[R.tiles[y*W+x]]&&!R.solid.has(y*W+x);
 const fit=(x,y)=>{for(let dy=-1;dy<=2;dy++)for(let dx=-1;dx<=1;dx++)if(!walk(x+dx,y+dy))return false;return true};
 const clear=(x,y)=>{for(let dy=-1;dy<=2;dy++)for(let dx=-1;dx<=1;dx++){const it=rgObjAt(R,x+dx,y+dy);if(it){it.gone=true;rgCellDel(R,it);R.solid.delete((y+dy)*W+x+dx)}}};
 const near=(cx,cy)=>{for(let r=0;r<14;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=cx+dx,y=cy+dy;if(!(x>1&&y>1&&x<W-2&&y<R.h-3))continue;
   let ok=true;for(let b=-1;b<=2&&ok;b++)for(let a=-1;a<=1;a++){const i=(y+b)*W+x+a;if(!RG_WALK[R.tiles[i]]){ok=false;break}}if(ok&&(R.reach?R.reach[(y+2)*W+x]:1))return[x,y]}return null};
 const dun=R.reserved.filter(q=>(q.kind||q.t||q.id)==='dungeon'&&q.w>=6);
 for(const k in ICV){if(ICV[k].rg!==R.region)continue;let spot=null;const at=ICV[k].at;
  if(at.startsWith('mcamp')){const l=R.lms.find(q=>q.id===at);if(l)spot=near(l.x+4,l.y+2)}else{const q=dun[+at.slice(-1)];if(q)spot=near(q.x+Math.floor(q.w/2),q.y+Math.floor(q.h/2))}
  if(!spot)continue;const[x,y]=spot;clear(x,y);const it={t:'icvdoor',kind:k,x,y,name:ICV[k].name,use:'icv',w:1,h:1};R.items.push(it);R.useItems.push(it);try{rgCellAdd(R,it)}catch(e){}
  for(const[a,b]of[[-1,0],[1,0],[-1,-1],[0,-1],[1,-1]])R.solid.add((y+b)*W+x+a)}}
{const _lr=loadRegion;loadRegion=function(id,want,ret){const ok=_lr(id,want,ret);try{const R=SCENE&&SCENE.room;if(ok&&R&&R.region)icvPlace(R)}catch(e){console.warn(e)}return ok}}
{const _uf=useFurn;useFurn=function(it){if(it&&it.use==='icv'){icvEnter(it);return}return _uf(it)}}
{const _u=upd;upd=function(dt){_u(dt);if(dead||menuOpen||pnOpen||TRAVEL49)return;const R=SCENE&&SCENE.room;if(!R||!R.region||face[1]>=0||(window.SQRSAIL&&SQRSAIL.on))return;
  for(const it of R.useItems)if(it.use==='icv'&&Math.abs(P.x-(it.x*16+8))<8&&P.y<(it.y+1)*16+2&&P.y>it.y*16){icvEnter(it);return}}}
// campfires in the caves: lit, drawn, cooking and keeping monsters away like outside
{const _p=pP;pP=function(tm){const R=SCENE&&SCENE.room;if(R&&R.icv)for(const f of fires)if(!f._glow)try{pF(f,tm)}catch(e){}return _p(tm)}}
window.SQICV=ICV;

// ---- Ores and trees look like what they drop ----
// The scorched trees of Ashfall and the dark trees of the Shattered Expanse used one sprite for every kind of wood, and
// every crystal vein looked the same whatever ore it held. Higher-tier trees now always show their own colors, and
// crystal veins are tinted by their ore: lavender iron, gold, blue mithril, green adamant.
const TIER=window.SQTIER||{};
if(TIER.oak)TIER.oak.col=['#2e6e2a','#3c8a34','#58a848','#1c4a1c'];
if(TIER.willow)TIER.willow.col=['#98b840','#b4d058','#d8ec88','#6a8a28'];
const CTINT={gold:[46,.85],mith:[222,.8],adam:[140,.7]},CRYC={};
function crystalFor(t,v){const base=rgSprite('crystal',v);if(!CTINT[t]||!base)return base;const key=t+v;if(CRYC[key])return CRYC[key];const[hue,sat]=CTINT[t],c=document.createElement('canvas');c.width=base.c.width;c.height=base.c.height;
 const x=c.getContext('2d');x.drawImage(base.c,0,0);const im=x.getImageData(0,0,c.width,c.height),d=im.data;
 for(let i=0;i<d.length;i+=4){if(d[i+3]<10)continue;const r=d[i]/255,g2=d[i+1]/255,b=d[i+2]/255,mx=Math.max(r,g2,b),mn=Math.min(r,g2,b),l=(mx+mn)/2;if(mx-mn<.12)continue;
  const s=sat,q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,h=hue/360,f=t2=>{let t=t2;if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p};
  d[i]=f(h+1/3)*255;d[i+1]=f(h)*255;d[i+2]=f(h-1/3)*255}x.putImageData(im,0,0);return CRYC[key]={c,ox:base.ox,oy:base.oy,ww:base.ww,hh:base.hh}}
{const _df=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='_obj'&&it.o&&it.o.v&&TIER[it.o.t]){const o=it.o;
   if(o.v==='crystal'){const bx=it.x*16+8,by=it.y*16+14,s=o.shake>0?(o.shake-=.016,Math.round(Math.sin(tm*60))):0;shd(bx,by-1,12);hdPut(crystalFor(o.t,(it.x*7+it.y*3)&1),it.x*16+s,it.y*16);
    const gl={gold:'248,208,72',mith:'110,140,255',adam:'90,220,130'}[o.t]||'190,150,255';g.fillStyle='rgba('+gl+','+(.1+.08*Math.sin(tm*2+it.x))+')';g.beginPath();g.arc(bx,by-8,12,0,6.283);g.fill();return}
   const v=o.v;o.v=null;try{return _df(it,tm)}finally{o.v=v}}
  return _df(it,tm)}}

// ---- Pets: wolves (1 in 1,000 from each kind of wolf) and a little tree (1 in 5,000 trees chopped) ----
// A pet wolf looks just like the wolves it comes from, with a red collar.
const NPET={pwolf:{n:'Wolf',src:'wolves on Hollow Island',v:{}},pbriar:{n:'Briar wolf',src:'briar wolves on Briarwood Isle',v:{rv:'briar'}},psnow:{n:'Snow wolf',src:'snow wolves',v:{vr:'snow'}},
 pvoid:{n:'Void wolf',src:'void wolves on the Shattered Expanse',v:{rv:'void'}},ptree:{n:'Treeling',src:'chopping trees (1 in 5,000)'}};
if(window.LUX&&LUX.PETS)for(const k in NPET)if(!LUX.PETS.some(p=>p.k===k))LUX.PETS.push({k,n:NPET[k].n,v:0,rare:1,c:['#888','#666','#aaa']});
function givePet(k){const C=LUX.COS;const had=C.pets.includes(k);if(!had)C.pets.push(k);C.pet=k;try{saveLocal(true);saveCloud(true)}catch(e){}
 setTimeout(()=>{say(had?'Another '+NPET[k].n.toLowerCase()+' wants to follow you... you already have one.':'A PET '+NPET[k].n.toUpperCase()+'! It follows you now. (START → Style to change pets)');msgT=6;try{sfx('level')}catch(e){}},300)}
window.SQGIVEPET=givePet;
const wolfPetOf=n=>{if(!n||n.type!=='wolf'||n._pet)return null;if(n.vr==='snow'||n.rv==='snow')return'psnow';if(n.rv==='briar')return'pbriar';if(n.rv==='void')return'pvoid';if(n.rv||n.vr)return null;return'pwolf'};
function rollWolf(n){if(!n||n._petRoll)return;n._petRoll=1;const k=wolfPetOf(n);if(k&&(Math.random()<1/1000||window.SQPETDROP))givePet(k)}
{const _ed=enemyDrop;enemyDrop=function(n){_ed(n);try{rollWolf(n)}catch(e){}}}
if(typeof killEnemy==='function'){const _ke=killEnemy;killEnemy=function(n,...a){const r=_ke(n,...a);try{if(n&&n.dead)rollWolf(n)}catch(e){}return r}}
{const _a=attack;attack=function(){let tt=null,tv=null;try{const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16),R=SCENE&&SCENE.room;
   if(R&&R.region){const it=rgObjAt(R,tx,ty);tt=it&&it.o.t;tv=it&&it.o.v}else if(!SCENE&&tx>=0&&ty>=0&&tx<N&&ty<N){const o=obj[ty*N+tx];tt=o&&o.t;tv=o&&o.v}}catch(e){}
  const w0=inv.wood|0;_a();if(tt&&tt!=='cactus'&&(inv.wood|0)>w0&&(Math.random()<1/5000||window.SQTREEDROP))givePet(window.SQTREEPET?SQTREEPET(tt,tv):'ptree')}}
// drawing them
const SIDEPAL={K:'#181018',W:'#f4f0e8',E:'#181018',N:'#e07080',R:'#3870d8'},SIDECOL={cat:{A:'#e88a38',B:'#b85e20',C:'#f8b868',T:'#c06a24',L:'#b85e20'},dog:{A:'#b07848',B:'#7c4e2c',C:'#d8a878',T:'#8a5a34',L:'#7c4e2c'},fox:{A:'#e86a20',B:'#a8440e',C:'#f89848',T:'#a8440e',L:'#3a2418'}};
const SIDEMAP={cat:[["............K...K.","..K........KAK.KAK",".KAK.......KAAKAAK",".KAK.......KAAAAAK","..KAK......KAEAEAK","...KAKKKKKKKAAANAK","....KAACCCAAKCCCK.","....KAATAAATAAAKK.","....KAAAAAAAAAAK..","....KBAATAAATABK..","....KBBBBBBBBBBK.."],["....KLK.KK..KLK...","....KK..KLK..KK...","....KLK.KK..KLK...","....KK...KK.KK...."]],
 dog:[["..............KK..",".............KBBK.","............KBAAAK","............KAAEAAKK",".K..........KAAAAANK","KAK.........KBAAACK.",".KAK.KKKKKKKKRRRKK..","..KKAAAACCCAAAAK....","...KAAAAAAAAAAAK....","...KAAAAAAAAAABK....","...KBBBBBBBBBBBK...."],["...KLK.KK..KLK.KK...","...KK..KLK..KK.KLK..","...KLK.KK..KLK.KK...","...KK..KLK..KK.KLK.."]],
 fox:[["..............K.K.",".............KAKAK","............KAAAAK","..KKK.......KAEAAKK",".KCAAK......KAAAAACK","KWCAAAK.....KWAACCKK","KWAAAAKKKKKKKWWWKK..",".KWAAAAAAAAAAAAWK...","..KKAAAAAAAAAAAWK...","....KAAAAAAAAAABK...","....KBBBBBBBBBBBK..."],["....KLK.KK..KLK.KK..","....KK..KLK..KK.KLK.","....KLK.KK..KLK.KK..","....KK..KLK..KK.KLK."]]};
const SIDEC={};function sideSprite(k,f){const key=k+f;if(SIDEC[key])return SIDEC[key];const[rows,legs]=SIDEMAP[k],all=rows.concat([legs[f*2],legs[f*2+1]]),w=Math.max(...all.map(r=>r.length)),c=document.createElement('canvas');c.width=w;c.height=all.length;
 const x=c.getContext('2d'),P2=Object.assign({},SIDEPAL,SIDECOL[k]);all.forEach((r,y)=>{for(let i=0;i<r.length;i++){const col=P2[r[i]];if(col){x.fillStyle=col;x.fillRect(i,y,1,1)}}});return SIDEC[key]=c}
const PST=new Map();
function petFollow(id,ox,oy,fc){let s=PST.get(id);const now=performance.now();if(!s){s={x:ox-16,y:oy+4,t:0,lt:now,fl:false};PST.set(id,s)}const dt=Math.min(.1,(now-s.lt)/1000);s.lt=now;
 const tx=ox-(fc&&fc[0]?fc[0]*18:12),ty=oy+(fc&&fc[1]?-fc[1]*12:4)+2,dx=tx-s.x,dy=ty-s.y,d=Math.hypot(dx,dy);
 if(d>170){s.x=tx;s.y=ty}else if(d>6){const sp=Math.min(d,(d>40?115:62)*dt);s.x+=dx/d*sp;s.y+=dy/d*sp;s.t+=dt*8;if(Math.abs(dx)>1)s.fl=dx<0;s.mv=.2}else s.mv=Math.max(0,(s.mv||0)-dt);return s}
const TREEPET={};
function treeSprite(f){if(TREEPET[f])return TREEPET[f];const c=document.createElement('canvas');c.width=16;c.height=20;const x=c.getContext('2d'),r=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h)},K='#18200c';
 // canopy
 r(3,0,10,1,K);r(2,1,12,1,K);r(1,2,14,6,K);r(2,8,12,1,K);r(3,1,10,1,'#4ca83a');r(2,2,12,5,'#3c9030');r(3,2,5,2,'#6cc850');r(9,3,3,1,'#5cb844');r(2,7,12,1,'#2c6e24');r(5,5,2,1,'#2c6e24');r(10,6,2,1,'#2c6e24');
 // trunk body with a face
 r(4,9,8,7,K);r(5,9,6,7,'#9a6434');r(5,9,6,1,'#7a4c24');r(10,10,1,6,'#7a4c24');r(6,11,1,2,K);r(9,11,1,2,K);r(7,14,2,1,'#5a3418');
 // twig arms
 r(2,10,3,1,K);r(2,9,1,1,K);r(11,10,3,1,K);r(13,9,1,1,K);r(1,9,1,1,'#3c9030');r(14,9,1,1,'#3c9030');
 // root feet
 if(f){r(4,16,3,2,K);r(5,16,1,1,'#7a4c24');r(9,16,3,3,K);r(10,16,1,2,'#7a4c24')}else{r(4,16,3,3,K);r(5,16,1,2,'#7a4c24');r(9,16,3,2,K);r(10,16,1,1,'#7a4c24')}
 return TREEPET[f]=c}
function drawNPet(k,s,tm){if(window.SQDRAWTL&&k!=='ptree'&&SQDRAWTL(k,s,tm))return;const x=Math.round(s.x),y=Math.round(s.y);
 if(SIDEMAP[k]){const sp=sideSprite(k,s.mv>0?Math.floor(s.t)%2:0);shd(x,y+6,12);g.save();g.imageSmoothingEnabled=false;if(s.fl){g.translate(x*2,0);g.scale(-1,1)}g.drawImage(sp,x-Math.round(sp.width/2),y+7-sp.height);g.restore();return}
 if(k==='ptree'){const sp=treeSprite(s.mv>0?Math.floor(s.t)%2:0),bob=s.mv>0?(Math.floor(s.t)%2):0;shd(x,y+6,10);g.save();g.imageSmoothingEnabled=false;if(s.fl){g.translate(x*2,0);g.scale(-1,1)}g.drawImage(sp,x-8,y-13-bob);g.restore();return}
 const n=Object.assign({x,y,kx:0,ky:0,type:'wolf',hp:5,_pet:1},NPET[k].v);const px=P.x,py=P.y;
 // a wolf faces the way it walks (the wolf sprite faces the player, so look from just ahead of it)
 P.x=x+(s.fl?-40:40);P.y=y;try{pS(n,tm)}catch(e){}finally{P.x=px;P.y=py}
 // the red collar
 const L=s.fl?x-7:x+3;g.fillStyle='#181018';g.fillRect(L,y-6,4,6);g.fillStyle='#d82828';g.fillRect(L+1,y-6,2,5);g.fillStyle='#ff6050';g.fillRect(L+1,y-6,1,2);g.fillStyle='#f8d048';g.fillRect(L+(s.fl?1:2),y-1,1,1)}
{const _p=pP;pP=function(tm){const C=window.LUX&&LUX.COS,k=C&&C.pet;if(!k||!(NPET[k]||SIDEMAP[k]))return _p(tm);
  if(!dead&&!(typeof SAILING!=='undefined'&&SAILING)&&!(window.SQRSAIL&&SQRSAIL.on))drawNPet(k,petFollow('me',P.x,P.y,face),tm);C.pet=null;try{return _p(tm)}finally{C.pet=k}}}
if(window.LUX){const _dp=LUX.drawPeerPet;LUX.drawPeerPet=(r,tm)=>{if(r&&(NPET[r.pet]||SIDEMAP[r.pet])){if(r.sl)return;drawNPet(r.pet,petFollow(r.uid||'?',r.x,r.y,r.d===2?[r.fl?-1:1,0]:[0,r.d===1?-1:1]),tm);return}return _dp&&_dp(r,tm)}}
window.SQNPET=NPET;window.SQDRAWNPET=(k,s2,tm)=>drawNPet(k,s2,tm);

// ---- Sharks in the Shattered Expanse ----
// A few sharks (never more than three around you) cruise the deep water. They leave healthy players alone, but if
// you're wounded (half your hearts or less) and close to the water, they come for you. You can fight back with your
// sword from the shore or your boat; a shark is worth some gold and Fishing XP.
const SHK={list:[],cd:0};const shkR=()=>{const R=SCENE&&SCENE.room;return R&&R.region==='shattered'?R:null};
const deepW=(R,x,y)=>{const tx=Math.floor(x/16),ty=Math.floor(y/16);if(tx<1||ty<1||tx>=R.w-1||ty>=R.h-1)return false;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)if(R.tiles[(ty+b)*R.w+tx+a]!==0)return false;return true};
const wetW=(R,x,y)=>{const tx=Math.floor(x/16),ty=Math.floor(y/16);return tx>=0&&ty>=0&&tx<R.w&&ty<R.h&&R.tiles[ty*R.w+tx]===0};
const wounded=()=>P.hp<=3;
function nearWaterSpot(R){const sail=window.SQRSAIL&&SQRSAIL.on;if(sail)return[P.x,P.y];for(const[a,b]of[[0,16],[0,-16],[16,0],[-16,0],[12,12],[-12,12],[12,-12],[-12,-12]])if(wetW(R,P.x+a,P.y+b))return[P.x+a,P.y+b];return null}
{const _u=upd;upd=function(dt){_u(dt);const R=shkR();if(!R||dead||menuOpen||pnOpen){if(!R)SHK.list.length=0;return}
  SHK.list=SHK.list.filter(s=>!s.dead&&Math.hypot(s.x-P.x,s.y-P.y)<420);
  if((SHK.cd-=dt)<=0&&SHK.list.length<3){SHK.cd=9+Math.random()*8;for(let k=0;k<20;k++){const a=Math.random()*6.283,d=170+Math.random()*120,x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;if(deepW(R,x,y)){SHK.list.push({x,y,hp:16,mhp:16,tx:x,ty:y,t:Math.random()*9,bite:0,hit:0,a:0});break}}}
  const spot=nearWaterSpot(R),hunt=wounded()&&spot;
  for(const s of SHK.list){s.t+=dt;s.bite=Math.max(0,s.bite-dt);s.hit=Math.max(0,s.hit-dt);s.a=Math.max(0,s.a-dt);let tx=s.tx,ty=s.ty,sp=26;
   const dP=Math.hypot(s.x-P.x,s.y-P.y);
   if(hunt&&dP<220){tx=spot[0];ty=spot[1];sp=58}else if(Math.hypot(tx-s.x,ty-s.y)<8||Math.random()<dt*.15){for(let k=0;k<8;k++){const a=Math.random()*6.283,d=40+Math.random()*90,x=s.x+Math.cos(a)*d,y=s.y+Math.sin(a)*d;if(wetW(R,x,y)){s.tx=x;s.ty=y;break}}tx=s.tx;ty=s.ty}
   const dx=tx-s.x,dy=ty-s.y,d=Math.hypot(dx,dy);if(d>2){const m=Math.min(d,sp*dt),nx=s.x+dx/d*m,ny=s.y+dy/d*m;if(wetW(R,nx,s.y))s.x=nx;if(wetW(R,s.x,ny))s.y=ny;s.fl=dx<0}
   if(hunt&&dP<22&&s.bite<=0&&hurt<=0&&!(typeof ROLLT!=='undefined'&&ROLLT>0)){s.bite=2.2;s.a=.5;P.hp--;hurt=1.5;say('A shark bites!');try{sfx('hurt')}catch(e){}}}}}
{const _a=attack;attack=function(){const R=shkR();if(R&&!dead&&!menuOpen&&!pnOpen&&!BUILD&&swing<=0&&!FISH){const[fx,fy]=front(14);const s=SHK.list.find(q=>!q.dead&&Math.hypot(q.x-fx,q.y-fy)<20);
   if(s){swing=.3;const dmg=1+(TL.sword|0)+(typeof meleeFlat==='function'?meleeFlat():0);s.hp-=dmg;s.hit=.25;try{DMGS.push({x:s.x,y:s.y-10,v:String(dmg),t:0,c:'#ffffff',sc:curScene()})}catch(e){}sfx('hit');
    if(s.hp<=0){s.dead=1;const gld=25+Math.floor(Math.random()*30);GLD+=gld;addXp(9,60);addXp(0,30);say('The shark sinks away. +'+gld+' gold');try{drops.push({x:s.x,y:s.y-16,t:0,tx:'+'+gld+' gold',c:'#f8d848'})}catch(e){}saveLocal()}return}}return _a()}}
function drawShark(s,tm){const x=Math.round(s.x),y=Math.round(s.y),f=s.fl?-1:1,w=Math.sin(s.t*3)*1;
 g.fillStyle='rgba(20,40,70,.35)';g.beginPath();g.ellipse(x,y+2,15,5,0,0,6.283);g.fill();
 if(s.a>0){// a lunge: the head and jaws come up out of the water
  Rg(x-9,y-8,18,10,'#181018');Rg(x-8,y-7,16,8,s.hit>0?'#ffffff':'#7a8898');Rg(x-8,y-3,16,4,'#d8dce4');for(let k=0;k<5;k++)Rg(x-7+k*3,y-4,1,2,'#ffffff');Rg(x+f*4,y-6,2,2,'#181018');return}
 // the fin cutting through the water, with a wake
 g.fillStyle='rgba(232,248,255,.75)';g.fillRect(x-f*10-2+w,y+1,4,1);g.fillRect(x-f*14-1,y+2,3,1);
 Rg(x-4,y,9,2,'#e8f8ff');const c=s.hit>0?'#ffffff':'#5a6878';Rg(x-3,y-8,1,8,'#181018');for(let k=0;k<7;k++){const h=8-k;Rg(x-3+(f>0?k:0)-(f<0?k-6:0)+(f<0?-6:0)+1,y-h,1,h,k===0?'#181018':c)}Rg(x-4,y-1,10,1,'#181018')}
{const _p=pP;pP=function(tm){if(shkR())for(const s of SHK.list)if(!s.dead)try{drawShark(s,tm)}catch(e){}return _p(tm)}}
window.SQSHK=SHK;

// ---- Castles: the outside (two towers, a gate and two torches), the great hall inside, and where it would go ----
function drawCastle(b,tm){const X0=b.tx*16,w=b.w*16,base=(b.ty+2)*16,S=['#5a5650','#706a62','#8a847a','#a49c90','#bcb4a6'],K='#181018';
 const R=(a,y,ww,h,c)=>Rg(Math.round(a),Math.round(y),ww,h,c);
 // the curtain wall
 R(X0+14,base-44,w-28,44,K);R(X0+15,base-43,w-30,43,S[2]);for(let y=base-40;y<base;y+=6)for(let x=X0+15+((y/6)&1?4:0);x<X0+w-15;x+=9){R(x,y,8,1,S[1]);R(x,y-5,1,5,S[1])}R(X0+15,base-43,w-30,2,S[4]);
 for(let x=X0+15;x<X0+w-15;x+=8){R(x,base-49,5,6,K);R(x+1,base-48,3,5,S[3])}
 // the towers
 for(const tx of[X0,X0+w-20]){R(tx,base-66,20,66,K);R(tx+1,base-65,18,65,S[2]);R(tx+1,base-65,3,65,S[3]);R(tx+16,base-65,3,65,S[1]);for(let y=base-60;y<base;y+=7)R(tx+1,y,18,1,S[1]);
  for(let k=0;k<4;k++){R(tx+k*5,base-72,4,7,K);R(tx+k*5+1,base-71,2,6,S[3])}R(tx+7,base-52,6,9,K);R(tx+8,base-51,4,8,'#2a2438');R(tx+8,base-51,4,2,'#f8c860')}
 // banners on the towers
 for(const bx of[X0+5,X0+w-15]){R(bx+4,base-96,1,26,'#4a3020');R(bx+5,base-95,8,6,K);R(bx+5,base-94,7,4,'#c83040');R(bx+6,base-93,2,1,'#f8d048')}
 // the gate (the door is in the middle, over the door tile)
 const gx=X0+(w>>1)-10;R(gx,base-30,20,30,K);R(gx+1,base-29,18,29,'#3a2a1a');R(gx+1,base-29,18,3,S[3]);for(let k=0;k<4;k++)R(gx+3+k*4,base-26,1,26,'#5a4430');for(let k=0;k<3;k++)R(gx+2,base-22+k*7,16,1,'#5a4430');
 R(gx+4,base-35,12,6,K);R(gx+5,base-34,10,4,'#e8b830');R(gx+9,base-34,2,4,'#c83040');
 // two torches by the gate
 for(const ttx of[gx-7,gx+24]){R(ttx,base-24,3,8,K);R(ttx+1,base-23,1,7,'#7a5030');const fl=Math.sin(tm*12+ttx)*1.2;R(ttx-1,base-30+fl*.4,5,6,'#f8901c');R(ttx,base-32+fl,3,5,'#ffc040');R(ttx+1,base-31+fl,1,3,'#fff0a0');
  g.fillStyle='rgba(255,200,90,'+(.18+.06*Math.sin(tm*9+ttx))+')';g.beginPath();g.arc(ttx+1,base-27,12,0,6.283);g.fill()}
 R(X0+2,base-1,w-4,2,'rgba(0,0,0,.25)')}
{const _db=drBld;drBld=function(b,tm){if(b&&b.castle)return drawCastle(b,tm);return _db(b,tm)}}
// where a castle would go, while placing
{const _dh=drawHUD;drawHUD=function(){if(BUILD&&BUILD.k==='castle'&&!dead&&!menuOpen){const[x,y]=houseAnchor(),ok=canPlace(x,y),cx=Math.round(P.x-(W/Z)/2),cy=Math.round(P.y-(H/Z)/2);
   g.save();g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);g.globalAlpha=.55;try{drawCastle({w:7,tx:x-3,ty:y-1},performance.now()/1000)}catch(e){}g.globalAlpha=1;g.fillStyle=ok?'rgba(80,240,120,.3)':'rgba(240,60,60,.3)';g.fillRect((x-3)*16,(y-1)*16,112,32);g.restore()}_dh()}}
// the great hall
{const _rb=ROOMBG;ROOMBG=(R,W2,H2)=>{if(!R.castle)return _rb(R,W2,H2);const S=['#6a645a','#7a746a','#8a8478','#9a9488'];Rg(-5,-5,W2+10,H2+10,'#141016');
  for(let y=2;y<R.h;y++)for(let x=0;x<R.w;x++){const v=(x*7+y*13)%4;Rg(x*16,y*16,16,16,S[1+((x+y)&1)]);Rg(x*16,y*16,16,1,S[3]);Rg(x*16,y*16,1,16,S[3]);Rg(x*16+15,y*16,1,16,S[0]);Rg(x*16,y*16+15,16,1,S[0]);if(v===0)Rg(x*16+5,y*16+6,3,2,S[0])}
  // the wall: big stone blocks, a dark trim and a frieze
  Rg(0,0,W2,32,'#8a8274');for(let y=0;y<30;y+=8)for(let x=((y/8)&1)*12;x<W2;x+=24){Rg(x,y,23,7,'#9a9284');Rg(x,y,23,1,'#b2aa9a');Rg(x,y+7,24,1,'#5e584e')}Rg(0,0,W2,3,'#4a443c');Rg(0,28,W2,4,'#4a443c');Rg(0,32,W2,2,'rgba(0,0,0,.25)');
  // a red carpet from the door to the throne
  const cx=R.ex*16;Rg(cx-8,48,32,H2-48,'#8a1c22');Rg(cx-6,48,28,H2-48,'#c0303a');Rg(cx-6,48,2,H2-48,'#e8b830');Rg(cx+20,48,2,H2-48,'#e8b830');
  Rg(R.ex*16,H2-1,16,6,S[1]);Rg(R.ex*16+2,H2-7,12,7,'#c04030')}}
{const _df=drawFurn;drawFurn=function(it,tm){if(!it||typeof it.t!=='string'||!/^c_|^ic_|^icvdoor$/.test(it.t))return _df(it,tm);const x=it.x*16,y=it.y*16,K='#181018';
  if(it.t==='c_banner'){Rg(x+3,y+4,10,22,K);Rg(x+4,y+5,8,19,'#c83040');Rg(x+4,y+5,8,2,'#e8b830');Rg(x+6,y+10,4,4,'#e8b830');Rg(x+7,y+11,2,2,'#c83040');Rg(x+4,y+24,2,2,'#c83040');Rg(x+10,y+24,2,2,'#c83040');return}
  if(it.t==='c_window'){Rg(x+2,y+5,12,20,K);Rg(x+3,y+6,10,18,'#3a5a8a');Rg(x+3,y+6,10,3,'#5a8ac8');Rg(x+7,y+6,2,18,K);Rg(x+3,y+14,10,1,K);return}
  if(it.t==='c_torch'){Rg(x+6,y+14,4,10,K);Rg(x+7,y+15,2,8,'#7a5030');const f=Math.sin(tm*12+x)*1;Rg(x+5,y+8+f*.4,6,7,'#f8901c');Rg(x+6,y+6+f,4,6,'#ffc040');Rg(x+7,y+8+f,2,3,'#fff0a0');
   g.fillStyle='rgba(255,200,90,'+(.15+.05*Math.sin(tm*9+x))+')';g.beginPath();g.arc(x+8,y+12,22,0,6.283);g.fill();return}
  if(it.t==='c_pillar'){Rg(x+1,y-20,14,36,K);Rg(x+2,y-19,12,34,'#a49c90');Rg(x+2,y-19,3,34,'#bcb4a6');Rg(x+11,y-19,3,34,'#7a746a');Rg(x,y-22,16,4,K);Rg(x+1,y-21,14,2,'#bcb4a6');Rg(x,y+12,16,4,K);Rg(x+1,y+13,14,2,'#8a847a');return}
  if(it.t==='c_throne'){Rg(x+4,y-14,24,30,K);Rg(x+5,y-13,22,28,'#e8b830');Rg(x+8,y-10,16,14,'#c0303a');Rg(x+5,y-13,22,2,'#f8e070');Rg(x+3,y+4,26,10,K);Rg(x+4,y+5,24,8,'#c89020');Rg(x+8,y+5,16,5,'#c0303a');for(const k of[6,15,24])Rg(x+k,y-17,3,4,'#e8b830');return}
  if(it.t==='ic_beam'){Rg(x+1,y-18,14,34,K);Rg(x+2,y-17,3,32,'#8a5a30');Rg(x+11,y-17,3,32,'#8a5a30');Rg(x+2,y-17,12,4,'#a06a38');Rg(x+3,y-16,10,1,'#c08848');Rg(x+7,y-13,2,2,'#f8c860');return}
  if(it.t==='ic_cart'){Rg(x,y+2,16,11,K);Rg(x+1,y+3,14,8,'#6a5040');Rg(x+1,y+3,14,2,'#8a6a50');Rg(x+3,y+1,4,3,'#8a8a98');Rg(x+8,y,5,4,'#e8b830');Rg(x+2,y+11,4,4,K);Rg(x+10,y+11,4,4,K);return}
  if(it.t==='icvdoor'){const I=ICV[it.kind]||{},mine=I.mine;
   // a rock face with a dark opening; a mine gets a timber frame, rails and a lantern
   Rg(x-17,y-20,50,36,K);Rg(x-16,y-19,48,34,'#8a8a96');Rg(x-16,y-19,48,5,'#a8a8b4');Rg(x-16,y+8,48,6,'#6a6a76');for(const[a,b]of[[-12,-12],[20,-8],[-8,4],[24,6],[2,-16]])Rg(x+a,y+b,6,3,'#76768a');
   Rg(x-1,y-10,18,26,K);Rg(x,y-9,16,25,'#0c0a10');
   if(mine){Rg(x-3,y-13,22,4,'#8a5a30');Rg(x-3,y-13,22,1,'#c08848');Rg(x-3,y-10,4,26,'#8a5a30');Rg(x+15,y-10,4,26,'#8a5a30');Rg(x+3,y+4,2,12,'#6a6a76');Rg(x+11,y+4,2,12,'#6a6a76');for(let k=0;k<3;k++)Rg(x+2,y+6+k*4,12,1,'#5a3a20');
    const f=Math.sin(tm*8)*.5;Rg(x+18,y-8,3,5,K);Rg(x+19,y-7,1,3,'#f8c860');g.fillStyle='rgba(255,200,90,'+(.18+.05*f)+')';g.beginPath();g.arc(x+19,y-6,9,0,6.283);g.fill()}
   else if(I.rg==='briarwood'){for(const[a,b,w2]of[[-2,-12,20],[0,-10,3],[13,-10,3],[4,-11,2],[9,-11,2]])Rg(x+a,y+b,w2,2,'#5a3a1e');Rg(x-6,y-18,28,4,'#3a7a2a');Rg(x-4,y-19,6,2,'#58a040');Rg(x+12,y-19,8,2,'#58a040')}
   else{Rg(x+1,y-9,14,2,'#c8e0f0');Rg(x+3,y-7,2,3,'#c8e0f0');Rg(x+10,y-7,2,4,'#c8e0f0')}
   return}
  return _df(it,tm)}}
window.SQSHARKTEST=()=>SHK.list.length;
}


