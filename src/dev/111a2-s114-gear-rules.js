// ---- 114. Gear rules and new gear items, set in the Dev Suite (Gear) ----
// The library's gear section: {itemKey:{dmg, rng, blk, mp, rq:{s,l}, fx:{ls,burn,slow,crit,spd,xp}}}
//   dmg  extra damage (+/-) on top of the game's own: sword hits, a bow's arrows or a wand's spells
//   rng  extra bow range (+/-), blk extra block chance in % points (+/-), mp a wand's mana cost per spell
//   rq   what it needs instead of the game's own requirement: skill index s (SKN) at level l (l 0 = nothing needed)
//   fx   special effects while it's worn, in %: ls life steal (chance to heal 1 heart on a hit), burn / slow (chance to
//        set the target burning / slow it), crit (chance to hit again for the same damage), spd move speed, xp bonus XP.
//        Effects from every piece you wear add up; on-hit effects work for sword hits, arrows and spells.
// The library's newgear section: {eq_cu_<name>:{n name, b the existing item it works like, v sell price, d description,
//   sm:{c:{material:count}, lv} an anvil recipe (Smithing level)}}. A new item plays exactly like its base item (same slot,
//   tier, set and look) until it gets its own look, icon and rules. The game keeps it equipped as its base tier (TL/ARM/CLS)
//   plus CUS[slot] = the new item's key. Saves keep new items even before the library that defines them has loaded.
// Only the main hand, off hand, head, body and legs slots. Anything without a rule works exactly as the game's code says.
(()=>{const GR={},NG={},SLOTS=['main','off','helm','body','legs'];
 const num=(v,a,b)=>{v=Math.round(Number(v));return isFinite(v)?Math.max(a,Math.min(b,v)):0};
 const txt=(v,n)=>String(v==null?'':v).replace(/[<>]/g,'').slice(0,n);
 const ngKey=k=>/^eq_cu_[a-z0-9_]{1,30}$/.test(k);
 const gearKeys=()=>[...new Set(INVK)].filter(k=>EQ[k]&&SLOTS.includes(EQ[k].slot)&&INAME[k]);
 const kindOf=k=>{const e=EQ[k];if(!e)return'';if(e.kind==='bow')return'bow';if(e.kind==='wand')return'wand';if(e.slot==='main')return'melee';if(e.slot==='helm'||e.slot==='body'||e.slot==='legs')return'armour';return'other'};
 const FXN={ls:'Life steal',burn:'Burn',slow:'Slow',crit:'Critical hit',spd:'Move speed',xp:'Bonus XP',mel:'Melee damage',arc:'Arrow damage',mag:'Magic damage',mreg:'Mana regen',hreg:'Health regen',hun:'Less hunger',gold:'More gold'},
  FXMAX={ls:100,burn:100,slow:100,crit:100,spd:50,xp:100,mel:100,arc:100,mag:100,mreg:300,hreg:100,hun:90,gold:200};// mel..gold run in 179 (items/179-s186-gear-effects.js)
 function clean(o,k){const e=EQ[k],t=kindOf(k);if(!e||!SLOTS.includes(e.slot)||!o||typeof o!=='object')return null;const r={};
  if(t==='melee'||t==='bow'||t==='wand'){const d=num(o.dmg,-50,50);if(d)r.dmg=d}
  if(t==='bow'){const v=num(o.rng,-200,300);if(v)r.rng=v}
  {const v=num(o.blk,-60,60);if(v)r.blk=v}
  if(t==='wand'&&o.mp!=null&&o.mp!==''){r.mp=num(o.mp,0,20)}
  if(o.rq&&typeof o.rq==='object'){r.rq={s:num(o.rq.s,0,SKN.length-1),l:num(o.rq.l,0,99)}}
  if(o.fx&&typeof o.fx==='object'){const f={};for(const x in FXN){const v=num(o.fx[x],0,FXMAX[x]);if(v)f[x]=v}if(Object.keys(f).length)r.fx=f}
  return Object.keys(r).length?r:null}
 // ---- new gear items ----
 const CUS={},PEND={},PCUS={};// the new item worn in each slot; bag counts and worn pieces waiting for their item to load
 function ngClean(o,k){if(!ngKey(k)||!o||typeof o!=='object')return null;const b=String(o.b||''),e=EQ[b];if(!e||e.custom||!SLOTS.includes(e.slot)||e.slot==='pet')return null;
  const r={n:txt(o.n,40).trim()||'New gear',b,v:num(o.v,0,1000000),d:txt(o.d,300)};
  if(o.sm&&typeof o.sm==='object'&&o.sm.c&&typeof o.sm.c==='object'){const c={};for(const m in o.sm.c){if(Object.keys(c).length>=12)break;const q=num(o.sm.c[m],0,9999);if(q&&INAME[m]&&m!==k)c[m]=q}
   if(Object.keys(c).length){r.sm={c,lv:num(o.sm.lv,1,99)};if(o.sm.st==='craft')r.sm.st='craft'}}// st: 'craft' = Craft list (and crafting bench, Crafting level), else anvil (Smithing)
  return r}
 const _occ=occ;occ=function(slot){const k=_occ(slot),c=CUS[slot];return c&&EQ[c]&&k===EQ[c].base?c:k};
 function regNG(k,d){const fresh=!EQ[k];const e={...EQ[d.b],n:d.n,v:d.v,custom:1,base:d.b};delete e.pet;EQ[k]=e;
  if(fresh){INVK.push(k);EXTRA_BAG.push(k);try{EQK.push(k)}catch(x){}}
  INAME[k]=d.n;SN[k]=/s$/i.test(d.n)?d.n:d.n+'s';SHORT[k]=d.n.toLowerCase();SELLP[k]=d.v;hookDesc(k);
  if(PEND[k]){inv[k]=(inv[k]|0)+PEND[k];delete PEND[k]}
  for(const s in PCUS)if(PCUS[s]===k){if(_occ(s)===d.b)CUS[s]=k;delete PCUS[s]}
  for(let i=SM.length-1;i>=0;i--)if(SM[i]._cu&&SM[i].k===k)SM.splice(i,1);for(let i=GOODS.length-1;i>=0;i--)if(GOODS[i]._cu===1&&GOODS[i].k===k)GOODS.splice(i,1);
  if(d.sm){const br=SM.find(r=>r.k===d.b),xp=br&&br.xp||d.sm.lv*6;if(d.sm.st==='craft')GOODS.push({k,n:d.n,c:{...d.sm.c},req:d.sm.lv,xp,v:d.v|0,_cu:1});else SM.push({k,n:d.n,c:{...d.sm.c},lv:d.sm.lv,xp,_cu:1})}}
 function unregNG(k){if(!EQ[k]||!EQ[k].custom)return;if(inv[k]|0)PEND[k]=(PEND[k]|0)+(inv[k]|0);delete inv[k];
  for(const s of SLOTS)if(CUS[s]===k){PCUS[s]=k;CUS[s]=null}
  for(const A of[INVK,EXTRA_BAG])for(let i=A.length-1;i>=0;i--)if(A[i]===k)A.splice(i,1);try{const i=EQK.indexOf(k);if(i>=0)EQK.splice(i,1)}catch(x){}
  for(let i=SM.length-1;i>=0;i--)if(SM[i]._cu&&SM[i].k===k)SM.splice(i,1);for(let i=GOODS.length-1;i>=0;i--)if(GOODS[i]._cu===1&&GOODS[i].k===k)GOODS.splice(i,1);delete EQ[k];delete INAME[k];delete SN[k];delete SHORT[k];delete SELLP[k]}
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
 function setCosts(){for(const el in WSP0)WSP[el].cost=WSP0[el];const k=occ('off'),r=rule(k);if(r&&r.mp!=null&&EQ[k]&&EQ[k].kind==='wand'&&WSP[EQ[k].el])WSP[EQ[k].el].cost=r.mp}
 const _ss=setSlot;setSlot=function(slot,k){let out;if(k&&EQ[k]&&EQ[k].custom){out=_ss.call(this,slot,EQ[k].base);CUS[slot]=k}else{CUS[slot]=null;out=_ss.apply(this,arguments)}
  if(slot==='off')try{setCosts()}catch(e){}return out};
 // requirements: a rule replaces the game's own checks for that item
 const _eq=equipItem;equipItem=function(k){const r=rule(k),e=EQ[k];if(!r||!r.rq||!e)return _eq.apply(this,arguments);if((inv[k]|0)<1)return;
  if(r.rq.l&&lvOf(r.rq.s)<r.rq.l){say('You need '+SKN[r.rq.s]+' '+r.rq.l+' to use the '+e.n.toLowerCase()+'.');sfx('swish');return}
  const old=occ(e.slot);if(old)inv[old]=(inv[old]|0)+1;inv[k]--;setSlot(e.slot,k);snapEq();say('Equipped the '+e.n.toLowerCase()+'.');sfx('pickup');saveLocal(true)};
 // an upgrade that knocks a new item out of your hand puts that item (not its base) in your bag
 const _wu=watchUpgrades;watchUpgrades=function(){const was={...CUS},b0={};for(const s in was)if(was[s])b0[s]=inv[EQ[was[s]].base]|0;_wu.apply(this,arguments);
  for(const s in was){const c=was[s];if(!c||!EQ[c])continue;if(_occ(s)!==EQ[c].base){if((inv[EQ[c].base]|0)>b0[s]){inv[EQ[c].base]--;inv[c]=(inv[c]|0)+1}CUS[s]=null}}};
 // ---- special effects ----
 const fxSum=x=>{let t=0;for(const s of SLOTS){const r=rule(occ(s));if(r&&r.fx&&r.fx[x])t+=r.fx[x]}if(window.SQFXEXTRA)for(const f of SQFXEXTRA){try{t+=+f(x)||0}catch(e){}}return t};// SQFXEXTRA: more sources (186's perks)
 const roll=p=>p>0&&Math.random()*100<p;
 function onHit(n,dealt,how){if(!n||!(dealt>0))return;
  if(!n.dead&&roll(fxSum('crit'))){try{drops.push({x:n.x,y:n.y-26,t:0,tx:'CRIT',c:'#ff70a0'})}catch(e){}hitE(n,dealt,'#ff70a0',how)}
  if(!n.dead&&roll(fxSum('burn')))n.burn=Math.max(n.burn||0,3);
  if(!n.dead&&roll(fxSum('slow')))n.slow=Math.max(n.slow||0,3);
  if(P.hp<6&&roll(fxSum('ls')))healP(1,'life steal')}
 const anyFx=()=>{for(const s of SLOTS){const r=rule(occ(s));if(r&&r.fx)return true}return false};
 const _atk=attack;attack=function(){if(!anyFx())return _atk.apply(this,arguments);const hp0=new Map(en.map(n=>[n,n.hp])),np=PROJ.length,ns=SPELLS.length;const out=_atk.apply(this,arguments);
  if(PROJ.length===np&&SPELLS.length===ns)for(const[n,h]of hp0)if(n.hp<h)try{onHit(n,h-n.hp,'melee')}catch(e){}return out};
 const _ah=arrowHit;arrowHit=function(p,n){const out=_ah.apply(this,arguments);if(p&&!p.hostile&&p.k==='arrow'&&anyFx())try{onHit(n,p.dmg|0,'arrow')}catch(e){}return out};
 const _sh=spellHit;spellHit=function(s,n,dmg){const out=_sh.apply(this,arguments);if(anyFx())try{onHit(n,dmg|0,'spell')}catch(e){}return out};
 const _ax=addXp;addXp=function(i,x){const b=fxSum('xp');if(b&&x>0)x=Math.max(x,Math.round(x*(1+b/100)));return _ax.call(this,i,x)};
 const _up=upd;upd=function(dt){const x0=P.x,y0=P.y;const out=_up.apply(this,arguments);try{const sp=fxSum('spd');if(sp&&!dead&&!SCENE){const dx=P.x-x0,dy=P.y-y0;
   if((dx||dy)&&Math.hypot(dx,dy)<20){const f=sp/100,ok=(x,y)=>!(solid(x-5,y-3)||solid(x+5,y-3)||solid(x-5,y+6)||solid(x+5,y+6));if(ok(P.x+dx*f,P.y))P.x+=dx*f;if(ok(P.x,P.y+dy*f))P.y+=dy*f}}}catch(e){}return out};
 // ---- saves keep new items (and what you wear) even if they haven't loaded yet ----
 const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);try{for(const k in PEND)if(PEND[k])s.inv[k]=(s.inv[k]|0)+PEND[k];
   const c={};for(const sl of SLOTS){if(CUS[sl])c[sl]=CUS[sl];else if(PCUS[sl])c[sl]=PCUS[sl]}if(Object.keys(c).length)s.cus=c}catch(e){}return s};
 const _ap=applySave;applySave=function(S){for(const k in PEND)delete PEND[k];for(const s of SLOTS){CUS[s]=null;delete PCUS[s]}const out=_ap.apply(this,arguments);
  try{if(S&&S.inv)for(const k in S.inv)if(ngKey(k)&&!EQ[k]&&+S.inv[k]>0)PEND[k]=Math.min(1e6,+S.inv[k]|0);
   if(S&&S.cus&&typeof S.cus==='object')for(const s of SLOTS){const k=S.cus[s];if(!ngKey(k))continue;if(EQ[k]&&EQ[k].custom){if(_occ(s)===EQ[k].base)CUS[s]=k}else PCUS[s]=k}
   if(typeof snapEq==='function')snapEq();setCosts()}catch(e){}return out};
 const _ng=newGame;newGame=function(){for(const k in PEND)delete PEND[k];for(const s of SLOTS){CUS[s]=null;delete PCUS[s]}return _ng.apply(this,arguments)};
 // ---- icons: a new item without its own icon uses its base item's ----
 const _ic=iconURL;iconURL=function(k,col){const e=EQ[k];if(e&&e.custom&&!SQA.hasIcon(k))return _ic(e.base,col);return _ic(k,col)};
 if(typeof eqIcon==='function'){const _ei=eqIcon;eqIcon=function(k){const e=EQ[k];if(e&&e.custom&&!SQA.hasIcon(k))return eqIcon(e.base);return _ei(k)}}
 {const oi=SQA.origIcon;SQA.origIcon=(k,c)=>oi(EQ[k]&&EQ[k].custom?EQ[k].base:k,c)}
 // ---- descriptions show the numbers that are really in play ----
 const pct=x=>Math.round(x*100)+'%',D0={};
 function statLine(k){const e=EQ[k],t=kindOf(k),r=rule(k)||{},L=[];
  wearing(k,()=>{if(t==='melee')L.push('Damage '+(1+(TL.sword|0)+Math.floor(lvOf(0)/15)+meleeFlat())+' per hit');
   else if(t==='bow')L.push('Arrow damage '+arrowDmg(),'Range '+bowRange());
   else if(t==='wand'){L.push((e.el[0].toUpperCase()+e.el.slice(1))+' spells','Damage '+spellDmg(e.el),'Costs '+(r.mp!=null?r.mp:WSP0[e.el])+' mana')}
   if(t==='armour'||r.blk){const b=(t==='armour'?(ARM[e.slot]|0)*.05:0)+(r.blk||0)/100;if(b)L.push('Block '+(b>0?'+':'')+pct(b))}});
  if(r.fx)for(const x in FXN)if(r.fx[x])L.push(x==='hreg'?'Heals 1 heart every '+Math.round(600/r.fx[x])+' s':x==='hun'?'Hunger '+r.fx[x]+'% slower':FXN[x]+' '+(['spd','xp','mel','arc','mag','mreg','gold'].includes(x)?'+':'')+r.fx[x]+'%');
  const q=r.rq||defReq(k);if(q&&q.l)L.push('Needs '+SKN[q.s]+' '+q.l);return L.join(' · ')}
 function hookDesc(k){if(D0[k])return;const d=Object.getOwnPropertyDescriptor(IDESC,k)||{value:IDESC[k],writable:true};D0[k]=d;let plain=d.get?null:d.value;
  const own=()=>{if(NG[k])return(NG[k].d?NG[k].d+' ':'')+'Equip it from your Bag or the equipment screen.';if(!d.get)return window.SQSTRIPSTATS?SQSTRIPSTATS(plain||''):plain||'';let s=d.get.call(IDESC);try{s=window.SQSTRIPSTATS?SQSTRIPSTATS(s):s}catch(e){}return s};
  Object.defineProperty(IDESC,k,{configurable:true,enumerable:true,get(){if(!GR[k]&&!NG[k])return d.get?d.get.call(IDESC):plain;let s='';try{s=statLine(k)}catch(e){}const b=own();return(s?s+'. ':'')+b},
   set(v){if(d.set)d.set.call(IDESC,v);else plain=window.SQSTRIPSTATS?SQSTRIPSTATS(v):v}})}
 // ---- apply the library (plus the developer's unpublished new items, on their own device) ----
 let LIB={},DEV=null;
 function applyGear(lib){LIB=lib||{};
  const want={},src={...(LIB.newgear||{}),...(DEV||{})};for(const k of Object.keys(src).sort()){const d=ngClean(src[k],k);if(d)want[k]=d}
  for(const k of Object.keys(NG))if(!want[k]){unregNG(k);delete NG[k]}
  for(const k in want){NG[k]=want[k];regNG(k,want[k])}
  for(const k in GR)delete GR[k];const G=LIB.gear||{};
  for(const k in G){const r=clean(G[k],k);if(r){GR[k]=r;hookDesc(k)}}try{setCosts()}catch(e){}}
 SQA.onApply(applyGear);
 window.SQGEAR={SLOTS,FXN,FXMAX,gearKeys,kindOf,clean,ngClean,ngKey,base,defReq,wearing,statLine,fxSum,
  get rules(){return GR},get items(){return NG},get worn(){return{...CUS}},
  // the Dev Suite registers draft-only new items on the developer's device so they can be drawn and tested
  devItems(d){DEV=d&&Object.keys(d).length?d:null;applyGear(LIB)}}})();
