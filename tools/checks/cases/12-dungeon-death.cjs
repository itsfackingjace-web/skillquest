// Falling inside a dungeon: the grave holds the bag and is shown outside the entrance, on ground you can reach.
module.exports={name:'falling in a dungeon leaves a grave outside its entrance',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);
  const kind=Object.keys(DKIND).find(k=>k.startsWith('dungeon'))||Object.keys(DKIND)[0];SQTEST.goDun(kind,2);await W(1500);
  const inside=!!(SCENE&&SCENE.room&&SCENE.room.dun);inv.ibar=7;inv.berry=3;dead=true;P.hp=0;await W(600);reset();await W(800);
  const F=SQFB,gs=(await F.db.get(F.db.ref(F.D,'graves'))).val()||{},g=Object.values(gs)[0];if(!g)return{inside,err:'no grave made'};
  const gp=SQGRV.pos(g);return{inside,kind,items:g.i,loc:g.loc,out:!!gp.out,spotSolid:gp.out?solid(gp.x,gp.y):null,alive:!dead&&P.hp>0,scene:SCENE&&SCENE.id}});
 t(r.inside,'never got into the dungeon');if(r.err){t(false,r.err);return}
 t.eq(r.items,{ibar:7,berry:3},'grave contents');t(/^in:/.test(r.loc),'grave location '+r.loc);t(r.out,'grave not moved outside the entrance');
 t(r.spotSolid===false,'grave spot outside is inside something');t(r.alive,'not alive after respawning')}};
