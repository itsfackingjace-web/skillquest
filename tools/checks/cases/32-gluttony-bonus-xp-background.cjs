// Nov 20 (#ideas): Gluttony eats for you at Cooking 99; bonus items from perks give XP; the game keeps running in a hidden tab.
module.exports={name:'Gluttony, XP for bonus items, background tab keeps going',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  XPS[4]=XT[98];inv.cooked=5;P.hp=2;hunger=60;await W(1200);o.ate=[P.hp>2,(inv.cooked|0)<5];
  XPS[1]=XT[60];addXp(1,25);inv.wood=10;const x0=XPS[1],rnd=Math.random;Math.random=()=>0;try{gBoost(1,{wood:2},100,100)}finally{Math.random=rnd}o.bonusXp=XPS[1]-x0;o.wood=inv.wood;
  Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));const t0=SQIDEAS252.ticks;await W(1000);o.ticks=SQIDEAS252.ticks-t0;
  delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));return o});
 t.eq(r.ate,[true,true],'Gluttony did not eat at 2 hearts');t(r.bonusXp>0,'no XP for the bonus log');t(r.wood>10,'no bonus log');t(r.ticks>=3,'the hidden tab did not keep ticking ('+r.ticks+')')}};
