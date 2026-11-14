// ---- 191. Dev Suite > Recipes: every recipe in one place ----
// One list of everything that can be made, wherever it's defined, and one editor that saves each change back where it lives,
// so nothing already published moves:
//   game     161b's Stats > Recipes rows (SQDATA.RREF; draft stats.recipe.<key> = {mats "key n, key n", lv, off, stove}) and
//            their XP in Balance (draft balance.act['<TABLE>:<key>'], 163's SQBAL.ACTS/OA for the ids and the game's numbers)
//   content  Content > Recipes (draft content.recipes.r_<id> = {sk, out, c:[{k,n}], lv, xp}); new recipes are made here too
//   gear     a new gear item's recipe (draft newgear.<k>.sm = {c:{k:n}, lv, st}; cleaned by SQGEAR.ngClean)
//   fish/crop Gathering's cooking line (draft gather.fish|crops.<id> = {ck, clv, cxp})
// The game's cooking recipes keep one raw food (007's format), so only their level, XP, "stove only" and "off" change here.
(()=>{if(!window.SQSUITE||!SQSUITE.addTab||!window.SQDATA||!window.SQA)return;const API=SQSUITE.api,{S,E,dset,toast,fail,arm}=API,A=SQA,TB=A.TABLES;
 const STN={bench:['🛠','Crafting bench',6],build:['🧱','Building',6],tools:['⛏','Tools',6],anvil:['⚒','Anvil',10],furnace:['🔥','Furnace',10],fire:['🍳','Campfire',4],stove:['🍲','Stove',4],fletch:['🏹','Fletching',-1]};
 const skOf=st=>st==='fletch'?SKN.indexOf('Archery'):STN[st][2];
 const ST={st:'all',q:'',sel:null,w:null,dirty:false};
 const D=()=>S.draft||{};
 const hasIco=k=>!!((D().icons||{})[k]||(A.hasIcon&&A.hasIcon(k)));
 const nm=k=>INAME[k]||(((D().content||{}).items||{})[k]||{}).n||k;
 const ico=(k,s)=>'<img src="'+(INAME[k]||((D().content||{}).items||{})[k]?iconURL(k):'')+'" title="'+E(nm(k))+' ('+E(k)+')" style="width:'+(s||22)+'px;height:'+(s||22)+'px;image-rendering:pixelated;vertical-align:middle">';
 // ---- item picker (same-named items show their id and icon state) ----
 function items(){const o=new Map();for(const k of INVK)if(INAME[k]&&!/^pet_/.test(k))o.set(k,INAME[k]);for(const k in EQ||{})if(INAME[k]&&!o.has(k))o.set(k,INAME[k]);const ci=(D().content||{}).items||{};for(const k in ci)if(!o.has(k))o.set(k,(ci[k].n||k)+' (draft)');
  const cnt={};for(const[,n]of o){const t=n.replace(/ \(draft\)$/,'').toLowerCase();cnt[t]=(cnt[t]||0)+1}
  return[...o].map(([k,n])=>[k,cnt[n.replace(/ \(draft\)$/,'').toLowerCase()]>1?n+' · '+k+(hasIco(k)?' · has icon':' · no icon'):n]).sort((a,b)=>a[1].localeCompare(b[1]))}
 const pick=(attr,v,none)=>{const L=items();return'<select '+attr+' style="max-width:260px">'+(none?'<option value="">'+none+'</option>':'')+L.map(([k,n])=>'<option value="'+E(k)+'"'+(k===v?' selected':'')+'>'+E(n)+'</option>').join('')+'</select>'};
 // ---- the catalogue ----
 const RL={SM:r=>r.smelt?'furnace':'anvil',GOODS:()=>'bench',BREC:()=>'build',FREC:()=>'fletch',REC:()=>'tools',COOKS:r=>r.st?'stove':'fire'};
 const outOf=(L,r)=>L==='COOKS'?r.ck:L==='REC'?('eq_'+r.k+r.t):(r.k&&(INAME[r.k]||EQ&&EQ[r.k])?r.k:(r.arm?'eq_'+r.arm[0]+r.arm[1]:r.k));
 const actOf=(L,r)=>{const k={COOKS:r.ck,SM:r.k||r.n,GOODS:r.k,BREC:r.k,FREC:r.k}[L];const id=k?L+':'+k:null;return id&&window.SQBAL&&SQBAL.OA[id]!=null?id:null};/* 163's ids; OA holds every one, even recipes turned off */
 const matsTxt=c=>Object.entries(c).map(([k,n])=>k+' '+n).join(', ');
 const sameC=(a,b)=>{const x=Object.entries(a||{}).filter(([,n])=>n>0).sort(),y=Object.entries(b||{}).filter(([,n])=>n>0).sort();return JSON.stringify(x)===JSON.stringify(y)};
 function list(){const out=[],d=D(),rows=(d.stats||{}).recipe||{},act=(d.balance||{}).act||{};
  for(const b in SQDATA.RREF){const R=SQDATA.RREF[b],O=TB.recipe.orig(b),dr=rows[b]||{},r=R.r,L=R.L;
   const c=dr.mats!=null&&dr.mats!==O.mats?SQDATA.parseMats(dr.mats).c:{...O.c0};const aid=actOf(L,r),oxp=aid&&SQBAL.OA[aid]!=null?SQBAL.OA[aid]:r.xp;
   const st=L==='COOKS'?((dr.stove!=null?dr.stove:O.stove)?'stove':'fire'):RL[L](r);
   out.push({id:'g:'+b,src:'game',b,L,r,aid,st,out:outOf(L,r),n:O.n.replace(/^Cook /,''),c:L==='COOKS'?{[r.raw]:1}:c,lv:dr.lv!=null?dr.lv:O.lv,xp:aid&&act[aid]!=null?act[aid]:oxp,oxp,off:dr.off!=null?!!dr.off:!!O.off,edited:!!rows[b]||!!(aid&&act[aid]!=null)})}
  const cr=(d.content||{}).recipes||{};for(const id in cr){const r=cr[id]||{},c={};for(const q of(Array.isArray(r.c)?r.c:Object.values(r.c||{})))if(q&&q.k)c[q.k]=(c[q.k]|0)+(q.n|0||1);
   const st={craft:'bench',smith:'anvil',smelt:'furnace',cook:'fire',stove:'stove'}[r.sk]||'bench';out.push({id:'c:'+id,src:'content',cid:id,st,out:r.out||'',n:nm(r.out||''),c,lv:r.lv|0||1,xp:r.xp|0,sk:r.sk||'craft'})}
  const ng=d.newgear||{};for(const k in ng){const o=ng[k]||{};if(!o.sm)continue;out.push({id:'n:'+k,src:'gear',gk:k,st:o.sm.st==='craft'?'bench':'anvil',out:k,n:o.n||nm(k),c:{...(o.sm.c||{})},lv:o.sm.lv|0||1,xp:null})}
  const G=d.gather||{};for(const[sec,lab]of[['fish','fish'],['crops','crop']])for(const id in G[sec]||{}){const o=G[sec][id]||{};if(!o.ck)continue;
   out.push({id:sec[0]+':'+id,src:lab,gsec:sec,gid:id,st:'fire',out:o.ck,n:nm(o.ck),c:{[o.item]:1},lv:o.clv|0||1,xp:o.cxp|0})}
  return out}
 // ---- page ----
 const BADGE={game:['','#5a6a8a'],content:['NEW','#2f8a3a'],gear:['GEAR','#8a50e0'],fish:['FISH','#3070c8'],crop:['CROP','#a07818']};
 function row(x){const s=STN[x.st],b=BADGE[x.src];return'<tr class="'+(ST.sel===x.id?'dv-on ':'')+(x.off?'rcoff':'')+'" data-rcs="'+E(x.id)+'" style="cursor:pointer"><td>'+ico(x.out,26)+'</td><td><b>'+E(x.n||nm(x.out))+'</b>'+(b[0]?' <i style="font-style:normal;font-size:10px;background:'+b[1]+';color:#fff;padding:1px 4px;border-radius:3px">'+b[0]+'</i>':'')+(x.edited?' <i style="font-style:normal;font-size:10px;background:#c88a10;color:#111;padding:1px 4px;border-radius:3px">EDITED</i>':'')+(x.off?' <i style="font-style:normal;font-size:10px;background:#a03030;color:#fff;padding:1px 4px;border-radius:3px">OFF</i>':'')+'</td>'+
  '<td style="white-space:nowrap">'+s[0]+' '+s[1]+'</td><td>'+Object.entries(x.c).map(([k,n])=>'<span style="white-space:nowrap;margin-right:6px">'+ico(k,20)+'×'+n+'</span>').join('')+'</td><td>'+(SKN[skOf(x.st)]||'')+' '+x.lv+'</td><td>'+(x.xp==null?'–':x.xp)+'</td></tr>'}
 function render(){const L=list(),q=ST.q.trim().toLowerCase(),hit=x=>!q||String(x.n||'').toLowerCase().includes(q)||nm(x.out).toLowerCase().includes(q)||x.out===q||Object.keys(x.c).some(k=>k===q||nm(k).toLowerCase().includes(q));
  const byS=x=>ST.st==='all'||x.st===ST.st||(ST.st==='edited'&&(x.edited||x.src!=='game'));
  let h='<div class="dv-card"><b>Recipes</b><p class="dv-mut">Every recipe in the game in one place: the game\'s own, ones you added in Content, new gear, and cooking for new fish and crops. Search an item to see what makes it and what it\'s used in. Changes save to your draft where each recipe lives, so the other tabs show them too.</p>'+
   '<div class="dv-row" style="flex-wrap:wrap;gap:6px"><input type="search" data-rcq placeholder="Search an item or recipe" value="'+E(ST.q)+'" style="max-width:260px"><button class="dv-b dv-pri" data-rcx="new">+ New recipe</button></div>'+
   '<div class="dv-chips" style="margin-top:6px">'+[['all','All'],['edited','Changed / new']].concat(Object.entries(STN).map(([k,v])=>[k,v[0]+' '+v[1]])).map(([k,l])=>'<button class="dv-b'+(ST.st===k?' dv-tl dv-on':'')+'" data-rcf="'+k+'">'+l+' <small>'+(k==='all'?L.length:k==='edited'?L.filter(x=>x.edited||x.src!=='game').length:L.filter(x=>x.st===k).length)+'</small></button>').join('')+'</div></div>';
  if(ST.w)h+=editor();
  const show=L.filter(x=>byS(x)&&hit(x));
  if(q){const makes=show.filter(x=>x.out===q||nm(x.out).toLowerCase().includes(q)||String(x.n||'').toLowerCase().includes(q)),uses=show.filter(x=>!makes.includes(x));
   h+=tbl('Makes it',makes)+tbl('Uses it',uses)}else h+=tbl('',show);return h}
 const tbl=(t,L)=>'<div class="dv-card" style="margin-top:10px">'+(t?'<b>'+t+'</b> <small class="dv-mut">'+L.length+'</small>':'')+(L.length?'<div style="overflow-x:auto"><table class="dv-rctab"><thead><tr><th></th><th>Makes</th><th>Where</th><th>Needs</th><th>Level</th><th>XP</th></tr></thead><tbody>'+L.map(row).join('')+'</tbody></table></div>':'<p class="dv-mut">Nothing.</p>')+'</div>';
 // ---- editor ----
 function open(id){const x=list().find(q=>q.id===id);if(!x)return;ST.sel=id;ST.w={...x,c:Object.entries(x.c).map(([k,n])=>({k,n}))};ST.dirty=false}
 function editor(){const w=ST.w,s=STN[w.st],cook=w.L==='COOKS'||w.src==='fish'||w.src==='crop',fixedMats=w.L==='COOKS'||w.src==='fish'||w.src==='crop',fld=(l,h)=>'<label class="dv-gf"><span>'+l+'</span><span>'+h+'</span></label>';
  let h='<div class="dv-card dv-rules" style="margin-top:10px;border:1px solid #f0c848"><div class="dv-row" style="gap:10px;align-items:center">'+ico(w.out,40)+'<div><b style="font-size:16px">'+E(w.n||nm(w.out)||'New recipe')+'</b><br><small class="dv-mut">'+
   ({game:'The game\'s own recipe',content:'Added in Content ('+(w.cid||'new')+')',gear:'New gear item '+w.gk,fish:'Cooking for a new fish',crop:'Cooking for a new crop'}[w.src])+(w.b?' · '+E(w.b):'')+'</small></div></div>';
  // output and station
  if(w.src==='content'){h+=fld('Makes',pick('data-rcw="out"',w.out,'— pick an item —'))+fld('Made at','<select data-rcw="sk">'+[['craft','🛠 Crafting bench (Crafting)'],['smith','⚒ Anvil (Smithing)'],['smelt','🔥 Furnace (Smithing)'],['cook','🍳 Campfire or stove (Cooking): the first material is the raw food'],['stove','🍲 Stove only (Cooking): a meal from all its ingredients']].map(([k,l])=>'<option value="'+k+'"'+(w.sk===k?' selected':'')+'>'+l+'</option>').join('')+'</select>')}
  else if(w.src==='fish'||w.src==='crop')h+=fld('Cooks into',pick('data-rcw="out"',w.out,'— not cookable —'));
  else if(w.src==='gear')h+=fld('Made at','<select data-rcw="st"><option value="anvil"'+(w.st==='anvil'?' selected':'')+'>⚒ Anvil (Smithing)</option><option value="bench"'+(w.st==='bench'?' selected':'')+'>🛠 Crafting bench (Crafting)</option></select>');
  else h+=fld('Made at',s[0]+' '+s[1]+(w.L==='COOKS'?' <label class="dv-mut" style="margin-left:10px"><input type="checkbox" data-rcw="stove"'+(w.st==='stove'?' checked':'')+'> stove only</label>':''));
  // materials
  h+='<p style="margin:10px 0 4px"><b>'+(cook?'Raw food':'Materials')+'</b>'+(fixedMats?' <small class="dv-mut">('+(w.src==='game'?'the game\'s cooking takes one raw food':'set the raw item in Gathering')+')</small>':'')+'</p>';
  if(fixedMats)h+='<p>'+w.c.map(q=>ico(q.k,24)+' '+E(nm(q.k))+' ×'+q.n).join(' ')+'</p>';
  else{h+=w.c.map((q,i)=>'<div class="dv-row" style="gap:6px;align-items:center;margin:3px 0">'+ico(q.k,24)+pick('data-rcm="'+i+'"',q.k)+' × <input type="number" min="1" max="9999" data-rcn="'+i+'" value="'+q.n+'" style="width:80px"><button class="dv-b" data-rcx="mdel:'+i+'" title="Remove">✕</button></div>').join('')+
   (w.c.length<12?'<button class="dv-b" data-rcx="madd">+ Add a material</button>':'<p class="dv-mut">12 materials at most.</p>')}
  h+=fld((SKN[skOf(w.st)]||'Skill')+' level','<input type="number" min="1" max="99" data-rcw="lv" value="'+w.lv+'" style="width:80px">');
  if(w.src!=='gear')h+=fld('XP each time','<input type="number" min="0" max="5000" data-rcw="xp" value="'+(w.xp==null?'':w.xp)+'" style="width:80px"'+(w.src==='game'&&!w.aid?' disabled title="This recipe has no XP number of its own"':'')+'>'+(w.src==='game'&&w.oxp!=null?' <span class="dv-mut">(the game\'s: '+w.oxp+')</span>':''));
  if(w.src==='game')h+=fld('Can be made','<label class="dv-mut"><input type="checkbox" data-rcw="on"'+(w.off?'':' checked')+'> yes (untick to take it out of the game)</label>');
  h+='<div class="dv-row" style="gap:6px;margin-top:10px;flex-wrap:wrap"><button class="dv-b dv-pri" data-rcx="save">Save to draft</button>'+
   (w.src==='game'&&w.edited?'<button class="dv-b '+(S.arm==='rcreset'?'dv-arm':'dv-bad')+'" data-rcx="reset">'+(S.arm==='rcreset'?'Tap again':'Back to the game\'s own')+'</button>':'')+
   (w.src==='content'&&w.cid?'<button class="dv-b '+(S.arm==='rcdel'?'dv-arm':'dv-bad')+'" data-rcx="del">'+(S.arm==='rcdel'?'Tap again':'Delete recipe')+'</button>':'')+'<button class="dv-b" data-rcx="close">Close</button>'+(ST.dirty?' <span class="dv-mut">Not saved yet</span>':'')+'</div></div>';
  return h}
 // ---- saving, each where it lives ----
 const prev=()=>{try{if(A.previewing)A.preview(S.draft)}catch(e){}};
 async function save(){const w=ST.w,d=S.draft,c={};for(const q of w.c)if(q.k&&q.n>0)c[q.k]=(c[q.k]|0)+Math.min(9999,q.n|0);
  const lv=Math.max(1,Math.min(99,w.lv|0)),xp=w.xp===''||w.xp==null?null:Math.max(0,Math.min(5000,+w.xp|0));
  try{
   if(w.src==='game'){const O=TB.recipe.orig(w.b),all=d.stats=d.stats||{},rows=all.recipe=all.recipe||{},rw={};
    if(w.L!=='COOKS'&&!sameC(c,O.c0)){if(!Object.keys(c).length){toast('A recipe needs at least one material.');return}rw.mats=matsTxt(c)}
    if(lv!==O.lv)rw.lv=lv;if(!!w.off!==!!O.off)rw.off=w.off?1:0;if(w.L==='COOKS'&&(w.st==='stove')!==!!O.stove)rw.stove=w.st==='stove'?1:0;
    if(Object.keys(rw).length)rows[w.b]=rw;else delete rows[w.b];await dset('draft/stats/recipe/'+w.b,rows[w.b]||null);
    if(w.aid&&xp!=null){const B=d.balance=d.balance||{},act=B.act=B.act||{};if(xp===SQBAL.OA[w.aid])delete act[w.aid];else act[w.aid]=xp;await dset('draft/balance',B)}}
   else if(w.src==='content'){if(!w.out){toast('Pick what it makes.');return}if(!Object.keys(c).length){toast('A recipe needs at least one material.');return}
    let id=w.cid;const C=d.content=d.content||{},R=C.recipes=C.recipes||{};if(!id){const base='r_'+String(w.out).replace(/^it_/,'').replace(/[^a-z0-9_]/g,'').slice(0,20)||'r_new';id=base;let i=2;while(R[id])id=base+'_'+(i++);w.cid=id}
    const o={sk:w.sk||'craft',out:w.out,c:Object.entries(c).map(([k,n])=>({k,n})),lv,xp:xp==null?10:xp};if(o.sk==='cook')o.c=o.c.slice(0,1);R[id]=o;await dset('draft/content/recipes/'+id,o);ST.sel='c:'+id}
   else if(w.src==='gear'){const G=window.SQGEAR,o={...(d.newgear[w.gk]||{})};if(!Object.keys(c).length)delete o.sm;else{o.sm={c,lv};if(w.st==='bench')o.sm.st='craft'}const r=G.ngClean(o,w.gk);if(r)d.newgear[w.gk]=r;
    try{G.devItems(d.newgear)}catch(e){}await dset('draft/newgear/'+w.gk,r||null)}
   else{const G=d.gather=d.gather||{},sec=G[w.gsec]=G[w.gsec]||{},o={...(sec[w.gid]||{}),ck:w.out||'',clv:lv,cxp:xp==null?40:xp};const cl=w.gsec==='fish'?SQGATHER.cleanFish(o):SQGATHER.cleanCrop(o);sec[w.gid]=cl;await dset('draft/gather/'+w.gsec+'/'+w.gid,cl)}
   ST.dirty=false;toast('Saved to draft. Publish it from the Publish tab.')}catch(e){fail(e)}prev();if(ST.sel)open(ST.sel);API.draw()}
 // ---- events ----
 const T=t=>S.tab==='recipes'&&document.getElementById('dvs').contains(t);
 document.addEventListener('click',async e=>{const t=e.target.closest('[data-rcs],[data-rcx],[data-rcf]');if(!t||!T(t))return;e.preventDefault();
  if(t.dataset.rcs){if(ST.dirty&&ST.sel!==t.dataset.rcs&&!API.confirmLeave())return;open(t.dataset.rcs);API.draw();const ed=document.querySelector('#dvs .dv-rules');if(ed)ed.scrollIntoView({block:'nearest'});return}
  if(t.dataset.rcf){ST.st=t.dataset.rcf;API.draw();return}
  const[a,b]=t.dataset.rcx.split(':'),w=ST.w;
  if(a==='new'){ST.sel=null;ST.w={src:'content',cid:null,st:'bench',sk:'craft',out:'',n:'New recipe',c:[{k:'wood',n:2}],lv:1,xp:20};ST.dirty=true;API.draw();return}
  if(a==='close'){ST.sel=null;ST.w=null;ST.dirty=false;API.draw();return}
  if(a==='madd'){w.c.push({k:'wood',n:1});ST.dirty=true;API.draw();return}
  if(a==='mdel'){w.c.splice(+b,1);ST.dirty=true;API.draw();return}
  if(a==='save')return save();
  if(a==='reset')return arm('rcreset',async()=>{const d=S.draft;if(d.stats&&d.stats.recipe)delete d.stats.recipe[w.b];try{await dset('draft/stats/recipe/'+w.b,null);if(w.aid&&d.balance&&d.balance.act&&d.balance.act[w.aid]!=null){delete d.balance.act[w.aid];await dset('draft/balance',d.balance)}toast('Back to the game\'s own recipe (in your draft).')}catch(e2){fail(e2)}prev();open(w.id);API.draw()});
  if(a==='del')return arm('rcdel',async()=>{const R=((S.draft.content||{}).recipes)||{};delete R[w.cid];try{await dset('draft/content/recipes/'+w.cid,null);toast('Deleted from your draft.')}catch(e2){fail(e2)}prev();ST.sel=null;ST.w=null;API.draw()})},true);
 document.addEventListener('change',e=>{const t=e.target;if(!T(t)||!ST.w)return;const w=ST.w;
  if(t.dataset.rcm!=null){w.c[+t.dataset.rcm].k=t.value;ST.dirty=true;API.draw();return}
  if(t.dataset.rcn!=null){w.c[+t.dataset.rcn].n=Math.max(1,Math.min(9999,+t.value|0));ST.dirty=true;return}
  const f=t.dataset.rcw;if(!f)return;ST.dirty=true;
  if(f==='on')w.off=!t.checked;else if(f==='stove')w.st=t.checked?'stove':'fire';else if(f==='st')w.st=t.value;
  else if(f==='sk'){w.sk=t.value;w.st={craft:'bench',smith:'anvil',smelt:'furnace',cook:'fire',stove:'stove'}[t.value]}
  else if(f==='out'){w.out=t.value;w.n=nm(t.value)}else if(f==='lv')w.lv=+t.value;else if(f==='xp')w.xp=t.value===''?'':+t.value;API.draw()},true);
 document.addEventListener('input',e=>{const t=e.target;if(!T(t)||!t.hasAttribute('data-rcq'))return;ST.q=t.value;const pos=t.selectionStart;API.draw();const i=document.querySelector('#dvs [data-rcq]');if(i){i.focus();try{i.setSelectionRange(pos,pos)}catch(x){}}},true);
 {const st=document.createElement('style');st.textContent='#dvs .dv-rctab{border-collapse:collapse;width:100%}#dvs .dv-rctab td,#dvs .dv-rctab th{padding:4px 6px;text-align:left;vertical-align:middle;border-bottom:1px solid #222838}#dvs .dv-rctab tr.dv-on td{background:#2a3040}#dvs .dv-rctab tr:hover td{background:#1c2230}#dvs .dv-rctab tr.rcoff td{opacity:.5}';document.head.appendChild(st)}
 SQSUITE.addTab('recipes','Recipes',{render,dirty:()=>!!(ST.w&&ST.dirty),leave(){ST.sel=null;ST.w=null;ST.dirty=false}});
 window.SQRECIPES={list,open,state:ST}})();
