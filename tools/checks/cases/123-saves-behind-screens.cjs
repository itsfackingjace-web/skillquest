// Nov 26 (Joe, in-game report: phone to PC within 2 minutes, "everything reverted back at least 1 hour"): 006's 3 s device save and 15 s
// account save ran on the frame, which stops while a screen or the START menu is open (fishing, brewing and make-alls go on behind them).
// 290 saves on its own timer when 006's hasn't moved for 5 s.
module.exports={name:'the game keeps saving to the account while a screen is open',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(800);try{if(pnOpen)closePanel()}catch(e){}
  let n=0;const sc=saveCloud;saveCloud=function(){n++;return sc.apply(this,arguments)};
  showScreen('skills');await W(100);const open=pnOpen;inv.wood=(inv.wood|0)+3;// progress made behind the screen
  await W(22000);const behind=n;closePanel();saveCloud=sc;return{open,behind}});
 t(r.open,'a screen is open');t(r.behind>=1,'the account was saved while it stayed open ('+r.behind+' saves in 22 s)')}};
