// ---- 166. Monster attacks from the Dev Suite: projectile looks, attack rate, extra damage, status effects ----
// Monsters that shoot (SHOOT: type -> the game's projectile kind) put their shots in 021's PROJ. Each hostile shot is
// matched to the monster that just fired it (nearest within 26 px of where the shot starts) and tagged with its look key
// (n._shotAt is set too: 111d plays its attack frames). Rules live in mobs.<key>.pj = {rate, dmg, fx:{slow,burn,freeze,
// poison: [chance %, seconds]}} (Dev Suite > Monsters > How it works):
//   rate  attack rate in % (200 = twice as often): the monster's reload (tcd / gcd) is divided by it, once per volley
//   dmg   extra hearts when one of its shots hits you (after blocks and rolls: only when the shot really hurt you)
//   fx    a status effect with a chance: slow (half speed), burn (1 heart every 1.5 s), poison (1 heart every 3 s),
//         freeze (can't move). Timers in ST, run in the outermost upd.
// Looks: props j:<monster key without m:> (e.g. j:skel:dust), drawn by the outermost drawProj turned the way it flies
// (draw it facing right). Bandits and cacti (099's SQNMP) and Dev Suite bosses' fire rings (146's SQCBSH) push shots
// tagged with _n (the monster): tagged here too, hits reported through SQSHOTHIT(shot), looks drawn through SQSHOTDRAW(shot).
// cb bosses only shoot with the "ring" attack. SQMOBATK.capDraw(type) draws a type's own shot at (0,0) for 111d's capture.
(()=>{if(!window.SQA||!window.SQPROPS)return;const A=SQA,R={};
 const SHOOT={skel:'bone',bonelord:'bone',guard:'water',tidek:'water',bandit:'bullet',cacti:'needle',cb:'fire'};
 const num=(v,lo,hi,d)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v)):d};
 const FX=['slow','burn','freeze','poison'];
 A.onApply(lib=>{for(const k in R)delete R[k];const M=lib&&lib.mobs||{};for(const k in M){const j=M[k]&&M[k].pj;if(!j||typeof j!=='object')continue;
  const o={rate:num(j.rate,10,1000,100),dmg:num(j.dmg,0,10,0)|0,fx:{}};for(const f of FX){const e=j.fx&&j.fx[f];if(Array.isArray(e)){const c=num(e[0],0,100,0),t=num(e[1],.5,30,3);if(c>0)o.fx[f]=[c,t]}}R[k]=o}});
 const mk=n=>SQPROPS.mkey(n);
 // ---- tagging shots ----
 let FRAME=0,SEEN=[];const _push=PROJ.push;// SEEN: the monsters at the start of this frame (some code sets en aside while the frame runs)
 PROJ.push=function(...ps){for(const p of ps)try{if(p&&p.hostile&&!p._mk){let best=null,bd=26;for(const n of en.length?en.concat(SEEN):SEEN){if(!n||n.dead)continue;const d=Math.hypot(n.x-p.x,n.y-8-p.y);if(d<bd){bd=d;best=n}}
    if(best){const k=mk(best);p._mk=k;p._jk='j:'+k.slice(2);best._shotAt=performance.now();const r=R[k];
     if(r&&r.rate!==100&&best._rateF!==FRAME){best._rateF=FRAME;for(const f of['tcd','gcd'])if(best[f]>0)best[f]=best[f]*100/r.rate}}}}catch(e){}
  return _push.apply(this,ps)};
 // ---- the other shot lists: bandits / cacti (099) and Dev Suite bosses (146) ----
 const tagN=(p)=>{const n=p&&p._n;if(!n||p._mk)return;const k=mk(n);p._mk=k;p._jk='j:'+k.slice(2);n._shotAt=performance.now();const r=R[k];
  if(r&&r.rate!==100&&n._rateF!==FRAME){n._rateF=FRAME;for(const f of['cd','cbt','tcd','gcd'])if(n[f]>0)n[f]=n[f]*100/r.rate}};
 for(const L of[window.SQNMP,window.SQCBSH]){if(!L)continue;const _p=L.push;L.push=function(...ps){for(const p of ps)try{tagN(p)}catch(e){}return _p.apply(this,ps)}}
 window.SQSHOTHIT=p=>{try{const r=p&&p._mk&&R[p._mk];if(r&&!dead)apply(r)}catch(e){}};
 window.SQSHOTDRAW=p=>{if(!p||!p._jk||!SQPROPS.looks||!SQPROPS.looks[p._jk])return false;const a=Math.atan2(p.vy||0,p.vx||1);g.save();g.translate(Math.round(p.x),Math.round(p.y));g.rotate(Math.round(a/(Math.PI/8))*(Math.PI/8));try{SQPROPS.drawLook(p._jk,0,0,null,0,false)}catch(e){}g.restore();return true};
 const capDraw=t=>{const k=SHOOT[t];if(k==='bullet'){Rg(-2,-2,4,4,'#181018');Rg(-1,-1,2,2,'#f8e070');return}if(k==='needle'){for(let i=0;i<5;i++)Rg(-i,0,1,1,i?'#e8e0b0':'#ffffff');return}
  if(k==='fire'){g.fillStyle='rgba(255,140,40,.35)';g.beginPath();g.arc(0,0,5,0,6.283);g.fill();Rg(-2,-2,4,4,'#181018');Rg(-1,-1,2,2,'#ffd060');return}
  drawProj({x:0,y:0,vx:1,vy:0,t:0,k,sc:curScene()})};
 // ---- drawing a shot with its look ----
 {const _dp=drawProj;drawProj=function(p){if(p&&p._jk&&SQPROPS.looks){const L=SQPROPS.looks[p._jk];if(L){const a=Math.atan2(p.vy||0,p.vx||1);g.save();g.translate(Math.round(p.x),Math.round(p.y));g.rotate(Math.round(a/(Math.PI/8))*(Math.PI/8));try{SQPROPS.drawLook(p._jk,0,0,null,0,false)}catch(e){}g.restore();return}}return _dp.apply(this,arguments)}}
 // ---- hits and status effects ----
 const ST={slow:0,burn:0,freeze:0,poison:0,bt:0,pt:0};const NAMES={slow:'slowed',burn:'burning',freeze:'frozen',poison:'poisoned'};
 const COL={slow:'#80b0ff',burn:'#ff7a28',freeze:'#c8f0ff',poison:'#78d048'};
 function apply(r){if(r.dmg>0&&!dead)P.hp-=r.dmg;const got=[];for(const f in r.fx){const[c,t]=r.fx[f];if(Math.random()*100<c){ST[f]=Math.max(ST[f],t);got.push(NAMES[f])}}
  if(got.length){say('You are '+got.join(' and ')+'!');try{sfx('hurt')}catch(e){}}}
 {const _u=upd;upd=function(dt){FRAME++;SEEN=en.slice();const live=[],x0=P.x,y0=P.y,hp0=P.hp,h0=hurt;
   if(Object.keys(R).length)for(const p of PROJ)if(p&&!p.dead&&p.hostile&&p._mk&&R[p._mk])live.push(p);
   const out=_u.apply(this,arguments);
   try{if(!dead&&live.length&&(P.hp<hp0||hurt>h0))for(const p of live)if((p.dead||p.life<0||!PROJ.includes(p))&&Math.hypot(P.x-p.x,P.y-2-p.y)<16){apply(R[p._mk]);break}
    if(dead){for(const f of FX)ST[f]=0}else if(!menuOpen&&!pnOpen){
     if(ST.freeze>0){P.x=x0;P.y=y0}else if(ST.slow>0){P.x=x0+(P.x-x0)*.5;P.y=y0+(P.y-y0)*.5}
     if(ST.burn>0&&(ST.bt-=dt)<=0){ST.bt=1.5;P.hp-=1;FLASH=.2}if(ST.poison>0&&(ST.pt-=dt)<=0){ST.pt=3;P.hp-=1;FLASH=.15}
     for(const f of FX)if(ST[f]>0){ST[f]=Math.max(0,ST[f]-dt);if(Math.random()<dt*8&&typeof part==='function')part(P.x+(Math.random()-.5)*10,P.y-8-Math.random()*10,(Math.random()-.5)*16,-24,.5,COL[f],f==='freeze'?0:-40,1)}
     if(ST.burn<=0)ST.bt=0;if(ST.poison<=0)ST.pt=0}}catch(e){console.warn('monster attacks',e)}
   return out}}
 window.SQMOBATK={SHOOT,FX,capDraw,get rules(){return R},status:ST,shoots:k=>!!SHOOT[String(k||'').replace(/^[mj]:/,'').split(':')[0]],clear(){for(const f of FX)ST[f]=0}};
 try{SQPROPS.recat()}catch(e){}})();
