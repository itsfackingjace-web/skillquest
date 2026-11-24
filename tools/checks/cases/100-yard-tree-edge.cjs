// Nov 23 (errs 248-1 / uncaught "R.useItems is not iterable"): in a backyard, 145 picks the tree 16 px ahead (frontTile) and lends
// R.region='_yard' for the HIT; 050's island HIT looked 13 px ahead, found nothing there and then read R.useItems, which yards don't have.
module.exports={name:'HIT on a backyard tree right at the edge of reach chops it, no error',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}const out={};
  let ok=false;const x0=P.x,y0=P.y;for(let rr=4;rr<60&&!ok;rr+=3)for(let a=0;a<16&&!ok;a++){P.x=x0+Math.cos(a/16*6.283)*rr*16;P.y=y0+Math.sin(a/16*6.283)*rr*16;if(houseFits())ok=true}
  if(!ok)return{err:'no room for a house'};inv.house=1;startBuild('house');placeBuild();if(typeof BUILD!=='undefined'&&BUILD)endBuild();const h=HOUSES.find(o=>!o._foreign);if(!h)return{err:'no house'};
  enterScene('home',h,{x:h.x*16+8,y:(h.y+1)*16+6});await W(300);SQYARD.goOut(0);await W(300);out.yard=SQYARD.isYard();
  const R=SCENE.room;en=[];const tr=R.items.find(it=>it.t==='_obj'&&!it.ring&&!it.gone&&it.o&&/tree|oak|maple|pine/.test(it.o.t));if(!tr)return{err:'no yard tree'};
  // face down, standing so the tile 16 px ahead is the tree and the tile 13 px ahead is the one above it
  face=[0,1];P.x=tr.x*16+8;P.y=tr.y*16-15;swing=0;const hp0=tr.o.hp,w0=inv.wood|0;
  out.tiles=[Math.floor((P.y+13)/16),Math.floor((P.y+16)/16),tr.y];let err=null;try{attack()}catch(e){err=String(e)}
  out.err=err;out.hit=tr.o.hp<hp0||tr.gone||(inv.wood|0)>w0||swing>0;return out});
 if(r.err&&!('yard'in r))return t(false,r.err);
 t.eq([r.yard,r.tiles[1]===r.tiles[2],r.tiles[0]===r.tiles[2]-1],[true,true,true],'in the yard, the tree is 16 px ahead but not 13 px ahead');
 t.eq(r.err,null,'HIT doesn\'t throw');t.eq(r.hit,true,'the tree is chopped')}};
