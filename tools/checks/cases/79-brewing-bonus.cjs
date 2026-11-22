// Nov 21 (Kevin in #bugs: "Double brewing does NOT give double xp" and "Brewing DOES refund at seemingly the correct rate, but there
// is no notification when it happens"): a double batch gives the XP of both potions, and the message names the ingredients you kept.
module.exports={name:'brewing: a double batch gives both potions\' XP, kept ingredients are named',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);const B=SQBREW,BR=B.BR,R=B.RECIPES[0];
  XPS[BR]=XT[80];for(const[a,b]of Object.entries(R.c))inv[a]=b*3;inv[R.k]=0;
  const said=[];const _s=say;say=function(x){said.push(String(x));return _s.apply(this,arguments)};
  STATION={t:'cauldron',i:Math.floor(P.y/16)*N+Math.floor(P.x/16)+1};shop='station';
  const _rnd=Math.random;Math.random=()=>0;// every chance comes up: a double batch, every ingredient kept
  const xp0=XPS[BR],ing0=Object.keys(R.c).map(a=>inv[a]|0);
  try{stationAct('cw_'+R.k);await W(4000)}finally{Math.random=_rnd;say=_s}
  return{made:inv[R.k]|0,xp:Math.round(XPS[BR]-xp0),base:R.xp,kept:Object.keys(R.c).map((a,i)=>(inv[a]|0)-ing0[i]),said:said.join(' | ')}});
 t.eq(r.made,2,'potions from a double batch ('+r.said+')');
 t(r.xp>=r.base*2,'XP for a double batch: '+r.xp+' (one potion is '+r.base+')');
 t(r.kept.every(v=>v===0),'ingredients used though every one was kept: '+r.kept);
 t(/double batch/.test(r.said)&&/You kept/.test(r.said),'the brew message doesn\'t say what happened: '+r.said)}};
