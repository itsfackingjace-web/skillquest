// ---------------------------------------------------------------- 96. No Man's Land: the lawless desert island (PvP everywhere)
// South of Briarwood and west of the Shattered Expanse. Mesas, cracked earth, cactus flats, a ghost town (Dustwater),
// Boot Hill, an old silver mine and an oasis. Giant scorpions, Cacticus (cactus monsters that pretend to be cacti)
// and desert bandits (they keep their distance and shoot; watch for the "!" and roll). PvP is always on here.
// Getting there: the "Lawless Waters" voyage from Sera, the Navigator in Tidewatch (after Into Briarwood), or sail off
// Briarwood's south edge / the Shattered Expanse's west edge once the route is charted.
{const K='#181018',ID='nomans';
 WORLD_REGIONS[ID]={id:ID,name:'No Man\'s Land',width:170,height:150,seed:2291.3,generationVersion:1,biome:'Lawless desert: mesas, cactus flats and a ghost town. PvP is always on',lv:'45–75',dir:'south-west',unlock:'nomansRoute',hint:'Chart the Lawless Waters from Tidewatch.'};
 ROUTE_ORDER.push(ID);REGION_SPAWNS[ID]={maxEnemies:26};RG_LMCOUNT[ID]=6;TRAVEL_KEYS.push('nomansRoute');if(TRAVEL_UNLOCKS.nomansRoute==null)TRAVEL_UNLOCKS.nomansRoute=false;
 WM.W=WM.H=360;Object.assign(WM_POS,{hollow:[180,180],briarwood:[62,170],ashfall:[302,176],ironcrest:[180,58],shattered:[196,302],nomans:[64,300]});
 WM_ROUTE[ID]={from:'Tidewatch',post:'tidewatch'};
 Object.assign(LM_NAMES,{deadmans_gulch:'Deadman\'s Gulch',rattlesnake_mesa:'Rattlesnake Mesa',silver_mine:'The Old Silver Mine',boot_hill:'Boot Hill',dustwater:'Dustwater (ghost town)',oasis:'Coyote Springs'});
 // ---- the voyage that charts it ----
 try{const tw=HARBOR_POSTS.find(p=>p.id==='tidewatch');if(tw)BUOYS.sw=buoySpot(boatWater(tw.x,tw.y),16,N-16)}catch(e){}
 VOYS.push({id:'lawless',name:'Lawless Waters',post:'tidewatch',needs:['briar'],buoy:'sw',gold:150,unlock:['nomansRoute'],
  d:'Nobody charts the south-western lane: it leads to No Man\'s Land, where there is no law and everyone fights everyone. Find the lane anyway, if you dare.',steps:['Sail your boat to the red buoy far south-west of Hollow Island','Report to Sera, the Navigator in Tidewatch']});

 // ---- the land ----
 RG_GENS[ID]=function*(D){const C=rgCtx(D),{W,H,T}=C;
  rgLand(C,[[W*.5,H*.52,W*.42,H*.4],[W*.26,H*.3,W*.17,H*.15],[W*.74,H*.76,W*.2,H*.13]],.8,26);rgKeep(C,400);yield;
  const dw=rgDist(C,i=>T[i]===0);
  for(let i=0;i<C.N2;i++)if(T[i]){const x=i%W,y=(i/W)|0;let t=dw[i]<=2?1:5;
   if(t===5&&C.fbm(x,y,14,3)>.6)t=10;                                                   // cracked earth
   if(dw[i]>=3&&dw[i]<=5&&C.fbm(x,y,9,6)>.6)t=2;                                        // scrub by the shore
   if(dw[i]>8&&1-Math.abs(2*C.fbm(x,y,22,11)-1)>.9)t=3;                                 // mesa ridges
   T[i]=t}
  rgDock(C,'e',8);yield;
  // Rattlesnake Mesa: a great flat-topped rock
  const ms=rgSite(C,.3,.62,18,14,{mtn:true});const[mx,my]=rgCenter(ms);for(let k=0;k<5;k++)rgBlob(C,mx+(C.rnd()-.5)*8,my-2+(C.rnd()-.5)*6,3+C.rnd()*2,3,t=>t!==0);
  rgSign(C,mx-1,ms.y+ms.h-2,'Rattlesnake Mesa','Rattlesnake Mesa. Climbers say there\'s silver up top. Climbers say a lot of things, before the rattlers get them.');rgMark(C,'rattlesnake_mesa','Rattlesnake Mesa',mx,my);
  // Coyote Springs: an oasis
  const oa=rgSite(C,.62,.3,12,10);const[ox,oy]=rgCenter(oa);rgFlat(C,oa,(x,y)=>Math.hypot(x-ox,y-oy)<3.2?0:2);rgMark(C,'oasis','Coyote Springs',ox,oy+4);
  rgSign(C,oa.x+1,oa.y+oa.h-1,'Coyote Springs','Coyote Springs. The only sweet water for miles. Everybody drinks here, so everybody fights here.');
  // Dustwater, the ghost town
  const tn=rgSite(C,.5,.56,22,14);rgFlat(C,tn,(x,y)=>y===tn.y+7||y===tn.y+8?14:5);const[tx,ty]=rgCenter(tn);
  rgLm(C,'nmsaloon',tn.x+2,tn.y+4,6,3,{use:'look',name:'The Last Chance Saloon',text:'The Last Chance Saloon. The doors still swing. A sign behind the bar reads: "NO LAW. NO CREDIT. NO REFUNDS."'});
  rgLm(C,'nmshack',tn.x+10,tn.y+5,4,2,{use:'look',name:'Sheriff\'s office',text:'The sheriff\'s office. The star on the door is riddled with bullet holes. Nobody has worn it in years.'});
  rgLm(C,'nmshack',tn.x+15,tn.y+5,4,2,{v:1});rgLm(C,'nmwater',tn.x+19,tn.y+3,2,2);rgLm(C,'nmshack',tn.x+3,tn.y+10,4,2,{v:1});rgLm(C,'nmshack',tn.x+13,tn.y+10,4,2);
  rgLm(C,'cart',tn.x+9,tn.y+11,1,1);rgLm(C,'crates',tn.x+18,tn.y+11,1,1);rgSign(C,tn.x+1,tn.y+7,'Dustwater','DUSTWATER. Population: nobody you\'d want to meet.');rgMark(C,'dustwater','Dustwater',tx,ty);
  // Boot Hill
  const bh=rgSite(C,.78,.55,10,8);rgFlat(C,bh,10);const[bx,by]=rgCenter(bh);for(let k=0;k<9;k++)rgLm(C,'nmgrave',bh.x+1+(k%5)*2,bh.y+1+Math.floor(k/5)*3,1,1);
  rgSign(C,bh.x,bh.y+bh.h-1,'Boot Hill','Boot Hill. Here lie the ones who drew second.');rgMark(C,'boot_hill','Boot Hill',bx,by);
  // the Old Silver Mine
  const sm=rgSite(C,.22,.26,12,9,{mtn:true});rgFlat(C,sm,10);const[sx,sy]=rgCenter(sm);rgLm(C,'nmmine',sx-1,sm.y+1,3,2,{use:'look',name:'The Old Silver Mine',text:'The Old Silver Mine. The tunnel has caved in a few steps past the timbers. The rails still lead in.'});
  rgLm(C,'cart',sm.x+2,sm.y+5,1,1);rgLm(C,'crates',sm.x+8,sm.y+5,1,1);rgMark(C,'silver_mine','The Old Silver Mine',sx,sy);
  // Deadman's Gulch
  const dg=rgSite(C,.42,.82,14,9);rgFlat(C,dg,10);const[gx,gy]=rgCenter(dg);rgLm(C,'bones',gx-1,gy,2,1);rgLm(C,'tent',dg.x+2,dg.y+2,2,1);rgLm(C,'firepit',dg.x+9,dg.y+3,1,1);
  rgSign(C,dg.x+1,dg.y+dg.h-1,'Deadman\'s Gulch','Deadman\'s Gulch. The bandits camp here. The bones are a warning. Most people don\'t read it.');rgMark(C,'deadmans_gulch','Deadman\'s Gulch',gx,gy);
  const d1=rgSite(C,.84,.24,8,8);rgFlat(C,d1,10);rgRes(C,'nm_dun1','dungeon',d1);
  const st={trail:14,pass:14,wide:1};for(const q of[ms,oa,tn,bh,sm,dg,d1]){rgTrail(C,C.spawn,rgSouth(q),st);yield}
  yield;rgScatter(C,(t,x,y,z,r)=>t===5?(r<.022?'cactus':r<.03?'rock':r<.033?'tree:dead':null):t===10?(r<.035?'rock':r<.041?'ore':r<.05?'tree:dead':null):t===2?(r<.05?'bush':r<.08?'tree':null):t===1?(r<.008?'rock':null):null);
  yield;rgConnect(C,t=>'rock');return rgFinish(C)};
 RG_GEN[ID]=D=>rgRunSync(RG_GENS[ID](D));

 // ---- landmarks: the saloon, shacks, water tower, mine and graves ----
 {const _dl=rgDrawLm;rgDrawLm=function(it,tm){if(!it.k||it.k.slice(0,2)!=='nm')return _dl(it,tm);const x0=it.x*16,y0=it.y*16,w=(it.w||1)*16,base=y0+(it.h||1)*16,R=(a,b,c,d,e)=>Rg(Math.round(a),Math.round(b),c,d,e);
   if(it.k==='nmgrave'){shd(x0+8,base-2,10);R(x0+6,base-17,4,15,K);R(x0+2,base-13,12,4,K);R(x0+7,base-16,2,13,'#8a6a44');R(x0+3,base-12,10,2,'#8a6a44');R(x0+5,base-3,6,2,'#6a5a48');return}
   shd(x0+w/2,base-2,w*.9);
   if(it.k==='nmwater'){for(const lx of[x0+3,x0+w-6])R(lx,base-26,3,26,K),R(lx+1,base-25,1,25,'#7a5a38');R(x0,base-46,w,22,K);R(x0+1,base-45,w-2,20,'#9a7048');for(let k=0;k<4;k++)R(x0+1,base-41+k*5,w-2,1,'#6a4a2a');R(x0-2,base-48,w+4,4,K);R(x0-1,base-47,w+2,2,'#7a5a38');return}
   if(it.k==='nmmine'){R(x0,base-30,w,30,K);R(x0+1,base-29,w-2,29,'#5a4a3a');R(x0+8,base-24,w-16,24,'#0c0808');R(x0+4,base-28,6,28,'#8a6a44');R(x0+w-10,base-28,6,28,'#8a6a44');R(x0+2,base-31,w-4,6,'#9a7a50');R(x0+2,base-31,w-4,1,'#c0a070');
    for(let k=0;k<3;k++)R(x0+w/2-6,base-2-k*6,12,1,'#6a6058');R(x0+w/2-7,base-20,2,20,'#4a4038');R(x0+w/2+5,base-20,2,20,'#4a4038');return}
   const wall=it.v?'#8a7056':'#a88a62',dk=it.v?'#6a5240':'#86683e',tall=it.k==='nmsaloon'?44:30;
   // plank walls with a false front
   R(x0,base-tall,w,tall,K);R(x0+1,base-tall+1,w-2,tall-1,wall);for(let yy=base-tall+5;yy<base;yy+=5)R(x0+1,yy,w-2,1,dk);
   if(it.k==='nmsaloon'){R(x0-2,base-tall-2,w+4,4,K);R(x0-1,base-tall-1,w+2,2,'#6a4a2a');
    // sign
    R(x0+w/2-26,base-tall+4,52,11,K);R(x0+w/2-25,base-tall+5,50,9,'#e8d0a0');g.save();g.font='700 7px '+PF;g.fillStyle='#5a2a14';g.textAlign='center';g.textBaseline='middle';g.fillText('SALOON',x0+w/2,base-tall+10);g.restore();
    // porch roof, posts, windows, swinging doors
    R(x0-3,base-22,w+6,4,K);R(x0-2,base-21,w+4,2,'#7a5a38');for(const px of[x0,x0+w-3,x0+w/2-14,x0+w/2+11])R(px,base-19,3,19,'#6a4a2a');
    for(const wx of[x0+8,x0+w-22]){R(wx,base-17,14,10,K);R(wx+1,base-16,12,8,'#f8d880');R(wx+6,base-16,1,8,K)}
    const sw=Math.round(Math.sin(tm*1.4)*1.5);R(x0+w/2-8,base-16,16,14,'#20140c');R(x0+w/2-7+sw,base-13,6,8,'#a07040');R(x0+w/2+1-sw,base-13,6,8,'#a07040');return}
   // a shack: roof, a door and a window
   R(x0-2,base-tall-3,w+4,5,K);R(x0-1,base-tall-2,w+2,3,'#6a4a2a');R(x0+w/2-5,base-15,10,15,K);R(x0+w/2-4,base-14,8,14,'#5a3a20');R(x0+w/2+2,base-8,1,1,'#e0c080');
   R(x0+5,base-22,10,8,K);R(x0+6,base-21,8,6,it.v?'#3a3030':'#f0d090');if(it.v){R(x0+6,base-21,8,1,'#8a6a44');R(x0+9,base-19,1,4,'#8a6a44')}}}

 // ---- the creatures ----
 RG_FAUNA[ID]={tier:3,cap:{day:5,night:8},xp:2.2,day:[['bandit',44,.35],['cacti',36,.7],['gscorp',60,1]],night:[['bandit',44,.4],['gscorp',60,.72],['skel:dust',30,1]],pack:{bandit:2}};
 {const _mk=rgMake;rgMake=function(key,hp,x,y){if(key==='gscorp'){const n=mkScorp(x,y);n.type='gscorp';n.big=1;n.hp=n.mhp=hp;n.rk=key;return n}
   if(key==='cacti')return{x,y,hp,mhp:hp,kx:0,ky:0,type:'cacti',st:'sleep',cd:2+Math.random(),rk:key};
   if(key==='bandit')return{x,y,hp,mhp:hp,kx:0,ky:0,type:'bandit',cd:1.5+Math.random(),aim:0,side:Math.random()<.5?1:-1,swap:2+Math.random()*2,look:Math.floor(Math.random()*3),rk:key};
   return _mk(key,hp,x,y)}}
 const NMP=[];window.SQNMP=NMP;
 const nmR=()=>{const R=SCENE&&SCENE.room;return R&&R.region===ID?R:null};
 const roll=()=>typeof ROLLT!=='undefined'&&ROLLT>0;
 function gscorpAI(n,ox,oy,dt){if(n.frozen>0){n.x=ox;n.y=oy;return}const dx=P.x-n.x,dy=P.y-n.y,d=Math.hypot(dx,dy)||1;n.x=ox+n.kx*.3;n.y=oy+n.ky*.3;
  if(n.ss==='walk'){if(d>30&&d<190)stepTo(n,dx/d*34*dt,dy/d*34*dt);if((n.st2-=dt)<=0&&d<46){n.ss='wind';n.st2=.65;n.ax=dx/d;n.ay=dy/d}}
  else if(n.ss==='wind'){if((n.st2-=dt)<=0){n.ss='strike';n.st2=.18;EMERGE45.push({x:n.x+n.ax*30,y:n.y+n.ay*30-4,t:0,c:'#ff9050',r:14});if(inArc(n,n.x,n.y,48,n.ax,n.ay,.5))hurtP(2,'The giant scorpion\'s stinger slams into you!');sfx('swish')}}
  else if(n.ss==='strike'){if((n.st2-=dt)<=0){n.ss='rest';n.st2=.9}}else if(n.ss==='rest'){if((n.st2-=dt)<=0){n.ss='walk';n.st2=.5+Math.random()*.8}}}
 function cactiAI(n,ox,oy,dt){const dx=P.x-n.x,dy=P.y-n.y,d=Math.hypot(dx,dy)||1;
  if(n.st==='sleep'){n.x=ox;n.y=oy;n.kx=n.ky=0;if(d<56||n.hp<n.mhp){n.st='wake';n.wt=.5;sfx('rustle')}return}
  if(n.st==='wake'){n.x=ox;n.y=oy;if((n.wt-=dt)<=0)n.st='walk';return}
  n.x=ox+n.kx*.4;n.y=oy+n.ky*.4;if(n.frozen>0)return;if(d>12&&d<200)stepTo(n,dx/d*22*dt,dy/d*22*dt);
  if((n.cd-=dt)<=0&&d<150){n.cd=2.8+Math.random()*.8;n.puff=.25;for(let k=0;k<8;k++){const a=k/8*6.283+(n.t2=(n.t2||0)+.2);NMP.push({x:n.x,y:n.y-10,vx:Math.cos(a)*95,vy:Math.sin(a)*95,t:1.6,k:'needle'})}sfx('swish')}}
 function banditAI(n,ox,oy,dt){const dx=P.x-n.x,dy=P.y-n.y,d=Math.hypot(dx,dy)||1;n.x=ox+n.kx*.4;n.y=oy+n.ky*.4;if(n.frozen>0)return;n.fl=dx<0;n.mv=0;
  if(n.aim>0){n.aim-=dt;if(n.aim<=0){const a=Math.atan2(dy+4,dx)+(Math.random()-.5)*.12;NMP.push({x:n.x+Math.cos(a)*10,y:n.y-8+Math.sin(a)*6,vx:Math.cos(a)*165,vy:Math.sin(a)*165,t:1.4,k:'bullet'});n.flash=.08;sfx('swish')}return}
  if((n.swap-=dt)<=0){n.swap=1.5+Math.random()*2;n.side=-n.side}
  let mx=0,my=0;if(d>130){mx=dx/d;my=dy/d}else if(d<72){mx=-dx/d;my=-dy/d}mx+=-dy/d*.7*n.side;my+=dx/d*.7*n.side;const l=Math.hypot(mx,my)||1;stepTo(n,mx/l*36*dt,my/l*36*dt);n.mv=1;
  if((n.cd-=dt)<=0&&d<175){n.cd=1.7+Math.random()*.7;n.aim=.4}}
 {const _u=upd;upd=function(dt){const R=nmR(),paused=menuOpen||pnOpen||dead;const pos=R&&!paused?en.map(n=>[n,n.x,n.y]):null;_u(dt);if(!R||paused)return;
   for(const[n,ox,oy]of pos){if(n.dead)continue;n.t=(n.t||0)+dt;if(n.flash>0)n.flash-=dt;if(n.puff>0)n.puff-=dt;
    if(n.type==='gscorp')gscorpAI(n,ox,oy,dt);else if(n.type==='cacti')cactiAI(n,ox,oy,dt);else if(n.type==='bandit')banditAI(n,ox,oy,dt)}
   for(const b of NMP){b.t-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(solid(b.x,b.y+4)){b.t=0;continue}
    if(Math.hypot(P.x-b.x,P.y-6-b.y)<8&&!roll()&&!dead){b.t=0;hurtP(1,b.k==='bullet'?'A bandit\'s bullet hits you!':'Cactus needles!')}}
   for(let i=NMP.length-1;i>=0;i--)if(NMP[i].t<=0)NMP.splice(i,1)}}
 {const _lr=leaveRegion;leaveRegion=function(...a){NMP.length=0;return _lr(...a)}}
 // ---- how they look ----
 function drawCacti(n,tm){const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,G=hit?'#ffffff':'#3c9a38',Gd=hit?'#e0e0e0':'#2a7028',Gl=hit?'#ffffff':'#6cc858',awake=n.st!=='sleep',
   w=awake&&n.st==='walk'?Math.floor(n.t*5)%2:0,R=(a,b,c,d,e)=>Rg(a,b,c,d,e);shd(x,y+6,14);
  // feet
  if(awake){R(x-6,y+2+(w?-1:0),5,5,K);R(x+1,y+2+(w?0:-1),5,5,K);R(x-5,y+3+(w?-1:0),3,3,Gd);R(x+2,y+3+(w?0:-1),3,3,Gd)}
  // trunk and arms (a saguaro)
  R(x-6,y-24,12,29,K);R(x-5,y-23,10,27,G);R(x-5,y-23,3,27,Gl);R(x+3,y-23,2,27,Gd);
  const au=awake?Math.round(Math.sin(n.t*6)*2):0;R(x-13,y-16+au,8,5,K);R(x-13,y-24+au,5,12,K);R(x-12,y-15+au,7,3,G);R(x-12,y-23+au,3,10,G);
  R(x+5,y-12-au,8,5,K);R(x+8,y-20-au,5,12,K);R(x+5,y-11-au,7,3,G);R(x+9,y-19-au,3,10,G);
  for(const[a,b]of[[-3,-18],[2,-12],[-2,-6],[3,-2],[-11,-20],[10,-16]])R(x+a,y+b,1,1,'#f0f0d0');
  // flower and face
  R(x-3,y-28,6,5,K);R(x-2,y-27,4,3,'#f070a0');R(x-1,y-27,2,2,'#f8e060');
  if(awake){R(x-4,y-17,3,3,K);R(x+1,y-17,3,3,K);R(x-3,y-16,1,1,'#f8e060');R(x+2,y-16,1,1,'#f8e060');R(x-3,y-11,6,2,K);if(n.puff>0)R(x-2,y-11,4,1,'#f04040')}
  if(n.st==='wake'){R(x-1,y-38,2,6,K);R(x-1,y-30,2,2,K)}
  nmBar(n,x,y-34)}
 const BLOOK=[{sk:2,hs:0,hc:0,sh:7,pn:2,ht:0,hcol:4,so:3},{sk:1,hs:1,hc:1,sh:4,pn:1,ht:0,hcol:4,so:3},{sk:3,hs:0,hc:0,sh:0,pn:2,ht:0,hcol:4,so:2}];
 function drawBandit(n,tm){const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,st=n.mv?[1,0,2,0][Math.floor(n.t*7)%4]:0,fl=!!n.fl,dir=2;shd(x,y+6,12);GC=g;
  if(hit){g.save();g.globalAlpha=.6}try{cP(BLOOK[n.look||0],dir,st,x,y,fl)}catch(e){}if(hit)g.restore();
  const s=fl?-1:1,R=(a,b,c,d,e)=>Rg(a,b,c,d,e);
  // a bandana over the face and a wide cowboy hat
  R(x-4+(fl?-1:1),y-7,8,3,'#c03028');R(x-4+(fl?-1:1),y-7,8,1,'#e05048');
  R(x-8,y-16,16,3,K);R(x-7,y-15,14,1,'#6a4424');R(x-5,y-21,10,6,K);R(x-4,y-20,8,5,'#7a5230');R(x-4,y-16,8,1,'#3a2414');
  // the revolver
  const gx=x+s*5,gy=y-4;R(Math.min(gx,gx+s*7),gy-1,8,4,K);R(Math.min(gx,gx+s*6),gy,7,2,'#8a8a98');R(gx,gy+1,2,3,'#5a3a20');
  if(n.flash>0){R(gx+s*8-2,gy-2,5,5,'#fff0a0');R(gx+s*8-1,gy-1,3,3,'#ffffff')}
  if(n.aim>0&&Math.floor(tm*16)%2){R(x-1,y-38,3,7,K);R(x,y-37,1,4,'#f8d048');R(x-1,y-30,3,3,K);R(x,y-29,1,1,'#f8d048')}
  nmBar(n,x,y-32)}
 function drawGScorp(n,tm){const x=n.x,y=n.y;g.save();g.translate(x,y);g.scale(1.8,1.8);g.translate(-x,-y);try{drawScorp(n,tm)}finally{g.restore()}nmBar(n,Math.round(x),Math.round(y)-34)}
 function nmBar(n,x,y){if(!(n.hp<n.mhp))return;const w=24,f=Math.max(0,n.hp/n.mhp);Rg(x-w/2-1,y-1,w+2,4,K);Rg(x-w/2,y,Math.round(w*f),2,'#e04848')}
 {const _ps=pS;pS=function(n,tm){if(n){if(n.type==='cacti')return drawCacti(n,tm);if(n.type==='bandit')return drawBandit(n,tm);if(n.type==='gscorp')return drawGScorp(n,tm)}return _ps(n,tm)}}
 {const _pp=pP;pP=function(tm){_pp(tm);if(!nmR())return;for(const b of NMP){if(b.k==='bullet'){Rg(b.x-2,b.y-2,4,4,K);Rg(b.x-1,b.y-1,2,2,'#f8e070')}else{const a=Math.atan2(b.vy,b.vx);for(let i=0;i<5;i++)Rg(Math.round(b.x-Math.cos(a)*i),Math.round(b.y-Math.sin(a)*i),1,1,i?'#e8e0b0':'#ffffff')}}}}
 // what they drop
 {const _ed=enemyDrop;enemyDrop=function(n){if(!n||!(n.type==='bandit'||n.type==='cacti'||n.type==='gscorp'))return _ed(n);const got=[];
   if(n.type==='bandit'){const gd=20+Math.floor(Math.random()*41);GLD+=gd;got.push(gd+' gold');if(Math.random()<.25){inv.iarrow=(inv.iarrow|0)+5;got.push('5 iron arrows')}if(Math.random()<.06){inv.pot_heal=(inv.pot_heal|0)+1;got.push('a healing potion')}try{sqEvent('kill','bandit')}catch(e){}}
   if(n.type==='cacti'){const c=1+Math.floor(Math.random()*3);inv.cfruit=(inv.cfruit|0)+c;got.push(c+' cactus fruit')}
   if(n.type==='gscorp'){const gd=15+Math.floor(Math.random()*16);GLD+=gd;got.push(gd+' gold');if(Math.random()<.12){inv.sbar=(inv.sbar|0)+1;got.push('a steel bar')}}
   say('+'+got.join(', '));try{svg()}catch(e){}}}

 // ---- PvP is always on here ----
 let forced=false,was=false,warnAt=0;
 {const _u=upd;upd=function(dt){_u(dt);const PV=window.SQPVP;if(!PV)return;const here=curRegion()===ID||(SCENE&&SCENE.prev&&SCENE.prev.room&&SCENE.prev.room.region===ID);
   if(here&&window.SQMPON&&SQMPON()){if(!PV.on){if(!forced){was=false;forced=true;const n=performance.now();if(n-warnAt>4000){warnAt=n;say('No Man\'s Land: there is no law here. PvP is ON for everyone.');msgT=5;try{sfx('quest')}catch(e){}}}else if(forced&&performance.now()-warnAt>2500){warnAt=performance.now();say('You can\'t turn PvP off in No Man\'s Land.')}PV.on=true}else if(!forced){forced=true;was=true}}
   else if(forced){forced=false;if(!was&&!(PV.fight&&performance.now()-PV.fight<30000)){PV.on=false;say('You leave No Man\'s Land. PvP is off again.')}}}}

 // ---- the world map draws every island's outline ahead of time (it used to take ~20s on a phone after opening it) ----
 {const next=()=>ROUTE_ORDER.find(id=>id!=='hollow'&&!RG_THUMB[id]);let bg=2;
  const _u=upd;upd=function(dt){_u(dt);if(TRAVEL49||dead)return;if((bg-=dt)>0)return;bg=.4;const id=next();if(id)try{rgThumb(id)}catch(e){console.warn(e)}};
  // while the WORLD map is open, build much faster and redraw as each island appears
  setInterval(()=>{try{if(typeof MAPVIEW==='undefined'||MAPVIEW!=='world'||!pnOpen||ptab!==5)return;const id=next();if(!id)return;const t0=performance.now();while(performance.now()-t0<45&&next()===id&&!RG_THUMB[id])rgThumb(id);if(RG_THUMB[id])drawMap()}catch(e){console.warn(e)}},90)}
 // a desert: no rain, the odd dust storm
 {const _b=biomeHere;biomeHere=function(){const R=SCENE&&SCENE.room;if(R&&R.region===ID)return'desert';return _b()}}
 // ---- sailing between neighbours: Briarwood (north) and the Shattered Expanse (east) ----
 window.SQNEIGH={nomans:{north:'briarwood',east:'shattered'},briarwood:{south:'nomans'},shattered:{west:'nomans'}};
 {const _tc=travelCommit;travelCommit=function(T){_tc(T);if(T&&T.to===ID){NMP.length=0;setTimeout(()=>{try{say('No Man\'s Land. There is no law here: PvP is always on.');msgT=6}catch(e){}},400)}}}

 // ---- wiki ----
 try{WK_RGN&&Object.assign(WK_RGN,{bandit:'Desert bandit',cacti:'Cacticus',gscorp:'Giant scorpion'})}catch(e){}
}
// ---- island boss art, drawn with the world bosses' toolkit (shaded, outlined) ----
// Each boss has poses: idle (4 frames), move (4-frame walk / crawl / slither / drift), and for attacks a wind-up
// pose and a strike pose (which pose depends on the attack: the warlord's overhead swing vs. his charge, etc.).
{const KIT=()=>window.SQKIT,CACHE={};
 function art(id,pose,atk,fr){const key=id+'|'+pose+'|'+atk+'|'+fr;if(CACHE[key])return CACHE[key];return CACHE[key]=ART[id](pose,atk,fr)}
 const ART={
 // ---------- The Briar Queen ----------
 briarwood:(pose,atk,fr)=>{const k=KIT()(64,50,0,'#0e1408'),{poly,ell,chain,px,curve,mir}=k,CX=32;
  const BD=['#26401a','#3e6428','#62903e','#121e0a'],BD2=['#1e3214','#34542a','#527a40','#0e1608'],LG=['#24160c','#3e2814','#5e4024','#100804'],LG2=['#2e1c0e','#4a3018','#6e4a28','#140a04'],TH=['#9a8450','#d0bc84','#f4ecc4','#40341a'],RS=['#7a1430','#c0304e','#f07090','#3a0614'],LF=['#1e4a1c','#2e6e2a','#4e9a3e','#0e240c'];
  const rear=pose==='wind'?1:pose==='strike'?.6:0,air=pose==='air',gait=pose==='move'?3:pose==='idle'?(fr%2):0,by=(pose==='idle'&&fr%2?1:0)-(air?2:0);
  // legs [root, knee, foot] (right side; the left side mirrors), back to front
  const L0=[[[10,30],[18,36],[22,47]],[[12,26],[24,27],[29,39]],[[12,21],[26,16],[31,28]],[[10,16],[22,6],[29,15]]];
  for(let k2=3;k2>=0;k2--)for(const s of[-1,1]){let[[rx,ry],[kx,ky],[fx,fy]]=L0[k2];const up=((k2+(s>0?1:0))%2===fr%2)?gait:0;ky-=up;fy-=up*.6;
   if(rear&&k2<=1){kx+=6*rear;ky+=(k2?2:6)*rear;fx+=(k2?8:12)*rear;fy+=(k2?6:12)*rear}
   if(air){kx=kx*.7+4;fx=fx*.6+6;ky-=4;fy-=10}
   ry+=by-rear*4;ky+=by;fy+=by*.5;
   chain(curve(CX+s*rx,ry,CX+s*kx,ky,s*.1,1.4,1,9),LG);chain(curve(CX+s*kx,ky,CX+s*fx,fy,-s*.06,1,.55,9),LG2);px(CX+s*kx,ky-1,LG[2]);px(CX+s*fx,fy,'#100804')}
  const ay=by-rear*3;
  // abdomen with thorns, moss and the rose
  ell(CX,17+ay,13,11,BD);for(const[x,y,h]of[[-9,11,5],[9,11,5],[-12,18,5],[12,18,5],[-6,7,4],[6,7,4],[-11,24,4],[11,24,4]])poly([[CX+x-2,y+1+ay],[CX+x+(x<0?-1:1)*1.5,y-h+ay],[CX+x+2,y+1+ay]],TH);
  for(const[x,y,r]of[[-5,16,2.5],[5,16,2.5],[0,21,2]])ell(CX+x,y+ay,r,r*.6,LF,{noLine:1});
  ell(CX-5,6.5+ay,3.5,2,LF);ell(CX+5,6.5+ay,3.5,2,LF);ell(CX,6+ay,4.5,4,RS);ell(CX-.5,5+ay,2.4,2,['#a02040','#e04a6a','#ff9ab0','#5a0a20'],{noLine:1});px(CX,4+ay,'#ffd0dc');
  // thorax, head, eyes, fangs
  const ty=by-rear*5;ell(CX,30+ty,9,6.5,BD);ell(CX,36+ty,7,5,BD2);
  for(const[x,y]of[[-3,34],[3,34],[-2,36],[2,36],[-4,37],[4,37]])px(CX+x,y+ty,pose==='wind'||pose==='strike'?'#ff7040':'#ff3838');px(CX-3,33+ty,'#ffd0d0');px(CX+3,33+ty,'#ffd0d0');
  const fo=pose==='strike'?3:pose==='wind'?1:fr%2;poly([[CX-4,39+ty],[CX-2,39+ty],[CX-3-fo,44+ty]],TH);poly([[CX+2,39+ty],[CX+4,39+ty],[CX+3+fo,44+ty]],TH);
  if(pose==='strike'&&atk==='fan'){ell(CX,43+ty,2.5,2,['#c8c8c8','#e8e8e8','#ffffff','#7a7a7a'])}
  return k.done()},
 // ---------- The Iron Warlord (faces right; flipped when you're on his left) ----------
 ashfall:(pose,atk,fr)=>{const k=KIT()(80,90,24,'#0c0c10'),{poly,ell,chain,px,curve}=k,CX=30;
  const ST=['#40424e','#6c7080','#a4aabc','#1a1b22'],DK=['#24262e','#3a3e4c','#565a6c','#0e0e14'],CP=['#4a0e0e','#7a1a16','#a83020','#220606'],GD=['#7a5414','#b88a28','#ecc862','#3a2606'],BL=['#7a808a','#bcc2cc','#f2f6fc','#30343c'],EM=['#a83010','#f06020','#ffb050','#4a1004'],HN=['#7a7060','#b0a48a','#e8dec4','#3a342a'],GR=['#3a1a0a','#5a3018','#7a4822','#1a0a04'];
  const step=pose==='move'?[0,1,0,-1][fr]:0,run=pose==='run',crouch=pose==='wind'&&atk==='charge'?3:run?2:0,b=(pose==='idle'?fr%2:pose==='move'?Math.abs(step):0)+crouch,lean=run?3:atk==='charge'&&pose==='wind'?1:0;
  const X=v=>CX+v;
  // cape behind (it flows back when he runs)
  const cw=run?-6:pose==='move'?-step:0;poly([[X(-11+lean),20+b],[X(11+lean),20+b],[X(15+cw),56],[X(9+cw),54],[X(4+cw),57],[X(-2+cw),54],[X(-8+cw),57],[X(-15+cw),55]],CP);
  // legs: one forward, one back while walking or running
  const lg=run?[4,-4]:[step*3,-step*3];for(const[s,o]of[[-1,lg[0]],[1,lg[1]]]){const lx=X(s*4.5+o*.6),lift=o>0?Math.min(2,o*.6):0;poly([[lx-3.5,42],[lx+3.5,42],[lx+3+o*.3,55-lift],[lx-3+o*.3,55-lift]],ST);ell(lx,48-lift*.5,3.4,2.2,DK,{noLine:1});poly([[lx-4.5+o*.3,55-lift],[lx+4.5+o*.3,55-lift],[lx+5+o*.3,60-lift],[lx-4.5+o*.3,60-lift]],DK)}
  // torso
  const T=v=>X(v+lean);poly([[T(-10),21+b],[T(10),21+b],[T(7),43],[T(-7),43]],ST);poly([[T(-2),23+b],[T(2),23+b],[T(1),40],[T(-1),40]],DK);
  for(const[x,y]of[[-6,28],[5,28],[-6,34],[5,34]])poly([[T(x),y+b],[T(x+2),y+b],[T(x+2),y+1+b],[T(x),y+1+b]],EM,{noLine:1});
  poly([[T(-8),40],[T(8),40],[T(8),43],[T(-8),43]],DK);poly([[T(-2),40],[T(2),40],[T(2),43],[T(-2),43]],GD);
  // the off-hand arm
  ell(T(-12),24+b,5.5,4.5,ST);poly([[T(-16),26+b],[T(-10),26+b],[T(-10),37+b],[T(-15),37+b]],ST);ell(T(-12.5),39+b,3.2,3,DK);
  // the sword arm and the greatsword, by pose
  const shoulder=[T(12),24+b];ell(shoulder[0],shoulder[1],5.5,4.5,ST);
  const sword=(hx,hy,ax,ay)=>{const L=30,px2=-ay,py2=ax;// blade along (ax,ay) from the hand
   poly([[hx+ax*5+px2*1.6,hy+ay*5+py2*1.6],[hx+ax*L+px2*1.6,hy+ay*L+py2*1.6],[hx+ax*(L+3),hy+ay*(L+3)],[hx+ax*L-px2*1.6,hy+ay*L-py2*1.6],[hx+ax*5-px2*1.6,hy+ay*5-py2*1.6]],BL);
   poly([[hx+ax*4+px2*5,hy+ay*4+py2*5],[hx+ax*5+px2*5,hy+ay*5+py2*5],[hx+ax*5-px2*5,hy+ay*5-py2*5],[hx+ax*4-px2*5,hy+ay*4-py2*5]],GD);
   poly([[hx-ax*3+px2,hy-ay*3+py2],[hx+ax*4+px2,hy+ay*4+py2],[hx+ax*4-px2,hy+ay*4-py2],[hx-ax*3-px2,hy-ay*3-py2]],GR);ell(hx-ax*4,hy-ay*4,1.6,1.6,GD)};
  const arm=(hx,hy)=>{chain([[shoulder[0],shoulder[1]+2,3],[(shoulder[0]+hx)/2,(shoulder[1]+hy)/2,2.8],[hx,hy,2.6]],ST);ell(hx,hy,3.2,3,DK)};
  if(pose==='wind'&&atk==='sweep'){const hx=T(4),hy=8;sword(hx,hy,-.55,-.83);arm(hx,hy)}                    // raised high over the shoulder
  else if(pose==='strike'&&atk==='sweep'){const hx=T(20),hy=31;sword(hx,hy,1,0);arm(hx,hy)}                 // swung out flat
  else if(atk==='charge'&&(pose==='wind'||run)){const hx=T(17),hy=34+b;sword(hx,hy,.96,.28);arm(hx,hy)}      // held forward for the charge
  else if(atk==='circles'&&(pose==='wind'||pose==='strike')){const hx=T(14),hy=10;sword(hx,hy,.05,-1);arm(hx,hy)}  // raised to the sky: fire rains down
  else{const hx=T(15),hy=38+b-(pose==='move'?step:0);sword(hx,hy,0,1);arm(hx,hy)}                         // resting point-down
  // helmet: horns, visor glowing hotter when he attacks
  const H=v=>X(v+lean+(run?1:0)),hy=b+(run?2:0);poly([[H(-6),10+hy],[H(-11),3+hy],[H(-8),11+hy]],HN);poly([[H(6),10+hy],[H(11),3+hy],[H(8),11+hy]],HN);
  ell(H(0),12+hy,7.5,7.5,ST);poly([[H(-7),12+hy],[H(7),12+hy],[H(6),19+hy],[H(-6),19+hy]],ST);poly([[H(-6),13+hy],[H(6),13+hy],[H(6),15+hy],[H(-6),15+hy]],DK,{noLine:1});
  const hot=pose==='wind'||pose==='strike'||run;for(let x=-5;x<=5;x++)px(H(x),14+hy,hot?(x%2?'#ffe080':'#ffffff'):(x%3?'#ff8030':'#ffd070'));
  return k.done()},
 // ---------- The Frost Wyrm ----------
 ironcrest:(pose,atk,fr)=>{const k=KIT()(68,68,0,'#0a1420'),{poly,ell,chain,px,curve}=k,CX=34;
  const SC=['#3e6a98','#6ea4d8','#bce4ff','#16283e'],SD=['#30587e','#5a8cbc','#9ccaf0','#16283e'],BE=['#8aaac8','#c4dcf0','#f4fbff','#3a5470'],HN=['#7a8ea4','#bccadc','#ffffff','#34404e'],IC=['#78b8e8','#b8e4ff','#ffffff','#2a4a6a'],MO=['#0a1830','#16304e','#284868','#04080e'];
  const sway=pose==='move'?[0,3,0,-3][fr]:pose==='idle'?[0,1,2,1][fr]:0;
  let hx=CX+sway,hy=18,jaw=pose==='idle'?(fr===2?1:0):0,neckBend=.25;
  if(pose==='wind'){hy=13;hx=CX-3;neckBend=.45}
  if(pose==='strike'){if(atk==='fan'){hy=26;hx=CX+6;jaw=5;neckBend=.05}else{hy=12;hx=CX;jaw=5;neckBend=.3}}
  // coils: a back ring, a big front ring and a tail tip
  const rip=pose==='move'?[0,1,0,-1][fr]:0;
  chain(curve(CX-16,54+rip,CX+14,54-rip,-.55,4.5,4.5,16),SD);chain(curve(CX-22,60,CX+20,60,-.3,5.5,5.5,18),SC);for(let x=CX-18;x<CX+16;x+=3)px(x,64,BE[1]);
  chain(curve(CX+20,60,CX+28,52+rip,.4,4.5,1.2,10),SD);
  // the body rising to the neck (it arches back to wind up and lunges to bite)
  const body=curve(CX-4,58,hx,hy+10,neckBend,6.5,4.2,18);chain(body,SC);
  for(let i=2;i<body.length-1;i++){const[x,y]=body[i];px(x-1,y,BE[1]);px(x,y,BE[2]);if(i%2)px(x+1,y,BE[1])}
  for(let i=3;i<body.length-2;i+=3){const[x,y,r]=body[i];poly([[x+r-1,y-1],[x+r+4,y-3],[x+r-1,y+2]],IC)}
  for(const[x,y]of[[-16,52],[0,51],[14,52]])poly([[CX+x-2,y],[CX+x,y-5],[CX+x+2,y]],IC);
  // head: horns, frills, skull, snout, jaw
  poly([[hx-7,hy-2],[hx-14,hy-13],[hx-6,hy-6]],HN);poly([[hx+7,hy-2],[hx+14,hy-13],[hx+6,hy-6]],HN);
  for(const s of[-1,1])poly([[hx+s*7,hy+2],[hx+s*12,hy-1],[hx+s*11,hy+4],[hx+s*13,hy+6],[hx+s*7,hy+6]],IC);
  ell(hx,hy,8,7,SC);poly([[hx-6,hy+2],[hx+6,hy+2],[hx+4,hy+9],[hx-4,hy+9]],SC);
  if(jaw>1){poly([[hx-4,hy+9],[hx+4,hy+9],[hx+3,hy+9+jaw],[hx-3,hy+9+jaw]],MO,{noLine:1})}
  poly([[hx-5,hy+9+jaw],[hx+5,hy+9+jaw],[hx+3,hy+13+jaw],[hx-3,hy+13+jaw]],BE);
  for(const s of[-1,1]){px(hx+s*3,hy+9,'#ffffff');px(hx+s*1,hy+9,'#ffffff');if(jaw>1){px(hx+s*3,hy+9+jaw,'#ffffff');px(hx+s*1,hy+9+jaw,'#ffffff')}}
  const eye=pose==='wind'||pose==='strike'?'#ffffff':'#40e0ff';for(const s of[-1,1]){px(hx+s*4,hy-1,'#0a1830');px(hx+s*4,hy,eye);px(hx+s*3,hy,'#a0f4ff');px(hx+s*4,hy-2,'#0a1830')}
  px(hx-2,hy+5,'#16283e');px(hx+2,hy+5,'#16283e');
  return k.done()},
 // ---------- The Void Herald ----------
 shattered:(pose,atk,fr)=>{const k=KIT()(56,66,0,'#06040c'),{poly,ell,chain,px,curve,mir}=k,CX=28;
  const RB=['#1c1230','#33255a','#54438a','#0a0614'],TR=['#5a3a90','#8a68c8','#c8b0ff','#22143a'],VD=['#050308','#0c0814','#16102a','#020104'],GD=['#5a4a1a','#9a8432','#e0cc72','#2a2208'];
  const w=[0,1,2,1][fr],lean=pose==='move'?2:0,up=pose==='strike'?1:pose==='wind'?.5:0;
  // robe with a tattered hem that trails behind when it drifts
  const hem=[];for(let i=0;i<=10;i++){const x=CX-14+i*2.8-lean*2;hem.push([x,60+((i+w)%2?0:3)])}
  poly([[CX-6+lean,20],[CX+6+lean,20],[CX+13,42]].concat(hem.slice().reverse()).concat([[CX-15,42]]),RB);
  poly([[CX-2+lean,24],[CX+2+lean,24],[CX+3-lean,58],[CX-3-lean,58]],TR,{noLine:1});for(let y=28;y<56;y+=6)px(CX,y,GD[2]);
  // arms and the orbs: at its sides, rising to chest height to wind up, thrown high to cast
  const orbR=up?5.5+up*1.5:4.5;for(const s of[-1,1]){const ox=CX+s*(16-up*3),oy=34-up*24+w*.5,sx=CX+s*6+lean;
   chain([[sx,22,2.6],[(sx+ox)/2,(22+oy)/2+3,2.4],[ox,oy+2,2.2]],RB);
   ell(ox,oy,orbR,orbR,['#6a3ac0','#a070f0','#e8d4ff','#2a1050']);px(ox-1,oy-2,'#ffffff')}
  // hood with the void inside, and the eye (wide open when it casts)
  const H=v=>CX+v+lean;poly([[H(0),2],[H(8),15],[H(7),23],[H(-7),23],[H(-8),15]],RB);ell(H(0),16,6,6,VD,{noLine:1});
  const blink=pose==='idle'&&fr===3,big=pose==='wind'||pose==='strike';
  if(blink){px(H(-1),16,'#3a2a5a');px(H(0),16,'#3a2a5a');px(H(1),16,'#3a2a5a')}
  else{px(H(-1),16,'#e0b8ff');px(H(0),16,'#ffffff');px(H(1),16,'#e0b8ff');px(H(0),15,'#c090ff');px(H(0),17,'#c090ff');if(big){px(H(-2),16,'#c090ff');px(H(2),16,'#c090ff');px(H(0),14,'#c090ff');px(H(0),18,'#c090ff')}}
  // a crown of floating shards (they flare when it casts)
  for(const[x,y,h]of[[-10,3,4],[-6,0,5],[6,0,5],[10,3,4]])poly([[H(x-1),y+h],[H(x),y-h+4-w*.5-up*2],[H(x+1),y+h]],GD);
  return k.done()},
 // ---------- Black Jack, the Outlaw King (faces right; flipped when you're on his left) ----------
 nomans:(pose,atk,fr)=>{const k=KIT()(56,64,8,'#0a0806'),{poly,ell,chain,px,mir}=k,CX=24;
  const CT=['#3a2414','#5a3a20','#7e5634','#1a0e06'],CT2=['#2a1a0e','#3e2814','#5a3a20','#140a04'],PN=['#1a1a22','#2c2c38','#444452','#0a0a0e'],SK=['#9a6440','#c88c5c','#ecb888','#4a2814'],HT=['#121216','#22222a','#383844','#060608'],SV=['#7a7a88','#c0c0d0','#ffffff','#30303a'],BN=['#5a0c0c','#a01c1c','#d84040','#2a0404'],SH=['#6a5a48','#9a8a70','#c8b898','#2a2218'],GN=['#3a3a44','#6a6a78','#a0a0b0','#16161c'],BT=['#2a1a0e','#4a2e18','#6a4426','#120a04'],WD=['#4a2a14','#6a4020','#8a5830','#20100a'];
  const step=pose==='move'?[0,1,0,-1][fr]:0,b=pose==='idle'?fr%2:Math.abs(step),X=v=>CX+v;
  // legs and boots (striding when he walks)
  for(const[s,o]of[[-1,step*3],[1,-step*3]]){const lx=X(s*3+o*.5);poly([[lx-2.5,37],[lx+2.5,37],[lx+2.5+o*.3,48],[lx-2.5+o*.3,48]],PN);poly([[lx-3.5+o*.3,47],[lx+4+o*.3,47],[lx+4.5+o*.3,51],[lx-3.5+o*.3,51]],BT)}
  // duster coat (the tails swing as he walks), shirt, vest, belt
  const sw=-step;poly([[X(-9),18+b],[X(9),18+b],[X(13+sw),45],[X(7+sw),47],[X(2),39],[X(-2),39],[X(-7+sw),47],[X(-13+sw),45]],CT);
  poly([[X(-4),19+b],[X(4),19+b],[X(3),37],[X(-3),37]],SH);poly([[X(-4),24+b],[X(-1),24+b],[X(-1),37],[X(-4),37]],CT2,{noLine:1});poly([[X(1),24+b],[X(4),24+b],[X(4),37],[X(1),37]],CT2,{noLine:1});
  poly([[X(-7),34],[X(7),34],[X(7),36],[X(-7),36]],['#1a0e06','#2e1c0e','#46301a','#0a0402']);poly([[X(-2),34],[X(2),34],[X(2),36],[X(-2),36]],SV);
  // arms by pose
  const gun=(hx,hy,ax,ay,flash)=>{poly([[hx,hy-1],[hx+ax*8,hy-1+ay*8],[hx+ax*8,hy+1+ay*8],[hx,hy+1]],GN);poly([[hx-1,hy],[hx+1,hy],[hx+1-ax,hy+4],[hx-1-ax,hy+4]],WD)};
  const arm=(sx,sy,hx,hy)=>{chain([[sx,sy,2.4],[(sx+hx)/2,(sy+hy)/2,2.2],[hx,hy,2]],CT);ell(hx,hy,2.2,2,SK)};
  const aim=pose==='wind'||pose==='strike';
  if(atk==='fan'&&aim){const rc=pose==='strike'?-2:0;arm(X(-6),21+b,X(12),20+b+rc);gun(X(13),20+b+rc,1,rc?-.15:0);arm(X(6),21+b,X(16),23+b+rc);gun(X(17),23+b+rc,1,rc?-.15:0)}
  else if(atk==='circles'&&aim){arm(X(-6),21+b,X(-9),32+b);gun(X(-9),32+b,0,1);
   if(pose==='wind'){arm(X(6),21+b,X(16),-1);poly([[X(15),-7],[X(18),-7],[X(18),-1],[X(15),-1]],['#7a1010','#c02020','#f04848','#300404']);px(X(16),-8,'#f8e060');px(X(17),-9,'#ffffff')}
   else{arm(X(6),21+b,X(16),18+b)}}
  else if(atk==='summon'&&aim){arm(X(-6),21+b,X(-9),32+b);gun(X(-9),32+b,0,1);arm(X(6),21+b,X(4),11)}   // two fingers to his lips: a whistle
  else{for(const s of[-1,1]){const hx=X(s*9),hy=31+b-(pose==='move'?s*step:0);arm(X(s*6),21+b,hx,hy);gun(hx,hy,0,1)}}
  // head: face, bandana, eyes, the wide hat with its silver band and curled brim
  ell(X(0),12+b,5,5.5,SK);poly([[X(-5),13+b],[X(5),13+b],[X(4),18+b],[X(-4),18+b]],BN);px(X(-2),11+b,'#100808');px(X(2),11+b,'#100808');px(X(-2),10+b,'#2a1810');px(X(2),10+b,'#2a1810');
  if(aim&&atk==='fan'){px(X(-3),10+b,'#2a1810');px(X(3),10+b,'#2a1810')}
  poly([[X(-15),7+b],[X(15),7+b],[X(13),10+b],[X(-13),10+b]],HT);poly([[X(-17),4+b],[X(-13),7+b],[X(-15),8+b]],HT);poly([[X(17),4+b],[X(13),7+b],[X(15),8+b]],HT);
  poly([[X(-7),0+b],[X(7),0+b],[X(8),7+b],[X(-8),7+b]],HT);poly([[X(-8),5+b],[X(8),5+b],[X(8),7+b],[X(-8),7+b]],SV,{noLine:1});px(X(0),1+b,'#060608');
  return k.done()}};
 const SCALE={briarwood:2,ashfall:1.7,ironcrest:1.7,shattered:1.6,nomans:1.6},PER={briarwood:.12,ashfall:.2,ironcrest:.22,shattered:.2,nomans:.17};
 // the pose a boss is in right now
 function poseOf(b){const A=b.act;
  if(A){if(A.k==='leap')return A.t<.2?['wind','leap']:['air','leap'];if(A.k==='charge')return A.t<A.d?['wind','charge']:['run','charge'];if(A.k==='sweep')return A.t<A.d?['wind','sweep']:['strike','sweep']}
  if(b.wind)return['wind',b.wind.a];if(b.cast>0)return['strike',b.castA];return[b.mv>0?'move':'idle','']}
 window.SQIBPOSE=poseOf;
 window.SQIBART=function(id,b,tm){if(!KIT())return false;const[pose,atk]=poseOf(b),fr=pose==='idle'||pose==='move'||pose==='run'?Math.floor(tm/(pose==='idle'?PER[id]*1.8:PER[id]))%4:0,
   hit=Math.abs(b.kx)+Math.abs(b.ky)>.3,c=art(id,pose,atk,fr),S=SCALE[id],w=c.width*S,hh=c.height*S,x=Math.round(b.x),y=Math.round(b.y-(b.jump||0));
  shd(b.x,b.y+6,Math.min(w*.5,70));const flip=(id==='nomans'||id==='ashfall')&&b.face<0,bob=id==='shattered'?Math.round(Math.sin(tm*2)*3)-10:0,
   cxs={briarwood:32,ashfall:30,ironcrest:34,shattered:28,nomans:24}[id],left=x-cxs*S,top=y+6-hh+bob,tp=top+({ashfall:24,nomans:8}[id]||0)*S;
  g.save();g.imageSmoothingEnabled=false;
  if(id==='shattered'){g.fillStyle='rgba(150,100,240,'+(.12+.08*Math.sin(tm*3)+(pose==='wind'||pose==='strike'?.12:0))+')';g.beginPath();g.arc(x,y-hh*.5+bob,w*.55,0,6.283);g.fill();if(b.blinkT>0)g.globalAlpha=Math.max(.15,1-b.blinkT*3)}
  if(flip){g.translate(x*2,0);g.scale(-1,1)}g.drawImage(c,Math.round(left),Math.round(top),Math.round(w),Math.round(hh));
  if(hit){g.globalCompositeOperation='lighter';g.globalAlpha=.4;g.drawImage(c,Math.round(left),Math.round(top),Math.round(w),Math.round(hh))}
  // a sword trail on the warlord's swing
  if(id==='ashfall'&&pose==='strike'&&atk==='sweep'){g.globalCompositeOperation='source-over';g.globalAlpha=.55;g.strokeStyle='#ffe0b0';g.lineWidth=5;g.beginPath();g.arc(x,y-16*S,34*S*.9,-1.6,.25);g.stroke()}
  g.restore();
  const F=flip?-1:1;
  // living touches
  if(id==='ashfall')for(let k=0;k<4;k++){const ph=(tm*2+k*.25)%1,fx=x+F*(-4+k*3),fy=tp+2*S-ph*12;Rg(Math.round(fx),Math.round(fy),2,3,ph<.5?'#f8b030':'#f05020')}
  if(id==='ashfall'&&(pose==='wind'||pose==='strike')&&atk==='circles')for(let k=0;k<6;k++){const ph=(tm*3+k/6)%1;Rg(Math.round(x+F*14*S+(Math.random()-.5)*6),Math.round(tp+2*S-ph*20),2,3,ph<.5?'#ffd060':'#f86020')}
  if(id==='ironcrest'){const st=pose==='strike';for(let k=0;k<(st?10:4);k++){const ph=(tm*(st?3:.9)+k/(st?10:4))%1,hx=x+(st&&atk==='fan'?6:0)*S,hy=tp+(st&&atk==='fan'?44:30)*S;g.fillStyle='rgba(230,248,255,'+(.6*(1-ph))+')';g.fillRect(Math.round(hx-4+k%4*3+(st?(Math.random()-.5)*ph*30:0)),Math.round(hy+ph*(st?26:18)),st?3:2,st?3:2)}}
  if(id==='shattered')for(let k=0;k<6;k++){const q=tm*(pose==='wind'||pose==='strike'?4:1.4)+k/6*6.283;Rg(Math.round(x+Math.cos(q)*w*.48),Math.round(y-hh*.5+bob+Math.sin(q)*10),2,2,k%2?'#c8a0ff':'#8a60e0')}
  if(id==='nomans'&&pose==='strike'&&atk==='fan'){for(const[gx,gy]of[[22,20],[26,23]]){const fx=x+F*(gx-24+8)*S,fy=tp+(gy-2)*S;Rg(Math.round(fx-3),Math.round(fy-3),7,7,'#fff0a0');Rg(Math.round(fx-1),Math.round(fy-1),3,3,'#ffffff')}}
  if(id==='nomans'&&pose==='wind'&&atk==='circles'){const sx=x+F*(17-24)*S*-1,sy=tp-9*S;if(Math.floor(tm*20)%2)Rg(Math.round(sx),Math.round(sy),2,2,'#ffffff')}
  if(id==='briarwood'&&pose==='wind')for(let k=0;k<3;k++)Rg(Math.round(x-6+k*6),Math.round(tp+(44-4)*S),1,4,'#e8e8e8');
  return true};
 window.SQIBARTCAN=(id,pose,atk,fr)=>art(id,pose||'idle',atk||'',fr||0);
}
