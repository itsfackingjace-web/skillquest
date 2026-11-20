// Nov 20: the guild bosses got raid mechanics. Wakes the Void Treant in its arena and makes it use each new move once:
// burrow (can't be hurt underground, comes up somewhere else), a void sapling that hunts you, void poison, the shockwave that
// throws you back (never out of the arena), and the drinking phase (hits heal it). Then the Giant Turtle's whirlpool and shell.
module.exports={name:'guild bosses: burrow, saplings, poison, knockback, drinking, whirlpool, shell',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const G=SQGUILD,A=G.api;
  const until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(100)}return false};
  GLD=6e6;A.create('Check Guild','CHK',1);if(!await until(()=>G.id&&A.ready,8000))return{err:'no guild'};
  routeOpen=()=>true;routeGo(G.isle());if(!await until(()=>A.onIsle()&&!TRAVEL49,30000))return{err:'never reached the guild island'};await W(500);
  const fight=async k=>{const id=SQGBOSS.regBoss(k);SQIBENTER(id,{x:Math.floor(P.x/16),y:Math.floor(P.y/16)});await until(()=>en.some(n=>n.type==='ib'&&n.ib===id),8000);
   const b=en.find(n=>n.type==='ib'&&n.ib===id);if(b)b.cds=b.cds.map(()=>99);P.y-=96;return{id,b}};// stand in the middle of the arena// no attacks of its own: only the ones we ask for
  let hurt=0;const _h=hurtP;hurtP=function(d){hurt+=d;P.hp=Math.max(P.hp,6);return true};
  const o={};let{id,b}=await fight('treant');if(!b)return{err:'the Void Treant never appeared'};o.hp=b.mhp;
  const T={x:P.x,y:P.y};SQIBFIRE.burrow(b,{});await W(300);const h0=b.hp;b.hp-=400;await W(200);o.under=b.hp===h0;await until(()=>!b.act,4000);o.moved=Math.hypot(b.x-T.x,b.y-T.y)>60;
  SQIBFIRE.seek(b,{cap:2,life:14});o.seek=b.hz.some(h=>h.k==='seek');const s=b.hz.find(h=>h.k==='seek');if(s){s.x=P.x+30;s.y=P.y}
  hurt=0;await until(()=>hurt>=3,6000);o.caught=hurt>=3;
  SQIBFIRE.poison(b,{});await until(()=>SQGBMECH.POI.t>0,4000);o.poison=SQGBMECH.POI.t>0;
  b.hz.push({id:987654,k:'ring',x:P.x,y:P.y-20,r:8,max:120,hit:false,t:0,kind:'push'});const y0=P.y;await W(800);o.pushed=Math.abs(P.y-y0)>4;o.still=SCENE&&SCENE.room&&SCENE.room.ib===id;
  b.hp=b.mhp-2000;await W(100);SQIBFIRE.mirror(b,{d:4});await W(150);const h1=b.hp;b.hp-=300;await W(200);o.drink=b.hp>h1;b.mir=0;
  // the turtle
  leaveScene();await W(800);({id,b}=await fight('turtle'));if(!b)return{...o,err:'the Giant Turtle never appeared'};o.thp=b.mhp;
  SQIBFIRE.pull(b,{r:72,d:3},{x:P.x+40,y:P.y-10});const x0=P.x;await W(1200);o.pulled=P.x>x0+2;
  SQIBFIRE.shell(b,{d:2});await W(200);const h2=b.hp;b.hp-=300;await W(200);o.shell=b.hp===h2;
  o.errs=SQERR.list().filter(x=>/^241|^100/.test(x));return o});
 if(r.err){t(false,r.err);return}
 t.eq([r.hp,r.thp],[18000,21000],'boss health');t(r.under,'the Treant could be hurt underground');t(r.moved,'the Treant came up in the same spot');
 t(r.seek,'no void sapling');t(r.caught,'the sapling hunting you never hit');t(r.poison,'no void poison');
 t(r.pushed,'the shockwave did not throw you back');t(r.still,'the shockwave threw you out of the arena');t(r.drink,'hits did not heal the Treant while it was drinking');
 t(r.pulled,'the whirlpool did not pull you');t(r.shell,'the Turtle could be hurt in its shell');t.eq(r.errs,[],'caught errors')}};
