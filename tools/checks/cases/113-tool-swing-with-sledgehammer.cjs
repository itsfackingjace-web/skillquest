// Nov 24 (Jace): "when I chop trees or mine it uses my sledgehammer swing animation rather than my axe or pickaxe animation".
// 122 skipped the tool swing whenever the sledgehammer was the main weapon, and the tool action only lasted its 0.32-0.5 s strike, so
// the rest of a chop (1 s since 287) drew the main weapon's swing. Now the sledgehammer only takes over boulders, and the axe or
// pickaxe stays in hand for the whole swing (ACTN.sd = the strike, ACTN.dur = the swing).
module.exports={name:'chopping and mining show the axe and pickaxe for the whole swing, even with the sledgehammer',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}const o={};en=[];
  XPS[0]=XT[98];XPS[1]=XT[98];XPS[2]=XT[98];TL.axe=7;TL.pick=7;inv.eq_sledge=1;equipItem('eq_sledge');o.sledge=!!(window.SQSLEDGE&&SQSLEDGE());
  const tile=()=>{face=[0,1];const[fx,fy]=front(13);return Math.floor(fy/16)*N+Math.floor(fx/16)};
  // HIT once at a fresh object; then what the tool action is at 0.05 s and 0.7 s into the swing
  const hit=(ob)=>{const i=tile();obj[i]=ob;ACTN=null;swing=0;attack();const a=ACTN,s=swing,r0=a?[a.type,Math.round(a.dur*100)/100,Math.round((a.sd||a.dur)*100)/100]:null;
   actFx(.05);const t1=ACTN&&ACTN.type;actFx(.65);const t2=ACTN&&ACTN.type;obj[i]=null;ACTN=null;swing=0;return{a:r0,s:Math.round(s*100)/100,t1,t2}};
  o.tree=hit({t:'yew',hp:OHP.yew});
  o.rock=hit({t:'rock',hp:OHP.rock||4});
  const bk=window.SQBOUL&&Object.keys(SQBOUL)[0];o.bk=bk;if(bk){OHP[bk]=OHP[bk]||10;o.boulder=hit({t:bk,hp:OHP[bk]})}
  unequipSlot('main');return o});
 t(r.sledge,'the sledgehammer is in hand');
 t.eq(r.tree.a&&r.tree.a[0],'chop','a tree shows the axe, not the sledgehammer');
 t.eq([r.tree.a&&r.tree.a[1],r.tree.a&&r.tree.a[2]],[r.tree.s,.5],'the chop lasts the whole 1 s swing (a 0.5 s strike, then the axe held)');
 t.eq([r.tree.t1,r.tree.t2],['chop','chop'],'0.7 s into the chop the axe is still out (no weapon swing)');
 t.eq(r.rock.a&&r.rock.a[0],'mine','a rock shows the pickaxe');
 if(r.bk)t(!r.boulder.a||r.boulder.a[0]!=='mine','a boulder is the sledgehammer\'s ('+r.bk+')')}};
