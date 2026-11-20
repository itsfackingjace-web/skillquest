// ---- 231. Bug fixes from the Nov 16 reports ----
// - The cauldron uses the chests in your house/castle like the furnace, anvil and stove (033's STCH): brewing takes ingredients
//   from the bag first, then the chests (109 keeps the chests for every step of a brew job). 218's stationHTML wrapper skips
//   033's "Using your bag and N chests" line, so it's added here.
(()=>{try{STCH.add('cauldron')}catch(e){self.SQERR&&SQERR(e,'223-1')}
 const _sh=stationHTML;stationHTML=function(o){const h=_sh.apply(this,arguments);if(!o||o.t!=='cauldron'||typeof h!=='string')return h;
  let n=0;try{n=benchChests(o).length}catch(e){self.SQERR&&SQERR(e,'223-2')}const i=h.indexOf('</div>')+6;if(i<6)return h;
  const note='<div class="tl" style="font-size:12px;font-weight:400;opacity:.75">'+(n?'Using your bag and '+n+' chest'+(n>1?'s':'')+(o.inside?' in this house':' nearby'):'Using your bag. Put chests '+(o.inside?'in this house':'nearby')+' and their ingredients count too.')+'</div>';
  return h.slice(0,i)+note+h.slice(i)};
})();
