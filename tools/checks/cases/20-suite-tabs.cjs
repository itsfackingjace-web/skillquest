// Every Dev Suite tab opens without a script error (the page-error check fails the case), and New pets can make a pet.
module.exports={name:'every Dev Suite tab opens',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));window.SQDEV=()=>true;SQSUITE.open();await W(800);
  const S=SQSUITE.state;const tabs=[...document.querySelectorAll('#dvs [data-tab]')].map(b=>b.dataset.tab);const bad=[];
  for(const k of tabs){const b=document.querySelector('#dvs [data-tab="'+k+'"]');if(!b)continue;b.click();await W(120);if(S.tab!==k)bad.push(k+': did not open')}
  document.querySelector('#dvs [data-tab="newpets"]').click();await W(100);const inp=document.querySelector('#dvs [data-npn]');inp.value='Moth';
  document.querySelector('#dvs [data-np="new"]').click();await W(400);
  const made=!!EQ.pet_np_moth&&!!(S.draft.newpets&&S.draft.newpets.np_moth);const listed=document.querySelector('#dvs').textContent.includes('Moth');
  const dbg=[S.ok,JSON.stringify(S.draft&&S.draft.newpets),!!S.live,document.querySelector('#dvs').textContent.slice(0,300)];SQSUITE.close();return{n:tabs.length,bad,made,listed,dbg}});
 t(r.n>10,'found '+r.n+' tabs');t.eq(r.bad,[],'tabs');t(r.made,'new pet made in the draft and registered '+JSON.stringify(r.dbg));t(r.listed,'new pet listed')}};
