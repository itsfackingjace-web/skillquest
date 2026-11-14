// ---- 194. Dev Suite > Perks: every skill tree in one place, rename / reword perks, and add new perks that work without code ----
// Library `ptree` = {txt:{'<skill>:<perk id>':{n,d}}, add:{'<skill>':{'<level>':[{id:'cp_<x>',n,d,fx:{<FXN key>:value}}]}}}.
// txt replaces the name / description shown in the game's tree (the effect stays what the code does). add puts new choices at a
// level (a level holds at most 3 choices: PERKS letters a/b/c, 036) or at a new level, and for a skill with no tree yet makes one.
// A new perk's effect is gear-style fx (111a2's FXN: life steal, burn, slow, crit, speed, XP, melee/arrow/magic damage, mana / health
// regen, less hunger, more gold), added to SQGEAR.fxSum through window.SQFXEXTRA while the perk is chosen and its level reached.
// Taken back out before every apply; a removed perk a player had chosen simply does nothing (their choice letter stays).
(()=>{if(!window.SQA||typeof TREES==='undefined')return;
 const num=(v,lo,hi,d)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v)):d};
 const clean=(v,n)=>String(v==null?'':v).replace(/[<>&"]/g,'').trim().slice(0,n);
 const G=()=>window.SQGEAR;const FXN=()=>G()?G().FXN:{},FXMAX=()=>G()?G().FXMAX:{};
 const FXU={ls:'% chance to heal a heart on a hit',burn:'% chance to burn what you hit',slow:'% chance to slow what you hit',crit:'% chance to hit twice',spd:'% faster walking',xp:'% more XP',mel:'% more melee damage',arc:'% more arrow damage',mag:'% more spell damage',mreg:'% faster mana regen',hreg:' health regen (1 heart every 600 ÷ this s)',hun:'% slower hunger',gold:'% more gold from monsters'};
 const fxText=fx=>Object.entries(fx||{}).filter(([,v])=>v).map(([k,v])=>(k==='hreg'?'+'+v+' health regen':'+'+v+(FXU[k]||'% '+k))).join(', ');
 let TXT={},ADD={},MINE=new Map();// MINE: choice object -> {n,d} before we changed it
 const MADE=new Set();// skills we made a tree for
 function undo(){for(const sk in TREES){const T=TREES[sk];if(!T||!T.choices)continue;for(const lv in T.choices){const C=T.choices[lv];for(let i=C.length-1;i>=0;i--)if(C[i]._cp)C.splice(i,1);if(!C.length)delete T.choices[lv]}}
  for(const[c,o]of MINE){if(c.n===o.set.n)c.n=o.n;if(c.d===o.set.d)c.d=o.d}MINE.clear();for(const sk of MADE){const T=TREES[sk];if(T&&!Object.keys(T.choices).length)delete TREES[sk]}MADE.clear()}
 function apply(lib){undo();const L=lib&&lib.ptree||{};TXT={};ADD={};
  for(const key in L.txt||{}){const m=/^(\d{1,2}):([a-z0-9_]{1,30})$/.exec(key),o=L.txt[key];if(!m||!o)continue;const n=clean(o.n,40),d=clean(o.d,300);if(!n&&!d)continue;TXT[key]={n,d};
   const T=TREES[+m[1]];if(!T)continue;for(const lv in T.choices)for(const c of T.choices[lv])if(c.id===m[2]&&!c._cp){const was={n:c.n,d:c.d};if(n)c.n=n;if(d)c.d=d;MINE.set(c,{...was,set:{n:c.n,d:c.d}})}}
  for(const sk in L.add||{}){if(!/^\d{1,2}$/.test(sk)||+sk>=SKN.length)continue;const byL=L.add[sk];if(!byL||typeof byL!=='object')continue;
   for(const lv in byL){if(!/^\d{1,2}$/.test(lv)||+lv<1||+lv>99)continue;const arr=(Array.isArray(byL[lv])?byL[lv]:Object.values(byL[lv]||{})).slice(0,3);
    for(const q of arr){if(!q||!/^cp_[a-z0-9_]{1,30}$/.test(q.id))continue;const fx={};for(const k in q.fx||{})if(FXN()[k])fx[k]=num(q.fx[k],0,FXMAX()[k]||100,0);
     const c={id:q.id,n:clean(q.n,40)||'New perk',d:clean(q.d,300)||fxText(fx)||'',fx,_cp:1};
     let T=TREES[+sk];if(!T){T=TREES[+sk]={every:()=>null,extra:{},step:()=>[],choices:{},_cp:1};MADE.add(+sk)}
     const C=T.choices[lv]||(T.choices[lv]=[]);if(C.length>=3||C.some(x=>x.id===c.id))continue;C.push(c);(ADD[sk]=ADD[sk]||[]).push({lv:+lv,c})}}}}
 SQA.onApply(apply);
 // effects of chosen new perks
 (window.SQFXEXTRA=window.SQFXEXTRA||[]).push(x=>{let t=0;for(const sk in ADD)for(const{lv,c}of ADD[sk]){if(!c.fx[x])continue;const P2=PERKS[sk];if(!P2||lvOf(+sk)<lv)continue;const C=TREES[sk]&&TREES[sk].choices[lv];if(!C)continue;if((C['abc'.indexOf(P2[lv])]||{}).id===c.id)t+=c.fx[x]}return t});
 window.SQPERKED={get add(){return ADD},fxText};
 // ======================= Dev Suite > Perks =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,dset,toast,fail,arm}=API;
 const T={sk:null,sel:null,w:null,dirty:false};
 const D0=()=>S.draft.ptree||(S.draft.ptree={});const DT=()=>D0().txt||(D0().txt={}),DA=()=>D0().add||(D0().add={});
 const builtIn=sk=>{const out={},Tr=TREES[sk];if(!Tr)return out;for(const lv in Tr.choices)for(const c of Tr.choices[lv])if(!c._cp)(out[lv]=out[lv]||[]).push(c);return out};
 const origOf=c=>{const m=MINE.get(c);return m?{n:m.n,d:m.d}:{n:c.n,d:c.d}};
 const added=(sk,lv)=>{const A=DA()[sk]&&DA()[sk][lv];return Array.isArray(A)?A:A?Object.values(A):[]};
 const slug=n=>'cp_'+(String(n).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,20)||'perk');
 function skillList(){return SKN.map((n,i)=>{const B=builtIn(i),nb=Object.values(B).reduce((s,a)=>s+a.length,0),na=Object.values(DA()[i]||{}).reduce((s,a)=>s+(Array.isArray(a)?a.length:Object.keys(a||{}).length),0);return{i,n,nb,na}})}
 function card(sk,lv,c,isNew,k){const key=sk+':'+c.id,t=DT()[key],o=origOf(c),sel=T.sel&&T.sel.lv===lv&&T.sel.id===c.id;
  const n=isNew?c.n:(t&&t.n)||o.n,d=isNew?(c.d||fxText(c.fx)):(t&&t.d)||o.d;
  return'<button class="dv-pkc'+(sel?' dv-on':'')+(isNew?' dv-pknew':'')+'" data-pks="'+lv+':'+E(c.id)+':'+(isNew?1:0)+'"><span class="dv-pkt">'+'ABC'[k]+'</span><b>'+E(n)+'</b><small>'+E(d)+'</small>'+
   (isNew?'<i>NEW · '+E(fxText(c.fx)||'no effect yet')+'</i>':t?'<i>RENAMED</i>':'')+'</button>'}
 function treeView(sk){const B=builtIn(sk),lvs=new Set([...Object.keys(B),...Object.keys(DA()[sk]||{})].map(Number).filter(l=>B[l]||added(sk,l).length));
  let h='<div class="dv-card"><div class="dv-row"><b style="font-size:16px">'+E(SKN[sk])+' tree</b><span class="dv-mut">'+(TREES[sk]&&!TREES[sk]._cp?'':'No tree in the game yet: perks you add here make one.')+'</span></div>';
  if(!lvs.size)h+='<p class="dv-mut">No perks yet.</p>';
  for(const lv of[...lvs].sort((a,b)=>a-b)){const bi=B[lv]||[],ad=added(sk,lv),all=[...bi.map(c=>[c,0]),...ad.map(c=>[c,1])];
   h+='<div class="dv-pkl"><div class="dv-pklv">Level<br><b>'+lv+'</b></div><div class="dv-pkrow">'+all.map(([c,nw],k)=>card(sk,lv,c,nw,k)).join('')+(all.length<3?'<button class="dv-pkc dv-pkadd" data-pkadd="'+lv+'">+ Add a perk<br><small>players pick one of '+(all.length+1)+'</small></button>':'')+'</div></div>'}
  h+='<div class="dv-row" style="margin-top:10px"><span class="dv-mut">New choice at level</span><input type="number" min="1" max="99" value="15" data-pkin="nlv" style="width:70px"><button class="dv-b" data-pkx="newlv">+ Add a perk at this level</button></div></div>';return h}
 function editor(){const s=T.sel;if(!s||!T.w)return'';const w=T.w;let h='<div class="dv-card"><b>'+(s.isNew?'New perk':'Built-in perk')+' · '+E(SKN[T.sk])+' level '+s.lv+'</b>';
  h+='<div style="margin:8px 0"><label class="dv-mut">Name</label><br><input type="text" data-pkf="n" maxlength="40" value="'+E(w.n||'')+'" style="width:100%"></div>'+
   '<div style="margin:8px 0"><label class="dv-mut">Description players see'+(s.isNew?' (empty = written from its effects)':'')+'</label><br><textarea data-pkf="d" maxlength="300" rows="2" style="width:100%">'+E(w.d||'')+'</textarea></div>';
  if(!s.isNew){const o=s.orig;h+='<p class="dv-mut" style="font-size:12px">Game\'s own text: <b>'+E(o.n)+'</b> — '+E(o.d)+'<br>The effect is built into the game; only its name and description change. Number changes for many perks are in Balance.</p>'}
  else{h+='<div style="margin:8px 0"><label class="dv-mut">What it does (while chosen; add up with gear)</label><div class="dv-pkfx">'+Object.entries(FXN()).map(([k,n])=>'<label><span>'+E(n)+'</span><input type="number" data-pkfx="'+k+'" min="0" max="'+(FXMAX()[k]||100)+'" value="'+((w.fx||{})[k]||'')+'" placeholder="0" style="width:70px"><small class="dv-mut">'+E((FXU[k]||'').replace(/^%? ?/,'').replace(/^ /,''))+'</small></label>').join('')+'</div></div>'+
   '<p class="dv-mut" style="font-size:12px">Id '+E(w.id)+' (never rename a published perk: players\' picks remember the letter, and its effect is found by id).</p>'}
  h+='<div class="dv-row" style="flex-wrap:wrap"><button class="dv-b dv-pri" data-pkx="save">Save to draft</button>'+(s.isNew?'<button class="dv-b '+(S.arm==='pkdel'?'dv-arm':'dv-bad')+'" data-pkx="del">'+(S.arm==='pkdel'?'Tap again to delete':'Delete')+'</button>':(DT()[T.sk+':'+w.id]?'<button class="dv-b dv-bad" data-pkx="orig">Use the game\'s own text</button>':''))+'</div></div>';return h}
 function render(){const L=skillList();if(T.sk==null)T.sk=L.find(x=>x.nb)?L.find(x=>x.nb).i:0;
  let h='<div class="dv-row" style="flex-wrap:wrap;margin-bottom:8px">'+L.map(x=>'<button class="dv-b'+(T.sk===x.i?' dv-tl dv-on':'')+'" data-pksk="'+x.i+'">'+E(x.n)+(x.nb+x.na?' <span class="dv-mut">'+(x.nb+x.na)+'</span>':'')+(x.na?' ✨':'')+'</button>').join('')+'</div>';
  return h+'<div class="dv-pkwrap"><div>'+treeView(T.sk)+'</div><div>'+(editor()||'<div class="dv-card"><b>🌳 Perks</b><p class="dv-mut">Every 10 levels players pick one perk from a skill\'s tree. Tap a perk to rename it or change what it says. Add new perks at any level (up to three choices a level) and give them effects: more damage, XP, gold, speed, regen and more. Skills with no tree yet get one as soon as you add a perk.</p></div>')+'</div></div>'}
 function pick(lv,id,isNew){const sk=T.sk;if(isNew){const c=added(sk,lv).find(q=>q.id===id);if(!c)return;T.sel={lv,id,isNew:1};T.w=JSON.parse(JSON.stringify(c));}
  else{const c=(builtIn(sk)[lv]||[]).find(q=>q.id===id);if(!c)return;const o=origOf(c),t=DT()[sk+':'+id]||{};T.sel={lv,id,isNew:0,orig:o};T.w={id,n:t.n||o.n,d:t.d||o.d}}T.dirty=false;API.draw()}
 function newAt(lv){const sk=T.sk,n=(builtIn(sk)[lv]||[]).length+added(sk,lv).length;if(n>=3){toast('A level holds at most three choices.');return}let id=slug(SKN[sk]+' '+lv),k=2;const used=new Set();for(const s in DA())for(const l in DA()[s])for(const q of added(s,l))used.add(q.id);while(used.has(id))id=slug(SKN[sk]+' '+lv+' '+(k++));
  const c={id,n:'New perk',d:'',fx:{xp:5}};const A=DA()[sk]||(DA()[sk]={});const arr=added(sk,lv).slice();arr.push(c);A[lv]=arr;T.sel={lv,id,isNew:1};T.w=JSON.parse(JSON.stringify(c));T.dirty=true;API.draw()}
 async function save(){const sk=T.sk,s=T.sel,w=T.w;try{if(s.isNew){const arr=added(sk,s.lv).map(q=>q.id===w.id?w:q);const fx={};for(const k in w.fx||{})if(+w.fx[k])fx[k]=+w.fx[k];w.fx=fx;if(!w.d)delete w.d;DA()[sk]=DA()[sk]||{};DA()[sk][s.lv]=arr;await dset('draft/ptree/add/'+sk+'/'+s.lv,arr)}
   else{const o=s.orig,t={};if(w.n&&w.n!==o.n)t.n=w.n;if(w.d&&w.d!==o.d)t.d=w.d;const key=sk+':'+w.id;if(Object.keys(t).length)DT()[key]=t;else delete DT()[key];await dset('draft/ptree/txt/'+key,Object.keys(t).length?t:null)}
   T.dirty=false;toast('Saved to draft. Publish it from the Publish tab.');if(SQA.previewing)SQA.preview(S.draft)}catch(e){fail(e)}API.draw()}
 const inTab=t=>S.tab==='ptree'&&t&&document.getElementById('dvs')&&document.getElementById('dvs').contains(t);
 document.addEventListener('input',e=>{const t=e.target;if(!inTab(t)||!T.w)return;if(t.dataset.pkf){T.w[t.dataset.pkf]=t.value;T.dirty=true}else if(t.dataset.pkfx){T.w.fx=T.w.fx||{};T.w.fx[t.dataset.pkfx]=+t.value||0;T.dirty=true}},true);
 document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-pksk],[data-pks],[data-pkadd],[data-pkx]');if(!inTab(t))return;e.preventDefault();
  if(t.dataset.pksk!=null){if(T.dirty&&!API.confirmLeave())return;T.sk=+t.dataset.pksk;T.sel=T.w=null;T.dirty=false;API.draw();return}
  if(t.dataset.pks){if(T.dirty&&!API.confirmLeave())return;const[lv,id,nw]=t.dataset.pks.split(':');pick(+lv,id,nw==='1');return}
  if(t.dataset.pkadd){newAt(+t.dataset.pkadd);return}
  const a=t.dataset.pkx;
  if(a==='newlv'){const v=+(document.querySelector('#dvs [data-pkin="nlv"]')||{}).value;if(!(v>=1&&v<=99)){toast('Pick a level from 1 to 99.');return}newAt(v|0);return}
  if(a==='save')return save();
  if(a==='orig'){T.w.n=T.sel.orig.n;T.w.d=T.sel.orig.d;return save()}
  if(a==='del')return arm('pkdel',async()=>{const sk=T.sk,s=T.sel;const arr=added(sk,s.lv).filter(q=>q.id!==s.id);if(arr.length)DA()[sk][s.lv]=arr;else delete DA()[sk][s.lv];try{await dset('draft/ptree/add/'+sk+'/'+s.lv,arr.length?arr:null);toast('Deleted from your draft.')}catch(x){fail(x)}T.sel=T.w=null;T.dirty=false;if(SQA.previewing)SQA.preview(S.draft);API.draw()})},true);
 if(!document.getElementById('dvpkcss')){const st=document.createElement('style');st.id='dvpkcss';st.textContent='.dv-pkwrap{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(280px,1fr);gap:12px;align-items:start}@media(max-width:900px){.dv-pkwrap{grid-template-columns:1fr}}.dv-pkl{display:flex;gap:10px;align-items:stretch;margin:8px 0}.dv-pklv{width:48px;flex:none;text-align:center;font-size:11px;opacity:.8;padding-top:6px}.dv-pklv b{font-size:18px}.dv-pkrow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;flex:1}.dv-pkc{position:relative;text-align:left;background:#232a36;border:2px solid #3a4456;border-radius:8px;padding:8px 10px 8px 30px;color:inherit;cursor:pointer;display:flex;flex-direction:column;gap:3px;font:inherit}.dv-pkc b{font-size:13px}.dv-pkc small{font-size:11.5px;opacity:.8;line-height:1.3}.dv-pkc i{font-style:normal;font-size:10px;color:#f8d048}.dv-pkc.dv-on{border-color:#f8d048}.dv-pknew{border-color:#40b878;background:#1c2e28}.dv-pkt{position:absolute;left:8px;top:8px;font-weight:700;opacity:.55}.dv-pkadd{align-items:center;justify-content:center;text-align:center;border-style:dashed;opacity:.75;padding:8px}.dv-pkfx{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px;margin-top:4px}.dv-pkfx label{display:grid;grid-template-columns:1fr 74px;gap:2px 6px;align-items:center;font-size:12px}.dv-pkfx small{grid-column:1/3;font-size:10.5px}';document.head.appendChild(st)}
 SQSUITE.addTab('ptree','Perks',{render,dirty:()=>T.dirty,leave(){T.sel=T.w=null;T.dirty=false},changes(L,Dr){const out=[],a=L&&L.ptree||{},b=Dr&&Dr.ptree||{};if(JSON.stringify(a.txt||{})!==JSON.stringify(b.txt||{}))out.push({kind:'ext',html:'🌳 Perk names and descriptions changed'});
   for(const sk of new Set([...Object.keys(a.add||{}),...Object.keys(b.add||{})]))if(JSON.stringify((a.add||{})[sk])!==JSON.stringify((b.add||{})[sk]))out.push({kind:'ext',html:'🌳 New perks in '+E(SKN[sk]||sk)});return out}})})();
