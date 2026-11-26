// Nov 26 (Kevin's adamant golem vanished, Joe lost an hour switching devices; neither replayed): 292 reports once when another device
// takes over before this game's progress reached the account, and when a load drops the pet in the PET slot. Normal pet moves don't.
module.exports={name:'lost progress and vanished pets are reported, normal play is not',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(600);const base=SQPETWATCH.n,MP=window.SQMP,on=!!(MP&&MP.user&&MP.on);
  inv.pet_pgadam=1;inv.pet_pgiron=1;equipItem('pet_pgadam');await W(1200);equipItem('pet_pgiron');await W(1200);unequipSlot('pet');await W(1200);
  equipItem('pet_pgadam');await W(1200);inv.pet_pgiron=0;
  lastCloud='check-'+Date.now();await W(1500);// the account has this game's save
  const quiet=SQPETWATCH.n-base;
  SQSTRICT.lost=true;await W(1500);const sameLost=SQPETWATCH.n-base;SQSTRICT.lost=false;await W(1200);// nothing changed since: no report
  lastCloud='check2-'+Date.now();await W(1200);GLD+=250;inv.pet_pgmith=1;// progress that hasn't reached the account
  SQSTRICT.lost=true;await W(1500);const took=SQPETWATCH.n-base,kind=SQPETWATCH.last;SQSTRICT.lost=false;
  equipItem('pet_pgmith');await W(1200);const S=snap();S.cos=Object.assign({},S.cos,{pet:null,pets:[]});delete S.inv.pet_pgmith;S.savedAt=12345;S.dev='otherdev';
  applySave(S);await W(600);const load=SQPETWATCH.n-base-took,kind2=SQPETWATCH.last;
  return{on,quiet,sameLost,took,kind,load,kind2}});
 t(r.quiet===0,'swapping, unequipping and selling pets sent no report ('+r.quiet+')');
 t(r.sameLost===0,'losing the game with everything already saved sent no report ('+r.sameLost+')');
 t(r.took===1&&/took over before this one saved/.test(r.kind),'losing the game with unsaved gold and a new pet sent one report ('+r.took+', '+r.kind+')');
 t(r.on,'signed in for the load check');
 t(r.load===1&&/Pet vanished: pgmith/.test(r.kind2),'a load without the equipped pet sent one report ('+r.load+', '+r.kind2+')')}};
