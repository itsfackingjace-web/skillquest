// Nov 20 (Bear, in-game report: "Look at my health in screenshot. Maybe cap the decimals"): health can be a fraction (PvP damage,
// regeneration), and the HUD printed it in full ("4.333333333333333/6"). It shows one decimal at most now.
module.exports={name:'the health number has one decimal at most',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}
  const seen=[],_b=g3bar;g3bar=function(l,x,y,U,f,c,txt){if(l==='HP')seen.push(String(txt));return _b.apply(this,arguments)};
  const h0=P.hp;P.hp=13/3;await W(300);g3bar=_b;P.hp=h0;return seen.slice(-1)[0]||null});
 t.eq(r,'4.3/6','the HP bar says')}};
