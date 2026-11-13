// ---- 172. Saves never bring back things you removed (the castle dupe) ----
// 049 keeps save fields it doesn't know (SAVE_EXTRA) and writes them back into every later save, so data from a newer
// version isn't lost. It learned which fields are "known" from the first save it made in a session, so a field that a
// section only writes when it has something (rh = houses/castles on the islands, and others) counted as unknown if it
// was empty at that moment. Then the old copy from the loaded save was written back after you emptied it: pack your
// island castle, and the next load had it standing again with the packed one still in your bag (and the one-home rule
// could pack the extra into the bag again). Now every field the game writes is known: the ones the sections write
// (listed here), plus any field a save ever had in this session; and a known field is never taken from SAVE_EXTRA.
(()=>{if(typeof KNOWN49==='undefined')return;
 const KEYS='rh str rb rfarm rh houses home farm cus jw ach dly wev chr gd tfx ultp cq ibk hsc qv cos petItems ohat offh wbk wbc thd sld emd fcr stk ss pvpk chb sf ign bw as wt seen cave dl dun rare perks phx sideQuests xdun qdone qhold plant wreck sail cls wand mp jobs gmd tomb chess name bsp yf yp yw'.split(' ');
 for(const k of KEYS)KNOWN49.add(k);
 const learn=s=>{if(!s||typeof s!=='object')return;for(const k of Object.keys(s))if(!(k in SAVE_EXTRA)||s[k]!==SAVE_EXTRA[k])KNOWN49.add(k)};
 const prune=()=>{try{for(const k of Object.keys(SAVE_EXTRA))if(KNOWN49.has(k))delete SAVE_EXTRA[k]}catch(e){}};
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);try{
   // a known field that only came from SAVE_EXTRA (same object) is stale: leave it out
   for(const k in SAVE_EXTRA)if(KNOWN49.has(k)&&s[k]===SAVE_EXTRA[k])delete s[k];learn(s);prune()}catch(e){}return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);prune();return out}}
 window.SQSAVEKEYS={KEYS,prune}})();
