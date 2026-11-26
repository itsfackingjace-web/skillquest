// Nov 26 (Amethyst, in-game report: "PVP on covers whatever active quest you're doing"): 064's badge was a fixed box 236 px from the
// top, over the quest box on some phones. It's a chip in the row under the quest box now (294).
module.exports={name:'PvP ON shows as a chip under the quest box, not over it',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);const PV=window.SQPVP;if(!PV)return{pv:false};
  const was=PV.on;PV.on=true;await W(700);const L=hudLayout(),c=L.chips.find(q=>q[0]==='pvp'),pvb=document.getElementById('pvb');
  await W(200);const drawn=(window.SQCHIPS||[]).find(q=>q.k==='pvp');
  const o={pv:true,mp:!!window.SQMPON&&SQMPON(),chip:c&&c[1],below:L.cy>=L.qy+26*L.U-1,stack:L.stackBottom>=L.cy+22*L.U-1,drawn:!!drawn,dom:pvb?getComputedStyle(pvb).display:'none'};
  PV.on=was;await W(400);o.off=!hudLayout().chips.some(q=>q[0]==='pvp');return o});
 t(r.pv,'PvP state is there');t(r.mp,'signed in');
 t(/PvP ON/.test(r.chip||''),'the chip row has PvP ON: '+r.chip);
 t(r.below&&r.stack,'the chip row is under the quest box and the stack ends under it');
 t(r.drawn,'the chip is drawn');t.eq(r.dom,'none','the old fixed badge stays hidden');
 t(r.off,'the chip goes away when PvP is off')}};
