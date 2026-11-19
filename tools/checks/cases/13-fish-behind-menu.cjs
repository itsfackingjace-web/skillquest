// Fishing keeps going with the START menu open: bites come, the reel runs behind the menu, fish land, the menu stays open.
module.exports={name:'fishing keeps going while the START menu is open',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));en.length=0;
  const px=Math.floor(P.x/16),py=Math.floor(P.y/16);let spot=null;// land with water just below it
  for(let d=1;d<80&&!spot;d++)for(let y=py-d;y<=py+d&&!spot;y++)for(let x=px-d;x<=px+d;x++){if(!fishWaterAt(x,y+1)||fishWaterAt(x,y)||solid(x*16+8,y*16+8))continue;spot=[x,y];break}
  if(!spot)return{spot:null};P.x=spot[0]*16+8;P.y=spot[1]*16+8;face=[0,1];inv.rod=1;TL.rod=Math.max(TL.rod||0,1);await W(300);
  const fi=SKN.indexOf('Fishing'),xp0=XPS[fi];attack();await W(200);const cast=!!FISH;openSM();
  let reeled=false,closed=false;const end=Date.now()+40000;
  while(Date.now()<end&&XPS[fi]===xp0){await W(250);if(typeof SQDO!=='undefined'&&SQDO&&SQDO.kind==='reel')reeled=true;if(!smOpen)closed=true}
  return{spot,cast,reeled,closed,gained:XPS[fi]-xp0}});
 t(r.spot,'no fishing spot near the start');t(r.cast,'the line was never cast');t(r.reeled,'no bite reeled in while the menu was open');
 t(r.gained>0,'no fish caught in 40 s with the START menu open');t(!r.closed,'the START menu closed by itself')}};
