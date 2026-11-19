// ---- 213. Bug sweep (Nov 15) ----
(()=>{
 // Beds at home: the first tap sets you to wake up there and arms 013's bedPick (3 s); a second HIT picks the bed up, but a second
 // TALK/USE slept again and re-armed it, so on touch screens (both buttons said SLEEP) the bed could never be picked up.
 {const _uf=useFurn;useFurn=function(it){try{if(it&&it.f&&it.f.t==='bed'&&typeof bedPick!=='undefined'&&bedPick&&bedPick.home&&bedPick.i===it.i&&performance.now()-bedPick.at<3000&&typeof inHome==='function'&&inHome()){bedPick=null;pickFurn(it.i);return}}catch(e){}return _uf.apply(this,arguments)}}
 // Rain waters backyard/courtyard crops too (021 only watered Hollow's FARM plots). Same rule: watered for at least 90 more seconds.
 {let acc=0;const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{if((acc+=dt||0)>1){acc=0;if(typeof rainingNow==='function'&&rainingNow()){
   const homes=(typeof HOUSES!=='undefined'?HOUSES:[]).concat(window.SQRH||[]);for(const h of homes){if(!h||h._foreign||!h.yp)continue;for(const p of h.yp.values())if(p&&p.c)p.w=Math.max(+p.w||0,CLK+90)}}}}catch(e){}return out}}
 // Jewelry at the furnace uses the house's chests like smelting does (033 merges chests only around its own clicks; 086's Make/All
 // run outside that and as a timed job). Before Make/All, exactly the gold bars and gems needed are moved from the chests to the bag.
 {const _oc=pbd.onclick;pbd.onclick=function(e){try{const b=e.target.closest&&e.target.closest('[data-jw]');const a=b&&b.dataset.jw;
   if((a==='make'||a==='all')&&ptab===2&&typeof STATION!=='undefined'&&STATION&&STATION.t==='furnace'&&window.SQJK&&typeof benchChests==='function'&&!(typeof BMERGE!=='undefined'&&BMERGE)){
    const j=SQJK[b.dataset.k],ch=benchChests(STATION);if(j&&ch.length){const tot=k=>(inv[k]|0)+ch.reduce((s,c)=>s+(c[k]|0),0);
     const n=a==='all'?Math.min(Math.floor(tot('gbar')/j.b),j.g?tot(j.g):1e9):1;
     const need=[['gbar',j.b*n]];if(j.g)need.push([j.g,n]);
     if(n>0)for(const[k,q]of need){let miss=q-(inv[k]|0);for(const c of ch){if(miss<=0)break;const t=Math.min(miss,c[k]|0);if(t>0){c[k]-=t;if(!(c[k]>0))delete c[k];inv[k]=(inv[k]|0)+t;miss-=t}}}}}}catch(err){}
  return _oc.apply(this,arguments)}}
 // Timed jobs (109's sqDo): each step runs the real action, and actions like eat() do nothing while a panel or the START menu is
 // open, so opening Skills or the bag mid-job ended it (Kass). Steps now run as if no panel were open (the panel stays on screen).
 // Cooking at a campfire stops when the fire is gone instead of eating the food raw (Mishatu); a stove job (SQDO.st) is unaffected.
 {const _sd=sqDo;sqDo=function(kind,n,fn){if(typeof fn!=='function')return _sd.apply(this,arguments);
   const wrapped=function(){const D=typeof SQDO!=='undefined'?SQDO:null;
    if(kind==='cook'&&!(D&&D.st)){let lit=false;try{lit=nearFire(P.x,P.y,45)}catch(e){lit=true}
     if(!lit){if(D&&SQDO===D)SQDO=null;say('The fire went out'+(D&&D.done?' after '+D.done+' cooked':'')+'.');try{sfx('swish')}catch(e){}return}}
    const a=pnOpen,m=menuOpen;pnOpen=false;menuOpen=false;try{return fn.apply(this,arguments)}finally{pnOpen=a;menuOpen=m}};
   return _sd.call(this,kind,n,wrapped)}}
 // Pressing EAT/COOK again while already cooking used to start a new job with the first recipe in the list (Aztu): now it's ignored.
 // While cooking, EAT eats something instead (the cooking carries on): players had to walk away from the fire to eat (Nov 15).
 {SQEAT.wrap('205 already cooking: eat instead',_e=>function(){try{if(!window.SQDO_STEP&&typeof SQDO!=='undefined'&&SQDO&&SQDO.kind==='cook'&&!dead){if(window.SQEATPICK)SQEATPICK.eat();else say('Already cooking.');return}}catch(e){}return _e.apply(this,arguments)})}
 // Saltmere's two moored boats sit at fixed spots (020's BOATS); since the coast moved they were drawn on the grass north of town.
 // Only boats on water are drawn now (Tidewatch already placed its own on water).
 try{if(typeof BOATS!=='undefined'&&Array.isArray(BOATS))for(let k=BOATS.length-1;k>=0;k--){const[x,y]=BOATS[k];if(tile[y*N+x]!==0)BOATS.splice(k,1)}}catch(e){}
 // Island gatherables nobody can reach (berry bushes on a strip of land cut off by water on Briarwood, rocks/ores walled in by plateau
 // edges): after an island loads, flood-fill from where you stand with the game's own collision (a player-sized box at each tile)
 // and remove every object no reachable tile touches. Done once per loaded island, the same way on everyone's game. Skipped when
 // the fill reaches under half the land (e.g. you loaded in somewhere odd) so nothing is removed by mistake.
 const REACH=window.SQREACHFIX={removed:0,last:null};
 function pruneUnreachable(R){if(!R||!R.region||R._rch||!R.tiles||!R.items)return;R._rch=1;const W=R.w,H=R.h;
  const ok=(x,y)=>{const cx=x*16+8,cy=y*16+8;return!(solid(cx-5,cy-3)||solid(cx+5,cy-3)||solid(cx-5,cy+6)||solid(cx+5,cy+6))};
  const sx=Math.floor(P.x/16),sy=Math.floor(P.y/16);if(sx<0||sy<0||sx>=W||sy>=H)return;const seen=new Uint8Array(W*H),q=[sy*W+sx];seen[q[0]]=1;
  for(let k=0;k<q.length;k++){const j=q[k],x=j%W,y=(j/W)|0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b;if(nx<0||ny<0||nx>=W||ny>=H)continue;const n=ny*W+nx;if(seen[n]||R.tiles[n]===0||!ok(nx,ny))continue;seen[n]=1;q.push(n)}}
  let land=0;for(let i=0;i<W*H;i++)if(R.tiles[i]!==0)land++;if(q.length<land*.5){REACH.last={region:R.region,skipped:q.length+'/'+land};return}
  let n=0;for(let j=R.items.length-1;j>=0;j--){const it=R.items[j];if(it.t!=='_obj'||!it.o||it._gn)continue;const x=it.x,y=it.y;
   let near=false;for(let b=-1;b<=1&&!near;b++)for(let a=-1;a<=1;a++){const nx=x+a,ny=y+b;if(nx>=0&&ny>=0&&nx<W&&ny<H&&seen[ny*W+nx]){near=true;break}}
   if(near)continue;try{rgCellDel(R,it)}catch(e){}R.solid.delete(y*W+x);R.items.splice(j,1);n++}
  REACH.removed+=n;REACH.last={region:R.region,removed:n,reached:q.length,land}}
 {const _lr=loadRegion;loadRegion=function(){const out=_lr.apply(this,arguments);try{const R=SCENE&&SCENE.room;if(R&&R.region&&!/^gi_/.test(R.region))pruneUnreachable(R)}catch(e){console.warn(e)}return out}}
 // The CHAT/ONLINE and BUG buttons (061's #mpb/#mpbug, z-index 30) sat on top of open panels (z 20), covering the map on phones.
 // They're hidden while a panel or the START menu is open.
 {const st=document.createElement('style');st.textContent='body.sqpnup #mpb,body.sqpnup #mpbug{visibility:hidden!important}';document.head.appendChild(st);
  let was=null;setInterval(()=>{try{const up=!!(pnOpen||menuOpen);if(up!==was){was=up;document.body.classList.toggle('sqpnup',up)}}catch(e){}},120)}
 // HIT on touch/controller can still shoot at a monster in range (140 only stops that for keyboard/mouse), so facing a tree with a
 // monster nearby shot an arrow instead of chopping (Kass). When HIT's own word says it would gather (chop, mine, pick...), it never shoots.
 {const GATHER=/^(CHOP|MINE|PICK|FORAGE|HARVEST|SMASH|CUT|DIG)/;SQHIT.wrap('205 bug sweep nov15',_a=>function(){let w='';try{w=window.SQWORDS?String(SQWORDS.hitWord()||''):''}catch(e){}
   if(!GATHER.test(w)||typeof bowTarget!=='function')return _a.apply(this,arguments);const bt=bowTarget;bowTarget=()=>null;try{return _a.apply(this,arguments)}finally{bowTarget=bt}})}
})();
