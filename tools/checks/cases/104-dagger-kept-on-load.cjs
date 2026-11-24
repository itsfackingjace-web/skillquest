// Nov 23 (Jace's starsteel dagger went missing): 218's loader dropped a saved dagger whenever a bow, wand, hoe or can was also in the
// save's off-hand; now that dagger goes in the bag.
module.exports={name:'a saved dagger that can\'t go back in the off-hand goes in the bag instead of vanishing',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);for(const i of[0,8,12,13])XPS[i]=XT[85];
  inv.stdag=0;inv.eq_wfire_a=1;equipItem('eq_wfire_a');const S=JSON.parse(JSON.stringify(snap()));S.dag='stdag';S.inv.stdag=0;
  applySave(S);await W(200);const a=[occ('off'),inv.stdag|0];
  // the normal case is unchanged: a dagger alone in the off-hand comes back in hand
  unequipSlot('off');inv.stdag=1;equipItem('stdag');const S2=JSON.parse(JSON.stringify(snap()));applySave(S2);await W(200);return{a,b:[occ('off'),inv.stdag|0]}});
 t.eq(r.a,['eq_wfire_a',1],'the wand stays in hand and the starsteel dagger is in the bag');
 t.eq(r.b,['stdag',0],'a dagger alone in the off-hand loads in hand')}};
