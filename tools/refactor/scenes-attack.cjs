// HIT (attack) in many situations. Each scene sets something up in front of you (facing right) and presses HIT a few times.
const PRE=`
 // a quiet open spot away from the village (same for every scene), facing right
 {const x0=SPX+40*16,y0=SPY;let ok=false;for(let r=0;r<80&&!ok;r+=2)for(let a=0;a<16&&!ok;a++){P.x=x0+Math.cos(a/16*6.283)*r*16;P.y=y0+Math.sin(a/16*6.283)*r*16;if(houseFits()&&!solid(P.x,P.y))ok=true}
  P.x=Math.floor(P.x/16)*16+8;P.y=Math.floor(P.y/16)*16+8;for(const n of en)n.dead=1;en.length=0}
 face=[1,0];let TGT=null;const F=()=>{const[fx,fy]=front(16);return Math.floor(fy/16)*N+Math.floor(fx/16)};
 const put=(t,o)=>{const i=F();STR.delete(i);BS&&BS.delete&&BS.delete(i);obj[i]=Object.assign({t,hp:OHP[t]||3},o||{});return i};
 const hit=async(n,gap)=>{for(let k=0;k<n;k++){swing=0;let sd=1000+k*7;Math.random=()=>(sd=(sd*16807)%2147483647)/2147483647;
   if(TGT&&!TGT.dead){const[fx,fy]=front(14);TGT.x=fx;TGT.y=fy;TGT.vx=TGT.vy=0}if(pnOpen)try{closePanel()}catch(e){}attack();await w(gap||450)}};
 const ens=()=>en.filter(n=>!n.dead).map(n=>[n.type,Math.round(n.hp*10)/10]).slice(0,5);`;
const AF=Object.getPrototypeOf(async function(){}).constructor;const sc=body=>new AF('w',PRE+body);
const S={
 tree:'put("tree");await hit(6);return{o:obj[F()]&&obj[F()].t}',
 oakLow:'XPS[1]=0;put("oak");await hit(3);return{o:obj[F()]&&obj[F()].t}',
 oakHigh:'XPS[1]=XT[30];inv.eq_axe4=1;try{equipItem("eq_axe4")}catch(e){};put("oak");await hit(8);return{o:obj[F()]&&obj[F()].t}',
 rock:'put("rock");await hit(6);return{o:obj[F()]&&obj[F()].t}',
 ore:'XPS[2]=XT[20];put("ore",{v:"iron"});await hit(8);return{o:obj[F()]&&obj[F()].t}',
 rockPick:'inv.eq_pick2=1;try{equipItem("eq_pick2")}catch(e){};put("rock");await hit(6);return{o:obj[F()]&&obj[F()].t}',
 orePick:'XPS[2]=XT[20];inv.eq_pick4=1;try{equipItem("eq_pick4")}catch(e){};put("ore",{v:"iron"});await hit(10);return{o:obj[F()]&&obj[F()].t}',
 boulder:'put("boulder");await hit(4);return{o:obj[F()]&&obj[F()].t}',
 bush:'put("bush");await hit(2);return{o:obj[F()]&&obj[F()].t}',
 monster:'SQTEST.spawn("slime",1);TGT=en[en.length-1];await hit(5,500);return{en:ens(),kills}',
 wolf:'XPS[0]=XT[20];SQTEST.spawn("wolf",1);TGT=en[en.length-1];await hit(6,500);return{en:ens(),kills}',
 water:'const i=F();tile[i]=0;obj[i]=null;inv.eq_rod1=1;TL.rod=TL.rod||1;await hit(1);return{fishing:typeof FISH!=="undefined"?!!FISH:null}',
 nothing:'const i=F();obj[i]=null;await hit(2);return{sw:swing>0}',
 building:'inv.chest=1;startBuild("chest");await hit(1);return{build:!!BUILD}',
 hoeGrass:'const i=F();obj[i]=null;tile[i]=1;inv.eq_hoe=1;try{equipItem("eq_hoe")}catch(e){};SQOFFHAND&&SQOFFHAND.use&&SQOFFHAND.use();await w(300);return{farm:FARM.size}',
 dagger:'inv.idag=1;try{equipItem("idag")}catch(e){};SQTEST.spawn("slime",1);TGT=en[en.length-1];if(TGT){const[fx,fy]=front(14);TGT.x=fx;TGT.y=fy}window.SQDAGGER&&SQDAGGER.stab&&SQDAGGER.stab();await w(500);return{en:ens()}',
 houseWall:'inv.house=1;startBuild("house");placeBuild();if(BUILD)endBuild();const h=HOUSES.find(o=>!o._foreign);if(!h)return{err:"no house"};h.furn.set(3*14+5,{t:"chest",items:{ibar:4}});P.x=(h.x-1)*16+8;P.y=(h.y+1)*16+8;face=[0,-1];const[tx,ty]=frontTile();if(houseAt(tx,ty)!==h)return{err:"not facing the wall"};await hit(14,300);return{houses:HOUSES.filter(o=>!o._foreign).length}',
 sledgeOre:'inv.eq_sledge=1;try{equipItem("eq_sledge")}catch(e){};put("ore");await hit(2);return{o:obj[F()]&&obj[F()].t,sl:!!SLEDGE}',
};
module.exports=Object.fromEntries(Object.entries(S).map(([k,b])=>[k,sc(b)]));
