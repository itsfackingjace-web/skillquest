// Nov 24: Dev Suite > Balance > Material XP edits the draft's balance.mat (a number back at the game's own is dropped, a new
// material needs both numbers), and the Recipes tab shows a furnace/anvil recipe's XP as coming from its materials.
module.exports={name:'Dev Suite: Balance > Material XP edits the draft and Recipes shows material-based XP',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));window.SQDEV=()=>true;SQSUITE.open();await W(800);const S=SQSUITE.state,out={};
  const q=s=>document.querySelector('#dvs '+s),set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}))};
  // Recipes tab first (a Balance tab with unsaved changes asks before you leave it): the adamant helmet
  q('[data-tab="recipes"]').click();await W(200);const row=[...document.querySelectorAll('#dvs [data-rcs]')].find(e=>/Adamant helmet/.test(e.textContent));out.rrow=row?row.textContent.replace(/\s+/g,' '):null;
  if(row){row.click();await W(200)}out.ed=/340 xp, 2 s \(from its materials/.test(document.getElementById('dvs').textContent);out.xpInput=!!q('[data-rcw="xp"]');
  q('[data-tab="balance"]').click();await W(150);const b=q('[data-bv="mat"]');out.btn=!!b;if(!b)return out;b.click();await W(150);
  const inp=q('[data-bx="mat.abar.x"]');out.inp=!!inp;if(!inp)return out;set(inp,'200');await W(100);
  out.d1=JSON.stringify(S.draft.balance&&S.draft.balance.mat);
  out.preview=/Forge Adamant chestplate[^]*?Smithing 72[^]*?4 Adamant bar\s*800/.test(document.getElementById('dvs').textContent);
  set(q('[data-bx="mat.abar.x"]'),'170');await W(100);out.d2=JSON.stringify(S.draft.balance&&S.draft.balance.mat);
  q('[data-mxn="k"]').value='bone';q('[data-mxn="x"]').value='7';q('[data-bv="matadd"]').click();await W(100);out.half=JSON.stringify(S.draft.balance.mat);
  q('[data-mxn="k"]').value='bone';q('[data-mxn="x"]').value='7';q('[data-mxn="t"]').value='0.5';q('[data-bv="matadd"]').click();await W(100);out.added=JSON.stringify(S.draft.balance.mat);
  out.row=!!q('[data-bx="mat.bone.t"]');q('[data-bv="matdel:bone"]').click();await W(100);out.del=JSON.stringify(S.draft.balance.mat);
  SQSUITE.close();return out});
 t(r.btn&&r.inp,'Balance has a Material XP view with an XP box per material');
 t.eq(r.d1,'{"abar":{"x":200}}','changing the adamant bar\'s XP goes into the draft');
 t(r.preview,'the recipe list under it shows the adamant chestplate at 800 xp');
 t.eq(r.d2,'{}','putting the game\'s own number back drops the change');
 t.eq(r.half,'{}','a new material needs both an XP and a time');
 t.eq(r.added,'{"bone":{"x":7,"t":0.5}}','a new material is added with both');
 t(r.row,'it gets its own row');t.eq(r.del,'{}','and can be taken off the list');
 t(/340\s*mat/.test(r.rrow||''),'the Recipes list shows the adamant helmet\'s XP from its materials: '+r.rrow);
 t(r.ed&&!r.xpInput,'its editor shows the XP and time from its materials instead of an XP box')}};
