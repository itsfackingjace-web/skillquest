// Song zones from the island builder: standing inside a Hollow song zone plays its song (outdoors), stepping out plays the area's own.
module.exports={name:'song zones play their song',async run(p,t){
 const r=await p.evaluate(async()=>{const tx=Math.floor(P.x/16),ty=Math.floor(P.y/16),base=wantSong();
  SQA.preview(Object.assign({},SQA.live||{},{islands:{ed_hollow:{bi:'hollow',n:'Hollow',w:N,h:N,x:'',sz:[{x:tx-2,y:ty-2,w:5,h:5,s:'night',n:'The Quiet Field'}]}}}));
  const inside=wantSong(),z=SQSONGZONES.here();P.x+=16*6;const outside=wantSong();P.x-=16*6;SQA.preview(null);
  return{base,inside,name:z&&z.n,outside}});
 t.eq([r.inside,r.name],['night','The Quiet Field'],'zone song inside (was '+r.base+')');t.eq(r.outside,r.base,'own song outside')}};
