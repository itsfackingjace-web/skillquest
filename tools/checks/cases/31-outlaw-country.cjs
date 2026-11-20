// Nov 20: Mira (Dusthaven's Oasis Rest) gives a quest line through No Man's Land: landmarks, bandits, a satchel to Dustwater,
// mining there, PvP wins there, and Black Jack. Plays the first steps and checks the satchel and PvP counting.
module.exports={name:'Outlaw Country quests send you through No Man\'s Land',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
  const until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(150)}return false};
  const mira=NPCS.find(n=>n.id==='mira');if(!mira)return{err:'no Mira in Dusthaven'};const o={};
  o.card=/Scout the Badlands/.test(sideCard(mira));o.mark=sqMark(mira);sideAct('accept',mira);o.on=SQ_SIDE.nomans.on;
  routeOpen=()=>true;routeGo('nomans');if(!await until(()=>curRegion()==='nomans'&&!TRAVEL49,30000))return{...o,err:'never reached No Man\'s Land'};await W(400);
  const R=SCENE.room,go=async id=>{const l=R.lms.find(x=>x.id===id);if(!l)return false;P.x=l.x*16+8;P.y=l.y*16+8;await W(800);return true};
  for(const id of['boot_hill','deadmans_gulch','deadmans_gulch','silver_mine'])await go(id);o.k1=SQ_SIDE.nomans.k;
  sideAct('done',mira);o.idx1=SQ_SIDE.nomans.index;
  // bandits: count only here
  SQ_SIDE.nomans.index=2;SQ_SIDE.nomans.on=false;inv.nmsatchel=0;sideAct('accept',mira);o.sat=inv.nmsatchel|0;
  inv.nmsatchel=0;sideCard(mira);o.again=inv.nmsatchel|0;await go('dustwater');o.k3=SQ_SIDE.nomans.k;o.satAfter=inv.nmsatchel|0;
  sideAct('done',mira);o.idx3=SQ_SIDE.nomans.index;
  SQ_SIDE.nomans.index=4;SQ_SIDE.nomans.on=false;XPS[0]=XT[40];sideAct('accept',mira);SQPVKO('x');SQPVKO('y');o.k5=SQ_SIDE.nomans.k;
  saveLocal(true);applySave(JSON.parse(localStorage.getItem(LS)));await W(500);o.reload=[SQ_SIDE.nomans.index,SQ_SIDE.nomans.k,SQ_SIDE.nomans.on];return o});
 if(r.err){t(false,r.err);return}
 t(r.card,'Mira does not offer Scout the Badlands');t.eq(r.mark,'!','Mira has no quest mark');t(r.on,'could not accept');
 t.eq(r.k1,3,'landmarks reached (each counts once)');t.eq(r.idx1,1,'first quest handed in');
 t.eq([r.sat,r.again,r.k3,r.satAfter,r.idx3],[1,1,1,0,3],'satchel: given, given again when lost, delivered at Dustwater, handed in');
 t.eq(r.k5,2,'PvP wins in No Man\'s Land');t.eq(r.reload,[4,2,true],'after reloading')}};
