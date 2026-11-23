// Nov 21 (Discord): Kevin's approved idea "a 'use first' for logs with fire making like we have an eat first", and his bugs: an oak fire
// showed two XP numbers, and fuel saved by perks came back as plain wood instead of the log you burned.
module.exports={name:'BURN FIRST for logs; one XP number and the right logs back for a tier fire',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);const FM=5;XPS[FM]=Math.max(XPS[FM],XT[20]);
  fires.length=0;inv.oaklog=3;inv.wood=2;inv.stone=1;
  // pin oak logs in the bag
  invSel='oaklog';ptab=4;pnOpen=true;pn.style.display='block';rPn();const pin=pbd.querySelector('[data-firepin="oaklog"]');if(pin)pin.click();try{closePanel()}catch(e){}
  drops.length=0;fire();
  // a perk saves one piece of fuel while the fire is being lit
  let saved=false;for(let i=0;i<80;i++){await W(100);if(!saved&&window.SQDO){inv.wood++;saved=true}if(fires.some(f=>f.lg===1))break}
  await W(400);const f=fires.find(f=>f.lg===1);const tag=' '+AB[FM];
  return{pin:!!pin,lit:!!f,oak:inv.oaklog|0,wood:inv.wood|0,xpNums:drops.filter(d=>typeof d.tx==='string'&&d.tx.endsWith(tag)).length,saveKey:(()=>{saveLocal(true);return JSON.parse(localStorage.getItem(LS)).firep})()}});
 t(r.pin,'no BURN FIRST button on oak logs');t(r.lit,'FIRE didn\'t build an oak fire');t(r.oak>=1&&r.oak<=2&&r.wood===2,'oak logs and wood after (the saved fuel comes back as oak, never as wood): '+r.oak+' oak, '+r.wood+' wood');/* Nov 22: a real Fuel Saver roll can save a second log now and then (2 oak back): that's fine, wood must stay 2 */
 t.eq(r.xpNums,1,'XP numbers shown for the fire');t.eq(r.saveKey,'oaklog','pinned log in the save')}};
