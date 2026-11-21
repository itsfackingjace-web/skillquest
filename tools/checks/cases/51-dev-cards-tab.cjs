// Nov 20 (Jace): Dev Suite > Cards changes a card's text and drop rate through the draft, adds new cards that drop from a source,
// and asks twice before a published drop gets more common.
module.exports={name:'Dev Suite Cards tab edits cards and adds new ones',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);const D=SQDROPCARD,out={};
  await __dbForce({['devs/'+SQMP.user.uid]:true});window.SQDEV=()=>true;SQSUITE.open();await W(500);
  document.querySelector('#dvs [data-tab="cards"]').click();await W(200);const q=s=>document.querySelector('#dvs '+s);
  q('[data-dcs="slime"]').click();await W(100);
  const set=(f,v)=>{const e=q('[data-dcf="'+f+'"]');e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}))};
  set('d','2HP 2ATK');await W(50);set('r','0.5');await W(50);q('[data-dcx="save"]').click();await W(300);
  out.draft=JSON.parse(JSON.stringify((SQSUITE.state.draft.cards||{}).slime||null));
  // raising it above the published 1% needs a second click
  set('r','5');await W(50);q('[data-dcx="save"]').click();await W(200);out.afterOne=(SQSUITE.state.draft.cards.slime||{}).r;
  q('[data-dcx="save"]').click();await W(300);out.afterTwo=(SQSUITE.state.draft.cards.slime||{}).r;
  // a new card that drops from moss slimes
  const nn=q('[data-dcnew]');nn.value='Mossy King';nn.dispatchEvent(new Event('input',{bubbles:true}));q('[data-dcx="new"]').click();await W(150);
  set('src','slime:moss');await W(50);q('[data-dcx="save"]').click();await W(300);
  out.newDraft=JSON.parse(JSON.stringify(SQSUITE.state.draft.cards.cu_mossy_king||null));
  // the draft applied to the game
  D.applyLib(SQSUITE.state.draft);out.slime=[D.CARDS.slime.d,D.CARDS.slime.r];out.newItem=INAME[D.CARDS.cu_mossy_king&&D.CARDS.cu_mossy_king.key];
  window.SQDROPCARDALWAYS=true;window.SQSHINYALWAYS=false;const k0=inv.dc_cu_mossy_king|0,m0=inv.dc_slime_moss|0;enemyDrop({x:0,y:0,hp:0,kx:0,ky:0,type:'slime',rv:'moss',rk:'slime:moss'});window.SQDROPCARDALWAYS=false;
  out.fromMoss=[(inv.dc_cu_mossy_king|0)-k0,(inv.dc_slime_moss|0)-m0];
  // back to the game's own
  D.applyLib({});out.restored=[D.CARDS.slime.d,D.CARDS.slime.r,!!D.CARDS.cu_mossy_king];SQSUITE.close();return out});
 t.eq(r.draft,{n:'Slime',d:'2HP 2ATK',g:'reg',r:.005},'draft after Save');t.eq(r.afterOne,.005,'a higher rate saved on one click');t.eq(r.afterTwo,.05,'the higher rate after the second click');
 t.eq(r.newDraft,{n:'Mossy King',d:'1HP 1ATK',g:'reg',r:.01,src:'slime:moss'},'new card in the draft');
 t.eq(r.slime,['2HP 2ATK',.05],'the draft applied');t.eq(r.newItem,'Drop Card: Mossy King','new card item');t.eq(r.fromMoss,[1,0],'a moss slime drops the new card instead');
 t.eq(r.restored,['1HP 1ATK',.01,false],'back to the game\'s own cards')}};
