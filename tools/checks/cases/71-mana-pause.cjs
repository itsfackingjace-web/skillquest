// Nov 21 (Jace): "Mana regen at my level is way faster than i can even deplete it" / "what if we put a short pause on mana regen after
// casting a spell?". At Magic 99 in full mage armour, holding CAST kept the bar full (6.5 back a second vs 2.5 spent). Now mana stops
// refilling for 1.5 s after any is spent: holding CAST drains it, and it refills again once you stop.
module.exports={name:'mana stops refilling for a moment after casting',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);isPC=false;
  const el=document.getElementById('aimb');el.style.display='flex';const b=el.getBoundingClientRect();
  const fire=(type,id)=>{const e=new Event(type,{bubbles:true,cancelable:true});const tt=[{identifier:id,clientX:b.left+b.width/2,clientY:b.top+b.height/2,target:el}];
   Object.defineProperty(e,'changedTouches',{value:tt});Object.defineProperty(e,'touches',{value:type==='touchend'?[]:tt});el.dispatchEvent(e)};
  const ML=SKN.indexOf('Magic');XPS[ML]=XT[98];CLS={helm:'m',body:'m',legs:'m'};for(const s of['helm','body','legs'])ARM[s]=0;WAND='fire';
  const mx=maxMP(),o={mx};
  // regen still works when you haven't cast
  MANA=0;await W(1700);const r0=MANA;await W(2000);o.regen=MANA-r0;// (setting MANA to 0 counts as spending it, so wait out that pause first)
  // hold CAST for 4 s from full
  MANA=mx;swing=0;fire('touchstart',11);await W(4000);fire('touchend',11);o.held=mx-MANA;
  // right after letting go: paused, then it refills
  await W(150);const a=MANA;await W(900);o.pausedGain=MANA-a;o.paused=!!(window.SQMANAPAUSE&&SQMANAPAUSE.paused);await W(2500);o.laterGain=MANA-a;
  return o});
 t(r.regen>=5,'mana refilled only '+r.regen.toFixed(1)+' in 2 s without casting');
 t(r.held>=6,'holding CAST for 4 s only used '+r.held.toFixed(1)+' of '+r.mx+' mana');
 t(r.pausedGain<.3,'mana refilled '+r.pausedGain.toFixed(2)+' within a second of the last cast');t(r.paused,'not paused right after casting');
 t(r.laterGain>=5,'mana refilled only '+r.laterGain.toFixed(1)+' once the pause was over')}};
