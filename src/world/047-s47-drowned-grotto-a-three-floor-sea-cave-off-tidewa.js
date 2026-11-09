// ---------------------------------------------------------------- 47. Drowned Grotto: a three-floor sea cave off Tidewatch, reached by boat
// The entrance is a rocky islet in the water near the spec's (7,61) (which is beach): sail up to the cave mouth and face
// it. Inside you leave the boat at the mouth; walking out of floor 1 puts you back in it. Floor 1 Tidal Entrance (wide,
// shallow pools), floor 2 Sunken Chambers (ruined stone rooms joined by narrow plank bridges), floor 3 Tidekeeper's Shrine
// (a round chamber ringed by glowing water). Monsters: tide slimes (chase, squash down, then dash), reef crawlers
// (scuttle sideways, raise claws, lunge), drowned guardians (slow, fire short water bolts). The Tidekeeper (48 HP):
// phase 1 single water bolts, trident thrusts and slow circling; below 60% a three-bolt fan, two tide slimes at most,
// and a telegraphed charge followed by a pause. Daily reward: 250 gold, 5 cooked salmon, 500 Magic XP, 400 Fishing XP.
EXTRA_DUNGEONS.tidekeeper={name:'Drowned Grotto',floors:3,boss:'tidekeeper',hp:48,generator:'cave'};
EXTRA_DUNGEON_DAYS.tidekeeper=-1;
DKIND.tidekeeper={name:'Drowned Grotto',floor:['#4e6e7c','#466674'],wall:'#24406a',trim:'#0e1e34',W:58,H:44,label:'Grotto'};
var GRDEN=null;let GROTTO_BOAT=false;
// the islet: rock all round, cave mouth facing south onto open water, nearest the spec's spot
{const okW=(x,y)=>{for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const xx=x+dx,yy=y+dy;if(xx<3||yy<3||xx>N-4||yy>N-4)return false;const i=yy*N+xx;if(tile[i]!==0||PROT.has(i)||BS.has(i)||BRIDGE.has(i))return false}
  for(let yy=y+4;yy<=y+5;yy++)for(let xx=x-1;xx<=x+1;xx++)if(tile[yy*N+xx]!==0)return false;return true};
 let best=null,bd=1e9;for(let y=4;y<N-6;y++)for(let x=4;x<N-4;x++){const d=Math.hypot(x-7*HSC,y-61*HSC);if(d<bd&&d<30*HSC&&okW(x,y)){bd=d;best=[x,y]}}
 if(best){const[x,y]=best;GRDEN={x,y};for(let dy=-1;dy<=0;dy++)for(let dx=-1;dx<=1;dx++){const i=(y+dy)*N+x+dx;tile[i]=3;obj[i]=null;PROT.add(i)}
  for(const[dx,dy]of[[-2,0],[2,0],[0,-2]]){const i=(y+dy)*N+x+dx;tile[i]=3;PROT.add(i)}}}
function drawGrottoMouth(tm){if(!GRDEN)return;const x0=GRDEN.x*16,y0=GRDEN.y*16;
 e54DrawCave('sea',x0,y0);const p=.5+.5*Math.sin(tm*2.2);g.fillStyle='rgba(72,232,168,'+(.12+.16*p)+')';g.beginPath();g.ellipse(x0+8,y0+13,6.5,3.2,0,0,6.283);g.fill();
 for(let k=0;k<3;k++){const ph=(tm*.6+k*.33)%1;g.fillStyle='rgba(184,255,224,'+(.55*Math.sin(ph*Math.PI)).toFixed(3)+')';g.fillRect(x0+3+k*3.5+ph*2,y0+11+k%2*2.5,2.5,.5)}for(let k=0;k<6;k++){const fx=x0-6+k*5,fy=y0+15.5+Math.sin(tm*3+k)*.8;Rg(fx,fy,4,1,'rgba(240,250,255,.85)')}}
const _lh47=LHOOK;LHOOK=(L,x0,y0,x1,y1,tm)=>{_lh47(L,x0,y0,x1,y1,tm);if(GRDEN&&GRDEN.x>=x0-3&&GRDEN.x<=x1+3&&GRDEN.y>=y0-3&&GRDEN.y<=y1+4)L.push([(GRDEN.y+1)*16-6,4,()=>drawGrottoMouth(tm)])};
const _en47=entrances;entrances=function(){const a=_en47();if(GRDEN)a.push({x:GRDEN.x,y:GRDEN.y,id:'tidekeeper',house:null});return a};
// --- floors ---
function gBuild(f){const K=DKIND.tidekeeper,W=K.W,H=K.H,rnd=dRng(today()*7919+f*104729+53);let Gn,corr=new Set();
 if(f===2){Gn=genSand(W,H,rnd,2);const inRoom=i=>Gn.rooms.some(r=>{const x=i%W,y=(i/W)|0;return x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h});for(let i=0;i<W*H;i++)if(!Gn.G[i]&&!inRoom(i))corr.add(i)}
 else Gn=genIce(W,H,rnd,f===1?.4:.44,.28);
 const G=Gn.G,ex=Gn.ex;
 const R={w:W,h:H,ex,cave:1,tomb:0,sea:1,floor:K.floor,wall:K.wall,trim:K.trim,items:[],solid:new Set(),mobs:[],dun:{kind:'tidekeeper',f,G,seen:new Uint8Array(W*H),mm:null,label:'Grotto'}};
 let dist=dBfs(G,W,H,ex,H-1).d;const cells=[];for(let i=0;i<W*H;i++)if(!G[i]&&dist[i]>=0)cells.push(i);
 const far=cells.reduce((a,b)=>dist[b]>dist[a]?b:a,cells[0]),fx=far%W,fy=(far/W)|0,ring=[],cols=[];
 if(f<3)R.items.push({t:'stairs',x:fx,y:fy});
 else{const cx=Math.min(W-10,Math.max(9,fx)),cy=Math.min(H-12,Math.max(9,fy));
  for(let y=cy-8;y<=cy+8;y++)for(let x=cx-9;x<=cx+9;x++)if(x>0&&y>1&&x<W-1&&y<H-1&&((x-cx)/9)**2+((y-cy)/7.4)**2<=1)G[y*W+x]=0;
  {let x=cx,y=cy;while(y<H-2){y++;for(const dx of[0,1])if(x+dx>0&&x+dx<W-1)G[y*W+x+dx]=0;if(dBfs(G,W,H,ex,H-1).d[y*W+x]>=0)break;if(x!==ex&&rnd()<.5)x+=Math.sign(ex-x)}}
  R.dun.boss=[cx,cy];for(let y=cy-8;y<=cy+8;y++)for(let x=cx-9;x<=cx+9;x++){const e=((x-cx)/9)**2+((y-cy)/7.4)**2;if(e>.72&&e<=1&&!G[y*W+x])ring.push(y*W+x)}
  for(let k=0;k<6;k++){const a=k/6*6.283+.5;cols.push(Math.round(cy+Math.sin(a)*4.2)*W+Math.round(cx+Math.cos(a)*5.4))}
  dist=dBfs(G,W,H,ex,H-1).d;cells.length=0;for(let i=0;i<W*H;i++)if(!G[i]&&dist[i]>=0)cells.push(i)}
 const used=new Set([far]),near=(i,r)=>{const x=i%W,y=(i/W)|0;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(used.has((y+dy)*W+x+dx))return true;return false},
  open8=i=>{for(const j of[i-1,i+1,i-W,i+W,i-W-1,i-W+1,i+W-1,i+W+1])if(G[j])return false;return true},
  pick=(minD,test)=>{for(let t=0;t<400;t++){const i=cells[Math.floor(rnd()*cells.length)];if(dist[i]<minD||near(i,1)||(test&&!test(i)))continue;if(R.dun.boss&&Math.hypot(i%W-R.dun.boss[0],((i/W)|0)-R.dun.boss[1])<8)continue;used.add(i);return i}return-1};
 const add=(t,i,o)=>{if(i<0)return;const it=Object.assign({t,x:i%W,y:(i/W)|0},o||{});R.items.push(it);if(it.solid)R.solid.add(i)};
 for(const i of ring){used.add(i);add('gwater',i)}
 for(const i of cols)if(!G[i]){used.add(i);add('pillar',i,{solid:1})}
 for(const i of corr)if(!used.has(i)&&dist[i]>=0){add('plank',i)}
 for(let k=0;k<3+f;k++)add('dchest',pick(14,open8),{solid:1,use:'dchest',id:'tidekeeper'+f+'_'+k});
 for(let k=0;k<(f===1?9:5);k++)add('gpool',pick(4,open8));
 for(let k=0;k<9;k++)add('algae',pick(3));
 for(let k=0;k<6;k++)add('coral',pick(4,open8),{solid:1});
 for(let k=0;k<4;k++)add('timber',pick(5,open8),{solid:1});
 if(f===2)for(const r of Gn.rooms.slice(1))if(r.w>=7&&r.h>=5&&rnd()<.6)for(const[x,y]of[[r.x+1,r.y+1],[r.x+r.w-2,r.y+1]]){const i=y*W+x;if(!G[i]&&!used.has(i)&&open8(i)){used.add(i);add('bpillar',i,{solid:1})}}
 for(let k=0;k<10+4*f;k++){const i=pick(11);if(i<0)continue;const x=(i%W)*16+8,y=((i/W)|0)*16+8,r=rnd();
  R.mobs.push(f===1?(r<.55?mkTideSlime(x,y):r<.9?mkCrawler(x,y):mkGuardian(x,y)):(r<.35?mkTideSlime(x,y):r<.7?mkCrawler(x,y):mkGuardian(x,y)))}
 for(let i=0;i<W*H;i++)if(G[i])R.solid.add(i);return R}
const mkTideSlime=(x,y)=>({x,y,hp:8,kx:0,ky:0,type:'slime',vr:'tide',ds:'chase',dt2:1.5+Math.random()*2,dmg:1});
const mkCrawler=(x,y)=>({x,y,hp:10,kx:0,ky:0,type:'crab',cs:'side',ct:1+Math.random(),cdir:Math.random()<.5?-1:1,dmg:1});
const mkGuardian=(x,y)=>({x,y,hp:14,kx:0,ky:0,type:'guard',gcd:1.5+Math.random(),dmg:1});
const _bf47=buildFloor;buildFloor=function(kind,f){return kind==='tidekeeper'?gBuild(f):_bf47(kind,f)};
const _da47=dArrive;dArrive=function(R,from){const D=R.dun;if(D.kind!=='tidekeeper')return _da47(R,from);const sp=D.bossSpawned;D.bossSpawned=1;_da47(R,from);D.bossSpawned=sp;
 if(D.f===3&&D.boss&&!D.bossSpawned){if(EXTRA_DUNGEON_DAYS.tidekeeper!==today()){const[bx,by]=D.boss;R.mobs.push({x:bx*16+8,y:by*16+8,hp:48,mhp:48,kx:0,ky:0,type:'tidek',big:1,ks:'move',kt:1.5,ang:Math.random()*6.28,bcd:2,scd:4,dmg:2})}D.bossSpawned=1}};
const _dg47=dGo;dGo=function(kind,f,from){_dg47(kind,f,from);if(kind!=='tidekeeper')return;const R=SCENE.room,quiet=R.dun.bossDone||EXTRA_DUNGEON_DAYS.tidekeeper===today();
 say('Drowned Grotto - '+['','Tidal Entrance','Sunken Chambers','Tidekeeper\'s Shrine'][f]+' (floor '+f+' of 3)'+(f===3?(quiet?'. The shrine is still today.':'. The water glows... something stirs.'):''))};
// entering from the boat: the boat waits at the mouth; leaving floor 1 puts you back in it
const _es47=enterScene;enterScene=function(id,house,ret){if(id!=='tidekeeper')return _es47(id,house,ret);
 if(!SAILING&&!TL.boat){say('The cave mouth opens onto deep water. You need a boat.');return}
 if(SAILING){SAILING=false;GROTTO_BOAT=true}const R=dFloor('tidekeeper',1);_es47(dKey('tidekeeper',1),null,ret);dArrive(R,null);
 say('You tie up the boat and wade into the Drowned Grotto. Green light ripples on the walls.')};
const _ls47=leaveScene;leaveScene=function(){_ls47();if(!SCENE&&GROTTO_BOAT){GROTTO_BOAT=false;if(TL.boat&&boatOK(P.x,P.y)){SAILING=true;say('You climb back into your boat.')}}};
const _rs47=reset;reset=function(){GROTTO_BOAT=false;_rs47()};
const _sn47=snap;snap=function(){const s=_sn47();if(GROTTO_BOAT&&SCENE&&TL.boat)s.sail=1;s.xdun={...EXTRA_DUNGEON_DAYS};return s};
const _ap47=applySave;applySave=function(S){GROTTO_BOAT=false;_ap47(S);for(const k in EXTRA_DUNGEON_DAYS)EXTRA_DUNGEON_DAYS[k]=S.xdun&&isFinite(S.xdun[k])?+S.xdun[k]:-1};
const _ng47=newGame;newGame=function(){GROTTO_BOAT=false;for(const k in EXTRA_DUNGEON_DAYS)EXTRA_DUNGEON_DAYS[k]=-1;_ng47()};
// loot: the caverns' table (gems, elixir, the Crystal blade, rarely) plus a piece of magic gear you don't own yet
const MAGEQ=['eq_wfire','eq_wice','eq_wstorm','eq_mhelm','eq_mbody','eq_mlegs'];
const _dl47=dLoot;dLoot=function(kind,f,boss){if(kind!=='tidekeeper')return _dl47(kind,f,boss);const out=_dl47('cave',f,boss);
 if(boss){const sw=out.findIndex(e=>e[0]==='eq_sword5');if(sw>=0&&Math.random()>.33)out.splice(sw,1);if(!out.some(e=>e[0]==='elixir'))out.push(['elixir',1]);
  const m=MAGEQ.filter(k=>EQ[k]&&!owns(k));if(m.length)out.push([m[Math.floor(Math.random()*m.length)],1])}else if(f===1&&Math.random()<.3)out.push(['cshrimp',3]);return out};
const _ed47=enemyDrop;enemyDrop=function(n){_ed47(n);if(n.type!=='tidek')return;const R=SCENE&&SCENE.room;
 if(R&&R.dun){R.dun.bossDone=1;R.items.push({t:'dchest',x:Math.floor(n.x/16),y:Math.floor(n.y/16),use:'dchest',id:'tidekeeperboss',boss:1})}
 for(const o of en)if(o.summon&&!o.dead)o.dead=1;
 if(EXTRA_DUNGEON_DAYS.tidekeeper!==today()){markDungeonCleared('tidekeeper');GLD+=250;inv.csalmon=(inv.csalmon|0)+5;addXp(ML,500);addXp(9,400);
  say('The Tidekeeper sinks beneath the water! +250 gold, 5 cooked salmon. A golden chest appears!');msgT=5}else say('The Tidekeeper sinks beneath the water!');
 sfx('quest');sqEvent('dungeonboss','tidekeeper');saveNow()};
// --- monster behaviour ---
function waterBolt(n,ang,sp,dmg){PROJ.push({x:n.x,y:n.y-8,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,t:0,life:n.type==='tidek'?1.6:1.1,k:'water',sc:curScene(),hostile:1,wd:dmg});sfx('splash')}
const _u47=upd;upd=function(dt){const paused=menuOpen||pnOpen||dead;const pos=paused?null:en.map(n=>[n,n.x,n.y]),hp0=P.hp,wp=paused?null:PROJ.filter(p=>p.k==='water'&&!p.dead);_u47(dt);if(paused)return;const hit=P.hp<hp0;
 // a water bolt that just hit you: it hits harder than a bone (top-up), and says so
 if(hit&&wp)for(const p of wp)if(p.dead&&Math.hypot(P.x-p.x,P.y-2-p.y)<14){if(p.wd>1)PEND43+=p.wd-1;say('A water bolt slams into you!');break}
 for(const[n,ox,oy]of pos){if(n.dead)continue;const dx=P.x-n.x,dy=P.y-n.y,d=Math.hypot(dx,dy)||1;
  if(n.type==='slime'&&n.vr==='tide'){if(n.frozen>0)continue;
   if(n.ds==='chase'){if((n.dt2-=dt)<=0&&d<80&&d>18){n.ds='squash';n.dt2=.32;n.x=ox;n.y=oy}}
   else if(n.ds==='squash'){n.x=ox;n.y=oy;if((n.dt2-=dt)<=0){n.ds='dash';n.dt2=.26;n.vx=dx/d*150;n.vy=dy/d*150}}
   else if(n.ds==='dash'){n.x=ox;n.y=oy;if(!stepTo(n,n.vx*dt,n.vy*dt))n.dt2=0;if(Math.hypot(P.x-n.x,P.y-n.y)<12)hurtP(2,'A tide slime slams into you!');if((n.dt2-=dt)<=0){n.ds='chase';n.dt2=2+Math.random()*2}}}
  else if(n.type==='crab'){if(n.frozen>0){n.x=ox;n.y=oy;continue}n.x=ox+n.kx*.5;n.y=oy+n.ky*.5;
   if(n.cs==='side'){const px=-dy/d*n.cdir,py=dx/d*n.cdir,keep=d>48?.6:d<30?-.6:0;if(!stepTo(n,(px+dx/d*keep)*40*dt,(py+dy/d*keep)*40*dt))n.cdir*=-1;if((n.ct-=dt)<=0&&d<70&&losClear(n.x,n.y,P.x,P.y)){n.cs='prep';n.ct=.45;n.tx=P.x;n.ty=P.y;sfx('growl')}else if(n.ct<=0)n.ct=.5}
   else if(n.cs==='prep'){if((n.ct-=dt)<=0){n.cs='lunge';n.ct=.3;const l=Math.hypot(n.tx-n.x,n.ty-n.y)||1;n.vx=(n.tx-n.x)/l*185;n.vy=(n.ty-n.y)/l*185}}
   else if(n.cs==='lunge'){if(!stepTo(n,n.vx*dt,n.vy*dt))n.ct=0;if(Math.hypot(P.x-n.x,P.y-n.y)<13)hurtP(2,'The reef crawler\'s claws catch you!');if((n.ct-=dt)<=0){n.cs='rest';n.ct=.7}}
   else if(n.cs==='rest'){if((n.ct-=dt)<=0){n.cs='side';n.ct=1+Math.random()*.8;n.cdir=Math.random()<.5?-1:1}}}
  else if(n.type==='guard'){if(n.frozen>0){n.x=ox;n.y=oy;continue}n.x=ox+n.kx*.4;n.y=oy+n.ky*.4;if(d>34)stepTo(n,dx/d*14*dt,dy/d*14*dt);
   n.cast=Math.max(0,(n.cast||0)-dt);if((n.gcd-=dt)<=0&&d<95&&losClear(n.x,n.y-6,P.x,P.y)){n.gcd=2.4+Math.random()*.6;n.cast=.35;n.fire=.35}
   if(n.fire>0&&(n.fire-=dt)<=0)waterBolt(n,Math.atan2(P.y-(n.y-8),P.x-n.x),90,2)}
  else if(n.type==='tidek')tideAI(n,ox,oy,dt,d,dx,dy,hit)}};
function tideAI(n,ox,oy,dt,d,dx,dy,hit){const ph2=n.hp<n.mhp*.6;if(ph2&&!n.p2){n.p2=1;say('The Tidekeeper raises its trident. The water surges!');msgT=3;sfx('roar');n.ks='rest';n.kt=.6}
 if(n.frozen>0){n.x=ox;n.y=oy;return}n.x=ox+n.kx*.25;n.y=oy+n.ky*.25;const ang=Math.atan2(P.y-(n.y-10),P.x-n.x);
 if(n.ks==='move'){n.ang+=dt*(ph2?.55:.4)*(n.dir2||1);const r=64,tx=P.x+Math.cos(n.ang)*r,ty=P.y+Math.sin(n.ang)*r*.75,ddx=tx-n.x,ddy=ty-n.y,dd=Math.hypot(ddx,ddy)||1;
  if(!stepTo(n,ddx/dd*Math.min(dd,26*dt),ddy/dd*Math.min(dd,26*dt)))n.dir2=-(n.dir2||1);
  n.bcd-=dt;if(ph2){n.scd-=dt;n.ccd=(n.ccd==null?2:n.ccd)-dt}
  if(d<40&&n.kt<=0){n.ks='thrust';n.kt=.5;n.ax=dx/d;n.ay=dy/d;sfx('growl')}
  else if(ph2&&n.scd<=0){n.scd=11;const alive=en.filter(o=>o.summon&&!o.dead).length;let made=0;for(let k=alive;k<2;k++){const a=Math.random()*6.28,x=n.x+Math.cos(a)*26,y=n.y+Math.sin(a)*20;if(!solid(x,y)){const s=mkTideSlime(x,y);s.summon=1;en.push(s);made++}}if(made){say('Tide slimes rise from the glowing water!');sfx('splash')}}
  else if(ph2&&n.ccd<=0&&d>44&&d<150&&losClear(n.x,n.y,P.x,P.y)){n.ccd=6;n.ks='cwind';n.kt=.6;n.ax=dx/d;n.ay=dy/d;sfx('roar')}
  else if(n.bcd<=0&&losClear(n.x,n.y-10,P.x,P.y)){n.ks='cast';n.kt=.45;n.bcd=ph2?2.8:2.3}
  n.kt-=dt}
 else if(n.ks==='cast'){if((n.kt-=dt)<=0){if(ph2)for(const da of[-.32,0,.32])waterBolt(n,ang+da,95,2);else waterBolt(n,ang,95,2);n.ks='move';n.kt=.4}}
 else if(n.ks==='thrust'){if((n.kt-=dt)<=0){const cx=n.x+n.ax*30,cy=n.y-4+n.ay*30;if(Math.hypot(P.x-cx,P.y-cy)<16||inArc(n,n.x,n.y,36,n.ax,n.ay,.8))hurtP(3,'The trident thrust catches you!');sfx('swish');n.ks='rest';n.kt=.7}}
 else if(n.ks==='cwind'){n.ax=n.ax*.9+dx/d*.1;n.ay=n.ay*.9+dy/d*.1;const l=Math.hypot(n.ax,n.ay)||1;n.ax/=l;n.ay/=l;if((n.kt-=dt)<=0){n.ks='charge';n.kt=.5;n.vx=n.ax*170;n.vy=n.ay*170}}
 else if(n.ks==='charge'){if(!stepTo(n,n.vx*dt,n.vy*dt)){n.kt=0;for(let k=0;k<10;k++)part(n.x,n.y-6,(Math.random()-.5)*90,-40-Math.random()*40,.5,'#7ad8e8',200,1)}if(Math.hypot(P.x-n.x,P.y-n.y)<20)hurtP(3,'The Tidekeeper charges into you!');
  if((n.kt-=dt)<=0){n.ks='rest';n.kt=1.3;n.tired=1}}
 else if(n.ks==='rest'){if((n.kt-=dt)<=0){n.ks='move';n.kt=n.tired?.2:.6;n.tired=0;n.dir2=Math.random()<.5?-1:1}}
 if(n.ks!=='charge'){if(hit&&d<16)PEND43+=1;else if(d<18)hurtP(2,'The Tidekeeper shoves you back!')}}
// --- drawing ---
const _dp47=drawProj;drawProj=function(p){if(p.k!=='water')return _dp47(p);const x=Math.round(p.x),y=Math.round(p.y),f=Math.floor(p.t*14)%2;shd(x,y+10,6);
 g.fillStyle='rgba(120,230,255,.3)';g.beginPath();g.arc(x,y,6,0,6.283);g.fill();Rg(x-3,y-3,6,6,O);Rg(x-2,y-2,4,4,f?'#48c8e8':'#78e0f8');Rg(x-2,y-2,2,2,'#e8fcff');Rg(Math.round(x-p.vx*.04),Math.round(y-p.vy*.04),2,2,'rgba(150,230,255,.6)')};
let HDTS=null;
function hdTide(f){if(!HDTS){HDTS=[];for(const fr of[0,1]){const ht=fr?20:23,b=hdBuf(34,26),cy=25,pal=hdP(['#0e4a4a','#1a7a70','#30a890','#68d8b8','#c8fff0']);
  hdSph(b,17,cy,fr?16.5:15.5,ht,pal,{cut:24,id:1,b:.08,fn:(v,x,y,nx,ny)=>v+(ny>.55?-.2:0)+(hdH(x>>1,y>>1)<.1?.35:0)});for(const[a,c2]of[[9,cy-ht+6],[10,cy-ht+5],[11,cy-ht+5],[12,cy-ht+5]])hdSet(b,a,c2,hdC('#ffffff'));hdOutline(b,{1:hdC('#062424')});HDTS[fr]=hdCan(b)}}return HDTS[f]}
const _sl47=SLIMEHD;SLIMEHD=(n,tm)=>{if(n.vr!=='tide'||Math.abs(n.kx)+Math.abs(n.ky)>.8)return _sl47(n,tm);const x=Math.round(n.x),y=Math.round(n.y),f=Math.floor(tm*3+n.x)%2,sq=n.ds==='squash'?.7:n.ds==='dash'?1.15:1;
 g.fillStyle='rgba(80,220,190,.16)';g.beginPath();g.arc(x,y,12,0,6.283);g.fill();shd(x,y+5,15);const sp=hdTide(f),w=sp.width/2*(2-sq),hh=sp.height/2*sq,top=y+6.5-hh;g.drawImage(sp,x-w/2,top,w,hh);
 if(n.ds==='squash'){g.fillStyle='rgba(255,90,60,'+(.35+.3*Math.sin(tm*40))+')';g.fillRect(x-w/2,top-2,w,1.5)}
 const e=top+hh*.35,dd=P.x>n.x?.5:-.5;g.fillStyle='#ffffff';for(const ex of[x-4.5,x+1.5])g.fillRect(ex,e,3,3.5);g.fillStyle='#062424';for(const ex of[x-4.5,x+1.5])g.fillRect(ex+1+dd,e+1,1.5,2)};
function hdCrabSp(fr,hit,up){const b=hdBuf(40,28),pal=hit?hdP(['#d0c0c0','#e8dcdc','#fff4f4','#ffffff']):hdP(['#6a1810','#a83020','#e05838','#f89070','#ffd0c0']),p=hdPainter(b,20,22,true);
 const lg=fr?1:-1;for(const s of[-1,1])for(let j=0;j<3;j++){const x=s*(7+j*3),y=-4;p.box(x+lg*(j%2?1:-1)*.5-1,y,x+lg*(j%2?1:-1)*.5+1,y+5,pal,0)}
 p.ell(0,-8,10,6,pal,.05);for(const s of[-1,1]){const cy=up?-16:-10;p.ell(s*13,cy,4,3.4,pal,.1);p.ell(s*16,cy-2,2.6,2.2,pal,.1);p.box(s*10-1,cy+1,s*10+1,-8,pal,0)}
 for(const s of[-1,1]){p.box(s*3-1,-15,s*3,-12,pal,0);p.put(s*3,-16,hdC('#101010'))}hdOutline(b,{1:hdC('#2a0806')});return hdCan(b)}
function drawCrab(n,tm){const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,fr=Math.floor(tm*(n.cs==='side'?12:4)+n.x)%2,up=n.cs==='prep'||n.cs==='lunge';shd(x,y+5,16);
 if(n.cs==='prep'){g.fillStyle='rgba(255,80,50,'+(.25+.25*Math.sin(tm*30))+')';g.beginPath();g.arc(x,y-8,12,0,6.283);g.fill()}
 const c=hdEn('cr'+fr+hit+up,()=>hdCrabSp(fr,hit,up));g.drawImage(c,x-c.width/4,y+6-c.height/2,c.width/2,c.height/2)}
function hdGuardSp(fr,hit,cast){const b=hdBuf(36,52),p=hdPainter(b,18,48,true),A=hit?hdP(['#c8c8d0','#e0e0e8','#f4f4f8','#ffffff']):hdP(['#1a3a4a','#2a5a6a','#3a7a88','#68a8b0','#a8d8d8']),SK=hdP(['#4a6a60','#6a8a78','#8aa890']);
 const s=fr?1:0;p.box(-6,-12,-2,0+s,A,1);p.box(2,-12,6,0-s,A,1);p.box(-8,-30,8,-11,A,2,.05);for(let x=-7;x<=7;x+=3)p.put(x,-24,A[4]);
 p.ell(0,-36,6.5,6.5,A,.1);p.box(-5,-37,5,-34,hdP(['#060c10','#0a1418','#101c20']),0);const ey=hdC(cast?'#a8fff0':'#48e8a8');p.put(-2,-36,ey);p.put(2,-36,ey);
 p.box(9,-34,11,-4,hdP(['#5a3a10','#8a6020','#b08838']),0);for(const x of[7,10,13])p.box(x,-40,x+1,-34,hdP(['#88c8d0','#b8f0f0','#e8ffff']),0);
 for(let k=0;k<5;k++)p.put(-6+k*3,-10+((k*7)%3),SK[k%3]);hdOutline(b,{1:hdC('#061018')});return hdCan(b)}
function drawGuard(n,tm){const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,fr=Math.floor(tm*3+n.x)%2,cast=n.cast>0,f=P.x<n.x;shd(x,y+6,16);
 if(cast){g.fillStyle='rgba(120,240,220,'+(.3+.3*Math.sin(tm*30))+')';g.beginPath();g.arc(x+(f?-10:10),y-36,7,0,6.283);g.fill()}
 const c=hdEn('gd'+fr+hit+cast,()=>hdGuardSp(fr,hit,cast));hdDraw(c,x-c.width/4,y+6-c.height/2,f)}
function drawTideK(n,tm){const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,fr=Math.floor(tm*2.5+n.x)%2,cast=n.ks==='cast'||n.ks==='cwind'||n.ks==='thrust',f=P.x<n.x;
 g.fillStyle='rgba(72,232,200,'+(.12+.06*Math.sin(tm*3))+')';g.beginPath();g.ellipse(x,y-6,30,20,0,0,6.283);g.fill();shd(x,y+6,30);
 if(n.ks==='thrust'||n.ks==='cwind'){const r=n.ks==='thrust'?30:46,p=.25+.25*Math.sin(tm*30);g.fillStyle='rgba(255,70,40,'+p+')';g.strokeStyle='rgba(255,80,50,.85)';g.lineWidth=1.5;g.setLineDash([3,2]);
  if(n.ks==='thrust'){g.beginPath();g.arc(x+n.ax*r,y-4+n.ay*r,16,0,6.283);g.fill();g.stroke()}else{g.beginPath();g.moveTo(x-n.ay*12,y+n.ax*12);g.lineTo(x+n.ax*90-n.ay*12,y+n.ay*90+n.ax*12);g.lineTo(x+n.ax*90+n.ay*12,y+n.ay*90-n.ax*12);g.lineTo(x+n.ay*12,y-n.ax*12);g.closePath();g.fill();g.stroke()}g.setLineDash([])}
 const c=hdEn('tk'+fr+hit+cast,()=>hdGuardSp(fr,hit,cast)),K=1.7,w=c.width/2*K,hh=c.height/2*K;if(!f)g.drawImage(c,x-w/2,y+6-hh,w,hh);else{g.save();g.translate(x+w/2,y+6-hh);g.scale(-1,1);g.drawImage(c,0,0,w,hh);g.restore()}
 g.fillStyle='rgba(168,255,240,'+(.5+.4*Math.sin(tm*5))+')';g.fillRect(x+(f?-16:13),y-60,3,3);
 if(cast){g.fillStyle='#ff5040';g.font='700 10px "Pixelify Sans",monospace';g.textAlign='center';g.fillText('!',x,y-66)}
 const bw=42,fr2=Math.max(0,n.hp)/n.mhp;Rg(x-bw/2-1,y-72,bw+2,5,O);Rg(x-bw/2,y-71,bw,3,'#203038');Rg(x-bw/2,y-71,bw*fr2,3,n.p2?'#48e8a8':'#a8e8f0');Rg(x-bw/2+bw*.6,y-71,.6,3,O)}
const _pS47=pS;pS=function(n,tm){if(n.type==='crab')return drawCrab(n,tm);if(n.type==='guard')return drawGuard(n,tm);if(n.type==='tidek')return drawTideK(n,tm);_pS47(n,tm)};
// decor: glowing pools and water, algae, coral, ship timbers, plank bridges
const _df47=drawFurn;drawFurn=function(it,tm){const x0=it.x*16,y0=it.y*16;
 if(it.t==='gpool'){const p=.5+.5*Math.sin(tm*1.8+x0*.1);g.fillStyle='#1a4a5a';g.beginPath();g.ellipse(x0+8,y0+9,9,5.5,0,0,6.283);g.fill();g.fillStyle='rgba(72,232,200,'+(.35+.25*p)+')';g.beginPath();g.ellipse(x0+8,y0+9,7,4,0,0,6.283);g.fill();g.fillStyle='#c8fff0';g.fillRect(x0+4+p*4,y0+8,2,1);return}
 if(it.t==='gwater'){const p=.5+.5*Math.sin(tm*1.6+(x0+y0)*.05);g.fillStyle='#123a4a';g.fillRect(x0,y0,16,16);g.fillStyle='rgba(72,232,200,'+(.3+.25*p)+')';g.fillRect(x0+1,y0+1,14,14);g.fillStyle='rgba(200,255,240,.7)';g.fillRect(x0+3+((tm*6+x0)%10),y0+5+(y0%6),3,1);return}
 if(it.t==='algae'){const p=.6+.4*Math.sin(tm*2.4+x0);g.fillStyle='rgba(90,255,170,'+(.18*p)+')';g.beginPath();g.arc(x0+8,y0+10,8,0,6.283);g.fill();for(const[a,b]of[[4,10],[7,12],[10,9],[12,12],[6,8]]){Rg(x0+a,y0+b,2,2,'#2a8a5a');Rg(x0+a,y0+b,1,1,'#88ffb8')}return}
 if(it.t==='coral'){shd(x0+8,y0+14,15);Rg(x0+2,y0-2,12,16,O);Rg(x0+3,y0-1,10,14,'#e86858');Rg(x0+4,y0-4,3,5,O);Rg(x0+4.5,y0-3.5,2,4,'#f88878');Rg(x0+10,y0-5,3,6,O);Rg(x0+10.5,y0-4.5,2,5,'#f88878');Rg(x0+4,y0+2,3,2,'#f8b0a0');Rg(x0+8,y0+6,2,2,'#b84838');return}
 if(it.t==='timber'){shd(x0+8,y0+14,16);g.save();g.translate(x0+8,y0+8);g.rotate(((it.x*7+it.y*3)%5-2)*.25);Rg(-8,-3,16,6,O);Rg(-7,-2,14,4,'#7a5a38');Rg(-7,-2,14,1,'#9a7a50');Rg(-3,-2,1,4,'#5a3a20');Rg(3,-2,1,4,'#5a3a20');g.restore();return}
 if(it.t==='plank'){g.fillStyle='#163a4c';g.fillRect(x0,y0,16,16);g.fillStyle='rgba(72,200,220,.25)';g.fillRect(x0,y0,16,16);Rg(x0+1,y0,14,16,'#5a3a20');for(let k=0;k<4;k++){Rg(x0+1,y0+k*4,14,3,k%2?'#8a6038':'#9a7040');Rg(x0+1,y0+k*4,14,.6,'#b08850')}return}
 _df47(it,tm)};
