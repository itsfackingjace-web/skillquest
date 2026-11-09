// ---------------------------------------------------------------- Fullscreen (Options)
// A Fullscreen button in Options where the browser allows it (Chrome / Edge / Firefox on PC, Android). iPhone Safari
// can't make a web page fullscreen, so there it explains Add to Home Screen instead, which opens the game without
// Safari's bars.
{const D=document,fsOK=()=>!!(D.fullscreenEnabled||D.webkitFullscreenEnabled),fsOn=()=>!!(D.fullscreenElement||D.webkitFullscreenElement);
 const standalone=()=>!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches));
 function fsToggle(){try{if(fsOn())(D.exitFullscreen||D.webkitExitFullscreen).call(D);else{const e=D.documentElement;const r=(e.requestFullscreen||e.webkitRequestFullscreen).call(e);if(r&&r.catch)r.catch(()=>say('Your browser would not go fullscreen. Try F11.'))}}catch(err){say('Your browser would not go fullscreen. Try F11.')}}
 for(const ev of['fullscreenchange','webkitfullscreenchange'])D.addEventListener(ev,()=>{try{if(pnOpen&&ptab===8)rPn()}catch(e){}});
 const _o=optionsHTML;optionsHTML=function(){const h=_o();let add;
  if(fsOK())add='<button class="sb fsb">Fullscreen: '+(fsOn()?'ON':'OFF')+'</button>';
  else if(!standalone())add='<div class="gr"><div class="gi"><b>Fullscreen</b><br><small>On iPhone: tap Share, then Add to Home Screen. Open SkillQuest from that icon to play without the browser bars.</small></div></div>';
  else return h;
  let k=h.indexOf('<div class="tl" style="margin-top:16px">CONTROLLER</div>');if(k<0)k=h.indexOf('<div class="tl" style="margin-top:22px');return k<0?h+add:h.slice(0,k)+add+h.slice(k)};
 const _c=pbd.onclick;pbd.onclick=e=>{if(e.target.closest('.fsb')){fsToggle();setTimeout(()=>{try{rPn()}catch(err){}},150);return}_c(e)};
 window.SQFS=fsToggle}
