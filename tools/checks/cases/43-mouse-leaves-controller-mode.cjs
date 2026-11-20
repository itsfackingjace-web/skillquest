// Nov 20 (Jace and his brother): with a controller plugged in, the controller's gold ring stayed on the bag/gear/skill the
// controller last pointed at while they clicked with the mouse, so clicks looked like they did nothing. A mouse click now leaves
// controller mode (ring hidden); using the controller again brings it back without a "Controller connected!" message.
module.exports={name:'clicking with the mouse leaves controller mode',async run(p,t){
 await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
  const pad=window.__pad={id:'Xbox Wireless Controller (STANDARD GAMEPAD)',index:0,connected:true,mapping:'standard',timestamp:1,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0}))};
  navigator.getGamepads=()=>[pad,null,null,null];window.dispatchEvent(Object.assign(new Event('gamepadconnected'),{gamepad:pad}));
  await W(500);inv.berry=3;inv.wood=2;showScreen('bag');await W(400)});
 const a=await p.evaluate(()=>({on:GPON,ring:document.getElementById('sqgpr').style.display}));
 const pos=await p.evaluate(()=>{const b=[...document.querySelectorAll('#pbd .slot')].find(x=>x.dataset.k==='berry');const r=b.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});
 await p.mouse.click(pos[0],pos[1]);await p.waitForTimeout(300);
 const b=await p.evaluate(()=>({on:GPON,ring:document.getElementById('sqgpr').style.display,sel:[...document.querySelectorAll('#pbd .slot.on')].map(x=>x.dataset.k)}));
 const c=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));msg='';
  const pad=window.__pad;pad.buttons[13]={pressed:true,touched:true,value:1};pad.timestamp++;await W(150);pad.buttons[13]={pressed:false,touched:false,value:0};pad.timestamp++;await W(300);return{on:GPON,said:[String(msg||'')]}});
 t(a.on&&a.ring==='block','the controller ring wasn\'t showing to begin with ('+JSON.stringify(a)+')');
 t(!b.on,'still in controller mode after a mouse click');t.eq(b.ring,'none','the ring after a mouse click');t.eq(b.sel,['berry'],'the item picked by the click');
 t(c.on,'pressing the controller didn\'t bring controller mode back');t(!c.said.some(s=>/Controller connected/.test(s)),'said "Controller connected!" again')}};
