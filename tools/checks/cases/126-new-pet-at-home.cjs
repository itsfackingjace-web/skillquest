// Nov 26 (Jerica, in-game report: "Won't let me place pupper in my house"): 206 makes every pet item placeable at home (BK) when the
// library applies, but 234 registers the Dev Suite's new pets (np_...) in a later apply step, so they had no PLACE. Now they do.
module.exports={name:'a pet made in the Dev Suite can be placed at home like any pet',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(800);try{if(pnOpen)closePanel()}catch(e){}const o={};
  SQA.preview(Object.assign({},SQA.live||{},{newpets:{np_pupper:{n:'Pupper',d:'A pup.',v:0}}}));await W(200);
  o.bk=[BK.includes('pet_np_pupper'),BK.includes('pet_pwolf')];
  let ok=false;const x0=P.x,y0=P.y;for(let rr=4;rr<60&&!ok;rr+=3)for(let a=0;a<16&&!ok;a++){P.x=x0+Math.cos(a/16*6.283)*rr*16;P.y=y0+Math.sin(a/16*6.283)*rr*16;if(houseFits())ok=true}
  inv.house=1;startBuild('house');placeBuild();if(typeof BUILD!=='undefined'&&BUILD)endBuild();const h=HOUSES.find(o=>!o._foreign);
  enterScene('home',h,{x:h.x*16+8,y:(h.y+1)*16+6});await W(300);const R=SCENE.room;
  // find a floor spot where a wolf pet can go, then put the pupper there instead
  const place=k=>{inv[k]=1;startBuild(k);placeBuild();const done=[...h.furn.values()].some(f=>f.t===k);if(typeof BUILD!=='undefined'&&BUILD)endBuild();return done};
  let spot=null;for(let y=2;y<R.h-1&&!spot;y++)for(let x=1;x<R.w-1&&!spot;x++){P.x=x*16+8;P.y=y*16+8+16;face=[0,-1];if(place('pet_pwolf')){spot=[x,y]}}
  o.wolf=!!spot;if(spot){for(const[i,f]of h.furn)if(f.t==='pet_pwolf')h.furn.delete(i);P.x=spot[0]*16+8;P.y=spot[1]*16+24;face=[0,-1];o.pupper=place('pet_np_pupper')}
  return o});
 t.eq(r.bk,[true,true],'the Dev Suite pet is placeable, like the wolf');t(r.wolf,'a wolf pet can be placed in the house');t(r.pupper,'and so can the pupper, in the same spot')}};
