// ---------------------------------------------------------------- 14. The wider world, the Slime King's cave, music
// Snowy north (pines, wolves), desert south (cacti, skeletons, a trader), iron veins in the mountains,
// a dungeon cave with a daily boss, and original chiptune music.
// --- sprites ---
const pineC=blob(24,28,orr(ell(12,5,4,5),ell(12,12,7,5),ell(12,19,10,5),ell(12,24,12,4)),[O,'#1c5030','#2e7048','#e8f0f8']);
const cacC=blob(16,22,orr(ell(8,12,3.5,10),ell(3,9,2,4),ell(13,7,2,4)),[O,'#286824','#3c9a38','#70c860']);
const oreC=blob(14,11,orr(ell(7,7,7,4.5),ell(6,5,5,4)),['#202028','#58586a','#88889a','#c0c0d0']);{const oc=oreC.getContext('2d');for(const[a,b]of[[4,5],[8,4],[6,7],[10,7],[3,7]])R(oc,a,b,2,1,'#e88838')}
Object.assign(OHP,{ore:5,pine:3,cactus:2});
// --- new items ---
INVK.push('pelt','bone');Object.assign(INAME,{pelt:'Wolf pelt',bone:'Bone'});
Object.assign(IDESC,{pelt:'Thick fur from a snow wolf. The desert trader pays well for it.',bone:'An old bone from a desert skeleton. The desert trader collects them.'});
Object.assign(SELLP,{pelt:15,bone:5});Object.assign(SN,{pelt:'Wolf pelts',bone:'Bones'});

// --- mining iron veins, chopping pines and cacti ---
function hitSpecial(i,o){
 if(o.t==='ore'){if(TL.pick<2){say('This iron vein needs a stone pickaxe or better.');sfx('swish');return}if(lvOf(2)<5){say('You need Mining 5 to mine iron.');sfx('swish');return}
  o.hp-=TL.pick;o.shake=.15;sfx('mine');if(o.hp>0)return;obj[i]=null;REM.push({i,t:'ore',at:CLK});const n=1+(Math.random()<lvOf(2)*.008?1:0);inv.iron=(inv.iron|0)+n;say('+'+n+' iron ore');addXp(2,40);setTimeout(()=>sfx('pickup'),90)}
 else{o.hp-=1+TL.axe;o.shake=.15;sfx(o.t==='pine'?'chop':'rustle');if(o.hp>0)return;obj[i]=null;REM.push({i,t:o.t,at:CLK});
  if(o.t==='pine'){const n=2+(Math.random()<lvOf(1)*.01?1:0);inv.wood+=n;say('+'+n+' wood');addXp(1,28)}else{inv.cfruit=(inv.cfruit|0)+2;inv.wood+=1;say('+2 cactus fruit and +1 wood');addXp(3,14)}setTimeout(()=>sfx('pickup'),90)}
 saveLocal()}
// --- enemies: wolves in the snow, skeletons in the desert ---
function enemyDrop(n){if(n.type==='wolf'&&Math.random()<.7){inv.pelt=(inv.pelt|0)+1;say('+1 wolf pelt')}
 else if(n.type==='skel'){const k=1+(Math.random()<.4?1:0);inv.bone=(inv.bone|0)+k;say('+'+k+' bone'+(k>1?'s':''))}
 else if(n.type==='boss'){GLD+=120;inv.iron=(inv.iron|0)+3;addXp(0,300);addXp(7,150);CAVE_DAY=Math.floor(time/DAYLEN);if(Q.on&&QS[Q.i]&&QS[Q.i].type==='boss')Q.k++;
  say('You defeated the Slime King! +120 gold, +3 iron ore');msgT=5;sfx('quest');saveLocal(true);saveCloud(true)}}
function caveAttack(){if(swing>0)return;swing=.25;const[fx,fy]=front(13),dm=1+TL.sword+Math.floor(lvOf(0)/15)+(typeof meleeBonus==='function'?meleeBonus():0);let hit=false;
 for(const n of en){if(n.dead)continue;if(Math.hypot(n.x-fx,n.y-fy)<(n.type==='boss'||n.big?24:16)){let d=dm;if(Math.random()<(typeof critCh==='function'?critCh(n):lvOf(7)*.006)){d*=(typeof critMul==='function'?critMul(n):2);say('Checkmate!');if(typeof onCrit==='function')onCrit(n,d)}
  n.hp-=d;const kb=n.type==='boss'||n.big?2:5;n.kx=face[0]*kb;n.ky=face[1]*kb;hit=true;addXp(0,4*d);addXp(7,3);
  if(n.hp<=0){n.dead=1;kills++;GLD+=2+Math.floor(Math.random()*5);addXp(0,12);if(n.type!=='boss'&&Math.random()<.6)inv.meat++;enemyDrop(n)}}}
 sfx(hit?'hit':'swish')}
const _atk14=attack;attack=function(){if(dead||menuOpen||pnOpen)return;
 if(SCENE&&SCENE.room.cave&&!BUILD){caveAttack();return}
 if(!SCENE&&!BUILD&&swing<=0&&!FISH){const[fx,fy]=front(13),tx=Math.floor(fx/T),ty=Math.floor(fy/T);
  if(tx>=0&&ty>=0&&tx<N&&ty<N){const i=ty*N+tx,o=obj[i];if(o&&(o.t==='ore'||o.t==='pine'||o.t==='cactus')&&!facingNpc()&&!en.some(n=>Math.hypot(n.x-fx,n.y-fy)<16)){swing=.25;hitSpecial(i,o);return}}}
 const alive=en.filter(n=>!n.dead);_atk14();for(const n of alive)if(n.dead&&!n.dropped){n.dropped=1;enemyDrop(n)}};
function drawWolf(n,tm){const x=Math.round(n.x),y=Math.round(n.y),f=P.x<n.x,hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,st=Math.floor(tm*8+n.x)%2,c=hit?'#ffffff':'#8890a0',cd=hit?'#e0e0e0':'#5c6474',cl=hit?'#fff':'#c8d0dc';
 shd(x,y+5,16);const W2=(a,b,w,hh,col)=>Rg(x+(f?-a-w:a),y+b,w,hh,col);
 for(const[a,b,w,hh]of[[-7,-4,12,6],[3,-8,6,6],[-9,-5,3,2],[-6,2,2,4],[2,2,2,4],[4,-10,2,2],[7,-10,2,2]])W2(a-1,b-1,w+2,hh+2,O);
 W2(-7,-4,12,6,c);W2(-7,0,12,2,cd);W2(3,-8,6,6,c);W2(4,-10,2,2,c);W2(7,-10,2,2,c);W2(8,-6,2,2,cd);W2(6,-6,1,1,O);W2(-9,-5,3,2,c);W2(-6+(st?1:0),2,2,4,cd);W2(2-(st?1:0),2,2,4,cd);W2(-5,-4,8,1,cl)}
function drawSkel(n,tm){const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,st=Math.floor(tm*6+n.x)%2,b=hit?'#ffd0d0':'#f0ece0',d='#b8b0a0';shd(x,y+6,12);
 pp([[-4,-13,8,7,b],[-3,-6,6,6,b],[-6,-5,2,6,b],[4,-5,2,6,b],[-3+(st?0:1),0,2,6,b],[1-(st?0:1),0,2,6,b]],x,y,false);
 Rg(x-2,y-11,2,2,O);Rg(x+1,y-11,2,2,O);Rg(x-1,y-8,3,1,O);Rg(x-2,y-5,4,1,d);Rg(x-2,y-3,4,1,d)}
function drawBoss(n,tm){const x=Math.round(n.x),y=Math.round(n.y),fr=Math.floor(tm*3)%2,hit=Math.abs(n.kx)+Math.abs(n.ky)>.5,sp=(hit?slW:slS)[fr],hh=sp.height*2,top=y+8-hh;shd(x,y+8,30);g.drawImage(sp,x-16,top,32,hh);
 Rg(x-7,top-3,14,4,O);Rg(x-6,top-2,12,2,GD);for(const a of[-6,-1,4])Rg(x+a,top-5,2,3,GD);Rg(x-1,top-1,2,1,'#e03030');
 if(!hit){Rg(x-9,top+8,5,6,'#fff');Rg(x+4,top+8,5,6,'#fff');const dd=P.x>n.x?2:0;Rg(x-9+dd,top+10,3,4,O);Rg(x+4+dd,top+10,3,4,O)}
 Rg(x-16,top-10,32,4,O);Rg(x-15,top-9,Math.max(0,30*n.hp/30),2,'#e03030')}
const _pS14=pS;pS=function(n,tm){if(n.type==='wolf')return drawWolf(n,tm);if(n.type==='skel')return drawSkel(n,tm);if(n.type==='boss')return drawBoss(n,tm);_pS14(n,tm)};
// --- the Slime King's cave ---
let CAVE_DAY=-1,CAVE=null;
for(let y=12;y<N-12&&!CAVE;y++)for(let x=12;x<N-12;x++){const i=y*N+x;if(tile[i]===3&&tile[i-N]===3&&tile[i-2*N]===3&&tile[i-1]===3&&tile[i+1]===3&&[2,4,5].includes(tile[i+N])&&!inVillage(x,y)&&!BS.has(i)&&!houseAt(x,y)){CAVE={x,y};break}}
if(CAVE)for(const[dx,dy]of[[0,0],[0,1],[-1,1],[1,1],[0,2]])obj[(CAVE.y+dy)*N+CAVE.x+dx]=null;
ROOMS.cave={w:18,h:12,ex:9,cave:1,floor:['#6a6058','#625850'],wall:'#4a423c',trim:'#2e2824',items:[[2,3,'boulder'],[15,4,'boulder'],[4,8,'boulder'],[13,9,'boulder'],[16,8,'boulder'],[7,2,'crystal'],[11,2,'crystal'],[1,10,'crystal']].map(([x,y,t])=>({t,x,y,solid:1}))};
ROOMS.cave.solid=new Set(ROOMS.cave.items.map(it=>it.y*18+it.x));
const _en14=entrances;entrances=function(){const a=_en14();if(CAVE)a.push({x:CAVE.x,y:CAVE.y,id:'cave',house:null});return a};
const _es14=enterScene;enterScene=function(id,house,ret){_es14(id,house,ret);if(id!=='cave')return;const day=Math.floor(time/DAYLEN);
 for(const[x,y]of[[4,4],[14,6],[6,9],[12,3],[9,9]])en.push({x:x*16+8,y:y*16+8,hp:3,kx:0,ky:0,type:'slime'});
 if(CAVE_DAY!==day){en.push({x:9*16,y:5*16,hp:30,kx:0,ky:0,type:'boss'});say('The Slime King rules this cave! Defeat it for treasure.')}else say('The Slime King has fallen today. Come back tomorrow.')};
const _dk14=dark;dark=function(){return SCENE&&SCENE.room.cave&&!INDRAW?.2:_dk14()};
const _df14=drawFurn;drawFurn=function(it,tm){const x0=it.x*16,y0=it.y*16;
 if(it.t==='boulder'){shd(x0+8,y0+14,16);Rg(x0+1,y0-2,14,17,O);Rg(x0+2,y0-1,12,15,'#7a7068');Rg(x0+3,y0,6,4,'#9a9088');Rg(x0+2,y0+10,12,4,'#5a5048');return}
 if(it.t==='crystal'){const p=.6+.4*Math.sin(tm*2+x0);g.fillStyle='rgba(120,200,255,'+(.18*p)+')';g.beginPath();g.arc(x0+8,y0+4,14,0,6.283);g.fill();Rg(x0+4,y0-4,8,18,O);Rg(x0+5,y0-3,6,16,'#68b8f0');Rg(x0+6,y0-2,2,12,'#c8ecff');Rg(x0+2,y0+6,4,8,O);Rg(x0+3,y0+7,2,6,'#4890d0');return}
 _df14(it,tm)};
const _dr14=drawRoom;drawRoom=function(tm){_dr14(tm);if(!SCENE||!SCENE.room.cave||SCENE.room.region)return;for(const n of en)if(!n.dead)pS(n,tm);if(!dead)pP(tm);
 const gr=g.createRadialGradient(P.x,P.y-4,28,P.x,P.y-4,118);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(6,4,12,.88)');g.fillStyle=gr;g.fillRect(P.x-500,P.y-500,1000,1000)};
// --- the desert trader ---
let TRADER=null;{const cx=N>>1;outer:for(let y=N-8;y>N/2;y--)for(let dx=0;dx<30*HSC;dx++)for(const x of[cx+dx,cx-dx]){let ok=true;for(let a=-1;a<=2;a++)for(let b=-1;b<=1;b++){const i=(y+b)*N+x+a;if(tile[i]!==5||obj[i]||BS.has(i))ok=false}if(ok){TRADER={x,y};break outer}}}
if(TRADER){BS.add(TRADER.y*N+TRADER.x+1);NPCS.push({kind:'trader',x:TRADER.x*16+8,y:(TRADER.y+1)*16+4,ch:{sk:2,hs:0,hc:0,sh:4,pn:2,ht:1,hcol:5,so:3}})}
const _nd14=NEWDRAW;NEWDRAW=function(...a){_nd14(...a);if(SCENE)return;const tm=a[8];
 if(TRADER){const x0=(TRADER.x+1)*16,y0=TRADER.y*16;shd(x0+8,y0+14,18);Rg(x0-1,y0+5,18,10,O);Rg(x0,y0+6,16,8,'#a87850');for(let i=0;i<4;i++)Rg(x0+2+i*4,y0+7,3,3,['#e88838','#f0ece0','#8890a0','#48a838'][i]);
  Rg(x0-2,y0-8,20,8,O);for(let i=0;i<5;i++)Rg(x0-1+i*4,y0-7,4,6,i%2?'#f8f0e0':'#d84838');Rg(x0,y0-1,2,7,O);Rg(x0+14,y0-1,2,7,O)}
};
function traderHTML(){const row=(k,act,label,sub,ok)=>'<button class="sb trb" data-a="'+act+'" style="opacity:'+(ok?1:.45)+'">'+label+'<br><small>'+sub+'</small></button>';
 return'<div class="tl">Desert Trader</div><div class="qc"><p>"Sand in my boots, gold in my pockets. I trade with travelers from the snow and the sand."</p></div><div class="tl" style="margin-top:8px">Gold: '+GLD+'</div><div class="tl" style="font-size:13px">BUY</div>'
 +row('iron','biron','Iron ore','18 gold each',GLD>=18)+row('iron','biron5','5 iron ore','85 gold',GLD>=85)
 +'<div class="tl" style="font-size:13px;margin-top:10px">SELL</div>'+row('pelt','spelt','Sell all wolf pelts ('+(inv.pelt|0)+')','+'+(inv.pelt|0)*24+' gold',(inv.pelt|0)>0)+row('bone','sbone','Sell all bones ('+(inv.bone|0)+')','+'+(inv.bone|0)*9+' gold',(inv.bone|0)>0)}
function traderAct(a){const buy=(n,c)=>{if(GLD<c){say('Not enough gold');return}GLD-=c;inv.iron=(inv.iron|0)+n;say('Bought '+n+' iron ore');sfx('coin')};
 if(a==='biron')buy(1,18);else if(a==='biron5')buy(5,85);else{const k=a==='spelt'?'pelt':'bone',n=inv[k]|0;if(!n)return;GLD+=n*(k==='pelt'?24:9);inv[k]=0;say('Sold for '+n*(k==='pelt'?24:9)+' gold');sfx('coin')}saveLocal(true);rPn()}
// --- quests in the new lands (inserted before Grandmaster; older saves are remapped) ---
QS.splice(10,0,{n:'Into the Cold',d:'Travel to the snowy north and bring the Elder 3 wolf pelts. Wolves hunt at night.',type:'give',item:'pelt',amt:3,r:{g:150,xp:[0,400]}},
 {n:'Bone Collector',d:'Skeletons roam the southern desert at night. Bring the Elder 5 bones.',type:'give',item:'bone',amt:5,r:{g:150,xp:[8,400]}},
 {n:'The Slime King',d:'A great slime rules the cave in the northern mountains. Find the cave and defeat it.',type:'boss',amt:1,r:{g:300,xp:[7,800]}});
const _qv14=qVal;qVal=function(q){return q.type==='boss'?Q.k:_qv14(q)};
const _sn14=snap;snap=function(){const s=_sn14();s.qv=4;s.cave=CAVE_DAY;return s};
const _ap14=applySave;applySave=function(S){_ap14(S);if((S.qv||0)<4&&S.q&&Q.i>=10)Q.i=Math.min(QS.length,Q.i+3);CAVE_DAY=isFinite(S.cave)?+S.cave:-1};

// --- update: enemy types, wolf speed, boss contact ---
const _u14=upd;upd=function(dt){_u14(dt);if(menuOpen||pnOpen||dead)return;
 for(const n of en){if(!n.type){const t=SCENE?2:tile[Math.floor(n.y/16)*N+Math.floor(n.x/16)];if(t===4){n.type='wolf';n.hp=5}else if(t===5){n.type='skel';n.hp=6}else n.type='slime'}
  const dx=P.x-n.x,dy=P.y-n.y,d=Math.hypot(dx,dy)||1;
  if(n.type==='wolf'&&d<140&&!nearFire(n.x,n.y,70)){const s=16*dt,mx=dx/d*s,my=dy/d*s;if(!solid(n.x+mx,n.y))n.x+=mx;if(!solid(n.x,n.y+my))n.y+=my}
  if(n.type==='boss'&&d<18&&hurt<=0&&!(ROLLT>0)){P.hp-=1;hurt=1;say('The Slime King crushes you!');sfx('hurt')}}};
// --- shops, bag, map ---
const _r14=rPn;rPn=function(){if(ptab===2&&shop==='trader'){document.getElementById('t0').style.display='none';document.getElementById('t1').style.display='none';ptt.textContent='';pbd.innerHTML=traderHTML();return}_r14()};
const _oc14=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('.trb');if(b){traderAct(b.dataset.a);return}_oc14(e)};
const _dmap14=drawMap;drawMap=function(){_dmap14();const c=document.getElementById('mpc');if(!c||!CAVE)return;const x=c.getContext('2d');x.fillStyle='#101010';x.fillRect(CAVE.x-1,CAVE.y-1,3,3);x.fillStyle='#f8d848';x.fillRect(CAVE.x,CAVE.y,1,1)};
// --- music: original chiptune loops ---
let MUSIC=true;try{MUSIC=localStorage.getItem('sq_music')!=='0'}catch(e){}
const NOTE=s=>{const m=/^([A-G])(#?)(\d)$/.exec(s);return m?12*(+m[3]+1)+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]?1:0):0};
function parseTrack(str){const tk=str.trim().split(/\s+/),ev=[];for(let i=0;i<tk.length;i++){if(tk[i]==='-'){const l=ev[ev.length-1];if(l&&l.end===i)l.end=i+1;continue}const m=NOTE(tk[i]);if(m)ev.push({s:i,end:i+1,m})}return{ev,len:tk.length}}
const SONGS={day:{bpm:118,lead:'C5 E5 G5 E5 F5 A5 G5 - E5 G5 C6 B5 A5 G5 E5 - D5 F5 A5 F5 G5 B5 A5 G5 E5 D5 C5 D5 C5 - - -',bass:'C3 G3 C3 G3 F2 C3 F2 C3 C3 G3 C3 G3 A2 E3 A2 E3 D3 A3 D3 A3 G2 D3 G2 D3 A2 E3 F2 G2 C3 G2 C3 -'},
 night:{bpm:84,lead:'A4 - C5 E5 D5 - C5 B4 A4 - E4 - G4 A4 B4 - F4 - A4 C5 B4 - A4 G4 E4 - - - - - - -',bass:'A2 E3 A2 E3 F2 C3 F2 C3 A2 E3 A2 E3 G2 D3 G2 D3 F2 C3 F2 C3 E2 B2 E2 B2 A2 E3 A2 E3 A2 - - -'},
 indoor:{bpm:100,lead:'F5 A5 C6 A5 G5 - E5 - F5 A5 G5 F5 E5 - C5 - D5 F5 A5 F5 E5 G5 C6 - A5 G5 F5 E5 F5 - - -',bass:'F2 C3 A2 C3 C3 G3 E3 G3 F2 C3 A2 C3 C3 G3 E3 G3 D3 A3 F3 A3 C3 G3 E3 G3 A#2 F3 C3 E3 F2 C3 F2 -'},
 cave:{bpm:72,lead:'D4 - - F4 E4 - - - D4 - A3 - C4 - - - D4 - F4 A4 G4 - F4 E4 D4 - - - - - - -',bass:'D2 - D2 - A1 - A1 - A#1 - A#1 - C2 - C2 - D2 - D2 - G1 - G1 - A1 - A1 - D2 - - -'}};
const PARSED={};for(const k in SONGS)PARSED[k]={bpm:SONGS[k].bpm,lead:parseTrack(SONGS[k].lead),bass:parseTrack(SONGS[k].bass)};
let MG=null,curSong=null,songT0=0,nextBeat=0;
function playNote(m,t,d,type,vol){const o=ACX.createOscillator(),gn=ACX.createGain();o.type=type;o.frequency.value=440*Math.pow(2,(m-69)/12);gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(vol,t+.015);gn.gain.setValueAtTime(vol*.7,t+Math.max(.03,d*.5));gn.gain.linearRampToValueAtTime(0,t+d*.95);o.connect(gn);gn.connect(MG);o.start(t);o.stop(t+d)}
function wantSong(){if(SCENE)return SCENE.room.cave?'cave':'indoor';return dark()>.4?'night':'day'}
setInterval(()=>{try{if(!ACX||ACX.state!=='running')return;if(!MG){MG=ACX.createGain();MG.gain.value=MUSIC?.5:0;MG.connect(ACX.destination)}
 MG.gain.value=MUSIC?.5*(typeof MUSV==='number'?MUSV:1)*(typeof MFADEF==='function'?MFADEF():1):0;if(!MUSIC)return;const now=ACX.currentTime,want=wantSong();if(want!==curSong){curSong=want;songT0=now+.15;nextBeat=0}
 const S=PARSED[curSong],spb=60/S.bpm;if(songT0+nextBeat*spb<now-.2)songT0=now+.05-nextBeat*spb;
 while(songT0+nextBeat*spb<now+.35){const b=nextBeat%S.lead.len,t=songT0+nextBeat*spb;for(const e of S.lead.ev)if(e.s===b)playNote(e.m,t,(e.end-e.s)*spb,'square',.045);for(const e of S.bass.ev)if(e.s===b)playNote(e.m,t,(e.end-e.s)*spb,'triangle',.08);nextBeat++}}catch(e){}},120);
