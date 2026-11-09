// ---------------------------------------------------------------- 53. Regional enemy populations
// Each region has a day table and a night table built from creatures the game already knows how to fight
// (wolves, slimes, bats, skeletons, scorpions, beetles, reef crawlers, drowned guardians), plus four regional
// variants with their own look: Briar wolves (Briarwood, hunt in pairs), Moss slimes, Cinder beetles and Ember
// skeletons (Ashfall), Rime skeletons (Ironcrest), Void wolves (Shattered). Day and night:
//   * By day a region has a small population of living creatures (the ones that don't fear the sun).
//   * At night the undead and slimes rise too and the population grows; at sunrise they crumble away like on Hollow.
// Populations are counted only around the player (the simulated area); the spec's per-region maximum is a hard
// ceiling, and the day/night caps below sit well under it so fights stay readable. Spawns stay off the screen,
// on open reachable ground, away from the arrival pier, landmarks and reserved sites, and away from obstacles.
// Nothing about Hollow Island's enemies changes.
const RG_FAUNA={
 briarwood:{tier:1,cap:{day:4,night:7},xp:1.2,
  day:[['wolf:briar',9,1]],night:[['slime:moss',7,.4],['wolf:briar',9,.75],['bat',7,1]],pack:{'wolf:briar':2}},
 ashfall:{tier:2,cap:{day:5,night:8},xp:1.6,
  day:[['scorp',14,.55],['beetle:cinder',18,1]],night:[['skel:ember',16,.45],['skel:dust',14,.7],['beetle:cinder',18,1]]},
 ironcrest:{tier:3,cap:{day:5,night:9},xp:2,
  day:[['wolf:snow',16,.6],['slime:frost',16,1]],night:[['wolf:snow',16,.35],['bat',12,.6],['skel:rime',20,1]],pack:{'wolf:snow':3},extra:1},
 shattered:{tier:4,cap:{day:6,night:10},xp:2.5,
  day:[['crab',24,.4],['guard',30,.65],['wolf:void',24,1]],night:[['slime:tide',18,.3],['bat',16,.5],['guard',30,.72],['wolf:void',24,1]],extra:1}};
const RG_NIGHTONLY=new Set(['slime','skel','bat']);
// build one creature (reusing the existing makers so the existing AI drives it)
function rgMake(key,hp,x,y){const[t,v]=key.split(':');let n;
 if(t==='bat')n=mkBat(x,y);else if(t==='scorp')n=mkScorp(x,y);else if(t==='beetle')n=mkBeetle(x,y);else if(t==='crab')n=mkCrawler(x,y);else if(t==='guard')n=mkGuardian(x,y);
 else if(t==='wolf')n=v==='snow'?mkSnowWolf(x,y):{x,y,hp:5,kx:0,ky:0,type:'wolf'};
 else if(t==='slime')n=v==='frost'?mkFrostSlime(x,y):v==='tide'?mkTideSlime(x,y):{x,y,hp:3,kx:0,ky:0,type:'slime'};
 else if(t==='skel')n=v==='dust'?mkDustSkel(x,y):{x,y,hp:6,kx:0,ky:0,type:'skel',tcd:1+Math.random()*2};
 else n={x,y,hp:3,kx:0,ky:0,type:'slime'};
 n.hp=hp;n.mhp=hp;n.rk=key;if(v&&!n.vr)n.rv=v;else if(v==='cinder')n.rv=v;if(RG_NIGHTONLY.has(t))n.night=1;return n}
// kept for anything that still asks section 49's helper for a creature
rgMob=function(reg,x,y){const F=RG_FAUNA[reg];if(!F)return{x,y,hp:3,kx:0,ky:0,type:'slime'};const L=F.day,r=Math.random(),e=L.find(q=>r<q[2])||L[L.length-1];return rgMake(e[0],e[1],x,y)};
const rgIsNight=()=>rgRealDark()>.3;
let RG53_UPD=false;
function rgRealDark(){const s=RG53_UPD;RG53_UPD=false;try{return dark()}finally{RG53_UPD=s}}
// while a region updates, the shared enemy loop must not melt regional creatures in daylight (we handle dawn ourselves)
const _dk53=dark;dark=function(){const v=_dk53();if(RG53_UPD){const R=SCENE&&SCENE.room;if(R&&R.region)return Math.max(v,.06)}return v};
function rgSpotOK(R,tx,ty,coast){if(tx<2||ty<2||tx>=R.w-2||ty>=R.h-2)return false;const i=ty*R.w+tx;if(!R.reach[i]||R.solid.has(i))return false;
 // no obstacle under the creature's body (it is wider than a point)
 const x=tx*16+8,y=ty*16+8;if(solid(x-6,y-4)||solid(x+6,y-4)||solid(x-6,y+6)||solid(x+6,y+6))return false;
 if(rgQuiet(R,tx,ty))return false;if(coast){let w=false;for(let b=-3;b<=3&&!w;b++)for(let a=-3;a<=3;a++)if(R.tiles[(ty+b)*R.w+tx+a]===0){w=true;break}if(!w)return false}return true}
let RG_SPT2=0;
rgUpd=function(R,dt){rgTick(R,dt);const F=RG_FAUNA[R.region];if(!F)return;const night=rgIsNight(),hard=(REGION_SPAWNS[R.region]||{maxEnemies:10}).maxEnemies,
 cap=Math.min(hard,night?F.cap.night:F.cap.day),dkx=(R.dock[0]+.5)*16,dky=(R.dock[1]+.5)*16;
 // anything we didn't place (Hollow's night spawner) doesn't belong here
 for(const n of en)if(!RG_OWN.has(n)){RG_OWN.add(n);if(n.type!=='boss')n.dead=1}
 // sunrise: the undead crumble and slimes dry up
 if(!night)for(const n of en)if(n.night&&!n.dead){n.hp-=dt*Math.max(.8,(n.mhp||6)/5);if(n.hp<=0){n.dead=1;n.dropped=1}}
 // the arrival pier is a safe zone: creatures that wander close turn back
 for(const n of en){if(n.dead)continue;const dd=Math.hypot(n.x-dkx,n.y-dky);if(dd<72&&!n.summon){const l=dd||1;stepTo(n,(n.x-dkx)/l*40*dt,(n.y-dky)/l*40*dt)}}
 let alive=en.filter(n=>!n.dead);if(alive.length>cap){for(const n of alive.slice(cap))n.dead=1,n.dropped=1;alive=alive.slice(0,cap)}
 if((RG_SPT2-=dt)>0||alive.length>=cap)return;RG_SPT2=night?3.2:6;
 const L=night?F.night:F.day,r=Math.random(),e=L.find(q=>r<q[2])||L[L.length-1],key=e[0],coast=key==='crab';
 for(let k=0;k<16;k++){const a=Math.random()*6.283,d=180+Math.random()*60,x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d,tx=Math.floor(x/16),ty=Math.floor(y/16);
  if(!rgSpotOK(R,tx,ty,coast)||Math.hypot(tx*16+8-dkx,ty*16+8-dky)<112)continue;
  const size=Math.min((F.pack&&F.pack[key])||1,cap-alive.length);
  for(let j=0;j<size;j++){const ox=j?((j&1?1:-1)*20):0,oy=j?((j>1?1:-1)*14):0,X=tx*16+8+ox,Y=ty*16+8+oy;if(j&&!rgSpotOK(R,Math.floor(X/16),Math.floor(Y/16),coast))continue;
   const n=rgMake(key,e[1],X,Y);n.rg=R.region;RG_OWN.add(n);en.push(n)}break}};
// heavier hits from the toughest lands (Ironcrest and the Shattered Expanse): +1 on a creature's touch
const _u53=upd;upd=function(dt){const R=SCENE&&SCENE.room,reg=R&&R.region,hp0=P.hp,h0=hurt;RG53_UPD=!!reg;try{_u53(dt)}finally{RG53_UPD=false}
 if(!reg||dead||menuOpen||pnOpen)return;const F=RG_FAUNA[reg];if(F&&F.extra&&h0<=0&&hurt>0&&P.hp<hp0&&en.some(n=>!n.dead&&n.rg===reg&&Math.hypot(n.x-P.x,n.y-P.y)<16))PEND43+=F.extra};
// regional bounty: a little more XP and gold the further out you go
const _ed53=enemyDrop;enemyDrop=function(n){_ed53(n);const F=n.rg&&RG_FAUNA[n.rg];if(!F)return;GLD+=F.tier*2+Math.floor(Math.random()*(F.tier*2));addXp(0,Math.round(10*F.xp));
 if(n.rv==='cinder'&&Math.random()<.35){inv.iron=(inv.iron|0)+1;say('+1 iron ore (from the cinder beetle\'s shell)')}};
// --- the regional variants' look (drawn over the base sprite) ---
const _pS53=pS;pS=function(n,tm){_pS53(n,tm);if(!n.rv)return;const x=Math.round(n.x),y=Math.round(n.y),fl=Math.floor(tm*6+x)%2;
 if(n.rv==='briar'){for(const[a,b,c]of[[-6,-6,'#2f6a34'],[-2,-8,'#4a8a3a'],[2,-7,'#2f6a34'],[5,-5,'#6aa848'],[-4,-3,'#4a8a3a']])Rg(x+a,y+b,2,2,c);Rg(x-7,y-9,1,2,'#c8e070');Rg(x+3,y-10,1,2,'#c8e070')}
 else if(n.rv==='moss'){Rg(x-5,y-9,10,2,'#3f7f44');Rg(x-3,y-11,3,2,'#56ac46');Rg(x+1,y-12,3,3,'#7ab060');Rg(x-6,y-7,2,1,'#2d6236')}
 else if(n.rv==='cinder'||n.rv==='ember'){g.fillStyle='rgba(255,120,30,'+(.18+.1*Math.sin(tm*5+x))+')';g.beginPath();g.arc(x,y-4,12,0,6.283);g.fill();
  for(let k=0;k<3;k++){const ph=(tm*.8+k*.33+x*.01)%1;Rg(x-6+k*6,y-6-ph*14,1,1,ph<.5?'#ffd060':'#f06020')}if(n.rv==='ember'){Rg(x-2,y-11,2,2,'#ff7020');Rg(x+1,y-11,2,2,'#ff7020')}}
 else if(n.rv==='rime'){Rg(x-4,y-14,8,2,'#d8f0ff');Rg(x-5,y-6,2,6,'#a8d8ff');Rg(x+3,y-6,2,6,'#a8d8ff');g.fillStyle='rgba(160,220,255,.15)';g.beginPath();g.arc(x,y-5,11,0,6.283);g.fill()}
 else if(n.rv==='void'){g.fillStyle='rgba(150,90,230,'+(.16+.1*Math.sin(tm*3+x))+')';g.beginPath();g.arc(x,y-3,14,0,6.283);g.fill();if(fl)Rg(x+(P.x<n.x?-6:5),y-7,2,1,'#e0b0ff')}};
