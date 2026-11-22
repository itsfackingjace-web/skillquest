// Nov 21 (sniffynose, snitzler: "in your menu or skills ... ur food doesint go down ... so u can just [fish] forever"): a screen
// (pnOpen) pauses the world, but fishing goes on behind it. While you skill behind a screen, food now drains, and at 0 food the
// skilling stops. With a screen open and nothing going on, food stays put (the world is paused).
module.exports={name:'skilling behind a screen uses food, and stops when it runs out',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));en.length=0;
  const px=Math.floor(P.x/16),py=Math.floor(P.y/16);let spot=null;
  for(let d=1;d<80&&!spot;d++)for(let y=py-d;y<=py+d&&!spot;y++)for(let x=px-d;x<=px+d;x++){if(!fishWaterAt(x,y+1)||fishWaterAt(x,y)||solid(x*16+8,y*16+8))continue;spot=[x,y];break}
  if(!spot)return{spot:null};P.x=spot[0]*16+8;P.y=spot[1]*16+8;face=[0,1];inv.rod=1;TL.rod=Math.max(TL.rod||0,1);await W(300);
  const said=[];const _s=say;say=function(x){said.push(String(x));return _s.apply(this,arguments)};
  // a screen open, not skilling: paused, no food used
  pnOpen=true;ptab=0;hunger=50;await W(1500);const idle=50-hunger;pnOpen=false;
  // fishing, then a screen opens
  attack();await W(200);const cast=!!FISH;pnOpen=true;ptab=0;hunger=50;await W(2000);const used=50-hunger,still=!!(FISH||window.SQDO);
  // running out: the fishing stops
  hunger=.05;await W(800);const stopped=!(FISH||window.SQDO),hp=P.hp;pnOpen=false;say=_s;
  return{spot,idle,cast,used,still,stopped,msg:said.some(x=>/too hungry/.test(x)),hp}});
 t(r.spot,'no fishing spot near the start');if(!r.spot)return;t(r.cast,'the line was never cast');
 t(r.idle<.01,'food went down with a screen open and nothing going on: '+r.idle);
 t(r.used>.3,'food used in 2 s of fishing behind a screen: '+r.used);t(r.still,'fishing stopped behind the screen while there was food');
 t(r.stopped,'fishing went on at 0 food behind a screen');t(r.msg,'no "too hungry" message');t(r.hp>0,'hurt while paused')}};
