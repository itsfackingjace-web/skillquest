module.exports={name:'game starts and runs',async run(p,t){
 const r=await p.evaluate(async()=>{const t0=time;await new Promise(r=>setTimeout(r,1500));return{run:time>t0,dead,hp:P.hp,inGame:!menuOpen&&!pnOpen,ver:window.SQVER}});
 t(r.run,'the game clock did not move');t(!r.dead,'player started dead');t(r.hp>0,'player has no health');t(!!r.ver,'no version (SQVER)')}};
