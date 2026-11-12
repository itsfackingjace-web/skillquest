// ---------------------------------------------------------------- 28. Gear: equip / unequip, ranger and mage sets, elemental wands, action animations
// Every tool, weapon and armor piece is an item. Equip it from the Bag or the equipment screen; unequipped gear
// sits in your Bag (or a chest) and is safe when you fall. Slots: head, body, legs, main hand (sword, bow or
// wand), axe, pickaxe, fishing rod, hoe, watering can. Upgrading drops your old piece into your Bag.
// Ranger gear boosts bows, mage gear boosts wands. Wands cast fire, ice or storm spells using mana.
// Chopping, mining, tilling, watering, planting and harvesting each have their own animation.
// --- item catalogue ---
const EQ={},TIER_N=['','Wooden','Stone','Iron','Steel'],TCOL=['','#b07838','#a8a8b0','#d8e0e8','#88a8d8'],ARMN={helm:'helmet',body:'chestplate',legs:'legs'};
for(let t=1;t<=4;t++){EQ['eq_axe'+t]={slot:'axe',tier:t,n:TIER_N[t]+' axe',ic:'axe',col:TCOL[t],v:[0,2,6,20,60][t]};EQ['eq_pick'+t]={slot:'pick',tier:t,n:TIER_N[t]+' pickaxe',ic:'pick',col:TCOL[t],v:[0,2,6,20,60][t]};EQ['eq_sword'+t]={slot:'main',kind:'sword',tier:t,n:TIER_N[t]+' sword',ic:'sword',col:TCOL[t],v:[0,2,8,25,70][t]}}
Object.assign(EQ,{eq_rod:{slot:'rod',tier:1,n:'Fishing rod',ic:'rod',v:4},eq_hoe:{slot:'hoe',tier:1,n:'Hoe',ic:'hoe',v:5},eq_can:{slot:'can',tier:1,n:'Watering can',ic:'can',v:6},
 eq_bow1:{slot:'off',kind:'bow',tier:1,n:'Shortbow',ic:'bow',v:8},eq_bow2:{slot:'off',kind:'bow',tier:2,n:'Longbow',ic:'bow',v:40},
 eq_wfire:{slot:'off',kind:'wand',el:'fire',n:'Fire wand',ic:'wfire',v:60,lv:1},eq_wice:{slot:'off',kind:'wand',el:'ice',n:'Ice wand',ic:'wice',v:100,lv:10},eq_wstorm:{slot:'off',kind:'wand',el:'storm',n:'Storm wand',ic:'wstorm',v:160,lv:20}});
for(const s of['helm','body','legs']){for(let t=1;t<=3;t++)EQ['eq_'+s+t]={slot:s,arm:t,n:AT[t-1]+' '+ARMN[s],ic:s,col:AC3[t-1],v:[0,6,30,100][t]}}
Object.assign(EQ,{eq_rhelm:{slot:'helm',cls:'r',n:'Ranger hood',ic:'helm',col:'#4a8a3a',v:20},eq_rbody:{slot:'body',cls:'r',n:'Ranger vest',ic:'body',col:'#4a8a3a',v:35},eq_rlegs:{slot:'legs',cls:'r',n:'Ranger chaps',ic:'legs',col:'#4a8a3a',v:28},
 eq_mhelm:{slot:'helm',cls:'m',n:'Wizard hat',ic:'helm',col:'#6848b8',v:30,lv:5},eq_mbody:{slot:'body',cls:'m',n:'Wizard robe',ic:'body',col:'#6848b8',v:60,lv:10},eq_mlegs:{slot:'legs',cls:'m',n:'Wizard leggings',ic:'legs',col:'#6848b8',v:45,lv:8}});
const EQK=Object.keys(EQ);INVK.push(...EQK);EXTRA_BAG.push(...EQK);
for(const k of EQK){const e=EQ[k];INAME[k]=e.n;SELLP[k]=e.v;SN[k]=e.n+'s';SHORT[k]=e.n.toLowerCase();
 IDESC[k]=(e.slot==='main'||e.slot==='off'?(e.kind==='wand'?'A wand that casts '+e.el+' spells using mana.'+(e.lv>1?' Needs Magic '+e.lv+'.':''):e.kind==='bow'?'A bow for your off-hand. R1 (or HIT at a distant enemy) shoots arrows, and your sword stays in your main hand.':'A sword for your main hand.'):
  e.cls==='r'?'Ranger gear: each piece makes your arrows fly further, and two pieces hit harder.':e.cls==='m'?'Mage gear: each piece speeds up mana recovery, and two pieces make spells stronger.'+(e.lv?' Needs Magic '+e.lv+'.':''):
  e.slot==='helm'||e.slot==='body'||e.slot==='legs'?'Armor. Raises your block chance.':'A tool for your tool belt.')+' Equip it from your Bag or the equipment screen.'}
// --- what is equipped (kept in TL / ARM so every other system keeps working) ---
let CLS={helm:null,body:null,legs:null},WAND=null,MANA=10,EQSEL=null,PREV_EQ=null;
SKN.push('Magic');AB.push('MAGIC');SKC.push('#a070f0');while(XPS.length<SKN.length)XPS.push(0);const ML=SKN.length-1;SKICON.push('wfire');
function occ(slot){if(slot==='helm'||slot==='body'||slot==='legs')return ARM[slot]?'eq_'+slot+ARM[slot]:CLS[slot]?'eq_'+CLS[slot]+slot:null;
 if(slot==='main')return TL.sword?'eq_sword'+TL.sword:null;
 if(slot==='off')return TL.bow?'eq_bow'+TL.bow:WAND?'eq_w'+WAND:null;
 if(slot==='axe'||slot==='pick')return TL[slot]?'eq_'+slot+TL[slot]:null;return TL[slot]?'eq_'+slot:null}
function setSlot(slot,k){const e=k?EQ[k]:null;
 if(slot==='helm'||slot==='body'||slot==='legs'){ARM[slot]=e&&e.arm?e.arm:0;CLS[slot]=e&&e.cls?e.cls:null}
 else if(slot==='main')TL.sword=e?e.tier:0;
 else if(slot==='off'){TL.bow=e&&e.kind==='bow'?e.tier:0;WAND=e&&e.kind==='wand'?e.el:null}
 else TL[slot]=e?e.tier:0}
const snapEq=()=>{PREV_EQ={tl:{...TL},arm:{...ARM},cls:{...CLS},wand:WAND}};
function equipItem(k){const e=EQ[k];if(!e||(inv[k]|0)<1)return;
 if(e.lv&&(e.kind==='wand'||e.cls==='m')&&lvOf(ML)<e.lv){say('You need Magic '+e.lv+' to use the '+e.n.toLowerCase()+'.');sfx('swish');return}
 if(e.arm&&e.arm>1&&lvOf(8)<[0,1,10,20][e.arm]){say('You need Defence '+[0,1,10,20][e.arm]+' to wear that.');sfx('swish');return}
 const old=occ(e.slot);if(old)inv[old]=(inv[old]|0)+1;inv[k]--;setSlot(e.slot,k);snapEq();say('Equipped the '+e.n.toLowerCase()+'.');sfx('pickup');saveLocal(true)}
function unequipSlot(slot){const old=occ(slot);if(!old)return;inv[old]=(inv[old]|0)+1;setSlot(slot,null);snapEq();say('Put the '+EQ[old].n.toLowerCase()+' in your bag.');sfx('talk');saveLocal(true)}
// upgrades bought, crafted or rewarded anywhere drop your old piece into the bag
function watchUpgrades(){if(!PREV_EQ){snapEq();return}const p=PREV_EQ;let ch=false;const bag=k=>{if(k)inv[k]=(inv[k]|0)+1};
 for(const k of['axe','pick'])if(TL[k]>p.tl[k]){if(p.tl[k])bag('eq_'+k+p.tl[k]);ch=true}
 for(const k of['rod','hoe','can'])if(TL[k]&&!p.tl[k])ch=true;
 if(TL.sword>p.tl.sword){if(p.tl.sword)bag('eq_sword'+p.tl.sword);ch=true}
 if(TL.bow>p.tl.bow){if(p.tl.bow)bag('eq_bow'+p.tl.bow);if(p.wand&&WAND===p.wand){bag('eq_w'+p.wand);WAND=null}ch=true}
 for(const s of['helm','body','legs'])if(ARM[s]>p.arm[s]){if(p.arm[s])bag('eq_'+s+p.arm[s]);if(p.cls[s]){bag('eq_'+p.cls[s]+s);CLS[s]=null}ch=true}
 snapEq();if(ch&&pnOpen&&(ptab===3||ptab===4))rPn()}
// keep the shops from re-selling a tool you own but have put away
for(const g2 of GEN){if(g2.n==='Hoe')g2.hide=()=>!!TL.hoe||(inv.eq_hoe|0)>0;else if(g2.n==='Watering can')g2.hide=()=>!!TL.can||(inv.eq_can|0)>0;else if(g2.n==='Fishing rod')g2.hide=()=>!!TL.rod||(inv.eq_rod|0)>0}
const _thtml28=tackleHTML;tackleHTML=function(){const r=TL.rod;if((inv.eq_rod|0)>0)TL.rod=1;try{return _thtml28()}finally{TL.rod=r}};
// --- class bonuses ---
const nCls=c=>['helm','body','legs'].filter(s=>CLS[s]===c).length;
const _ad28=arrowDmg;arrowDmg=function(){const r=nCls('r');return _ad28()+(r>=2?1:0)+(r===3?1:0)};
const _br28=bowRange;bowRange=function(){return _br28()+12*nCls('r')};
const maxMP=()=>10+Math.floor(lvOf(ML)/5)+2*nCls('m')+(typeof magicMPBonus==='function'?magicMPBonus():0);
const WSP={fire:{cost:2,col:'#f88830',c2:'#f8e060',sfx:'cfire'},ice:{cost:2,col:'#88d8f8',c2:'#f0fcff',sfx:'cice'},storm:{cost:3,col:'#f8f048',c2:'#ffffff',sfx:'cstorm'}};
function spellDmg(el){const m=nCls('m');return(el==='storm'?3:2)+Math.floor(lvOf(ML)/15)+(m>=2?1:0)+(m===3?1:0)}
Object.assign(SFX,{cfire:()=>{noise(.18,.08,700);tone(220,.15,'sawtooth',.03,180)},cice:()=>{tone(1400,.12,'sine',.04,-600);tone(1900,.08,'triangle',.03,0,.05)},cstorm:()=>{noise(.12,.12,2600);tone(90,.2,'square',.04,40)},nomana:()=>tone(200,.1,'square',.03,-60)});
// --- spells ---
const SPELLS=[],PARTS=[];let CASTT=0,CASTD=[0,1];
const part=(x,y,vx,vy,life,c,gr,sz)=>PARTS.push({x,y,vx,vy,t:0,life,c,g:gr==null?300:gr,sz:sz||1,sc:curScene()});
function wandTarget(){let best=null,bd=1e9;for(const n of en){if(n.dead)continue;const dx=n.x-P.x,dy=n.y-P.y,al=dx*face[0]+dy*face[1],pe=Math.abs(dx*face[1]-dy*face[0]),big=n.type==='boss'||n.type==='bonelord'||n.big;if(al>4&&al<160&&pe<(big?26:16)&&al<bd){bd=al;best=n}}return best}
function castDir(){if(typeof aimLive==='function'&&aimLive()){const a=aimDir();return[a[0],a[1]]}const t=wandTarget();if(t){const dx=t.x-P.x,dy=(t.y-4)-(P.y-2),l=Math.hypot(dx,dy)||1;return[dx/l,dy/l]}return[face[0],face[1]]}
function castSpell(first){if(!WAND||dead||menuOpen||pnOpen||BUILD||FISH||swing>0)return false;if(SCENE&&!SCENE.room.cave){if(first)say('Not indoors!');return true}
 const W2=WSP[WAND];if(MANA<W2.cost){if(first){say('Out of mana! It comes back over time.');sfx('nomana')}return true}
 MANA-=W2.cost;const[dx,dy]=castDir();swing=.4;CASTT=.35;CASTD=[dx,dy];face=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];sfx(W2.sfx);
 SPELLS.push({x:P.x+dx*10,y:P.y-4+dy*8,vx:dx*200,vy:dy*200,t:0,life:.8,el:WAND,dmg:spellDmg(WAND),sc:curScene()});return true}
// controller R1 casts when a wand is in your hand; keyboard / touch HIT casts at an enemy in front of you
const _sa28=shootAim;shootAim=function(first){if(WAND){castSpell(first);return}if(!TL.bow&&first&&!WAND){say((inv.eq_bow1|0)+(inv.eq_bow2|0)>0?'Put your bow in your off-hand (Bag or equipment screen) to shoot.':'You need a bow or a wand in your off-hand.');sfx('swish');return}_sa28(first)};
function spellKill(n){if(n.dead)return;n.dead=1;n.dropped=1;kills++;GLD+=2+Math.floor(Math.random()*5);addXp(ML,14);if(n.type!=='boss'&&n.type!=='bonelord'&&Math.random()<.6)inv.meat=(inv.meat|0)+1;enemyDrop(n)}
function spellHit(s,n,dmg){n.hp-=dmg;addXp(ML,4*dmg);const big=n.type==='boss'||n.type==='bonelord'||n.big;DMGS.push({x:n.x,y:n.y-(big?30:14),v:String(dmg),t:0,c:WSP[s.el].c2==='#ffffff'?'#f8f048':WSP[s.el].col,sc:s.sc});
 for(let k=0;k<8;k++)part(n.x,n.y-6,(Math.random()-.5)*120,(Math.random()-.8)*100,.35,k%2?WSP[s.el].col:WSP[s.el].c2,80);
 if(s.el==='fire')n.burn=3;else if(s.el==='ice')n.slow=3;
 if(n.hp<=0)spellKill(n)}
// --- action animations ---
let ACTN=null;
function frontObjTile(){const[fx,fy]=front(13);return[Math.floor(fx/16),Math.floor(fy/16)]}
const _atk28=attack;attack=function(){
 if(!(typeof GPON!=='undefined'&&GPON)&&WAND&&!dead&&!menuOpen&&!pnOpen&&!BUILD&&!FISH&&swing<=0&&!facingNpc()&&!(SCENE&&!SCENE.room.cave)&&wandTarget()&&!en.some(n=>!n.dead&&Math.hypot(n.x-P.x,n.y-P.y)<18)){castSpell(true);return}
 if(dead||menuOpen||pnOpen||BUILD||FISH||swing>0||SCENE){_atk28();return}
 if(facingNpc()||en.some(n=>!n.dead&&Math.hypot(n.x-(P.x+face[0]*13),n.y-(P.y+face[1]*13))<16)){_atk28();return}
 const[ox,oy]=frontObjTile(),oi=oy*N+ox,o=obj[oi],ohp=o?o.hp:0,[px,py]=frontTile(),pi=py*N+px,pl=FARM.get(pi),plW=pl?wet(pl):false,plC=pl?pl.c:null,plR=pl?ripe(pl):false,had=FARM.has(pi);
 _atk28();if(swing<=0)return;let type=null,tx=ox,ty=oy;
 if(o&&(o.t==='tree'||o.t==='pine'||o.t==='cactus')&&TL.axe>0&&(!obj[oi]||obj[oi].hp<ohp))type='chop';
 else if(o&&(o.t==='rock'||o.t==='ore')&&TL.pick>0&&(!obj[oi]||obj[oi].hp<ohp))type='mine';
 else if(plR&&(!FARM.get(pi)||!FARM.get(pi).c||FARM.get(pi).g<1)){type='harvest';tx=px;ty=py}
 else if(pl&&plC&&!plW&&FARM.get(pi)&&wet(FARM.get(pi))){type='water';tx=px;ty=py}
 else if(!had&&FARM.has(pi)){type='till';tx=px;ty=py}
 if(type){ACTN={type,t:0,dur:type==='water'?.6:type==='harvest'?.35:.32,face:[face[0],face[1]],tx,ty,hit:false,crop:plC,tree:o&&o.t};if(type==='water')swing=Math.max(swing,.45)}};
const _pb28=placeBuild;placeBuild=function(){if(!BUILD||SCENE||typeof isSeed!=='function'||!isSeed(BUILD.k))return _pb28();const[x,y]=frontTile(),i=y*N+x,b=FARM.get(i),before=b?b.c:null;_pb28();const a=FARM.get(i);
 if(a&&a.c&&!before)ACTN={type:'plant',t:0,dur:.45,face:[face[0],face[1]],tx:x,ty:y,hit:false}};
function drawToolLine(kind,ang,hx,hy,tier){const dx=Math.cos(ang),dy=Math.sin(ang),px=-dy,py=dx,pts=[],head=[],hc=TCOL[tier]||'#c8d0d8';
 for(let i=1;i<=10;i++)pts.push([hx+dx*i,hy+dy*i]);
 if(kind==='axe')for(let i=7;i<=10;i++)for(let k=1;k<=3;k++)head.push([hx+dx*i+px*k,hy+dy*i+py*k]);
 else if(kind==='pick')for(let k=-4;k<=4;k++)head.push([hx+dx*(10-k*k/7)+px*k,hy+dy*(10-k*k/7)+py*k]);
 else for(let k=0;k<=3;k++)head.push([hx+dx*10+px*k,hy+dy*10+py*k]);
 for(const[x,y]of[...pts,...head])Rg(Math.round(x)-1,Math.round(y)-1,3,3,O);for(const[x,y]of pts)Rg(Math.round(x),Math.round(y),1,1,'#8a5a30');
 for(const[x,y]of head)Rg(Math.round(x),Math.round(y),1,1,kind==='hoe'?'#a8b0b8':hc)}
function drawCan(hx,hy,fx,tilt){const sx=fx<0?-1:1,x=Math.round(hx+sx*2),y=Math.round(hy-2);Rg(x-4,y-1,10,8,O);Rg(x-3,y,8,6,'#5a8ab8');Rg(x-3,y,8,1,'#88b0d8');Rg(x-2,y-3,4,3,O);Rg(x-1,y-2,2,2,'#5a8ab8');
 const lx=sx>0?x+4:x-4;for(let k=0;k<5;k++){const ex=Math.round(lx+sx*k),ey=Math.round(y+1+k*tilt);Rg(ex-1,ey-1,3,3,O);Rg(ex,ey,1,1,'#88b0d8')}}
function drawAct(tm){const a=ACTN;if(!a||!a.face)return;const p=Math.min(1,a.t/a.dur),f=a.face,a0=Math.atan2(f[1],f[0]),sg=f[0]<0?1:-1,hx=P.x+f[0]*3,hy=P.y-6+f[1]*2;
 if(a.type==='chop'||a.type==='mine'||a.type==='till'){const st=a0+sg*(a.type==='chop'?1.9:2.7),en2=a0-sg*(a.type==='chop'?.25:.1),e=p<.6?Math.pow(p/.6,2):1;drawToolLine(a.type==='chop'?'axe':a.type==='mine'?'pick':'hoe',st+(en2-st)*e,hx,hy,a.type==='chop'?TL.axe:TL.pick)}
 else if(a.type==='water')drawCan(hx+f[0]*4,hy+(f[1]>0?4:0),f[0]||1,p<.15?0:.8)}
function actFx(dt){const a=ACTN;if(!a)return;a.t+=dt;const p=a.t/a.dur,cx=a.tx*16+8,cy=a.ty*16+8,sc=curScene();
 if(a.type==='water'&&p>.15&&p<.95&&Math.random()<.8){const sx=P.x+(a.face[0]||1)*12,sy=P.y-6+(a.face[1]>0?6:0);PARTS.push({x:sx,y:sy,vx:(cx-sx)/.35+(Math.random()-.5)*20,vy:(cy-sy)/.35-60,t:0,life:.38,c:Math.random()<.5?'#68b8f8':'#c8e8ff',g:330,sz:1,sc})}
 if(a.type==='plant'&&p<.5&&Math.random()<.5)part(P.x+a.face[0]*8+(Math.random()-.5)*4,P.y-2+a.face[1]*6,(cx-P.x)*.8+(Math.random()-.5)*20,-20,.4,'#e0c080',260);
 if(!a.hit&&p>=.6){a.hit=true;
  if(a.type==='chop'){const ty2=cy-(a.tree==='pine'?6:2);for(let k=0;k<7;k++)part(cx+(Math.random()-.5)*6,ty2,(Math.random()-.5)*110,-40-Math.random()*70,.55,k%3?'#c88848':'#f0d8a0',320,k%2?2:1);for(let k=0;k<3;k++)part(cx+(Math.random()-.5)*16,cy-18,(Math.random()-.5)*20,5,1.1,a.tree==='pine'?'#2e7048':'#48a838',30,2);sfx('rustle')}
  else if(a.type==='mine'){for(let k=0;k<6;k++)part(cx,cy-2,(Math.random()-.5)*160,-30-Math.random()*90,.22,k%2?'#fff8c0':'#f8d848',0,1);for(let k=0;k<5;k++)part(cx+(Math.random()-.5)*6,cy,(Math.random()-.5)*100,-30-Math.random()*60,.5,k%2?'#9898a8':'#c0c0d0',320,2)}
  else if(a.type==='till'||a.type==='plant'){for(let k=0;k<(a.type==='till'?7:4);k++)part(cx+(Math.random()-.5)*8,cy+2,(Math.random()-.5)*90,-30-Math.random()*50,.4,k%2?'#8a5a30':'#6a4428',300,2)}
  else if(a.type==='harvest'){const col={wheat:'#f0c848',carrot:'#f08830',pumpkin:'#e87820'}[a.crop]||'#78d058';for(let k=0;k<8;k++)part(cx,cy-4,(Math.random()-.5)*90,-60-Math.random()*60,.6,k%3?col:'#78d058',260,2);for(let k=0;k<4;k++)part(cx+(Math.random()-.5)*10,cy-10,0,-25,.5,'#ffffff',0,1)}}
 if(a.t>=a.dur)ACTN=null}
function drawParts(){const sc=curScene();for(const q of PARTS){if(q.sc!==sc)continue;g.globalAlpha=Math.max(0,Math.min(1,(1-q.t/q.life)*1.6));Rg(Math.round(q.x),Math.round(q.y),q.sz,q.sz,q.c)}g.globalAlpha=1}
function drawSpells(tm){const sc=curScene();for(const s of SPELLS){if(s.sc!==sc)continue;const x=Math.round(s.x),y=Math.round(s.y),W2=WSP[s.el],pu=Math.floor(tm*16)%2;
  if(s.el==='storm'){const l=Math.hypot(s.vx,s.vy)||1,ux=s.vx/l,uy=s.vy/l;for(let k=0;k<7;k++){const j=(k%2?2:-2)*(pu?1:-1);Rg(Math.round(x-ux*k*2-uy*j)-1,Math.round(y-uy*k*2+ux*j)-1,3,3,O)}for(let k=0;k<7;k++){const j=(k%2?2:-2)*(pu?1:-1);Rg(Math.round(x-ux*k*2-uy*j),Math.round(y-uy*k*2+ux*j),1,1,k<2?'#fff':W2.col)}}
  else if(s.el==='ice'){Rg(x-3,y-1,7,3,O);Rg(x-1,y-3,3,7,O);Rg(x-2,y,5,1,W2.col);Rg(x,y-2,1,5,W2.col);Rg(x,y,1,1,'#fff')}
  else{Rg(x-3,y-3,7,7,O);Rg(x-2,y-2,5,5,W2.col);Rg(x-1,y-1,3,3,W2.c2);if(pu)Rg(x,y-4,1,1,W2.c2)}}
 // status effects on enemies
 for(const n of en){if(n.dead)continue;const x=Math.round(n.x),y=Math.round(n.y)-(n.type==='boss'||n.type==='bonelord'||n.big?34:16);
  if(n.burn>0){const f2=Math.floor(tm*10)%2;Rg(x-3+f2,y,2,3,'#f88830');Rg(x+1-f2,y-1,2,4,'#f8e060')}
  if(n.slow>0){for(const[a,b]of[[-6,6],[5,8],[-2,12]])Rg(x+a,y+b,2,2,'#c8f0ff')}}}
function drawWand(){if(CASTT<=0||!WAND)return;const[dx,dy]=CASTD,hx=P.x+dx*6,hy=P.y-5+dy*5,W2=WSP[WAND];for(let i=0;i<9;i++)Rg(Math.round(hx+dx*i)-1,Math.round(hy+dy*i)-1,3,3,O);
 for(let i=0;i<9;i++)Rg(Math.round(hx+dx*i),Math.round(hy+dy*i),1,1,'#7a4a20');const tx=Math.round(hx+dx*9),ty=Math.round(hy+dy*9);Rg(tx-1,ty-1,3,3,W2.col);Rg(tx,ty,1,1,'#fff');
 g.fillStyle='rgba(255,255,255,.25)';g.fillRect(tx-3,ty-3,7,7)}
const _pP28=pP;pP=function(tm){const tool=ACTN&&(ACTN.type==='chop'||ACTN.type==='mine'||ACTN.type==='till'||ACTN.type==='water');const sw=swing;if(tool||CASTT>0)swing=0;
 const kneel=ACTN&&(ACTN.type==='plant'||ACTN.type==='harvest')&&ACTN.t/ACTN.dur<.7;if(kneel){g.save();g.translate(0,1)}try{_pP28(tm)}finally{swing=sw;if(kneel)g.restore()}
 if(hurt>0&&Math.floor(tm*20)%2)return;if(tool&&!SCENE)drawAct(tm);drawWand()};
const _nd28=NEWDRAW;NEWDRAW=function(...a){_nd28(...a);if(!SCENE){drawSpells(a[8]);drawParts()}};
const _dr28=drawRoom;drawRoom=function(tm){_dr28(tm);drawSpells(tm);drawParts()};
// wand crosshair (controller)
const _dh28=drawHUD;drawHUD=function(){if(typeof GPON!=='undefined'&&GPON&&WAND&&!menuOpen&&typeof aimLive==='function'&&aimLive()&&!dead){const cx=camX(),cy=camY(),[dx,dy]=castDir(),x=Math.round(P.x+dx*34),y=Math.round(P.y-4+dy*34),c=WSP[WAND].col;
  g.save();g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);for(const[a,b]of[[-6,-1],[4,-1],[-1,-6],[-1,4]])Rg(x+a-1,y+b-1,5,5,O);Rg(x-6,y,3,1,c);Rg(x+4,y,3,1,c);Rg(x,y-6,1,3,c);Rg(x,y+4,1,3,c);Rg(x,y,1,1,c);g.restore()}_dh28()};
// --- update: mana, spells, particles, effects, upgrade watcher ---
const _u28=upd;upd=function(dt){watchUpgrades();const paused=menuOpen||pnOpen;
 const slowed=paused?null:en.filter(n=>n.slow>0).map(n=>[n,n.x,n.y]);_u28(dt);if(paused)return;
 CASTT=Math.max(0,CASTT-dt);MANA=Math.min(maxMP(),MANA+dt*.5*(1+.4*nCls('m')));
 for(const[n,ox,oy]of slowed){n.x=ox+(n.x-ox)*.3;n.y=oy+(n.y-oy)*.3;n.slow-=dt}
 for(const n of en){if(n.dead||!(n.burn>0))continue;const b0=Math.ceil(n.burn);n.burn-=dt;if(Math.ceil(n.burn)<b0&&n.burn>0){n.hp-=1;DMGS.push({x:n.x,y:n.y-14,v:'1',t:0,c:'#f88830',sc:curScene()});addXp(ML,2);if(n.hp<=0)spellKill(n)}}
 const sc=curScene();
 for(const s of SPELLS){if(s.sc!==sc){s.dead=1;continue}s.t+=dt;const nx=s.x+s.vx*dt,ny=s.y+s.vy*dt;if(s.t>s.life||projBlocked(nx,ny+4)){s.dead=1;for(let k=0;k<5;k++)part(s.x,s.y,(Math.random()-.5)*80,(Math.random()-.7)*60,.3,WSP[s.el].col,60);continue}s.x=nx;s.y=ny;
  if(Math.random()<.6)part(s.x,s.y,(Math.random()-.5)*20,(Math.random()-.5)*20,.25,WSP[s.el][Math.random()<.5?'col':'c2'],s.el==='fire'?-40:0);
  for(const n of en){if(n.dead)continue;const big=n.type==='boss'||n.type==='bonelord'||n.big;if(Math.hypot(n.x-s.x,(n.y-(big?10:4))-s.y)<(big?18:10)){s.dead=1;spellHit(s,n,s.dmg);
    if(s.el==='storm'){let nb=null,bd=56;for(const o of en){if(o===n||o.dead)continue;const d=Math.hypot(o.x-n.x,o.y-n.y);if(d<bd){bd=d;nb=o}}if(nb){const l=Math.hypot(nb.x-n.x,nb.y-n.y)||1;for(let k=0;k<l;k+=3)part(n.x+(nb.x-n.x)*k/l+(Math.random()-.5)*4,n.y-6+(nb.y-n.y)*k/l+(Math.random()-.5)*4,0,0,.18,k%2?'#fff':'#f8f048',0);spellHit(s,nb,Math.max(1,s.dmg-1))}}break}}}
 for(let i=SPELLS.length-1;i>=0;i--)if(SPELLS[i].dead)SPELLS.splice(i,1);
 for(const q of PARTS){q.t+=dt;q.vy+=q.g*dt;q.x+=q.vx*dt;q.y+=q.vy*dt}for(let i=PARTS.length-1;i>=0;i--)if(PARTS[i].t>PARTS[i].life)PARTS.splice(i,1);if(PARTS.length>400)PARTS.splice(0,PARTS.length-400);
 actFx(dt)};
// --- gear is safe when you fall; a new game clears it ---
let NEWG=false;
const _rs28=reset;reset=function(){const keep=NEWG?{}:Object.fromEntries(EQK.map(k=>[k,inv[k]|0]));_rs28();for(const k in keep)if(keep[k])inv[k]=keep[k];SPELLS.length=0};
const _ng28=newGame;newGame=function(){NEWG=true;try{_ng28()}finally{NEWG=false}CLS={helm:null,body:null,legs:null};WAND=null;MANA=10;for(const k of EQK)inv[k]=0;snapEq()};
// --- saving ---
const _sn28=snap;snap=function(){const s=_sn28();s.cls={...CLS};s.wand=WAND;s.mp=Math.round(MANA);s.offh=1;return s};
const _ap28=applySave;applySave=function(S){_ap28(S);CLS={helm:null,body:null,legs:null};if(S.cls)for(const s of['helm','body','legs'])CLS[s]=S.cls[s]==='r'||S.cls[s]==='m'?(ARM[s]?null:S.cls[s]):null;
 WAND=S.wand&&WSP[S.wand]?S.wand:null;if(Array.isArray(S.xp))XPS[ML]=Math.max(0,+S.xp[ML]||0);MANA=Math.min(maxMP(),isFinite(S.mp)?+S.mp:10);
 // one item in the off-hand (a bow wins over a wand); saves from before the off-hand get their best bow back in it
 if(TL.bow&&WAND){inv['eq_w'+WAND]=(inv['eq_w'+WAND]|0)+1;WAND=null}
 if(!S.offh&&!TL.bow&&!WAND){for(const t of[2,1])if((inv['eq_bow'+t]|0)>0){inv['eq_bow'+t]--;TL.bow=t;break}}snapEq()};
// --- bag: EQUIP button ---
const _bag28=bagGridHTML;bagGridHTML=function(){let h=_bag28();if(invSel&&EQ[invSel]&&(inv[invSel]|0)>0)h=h.replace('<div class="bd">','<div class="bd"><button class="use eqi" data-k="'+invSel+'">EQUIP</button>');return h};
// --- equipment screen ---
const SLOTS=[['helm','HEAD'],['body','BODY'],['legs','LEGS'],['main','MAIN HAND'],['off','OFF HAND'],['axe','AXE'],['pick','PICKAXE'],['rod','FISHING ROD'],['hoe','HOE'],['can','WATERING CAN']];
function eqIcon(k){const e=EQ[k];return iconURL(e.ic,e.col)}
equipHTML=function(){let h='<div class="eqh">'+esc(pname())+'</div><div class="eqw"><canvas id="tcs" width="32" height="40"></canvas></div><div class="eqg">';
 for(const[s,lab]of SLOTS){const k=occ(s),e=k&&EQ[k];h+='<button class="eqs eqb'+(e?'':' none')+(EQSEL===s?' on':'')+'" data-s="'+s+'"><img alt="" src="'+(e?eqIcon(k):iconURL({main:'sword',off:'bow',can:'can'}[s]||s))+'"><div class="ei"><small>'+lab+'</small>'+(e?esc(e.n):'Empty')+'</div></button>'}
 h+='</div>';
 if(EQSEL){const lab=SLOTS.find(x=>x[0]===EQSEL)[1],opts=EQK.filter(k=>EQ[k].slot===EQSEL&&(inv[k]|0)>0);h+='<div class="qc" style="margin-top:10px"><b>'+lab+'</b>';
  if(!opts.length)h+='<p style="opacity:.7">Nothing in your bag for this slot.</p>';for(const k of opts)h+='<button class="sb eqo" data-k="'+k+'" style="margin:6px 0">Equip '+esc(EQ[k].n)+(inv[k]>1?' (×'+inv[k]+')':'')+'</button>';
  if(occ(EQSEL))h+='<button class="sb equ" data-s="'+EQSEL+'" style="margin:6px 0;background:#fff">Put away (unequip)</button>';h+='</div>'}
 else h+='<div class="tl" style="font-size:12px;font-weight:400;opacity:.7;margin-top:6px">Tap a slot to equip or put away gear.</div>';
 const r=nCls('r'),m=nCls('m'),rows=[['Melee damage',1+TL.sword+Math.floor(lvOf(0)/15)+(typeof meleeFlat==='function'?meleeFlat():0)],['Ranged damage',TL.bow?arrowDmg()+' · range '+bowRange():'-'],['Magic damage',WAND?spellDmg(WAND)+' ('+WAND+')':'-'],['Block chance',Math.round(blockCh()*100)+'%'],['Mana',Math.floor(MANA)+' / '+maxMP()],['Arrows',((inv.iarrow|0)?(inv.iarrow|0)+' iron · ':'')+(inv.arrow|0)]];
 if(r)rows.push(['Ranger set',r+'/3']);if(m)rows.push(['Mage set',m+'/3']);
 return h+'<div class="qc" style="margin-top:12px">'+rows.map(([a,b])=>'<div class="tc-r"><span>'+a+'</span><b>'+b+'</b></div>').join('')+'</div>'};
const est=document.createElement('style');est.textContent='#pn .eqb{font:inherit;text-align:left;cursor:pointer;width:100%;color:#404040!important;text-shadow:none!important}#pn .eqb .ei{color:#404040!important}#pn .eqb.none .ei{color:#909090!important}#pn .eqb.on{border-color:#5878b8!important;background:#eef3ff!important}';document.head.appendChild(est);
const _oc28=pbd.onclick;pbd.onclick=e=>{let b;
 if((b=e.target.closest('.eqi'))){equipItem(b.dataset.k);rPn();return}
 if((b=e.target.closest('.eqb'))){EQSEL=EQSEL===b.dataset.s?null:b.dataset.s;sfx('talk');rPn();return}
 if((b=e.target.closest('.eqo'))){equipItem(b.dataset.k);EQSEL=null;rPn();return}
 if((b=e.target.closest('.equ'))){unequipSlot(b.dataset.s);EQSEL=null;rPn();return}
 _oc28(e)};
// --- gear sprites (ranger green, wizard purple) ---
OPT.hatc.push('#4a8a3a','#6848b8');OPT.shirt.push('#4a8a3a','#6848b8');OPT.pants.push(sh2('#4a8a3a',.85),sh2('#6848b8',.85));
const _gc28=gearCH;gearCH=function(){const c=_gc28();const ix=v=>v==='r'?3:4;if(CLS.helm==='r'){c.ht=2;c.hcol=HB+3}else if(CLS.helm==='m')c.ht=0;if(CLS.body)c.sh=SB+ix(CLS.body);if(CLS.legs)c.pn=PB+ix(CLS.legs);return c};
// --- where to get it: ranger gear is fletched from wolf pelts; the hermit sells wands and wizard clothes ---
FREC.push({k:'eq_rhelm',n:'Ranger hood',c:{pelt:2,wood:1},lv:10,xp:60,f:()=>{inv.eq_rhelm=(inv.eq_rhelm|0)+1;say('Made a ranger hood. Equip it from your Bag.')}},
 {k:'eq_rlegs',n:'Ranger chaps',c:{pelt:3,wood:1},lv:12,xp:80,f:()=>{inv.eq_rlegs=(inv.eq_rlegs|0)+1;say('Made ranger chaps. Equip them from your Bag.')}},
 {k:'eq_rbody',n:'Ranger vest',c:{pelt:4,wood:2},lv:15,xp:110,f:()=>{inv.eq_rbody=(inv.eq_rbody|0)+1;say('Made a ranger vest. Equip it from your Bag.')}});
const HSHOP=[['eq_wfire',150],['eq_wice',250],['eq_wstorm',400],['eq_mhelm',80],['eq_mbody',160],['eq_mlegs',120]];
const _fh28=folkHTML;folkHTML=function(n){let h=_fh28(n);if(n.id!=='hermit')return h;
 h+='<div class="tl" style="margin-top:12px">HERMIT\'S WARES · Gold: '+GLD+'</div><div class="qc" style="font-size:13px"><p>"Magic\'s not for everyone. Wands drink from your mana, not your arrows."</p></div>';
 for(const[k,c]of HSHOP){const e=EQ[k];h+='<button class="sb xb" data-a="hb_'+k+'" style="opacity:'+(GLD>=c?1:.45)+'">'+esc(e.n)+'<br><small>'+c+' gold'+(e.lv?' · Magic '+e.lv:'')+(e.kind==='wand'?' · '+WSP[e.el].cost+' mana per cast':'')+'</small></button>'}return h};
const _xa28=xAct;xAct=function(a){if(a.startsWith('hb_')){const k=a.slice(3),row=HSHOP.find(r=>r[0]===k);if(!row)return;if(GLD<row[1]){say('Not enough gold');sfx('swish');return}GLD-=row[1];inv[k]=(inv[k]|0)+1;say('Bought the '+EQ[k].n.toLowerCase()+'. Equip it from your Bag.');sfx('coin');saveLocal(true);rPn();return}_xa28(a)};
// --- icons: wands (and fallbacks for helm / body / legs / can) ---
const _icon28=iconURL;iconURL=function(k,col){if(k==='wfire'||k==='wice'||k==='wstorm'){const key='g28'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};const W2=WSP[k.slice(1)];
  for(let i=0;i<8;i++)r(2+i,11-i,2,2,'#7a4a20');r(9,1,4,4,W2.col);r(10,2,2,2,W2.c2);return ICONC[key]=c.toDataURL()}
 if(EQ[k])return iconURL(EQ[k].ic,EQ[k].col);return _icon28(k,col)};
// mana bar on the HUD, Magic in the help
hp.innerHTML=hp.innerHTML.replace('Shift: sprint · R: dodge roll','Shift: sprint · R: dodge roll<br>P: equipment (equip tools, weapons, armor)');
if(typeof HELP_PAD!=='undefined'){}
snapEq();

// --- wizard look: a proper pointed hat and a long robe drawn over the character ---
function wizOverlay(ox,oy,dir,st,fl){const C=GC;if(!C)return;const R=(a,b,w,hh,c)=>{C.fillStyle=c;C.fillRect(ox+(fl?-a-w:a),oy+b,w,hh)};const by=st?-1:0,P1='#6848b8',P2='#4a3090',P3='#8a6ad8',GDc='#f8d848';
 if(CLS.body==='m'){const sw=st===1?1:st===2?-1:0;
  if(dir===2){R(-4,-6+by,8,12-by,O);R(-3,-5+by,6,10-by,P1);R(-3,-5+by,2,10-by,P3);R(-3,4,6,1,GDc);R(-3,-1+by,6,1,GDc);R(-4+sw,4,8,2,O);R(-3+sw,4,6,1,P2)}
  else{R(-6,-6+by,12,12-by,O);R(-5,-5+by,10,10-by,P1);R(-5,-5+by,2,10-by,P3);R(3,-5+by,2,10-by,P2);R(-5,4,10,1,GDc);R(-5,-1+by,10,1,GDc);
   if(dir===0){R(-1,-5+by,2,9-by,GDc);R(-1,-1+by,2,1,'#f8f0a0')}R(-6+sw,5,12,1,O);
   const sk=OPT.skin[CH.sk][0];R(-8,-3+by,3,4,O);R(5,-3+by,3,4,O);R(-7,-2+by,2,2,sk);R(5,-2+by,2,2,sk);R(-7,-4+by,2,2,P2);R(5,-4+by,2,2,P2)}}
 if(CLS.helm==='m'&&!(typeof HIDEH!=='undefined'&&HIDEH)){const t=dir===2?-1:dir===1?1:0;
  R(-8,-15+by,16,3,O);R(-7,-14+by,14,1,P1);R(-7,-13+by,14,1,P2);
  const rows=[[-5,10],[-4,8],[-3,6],[-2,5],[-2,4],[-1,3],[-1,2]];rows.forEach(([a,w],i)=>{const y=-16-i+by,xo=Math.round(i*i*t/14);R(a+xo-1,y,w+2,1,O)});
  rows.forEach(([a,w],i)=>{const y=-16-i+by,xo=Math.round(i*i*t/14);R(a+xo,y,w,1,i===1?GDc:P1);if(w>3)R(a+xo,y,1,1,P3)});
  const tx=-1+Math.round(49*t/14)+(t?2*t:0);R(tx-1,-24+by,3,2,O);R(tx,-24+by,1,1,P1);R(tx+(t||1),-24+by,1,1,P1);
  if(dir!==1){R(-3+Math.round(9*t/14),-18+by,1,1,GDc);R(1,-20+by,1,1,'#fff8c0')}}}
const _pPw=pP;pP=function(tm){_pPw(tm);if(!(CLS.helm==='m'||CLS.body==='m')||SCENE&&false)return;if(hurt>0&&Math.floor(tm*20)%2)return;if(typeof SAILING!=='undefined'&&SAILING)return;
 const st=qm?[1,0,2,0][Math.floor(qW)%4]:0,dir=face[0]?2:face[1]<0?1:0;GC=g;wizOverlay(Math.round(P.x),Math.round(P.y)+(ACTN&&(ACTN.type==='plant'||ACTN.type==='harvest')&&ACTN.t/ACTN.dur<.7?1:0),dir,st,face[0]<0)};
const _dcs=drawCardSprite;drawCardSprite=function(){_dcs();const c=document.getElementById('tcs');if(c&&(CLS.helm==='m'||CLS.body==='m')){GC=c.getContext('2d');wizOverlay(16,29,0,0,false)}};

