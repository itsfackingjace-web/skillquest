// ---------------------------------------------------------------- 80. World bosses: Flame Wisp, Giant, Demon, Dragon
// Every 30 minutes (on the shared clock) a world boss appears for 20 minutes. Which boss, and where its lair is, comes
// from the clock too, so every player's game agrees without a server:
//   Flame Wisp (Hollow Island or Briarwood) · Stone Giant (Ironcrest) · Demon (the Shattered Isles) · Ancient Dragon (Ashfall)
// Its attacks follow fixed patterns on the shared clock (telegraphed circles, shockwave rings, beams), so everyone sees the
// same fight. Hit it with anything: the damage you do is posted to wb/<slot>/d/<uid>, and its health is its max minus
// everyone's damage. When it falls, everyone who hit it gets loot (the top three damage dealers get a bonus) and a kill
// on the Bosses leaderboard. Chat announces each boss, and a banner shows where it is, time left and its health.
const WB={slot:-1,b:null,dmg:0,pub:0,pubAt:0,all:{},unsub:null,ent:null,lair:null,lairKey:'',told:-1,fell:-1,claimed:{},kills:0,hitBuf:0,last:-1};
const WB_SLOT=30*60*1000,WB_LIFE=20*60*1000;
const WBT={
 wisp:{n:'Flame Wisp',ic:'🔥',hp:700,per:7000,dmg:1,col:'#f88830',c2:'#f8e060',where:['hollow','briarwood'],pats:['rain','ring','rain'],gold:[150,300]},
 giant:{n:'Stone Giant',ic:'⛰',hp:1600,per:7000,dmg:2,col:'#a08060',c2:'#d8c8a8',where:['ironcrest'],pats:['ring','rocks','ring'],gold:[300,600]},
 demon:{n:'Demon',ic:'😈',hp:2300,per:6500,dmg:2,col:'#a040e0',c2:'#f070f8',where:['shattered'],pats:['beams','pools','ring'],gold:[500,900]},
 dragon:{n:'Ancient Dragon',ic:'🐉',hp:3200,per:6000,dmg:2,col:'#f05020',c2:'#f8c040',where:['ashfall'],pats:['meteors','breath','ring'],gold:[800,1500]}};
for(const k in WBT)WBT[k].hp=Math.round(WBT[k].hp*2);// world bosses: twice the HP (Nov 9)
window.SQWBT=WBT;const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
function wbFor(slot){const r=rng(slot*7919+17),p=r();let type=p<.35?'wisp':p<.6?'giant':p<.8?'demon':'dragon';const F=window.SQWBFORCE;if(F&&F.type)type=F.type;const T=WBT[type];let where=T.where[Math.floor(r()*T.where.length)];if(F&&F.where)where=F.where;
 if(F&&F.dev)return{slot,type,T,where,start:F.start,end:F.start+WB_LIFE,mhp:F.hp||T.hp,dev:1};
 return{slot,type,T,where,start:slot*WB_SLOT,end:slot*WB_SLOT+(F?WB_SLOT:WB_LIFE),mhp:F&&F.hp?F.hp:T.hp}}
const wbLoc=b=>b.where==='hollow'?'hollow':'r:'+b.where;
const wbWhere=b=>b.where==='hollow'?'Hollow Island':(WORLD_REGIONS[b.where]?WORLD_REGIONS[b.where].name:b.where);
// the lair: a big open patch of land, found the same way in every game (terrain only)
function wbLair(b){const key=b.slot+':'+b.where;if(WB.lairKey===key)return WB.lair;let found=null;if(b.dev&&window.SQWBFORCE&&SQWBFORCE.at){if(curRegion()!==b.where)return null;WB.lair=SQWBFORCE.at;WB.lairKey=key;return WB.lair}
 if(b.where==='hollow'){if(SCENE)return null;const r=rng(b.slot*31+5);for(let k=0;k<500&&!found;k++){const x=14+Math.floor(r()*(N-28)),y=14+Math.floor(r()*(N-28));
   if(Math.hypot(x-VX,y-VY)<26)continue;let ok=true;for(let dy=-5;dy<=4&&ok;dy++)for(let dx=-5;dx<=5;dx++){const i=(y+dy)*N+x+dx;if(tile[i]===0||inVillage(x+dx,y+dy)||(typeof PROT!=='undefined'&&PROT.has(i))||BS.has(i)){ok=false;break}}if(ok)found={x:x*16+8,y:y*16+8}}}
 else{const R=SCENE&&SCENE.room;if(!R||R.region!==b.where)return null;const r=rng(b.slot*31+9),sp=R.spawn||[R.w/2,R.h/2];
  for(let k=0;k<800&&!found;k++){const x=8+Math.floor(r()*(R.w-16)),y=8+Math.floor(r()*(R.h-16)),d=Math.hypot(x-sp[0],y-sp[1]);if(d<22||d>95)continue;let ok=true;
   for(let dy=-3;dy<=3&&ok;dy++)for(let dx=-3;dx<=3;dx++){if(R.tiles[(y+dy)*R.w+x+dx]===0){ok=false;break}}if(ok)found={x:x*16+8,y:y*16+8}}}
 WB.lair=found;WB.lairKey=found?key:'';return found}
// where it is right now, and the attacks it's making (pure functions of the shared clock)
const wbNow=()=>MP.on?mpNow():Date.now();
function wbPos(b,L,t){const s=(t-b.start)/1000;return{x:L.x+Math.cos(s*.21)*28+Math.sin(s*.53)*8,y:L.y+Math.sin(s*.29)*16}}
function wbAttacks(b,L,t){const T=b.T,per=T.per,c=Math.floor((t-b.start)/per),out=[];for(const cc of[c-1,c]){if(cc<0)continue;const t0=b.start+cc*per,hit=t0+1600,pat=T.pats[cc%T.pats.length],r=rng(b.slot*1009+cc*97),bp=wbPos(b,L,hit);
  if(pat==='rain'||pat==='rocks'||pat==='meteors'||pat==='pools'){const n={rain:5,rocks:7,meteors:9,pools:9}[pat],rad={rain:22,rocks:26,meteors:24,pools:18}[pat];
   for(let i=0;i<n;i++){const a=r()*6.283,d=30+r()*140;out.push({k:'c',x:bp.x+Math.cos(a)*d,y:bp.y+Math.sin(a)*d*.8,r:rad,t0,hit,id:cc+'c'+i,pat})}}
  else if(pat==='ring')out.push({k:'r',x:bp.x,y:bp.y,t0,hit,id:cc+'r',pat});
  else if(pat==='beams'||pat==='breath'){const n=pat==='beams'?6:3,a0=r()*6.283,spread=pat==='beams'?6.283/n:.55;for(let i=0;i<n;i++)out.push({k:'b',x:bp.x,y:bp.y-10,a:a0+i*spread,len:pat==='beams'?170:190,w:pat==='beams'?16:30,t0,hit,id:cc+'b'+i,pat})}}
 return out}
// ---- which boss is up ----
function wbTick(){if(!MP.on||!FB||!MP.user)return;const now=wbNow(),F=window.SQWBFORCE,slot=F&&F.dev?F.slot:Math.floor(now/WB_SLOT),b=wbFor(slot);
 if(slot!==WB.slot){WB.slot=slot;WB.dmg=0;WB.pub=0;WB.all={};WB.lair=null;WB.lairKey='';if(WB.unsub){WB.unsub();WB.unsub=null}
  WB.unsub=FB.db.onValue(FB.db.ref(FB.D,'wb/'+slot+'/d'),s=>{WB.all=s.val()||{};if(MP.user&&typeof WB.all[MP.user.uid]==='number')WB.dmg=Math.max(WB.dmg,WB.all[MP.user.uid])})}
 WB.b=now<b.end?b:null;const B=WB.b;
 if(B&&WB.told!==slot){WB.told=slot;mpLog('game','WORLD BOSS! '+B.T.n+' has appeared on '+wbWhere(B)+'. It leaves in '+Math.max(1,Math.round((B.end-now)/60000))+' minute'+(Math.round((B.end-now)/60000)>1?'s':'')+'.');try{sfx('quest')}catch(e){}if(!MP.open){MP.unread++;mpRBtn()}}
 // post my damage (once a second while it changes)
 if(WB.dmg>WB.pub&&performance.now()-WB.pubAt>1000){WB.pubAt=performance.now();WB.pub=WB.dmg;FB.db.set(FB.db.ref(FB.D,'wb/'+slot+'/d/'+MP.user.uid),Math.round(WB.dmg)).catch(e=>{WB.pub=0;mpErr(e)})}
 // it fell: share out the loot
 if(B&&wbHp(B)<=0&&WB.fell!==slot){WB.fell=slot;wbLoot(B)}}
function wbHp(b){let s=0;for(const u in WB.all)s+=Math.max(0,+WB.all[u]||0);if(MP.user)s+=Math.max(0,WB.dmg-(+WB.all[MP.user.uid]||0));return Math.max(0,b.mhp-s)}
function wbLoot(b){const me=MP.user&&MP.user.uid,mine=WB.dmg;mpLog('game','The '+b.T.n+' has been defeated!');if(!(mine>=1)||WB.claimed[b.slot])return;WB.claimed[b.slot]=1;
 const rank=Object.entries(Object.assign({},WB.all,{[me]:mine})).sort((a,c)=>c[1]-a[1]).findIndex(e=>e[0]===me)+1,top=rank>0&&rank<=3,r=Math.random;
 const T=b.T,g=Math.round((T.gold[0]+r()*(T.gold[1]-T.gold[0]))*(top?1.6:1)),got={};const add=(k,n)=>{if(n>0&&INAME[k]){inv[k]=(inv[k]|0)+n;got[k]=(got[k]|0)+n}};
 if(b.type==='wisp'){add('oaklog',3+Math.floor(r()*4));add('pot_heal',1+(r()<.5?1:0));if(r()<.35)add(r()<.5?'ruby':'sapphire',1);
  // the rare one: the Flame Crown (5% for everyone who fought, 8% for the top three)
  if(r()<(top?.08:.05)||window.SQFCDROP){add('eq_fcrown',1);setTimeout(()=>{say('A FLAME CROWN! Wear it and your campfires call a little flame wisp.');try{sfx('level')}catch(e){}},400)}}
 else if(b.type==='giant'){add(r()<.5?'mbar':'mithore',3+Math.floor(r()*3));add('pot_str',1);if(r()<.4)add(r()<.6?'emerald':'diamond',1);
  // the rare one: a Castle (5% for everyone who fought, 8% for the top three)
  if(r()<(top?.08:.05)||window.SQCASTLEDROP){add('castle',1);setTimeout(()=>{say('A CASTLE! Place it from your Bag like a house: monsters keep away from its torches.');try{sfx('level')}catch(e){}},400)}}
 else if(b.type==='demon'){add('abar',2+Math.floor(r()*2));add(['ruby','sapphire','emerald'][Math.floor(r()*3)],1+Math.floor(r()*2));if(r()<.12)add('elixir',1);
  // the rare one: an Imp pet (5% for everyone who fought, 8% for the top three)
  if((r()<(top?.08:.05)||window.SQIMPDROP)&&window.LUX&&LUX.giveImp){const had=LUX.COS&&LUX.COS.pets.includes('imp');LUX.giveImp();setTimeout(()=>{say(had?'Another imp bows to you... you already have one.':'AN IMP PET! It follows you and stabs whatever hurts you.');try{sfx('level')}catch(e){}},400)}}
 else{add('abar',3+Math.floor(r()*3));add('diamond',1+(r()<.4?1:0));add('yewlog',4);if(r()<.2)add('elixir',1);
  // the rare one: 5% for everyone who fought, 8% for the top three
  if(r()<(top?.08:.05)||window.SQDSOULDROP){add('ja_dsoul',1);setTimeout(()=>{say('A DRAGONSOUL AMULET! The dragon\'s spirit is yours.');try{sfx('level')}catch(e){}},400)}}
 if(top)add(['ruby','sapphire','emerald','diamond'][Math.min(3,Math.floor(r()*4))],1);
 GLD+=g;if(!b.dev)WB.kills++;const list=Object.keys(got).map(k=>got[k]+' × '+INAME[k].toLowerCase()).concat([g+' gold']).join(', ');
 say((top?'#'+rank+' damage! ':'')+'Boss loot: '+list+'.');msgT=6;mpLog('game','Your share'+(top?' (#'+rank+' damage)':'')+': '+list+'.');try{sfx('quest');setTimeout(()=>sfx('coin'),200)}catch(e){}
 try{saveLocal(true);saveCloud(true)}catch(e){}}
setInterval(()=>{try{wbTick()}catch(e){console.warn(e)}},500);
// ---- the boss in the world ----
// It joins the monster list as a big enemy so every attack (sword, arrows, spells, ultimates) can hit it. Its own
// health stays huge locally; each frame the damage you dealt is counted and the health is topped back up.
const WB_BIG=1e6;
function wbHere(){const B=WB.b;if(!B||wbHp(B)<=0||!MP.on)return null;if(mpLoc()!==wbLoc(B))return null;if(B.where!=='hollow'&&!(SCENE&&SCENE.room&&SCENE.room.region===B.where))return null;if(B.where==='hollow'&&SCENE)return null;
 const L=wbLair(B);return L?{B,L}:null}
{const _u=upd;upd=function(dt){const H=wbHere(),e=WB.ent;
  if(e&&!H){const j=en.indexOf(e);if(j>=0)en.splice(j,1);WB.ent=null}
  if(H){const now=wbNow(),p=wbPos(H.B,H.L,now);let n=WB.ent;if(!n||n._slot!==H.B.slot||n._wb!==H.B.type){if(n){const j=en.indexOf(n);if(j>=0)en.splice(j,1)}n=WB.ent={x:p.x,y:p.y,hp:WB_BIG,mhp:WB_BIG,kx:0,ky:0,type:'wb',big:1,_wb:H.B.type,_slot:H.B.slot}}
   if(en.indexOf(n)<0)en.unshift(n);n.dead=0;n.dropped=1}
  _u(dt);
  const n=WB.ent;if(n&&H){const lost=WB_BIG-n.hp;if(lost>=.5&&!dead){WB.dmg+=Math.min(60,lost);WB.hitAt=performance.now()}n.hp=WB_BIG;n.dead=0;n.burn=0;n.slow=0;n.frozen=0;
   const p=wbPos(H.B,H.L,wbNow());n.x=p.x;n.y=p.y;n.kx=n.ky=0;if(en.indexOf(n)<0)en.unshift(n);wbStrike(H)}}}
// the attacks land on you
const WBHIT={};
function wbStrike(H){if(dead||pnOpen||menuOpen)return;const now=wbNow(),T=H.B.T;
 for(const a of wbAttacks(H.B,H.L,now)){if(WBHIT[a.id+':'+H.B.slot])continue;let hit=false;
  if(a.k==='c'){if(now>=a.hit&&now<a.hit+150)hit=Math.hypot(P.x-a.x,P.y-a.y)<a.r}
  else if(a.k==='r'){if(now>=a.hit&&now<a.hit+1100){const rr=16+(now-a.hit)/1000*160,d=Math.hypot(P.x-a.x,(P.y-a.y)*1.25);hit=Math.abs(d-rr)<9}}
  else if(a.k==='b'){if(now>=a.hit&&now<a.hit+250){const dx=P.x-a.x,dy=P.y-a.y,al=dx*Math.cos(a.a)+dy*Math.sin(a.a),pe=Math.abs(-dx*Math.sin(a.a)+dy*Math.cos(a.a));hit=al>0&&al<a.len&&pe<a.w/2}}
  if(!hit)continue;WBHIT[a.id+':'+H.B.slot]=1;if(ROLLT>0)continue;
  if(Math.random()<blockCh()*.5){hurt=Math.max(hurt,.5);say('Blocked!');sfx('block');continue}hurtP(T.dmg,{wisp:'Scorched by the Flame Wisp!',giant:'The Giant crushes you!',demon:'Demonfire burns you!',dragon:'The Dragon\'s fire hits you!'}[H.B.type])}}
// telegraphs: red circles that fill up before they land, the shockwave ring, the beams
function wbDrawAttacks(H,tm){const now=wbNow(),T=H.B.T;g.save();
 for(const a of wbAttacks(H.B,H.L,now)){const pre=(now-a.t0)/(a.hit-a.t0);if(now<a.t0)continue;
  if(a.k==='c'){if(now<a.hit){g.globalAlpha=.25+.25*pre;g.fillStyle='#e02020';g.beginPath();g.ellipse(a.x,a.y,a.r,a.r*.8,0,0,6.283);g.fill();g.globalAlpha=.6;g.fillStyle=T.col;g.beginPath();g.ellipse(a.x,a.y,a.r*pre,a.r*.8*pre,0,0,6.283);g.fill()}
   else if(now<a.hit+400){const k=(now-a.hit)/400;g.globalAlpha=1-k;g.fillStyle=T.c2;g.beginPath();g.ellipse(a.x,a.y,a.r*(1+k*.3),a.r*.8*(1+k*.3),0,0,6.283);g.fill()}}
  else if(a.k==='r'){if(now<a.hit){g.globalAlpha=.35*pre;g.strokeStyle='#e02020';g.lineWidth=3;g.beginPath();g.ellipse(a.x,a.y,30*pre+10,(30*pre+10)*.8,0,0,6.283);g.stroke()}
   else if(now<a.hit+1100){const rr=16+(now-a.hit)/1000*160;g.globalAlpha=Math.max(0,1-(now-a.hit)/1100);g.strokeStyle=T.c2;g.lineWidth=7;g.beginPath();g.ellipse(a.x,a.y,rr,rr*.8,0,0,6.283);g.stroke();g.strokeStyle=T.col;g.lineWidth=3;g.stroke()}}
  else if(a.k==='b'){g.save();g.translate(a.x,a.y);g.rotate(a.a);if(now<a.hit){g.globalAlpha=.2+.3*pre;g.fillStyle='#e02020';g.fillRect(0,-a.w/2,a.len,a.w)}
   else if(now<a.hit+350){g.globalAlpha=1-(now-a.hit)/350;g.fillStyle=T.col;g.fillRect(0,-a.w/2,a.len,a.w);g.fillStyle=T.c2;g.fillRect(0,-a.w/4,a.len,a.w/2)}g.restore()}}
 g.restore()}
// drawn over the world, under the HUD
{const _dh=drawHUD;drawHUD=function(){const HB=wbHere();if(HB&&!menuOpen){const cx=camX(),cy=camY();g.save();g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);try{wbDrawAttacks(HB,performance.now()/1000)}catch(e){}g.restore()}_dh()}}
// ---- the four bosses ----
function wbEll(cx,cy,rx,ry,col){g.fillStyle=col;for(let y=-ry;y<=ry;y++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))));g.fillRect(Math.round(cx-w),Math.round(cy+y),w*2,1)}}
function wbEllO(cx,cy,rx,ry,col){wbEll(cx,cy,rx+1,ry+1,O);wbEll(cx,cy,rx,ry,col)}
function wbTri(pts,col){g.fillStyle=col;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))g.lineTo(p[0],p[1]);g.closePath();g.fill()}
function drawWB(n,tm){const x=Math.round(n.x),y=Math.round(n.y),t=n._wb,fl=Math.floor(tm*8)%2,hit=WB.hitAt&&performance.now()-WB.hitAt<120;shd(x,y+8,t==='dragon'?60:t==='giant'?44:36);g.save();if(hit)g.globalAlpha=.75;
 if(t==='wisp'){const b=Math.round(Math.sin(tm*3)*3),yy=y-22+b;for(let k=0;k<5;k++){const a=tm*2+k*1.256,ox=Math.round(Math.cos(a)*24),oy=Math.round(Math.sin(a)*12);wbEllO(x+ox,yy+oy,3,3,k%2?'#f8e060':'#f88830')}
  for(let k=0;k<6;k++){const h=10+((k*7+Math.floor(tm*10))%6)*2,ox=(k-2.5)*5;wbTri([[x+ox-4,yy-4],[x+ox+4,yy-4],[x+ox+(fl?1:-1),yy-12-h]],k%2?'#f8e060':'#f88830')}
  wbEllO(x,yy,14,12,'#f88830');wbEll(x,yy+2,10,8,'#f8c040');wbEll(x,yy+3,6,5,'#fff0b0');g.fillStyle=O;g.fillRect(x-6,yy-2,3,4);g.fillRect(x+3,yy-2,3,4);g.fillRect(x-3,yy+5,6,2)}
 else if(t==='giant'){const st=Math.round(Math.sin(tm*2)*1.5),S='#a08060',D='#706048',L='#c8b090';
  g.fillStyle=O;g.fillRect(x-15,y-8+st,12,16);g.fillRect(x+3,y-8-st,12,16);g.fillStyle=D;g.fillRect(x-14,y-7+st,10,14);g.fillRect(x+4,y-7-st,10,14);
  wbEllO(x,y-26,22,20,S);wbEll(x-4,y-30,12,10,L);wbEllO(x,y-50,11,10,S);g.fillStyle='#f8e060';g.fillRect(x-6,y-52,4,3);g.fillRect(x+2,y-52,4,3);g.fillStyle=O;g.fillRect(x-4,y-45,8,2);
  // arms and a stone club
  wbEllO(x-26,y-24,7,14,S);wbEllO(x+26,y-26,7,13,S);g.fillStyle=O;g.fillRect(x+27,y-62,10,40);g.fillStyle='#8a6a48';g.fillRect(x+28,y-61,8,38);wbEllO(x+32,y-64,9,8,'#888898');for(const[a,b]of[[-10,-34],[8,-20],[-2,-12]]){g.fillStyle=D;g.fillRect(x+a,y+b,4,3)}}
 else if(t==='demon'){const b=Math.round(Math.sin(tm*2.4)*2),P1='#5a2080',P2='#8a38b8',E='#f8f040';
  wbTri([[x-14,y-40+b],[x-34,y-60+b-(fl?4:0)],[x-36,y-24+b],[x-20,y-20+b]],O);wbTri([[x-15,y-38+b],[x-32,y-56+b-(fl?4:0)],[x-33,y-26+b],[x-20,y-22+b]],'#3a1050');
  wbTri([[x+14,y-40+b],[x+34,y-60+b-(fl?4:0)],[x+36,y-24+b],[x+20,y-20+b]],O);wbTri([[x+15,y-38+b],[x+32,y-56+b-(fl?4:0)],[x+33,y-26+b],[x+20,y-22+b]],'#3a1050');
  g.fillStyle=O;g.fillRect(x-11,y-8,8,16);g.fillRect(x+3,y-8,8,16);g.fillStyle=P1;g.fillRect(x-10,y-7,6,14);g.fillRect(x+4,y-7,6,14);
  wbEllO(x,y-24+b,17,18,P2);wbEll(x,y-20+b,10,10,P1);wbEllO(x,y-46+b,10,9,P2);
  wbTri([[x-8,y-52+b],[x-14,y-66+b],[x-4,y-54+b]],'#e8e0d0');wbTri([[x+8,y-52+b],[x+14,y-66+b],[x+4,y-54+b]],'#e8e0d0');g.fillStyle=E;g.fillRect(x-6,y-48+b,4,3);g.fillRect(x+2,y-48+b,4,3);
  for(const s2 of[-1,1]){const hx=x+s2*22,hy=y-22+b;wbEllO(hx,hy,5,5,P2);wbTri([[hx-4,hy-4],[hx+4,hy-4],[hx+(fl?1:-1),hy-14]],'#f070f8');wbTri([[hx-2,hy-4],[hx+2,hy-4],[hx,hy-10]],'#fff0ff')}}
 else{const b=Math.round(Math.sin(tm*1.8)*2),R='#c83020',R2='#e85030',Y='#f8c040',w=fl?-6:6;
  // wings
  wbTri([[x-10,y-30+b],[x-58,y-60+b+w],[x-50,y-22+b],[x-20,y-16+b]],O);wbTri([[x-11,y-29+b],[x-55,y-57+b+w],[x-48,y-24+b],[x-20,y-18+b]],'#8a1810');
  wbTri([[x+10,y-30+b],[x+58,y-60+b+w],[x+50,y-22+b],[x+20,y-16+b]],O);wbTri([[x+11,y-29+b],[x+55,y-57+b+w],[x+48,y-24+b],[x+20,y-18+b]],'#8a1810');
  // tail
  for(let k=0;k<8;k++){const tx=x+20+k*5,ty=y-6+Math.round(Math.sin(tm*3+k*.7)*3);wbEllO(tx,ty,6-k*.5,4-k*.3,R)}wbTri([[x+58,y-10],[x+68,y-14],[x+62,y-2]],Y);
  // body, legs, neck, head
  g.fillStyle=O;g.fillRect(x-18,y-6,10,14);g.fillRect(x+8,y-6,10,14);g.fillStyle=R;g.fillRect(x-17,y-5,8,12);g.fillRect(x+9,y-5,8,12);
  wbEllO(x,y-18+b,24,16,R);wbEll(x,y-12+b,16,8,Y);for(let k=0;k<5;k++)wbEllO(x-20-k*3,y-30-k*5+b,7,6,R);
  wbEllO(x-38,y-56+b,13,9,R2);wbEll(x-46,y-52+b,7,4,R2);g.fillStyle='#f8f040';g.fillRect(x-42,y-60+b,4,3);g.fillStyle=O;g.fillRect(x-52,y-54+b,2,2);
  wbTri([[x-32,y-62+b],[x-26,y-74+b],[x-28,y-61+b]],'#e8e0d0');wbTri([[x-38,y-64+b],[x-36,y-76+b],[x-34,y-63+b]],'#e8e0d0');
  for(let k=0;k<5;k++)wbTri([[x-12+k*6,y-32+b],[x-9+k*6,y-40+b],[x-6+k*6,y-32+b]],Y);
  if(Math.floor(tm*2)%5===0){for(let k=0;k<6;k++){const a=3.6+Math.random()*.5,d=8+Math.random()*16;g.fillStyle=k%2?'#f8e060':'#f88830';g.fillRect(Math.round(x-52+Math.cos(a)*d),Math.round(y-52+b+Math.sin(a)*d),3,3)}}}
 g.restore()}
{const _ps=pS;pS=function(n,tm){if(n&&n._wb)return drawWB(n,tm);return _ps(n,tm)}}
// the shared-monster system leaves it alone (everyone has their own copy)
// ---- banner: what, where, how long, and its health when you're there ----
{const st=document.createElement('style');st.textContent=`#wbb{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 6px);z-index:9;display:none;width:min(340px,calc(100vw - 24px));box-sizing:border-box;padding:6px 10px 8px;font:700 13px ${PF};pointer-events:none;text-align:center;background:#2a1418!important;color:#f8e8d8!important;border-color:#702018!important;box-shadow:inset 0 0 0 2px #c04030!important}
#wbb .t{display:flex;justify-content:space-between;gap:8px}#wbb .t b{color:#f8c040}#wbb .bar{height:9px;margin-top:5px;background:#100808;border:2px solid #000;position:relative}#wbb .bar i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(#f86048,#b82018)}#wbb small{display:block;font-weight:500;font-size:11px;opacity:.85;margin-top:3px}
#wbb.nar{padding:4px 7px 5px;font-size:10px;line-height:1.2}#wbb.mini{padding:3px 7px 4px;font-size:10px;line-height:1.1;opacity:.9;white-space:nowrap}#wbb.mini .bar{display:inline-block;vertical-align:middle;width:44px;height:5px;margin:0 0 0 6px}#wbb.nar .bar{height:6px;margin-top:3px}#wbb.nar small{font-size:9px;margin-top:2px}`;document.head.appendChild(st)}
const wbbEl=el('div','wbb','g3','');document.body.appendChild(wbbEl);
setInterval(()=>{const B=WB.b,show=B&&MP.on&&!dead&&!pnOpen&&!menuOpen&&!TS.open&&wbHp(B)>0;wbbEl.style.display=show?'block':'none';if(!show)return;
 const left=Math.max(0,B.end-wbNow()),mm=Math.floor(left/60000)+':'+String(Math.floor(left/1000)%60).padStart(2,'0'),H2=wbHere(),hp=wbHp(B);let sub='';
 if(H2){const d=Math.hypot(H2.L.x-P.x,H2.L.y-P.y);if(d>260){const a=Math.atan2(H2.L.y-P.y,H2.L.x-P.x),dir=['east','south-east','south','south-west','west','north-west','north','north-east'][(Math.round(a/(Math.PI/4))+8)%8];sub='Its lair is '+Math.round(d/16)+' steps to the '+dir+'.'}
  else sub='Your damage: '+Math.round(WB.dmg)+' · Dodge the red!'}else sub='On '+wbWhere(B)+(B.where!=='hollow'&&typeof routeOpen==='function'&&!routeOpen(B.where)?' (route not charted yet)':'');
 // on phones it's only a small chip (icon, time left, health) until you're at the fight; the full banner then
 const mini=(innerWidth<700||!isPC)&&!(H2&&Math.hypot(H2.L.x-P.x,H2.L.y-P.y)<=260);wbbEl.classList.toggle('mini',mini);
 wbbEl.innerHTML=mini?'<span>'+esc(B.T.ic)+' '+mm+'</span><div class="bar"><i style="width:'+(hp/B.mhp*100).toFixed(1)+'%"></i></div>':'<div class="t"><span>'+esc(B.T.ic+' '+B.T.n.toUpperCase())+'</span><b>'+mm+'</b></div><div class="bar"><i style="width:'+(hp/B.mhp*100).toFixed(1)+'%"></i></div><small>'+esc(sub)+' · '+Math.ceil(hp)+' / '+B.mhp+'</small>';
 // on narrow screens it would cover your health: sit under the left-hand HUD instead
 if(innerWidth<700&&HUDL){const d=window.devicePixelRatio||1;wbbEl.style.left=Math.round(HUDL.ins/d)+'px';wbbEl.style.transform='none';wbbEl.style.top=Math.round(HUDL.stackBottom/d+6)+'px';wbbEl.style.width=mini?'auto':Math.round(HUDL.bw/d)+'px';wbbEl.classList.add('nar')}else{wbbEl.style.left=wbbEl.style.transform=wbbEl.style.top=wbbEl.style.width='';wbbEl.classList.remove('nar')}
 // a message box you need to read (a sign, a door, someone talking) wins: the banner steps aside while it's up
 try{if(msgT>0&&msg&&MSGBOX){const r=wbbEl.getBoundingClientRect(),m=MSGBOX;if(r.left<m.x+m.w&&r.right>m.x&&r.top<m.y+m.h&&r.bottom>m.y)wbbEl.style.display='none'}}catch(e){}},150);
// ---- saving, and the leaderboard ----
{const _s=snap;snap=function(){const s=_s();if(WB.kills)s.wbk=WB.kills;const c=Object.keys(WB.claimed).slice(-20);if(c.length)s.wbc=c;return s}}
{const _a=applySave;applySave=function(S){_a(S);WB.kills=Math.max(0,+(S&&S.wbk)||0);WB.claimed={};if(S&&Array.isArray(S.wbc))for(const k of S.wbc)WB.claimed[k]=1}}
window.SQWB=WB;
