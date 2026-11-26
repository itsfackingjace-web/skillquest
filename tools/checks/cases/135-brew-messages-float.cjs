// Nov 22 (Kevin, in-game report: "Every 4 or 5 brews, the tool tip pops up on the top instead of near my character"): 131 floats short
// messages by your character and sends longer ones to the message box; a brew that kept ingredients or made a double batch was too
// long. 218 now says it as two short lines, so every brew message floats.
module.exports={name:'every brewing message floats by the character',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);try{if(pnOpen)closePanel()}catch(e){}
  const B=SQBREW,BR=window.SQBREWSK;XPS[BR]=XT[98];const said=[],_s=say,_r=Math.random;
  const i0=Math.floor(P.y/16)*N+Math.floor(P.x/16)+2;STATION={t:'cauldron',i:i0};shop='station';
  say=function(m){said.push(String(m));return _s.apply(this,arguments)};Math.random=()=>0;// every ingredient kept, every batch doubled
  try{for(const rc of B.RECIPES){for(const k in rc.c)inv[k]=(inv[k]|0)+rc.c[k]*2;stationAct('cw_'+rc.k);if(window.SQDO){SQDO.d=.05}for(let k=0;k<20&&window.SQDO;k++)await W(50)}}
  finally{say=_s;Math.random=_r;STATION=null;shop=null}
  const brew=said.filter(m=>/^You (brew|kept) /.test(m));
  return{n:B.RECIPES.length,brew,long:brew.filter(m=>m.length>56),kept:brew.filter(m=>/kept/.test(m)).length,dbl:brew.filter(m=>/double batch/.test(m)).length}});
 t(r.brew.length>=r.n,'every recipe was brewed ('+r.brew.length+' messages for '+r.n+' recipes)');
 t(r.kept>0&&r.dbl>0,'kept ingredients and double batches were reported');
 t.eq(r.long,[],'no brewing message is too long to float')}};
