// FOOD drain multiplier (v66 balance: FOOD lasts 4x longer). Scales passive, sprint, roll and overnight drain, and the perks that refund drain.
var FOOD_RATE=.25;
/* ============================================================
   SkillQuest
   Sections, in load order:
   1. Core      - canvas, world generation, player state, input, game loop
   2. Art       - GBA-style pixel tiles, objects, slimes, campfire, world renderer
   3. Character - Gen 3-style trainer sprite + character creator
   4. Skills    - XP curve, actions (hit/chop/mine), tool crafting, skills panel
   5. Village   - buildings, shopkeepers, shops, gold
   6. Systems   - saving (device + account), quests, armor/Defence, sound, roaming NPCs, goods
   7. Fishing & Smithing
   8. PC support + cross-device sync
   9. Chess
   10. Gen 3-style UI - START menu, map, quest log, HUD boxes, text box
   11. Building, inventory grid, equipment
   12. Interiors (shops, houses) and the 100-wood House
   13. Decorating houses (furniture) and A-button interaction
   14. Biomes, iron veins, wolves and skeletons, the Slime King's cave, desert trader, music
   15. Sprinting, damage numbers, hit feedback, low-HP alarm
   16. Farming
   17. Longer days (8 min daylight, 4 min night)
   18. GBA graphics pass: fences, fields, tall grass, night tint, lit windows
   19. Options screen (music / sound effects), farm layering, removing plots
   20. Saltmere: the port town, road and bridge, inn / tackle / forge, villagers' routines and daily requests
   21. Weather (rain, snow, haze, fireflies, gulls), dodge roll, bows + Archery (formerly Fletching), wolf lunges, bone throwers, the Bone Lord
   22. Usable stations: wardrobe, furnace, anvil, cooking stove, berry planter, training dummy
   23. Controller support (PS5 DualSense / standard gamepads)
   24. HUD layout pass (text box pages, MENU placement, touch buttons, compact help)
   25. Compact skills screen; R2 is always the sword on a controller
   26. Sailboat and the outer islets (Gull Rock, Wreck Isle, Hermit's Isle), rainbow fish, Castaway quest
   27. Crafting bench (crafts from your bag + every chest in the house)
   28. Gear: equip / unequip (main hand + off-hand), ranger and mage sets, elemental wands + Magic, action animations
   29. Wand ultimates (L1 + R1 / V): Inferno, Frost Nova, Thunderstorm
   30. Touch ULT button; controller status / button test on the Options screen; phone-friendly mappings
   31. Screens keep their scroll position when they refresh
   32. HD graphics overhaul (2 texels per pixel): baked terrain chunks with natural shores, shaded trees/rocks/bushes/cacti,
       redrawn trainer + NPCs, wolves, skeletons, Slime King, Bone Lord, campfire, buildings, tall grass, fences/walls, sideways gates
   33. Furnace, anvil and cooking stove use your bag + every chest in the house (like the crafting bench);
       the training dummy also trains Archery (arrows) and Magic (spells), new dummy art
   34. HD graphics part 2: furniture, room floors/walls, stations, lamps, well, signs, bridges, boats, wreck, hut,
       farm plots and crops, smoothed item icons
   35. Deep dungeons: three-floor Slime Caverns and Sunken Tomb (rebuilt daily), sleeping monsters, minimap,
       treasure chests with rarity loot (gems, Elixir of Life, Crystal blade, Bone bow), boss chests
   36. Skill trees: tap a skill to see every level's gains; perk choices every 10 levels (Magic first). Fletching -> Archery
   37. Combat skill trees: Attack, Defence, Archery, Tactics (+ chess insight: Tactics reveals the best move)
   38. Gathering skill trees: Woodcutting, Mining, Fishing, Foraging, Farming (+ Heartwood, Wild honey, Golden produce)
   39. Production skill trees: Cooking, Firemaking, Smithing, Crafting
   40. Save reliability: full change detection, newest save wins, instant saves on perks/quests and on close
   41. Frosthollow: the northern snow village (town registry + placement check, stone trail, 8 buildings, 5 townsfolk, shops, inn, daily requests)
   42. Village side quests (independent of the main line): A Winter's Fire, Broken Trail, Hungry Wolves, Heart of Frostfang
   43. Frostfang Den: three-floor ice cave, snow wolves, frost slimes, ice bats, the Frostfang Alpha, daily boss reward
   44. Dusthaven: the southern desert village (placement check, desert trail, 8 sandstone buildings, oasis + channel, 5 townsfolk, shops, inn,
       Excavator's Hall with furnace/anvil and a mining yard, daily requests) and its side quests
   45. Scorpion Hollow: three-floor sandstone dig, sand scorpions, dust skeletons, burrowing beetles, the Sandclaw Matriarch, daily boss reward
   46. Tidewatch: the western fishing village (coastal placement check, road west, pier + dock with boats, lighthouse, 8 blue-and-white buildings,
       5 townsfolk, shops, inn, Navigator's House with telescope, daily requests) and its side quests
   47. Drowned Grotto: offshore islet reached by boat, three-floor sea cave, tide slimes, reef crawlers, drowned guardians, the Tidekeeper
   48. Main chain grows to 25 quests (Northern Supplies, The Ranger's Warning, Desert Provisions, Across the Western Sea, Three Villages One Island),
       name-based remap for old saves, enemy-filtered kill quests; polish: crossroads sign, biome decor, dungeon themes, music fade-in, nails price
   49. Regions: world registry (towns/dungeons by region), save v2 migration, sailing routes from the Tidewatch pier
   50. Four new regions: Briarwood Isle, Ashfall Coast, Ironcrest Highlands, Shattered Expanse (seeded terrain, landmarks,
       resources, reserved sites for future towns/dungeons, arrival piers)
   51. Sailing and regional access: harbor posts (Tidewatch hub, Saltmere, Frosthollow), six voyage quests, Reinforced Hull,
       Deepwater Sail, Mountain Passage Chart, buoys and a cairn, permanent route unlocks
   52. World map and minimaps: HUD minimap on Hollow and every region, fog of war in the new regions (saved per region),
       HERE / WORLD map views with sea routes, harbor posts and discovered landmarks
   53. Regional enemy populations: day/night spawn tables per region, regional variants (Briar/Void wolves, Moss slimes,
       Cinder beetles, Ember/Rime skeletons), safe zones, caps, dawn crumble, regional bounty
   54. Terrain edges, cliffs and entrances (graphics polish)
   55. Gen 3 layered character kit: true 16x32 Gen 3 trainer built from recolored layers (skin, hair, clothes, every armor/ranger/mage piece)
   56. Gen 3 overworld: 1-texel terrain tiles with bumpy edges, cliff faces and shore foam; outlined trees, rocks, bushes, cacti; pixel shadows
   57. Gen 3 towns: buildings in every town, shop signs, fences/walls/gates, lamps, wells, signposts, bridges, boats, wreck, hut, tall grass, farm plots and crops
   58. Gen 3 sprites: every remaining HD sprite (enemies, bosses, stations, landmarks, rooms) pixelated to 1 texel with hard edges; slimes on whole pixels; crisp item icons; pixel harbor flags
   59. Gen 3 UI: stepped pixel frames for the HUD, bars, text box and every menu; octagon touch buttons; pixel sailing card
   60. Gen 3 polish: whole-pixel grid in the world, pixel circles, de-speckled rooms, darker-skin eyes, ranger hood side view
   66. Marlo's Emporium (Hollow Village): pets, capes, dyes, fine furniture, potions; Style screen in the START menu
   65. Mithril and adamant swords and armor (anvil); stats in every weapon, armor, tool and food description
   64. Fewer trees; Oak/Willow/Maple/Yew trees and Gold/Mithril/Adamant ores (+ bars); mining in dungeons; campfires on every island
   63. Mouse and touch aiming for bows and wands: cursor aim + right-click, BOW / CAST touch button (tap = nearest enemy, drag = aim)
   62. Controller pass: visible highlight in every menu, sticks wake the controller, text boxes let go of the keyboard
   61. Multiplayer (hosted copy only): Google sign-in, account saves in Firebase, other players with names overhead, Gen 3 chat,
       OG crowns, Emerald-style title screen (PRESS START, Continue / New Game, sign-in, Options)
   BOOT LOAD (end of file) - applies this device's save once, after every section is set up

   HOW IT FITS TOGETHER
   Each section extends earlier behavior by wrapping a function: const _x=f;f=function(){...;_x()}.
   The LAST wrapper runs FIRST, so later sections get the first say.
   - HIT (attack): 22 station / dummy -> 21 bow auto-shot (keyboard/touch only) -> 20 signs, bait -> 19 fill in
     plot -> 16 till / water / harvest -> 15 damage numbers -> 14 cave melee, ore, pine, cactus -> 13 A-button
     (talk, bed, chest, furniture, build-place) -> 12 indoor rules, hit house -> 11 hit structure -> 6 fishing ->
     5 sounds / regrowth -> core swing. Controller R1 bypasses this (shootAim), R2 / X tap the Space key.
   - Saving: snap() builds the save (each section adds its fields); applySave(S) restores it (each section
     restores and migrates its own fields: qv = quest-list version, see sections 6, 9, 14, 16, 20, 21).
     Device and account saves both go through applySave.
   - Drawing order (outdoors): ground tiles -> GROUNDHOOK (bridges, boats, fields, tall grass) -> objects,
     people, structures (y-sorted) -> buildings -> effects, lamps, signs -> tall grass over feet -> night tint
     -> drawHUD (weather, glows, crosshair, HUD boxes, text box).
   ============================================================ */
const cv=document.getElementById('c'),g=cv.getContext('2d');
let W,H,Z,D=1;
function rs(){D=window.devicePixelRatio||1;W=cv.width=innerWidth*D;H=cv.height=innerHeight*D;Z=Math.max(2,2*Math.round(D*Math.min(innerWidth,innerHeight)/300));g.imageSmoothingEnabled=false}
addEventListener('resize',rs);rs();
const HSC=2,N=110*HSC,T=16,SEED=421.7,DAYLEN=720,DAYLIGHT=480; // a day lasts 12 minutes: 8 of daylight, 4 of night
const h=(x,y)=>{const n=Math.sin(x*127.1+y*311.7+SEED)*43758.5453;return n-Math.floor(n)};
const vn=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return(h(xi,yi)*(1-u)+h(xi+1,yi)*u)*(1-v)+(h(xi,yi+1)*(1-u)+h(xi+1,yi+1)*u)*v};
const tile=new Uint8Array(N*N),obj=new Array(N*N);
for(let y=0;y<N;y++)for(let x=0;x<N;x++){
 const dx=(x-N/2)/(N/2),dy=(y-N/2)/(N/2);
 let e=vn(x/(14*HSC),y/(14*HSC))*.7+vn(x/(5*HSC),y/(5*HSC))*.3+(vn(x/4,y/4)-.5)*.06-(dx*dx+dy*dy)*.35
 const ed=Math.min(x,y,N-1-x,N-1-y);if(ed<18)e-=((18-ed)/18)**2*.7;   // open sea all around the edge of the map;
 let t=e<.28?0:e<.33?1:e<.62?2:3;tile[y*N+x]=t;
 const m=vn(x/(8*HSC)+50,y/(8*HSC)),r=h(x*3.1,y*7.3);
 if(t==2){if(r<(m>.55?.28:.03))obj[y*N+x]={t:'tree',hp:3};else if(r>.975)obj[y*N+x]={t:'bush',hp:1};else if(r>.965)obj[y*N+x]={t:'rock',hp:4}}
 if(t==3&&r<.1)obj[y*N+x]={t:'rock',hp:4};
}
// biomes: snowy north, desert south, iron veins in the mountains
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,t=tile[i];if(!t)continue;const r=h(x*5.3,y*2.9);
 if(y<(34+vn(x/(9*HSC),7)*8)*HSC){if(t===1||t===2)tile[i]=4;const o=obj[i];if(o&&o.t==='tree')obj[i]={t:'pine',hp:3};else if(o&&o.t==='bush')obj[i]=null;if(t===2&&!obj[i]&&r<.04)obj[i]={t:'pine',hp:3}}
 else if(y>(76-vn(x/(9*HSC),3)*8)*HSC){if(t===1||t===2)tile[i]=5;const o=obj[i];if(o&&o.t==='tree')obj[i]=r<.35?{t:'cactus',hp:2}:null;else if(o&&o.t==='bush')obj[i]=null;if(t===2&&!obj[i]&&r>.985)obj[i]={t:'cactus',hp:2}}
 const o2=obj[i];if(tile[i]===3){if(o2&&o2.t==='rock'&&r<.5)obj[i]={t:'ore',hp:5};else if(!o2&&r>.93)obj[i]={t:'ore',hp:5}}else if(o2&&o2.t==='rock'&&r<.3)obj[i]={t:'ore',hp:5}}
let solid=(px,py)=>{const x=Math.floor(px/T),y=Math.floor(py/T);if(x<0||y<0||x>=N||y>=N)return true;return tile[y*N+x]==0||!!obj[y*N+x]};
let P,en,fires,inv,time,dead,swing,hurt,msg,msgT,face,hunger,kills;
function reset(){
 let sx=N/2,sy=N/2;
 out:for(let r=0;r<40;r++)for(let a=-r;a<=r;a++)for(const [x,y] of [[sx+a,sy-r],[sx+a,sy+r],[sx-r,sy+a],[sx+r,sy+a]])
  if(tile[y*N+x]==2&&!obj[y*N+x]){sx=x;sy=y;break out}
 P={x:sx*T+8,y:sy*T+8,hp:6};en=[];fires=[];inv={wood:0,stone:0,berry:0,meat:0};time=0;dead=false;swing=0;hurt=0;face=[0,1];hunger=100;kills=0;say('Gather wood & stone. Build fire before dark!');
}
function say(s){msg=s;msgT=3}
reset();
// input
let jx=0,jy=0,jt=null,jo=null,jc=null;
cv.addEventListener('touchstart',e=>{e.preventDefault();if(dead&&time>1.5){reset();return}
 for(const t of e.changedTouches)if(jt===null&&t.clientX<innerWidth*.65){jt=t.identifier;jo={x:t.clientX,y:t.clientY};jc={x:t.clientX,y:t.clientY}}},{passive:false});
cv.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===jt){jc={x:t.clientX,y:t.clientY};let dx=jc.x-jo.x,dy=jc.y-jo.y,l=Math.hypot(dx,dy);if(l>40){jo.x=jc.x-dx/l*40;jo.y=jc.y-dy/l*40;dx=jc.x-jo.x;dy=jc.y-jo.y;l=40}
 jx=l>6?dx/40:0;jy=l>6?dy/40:0}},{passive:false});
const end=e=>{for(const t of e.changedTouches)if(t.identifier===jt){jt=null;jx=jy=0;jo=null}};
cv.addEventListener('touchend',end);cv.addEventListener('touchcancel',end);
const K={};addEventListener('keydown',e=>{const kk=e.key.toLowerCase();K[kk]=1;if(kk==' ')attack();if(kk=='e')eat();if(kk=='f')fire()});addEventListener('keyup',e=>K[e.key.toLowerCase()]=0);
function front(d){return[P.x+face[0]*d,P.y+face[1]*d]}
// loop
let last=performance.now();
function dark(){const p=time%DAYLEN;return p<DAYLIGHT?0:Math.sin(Math.PI*(p-DAYLIGHT)/(DAYLEN-DAYLIGHT))}
function nearFire(x,y,r){return fires.some(f=>Math.hypot(f.x-x,f.y-y)<r)}
function upd(dt){
 time+=dt;msgT-=dt;if(dead)return;
 let ix=jx+(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0),iy=jy+(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0);
 const l=Math.hypot(ix,iy);if(l>.05){if(l>1){ix/=l;iy/=l}
  const sp=(swing>0?35:55)*(isSprint()?1.7:1)*dt;
  if(Math.abs(ix)>Math.abs(iy))face=[Math.sign(ix),0];else face=[0,Math.sign(iy)];
  const nx=P.x+ix*sp,ny=P.y+iy*sp;
  const ok=(x,y)=>!(solid(x-5,y-3)||solid(x+5,y-3)||solid(x-5,y+6)||solid(x+5,y+6));
  if(ok(nx,P.y))P.x=nx;if(ok(P.x,ny))P.y=ny}
 swing=Math.max(0,swing-dt);hurt=Math.max(0,hurt-dt);
 hunger-=dt*.9*FOOD_RATE;if(hunger<=0){hunger=0;if(Math.random()<dt*.6){P.hp--;hurt=.4;say('Starving!')}}
 if(nearFire(P.x,P.y,50)&&hunger>0&&Math.random()<dt*.25)P.hp=Math.min(6,P.hp+1);
 for(const f of fires)f.life-=dt;fires=fires.filter(f=>f.life>0);
 const dk=dark();
 if(dk>.3&&en.length<4&&Math.random()<dt*.3){const a=Math.random()*6.28,d=110+Math.random()*40,x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;if(!solid(x,y)&&!nearFire(x,y,70))en.push({x,y,hp:3,kx:0,ky:0})}
 for(const n of en){
  let dx=P.x-n.x,dy=P.y-n.y,d=Math.hypot(dx,dy)||1;
  if(dk<.05){n.hp-=dt*.5;if(n.hp<=0)n.dead=1}
  if(nearFire(n.x,n.y,45)){n.hp-=dt;if(n.hp<=0)n.dead=1}
  const fl=nearFire(n.x,n.y,70);const s=(fl?-1:1)*(d<130?24:6)*dt;
  let mx=dx/d*s+n.kx,my=dy/d*s+n.ky;n.kx*=.8;n.ky*=.8;
  if(!solid(n.x+mx,n.y))n.x+=mx;if(!solid(n.x,n.y+my))n.y+=my;
  if(d<10&&hurt<=0&&!(ROLLT>0)&&!(n.frozen>0)){P.hp--;hurt=1;say('Ouch!')}
 }
 en=en.filter(n=>!n.dead&&Math.hypot(n.x-P.x,n.y-P.y)<260);
 if(P.hp<=0){dead=true;time=0;en=[]}
}
// the camera: centred on you, to the nearest screen pixel (not the nearest world pixel) so the world scrolls smoothly;
// a whole number of world pixels from the screen's left/top edge to you, so you never jump back and forth
function camX(){return Math.round(P.x*Z)/Z-Math.floor(W/Z/2)}function camY(){return Math.round(P.y*Z)/Z-Math.floor(H/Z/2)}
function draw(){
 g.setTransform(1,0,0,1,0,0);g.fillStyle='#0b1220';g.fillRect(0,0,W,H);
 const vw=W/Z,vh=H/Z,cx=camX(),cy=camY();
 g.setTransform(Z,0,0,Z,-Math.round(cx*Z),-Math.round(cy*Z));
 const x0=Math.max(0,Math.floor(cx/T)),y0=Math.max(0,Math.floor(cy/T)),x1=Math.min(N-1,Math.ceil((cx+vw)/T)),y1=Math.min(N-1,Math.ceil((cy+vh)/T));
 const tm=performance.now()/1000;NEWDRAW(cx,cy,x0,y0,x1,y1,vw,vh,tm);
 // darkness
 g.setTransform(1,0,0,1,0,0);const dk=dark();
 if(dk>0){// the night: darker everywhere except around you when your Flame Aura is lit
  const AU=window.SQAURALIT&&SQAURALIT(),nightFill=(rgb,a)=>{if(!AU){g.fillStyle='rgba('+rgb+','+a+')';return}const sx=(P.x-cx)*Z,sy=(P.y-4-cy)*Z,r=AU*Z,gr=g.createRadialGradient(sx,sy,r*.35,sx,sy,r);
   gr.addColorStop(0,'rgba('+rgb+','+(a*.08)+')');gr.addColorStop(.6,'rgba('+rgb+','+(a*.45)+')');gr.addColorStop(1,'rgba('+rgb+','+a+')');g.fillStyle=gr};
  g.globalCompositeOperation='multiply';nightFill('60,70,160',dk*.7);g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';nightFill('6,8,30',dk*.2);g.fillRect(0,0,W,H);
  g.globalCompositeOperation='lighter';for(const f of fires){const sx=(f.x-cx)*Z,sy=(f.y-cy)*Z,r=48*(typeof fireLR==='function'?fireLR():1)*Z,gr=g.createRadialGradient(sx,sy,0,sx,sy,r);gr.addColorStop(0,'rgba(255,150,40,'+(.45*dk)+')');gr.addColorStop(1,'rgba(255,150,40,0)');g.fillStyle=gr;g.fillRect(sx-r,sy-r,r*2,r*2)}
  g.globalCompositeOperation='source-over'}
 {const vg=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=vg;g.fillRect(0,0,W,H);if(dk>0&&dk<.55){g.fillStyle='rgba(255,130,50,'+(.14*(1-dk/.55))+')';g.fillRect(0,0,W,H)}}
 drawHUD(); // Gen 3-style HUD, section 10
 if(jo){g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=2*U;g.beginPath();g.arc(jo.x*D,jo.y*D,40*D,0,6.28);g.stroke();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(jc.x*D,jc.y*D,18*D,0,6.28);g.fill()}
 if(dead)drawDead();
}
let loopErr=0;function loop(n){const dt=Math.max(0,Math.min(.05,(n-last)/1000));last=n;try{upd(dt);draw()}catch(e){if(loopErr++<5)console.error(e)}requestAnimationFrame(loop)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{last=performance.now();requestAnimationFrame(loop)});else requestAnimationFrame(loop);
