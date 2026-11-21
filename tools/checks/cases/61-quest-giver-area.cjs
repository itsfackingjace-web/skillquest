// Nov 20 (Bear): "This quest says return to Mira on No Man's Land, but Mira is in Oasis Rest in Dusthaven". The Outlaw Country quests
// happen in No Man's Land; handing one in points at Mira, on Hollow Island (243's SQGIVERAREA).
module.exports={name:'Outlaw Country quests point back to Mira in Dusthaven',async run(p,t){
 const r=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,400));window.routeOpen=()=>true;window.SQGUIDE=null;
  SQ_SIDE.nomans.index=0;SQ_SIDE.nomans.on=true;SQ_SIDE.nomans.k=99;SQTRKSET('s:nomans:0');await new Promise(r=>setTimeout(r,500));
  const T=SQTRACK();return{ready:!!(T.e&&T.e.ready),area:T.t?T.t.area:null,step:T.e&&T.e.step}});
 t(r.ready,'the quest isn\'t ready to hand in: '+JSON.stringify(r));t.eq(r.area,'hollow','where the tracker points')}};
