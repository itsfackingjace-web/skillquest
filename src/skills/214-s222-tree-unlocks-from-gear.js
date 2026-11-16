// ---- 222. Skill trees list every item that needs that skill, including gear made in the Dev Suite ----
// The trees' level lines were written by hand (036-039's `extra`, `ulSmith`/`ulCraft`/`ulCook` built once at load), so gear
// and recipes published later never showed up. 222 adds lines to the outermost `treeGains(sk,l)`:
//   wearing/using: every EQ item with a requirement (the published `gear.<k>.rq` rule, else 111a2's `defReq`, else `e.req`)
//     -> "Wear the X" / "Use the X" on that skill's tree at that level
//   making: SM (Smithing: Forge/Smelt), GOODS/REC/BREC (Crafting: Make), COOKS (Cooking: Cook) -> on their tree at their level
// A line is skipped when that level's own text already names the item, so nothing shows twice. Rebuilt on every library apply
// (SQA.onApply) and when the recipe lists change size.
(()=>{if(typeof treeGains!=='function'||typeof TREES==='undefined')return;
 let LIB={},AUTO=null,SIG='';
 const nm=k=>String((typeof INAME!=='undefined'&&INAME[k])||(EQ[k]&&EQ[k].n)||k);
 const lc=s=>String(s||'').toLowerCase();
 const SMI=10,CRI=6,CKI=4;
 const sig=()=>[Object.keys(EQ).length,Object.keys(window.SQTIER||{}).length,typeof SM!=='undefined'?SM.length:0,typeof GOODS!=='undefined'?GOODS.length:0,typeof COOKS!=='undefined'?COOKS.length:0,typeof REC!=='undefined'?REC.length:0,typeof BREC!=='undefined'?BREC.length:0].join(',');
 function reqOf(k){const e=EQ[k];if(!e)return null;const r=LIB&&LIB.gear&&LIB.gear[k];if(r&&r.rq&&typeof r.rq==='object')return r.rq.l>0?{s:r.rq.s|0,l:r.rq.l|0}:null;
  if(e.rq2&&e.rq2.l>0)return{s:e.rq2.s|0,l:e.rq2.l|0};
  if(e.tt)return{s:8,l:50};// 200's turtle armour checks Defence 50 itself
  try{const q=window.SQGEAR&&SQGEAR.defReq?SQGEAR.defReq(k):null;if(q&&q.l>0)return{s:q.s|0,l:q.l|0}}catch(e){}
  if(e.req&&e.req.l>0)return{s:e.req.s|0,l:e.req.l|0};return null}
 const WEAR=new Set(['helm','body','legs','neck','ring','cape']);
 function build(){const A={};const add=(s,l,txt,name)=>{if(!(l>=1&&l<=99)||!TREES[s])return;const L=((A[s]=A[s]||{})[l]=A[s][l]||[]);if(!L.some(x=>x.name===lc(name)))L.push({txt,name:lc(name)})};
  for(const k in EQ){const q=reqOf(k);if(!q)continue;const e=EQ[k],n=nm(k);add(q.s,q.l,(WEAR.has(e.slot)?'Wear the ':'Use the ')+n.toLowerCase(),n)}
  try{for(const r of SM||[]){const n=r.n||nm(r.k);add(SMI,Math.max(1,r.lv|0),(r.smelt?'Smelt ':'Forge ')+lc(n),n)}}catch(e){}
  try{for(const r of GOODS||[]){const n=r.n||nm(r.k);add(CRI,Math.max(1,r.req|0),'Make: '+lc(n),n)}}catch(e){}
  try{for(const r of REC||[]){const n=r.name||r.n||nm(r.k);add(CRI,Math.max(1,r.req|0),'Make: '+lc(n),n)}}catch(e){}
  try{for(const r of BREC||[]){const n=r.n||nm(r.k);add(CRI,Math.max(1,r.req|0),'Make: '+lc(n),n)}}catch(e){}
  try{for(const c of COOKS||[]){const n=(typeof ckName==='function'?ckName(c):null)||c.n||nm(c.out||c.k);add(CKI,Math.max(1,c.lv|0),'Cook '+lc(n),n)}}catch(e){}
  // gathering: tree and ore tiers (083's SQTIER, incl. Dev Suite gathering nodes), boulders (096), meteor strikes (215)
  try{const KN={oak:'oak',willow:'willow',maple:'maple',yew:'yew',gold:'gold ore',mith:'mithril ore',adam:'adamant ore'};
   const tool=(t,w)=>t>1&&TIER_N[t]?' (with '+(/^[aeiou]/i.test(TIER_N[t])?'an ':'a ')+TIER_N[t].toLowerCase()+' '+w+' or better)':'';
   for(const k in(window.SQTIER||{})){const T=SQTIER[k];if(!T||!(T.lv>1))continue;const nm=lc(T.n||KN[k]||(INAME[T.item]||k));
    if(T.sk===1||T.base==='tree')add(1,T.lv,'Chop '+nm+' trees'+tool(T.axe|0,'axe'),nm);else add(2,T.lv,'Mine '+nm+' veins'+tool(T.pick|0,'pickaxe'),nm)}
   for(const k in(window.SQBOUL||{})){const B=SQBOUL[k];if(B&&B.lv>1)add(2,B.lv,'Break '+B.n+'s',B.n)}
   if(window.SQMETEOR){const C=SQMETEOR.CFG;add(2,1,'Mine meteor cores when a meteor strikes (any pickaxe)','meteor core');add(2,C.vlv|0||70,'Mine meteorite veins in meteor craters (steel pickaxe or better)','meteorite veins')}}catch(e){}
  AUTO=A;SIG=sig()}
 const _tg=treeGains;treeGains=function(sk,l){const a=_tg.apply(this,arguments);try{if(!AUTO||SIG!==sig())build();const L=AUTO[sk]&&AUTO[sk][l];if(!L||!L.length)return a;
   const have=lc(a.join(' · '));const extra=L.filter(x=>{if(have.includes(x.name))return false;const w=x.name.split(' ')[0];return!(w&&(have.includes(w+' armor')||have.includes(w+' armour')))}).map(x=>x.txt);if(!extra.length)return a;
   // one line per kind of thing, after the level's own text
   return[...a,extra.join(' · ')]}catch(e){return a}};
 try{if(window.SQA&&SQA.onApply)SQA.onApply(L=>{LIB=L||{};AUTO=null})}catch(e){}
 window.SQTREEAUTO={build:()=>{build();return AUTO},get auto(){if(!AUTO)build();return AUTO}}})();
