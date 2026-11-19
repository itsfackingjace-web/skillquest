// Frame-by-frame before/after comparison for functions that run every frame (upd) or draw (pP, drawHUD, solid...).
//   node compare-frames.cjs <scenes file> out.json [--pix]
// Every page gets a controllable clock before the game loads: performance.now/Date.now, setTimeout/setInterval and
// requestAnimationFrame go through one scheduler, frozen from the first line: time only moves when a frame is stepped (1/60 s),
// timers fire by that clock, Math.random is seeded, and the game's own loop runs one frame per step. The page is offline (no
// database). Each scene starts the game through the character creator, loads a fixed save (frames-save.json, a snap() of a
// signed-in test character: keep it so every run starts the same) and records
// a state line every few frames (player, bag, skills, monsters, fires, job, message, screen) and, with --pix, a hash of the
// canvas. Run it twice on the old build (the two outputs must match), then on the new one, and compare with diff.
const fs=require('fs'),path=require('path');
const INIT=()=>{const rPN=performance.now.bind(performance),rDN=Date.now,rST=setTimeout,rCT=clearTimeout,rRAF=requestAnimationFrame.bind(window);
 const C=window.__clk={frozen:false,t:0,epoch:0,timers:new Map(),id:1,raf:[]};
 const now=()=>C.frozen?C.t:rPN();
 performance.now=now;const dnow=()=>C.frozen?C.epoch+C.t:rDN.call(RD0);
 const RD0=Date;window.Date=class extends RD0{constructor(...a){if(a.length)super(...a);else super(dnow())}static now(){return dnow()}};
 const add=(cb,ms,args,every)=>{const id=C.id++;C.timers.set(id,{cb,at:now()+Math.max(0,+ms||0),args,every:every?Math.max(1,+ms||0):0});return id};
 window.setTimeout=(cb,ms,...a)=>add(cb,ms,a,false);window.setInterval=(cb,ms,...a)=>add(cb,ms,a,true);
 window.clearTimeout=window.clearInterval=id=>{C.timers.delete(id)};
 // timers due by `t` run in order of due time (then creation)
 C.pump=()=>{for(let guard=0;guard<10000;guard++){let best=null,bi=0;for(const[id,T]of C.timers)if(T.at<=now()&&(!best||T.at<best.at||(T.at===best.at&&id<bi))){best=T;bi=id}
   if(!best)break;if(best.every)best.at+=best.every;else C.timers.delete(bi);try{typeof best.cb==='function'?best.cb(...best.args):eval(best.cb)}catch(e){console.error(e)}}};
 (function real(){if(!C.frozen)C.pump();rST(real,4)})();
 // a real frame that arrives after the freeze is queued instead, so exactly one game loop is driven by C.frame
 window.requestAnimationFrame=cb=>{if(C.frozen){C.raf.push(cb);return 1}return rRAF(()=>{if(C.frozen)C.raf.push(cb);else cb(now())})};
 C.freeze=(epoch)=>{C.frozen=true;C.t=0;C.epoch=epoch;C.raf.length=0;for(const T of C.timers.values())T.at=0+ (T.every||0)};
 C.frame=()=>{C.t+=1000/60;C.pump();const L=C.raf.splice(0);for(const cb of L)cb(C.t)}};// like a browser: every queued callback once
module.exports={INIT};
if(require.main===module)(async()=>{const {chromium}=require('playwright');const ROOT=path.join(__dirname,'..','..');
 const scenes=require(path.resolve(process.argv[2]));const PIX=process.argv.includes('--pix');const SAVEF=path.join(__dirname,'frames-save.json');
 if(!fs.existsSync(SAVEF)){console.log('frames-save.json missing: make it once with a signed-in game (snap())');process.exit(1)}
 const save=fs.readFileSync(SAVEF,'utf8');const out={},errs=[];const b=await chromium.launch();
 for(const [name,sc] of Object.entries(scenes)){
  // offline (nothing but index.html loads) and frozen from the first line: every run starts from exactly the same page
  const ctx=await b.newContext({viewport:{width:640,height:400}});
  await ctx.route('**/*',r=>r.request().url().startsWith('http://sq.test/')?r.fulfill({path:path.join(ROOT,'index.html'),contentType:'text/html'}):r.abort());
  await ctx.addInitScript(INIT);await ctx.addInitScript(()=>{__clk.freeze(Date.UTC(2026,10,18,15,0,0));try{localStorage.setItem('sq_age_local','a')}catch(e){}let seed=3;Math.random=()=>(seed=(seed*16807)%2147483647)/2147483647});
  const p=await ctx.newPage();const perr=[];p.on('pageerror',e=>perr.push(e.message));
  await p.goto('http://sq.test/');await p.waitForTimeout(1500);
  // through the title screen like a player: PRESS START, PLAY, name, START
  await p.evaluate(()=>{const F=n=>{for(let i=0;i<n;i++)__clk.frame()},c=q=>{const e=document.querySelector(q);if(e)e.click();return!!e};
   F(30);c('#tsps');F(30);c('#tsmn [data-a="go"]');F(30);const ci=document.getElementById('cni');if(ci)ci.value='ANN';c('#cgo');F(30);
   if(menuOpen){PNAME=PNAME||'ANN';menuOpen=false;const cm=document.getElementById('cm');if(cm)cm.style.display='none'}F(30)});
  await p.evaluate(save=>{applySave(JSON.parse(save));for(let i=0;i<30;i++)__clk.frame()},save);
  await p.waitForTimeout(800);// pictures made so far finish decoding while the clock stands still
  if(process.env.SHOT)await p.evaluate(t=>{window.__SHOT=+t},process.env.SHOT);
  out[name]=await p.evaluate(([save,src,PIX])=>{const C=window.__clk;let seed=7;Math.random=()=>(seed=(seed*16807)%2147483647)/2147483647;
   try{if(pnOpen)closePanel()}catch(e){}en.length=0;fires.length=0;window.SQDO=null;time=Math.floor(time/DAYLEN)*DAYLEN+120;for(const k in K)K[k]=0;jx=jy=0;
   const lines=[];const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)};
   const r1=v=>Math.round(v*10)/10;
   const rec=(tag)=>{const st={f:tag,x:r1(P.x),y:r1(P.y),hp:r1(P.hp),hu:r1(hunger),g:GLD,face:face.join(),sc:SCENE?(SCENE.id+(SCENE.room&&SCENE.room.region||'')):'-',
     inv:hash(JSON.stringify(Object.entries(inv).filter(e=>e[1]).sort())),xp:XPS.map(Math.round).join(','),
     en:en.map(n=>(n.type||'?')+':'+r1(n.x)+','+r1(n.y)+':'+r1(n.hp||0)).join(' ').slice(0,400),fi:fires.map(f=>r1(f.x)+','+r1(f.y)+':'+Math.round(f.life)+':'+(f.lg|0)).join(' '),
     job:window.SQDO?SQDO.kind+':'+SQDO.n:'',m:String(typeof msg!=='undefined'?msg:'').slice(0,60),pn:pnOpen?ptab:-1,sw:r1(swing||0)};
    if(PIX){try{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let h=2166136261;for(let i=0;i<d.length;i+=7){h^=d[i];h=Math.imul(h,16777619)}st.px=(h>>>0).toString(36)}catch(e){st.px='err'}}
    if(window.__SHOT&&tag===window.__SHOT)window.__SHOTURL=cv.toDataURL();lines.push(JSON.stringify(st))};
   const S={frame:(n=1,every=10)=>{for(let i=0;i<n;i++){C.frame();if((i+1)%every===0)rec(lines.length)}},key:(k,on)=>{K[k]=on?1:0},rec,C};
   let err=null;try{const o=eval('({'+src+'})');o[Object.keys(o)[0]](S)}catch(e){err=String(e&&e.stack||e).slice(0,300)}
   return{err,lines,shot:window.__SHOTURL||null}},[save,sc.toString(),PIX]);
  errs.push(...perr.map(e=>name+': '+e));await ctx.close()}
 await b.close();fs.writeFileSync(process.argv[3],JSON.stringify(out,null,1));console.log(Object.keys(out).length,'scenes',errs.slice(0,5))})();
