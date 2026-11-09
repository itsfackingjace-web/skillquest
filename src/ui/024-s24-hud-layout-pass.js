// ---------------------------------------------------------------- 24. HUD layout pass
// MENU sits under the day box and matches its width; touch buttons hide when you play with a keyboard or
// controller; the PC controls panel is compact and tucks itself away; tap the text box to skip ahead.
const hst=document.createElement('style');hst.textContent='#hp{font:12px/1.45 var(--pf)!important;max-width:280px!important;white-space:nowrap;padding:8px 10px!important}#hpc{position:fixed;left:14px;bottom:14px;z-index:5;display:none;padding:5px 10px;border-radius:8px;background:#f8f8f8;color:#404040;border:3px solid #485870;box-shadow:inset 0 0 0 2px #a8c0e0;font:600 12px var(--pf);cursor:pointer}#pb2{min-width:0!important;padding:0!important}';document.head.appendChild(hst);
const hpc=document.createElement('div');hpc.id='hpc';document.body.appendChild(hpc);hpc.onclick=()=>{hp.style.display='block';hpAuto=-1};
let hpAuto=45,lastLay='',lastBtns='';
function hudDom(dt){
 // MENU button under the day box
 if(HUDL){const L=HUDL,s=x=>(x/D).toFixed(1)+'px',k=[L.ins,L.top,L.dw,L.dh,L.U].join();if(k!==lastLay){lastLay=k;for(const[pk,v]of[['right',s(L.ins)],['top',s(L.top+L.dh+6*L.U)],['width',s(L.dw)],['height',s(28*L.U)],['font-size',s(13*L.U)],['left','auto'],['bottom','auto'],['line-height','1']])pb2.style.setProperty(pk,v,'important')}}
 // touch buttons only for touch play
 const touch=!isPC&&!GPON,bk=String(touch);if(bk!==lastBtns){lastBtns=bk;for(const id of['a','e','f','rl']){const el=document.getElementById(id);if(el)el.style.visibility=touch?'visible':'hidden'}}
 // help panel: shows at the start, then tucks into a small chip (H or click to open again)
 if(isPC){if(hpAuto>0&&hp.style.display==='block'&&!pnOpen&&!menuOpen){hpAuto-=dt;if(hpAuto<=0)hp.style.display='none'}
  const showChip=helpOn&&hp.style.display!=='block'&&!pnOpen&&!menuOpen;hpc.style.display=showChip?'block':'none';if(showChip)hpc.textContent=GPON?'Controller help':'H: controls'}}
document.addEventListener('keydown',e=>{if((e.key||'').toLowerCase()!=='h'||e.repeat)return;const tg=e.target;if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'))return;if(pnOpen||menuOpen||chessOpen)return;
 e.stopImmediatePropagation();e.preventDefault();if(!helpOn){helpOn=true;try{localStorage.setItem('sq_help','1')}catch(_){}}hp.style.display=hp.style.display==='block'?'none':'block';hpAuto=-1},true);
// tap or click the text box to finish the line, or jump to the next page
function msgTap(x,y){const b=MSGBOX;if(!b||msgT<=0||x<b.x||x>b.x+b.w||y<b.y||y>b.y+b.h)return false;const now=performance.now();
 if(!b.done)MP.pat=now-60000;else if(b.more){MP.p++;MP.pat=now;msgT=Math.max(msgT,2.6)}else msgT=Math.min(msgT,.25);b.done=false;b.more=false;return true}
cv.addEventListener('touchstart',e=>{const t=e.changedTouches[0];if(t&&msgTap(t.clientX,t.clientY)){e.preventDefault();e.stopImmediatePropagation()}},{capture:true,passive:false});
cv.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'&&msgTap(e.clientX,e.clientY))e.stopImmediatePropagation()},{capture:true});
const _u24=upd;upd=function(dt){_u24(dt);hudDom(dt)};
addEventListener('resize',()=>{lastLay=''});
