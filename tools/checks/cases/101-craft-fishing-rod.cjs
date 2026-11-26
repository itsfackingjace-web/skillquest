// Nov 23 (Jace): "Make fishing rods craftable!" The Craft tab hid the rod once you had one, so with rods wearing out (275) you
// couldn't make a spare. Now it's always listed; with a rod in hand the new one goes in the bag.
module.exports={name:'fishing rods can always be crafted: the first is equipped, more go in the bag as spares',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}const out={};
  XPS[6]=XT[10];inv.wood=20;inv.iron=5;TL.rod=0;inv.eq_rod=0;
  const btn=()=>{pnOpen=true;ptab=1;pn.style.display='block';rPn();return[...pbd.querySelectorAll('.rc')].find(b=>/Fishing rod/.test(b.innerText))||null};
  /* Nov 26: no random perk refunds (a full run once got 13 wood back instead of 12) */const make=async()=>{const b=btn();if(!b)return false;const _r=Math.random;Math.random=()=>.995;try{b.click();for(let k=0;k<60&&window.SQDO;k++){SQDO.d=.1;await W(100)}await W(50)}finally{Math.random=_r}closePanel();return true};
  out.first=[await make(),TL.rod|0,inv.eq_rod|0,inv.wood|0,inv.iron|0];
  const b=btn();out.listed=b?b.innerText.replace(/\s+/g,' '):null;closePanel();
  out.spare=[await make(),TL.rod|0,inv.eq_rod|0,inv.wood|0,inv.iron|0];
  out.listed2=(btn()||{innerText:''}).innerText.replace(/\s+/g,' ');closePanel();
  return out});
 t.eq(r.first,[true,1,0,16,4],'the first rod is crafted and equipped (4 wood, 1 iron ore)');
 t(/a spare for your bag/.test(r.listed||''),'with a rod in hand the recipe is still there: '+r.listed);
 t.eq(r.spare,[true,1,1,12,3],'a second rod goes in the bag');
 t(/you have 1/.test(r.listed2||''),'the recipe says how many spares you have: '+r.listed2)}};
