// Nov 26 (sniffynose, in-game report): cooking at the stove said only "Cooked 1." for every piece. 022's message names the food now.
module.exports={name:'the stove says which food it cooked',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);try{if(pnOpen)closePanel()}catch(e){}
  XPS[4]=XT[60];for(const c of COOKS){inv[c.raw]=0;inv[c.ck]=0}
  const i0=Math.floor(P.y/16)*N+Math.floor(P.x/16)+2,st={t:'stove',i:i0};STATION=st;shop='station';pnOpen=true;ptab=2;pn.style.display='block';rPn();
  const said=[],_s=say;say=function(m){said.push(String(m));return _s.apply(this,arguments)};
  inv.trout=2;inv.wheat=1;try{stationAct('ck_trout');if(window.SQDO)SQDO.d=.1;for(let k=0;k<40&&window.SQDO;k++)await W(100);
   stationAct('ck_wheat');if(window.SQDO)SQDO.d=.1;for(let k=0;k<40&&window.SQDO;k++)await W(100)}finally{say=_s}
  try{closePanel()}catch(e){}return said.filter(m=>/^(Cooked|Burnt) /.test(m))});
 t(r.length>=2,'cooking messages were shown: '+JSON.stringify(r));
 t(r.every(m=>/^(Cooked \d+ (trout|bread)|Burnt \d+ (raw trout|wheat))(, burnt \d+)?\.$/i.test(m)),'each names the food: '+JSON.stringify(r));
 t(!r.some(m=>/^Cooked \d+\.$|cooked cooked/i.test(m)),'no bare "Cooked 1." and no "cooked cooked"')}};
