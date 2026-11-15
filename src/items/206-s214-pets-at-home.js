// ---- 214. Pets at home: place pets in your house, castle or backyard, where they live their own little lives ----
// Every pet item (104's pet_<kind>) becomes a building kind (BK), so the bag shows PLACE for it and every home loader
// (012 houses, 067 island homes, 077 castles, 145 yards, 061/145 what visitors read) keeps it like any furniture row
// [i, 'pet_<kind>']. The row is only the pet's home spot: it isn't solid (outermost `solid`), and the pet itself is a small
// simulation run by this file (state in `PS`, per house + spot): it wanders around the room, stops to look around, naps
// (more at night, Zz), plays chase with another pet, has the zoomies, and comes over to greet whoever walks up (heart),
// then trots along with them for a bit. Each game runs its own copy (nothing is sent), so visitors see the same kind of life.
// Pets are drawn in the outermost `pP` around the player (behind you when above you, in front when below) through the game's
// own drawers with a state object {x,y,mv,t,fl}: 111a's Dev Suite looks (`SQPETLOOK`), 093's rare/side pets (`SQDRAWNPET`), 085's
// shop pets (`LUX.drawPetS`), the Imp (`LUX.impDrawS`). HIT on a pet (by where it is now) pets it; the owner's second HIT
// within 3 s picks it up.
(()=>{const isPet=t=>typeof t==='string'&&t.startsWith('pet_')&&EQ[t]&&EQ[t].slot==='pet';
 const TXT=' Tap PLACE in your bag while you\'re in your house, castle or backyard: it lives there, and visitors can meet it.';
 function addKeys(){for(const k in EQ)if(isPet(k)&&!BK.includes(k)){BK.push(k);if(typeof IDESC[k]==='string'&&IDESC[k].indexOf(TXT)<0)IDESC[k]+=TXT}}
 addKeys();if(window.SQA&&SQA.onApply)SQA.onApply(addKeys);
 const home=()=>SCENE&&SCENE.id==='home'&&SCENE.house&&SCENE.house.furn?SCENE.house:null;
 const mine=h=>!!h&&!h._foreign&&!h.ro&&!(h.base&&h.base._foreign);
 const hid=h=>(h&&(h._oid||h.id))||'?';
 const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
 // a pet's home spot doesn't block anyone (the pet walks away from it)
 {const _s=solid;solid=function(px,py){const h=home();if(h){const R=SCENE.room,i=Math.floor(py/16)*R.w+Math.floor(px/16),f=h.furn.get(i);
    if(f&&isPet(f.t)){const t=f.t;f.t='rug';try{return _s.apply(this,arguments)}finally{f.t=t}}}return _s.apply(this,arguments)}}
 // ---- drawing one pet from a state ----
 function drawAt(kind,s,tm){
  if(kind==='imp'){if(LUX.impDrawS)LUX.impDrawS(s.x,s.y,s.fl?'w':'e',s.mv?Math.floor(s.t)%4:0);else if(window.SQIMPDRAW)SQIMPDRAW(Math.round(s.x),Math.round(s.y));return}
  if(window.SQPETLOOK&&SQPETLOOK(kind,s))return;
  if(window.SQDRAWNPET&&((window.SQNPET&&SQNPET[kind])||(window.SQSIDEMAP&&SQSIDEMAP[kind]))){SQDRAWNPET(kind,s,tm);return}
  if(LUX.drawPetS)LUX.drawPetS(kind,s)}
 const px=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
 function heart(x,y,a){g.save();g.globalAlpha=Math.max(0,a);const K='#3a1018',C='#f04868';
  px(x-3,y-1,2,1,K);px(x+1,y-1,2,1,K);px(x-4,y,8,2,K);px(x-3,y+2,6,1,K);px(x-2,y+3,4,1,K);px(x-1,y+4,2,1,K);
  px(x-3,y,2,2,C);px(x+1,y,2,2,C);px(x-2,y+2,4,1,C);px(x-1,y+3,2,1,C);px(x-1,y+1,2,1,C);px(x-3,y,1,1,'#ffb0c0');g.restore()}
 function zee(x,y,n,a){g.save();g.globalAlpha=Math.max(0,a);const K='#1c2448',C='#d8e4ff';for(let i=0;i<n;i++)for(let j=0;j<n;j++)px(x+i-1,y+j-1,1,1,K);
  px(x-1,y-1,n+2,1,K);for(let i=0;i<n;i++)px(x+i,y,1,1,C);for(let i=0;i<n;i++)px(x+n-1-i,y+i,1,1,C);for(let i=0;i<n;i++)px(x+i,y+n-1,1,1,C);g.restore()}
 function note(x,y,a){g.save();g.globalAlpha=Math.max(0,a);px(x,y-4,1,5,'#3a2010');px(x-2,y,3,2,'#3a2010');px(x+1,y-4,2,1,'#3a2010');px(x-1,y,1,1,'#f8d048');g.restore()}
 // ---- the little lives ----
 const PS=new Map();let JOY=new Map(),last=0;
 const night=()=>{try{return dark()>.35}catch(e){return false}};
 function free(x,y){const R=SCENE.room;if(x<6||y<36||x>R.w*16-6||y>R.h*16-4)return false;try{return!solid(x,y+3)&&!solid(x-3,y+3)&&!solid(x+3,y+3)}catch(e){return false}}
 function clearLine(a,b,x,y){const d=Math.hypot(x-a,y-b),n=Math.ceil(d/4);for(let i=1;i<=n;i++)if(!free(a+(x-a)*i/n,b+(y-b)*i/n))return false;return true}
 function spotNear(s,r){for(let k=0;k<14;k++){const a=rnd(0,6.283),d=rnd(10,r),x=s.hx+Math.cos(a)*d*1.3,y=s.hy+Math.sin(a)*d*.8;if(free(x,y)&&clearLine(s.x,s.y,x,y))return[x,y]}return null}
 function setMode(s,m,dur){s.mode=m;s.until=performance.now()+dur*1000;s.spd=0}
 function choose(s,list,now){
  if(s.next){const n=s.next;s.next=null;if(list.includes(n.tgt)&&n.tgt.mode!=='nap'){setMode(s,'chase',rnd(2.5,4));s.tgt=n.tgt;s.rounds=n.rounds;setMode(n.tgt,'flee',rnd(2.5,4));n.tgt.tgt=s;n.tgt.until=s.until;return}}
  s.rounds=0;
  const pl=Math.hypot(P.x-s.x,P.y-s.y),R=SCENE.room;
  // someone walked up: come and say hello
  if(!dead&&pl<64&&pl>14&&now>s.greetCd){s.greetCd=now+rnd(14,26)*1000;setMode(s,'greet',6);return}
  // napping is more likely at night
  if(Math.random()<(night()?.38:.1)){setMode(s,'nap',rnd(7,16));return}
  // another pet close by? play chase
  const o=list.filter(q=>q!==s&&q.mode!=='nap'&&Math.hypot(q.x-s.x,q.y-s.y)<110);
  if(o.length&&Math.random()<.3){const q=pick(o);setMode(s,'chase',rnd(3,5.5));s.tgt=q;s.rounds=0;setMode(q,'flee',rnd(3,5.5));q.tgt=s;q.until=s.until;return}
  if(Math.random()<.08){setMode(s,'zoom',rnd(2.2,3.5));s.ang=rnd(0,6.283);s.dirz=Math.random()<.5?-1:1;return}
  if(Math.random()<.42){const p=spotNear(s,5*16);if(p){setMode(s,'walk',9);s.tx=p[0];s.ty=p[1];s.spd=rnd(18,28);return}}
  setMode(s,'idle',rnd(1.2,3.5));if(Math.random()<.5)s.fl=!s.fl;if(Math.random()<.25)s.hopAt=now}
 function stepTo(s,tx,ty,spd,dt){const dx=tx-s.x,dy=ty-s.y,d=Math.hypot(dx,dy);if(d<1.5){s.mv=0;return true}
  const m=Math.min(d,spd*dt),nx=s.x+dx/d*m,ny=s.y+dy/d*m;
  if(free(nx,ny)){s.x=nx;s.y=ny}else if(free(nx,s.y))s.x=nx;else if(free(s.x,ny))s.y=ny;else{s.mv=0;return true}
  s.mv=1;s.t+=dt*spd/9;if(Math.abs(dx)>.5)s.fl=dx<0;return false}
 function tick(s,list,dt,now){
  if(s.mode==='nap'){s.mv=0;const pl=Math.hypot(P.x-s.x,P.y-s.y);if(pl<18&&!s.woke){s.woke=1;s.until=Math.min(s.until,now+600)}if(now>=s.until){s.woke=0;s.hopAt=now;choose(s,list,now)}return}
  if(now>=s.until&&s.mode!=='walk'){choose(s,list,now);return}
  if(s.mode==='idle'||s.mode==='petted'){s.mv=0;if(s.mode==='petted')s.fl=P.x<s.x;return}
  if(s.mode==='walk'){if(stepTo(s,s.tx,s.ty,s.spd,dt)||now>=s.until)choose(s,list,now);return}
  if(s.mode==='greet'||s.mode==='follow'){
   const pl=Math.hypot(P.x-s.x,P.y-s.y);if(pl>110||dead){choose(s,list,now);return}
   const side=s.x<P.x?-1:1,tx=P.x+side*14,ty=P.y+4;
   if(pl>16)stepTo(s,tx,ty,s.mode==='greet'?48:40,dt);else{s.mv=0;s.fl=P.x<s.x;if(s.mode==='greet'){s.mode='follow';s.until=now+rnd(5,9)*1000;JOY.set(s,now);s.hopAt=now}}
   return}
  if(s.mode==='chase'||s.mode==='flee'){const q=s.tgt;if(!q||!list.includes(q)||q.tgt!==s||(q.mode!=='chase'&&q.mode!=='flee')){choose(s,list,now);return}
   if(s.mode==='chase'){if(stepTo(s,q.x,q.y,52,dt)||Math.hypot(q.x-s.x,q.y-s.y)<9){s.hopAt=q.hopAt=now;const r=(s.rounds|0)+1;setMode(s,'idle',rnd(.7,1.3));setMode(q,'idle',rnd(.7,1.3));s.mv=q.mv=0;s.fl=q.x<s.x;q.fl=s.x<q.x;
     if(r<3&&Math.random()<.6){q.next={m:'chase',tgt:s,rounds:r}}}}
   else{const dx=s.x-q.x,dy=s.y-q.y,d=Math.hypot(dx,dy)||1;let tx=s.x+dx/d*24,ty=s.y+dy/d*24;
    if(Math.hypot(tx-s.hx,ty-s.hy)>5*16||!free(tx,ty)){const a=Math.atan2(dy,dx)+(s.dirz||1)*1.4;tx=s.x+Math.cos(a)*24;ty=s.y+Math.sin(a)*24}stepTo(s,tx,ty,46,dt)}
   return}
  if(s.mode==='zoom'){s.ang+=dt*3.6*s.dirz;const tx=s.hx+Math.cos(s.ang)*26,ty=s.hy+Math.sin(s.ang)*14;if(!free(tx,ty)){s.dirz*=-1;s.ang+=s.dirz*.6}stepTo(s,tx,ty,70,dt);return}
  choose(s,list,now)}
 // the pets of the home you're in, created/removed to match its furniture
 function petsHere(){const h=home();if(!h)return[];const R=SCENE.room,out=[],id=hid(h);
  for(const[i,f]of h.furn){if(!isPet(f.t))continue;const key=id+':'+i;let s=PS.get(key);const hx=(i%R.w)*16+8,hy=((i/R.w)|0)*16+8;
   if(!s||s.kind!==EQ[f.t].pet||s.R!==R){s={key,i,h,R,kind:EQ[f.t].pet,x:hx,y:hy,hx,hy,mode:'idle',until:performance.now()+rnd(300,2000),t:0,mv:0,fl:Math.random()<.5,greetCd:performance.now()+rnd(1500,4000)};PS.set(key,s)}
   s.h=h;s.hx=hx;s.hy=hy;out.push(s)}
  return out}
 function drawPet(s,tm,now){const hop=s.hopAt&&now-s.hopAt<700?Math.round(Math.abs(Math.sin((now-s.hopAt)/700*Math.PI*2))*4*(1-(now-s.hopAt)/700)):0;
  const st={x:s.x,y:s.y-hop,mv:s.mv,t:s.t,fl:s.fl};try{drawAt(s.kind,st,tm)}catch(e){}
  if(s.mode==='nap'){const p=(now/1400)%1;zee(s.x+5+p*4,s.y-14-p*10,3,1-p);const p2=((now/1400)+.5)%1;zee(s.x+3+p2*4,s.y-12-p2*10,2,(1-p2)*.8)}
  const j=JOY.get(s);if(j&&now-j<1500){const p=(now-j)/1500;heart(s.x,s.y-16-p*10,1-p*p)}else if(j)JOY.delete(s);
  if(s.mode==='zoom'||s.mode==='chase'){if(Math.floor(now/180)%2)px(s.x+(s.fl?6:-7),s.y+4,2,1,'rgba(240,240,220,.7)')}
  if(s.mode==='follow'&&s.mv===0&&Math.floor(now/2600)%3===0)note(s.x+6,s.y-14,.9)}
 {const _pP=pP;pP=function(tm){const h=home();if(!h)return _pP.apply(this,arguments);let list=[];const now=performance.now(),dt=Math.min(.1,Math.max(0,(now-(last||now))/1000));last=now;
   try{list=petsHere();if(!pnOpen&&!menuOpen)for(const s of list)tick(s,list,dt,now)}catch(e){console.warn(e)}
   const by=P.y+6;for(const s of list)if(s.y+6<=by)drawPet(s,tm,now);
   const out=_pP.apply(this,arguments);for(const s of list)if(s.y+6>by)drawPet(s,tm,now);return out}}
 // the old spot drawing: only the placement preview draws something (the pet itself is drawn with the player)
 {const _dp=drawPiece;drawPiece=function(t,x,y,f,ghost,tm){if(!isPet(t))return _dp.apply(this,arguments);if(!ghost)return;
   try{drawAt(EQ[t].pet,{x:x*16+8,y:y*16+8,mv:0,t:0,fl:false},tm)}catch(e){}}}
 // ---- HIT: pet it; the owner's second HIT picks it up ----
 let arm=null;
 function front(){const h=home();if(!h)return null;const[fx,fy]=[P.x+face[0]*12,P.y+face[1]*12];let best=null,bd=17;
  const a=arm&&performance.now()-arm.at<3000&&arm.h===h?PS.get(hid(h)+':'+arm.i):null;if(a&&Math.hypot(a.x-P.x,a.y-P.y)<30)return{h,i:a.i,f:h.furn.get(a.i),s:a};
  for(const s of petsHere()){const d=Math.hypot(s.x-fx,s.y-fy);if(d<bd){bd=d;best=s}}
  if(!best){const R=SCENE.room,[x,y]=frontTile(),i=y*R.w+x,f=h.furn.get(i);if(f&&isPet(f.t))best=PS.get(hid(h)+':'+i)||null}
  return best?{h,i:best.i,f:h.furn.get(best.i),s:best}:null}
 {const _a=attack;attack=function(){try{if(!dead&&!menuOpen&&!pnOpen&&!BUILD&&swing<=0){const o=front();if(o&&o.f){swing=.25;const name=EQ[o.f.t].n,now=performance.now(),s=o.s;
     if(mine(o.h)&&arm&&arm.i===o.i&&arm.h===o.h&&now-arm.at<3000){arm=null;PS.delete(hid(o.h)+':'+o.i);pickFurn(o.i);say('Your '+name.toLowerCase()+' hops back into your bag.');return}
     if(s){JOY.set(s,now);s.hopAt=now;s.mode='petted';s.until=now+3200;s.mv=0;s.fl=P.x<s.x;s.woke=0;s.next=null;s.greetCd=now+15000}try{sfx('talk')}catch(e){}
     if(mine(o.h)){arm={i:o.i,h:o.h,at:now};say('You pet your '+name.toLowerCase()+'. Hit it again to pick it up.')}else say('You pet the '+name.toLowerCase()+'. It looks very pleased.');
     return}}}catch(e){console.warn(e)}return _a.apply(this,arguments)}}
 window.SQHOMEPETS={isPet,armed:()=>arm&&performance.now()-arm.at<3000?arm:null,front,addKeys,PS,petsHere}})();
