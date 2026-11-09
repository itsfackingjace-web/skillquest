// ---- 110. Phones: ONLINE/CHAT and BUG move under the minimap, out of the middle of the screen ----
// On narrow screens they sat over the left side of the world, right where Elder Rowan stands at the start.
setInterval(()=>{const a=document.getElementById('mpb'),b=document.getElementById('mpbug');if(!a)return;const B=window.SQMINIBOX&&SQMINIBOX();
 if(innerWidth<700&&B&&B.h>20){const t=Math.round(B.y+B.h+8);a.style.left='auto';a.style.right=Math.max(8,Math.round(innerWidth-(B.x+B.w)))+'px';a.style.top=t+'px';
  if(b){b.style.left='auto';b.style.right=a.style.right;b.style.top=(t+48)+'px'}}
 else{a.style.left=a.style.right=a.style.top='';if(b)b.style.left=b.style.right=b.style.top=''}},400);
var HIDEH=false;   // Equipment > Hide helmet
const SQ_VERSION=(window.SQPATCH&&SQPATCH[0].v)||'?';   // the newest patch note's version
{const _o=optionsHTML;optionsHTML=function(){return _o()+'<div class="tl" style="margin-top:10px;font-size:11px;font-weight:400;opacity:.55">Game version '+SQ_VERSION+'</div>'}}
