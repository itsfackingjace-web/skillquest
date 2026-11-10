// ===== SkillQuest: Fishing + Smithing =====
SKN.push('Fishing','Smithing');AB.push('FISH','SMITH');SKC.push('#40b0e8','#c8c8d0');while(XPS.length<SKN.length)XPS.push(0);
TL.rod=0;let FISH=null;
const FISH_T=[{k:'shrimp',n:'Shrimp',lv:1,xp:15,cook:1,cxp:30,heal:1,hun:30,raw:3,ckv:6},{k:'trout',n:'Trout',lv:10,xp:40,cook:10,cxp:70,heal:2,hun:45,raw:8,ckv:14},{k:'salmon',n:'Salmon',lv:20,xp:70,cook:20,cxp:90,heal:3,hun:60,raw:12,ckv:20},{k:'swordfish',n:'Swordfish',lv:35,xp:110,cook:35,cxp:140,heal:4,hun:80,raw:20,ckv:34}];
const SM=[{k:'ibar',n:'Iron bar',smelt:1,c:{iron:1,wood:1},lv:1,xp:20},{k:'sbar',n:'Steel bar',smelt:1,c:{iron:2,stone:2,wood:1},lv:20,xp:45},
 {k:'idag',n:'Iron dagger',c:{ibar:1},lv:1,xp:30},{k:'sdag',n:'Steel dagger',c:{sbar:1},lv:20,xp:70},
 {arm:['helm',2],n:'Iron helmet',c:{ibar:2},lv:5,xp:60,def:10},{arm:['legs',2],n:'Iron legs',c:{ibar:3},lv:9,xp:90,def:10},{arm:['body',2],n:'Iron chestplate',c:{ibar:4},lv:12,xp:120,def:10},
 {arm:['helm',3],n:'Steel helmet',c:{sbar:2},lv:22,xp:140,def:20},{arm:['legs',3],n:'Steel legs',c:{sbar:3},lv:25,xp:200,def:20},{arm:['body',3],n:'Steel chestplate',c:{sbar:4},lv:30,xp:260,def:20}];
const NEWK=[...FISH_T.map(f=>f.k),...FISH_T.map(f=>'c'+f.k),'ibar','sbar','idag','sdag'];INVK.push(...NEWK);
const IN={iron:'iron ore',ibar:'iron bar',sbar:'steel bar',wood:'wood',stone:'stone'},SHORT={ibar:'iron bar',sbar:'steel bar',idag:'iron dagger',sdag:'steel dagger'};
for(const f of FISH_T){SELLP[f.k]=f.raw;SN[f.k]='Raw '+f.n.toLowerCase();SELLP['c'+f.k]=f.ckv;SN['c'+f.k]='Cooked '+f.n.toLowerCase();SHORT[f.k]='raw '+f.n.toLowerCase();SHORT['c'+f.k]='cooked '+f.n.toLowerCase()}
Object.assign(SELLP,{ibar:20,sbar:50,idag:32,sdag:85});Object.assign(SN,{ibar:'Iron bars',sbar:'Steel bars',idag:'Iron daggers',sdag:'Steel daggers'});
const SMB=new Set(['stone','iron','ibar','sbar','idag','sdag']);
GEN.push({n:'Fishing rod',c:10,f:()=>{TL.rod=1;say('Got a fishing rod! Face water and press HIT.')},hide:()=>!!TL.rod});
const genItems=()=>GEN.filter(x=>!(x.hide&&x.hide()));
// quests: two new ones slotted into the chain (old saves are remapped)
QS.splice(4,0,{n:'Gone Fishing',d:'The Elder craves seafood. Buy a rod at the general store, then bring him 5 cooked shrimp.',type:'give',item:'cshrimp',amt:5,r:{g:60,xp:[9,300]}});
QS.splice(7,0,{n:'Forged in Fire',d:'Smelt iron ore at the blacksmith\'s furnace and bring the Elder 3 iron bars.',type:'give',item:'ibar',amt:3,r:{g:120,xp:[10,400]}});
const QMAP=[0,1,2,3,5,6,8,9,10],remapQ=i=>QMAP[Math.max(0,Math.min(8,i|0))];
// finish loading the local save for the new fields

const _ap6=applySave;applySave=function(S){_ap6(S);TL.rod=S.tl&&S.tl.rod?1:0;if(!S.qv&&S.q)Q.i=remapQ(+S.q.i||0)};
const _sn6=snap;snap=function(){const s=_sn6();s.qv=2;return s};
// sounds
Object.assign(SFX,{cast:()=>{noise(.12,.06,3000);tone(700,.12,'sine',.03,-300)},splash:()=>{noise(.3,.14,800);tone(300,.08,'sine',.04,200)},smelt:()=>{noise(.6,.12,350);tone(110,.4,'triangle',.05)},anvil:()=>{tone(1900,.09,'square',.05,-500);noise(.06,.14,4200);tone(1700,.08,'square',.04,-500,.14);noise(.05,.12,4200,.14)}});
// --- fishing ---
function catchFish(){const L=lvOf(9),open=FISH_T.filter(f=>L>=f.lv);let ix=open.length-1;while(ix>0&&Math.random()<.5)ix--;const f=open[ix];
 if(Math.random()<Math.min(.9,.55+L*.012)){inv[f.k]=(inv[f.k]|0)+1;addXp(9,f.xp);say('You catch '+(f.k=='shrimp'?'some shrimp':'a '+f.n.toLowerCase())+'!');sfx('pickup')}else say('It got away...');
 FISH.t=0;FISH.bite=0;FISH.wait=(2+Math.random()*3)*Math.max(.6,1-L*.006)}
// water you can fish in: Hollow's tiles on Hollow, the island's own tiles on the other islands (not indoors)
function fishWaterAt(tx,ty){const R=SCENE&&SCENE.room;if(R&&R.region)return tx>=0&&ty>=0&&tx<R.w&&ty<R.h&&R.tiles[ty*R.w+tx]===0;if(SCENE)return false;return tx>=0&&ty>=0&&tx<N&&ty<N&&tile[ty*N+tx]==0}
const _atk6=attack;attack=function(){if(dead||menuOpen||pnOpen)return;if(FISH){FISH=null;say('You reel in your line');return}
 const[fx,fy]=front(14),tx=Math.floor(fx/T),ty=Math.floor(fy/T);
 if(swing<=0&&fishWaterAt(tx,ty)&&!en.some(n=>Math.hypot(n.x-fx,n.y-fy)<16)){
  if(!TL.rod){say('You need a fishing rod - buy one at the general store');return}
  const[bx,by]=front(24);FISH={px:P.x,py:P.y,bx,by,t:0,wait:2+Math.random()*3,bite:0};sfx('cast');say('You cast your line...');return}
 _atk6()};
const _u6=upd;upd=function(dt){const hp0=P.hp;_u6(dt);if(menuOpen||pnOpen||!FISH)return;
 if(dead||P.hp<hp0||Math.hypot(P.x-FISH.px,P.y-FISH.py)>1.5){FISH=null;if(!dead)say('You stop fishing');return}
 if(FISH.bite>0){FISH.bite-=dt;if(FISH.bite<=0)catchFish()}else if((FISH.t+=dt)>=FISH.wait){FISH.bite=.45;sfx('splash')}};
// --- cooking & eating (meat + fish) ---
const COOKS=[{raw:'meat',ck:'cooked',n:'meat',lv:1,xp:30},...FISH_T.map(f=>({raw:f.k,ck:'c'+f.k,n:f.k=='shrimp'?'shrimp':f.n.toLowerCase(),lv:f.cook,xp:f.cxp}))];
const FOODS=[...FISH_T.map(f=>({k:'c'+f.k,n:'cooked '+f.n.toLowerCase(),heal:f.heal,hun:f.hun})),{k:'cooked',n:'cooked meat',heal:2,hun:60},{k:'berry',n:'berries',heal:0,hun:18},{k:'meat',n:'raw meat',heal:0,hun:20}].sort((a,b)=>b.heal-a.heal||b.hun-a.hun);
eat=function(){if(dead||menuOpen||pnOpen)return;
 if(nearFire(P.x,P.y,45)){const cl=lvOf(4);let blk=null;
  for(const c of COOKS){if((inv[c.raw]|0)<1)continue;if(cl<c.lv){blk=blk||c;continue}
   inv[c.raw]--;if(Math.random()<Math.max(.03,.4-(cl-c.lv)*.02-cl*.004)){say('You burn the '+c.n+'!');addXp(4,5);sfx('swish')}
   else{inv[c.ck]=(inv[c.ck]|0)+1;say('Cooked '+c.n);addXp(4,c.xp);sfx('sizzle');if(Q.on&&QS[Q.i]&&QS[Q.i].type=='cook')Q.k++}
   saveLocal(true);return}
  if(blk){say('Need Cooking '+blk.lv+' to cook '+blk.n);return}}
 const f=FOODS.find(x=>(inv[x.k]|0)>0);if(!f){say('Nothing to eat');return}
 inv[f.k]--;hunger=Math.min(100,hunger+f.hun);P.hp=Math.min(6,P.hp+f.heal);sfx('eat');
 say(f.k=='meat'?'Raw meat... cook it at a fire next time':'Ate '+f.n+(f.heal?' (+'+f.heal+' heart'+(f.heal>1?'s':'')+')':''))};
// --- smithing: furnace + anvil next to the smithy ---
// (the furnace and anvil are inside the smithy now, section 12)
function smithAct(i,all){const r=SM[i];if(!r)return;if(sqDo(r.smelt?'smelt':'smith',r.arm?1:all?999:1,()=>smithAct(i,false)))return;if(lvOf(10)<r.lv){say('Need Smithing '+r.lv);return}if(r.def&&lvOf(8)<r.def){say('Need Defence '+r.def+' to wear that');return}
 let n=0;const mx=r.arm?1:all?999:1;while(n<mx&&Object.entries(r.c).every(([a,b])=>(inv[a]|0)>=b)){for(const a in r.c)inv[a]-=r.c[a];if(r.k)inv[r.k]=(inv[r.k]|0)+1;n++}
 if(!n){say('Missing materials');return}
 if(r.arm){ARM[r.arm[0]]=Math.max(ARM[r.arm[0]],r.arm[1]);say('Forged and equipped '+r.n+'!')}else say((r.smelt?'Smelted ':'Forged ')+n+' '+r.n+(n>1?'s':''));
 addXp(10,r.xp*n);sfx(r.smelt?'smelt':'anvil');saveLocal(true);rPn()}
function forgeHTML(){let h='<div class="tl" style="margin-top:18px">Furnace &amp; Anvil</div><div class="tl" style="font-size:11px;font-weight:400;opacity:.65;margin-top:-6px">Smithing level '+lvOf(10)+'. Smelt ore into bars, then forge them.</div>';
 SM.forEach((r,i)=>{if(r.arm&&ARM[r.arm[0]]>=r.arm[1])return;const need=Object.entries(r.c),can=lvOf(10)>=r.lv&&!(r.def>lvOf(8))&&need.every(([a,b])=>(inv[a]|0)>=b);
  h+='<div class="gr" style="opacity:'+(can?1:.5)+'"><div class="gi"><b>'+r.n+'</b>'+(r.k?' <small>(have '+(inv[r.k]|0)+')</small>':'')+'<br><small>'+need.map(([a,b])=>b+' '+(IN[a]||a)).join(', ')+' · Smithing '+r.lv+(r.def?' · wear: Defence '+r.def:'')+' · '+r.xp+' xp'+(SELLP[r.k]?' · sells '+SELLP[r.k]+'g':'')+'</small></div><button class="fg" data-i="'+i+'" data-a="1">'+(r.arm?'Forge':'Make')+'</button>'+(r.arm?'':'<button class="fg" data-i="'+i+'" data-a="all">All</button>')+'</div>'});
 return h}
const _r6=rPn;rPn=function(){_r6();if(ptab==2&&shop=='smith')pbd.insertAdjacentHTML('beforeend',forgeHTML())};
const _oc6=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('.fg');if(b){smithAct(+b.dataset.i,b.dataset.a=='all');return}_oc6(e)};
// --- drawing: furnace, anvil, fishing line, HUD line ---
function pline(x0,y0,x1,y1,c){const st=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=st;i++)Rg(x0+(x1-x0)*i/st,y0+(y1-y0)*i/st,1,1,c)}
const _nd6=NEWDRAW;NEWDRAW=function(...a){_nd6(...a);const tm=a[8];
 if(FISH&&!window.SQSKFX){const hx=Math.round(P.x+face[0]*6),hy=Math.round(P.y-3+(face[1]>0?2:0)),rx=Math.round(P.x+face[0]*13+(face[1]?4:0)),ry=Math.round(P.y-13+face[1]*7),bx=Math.round(FISH.bx),by=Math.round(FISH.by)+(FISH.bite>0?2:Math.round(Math.sin(tm*3)));
  pline(hx,hy,rx,ry,'#7a4a20');pline(rx,ry,bx,by-1,'rgba(240,240,255,.75)');
  if(FISH.bite>0){const r=3+Math.round((.45-FISH.bite)*14);for(let k=0;k<12;k++){const an=k/12*6.283;Rg(bx+Math.cos(an)*r,by+1+Math.sin(an)*r*.5,1,1,'#e8f8ff')}}
  Rg(bx-2,by-3,4,5,O);Rg(bx-1,by-2,2,2,'#e83030');Rg(bx-1,by,2,1,'#fff')}};
// (carried fish and bars are shown in the Bag, section 10)
