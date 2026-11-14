// ---- 110. Phones: ONLINE/CHAT and BUG move under the minimap, out of the middle of the screen (189: smaller, in a row) ----
// On narrow screens they sat over the left side of the world, right where Elder Rowan stands at the start.
// Since 189: smaller, side by side. Phones held upright: under the minimap. Touch screens held sideways: under the status /
// quest boxes on the left (window.SQHUDBTN = the row's bottom in CSS px, so 115's guide hint goes under it). PC: where 061 put them.
function sqPlaceBtns(){const a=document.getElementById('mpb'),b=document.getElementById('mpbug');if(!a)return;const B=window.SQMINIBOX&&SQMINIBOX();window.SQHUDBTN=0;
 const set=(e,l,r,t)=>{if(!e)return;e.style.left=l;e.style.right=r;e.style.top=t};
 if(innerWidth<700&&B&&B.h>20){const t=Math.round(B.y+B.h+6)+'px',R=Math.max(8,Math.round(innerWidth-(B.x+B.w)));set(a,'auto',R+'px',t);set(b,'auto',(R+a.offsetWidth+6)+'px',t)}
 else if(typeof isPC!=='undefined'&&!isPC&&typeof HUDL!=='undefined'&&HUDL&&cv){const r=cv.getBoundingClientRect(),k=r.width/W,t=Math.round(r.top+HUDL.stackBottom*k+6),l=Math.round(r.left+HUDL.ins*k);
  set(a,l+'px','auto',t+'px');set(b,(l+a.offsetWidth+6)+'px','auto',t+'px');if(a.offsetWidth)window.SQHUDBTN=t+a.offsetHeight}
 else{set(a,'','','');set(b,'','','')}}
setInterval(sqPlaceBtns,400);
{const st=document.createElement('style');st.textContent='#mpb,#mpbug{height:30px!important;min-width:0!important;padding:0 8px!important;font-size:12px!important;letter-spacing:.5px!important}';document.head.appendChild(st)}
var HIDEH=false;   // Equipment > Hide helmet
const SQ_VERSION=(window.SQPATCH&&SQPATCH[0].v)||'?';   // the newest patch note's version
{const _o=optionsHTML;optionsHTML=function(){return _o()+'<div class="tl" style="margin-top:10px;font-size:11px;font-weight:400;opacity:.55">Game version '+SQ_VERSION+'</div>'}}
