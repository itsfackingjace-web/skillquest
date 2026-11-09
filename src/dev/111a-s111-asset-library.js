// ---- 111. Asset library: sprites and stats the developer edits in the Dev Suite, published from the database ----
// Published edits live at assets/live in the database (anyone can read them; only the developer's account can write).
// At startup the game applies the copy this device last downloaded (so edits show from the first frame), then fetches
// the latest copy and keeps it for the next load. Anything not in the library is drawn and set by the game's own code.
// Format: {v, at, icons:{itemKey:{w,h,s,p,d}}, stats:{items:{k:{n,pl,d,v}}, ib:{k:{n,hp}}, wb:{k:{n,hp,dmg,g0,g1}}}}
//   sprite: w x h pixels drawn at s x scale; p = palette "#rrggbb,..." ; d = one char per pixel ('.' = clear,
//   otherwise an index into p using PXC).
var SQA=(()=>{
 const DBURL='https://skillquest-913e2-default-rtdb.firebaseio.com',LS='sq_assets_live',PXC='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-';
 const IB=window.SQIB||{},WB=window.SQWBT||{};
 const origIcon=iconURL;
 // the game's own values, captured before anything is applied, so edits can be undone and compared
 const ORIG={items:{},ib:{},wb:{}};
 const itemKeys=()=>[...new Set(INVK)].filter(k=>INAME[k]&&!/^xpb_/.test(k));
 const origItem=k=>ORIG.items[k]||(ORIG.items[k]={n:INAME[k],pl:SN[k],d:IDESC[k],v:SELLP[k]|0});
 for(const k of itemKeys())origItem(k);
 for(const k in IB)ORIG.ib[k]={n:IB[k].n,hp:IB[k].hp};
 for(const k in WB)ORIG.wb[k]={n:WB[k].n,hp:WB[k].hp,dmg:WB[k].dmg,g0:WB[k].gold[0],g1:WB[k].gold[1]};
 const TABLES={
  items:{name:'Items',fields:[['n','Name','text'],['pl','Plural','text'],['d','Description','long'],['v','Sell price','num']],keys:()=>itemKeys(),label:k=>origItem(k).n,orig:k=>origItem(k),
   set(k,o){INAME[k]=o.n;SN[k]=o.pl;IDESC[k]=o.d;SELLP[k]=o.v;SHORT[k]=String(o.n).toLowerCase();if(EQ[k]){EQ[k].n=o.n;EQ[k].v=o.v}}},
  ib:{name:'Island bosses',fields:[['n','Name','text'],['hp','HP','num']],keys:()=>Object.keys(IB),label:k=>ORIG.ib[k].n,orig:k=>ORIG.ib[k],set(k,o){IB[k].n=o.n;IB[k].hp=o.hp}},
  wb:{name:'World bosses',fields:[['n','Name','text'],['hp','HP','num'],['dmg','Damage per hit','num'],['g0','Gold (min)','num'],['g1','Gold (max)','num']],keys:()=>Object.keys(WB),label:k=>ORIG.wb[k].n,orig:k=>ORIG.wb[k],
   set(k,o){const T=WB[k];T.n=o.n;T.hp=o.hp;T.dmg=o.dmg;T.gold=[o.g0,Math.max(o.g0,o.g1)]}}};
 // a stat override only holds the fields that differ; fill the rest from the original, and keep types safe
 const merged=(t,k,o)=>{const base=TABLES[t].orig(k),r={...base};for(const[f,,ty]of TABLES[t].fields)if(o&&o[f]!=null){
   if(ty==='num'){const n=Number(o[f]);if(isFinite(n))r[f]=Math.max(0,Math.round(n))}else r[f]=String(o[f]).slice(0,ty==='long'?600:40)}return r};
 // ---- sprites ----
 const ICO={},cache={};let ver=0;
 function render(sp){const c=document.createElement('canvas');c.width=sp.w*sp.s;c.height=sp.h*sp.s;const x=c.getContext('2d'),P=String(sp.p||'').split(',');
  for(let i=0;i<sp.w*sp.h;i++){const ch=sp.d[i];if(!ch||ch==='.')continue;const col=P[PXC.indexOf(ch)];if(!col)continue;x.fillStyle=col;x.fillRect((i%sp.w)*sp.s,Math.floor(i/sp.w)*sp.s,sp.s,sp.s)}return c}
 const valid=sp=>sp&&sp.w>0&&sp.h>0&&sp.w<=160&&sp.h<=160&&sp.s>=1&&sp.s<=8&&typeof sp.d==='string'&&sp.d.length===sp.w*sp.h;
 iconURL=function(k,col){const sp=ICO[k];if(!sp)return origIcon(k,col);const key=k+'@'+ver;return cache[key]||(cache[key]=render(sp).toDataURL())};
 if(typeof eqIcon==='function'){const _ei=eqIcon;eqIcon=function(k){return ICO[k]?iconURL(k):_ei(k)}}
 // ---- apply a whole library (undoing whatever was applied before) ----
 let applied={stats:{}};
 function apply(lib){lib=lib||{};
  for(const t in applied.stats)for(const k in applied.stats[t])if(TABLES[t]&&TABLES[t].keys().includes(k))TABLES[t].set(k,TABLES[t].orig(k));
  for(const k in ICO)delete ICO[k];ver++;
  const icons=lib.icons||{};for(const k in icons)if(valid(icons[k]))ICO[k]=icons[k];
  const st=lib.stats||{};for(const t in st){if(!TABLES[t])continue;for(const k in st[t]){if(!TABLES[t].keys().includes(k))continue;try{TABLES[t].set(k,merged(t,k,st[t][k]))}catch(e){}}}
  applied={stats:st};
  try{if(pnOpen)rPn()}catch(e){}}
 let live=null,preview=null;
 try{live=JSON.parse(localStorage.getItem(LS)||'null')}catch(e){}
 if(live)try{apply(live)}catch(e){console.error(e)}
 // latest published copy (no sign-in needed); used now and kept for the next load
 async function refresh(){try{const r=await fetch(DBURL+'/assets/live.json',{cache:'no-store'});if(!r.ok)return;const L=await r.json();
   if(JSON.stringify(L)===JSON.stringify(live))return;live=L;try{if(L)localStorage.setItem(LS,JSON.stringify(L));else localStorage.removeItem(LS)}catch(e){}
   if(!preview)apply(live)}catch(e){}}
 setTimeout(refresh,400);
 return{PXC,TABLES,ORIG,origIcon,render,valid,merged,itemKeys,refresh,
  get live(){return live},
  // the Dev Suite can show unpublished edits in the developer's own game
  preview(lib){preview=lib||null;apply(preview||live)},get previewing(){return!!preview},
  setLive(L){live=L;try{if(L)localStorage.setItem(LS,JSON.stringify(L));else localStorage.removeItem(LS)}catch(e){}if(!preview)apply(live)}}})();
window.SQA=SQA;
