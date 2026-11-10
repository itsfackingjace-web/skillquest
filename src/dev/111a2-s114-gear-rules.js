// ---- 114. Gear rules: how a weapon or armour piece works, set in the Dev Suite (Gear > How it works) ----
// The library's gear section: {itemKey:{dmg, rng, blk, mp, rq:{s,l}}}
//   dmg  extra damage (+/-) on top of the game's own: sword hits, a bow's arrows or a wand's spells
//   rng  extra bow range (+/-), blk extra block chance in % points (+/-), mp a wand's mana cost per spell
//   rq   what it needs instead of the game's own requirement: skill index s (SKN) at level l (l 0 = nothing needed)
// Only the main hand, off hand, head, body and legs slots. Anything without a rule works exactly as the game's code says.
(()=>{const GR={},SLOTS=['main','off','helm','body','legs'];
 const num=(v,a,b)=>{v=Math.round(Number(v));return isFinite(v)?Math.max(a,Math.min(b,v)):0};
 const gearKeys=()=>[...new Set(INVK)].filter(k=>EQ[k]&&SLOTS.includes(EQ[k].slot)&&INAME[k]);
 const kindOf=k=>{const e=EQ[k];if(!e)return'';if(e.kind==='bow')return'bow';if(e.kind==='wand')return'wand';if(e.slot==='main')return'melee';if(e.slot==='helm'||e.slot==='body'||e.slot==='legs')return'armour';return'other'};
 function clean(o,k){const e=EQ[k],t=kindOf(k);if(!e||!SLOTS.includes(e.slot)||!o||typeof o!=='object')return null;const r={};
  if(t==='melee'||t==='bow'||t==='wand'){const d=num(o.dmg,-50,50);if(d)r.dmg=d}
  if(t==='bow'){const v=num(o.rng,-200,300);if(v)r.rng=v}
  {const v=num(o.blk,-60,60);if(v)r.blk=v}
  if(t==='wand'&&o.mp!=null&&o.mp!==''){r.mp=num(o.mp,0,20)}
  if(o.rq&&typeof o.rq==='object'){r.rq={s:num(o.rq.s,0,SKN.length-1),l:num(o.rq.l,0,99)}}
  return Object.keys(r).length?r:null}
 // wear an item for a moment (to read its numbers or its look), then put back what was there
 function wearing(k,f){const e=EQ[k];if(!e||!SLOTS.includes(e.slot))return f();const sl=e.slot,old=occ(sl);if(old===k)return f();
  setSlot(sl,k);try{return f()}finally{setSlot(sl,old)}}
 // ---- the game's own numbers (before any rule) ----
 const _mf=meleeFlat,_ad=arrowDmg,_br=bowRange,_sd=spellDmg,_bb=blockBonus,WSP0={};for(const el in WSP)WSP0[el]=WSP[el].cost;
 const rule=k=>k&&GR[k]||null;
 function defReq(k){const e=EQ[k];if(!e)return null;if(e.arch)return{s:FL,l:e.arch};if((e.kind==='wand'||e.cls==='m')&&e.lv>1)return{s:ML,l:e.lv};
  if(e.arm>=4)return{s:8,l:{4:30,5:40}[e.arm]||0};if(e.arm>1)return{s:8,l:[0,1,10,20][e.arm]||0};if(e.atk)return{s:0,l:e.atk};return null}
 function base(k){const e=EQ[k],t=kindOf(k),o={kind:t,rq:defReq(k)};
  wearing(k,()=>{if(t==='melee')o.dmg=1+(TL.sword|0)+Math.floor(lvOf(0)/15)+_mf();
   else if(t==='bow'){o.dmg=_ad();o.rng=_br()}else if(t==='wand'){o.dmg=_sd(e.el);o.mp=WSP0[e.el]}
   if(t==='armour')o.blk=Math.round((ARM[e.slot]|0)*5)});
  if(o.blk==null)o.blk=0;return o}
 // ---- rules in play ----
 meleeFlat=function(){let b=_mf.apply(this,arguments);const r=rule(occ('main'));if(r&&r.dmg)b+=r.dmg;return b};
 arrowDmg=function(){const v=_ad.apply(this,arguments),r=rule(occ('off'));return r&&r.dmg?Math.max(1,v+r.dmg):v};
 bowRange=function(){const v=_br.apply(this,arguments),r=rule(occ('off'));return r&&r.rng?Math.max(30,v+r.rng):v};
 spellDmg=function(el){const v=_sd.apply(this,arguments),k=occ('off'),r=rule(k);return r&&r.dmg&&EQ[k]&&EQ[k].el===el?Math.max(1,v+r.dmg):v};
 blockBonus=function(){let b=_bb.apply(this,arguments);for(const s of SLOTS){const r=rule(occ(s));if(r&&r.blk)b+=r.blk/100}return b};
 // a wand's mana cost is per element; use the cost of the wand in your hand
 const _occW=()=>{const k=occ('off');return k&&EQ[k]&&EQ[k].kind==='wand'?k:null};
 function setCosts(){for(const el in WSP0)WSP[el].cost=WSP0[el];const k=_occW(),r=rule(k);if(r&&r.mp!=null&&WSP[EQ[k].el])WSP[EQ[k].el].cost=r.mp}
 const _ss=setSlot;setSlot=function(slot){const out=_ss.apply(this,arguments);if(slot==='off')try{setCosts()}catch(e){}return out};
 // requirements: a rule replaces the game's own checks for that item
 const _eq=equipItem;equipItem=function(k){const r=rule(k),e=EQ[k];if(!r||!r.rq||!e)return _eq.apply(this,arguments);if((inv[k]|0)<1)return;
  if(r.rq.l&&lvOf(r.rq.s)<r.rq.l){say('You need '+SKN[r.rq.s]+' '+r.rq.l+' to use the '+e.n.toLowerCase()+'.');sfx('swish');return}
  const old=occ(e.slot);if(old)inv[old]=(inv[old]|0)+1;inv[k]--;setSlot(e.slot,k);snapEq();say('Equipped the '+e.n.toLowerCase()+'.');sfx('pickup');saveLocal(true)};
 // ---- descriptions show the numbers that are really in play ----
 const pct=x=>Math.round(x*100)+'%',D0={};
 function statLine(k){const e=EQ[k],t=kindOf(k),r=rule(k)||{},L=[];
  wearing(k,()=>{if(t==='melee')L.push('Damage '+(1+(TL.sword|0)+Math.floor(lvOf(0)/15)+meleeFlat())+' per hit');
   else if(t==='bow')L.push('Arrow damage '+arrowDmg(),'Range '+bowRange());
   else if(t==='wand'){L.push((e.el[0].toUpperCase()+e.el.slice(1))+' spells','Damage '+spellDmg(e.el),'Costs '+(r.mp!=null?r.mp:WSP0[e.el])+' mana')}
   if(t==='armour'||r.blk){const b=(t==='armour'?(ARM[e.slot]|0)*.05:0)+(r.blk||0)/100;if(b)L.push('Block '+(b>0?'+':'')+pct(b))}});
  const q=r.rq||defReq(k);if(q&&q.l)L.push('Needs '+SKN[q.s]+' '+q.l);return L.join(' · ')}
 function hookDesc(k){if(D0[k])return;const d=Object.getOwnPropertyDescriptor(IDESC,k)||{value:IDESC[k],writable:true};D0[k]=d;let plain=d.get?null:d.value;
  const own=()=>{if(!d.get)return plain||'';let s=d.get.call(IDESC);try{const p=window.SQSTATS&&SQSTATS(k);if(p&&s.startsWith(p+'. '))s=s.slice(p.length+2)}catch(e){}return s};
  Object.defineProperty(IDESC,k,{configurable:true,enumerable:true,get(){if(!GR[k])return d.get?d.get.call(IDESC):plain;let s='';try{s=statLine(k)}catch(e){}const b=own();return(s?s+'. ':'')+b},
   set(v){if(d.set)d.set.call(IDESC,v);else plain=v}})}
 function applyGear(lib){for(const k in GR)delete GR[k];const G=lib&&lib.gear||{};
  for(const k in G){const r=clean(G[k],k);if(r){GR[k]=r;hookDesc(k)}}try{setCosts()}catch(e){}}
 SQA.onApply(applyGear);
 window.SQGEAR={SLOTS,gearKeys,kindOf,clean,base,defReq,wearing,statLine,get rules(){return GR}}})();
