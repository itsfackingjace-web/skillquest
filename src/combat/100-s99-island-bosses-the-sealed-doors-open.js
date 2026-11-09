// ---------------------------------------------------------------- 99. Island bosses: the sealed doors open
// Every island's great sealed landmark hides an Island Boss. Five sigil shards (dropped by that island's monsters,
// about 1 in 25) open the door for one fight. Inside is a round arena; the boss fights with a set of telegraphed
// attacks (rings, target circles, projectile fans, charges, leaps, summons) and gets faster at half health.
//   Briarwood   - Whispering Ruins vault      - The Briar Queen   (rare: Webling pet)
//   Ashfall     - The Fallen Bastion grate    - The Iron Warlord  (rare: Warlord's blade, the strongest sword)
//   Ironcrest   - The Giant's Stair rune door - The Frost Wyrm    (rare: Frostbite ring - hits can freeze)
//   Shattered   - The Fractured Temple        - The Void Herald   (rare: Voidling pet)
//   No Man's Land - The Old Silver Mine       - Black Jack, the Outlaw King (rare: Outlaw's hat)
{const K='#181018';
 const IB={briarwood:{n:'The Briar Queen',door:'vault',lm:'Whispering Ruins',hp:420,col:'#5a8a3a',shard:'Briar sigil shard',sc:['#68b048','#2e6a28'],
   floor:['#56603e','#4e5838'],wall:'#3a4228',trim:'#1e2414',gold:[300,500],loot:[['oaklog',15],['willowlog',10],['emerald',1]],xp:1500,rare:['pweb','Webling (pet)','A little thorn spider that scuttles after you.'],
   atk:[['fan',2.6,{n:3,spread:.35,sp:85,k:'web',slow:1}],['leap',5.5,{}],['summon',9,{key:'spiderling',n:3,cap:5}]]},
  ashfall:{n:'The Iron Warlord',door:'sealgate',lm:'The Fallen Bastion',hp:620,col:'#a04020',shard:'Ember sigil shard',sc:['#f07030','#802010'],
   floor:['#4a3430','#42302c'],wall:'#2e2220',trim:'#140c0a',gold:[450,750],loot:[['ibar',8],['gbar',3],['ruby',1]],xp:2200,rare:['eq_sword8','Warlord\'s blade','A red-hot greatsword: the strongest sword in the game (Attack 50).'],
   atk:[['charge',4,{}],['sweep',3,{}],['circles',5,{n:5,r:20,delay:1.1,k:'fire'}]]},
  ironcrest:{n:'The Frost Wyrm',door:'sealdoor',lm:'The Giant\'s Stair',hp:820,col:'#78b8e0',shard:'Frost sigil shard',sc:['#b8e8ff','#4888c0'],
   floor:['#7c8ea0','#748698'],wall:'#506478',trim:'#2c3848',gold:[600,950],loot:[['mbar',3],['mithore',8],['sapphire',1]],xp:3000,rare:['ja_frost','Frostbite ring','A ring: your melee hits chill monsters, and one in five freezes them solid for a moment.'],
   atk:[['fan',2.4,{n:7,spread:.22,sp:110,k:'ice',slow:1}],['circles',4.5,{n:6,r:18,delay:1.2,k:'ice'}],['ring',6.5,{max:120}]]},
  shattered:{n:'The Void Herald',door:'temple',lm:'The Fractured Temple',hp:1100,col:'#8050c0',shard:'Void sigil shard',sc:['#c8a0ff','#5a3a8a'],
   floor:['#2c2838','#353044'],wall:'#1e1a28',trim:'#0c0a14',gold:[800,1300],loot:[['abar',3],['adamore',6],['sapphire',2]],xp:4200,rare:['pvoidl','Voidling (pet)','A tiny floating void eye that drifts along beside you.'],
   atk:[['spiral',2.8,{n:12,sp:80,k:'void'}],['blink',5,{}],['circles',5.5,{n:4,r:24,delay:1.3,k:'void'}],['summon',12,{key:'wolf:void',n:2,cap:3,half:1}]]},
  nomans:{n:'Black Jack, the Outlaw King',door:'nmmine',lm:'The Old Silver Mine',hp:820,col:'#c8a040',shard:'Silver sigil shard',sc:['#e8e8f0','#8a8a98'],
   floor:['#6a5a48','#625240'],wall:'#4a3c2e',trim:'#2a2018',gold:[700,1100],loot:[['gbar',4],['sbar',4],['iarrow',30]],xp:3000,rare:['eq_ohat','Outlaw\'s hat','A black cowboy hat with a silver band. Defence like an adamant helmet.'],
   atk:[['fan',1.9,{n:5,spread:.18,sp:170,k:'bullet',burst:2}],['circles',4.2,{n:3,r:26,delay:1.4,k:'dyn'}],['summon',11,{key:'bandit',n:2,cap:2}]]}};
 for(const k in IB)IB[k].hp=Math.round(IB[k].hp*2.2);// island bosses: much tougher (Nov 9)
 window.SQIB=IB;const ISL=Object.keys(IB);
 // ---- the shards ----
 for(const id of ISL){const k='ibs_'+id,B=IB[id];INVK.push(k);EXTRA_BAG.push(k);INAME[k]=B.shard;SN[k]=B.shard+'s';SHORT[k]=B.shard.toLowerCase();SELLP[k]=40;
  IDESC[k]='A glowing shard from '+WORLD_REGIONS[id].name+'. Five of them open '+B.lm+', where '+B.n+' waits. Dropped by the island\'s monsters.';inv[k]=inv[k]|0}
 {const _ic=iconURL;iconURL=function(k,col){if(!/^ibs_/.test(k))return _ic(k,col);const key='ibs'+k;if(ICONC[key])return ICONC[key];const B=IB[k.slice(4)],c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
   for(let j=0;j<12;j++){const w=j<6?j+1:12-j;r(7-w,j+1,w*2,1,K)}for(let j=1;j<11;j++){const w=j<6?j:11-j;r(7-w,j+1,w*2,1,B.sc[1]);if(w>1)r(7-w+1,j+1,w-1,1,B.sc[0])}r(6,3,1,2,'#ffffff');return ICONC[key]=c.toDataURL()}}
 {const _ed=enemyDrop;enemyDrop=function(n){_ed(n);try{const R=SCENE&&SCENE.room,isl=(n&&n.rg)||(R&&R.region)||(SCENE&&SCENE.prev&&SCENE.prev.room&&SCENE.prev.room.region);
   if(!n||!IB[isl]||n.type==='ib'||n.summon||n._ibs)return;n._ibs=1;if(Math.random()<2/25||window.SQSHARDDROP){const k='ibs_'+isl;inv[k]=(inv[k]|0)+1;say('+1 '+INAME[k].toLowerCase()+' ('+inv[k]+'/5)');try{gTxt(n.x,n.y-20,'+1 shard',IB[isl].sc[0]);sfx('pickup')}catch(e){}}}catch(e){}}}

 // ---- the doors ----
 const doorOf=(R,it)=>R&&R.region&&IB[R.region]&&it&&it.t==='lm'&&it.k===IB[R.region].door;
 {const _rl=rgLook;rgLook=function(it){const R=SCENE&&SCENE.room;if(!doorOf(R,it))return _rl(it);const id=R.region,B=IB[id],k='ibs_'+id,have=inv[k]|0;
   if(have<5){say(B.lm+': a great sealed door. Five '+B.shard.toLowerCase()+'s would open it (you have '+have+'). The island\'s monsters drop them.');msgT=6;sfx('talk');return}
   inv[k]-=5;saveNow();say('The five shards blaze with light. The door grinds open...');msgT=4;try{sfx('roar')}catch(e){}ibEnter(id,it)}}
 // the doors glow when you have enough shards
 {const _dl=rgDrawLm;rgDrawLm=function(it,tm){_dl(it,tm);const R=SCENE&&SCENE.room;if(!doorOf(R,it))return;const have=inv['ibs_'+R.region]|0;if(have<5)return;const B=IB[R.region],x=it.x*16+(it.w||1)*8,y=it.y*16+(it.h||1)*8,p=.5+.5*Math.sin(tm*3);
   g.fillStyle='rgba('+parseInt(B.sc[0].slice(1,3),16)+','+parseInt(B.sc[0].slice(3,5),16)+','+parseInt(B.sc[0].slice(5,7),16)+','+(.15+.15*p)+')';g.beginPath();g.arc(x,y,22+4*p,0,6.283);g.fill()}}
 // the Old Silver Mine and the Fallen Bastion are looked at like any landmark; make sure the mine can be "used"
 // ---- the arena ----
 const AW=30,AH=24,BX=15,BY=9;
 function ibArena(id){const B=IB[id],G=new Uint8Array(AW*AH).fill(1),ex=AW>>1;
  for(let y=1;y<AH-1;y++)for(let x=1;x<AW-1;x++){const nx=(x-BX)/12.5,ny=(y-BY-2)/9.5;if(nx*nx+ny*ny<=1)G[y*AW+x]=0}
  for(let y=AH-6;y<AH;y++)for(let x=ex-1;x<=ex+1;x++)G[y*AW+x]=0;
  const R={w:AW,h:AH,ex,cave:1,floor:B.floor,wall:B.wall,trim:B.trim,items:[],solid:new Set(),mobs:[],ib:id,dun:{kind:'ib_'+id,f:1,G,seen:new Uint8Array(AW*AH).fill(1),mm:null,label:B.n}};
  for(const[x,y]of[[5,6],[24,6],[4,14],[25,14],[9,18],[20,18]]){if(!G[y*AW+x]){R.items.push({t:'crystal',x,y,solid:1});R.solid.add(y*AW+x)}}
  for(let i=0;i<AW*AH;i++)if(G[i])R.solid.add(i);return R}
 for(const id of ISL)DKIND['ib_'+id]={name:IB[id].n,floor:IB[id].floor,wall:IB[id].wall,trim:IB[id].trim,W:AW,H:AH,floors:1,cavey:1};
 const ST={boss:null,id:null};window.SQIBST=ST;
 function ibEnter(id,it){const key='ib_'+id,R=ibArena(id);ROOMS[key]=R;enterScene(key,null,{x:(it.x+((it.w||1)>>1))*16+8,y:(it.y+(it.h||1))*16+10});P.x=R.ex*16+8;P.y=(AH-2)*16+8;face=[0,-1];
  const B=IB[id],hp=B.hp,b={x:BX*16+8,y:BY*16+8,hp,mhp:hp,kx:0,ky:0,type:'ib',ib:id,big:1,t:0,cds:B.atk.map((a,i)=>1.5+i*1.2),pr:[],hz:[],act:null,face:1};R.mobs.push(b);en.push(b);ST.boss=b;ST.id=id;
  setTimeout(()=>{try{say(B.n.toUpperCase()+' awakens!');msgT=4}catch(e){}},500)}
 // ---- attacks ----
 const roll=()=>typeof ROLLT!=='undefined'&&ROLLT>0;
 const hit=(d,msg)=>{if(dead)return false;return hurtP(d,msg)};
 // every attack that isn't a leap, charge or sweep gets a short wind-up first, so you can see it coming
 function start(b,a,o){if(a==='summon'&&o.half&&b.hp>=b.mhp/2)return;if(a==='leap'||a==='charge'||a==='sweep')return ibFire(b,a,o);b.wind={a,o,t:0,d:a==='blink'?.35:.45}}
 function ibFire(b,a,o){const B=IB[b.ib],dx=P.x-b.x,dy=P.y-b.y,d=Math.hypot(dx,dy)||1,an=Math.atan2(dy,dx),en2=b.hp<b.mhp/2;
  if(a==='fan'){const shots=o.burst||1;for(let s=0;s<shots;s++)setTimeout(()=>{if(b.dead)return;const an2=Math.atan2(P.y-6-b.y+10,P.x-b.x);for(let k=0;k<o.n;k++){const q=an2+(k-(o.n-1)/2)*o.spread;b.pr.push({x:b.x,y:b.y-10,vx:Math.cos(q)*o.sp,vy:Math.sin(q)*o.sp,t:3,k:o.k,slow:o.slow})}try{sfx('swish')}catch(e){}},s*350)}
  else if(a==='spiral'){const n=en2?o.n+4:o.n;b.sp0=(b.sp0||0)+.4;for(let k=0;k<n;k++){const q=k/n*6.283+b.sp0;b.pr.push({x:b.x,y:b.y-10,vx:Math.cos(q)*o.sp,vy:Math.sin(q)*o.sp,t:3.4,k:o.k})}}
  else if(a==='circles'){const n=o.n+(en2?2:0);for(let k=0;k<n;k++){const r=k?20+Math.random()*50:0,q=Math.random()*6.283;b.hz.push({k:'circ',x:P.x+Math.cos(q)*r,y:P.y+4+Math.sin(q)*r*.7,r:o.r,t:0,d:o.delay+k*.08,kind:o.k})}}
  else if(a==='ring')b.hz.push({k:'ring',x:b.x,y:b.y,r:10,max:o.max,hit:false,t:0});
  else if(a==='leap')b.act={k:'leap',t:0,d:1,tx:P.x,ty:P.y,ox:b.x,oy:b.y},b.hz.push({k:'circ',x:P.x,y:P.y+4,r:30,t:0,d:1,kind:'land',nohit:1});
  else if(a==='charge')b.act={k:'charge',t:0,d:.75,ax:dx/d,ay:dy/d,run:0};
  else if(a==='sweep')b.act={k:'sweep',t:0,d:.65,an,done:false};
  else if(a==='blink'){const R=SCENE&&SCENE.room;for(let t=0;t<30;t++){const x=(4+Math.random()*(AW-8))*16,y=(3+Math.random()*(AH-9))*16;if(R&&!R.solid.has(Math.floor(y/16)*AW+Math.floor(x/16))&&Math.hypot(x-P.x,y-P.y)>70){for(let k=0;k<14;k++)part(b.x,b.y-14,(Math.random()-.5)*90,(Math.random()-.5)*90,.4,B.sc[0],0,2);b.x=x+8;b.y=y+8;break}}}
  else if(a==='summon'){if(o.half&&!en2)return;const alive=en.filter(m=>m.summon&&!m.dead).length;for(let k=alive;k<Math.min(o.cap,alive+o.n);k++){const q=Math.random()*6.283,x=b.x+Math.cos(q)*40,y=b.y+Math.sin(q)*28;if(solid(x,y))continue;
    let m;if(o.key==='spiderling')m={x,y,hp:12,mhp:12,kx:0,ky:0,type:'spiderling'};else{m=rgMake(o.key,o.key==='bandit'?30:40,x,y);m.rg=b.ib}m.summon=1;m._prov=9;en.push(m);try{if(window.RG_OWN)RG_OWN.add(m)}catch(e){}}}}
 {const _u=upd;upd=function(dt){if(ST.boss&&ST.boss.hp<=0&&!ST.boss._rew){try{ibReward(ST.boss)}catch(e){console.warn(e)}}const b=ST.boss,R=SCENE&&SCENE.room,live=b&&!b.dead&&R&&R.ib===b.ib&&en.includes(b);const pre=live?[b.x,b.y]:null;_u(dt);if(!live||menuOpen||pnOpen)return;
   const B=IB[b.ib],en2=b.hp<b.mhp/2;b.t+=dt;b.x=pre[0]+b.kx*.15;b.y=pre[1]+b.ky*.15;b.kx*=.5;b.ky*=.5;if(!b.half&&en2){b.half=1;say(B.n+' is enraged!');msgT=3;try{sfx('roar')}catch(e){}}
   const dx=P.x-b.x,dy=P.y-b.y,d=Math.hypot(dx,dy)||1;b.face=dx<0?-1:1;
   // wind-up, then the strike pose holds for a moment after the attack goes off
   b.mv=0;if(b.cast>0)b.cast-=dt;if(b.wind){b.wind.t+=dt;if(b.wind.t>=b.wind.d){const w=b.wind;b.wind=null;b.cast=.4;b.castA=w.a;ibFire(b,w.a,w.o)}}
   // current action
   const A=b.act;if(A){A.t+=dt;
    if(A.k==='leap'){const p=Math.min(1,A.t/A.d);b.x=A.ox+(A.tx-A.ox)*p;b.y=A.oy+(A.ty-A.oy)*p;b.jump=Math.sin(p*Math.PI)*30;if(p>=1){b.jump=0;b.act=null;b.hz.push({k:'ring',x:b.x,y:b.y,r:8,max:56,hit:false,t:0});if(Math.hypot(P.x-b.x,P.y-b.y)<26)hit(2,'The Briar Queen lands on you!');try{sfx('mine')}catch(e){}}}
    else if(A.k==='charge'){if(A.t>A.d){const sp=260*dt,nx=b.x+A.ax*sp,ny=b.y+A.ay*sp;if(!solid(nx,ny+6)&&A.run<.6){b.x=nx;b.y=ny;A.run+=dt;if(Math.hypot(P.x-b.x,P.y-b.y)<22&&!A.hit){A.hit=1;hit(2,'The Iron Warlord tramples you!')}}else b.act=null}}
    else if(A.k==='sweep'){if(A.t>A.d&&!A.done){A.done=1;const q=Math.atan2(P.y-b.y,P.x-b.x),da=Math.abs(((q-A.an+Math.PI*3)%(Math.PI*2))-Math.PI);if(d<64&&da<1.1)hit(2,'The great sword cleaves you!');try{sfx('swish')}catch(e){}}if(A.t>A.d+.3)b.act=null}}
   else{// walk toward (or keep a little away from) you
    const want=b.ib==='nomans'||b.ib==='shattered'?90:30;if(!b.wind){if(d>want+10){stepTo(b,dx/d*(en2?34:26)*dt,dy/d*(en2?34:26)*dt);b.mv=1}else if(d<want-10){stepTo(b,-dx/d*24*dt,-dy/d*24*dt);b.mv=1}}
    for(let i=0;i<B.atk.length;i++){b.cds[i]-=dt*(en2?1.35:1);if(b.cds[i]<=0&&!b.act&&!b.wind){b.cds[i]=B.atk[i][1]*(.85+Math.random()*.3);start(b,B.atk[i][0],B.atk[i][2]);break}}}
   // projectiles
   for(const p of b.pr){p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(R.solid.has(Math.floor((p.y+4)/16)*AW+Math.floor(p.x/16))){p.t=0;continue}
    if(Math.hypot(P.x-p.x,P.y-6-p.y)<8&&!roll()){p.t=0;if(hit(1,p.k==='web'?'You\'re caught in sticky web!':p.k==='ice'?'An icicle hits you!':p.k==='bullet'?'Black Jack\'s bullet hits you!':'A void orb hits you!')&&p.slow)SLOW43=2}}
   b.pr=b.pr.filter(p=>p.t>0);
   // circles and rings
   for(const h of b.hz){h.t+=dt;if(h.k==='circ'){if(h.t>=h.d&&!h.done){h.done=1;if(!h.nohit&&Math.hypot(P.x-h.x,(P.y+4-h.y)*1.4)<h.r&&!roll())hit(h.kind==='dyn'?2:1,h.kind==='fire'?'Fire rains down on you!':h.kind==='ice'?'An icicle crashes onto you!':h.kind==='dyn'?'Dynamite!':'The void bursts under you!');
       if(h.kind==='dyn'||h.kind==='fire')for(let k=0;k<10;k++)part(h.x,h.y,(Math.random()-.5)*110,-40-Math.random()*60,.45,k%2?'#f8b030':'#f05020',160,2);try{sfx(h.kind==='dyn'?'mine':'swish')}catch(e){}}}
    else if(h.k==='ring'){const pr=h.r;h.r+=150*dt;const dd=Math.hypot(P.x-h.x,P.y-h.y);if(!h.hit&&dd>pr-6&&dd<h.r+6&&!roll()){h.hit=1;if(hit(1,'A shockwave knocks into you!')&&b.ib==='ironcrest')SLOW43=1.5}}}
   b.hz=b.hz.filter(h=>h.k==='circ'?h.t<h.d+.35:h.r<h.max);
   // the fight is over
   if(b.hp<=0&&!b._rew)ibReward(b)}}
 // spiderlings: small, fast, weak
 {const _u=upd;upd=function(dt){const pre=new Map();for(const n of en)if(n.type==='spiderling'&&!n.dead)pre.set(n,[n.x,n.y]);_u(dt);if(menuOpen||pnOpen)return;for(const[n,[x,y]]of pre){if(n.dead)continue;const dx=P.x-x,dy=P.y-y,d=Math.hypot(dx,dy)||1;n.x=x+n.kx*.4;n.y=y+n.ky*.4;n.t=(n.t||0)+dt;stepTo(n,dx/d*46*dt,dy/d*46*dt)}}}
 function ibReward(b){b._rew=1;b.dead=1;b.dropped=1;b.pr=[];b.hz=[];for(const m of en)if(m.summon&&!m.dead){m.dead=1;m.dropped=1}const B=IB[b.ib],g0=B.gold[0]+Math.floor(Math.random()*(B.gold[1]-B.gold[0]));GLD+=g0;const got=[g0+' gold'];
  for(const[k,n]of B.loot){inv[k]=(inv[k]|0)+n;const nm=INAME[k]||k;got.push(n+' '+(n>1?(SN[k]||(/s$/.test(nm)?nm:nm+'s')):nm).toLowerCase())}addXp(0,B.xp);addXp(7,Math.round(B.xp*.4));
  let rare=null;if(Math.random()<.05||window.SQIBRARE){const[rk,rn]=B.rare;rare=rn;if(window.SQNPET&&SQNPET[rk])SQGIVEPET(rk);else inv[rk]=(inv[rk]|0)+1}
  ST.boss=null;try{sqEvent('islandboss',b.ib)}catch(e){}saveNow();try{svg()}catch(e){}
  say(B.n+' is defeated! '+got.join(', ')+(rare?'. RARE DROP: '+rare.toUpperCase()+'!':'.'));msgT=7;try{sfx('quest');if(rare)setTimeout(()=>sfx('level'),300)}catch(e){}
  for(let k=0;k<30;k++){const q=k/30*6.283;part(b.x,b.y-16,Math.cos(q)*120,Math.sin(q)*90-30,.7,k%2?B.sc[0]:'#f8d048',120,2)}}
 window.SQIBREWARD=ibReward;
 // ---- the boss bar ----
 {const _dh=drawHUD;drawHUD=function(){_dh();const b=ST.boss,R=SCENE&&SCENE.room;if(!b||b.dead||!R||R.ib!==b.ib||menuOpen)return;const B=IB[b.ib],w=Math.min(W*.6,420),x=(W-w)/2,y=Math.max(70,H*.1),f=Math.max(0,b.hp/b.mhp);
   g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(20,16,24,.82)';g.fillRect(x-4,y-20,w+8,34);g.fillStyle='#3a1a1a';g.fillRect(x,y,w,10);g.fillStyle=b.hp<b.mhp/2?'#f05030':B.col;g.fillRect(x,y,w*f,10);g.strokeStyle='#f8f0e0';g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,9);
   g.font='700 13px '+PF;g.fillStyle='#f8f0e0';g.textAlign='center';g.textBaseline='bottom';g.fillText(B.n.toUpperCase(),W/2,y-3);g.restore()}}
 // ---- how they look ----
 const R4=(a,b,w,h,c)=>Rg(Math.round(a),Math.round(b),w,h,c);
 function hzDraw(b,tm){for(const h of b.hz){if(h.k==='circ'){const p=Math.min(1,h.t/h.d),c=h.kind==='ice'?'160,220,255':h.kind==='void'?'180,120,255':h.kind==='land'?'120,200,90':h.kind==='dyn'?'255,200,80':'255,120,40';
    if(!h.done){g.strokeStyle='rgba('+c+','+(.5+.4*Math.sin(tm*16))+')';g.lineWidth=1.5;g.beginPath();g.ellipse(h.x,h.y,h.r,h.r*.7,0,0,6.283);g.stroke();g.fillStyle='rgba('+c+','+(.12+.25*p)+')';g.beginPath();g.ellipse(h.x,h.y,h.r*p,h.r*.7*p,0,0,6.283);g.fill();
     if(h.kind==='dyn'){const sx=h.x,sy=h.y-30*(1-p);R4(sx-2,sy-5,4,7,K);R4(sx-1,sy-4,2,5,'#d83020');R4(sx,sy-7,1,2,'#f8e060')}else if(h.kind==='ice'){const sy=h.y-60*(1-p);R4(h.x-2,sy-10,5,10,K);R4(h.x-1,sy-9,3,8,'#d8f4ff')}}
    else{g.fillStyle='rgba('+c+','+(.5*(1-(h.t-h.d)/.35))+')';g.beginPath();g.ellipse(h.x,h.y,h.r,h.r*.7,0,0,6.283);g.fill()}}
   else{g.strokeStyle='rgba(240,230,210,'+(.8*(1-h.r/h.max))+')';g.lineWidth=3;g.beginPath();g.ellipse(h.x,h.y,h.r,h.r*.62,0,0,6.283);g.stroke()}}
  for(const p of b.pr){if(p.k==='bullet'){R4(p.x-2,p.y-2,4,4,K);R4(p.x-1,p.y-1,2,2,'#f8e070')}else{const c=p.k==='web'?['#f0f0f0','#c8c8c8']:p.k==='ice'?['#e8f8ff','#78c0f0']:['#d8b0ff','#7040c0'];g.fillStyle='rgba(0,0,0,0)';R4(p.x-3,p.y-3,6,6,K);R4(p.x-2,p.y-2,4,4,c[1]);R4(p.x-1,p.y-2,2,2,c[0])}}
  if(b.act&&b.act.k==='charge'&&b.act.t<b.act.d){g.strokeStyle='rgba(255,80,60,'+(.4+.4*Math.sin(tm*20))+')';g.lineWidth=10;g.beginPath();g.moveTo(b.x,b.y);g.lineTo(b.x+b.act.ax*160,b.y+b.act.ay*160);g.stroke()}
  if(b.act&&b.act.k==='sweep'&&!b.act.done){g.fillStyle='rgba(255,90,60,'+(.15+.2*(b.act.t/b.act.d))+')';g.beginPath();g.moveTo(b.x,b.y);g.arc(b.x,b.y,64,b.act.an-1.1,b.act.an+1.1);g.closePath();g.fill()}}
 const hitW=n=>Math.abs(n.kx)+Math.abs(n.ky)>.3;
 const blob=(cx,cy,rx,ry,c,cl,cd)=>{for(let j=-ry-1;j<=ry+1;j++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(j/(ry+1))**2)))+1;R4(cx-w,cy+j,w*2,1,K)}for(let j=-ry;j<=ry;j++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(j/(ry+.5))**2)));if(w>0)R4(cx-w,cy+j,w*2,1,j<-ry*.45?cl:j>ry*.5?cd:c)}};
 function drawQueen(b,tm){const x=Math.round(b.x),y=Math.round(b.y-(b.jump||0)),h=hitW(b),B=h?'#ffffff':'#3e5a2a',Bd=h?'#e0e0e0':'#26381a',Bl=h?'#ffffff':'#5e8a3a',T='#c8d878';shd(b.x,b.y+6,40);
  // eight legs
  for(const s of[-1,1])for(let k=0;k<4;k++){const ph=Math.sin(tm*6+k*1.3)*2,lx=x+s*(10+k*3),ly=y-12+k*4;for(let j=0;j<10;j++){const px=lx+s*j*2,py=ly-(j<5?j*1.5:15-(j-5)*3.5)+ph;R4(px-1,py-1,3,3,K)}for(let j=0;j<10;j++){const px=lx+s*j*2,py=ly-(j<5?j*1.5:15-(j-5)*3.5)+ph;R4(px,py,1,1,Bd)}}
  // abdomen with thorns, head with eyes
  blob(x,y-24,16,11,B,Bl,Bd);for(const[a,c]of[[-6,-28],[5,-22],[-1,-18]])R4(x+a,y+c,3,2,'#a8c060');for(const[a,c]of[[-10,-36],[-2,-38],[6,-37],[12,-33],[-14,-30]]){R4(x+a-1,y+c-1,3,5,K);R4(x+a,y+c,1,3,T)}
  R4(x-9,y-14,18,14,K);R4(x-8,y-13,16,12,Bd);for(const[a,c]of[[-5,-10],[2,-10],[-3,-7],[0,-7]])R4(x+a,y+c,2,2,h?'#fff':'#f04040');R4(x-4,y-3,2,4,K);R4(x+2,y-3,2,4,K);
  R4(x-6,y-42,12,7,K);R4(x-5,y-41,10,5,'#c83a50');R4(x-2,y-43,4,3,'#f070a0')}
 function drawWarlord(b,tm){const x=Math.round(b.x),y=Math.round(b.y),h=hitW(b),A=h?'#ffffff':'#5a5a68',Ad=h?'#e0e0e0':'#3a3a46',Al=h?'#ffffff':'#8a8a98',F='#f86020',s=b.face;shd(x,y+6,34);
  for(const lx of[-7,3])R4(x+lx-1,y-10,8,16,K),R4(x+lx,y-9,6,14,Ad);
  R4(x-14,y-40,28,32,K);R4(x-13,y-39,26,30,A);R4(x-13,y-39,26,4,Al);R4(x-3,y-34,6,20,Ad);for(const[a,c]of[[-9,-30],[5,-30],[-9,-20],[5,-20]])R4(x+a,y+c,4,2,F);
  R4(x-18,y-42,10,9,K);R4(x+8,y-42,10,9,K);R4(x-17,y-41,8,7,Al);R4(x+9,y-41,8,7,Al);
  R4(x-8,y-54,16,15,K);R4(x-7,y-53,14,13,A);R4(x-7,y-53,14,3,Al);R4(x-5,y-47,10,2,K);R4(x-4,y-47,8,1,h?'#fff':F);for(let k=0;k<3;k++){const ph=(tm*2+k*.3)%1;R4(x-2+k*2,y-56-ph*8,2,4,ph<.5?'#f8b030':'#f05020')}
  // the greatsword
  const sx=x+s*16;R4(sx-2,y-50,5,40,K);R4(sx-1,y-49,3,34,'#d8d8e0');R4(sx-1,y-49,1,34,'#ffffff');R4(sx-5,y-16,11,3,K);R4(sx-4,y-15,9,1,'#e0b030');R4(sx-1,y-13,3,7,'#5a3418');if(b.act&&b.act.k==='sweep')R4(sx-1,y-49,3,34,'rgba(255,120,60,.6)')}
 function drawWyrm(b,tm){const x=Math.round(b.x),y=Math.round(b.y),h=hitW(b),S=h?'#ffffff':'#a8d8f0',Sd=h?'#e0e0e0':'#5888b8',Sl=h?'#ffffff':'#e0f4ff';shd(x,y+6,44);
  // coils
  const seg=[];for(let k=0;k<22;k++){const q=k*.42+tm*.5,rr=20-k*.55;seg.push([x+Math.cos(q)*rr,y-4+Math.sin(q)*rr*.38-k*.4,7-k*.12])}seg.sort((a,c)=>a[1]-c[1]);for(const[cx,cy,r]of seg)blob(Math.round(cx),Math.round(cy),Math.max(3,Math.round(r)),Math.max(3,Math.round(r*.8)),S,Sl,Sd);
  // neck and head
  const sw=Math.sin(tm*2)*3;for(let k=0;k<6;k++){R4(x-5+sw*k/6,y-14-k*6,10,8,K);R4(x-4+sw*k/6,y-13-k*6,8,6,S)}const hx=x+sw,hy=y-52;
  R4(hx-11,hy-8,22,14,K);R4(hx-10,hy-7,20,12,S);R4(hx-10,hy-7,20,3,Sl);R4(hx-7,hy-3,3,3,K);R4(hx+4,hy-3,3,3,K);R4(hx-6,hy-2,1,1,'#40d0ff');R4(hx+5,hy-2,1,1,'#40d0ff');
  for(const a of[-9,-4,4,9]){R4(hx+a-1,hy-14,3,7,K);R4(hx+a,hy-13,1,5,'#ffffff')}R4(hx-6,hy+3,12,3,K);for(let k=0;k<5;k++)R4(hx-5+k*2,hy+4,1,2,'#ffffff');
  for(let k=0;k<4;k++){const ph=(tm*.8+k*.25)%1;g.fillStyle='rgba(230,248,255,'+(.5*(1-ph))+')';g.fillRect(hx-10+k*6,hy+8+ph*14,2,2)}}
 function drawHerald(b,tm){const x=Math.round(b.x),bob=Math.round(Math.sin(tm*2)*3),y=Math.round(b.y)-8+bob,h=hitW(b),R0=h?'#ffffff':'#3a2a5a',Rd=h?'#e0e0e0':'#221838',Rl=h?'#ffffff':'#5a4a8a';
  g.fillStyle='rgba(150,100,240,'+(.12+.08*Math.sin(tm*3))+')';g.beginPath();g.arc(x,y-20,34,0,6.283);g.fill();shd(x,b.y+6,26);
  // robe (no feet: it floats), hood and the eye
  for(let j=0;j<34;j++){const w=6+Math.round(j*.42),wv=j>28?Math.round(Math.sin(tm*5+j)*1.5):0;R4(x-w-1+wv,y-38+j,w*2+2,1,K)}for(let j=1;j<33;j++){const w=5+Math.round(j*.42),wv=j>28?Math.round(Math.sin(tm*5+j)*1.5):0;R4(x-w+wv,y-38+j,w*2,1,j<4?Rl:j%7===0?Rd:R0)}
  R4(x-8,y-48,16,14,K);R4(x-7,y-47,14,12,Rd);R4(x-4,y-42,8,5,'#0a0612');const ey=Math.floor(tm*2)%7?'#d8a0ff':'#ffffff';R4(x-2,y-41,4,3,ey);R4(x-1,y-40,2,1,'#ffffff');
  for(const s of[-1,1]){const hx=x+s*18,hy=y-22+Math.round(Math.sin(tm*3+s)*3);R4(hx-4,hy-4,8,8,K);R4(hx-3,hy-3,6,6,'#9060e0');R4(hx-2,hy-2,2,2,'#e0c8ff')}
  for(let k=0;k<5;k++){const q=tm*1.5+k/5*6.283;R4(x+Math.cos(q)*26,y-20+Math.sin(q)*10,2,2,'#c8a0ff')}}
 function drawJack(b,tm){const x=Math.round(b.x),y=Math.round(b.y),h=hitW(b),fl=b.face<0;shd(x,y+6,16);GC=g;g.save();if(h)g.globalAlpha=.6;
  g.translate(x,y);g.scale(1.5,1.5);g.translate(-x,-y);try{cP({sk:1,hs:0,hc:0,sh:7,pn:1,ht:0,hcol:4,so:2},2,b.mv?[1,0,2,0][Math.floor(tm*7)%4]:0,x,y,fl)}catch(e){}
  R4(x-11,y-16,22,3,K);R4(x-10,y-15,20,1,'#33333c');R4(x-11,y-17,3,2,K);R4(x+8,y-17,3,2,K);R4(x-5,y-21,10,6,K);R4(x-4,y-20,8,5,'#2a2a32');R4(x-1,y-21,2,2,K);R4(x-4,y-17,8,1,'#c8c8d8');R4(x-4+(fl?-1:1),y-7,8,2,'#202028');
  const s=fl?-1:1;for(const o of[0,3]){const gx=x+s*(5+o),gy=y-4+o;R4(Math.min(gx,gx+s*7),gy-1,8,4,K);R4(Math.min(gx,gx+s*6),gy,7,2,'#e8e0a0')}g.restore()}
 function drawSpiderling(n,tm){const x=Math.round(n.x),y=Math.round(n.y),h=hitW(n),B=h?'#fff':'#3e5a2a';shd(x,y+5,10);for(const s of[-1,1])for(let k=0;k<3;k++){const ph=Math.round(Math.sin(tm*12+k)*1);R4(x+s*(4+k*2),y-3+k*2+ph,3,1,K)}
  R4(x-5,y-8,10,8,K);R4(x-4,y-7,8,6,B);R4(x-2,y-5,1,1,'#f04040');R4(x+1,y-5,1,1,'#f04040')}
 const DRAW={briarwood:drawQueen,ashfall:drawWarlord,ironcrest:drawWyrm,shattered:drawHerald,nomans:drawJack};
 window.SQIBDRAW=(id,b,tm)=>{if(!(window.SQIBART&&SQIBART(id,b,tm)))DRAW[id](b,tm)};
 {const _ps=pS;pS=function(n,tm){if(n&&n.type==='ib'){hzDraw(n,tm);SQIBDRAW(n.ib,n,tm);return}if(n&&n.type==='spiderling')return drawSpiderling(n,tm);return _ps(n,tm)}}

 // ---- the rare drops ----
 // Webling and Voidling (pets)
 const PSP={pweb:{n:'Webling',draw:(s,tm)=>{const x=Math.round(s.x),y=Math.round(s.y),mv=s.mv>0;shd(x,y+6,10);for(const sd of[-1,1])for(let k=0;k<4;k++){const ph=mv?Math.round(Math.sin(tm*14+k)*1):0;R4(x+sd*(4+k*2),y-4+k*2+ph,3,1,K)}
   R4(x-6,y-10,12,9,K);R4(x-5,y-9,10,7,'#4e6e32');R4(x-5,y-9,10,2,'#6e9a48');R4(x-3,y-14,6,5,K);R4(x-2,y-13,4,3,'#c83a50');R4(x-3,y-6,2,2,'#f04040');R4(x+1,y-6,2,2,'#f04040')}},
  pvoidl:{n:'Voidling',draw:(s,tm)=>{const x=Math.round(s.x),y=Math.round(s.y)-8+Math.round(Math.sin(tm*3)*2);g.fillStyle='rgba(160,110,240,.18)';g.beginPath();g.arc(x,y,10,0,6.283);g.fill();shd(x,s.y+6,8);
   R4(x-6,y-6,12,12,K);R4(x-5,y-5,10,10,'#3a2a5a');R4(x-5,y-5,10,2,'#5a4a8a');R4(x-3,y-2,6,4,'#0a0612');R4(x-1,y-1,2,2,Math.floor(tm*2)%6?'#d8a0ff':'#ffffff');for(let k=0;k<3;k++){const q=tm*2+k*2.1;R4(x+Math.cos(q)*9,y+Math.sin(q)*4,1,1,'#c8a0ff')}}}};
 for(const k in PSP){window.SQNPET[k]={n:PSP[k].n,src:'a rare drop from an island boss'};if(window.LUX&&LUX.PETS&&!LUX.PETS.some(p=>p.k===k))LUX.PETS.push({k,n:PSP[k].n,v:0,rare:1,c:['#888','#666','#aaa']});window.SQPETDRAW=window.SQPETDRAW||{};SQPETDRAW[k]=(k2,s,tm)=>PSP[k2].draw(s,tm)}
 // Warlord's blade: sword tier 8
 {TIER_N[8]='Warlord';TCOL[8]='#e04818';const k='eq_sword8',e={slot:'main',kind:'sword',tier:8,n:'Warlord\'s blade',ic:'sword',col:'#e04818',v:9000,atk:50};EQ[k]=e;EQK.push(k);INVK.push(k);EXTRA_BAG.push(k);INAME[k]=e.n;SELLP[k]=4500;SN[k]=e.n+'s';SHORT[k]=e.n.toLowerCase();
  IDESC[k]='RARE, from the Iron Warlord. A red-hot greatsword: the strongest sword there is. Wield at Attack 50.';inv[k]=inv[k]|0}
 // Frostbite ring
 if(window.SQJK){SQGEMC.frost=['#a8e0ff','#3870b0'];const j={k:'ja_frost',n:'Frostbite ring',s:'ring',g:'frost',v:6000,d:'Your melee hits chill monsters, and one in five freezes them solid for a moment.'};SQJK[j.k]=j;
  INVK.push(j.k);EXTRA_BAG.push(j.k);INAME[j.k]=j.n;IDESC[j.k]='Ring (rare, from the Frost Wyrm): '+j.d+' Wear it from the Bag.';SELLP[j.k]=2500;SN[j.k]=j.n+'s';SHORT[j.k]=j.n.toLowerCase()}
 {const _a=attack;attack=function(){if(!(window.SQJW&&SQJW.ring==='ja_frost'))return _a();const hp0=new Map();for(const n of en)if(!n.dead)hp0.set(n,n.hp);_a();
   for(const[n,h]of hp0)if(!n.dead&&n.hp<h){if(!n.big&&Math.random()<.2)n.frozen=1.2;for(let k=0;k<4;k++)part(n.x,n.y-8,(Math.random()-.5)*50,-30-Math.random()*30,.4,'#c8f0ff',-20,1)}}}
 // Outlaw's hat: a helmet you can see (like the flame crown)
 {const k='eq_ohat',e={slot:'helm',n:'Outlaw\'s hat',ic:'helm',col:'#2a2a32',v:6000};EQ[k]=e;EQK.push(k);INVK.push(k);EXTRA_BAG.push(k);INAME[k]=e.n;SELLP[k]=3000;SN[k]=e.n+'s';SHORT[k]=e.n.toLowerCase();
  IDESC[k]='RARE, from Black Jack, the Outlaw King. A black cowboy hat with a silver band. Defence like an adamant helmet.';inv[k]=inv[k]|0;
  let HAT=false;const AH=5;
  const _occ=occ;occ=function(slot){if(slot==='helm'&&HAT)return k;return _occ(slot)};
  const _ss=setSlot;setSlot=function(slot,kk){_ss(slot,kk);if(slot==='helm'){HAT=kk===k;if(HAT){ARM.helm=AH;CLS.helm=null}}};
  const _wu=watchUpgrades;watchUpgrades=function(){const was=HAT;_wu();if(was&&ARM.helm!==AH){if((inv['eq_helm'+AH]|0)>0)inv['eq_helm'+AH]--;inv[k]=(inv[k]|0)+1;HAT=false}};
  const _sn=snap;snap=function(){const s=_sn();if(HAT)s.ohat=1;return s};const _ap=applySave;applySave=function(S){_ap(S);HAT=!!(S&&S.ohat)&&ARM.helm===AH};const _ng=newGame;newGame=function(){HAT=false;_ng()};try{KNOWN49.add('ohat')}catch(e){}
  const _gc=gearCH;gearCH=function(){const c=_gc();if(HAT&&!(typeof HIDEH!=='undefined'&&HIDEH)){c.ht=0;delete c.mh;delete c.dyh;c.oh=1}return c};
  const OHC=new Map();const _ks=kitSprite;kitSprite=function(ch,dir,st,fl){const c=_ks(ch,dir,st,fl);if(!ch||!ch.oh)return c;const key=JSON.stringify(ch)+'|'+dir+'|'+st+'|'+(fl?1:0);let o=OHC.get(key);if(o)return o;
   const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let top=c.height,l=c.width,r=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>0){if(y<top)top=y}
   for(let x=0;x<c.width;x++)for(let y=top;y<top+6;y++)if(d[(y*c.width+x)*4+3]>0){if(x<l)l=x;if(x>r)r=x}
   o=document.createElement('canvas');o.width=c.width;o.height=c.height;const x=o.getContext('2d');x.drawImage(c,0,0);const cx=Math.round((l+r+1)/2),hw=Math.max(5,Math.round((r-l+1)/2)+2),by=top+3,
    rr=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
   rr(cx-hw-3,by-1,hw*2+6,3,K);rr(cx-hw-2,by,hw*2+4,1,'#33333c');rr(cx-hw-4,by-3,3,3,K);rr(cx+hw+1,by-3,3,3,K);rr(cx-hw-3,by-2,1,1,'#33333c');rr(cx+hw+2,by-2,1,1,'#33333c');rr(cx-hw+3,by-6,hw*2-6,6,K);rr(cx-hw+4,by-5,hw*2-8,5,'#2a2a32');rr(cx-1,by-5,2,1,K);rr(cx-hw+4,by-2,hw*2-8,1,'#c8c8d8');if(OHC.size>300)OHC.clear();
   OHC.set(key,o);return o};
  // the hat's icon
  const _ic=iconURL;iconURL=function(kk,col){if(kk!==k)return _ic(kk,col);const key='ohat';if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
   r(0,8,14,4,K);r(1,9,12,2,'#2a2a32');r(3,2,8,8,K);r(4,3,6,6,'#2a2a32');r(4,7,6,1,'#c8c8d8');return ICONC[key]=c.toDataURL()};if(typeof eqIcon==='function'){const _ei=eqIcon;eqIcon=function(kk){return kk===k?iconURL(kk):_ei(kk)}}}

 // ---- the wiki ----
 try{for(const id of ISL){const B=IB[id];WK_RARE.push([B.rare[1],/^eq_|^ja_/.test(B.rare[0])?B.rare[0]:null,B.n,B.rare[2],'5% from '+B.n+' ('+B.lm+', '+WORLD_REGIONS[id].name+').',/^p/.test(B.rare[0])?B.rare[0]:undefined])}
  WK_SKILL&&0}catch(e){}
 {const _wc=window.SQWK&&SQWK.cards;if(_wc){const mk=id=>()=>{const B=IB[id];return{x:0,y:0,hp:B.hp,mhp:B.hp,kx:0,ky:0,type:'ib',ib:id,big:1,t:0,pr:[],hz:[],face:1}};
   const wkE=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
   const IBP={};const ibPic=id=>{if(IBP[id]!=null)return IBP[id];try{const c=SQIBARTCAN(id,'idle','',0),x=c.getContext('2d'),d=x.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=-1,y1=-1;
     for(let y=0;y<c.height;y++)for(let X=0;X<c.width;X++)if(d[(y*c.width+X)*4+3]>40){if(X<x0)x0=X;if(X>x1)x1=X;if(y<y0)y0=y;if(y>y1)y1=y}
     const w=x1-x0+1,h=y1-y0+1,sz=Math.max(w,h)+4,S=3,o=document.createElement('canvas');o.width=o.height=sz*S;const ox=o.getContext('2d');ox.imageSmoothingEnabled=false;ox.drawImage(c,x0,y0,w,h,Math.round((sz-w)/2)*S,Math.round((sz-h)/2)*S,w*S,h*S);return IBP[id]=o.toDataURL()}catch(e){return IBP[id]=''}};
   const HOW={briarwood:'Spits fans of sticky web that slow you (she spreads her front legs first), leaps onto you (watch the green circle where she\'ll land) and calls spiderlings to swarm you.',
    ashfall:'Raises his greatsword over his shoulder before a wide sweep (get behind him), levels it before charging along the red line, and lifts it skyward to rain fire on you.',
    ironcrest:'Rears back before breathing a fan of icicles, roars out freezing shockwaves that slow you, and drops icicles from the ceiling.',
    shattered:'Lifts its orbs before firing a spiral of void orbs, blinks around the room, bursts the void under your feet and, once hurt, summons void wolves.',
    nomans:'Draws both pistols before firing a spread of bullets, lights dynamite over his head before throwing it, and whistles for bandits.'};
   window.SQIBWIKI=(tab,out,card,head,pic)=>{if(tab!=='bosses'&&tab!=='dungeons')return;head('Island bosses');
    out.push({t:'island bosses',h:'<p>Every island hides a boss behind its great sealed landmark. Its monsters drop sigil shards (about 1 in 25): five open the door for one fight. Bosses get faster at half health. Watch the warning circles, rings and red lines, and roll through them.</p>'});
    for(const id of ISL){const B=IB[id];card(B.n+' '+B.lm+' '+WORLD_REGIONS[id].name,ibPic(id)||pic('ib_'+id,mk(id)),'<b>'+wkE(B.n)+'</b> <span class="tag">'+B.hp+' HP</span><br><small>Behind '+wkE(B.lm)+' on '+wkE(WORLD_REGIONS[id].name)+' · Key: 5 '+wkE(B.shard.toLowerCase())+'s<br>Reward: '+B.gold[0]+'–'+B.gold[1]+' gold, '+B.loot.map(([k,n])=>n+' '+wkE((n>1?(SN[k]||INAME[k]):INAME[k])||k).toLowerCase()).join(', ')+'<br><b>How it fights:</b> '+wkE(HOW[id])+'</small><br><span class="tag">RARE DROP</span> <b>'+wkE(B.rare[1])+'</b> (5%): '+wkE(B.rare[2]))}}}}
}
