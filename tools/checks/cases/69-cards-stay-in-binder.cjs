// Nov 21 (Jace): "I keep randomly losing certain cards", pet cards named "pweb"/"psquir", and the wiki only showing pet cards he had.
// DEPOSIT BAG put the hidden cards into the chest; 254 looked for pets on window.EQ (028's EQ is a script-level const), so no pet card
// existed until a save had one, and those got the raw key as a name.
module.exports={name:'DEPOSIT BAG leaves cards in the binder; every pet has a named card',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);const D=SQDROPCARD;
  const ck=D.CARDS.slime.key;inv[ck]=3;inv.wood=5;inv.pc_pet_psquir=1;
  CHEST_H={t:'chest',items:{}};CHEST_AT=-1;fromMenu=false;pnOpen=true;ptab=7;pn.style.display='block';rPn();await W(200);SQDEPOSIT();await W(100);
  const dep={bagCard:inv[ck]|0,bagPet:inv.pc_pet_psquir|0,bagWood:inv.wood|0,chest:Object.keys(CHEST_H.items).sort()};try{closePanel()}catch(e){}
  const pets=Object.keys(EQ).filter(k=>EQ[k]&&EQ[k].slot==='pet'),cards=pets.filter(k=>SQBINDER.PET['pc_'+k]);
  const raw=cards.filter(k=>/^Pet Card: [a-z0-9_]+$/.test(INAME['pc_'+k]||''));
  const wikiPets=(SQWK.h.WK2.dropcard().map(e=>e.h).find(h=>/Pet cards/.test(h))||'').split('data-wkp="item:pc_').length-1;
  return{dep,pets:pets.length,cards:cards.length,raw,names:[INAME.pc_pet_psquir,INAME.pc_pet_pweb],wikiPets}});
 t.eq(r.dep,{bagCard:3,bagPet:1,bagWood:0,chest:['wood']},'DEPOSIT BAG');t.eq(r.cards,r.pets,'pets with a card ('+r.pets+' pets)');
 t.eq(r.raw,[],'pet cards named with a raw key');t.eq(r.names,['Pet Card: Squirrel','Pet Card: Webling'],'pet card names');t.eq(r.wikiPets,r.pets,'pet cards in the wiki')}};
