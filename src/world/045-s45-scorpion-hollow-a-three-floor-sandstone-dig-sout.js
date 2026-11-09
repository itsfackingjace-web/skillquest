// ---------------------------------------------------------------- 45. Scorpion Hollow: a three-floor sandstone dig south-east of Dusthaven
// Floor 1 Abandoned Dig (big chambers, short corridors, mining gear), floor 2 Buried Ruins (smaller rooms, narrow
// passages, broken pillars, more monsters), floor 3 Scorpion Nest (a round arena with sand piles and stone columns).
// Monsters: sand scorpions (close in, raise a glowing tail, then strike), dust skeletons (throw bones and back away),
// burrowing beetles (dig under, a moving sand mound shows where, then burst out). The Sandclaw Matriarch (55 HP):
// phase 1 alternating claws and a slow tail strike, then a pause; phase 2 (below 65%) burrows and bursts out at a marked
// spot, calls up to two scorpions, wide claw sweeps; phase 3 (below 30%) faster three-strike combos, burrows less, and
// rests longer after each combo. Every attack has a wind-up you can see. Daily reward: 300 gold, 3 steel bars,
// 600 Attack XP, 400 Smithing XP.
EXTRA_DUNGEONS.scorpion={name:'Scorpion Hollow',floors:3,boss:'sandclaw_matriarch',hp:55,generator:'tomb'};
EXTRA_DUNGEON_DAYS.scorpion=-1;
DKIND.scorpion={name:'Scorpion Hollow',floor:['#dcbc84','#d0b078'],wall:'#b48a54',trim:'#6a4820',W:62,H:46,label:'Hollow'};
function genSand(W,H,rnd,f){const G=new Uint8Array(W*H).fill(1),ex=W>>1,rooms=[{x:ex-4,y:H-9,w:9,h:7}],cw=f===2?1:2;
 const carve=(x0,y0,x1,y1)=>{for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(x>0&&y>1&&x<W-1&&y<H-1)G[y*W+x]=0};
 const[wa,wb,ha,hb,maxR]=f===2?[6,5,5,4,16]:[10,7,8,5,10];
 for(let t=0;t<500&&rooms.length<maxR;t++){const w=wa+Math.floor(rnd()*wb),h=ha+Math.floor(rnd()*hb),x=2+Math.floor(rnd()*(W-w-4)),y=3+Math.floor(rnd()*(H-h-13));
  if(rooms.some(r=>x<r.x+r.w+2&&x+w+2>r.x&&y<r.y+r.h+2&&y+h+2>r.y))continue;rooms.push({x,y,w,h})}
 for(const r of rooms)carve(r.x,r.y,r.x+r.w,r.y+r.h);
 const cx=r=>r.x+(r.w>>1),cy=r=>r.y+(r.h>>1),con=[rooms[0]],rest=rooms.slice(1).sort((a,b)=>Math.hypot(cx(a)-cx(rooms[0]),cy(a)-cy(rooms[0]))-Math.hypot(cx(b)-cx(rooms[0]),cy(b)-cy(rooms[0])));
 for(const r of rest){let b=con[0],bd=1e9;for(const c of con){const d=Math.abs(cx(c)-cx(r))+Math.abs(cy(c)-cy(r));if(d<bd){bd=d;b=c}}
  const x0=cx(r),y0=cy(r),x1=cx(b),y1=cy(b);if(rnd()<.5){carve(Math.min(x0,x1),y0,Math.max(x0,x1)+cw,y0+cw);carve(x1,Math.min(y0,y1),x1+cw,Math.max(y0,y1)+cw)}else{carve(x0,Math.min(y0,y1),x0+cw,Math.max(y0,y1)+cw);carve(Math.min(x0,x1),y1,Math.max(x0,x1)+cw,y1+cw)}con.push(r)}
 G[(H-1)*W+ex]=0;G[(H-2)*W+ex]=0;return{G,ex,rooms}}
const mkScorp=(x,y)=>({x,y,hp:9,kx:0,ky:0,type:'scorp',ss:'walk',st2:.8+Math.random(),dmg:1});
const mkDustSkel=(x,y)=>({x,y,hp:10,kx:0,ky:0,type:'skel',vr:'dust',tcd:1+Math.random()*2,dmg:1});
const mkBeetle=(x,y)=>({x,y,hp:12,kx:0,ky:0,type:'beetle',bs:'walk',bt:1.5+Math.random(),dmg:1});
function sBuild(f){const K=DKIND.scorpion,W=K.W,H=K.H,rnd=dRng(today()*7919+f*104729+41),Gn=genSand(W,H,rnd,f),G=Gn.G,ex=Gn.ex;
 const R={w:W,h:H,ex,cave:1,tomb:1,sand:1,floor:K.floor,wall:K.wall,trim:K.trim,items:[],solid:new Set(),mobs:[],dun:{kind:'scorpion',f,G,seen:new Uint8Array(W*H),mm:null,label:'Hollow'}};
 let dist=dBfs(G,W,H,ex,H-1).d;const cells=[];for(let i=0;i<W*H;i++)if(!G[i]&&dist[i]>=0)cells.push(i);
 const far=cells.reduce((a,b)=>dist[b]>dist[a]?b:a,cells[0]),fx=far%W,fy=(far/W)|0,cols=[];
 if(f<3)R.items.push({t:'stairs',x:fx,y:fy});
 else{const cx=Math.min(W-10,Math.max(9,fx)),cy=Math.min(H-12,Math.max(9,fy));
  for(let y=cy-8;y<=cy+8;y++)for(let x=cx-9;x<=cx+9;x++)if(x>0&&y>1&&x<W-1&&y<H-1&&((x-cx)/9)**2+((y-cy)/7.4)**2<=1)G[y*W+x]=0;
  {let x=cx,y=cy;while(y<H-2){y++;for(const dx of[0,1])if(x+dx>0&&x+dx<W-1)G[y*W+x+dx]=0;if(dBfs(G,W,H,ex,H-1).d[y*W+x]>=0)break;if(x!==ex&&rnd()<.5)x+=Math.sign(ex-x)}}
  R.dun.boss=[cx,cy];for(let k=0;k<8;k++){const a=k/8*6.283+.2;cols.push(Math.round(cy+Math.sin(a)*5.4)*W+Math.round(cx+Math.cos(a)*6.8))}
  dist=dBfs(G,W,H,ex,H-1).d;cells.length=0;for(let i=0;i<W*H;i++)if(!G[i]&&dist[i]>=0)cells.push(i)}
 const used=new Set([far]),near=(i,r)=>{const x=i%W,y=(i/W)|0;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(used.has((y+dy)*W+x+dx))return true;return false},
  open8=i=>{for(const j of[i-1,i+1,i-W,i+W,i-W-1,i-W+1,i+W-1,i+W+1])if(G[j])return false;return true},
  pick=(minD,test)=>{for(let t=0;t<400;t++){const i=cells[Math.floor(rnd()*cells.length)];if(dist[i]<minD||near(i,1)||(test&&!test(i)))continue;if(R.dun.boss&&Math.hypot(i%W-R.dun.boss[0],((i/W)|0)-R.dun.boss[1])<8)continue;used.add(i);return i}return-1};
 const add=(t,i,o)=>{if(i<0)return;const it=Object.assign({t,x:i%W,y:(i/W)|0},o||{});R.items.push(it);if(it.solid)R.solid.add(i)};
 for(const i of cols)if(!G[i]){used.add(i);add('pillar',i,{solid:1})}
 if(f===3){const[cx,cy]=R.dun.boss;for(let k=0;k<7;k++){const a=rnd()*6.283,r=2+rnd()*5,i=Math.round(cy+Math.sin(a)*r*.8)*W+Math.round(cx+Math.cos(a)*r);if(!G[i]&&!used.has(i)){used.add(i);add('sandpile',i)}}}
 for(let k=0;k<3+f;k++)add('dchest',pick(14,open8),{solid:1,use:'dchest',id:'scorpion'+f+'_'+k});
 if(f!==3)for(const r of Gn.rooms.slice(1))if(r.w>=8&&r.h>=6)for(const[x,y]of[[r.x+2,r.y+2],[r.x+r.w-3,r.y+2],[r.x+2,r.y+r.h-3],[r.x+r.w-3,r.y+r.h-3]]){const i=y*W+x;if(!G[i]&&dist[i]>=0&&!used.has(i)&&open8(i)&&rnd()<.6){used.add(i);add(f===2?'bpillar':'pillar',i,{solid:1})}}
 for(let k=0;k<8;k++)add('urn',pick(4,i=>G[i-W]&&!G[i+W]&&!G[i-1]&&!G[i+1]),{solid:1});
 for(let k=0;k<7;k++)add('ocrystal',pick(4,open8),{solid:1});
 for(let k=0;k<(f===1?7:3);k++)add(rnd()<.5?'minecart':'pickrack',pick(5,open8),{solid:1});
 for(let k=0;k<8;k++)add('sandpile',pick(3));for(let k=0;k<5;k++)add('bones',pick(4));
 for(let k=0;k<11+5*f;k++){const i=pick(11);if(i<0)continue;const x=(i%W)*16+8,y=((i/W)|0)*16+8,r=rnd();
  R.mobs.push(f===1?(r<.55?mkScorp(x,y):r<.85?mkDustSkel(x,y):mkBeetle(x,y)):(r<.4?mkScorp(x,y):r<.7?mkDustSkel(x,y):mkBeetle(x,y)))}
 for(let i=0;i<W*H;i++)if(G[i])R.solid.add(i);return R}
const _bf45=buildFloor;buildFloor=function(kind,f){return kind==='scorpion'?sBuild(f):_bf45(kind,f)};
const _da45=dArrive;dArrive=function(R,from){const D=R.dun;if(D.kind!=='scorpion')return _da45(R,from);const sp=D.bossSpawned;D.bossSpawned=1;_da45(R,from);D.bossSpawned=sp;
 if(D.f===3&&D.boss&&!D.bossSpawned){if(EXTRA_DUNGEON_DAYS.scorpion!==today()){const[bx,by]=D.boss;R.mobs.push({x:bx*16+8,y:by*16+8,hp:55,mhp:55,kx:0,ky:0,type:'matri',big:1,ms:'stalk',mt:1.5,seq:[],bcd:6,dmg:2})}D.bossSpawned=1}};
const _dg45=dGo;dGo=function(kind,f,from){_dg45(kind,f,from);if(kind!=='scorpion')return;const R=SCENE.room,quiet=R.dun.bossDone||EXTRA_DUNGEON_DAYS.scorpion===today();
 say('Scorpion Hollow - '+['','Abandoned Dig','Buried Ruins','Scorpion Nest'][f]+' (floor '+f+' of 3)'+(f===3?(quiet?'. The nest is quiet today.':'. Claws click somewhere in the dark...'):''))};
const _en45=entrances;entrances=function(){const a=_en45();if(DHRUIN)a.push({x:DHRUIN.x,y:DHRUIN.y,id:'scorpion',house:null});return a};
const _es45=enterScene;enterScene=function(id,house,ret){if(id!=='scorpion')return _es45(id,house,ret);const R=dFloor('scorpion',1);_es45(dKey('scorpion',1),null,ret);dArrive(R,null);
 say('You climb down into Scorpion Hollow. Old picks and carts lie where the diggers fled. Three levels deep.')};
// loot: the tomb's table (gems, elixirs, the Bone bow) plus steel from the Matriarch
const _dl45=dLoot;dLoot=function(kind,f,boss){if(kind!=='scorpion')return _dl45(kind,f,boss);const out=_dl45('tomb',f,boss);
 if(boss){const bw=out.findIndex(e=>e[0]==='eq_bow3');if(bw>=0&&Math.random()>.33)out.splice(bw,1);if(!out.some(e=>e[0]==='elixir'))out.push(['elixir',1]);out.push(['sdag',1],['sbar',1])}else if(f===1&&Math.random()<.3)out.push(['iron',3]);return out};
const _ed45=enemyDrop;enemyDrop=function(n){_ed45(n);if(n.type!=='matri')return;const R=SCENE&&SCENE.room;
 if(R&&R.dun){R.dun.bossDone=1;R.items.push({t:'dchest',x:Math.floor(n.bx!=null?n.bx/16:n.x/16),y:Math.floor(n.by!=null?n.by/16:n.y/16),use:'dchest',id:'scorpionboss',boss:1})}
 for(const o of en)if(o.summon&&!o.dead)o.dead=1;
 if(EXTRA_DUNGEON_DAYS.scorpion!==today()){markDungeonCleared('scorpion');GLD+=300;inv.sbar=(inv.sbar|0)+3;addXp(0,600);addXp(10,400);
  say('The Sandclaw Matriarch falls! +300 gold, 3 steel bars. A golden chest appears!');msgT=5}else say('The Sandclaw Matriarch falls!');
 sfx('quest');sqEvent('dungeonboss','scorpion');saveNow()};
// --- monster behaviour ---
const HIDE45=200;// burrowed things are parked out of reach (and out of sight) while a sand mound moves underground
function hideAt(n){n.x=P.x+HIDE45;n.y=P.y}
function inArc(n,ax,ay,r,dirx,diry,cosw){const dx=P.x-ax,dy=P.y-ay,d=Math.hypot(dx,dy);if(d>r)return false;if(d<6)return true;return(dx*dirx+dy*diry)/d>=cosw}
let EMERGE45=[];// emergence/strike flashes for drawing
const _u45=upd;upd=function(dt){const paused=menuOpen||pnOpen||dead;const pos=paused?null:en.map(n=>[n,n.x,n.y]),hp0=P.hp;_u45(dt);if(paused)return;const hit=P.hp<hp0;
 for(const e of EMERGE45)e.t+=dt;EMERGE45=EMERGE45.filter(e=>e.t<.5);
 for(const[n,ox,oy]of pos){if(n.dead)continue;
  if(n.type==='scorp')scorpAI(n,ox,oy,dt);
  else if(n.type==='beetle')beetleAI(n,ox,oy,dt);
  else if(n.type==='skel'&&n.vr==='dust'){if(n.frozen>0)continue;const dx=P.x-n.x,dy=P.y-n.y,d=Math.hypot(dx,dy)||1;if(d<46){n.x=ox;n.y=oy;stepTo(n,-dx/d*30*dt,-dy/d*30*dt)}}
  else if(n.type==='matri')matriAI(n,ox,oy,dt,hit)}};
function scorpAI(n,ox,oy,dt){if(n.frozen>0){n.x=ox;n.y=oy;return}const dx=P.x-n.x,dy=P.y-n.y,d=Math.hypot(dx,dy)||1;n.x=ox+n.kx*.5;n.y=oy+n.ky*.5;
 if(n.ss==='walk'){if(d>24&&d<160)stepTo(n,dx/d*30*dt,dy/d*30*dt);if((n.st2-=dt)<=0&&d<34){n.ss='wind';n.st2=.55;n.ax=dx/d;n.ay=dy/d}}
 else if(n.ss==='wind'){if((n.st2-=dt)<=0){n.ss='strike';n.st2=.16;EMERGE45.push({x:n.x+n.ax*20,y:n.y+n.ay*20-4,t:0,c:'#ffd070',r:10});if(inArc(n,n.x,n.y,32,n.ax,n.ay,.55))hurtP(2,'The scorpion\'s tail stings!');sfx('swish')}}
 else if(n.ss==='strike'){if((n.st2-=dt)<=0){n.ss='rest';n.st2=.8}}
 else if(n.ss==='rest'){if((n.st2-=dt)<=0){n.ss='walk';n.st2=.6+Math.random()*.8}}}
function beetleAI(n,ox,oy,dt){if(n.frozen>0&&!n.under){n.x=ox;n.y=oy;return}const tx=n.under?n.mx:ox,ty=n.under?n.my:oy,dx=P.x-tx,dy=P.y-ty,d=Math.hypot(dx,dy)||1;
 if(n.bs==='walk'){n.x=ox+n.kx*.4;n.y=oy+n.ky*.4;if(d>14&&d<150)stepTo(n,dx/d*20*dt,dy/d*20*dt);if((n.bt-=dt)<=0&&d<120){n.bs='dig';n.bt=.35;sfx('dig')}}
 else if(n.bs==='dig'){n.x=ox;n.y=oy;if(Math.random()<.5)part(n.x+(Math.random()-.5)*12,n.y+4,(Math.random()-.5)*50,-40,.4,'#d8b880',200,1);if((n.bt-=dt)<=0){n.bs='under';n.bt=1;n.under=1;n.mx=ox;n.my=oy;hideAt(n)}}
 else if(n.bs==='under'){const m={x:n.mx,y:n.my};stepTo(m,dx/d*Math.min(d,75*dt),dy/d*Math.min(d,75*dt));n.mx=m.x;n.my=m.y;hideAt(n);if((n.bt-=dt)<=0){n.bs='tele';n.bt=.35}}
 else if(n.bs==='tele'){hideAt(n);if((n.bt-=dt)<=0){n.bs='rest';n.bt=1.1;n.under=0;n.x=n.mx;n.y=n.my;n.kx=n.ky=0;EMERGE45.push({x:n.x,y:n.y,t:0,c:'#e8c890',r:16});for(let k=0;k<10;k++)part(n.x,n.y,(Math.random()-.5)*90,-40-Math.random()*50,.5,'#d8b880',220,1);sfx('dig');
   if(Math.hypot(P.x-n.x,P.y-n.y)<16)hurtP(2,'A beetle bursts from the sand!')}}
 else if(n.bs==='rest'){n.x=ox+n.kx*.4;n.y=oy+n.ky*.4;if((n.bt-=dt)<=0){n.bs='walk';n.bt=1.6+Math.random()*1.2}}}
SFX.dig=()=>{noise(.18,.08,500)};
function matriAI(n,ox,oy,dt,hit){const fr=n.hp/n.mhp,ph=fr<.3?3:fr<.65?2:1;
 if(ph>(n.ph||1)){n.ph=ph;say(ph===2?'The Matriarch shrieks and digs into the sand!':'The Matriarch goes into a frenzy!');msgT=3;sfx('roar');if(!n.under){n.ms='rest';n.mt=.5;n.seq=[]}}
 if(n.frozen>0&&!n.under){n.x=ox;n.y=oy;return}
 const bx=n.under?n.mx:ox,by=n.under?n.my:oy,dx=P.x-bx,dy=P.y-by,d=Math.hypot(dx,dy)||1;n.bx=bx;n.by=by;
 if(!n.under){n.x=ox+n.kx*.25;n.y=oy+n.ky*.25}
 const atkT={clawL:ph===3?.32:.45,clawR:ph===3?.28:.42,tail:ph===1?.75:ph===2?.6:.45,sweep:.6};
 if(n.ms==='stalk'){const sp=ph===3?46:ph===2?40:34;if(d>30)stepTo(n,dx/d*sp*dt,dy/d*sp*dt);
  if(ph>=2&&(n.bcd-=dt)<=0&&d<130){n.ms='dig';n.mt=.55;n.bcd=ph===2?9:15;sfx('dig');return}
  if((n.mt-=dt)<=0&&d<46){n.seq=ph===1?['clawL','clawR','tail']:ph===2?['sweep','tail']:['clawL','clawR','tail'];n.ms='wind';n.atk=n.seq.shift();n.mt=atkT[n.atk];n.ax=dx/d;n.ay=dy/d;sfx('growl')}}
 else if(n.ms==='wind'){n.ax=n.ax*.85+dx/d*.15;n.ay=n.ay*.85+dy/d*.15;const l=Math.hypot(n.ax,n.ay)||1;n.ax/=l;n.ay/=l;
  if((n.mt-=dt)<=0){const a=n.atk;let ok=false;
   if(a==='clawL'||a==='clawR'){const s=a==='clawL'?-1:1,cx=n.x+n.ax*20-n.ay*10*s,cy=n.y-4+n.ay*20+n.ax*10*s;ok=Math.hypot(P.x-cx,P.y-cy)<17;EMERGE45.push({x:cx,y:cy,t:0,c:'#ffe090',r:12});if(ok)hurtP(3,'The Matriarch\'s claw snaps shut on you!')}
   else if(a==='tail'){const cx=n.x+n.ax*34,cy=n.y-6+n.ay*34;ok=Math.hypot(P.x-cx,P.y-cy)<17||inArc(n,n.x,n.y,40,n.ax,n.ay,.85);EMERGE45.push({x:cx,y:cy,t:0,c:'#ff8040',r:14});if(ok)hurtP(3,'The Matriarch\'s tail strikes!')}
   else{ok=inArc(n,n.x,n.y,50,n.ax,n.ay,-.1);EMERGE45.push({x:n.x+n.ax*24,y:n.y+n.ay*24,t:0,c:'#ffe090',r:26});if(ok)hurtP(3,'A wide claw sweep knocks you back!')}
   sfx('swish');n.ms='hit';n.mt=.18}}
 else if(n.ms==='hit'){if((n.mt-=dt)<=0){if(n.seq.length){n.atk=n.seq.shift();n.ms='wind';n.mt=atkT[n.atk]*(ph===3?.8:1)}else{n.ms='rest';n.mt=ph===3?1.7:ph===2?1.1:1.2}}}
 else if(n.ms==='rest'){if((n.mt-=dt)<=0){n.ms='stalk';n.mt=ph===3?.6:1.1}}
 else if(n.ms==='dig'){if(Math.random()<.7)part(n.x+(Math.random()-.5)*30,n.y+6,(Math.random()-.5)*80,-50,.5,'#d8b880',220,1);if((n.mt-=dt)<=0){n.ms='under';n.mt=ph===3?.9:1.3;n.under=1;n.mx=n.x;n.my=n.y;hideAt(n)}}
 else if(n.ms==='under'){const m={x:n.mx,y:n.my};stepTo(m,dx/d*Math.min(d,90*dt),dy/d*Math.min(d,90*dt));n.mx=m.x;n.my=m.y;hideAt(n);if((n.mt-=dt)<=0){n.ms='mark';n.mt=.65}}
 else if(n.ms==='mark'){hideAt(n);if((n.mt-=dt)<=0){n.under=0;n.x=n.mx;n.y=n.my;n.kx=n.ky=0;EMERGE45.push({x:n.x,y:n.y,t:0,c:'#ffd070',r:30});for(let k=0;k<22;k++)part(n.x,n.y,(Math.random()-.5)*150,-50-Math.random()*70,.6,'#d8b880',220,1.5);sfx('roar');
   if(Math.hypot(P.x-n.x,P.y-n.y)<26)hurtP(3,'The Matriarch erupts beneath you!');
   const alive=en.filter(o=>o.summon&&!o.dead).length;let made=0;for(let k=alive;k<2;k++){const a=Math.random()*6.28,x=n.x+Math.cos(a)*30,y=n.y+Math.sin(a)*24;if(!solid(x,y)){const s=mkScorp(x,y);s.summon=1;s.ss='rest';s.st2=.6;en.push(s);made++}}
   if(made)say('Sand scorpions pour out of the hole!');n.ms='rest';n.mt=ph===3?1.2:1}}
 if(!n.under){const dmg=2;if(hit&&d<18){PEND43+=dmg-1}else if(d<20)hurtP(dmg,'The Matriarch\'s bulk crushes you!')}}
// --- drawing ---
function hdScorpSp(fr,hit,raised,gold){const W2=gold?84:48,H2=gold?64:36,b=hdBuf(W2,H2),k=gold?1.75:1,OX=W2/2,OY=H2-4,
  pal=hit?hdP(['#c8b8a8','#e0d4c8','#f4ece4','#ffffff']):gold?hdP(['#6a4810','#a87420','#d8a030','#f0c858','#fff0a8']):hdP(['#5a3a1a','#8a5a28','#b8803c','#d8a860']),
  put=(x,y,c)=>{const X=Math.round(OX+x*k),Y=Math.round(OY+y*k);for(let a=0;a<Math.ceil(k);a++)for(let bb=0;bb<Math.ceil(k);bb++){const xx=X+a,yy=Y+bb;if(xx>=0&&yy>=0&&xx<W2&&yy<H2)hdSet(b,xx,yy,c,1)}},
  ell=(cx,cy,rx,ry,sh)=>{for(let y=-ry;y<=ry;y+=1/k)for(let x=-rx;x<=rx;x+=1/k){const d=(x/rx)**2+(y/ry)**2;if(d>1)continue;const v=.75-(y/ry)*.3-(x/rx)*.05-d*.2+sh;put(cx+x,cy+y,pal[Math.max(0,Math.min(pal.length-1,Math.round(v*(pal.length-1))))])}};
 const lg=fr?1:-1;for(const s of[-1,1])for(let j=0;j<3;j++){const x0=-6+j*5,y0=-3;for(let t=0;t<5;t++)put(x0+s*0+(t*(j-1))*.3+lg*(j%2?1:-1)*.5,y0+t*.8,pal[0])}
 ell(0,-6,9,5,0);for(let x=-7;x<=7;x+=3)put(x,-10,pal[0]);
 for(const s of[-1,1]){ell(10,-6+s*5,3,2,.05);ell(14,-6+s*7,3.5,2.6,.1);put(16,-6+s*6,pal[0]);put(17,-6+s*8,pal[0])}
 const tl=raised?[[-10,-8],[-13,-12],[-14,-17],[-12,-21],[-8,-23]]:[[-10,-7],[-14,-8],[-17,-10],[-18,-13],[-16,-16]];for(const[x,y]of tl)ell(x,y,2.4,2.2,.1);
 const st=tl[tl.length-1];put(st[0]+2,st[1]+1,hdC(raised?'#ff5030':'#2a1808'));put(st[0]+3,st[1]+2,hdC(raised?'#ffb060':'#2a1808'));
 put(7,-8,hdC('#180c04'));put(7,-5,hdC('#180c04'));hdOutline(b,{1:hdC(gold?'#3a2408':'#2a1808')});return hdCan(b)}
function drawScorp(n,tm){const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,fr=Math.floor(tm*8+n.x)%2,raised=n.ss==='wind'||n.ss==='strike',f=P.x<n.x;shd(x,y+5,18);
 if(n.ss==='wind'){g.fillStyle='rgba(255,90,40,'+(.25+.25*Math.sin(tm*30))+')';g.beginPath();g.arc(x,y-8,12,0,6.283);g.fill()}
 const c=hdEn('sc'+fr+hit+raised,()=>hdScorpSp(fr,hit,raised,false)),w=c.width/2,hh=c.height/2;hdDraw(c,x-w/2,y+6-hh,f)}
function drawMatri(n,tm){if(n.under)return;const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,fr=Math.floor(tm*6+n.x)%2,raised=n.ms==='wind'&&n.atk==='tail'||n.ms==='hit'&&n.atk==='tail',f=P.x<n.x;
 g.fillStyle='rgba(255,200,90,'+(.1+.06*Math.sin(tm*3))+')';g.beginPath();g.ellipse(x,y-4,38,22,0,0,6.283);g.fill();shd(x,y+5,40);
 if(n.ms==='wind'){const a=n.atk,p=.22+.18*Math.sin(tm*28);g.fillStyle='rgba(255,60,30,'+p+')';g.strokeStyle='rgba(255,70,40,'+(.65+.3*Math.sin(tm*28))+')';g.lineWidth=1.5;g.setLineDash([3,2]);
  if(a==='sweep'){g.beginPath();g.moveTo(x,y);g.arc(x,y,50,Math.atan2(n.ay,n.ax)-1.65,Math.atan2(n.ay,n.ax)+1.65);g.closePath();g.fill();g.stroke()}
  else{const s=a==='clawL'?-1:a==='clawR'?1:0,r=a==='tail'?34:20,cx=x+n.ax*r-n.ay*10*s,cy=y-4+n.ay*r+n.ax*10*s;g.beginPath();g.arc(cx,cy,a==='tail'?16:15,0,6.283);g.fill();g.stroke()}g.setLineDash([])}
 const c=hdEn('ma'+fr+hit+raised,()=>hdScorpSp(fr,hit,raised,true)),w=c.width/2,hh=c.height/2;hdDraw(c,x-w/2,y+6-hh,f);
 if(n.ms==='wind'){g.fillStyle='#ff5040';g.font='700 10px "Pixelify Sans",monospace';g.textAlign='center';g.fillText('!',x,y-38)}
 const bw=46,fr2=Math.max(0,n.hp)/n.mhp;Rg(x-bw/2-1,y-44,bw+2,5,O);Rg(x-bw/2,y-43,bw,3,'#3a3020');Rg(x-bw/2,y-43,bw*fr2,3,(n.ph||1)===3?'#ff6030':(n.ph||1)===2?'#ffa040':'#f8d848');Rg(x-bw/2+bw*.65,y-43,.6,3,O);Rg(x-bw/2+bw*.3,y-43,.6,3,O)}
let HDBT=null;
function hdBeetleSp(fr,hit){const b=hdBuf(34,26),pal=hit?hdP(['#c0b8c8','#d8d0e0','#f0ecf4','#ffffff']):hdP(['#1a2a28','#2a4a40','#3a6a58','#5a9a80','#a8e0c8']),p=hdPainter(b,17,22,true);
 const lg=fr?1:-1;for(const s of[-1,1])for(let j=0;j<3;j++){p.box(-8+j*6+lg*(j%2?1:-1),-3,-7+j*6+lg*(j%2?1:-1),2,hdP(['#101814','#1a2a28','#2a4a40']),0)}
 p.ell(0,-8,10,7,pal,.05);p.ell(9,-8,4,3.5,pal,.1);for(let y=-14;y<=-2;y++)p.put(0,y,pal[0]);p.put(-4,-12,pal[4]);p.put(-3,-12,pal[4]);p.put(-4,-11,pal[3]);
 p.put(12,-10,hdC('#f8d040'));p.put(12,-7,hdC('#f8d040'));p.box(13,-12,15,-11,pal,0);p.box(13,-5,15,-4,pal,0);hdOutline(b,{1:hdC('#0a100e')});return hdCan(b)}
function drawBeetle(n,tm){if(n.under)return;const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,fr=Math.floor(tm*8+n.x)%2,f=P.x<n.x;shd(x,y+5,16);
 const sink=n.bs==='dig'?(1-n.bt/.35)*6:0,c=hdEn('bt'+fr+hit,()=>hdBeetleSp(fr,hit)),w=c.width/2,hh=c.height/2;
 g.save();g.beginPath();g.rect(x-w,y-hh-4,w*2,hh+10-sink);g.clip();hdDraw(c,x-w/2,y+6-hh+sink,f);g.restore()}
const _pS45=pS;pS=function(n,tm){if(n.type==='scorp')return drawScorp(n,tm);if(n.type==='beetle')return drawBeetle(n,tm);if(n.type==='matri')return drawMatri(n,tm);
 _pS45(n,tm);if(n.type==='skel'&&n.vr==='dust'){const x=Math.round(n.x),y=Math.round(n.y),f=P.x<n.x?-1:1;Rg(x-5,y-25,10,3,'#8a6030');Rg(x-5,y-25,10,1,'#b88850');Rg(x-6,y-23,2,5,'#8a6030');Rg(x+4,y-23,2,5,'#8a6030');Rg(x-5,y-14,10,2,'#a07040');Rg(x-f*6-1,y-13,3,5,'#a07040')}};
// moving sand mounds (burrowed beetles and the Matriarch), strike flashes
const _dr45=drawRoom;drawRoom=function(tm){_dr45(tm);if(!SCENE||!SCENE.room.dun)return;
 for(const n of en){if(n.dead||!n.under)continue;const big=n.type==='matri',x=n.mx,y=n.my,r=big?14:8,sh=(n.ms==='mark'||n.bs==='tele')?Math.sin(tm*50)*1.5:0;
  if(n.ms==='mark'){g.strokeStyle='rgba(255,120,60,'+(.5+.4*Math.sin(tm*20))+')';g.lineWidth=2;g.beginPath();g.ellipse(x,y+2,28,16,0,0,6.283);g.stroke()}
  g.fillStyle='#8a6a3a';g.beginPath();g.ellipse(x+sh,y+3,r+2,r*.55+1,0,0,6.283);g.fill();g.fillStyle='#d8b880';g.beginPath();g.ellipse(x+sh,y+2,r,r*.5,0,0,6.283);g.fill();g.fillStyle='#f0d8a8';g.fillRect(x-r*.4+sh,y,r*.6,1.5);
  if(Math.random()<.3)part(x+(Math.random()-.5)*r*2,y+2,(Math.random()-.5)*20,-25,.35,'#d8b880',160,1)}
 for(const e of EMERGE45){const k=e.t/.5;g.strokeStyle='rgba(255,240,200,'+(1-k)+')';g.lineWidth=2;g.beginPath();g.arc(e.x,e.y,e.r*(.5+k*.8),0,6.283);g.stroke()}};
// decor: broken pillars, orange crystals, mine carts, pick racks, sand piles
const _df45=drawFurn;drawFurn=function(it,tm){const x0=it.x*16,y0=it.y*16;
 if(it.t==='bpillar'){shd(x0+8,y0+15,16);Rg(x0+2,y0-6,12,21,O);Rg(x0+3,y0-5,10,19,'#c8a070');Rg(x0+4,y0-5,3,19,'#e0c090');Rg(x0+10,y0-5,2,19,'#a07848');Rg(x0+3,y0-7,4,3,O);Rg(x0+8,y0-9,5,5,O);Rg(x0+9,y0-8,3,3,'#c8a070');Rg(x0+6,y0+2,1,6,'#7a5a30');Rg(x0-2,y0+12,5,3,'#c8a070');return}
 if(it.t==='ocrystal'){const p=.6+.4*Math.sin(tm*2+x0);g.fillStyle='rgba(255,150,60,'+(.2*p)+')';g.beginPath();g.arc(x0+8,y0+4,14,0,6.283);g.fill();Rg(x0+4,y0-4,8,18,O);Rg(x0+5,y0-3,6,16,'#f08830');Rg(x0+6,y0-2,2,12,'#ffd090');Rg(x0+2,y0+6,4,8,O);Rg(x0+3,y0+7,2,6,'#c86018');return}
 if(it.t==='minecart'){shd(x0+8,y0+15,18);Rg(x0,y0+1,16,11,O);Rg(x0+1,y0+2,14,8,'#6a6a78');Rg(x0+1,y0+2,14,2,'#8a8a98');Rg(x0+2,y0-1,12,4,'#9a9aa8');for(const k of[2,6,9])Rg(x0+k,y0-2,3,2,'#808090');Rg(x0+2,y0+11,4,4,O);Rg(x0+10,y0+11,4,4,O);Rg(x0+3,y0+12,2,2,'#5a5a66');Rg(x0+11,y0+12,2,2,'#5a5a66');return}
 if(it.t==='pickrack'){shd(x0+8,y0+15,14);Rg(x0+1,y0-8,14,23,O);Rg(x0+2,y0-7,12,21,'#8a6038');Rg(x0+2,y0-1,12,2,'#5a3a1a');for(const k of[3,8]){Rg(x0+k+1,y0-6,1,12,'#7a4a20');Rg(x0+k-1,y0-6,5,2,'#a0a8b8')}return}
 if(it.t==='sandpile'){g.fillStyle='rgba(60,40,10,.25)';g.beginPath();g.ellipse(x0+8,y0+13,10,3.5,0,0,6.283);g.fill();for(const[r,cy,c]of[[9,11,'#a8803c'],[7.5,9.5,'#c8a058'],[5.5,8,'#dcb470'],[3.5,6.5,'#ecc888'],[1.8,5.5,'#f8dca0']]){g.fillStyle=c;g.beginPath();g.ellipse(x0+8-(9-r)*.15,y0+cy,r,r*.55,0,0,6.283);g.fill()}
  g.fillStyle='#8a6428';for(const[a,b]of[[3,11],[12,10],[6,12],[10,7]])g.fillRect(x0+a,y0+b,1,1);return}
 _df45(it,tm)};
const _sn45=snap;snap=function(){const s=_sn45();s.xdun={...EXTRA_DUNGEON_DAYS};return s};
const _ap45=applySave;applySave=function(S){_ap45(S);EMERGE45=[];for(const k in EXTRA_DUNGEON_DAYS)EXTRA_DUNGEON_DAYS[k]=S.xdun&&isFinite(S.xdun[k])?+S.xdun[k]:-1};
const _ng45=newGame;newGame=function(){for(const k in EXTRA_DUNGEON_DAYS)EXTRA_DUNGEON_DAYS[k]=-1;_ng45()};
