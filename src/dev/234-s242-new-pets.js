// ---- 242. New pets made in the Dev Suite (window.SQNEWPETS, Dev Suite > New pets) ----
// Library `newpets.np_<id>` = {n name, d description, v Marlo's price (0 = not sold: a rare pet, given through drops, loot tables,
// shops or gifts)}. Each becomes a pet kind `np_<id>` (id: up to 9 letters/digits, so the kind fits the 12 characters 061 keeps of a
// player's `pet`) in LUX.PETS, with the item `pet_np_<id>` built the way 104/151 build pet items. Its look is `pets.np_<id>` (the Pets
// tab; until it has one, 085's plain little sprite in the pet's colours). On the developer's own device unpublished new pets (draft)
// are registered too. Never rename or delete a published one: like 162's items, counts of not-yet-loaded pets wait in PEND (bag) and
// PPET (the one in your PET slot) and are written back into saves.
(()=>{const PETS=()=>(window.LUX&&LUX.PETS)||[],COS=()=>window.LUX&&LUX.COS;
 const REG=new Map(),PEND={};let PPET=null,LIB={};
 const ok=(k,r)=>/^np_[a-z0-9]{1,9}$/.test(k)&&r&&typeof r.n==='string'&&r.n.trim();
 const clean=r=>({n:String(r.n).trim().slice(0,24),d:String(r.d||'').slice(0,300),v:Math.max(0,Math.min(1e7,Math.floor(+r.v||0))),c:Array.isArray(r.c)&&r.c.length===3&&r.c.every(x=>/^#[0-9a-f]{6}$/i.test(x))?r.c:['#c8a878','#806040','#f0e0c0']});
 function reg(k,r){const it='pet_'+k;let p=PETS().find(q=>q.k===k);if(!p){p={k,_np:1};PETS().push(p)}Object.assign(p,{n:r.n,v:r.v,rare:r.v?0:1,c:r.c});
  if(!EQ[it]){EQK.push(it);if(!INVK.includes(it))INVK.push(it);if(!EXTRA_BAG.includes(it))EXTRA_BAG.push(it);if(!(it in inv))inv[it]=0}
  EQ[it]={slot:'pet',n:r.n,ic:'pet:'+k,v:r.v?Math.floor(r.v/4):250,pet:k,_np:1};INAME[it]=r.n+' (pet)';SN[it]=r.n+' pets';SHORT[it]=r.n.toLowerCase()+' pet';SELLP[it]=EQ[it].v;
  IDESC[it]=(r.d?r.d.trim()+' ':(r.v?'A pet from Marlo\'s Emporium. ':'A rare pet. '))+'Put it in your PET slot (Equip) and it follows you everywhere; other players see it too.';
  if(PEND[it]){inv[it]=(inv[it]|0)+PEND[it];delete PEND[it]}
  const c=COS();if(c&&PPET===k){PPET=null;if(!c.pet){c.pet=k;if(!c.pets.includes(k))c.pets.push(k)}else inv[it]=(inv[it]|0)+1}
  try{delete ICONC['ippet:'+k]}catch(e){}REG.set(k,r)}
 function unreg(k){const it='pet_'+k;if(inv[it]|0)PEND[it]=(PEND[it]|0)+(inv[it]|0);delete inv[it];
  for(const L of[INVK,EXTRA_BAG,EQK]){let i;while((i=L.indexOf(it))>=0)L.splice(i,1)}delete EQ[it];
  const c=COS();if(c&&c.pet===k){PPET=k;c.pet=null}if(c)c.pets=c.pets.filter(q=>q!==k);
  const L=PETS(),i=L.findIndex(q=>q.k===k&&q._np);if(i>=0)L.splice(i,1);REG.delete(k)}
 // what should exist: the published library, plus the developer's draft on their own device
 function want(){const o={},add=s=>{for(const k in s||{})if(ok(k,s[k]))o[k]=clean(s[k])};add(LIB.newpets);
  try{const S=window.SQSUITE&&SQSUITE.state;if(S&&S.draft&&S.ok==='yes')add(S.draft.newpets)}catch(e){}return o}
 function sync(){const w=want();for(const k of[...REG.keys()])if(!w[k])unreg(k);for(const k in w)reg(k,w[k]);try{if(window.SQPETSYNC)SQPETSYNC()}catch(e){}}
 if(window.SQA&&SQA.onApply)SQA.onApply(lib=>{LIB=lib||{};sync()});
 SQSAVE.after('234:np',s=>{try{for(const k in PEND)if(PEND[k])s.inv[k]=(s.inv[k]|0)+PEND[k];if(PPET&&s.cos&&!s.cos.pet){s.cos.pet=PPET;s.cos.pets=[...(s.cos.pets||[]),PPET]}}catch(e){}});
 SQLOAD.wrap('234',_ap=>function(S){for(const k in PEND)delete PEND[k];PPET=null;const out=_ap.apply(this,arguments);
  try{if(S&&S.inv)for(const k in S.inv)if(/^pet_np_/.test(k)&&!EQ[k]&&+S.inv[k]>0)PEND[k]=Math.min(1e6,+S.inv[k]|0);
   const c=S&&S.cos;if(c&&typeof c.pet==='string'&&/^np_/.test(c.pet)&&!REG.has(c.pet))PPET=c.pet}catch(e){}return out});
 {const _ng=newGame;newGame=function(){for(const k in PEND)delete PEND[k];PPET=null;return _ng.apply(this,arguments)}}
 window.SQNEWPETS={sync,REG,PEND,get ppet(){return PPET},ok,clean};
 // ======================= Dev Suite > New pets =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,toast,fail}=API;
 const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const D=()=>{S.draft.newpets=S.draft.newpets||{};return S.draft.newpets},live=k=>!!(S.live&&S.live.newpets&&S.live.newpets[k]);
 function slug(name){let b=String(name||'pet').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,9)||'pet';let k='np_'+b,i=2;
  while(D()[k]||(S.live&&S.live.newpets||{})[k]){const n=String(i++);k='np_'+b.slice(0,9-n.length)+n}return k}
 // make a new pet in the draft; returns its item key (pet_np_...)
 async function create(name){const k=slug(name),r={n:String(name||'New pet').trim().slice(0,24)||'New pet',d:'',v:0};D()[k]=r;await API.dset('draft/newpets/'+k,r);sync();return'pet_'+k}
 async function openLook(it){const tb=document.querySelector('#dvs [data-tab="pets"]');if(tb){tb.click();setTimeout(()=>{const b=document.querySelector('#dvs [data-k="'+it+'"]');if(b)b.click()},150)}}
 function render(){const all=Object.entries(D()).sort((a,b)=>a[1].n.localeCompare(b[1].n));
  let h='<div class="dv-card"><b>🐾 New pets</b><p class="dv-mut">Pets that aren\'t in the game yet. Make one, give it a name and a few words, then draw it in the Pets tab (standing and walking frames). '+
   'With a price it\'s sold at Marlo\'s Emporium; without one it\'s a rare pet you hand out: a monster drop or loot table (Monsters / Content), a shop of your own, or a gift (Admin). '+
   'Publish to put it in everyone\'s game. A published pet can\'t be removed (players may own it).</p>'+
   '<div class="dv-row" style="gap:6px"><input data-npn placeholder="Name of the new pet" maxlength="24" style="flex:1"><button class="dv-b dv-pri" data-np="new">＋ Make it</button></div></div>';
  for(const[k,r]of all){const it='pet_'+k,look=S.draft.pets&&S.draft.pets[k];
   h+='<div class="dv-card" style="margin-top:8px"><div class="dv-row" style="gap:10px;align-items:center;flex-wrap:wrap"><img alt="" src="'+E(API.thumb?API.thumb(it):'')+'" style="width:48px;height:48px;image-rendering:pixelated">'+
    '<b>'+E(r.n)+'</b><span class="dv-mut">'+E(it)+(live(k)?' · published':' · not published yet')+(look?'':' · no look drawn yet')+'</span></div>'+
    '<div class="dv-row" style="gap:6px;flex-wrap:wrap;margin-top:6px"><label class="dv-mut">Name <input data-npf="n" data-k="'+E(k)+'" value="'+E(r.n)+'" maxlength="24"></label>'+
    '<label class="dv-mut">Marlo\'s price <input data-npf="v" data-k="'+E(k)+'" type="number" min="0" step="100" value="'+(r.v|0)+'" style="width:110px"></label><span class="dv-mut">'+(r.v?'sold for '+(+r.v).toLocaleString('en-US')+' gold':'0 = rare, not sold')+'</span></div>'+
    '<label class="dv-mut" style="display:block;margin-top:6px">What the bag says about it<input data-npf="d" data-k="'+E(k)+'" value="'+E(r.d)+'" maxlength="300" style="width:100%"></label>'+
    '<div class="dv-row" style="gap:6px;margin-top:6px"><button class="dv-b dv-pri" data-np="look:'+E(k)+'">'+(look?'Edit its look':'Draw its look')+'</button><button class="dv-b" data-np="give:'+E(k)+'">Give me one (testing)</button>'+
    (live(k)?'':'<button class="dv-b dv-bad" data-np="del:'+E(k)+'">Delete</button>')+'</div></div>'}
  if(!all.length)h+='<p class="dv-mut">No new pets yet.</p>';return h}
 document.addEventListener('change',async e=>{if(S.tab!=='newpets')return;const t=e.target;if(!t.dataset||!t.dataset.npf)return;const k=t.dataset.k,r=D()[k];if(!r)return;
  const f=t.dataset.npf;let v=t.value;if(f==='v')v=Math.max(0,Math.min(1e7,Math.floor(+v||0)));else if(f==='n'){v=String(v).trim().slice(0,24);if(!v){toast('It needs a name.');API.draw();return}}else v=String(v).slice(0,300);
  r[f]=v;try{await API.dset('draft/newpets/'+k+'/'+f,v);sync();API.draw()}catch(err){fail(err)}},true);
 document.addEventListener('click',async e=>{if(S.tab!=='newpets'&&S.tab!=='pets')return;const t=e.target.closest&&e.target.closest('[data-np]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();e.stopPropagation();
  const[a,k]=t.dataset.np.split(':');try{
   if(a==='new'){const inp=document.querySelector('#dvs [data-npn]'),n=inp&&inp.value.trim()||'New pet';const it=await create(n);toast(n+' made. Draw it now.');if(S.tab==='pets')openLook(it);else API.draw()}
   else if(a==='look')openLook('pet_'+k);
   else if(a==='give'){const it='pet_'+k;if(!EQ[it])return;inv[it]=(inv[it]|0)+1;try{saveLocal(true)}catch(_){}toast('One '+EQ[it].n+' is in your bag.')}
   else if(a==='del'){if(live(k))return;if(t.dataset.sure!=='1'){t.dataset.sure='1';t.textContent='Sure? Tap again';return}
    delete D()[k];await API.dset('draft/newpets/'+k,null);if(S.draft.pets&&S.draft.pets[k]){delete S.draft.pets[k];await API.dset('draft/pets/'+k,null)}sync();toast('Deleted.');API.draw()}}catch(err){fail(err)}},true);
 // the Pets tab's list gets a "New pet" button (111b calls this)
 SQNEWPETS.listBtn=()=>'<button class="dv-b dv-pri" data-np="new" style="margin:4px 0">＋ New pet</button>';
 SQNEWPETS.create=create;
 SQSUITE.addTab('newpets','New pets',{render,changes:(L,Dr)=>{const l=L&&L.newpets||{},d=Dr&&Dr.newpets||{},out=[];
  for(const k in d)if(JSON.stringify(l[k]||null)!==JSON.stringify(d[k]))out.push({kind:'ext',html:'🐾 '+(l[k]?'Changed':'New')+' pet: '+E(d[k].n)});
  for(const k in l)if(!d[k])out.push({kind:'ext',html:'🐾 Pet removed: '+E(l[k].n)+' (players who own one keep it in their save until it comes back)'});return out}});
 // the suite loads the draft when it opens: register its unpublished pets on this device
 {let seen=null;setInterval(()=>{const d=S.draft&&S.draft.newpets;const j=d?JSON.stringify(d):'';if(j!==seen){seen=j;sync()}},1500)}
})();
