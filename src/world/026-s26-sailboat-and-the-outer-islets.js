// ---------------------------------------------------------------- 26. Sailboat and the outer islets
// Captain Ida sells a sailboat. Face water and press USE / ✕ to set sail; face land and press it again to
// go ashore. Out at sea: Gull Rock (rainbow fish bite there), Wreck Isle (a shipwreck to loot once a day)
// and Hermit's Isle (an old hermit with his own requests, and the "Castaway" quest).
const ISLES=[{id:'gull',name:'Gull Rock',x:97*HSC,y:13*HSC,r:3.5},{id:'wreck',name:'Wreck Isle',x:96*HSC,y:98*HSC,r:4.4},{id:'hermit',name:'Hermit\'s Isle',x:9*HSC,y:84*HSC,r:4.4}];
for(const s of ISLES)for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++){const d=Math.hypot(dx*.92,dy*1.12)+((dx*7+dy*13)%3===0?.35:0),x=s.x+dx,y=s.y+dy,i=y*N+x;if(d>s.r)continue;tile[i]=d<=s.r-1.6?2:1;obj[i]=null;PROT.add(i);TG.delete(i)}
const GULL=ISLES[0],WRK=ISLES[1],HRM=ISLES[2];
obj[GULL.y*N+GULL.x+1]={t:'rock',hp:4};obj[(GULL.y-1)*N+GULL.x-1]={t:'rock',hp:4};
obj[(HRM.y+1)*N+HRM.x+2]={t:'tree',hp:3};
for(const[dx,dy]of[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0]])BS.add((WRK.y+dy)*N+WRK.x+dx);           // the wreck
for(const[dx,dy]of[[-1,-2],[0,-2],[1,-2],[-1,-1],[1,-1]])BS.add((HRM.y+dy)*N+HRM.x+dx);         // the hermit's hut
// --- new fish: the rainbow fish ---
INVK.push('rainbow','crainbow');EXTRA_BAG.push('rainbow','crainbow');Object.assign(INAME,{rainbow:'Rainbow fish',crainbow:'Cooked rainbow fish'});
Object.assign(IDESC,{rainbow:'A shimmering rare fish. It only bites in the sparkling water around Gull Rock. Cook it at Cooking 25.',crainbow:'A feast fit for a captain. Restores 5 hearts and lots of food.'});
Object.assign(SELLP,{rainbow:60,crainbow:90});Object.assign(SN,{rainbow:'Rainbow fish',crainbow:'Cooked rainbow fish'});Object.assign(SHORT,{rainbow:'rainbow fish',crainbow:'cooked rainbow fish'});
COOKS.push({raw:'rainbow',ck:'crainbow',n:'rainbow fish',lv:25,xp:180});FOODS.push({k:'crainbow',n:'cooked rainbow fish',heal:5,hun:90});FOODS.sort((a,b)=>b.heal-a.heal||b.hun-a.hun);
const nearGull=()=>Math.hypot(P.x/16-GULL.x,P.y/16-GULL.y)<8;
const _cf26=catchFish;catchFish=function(){if(!FISH||!nearGull()||Math.random()>.3)return _cf26();
 inv.rainbow=(inv.rainbow|0)+1;addXp(9,150);say('A RAINBOW FISH! It shimmers in every color.');sfx('quest');
 FISH.t=0;FISH.bite=0;FISH.wait=(2+Math.random()*3)*Math.max(.6,1-lvOf(9)*.006);if((inv.bait|0)>0){inv.bait--;FISH.wait*=.4}};
// --- the boat ---
TL.boat=0;let SAILING=false,sailTip=false,WRECK_DAY=-1,wakeT=0;
const isWaterT=(tx,ty)=>tx>=0&&ty>=0&&tx<N&&ty<N&&(tile[ty*N+tx]===0||BRIDGE.has(ty*N+tx));
const boatOK=(x,y)=>[[-6,-1],[6,-1],[-6,6],[6,6]].every(([a,b])=>isWaterT(Math.floor((x+a)/16),Math.floor((y+b)/16)));
function frontT(){const[fx,fy]=front(16);return[Math.floor(fx/16),Math.floor(fy/16)]}
// where to go ashore: the tile in front, or (on a jagged shore or in a narrow inlet) the nearest landable tile beside it or just past it
function landPick(ok){const[tx,ty]=frontT(),fx=face[0],fy=face[1],qx=fy?1:0,qy=fx?1:0;let best=null,bd=1e9;
 for(const[a,b]of[[0,0],[qx,qy],[-qx,-qy],[fx,fy],[fx+qx,fy+qy],[fx-qx,fy-qy]]){const x=tx+a,y=ty+b,d=Math.hypot(x*16+8-P.x,y*16+8-P.y)+(a||b?.5:0);if(d>36||d>=bd||!ok(x,y))continue;best=[x,y];bd=d}return best}
function canBoard(){if(SAILING||!TL.boat||SCENE||dead||BUILD||FISH)return false;const[tx,ty]=frontT();return tile[ty*N+tx]===0&&!BRIDGE.has(ty*N+tx)&&boatOK(tx*16+8,ty*16+8)}
function canLand(){if(!SAILING||dead)return null;return landPick((tx,ty)=>{if(tx<0||ty<0||tx>=N||ty>=N||tile[ty*N+tx]===0)return false;const cx=tx*16+8,cy=ty*16+8;return!(solid(cx-5,cy-3)||solid(cx+5,cy-3)||solid(cx-5,cy+6)||solid(cx+5,cy+6))})}
function sailToggle(){const[tx,ty]=frontT();
 if(canBoard()){SAILING=true;P.x=tx*16+8;P.y=ty*16+6;sfx('splash');FISH=null;if(!sailTip){sailTip=true;say('You set sail! Face land and press USE to go ashore. You can fish from the boat.')}else say('You set sail.');saveLocal(true);return true}
 const L=canLand();if(L){SAILING=false;P.x=L[0]*16+8;P.y=L[1]*16+8;sfx('door');say('You go ashore.');saveLocal(true);return true}return false}
// wreck: loot once a day
const nearWreck=()=>!SAILING&&!SCENE&&Math.hypot(P.x-(WRK.x*16+8),P.y-(WRK.y*16))<34;
function lootWreck(){const d=Math.floor(time/DAYLEN);if(WRECK_DAY===d){say('You\'ve searched the wreck today. The tide brings more tomorrow.');sfx('swish');return}
 WRECK_DAY=d;const g2=120+Math.floor(Math.random()*80);GLD+=g2;inv.sbar=(inv.sbar|0)+1;inv.iarrow=(inv.iarrow|0)+10;let extra='';if(Math.random()<.35){inv.lantern=(inv.lantern|0)+1;extra=', an iron lantern'}
 say('Salvage! +'+g2+' gold, a steel bar, 10 iron arrows'+extra+'.');sfx('quest');setTimeout(()=>sfx('coin'),200);saveLocal(true);saveCloud()}
// talking / USE / ✕: set sail, go ashore, search the wreck
const _talk26=talk;talk=function(){if(!pnOpen&&!menuOpen&&!dead&&!SCENE&&!nearNpc()){if(nearWreck()){lootWreck();return}if(SAILING?canLand():(nearStruct()===null&&canBoard())){sailToggle();return}}_talk26()};
tk.addEventListener('touchstart',e=>{if(pnOpen||nearNpc())return;if(nearWreck()){e.preventDefault();lootWreck();return}if(canBoard()||canLand()){e.preventDefault();sailToggle()}},{passive:false});
const _roll26=roll;roll=function(){if(SAILING)return;_roll26()};
const _fire26=fire;fire=function(){if(SAILING){say('Not on a boat!');return}_fire26()};
const _sb26=startBuild;startBuild=function(k){if(SAILING){say('Go ashore to build.');closePanel();return}_sb26(k)};
// movement while sailing: the boat glides over water and under bridges
let sailLab=false;
const _u26=upd;upd=function(dt){const paused=menuOpen||pnOpen;
 if(SAILING&&!paused&&!dead){let ix=jx+(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0),iy=jy+(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0);const l=Math.hypot(ix,iy);
  _u26(dt);  // the normal walk can't leave the water tile we're on, so the boat moves itself below
  if(l>.05&&!dead){const nx=ix/Math.max(1,l),ny=iy/Math.max(1,l),sp=78*(K.shift?1.35:1)*dt;if(Math.abs(nx)>Math.abs(ny))face=[Math.sign(nx),0];else face=[0,Math.sign(ny)];
   if(FISH)FISH=null;if(boatOK(P.x+nx*sp,P.y))P.x+=nx*sp;if(boatOK(P.x,P.y+ny*sp))P.y+=ny*sp;
   if((wakeT-=dt)<=0){wakeT=.08;DUST.push({x:P.x-face[0]*12+(Math.random()*4-2),y:P.y+5-face[1]*8,t:0,c:'#e8f8ff',sc:null})}}
  en=en.filter(n=>{const t=tile[Math.floor(n.y/16)*N+Math.floor(n.x/16)];return t!==0})}
 else _u26(dt);
 if(dead&&SAILING)SAILING=false;
 // prompt on the TALK button
 const want=!paused&&!dead&&!SCENE&&!nearNpc()?(nearWreck()?'SEARCH':canLand()?'LAND':(nearStruct()===null&&canBoard())?'SAIL':''):'';
 if(want){tk.style.display='flex';const lab=want+(isPC?'<small>T</small>':'');if(tk.innerHTML!==lab&&!tk.innerHTML.startsWith(want))tk.innerHTML=lab;sailLab=true}
 else if(sailLab){sailLab=false;tk.innerHTML='TALK'+(isPC?'<small>T</small>':'');if(typeof tkLab!=='undefined')tkLab=''}};
const _rs26=reset;reset=function(){SAILING=false;_rs26()};
// --- drawing: the boat, the wreck, the hut, the sparkling fishing spot ---
function drawBoat26(tm){const x=Math.round(P.x),bob=Math.round(Math.sin(tm*2.6)),y=Math.round(P.y)+bob,hz=face[0]!==0;
 if(hz){Rg(x-15,y-1,30,11,O);Rg(x-14,y,28,5,'#a86830');Rg(x-12,y+5,24,4,'#7a4a20');Rg(x-14,y,28,1,'#d8a060');Rg(x-16,y-2,3,3,O);Rg(x+13,y-2,3,3,O)}
 else{Rg(x-9,y-5,18,17,O);Rg(x-8,y-4,16,10,'#a86830');Rg(x-7,y+6,14,5,'#7a4a20');Rg(x-8,y-4,16,1,'#d8a060')}
 const mx=hz?x-face[0]*9:x+7;Rg(mx-1,y-26,3,26,O);Rg(mx,y-25,1,25,'#7a4a20');const sd=hz?-face[0]:1;
 for(let k=0;k<14;k++){const w=Math.round(k*.7)+1;Rg(sd>0?mx+1:mx-w,y-24+k,w,1,k%5===2?'#e05040':'#f4f0e0')}}
const _pP26=pP;pP=function(tm){if(!SAILING||SCENE)return _pP26(tm);const bob=Math.round(Math.sin(tm*2.6));drawBoat26(tm);
 g.save();g.translate(0,(window.BOAT85?BOAT85.dy:3)+bob);_pP26(tm);g.restore();drawBoatFront26(Math.round(P.x),Math.round(P.y)+bob,face,tm)};
function drawWreck(tm){const x0=(WRK.x-1)*16,y0=(WRK.y-1)*16+6;shd(x0+24,y0+26,48);
 // a beached hull lying on its side: curved keel, broken middle with ribs showing, snapped mast, torn sail
 const hull=[[0,10,6],[4,6,10],[8,4,13],[14,3,15],[22,4,14],[30,5,13],[36,7,11],[42,10,8],[46,13,5]];
 for(const[a,b,hh]of hull)Rg(x0+a-1,y0+b-1,8,hh+2,O);for(const[a,b,hh]of hull){Rg(x0+a,y0+b,6,hh,'#8a6038');Rg(x0+a,y0+b+hh-4,6,4,'#5a4028');Rg(x0+a,y0+b,6,1,'#b88858')}
 for(let k=0;k<6;k++)Rg(x0+3+k*8,y0+8,1,10,'#4a3220');
 Rg(x0+18,y0+4,10,9,'#1a1008');for(const a of[19,22,25])Rg(x0+a,y0+4,1,9,'#c8a878');
 Rg(x0+30,y0-14,3,20,O);Rg(x0+31,y0-13,1,18,'#5a4028');Rg(x0+33,y0-16,3,6,O);Rg(x0+34,y0-15,1,4,'#5a4028');
 Rg(x0+33,y0-10,9,9,O);Rg(x0+34,y0-9,7,4,'#d8d0c0');Rg(x0+34,y0-5,4,3,'#d8d0c0');Rg(x0+34,y0-7,7,1,'#a83838');
 Rg(x0+4,y0+16,8,7,O);Rg(x0+5,y0+17,6,5,'#a86830');Rg(x0+5,y0+17,6,1,'#c88848');Rg(x0+7,y0+19,2,2,GD);
 if(Math.sin(tm*3)>.6){Rg(x0+8,y0+15,1,1,'#fff8c0')}}
function drawHut(){const x0=(HRM.x-1)*16,base=HRM.y*16-2;shd(x0+24,base,48);Rg(x0-1,base-22,50,23,O);Rg(x0,base-21,48,21,'#b89868');for(let k=0;k<6;k++)Rg(x0+4+k*8,base-21,1,21,'#9a7a4a');
 Rg(x0-5,base-38,58,18,O);Rg(x0-4,base-37,56,16,'#c8b060');for(let k=0;k<4;k++)Rg(x0-4,base-34+k*4,56,1,'#a89040');Rg(x0+18,base-14,12,14,O);Rg(x0+19,base-13,10,13,'#4a3220');Rg(x0+4,base-16,8,7,'#a8d8f8')}
const _gh26=GROUNDHOOK;GROUNDHOOK=function(x0,y0,x1,y1,tm){if(_gh26)_gh26(x0,y0,x1,y1,tm);if(SCENE)return;
 if(Math.abs(GULL.x-(x0+x1)/2)<30&&Math.abs(GULL.y-(y0+y1)/2)<30)for(let k=0;k<18;k++){const a=k*2.4+tm*.3,r=4.4+((k*7)%5)*.4,sx=Math.round((GULL.x+.5+Math.cos(a)*r)*16),sy=Math.round((GULL.y+.5+Math.sin(a)*r*.8)*16),on=Math.sin(tm*4+k*1.7)>.3;
  if(on&&tile[Math.floor(sy/16)*N+Math.floor(sx/16)]===0){Rg(sx,sy,1,1,'#fff');Rg(sx-1,sy+1,3,1,['#f86878','#f8d848','#68d8f8','#98f868'][k%4])}}};
const _nd26=NEWDRAW;NEWDRAW=function(...a){_nd26(...a);if(SCENE)return;const tm=a[8],vis=(x,y)=>Math.abs(x*16-P.x)<W/Z+60&&Math.abs(y*16-P.y)<H/Z+60;let rd=false;
 if(vis(WRK.x,WRK.y)&&!SORTALL){drawWreck(tm);if(Math.abs(P.x-(WRK.x*16+8))<30&&P.y>WRK.y*16+10&&P.y<WRK.y*16+40)rd=true}
 if(vis(HRM.x,HRM.y)&&!SORTALL){drawHut();if(Math.abs(P.x-(HRM.x*16+8))<30&&P.y>HRM.y*16-4&&P.y<HRM.y*16+20)rd=true}
 if(rd&&!dead)pP(tm);
 const q=QS[Q.i];if(Q.on&&q&&q.type==='hermit'&&Q.k<1){const n=NPCS.find(o=>o.id==='hermit');if(n&&vis(n.x/16,n.y/16)){const bx=Math.round(n.x),by=Math.round(n.y-30+Math.sin(tm*4)*1.5);g.save();g.font='700 11px "SQ Digits","Pixelify Sans",monospace';g.textAlign='center';g.lineWidth=3;g.lineJoin='round';g.strokeStyle=O;g.strokeText('!',bx,by);g.fillStyle='#f8d848';g.fillText('!',bx,by);g.restore()}}};
// --- the hermit ---
NPCS.push({kind:'folk',id:'hermit',name:'Old Hermit',isle:'Hermit\'s Isle',hx0:HRM.x*16+8,hy0:(HRM.y+1)*16+6,x:HRM.x*16+8,y:(HRM.y+1)*16+6,ch:{sk:0,hs:2,hc:6,sh:2,pn:2,ht:0,hcol:0,so:3}});
LINES.hermit={m:['Hm? A visitor? Nobody visits.','The gulls brought you, did they?'],d:['I came out here forty years ago to get away from people. It worked.','The water around Gull Rock sparkles. Rainbow fish bite there, if you\'re patient.','There\'s an old wreck to the southeast. The tide washes new salvage onto it every day.'],e:['Sunset is the only clock I keep.','Mind the rocks on your way back.'],n:['Can\'t sleep. Never can.','The stars out here are something else.'],x:['Before the bridge, Saltmere and Hollow didn\'t even speak. Funny what a road does.']};
JOBS.hermit=[{k:'berry',a:[8,14],s:3,x:8},{k:'rainbow',a:[1,2],s:9,x:150,r:()=>(inv.rainbow|0)>0||lvOf(9)>=20},{k:'pelt',a:[2,3],s:0,x:40,r:()=>lvOf(0)>=10},{k:'cswordfish',a:[1,2],s:4,x:120,r:()=>lvOf(9)>=35}];
const _fh26=folkHTML;folkHTML=function(n){let h=_fh26(n);if(n.isle)h=h.replace('<div class="tl">Saltmere</div>','<div class="tl">'+n.isle+'</div>');
 const q=QS[Q.i];if(n.id==='hermit'&&Q.on&&q&&q.type==='hermit'){if(Q.k<1){Q.k=1;say('Quest updated: return to Elder Rowan.');sfx('quest');saveLocal(true)}h=h.replace('</div>','</div><div class="qc" style="margin-top:10px"><b>'+q.n+'</b><p>"The Elder sent you all this way? Ha! Tell Rowan the old hermit is still alive."</p></div>')}
 if(n.id==='ida')h+=TL.boat?'<div class="qc" style="margin-top:10px"><b>Your sailboat</b><p>Face water and press USE to set sail. Gull Rock is north-east, a wreck lies south-east, and they say a hermit lives on an island far to the west.</p></div>'
  :'<div class="qc" style="margin-top:10px"><b>Sailboat</b><p>"Want to see the open sea? I\'ve a little sailboat for sale."</p><button class="qb xb" data-a="boat" style="opacity:'+(GLD>=250?1:.5)+'">Buy the sailboat (250 gold)</button></div>';
 return h};
const _xa26=xAct;xAct=function(a){if(a==='boat'){if(TL.boat)return;if(GLD<250){say('Not enough gold');sfx('swish');return}GLD-=250;TL.boat=1;say('The sailboat is yours! Face water and press USE to set sail.');sfx('quest');saveLocal(true);saveCloud();rPn();return}_xa26(a)};
// --- quest: Castaway (before Grandmaster) ---
const GI26=QS.findIndex(q=>q.n==='Grandmaster');
QS.splice(GI26,0,{n:'Castaway',d:'Buy a sailboat from Captain Ida in Saltmere, then sail west and find the hermit who lives alone on an island.',type:'hermit',amt:1,r:{g:300,xp:[9,1500]}});
const _qv26=qVal;qVal=function(q){return q.type==='hermit'?Q.k:_qv26(q)};
const remap26=qv=>{if(qv>=8)return;if(Q.i===GI26){Q.on=false;Q.k=0}else if(Q.i>GI26){Q.i=GI26;Q.on=false;Q.k=0;GMDONE=true}};
const _sn26=snap;snap=function(){const s=_sn26();s.qv=8;s.gmd=GMDONE?1:0;s.wreck=WRECK_DAY;s.sail=SAILING?1:0;return s};
const _ap26=applySave;applySave=function(S){_ap26(S);if(S.q)remap26(S.qv||0);WRECK_DAY=isFinite(S.wreck)?+S.wreck:-1;TL.boat=S.tl&&S.tl.boat?1:0;SAILING=false;
 if(S.sail&&S.p&&TL.boat){const x=+S.p.x,y=+S.p.y;if(isFinite(x)&&isFinite(y)&&boatOK(x,y)){P.x=x;P.y=y;SAILING=true}}};
const _ng26=newGame;newGame=function(){SAILING=false;WRECK_DAY=-1;_ng26()};
// map markers and music
const _dmap26=drawMap;drawMap=function(){_dmap26();const c=document.getElementById('mpc');if(!c)return;const x=c.getContext('2d');for(const[s,col]of[[GULL,'#68d8f8'],[WRK,'#c88848'],[HRM,'#f8d848']]){x.fillStyle='#101010';x.fillRect(s.x-1,s.y-1,3,3);x.fillStyle=col;x.fillRect(s.x,s.y,1,1)}};
const _ws26=wantSong;wantSong=function(){const w=_ws26();return SAILING&&w==='day'?'port':w};
const _icon26=iconURL;iconURL=function(k,col){if(k!=='rainbow'&&k!=='crainbow')return _icon26(k,col);const key='g26'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
 const C=k==='rainbow'?['#f86878','#f8b848','#f8e848','#68d878','#68a8f8','#a878f8']:['#c86048','#c88838','#c8a838','#78a858','#5888b8','#8868b8'];
 for(let i=0;i<6;i++)r(2+i,5,1,4,C[i]);r(3,4,5,1,C[2]);r(3,9,5,1,C[3]);r(8,5,1,4,C[5]);r(9,4,2,1,C[0]);r(10,5,1,4,C[0]);r(9,9,2,1,C[0]);r(3,6,1,1,'#202020');
 return ICONC[key]=c.toDataURL()};
