// Nov 20: mines need Mining levels (Old Ironcrest Mine 30, +10 every two floors down) and have about twice the monsters.
module.exports={name:'mines need Mining levels and have more monsters',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
  const until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(150)}return false};
  routeOpen=()=>true;routeGo('ironcrest');if(!await until(()=>curRegion()==='ironcrest'&&!TRAVEL49,30000))return{err:'never reached Ironcrest'};await W(400);
  const R=SCENE.room,it=R.items.find(i=>i.use==='icv'&&i.kind==='icmine');if(!it)return{err:'no Old Ironcrest Mine entrance'};
  const setLv=l=>{XPS[2]=l<=1?0:XT[l-1]};const o={};
  setLv(10);useFurn(it);await W(300);o.low=!!(SCENE&&SCENE.room&&SCENE.room.dun);
  setLv(30);useFurn(it);await until(()=>SCENE&&SCENE.room&&SCENE.room.dun,3000);const D=SCENE&&SCENE.room;o.in=!!(D&&D.dun);o.mobs=D?D.mobs.length:0;
  if(o.in){dGo('icmine',2,'above');await W(300);o.f2=SCENE.room.dun.f;dGo('icmine',3,'above');await W(300);o.f3low=SCENE.room.dun.f;setLv(40);dGo('icmine',3,'above');await W(300);o.f3=SCENE.room.dun.f}
  o.req=[SQMINES.req('icmine',1),SQMINES.req('icmine',3),SQMINES.req('icmine2',1),SQMINES.req('icave',1)];return o});
 if(r.err){t(false,r.err);return}
 t(!r.low,'went into the mine with Mining 10');t(r.in,'could not go in with Mining 30');t(r.mobs>=13,'only '+r.mobs+' monsters on floor 1');
 t.eq([r.f2,r.f3low,r.f3],[2,2,3],'floors (3 needs Mining 40)');t.eq(r.req,[30,40,45,0],'requirements')}};
