// ---- 165. Choose your ultimate ----
// Three kinds of gear give an ultimate: a sledgehammer in the main hand (GROUND SLAM, 096), a wand in the off-hand
// (Inferno / Frost Nova / Thunderstorm, 029) and the Dragonsoul amulet (Dragon Form, 086). The wrappers decide in that
// order (sledge > amulet > wand), so with several worn you only ever got the first. The gear tab (equipHTML) now lists
// the ultimates your gear gives and you pick the one the ULT button (V / L1+R1) uses. Saved as `ultp`
// ('slam' | 'dragon' | 'wand'; none = the old order). The choice is applied by hiding the others for the length of the
// castUlt call (SLEDGE, SQJW.neck, WAND are put back right after).
(()=>{let PICK=null;
 const WN={fire:'Inferno',ice:'Frost Nova',storm:'Thunderstorm'};
 const avail=()=>{const L=[];try{if(typeof SLEDGE!=='undefined'&&SLEDGE)L.push({k:'slam',n:'Ground Slam',from:'Stone Sledgehammer'})}catch(e){}
  try{if(window.SQJW&&SQJW.neck==='ja_dsoul')L.push({k:'dragon',n:'Dragon Form',from:'Dragonsoul amulet'})}catch(e){}
  try{if(WAND)L.push({k:'wand',n:WN[WAND]||'Wand ultimate',from:(INAME[occ('off')]||'your wand')})}catch(e){}return L};
 const chosen=()=>{const L=avail();if(!L.length)return null;return L.find(o=>o.k===PICK)||L[0]};
 {const _cu=castUlt;castUlt=function(){const L=avail(),c=chosen();if(L.length<2||!c)return _cu.apply(this,arguments);
   const sv={sl:SLEDGE,neck:window.SQJW&&SQJW.neck,w:WAND};
   try{if(c.k!=='slam')SLEDGE=false;if(c.k!=='dragon'&&window.SQJW&&SQJW.neck==='ja_dsoul')SQJW.neck=null;if(c.k!=='wand')WAND=null;return _cu.apply(this,arguments)}
   finally{SLEDGE=sv.sl;if(window.SQJW&&sv.neck==='ja_dsoul'&&SQJW.neck==null)SQJW.neck=sv.neck;if(WAND==null)WAND=sv.w}}}
 // the gear tab
 {const _eh=equipHTML;equipHTML=function(){const h=_eh.apply(this,arguments),L=avail();if(!L.length)return h;const c=chosen();
   let s='<div class="tl" style="margin-top:12px">ULTIMATE</div><div class="qc"><p style="margin:0 0 6px">'+(L.length>1?'Pick which ultimate the ULT button uses:':'Your ULT button uses:')+'</p>';
   for(const o of L){const on=c&&o.k===c.k;s+='<button class="sb'+(on?' sqult-on':'')+'" data-ultp="'+o.k+'" style="width:100%;margin:3px 0;text-align:left'+(on?';background:#fff6c8;border-color:#c89830':'')+'">'+(on?'★ ':'')+o.n+'<br><small>from '+esc(o.from)+'</small></button>'}
   return h+s+'</div>'}}
 pbd.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ultp]');if(!b||ptab!==3)return;e.stopPropagation();e.preventDefault();PICK=b.dataset.ultp;
  const o=avail().find(x=>x.k===PICK);say('Your ULT button now uses '+(o?o.n:'that ultimate')+'.');try{sfx('talk')}catch(_){}try{saveLocal(true)}catch(_){}rPn()},true);
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);if(PICK)s.ultp=PICK;return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);PICK=S&&/^(slam|dragon|wand)$/.test(S.ultp)?S.ultp:null;return out}}
 try{KNOWN49.add('ultp')}catch(e){}
 window.SQULT={avail,chosen,get pick(){return PICK},set pick(v){PICK=v}}})();
