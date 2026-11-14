// ---------------------------------------------------------------- 66. Marlo's Emporium: pets, capes, dyes, fine furniture, potions
// A shopkeeper in Hollow Village sells things worth saving up for:
// - Pets (Cat, Dog, Slime, Fox) that follow you around. Capes (six colors) and outfit dyes (ten colors for your top,
//   legs and hat or helmet). Pets, capes and dyes are yours to keep: choose them any time on the Style screen
//   (START menu > Style). Other players see them.
// - Fine furniture for your house (Painting, Grandfather clock, Aquarium, Fireplace, Slime King trophy, Golden statue).
// - Potions: Healing (full HP), Strength (+2 melee damage), Iron skin (+15% block), Swiftness (run without spending
//   extra food) - the buffs last 2 minutes. Use them from the Bag. EAT never drinks your potions.
var LUX={};
{const PETS=[{k:'cat',n:'Cat',v:5000,c:['#e89048','#b86020','#f8d8b0']},{k:'dog',n:'Dog',v:5000,c:['#a87048','#704020','#e8d0b0']},{k:'slime',n:'Slime',v:8000,c:['#58b8f8','#2878c8','#d0f0ff']},{k:'fox',n:'Fox',v:12000,c:['#f07028','#b04010','#f8f8f0']},{k:'imp',n:'Imp',v:0,rare:1,c:['#b8302a','#7a1a1a','#e8604a']}];
 const CAPES=[{n:'Red',c:'#c83040',v:2000},{n:'Blue',c:'#3858c8',v:2000},{n:'Green',c:'#3a8a3a',v:2000},{n:'Purple',c:'#7848c0',v:4000},{n:'Black',c:'#303038',v:4000},{n:'Gold',c:'#e8b830',v:15000}];
 const DYES=[{n:'Crimson',c:'#c83040'},{n:'Orange',c:'#e07030'},{n:'Gold',c:'#e8b830'},{n:'Forest',c:'#3a8a3a'},{n:'Teal',c:'#2aa098'},{n:'Royal',c:'#3858c8'},{n:'Violet',c:'#7848c0'},{n:'Pink',c:'#e070a8'},{n:'Black',c:'#303038'},{n:'White',c:'#e8e8f0'}],DYEV=800;
 const FURN2=[{k:'fpaint',n:'Painting',v:3000,d:'A landscape of Hollow Island in a gilded frame.'},{k:'fclock',n:'Grandfather clock',v:4000,d:'Tick, tock. Keeps the island\'s time.'},{k:'ffire',n:'Fireplace',v:6000,d:'A stone fireplace with a cozy fire.'},
  {k:'faqua',n:'Aquarium',v:8000,d:'Little fish swim in circles.'},{k:'ftroph',n:'Slime King trophy',v:10000,d:'The crown of a defeated Slime King, mounted on a plinth.'},{k:'fstatue',n:'Golden statue',v:25000,d:'A solid gold statue. Of you, obviously.'}];
 const POTS=[{k:'pot_heal',n:'Healing potion',v:150,d:'Restores all your HP.',heal:6},{k:'pot_str',n:'Strength potion',v:300,d:'+2 melee damage for 2 minutes.',buff:'str'},
  {k:'pot_iron',n:'Iron skin potion',v:300,d:'+15% block chance for 2 minutes.',buff:'iron'},{k:'pot_swift',n:'Swiftness potion',v:250,d:'Sprint without spending extra food for 2 minutes.',buff:'swift'}];
 const COS={pets:[],capes:[],dyes:[],pet:null,cape:0,db:0,dl:0,dh:0};LUX.COS=COS;
 // ---- items ----
 for(const f of FURN2){BK.push(f.k);BHP[f.k]=1;INVK.push(f.k);INAME[f.k]=f.n;IDESC[f.k]=f.d+' Furniture for your house.';SELLP[f.k]=Math.round(f.v/4);SN[f.k]=f.n+'s';if(typeof SHORT!=='undefined')SHORT[f.k]=f.n.toLowerCase();FURN_ONLY.add(f.k)}
 for(const p of POTS){INVK.push(p.k);INAME[p.k]=p.n;IDESC[p.k]=p.d;SELLP[p.k]=Math.round(p.v/3);SN[p.k]=p.n+'s';if(typeof SHORT!=='undefined')SHORT[p.k]=p.n.toLowerCase();FOODS.push({k:p.k,n:p.n.toLowerCase(),heal:p.heal||0,hun:0,pot:1})}
 if(typeof EXTRA_BAG!=='undefined')EXTRA_BAG.push(...FURN2.map(f=>f.k),...POTS.map(p=>p.k));
 // ---- potions: buffs ----
 const BUFF={};LUX.BUFF=BUFF;const bOn=k=>BUFF[k]&&BUFF[k]>performance.now();
 const _uf=useFood;useFood=function(k){const p=POTS.find(q=>q.k===k);if(!p)return _uf(k);if((inv[k]|0)<1)return;inv[k]--;
  if(p.heal){P.hp=6;say('You drink the healing potion. Fully healed!')}else{BUFF[p.buff]=performance.now()+120000;say('You drink the '+p.n.toLowerCase()+'. '+p.d.replace(' for 2 minutes','')+' (2 min)')}
  try{sfx('quest')}catch(e){}saveLocal(true);if(pnOpen)rPn()};
 const _mf=meleeFlat;meleeFlat=function(){return _mf()+(bOn('str')?2:0)};
 const _bb=blockBonus;blockBonus=function(){return _bb()+(bOn('iron')?.15:0)};
 const _bc=blockCap;blockCap=function(){return _bc()+(bOn('iron')?.1:0)};
 const _sp=isSprint;isSprint=function(){if(bOn('swift')&&!(swing>0)&&!dead&&!pnOpen&&!menuOpen&&!FISH){const m=Math.hypot(jx,jy)>.1||K.w||K.a||K.s||K.d||K.arrowup||K.arrowdown||K.arrowleft||K.arrowright;if(m)return true}return _sp()};
 {const _u=upd;upd=function(dt){const h0=hunger;_u(dt);if(bOn('swift')&&hunger<h0){const passive=dt*.9*FOOD_RATE;if(h0-hunger>passive)hunger=Math.min(100,h0-passive)}}}
 // EAT never drinks potions
 const _eat=eat;eat=function(){const keep={};for(const p of POTS){keep[p.k]=inv[p.k]|0;inv[p.k]=0}try{_eat()}finally{for(const k in keep)inv[k]=(inv[k]|0)+keep[k]}};
 // buff timers on screen
 const bx=document.createElement('div');bx.id='luxbuff';bx.style.cssText='position:fixed;left:8px;top:calc(52% + 48px);z-index:29;display:flex;flex-direction:column;gap:3px;pointer-events:none;font:700 12px '+PF;document.body.appendChild(bx);
 setInterval(()=>{const now=performance.now(),L=[['str','STRENGTH','#c83040'],['iron','IRON SKIN','#6878a8'],['swift','SWIFTNESS','#2aa098'],['wis','WISDOM','#8848c8'],['regen','REGENERATION','#38a048']].filter(([k])=>BUFF[k]>now);
  bx.style.display=(pnOpen||menuOpen)?'none':'flex';bx.innerHTML=L.map(([k,n,c])=>{const s=Math.ceil((BUFF[k]-now)/1000);return'<span style="background:#f8f8f8;border:2px solid #485870;padding:2px 6px;color:'+c+'">'+n+' '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+'</span>'}).join('');
  for(const k in BUFF)if(BUFF[k]&&BUFF[k]<=now){BUFF[k]=0;say({str:'Your strength wore off.',iron:'Your iron skin wore off.',swift:'Your swiftness wore off.',wis:'Your wisdom wore off.',regen:'Your regeneration wore off.'}[k]||'')}},500);
 // ---- saves ----
 const _sn=snap;snap=function(){const s=_sn();s.cos={pets:COS.pets.slice(),capes:COS.capes.slice(),dyes:COS.dyes.slice(),pet:COS.pet,cape:COS.cape,db:COS.db,dl:COS.dl,dh:COS.dh};return s};
 const _ap=applySave;applySave=function(S){_ap(S);const c=S.cos||{},arr=a=>Array.isArray(a)?a:[];COS.pets=arr(c.pets).filter(k=>PETS.some(p=>p.k===k));COS.capes=arr(c.capes).map(Number).filter(i=>i>=1&&i<=CAPES.length);COS.dyes=arr(c.dyes).map(Number).filter(i=>i>=1&&i<=DYES.length);
  COS.pet=COS.pets.includes(c.pet)?c.pet:null;COS.cape=COS.capes.includes(+c.cape)?+c.cape:0;for(const k of['db','dl','dh'])COS[k]=COS.dyes.includes(+c[k])?+c[k]:0;KITC.clear()};
 // ---- looks: capes and dyes are part of the character sprite, so other players see them too ----
 const _gc=gearCH;gearCH=function(){const c=_gc();if(COS.cape)c.cape=COS.cape;if(COS.db)c.dyb=COS.db;if(COS.dl)c.dyl=COS.dl;if(COS.dh)c.dyh=COS.dh;return c};
 const _kl=kitLook;kitLook=function(ch){const o=_kl(ch),d=i=>DYES[(i|0)-1];if(d(ch.dyb)&&o.body)o.bc=d(ch.dyb).c;if(d(ch.dyl)&&o.legs)o.lc=d(ch.dyl).c;if(d(ch.dyh)&&o.head)o.hc=d(ch.dyh).c;return o};
 const shade=(hex,f)=>'#'+[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*f))).toString(16).padStart(2,'0')).join('');
 const _kb=kitBuild;kitBuild=function(ch,dir,st){const base=_kb(ch,dir,st),cp=CAPES[(ch.cape|0)-1];if(!cp)return base;const c=document.createElement('canvas');c.width=16;c.height=32;const x=c.getContext('2d'),C=cp.c,Dk=shade(C,.7),Lt=shade(C,1.2),K='#181018';
  const px=(a,b,col)=>{x.fillStyle=col;x.fillRect(a,b,1,1)};
  if(dir===1){x.drawImage(base,0,0);for(let y=21;y<=29;y++){const w=Math.min(6,2+((y-21)>>1)),a=7-w,b=8+w;px(a-1,y,K);px(b+1,y,K);for(let X=a;X<=b;X++)px(X,y,X===a||X===b?Dk:(X===7||X===8)&&y>23?Lt:C)}for(let X=1;X<=14;X++)if(X>=7-6-1&&X<=8+6+1)px(X,30,K)}
  else if(dir===0){for(let y=22;y<=30;y++)for(const X of[0,1,14,15])if(y>23||X===1||X===14)px(X,y,X===0||X===15?K:Dk);x.drawImage(base,0,0);px(3,22,Lt);px(12,22,Lt)}
  else{for(let y=21;y<=30;y++){const w=y<24?1:y<27?2:3;for(let k=0;k<w;k++)px(11+k,y,k===w-1?Dk:C);px(11+w,y,K)}x.drawImage(base,0,0)}
  return c};
 // ---- pets: follow you around (and other players' pets follow them) ----
 const PETSPR={};function petSprite(k,f){if(k==='imp')return null;const key=k+f;if(PETSPR[key])return PETSPR[key];const P2=PETS.find(p=>p.k===k);if(!P2)return null;const c=document.createElement('canvas');c.width=12;c.height=12;const x=c.getContext('2d'),[A,B,Cc]=P2.c,K='#181018';
  const r=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
  if(k==='slime'){r(2,4,8,7,K);r(1,6,10,5,K);r(3,5,6,5,A);r(2,7,8,3,A);r(3,9,6,1,B);r(4,5,2,1,Cc);r(4,7,1,1,K);r(7,7,1,1,K)}
  else{const ears=k==='dog'?[[2,2,2,3],[8,2,2,3]]:[[2,1,2,3],[8,1,2,3]];for(const e of ears)r(e[0],e[1],e[2],e[3],K);r(2,3,8,5,K);r(1,7,10,4,K);
   r(3,4,6,3,A);r(2,8,8,2,A);for(const e of ears)r(e[0]+(k==='dog'?0:0),e[1]+1,1,1,k==='dog'?B:A);r(4,5,1,1,K);r(7,5,1,1,K);r(5,6,2,1,k==='fox'?Cc:B);
   if(k==='fox'||k==='cat')r(10,6,2,3,K),r(10,7,1,1,k==='fox'?Cc:A);if(k==='fox')r(3,8,6,2,Cc);const leg=f?1:0;r(2,10,2,1,K);r(8-leg,10,2,1,K)}
  return PETSPR[key]=c}
 const petState=new Map();
 function petStep(id,ox,oy,fc){let s=petState.get(id);if(!s){s={x:ox-14,y:oy+4,t:0};petState.set(id,s)}const tx=ox-(fc&&fc[0]?fc[0]*16:10),ty=oy+(fc&&fc[1]?-fc[1]*10:4)+2,dx=tx-s.x,dy=ty-s.y,d=Math.hypot(dx,dy),now=performance.now();
  const dt=Math.min(.1,(now-(s.lt||now))/1000);s.lt=now;if(d>160){s.x=tx;s.y=ty}else if(d>6){const sp=Math.min(d,(d>40?110:60)*dt);s.x+=dx/d*sp;s.y+=dy/d*sp;s.t+=dt*8;s.fl=dx<0}return s}
 function drawPet(k,s){const sp=petSprite(k,Math.floor(s.t)%2);if(!sp)return;const x=Math.round(s.x),y=Math.round(s.y);shd(x,y+5,9);g.save();if(s.fl){g.translate(x*2,0);g.scale(-1,1)}g.imageSmoothingEnabled=false;g.drawImage(sp,x-6,y-6);g.restore()}
 const _pP=pP;pP=function(tm){if(COS.pet==='imp'){if(impOn()&&IMP.dead<=0)impDraw(IMP.x,IMP.y,IMP.dir,Math.floor(IMP.t)%4,IMP.stab>0,IMP.hp,IMP.max)}else if(COS.pet&&!(typeof SAILING!=='undefined'&&SAILING)){const s=petStep('me',P.x,P.y,face);drawPet(COS.pet,s)}return _pP(tm)};
 LUX.drawPeerPet=(r,tm)=>{if(r.pet==='imp'){if(!r.sl)impDrawPeer(r,tm);return}if(!r.pet||!PETS.some(p=>p.k===r.pet)||r.sl)return;const s=petStep(r.uid||'?',r.x,r.y,r.d===2?[r.fl?-1:1,0]:[0,r.d===1?-1:1]);drawPet(r.pet,s)};
 LUX.pet=()=>COS.pet||'';LUX.PETS=PETS;LUX.EMP={PETS,CAPES,DYES,DYEV,FURN2,POTS};
 // ---- The Imp (a rare pet from the Demon world boss) ----
 // It follows you like any pet, but when something hurts you it runs at it and stabs with its poison dagger
 // (poison deals a little damage every second for a few seconds). Monsters can hurt it back; if it falls it comes
 // back after a minute. In PvP it only goes after a player who hits you. Other players see it and its stabs.
 const IMP={x:0,y:0,hp:12,max:12,dead:0,tgt:null,ptgt:null,cd:0,stab:0,dir:'s',t:0,hurtT:0,hp0:6,hurt0:0,seen:false,shown:0};
 const impOn=()=>COS.pet==='imp'&&!dead&&!(typeof SAILING!=='undefined'&&SAILING)&&!(window.SQRSAIL&&SQRSAIL.on);
 const impDmg=()=>1+Math.floor(lvOf(0)/25),IMP_POIS=4;
 const IMPC={};function impCan(fr,d,a){const k=d+fr+(a?'a':'');if(IMPC[k])return IMPC[k];const f=window.SQIMPSP;return f?(IMPC[k]=f(fr,d,a)):null}
 window.SQIMPDRAW=(x,y)=>impDraw(x,y,0,0,false,10,10);
 function impDraw(x,y,d,fr,a,hp,max){const c=impCan(fr,d,a);if(!c)return;GC=g;shd(x,y+5,10);g.save();g.imageSmoothingEnabled=false;g.drawImage(c,Math.round(x-12),Math.round(y+5-27));g.restore();
  if(hp!=null&&hp<max){Rg(Math.round(x-7),Math.round(y-25),14,3,'#181018');Rg(Math.round(x-6),Math.round(y-24),Math.max(0,Math.round(12*hp/max)),1,'#58e070')}}
 const dirOf=(dx,dy,old)=>Math.abs(dx)<1&&Math.abs(dy)<1?old:Math.abs(dx)>=Math.abs(dy)?(dx<0?'w':'e'):(dy<0?'n':'s');
 function impPoof(x,y){for(let k=0;k<14;k++){const a=k/14*6.283;part(x,y-8,Math.cos(a)*60,Math.sin(a)*40,.5,k%2?'#a080c0':'#605070',-20,2)}}
 function impHitMob(n){const d=impDmg();n.hp-=d;n._ipois=IMP_POIS;n._iptk=1;const big=n.type==='boss'||n.type==='bonelord'||n.big;DMGS.push({x:n.x,y:n.y-(big?30:14),v:String(d),t:0,c:'#78f090',sc:curScene()});
  for(let k=0;k<5;k++)part(n.x,n.y-6,(Math.random()-.5)*70,-Math.random()*60,.35,k%2?'#58e070':'#b8ffa0',120);try{sfx('hit')}catch(e){}if(n.hp<=0&&!n._wb)killEnemy(n,'imp')}
 {const _u=upd;upd=function(dt){const hp0=P.hp,h0=hurt;_u(dt);if(menuOpen||pnOpen)return;
   // poison ticking on monsters (whoever's imp it came from)
   for(const n of en){if(!(n._ipois>0)||n.dead)continue;n._ipois-=dt;if((n._iptk-=dt)<=0){n._iptk=1;n.hp-=1;DMGS.push({x:n.x,y:n.y-14,v:'1',t:0,c:'#58e070',sc:curScene()});if(n.hp<=0&&!n._wb)killEnemy(n,'imp')}}
   if(!impOn()){IMP.seen=false;IMP.tgt=IMP.ptgt=null;return}
   if(!IMP.seen){IMP.seen=true;IMP.x=P.x-14;IMP.y=P.y+4}
   if(IMP.dead>0){IMP.dead-=dt;if(IMP.dead<=0){IMP.hp=IMP.max;IMP.x=P.x-12;IMP.y=P.y+4;impPoof(IMP.x,IMP.y);say('Your imp is back!')}return}
   // something hurt you: the imp goes for it
   if(P.hp<hp0||(hurt>0&&h0<=0)){let best=null,bd=48;for(const n of en){if(n.dead)continue;const d=Math.hypot(n.x-P.x,n.y-P.y)-(n.big?24:0);if(d<bd){bd=d;best=n}}
    if(!best&&WB_ENT())best=WB_ENT();if(best){IMP.tgt=best;IMP.ptgt=null}}
   let tx=P.x-(face[0]?face[0]*16:10),ty=P.y+(face[1]?-face[1]*10:4)+2,goal=null;
   const T=IMP.tgt;if(T&&(T.dead||Math.hypot(T.x-P.x,T.y-P.y)>180))IMP.tgt=null;
   const PT=IMP.ptgt&&window.SQIMPPVP?SQIMPPVP.pos(IMP.ptgt):null;if(IMP.ptgt&&!PT)IMP.ptgt=null;
   if(IMP.tgt){goal=IMP.tgt;tx=goal.x+(IMP.x<goal.x?-10:10)*(goal.big?2.2:1);ty=goal.y+2}else if(PT){goal=PT;tx=PT.x+(IMP.x<PT.x?-9:9);ty=PT.y}
   const dx=tx-IMP.x,dy=ty-IMP.y,dd=Math.hypot(dx,dy);if(dd>220){IMP.x=tx;IMP.y=ty}else if(dd>3){const sp=Math.min(dd,(goal?120:dd>40?110:60)*dt);IMP.x+=dx/dd*sp;IMP.y+=dy/dd*sp;IMP.t+=dt*8}
   IMP.dir=goal?dirOf(goal.x-IMP.x,goal.y-IMP.y,IMP.dir):dd>3?dirOf(dx,dy,IMP.dir):IMP.dir;IMP.cd-=dt;IMP.stab=Math.max(0,IMP.stab-dt);
   if(goal&&Math.hypot(goal.x-IMP.x,goal.y-IMP.y)<(goal.big?34:16)&&IMP.cd<=0){IMP.cd=.8;IMP.stab=.25;if(IMP.tgt)impHitMob(IMP.tgt);else if(window.SQIMPPVP)SQIMPPVP.hit(IMP.ptgt)}
   // monsters right next to it scratch back
   if(IMP.tgt&&!IMP.tgt._wb&&Math.hypot(IMP.tgt.x-IMP.x,IMP.tgt.y-IMP.y)<14&&(IMP.hurtT-=dt)<=0){IMP.hurtT=1.4;IMP.hp-=1;
    if(IMP.hp<=0){IMP.dead=60;IMP.tgt=IMP.ptgt=null;impPoof(IMP.x,IMP.y);say('Your imp was defeated! It will be back in a minute.');try{sfx('hurt')}catch(e){}}}
   else if(!IMP.tgt&&IMP.hp<IMP.max&&(IMP.hurtT-=dt)<=0){IMP.hurtT=4;IMP.hp++}}}
 const WB_ENT=()=>{const W=window.SQWB;return W&&W.ent&&!W.ent.dead&&Math.hypot(W.ent.x-P.x,W.ent.y-P.y)<220?W.ent:null};
 // drawing it (your imp is drawn by the pet code below; other players' imps where they report them)
 window.SQIMP={state:IMP,aggro:u=>{if(impOn()&&IMP.dead<=0){IMP.ptgt=u;IMP.tgt=null}},pres:()=>impOn()&&IMP.dead<=0?[Math.round(IMP.x),Math.round(IMP.y),'nswe'.indexOf(IMP.dir),IMP.stab>0?1:0]:0};
 const IMPR=new Map();
 function impDrawPeer(r,tm){const m=r.im;if(!Array.isArray(m)||m.length<3)return;let s=IMPR.get(r.uid);if(!s){s={x:+m[0],y:+m[1]};IMPR.set(r.uid,s)}s.x+=((+m[0])-s.x)*.25;s.y+=((+m[1])-s.y)*.25;
  impDraw(s.x,s.y,'nswe'[m[2]|0]||'s',Math.floor(tm/.2)%4,!!m[3])}
 LUX.giveImp=()=>{if(!COS.pets.includes('imp'))COS.pets.push('imp');COS.pet='imp';IMP.seen=false;IMP.dead=0;IMP.hp=IMP.max;saveLocal(true)};

 // ---- fine furniture art ----
 const _dpc=drawPiece;drawPiece=function(t,x,y,f,ghost,tm){const x0=x*16,y0=y*16,R2=(a,b,w,h,c)=>Rg(x0+a,y0+b,w,h,c);if(!FURN2.some(q=>q.k===t))return _dpc(t,x,y,f,ghost,tm);
  if(t==='fpaint'){R2(1,-10,14,13,O);R2(2,-9,12,11,'#e8b830');R2(3,-8,10,9,'#78b8f0');R2(3,-3,10,4,'#58a848');R2(6,-6,3,3,'#f8f8f0');R2(7,3,2,12,O);R2(4,13,8,2,O)}
  else if(t==='fclock'){shd(x0+8,y0+15,10);R2(3,-14,10,29,O);R2(4,-13,8,27,'#8a5428');R2(5,-12,6,6,'#f4ecd8');R2(7,-11,1,3,O);R2(8,-9,2,1,O);R2(6,-4,4,10,'#5a3418');const sw=Math.round(Math.sin((tm||0)*3)*1.5);R2(7+sw,-2,2,6,'#e8b830')}
  else if(t==='ffire'){R2(0,-8,16,24,O);R2(1,-7,14,22,'#9a9aa8');for(const[a,b]of[[1,-7],[8,-3],[1,1],[8,5],[1,9]])R2(a,b,7,3,'#b8b8c8');R2(3,3,10,12,'#201818');const fl=Math.floor((tm||0)*8)%2;R2(5,9-fl,6,6,'#f08830');R2(6,11-fl,4,4,'#f8d848');R2(0,-9,16,2,'#7a5a40')}
  else if(t==='faqua'){shd(x0+8,y0+15,12);R2(0,-4,16,19,O);R2(1,-3,14,13,'#5898e0');R2(1,-3,14,2,'#a8d8f8');R2(1,10,14,4,'#6a4a30');const fx=Math.round(5+Math.sin((tm||0)*1.5)*4);R2(fx,2,3,2,'#f08830');R2(fx+3,2,1,1,'#f08830');R2(11-Math.round(Math.sin((tm||0))*3),6,2,1,'#f8d848');R2(3,7,1,3,'#48a838')}
  else if(t==='ftroph'){shd(x0+8,y0+15,12);R2(2,3,12,12,O);R2(3,4,10,10,'#8a8a98');R2(3,4,10,2,'#b0b0c0');R2(2,-6,12,10,O);R2(3,-5,10,8,'#58b8f8');R2(4,-4,3,2,'#d0f0ff');R2(5,-9,6,4,O);R2(6,-8,1,2,'#e8b830');R2(8,-8,1,2,'#e8b830');R2(10,-8,1,2,'#e8b830');R2(6,-7,5,2,'#e8b830')}
  else if(t==='fstatue'){shd(x0+8,y0+15,12);R2(2,9,12,6,O);R2(3,10,10,4,'#9a9aa8');R2(4,-14,8,24,O);R2(5,-13,6,6,'#e8b830');R2(5,-7,6,9,'#d8a020');R2(4,-5,1,6,'#e8b830');R2(11,-5,1,6,'#e8b830');R2(6,2,2,7,'#d8a020');R2(8,2,2,7,'#c89018');R2(6,-12,1,1,'#fff8c0')}
  if(ghost){}};
 // ---- the shopkeeper ----
 {let sx=VX+5,sy=VY+3;const free=(x,y)=>!BS.has(y*N+x)&&!obj[y*N+x]&&tile[y*N+x]!==0&&!solid(x*16+8,y*16+8);for(let r=0;r<8&&!free(sx,sy);r++)for(let dy=-r;dy<=r&&!free(sx,sy);dy++)for(let dx=-r;dx<=r;dx++)if(free(VX+5+dx,VY+3+dy)){sx=VX+5+dx;sy=VY+3+dy;break}
  NPCS.push({kind:'emporium',name:'Marlo',x:sx*16+8,y:sy*16+8,ch:{sk:2,hs:3,hc:2,sh:6,pn:1,ht:1,hcol:5,so:2}})}
 let EMT='pets';
 const coin=v=>v.toLocaleString('en-US')+' gold';
 const row=(icon,name,desc,price,state,data)=>'<div class="gr" style="align-items:center"><div class="gi" style="flex:1;min-width:0"><b>'+name+'</b><br><small>'+desc+'</small></div>'+
  (state==='owned'?'<span style="font-size:12px;color:#28a048;font-weight:700;min-width:70px;text-align:center">OWNED</span>':'<button class="gc emb" '+data+(GLD<price?' style="opacity:.5"':'')+'>'+coin(price)+'</button>')+'</div>';
 function emporiumHTML(){const tab=(k,l)=>'<button class="sb emt'+(EMT===k?' on':'')+'" data-t="'+k+'" style="display:inline-block;width:auto;margin:3px;padding:8px 10px'+(EMT===k?';background:#485870;color:#f8f8f8':'')+'">'+l+'</button>';
  let h='<div class="tl">Gold: '+GLD.toLocaleString('en-US')+'</div><div style="text-align:center">'+tab('pets','Pets')+tab('capes','Capes')+tab('dyes','Dyes')+tab('furn','Furniture')+tab('pots','Potions')+'</div>';
  if(EMT==='pets')for(const p of PETS.filter(q=>!q.rare))h+=row('',p.n,'Follows you everywhere. Other players see it too.',p.v,COS.pets.includes(p.k)?'owned':'','data-c="pet" data-k="'+p.k+'"');
  if(EMT==='capes')CAPES.forEach((c,i)=>{h+=row('','<span style="color:'+c.c+'">&#9632;</span> '+c.n+' cape','Wear it on the Style screen.',c.v,COS.capes.includes(i+1)?'owned':'','data-c="cape" data-k="'+(i+1)+'"')});
  if(EMT==='dyes')DYES.forEach((c,i)=>{h+=row('','<span style="color:'+c.c+'">&#9632;</span> '+c.n+' dye','Recolor your top, legs or hat on the Style screen. Works on armor too.',DYEV,COS.dyes.includes(i+1)?'owned':'','data-c="dye" data-k="'+(i+1)+'"')});
  if(EMT==='furn')for(const f of FURN2)h+=row('',f.n+((inv[f.k]|0)?' <small>(have '+(inv[f.k]|0)+')</small>':''),f.d,f.v,'','data-c="furn" data-k="'+f.k+'"');
  if(EMT==='pots')for(const p of POTS)h+=row('',p.n+((inv[p.k]|0)?' <small>(have '+(inv[p.k]|0)+')</small>':''),p.d,p.v,'','data-c="pot" data-k="'+p.k+'"');
  return h+'<div class="tl" style="font-size:12px;font-weight:400;opacity:.75;margin-top:10px">Pets, capes and dyes: START menu &gt; Style.</div>'}
 function luxBuy(c,k){let price=0,ok=false,name='';
  if(c==='pet'){const p=PETS.find(q=>q.k===k);if(!p||p.rare||COS.pets.includes(k))return;price=p.v;name=p.n.toLowerCase()}
  else if(c==='cape'){const i=+k,cp=CAPES[i-1];if(!cp||COS.capes.includes(i))return;price=cp.v;name=cp.n.toLowerCase()+' cape'}
  else if(c==='dye'){const i=+k;if(!DYES[i-1]||COS.dyes.includes(i))return;price=DYEV;name=DYES[i-1].n.toLowerCase()+' dye'}
  else if(c==='furn'){const f=FURN2.find(q=>q.k===k);if(!f)return;price=f.v;name=f.n.toLowerCase()}
  else if(c==='pot'){const p=POTS.find(q=>q.k===k);if(!p)return;price=p.v;name=p.n.toLowerCase()}
  if(GLD<price){say('Not enough gold. That costs '+coin(price)+'.');sfx('swish');return}GLD-=price;
  if(c==='pet'){COS.pets.push(k);COS.pet=k;say('Your new '+name+' follows you now!')}else if(c==='cape'){COS.capes.push(+k);COS.cape=+k;KITC.clear();say('You put on the '+name+'.')}
  else if(c==='dye'){COS.dyes.push(+k);say('Bought the '+name+'. Use it on the Style screen.')}else{inv[k]=(inv[k]|0)+1;say('Bought a '+name+'.')}
  try{sfx('coin')}catch(e){try{sfx('pickup')}catch(e2){}}if(typeof svg==='function')svg();saveLocal(true);try{saveCloud(true)}catch(e){}rPn()}
 // ---- the Style screen ----
 const STAB=31;function styleHTML(){const pick=(lab,on,data)=>'<button class="gc sty'+(on?' on':'')+'" '+data+' style="margin:3px;'+(on?'background:#485870;color:#f8f8f8':'')+'">'+lab+'</button>';
  let h='<div class="tl">STYLE</div><div class="qc"><b>Pet</b><div>'+pick('None',!COS.pet,'data-s="pet" data-v=""');for(const k of COS.pets)h+=pick(PETS.find(p=>p.k===k).n,COS.pet===k,'data-s="pet" data-v="'+k+'"');
  h+='</div></div><div class="qc"><b>Cape</b><div>'+pick('None',!COS.cape,'data-s="cape" data-v="0"');for(const i of COS.capes)h+=pick('<span style="color:'+CAPES[i-1].c+'">&#9632;</span> '+CAPES[i-1].n,COS.cape===i,'data-s="cape" data-v="'+i+'"');
  for(const[slot,lab]of[['db','Top / chestplate dye'],['dl','Legs dye'],['dh','Hat / helmet dye']]){h+='</div></div><div class="qc"><b>'+lab+'</b><div>'+pick('Original',!COS[slot],'data-s="'+slot+'" data-v="0"');for(const i of COS.dyes)h+=pick('<span style="color:'+DYES[i-1].c+'">&#9632;</span> '+DYES[i-1].n,COS[slot]===i,'data-s="'+slot+'" data-v="'+i+'"')}
  h+='</div></div>';if(!COS.pets.length&&!COS.capes.length&&!COS.dyes.length)h+='<div class="tl" style="font-size:13px;font-weight:400">Nothing here yet. Visit Marlo\'s Emporium in Hollow Village.</div>';return h}
 SMI.splice(SMI.findIndex(x=>x.id==='options'),0,{id:'style',l:()=>'Style'});
 const _ss=showScreen;showScreen=function(id){if(id!=='style')return _ss(id);pnOpen=true;ptab=STAB;jx=jy=0;pn.style.display='block';rPn();sfx('talk')};
 const _r=rPn;rPn=function(){if(ptab===STAB){panelChrome('');pbd.innerHTML=styleHTML();return}if(ptab===2&&shop==='emporium'){panelChrome("Marlo's Emporium");pbd.innerHTML=emporiumHTML();return}_r()};
 const _oc=pbd.onclick;pbd.onclick=e=>{const t=e.target;let b;
  if((b=t.closest('.emt'))){EMT=b.dataset.t;rPn();return}if((b=t.closest('.emb'))){luxBuy(b.dataset.c,b.dataset.k);return}
  if((b=t.closest('.sty'))){const s=b.dataset.s,v=b.dataset.v;if(s==='pet')COS.pet=v||null;else COS[s]=+v||0;KITC.clear();saveLocal(true);rPn();return}_oc(e)};
 // talking to Marlo
 if(typeof LINES!=='undefined')LINES.marlo={d:['Finest goods on the island! Pets, capes, dyes, furniture, potions.','Gold burning a hole in your pocket? I can help with that.']}}
