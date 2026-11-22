// Nov 21 (Jace in Briarwood: "what is this card table doing here? and why is it on top of a tree"): Ace's card table (258) and Orla's
// chess table (009) were drawn at Hollow's spot on every island too. They're drawn in Hollow and nowhere else.
module.exports={name:'Hollow\'s card and chess tables are only in Hollow',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  const until=async(f,ms)=>{const e=performance.now()+ms;while(performance.now()<e){if(f())return true;await W(150)}return false};
  // count rectangles in the felt green (card table) and the board brown (chess table)
  let felt=0,board=0;const _fr=g.fillRect;g.fillRect=function(x,y,w,h){if(w===14&&h===5){const c=String(g.fillStyle).toLowerCase();if(c==='#2e6a40')felt++;else if(c==='#a87850')board++}return _fr.apply(this,arguments)};// the 14x5 table tops
  const n=NPCS.find(q=>q.kind==='cardsharp'),spot=[n.x,n.y+16];
  P.x=spot[0];P.y=spot[1]+24;felt=board=0;await W(600);const home=[felt,board];
  routeOpen=()=>true;routeGo('briarwood');if(!await until(()=>curRegion()==='briarwood'&&!TRAVEL49,30000)){g.fillRect=_fr;return{err:'never reached Briarwood'}}
  await W(500);P.x=spot[0];P.y=spot[1]+24;felt=board=0;await W(800);const away=[felt,board];g.fillRect=_fr;return{home,away}});
 if(r.err){t(false,r.err);return}
 t(r.home[0]>0&&r.home[1]>0,'the tables weren\'t drawn in Hollow: '+r.home);t.eq(r.away,[0,0],'card table / chess table pieces drawn in Briarwood')}};
