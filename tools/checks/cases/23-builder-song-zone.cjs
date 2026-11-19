// Island builder: the Song zone tool draws a box, its panel picks a song, and saving writes `sz` into the island's draft.
module.exports={name:'island builder draws song zones',async run(p,t){
 await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));window.SQDEV=()=>true;SQSUITE.open();await W(800);document.querySelector('#dvs [data-tab="islands"]').click();await W(100);
  document.querySelector('#dvs [data-ia="new"]').click();await W(50);document.querySelector('#dvs [data-if="newname"]').value='Tune Isle';document.querySelector('#dvs [data-ia="create"]').click();await W(300);
  document.querySelector('#dvs [data-ix="sz"]').click();await W(50)});
 const box=await p.locator('#dvi').boundingBox();
 await p.mouse.move(box.x+box.width*.3,box.y+box.height*.3);await p.mouse.down();await p.mouse.move(box.x+box.width*.5,box.y+box.height*.5,{steps:5});await p.mouse.up();await p.waitForTimeout(200);
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const sel=document.querySelector('#dvs [data-ixf="s"]');const panel=!!sel&&document.querySelector('#dvs').textContent.includes('Song zone');
  if(sel){sel.value='night';sel.dispatchEvent(new Event('input',{bubbles:true}));sel.dispatchEvent(new Event('change',{bubbles:true}))}await W(50);
  const sv=document.querySelector('#dvs [data-ia="save"]');if(sv)sv.click();await W(500);const I=SQSUITE.state.draft.islands||{};const k=Object.keys(I).find(q=>/tune/.test(q));
  return{panel,saved:!!sv,k,sz:k&&I[k].sz}});
 t(r.panel,'song zone panel shown');t(r.k,'island saved ('+r.saved+')');t(r.sz&&r.sz.length===1&&r.sz[0].s==='night','sz saved: '+JSON.stringify(r.sz))}};
