// ---------------------------------------------------------------- 35. Deep dungeons and rare loot
// The Slime King's cave and the Bone Lord's tomb are now three-floor dungeons (64x46 tiles a floor), rebuilt each day:
// the Slime Caverns are winding caves, the Sunken Tomb is chambers joined by corridors. Stairs lead down; the third
// floor is the boss's lair. Monsters sleep until you come near. Chests hold loot by rarity (common, uncommon, rare,
// epic, legendary): gold, ancient coins, gems, the Elixir of Life (saves you from one fatal blow), and two legendary
// weapons: the Crystal blade (caverns) and the Bone bow (tomb). A minimap shows what you've explored.
const DUN={day:-1,floors:{},opened:new Set()};
const DKIND={cave:{name:'Slime Caverns',floor:['#6a6058','#625850'],wall:'#4a423c',trim:'#2e2824',W:64,H:46},
 tomb:{name:'Sunken Tomb',floor:['#c8a870','#bc9c64'],wall:'#9a7848',trim:'#5a4020',W:62,H:46}};
const dKey=(k,f)=>'dun_'+k+'_'+f;
function dRng(seed){let s=(seed>>>0)||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
function dBfs(G,W,H,sx,sy){const d=new Int32Array(W*H).fill(-1),q=new Int32Array(W*H);let h=0,t=0,c=0;const s=sy*W+sx;if(G[s])return{d,c};d[s]=0;q[t++]=s;
 while(h<t){const i=q[h++];c++;const x=i%W;for(const j of[i-1,i+1,i-W,i+W]){if(j<0||j>=W*H||(j===i-1&&x===0)||(j===i+1&&x===W-1))continue;if(!G[j]&&d[j]<0){d[j]=d[i]+1;q[t++]=j}}}return{d,c}}
function genCave(W,H,rnd){const ex=W>>1;let G,R2;
 for(let tries=0;tries<25;tries++){G=new Uint8Array(W*H).fill(1);for(let y=2;y<H-1;y++)for(let x=1;x<W-1;x++)G[y*W+x]=rnd()<.45?1:0;
  for(let it=0;it<5;it++){const n=G.slice();for(let y=2;y<H-1;y++)for(let x=1;x<W-1;x++){let c=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)c+=G[(y+dy)*W+x+dx];n[y*W+x]=c>=5?1:0}G=n}
  for(let y=H-9;y<H-1;y++)for(let x=ex-1;x<=ex+1;x++)G[y*W+x]=0;for(let x=0;x<W;x++)G[(H-1)*W+x]=x===ex?0:1;for(let y=0;y<2;y++)for(let x=0;x<W;x++)G[y*W+x]=1;
  R2=dBfs(G,W,H,ex,H-1);if(R2.c>W*H*.32)break}
 for(let i=0;i<W*H;i++)if(!G[i]&&R2.d[i]<0)G[i]=1;return{G,ex}}
function genTomb(W,H,rnd){const G=new Uint8Array(W*H).fill(1),ex=W>>1,rooms=[{x:ex-4,y:H-9,w:9,h:7}];
 const carve=(x0,y0,x1,y1)=>{for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(x>0&&y>1&&x<W-1&&y<H-1)G[y*W+x]=0};
 for(let t=0;t<400&&rooms.length<14;t++){const w=7+Math.floor(rnd()*8),h=6+Math.floor(rnd()*5),x=2+Math.floor(rnd()*(W-w-4)),y=3+Math.floor(rnd()*(H-h-13));
  if(rooms.some(r=>x<r.x+r.w+2&&x+w+2>r.x&&y<r.y+r.h+2&&y+h+2>r.y))continue;rooms.push({x,y,w,h})}
 for(const r of rooms)carve(r.x,r.y,r.x+r.w,r.y+r.h);
 const cx=r=>r.x+(r.w>>1),cy=r=>r.y+(r.h>>1),con=[rooms[0]],rest=rooms.slice(1).sort((a,b)=>Math.hypot(cx(a)-cx(rooms[0]),cy(a)-cy(rooms[0]))-Math.hypot(cx(b)-cx(rooms[0]),cy(b)-cy(rooms[0])));
 for(const r of rest){let b=con[0],bd=1e9;for(const c of con){const d=Math.abs(cx(c)-cx(r))+Math.abs(cy(c)-cy(r));if(d<bd){bd=d;b=c}}
  const x0=cx(r),y0=cy(r),x1=cx(b),y1=cy(b);if(rnd()<.5){carve(Math.min(x0,x1),y0,Math.max(x0,x1)+2,y0+2);carve(x1,Math.min(y0,y1),x1+2,Math.max(y0,y1)+2)}else{carve(x0,Math.min(y0,y1),x0+2,Math.max(y0,y1)+2);carve(Math.min(x0,x1),y1,Math.max(x0,x1)+2,y1+2)}con.push(r)}
 G[(H-1)*W+ex]=0;G[(H-2)*W+ex]=0;return{G,ex,rooms}}
function buildFloor(kind,f){const K=DKIND[kind],W=K.W,H=K.H,rnd=dRng(today()*7919+f*104729+(kind==='tomb'?17:kind==='cave'?3:kind.length*31+kind.charCodeAt(kind.length-1))),Gn=(kind==='cave'||(DKIND[kind]&&DKIND[kind].cavey))?genCave(W,H,rnd):genTomb(W,H,rnd),G=Gn.G,ex=Gn.ex;
 const R={w:W,h:H,ex,cave:1,tomb:kind==='tomb'?1:0,floor:K.floor,wall:K.wall,trim:K.trim,items:[],solid:new Set(),mobs:[],dun:{kind,f,G,seen:new Uint8Array(W*H),mm:null}};
 let dist=dBfs(G,W,H,ex,H-1).d;const cells=[];for(let i=0;i<W*H;i++)if(!G[i]&&dist[i]>=0)cells.push(i);
 const far=cells.reduce((a,b)=>dist[b]>dist[a]?b:a,cells[0]),fx=far%W,fy=(far/W)|0;
 if(f<(DKIND[kind].floors||3))R.items.push({t:'stairs',x:fx,y:fy});
 else{for(let y=fy-4;y<=fy+4;y++)for(let x=fx-5;x<=fx+5;x++)if(x>0&&y>1&&x<W-1&&y<H-1&&((x-fx)/5.5)**2+((y-fy)/4.5)**2<=1)G[y*W+x]=0;R.dun.boss=[fx,fy];dist=dBfs(G,W,H,ex,H-1).d;cells.length=0;for(let i=0;i<W*H;i++)if(!G[i]&&dist[i]>=0)cells.push(i)}
 const used=new Set([far]),near=(i,r)=>{const x=i%W,y=(i/W)|0;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(used.has((y+dy)*W+x+dx))return true;return false},
  open8=i=>{for(const j of[i-1,i+1,i-W,i+W,i-W-1,i-W+1,i+W-1,i+W+1])if(G[j])return false;return true},
  pick=(minD,test)=>{for(let t=0;t<400;t++){const i=cells[Math.floor(rnd()*cells.length)];if(dist[i]<minD||near(i,1)||(test&&!test(i)))continue;if(R.dun.boss&&Math.hypot(i%W-fx,((i/W)|0)-fy)<6)continue;used.add(i);return i}return-1};
 const add=(t,i,o)=>{if(i<0)return;const it=Object.assign({t,x:i%W,y:(i/W)|0},o||{});R.items.push(it);if(it.solid)R.solid.add(i)};
 // treasure chests, far from the entrance
 for(let k=0;k<3+f;k++)add('dchest',pick(14,open8),{solid:1,use:'dchest',id:kind+f+'_'+k});
 // decor
 if(kind==='cave'||(DKIND[kind]&&DKIND[kind].cavey)){for(let k=0;k<9;k++)add('crystal',pick(4,open8),{solid:1});for(let k=0;k<7;k++)add('boulder',pick(4,open8),{solid:1});for(let k=0;k<7;k++)add('bones',pick(4))}
 else{for(const r of Gn.rooms.slice(1))if(r.w>=9&&r.h>=7)for(const[x,y]of[[r.x+2,r.y+2],[r.x+r.w-3,r.y+2],[r.x+2,r.y+r.h-3],[r.x+r.w-3,r.y+r.h-3]]){const i=y*W+x;if(!G[i]&&dist[i]>=0&&!used.has(i)&&open8(i)){used.add(i);add('pillar',i,{solid:1})}}
  for(let k=0;k<10;k++)add('urn',pick(4,i=>G[i-W]&&!G[i+W]&&!G[i-1]&&!G[i+1]&&!G[i+W-1]&&!G[i+W+1]),{solid:1});for(let k=0;k<8;k++)add('bones',pick(4))}
 // monsters, asleep until you come near
 for(let k=0;k<12+5*f;k++){const i=pick(11);if(i<0)continue;const x=(i%W)*16+8,y=((i/W)|0)*16+8;
  if(kind==='cave')R.mobs.push(f>=2&&rnd()<.35?{x,y,hp:9+2*f,kx:0,ky:0,type:'slime',vr:'magma'}:{x,y,hp:3+f,kx:0,ky:0,type:'slime'});
  else R.mobs.push(rnd()<.25?{x,y,hp:5+2*f,kx:0,ky:0,type:'wolf'}:{x,y,hp:6+2*f,kx:0,ky:0,type:'skel',tcd:1+rnd()*2})}
 for(let i=0;i<W*H;i++)if(G[i])R.solid.add(i);return R}
function dFloor(kind,f){const d=today();if(DUN.day!==d){for(const k in DUN.floors){HDRM.delete(DUN.floors[k]);delete ROOMS[k]}DUN.floors={};DUN.day=d;DUN.opened=new Set()}
 const k=dKey(kind,f);if(!DUN.floors[k]){DUN.floors[k]=buildFloor(kind,f);ROOMS[k]=DUN.floors[k]}const R=DUN.floors[k];for(const it of R.items)if(it.t==='dchest'&&DUN.opened.has(it.id)){it.open=1;it.use=null}return R}
function dArrive(R,from){en=[];const D=R.dun,W=R.w;
 if(from==='below'){const s=R.items.find(it=>it.t==='stairs');if(s){const opts=[[0,1],[1,0],[-1,0],[0,-1],[1,1],[-1,1]];for(const[dx,dy]of opts){const i=(s.y+dy)*W+s.x+dx;if(!R.solid.has(i)&&!R.items.some(it=>it.solid&&it.x===s.x+dx&&it.y===s.y+dy)){P.x=(s.x+dx)*16+8;P.y=(s.y+dy)*16+10;break}}}}
 if(D.f===3&&D.boss&&!D.bossSpawned){const alive=D.kind==='cave'?CAVE_DAY!==today():TOMB_DAY!==today();if(alive){const[bx,by]=D.boss;
  R.mobs.push(D.kind==='cave'?{x:bx*16+8,y:by*16+8,hp:30,kx:0,ky:0,type:'boss'}:{x:bx*16+8,y:by*16+8,hp:45,kx:0,ky:0,type:'bonelord',tcd:2,scd:7});D.bossSpawned=1}}}
function dGo(kind,f,from){const ret=SCENE.ret,R=dFloor(kind,f);enterScene(dKey(kind,f),null,ret);dArrive(R,from);
 say(DKIND[kind].name+' - floor '+f+' of '+(DKIND[kind].floors||3)+(f===(DKIND[kind].floors||3)&&!DKIND[kind].noboss?(R.dun.bossDone||(kind==='cave'?CAVE_DAY===today():TOMB_DAY===today())?'. The lair is quiet today.':'. Something big lurks here...'):''));if(f===(DKIND[kind].floors||3)&&!R.dun.bossDone&&!DKIND[kind].noboss)setTimeout(()=>sfx('roar'),300)}
const _es35=enterScene;enterScene=function(id,house,ret){if(id==='cave'||id==='tomb'){const R=dFloor(id,1);_es35(dKey(id,1),null,ret);dArrive(R,null);
  say('You enter the '+DKIND[id].name+'. Three floors deep - find the stairs down. Chests hold rare loot!');return}_es35(id,house,ret)};
const _ls35=leaveScene;leaveScene=function(){const R=SCENE&&SCENE.room;if(R&&R.dun&&R.dun.f>1){dGo(R.dun.kind,R.dun.f-1,'below');return}_ls35()};
// waking monsters, taking stairs, mapping, and the Elixir of Life
const _u35=upd;upd=function(dt){const R=SCENE&&SCENE.room;
 if(R&&R.dun&&!dead&&!menuOpen){en=en.filter(n=>!(R.mobs.includes(n)&&!n.dead&&Math.hypot(n.x-P.x,n.y-P.y)>230));
  for(const m of R.mobs)if(!m.dead&&!en.includes(m)&&Math.hypot(m.x-P.x,m.y-P.y)<170)en.push(m);
  const px=Math.floor(P.x/16),py=Math.floor(P.y/16),S=R.dun.seen;let ch=false;for(let dy=-6;dy<=6;dy++)for(let dx=-7;dx<=7;dx++){const x=px+dx,y=py+dy;if(x<0||y<0||x>=R.w||y>=R.h||dx*dx+dy*dy>45)continue;const i=y*R.w+x;if(!S[i]){S[i]=1;ch=true}}if(ch)R.dun.mmDirty=1;
  const st=R.items.find(it=>it.t==='stairs');if(st&&Math.hypot(P.x-(st.x*16+8),P.y-(st.y*16+8))<6){dGo(R.dun.kind,R.dun.f+1,'above');return}}
 const t0=time,was=dead;_u35(dt);
 if(dead&&!was&&(inv.elixir|0)>0){inv.elixir--;dead=false;time=t0;P.hp=6;if(typeof MANA!=='undefined')MANA=maxMP();hurt=1.6;FLASH=.6;say('The Elixir of Life flares - you are saved!');msgT=4;sfx('quest');saveLocal(true)}};
// --- loot ---
const RARC={common:'#f0f0f0',uncommon:'#68d868',rare:'#58a8ff',epic:'#c878ff',legendary:'#ffa830'};
const DITEM={coin:{n:'Ancient coin',v:40,r:'common',d:'An old gold coin from the deep. Sells for a good price.'},ruby:{n:'Ruby',v:120,r:'uncommon',d:'A deep red gem. Sell it for gold.'},
 sapphire:{n:'Sapphire',v:150,r:'uncommon',d:'A brilliant blue gem. Sell it for gold.'},emerald:{n:'Emerald',v:200,r:'rare',d:'A flawless green gem. Sell it for gold.'},
 diamond:{n:'Diamond',v:450,r:'epic',d:'The rarest gem of all. Sells for a fortune.'},elixir:{n:'Elixir of Life',v:300,r:'epic',d:'Keep it in your bag: if you would fall, it saves you once with full health and mana.'}};
for(const k in DITEM){const e=DITEM[k];INVK.push(k);EXTRA_BAG.push(k);INAME[k]=e.n;IDESC[k]=e.d+' ('+e.r[0].toUpperCase()+e.r.slice(1)+')';SELLP[k]=e.v;SN[k]=e.n+(k==='coin'?'s':'');SHORT[k]=e.n.toLowerCase()}
TIER_N[5]='Crystal';TCOL[5]='#68d8f8';
EQ.eq_sword5={slot:'main',kind:'sword',tier:5,n:'Crystal blade',ic:'sword',col:'#68d8f8',v:600};
EQ.eq_bow3={slot:'off',kind:'bow',tier:3,n:'Bone bow',ic:'bow',v:500};
for(const k of['eq_sword5','eq_bow3']){const e=EQ[k];EQK.push(k);INVK.push(k);EXTRA_BAG.push(k);INAME[k]=e.n;SELLP[k]=e.v;SN[k]=e.n+'s';SHORT[k]=e.n.toLowerCase()}
IDESC.eq_sword5='LEGENDARY. A blade of living crystal from the depths of the Slime Caverns. The strongest sword there is.';
IDESC.eq_bow3='LEGENDARY. Carved from the Bone Lord\'s own bones. Shoots further and hits much harder than any other bow.';
const RARK={eq_sword5:'legendary',eq_bow3:'legendary',sbar:'uncommon',ibar:'common',arrow:'common',iarrow:'uncommon',cooked:'common'};
const rarOf=k=>DITEM[k]?DITEM[k].r:RARK[k]||'common';
const _ad35=arrowDmg;arrowDmg=function(){return _ad35()+(TL.bow>=3?2:0)};
const _br35=bowRange;bowRange=function(){return _br35()+(TL.bow>=3?30:0)};
const owns=k=>(inv[k]|0)>0||occ(EQ[k].slot)===k;
function dLoot(kind,f,boss){const r=Math.random,out=[['gold',Math.round((15+r()*25)*f*(boss?5:1))]];
 const com=[['arrow',8+f*4],['ibar',1+(f>1?1:0)],['cooked',2],['coin',1+Math.floor(r()*2)]];out.push(com[Math.floor(r()*com.length)]);if(boss)out.push(['coin',3+f]);
 if(r()<.4+.1*f||boss)out.push([r()<.5?'ruby':'sapphire',1]);if(r()<.07*f||boss)out.push(['emerald',1]);
 if(r()<.02*f+(boss?.4:0))out.push(['diamond',1]);if(r()<.02*f+(boss?.25:0))out.push(['elixir',1]);if(kind==='tomb'&&r()<.12*f)out.push(['sbar',1]);
 const lk=kind==='cave'?'eq_sword5':'eq_bow3';if(!owns(lk)&&r()<(boss?.3:f===3?.05:f===2?.015:0))out.push([lk,1]);return out}
function dOpen(it){if(it.open||DUN.opened.has(it.id))return;const R=SCENE.room;DUN.opened.add(it.id);it.open=1;it.use=null;const L=dLoot(R.dun.kind,R.dun.f,it.boss);let best='common',names=[];
 const ord=['common','uncommon','rare','epic','legendary'];L.forEach(([k,n],j)=>{if(k==='gold')GLD+=n;else inv[k]=(inv[k]|0)+n;const ra=k==='gold'?'common':rarOf(k);if(ord.indexOf(ra)>ord.indexOf(best))best=ra;
  const lab=k==='gold'?n+' gold':(n>1?n+' ':'')+(INAME[k]||k);names.push(lab);drops.push({x:it.x*16+8,y:it.y*16-8-j*7,t:-j*.25,tx:'+'+lab,c:RARC[ra]})});
 it.glow=RARC[best];sfx(best==='legendary'||best==='epic'?'quest':'pickup');
 say((best==='legendary'?'LEGENDARY! ':best==='epic'?'Epic find! ':'')+'Chest: '+names.join(', '));msgT=best==='legendary'?6:3.5;if(best==='legendary')FLASH=.4;saveLocal(true)}
// boss chest appears where the boss falls
const _ed35=enemyDrop;enemyDrop=function(n){_ed35(n);const R=SCENE&&SCENE.room;if(!R||!R.dun||(n.type!=='boss'&&n.type!=='bonelord'))return;R.dun.bossDone=1;
 const x=Math.floor(n.x/16),y=Math.floor(n.y/16);R.items.push({t:'dchest',x,y,use:'dchest',id:R.dun.kind+'boss',boss:1});say('A golden chest appears where the '+(n.type==='boss'?'Slime King':'Bone Lord')+' fell!');msgT=4};
// opening chests: HIT or USE when you face one
function dChestNear(){const R=SCENE&&SCENE.room;if(!R||!R.dun)return null;const[fx,fy]=front(12);let best=null,bd=22;for(const it of R.items){if(it.t!=='dchest'||it.open)continue;const d=Math.hypot(it.x*16+8-fx,it.y*16+8-fy);if(d<bd){bd=d;best=it}}return best}
const _atk35=attack;attack=function(){if(!dead&&!menuOpen&&!pnOpen&&swing<=0){const it=dChestNear();if(it&&!en.some(n=>!n.dead&&Math.hypot(n.x-P.x,n.y-P.y)<30)){swing=.2;dOpen(it);return}}_atk35()};
const _uf35=useFurn;useFurn=function(o){if(o&&o.use==='dchest'){dOpen(o);return}_uf35(o)};
// saving: opened chests for today, and the legendary sword survives the tool-tier clamp
const _sn35=snap;snap=function(){const s=_sn35();s.dun={day:DUN.day,op:[...DUN.opened]};s.rare={sword:TL.sword};return s};
const _ap35=applySave;applySave=function(S){_ap35(S);if(S.dun&&Array.isArray(S.dun.op)&&S.dun.day===today()){DUN.day=S.dun.day;DUN.floors={};DUN.opened=new Set(S.dun.op)}
 if(S.rare&&+S.rare.sword===5)TL.sword=5};
// --- drawing: floors, walls (faces where a wall meets the floor below, dark rock tops elsewhere), stairs, chests ---
function hdDunBG(R){let c=HDRM.get(R);if(c)return c;const W=R.w,H=R.h,G=R.dun.G,tomb=R.tomb,b=hdBuf(W*32,H*32),FP=hdShadeOf(R.floor[0],5),FPd=hdShadeOf(R.floor[1],5),WP=hdShadeOf(R.wall,5),CEIL=hdShadeOf(hdMix(R.wall,'#000000',R.tomb?.6:.45),5);
 const wall=(x,y)=>x<0||y<0||x>=W||y>=H?1:G[y*W+x];
 for(let Y=0;Y<H*32;Y++){const cy=Y>>5,ly=Y&31;for(let X=0;X<W*32;X++){const cx=X>>5,lx=X&31;let col;
  if(!wall(cx,cy)){if(tomb){const pal=(cx+cy)%2?FPd:FP,v=.55+(hrand(cx,cy)-.5)*.3+(hdH(X,Y)-.5)*.08;col=pal[hdQ(v,5,X,Y)];if(lx===0||ly===0)col=FP[0];else if(lx===1||ly===1)col=FP[4]}
   else{const v=hdVN(X/14,Y/14)*.6+hdVN(X/5,Y/5)*.3+hdH(X,Y)*.1;col=FP[hdQ(v*.9+.05,5,X,Y)];if(Math.abs(hdVN(X/22+9,Y/22)-.5)<.006)col=FP[1]}
   if(wall(cx,cy-1)&&ly<6)col=FP[0];else if(wall(cx-1,cy)&&lx<3||wall(cx+1,cy)&&lx>28)col=FP[ly%2?1:0]}
  else if(!wall(cx,cy+1)){// wall face
   if(tomb){const row=ly>>3,off=row%2?8:0;col=WP[hdQ(.75-ly/40+(hrand((X+off)>>4,cy*4+row)-.5)*.25,5,X,Y)];if((ly&7)===0||((X+off)&15)===0)col=WP[0]}
   else{const v=hdVN(X/6,Y/18)*.6+hdH(X>>1,Y)*.2;col=WP[hdQ(.85-ly/34+v*.35-.2,5,X,Y)];if(hdVN(X/3,Y/30)>.72)col=WP[0]}
   if(ly<3)col=WP[4];if(ly>=29)col=WP[0]}
  else{const v=R.tomb?.5+(hrand((X+((Y>>4)%2)*8)>>4,Y>>4)-.5)*.35-(((X+((Y>>4)%2)*8)&15)===0||(Y&15)===0?.3:0):hdVN(X/9,Y/9)*.75+hdH(X>>1,Y>>1)*.25;col=CEIL[hdQ(v*.85,5,X,Y)];
   const eL=!wall(cx-1,cy)&&lx<3,eR=!wall(cx+1,cy)&&lx>28,eU=!wall(cx,cy-1)&&ly<3;if(eL||eR||eU)col=(eU&&ly===0)||(eL&&lx===0)||(eR&&lx===31)?WP[0]:WP[3]}
  b.d[Y*b.w+X]=col}}
 const ex=R.ex,f=R.dun.f;for(let ly=0;ly<32;ly++)for(let lx=4;lx<28;lx++){const X=ex*32+lx,Y=(H-1)*32+ly;if(f===1){if(ly>14)b.d[Y*b.w+X]=hdC(hdMix('#f8e8b8',R.floor[0],(32-ly)/18))}else{const st=Math.floor(ly/6);b.d[Y*b.w+X]=(ly%6===0)?WP[0]:WP[Math.min(4,1+st)]}}
 c=hdCan(b);HDRM.set(R,c);return c}
const _rbg35=ROOMBG;ROOMBG=(R,W2,H2)=>{if(!R.dun)return _rbg35(R,W2,H2);g.fillStyle='#0c0a0e';g.fillRect(-200,-200,W2+400,H2+400);g.drawImage(hdDunBG(R),0,0,W2,H2)};
function hdStairs(tomb){return hdK('stc'+tomb,0,0,16,16,p=>{const SP=tomb?hdShadeOf('#b89868',5):STP;p.F(0,0,32,32,SP[0]);for(let k=0;k<5;k++){const y=2+k*6,in2=2+k*2;p.F(in2,y,32-in2,y+5,SP[4-k]);p.F(in2,y,32-in2,y+1,SP[4])}p.F(12,30,20,32,hdC('#000000'))},false)}
function hdDChest(open,boss){return hdK('dc'+(open?1:0)+(boss?1:0),0,-1,16,17,p=>{const BP=boss?hdShadeOf('#e0b030',4):hdShadeOf('#8a5a2c',4),BD=boss?GOLDP:METP;
 p.box(2,12,30,30,BP,1);for(const x of[6,24])p.F(x,12,x+2,30,BD[2]);p.F(2,12,30,13,BP[0]);
 if(open){p.box(2,-2,30,6,BP,2,.1);p.F(4,6,28,13,hdC('#1a0e06'));for(const x of[6,24])p.F(x,-2,x+2,6,BD[2])}else{p.box(2,3,30,13,BP,3,.1);for(const x of[6,24])p.F(x,3,x+2,13,BD[2]);p.box(13,9,19,16,boss?hdShadeOf('#f05050',4):GOLDP,1,.1)}})}
const _df35=drawFurn;drawFurn=function(it,tm){const x0=it.x*16,y0=it.y*16;
 if(it.t==='stairs')return hdPut(hdStairs(SCENE&&SCENE.room.tomb?1:0),x0,y0);
 if(it.t==='dchest'){shd(x0+8,y0+15,14);if(!it.open){const pz=.5+.5*Math.sin(tm*3+x0);g.fillStyle=it.boss?'rgba(255,210,90,'+(.25*pz)+')':'rgba(255,230,150,'+(.12*pz)+')';g.beginPath();g.arc(x0+8,y0+8,it.boss?16:11,0,6.283);g.fill()}
  hdPut(hdDChest(it.open,it.boss),x0,y0);if(it.open&&it.glow&&(tm*2|0)%3!==0){g.fillStyle=it.glow;g.fillRect(x0+7+Math.sin(tm*5)*3,y0+2-((tm*8)%6),1,1)}return}
 _df35(it,tm)};
// magma slimes (deeper caverns): red-orange and glowing
let HDMG=null;
function hdMagma(f){if(!HDMG){HDMG=[];for(const fr of[0,1]){const ht=fr?20:23,b=hdBuf(34,26),cy=25,pal=hdP(['#5a1008','#a82810','#e05018','#f88830','#ffd070']);
  hdSph(b,17,cy,fr?16.5:15.5,ht,pal,{cut:24,id:1,b:.05,fn:(v,x,y,nx,ny)=>v+(ny>.55?-.25:0)+(hdH(x>>1,y>>1)<.12?.4:0)});for(const[a,c2]of[[9,cy-ht+6],[10,cy-ht+5],[11,cy-ht+5],[12,cy-ht+5]])hdSet(b,a,c2,hdC('#fff4c0'));hdOutline(b,{1:hdC('#2a0804')});HDMG[fr]=hdCan(b)}}return HDMG[f]}
const _sl35=SLIMEHD;SLIMEHD=(n,tm)=>{if(n.vr!=='magma'||Math.abs(n.kx)+Math.abs(n.ky)>.8)return _sl35(n,tm);const x=Math.round(n.x),y=Math.round(n.y),f=Math.floor(tm*3+n.x)%2;
 g.fillStyle='rgba(255,120,40,.18)';g.beginPath();g.arc(x,y,12,0,6.283);g.fill();shd(x,y+5,15);const sp=hdMagma(f),w=sp.width/2,hh=sp.height/2,top=y+6.5-hh;g.drawImage(sp,x-w/2,top,w,hh);
 const e=top+(f?4.5:5.5),d=P.x>n.x?.5:-.5;g.fillStyle='#fff4c0';for(const ex of[x-4.5,x+1.5])g.fillRect(ex,e,3,3.5);g.fillStyle='#3a0804';for(const ex of[x-4.5,x+1.5])g.fillRect(ex+1+d,e+1,1.5,2)};
// loot icons
const _ic35=iconURL;iconURL=function(k,col){if(!DITEM[k])return _ic35(k,col);const key='g35'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
 if(k==='coin'){r(3,3,8,8,'#c89820');r(4,2,6,10,'#c89820');r(2,4,10,6,'#c89820');r(4,4,6,6,'#f8d848');r(5,3,4,1,'#fff0a0');r(6,5,2,4,'#a07010')}
 else if(k==='elixir'){r(6,1,2,2,'#a86830');r(5,3,4,2,'#d8e8f0');r(3,5,8,7,'#d8e8f0');r(4,6,6,5,'#e83878');r(4,6,2,2,'#ff98c0');r(4,11,6,1,'#a82050')}
 else{const C={ruby:['#a01030','#e03050','#ff8098'],sapphire:['#102a90','#3060e0','#90b0ff'],emerald:['#0a6030','#30b060','#90f0b0'],diamond:['#7090b0','#d8f0ff','#ffffff']}[k];
  r(4,2,6,2,C[1]);r(2,4,10,3,C[1]);r(3,7,8,2,C[0]);r(4,9,6,2,C[0]);r(6,11,2,1,C[0]);r(4,2,2,2,C[2]);r(3,4,3,2,C[2]);r(7,5,2,1,C[2])}
 return ICONC[key]=c.toDataURL()};
// minimap of what you've explored (top right, under the day box)
const _dh35=drawHUD;drawHUD=function(){_dh35();const R=SCENE&&SCENE.room;if(!R||!R.dun||menuOpen||dead)return;const D=R.dun;
 if(!D.mm){D.mm=document.createElement('canvas');D.mm.width=R.w;D.mm.height=R.h;D.mmDirty=1}
 if(D.mmDirty){D.mmDirty=0;const x=D.mm.getContext('2d'),im=x.createImageData(R.w,R.h),u=new Uint32Array(im.data.buffer);for(let i=0;i<R.w*R.h;i++)if(D.seen[i])u[i]=D.G[i]?hdC('#3a3448'):hdC(R.tomb?'#c8a870':'#8a8070');
  for(const it of R.items){const i=it.y*R.w+it.x;if(!D.seen[i])continue;if(it.t==='stairs')u[i]=hdC('#f8f8f8');else if(it.t==='dchest'&&!it.open)u[i]=hdC('#f8d848')}x.putImageData(im,0,0)}
 const L=HUDL||hudLayout(),U=L.U,w=L.dw,hh=w*R.h/R.w,x0=L.dx,y0=L.top+L.dh+46*U;g.save();g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;
 g.fillStyle='rgba(10,8,16,.72)';g.fillRect(x0-3*U,y0-3*U,w+6*U,hh+16*U);g.drawImage(D.mm,x0,y0,w,hh);
 const px=x0+P.x/16/R.w*w,py=y0+P.y/16/R.h*hh;g.fillStyle=(performance.now()/300|0)%2?'#ff4060':'#ffffff';g.fillRect(px-1.5*U,py-1.5*U,3*U,3*U);
 if(D.boss&&D.seen[D.boss[1]*R.w+D.boss[0]]&&!D.bossDone){g.fillStyle='#ff3030';g.fillRect(x0+(D.boss[0]+.5)/R.w*w-2*U,y0+(D.boss[1]+.5)/R.h*hh-2*U,4*U,4*U)}
 g.fillStyle='#f4f0d8';g.font='700 '+(9*U)+'px "SQ Digits","Pixelify Sans",monospace';g.textAlign='left';g.textBaseline='top';g.fillText((D.label||(R.tomb?'Tomb':'Caverns'))+' F'+D.f,x0,y0+hh+2*U);g.restore()};
