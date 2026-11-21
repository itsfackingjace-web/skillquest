// Nov 21 (Kevin on Discord): "Meteor wand ult is not considered a wand ult for the purposes of the magic perk". 216's Meteor Fall set
// its cooldown itself; it now takes 036's cuts (Magic 25 and 55, Ultimate Focus) like every other ultimate.
module.exports={name:'Meteor Fall gets the Magic cooldown cuts',async run(p,t){
 const r=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,300));const w0=WAND;WAND='meteor';XPS[ML]=XT[60];MANA=999;ULTCD=0;SCENE=null;
  castUlt();const cd=ULTCD;WAND=w0;ULTCD=0;return{cd,cut:SQULTCUT()}});
 t(r.cut>=4,'cut at Magic 60: '+r.cut);t.eq(r.cd,20-r.cut,'Meteor Fall cooldown')}};
