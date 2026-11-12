// ---- 131. Move your touch buttons ----
// Options > Controls > Touch: "Move my buttons" shows every action button (HIT, EAT, FIRE, TALK, ROLL, ULT and BOW/CAST),
// even the ones that only appear sometimes; drag them where your thumbs like them, and make the one you last touched
// smaller or bigger. Portrait and landscape each keep their own layout (turn the phone while editing to set the other).
// Saved on this device: localStorage sq_touch = {p|l: {id: {x, y, s}}}, x/y = the button's centre as a share of the
// screen's width/height, s = size. A button without a saved spot stays where the game puts it.
// While editing, the game is paused like any open screen (pnOpen), touches never reach the game, and the buttons'
// own actions don't run.
(()=>{const IDS=['a','e','f','tk','rl','ub','aimb'],NAMES={a:'HIT',e:'EAT',f:'FIRE',tk:'TALK',rl:'ROLL',ub:'ULT',aimb:'BOW / CAST'};
 const LS=v=>{try{if(v===undefined)return JSON.parse(localStorage.getItem('sq_touch')||'null');if(v)localStorage.setItem('sq_touch',JSON.stringify(v));else localStorage.removeItem('sq_touch')}catch(e){return null}};
 let LAY=LS()||{};if(typeof LAY!=='object'||!LAY)LAY={};
 const orient=()=>innerWidth>innerHeight?'l':'p',$=id=>document.getElementById(id);
 const PROPS=['left','top','right','bottom','transform'];
 const set=(el,p,v)=>{if(el.style.getPropertyValue(p)!==v||el.style.getPropertyPriority(p)!=='important')el.style.setProperty(p,v,'important')};
 const baseSize=el=>[el.offsetWidth||64,el.offsetHeight||64];
 function place(el,c){const[w,h]=baseSize(el),s=Math.max(.6,Math.min(1.8,+c.s||1)),W=innerWidth,H=innerHeight,hw=w*s/2,hh=h*s/2;
  const x=Math.max(hw+2,Math.min(W-hw-2,c.x*W)),y=Math.max(hh+2,Math.min(H-hh-2,c.y*H));
  set(el,'left',Math.round(x-w/2)+'px');set(el,'top',Math.round(y-h/2)+'px');set(el,'right','auto');set(el,'bottom','auto');set(el,'transform',s===1?'none':'scale('+s+')')}
 function apply(){const L=LAY[orient()]||{};for(const id of IDS){const el=$(id);if(!el)continue;const c=L[id];
   if(c)place(el,c);else if(el.dataset.sqpos){for(const p of PROPS)el.style.removeProperty(p);delete el.dataset.sqpos;continue}if(c)el.dataset.sqpos=1}}
 addEventListener('resize',()=>setTimeout(apply,50));addEventListener('orientationchange',()=>setTimeout(()=>{apply();bar()},250));
 // ---- edit mode ----
 const ED={on:false,sel:null,drag:null,shown:{}};
 const st=document.createElement('style');st.textContent=`#tlbar{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 8px);z-index:80;display:none;flex-direction:column;align-items:center;gap:6px;padding:8px 10px;width:min(560px,calc(100vw - 24px));box-sizing:border-box;background:#f8f0d8;color:#404040;border:3px solid #485870;font:600 13px ${PF};text-align:center}
#tlbar .r{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}#tlbar button{font:700 13px ${PF};padding:7px 11px;border:3px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer}#tlbar .ok{background:#485870;color:#f8f8f8}
#tlbg{position:fixed;inset:0;z-index:70;display:none;background:rgba(10,14,28,.45);background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px);background-size:32px 32px;touch-action:none}
.b.tled{z-index:75!important;outline:2px dashed rgba(248,208,72,.9);outline-offset:3px;opacity:1!important;visibility:visible!important;pointer-events:auto!important}.b.tlsel{outline:3px solid #f8d048}`;document.head.appendChild(st);
 const bg=document.createElement('div');bg.id='tlbg';const tb=document.createElement('div');tb.id='tlbar';document.body.append(bg,tb);
 function bar(){if(!ED.on)return;const o=orient();tb.innerHTML='<div>Drag the buttons where you like them. Setting the <b>'+(o==='p'?'portrait':'landscape')+'</b> layout'+' (turn your phone to set '+(o==='p'?'landscape':'portrait')+').</div>'+
  '<div class="r"><button data-tl="small">Smaller</button><button data-tl="big">Bigger</button><button data-tl="reset">Reset '+(o==='p'?'portrait':'landscape')+'</button><button class="ok" data-tl="done">DONE</button></div>'+
  '<div style="font-size:11px;opacity:.8">'+(ED.sel?'Selected: '+NAMES[ED.sel]:'Touch a button to pick it.')+'</div>'}
 function show(on){for(const id of IDS){const el=$(id);if(!el)continue;if(on){if(!(id in ED.shown))ED.shown[id]=[el.style.display,el.innerHTML];el.style.display='flex';el.classList.add('tled');if(!el.textContent.trim())el.textContent=NAMES[id]}
   else{el.classList.remove('tled','tlsel');if(id in ED.shown){el.style.display=ED.shown[id][0];el.innerHTML=ED.shown[id][1]}}}if(!on)ED.shown={}}
 function start(){if(ED.on)return;try{closePanel()}catch(e){}ED.on=true;ED.sel=null;pnOpen=true;jx=jy=0;bg.style.display='block';tb.style.display='flex';show(true);bar();apply()}
 function done(){if(!ED.on)return;ED.on=false;ED.drag=null;bg.style.display='none';tb.style.display='none';show(false);pnOpen=false;LS(Object.keys(LAY).length?LAY:null);apply();try{say('Button layout saved.')}catch(e){}}
 const save=()=>LS(Object.keys(LAY).length?LAY:null);
 function curOf(id){const L=LAY[orient()]||(LAY[orient()]={});if(!L[id]){const r=$(id).getBoundingClientRect(),s=1;L[id]={x:(r.left+r.width/2)/innerWidth,y:(r.top+r.height/2)/innerHeight,s}}return L[id]}
 tb.addEventListener('click',e=>{const b=e.target.closest('[data-tl]');if(!b)return;const a=b.dataset.tl;
  if(a==='done')return done();
  if(a==='reset'){delete LAY[orient()];save();apply();bar();return}
  if((a==='small'||a==='big')&&ED.sel){const c=curOf(ED.sel);c.s=Math.max(.6,Math.min(1.8,Math.round(((+c.s||1)+(a==='big'?.1:-.1))*10)/10));save();apply();bar()}});
 // touches: drag the buttons, nothing else reaches the game while editing
 const inBar=t=>!!(t&&t.closest&&t.closest('#tlbar'));
 for(const ev of['touchstart','touchmove','touchend','mousedown','click','contextmenu'])addEventListener(ev,e=>{if(!ED.on||inBar(e.target))return;e.stopImmediatePropagation();if(e.cancelable&&ev!=='click')e.preventDefault()},{capture:true,passive:false});
 addEventListener('pointerdown',e=>{if(!ED.on||inBar(e.target))return;e.stopImmediatePropagation();const el=e.target.closest&&e.target.closest('.b');const id=el&&IDS.includes(el.id)?el.id:null;if(!id)return;e.preventDefault();
  for(const i of IDS){const x=$(i);if(x)x.classList.toggle('tlsel',i===id)}ED.sel=id;const c=curOf(id);ED.drag={id,pid:e.pointerId,dx:c.x*innerWidth-e.clientX,dy:c.y*innerHeight-e.clientY};apply();bar()},true);
 addEventListener('pointermove',e=>{if(!ED.on)return;const d=ED.drag;if(!d||e.pointerId!==d.pid)return;e.stopImmediatePropagation();e.preventDefault();const c=curOf(d.id);
  c.x=Math.max(0,Math.min(1,(e.clientX+d.dx)/innerWidth));c.y=Math.max(0,Math.min(1,(e.clientY+d.dy)/innerHeight));apply()},true);
 for(const ev of['pointerup','pointercancel'])addEventListener(ev,e=>{if(!ED.on)return;e.stopImmediatePropagation();if(ED.drag&&e.pointerId===ED.drag.pid){ED.drag=null;save()}},true);
 // any way of closing (Esc, a controller's back button) finishes editing; the game's code may hide buttons each frame
 {const _cp=closePanel;closePanel=function(){if(ED.on){done();return}return _cp.apply(this,arguments)}}
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{if(ED.on){pnOpen=true;for(const id of IDS){const el=$(id);if(el&&el.style.display==='none')el.style.display='flex'}}apply()}catch(e){}return out}}
 setTimeout(apply,0);
 // ---- the Touch tab in Options > Controls ----
 function html(){const n=o=>Object.keys(LAY[o]||{}).length;
  return'<div class="qc" style="font-size:13px">Put the touch buttons where your thumbs like them. Portrait and landscape each keep their own layout. Your layout stays on this device.</div>'+
   '<div class="qc" style="font-size:13px">Portrait: '+(n('p')?n('p')+' button'+(n('p')>1?'s':'')+' moved':'the game\'s own layout')+'<br>Landscape: '+(n('l')?n('l')+' button'+(n('l')>1?'s':'')+' moved':'the game\'s own layout')+'</div>'+
   '<button class="sb" data-ct="tedit" style="width:100%;margin-top:6px"><b>Move my buttons</b></button><button class="sb" data-ct="treset" style="width:100%">Reset both layouts</button>'}
 function act(a){if(a==='tedit'){start();return false}if(a==='treset'){LAY={};save();apply()}}
 window.SQTOUCH={html,act,start,done,apply,get layout(){return LAY},get editing(){return ED.on}}})();
