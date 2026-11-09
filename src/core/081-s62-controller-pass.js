// ---------------------------------------------------------------- 62. Controller pass
// - The highlight is drawn inside each button (an inset ring), because the Gen 3 pixel frames clip anything drawn outside.
// - Moving either stick or the D-pad wakes the controller up, not just a button press.
// - Moving the highlight off a text box closes the phone keyboard.
{const st=document.createElement('style');st.textContent='.gpf.gpf.gpf{outline:none!important;box-shadow:inset 0 0 0 3px #f8a020,inset 0 0 0 6px rgba(248,160,32,.35)!important;filter:brightness(1.04)}'+
  'input.gpf.gpf.gpf{box-shadow:inset 0 0 0 3px #f8a020!important}';document.head.appendChild(st);
 const _pp62=pollPad;pollPad=function(dt){if(!GPON){try{const all=navigator.getGamepads?navigator.getGamepads():[];for(const g2 of all){if(!g2||!g2.connected)continue;
   if(g2.axes.some(v=>Math.abs(v)>.6)||g2.buttons.some(b=>b&&(b.pressed||b.value>.5))){GPI=g2.index;gpActivate(true);break}}}catch(e){}}_pp62(dt)};
 const _sf62=setFocus;setFocus=function(el){const a=document.activeElement;if(a&&a!==el&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA')&&a.blur)a.blur();_sf62(el)}}
