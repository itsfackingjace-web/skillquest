// Nov 19-20 chat ("taking damage from nothing", "a crab was under fump's door"): a monster standing under an island house or castle
// (door, walls, behind the roof) is covered by the building. 247 moves it out, and while it's covered it can't touch you.
module.exports={name:'monsters under island houses are moved out and can\'t hit you',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  routeOpen=()=>true;const until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(200)}return false};
  routeGo('ashfall');if(!await until(()=>curRegion()==='ashfall'&&!(typeof TRAVEL!=='undefined'&&TRAVEL),30000))return{err:'never arrived'};await W(600);
  const R=SCENE.room,tx=Math.floor(P.x/16),ty=Math.floor(P.y/16),out={};
  const mob=(x,y,extra)=>{const m=Object.assign(rgMake('slime',40,x,y),extra||{});m.rg=R.region;RG_OWN.add(m);en.push(m);return m};
  const clear=()=>{for(const n of en)if(!n.dead&&Math.hypot(n.x-P.x,n.y-P.y)<200&&!n._pet){n.dead=1;n.dropped=1}en=en.filter(n=>!n.dead||n._pet)};
  const hits=async(ms)=>{P.hp=6;hurt=0;const h0=P.hp;let low=h0;const e=Date.now()+ms;while(Date.now()<e){P.x=px;P.y=py;low=Math.min(low,P.hp);if(P.hp<3)P.hp=6;await W(50)}return h0-low};
  let px=P.x,py=P.y;
  // control: an ordinary monster right on you does hurt
  clear();const a=mob(px,py);out.control=await hits(2500);a.dead=1;clear();
  // an open patch of land for a house (its door at hx,hy; you stand just below it)
  // (away from the pier and landmarks: monsters there are cleared by the island)
  const okT=(x,y)=>{const i=y*R.w+x;return x>1&&y>1&&x<R.w-2&&y<R.h-2&&R.tiles[i]!==0&&!R.solid.has(i)&&!solid(x*16+8,y*16+8)&&!rgQuiet(R,x,y)&&Math.hypot(x-R.dock[0],y-R.dock[1])>12};let hx=-1,hy=-1;
  for(let r=0;r<40&&hx<0;r++)for(let dy=-r;dy<=r&&hx<0;dy++)for(let dx=-r;dx<=r&&hx<0;dx++){const x=tx+dx,y=ty+dy;let ok=true;for(let b=-4;b<=2&&ok;b++)for(let a=-3;a<=3&&ok;a++)ok=okT(x+a,y+b);if(ok){hx=x;hy=y}}
  if(hx<0)return{err:'no open land for the test house'};
  const H={id:'chk',rg:R.region,x:hx,y:hy,w:7,furn:new Map()};const _l=window.rhList;window.rhList=()=>[H];py=(hy+1)*16+6;px=hx*16+8;P.x=px;P.y=py;
  await W(800);
  // a monster on the door tile is moved out of the building
  const b=mob(hx*16+8,hy*16+8);await W(2500);out.alive=!b.dead;out.moved=!SQUNDER.hidden(R,b,SQUNDER.cover(R));out.bpos=[Math.floor(b.x/16)-hx,Math.floor(b.y/16)-hy];b.dead=1;clear();
  // a shared monster (another player's game runs it) under the roof is left there, but can't touch you
  const c=mob(px,py-10,{_rp:1});c.tx=c.x;c.ty=c.y;const cx=c.x,cy=c.y;out.shared=await hits(2500);out.sharedStayed=Math.abs(c.x-cx)<1&&Math.abs(c.y-cy)<1;out.blocked=SQUNDER.blocked;
  c.dead=1;clear();window.rhList=_l;
  // Nov 19 chat: visitors saw only the back half of another player's island castle (its furniture was read as a 14-wide house's)
  window.__remote('build/other',{r:{_h:[['ashfall',hx+12,hy,'cst1',[[2*22+3,'bed'],[11*22+5,'chest']],1]]}});
  await until(()=>window.rhList().some(h=>h._owner==='other'),5000);await W(300);
  const C=window.rhList().find(h=>h._owner==='other');out.castle=C&&{c:!!C.castle,n:C.furn.size,deep:C.furn.has(11*22+5)};
  await W(400);const C2=window.rhList().find(h=>h._owner==='other');out.castle2=C2&&{c:!!C2.castle,n:C2.furn.size};return out});
 if(r.err){t(false,r.err);return}
 t(r.control>0,'the control monster never hurt you (the check proves nothing)');
 t(r.alive,'the test monster was removed by something else');t(r.moved,'a monster on a house door was not moved out ('+JSON.stringify(r.bpos)+')');
 t.eq(r.shared,0,'hearts lost to a monster hidden under a house');t(r.sharedStayed,'a shared monster was moved by this game');t(r.blocked>0,'nothing was blocked');
 t.eq(r.castle,{c:true,n:2,deep:true},'another player\'s island castle');t.eq(r.castle2,{c:true,n:2},'the same castle a moment later')}};
