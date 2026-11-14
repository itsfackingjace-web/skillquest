// ---- 181. More of the game's own data editable in Dev Suite > Stats ----
// Adds tables to SQA.TABLES (111a applies library stats.<table>.<key> over the originals, and puts the originals back when
// an override goes away). Runs before 162 (Content) so the snapshots below hold only the game's own entries, never the
// Content tab's additions (those carry _cu / sit in 162's own lists).
//   food    Food & potions: heal (hearts) and hun (food 0-100) of every FOODS entry (Content's it_ items edit there)
//   shop    Shop stock of Hollow's general store (GEN), Briarwood (SHOPBW) and Ashfall (SHOPAF): price c, amount m
//           (Briarwood/Ashfall only; the general store's packs are fixed), off = not sold
//   recipe  Every built-in recipe: SM (smithing/smelting), GOODS (crafting), BREC (building + furniture), FREC (fletching),
//           REC (tools), COOKS (cooking): mats "Wood 4, Stone 2" (item names or keys), lv (level needed), off = can't be
//           made. XP stays in the Balance tab. Turning a recipe off takes the entry out of its list (stable object refs; it
//           goes back in its original place when turned on again); Smithing/Cooking unlock lists (039) are rebuilt.
(()=>{if(!window.SQA||!SQA.TABLES)return;const A=SQA,TB=A.TABLES;
 const nm=k=>INAME[k]||k;
 // ---------- food ----------
 const FREF={},FORIG={};for(const f of FOODS){if(!f||!f.k||/^it_/.test(f.k)||FREF[f.k])continue;FREF[f.k]=f;FORIG[f.k]={n:nm(f.k),heal:f.heal|0,hun:f.hun|0,buff:'',bs:120}}
 const BUFFS=()=>[['','None'],...(window.SQBUFFK||[])];// meal buffs (184): eating it starts the buff
 TB.food={name:'Food & potions',col:'Food',note:'How much each food heals (in hearts, 6 = full health) and fills you up (food 0-100). Potions heal when used from the bag.',
  fields:[['heal','Heals (hearts)','num'],['hun','Fills (food)','num'],['buff','Buff when eaten','sel',BUFFS],['bs','Buff lasts (s)','num']],keys:()=>Object.keys(FREF),orig:k=>FORIG[k],label:k=>FORIG[k].n,
  set(k,o){const f=FREF[k];if(!f)return;f.heal=Math.min(6,o.heal|0);f.hun=Math.min(100,o.hun|0);const FB=window.SQFOODBUFF=window.SQFOODBUFF||{};if(o.buff&&!f.pot)FB[k]={b:o.buff,s:Math.max(10,Math.min(1800,o.bs|0||120))};else if(!/^it_/.test(k))delete FB[k]}};
 // ---------- stable lists: entries can be taken out (off) and put back where they were ----------
 function lister(arr,refs){return{off(e){const i=arr.indexOf(e);if(i>=0)arr.splice(i,1)},
  on(e){if(arr.includes(e))return;const j=refs.indexOf(e);for(let q=j+1;q<refs.length;q++){const i=arr.indexOf(refs[q]);if(i>=0){arr.splice(i,0,e);return}}
   for(let q=j-1;q>=0;q--){const i=arr.indexOf(refs[q]);if(i>=0){arr.splice(i+1,0,e);return}}arr.unshift(e)}}}
 // ---------- shops ----------
 const SHOPS={gen:['Hollow general store',typeof GEN!=='undefined'?GEN:null],bw:['Briarwood shop',typeof SHOPBW!=='undefined'?SHOPBW:null],af:['Ashfall forge camp',typeof SHOPAF!=='undefined'?SHOPAF:null]};
 const SREF={},SORIG={},SLIST={};
 for(const id in SHOPS){const L=SHOPS[id][1];if(!L)continue;const refs=L.slice();SLIST[id]=lister(L,refs);refs.forEach((e,i)=>{const k=id+':'+i;SREF[k]={id,e};SORIG[k]={n:e.n,c:e.c|0,m:e.m|0||1,off:0}})}
 const relabel=(e,m)=>{if(!e.k||!/^\d+ /.test(e.n))return;e.n=m+e.n.replace(/^\d+/,'')};
 TB.shop={name:'Shop stock',col:'Sold',note:'What the game\'s own shops sell and for how much. Untick "Sold" to stop selling it. Hollow\'s general store sells fixed packs, so only its prices change. To add new stock or new shops, use the Content tab.',
  fields:[['c','Price (gold)','num'],['m','Amount','num'],['off','Not sold','bool']],keys:()=>Object.keys(SREF),orig:k=>SORIG[k],
  label:k=>SORIG[k].n,sub:k=>SHOPS[SREF[k].id][0],
  set(k,o){const R=SREF[k];if(!R)return;const e=R.e;e.c=o.c|0;if(R.id!=='gen'&&e.k){e.m=Math.max(1,o.m|0);relabel(e,e.m)}if(o.off)SLIST[R.id].off(e);else SLIST[R.id].on(e)}};
 // ---------- recipes ----------
 const RL={SM:['Smithing / smelting','lv'],GOODS:['Crafting','req'],BREC:['Building & furniture','req'],FREC:['Fletching','lv'],REC:['Tools','req'],COOKS:['Cooking','lv']};
 const RREF={},RORIG={},RLIST={};
 const matTxt=c=>Object.entries(c||{}).map(([k,n])=>nm(k)+' '+n).join(', ');
 function parseMats(t){const byName={};for(const k of INVK)byName[String(INAME[k]||k).toLowerCase()]=k;const out={};let bad=0;
  for(const part of String(t||'').split(/[,;\n]+/)){const s=part.trim();if(!s)continue;let m=/^(.*?)\s*[x×]?\s*(\d+)$/i.exec(s)||/^(\d+)\s*[x×]?\s*(.*)$/i.exec(s);if(!m){bad++;continue}
   let name=m[1],n=+m[2];if(/^\d+$/.test(m[1])){name=m[2];n=+m[1]}name=name.trim().toLowerCase();const k=INVK.includes(name)?name:byName[name];if(!k||!(n>0)){bad++;continue}out[k]=(out[k]|0)+Math.min(9999,n)}
  return{c:out,bad}}
 for(const L in RL){let arr;try{arr=eval(L)}catch(e){continue}if(!Array.isArray(arr))continue;const refs=arr.filter(r=>r&&!r._cu);RLIST[L]=lister(arr,refs);const seen={};
  for(const r of refs){let b=L+':'+(L==='COOKS'?r.raw:r.k)+(r.t?r.t:'');if(seen[b])b+='_'+(++seen[b]);else seen[b]=1;const lvF=RL[L][1];
   RREF[b]={L,r,lvF};RORIG[b]={n:L==='COOKS'?'Cook '+nm(r.raw):(r.n||r.name||nm(r.k)),mats:L==='COOKS'?'':matTxt(r.c),lv:r[lvF]|0,off:0,stove:r.st?1:0,c0:{...(r.c||{})}}}}
 let ulT=0;const rebuildUL=()=>{if(ulT)return;ulT=setTimeout(()=>{ulT=0;try{const o=UL39(SM,r=>r.lv,r=>(r.smelt?'Smelt ':'Forge ')+r.n.toLowerCase()+(r.def?' (wear at Defence '+r.def+')':''));for(const k in ulSmith)delete ulSmith[k];Object.assign(ulSmith,o)}catch(e){}
   try{const o=UL39(COOKS,c=>c.lv,ckName);for(const l in o)o[l]='Cook '+o[l];for(const k in ulCook)delete ulCook[k];Object.assign(ulCook,o)}catch(e){}try{if(pnOpen)rPn()}catch(e){}},0)};
 TB.recipe={name:'Recipes',col:'Recipe',note:'Every recipe already in the game. Materials: write them like <b>Wood 4, Stone 2</b> (item names or keys). Level = the skill level needed. Tick "Off" and it can\'t be made any more. "Stove only" (cooking recipes) means it can\'t be cooked on a campfire. Experience is in the Balance tab; new recipes go in the Content tab. Tip: the Recipes tab shows every recipe in one list.',
  fields:[['mats','Materials','long'],['lv','Level','num'],['off','Off','bool'],['stove','Stove only (cooking)','bool']],keys:()=>Object.keys(RREF),orig:k=>RORIG[k],label:k=>RORIG[k].n,sub:k=>RL[RREF[k].L][0]+' · '+k,
  set(k,o){const R=RREF[k];if(!R)return;const r=R.r,O=RORIG[k];r[R.lvF]=Math.max(1,o.lv|0);
   if(R.L!=='COOKS'){if(o.mats===O.mats)r.c={...O.c0};else{const p=parseMats(o.mats);r.c=Object.keys(p.c).length?p.c:{...O.c0}}}
   if(R.L==='COOKS'){if(o.stove)r.st=1;else delete r.st}
   if(o.off)RLIST[R.L].off(r);else RLIST[R.L].on(r);rebuildUL()}};
 // 111a applied the library before these tables existed: apply their part now (and on every change; 111a's own loop
 // also covers them from now on, and puts originals back when an override goes away)
 A.onApply(lib=>{const st=(lib&&lib.stats)||{};for(const t of['food','shop','recipe'])for(const k in st[t]||{}){if(!TB[t].keys().includes(k))continue;try{TB[t].set(k,A.merged(t,k,st[t][k]))}catch(e){}}});
 window.SQDATA={parseMats,matTxt,RREF,SREF,FREF}})();
