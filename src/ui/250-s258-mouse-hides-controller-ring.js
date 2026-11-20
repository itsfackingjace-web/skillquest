// ---- 258. The last thing you used wins: clicking with the mouse (or tapping) leaves controller mode (window.SQLASTINPUT) ----
// Nov 20 (Jace and his brother, PC with a controller plugged in): "can't click items in the bag / gear tab / skills". The clicks
// worked, but controller mode (023's GPON) stays on for as long as a controller is connected, so its big gold highlight ring
// (172) stayed on whatever the controller last pointed at, and it looked like the click hadn't picked anything.
// Now a real mouse click or tap (a trusted pointerdown; 023's own A-button clicks aren't trusted) turns controller mode off, which
// hides the ring and puts the keyboard/mouse button words back; touching the controller again turns it back on (081), without
// the "Controller connected!" message, since it never went away.
(()=>{let quiet=0;
 addEventListener('pointerdown',e=>{if(!e.isTrusted||e.pointerType==='pen')return;try{if(typeof GPON!=='undefined'&&GPON){gpActivate(false);quiet=1}}catch(err){self.SQERR&&SQERR(err,'250-1')}},true);
 const _s=say;say=function(t){if(quiet&&/^Controller connected!/.test(String(t||''))){quiet=0;return}return _s.apply(this,arguments)};
 window.SQLASTINPUT={get pad(){return typeof GPON!=='undefined'&&GPON}}})();
