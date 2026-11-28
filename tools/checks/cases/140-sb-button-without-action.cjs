// Nov 28 (errs 'uncaught': "undefined is not an object (evaluating 'a[0]')" at 005's shopAct, 8 times on 2026.11.26-1): 005's panel click
// handler sent every .sb button to shopAct, but many later screens use .sb buttons without a data-a action. Those now pass through.
module.exports={name:'a panel button without a shop action doesn\'t throw',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);
  pnOpen=true;pn.style.display='block';pbd.innerHTML='<button class="sb" id="t140">Plain</button>';let err='';
  try{pbd.onclick({target:document.getElementById('t140'),preventDefault(){},stopPropagation(){}})}catch(e){err=String(e)}
  try{closePanel()}catch(e){/*quiet*/}return err});
 t.eq(r,'','clicking it threw')}};
