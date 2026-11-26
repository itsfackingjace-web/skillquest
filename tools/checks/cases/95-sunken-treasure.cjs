// Nov 23 (Jace): fishing sometimes reels in a sunken treasure chest (1 in 500), and very rarely (1 in 100,000) Davy's skeleton: a short
// scene where the ghost pirate rises out of it, talks, and flies into your bag. Forced here through window.SQTREASURE.
module.exports={name:'fishing: sunken treasure chests, and Davy\'s skeleton scene puts him in your bag',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);const out={},TR=window.SQTREASURE;if(!TR)return{err:'no SQTREASURE'};
  out.odds=[TR.CHEST,TR.SKEL];
  // /davy and /treasure are for developer accounts only
  const dv=window.SQDEV;window.SQDEV=()=>false;let leaked='';const _m0=TR.forced;try{mpSend('/davy')}catch(e){leaked=String(e)}out.notDev=TR.forced===null;
  window.SQDEV=()=>true;mpSend('/treasure');out.cmd=[TR.forced];mpSend('/davy');out.cmd.push(TR.forced);TR.force(null);window.SQDEV=dv;
  // Nov 26: fishing ends without a rod in hand (275, Kevin's worn-out rod), so hold one
  TL.rod=Math.max(TL.rod||0,1);const fish=()=>{const[bx,by]=front(24);FISH={px:P.x,py:P.y,bx,by,t:0,wait:999,bite:0}};
  // without Davy in the library, a skeleton roll is a chest
  fish();const g0=GLD;TR.force('skel');catchFish();for(let k=0;k<40&&GLD===g0;k++)await W(100);out.noDavy=[GLD>g0,!TR.state(),!!FISH];
  await W(300);
  // a chest: gold, one or two finds, fishing carries on
  const fr={w:4,h:4,s:2,p:'#ffffff99',r:SQA.pack('0000000000000000')};SQA.preview({newpets:{np_newpet:{n:'Davy',d:'',v:0}},pets:{np_newpet:{w:4,h:4,s:2,ox:-2,oy:-4,a:fr,b:fr,c:fr,d:fr}}});await W(300);
  const keys=TR.LOOT.map(l=>l[0]),before=Object.fromEntries(keys.map(k=>[k,inv[k]|0]));fish();const g1=GLD;TR.force('chest');catchFish();for(let k=0;k<40&&GLD===g1;k++)await W(100);
  const finds=keys.filter(k=>(inv[k]|0)>before[k]).length;out.chest=[GLD>g1,finds>=1&&finds<=2,!!FISH&&FISH.t>=0,/SUNKEN TREASURE/.test(document.getElementById('sqtc').innerText)];
  document.querySelector('#sqtc .sqtc-c').click();await W(300);
  // the skeleton: the world holds still, HIT does nothing, then Davy is in the bag
  let sent='';const _ms=window.mpSend;window.mpSend=m=>{sent=m};const _on=SQMP.on;
  fish();inv.pet_np_newpet=0;TR.speed=4;TR.force('skel');catchFish();for(let k=0;k<40&&!TR.state();k++)await W(100);out.started=!!TR.state();
  const x0=P.x,y0=P.y,sw0=swing;document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'d',code:'KeyD',bubbles:true}));await W(400);
  out.held=[Math.abs(P.x-x0)<.01&&Math.abs(P.y-y0)<.01,!FISH];try{attack()}catch(e){}out.noHit=swing===sw0;
  // a key after the skeleton has landed skips to the swoop
  for(let k=0;k<40&&TR.state()&&TR.state().t<3;k++)await W(100);document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'x',bubbles:true}));await W(50);out.skipped=TR.state()?TR.state().t>=10.8:true;
  for(let k=0;k<60&&TR.state();k++)await W(100);await W(1500);window.mpSend=_ms;TR.speed=1;
  out.davy=[inv.pet_np_newpet|0,!TR.state(),/JOINED YOU/.test(document.getElementById('sqtc').innerText)];out.sent=sent;out.desc=/bones lie somewhere in the deep/.test(IDESC.pet_np_newpet||'');out.on=_on;
  return out});
 if(r.err)return t(false,r.err);
 t.eq(r.odds,[1/500,1/100000],'the odds: a chest 1 in 500 catches, the skeleton 1 in 100,000');
 t.eq([r.notDev,r.cmd],[true,['chest','skel']],'/treasure and /davy set the next bite, for developers only');
 t.eq(r.noDavy,[true,true,true],'with no Davy in the library a skeleton roll gives a chest [gold, no scene, still fishing]');
 t.eq(r.chest,[true,true,true,true],'a chest [gold, one or two finds, fishing carries on, the card shows]');
 t.eq(r.started,true,'the skeleton scene starts');
 t.eq(r.held,[true,true],'during the scene [you stay where you are, fishing has stopped]');t.eq(r.noHit,true,'HIT does nothing during the scene');
 t.eq(r.skipped,true,'a key skips to Davy flying into you');
 t.eq(r.davy,[1,true,true],'Davy is in the bag afterwards [one Davy, the scene is over, the card shows]');
 if(r.on)t(/fished up Davy, the ghost pirate/.test(r.sent),'everyone online is told: "'+r.sent+'"');
 t.eq(r.desc,true,'Davy\'s bag description says where he comes from')}};
