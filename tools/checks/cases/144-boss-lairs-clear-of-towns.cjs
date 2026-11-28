// Nov 28 (Applez, in-game report "boss is in house", expected "boss in the open area"): the Flame Wisp floated over the Sleepy Fern
// inn in Thornbrook. 071's island lair search only looked at the ground, so lairs landed on towns, dungeon doors and island boss
// lairs (395 of 399 slots on Briarwood). It now looks for a patch clear of the island's reserved sites first.
module.exports={name:'island world boss lairs stay clear of towns and dungeon doors',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);const out={};
  for(const reg of ['briarwood','ashfall','ironcrest','shattered']){try{loadRegion(reg)}catch(e){out[reg]='err '+e;continue}await W(300);const R=SCENE&&SCENE.room;if(!R||R.region!==reg){out[reg]='not loaded';continue}
   let bad=0,n=0;for(let slot=1;slot<400;slot++){const L=wbLair({slot,where:reg});if(!L)continue;n++;const tx=Math.floor(L.x/16),ty=Math.floor(L.y/16);
    if(R.reserved.some(q=>(q.kind||q.t||q.id)!=='resource'&&tx+5>=q.x&&tx-5<q.x+q.w&&ty+4>=q.y&&ty-4<q.y+q.h))bad++}
   out[reg]=[n,bad<=4];try{leaveScene()}catch(e){/*quiet*/}}
  return out});
 for(const k of ['briarwood','ashfall','ironcrest','shattered'])t.eq(r[k],[399,true],k+' [slots with a lair, at most 1% near a town, dungeon door or boss lair]')}};
