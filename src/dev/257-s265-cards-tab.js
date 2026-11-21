// ---- 265. Dev Suite > Cards: change any Drop Card's name, stats text, kind and drop rate, or add new cards (library `cards`) ----
// Nov 20 (Jace): "A Cards tab in the Dev Suite, so you can change stats, art and drop rates yourself."
// - Saves to the draft (`draft/cards/<card key>` = {n, d, g, r (0-1), src}); Publish sends it live like every other tab. 253's
//   applyLib reads it: a known key changes that card, a new key (cu_<name>) adds one that drops from `src` (a monster key such as
//   "slime:moss" or "wb:giant", a tree kind, a potion key, a forage item) instead of that source's own card.
// - Art: cards are items, so the Sprites tab paints them by item key (dc_<key>, shiny dc_<key>_sh); a painted card shows everywhere.
// - Drop rates: Jace's rule is that a live drop never gets more common, so raising a rate above the published one asks twice.
(()=>{if(!window.SQSUITE||!SQSUITE.addTab||!window.SQDROPCARD)return;const D=SQDROPCARD,API=SQSUITE.api,{S,E,dset,toast,fail,arm}=API;
 const GROUPS=[['reg','Monster'],['tree','Tree (Mana)'],['world','World boss'],['dungeon','Dungeon boss'],['island','Island boss'],['guild','Guild boss'],['potion','Potion (spell)'],['forage','Forage (spell)']];
 const T={sel:null,w:null,dirty:false,q:'',newName:''};
 const sec=()=>S.draft.cards||(S.draft.cards={});
 const liveRate=k=>{const l=S.live&&S.live.cards&&S.live.cards[k];if(l&&typeof l.r==='number')return l.r;const o=D.ORIG[k];return o?(o.r==null?D.RATE:o.r):null};
 const cur=k=>{const C=D.CARDS[k],o=D.ORIG[k]||{},d=sec()[k]||{};return{n:d.n!=null?d.n:String((C||o).n||'').replace(/^Drop Card: /,''),d:d.d!=null?d.d:(C||o).d||'',g:d.g||(C||o).g||'reg',r:typeof d.r==='number'?d.r:((C||o).r==null?D.RATE:(C||o).r),src:d.src||''}};
 const srcList=()=>{const out=new Set(['tree','oak','willow','maple','yew','pine','deadtree','voidtree','pot_heal','pot_str','pot_iron','pot_swift','pot_poison','pot_napalm','pot_zap','berry','shroom','nuts','cfruit']);
  try{for(const k in (window.SQISLIFE&&SQISLIFE.MOBS)||{})out.add(k)}catch(e){self.SQERR&&SQERR(e,'257-1')}for(const k in D.CARDS)out.add(k);return[...out].sort()};
 function render(){const q=T.q.toLowerCase(),L=Object.values(D.CARDS);
  let h='<div class="dv-card"><b>Drop Cards</b><p class="dv-mut">Change a card\'s name, stats, kind or drop rate, or add a new card. Save to draft, then Publish. Paint a card in the <b>Sprites</b> tab by its item key (shown below); the shiny one is the same key + <code>_sh</code>. Remember: a published drop should never get more common.</p>'+
   '<div class="dv-row" style="gap:6px;flex-wrap:wrap"><input type="search" data-dcq placeholder="Search cards" value="'+E(T.q)+'" style="max-width:220px"><input data-dcnew placeholder="New card name" value="'+E(T.newName)+'" style="max-width:200px"><button class="dv-b" data-dcx="new">Add card</button></div></div>';
  h+='<div class="dv-spr'+(T.sel?' dv-has':'')+'"><div class="dv-ls"><div class="dv-grid" style="grid-template-columns:1fr">';
  for(const C of L){if(q&&!C.n.toLowerCase().includes(q)&&!C.k.includes(q))continue;const dr=sec()[C.k],lv=S.live&&S.live.cards&&S.live.cards[C.k],live=JSON.stringify(lv||null)===JSON.stringify(dr||null);
   h+='<button class="dv-it'+(T.sel===C.k?' dv-on':'')+'" data-dcs="'+E(C.k)+'" style="flex-direction:row;justify-content:flex-start;gap:8px;padding:6px 8px">'+(dr?'<i class="dv-bd dv-'+(live?'live':'draft')+'">'+(live?'LIVE':'DRAFT')+'</i>':'')+
    '<img src="'+iconURL(C.key)+'" style="width:28px;height:28px;image-rendering:pixelated"><span style="font-size:13px;text-align:left;flex:1">'+E(C.n.replace(/^Drop Card: /,''))+'</span><span class="dv-mut" style="font-size:12px">'+(Math.round((C.r==null?D.RATE:C.r)*1000)/10)+'%</span></button>'}
  h+='</div></div><div class="dv-ed">';if(!T.sel)return h+'<p class="dv-mut">Pick a card, or add a new one.</p></div></div>';
  const k=T.sel,w=T.w||cur(k),C=D.CARDS[k],key=D.keyOf(k),lr=liveRate(k),isNew=!D.ORIG[k];
  const fld=(l,x)=>'<label class="dv-gf"><span>'+l+'</span><span>'+x+'</span></label>';
  h+='<div class="dv-card"><div class="dv-row" style="gap:10px;align-items:center"><img src="'+iconURL(key)+'" style="width:56px;height:56px;image-rendering:pixelated"><img src="'+iconURL(key+'_sh')+'" style="width:56px;height:56px;image-rendering:pixelated" title="Shiny"><div><b>'+E(w.n)+'</b><br><small class="dv-mut">card '+E(k)+' · item '+E(key)+' · shiny '+E(key)+'_sh</small></div></div>'+
   fld('Name','<input data-dcf="n" value="'+E(w.n)+'" maxlength="40">')+
   fld('Stats / text','<input data-dcf="d" value="'+E(w.d)+'" maxlength="120" style="width:100%"> <span class="dv-mut">e.g. 3HP 2ATK, 2 Mana, Cost 1 · Draw a card</span>')+
   fld('Kind','<select data-dcf="g">'+GROUPS.map(([v,l])=>'<option value="'+v+'"'+(w.g===v?' selected':'')+'>'+l+'</option>').join('')+'</select>')+
   fld('Drop rate','<input type="number" data-dcf="r" value="'+(Math.round(w.r*1000)/10)+'" min="0" max="100" step="0.1" style="width:80px"> % <span class="dv-mut">(published: '+(lr==null?'none yet':(Math.round(lr*1000)/10)+'%')+'; 0 = never drops)</span>')+
   (isNew?fld('Drops from','<input data-dcf="src" list="dcsrcl" value="'+E(w.src)+'" placeholder="slime:moss, wb:giant, oak..." style="width:220px"><datalist id="dcsrcl">'+srcList().map(x=>'<option value="'+E(x)+'">').join('')+'</datalist> <span class="dv-mut">takes over that source\'s card drop</span>'):'')+
   '<div class="dv-row" style="gap:6px;flex-wrap:wrap;margin-top:10px"><button class="dv-b dv-pri" data-dcx="save">'+(S.arm==='dcrate'?'Raise the drop rate? Click again':'Save to draft')+'</button><button class="dv-b" data-dcx="try">Try it (preview + give me one)</button>'+
   (sec()[k]?'<button class="dv-b dv-bad" data-dcx="reset">'+(S.arm==='dcreset'?'Click again to '+(isNew?'delete it':'undo my changes'):(isNew?'Delete this card':'Back to the game\'s own'))+'</button>':'')+'</div></div>';
  return h+'</div></div>'}
 async function save(){const k=T.sel,w=T.w||cur(k),o=D.ORIG[k];const v={n:String(w.n||'').slice(0,40),d:String(w.d||'').slice(0,120),g:w.g,r:Math.max(0,Math.min(1,+w.r||0))};if(!o&&w.src)v.src=String(w.src).slice(0,40);
  sec()[k]=v;try{await dset('draft/cards/'+k,v);T.dirty=false;toast('Saved to draft. Publish it from the Publish tab.')}catch(e){fail(e)}try{if(window.SQA&&SQA.previewing)SQA.preview(S.draft)}catch(e){self.SQERR&&SQERR(e,'257-2')}API.draw()}
 document.addEventListener('click',async e=>{if(S.tab!=='cards')return;const t=e.target.closest('[data-dcs],[data-dcx]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();
  if(t.dataset.dcs!=null){T.sel=t.dataset.dcs;T.w=cur(T.sel);T.dirty=false;API.draw();return}
  const a=t.dataset.dcx;
  if(a==='new'){const n=T.newName.trim();if(!n){toast('Type the new card\'s name first.');return}const k='cu_'+n.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,30);if(D.CARDS[k]||sec()[k]){toast('There\'s already a card called that.');return}
   sec()[k]={n,d:'1HP 1ATK',g:'reg',r:D.RATE};D.define(k,n,'reg','1HP 1ATK',null,D.RATE,null);T.sel=k;T.w=cur(k);T.newName='';T.dirty=true;toast('New card. Set it up, then Save to draft.');API.draw();return}
  if(a==='save'){const w=T.w||cur(T.sel),lr=liveRate(T.sel);if(lr!=null&&(+w.r||0)>lr+1e-9&&S.arm!=='dcrate'){toast('That makes a published drop more common. Click Save again if you really mean it.');return arm('dcrate',save)}if(S.arm==='dcrate')return arm('dcrate',save);return save()}
  if(a==='reset')return arm('dcreset',async()=>{const k=T.sel;delete sec()[k];try{await dset('draft/cards/'+k,null)}catch(x){fail(x)}if(!D.ORIG[k]){T.sel=null;T.w=null}else T.w=cur(k);try{D.applyLib(S.draft)}catch(x){self.SQERR&&SQERR(x,'257-3')}API.draw()});
  if(a==='try'){await save();try{SQA.preview(S.draft)}catch(x){self.SQERR&&SQERR(x,'257-4')}const C=D.CARDS[T.sel];if(C){inv[C.key]=(inv[C.key]|0)+1}toast('Your draft is on (preview) and you have one in your Card Binder.');API.draw()}},true);
 document.addEventListener('change',e=>{if(S.tab!=='cards'||!T.sel)return;const t=e.target;if(!t.dataset||!t.dataset.dcf)return;T.w=T.w||cur(T.sel);const f=t.dataset.dcf;T.w[f]=f==='r'?Math.max(0,Math.min(100,+t.value||0))/100:t.value;T.dirty=true;API.draw()},true);
 document.addEventListener('input',e=>{if(S.tab!=='cards')return;const t=e.target;if(t.hasAttribute&&t.hasAttribute('data-dcnew')){T.newName=t.value;return}if(t.hasAttribute&&t.hasAttribute('data-dcq')){T.q=t.value;const pos=t.selectionStart;API.draw();const i=document.querySelector('#dvs [data-dcq]');if(i){i.focus();try{i.setSelectionRange(pos,pos)}catch(x){/*quiet*/}}}},true);
 const changes=(L,Dr)=>{const l=(L||{}).cards||{},d=(Dr||{}).cards||{},out=[];for(const k of new Set([...Object.keys(l),...Object.keys(d)]))if(JSON.stringify(l[k])!==JSON.stringify(d[k]))out.push({kind:'ext',html:'🃏 '+E((d[k]||l[k]||{}).n||k)+' card'+(d[k]?(l[k]?' (changed)':' (new)'):' (back to the game\'s own)')});return out};
 SQSUITE.addTab('cards','Cards',{render,changes,dirty:()=>!!(T.sel&&T.dirty),leave(){T.sel=null;T.w=null;T.dirty=false}})})();
