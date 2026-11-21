// Nov 20 (Kass): "Need 'cook all' on pizza and stew". Stove meals (177) get a Cook all button: as many as the ingredients allow.
module.exports={name:'Cook all for stove meals',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);
  const SV=window.SQSTOVE;const i=SV.length;SV.push({k:'stew',n:'Fish stew',c:{berry:2,shroom:1},lv:1,xp:10});inv.berry=7;inv.shroom=5;inv.stew=0;
  const i0=Math.floor(P.y/16)*N+Math.floor(P.x/16)+2;const st={t:'stove',i:i0};STATION=st;shop='station';
  const html=stationHTML(st),btn=html.includes('data-a="sva_'+i+'"')&&/Cook all Fish stew \(3\)/.test(html);
  stationAct('sva_'+i);for(let k=0;k<150&&window.SQDO;k++)await W(100);SV.splice(i,1);return{btn,stew:inv.stew|0,berry:inv.berry|0}});
 t(r.btn,'no Cook all button for the meal');t.eq([r.stew,r.berry],[3,1],'3 stews cooked from 7 berries and 5 mushrooms')}};
