// Nov 19 (Jerica, in-game report: "Friend is showing they are somewhere they are not on the map"; Jace, Nov 26: players inside houses
// show as being on Hollow whatever island they're on): presence `ar` came from curRegion(), 'hollow' in any room. 295's SQOUTREGION()
// sends the island the building stands on; curRegion() itself still says 'hollow' indoors.
module.exports={name:'inside a building on an island, your presence says that island',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  routeOpen=()=>true;const until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(200)}return false};
  routeGo('briarwood');if(!await until(()=>curRegion()==='briarwood'&&!(typeof TRAVEL!=='undefined'&&TRAVEL),30000))return{err:'never arrived'};await W(600);
  const uid=SQMP.user&&SQMP.user.uid,pres=()=>{const T=window.__db.T;return T&&T.presence&&T.presence[uid]||{}};
  const door={x:Math.round(P.x),y:Math.round(P.y)};await until(()=>pres().ar==='briarwood',8000);const out={out:pres().ar};
  enterScene('gen',null,{x:door.x,y:door.y});await W(300);out.indoor=[!!SCENE,!(SCENE.room&&SCENE.room.region),curRegion(),SQOUTREGION()];
  await W(6500);const q=pres();out.inside=[q.ar,q.ax,q.ay,q.loc];out.door=door;return out});
 if(r.err){t(false,r.err);return}
 t.eq(r.out,'briarwood','outdoors on Briarwood the presence says briarwood');
 t.eq(r.indoor,[true,true,'hollow','briarwood'],'indoors [in a room, room without a region, curRegion, SQOUTREGION]');
 t.eq(r.inside.slice(0,3),['briarwood',r.door.x,r.door.y],'inside the building: Briarwood, at its door [ar, ax, ay]')}};
