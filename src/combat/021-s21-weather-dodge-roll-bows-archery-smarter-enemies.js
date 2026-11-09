// ---------------------------------------------------------------- 21. Weather, dodge roll, bows + Archery, smarter enemies, the Bone Lord
// Weather: passing rain showers (they water your crops), snowfall in the north, heat haze in the desert,
// fireflies on summer nights and gulls over Saltmere.
// Combat: a dodge roll (R / ROLL), bows and arrows (HIT shoots at enemies in front of you that are out of sword
// reach), wolves that crouch and lunge, skeletons that throw bones, and the Bone Lord in a desert tomb.
// --- weather ---
let RAINV=0,SNOWV=0,HAZEV=0,rainTip=false,rainWasOn=false;
const WSEG=150;                                   // weather can change every 2.5 minutes
const rainingNow=()=>{const seg=Math.floor(time/WSEG);return seg>1&&hsh(seg,77)%100<26};
function biomeHere(){if(SCENE)return'in';const x=Math.floor(P.x/16),y=Math.floor(P.y/16);let s=0,d=0;for(let dy=-4;dy<=4;dy+=2)for(let dx=-5;dx<=5;dx+=2){const t=tile[(y+dy)*N+x+dx];if(t===4)s++;else if(t===5)d++}return s>=10?'snow':d>=10?'desert':'grass'}
let rainSrc=null,rainGain=null;
function rainAudio(){const a=ACX;if(!a||a.state!=='running')return;if(!rainSrc){try{const b=a.createBuffer(1,a.sampleRate*2,a.sampleRate),c=b.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=Math.random()*2-1;
  rainSrc=a.createBufferSource();rainSrc.buffer=b;rainSrc.loop=true;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=1400;rainGain=a.createGain();rainGain.gain.value=0;rainSrc.connect(f);f.connect(rainGain);rainGain.connect(a.destination);rainSrc.start()}catch(e){rainSrc=1;return}}
 if(rainGain&&rainGain.gain)rainGain.gain.value=MUTE?0:RAINV*(SCENE&&!(SCENE.room&&SCENE.room.region)?.012:.035)*SFXV}
// --- combat state ---
SKN.push('Archery');AB.push('ARCH');SKC.push('#c8a060');while(XPS.length<SKN.length)XPS.push(0);const FL=SKN.length-1;
TL.bow=0;let ROLLT=0,ROLLCD=0,ROLLV=[0,0];const PROJ=[],GHOST=[];
INVK.push('arrow','iarrow');EXTRA_BAG.push('arrow','iarrow');Object.assign(INAME,{arrow:'Arrows',iarrow:'Iron arrows',bow:'Bow'});
Object.assign(IDESC,{arrow:'Wooden arrows with stone tips. With a bow, HIT shoots at enemies in front of you that are out of sword reach.',iarrow:'Iron-tipped arrows. They hit harder than plain ones and are used first.'});
Object.assign(SELLP,{arrow:1,iarrow:3});Object.assign(SN,{arrow:'Arrows',iarrow:'Iron arrows'});

Object.assign(SFX,{roll:()=>{noise(.12,.07,1800);tone(300,.08,'triangle',.03,-120)},bow:()=>{tone(1200,.05,'square',.03,-700);noise(.06,.05,3000)},thud:()=>{noise(.06,.1,900);tone(180,.06,'square',.04,-60)},
 throwb:()=>{tone(500,.07,'triangle',.03,300)},growl:()=>{tone(110,.25,'sawtooth',.04,-30)},roar:()=>{tone(90,.6,'sawtooth',.07,-40);noise(.4,.08,400)}});
// --- dodge roll ---
function roll(){if(dead||menuOpen||pnOpen||chessOpen||ROLLCD>0||FISH)return;if(BUILD)return;
 let ix=jx+(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0),iy=jy+(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0);const l=Math.hypot(ix,iy);
 if(l<.2){ix=face[0];iy=face[1]}else{ix/=l;iy/=l}ROLLV=[ix,iy];ROLLT=.28;ROLLCD=.6;hunger=Math.max(0,hunger-1.2*FOOD_RATE);sfx('roll')}
const rlb=document.createElement('div');rlb.className='b';rlb.id='rl';rlb.innerHTML='ROLL'+(isPC?'<small>R</small>':'');rlb.style.cssText='width:52px;height:52px;right:178px;bottom:calc(env(safe-area-inset-bottom,0px) + 96px);font-size:12px';document.body.appendChild(rlb);
rlb.addEventListener('touchstart',e=>{e.preventDefault();roll()},{passive:false});rlb.addEventListener('click',()=>roll());
addEventListener('keydown',e=>{const k=(e.key||'').toLowerCase();if(k==='r'&&!e.repeat){const tg=e.target;if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'))return;roll()}});
hp.innerHTML=hp.innerHTML.replace('Shift: sprint','Shift: sprint · R: dodge roll');
// --- bows ---
function bowRange(){return TL.bow>=2?175:125}
function arrowDmg(){return 2+(TL.bow>=2?1:0)+((inv.iarrow|0)>0?1:0)+Math.floor(lvOf(FL)/25)}
function bowTarget(){if(!TL.bow||((inv.arrow|0)+(inv.iarrow|0))<1)return null;const sc=curScene();let best=null,bd=1e9;
 for(const n of en){if(n.dead)continue;const dx=n.x-P.x,dy=n.y-P.y,al=dx*face[0]+dy*face[1],pe=Math.abs(dx*face[1]-dy*face[0]),big=n.type==='boss'||n.type==='bonelord'||n.big;
  if(al>(big?24:17)&&al<bowRange()&&pe<(big?26:15)&&al<bd){bd=al;best=n}}return best}
function shoot(){const ia=(inv.iarrow|0)>0;if(ia)inv.iarrow--;else inv.arrow--;swing=.35;if(typeof BOWT!=='undefined'){BOWT=.35;BOWD=[face[0],face[1]]}sfx('bow');
 PROJ.push({x:P.x+face[0]*8,y:P.y-2+face[1]*6,vx:face[0]*270,vy:face[1]*270,t:0,life:bowRange()/270,k:'arrow',dmg:arrowDmg(),sc:curScene(),iron:ia});
 if(((inv.arrow|0)+(inv.iarrow|0))===0)say('That was your last arrow!')}
const projBlocked=(x,y)=>{if(SCENE)return solid(x,y);const tx=Math.floor(x/16),ty=Math.floor(y/16);if(tx<0||ty<0||tx>=N||ty>=N)return true;const i=ty*N+tx;return tile[i]!==0&&solid(x,y)&&!FARM.has(i)};
function killEnemy(n,how){if(n.dead)return;n.dead=1;n.dropped=1;kills++;GLD+=2+Math.floor(Math.random()*5);if(how==='arrow')addXp(FL,14);else addXp(0,12);
 if(n.type!=='boss'&&n.type!=='bonelord'&&Math.random()<.6)inv.meat=(inv.meat|0)+1;enemyDrop(n)}
// --- the Bone Lord's tomb ---
let TOMB=null,TOMB_DAY=-1;
{let best=null,bd=1e9;for(let y=72*HSC;y<N-6;y++)for(let x=8;x<70*HSC;x++){let ok=true;for(let dy=-3;dy<=2&&ok;dy++)for(let dx=-3;dx<=3;dx++){const i=(y+dy)*N+x+dx;if(tile[i]!==5||obj[i]||BS.has(i)||PROT.has(i)){ok=false;break}}
  if(!ok||(TRADER&&Math.hypot(TRADER.x-x,TRADER.y-y)<12*HSC))continue;const d=Math.hypot(x-36*HSC,y-86*HSC);if(d<bd){bd=d;best={x,y}}}TOMB=best}
if(TOMB){for(const[dx,dy]of[[-1,0],[1,0],[-1,-1],[0,-1],[1,-1],[-1,-2],[0,-2],[1,-2]]){const i=(TOMB.y+dy)*N+TOMB.x+dx;BS.add(i);PROT.add(i);obj[i]=null}PROT.add(TOMB.y*N+TOMB.x);PROT.add((TOMB.y+1)*N+TOMB.x)}
ROOMS.tomb={w:18,h:12,ex:9,cave:1,tomb:1,floor:['#c8a870','#bc9c64'],wall:'#9a7848',trim:'#5a4020',items:[[3,3,'pillar'],[14,3,'pillar'],[3,8,'pillar'],[14,8,'pillar'],[8,2,'urn'],[9,2,'urn'],[1,10,'urn'],[16,10,'urn'],[6,5,'bones'],[12,7,'bones']].map(([x,y,t])=>({t,x,y,solid:t!=='bones'}))};
ROOMS.tomb.solid=new Set(ROOMS.tomb.items.filter(it=>it.solid).map(it=>it.y*18+it.x));
const _en21=entrances;entrances=function(){const a=_en21();if(TOMB)a.push({x:TOMB.x,y:TOMB.y,id:'tomb',house:null});return a};
const _es21=enterScene;enterScene=function(id,house,ret){_es21(id,house,ret);if(id!=='tomb')return;const day=Math.floor(time/DAYLEN);
 for(const[x,y]of[[4,5],[13,5],[6,9],[11,9]])en.push({x:x*16+8,y:y*16+8,hp:6,kx:0,ky:0,type:'skel',tcd:1+Math.random()*2});
 if(TOMB_DAY!==day){en.push({x:9*16,y:4*16,hp:45,kx:0,ky:0,type:'bonelord',tcd:2,scd:7});say('The Bone Lord stirs in the dark... Defeat it for treasure!');setTimeout(()=>sfx('roar'),300)}
 else say('The Bone Lord is dust... for today. Come back tomorrow.')};
const _df21=drawFurn;drawFurn=function(it,tm){const x0=it.x*16,y0=it.y*16;
 if(it.t==='pillar'){shd(x0+8,y0+14,16);Rg(x0+1,y0-14,14,30,O);Rg(x0+2,y0-13,12,28,'#d8bc84');Rg(x0+2,y0-13,12,3,'#ecd6a4');Rg(x0+2,y0+11,12,4,'#a88858');for(const xx of[x0+5,x0+9])Rg(xx,y0-10,1,20,'#b89c68');return}
 if(it.t==='urn'){shd(x0+8,y0+14,12);Rg(x0+3,y0,10,15,O);Rg(x0+4,y0+1,8,13,'#b86838');Rg(x0+4,y0+5,8,2,'#3a6ab0');Rg(x0+5,y0-2,6,3,O);Rg(x0+6,y0-1,4,2,'#9a5028');return}
 if(it.t==='bones'){Rg(x0+2,y0+8,9,2,'#f0ece0');Rg(x0+1,y0+7,2,2,'#f0ece0');Rg(x0+10,y0+9,2,2,'#f0ece0');Rg(x0+6,y0+4,5,4,'#f0ece0');Rg(x0+7,y0+5,1,1,O);Rg(x0+9,y0+5,1,1,O);return}
 _df21(it,tm)};
const _dk21=dark;dark=function(){return SCENE&&SCENE.room.tomb&&!INDRAW?.2:_dk21()};
function drawBoneLord(n,tm){const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.6,b=hit?'#ffd0d0':'#f0ece0',r=n.cast>0?'#b040e0':'#6838a0',st=Math.floor(tm*4)%2;shd(x,y+8,26);
 pp([[-8,-30,16,14,b],[-10,-16,20,18,r],[-14,-14,4,12,b],[10,-14,4,12,b],[-6+(st?0:1),2,4,6,b],[2-(st?0:1),2,4,6,b]],x,y,false);
 Rg(x-5,y-25,3,3,O);Rg(x+2,y-25,3,3,O);if(Math.sin(tm*6)>0){Rg(x-4,y-24,1,1,'#f04030');Rg(x+3,y-24,1,1,'#f04030')}Rg(x-3,y-20,6,1,O);Rg(x-2,y-19,1,1,O);Rg(x+1,y-19,1,1,O);
 Rg(x-9,y-36,18,6,O);Rg(x-8,y-35,16,4,GD);for(const a of[-8,-2,4])Rg(x+a,y-39,3,4,GD);Rg(x-1,y-34,2,2,'#e03030');Rg(x-10,y-12,20,2,'#4a2878');
 Rg(x-16,y-46,32,4,O);Rg(x-15,y-45,Math.max(0,30*n.hp/45),2,'#a050e0')}
const _pS21=pS;pS=function(n,tm){if(n.type==='bonelord')return drawBoneLord(n,tm);_pS21(n,tm);if(n.type==='wolf'&&n.ls==='prep'&&Math.floor(tm*10)%2){const x=Math.round(n.x),y=Math.round(n.y);Rg(x-1,y-20,2,5,O);Rg(x-1,y-14,2,2,O);Rg(x,y-19,1,3,'#f84030');Rg(x,y-13,1,1,'#f84030')}};
const _ed21=enemyDrop;enemyDrop=function(n){if(n.type!=='bonelord')return _ed21(n);TOMB_DAY=Math.floor(time/DAYLEN);GLD+=250;inv.sbar=(inv.sbar|0)+3;inv.iarrow=(inv.iarrow|0)+10;addXp(0,500);addXp(8,300);
 if(Q.on&&QS[Q.i]&&QS[Q.i].type==='bonelord')Q.k++;for(const o of en)if(o!==n&&!o.dead)o.dead=1;
 say('The Bone Lord crumbles! +250 gold, 3 steel bars, 10 iron arrows');msgT=5;sfx('quest');saveLocal(true);saveCloud(true)};
// --- update: roll, projectiles, enemy behaviors, weather ---
let wTick=0;
const _u21=upd;upd=function(dt){const paused=menuOpen||pnOpen;const pos=paused?null:en.map(n=>[n,n.x,n.y]);_u21(dt);if(paused)return;
 ROLLCD=Math.max(0,ROLLCD-dt);
 if(ROLLT>0&&!dead){ROLLT-=dt;const s=165*dt,ok=(x,y)=>!(solid(x-5,y-3)||solid(x+5,y-3)||solid(x-5,y+6)||solid(x+5,y+6));const nx=P.x+ROLLV[0]*s,ny=P.y+ROLLV[1]*s;if(ok(nx,P.y))P.x=nx;if(ok(P.x,ny))P.y=ny;
  if(Math.abs(ROLLV[0])>Math.abs(ROLLV[1]))face=[Math.sign(ROLLV[0]),0];else if(ROLLV[1])face=[0,Math.sign(ROLLV[1])];
  GHOST.push({x:P.x,y:P.y,t:0,sc:curScene()});if(Math.random()<.6)DUST.push({x:P.x+(Math.random()*8-4),y:P.y+6,t:0,c:dustColor(),sc:curScene()})}
 for(const gh of GHOST)gh.t+=dt;while(GHOST.length&&GHOST[0].t>.18)GHOST.shift();
 const sc=curScene();
 // enemies
 for(const[n,ox,oy]of pos){if(n.dead||n.frozen>0)continue;const dx=P.x-n.x,dy=P.y-n.y,d=Math.hypot(dx,dy)||1;
  if(n.type==='wolf'){n.lcd=(n.lcd||0)-dt;
   if(n.ls==='prep'){n.x=ox;n.y=oy;if((n.lt-=dt)<=0){n.ls='go';n.lt=.28;const l=Math.hypot(n.px-n.x,n.py-n.y)||1;n.vx=(n.px-n.x)/l*175;n.vy=(n.py-n.y)/l*175}}
   else if(n.ls==='go'){const mx=n.vx*dt,my=n.vy*dt;if(!solid(n.x+mx,n.y))n.x+=mx;if(!solid(n.x,n.y+my))n.y+=my;if((n.lt-=dt)<=0){n.ls=null;n.lcd=2.2+Math.random()}}
   else if(d<60&&d>16&&n.lcd<=0&&!nearFire(n.x,n.y,70)){n.ls='prep';n.lt=.4;n.px=P.x;n.py=P.y;n.x=ox;n.y=oy;sfx('growl')}}
  else if(n.type==='skel'){n.tcd=(n.tcd==null?1+Math.random()*2:n.tcd)-dt;
   if(n.tcd<=0&&d>30&&d<140){n.tcd=2.6+Math.random()*1.4;PROJ.push({x:n.x,y:n.y-6,vx:dx/d*95,vy:dy/d*95,t:0,life:1.8,k:'bone',sc,hostile:1});sfx('throwb')}}
  else if(n.type==='bonelord'){n.tcd-=dt;n.scd-=dt;n.cast=Math.max(0,(n.cast||0)-dt);
   if(n.tcd<=0){n.tcd=2.3;n.cast=.4;const a0=Math.atan2(dy,dx);for(const da of[-.35,0,.35])PROJ.push({x:n.x,y:n.y-14,vx:Math.cos(a0+da)*100,vy:Math.sin(a0+da)*100,t:0,life:2.2,k:'bone',sc,hostile:1});sfx('throwb')}
   if(n.scd<=0){n.scd=9;if(en.filter(o=>!o.dead&&o.type==='skel').length<4){for(const sx of[-28,28])en.push({x:n.x+sx,y:n.y+10,hp:6,kx:0,ky:0,type:'skel',tcd:2});say('The Bone Lord summons skeletons!');sfx('roar')}}
   if(d<20&&hurt<=0&&ROLLT<=0){P.hp-=1;hurt=1;say('The Bone Lord strikes!');sfx('hurt')}}}
 // projectiles
 for(const p of PROJ){if(p.sc!==sc){p.dead=1;continue}p.t+=dt;const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;if(p.t>p.life||projBlocked(nx,ny+4)){p.dead=1;if(p.k==='arrow')sfx('thud');continue}p.x=nx;p.y=ny;
  if(p.hostile){if(!dead&&Math.hypot(P.x-p.x,P.y-2-p.y)<9){p.dead=1;if(ROLLT>0){p.dead=0;continue}
    if(hurt>0)continue;if(Math.random()<blockCh()){hurt=.5;say('Blocked!');sfx('block');addXp(8,10)}else{P.hp--;hurt=1;say('Hit by a flying bone!');FLASH=.3}}}
  else for(const n of en){if(n.dead)continue;const big=n.type==='boss'||n.type==='bonelord'||n.big;if(Math.hypot(n.x-p.x,(n.y-(big?10:4))-p.y)<(big?18:10)){p.dead=1;n.hp-=p.dmg;const l=Math.hypot(p.vx,p.vy)||1;if(!big){n.kx=p.vx/l*4;n.ky=p.vy/l*4}else{n.kx=p.vx/l;n.ky=p.vy/l}
    DMGS.push({x:n.x,y:n.y-(big?30:14),v:String(p.dmg),t:0,c:'#ffffff',sc});addXp(FL,3*p.dmg);sfx('hit');if(n.hp<=0)killEnemy(n,'arrow');break}}}
 for(let i=PROJ.length-1;i>=0;i--)if(PROJ[i].dead)PROJ.splice(i,1);
 // weather
 const bm=biomeHere(),wet=rainingNow();
 RAINV+=((wet&&bm!=='desert'&&bm!=='snow'?1:0)-RAINV)*Math.min(1,dt*.35);SNOWV+=((bm==='snow'?(wet?1:.4):0)-SNOWV)*Math.min(1,dt*.5);HAZEV+=((bm==='desert'&&dark()<.2?1:0)-HAZEV)*Math.min(1,dt*.5);
 if((wTick+=dt)>1){wTick=0;rainAudio();
  if(wet){if(FARM.size){for(const p of FARM.values())p.w=Math.max(p.w,CLK+90);if(!rainTip&&!rainWasOn){rainTip=true;say('It\'s raining! Your crops are getting watered.')}}}rainWasOn=wet}};
// --- HIT: shoot when an enemy is in front and out of sword reach ---
const _atk21=attack;attack=function(){if(!(typeof GPON!=='undefined'&&GPON)&&!dead&&!menuOpen&&!pnOpen&&!BUILD&&!FISH&&swing<=0&&!(SCENE&&!SCENE.room.cave)&&!facingNpc()){const t=bowTarget();if(t){shoot();return}}_atk21()};  // with a controller, R1 is the bow and R2 is always the sword
// --- drawing ---
function drawProj(p){const x=Math.round(p.x),y=Math.round(p.y);
 if(p.k==='arrow'){const l=Math.hypot(p.vx,p.vy)||1,ux=p.vx/l,uy=p.vy/l,hd=p.iron?'#c8d0dc':'#9898a8';shd(x,y+9,6);
  for(let i=2;i<11;i++)Rg(Math.round(p.x-ux*i),Math.round(p.y-uy*i),1,1,'#8a5a30');for(let i=10;i<13;i++){Rg(Math.round(p.x-ux*i-uy),Math.round(p.y-uy*i+ux),1,1,'#f0f0f0');Rg(Math.round(p.x-ux*i+uy),Math.round(p.y-uy*i-ux),1,1,'#f0f0f0')}
  Rg(x-1,y-1,3,3,O);Rg(x,y,1,1,hd);Rg(Math.round(p.x-ux),Math.round(p.y-uy),1,1,hd)}
 else{const a=Math.floor(p.t*12)%2;shd(x,y+10,6);if(a){Rg(x-4,y-1,8,2,O);Rg(x-3,y-1,6,1,'#f0ece0');Rg(x-5,y-2,2,3,'#f0ece0');Rg(x+3,y-2,2,3,'#f0ece0')}else{Rg(x-1,y-4,2,8,O);Rg(x-1,y-3,1,6,'#f0ece0');Rg(x-2,y-5,3,2,'#f0ece0');Rg(x-2,y+3,3,2,'#f0ece0')}}}
function drawCombatFx(tm){const sc=curScene();for(const gh of GHOST){if(gh.sc!==sc)continue;const ox=P.x,oy=P.y;g.globalAlpha=.25*(1-gh.t/.18);P.x=gh.x;P.y=gh.y;pP(tm);P.x=ox;P.y=oy}g.globalAlpha=1;for(const p of PROJ)if(p.sc===sc)drawProj(p)}
// gulls over Saltmere, rain splashes on the ground
function drawGulls(tm){if(dark()>.3)return;for(let k=0;k<3;k++){const a=tm*(.25+k*.07)+k*2.1,r=60+k*28,x=Math.round(TX*16+8+Math.cos(a)*r*1.4),y=Math.round(TY*16-40+Math.sin(a)*r*.6);
  if(Math.abs(x-P.x)>W/Z||Math.abs(y-P.y)>H/Z)continue;const f=Math.floor(tm*6+k)%2;g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x-3,y+34,6,2);
  Rg(x-5,y-(f?2:0),2,1,O);Rg(x-3,y-(f?1:0),2,1,O);Rg(x-1,y,2,2,'#f8f8f8');Rg(x+1,y-(f?1:0),2,1,O);Rg(x+3,y-(f?2:0),2,1,O);Rg(x-1,y+1,2,1,'#c0c8d0')}}
const _nd21=NEWDRAW;NEWDRAW=function(...a){_nd21(...a);if(SCENE)return;const tm=a[8];drawCombatFx(tm);
 if(RAINV>.05){g.fillStyle='rgba(210,230,255,'+(.55*RAINV)+')';const t=tm;for(let k=0;k<Math.round(26*RAINV);k++){const sx=Math.floor((hsh(k,Math.floor(t*6))%1000)/1000*(W/Z))+Math.round(P.x-W/Z/2),sy=Math.floor((hsh(k+99,Math.floor(t*6))%1000)/1000*(H/Z))+Math.round(P.y-H/Z/2);
  const ti=tile[Math.floor(sy/16)*N+Math.floor(sx/16)];if(ti===0){g.fillRect(sx-2,sy,1,1);g.fillRect(sx+2,sy,1,1);g.fillRect(sx-1,sy-1,3,1)}else{g.fillRect(sx-1,sy,1,1);g.fillRect(sx+1,sy,1,1);g.fillRect(sx,sy-1,1,1)}}}
 if(Math.abs(P.x-TX*16)<500&&Math.abs(P.y-TY*16)<400)drawGulls(tm);};
const _dr21=drawRoom;drawRoom=function(tm){_dr21(tm);if(!SCENE)return;drawCombatFx(tm)};
// screen-space weather (after the night tint so rain stays visible), fireflies, HUD icon
function drawWeather(){const tm=performance.now()/1000,cx=Math.round(P.x-(W/Z)/2),cy=Math.round(P.y-(H/Z)/2);
 if(RAINV>.03){g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(40,52,78,'+(.22*RAINV)+')';g.fillRect(0,0,W,H);g.fillStyle='rgba(200,220,255,'+(.55*RAINV)+')';
  const n=Math.round(140*RAINV),ww=W/Z,hh=H/Z;for(let k=0;k<n;k++){const sp=1+(k%3)*.25,x=((hsh(k,3)%10000)/10000*ww+(-tm*40*sp)+cx*0)%ww,y=((hsh(k,7)%10000)/10000*hh+tm*260*sp)%hh;
   const X=Math.round(((x%ww)+ww)%ww)*Z,Y=Math.round(y)*Z;g.fillRect(X,Y,Z,5*Z);g.fillRect(X-Z,Y+5*Z,Z,2*Z)}g.restore()}
 if(SNOWV>.03){g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(240,246,255,'+(.85*Math.min(1,SNOWV+.2))+')';const n=Math.round(130*SNOWV),ww=W/Z,hh=H/Z;
  for(let k=0;k<n;k++){const sp=.5+(k%4)*.15,x=(hsh(k,11)%10000)/10000*ww+Math.sin(tm*1.3+k)*6,y=((hsh(k,13)%10000)/10000*hh+tm*28*sp)%hh;const X=Math.round(((x-((cx*.2)%ww))%ww+ww)%ww)*Z,Y=Math.round((y-(cy*.2)%hh+hh)%hh)*Z,s=(k%3===0?2:1)*Z;g.fillStyle='rgba(120,140,180,.55)';g.fillRect(X+Z,Y+Z,s,s);g.fillStyle='#ffffff';g.fillRect(X,Y,s,s)}g.restore()}
 if(HAZEV>.03){g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(255,196,110,'+(.10*HAZEV)+')';g.fillRect(0,0,W,H);g.globalAlpha=.06*HAZEV;g.fillStyle='#fff8e0';for(let k=0;k<6;k++){const y=((tm*12+k*H/6/Z)%(H/Z))*Z;g.fillRect(0,y+Math.sin(tm*2+k)*3*Z,W,2*Z)}g.restore()}
 // fireflies on warm nights
 const dk=SCENE?0:dark();if(dk>.35&&RAINV<.3&&biomeHere()==='grass'){g.save();g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);g.globalCompositeOperation='lighter';const gx=Math.floor(P.x/48),gy=Math.floor(P.y/48);
  for(let yy=gy-5;yy<=gy+5;yy++)for(let xx=gx-6;xx<=gx+6;xx++){const h=hsh(xx*131+yy,57);if(h%100>38)continue;const t0=tile[Math.floor((yy*48+24)/16)*N+Math.floor((xx*48+24)/16)];if(t0!==2)continue;
   const fx=xx*48+24+Math.sin(tm*.7+h)*14,fy=yy*48+24+Math.cos(tm*.9+h*.3)*10,bl=.5+.5*Math.sin(tm*3+h);if(bl<.3)continue;const a=(dk-.35)*1.5*bl;
   const gr=g.createRadialGradient(fx,fy,0,fx,fy,7);gr.addColorStop(0,'rgba(220,255,120,'+(.55*a)+')');gr.addColorStop(1,'rgba(220,255,120,0)');g.fillStyle=gr;g.fillRect(fx-7,fy-7,14,14);g.fillStyle='rgba(250,255,190,'+a+')';g.fillRect(Math.round(fx),Math.round(fy),1,1)}g.restore()}}
function drawWxIcon(){if(menuOpen)return;const U=uiS(),ins=12*U,top=50*U,dw=100*U,dx=W-ins-dw;const snow=SNOWV>.5,rain=RAINV>.5;if(!snow&&!rain)return;
 g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='#f8f8f8';g.fillRect(dx+9*U,top+5*U,20*U,18*U);
 g.fillStyle='#a8b4c8';g.beginPath();g.arc(dx+15*U,top+12*U,4.5*U,0,6.283);g.arc(dx+21*U,top+11*U,5.5*U,0,6.283);g.arc(dx+25*U,top+13*U,3.5*U,0,6.283);g.fill();g.fillRect(dx+12*U,top+12*U,15*U,4*U);
 g.fillStyle=snow?'#c8d8f0':'#4878d0';for(const[a,b]of[[13,19],[18,21],[23,19]])g.fillRect(dx+a*U,top+b*U,snow?2*U:1.5*U,snow?2*U:3*U);g.restore()}
const _dh21=drawHUD;drawHUD=function(){if(!SCENE||SCENE.room&&SCENE.room.region)drawWeather();_dh21();drawWxIcon()};
// --- crafting: Archery in the Craft tab ---
const FREC=[{k:'arrow',n:'10 arrows',c:{wood:1,stone:1},lv:1,xp:12,f:()=>inv.arrow=(inv.arrow|0)+10},
 {k:'bow1',n:'Shortbow',c:{wood:5},lv:1,xp:30,hide:()=>TL.bow>=1,f:()=>{TL.bow=Math.max(TL.bow,1);say('You made a shortbow! HIT shoots at enemies in front of you that are out of sword reach.')}},
 {k:'iarrow',n:'10 iron arrows',c:{ibar:1,wood:2},lv:15,xp:45,f:()=>inv.iarrow=(inv.iarrow|0)+10},
 {k:'bow2',n:'Longbow',c:{wood:10,ibar:2},lv:20,xp:150,hide:()=>TL.bow>=2,f:()=>{TL.bow=2;say('You made a longbow! Longer range, harder hits.')}}];
const fname=k=>({wood:'wood',stone:'stone',ibar:'iron bar'})[k]||k;
function fletchHTML(){let h='<div class="tl" style="margin-top:18px">Arrows &amp; bows</div><div class="tl" style="font-size:12px;font-weight:400;opacity:.7;margin-top:-6px">Archery level '+lvOf(FL)+' · Arrows: '+(inv.arrow|0)+' · Iron arrows: '+(inv.iarrow|0)+'</div>';
 FREC.forEach((r,i)=>{if(r.hide&&r.hide())return;const can=lvOf(FL)>=r.lv&&Object.entries(r.c).every(([a,b])=>(inv[a]|0)>=b);
  h+='<div class="gr" style="opacity:'+(can?1:.5)+'"><img class="gimg" alt="" src="'+iconURL(r.k==='bow1'||r.k==='bow2'?'bow':r.k)+'"><div class="gi"><b>'+r.n+'</b><br><small>'+Object.entries(r.c).map(([a,b])=>b+' '+fname(a)).join(', ')+' · Archery '+r.lv+' · '+r.xp+' xp</small></div><button class="gc fc" data-i="'+i+'">Make</button>'+(r.hide?'':'<button class="gc fc" data-i="'+i+'" data-all="1">All</button>')+'</div>'});return h}
function makeFletch(i,all){const r=FREC[i];if(!r||(r.hide&&r.hide()))return;if(lvOf(FL)<r.lv){say('Need Archery '+r.lv);return}let n=0;const mx=all?999:1;
 while(n<mx&&Object.entries(r.c).every(([a,b])=>(inv[a]|0)>=b)){for(const a in r.c)inv[a]-=r.c[a];r.f();n++;if(r.hide)break}
 if(!n){say('Missing materials');return}addXp(FL,r.xp*n);if(!r.hide)say('Made '+(n*10)+' '+(r.k==='iarrow'?'iron arrows':'arrows')+'.');sfx('chop');saveLocal(true);rPn()}
const _r21=rPn;rPn=function(){_r21();if(ptab===1&&pn.style.display!=='none')pbd.insertAdjacentHTML('beforeend',fletchHTML())};
const _oc21=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('.fc');if(b){makeFletch(+b.dataset.i,!!b.dataset.all);return}_oc21(e)};
// equipment card: bow + arrows
const _eq21=equipHTML;equipHTML=function(){const h=_eq21(),k='<div class="qc" style="margin-top:12px">',i=h.indexOf(k);if(i<0)return h;
 return h.slice(0,i)+'<div class="eqg" style="margin-top:6px">'+eqSlot('BOW','bow','',TL.bow?(TL.bow>=2?'Longbow':'Shortbow'):'')+eqSlot('ARROWS','arrow','',((inv.arrow|0)+(inv.iarrow|0))?((inv.iarrow|0)?(inv.iarrow|0)+' iron · ':'')+(inv.arrow|0)+' arrows':'')+'</div>'+h.slice(i)};
const _icon21=iconURL;iconURL=function(k,col){if(k!=='bow'&&k!=='arrow'&&k!=='iarrow')return _icon21(k,col);const key='g21'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
 if(k==='bow'){for(let i=0;i<10;i++){const xx=3+Math.round(Math.sin(i/9*Math.PI)*5);r(xx,2+i,2,1,'#a86830')}r(3,2,1,10,'#e8e8e8');r(2,1,2,2,'#7a4a20');r(2,11,2,2,'#7a4a20')}
 else{for(let i=0;i<9;i++)r(3+i,10-i,1,1,'#8a5a30');r(10,2,3,1,k==='iarrow'?'#c8d0dc':'#9898a8');r(11,2,1,3,k==='iarrow'?'#c8d0dc':'#9898a8');r(2,10,2,2,'#f0f0f0');r(3,11,1,2,'#e05040')}
 return ICONC[key]=c.toDataURL()};
// --- quest: the Bone Lord (before Grandmaster) ---
const GI21=QS.findIndex(q=>q.n==='Grandmaster');
QS.splice(GI21,0,{n:'The Bone Lord',d:'A tomb lies buried in the southern desert. Find it and defeat the Bone Lord. (Bring arrows: dodge roll with R or ROLL.)',type:'bonelord',amt:1,r:{g:400,xp:[FL,1200]}});
const _qv21=qVal;qVal=function(q){return q.type==='bonelord'?Q.k:_qv21(q)};
const remap21=qv=>{if(qv>=7)return;if(Q.i===GI21){Q.on=false;Q.k=0}else if(Q.i>GI21){Q.i=GI21;Q.on=false;Q.k=0;GMDONE=true}};

const _sn21=snap;snap=function(){const s=_sn21();s.qv=7;s.tomb=TOMB_DAY;s.gmd=GMDONE?1:0;return s};
const _ap21=applySave;applySave=function(S){_ap21(S);if(S.q)remap21(S.qv||0);TOMB_DAY=isFinite(S.tomb)?+S.tomb:-1;if(Array.isArray(S.xp))XPS[FL]=Math.max(0,+S.xp[FL]||0);
 if(S.inv){inv.arrow=Math.max(0,+S.inv.arrow||0);inv.iarrow=Math.max(0,+S.inv.iarrow||0)}TL.bow=S.tl?Math.max(0,Math.min(2,+S.tl.bow||0)):0};
const _ng21=newGame;newGame=function(){TL.bow=0;TOMB_DAY=-1;PROJ.length=0;_ng21()};
const _dmap21=drawMap;drawMap=function(){_dmap21();const c=document.getElementById('mpc');if(!c||!TOMB)return;const x=c.getContext('2d');x.fillStyle='#101010';x.fillRect(TOMB.x-1,TOMB.y-1,3,3);x.fillStyle='#b070f0';x.fillRect(TOMB.x,TOMB.y,1,1)};
const _ws21=wantSong;wantSong=function(){return SCENE&&SCENE.room.tomb?'cave':_ws21()};
