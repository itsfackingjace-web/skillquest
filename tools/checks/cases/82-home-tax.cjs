// Nov 22 (Kevin's #ideas post, approved by Jace): homes pay tax at Penny's stall in Hollow Village. The first month is free; when the
// tax runs out the bank takes the home off the map and keeps it (with everything in it) until you pay a month + 10%; paying puts it back
// where it stood, or in your bag if the spot is taken. Other players stop seeing a home whose tax ran out.
module.exports={name:'home tax: free month, the bank keeps an unpaid home, paying gets it back',players:2,async run([A,B],t){
 const r=await A.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);const X=SQHTAX,DAY=864e5,now=()=>Date.now()+(+SQMP.off||0);
  const own=()=>HOUSES.filter(h=>!h._foreign);
  let ok=false;const x0=P.x,y0=P.y;for(let rr=4;rr<60&&!ok;rr+=3)for(let a=0;a<16&&!ok;a++){P.x=x0+Math.cos(a/16*6.283)*rr*16;P.y=y0+Math.sin(a/16*6.283)*rr*16;if(houseFits())ok=true}
  if(!ok)return{err:'no spot for a house'};const out={};
  out.stall=!!X.stall;inv.house=1;startBuild('house');placeBuild();if(BUILD)endBuild();const h=own()[0];if(!h)return{err:'house not built'};
  h.furn.set(3*14+5,{t:'chest',items:{wood:7,berry:3}});inv.wood=0;inv.berry=0;await W(1600);
  out.free=Math.round((X.state.u-now())/DAY);out.f=X.state.f;
  // paying ahead: 30 free days + 2 months = 90 days, then no more
  GLD=1e6;X.act('pay');X.act('pay');const g1=GLD;X.act('pay');out.ahead=[Math.round((X.state.u-now())/DAY),1e6-g1,g1-GLD];
  // the tax runs out: the bank takes it
  X.state.u=now()-1000;await W(1600);out.taken={own:own().length,held:!!X.held,debt:X.state.h&&X.state.h.debt,bs:houseTiles(h).some(i=>BS.has(i))};
  const s=snap();const e=(s.houses||[]).find(q=>q.id===h.id);out.saved={has:!!e,chest:e?(e.f.find(q=>q[1]==='chest')||[])[2]:null,htax:s.htax&&s.htax.h&&s.htax.h.id===h.id,own:own().length};
  // no new home while the bank has yours
  inv.house=1;startBuild('house');out.refused=!BUILD;if(BUILD)endBuild();
  // a reload keeps it with the bank
  saveLocal(true);applySave(JSON.parse(localStorage.getItem(LS)));await W(800);out.reload={own:own().length,held:!!X.held,debt:X.state.h&&X.state.h.debt};
  // pay: it's back where it stood, chest and all
  GLD=60000;X.act('back');await W(300);const h2=own()[0];
  out.back={own:own().length,at:h2?[h2.x,h2.y]:null,was:[h.x,h.y],chest:h2?([...h2.furn.values()].find(f=>f.t==='chest')||{}).items:null,gold:GLD,days:Math.round((X.state.u-now())/DAY),held:!!X.held,bs:h2?houseTiles(h2).every(i=>BS.has(i)):false};
  // taken again, and this time someone built on the spot: it comes back in the bag
  X.take();await W(200);const blk=(h.y-1)*N+h.x-2;BS.add(blk);GLD=60000;const bag0=[inv.house|0,inv.wood|0,inv.berry|0,inv.chest|0];X.act('back');BS.delete(blk);await W(300);
  out.bag={own:own().length,diff:[(inv.house|0)-bag0[0],(inv.wood|0)-bag0[1],(inv.berry|0)-bag0[2],(inv.chest|0)-bag0[3]],left:Math.round(X.state.l/DAY),u:X.state.u};
  // placing it again carries on with the time that was paid
  const ok2=houseFits();if(ok2){startBuild('house');placeBuild();if(BUILD)endBuild();await W(1300);out.again={own:own().length,days:Math.round((X.state.u-now())/DAY)}}
  // her published home carries the paid-until date
  await W(3500);{const F=SQFB,d=F.db,v=(await d.get(d.ref(F.D,'houses/'+SQMP.user.uid))).val(),L=v?Object.values(v):[];out.pub=L.map(e=>Math.round((e.u-now())/DAY))}
  // a framed card comes back when its house is packed (Nov 22: it stayed in the frame list with no frame)
  if(window.SQCARDFRAME){const h=own()[0];h.furn.set(4*14+6,{t:'cardframe'});inv.dc_wb_dragon=1;enterScene('home',h,{x:h.x*16+8,y:(h.y+1)*16+6});await W(200);SQCARDFRAME.putUp(h,4*14+6,'dc_wb_dragon');leaveScene();
   const mid=inv.dc_wb_dragon|0;for(let i=0;i<40&&HOUSES.includes(h);i++){swing=0;hitHouse(h)}await W(3600);out.fr={mid,after:inv.dc_wb_dragon|0,on:Object.keys(SQCARDFRAME.on).length}}
  // an island home: taken out of the islands' list (067's SQRH), still saved, put back on its island when paid
  for(const q of own())for(let i=0;i<40&&HOUSES.includes(q);i++){swing=0;hitHouse(q)}await W(1200);const L=window.SQRH;
  const ih={id:'isl1',rg:'briarwood',x:50,y:50,w:7,furn:new Map([[3*14+5,{t:'chest',items:{stone:4}}]]),hp:12};L.push(ih);await W(1300);const d0=Math.round((X.state.u-now())/DAY);
  X.take();await W(200);const s2=snap(),e2=(s2.rh||[]).find(q=>q.id==='isl1');const mid={inList:L.includes(ih),saved:!!e2,debt:X.state.h&&X.state.h.debt};
  GLD=60000;X.act('back');await W(200);out.isl={d0,mid,back:L.includes(ih),chest:(ih.furn.get(3*14+5)||{}).items,days:Math.round((X.state.u-now())/DAY)};
  return out});
 if(r.err){t(false,r.err);return}
 t.eq(r.isl,{d0:30,mid:{inList:false,saved:true,debt:55000},back:true,chest:{stone:4},days:30},'an island home [days when it appeared, while the bank has it, after paying]');
 t(r.stall,'Penny\'s stall wasn\'t placed beside the World Market');
 t.eq([r.free,r.f],[30,1],'days of tax when the first home goes up (free month)');
 t.eq(r.ahead,[90,100000,0],'paying ahead: days paid, gold for two months, gold taken by a third');
 t.eq(r.taken,{own:0,held:true,debt:55000,bs:false},'when the tax ran out');
 t.eq(r.saved,{has:true,chest:{wood:7,berry:3},htax:true,own:0},'the save while the bank holds the house');
 t(r.refused,'placing a new house was allowed while the bank held the old one');
 t.eq(r.reload,{own:0,held:true,debt:55000},'after reloading');
 t.eq(r.back,{own:1,at:r.back.was,was:r.back.was,chest:{wood:7,berry:3},gold:5000,days:30,held:false,bs:true},'after paying the bank');
 t.eq(r.bag.own,0,'house put back on a taken spot');t.eq(r.bag.diff,[1,7,3,1],'bag: house, chest contents and the chest');t.eq([r.bag.left,r.bag.u],[30,0],'paid time kept for the next home');
 if(r.again)t.eq(r.again,{own:1,days:30},'placing it again');
 // other players: a published home whose tax ran out is skipped; rows from older games count until Dec 23
 const bu=await B.evaluate(()=>SQMP.user.uid);
 await A.evaluate(async()=>{const F=SQFB,d=F.db,n=Date.now(),row=(id,x,u)=>Object.assign({s2:1,id,x,y:150,w:7,f:[]},u!==undefined?{u}:{});
  await d.set(d.ref(F.D,'houses/zzold'),[row('o1',40)]);await d.set(d.ref(F.D,'houses/zzpast'),[row('p1',60,n-60000)]);await d.set(d.ref(F.D,'houses/zzfut'),[row('f1',80,n+864e5)])});
 const seen=await B.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));for(let k=0;k<30;k++){await W(300);if(HOUSES.some(h=>h._owner==='zzfut'))break}await W(500);
  return['zzold','zzpast','zzfut'].map(o=>HOUSES.some(h=>h._foreign&&h._owner===o))});
 t.eq(seen,[true,false,true],'other players\' homes seen [no date (older game), tax ran out, paid]');
 t.eq(r.pub,[30],'days left on Ann\'s published home');
 if(r.fr)t.eq(r.fr,{mid:0,after:1,on:0},'a framed card after packing its house [while framed, after, frames still listed]')}};
