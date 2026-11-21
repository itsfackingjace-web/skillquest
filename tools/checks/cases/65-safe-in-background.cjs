// Nov 21 (Jace: "they see a full hunger bar but the game sees them as starving"): since Nov 20 the game keeps running in a hidden tab
// (252), so hunger drained and monsters attacked with nothing on screen. While hidden your HP can't go down and hunger stays put.
module.exports={name:'safe and fed while the game is in a background tab',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);
  P.hp=6;hunger=.3;en.length=0;en.push({x:P.x+4,y:P.y,hp:99,kx:0,ky:0});const t0=SQIDEAS252.ticks;
  let hid=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>hid});document.dispatchEvent(new Event('visibilitychange'));
  await W(3000);const mid=[P.hp,+hunger.toFixed(2),dead,SQIDEAS252.ticks-t0>3];
  hid=false;document.dispatchEvent(new Event('visibilitychange'));await W(100);en.length=0;P.hp--;const after=P.hp;delete document.hidden;return{mid,after}});
 t.eq(r.mid,[6,.3,false,true],'HP, hunger, fallen and the game still running while hidden');t.eq(r.after,5,'damage counts again when you come back')}};
