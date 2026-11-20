// ---- 249. Harder guild bosses: real raid mechanics (window.SQGBMECH) ----
// The Void Treant was a walk-over (Nov 20). Both guild bosses now have three times the health, attack more often, enrage again at a
// quarter health, and have mechanics that make a guild work together (ideas from #ideas, approved):
//   Void Treant: the shockwave knocks you back and can't be rolled through ('push' ring); it burrows and bursts up somewhere else
//     (act 'burrow', can't be hurt underground); void poison washes over the whole arena ('poison' ring, can't be dodged: lose half
//     a heart every 1.5 s for 9 s); "drink" phase (`b.mir` seconds): hits HEAL it, so stop attacking; void saplings ('seek' hazards)
//     lock on to one fighter each, can't be hurt, walk slowly after them and hit for 3 hearts; they switch targets every 8 s, so a
//     guild has to call out who's being chased.
//   Giant Turtle: tidal waves knock you back ('push' ring); whirlpools pull you in and crush whoever is in the middle (hz 'pull');
//     it hides in its shell and spins around the arena (act 'shell': can't be hurt, tramples for 2 hearts).
// Engine hooks added to 100 for these (all guild-boss only): SQIBFIRE[kind](b,o,T) new attacks (`.now` = no wind-up), SQIBACT[k](b,A,dt)
// new actions (owner), SQIBHZ(b,h,dt,owner) new hazards (owner and other fighters), SQIBHZDRAW(b,h,tm), SQIBRING.un/hit (rings that
// can't be rolled through). `b.mir` and `b.inv` travel with the shared boss (SQMOBX/SQMOBRX), hazards and actions already did.
// Damage board: every fighter counts the damage they deal (the boss's health drop during their own frame) and writes it when the
// boss falls: `guilds/<g>/bd/<boss|turt>/<uid>` {n,d,w,t}; the Bosses tab shows this week's top 5 (rules: guilds.$g.bd).
(()=>{const GB=()=>window.SQGBOSS;if(!GB()||!GB().K)return;
 const isG=id=>/^g[tu]_/.test(String(id||'')),kindOf=id=>{try{return GB().kindOf(id)}catch(e){return null}};
 const myId=()=>{const M=window.SQMP;return M&&M.on&&M.user?M.user.uid:'me'};
 const others=id=>{const M=window.SQMP,out=[];if(M&&M.on&&M.players)for(const[u,r]of M.players)if(r.loc==='in:ib_'+id&&performance.now()-r.seen<20000)out.push(u);return out};
 const posOf=u=>{if(u==='me'||u===myId())return{x:P.x,y:P.y};const r=window.SQMP&&SQMP.players&&SQMP.players.get(u);return r?{x:r.x,y:r.y}:null};
 const hit=(d,msg)=>{if(dead)return false;return hurtP(d,msg)};
 const free=(x,y)=>{try{return!solid(x,y)}catch(e){return false}};
 // where a shove or a whirlpool may move YOU: never onto the bottom rows, where the arena's way out is (Nov 20: a shockwave threw
 // the tester out of the fight)
 const pfree=(x,y)=>{const R=SCENE&&SCENE.room;if(R&&y>R.h*16-28&&y>P.y)return false;return free(x,y)};
 let IDN=5e8;const R4=(a,b,w,h,c)=>Rg(Math.round(a),Math.round(b),w,h,c);// hazard ids of our own, far from 100's counter
 // ---- the bosses themselves ----
 const T=GB().K.treant,U=GB().K.turtle;
 if(T){Object.assign(T.DEF,{hp:18000,
   atk:[['circles',3.0,{n:7,r:22,delay:1.0,k:'void'}],['fan',2.3,{n:6,spread:.28,sp:105,k:'void'}],['spiral',4.2,{n:16,sp:78,k:'void'}],['ring',6.0,{max:130,k:'push'}],
    ['burrow',11,{}],['seek',9,{cap:2,life:14}],['poison',16,{}],['mirror',21,{d:5}],['summon',13,{key:'wolf:void',n:2,cap:4}]]})}
 if(U){Object.assign(U.DEF,{hp:21000,
   atk:[['fan',2.2,{n:6,spread:.28,sp:100,k:'bubble'}],['circles',3.4,{n:7,r:22,delay:1.0,k:'water'}],['charge',5.0,{}],['ring',6.5,{max:150,k:'push'}],
    ['pull',9,{r:72,d:4}],['shell',14,{d:3.2}],['summon',11,{key:'crab',n:3,cap:5}]]})}
 // ---- new attacks (owner side) ----
 const F=window.SQIBFIRE=window.SQIBFIRE||{};
 // 100's own ring attack has no kind: the guild bosses' rings get the kind from their attack list
 {SQUPD.wrap('241 ring kinds',next=>function(dt){const b=boss();if(b&&!b._rp&&b.hz)for(const h of b.hz)if(h.k==='ring'&&!h.kind&&!h._k){h._k=1;const a=(IB()[b.ib]||{}).atk||[];const r=a.find(x=>x[0]==='ring');if(r&&r[2].k)h.kind=r[2].k}return next.apply(this,arguments)})}
 F.burrow=function(b){b.act={id:++IDN,k:'burrow',t:0,d:1.6,done:0};b.inv=1;say((IB()[b.ib]||{}).n+' sinks into the ground!');msgT=2};F.burrow.now=1;
 F.seek=function(b,o){const alive=b.hz.filter(h=>h.k==='seek'&&!h.done).length;if(alive>=(o.cap||2))return;const L=[myId(),...others(b.ib)];b._sk=(b._sk|0)+1;const u=L[b._sk%L.length];
  b.hz.push({id:++IDN,k:'seek',x:b.x+(Math.random()-.5)*30,y:b.y+14,r:10,t:0,d:o.life||14,kind:u,swap:8});say('A void sapling crawls out of the roots!');msgT=2};
 F.poison=function(b){b.hz.push({id:++IDN,k:'ring',x:b.x,y:b.y,r:10,max:300,hit:false,t:0,kind:'poison'});say('Void poison washes over the arena!');msgT=2};
 F.mirror=function(b,o){b.mir=o.d||5;say((IB()[b.ib]||{}).n+' drinks in every blow! Stop attacking!');msgT=3};
 F.pull=function(b,o,Tg){const q=Math.random()*6.283,x=Tg.x+Math.cos(q)*24,y=Tg.y+Math.sin(q)*18;b.hz.push({id:++IDN,k:'pull',x,y,r:o.r||70,t:0,d:o.d||4,kind:''});say('A whirlpool opens!');msgT=2};
 F.shell=function(b,o){const q=Math.random()*6.283;b.act={id:++IDN,k:'shell',t:0,d:o.d||3,ax:Math.cos(q),ay:Math.sin(q),done:0};b.inv=1;say((IB()[b.ib]||{}).n+' hides in its shell and spins!');msgT=2};F.shell.now=1;
 // ---- new actions (owner side) ----
 const A=window.SQIBACT=window.SQIBACT||{};
 A.burrow=function(b,a){if(a.t>.7&&!a.mv){a.mv=1;const Tg=posOf(myId())||{x:P.x,y:P.y},R=SCENE&&SCENE.room;for(let i=0;i<40;i++){const x=(4+Math.random()*(AW-8))*16+8,y=(4+Math.random()*(AH-10))*16+8;
    const dd=Math.hypot(x-Tg.x,y-Tg.y);if(free(x,y)&&free(x,y+6)&&dd>90&&dd<200){b.x=x;b.y=y;break}}}
  if(a.t>1.2&&!a.up){a.up=1;b.inv=0;b.hz.push({id:++IDN,k:'ring',x:b.x,y:b.y,r:8,max:90,hit:false,t:0,kind:'push'});try{sfx('mine')}catch(e){self.SQERR&&SQERR(e,'241-1')}}
  if(a.t>=a.d){b.inv=0;b.act=null}};
 A.shell=function(b,a,dt){const sp=150*dt,nx=b.x+a.ax*sp,ny=b.y+a.ay*sp;if(free(nx,ny+6)&&free(nx,ny-6))b.x=nx,b.y=ny;else{// bounce off the walls
   if(!free(nx,b.y+6))a.ax=-a.ax;if(!free(b.x,ny+6)||!free(b.x,ny-6))a.ay=-a.ay}
  if(a.t>=a.d){b.inv=0;b.act=null}};
 // ---- hazards (everyone in the fight) ----
 const DONE=new Set();
 window.SQIBHZ=function(b,h,dt,owner){
  if(h.k==='seek'){if(owner){const L=[myId(),...others(b.ib)];h.swap-=dt;if(h.swap<=0&&L.length>1){h.swap=8;const i=L.indexOf(h.kind);h.kind=L[(i+1)%L.length]}
    const p=posOf(h.kind);if(!p){h.kind=myId();return}const dx=p.x-h.x,dy=p.y-h.y,d=Math.hypot(dx,dy)||1,sp=40*dt;const nx=h.x+dx/d*sp,ny=h.y+dy/d*sp;if(free(nx,ny))h.x=nx,h.y=ny;else if(free(nx,h.y))h.x=nx;else if(free(h.x,ny))h.y=ny}
   if(h.kind===myId()&&!h.done&&!DONE.has('s'+h.id)&&Math.hypot(P.x-h.x,P.y-h.y)<10){DONE.add('s'+h.id);h.done=1;hit(3,'A void sapling catches you!')}}
  else if(h.k==='pull'){const dd=Math.hypot(P.x-h.x,(P.y-h.y)*1.3);if(dd<h.r&&!dead&&h.t<h.d){const k=Math.min(1,(1-dd/h.r)*1.4)*46*dt,dx=h.x-P.x,dy=h.y-P.y,d=Math.hypot(dx,dy)||1;
     const nx=P.x+dx/d*k,ny=P.y+dy/d*k;if(pfree(nx,ny))P.x=nx,P.y=ny}
   if(h.t>=h.d&&!h.done){h.done=1;if(!DONE.has('w'+h.id)&&Math.hypot(P.x-h.x,(P.y-h.y)*1.3)<20){DONE.add('w'+h.id);hit(2,'The whirlpool crushes you!')}}}};
 window.SQIBRING={un:h=>h.kind==='push'||h.kind==='poison',hit(b,h){
  if(h.kind==='poison'){poison(9);return}
  hit(1,'The shockwave throws you back!');const dx=P.x-h.x,dy=P.y-h.y,d=Math.hypot(dx,dy)||1;KB={x:dx/d,y:dy/d,t:.25}}};
 let KB=null;
 // ---- void poison ----
 const POI={t:0,k:0};function poison(s){POI.t=Math.max(POI.t,s);POI.k=Math.min(POI.k||1.5,1.5);say('Void poison! You lose health for a while.');msgT=3}
 {SQUPD.after('241 poison and knockback',dt=>{if(menuOpen||pnOpen)return;
   if(KB){const sp=200*dt,nx=P.x+KB.x*sp,ny=P.y+KB.y*sp;if(pfree(nx,ny))P.x=nx,P.y=ny;KB.t-=dt;if(KB.t<=0)KB=null}
   if(POI.t>0){if(dead){POI.t=0;return}POI.t-=dt;POI.k-=dt;if(POI.k<=0){POI.k=1.5;hit(.5,'The void poison burns!')}}})}
 // ---- drawing ----
 window.SQIBHZDRAW=function(b,h,tm){
  if(h.k==='seek'&&!h.done){const x=Math.round(h.x),y=Math.round(h.y),me=h.kind===myId(),bob=Math.floor(tm*6+h.id)%2;
   if(me){g.strokeStyle='rgba(255,60,60,'+(.5+.4*Math.sin(tm*12))+')';g.lineWidth=1.5;g.beginPath();g.ellipse(P.x,P.y+6,12,6,0,0,6.283);g.stroke()}
   R4(x-1,y-8+bob,3,9,'#2a1c30');R4(x-5,y-15+bob,11,8,'#120a18');R4(x-4,y-14+bob,9,6,me?'#c050ff':'#8a50d0');R4(x-2,y-12+bob,1,1,me?'#ff4040':'#fff');R4(x+1,y-12+bob,1,1,me?'#ff4040':'#fff');
   R4(x-3,y+1,2,1,'#2a1c30');R4(x+2,y+1,2,1,'#2a1c30')}
  else if(h.k==='pull'){const p=Math.min(1,h.t/h.d);for(let i=0;i<3;i++){g.strokeStyle='rgba(120,200,255,'+(.25+.2*i)+')';g.lineWidth=1.5;g.beginPath();
    g.ellipse(h.x,h.y,h.r*(1-i*.3)*(1-.15*Math.sin(tm*8+i)),h.r*.7*(1-i*.3),tm*2+i,0,5);g.stroke()}g.fillStyle='rgba(30,90,160,'+(.15+.3*p)+')';g.beginPath();g.ellipse(h.x,h.y,20,14,0,0,6.283);g.fill()}};
 // underground: just a moving mound; drinking: a pulsing green halo; shell: the shell spins
 {const _art=window.SQIBART;window.SQIBART=function(id,b,tm){if(isG(id)&&b){const a=b.act;
   if(a&&a.k==='burrow'&&a.t>.45&&a.t<1.25){const x=Math.round(b.x),y=Math.round(b.y);g.fillStyle='rgba(20,10,30,.6)';g.beginPath();g.ellipse(x,y+4,18,7,0,0,6.283);g.fill();
    for(let i=0;i<4;i++)R4(x-12+i*7+Math.round(Math.sin(tm*20+i)*2),y-1,4,3,'#3a2a46');return true}
   if((b.mir||0)>0){g.fillStyle='rgba(90,255,120,'+(.18+.12*Math.sin(tm*10))+')';g.beginPath();g.ellipse(b.x,b.y-20,42,46,0,0,6.283);g.fill()}}
  return _art?_art.apply(this,arguments):false}}
 // ---- the fight, every frame: drinking/underground/shell protect it, second enrage, other fighters' contact with the shell ----
 const IB=()=>window.SQIB||{};
 // (035 hides dungeon-room monsters more than 230 px away; a guild boss stays in the fight however far it burrows or you're thrown)
 const boss=()=>{for(const n of en)if(n&&n.type==='ib'&&isG(n.ib)&&!n.dead)return n;const R=SCENE&&SCENE.room;if(R&&R.mobs&&isG(R.ib))for(const n of R.mobs)if(n&&n.type==='ib'&&!n.dead&&!n._rp){en.push(n);return n}return null};
 let last=null,mine=0,fightId='',told=0,mirSeen=0,shellHitAt=0;
 {SQUPD.wrap('241 guild boss fight',next=>function(dt){const b=boss();let pre=null;
   if(b){const fid=b.ib+':'+(b._mid||'')+':'+(b._rp?'p':'o');if(fid!==fightId){fightId=fid;mine=0;told=0;last=null}
    if(!b._rp){// owner: blows that landed between frames (other fighters' hits) while it can't be hurt / is drinking
     if(last!=null&&b.hp<last&&(b.inv||(b.mir||0)>0)){const dmg=last-b.hp;b.hp=Math.min(b.mhp,b.inv?last:last+dmg);if(b.dead&&b.hp>0)b.dead=0}
     if((b.mir||0)>0)b.mir=Math.max(0,b.mir-dt);
     if(b.hp<b.mhp*.25&&!b._q){b._q=1;say((IB()[b.ib]||{}).n+' is furious!');msgT=3}if(b._q&&b.cds)for(let i=0;i<b.cds.length;i++)b.cds[i]-=dt*.4}
    else{if((b.mir||0)>0&&!mirSeen){say((IB()[b.ib]||{}).n+' drinks in every blow! Stop attacking!');msgT=3}mirSeen=(b.mir||0)>0?1:0;
     const a=b.act;if(a&&a.k==='shell'&&a.t<a.d&&Math.hypot(P.x-b.x,P.y-b.y)<22&&performance.now()-shellHitAt>900){shellHitAt=performance.now();hit(2,'The spinning shell slams into you!')}}
    pre=b.hp}
   const out=next.apply(this,arguments);
   if(b&&pre!=null){if(b.hp<pre){const dmg=pre-b.hp;
     if(!b._rp&&(b.inv||(b.mir||0)>0)){b.hp=Math.min(b.mhp,b.inv?pre:pre+dmg);if(b.dead&&b.hp>0)b.dead=0}else mine+=dmg}
    if(!b._rp){const a=b.act;if(a&&a.k==='shell'&&Math.hypot(P.x-b.x,P.y-b.y)<22&&performance.now()-shellHitAt>900){shellHitAt=performance.now();hit(2,'The spinning shell slams into you!')}}
    last=b.hp;if((b.dead||b.hp<=0)&&!told){told=1;board(b)}else if(!b._rp&&!en.includes(b))en.push(b)}
   return out})}
 // ---- damage board ----
 const BD={};// path -> {at, list}
 function pathOf(id){const B=kindOf(id);return B?B.path:''}
 function board(b){const S=window.SQGUILD,a=S&&S.api,path=pathOf(b.ib);if(!a||!a.on()||!S.id||!path||mine<1)return;
  let n='';try{n=(typeof PNAME!=='undefined'&&PNAME)||'Adventurer'}catch(e){n='Adventurer'}
  a.DB().set(a.ref('guilds/'+S.id+'/bd/'+path+'/'+a.me()),{n:String(n).replace(/[<>]/g,'').slice(0,12),d:Math.min(1e7,Math.round(mine)),w:GB().WEEK(),t:a.TS()}).then(()=>{delete BD[path];say('You dealt '+Math.round(mine).toLocaleString()+' damage. See the guild\'s top 5 in START > Guild > Bosses.');msgT=4}).catch(e=>{self.SQERR&&SQERR(e,'241-2')})}
 function top(path){const S=window.SQGUILD,a=S&&S.api;if(!a||!a.on()||!S.id)return null;const c=BD[path];
  if(!c||Date.now()-c.at>30000){BD[path]={at:Date.now(),list:c?c.list:null};a.DB().get(a.ref('guilds/'+S.id+'/bd/'+path)).then(s=>{const v=s.val()||{},w=GB().WEEK();
    BD[path].list=Object.values(v).filter(x=>x&&x.w===w).sort((x,y)=>y.d-x.d).slice(0,5);try{a.redraw()}catch(e){self.SQERR&&SQERR(e,'241-3')}}).catch(e=>{self.SQERR&&SQERR(e,'241-4')})}
  return BD[path].list}
 {const _h=GB().html;GB().html=function(){let h=_h.apply(this,arguments);try{const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    for(const k of Object.keys(GB().K)){const B=GB().K[k],L=top(B.path);if(!L||!L.length)continue;
     h+='<div class="qc"><b>'+esc(B.DEF.n)+': top damage this week</b><p style="font-size:13px">'+L.map((x,i)=>(i+1)+'. '+esc(x.n)+' · '+(x.d|0).toLocaleString()).join('<br>')+'</p></div>'}}catch(e){self.SQERR&&SQERR(e,'241-5')}return h}}
 window.SQGBMECH={poison,POI,top,mine:()=>mine,board}})();
