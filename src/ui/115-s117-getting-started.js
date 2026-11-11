// ---- 117. Getting started: the first 15 minutes ----
// A new character gets a short guided start in the quest tracker: talk to the Elder, chop wood by hand, make an axe, bring
// the Elder his firewood, make a pickaxe, mine stone and build a first campfire. Each step says exactly what to press
// (HIT/FIRE/TALK on touch, Space/F/T on a computer), the tracker's arrow points to the nearest tree, rock or the Elder,
// a hint and a glowing button appear if nothing happens for a while, and every step pays a small reward straight away.
// Saves keep the step as `gd` (99 = finished or skipped). Older saves that are past the start count as finished.
// Tapping the quest box opens the quest log, which has a "Skip the guide" button while it runs.
(()=>{const DONE=99;let GD={s:null},STEP_AT=0,LASTP=0,GAIN={wood:0,stone:0},LAST={wood:0,stone:0},FIRES=0,FX0=0,SHOW=0;
 const now=()=>performance.now()/1000;
 const elder=()=>NPCS.find(n=>n.kind==='elder');
 const outside=()=>!SCENE&&!dead;
 function nearest(test,maxT){if(SCENE)return null;const px=Math.floor(P.x/16),py=Math.floor(P.y/16);let best=null,bd=1e9;
  for(let y=Math.max(0,py-maxT);y<=Math.min(N-1,py+maxT);y++)for(let x=Math.max(0,px-maxT);x<=Math.min(N-1,px+maxT);x++){const o=obj[y*N+x];if(!o||!test(o.t))continue;const d=(x-px)**2+(y-py)**2;if(d<bd){bd=d;best={area:'hollow',x:x*16+8,y:y*16+8}}}return best}
 const tree=()=>nearest(t=>/tree/.test(t)&&!/^(oak|willow|maple|yew|magic|elder)/.test(t),40)||nearest(t=>/tree/.test(t),40);
 const rock=()=>nearest(t=>t==='rock',40);
 const atElder=()=>{const e=elder();return e?{area:'hollow',x:e.x,y:e.y}:null};
 const key=(pc,touch)=>isPC?pc:touch;
 // the steps: n = what the tracker says, how = the hint, done(), prog(), at() = where the arrow points, btn = button to light up
 const S=[
  {n:'Talk to Elder Rowan',how:()=>key('Walk up to Elder Rowan (the arrow points to him) and press T.','Walk up to Elder Rowan (follow the arrow) and tap TALK.'),
   done:()=>Q.on||Q.i>0,at:atElder,btn:'tk',near:()=>{const e=elder();return e&&Math.hypot(e.x-P.x,e.y-P.y)<40}},
  {n:'Chop 3 wood with your hands',how:()=>key('Stand next to a tree and press Space to chop it. No axe needed yet!','Stand next to a tree and tap HIT to chop it. No axe needed yet!'),
   done:()=>GAIN.wood>=3||TL.axe>0,prog:()=>Math.min(3,GAIN.wood)+'/3',at:tree,btn:'a',r:{g:5}},
  {n:'Make a wooden axe',how:()=>(inv.wood|0)<3?'You need 3 wood for an axe. Chop a little more first.':key('Press C to open Crafting and make a Wooden axe (3 wood).','Tap MENU, open Craft and make a Wooden axe (3 wood).'),
   done:()=>TL.axe>0,at:()=>(inv.wood|0)<3?tree():null,btn:'pb2',r:{g:10}},
  {n:'Chop 10 wood for the Elder',how:()=>'Your axe chops faster. Keep going until you have 10 wood.',done:()=>(inv.wood|0)>=10||Q.i>0,prog:()=>Math.min(10,inv.wood|0)+'/10',at:tree,btn:'a',r:{g:5}},
  {n:'Bring the wood to Elder Rowan',how:()=>key('Walk back to Elder Rowan and press T to hand over the wood.','Walk back to Elder Rowan and tap TALK to hand over the wood.'),done:()=>Q.i>=1,at:atElder,btn:'tk',
   near:()=>{const e=elder();return e&&Math.hypot(e.x-P.x,e.y-P.y)<40}},
  {n:'Make a wooden pickaxe',how:()=>(inv.wood|0)<4?'A pickaxe takes 4 wood. Chop a little more first.':key('Press C and make a Wooden pickaxe (4 wood).','Tap MENU, open Craft and make a Wooden pickaxe (4 wood).'),
   done:()=>TL.pick>0,at:()=>(inv.wood|0)<4?tree():null,btn:'pb2',r:{g:10}},
  {n:'Mine 2 stone',how:()=>key('Stand next to a grey rock and press Space to mine it.','Stand next to a grey rock and tap HIT to mine it.'),done:()=>GAIN.stone>=2||(inv.stone|0)>=2,prog:()=>Math.min(2,Math.max(GAIN.stone,inv.stone|0))+'/2',at:rock,btn:'a',r:{g:5}},
  {n:'Build a campfire',how:()=>(inv.wood|0)<3?'A campfire takes 3 wood and 1 stone. Chop a bit more wood.':(inv.stone|0)<1?'A campfire takes 3 wood and 1 stone. Mine a rock.':key('Press F to build a campfire in front of you (3 wood + 1 stone).','Tap FIRE to build a campfire in front of you (3 wood + 1 stone).'),
   done:()=>XPS[5]>FX0,at:()=>(inv.wood|0)<3?tree():(inv.stone|0)<1?rock():null,btn:'f',r:{g:10,cooked:2}}];
 const N0=S.length;
 function stepStart(){STEP_AT=now();LASTP=STEP_AT;SHOW=STEP_AT;GAIN={wood:0,stone:0};FX0=XPS[5];for(const k in LAST)LAST[k]=inv[k]|0}
 function reward(r){if(!r)return'';const a=[];if(r.g){GLD+=r.g;a.push(r.g+' gold')}if(r.cooked){inv.cooked=(inv.cooked|0)+r.cooked;a.push(r.cooked+' cooked meat')}return a.join(' and ')}
 function advance(){const st=S[GD.s];const got=reward(st&&st.r);GD.s++;try{sfx('quest')}catch(e){}
  if(GD.s>=N0){const g=reward({g:20});GD.s=DONE;try{say('Basics done! +'+g+'. Tap the quest box for your next job.');msgT=7}catch(e){}}
  else{try{say('Done: '+st.n+'!'+(got?' +'+got:''));msgT=4}catch(e){}}
  stepStart();try{saveLocal(true)}catch(e){}}
 const active=()=>GD.s!=null&&GD.s<N0;
 // a game started without a save (a brand-new player on this device): decide once play begins
 const decide=()=>{GD.s=(Q.i>0||Q.on&&Q.k>0||lvTot()-XPS.length>6||GLD>100)?DONE:0;stepStart()};
 // progress
 const _u=upd;upd=function(dt){_u.apply(this,arguments);if(GD.s==null)decide();if(!active()||dead)return;
  for(const k in LAST){const v=inv[k]|0;if(v>LAST[k]){GAIN[k]+=v-LAST[k];LASTP=now()}LAST[k]=v}
  let guard=0;while(active()&&guard++<3){let d=false;try{d=S[GD.s].done()}catch(e){}if(!d)break;advance()}};
 // the tracker: the step, its progress and where to go
 window.SQGUIDE=()=>{if(!active())return null;const st=S[GD.s];let t=null;try{t=outside()&&st.at?st.at():null}catch(e){}
  let prog='';try{prog=st.prog?st.prog():''}catch(e){}
  return{e:{name:'Getting started '+(GD.s+1)+'/'+N0,step:st.n,prog,st:'active',ready:false,area:'hollow'},t}};
 // the hint: shown when a step starts and again if you get stuck; the button to press glows
 let lit=null;
 function light(id){if(lit===id)return;if(lit){const o=document.getElementById(lit);if(o)o.classList.remove('sqglow')}lit=id;if(id){const o=document.getElementById(id);if(o)o.classList.add('sqglow')}}
 const _dh=drawHUD;drawHUD=function(){_dh();if(!active()||dead||menuOpen||(typeof pnOpen!=='undefined'&&pnOpen)){light(null);return}
  const st=S[GD.s],t=now(),stuck=t-LASTP>40,fresh=t-SHOW<9;let near=true;try{near=st.near?st.near():true}catch(e){}
  light(stuck||fresh||(st.near&&near)?st.btn:null);if(!stuck&&!fresh)return;
  let txt='';try{txt=st.how()}catch(e){}if(!txt)return;
  g.save();g.setTransform(1,0,0,1,0,0);const U=(typeof HUDL!=='undefined'&&HUDL&&HUDL.U)||1,fs=12*U;g.font='600 '+fs+'px '+PF;
  const maxW=Math.min(W-32*U,360*U),words=txt.split(' '),lines=[];let cur='';for(const w of words){const tt=cur?cur+' '+w:w;if(g.measureText(tt).width>maxW-24*U&&cur){lines.push(cur);cur=w}else cur=tt}if(cur)lines.push(cur);
  const bw=Math.min(maxW,Math.max(...lines.map(l=>g.measureText(l).width))+24*U),lh=fs*1.35,bh=lines.length*lh+(stuck?28:18)*U,bx=(W-bw)/2,by=Math.min(H-bh-120*U,H/2+30*Z);
  g3box(bx,by,bw,bh,U,'#f8f0d8');let y=by+10*U+fs*.5;if(stuck){g3text('Need a hand?',W/2,y,11,U,'#b06010','center',700);y+=lh}
  lines.forEach(l=>{g3text(l,W/2,y,12,U,'#404040','center',600);y+=lh});g.restore()};
 // tapping the quest box opens the quest log
 cv.addEventListener('pointerdown',e=>{if(menuOpen||(typeof pnOpen!=='undefined'&&pnOpen)||typeof HUDL==='undefined'||!HUDL)return;const r=cv.getBoundingClientRect(),sx=(e.clientX-r.left)*(cv.width/r.width),sy=(e.clientY-r.top)*(cv.height/r.height),L=HUDL;
  if(sx>=L.ins&&sx<=L.ins+L.qw&&sy>=L.qy&&sy<=L.qy+42*L.U){e.stopImmediatePropagation();e.preventDefault();try{openPanel(6)}catch(x){}}},true);
 // the quest log: where the guide is, and a way to skip it
 const _rp=rPn;rPn=function(){_rp.apply(this,arguments);if(!pnOpen||ptab!==6||!active())return;const d=document.createElement('div');d.className='sqgd';
  d.innerHTML='<b>Getting started '+(GD.s+1)+'/'+N0+':</b> '+S[GD.s].n+'<button data-gskip>Skip the guide</button>';pbd.prepend(d)};
 pbd.addEventListener('click',e=>{if(!e.target.closest||!e.target.closest('[data-gskip]'))return;GD.s=DONE;light(null);try{say('Guide skipped. Your quests are in the quest log.');saveLocal(true)}catch(x){}rPn()});
 // saves
 const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);try{if(GD.s!=null)s.gd=GD.s}catch(e){}return s};
 const _ap=applySave;applySave=function(Sv){const out=_ap.apply(this,arguments);try{const v=Sv&&Sv.gd;
   if(typeof v==='number'&&v>=0)GD.s=v>=N0?DONE:v|0;else decide()}catch(e){GD.s=DONE}return out};
 const _ng=newGame;newGame=function(){const out=_ng.apply(this,arguments);GD.s=0;stepStart();return out};
 {const st=document.createElement('style');st.textContent=`@keyframes sqglow{0%,100%{box-shadow:0 0 0 3px #f8d048,0 0 10px 4px rgba(248,208,72,.8)}50%{box-shadow:0 0 0 3px #f8d048,0 0 22px 10px rgba(248,208,72,.35)}}
.sqglow{animation:sqglow 1.1s ease-in-out infinite!important}
@keyframes sqglowb{0%,100%{opacity:.55}50%{opacity:.15}}.b.sqglow::after{content:'';position:absolute;inset:0;background:#f8d048;animation:sqglowb 1.1s ease-in-out infinite;pointer-events:none}
#pn .sqgd{background:#f8f0d8;border:2px solid #c8a860;border-radius:8px;padding:8px 10px;margin:0 0 10px;font-size:13px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;color:#404040}
#pn .sqgd button{border:2px solid #485870;border-radius:6px;background:#fff;color:#304060;padding:6px 10px;font:inherit;font-size:12px;cursor:pointer}`;document.head.appendChild(st)}
 window.SQGD={get step(){return GD.s},set step(v){GD.s=v;stepStart()},steps:S.map(s=>s.n)}})();
