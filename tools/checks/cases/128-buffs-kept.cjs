// Nov 26 (Aztu, in-game report: "refreshing or logging out loses all your buffs"): 085's buffs were end times on performance.now(),
// never saved. 291 keeps the seconds left in the save (`bf`) and starts them again on load; a new character has none.
module.exports={name:'potion and meal buffs are kept through a reload',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);const B=LUX.BUFF,now=performance.now();
  B.str=now+90000;B.wis=now+600000;B.iron=0;saveLocal(true);const S=JSON.parse(localStorage.getItem(LS));
  for(const k in B)B[k]=0;// what a fresh page has
  applySave(S);const n2=performance.now(),left=k=>Math.round(((B[k]||0)-n2)/1000);
  const a={str:left('str'),wis:left('wis'),iron:B.iron||0,saved:S.bf};
  await W(700);const pill=(document.body.innerText||'').match(/STRENGTH \d+:\d\d/);
  newGame();const fresh=Object.keys(B).filter(k=>B[k]>performance.now());
  return{a,pill:!!pill,fresh}});
 t(r.a.saved&&r.a.saved.str>=85&&r.a.saved.wis>=595,'the save keeps the time left ('+JSON.stringify(r.a.saved)+')');
 t(r.a.str>=85&&r.a.str<=90,'strength still has about 90 s after the load ('+r.a.str+' s)');
 t(r.a.wis>=595&&r.a.wis<=600,'wisdom still has about 10 min after the load ('+r.a.wis+' s)');
 t(!r.a.iron,'a buff that had run out stays off');
 t(r.pill,'the STRENGTH timer shows again');
 t.eq(r.fresh,[],'a new character starts with no buffs')}};
