// ---------------------------------------------------------------- 43. Frostfang Den: a three-floor ice cave north of Frosthollow
// Uses the daily dungeon framework (section 35): floors rebuilt each day, sleeping monsters, stairs, rarity chests,
// minimap. Floor 1 Frozen Entrance (wide passages, weaker monsters, supply crates), floor 2 Crystal Tunnels (narrow,
// more wolves), floor 3 Alpha's Lair (a round chamber ringed by frozen pillars). New monsters: snow wolves (wolf AI:
// crouch, then lunge), frost slimes (slime AI; touching one chills you and slows you down), ice bats (circle you, flash,
// then dive). The Frostfang Alpha (38 HP): circles, telegraphed lunges and a pause after each; below 60% it speeds up,
// lunges twice, calls up to two snow wolves and lets out an icy roar (a ring warns you first) that slows you.
// Daily: the Alpha and its reward (180 gold, 2 iron bars, 500 Attack XP, 300 Defence XP) come back each new day.
const EXTRA_DUNGEONS={frostfang:{name:'Frostfang Den',floors:3,boss:'frostfang_alpha',hp:38,generator:'cave'}};
const EXTRA_DUNGEON_DAYS={frostfang:-1};
function markDungeonCleared(kind){EXTRA_DUNGEON_DAYS[kind]=today()}
DKIND.frostfang={name:'Frostfang Den',floor:['#dce6ee','#cedae6'],wall:'#7c9cbe',trim:'#34506c',W:56,H:42,label:'Den'};
function genIce(W,H,rnd,fill,need){const ex=W>>1;let G,R2;
 for(let tries=0;tries<30;tries++){G=new Uint8Array(W*H).fill(1);for(let y=2;y<H-1;y++)for(let x=1;x<W-1;x++)G[y*W+x]=rnd()<fill?1:0;
  for(let it=0;it<5;it++){const n=G.slice();for(let y=2;y<H-1;y++)for(let x=1;x<W-1;x++){let c=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)c+=G[(y+dy)*W+x+dx];n[y*W+x]=c>=5?1:0}G=n}
  for(let y=H-9;y<H-1;y++)for(let x=ex-1;x<=ex+1;x++)G[y*W+x]=0;for(let x=0;x<W;x++)G[(H-1)*W+x]=x===ex?0:1;for(let y=0;y<2;y++)for(let x=0;x<W;x++)G[y*W+x]=1;
  R2=dBfs(G,W,H,ex,H-1);if(R2.c>W*H*need)break}
 for(let i=0;i<W*H;i++)if(!G[i]&&R2.d[i]<0)G[i]=1;return{G,ex}}
const mkSnowWolf=(x,y)=>({x,y,hp:7,kx:0,ky:0,type:'wolf',vr:'snow',dmg:1});
const mkFrostSlime=(x,y)=>({x,y,hp:8,kx:0,ky:0,type:'slime',vr:'frost',dmg:1});
const mkBat=(x,y)=>({x,y,hp:5,kx:0,ky:0,type:'bat',bs:'orbit',bt:1+Math.random(),ba:Math.random()*6.28,dmg:1});
function fBuild(f){const K=DKIND.frostfang,W=K.W,H=K.H,rnd=dRng(today()*7919+f*104729+29),Gn=genIce(W,H,rnd,f===1?.41:f===2?.47:.44,f===2?.2:.28),G=Gn.G,ex=Gn.ex;
 const R={w:W,h:H,ex,cave:1,tomb:0,ice:1,floor:K.floor,wall:K.wall,trim:K.trim,items:[],solid:new Set(),mobs:[],dun:{kind:'frostfang',f,G,seen:new Uint8Array(W*H),mm:null,label:'Den'}};
 let dist=dBfs(G,W,H,ex,H-1).d;const cells=[];for(let i=0;i<W*H;i++)if(!G[i]&&dist[i]>=0)cells.push(i);
 const far=cells.reduce((a,b)=>dist[b]>dist[a]?b:a,cells[0]),fx=far%W,fy=(far/W)|0;
 const pillars=[];
 if(f<3)R.items.push({t:'stairs',x:fx,y:fy});
 else{const cx=Math.min(W-9,Math.max(8,fx)),cy=Math.min(H-12,Math.max(8,fy));
  for(let y=cy-7;y<=cy+7;y++)for(let x=cx-8;x<=cx+8;x++)if(x>0&&y>1&&x<W-1&&y<H-1&&((x-cx)/8.2)**2+((y-cy)/6.6)**2<=1)G[y*W+x]=0;
  // a corridor from the chamber toward the entrance so the lair is always reachable
  {let x=cx,y=cy;const tx=ex,ty=H-2;while(y<ty){y++;for(const dx of[-1,0,1])if(x+dx>0&&x+dx<W-1)G[y*W+x+dx]=0;if(dBfs(G,W,H,ex,H-1).d[y*W+x]>=0)break;if(x!==tx&&rnd()<.5)x+=Math.sign(tx-x)}}
  R.dun.boss=[cx,cy];for(let k=0;k<6;k++){const a=k/6*6.283+.5,px=Math.round(cx+Math.cos(a)*5.2),py=Math.round(cy+Math.sin(a)*4);pillars.push(py*W+px)}
  dist=dBfs(G,W,H,ex,H-1).d;cells.length=0;for(let i=0;i<W*H;i++)if(!G[i]&&dist[i]>=0)cells.push(i)}
 const used=new Set([far]),near=(i,r)=>{const x=i%W,y=(i/W)|0;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(used.has((y+dy)*W+x+dx))return true;return false},
  open8=i=>{for(const j of[i-1,i+1,i-W,i+W,i-W-1,i-W+1,i+W-1,i+W+1])if(G[j])return false;return true},
  pick=(minD,test)=>{for(let t=0;t<400;t++){const i=cells[Math.floor(rnd()*cells.length)];if(dist[i]<minD||near(i,1)||(test&&!test(i)))continue;if(R.dun.boss&&Math.hypot(i%W-R.dun.boss[0],((i/W)|0)-R.dun.boss[1])<7)continue;used.add(i);return i}return-1};
 const add=(t,i,o)=>{if(i<0)return;const it=Object.assign({t,x:i%W,y:(i/W)|0},o||{});R.items.push(it);if(it.solid)R.solid.add(i)};
 for(const i of pillars)if(!G[i]){used.add(i);add('icepillar',i,{solid:1})}
 for(let k=0;k<3+f+(f===1?1:0);k++)add('dchest',pick(14,open8),{solid:1,use:'dchest',id:'frostfang'+f+'_'+k});
 for(let k=0;k<8;k++)add('crystal',pick(4,open8),{solid:1});
 for(let k=0;k<10;k++)add('icicle',pick(3,i=>G[i-W]&&!G[i+W]));
 for(let k=0;k<6;k++)add('fpool',pick(4,open8));
 if(f===1)for(let k=0;k<6;k++)add('crate',pick(5,open8),{solid:1});else for(let k=0;k<2;k++)add('crate',pick(5,open8),{solid:1});
 for(let k=0;k<5;k++)add('bones',pick(4));
 for(let k=0;k<10+4*f;k++){const i=pick(11);if(i<0)continue;const x=(i%W)*16+8,y=((i/W)|0)*16+8,r=rnd();
  R.mobs.push(f===1?(r<.5?mkBat(x,y):r<.9?mkFrostSlime(x,y):mkSnowWolf(x,y)):f===2?(r<.45?mkSnowWolf(x,y):r<.75?mkBat(x,y):mkFrostSlime(x,y)):(r<.4?mkSnowWolf(x,y):r<.7?mkBat(x,y):mkFrostSlime(x,y)))}
 for(let i=0;i<W*H;i++)if(G[i])R.solid.add(i);return R}
const _bf43=buildFloor;buildFloor=function(kind,f){return kind==='frostfang'?fBuild(f):_bf43(kind,f)};
const _da43=dArrive;dArrive=function(R,from){const D=R.dun;if(D.kind!=='frostfang')return _da43(R,from);const sp=D.bossSpawned;D.bossSpawned=1;_da43(R,from);D.bossSpawned=sp;
 if(D.f===3&&D.boss&&!D.bossSpawned){if(EXTRA_DUNGEON_DAYS.frostfang!==today()){const[bx,by]=D.boss;R.mobs.push({x:bx*16+8,y:by*16+8,hp:38,mhp:38,kx:0,ky:0,type:'alpha',big:1,as:'circle',at:2,ang:Math.random()*6.28,combo:0,scd:4,rcd:5,dmg:2})}D.bossSpawned=1}};
const _dg43=dGo;dGo=function(kind,f,from){_dg43(kind,f,from);if(kind!=='frostfang')return;const R=SCENE.room,quiet=R.dun.bossDone||EXTRA_DUNGEON_DAYS.frostfang===today();
 say('Frostfang Den - '+['','Frozen Entrance','Crystal Tunnels','Alpha\'s Lair'][f]+' (floor '+f+' of 3)'+(f===3?(quiet?'. The lair is quiet today.':'. Something growls in the dark...'):''))};
const _en43=entrances;entrances=function(){const a=_en43();if(FHDEN)a.push({x:FHDEN.x,y:FHDEN.y,id:'frostfang',house:null});return a};
const _es43=enterScene;enterScene=function(id,house,ret){if(id!=='frostfang')return _es43(id,house,ret);const R=dFloor('frostfang',1);_es43(dKey('frostfang',1),null,ret);dArrive(R,null);
 say('You enter Frostfang Den. Your breath turns to mist. Three floors deep - find the stairs down.')};
// loot: the caverns' table (gems, elixirs, the Crystal blade) plus iron gear from the Alpha
const _dl43=dLoot;dLoot=function(kind,f,boss){if(kind!=='frostfang')return _dl43(kind,f,boss);const out=_dl43('cave',f,boss);
 if(boss){const sw=out.findIndex(e=>e[0]==='eq_sword5');if(sw>=0&&Math.random()>.33)out.splice(sw,1);if(!out.some(e=>e[0]==='elixir'))out.push(['elixir',1]);out.push(['idag',1],['ibar',2])}else if(f===1&&Math.random()<.35)out.push(['cooked',2]);return out};
// the Alpha falls: a golden chest, the daily reward (once per in-game day), and Heart of Frostfang
const _ed43=enemyDrop;enemyDrop=function(n){_ed43(n);if(n.type!=='alpha')return;const R=SCENE&&SCENE.room;
 if(R&&R.dun){R.dun.bossDone=1;R.items.push({t:'dchest',x:Math.floor(n.x/16),y:Math.floor(n.y/16),use:'dchest',id:'frostfangboss',boss:1})}
 for(const o of en)if(o.summon&&!o.dead){o.dead=1}
 if(EXTRA_DUNGEON_DAYS.frostfang!==today()){markDungeonCleared('frostfang');GLD+=180;inv.ibar=(inv.ibar|0)+2;addXp(0,500);addXp(8,300);
  say('The Frostfang Alpha falls! +180 gold, 2 iron bars. A golden chest appears!');msgT=5}else say('The Frostfang Alpha falls!');
 sfx('quest');sqEvent('dungeonboss','frostfang');saveNow()};
// --- monster behaviour (runs after the normal enemy update, so it extends the existing AI) ---
let SLOW43=0,ROAR43=null,PEND43=0;
const losClear=(ax,ay,bx,by)=>{for(let k=1;k<10;k++){const t=k/10;if(solid(ax+(bx-ax)*t,ay+(by-ay)*t))return false}return true};
const stepTo=(n,mx,my)=>{let moved=true;if(!solid(n.x+mx,n.y))n.x+=mx;else moved=false;if(!solid(n.x,n.y+my))n.y+=my;else moved=false;return moved};
// extra damage lands at the start of the next update, so the normal death check, the Elixir of Life and the Phoenix perk all apply
function hurtP(d,msg){if(dead||hurt>0||ROLLT>0)return false;PEND43+=d;hurt=1;FLASH=.25;say(msg);sfx('hurt');return true}
const _u43=upd;upd=function(dt){const paused=menuOpen||pnOpen||dead;if(!paused&&PEND43>0){P.hp-=PEND43;PEND43=0}const pos=paused?null:en.map(n=>[n,n.x,n.y]),hp0=P.hp,px0=P.x,py0=P.y,sc0=SCENE;
 _u43(dt);if(paused)return;
 const hit=P.hp<hp0;
 for(const[n,ox,oy]of pos){if(n.dead)continue;const dx=P.x-n.x,dy=P.y-n.y,d=Math.hypot(dx,dy)||1;
  if(n.type==='bat'){if(n.frozen>0){n.x=ox;n.y=oy;continue}n.x=ox+n.kx;n.y=oy+n.ky;
   if(n.bs==='orbit'){n.ba+=dt*2.3;const r=40+Math.sin(n.ba*1.7)*6,tx=P.x+Math.cos(n.ba)*r,ty=P.y-6+Math.sin(n.ba)*r*.7,ddx=tx-n.x,ddy=ty-n.y,dd=Math.hypot(ddx,ddy)||1,s=Math.min(dd,78*dt);stepTo(n,ddx/dd*s,ddy/dd*s);
    if((n.bt-=dt)<=0&&d<90){n.bs='tele';n.bt=.38;n.tx=P.x;n.ty=P.y}}
   else if(n.bs==='tele'){if((n.bt-=dt)<=0){n.bs='dive';n.bt=.32;const l=Math.hypot(n.tx-n.x,n.ty-n.y)||1;n.vx=(n.tx-n.x)/l*210;n.vy=(n.ty-n.y)/l*210;sfx('swish')}}
   else if(n.bs==='dive'){if(!stepTo(n,n.vx*dt,n.vy*dt))n.bt=0;if((n.bt-=dt)<=0){n.bs='orbit';n.bt=1.4+Math.random()*1.2}}}
  else if(n.type==='slime'&&n.vr==='frost'){if(d<13&&!(ROLLT>0)){if(SLOW43<=0)say('Brr! The frost slime chills you.');SLOW43=1.6}}
  else if(n.type==='wolf'&&n.vr==='snow'){if(hit&&d<14&&n.ls==='go'){PEND43+=1;say('The snow wolf\'s lunge bites deep!')}}
  else if(n.type==='alpha')alphaAI(n,ox,oy,dt,d,dx,dy,hit)}
 if(ROAR43){ROAR43.t+=dt}
 if(SLOW43>0){SLOW43-=dt;if(SCENE===sc0&&!(ROLLT>0)){const mx=P.x-px0,my=P.y-py0;if(Math.abs(mx)+Math.abs(my)<6){P.x=px0+mx*.55;P.y=py0+my*.55}}
  if(Math.random()<dt*10)part(P.x+(Math.random()*10-5),P.y-2-Math.random()*10,0,-12,.5,Math.random()<.5?'#a8e0ff':'#ffffff',-20,1)}
};
function alphaAI(n,ox,oy,dt,d,dx,dy,hit){const ph2=n.hp<n.mhp*.6;if(ph2&&!n.p2){n.p2=1;say('The Frostfang Alpha howls in fury!');msgT=3;sfx('roar');n.as='rest';n.at=.5}
 if(n.frozen>0){n.x=ox;n.y=oy;return}
 n.x=ox+n.kx*.3;n.y=oy+n.ky*.3;n.lunge=n.as==='lunge';
 if(n.as==='circle'){const sp=ph2?60:46;n.ang+=dt*(sp/62)*(n.dir2||1);const r=62,tx=P.x+Math.cos(n.ang)*r,ty=P.y+Math.sin(n.ang)*r*.75,ddx=tx-n.x,ddy=ty-n.y,dd=Math.hypot(ddx,ddy)||1;
  if(!stepTo(n,ddx/dd*Math.min(dd,sp*1.4*dt),ddy/dd*Math.min(dd,sp*1.4*dt)))n.dir2=-(n.dir2||1);
  if((n.at-=dt)<=0&&losClear(n.x,n.y,P.x,P.y)){n.as='prep';n.at=ph2?.45:.65;n.tx=P.x;n.ty=P.y;sfx('growl')}}
 else if(n.as==='prep'){n.tx=P.x;n.ty=P.y;if((n.at-=dt)<=0){n.as='lunge';n.at=.42;const l=Math.hypot(n.tx-n.x,n.ty-n.y)||1;const sp=ph2?225:195;n.vx=(n.tx-n.x)/l*sp;n.vy=(n.ty-n.y)/l*sp}}
 else if(n.as==='lunge'){if(!stepTo(n,n.vx*dt,n.vy*dt)){n.at=0;for(let k=0;k<8;k++)part(n.x,n.y-6,(Math.random()-.5)*80,-30-Math.random()*40,.5,'#d8f0ff',200,1)}
  if((n.at-=dt)<=0){if(ph2&&n.combo<1){n.combo++;n.as='prep';n.at=.3}else{n.combo=0;n.as='rest';n.at=ph2?.65:.95}}}
 else if(n.as==='rest'){if((n.at-=dt)<=0){n.as='circle';n.at=1.7+Math.random()*1.1;n.dir2=Math.random()<.5?-1:1}}
 else if(n.as==='roar'){if((n.at-=dt)<=0){n.as='circle';n.at=1.2;if(d<64&&losClear(n.x,n.y,P.x,P.y)&&!(ROLLT>0)){SLOW43=2.6;say('The icy roar freezes you to the bone!');FLASH=.2}
   for(let k=0;k<20;k++){const a=k/20*6.283;part(n.x,n.y-8,Math.cos(a)*120,Math.sin(a)*90,.45,'#c8ecff',0,1)}ROAR43=null}}
 if(ph2&&n.as==='circle'){n.scd-=dt;n.rcd-=dt;
  if(n.scd<=0){n.scd=10;const alive=en.filter(o=>o.summon&&!o.dead).length;for(let k=alive;k<2;k++){const a=Math.random()*6.28,x=n.x+Math.cos(a)*26,y=n.y+Math.sin(a)*20;if(!solid(x,y)){const w=mkSnowWolf(x,y);w.summon=1;en.push(w)}}
   if(alive<2){say('The Alpha calls its pack!');sfx('roar')}}
  else if(n.rcd<=0&&d<80){n.rcd=7.5;n.as='roar';n.at=.7;ROAR43={x:n.x,y:n.y,t:0,n};sfx('growl')}}
 // contact: a touch hurts, a lunge hurts more (the normal 1-damage touch is topped up rather than doubled)
 const dmg=n.as==='lunge'?3:2;if(hit&&d<16){PEND43+=dmg-1}else if(d<20)hurtP(dmg,n.as==='lunge'?'The Alpha\'s lunge slams into you!':'The Frostfang Alpha bites!')}
// --- drawing ---
function hdWolfSpC(st,hit,prep,pal,eyeC,outl){const b=hdBuf(56,40),p=hdPainter(b,26,34,true),F=hit?hdP(['#c8c8d0','#e0e0e8','#f0f0f6','#ffffff']):hdP(pal),PAW=hit?F:hdP(pal.slice(0,3));
 const s=st?2:-2,ly=prep?2:0;
 p.box(-14-s,-10+ly,-10-s,0,PAW,1,-.1);p.box(6+s,-10+ly,10+s,0,PAW,1,-.1);
 for(let k=0;k<7;k++)p.ell(-17-k*1.2,-15-k*1.4+ly,4-k*.3,3.4-k*.25,F,.1);
 p.ell(-2,-14+ly,14,8,F,.05);for(let x=-12;x<10;x++){p.put(x,-8+ly,F[hit?3:4]);p.put(x,-7+ly,F[hit?3:4])}
 p.box(-11+s,-10+ly,-7+s,0,PAW,1);p.box(9-s,-10+ly,13-s,0,PAW,1);
 p.ell(13,-20+ly*1.5,7.5,6.5,F,.08);p.box(17,-20+ly*1.5,25,-14+ly*1.5,F,2,.05);p.put(24,-19+ly*1.5,hdC('#181018'));p.put(24,-18+ly*1.5,hdC('#181018'));p.put(23,-19+ly*1.5,hdC('#181018'));
 for(const ex of[9,14]){for(let k=0;k<6;k++)for(let x=0;x<4-(k>>1);x++)p.put(ex+x+(k>>1)*.5|0,-25-k+ly*1.5,F[k>3?1:2]);p.put(ex+1,-26+ly*1.5,hdC(hit?'#ffffff':'#c8a0b0'))}
 const eye=hdC(prep&&!hit?'#f84030':eyeC);p.put(15,-22+ly*1.5,eye);p.put(16,-22+ly*1.5,eye);p.put(15,-21+ly*1.5,eye);p.put(16,-21+ly*1.5,eye);if(!hit)p.put(15,-22+ly*1.5,hdC('#ffffff'));
 for(let x=18;x<24;x++)p.put(x,-14+ly*1.5,F[0]);hdOutline(b,{1:hdC(hit?'#8888a0':outl)});return hdCan(b)}
const SNOWPAL=['#8a98b0','#b4c0d4','#d4dce8','#eaf0f6','#ffffff'],ALPHAPAL=['#7a8aa8','#a8b8d0','#d0dceb','#e8f0f8','#ffffff'];
function drawSnowWolf(n,tm){const x=Math.round(n.x),y=Math.round(n.y),f=P.x<n.x,hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,st=Math.floor(tm*8+n.x)%2,prep=n.ls==='prep';shd(x,y+5,18);
 const c=hdEn('sw'+st+hit+prep,()=>hdWolfSpC(st,hit,prep,SNOWPAL,'#202838','#3a4660'));hdDraw(c,f?x-(c.width/2-13):x-13,y+6-17,f)}
function drawAlpha(n,tm){const x=Math.round(n.x),y=Math.round(n.y),f=P.x<n.x,hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,st=n.as==='lunge'?1:Math.floor(tm*(n.as==='circle'?9:3)+n.x)%2,prep=n.as==='prep'||n.as==='roar';
 const c=hdEn('al'+st+hit+prep,()=>hdWolfSpC(st,hit,prep,ALPHAPAL,'#58c8ff','#2a3650')),K=1.75,w=c.width/2*K,hh=c.height/2*K,sh=prep?Math.sin(tm*60)*.8:0;
 g.fillStyle='rgba(120,200,255,'+(.12+.06*Math.sin(tm*3))+')';g.beginPath();g.ellipse(x,y-6,30,20,0,0,6.283);g.fill();shd(x,y+5,34);
 const dx=f?x-(w-13*K):x-13*K,dy=y+6-17*K;if(!f)g.drawImage(c,dx+sh,dy,w,hh);else{g.save();g.translate(dx+w+sh,dy);g.scale(-1,1);g.drawImage(c,0,0,w,hh);g.restore()}
 // glowing eyes
 const eyX=f?dx+w-21.5*K+sh:dx+20*K+sh,eyY=dy+5.5*K+(prep?1.5*K:0);g.fillStyle=prep?'#ff6040':'#a8f0ff';g.globalAlpha=.55+.45*Math.sin(tm*6);g.fillRect(Math.round(eyX),Math.round(eyY),2,2);g.globalAlpha=1;
 if(n.as==='prep'){g.fillStyle='#ff5040';g.font='700 10px "Pixelify Sans",monospace';g.textAlign='center';g.fillText('!',x,y-34)}
 // health bar
 const bw=40,fr=Math.max(0,n.hp)/n.mhp;Rg(x-bw/2-1,y-40,bw+2,5,O);Rg(x-bw/2,y-39,bw,3,'#303848');Rg(x-bw/2,y-39,bw*fr,3,n.p2?'#58c8ff':'#e8f0f8')}
let HDBAT=null;
function hdBatSp(fr,hit){const b=hdBuf(40,28),OX=20,OY=20,pal=hit?hdP(['#b8c0d8','#d0d8ec','#ecf0f8','#ffffff']):hdP(['#1c2a48','#304a78','#5478b0','#9cc4ec']),
  put=(x,y,c)=>{const X=Math.round(x+OX),Y=Math.round(y+OY);if(X>=0&&Y>=0&&X<40&&Y<28)hdSet(b,X,Y,c,1)},
  tri=(a,b2,c,col)=>{const mnx=Math.floor(Math.min(a[0],b2[0],c[0])),mxx=Math.ceil(Math.max(a[0],b2[0],c[0])),mny=Math.floor(Math.min(a[1],b2[1],c[1])),mxy=Math.ceil(Math.max(a[1],b2[1],c[1]));
   const s2=(p1,p2,p3)=>(p1[0]-p3[0])*(p2[1]-p3[1])-(p2[0]-p3[0])*(p1[1]-p3[1]);for(let y=mny;y<=mxy;y++)for(let x=mnx;x<=mxx;x++){const q=[x+.5,y+.5],d1=s2(q,a,b2),d2=s2(q,b2,c),d3=s2(q,c,a);if(!((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0)))put(x,y,col)}};
 const up=fr?-6:3;
 for(const sd of[-1,1]){const root=[sd*2.5,-11],tip=[sd*18,-15+up],mid=[sd*14,-6+up*.4],low=[sd*6,-4];
  tri(root,tip,mid,pal[1]);tri(root,mid,low,pal[1]);tri([sd*9,-8+up*.3],[sd*12,-5+up*.4],[sd*8,-3],pal[0]);
  for(let k=0;k<=12;k++){const t=k/12;put(root[0]+(tip[0]-root[0])*t,root[1]+(tip[1]-root[1])*t,pal[0])}
  for(let k=0;k<=8;k++){const t=k/8;put(root[0]+(mid[0]-root[0])*t,root[1]+(mid[1]-root[1])*t,pal[0])}
  put(tip[0],tip[1]-1,pal[3])}
 for(let y=-13;y<=-3;y++)for(let x=-4;x<=4;x++){const d=(x/4.2)**2+((y+8)/5.2)**2;if(d<=1)put(x,y,d<.35&&y<-9?pal[3]:y>-6?pal[1]:pal[2])}
 for(const sd of[-1,1]){put(sd*2,-14,pal[2]);put(sd*3,-15,pal[2]);put(sd*3,-14,pal[2])}
 const e=hdC(hit?'#ffffff':'#a8f0ff');put(-2,-10,e);put(-1,-10,e);put(1,-10,e);put(2,-10,e);put(-1,-7,hdC('#ffffff'));put(1,-7,hdC('#ffffff'));
 hdOutline(b,{1:hdC('#0e1424')});return hdCan(b)}
function drawBat(n,tm){const x=Math.round(n.x),y=Math.round(n.y)-10,hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,fr=Math.floor(tm*12+n.ba*3)%2;shd(x,y+16,10);
 if(n.bs==='tele'){g.fillStyle='rgba(168,224,255,'+(.35+.3*Math.sin(tm*40))+')';g.beginPath();g.arc(x,y-1,9,0,6.283);g.fill()}
 const c=hdEn('bat'+fr+(hit||n.bs==='tele'),()=>hdBatSp(fr,hit||n.bs==='tele'));g.drawImage(c,x-c.width/4,y-c.height/4-2,c.width/2,c.height/2)}
const _pS43=pS;pS=function(n,tm){if(n.type==='bat')return drawBat(n,tm);if(n.type==='alpha')return drawAlpha(n,tm);if(n.type==='wolf'&&n.vr==='snow')return drawSnowWolf(n,tm);_pS43(n,tm)};
// frost slimes: pale blue and glassy
let HDFS=null;
function hdFrost(f){if(!HDFS){HDFS=[];for(const fr of[0,1]){const ht=fr?20:23,b=hdBuf(34,26),cy=25,pal=hdP(['#2a5a8a','#4a8ac0','#7ab8e8','#b0dcf8','#f0faff']);
  hdSph(b,17,cy,fr?16.5:15.5,ht,pal,{cut:24,id:1,b:.1,fn:(v,x,y,nx,ny)=>v+(ny>.55?-.2:0)+(hdH(x>>1,y>>1)<.1?.35:0)});for(const[a,c2]of[[9,cy-ht+6],[10,cy-ht+5],[11,cy-ht+5],[12,cy-ht+5]])hdSet(b,a,c2,hdC('#ffffff'));hdOutline(b,{1:hdC('#123050')});HDFS[fr]=hdCan(b)}}return HDFS[f]}
const _sl43=SLIMEHD;SLIMEHD=(n,tm)=>{if(n.vr!=='frost'||Math.abs(n.kx)+Math.abs(n.ky)>.8)return _sl43(n,tm);const x=Math.round(n.x),y=Math.round(n.y),f=Math.floor(tm*2.5+n.x)%2;
 g.fillStyle='rgba(150,210,255,.16)';g.beginPath();g.arc(x,y,12,0,6.283);g.fill();shd(x,y+5,15);const sp=hdFrost(f),w=sp.width/2,hh=sp.height/2,top=y+6.5-hh;g.drawImage(sp,x-w/2,top,w,hh);
 const e=top+(f?4.5:5.5),d=P.x>n.x?.5:-.5;g.fillStyle='#ffffff';for(const ex of[x-4.5,x+1.5])g.fillRect(ex,e,3,3.5);g.fillStyle='#1a3050';for(const ex of[x-4.5,x+1.5])g.fillRect(ex+1+d,e+1,1.5,2)};
// the roar's warning ring
const _dr43=drawRoom;drawRoom=function(tm){_dr43(tm);if(ROAR43&&SCENE&&ROAR43.n&&!ROAR43.n.dead){const n=ROAR43.n,k=Math.min(1,ROAR43.t/.7);g.strokeStyle='rgba(168,224,255,'+(.4+.5*k)+')';g.lineWidth=1.5;g.beginPath();g.ellipse(n.x,n.y-4,64*k,48*k,0,0,6.283);g.stroke();
  g.strokeStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(n.x,n.y-4,64,48,0,0,6.283);g.setLineDash([3,3]);g.stroke();g.setLineDash([])}};
// ice decor
const _df43=drawFurn;drawFurn=function(it,tm){const x0=it.x*16,y0=it.y*16;
 if(it.t==='icicle'){for(let k=0;k<3;k++){const ix=x0+3+k*5,ih=6+((it.x*3+k*7)%5);Rg(ix,y0-2,3,ih,'#e0f4ff');Rg(ix+1,y0-2,1,ih+2,'#ffffff');Rg(ix,y0-2,1,ih-1,'#a8d0f0')}return}
 if(it.t==='fpool'){g.fillStyle='#a8d0f0';g.beginPath();g.ellipse(x0+8,y0+9,9,5,0,0,6.283);g.fill();g.fillStyle='#d8f0ff';g.beginPath();g.ellipse(x0+6,y0+8,5,2.5,0,0,6.283);g.fill();g.fillStyle='#ffffff';g.fillRect(x0+4,y0+7,3,1);return}
 if(it.t==='crate'){shd(x0+8,y0+14,15);Rg(x0+1,y0,14,15,O);Rg(x0+2,y0+1,12,13,'#a87840');Rg(x0+2,y0+1,12,2,'#c89858');Rg(x0+2,y0+7,12,1,'#7a5228');Rg(x0+7,y0+1,1,13,'#7a5228');Rg(x0+1,y0-1,14,2,'#f4f8fc');return}
 if(it.t==='icepillar'){shd(x0+8,y0+15,16);Rg(x0+2,y0-18,12,33,O);Rg(x0+3,y0-17,10,31,'#9cc8ec');Rg(x0+4,y0-17,3,31,'#d8f0ff');Rg(x0+10,y0-17,2,31,'#6a9cc8');Rg(x0+1,y0-20,14,4,O);Rg(x0+2,y0-19,12,2,'#e8f8ff');return}
 _df43(it,tm)};
// saving: the Alpha's daily clear (older saves: never cleared)
const _sn43=snap;snap=function(){const s=_sn43();s.xdun={...EXTRA_DUNGEON_DAYS};return s};
const _ap43=applySave;applySave=function(S){_ap43(S);SLOW43=0;ROAR43=null;for(const k in EXTRA_DUNGEON_DAYS)EXTRA_DUNGEON_DAYS[k]=S.xdun&&isFinite(S.xdun[k])?+S.xdun[k]:-1};
const _ng43=newGame;newGame=function(){for(const k in EXTRA_DUNGEON_DAYS)EXTRA_DUNGEON_DAYS[k]=-1;_ng43()};
