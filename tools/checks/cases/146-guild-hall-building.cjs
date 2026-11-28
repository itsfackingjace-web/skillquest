// Nov 28 (Jace, in-game report: "The guild hall looks completely like AI and doesn't fit the style of the rest of the game"):
// the hall was the island ruins' stone vault; 297 draws it as a building in the style of the towns (guild-coloured roof, banners,
// the guild's tag over the door), over the hall's spot and the free ground beside it.
module.exports={name:'the guild hall is a building in the guild\'s colours',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms)),G=SQGUILD,API=G.api,until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(200)}return false};
  try{if(pnOpen)closePanel()}catch(e){/*quiet*/}GLD=6e6;API.create('Hall Guild','HAL',5);if(!await until(()=>G.id&&API.ready,8000))return{err:'guild was not founded'};
  G.state.prog.qd=6;routeOpen=()=>true;routeGo(G.isle());if(!await until(()=>API.onIsle()&&!(typeof TRAVEL!=='undefined'&&TRAVEL),30000))return{err:'never reached the guild island'};await W(600);
  API.applyBuildings();const R=SCENE.room,h=R.items.find(i=>i.use==='ghall');if(!h)return{err:'no hall'};const out={item:[h.t,h.w,h.h,h.name]};
  let sol=0;for(let b=0;b<2;b++)for(let a=0;a<5;a++)if(R.solid.has((h.y+b)*R.w+h.x+a))sol++;out.solid=sol;
  out.free=[-1,5].map(a=>R.solid.has((h.y+1)*R.w+h.x+a)).concat([0,1,2,3,4].map(a=>R.solid.has((h.y+2)*R.w+h.x+a)).some(Boolean));
  // drawn: the canvas has the guild's blue in the roof, and drawing it throws nothing
  const c=SQGHALL.canvas('#3870d8'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let blue=0;for(let i=0;i<d.length;i+=4)if(d[i+3]===255&&d[i+2]>d[i]+60)blue++;out.blue=blue>500;
  let err='';try{g.save();SQGHALL.draw(h,1.5);g.restore()}catch(e){err=String(e)}out.err=err;
  // at its door, TALK (USE) goes in (298)
  P.x=(h.x+2)*16+8;P.y=(h.y+2)*16+8;face=[0,-1];en.length=0;await W(300);talk();await W(300);out.opened=[!!(SCENE&&SCENE.room&&SCENE.room._gh),!pnOpen];try{leaveScene()}catch(e){/*quiet*/}
  routeGo('hollow');return out});
 if(r.err)return t(false,r.err);
 t.eq(r.item,['ghall',5,2,'Guild hall'],'the hall [drawn as the guild hall building, 5 tiles wide, 2 deep, its name]');
 t.eq(r.solid,10,'all 10 tiles of the building are solid');t.eq(r.free,[false,false,false],'the ground beside and in front of it is free');
 t(r.blue,'its roof and banners take the guild\'s colour');t.eq(r.err,'','drawing it threw');
 t.eq(r.opened,[true,true],'USE at its door goes into the hall [inside, no screen]')}};
