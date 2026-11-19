// HIT and EAT steps that take over the button must stop there (Nov 18: some step-list steps let the rest of HIT/EAT run too).
//  - HIT while fishing reels in only: no swing, no new cast.
//  - HIT while placing a house tries to place it only: no swing.
//  - EAT while a campfire cooking job runs eats something and the same job carries on (players had to walk away from the fire).
module.exports={name:'HIT and EAT stop after reeling in, placing a build or eating while cooking',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));en.length=0;const out={};
  const px=Math.floor(P.x/16),py=Math.floor(P.y/16);let spot=null;
  for(let d=1;d<80&&!spot;d++)for(let y=py-d;y<=py+d&&!spot;y++)for(let x=px-d;x<=px+d;x++){if(!fishWaterAt(x,y+1)||fishWaterAt(x,y)||solid(x*16+8,y*16+8))continue;spot=[x,y];break}
  P.x=spot[0]*16+8;P.y=spot[1]*16+8;face=[0,1];inv.rod=1;TL.rod=Math.max(TL.rod||0,1);await W(300);
  // fishing: cast, then HIT reels in
  attack();await W(300);out.cast=!!FISH;swing=0;attack();out.reel={fish:!!FISH,swing:+swing.toFixed(2)};await W(300);out.reel.later=!!FISH;
  // building: HIT places, nothing else
  P.x-=32;face=[1,0];await W(200);inv.house=1;startBuild('house');await W(100);swing=0;const n0=HOUSES.filter(o=>!o._foreign).length;attack();
  out.build={placed:HOUSES.filter(o=>!o._foreign).length-n0,swing:+swing.toFixed(2),building:!!BUILD};if(BUILD)endBuild('');
  // cooking: a cook job, then EAT eats and the job carries on
  P.hp=3;hunger=40;inv.meat=6;inv.cooked=0;inv.berry=5;fires.push({x:P.x+20,y:P.y,life:600});await W(200);
  eat();await W(100);const job=typeof SQDO!=='undefined'?SQDO:null;out.cook={job:!!job&&job.kind};const b0=inv.berry|0,h0=hunger,hp0=P.hp,c0=inv.cooked|0;
  eat();await W(100);out.cook.same=SQDO===job;out.cook.ate=(inv.berry|0)<b0||hunger>h0||P.hp>hp0||(inv.cooked|0)<c0;
  return out});
 t(r.cast,'the line was never cast');t.eq(r.reel,{fish:false,swing:0,later:false},'HIT while fishing');
 t.eq(r.build.swing,0,'HIT while placing a house swung as well');t(r.build.placed===1||r.build.building,'HIT while placing a house dropped the build');
 t.eq(r.cook,{job:'cook',same:true,ate:true},'EAT while cooking')}};
