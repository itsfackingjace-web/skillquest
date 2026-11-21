// Nov 20 (Jace): a card frame for your house: craftable (wood + iron bar) and sold at Marlo's; HIT on it puts a card up (out of the
// binder), takes it down, and picking the frame up gives the card back; the frame's card is kept by a save.
module.exports={name:'card frames show a card in your house',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);const out={},F=SQCARDFRAME;
  out.recipe=JSON.stringify((BREC.find(b=>b.k==='cardframe')||{}).c);out.marlo=!!(LUX.EMP.FURN2.find(f=>f.k==='cardframe'));
  let ok=false;const x0=P.x,y0=P.y;for(let rr=4;rr<60&&!ok;rr+=3)for(let a=0;a<16&&!ok;a++){P.x=x0+Math.cos(a/16*6.283)*rr*16;P.y=y0+Math.sin(a/16*6.283)*rr*16;if(houseFits())ok=true}
  if(!ok)return{err:'no room for a house'};inv.house=1;startBuild('house');placeBuild();if(typeof BUILD!=='undefined'&&BUILD)endBuild();const h=HOUSES.find(o=>!o._foreign);if(!h)return{err:'no house'};
  enterScene('home',h,{x:h.x*16+8,y:(h.y+1)*16+6});await W(300);
  // a frame in front of you
  const R=SCENE.room;face=[0,-1];const[fx,fy]=frontTile();const i=fy*R.w+fx;h.furn.set(i,{t:'cardframe'});await W(100);
  inv.dc_wb_dragon=1;swing=0;attack();await W(200);out.open=[ptab,pnOpen];
  pbd.querySelector('[data-dcfr="put:dc_wb_dragon"]').click();await W(150);out.up=[inv.dc_wb_dragon|0,Object.values(F.on)];
  const S=JSON.parse(JSON.stringify(SQSAVE.snap?SQSAVE.snap():snap()));out.saved=S.dcf&&Object.values(S.dcf);
  pbd.querySelector('[data-dcfr="down"]').click();await W(100);out.down=[inv.dc_wb_dragon|0,Object.keys(F.on).length];
  pbd.querySelector('[data-dcfr="put:dc_wb_dragon"]').click();await W(100);const fr0=inv.cardframe|0;
  pbd.querySelector('[data-dcfr="pick"]').click();await W(200);out.picked=[inv.dc_wb_dragon|0,(inv.cardframe|0)-fr0,h.furn.has(i)];
  try{leaveScene()}catch(e){}return out});
 if(r.err){t(false,r.err);return}
 t.eq(r.recipe,'{"wood":4,"ibar":1}','recipe');t(r.marlo,'not sold at Marlo\'s');t.eq(r.open,[53,true],'HIT opens the frame');
 t.eq(r.up,[0,['dc_wb_dragon']],'card put up (out of the binder)');t.eq(r.saved,['dc_wb_dragon'],'saved');t.eq(r.down,[1,0],'taken down');
 t.eq(r.picked,[1,1,false],'picking up the frame gives the card back')}};
