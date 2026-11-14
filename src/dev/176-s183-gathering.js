// ---- 183. New trees, rocks and fish from the Dev Suite (Dev Suite > Gathering) ----
// Library section gather = {nodes:{gn_<id>:{...}}, fish:{gf_<id>:{...}}}.
//   nodes  {n, rep 'tree'|'rock'|'ore' (what it replaces), lv, hp hits, tool tier, item, xp, col [4 hex] (trees) | ore hex
//          (rocks/veins), where [region keys, 'hollow' = Hollow Island], pct % of those trees/rocks/veins it replaces}
//          Each becomes a 083 tier kind g_<id> in window.SQTIER (+OHP/SKOF), so 083's tierHit gathers it (level, tool tier,
//          item, XP; trees also give 1 wood) and 032's OBJHD draws hdSprites()[kind] (recoloured here like 083 does).
//          Placement is a fixed hash per spot and kind, so every player has the same world: Hollow's obj/REM on every apply,
//          an island's items each time it loads (outermost loadRegion) and the island you stand on when the library changes.
//          Kinds that go away are turned back into what they replaced; their SQTIER entry stays until reload (harmless).
//   fish   {n, item (raw), lv, xp, where [regions] (empty = everywhere), p chance % per catch, ck cooked item, clv, cxp}
//          -> window.SQGFISH (093b's catch hook) and a COOKS entry (_g) when ck is set.
//   crops  {n, item (the crop: CROPS is keyed by the crop item, since harvesting adds inv[p.c]), seed, lv, gm watered minutes
//          to grow, y0..y1 harvest, xp, sh look (grain/root/round/bush/flower/tall), col [3 hex], buy (gold for 5 seeds at the
//          general store, 0 = not sold), ck/clv/cxp cooking} -> CROPS[item] (_g) + SEED2CROP[seed] + a GEN entry (_gc) + COOKS (_gc).
//          A removed crop keeps its CROPS entry (plots and saves still name it) but its seed stops planting. Ripe look made
//          by the wrapped hdCropS (stages 0-2 are the game's own sprouts); Props > c:<item>:<stage> looks still go on top.
// Items come from the game or the Content tab (it_); "Make its item" writes a Content item into the draft.
(()=>{if(!window.SQA||!window.SQTIER)return;const TIER=window.SQTIER;
 const REG=()=>['hollow',...Object.keys(WORLD_REGIONS).filter(k=>k!=='hollow')],regName=k=>k==='hollow'?'Hollow Island':(WORLD_REGIONS[k]&&WORLD_REGIONS[k].name)||k;
 const TOOLS={1:'Wooden',2:'Stone',3:'Iron',4:'Steel',6:'Mithril',7:'Adamant'};
 const num=(v,a,b,d)=>{v=Math.round(Number(v));return isFinite(v)?Math.max(a,Math.min(b,v)):d};
 const hex=v=>{v=String(v||'').trim().toLowerCase().replace(/^#?/,'#');return/^#[0-9a-f]{6}$/.test(v)?v:null};
 const txt=(v,n)=>String(v==null?'':v).replace(/[<>]/g,'').trim().slice(0,n);
 const kindOf=id=>'g_'+id.slice(3);
 function cleanNode(o){if(!o||typeof o!=='object')return null;const rep=['tree','rock','ore'].includes(o.rep)?o.rep:'tree';
  const col=Array.isArray(o.col)?o.col.map(hex):[];const r={n:txt(o.n,30)||'New tree',rep,lv:num(o.lv,1,99,1),hp:num(o.hp,1,40,6),tool:[1,2,3,4,6,7].includes(+o.tool)?+o.tool:1,
   item:txt(o.item,40),xp:num(o.xp,0,5000,30),where:(Array.isArray(o.where)?o.where:[]).filter(k=>k==='hollow'||WORLD_REGIONS[k]).slice(0,20),pct:num(o.pct,0,100,10)};
  if(rep==='tree')r.col=[0,1,2,3].map(i=>col[i]||['#3f8a2c','#5aa83a','#7cc650','#2a6420'][i]);else r.ore=hex(o.ore)||'#e05878';return r}
 function cleanFish(o){if(!o||typeof o!=='object')return null;return{n:txt(o.n,30)||'New fish',item:txt(o.item,40),lv:num(o.lv,1,99,1),xp:num(o.xp,0,5000,30),
  where:(Array.isArray(o.where)?o.where:[]).filter(k=>k==='hollow'||WORLD_REGIONS[k]).slice(0,20),p:num(o.p,1,100,15),ck:txt(o.ck,40),clv:num(o.clv,1,99,1),cxp:num(o.cxp,0,5000,40)}}
 const NATIVE=new Set(Object.keys(CROPS)),NSEED=new Set(Object.values(CROPS).map(c=>c.seed));
 const SHAPES=[['grain','Grain (like wheat)'],['root','Root (like carrots)'],['round','Round (like pumpkins)'],['bush','Berry bush'],['flower','Flowers'],['tall','Tall stalks (like corn)']];
 function cleanCrop(o){if(!o||typeof o!=='object')return null;const col=Array.isArray(o.col)?o.col.map(hex):[];const y0=num(o.y0,1,20,2);
  return{n:txt(o.n,30)||'New crop',item:txt(o.item,40),seed:txt(o.seed,40),lv:num(o.lv,1,99,1),gm:num(o.gm,1,180,3),y0,y1:Math.max(y0,num(o.y1,1,20,3)),xp:num(o.xp,0,5000,40),
   sh:SHAPES.some(q=>q[0]===o.sh)?o.sh:'round',col:[0,1,2].map(i=>col[i]||['#d83838','#f87868','#8a1818'][i]),buy:num(o.buy,0,99999,10),ck:txt(o.ck,40),clv:num(o.clv,1,99,1),cxp:num(o.cxp,0,5000,40)}}
 const LF=['#1e5a2c','#2e7a34','#48a040','#70c058'];
 function cropRipe(r){const c=document.createElement('canvas');c.width=16;c.height=24;const x=c.getContext('2d'),F=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b+8,w,h)},[A,B,D]=r.col;
  if(r.sh==='grain'){for(let k=0;k<7;k++){const X=2+k*2,top=5-((k*5)%3);F(X,top+3,1,12-top,D);F(X,top,1,3,A);F(X-(k%2),top+1,1,2,B)}}
  else if(r.sh==='root'){for(const X of[4,11]){F(X-2,7,4,4,A);F(X-2,7,4,1,B);F(X-1,11,2,1,D);F(X-1,3,1,4,LF[2]);F(X+1,2,1,5,LF[3]);F(X-2,4,1,2,LF[1])}}
  else if(r.sh==='bush'){F(2,3,12,11,LF[1]);F(3,2,10,13,LF[1]);F(4,3,6,4,LF[2]);F(5,3,3,2,LF[3]);for(const[a,b]of[[4,6],[9,4],[11,9],[6,10],[8,7],[3,11]]){F(a,b,2,2,A);F(a,b,1,1,B);F(a+1,b+1,1,1,D)}}
  else if(r.sh==='flower'){for(const[a,b]of[[3,4],[8,2],[12,6],[6,8]]){F(a+1,b+3,1,13-b-3+2,LF[1]);F(a+2,b+6,2,1,LF[2]);F(a,b,3,3,A);F(a+1,b-1,1,1,A);F(a+1,b+3,1,0,A);F(a-1,b+1,1,1,A);F(a+3,b+1,1,1,A);F(a+1,b+1,1,1,B);F(a,b,1,1,D)}}
  else if(r.sh==='tall'){for(const X of[3,8,12]){F(X,-6,1,21,LF[1]);F(X+1,-5,1,20,LF[2]);F(X-2,0,2,1,LF[3]);F(X+2,4,2,1,LF[3]);F(X+1,1,2,6,A);F(X+1,1,1,3,B);F(X+2,6,1,1,D);F(X+1,-1,1,2,'#e8d888')}}
  else{F(2,4,12,10,A);F(3,3,10,12,A);F(3,4,4,2,B);for(const X of[5,8,11])F(X,4,1,10,D);F(7,0,2,4,'#5a8a28');F(9,1,3,2,LF[2])}
  // outline (the game's crops have a dark 1px edge)
  const im=x.getImageData(0,0,16,24),d=im.data,o=new Uint8ClampedArray(d),op=i=>d[i*4+3]===255;for(let y=0;y<24;y++)for(let X=0;X<16;X++){const i=y*16+X;if(d[i*4+3])continue;
   if((X>0&&op(i-1))||(X<15&&op(i+1))||(y>0&&op(i-16))||(y<23&&op(i+16))){o[i*4]=42;o[i*4+1]=26;o[i*4+2]=8;o[i*4+3]=255}}im.data.set(o);x.putImageData(im,0,0);return{c,ox:0,oy:-8,ww:16,hh:24}}
 const CROPSP=new Map();const cropSp=r=>{const k=JSON.stringify([r.sh,r.col]);let v=CROPSP.get(k);if(!v){v=cropRipe(r);CROPSP.set(k,v)}return v};
 {const _hc=hdCropS;hdCropS=function(c,st,rp){const C=CROPS[c];if(C&&C._g&&rp)return cropSp(C);return _hc.apply(this,arguments)}}
 // ---------- hashing (same on every device) ----------
 const hs=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
 const roll=(a,b,k)=>{const v=Math.sin(a*12.9898+b*78.233+(hs(k)%9973)*.731)*43758.5453;return v-Math.floor(v)};
 // ---------- active kinds ----------
 let ACT={};// kind -> clean node record
 function choose(rep,a,b,where){// which active kind (if any) a spot of type rep becomes
  for(const k of Object.keys(ACT).sort()){const N0=ACT[k];if(N0.rep!==rep||!N0.where.includes(where)||!INAME[N0.item])continue;if(roll(a,b,k)<N0.pct/100)return k}return null}
 const repOf=t=>TIER[t]&&TIER[t]._g?TIER[t].rep:null;
 function placeHollow(){const W=N;for(let i=0;i<obj.length;i++){const o=obj[i];if(!o)continue;let base=o.t;const r=repOf(base);if(r)base=r;else if(base!=='tree'&&base!=='rock'&&base!=='ore')continue;
   const want=choose(base,i%W,(i/W)|0,'hollow')||base;if(want!==o.t)obj[i]={t:want,hp:OHP[want]||3}}
  try{for(const e of REM){let base=e.t;const r=repOf(base);if(r)base=r;else if(base!=='tree'&&base!=='rock'&&base!=='ore')continue;e.t=choose(base,e.i%W,(e.i/W)|0,'hollow')||base}}catch(e){}}
 function placeRegion(R){if(!R||!R.region||!R.items)return;const id=R.region,seed=hs(id)%1000;
  const fix=it=>{if(!it||it.t!=='_obj'||!it.o)return;let base=it.o.t;const r=repOf(base);if(r)base=r;else if(base!=='tree'&&base!=='rock'&&base!=='ore')return;
   const want=choose(base,it.x+seed,it.y,id)||base;if(want!==it.o.t){it.o.t=want;it.o.hp=OHP[want]||3;delete it.o.v}};
  for(const it of R.items)fix(it);for(const gq of R.gone||[])fix(gq.it)}
 // ---------- sprites (as 083 recolours its tiers) ----------
 const hx=s=>[parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)];
 const recolor=(src,fn)=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');x.drawImage(src,0,0);const im=x.getImageData(0,0,c.width,c.height),d=im.data;
  for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const o=fn(d[i],d[i+1],d[i+2]);if(o){d[i]=o[0];d[i+1]=o[1];d[i+2]=o[2]}}x.putImageData(im,0,0);return c};
 function spritesFor(S,T){if(T.base==='tree'){const pal=T.col.map(hx);return S.tree.map(sp=>recolor(sp,(r,g,b)=>{if(!(g>r+12&&g>=b))return null;const l=(r+g+b)/3;return l<60?pal[3]:l<100?pal[0]:l<150?pal[1]:pal[2]}))}
  const oc=hx(T.ore);return S.ore.map(sp=>recolor(sp,(r,g,b)=>r>170&&g>90&&g<190&&b<130?oc:null))}
 const sig=T=>JSON.stringify([T.base,T.col,T.ore]);
 function ensureSprites(S){if(!S||!S.tree||!S.ore)return;for(const k in TIER){const T=TIER[k];if(!T._g)continue;if(S['_sg'+k]!==sig(T)){S[k]=spritesFor(S,T);S['_sg'+k]=sig(T)}}}
 {const _hs=hdSprites;hdSprites=function(){const S=_hs.apply(this,arguments);try{ensureSprites(S)}catch(e){}return S}}
 // ---------- apply the library ----------
 function apply(lib){const G=(lib&&lib.gather)||{},nodes=G.nodes||{},fish=G.fish||{};ACT={};
  for(const id in nodes){if(!/^gn_[a-z0-9_]{1,30}$/.test(id))continue;const r=cleanNode(nodes[id]);if(!r)continue;const k=kindOf(id),sk=r.rep==='tree'?1:2;
   TIER[k]={_g:1,rep:r.rep,base:r.rep==='tree'?'tree':'ore',sk,lv:r.lv,hp:r.hp,item:r.item,xp:r.xp,...(sk===1?{axe:r.tool,col:r.col}:{pick:r.tool,ore:r.ore})};OHP[k]=r.hp;SKOF[k]=sk;ACT[k]=r}
  try{if(typeof HDSP!=='undefined'&&HDSP)ensureSprites(HDSP)}catch(e){}
  try{placeHollow()}catch(e){console.warn('gather hollow',e)}
  try{const R=SCENE&&SCENE.room;if(R&&R.region)placeRegion(R)}catch(e){console.warn('gather region',e)}
  try{if(typeof HDCH!=='undefined'&&HDCH&&HDCH.clear)HDCH.clear()}catch(e){}
  // fish
  const F=window.SQGFISH;F.length=0;for(let i=COOKS.length-1;i>=0;i--)if(COOKS[i]._g)COOKS.splice(i,1);
  for(const id in fish){if(!/^gf_[a-z0-9_]{1,30}$/.test(id))continue;const r=cleanFish(fish[id]);if(!r||!INAME[r.item])continue;
   F.push({k:r.item,n:r.n,lv:r.lv,xp:r.xp,where:r.where.length?r.where:null,p:r.p/100});
   if(r.ck&&INAME[r.ck]&&!COOKS.some(c=>c.raw===r.item))COOKS.push({raw:r.item,ck:r.ck,n:r.n.toLowerCase(),lv:r.clv,xp:r.cxp,_g:1})}
  F.sort((a,b)=>b.lv-a.lv);
  // crops
  const crops=G.crops||{};for(const sd in SEED2CROP){const c=SEED2CROP[sd];if(CROPS[c]&&CROPS[c]._g)delete SEED2CROP[sd]}
  for(const c in CROPS)if(CROPS[c]._g)CROPS[c]._off=1;for(let i=GEN.length-1;i>=0;i--)if(GEN[i]._gc)GEN.splice(i,1);for(let i=COOKS.length-1;i>=0;i--)if(COOKS[i]._gc)COOKS.splice(i,1);
  for(const id in crops){if(!/^gc_[a-z0-9_]{1,30}$/.test(id))continue;const r=cleanCrop(crops[id]);if(!r||!INAME[r.item]||!INAME[r.seed]||r.item===r.seed||NATIVE.has(r.item)||NSEED.has(r.seed)||NATIVE.has(r.seed)||SEED2CROP[r.seed])continue;
   if(CROPS[r.item]&&!CROPS[r.item]._g)continue;CROPS[r.item]={n:r.n,seed:r.seed,lv:r.lv,st:r.gm*20,max:3,yield:[r.y0,r.y1],xp:r.xp,_g:1,sh:r.sh,col:r.col,id};SEED2CROP[r.seed]=r.item;
   if(r.buy>0){const sd=r.seed,lv=r.lv;GEN.push({n:'5 '+(INAME[sd]||sd).toLowerCase(),c:r.buy,f:()=>{inv[sd]=(inv[sd]|0)+5},hide:()=>lvOf(11)<lv,_gc:1})}
   if(r.ck&&INAME[r.ck]&&!COOKS.some(c=>c.raw===r.item))COOKS.push({raw:r.item,ck:r.ck,n:r.n.toLowerCase(),lv:r.clv,xp:r.cxp,_gc:1})}
  try{if(window.SQPROPS)SQPROPS.recat()}catch(e){}}
 {const _lr=loadRegion;loadRegion=function(){const out=_lr.apply(this,arguments);try{const R=SCENE&&SCENE.room;if(R&&R.region)placeRegion(R)}catch(e){}return out}}
 SQA.onApply(lib=>{try{apply(lib)}catch(e){console.warn('gather',e)}});
 window.SQGATHER={cleanNode,cleanFish,cleanCrop,cropSp,SHAPES,kindOf,spritesFor,REG,regName,TOOLS,get active(){return ACT}};
 // ======================= Dev Suite > Gathering =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,dset,toast,fail,arm}=API;
 const T={sel:null,kind:null,w:null};const SECK={node:'nodes',fish:'fish',crop:'crops'},CLEAN={node:cleanNode,fish:cleanFish,crop:cleanCrop};
 const sec=k=>{S.draft.gather=S.draft.gather||{};return S.draft.gather[k]=S.draft.gather[k]||{}};
 const allItems=()=>{const o=new Map();for(const k of INVK)if(INAME[k]&&!o.has(k))o.set(k,INAME[k]);const ci=(S.draft.content||{}).items||{};for(const k in ci)if(!o.has(k))o.set(k,(ci[k].n||k)+' (draft)');return[...o].sort((a,b)=>a[1].localeCompare(b[1]))};
 const itemSel=(f,v,none)=>'<select data-gw="'+f+'" style="max-width:240px">'+(none?'<option value="">'+none+'</option>':'')+allItems().map(([k,n])=>'<option value="'+E(k)+'"'+(k===v?' selected':'')+'>'+E(n)+'</option>').join('')+'</select>';
 const whereBox=w=>'<div class="dv-row" style="flex-wrap:wrap;gap:4px 12px">'+REG().map(k=>'<label class="dv-mut"><input type="checkbox" data-gwhere="'+k+'"'+(w.includes(k)?' checked':'')+'> '+E(regName(k))+'</label>').join('')+'</div>';
 const fld=(l,h)=>'<label class="dv-gf"><span>'+l+'</span>'+h+'</label>';
 function preview(){const c=document.querySelector('#dvs #gtprev');if(!c||!T.w)return;
  if(T.kind==='crop'){const r=cleanCrop(T.w),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,c.width,c.height);const L=[0,1,2].map(s=>hdCropS('wheat',s,false)).concat([cropSp(r)]);
   L.forEach((sp,i)=>{const X=10+i*62,Y=c.height-6-24*3;x.fillStyle='#6a4428';x.fillRect(X,Y+8*3,48,48);x.drawImage(sp.c,X,Y,48,72)});return}
  if(T.kind!=='node')return;const S2=hdSprites();if(!S2)return;const r=cleanNode(T.w),TT={base:r.rep==='tree'?'tree':'ore',col:r.col,ore:r.ore};
  const L=spritesFor(S2,TT),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,c.width,c.height);let px=6;for(const sp of L.slice(0,4)){const z=Math.max(.5,Math.min(2,(c.height-10)/sp.height));x.drawImage(sp,px,c.height-sp.height*z-5,sp.width*z,sp.height*z);px+=sp.width*z+10}}
 function render(){const G=S.draft.gather||{},nd=G.nodes||{},fs=G.fish||{},cr=G.crops||{};
  let h='<div class="dv-card"><b>Gathering</b><p class="dv-mut">New trees, rocks and ore veins (they replace a share of the existing ones where you choose, the same spots for every player) and new fish. What they give is an item from the game or one you made in the Content tab; "Make its item" makes one for you. Draw its icon in Sprites.</p>'+
   '<div class="dv-row" style="flex-wrap:wrap;gap:6px"><button class="dv-b dv-pri" data-gx="newnode">+ New tree / rock</button><button class="dv-b dv-pri" data-gx="newfish">+ New fish</button><button class="dv-b dv-pri" data-gx="newcrop">+ New crop</button></div>';
  const li=(sec,id,o,lab)=>'<button class="dv-b'+(T.sel===id?' dv-on dv-tl':'')+'" data-gx="open:'+sec+':'+id+'">'+lab+' '+E(o.n||id)+'</button>';
  h+='<div class="dv-row" style="flex-wrap:wrap;gap:6px;margin-top:8px">'+Object.keys(nd).map(id=>li('nodes',id,nd[id],nd[id].rep==='tree'?'🌳':'🪨')).join('')+Object.keys(fs).map(id=>li('fish',id,fs[id],'🐟')).join('')+Object.keys(cr).map(id=>li('crops',id,cr[id],'🌱')).join('')+'</div></div>';
  if(!T.w)return h;const w=T.w;
  if(T.kind==='node'){const r=cleanNode(w),tree=r.rep==='tree',sk=tree?'Woodcutting':'Mining';
   h+='<div class="dv-card dv-rules" style="margin-top:10px"><b>'+E(r.n)+'</b> <small class="dv-mut">'+T.sel+' · '+kindOf(T.sel)+'</small>'+
    fld('Name','<input type="text" maxlength="30" data-gw="n" value="'+E(w.n||'')+'">')+
    fld('Replaces','<select data-gw="rep">'+[['tree','Trees (Woodcutting)'],['rock','Plain rocks (Mining)'],['ore','Iron ore veins (Mining)']].map(([k,l])=>'<option value="'+k+'"'+(r.rep===k?' selected':'')+'>'+l+'</option>').join('')+'</select>')+
    fld(sk+' level','<input type="number" min="1" max="99" data-gw="lv" value="'+r.lv+'">')+
    fld('Needs at least','<select data-gw="tool">'+Object.entries(TOOLS).map(([t,n])=>'<option value="'+t+'"'+(+t===r.tool?' selected':'')+'>'+n+(tree?' axe':' pickaxe')+'</option>').join('')+'</select>')+
    fld('Toughness','<input type="number" min="1" max="40" data-gw="hp" value="'+r.hp+'" title="Hit points: each hit takes 1 + the tool\'s tier">')+
    fld('Gives','<span>'+itemSel('item',r.item,'— pick an item —')+' <button class="dv-b" data-gx="mkitem">Make its item</button></span>')+(tree?'<p class="dv-mut" style="margin:0">Trees also give 1 wood.</p>':'')+
    fld('XP','<input type="number" min="0" max="5000" data-gw="xp" value="'+r.xp+'">')+
    (tree?fld('Leaf colours','<span>'+r.col.map((c,i)=>'<input type="color" data-gwc="'+i+'" value="'+c+'"> <input data-gwh="'+i+'" value="'+c+'" maxlength="7" style="width:72px;font-family:monospace">').join(' ')+'</span>')
     :fld('Ore colour','<span><input type="color" data-gwc="o" value="'+r.ore+'"> <input data-gwh="o" value="'+r.ore+'" maxlength="7" style="width:72px;font-family:monospace"></span>'))+
    '<canvas id="gtprev" width="260" height="110" style="background:#3a7a3a;border-radius:6px;image-rendering:pixelated"></canvas>'+
    fld('Where','')+whereBox(r.where)+
    fld('How common','<span><input type="number" min="0" max="100" data-gw="pct" value="'+r.pct+'" style="width:70px"> % of the '+(r.rep==='tree'?'trees':r.rep==='rock'?'plain rocks':'iron ore veins')+' there</span>')}
  else if(T.kind==='crop'){const r=cleanCrop(w),dup=r.item&&CROPS[r.item]&&!CROPS[r.item]._g?'That item is already one of the game\'s own crops.':r.seed&&(NSEED.has(r.seed)||NATIVE.has(r.seed))?'That seed already grows one of the game\'s own crops.':r.item&&r.item===r.seed?'The seed and the crop must be different items.':'';
   h+='<div class="dv-card dv-rules" style="margin-top:10px"><b>'+E(r.n)+'</b> <small class="dv-mut">'+T.sel+'</small>'+
    fld('Name','<input type="text" maxlength="30" data-gw="n" value="'+E(w.n||'')+'">')+
    fld('Crop (harvest)','<span>'+itemSel('item',r.item,'— pick an item —')+' <button class="dv-b" data-gx="mkcrop">Make seed + crop items</button></span>')+
    fld('Seed','<span>'+itemSel('seed',r.seed,'— pick an item —')+'</span>')+
    fld('Farming level','<input type="number" min="1" max="99" data-gw="lv" value="'+r.lv+'">')+
    fld('Grows in','<span><input type="number" min="1" max="180" data-gw="gm" value="'+r.gm+'" style="width:70px"> minutes of watered time (wheat 2, carrots 3, pumpkins 4.5)</span>')+
    fld('Harvest','<span><input type="number" min="1" max="20" data-gw="y0" value="'+r.y0+'" style="width:60px"> to <input type="number" min="1" max="20" data-gw="y1" value="'+r.y1+'" style="width:60px"> per plant (more often the higher Farming is)</span>')+
    fld('XP per harvest','<input type="number" min="0" max="5000" data-gw="xp" value="'+r.xp+'">')+
    fld('Seeds in the general store','<span><input type="number" min="0" max="99999" data-gw="buy" value="'+r.buy+'" style="width:80px"> gold for 5 (0 = not sold; harvests also give seeds back)</span>')+
    fld('Ripe look','<select data-gw="sh">'+SHAPES.map(([k,l])=>'<option value="'+k+'"'+(r.sh===k?' selected':'')+'>'+l+'</option>').join('')+'</select>')+
    fld('Colours','<span>'+['Main','Light','Dark'].map((l,i)=>l+' <input type="color" data-gwc="'+i+'" value="'+r.col[i]+'"> <input data-gwh="'+i+'" value="'+r.col[i]+'" maxlength="7" style="width:72px;font-family:monospace">').join(' ')+'</span>')+
    '<canvas id="gtprev" width="260" height="90" style="background:#3a7a3a;border-radius:6px;image-rendering:pixelated"></canvas><p class="dv-mut" style="margin:0">Planted, sprouting, growing and ripe. To draw each stage yourself, use Props (Farming: '+E(r.n)+') once it\'s saved.</p>'+
    fld('Cooks into','<span>'+itemSel('ck',r.ck,'— not cookable —')+'</span>')+
    (r.ck?fld('Cooking level','<input type="number" min="1" max="99" data-gw="clv" value="'+r.clv+'">')+fld('Cooking XP','<input type="number" min="0" max="5000" data-gw="cxp" value="'+r.cxp+'">'):'')+
    (dup?'<p style="color:#e88">'+dup+'</p>':'')}
  else{const r=cleanFish(w);
   h+='<div class="dv-card dv-rules" style="margin-top:10px"><b>'+E(r.n)+'</b> <small class="dv-mut">'+T.sel+'</small>'+
    fld('Name','<input type="text" maxlength="30" data-gw="n" value="'+E(w.n||'')+'">')+
    fld('Catch gives','<span>'+itemSel('item',r.item,'— pick an item —')+' <button class="dv-b" data-gx="mkfish">Make raw + cooked items</button></span>')+
    fld('Fishing level','<input type="number" min="1" max="99" data-gw="lv" value="'+r.lv+'">')+fld('XP','<input type="number" min="0" max="5000" data-gw="xp" value="'+r.xp+'">')+
    fld('Bites','<span><input type="number" min="1" max="100" data-gw="p" value="'+r.p+'" style="width:70px"> % of catches (when your level is high enough)</span>')+
    fld('Cooks into','<span>'+itemSel('ck',r.ck,'— not cookable —')+'</span>')+
    (r.ck?fld('Cooking level','<input type="number" min="1" max="99" data-gw="clv" value="'+r.clv+'">')+fld('Cooking XP','<input type="number" min="0" max="5000" data-gw="cxp" value="'+r.cxp+'">'):'')+
    fld('Where','')+'<p class="dv-mut" style="margin:0">None ticked = every water.</p>'+whereBox(r.where)}
  const has=k=>!!(INAME[k]||((S.draft.content||{}).items||{})[k]),missing=!has(CLEAN[T.kind](w).item)||(T.kind==='crop'&&!has(CLEAN.crop(w).seed));
  h+=(missing?'<p style="color:#e88">Pick '+(T.kind==='crop'?'its crop and seed items':'what it gives')+' (or make them) before saving: without them it does nothing.</p>':'')+
   '<div class="dv-row" style="gap:6px"><button class="dv-b dv-pri" data-gx="save">Save to draft</button><button class="dv-b dv-bad" data-gx="del">Delete</button><button class="dv-b" data-gx="close">Close</button></div></div>';
  return h}
 function set(f,v){if(!T.w)return;T.w[f]=v;T.dirty=true}
 async function save(){const k=SECK[T.kind],r=CLEAN[T.kind](T.w);sec(k)[T.sel]=r;
  try{await dset('draft/gather/'+k+'/'+T.sel,r);T.dirty=false;toast('Saved to draft. Publish it from the Publish tab.')}catch(e){fail(e)}try{if(SQA.previewing)SQA.preview(S.draft)}catch(e){}API.draw()}
 // an item with the same name already (the game's or the draft's)? use it instead of making a second one (191)
 const sameName=n=>{const t=String(n).trim().toLowerCase(),ci=((S.draft.content||{}).items)||{};for(const k in ci)if(String(ci[k].n||'').trim().toLowerCase()===t)return k;for(const k of INVK)if(String(INAME[k]||'').trim().toLowerCase()===t&&!/^pet_|^eq_/.test(k))return k;return null};
 async function mkItem(key,o){const same=sameName(o.n);if(same){toast('Using the item +o.n+ you already have ('+same+').');return same}const ci=(S.draft.content=S.draft.content||{}).items=(S.draft.content.items||{});if(ci[key]){toast('That item already exists in the Content tab.');return key}
  ci[key]=o;try{await dset('draft/content/items/'+key,o)}catch(e){fail(e)}return key}
 const idOf=n=>String(n||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,24)||'new';
 document.addEventListener('click',async e=>{if(S.tab!=='gather')return;const t=e.target.closest('[data-gx]');if(!t)return;e.preventDefault();const a=t.dataset.gx;
  if(a==='newnode'||a==='newfish'||a==='newcrop'){const kd=a.slice(3),pre={node:'gn_',fish:'gf_',crop:'gc_'}[kd],base={node:'tree',fish:'fish',crop:'crop'}[kd];let id=pre+base,i=2;const s=sec(SECK[kd]);while(s[id])id=pre+base+(i++);
   T.sel=id;T.kind=kd;T.w=kd==='node'?cleanNode({n:'New tree',where:['hollow']}):kd==='fish'?cleanFish({n:'New fish'}):cleanCrop({n:'New crop'});T.dirty=true;API.draw();return}
  if(a.startsWith('open:')){const[,s,id]=a.split(':');T.sel=id;T.kind=s==='nodes'?'node':s==='crops'?'crop':'fish';T.w=JSON.parse(JSON.stringify(sec(s)[id]));T.dirty=false;API.draw();return}
  if(a==='close'){T.sel=T.w=null;API.draw();return}
  if(a==='save'){await save();return}
  if(a==='del')return arm('gdel',async()=>{const k=SECK[T.kind];delete sec(k)[T.sel];try{await dset('draft/gather/'+k+'/'+T.sel,null);toast('Deleted from your draft.')}catch(e2){fail(e2)}T.sel=T.w=null;try{if(SQA.previewing)SQA.preview(S.draft)}catch(x){}API.draw()});
  if(a==='mkitem'){const r=cleanNode(T.w),tree=r.rep==='tree',nm=tree?r.n.replace(/ tree$/i,'')+' logs':r.n.replace(/ (rock|vein)s?$/i,'')+' ore';
   const key='it_'+idOf(nm);await mkItem(key,{n:nm,pl:nm,d:tree?'Logs from a '+r.n.toLowerCase()+'.':'Ore from a '+r.n.toLowerCase()+'.',v:Math.max(2,Math.round(r.lv*1.2)),t:'mat'});T.w.item=key;T.dirty=true;toast('Made "'+nm+'" in the Content tab. Draw its icon in Sprites.');API.draw();return}
  if(a==='mkcrop'){const r=cleanCrop(T.w),b=idOf(r.n);const sd=await mkItem('it_'+b+'_seeds',{n:r.n+' seeds',pl:r.n+' seeds',d:'Plant on tilled soil'+(r.lv>1?' (Farming '+r.lv+')':'')+', then water. Grows into '+r.n.toLowerCase()+'.',v:Math.max(1,Math.round(r.buy/5)||1),t:'mat'});
   const it=await mkItem('it_'+b,{n:r.n,pl:r.n,d:'Freshly harvested '+r.n.toLowerCase()+'.',v:Math.max(2,Math.round(r.lv*1.2)+2),t:'mat'});T.w.item=it;T.w.seed=sd;T.dirty=true;toast('Made the seed and crop items in the Content tab. Draw their icons in Sprites.');API.draw();return}
  if(a==='mkfish'){const r=cleanFish(T.w),b=idOf(r.n);const raw=await mkItem('it_raw_'+b,{n:'Raw '+r.n.toLowerCase(),pl:'Raw '+r.n.toLowerCase(),d:'Cook it at a campfire.',v:Math.max(2,Math.round(r.lv*.8)),t:'mat'});
   const ck=await mkItem('it_cooked_'+b,{n:'Cooked '+r.n.toLowerCase(),pl:'Cooked '+r.n.toLowerCase(),d:'A tasty fish.',v:Math.max(4,Math.round(r.lv*1.6)),t:'food',heal:Math.min(6,1+Math.floor(r.lv/15)),hun:Math.min(100,30+r.lv)});
   T.w.item=raw;T.w.ck=ck;T.dirty=true;toast('Made the raw and cooked items in the Content tab. Draw their icons in Sprites.');API.draw();return}},true);
 document.addEventListener('change',e=>{if(S.tab!=='gather'||!T.w)return;const t=e.target;
  if(t.dataset.gw){const f=t.dataset.gw;set(f,t.type==='number'?+t.value:t.value);API.draw();return}
  if(t.dataset.gwhere){const k=t.dataset.gwhere,w=new Set(T.w.where||[]);if(t.checked)w.add(k);else w.delete(k);set('where',[...w]);return}
  if(t.dataset.gwc!=null||t.dataset.gwh!=null){const i=t.dataset.gwc!=null?t.dataset.gwc:t.dataset.gwh,v=hex(t.value);if(!v){toast('That isn\'t a hex colour (try #c89858).');API.draw();return}
   if(i==='o')set('ore',v);else{const c=(CLEAN[T.kind](T.w).col||[]).slice();c[+i]=v;set('col',c)}API.draw()}},true);
 const changes=(L,D)=>{const out=[];for(const k of['nodes','fish','crops']){const l=((L||{}).gather||{})[k]||{},d=((D||{}).gather||{})[k]||{};for(const id of new Set([...Object.keys(l),...Object.keys(d)]))if(JSON.stringify(l[id])!==JSON.stringify(d[id]))out.push({kind:'ext',html:(k==='fish'?'🐟 ':k==='crops'?'🌱 ':'🌳 ')+E((d[id]||l[id]).n||id)+(d[id]?(l[id]?' (changed)':' (new)'):' (removed)')})}return out};
 SQSUITE.addTab('gather','Gathering',{render,changes,after(){preview()},dirty:()=>!!(T.w&&T.dirty),leave(){T.sel=T.w=null}})})();
