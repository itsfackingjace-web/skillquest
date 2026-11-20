// ---- 250. Mines need Mining levels, and they're crawling with monsters (window.SQMINES) ----
// Mines (DKIND entries with `mine:1`: Ironcrest's Old Ironcrest Mine and Deepvein Mine, mines on custom islands and drawn dungeons)
// are full of gold, mithril and adamant veins. Since Nov 20 you need a Mining level to go in, and more to go deeper, and every floor
// has about twice the monsters, a little tougher, so the ore is worth the risk:
//   req(kind, floor) = base + step * floor((floor-1)/2)  (REQ below; any other mine: 15 + 10 per two floors)
// The entrance (useFurn 'icv' and window.icvEnter) and the stairs down (dGo to a deeper floor) refuse you with a message saying what
// you need; on the stairs you're nudged back off them so it isn't repeated every frame.
(()=>{const MI=2;// Mining's index in SKN (gear `req:{s:2}`)
 const REQ={icmine:{b:30,s:10},icmine2:{b:45,s:10}},GEN={b:15,s:10};
 const isMine=kind=>{try{return!!(DKIND[kind]&&DKIND[kind].mine)}catch(e){return false}};
 function req(kind,f){if(!isMine(kind))return 0;const R=REQ[kind]||GEN;return Math.min(99,R.b+R.s*Math.floor((Math.max(1,f|0)-1)/2))}
 const lv=()=>{try{return lvOf(MI)}catch(e){return 99}};
 let saidAt=0;
 function ok(kind,f){const need=req(kind,f);if(!need||lv()>=need||window.SQMINEFREE)return true;// SQMINEFREE: Dev Suite tests
 const now=performance.now();
  if(now-saidAt>2500){saidAt=now;const nm=(DKIND[kind]&&DKIND[kind].name)||'This mine';say((f>1?'Floor '+f+' of '+nm:nm)+' needs Mining '+need+'. (You have '+lv()+'.)');msgT=4;try{sfx('swish')}catch(e){self.SQERR&&SQERR(e,'242-1')}}return false}
 // the entrance on the island
 {SQUSEFURN.wrap('242 mine entrance',next=>function(it){if(it&&it.use==='icv'&&it.kind&&!ok(it.kind,1))return;return next.apply(this,arguments)})}
 if(typeof window.icvEnter==='function'){const _ie=window.icvEnter;window.icvEnter=function(it){if(it&&it.kind&&!ok(it.kind,1))return;return _ie.apply(this,arguments)}}
 // the stairs down
 {const _d=dGo;dGo=function(kind,f,from){const R=SCENE&&SCENE.room,cur=R&&R.dun&&R.dun.kind===kind?R.dun.f:0;
   if(f>cur&&!ok(kind,f)){if(from==='above'&&R)P.y=Math.min(P.y+14,R.h*16-24);return}return _d.apply(this,arguments)}}
 // twice the monsters, a little tougher (only the floors this game builds; another player's shared monsters come from their game)
 {const _bf=buildFloor;buildFloor=function(kind,f){const R=_bf.apply(this,arguments);try{if(!isMine(kind)||!R||!R.dun)return R;const K=DKIND[kind],W=R.w,G=R.dun.G;
    const MT=K.mob||[['bat',.5],['slime',1]],rnd=dRng(today()*313+f*131+kind.length*17),cells=[];
    for(let i=0;i<W*R.h;i++){const x=i%W,y=(i/W)|0;if(!G[i]&&!R.solid.has(i)&&x>2&&y>3&&x<W-3&&y<R.h-4)cells.push(i)}
    const n0=R.mobs.length,want=Math.max(n0*2,8+3*f);
    for(const m of R.mobs){if(typeof m.hp==='number'){m.hp=Math.round(m.hp*1.25);if(m.mhp)m.mhp=Math.round(m.mhp*1.25)}}
    for(let t=0;t<800&&R.mobs.length<want&&cells.length;t++){const i=cells[Math.floor(rnd()*cells.length)],x=(i%W)*16+8,y=((i/W)|0)*16+8;
     if(Math.hypot(x-R.ex*16,y-R.h*16)<180)continue;const r=rnd(),e=MT.find(q=>r<q[1])||MT[MT.length-1],hp=Math.round((12+5*f)*1.25);
     const m=rgMake(e[0],e[0]==='bat'?Math.round(hp*.7):hp,x,y);if(K.rg)m.rg=K.rg;m.icv=1;m.mine=1;R.mobs.push(m)}
    R.dun.mineReq=req(kind,f)}catch(e){self.SQERR&&SQERR(e,'242-2')}return R}}
 window.SQMINES={req,ok,REQ,GEN}})();
