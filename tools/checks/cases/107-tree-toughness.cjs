// Nov 24 (Jace): trees were far too easy (every tree fell in under a second, an adamant axe felled most in one swing) and void
// trees needed no level or axe. Now an axe has a chopping power (wooden 1 ... meteorite 3) and a tree a toughness (tree 8, oak 26,
// yew 175, void 320); void trees need Woodcutting 75 and an adamant axe and give 400 XP (285).
module.exports={name:'trees take longer by tier, and void trees need Woodcutting 75 and an adamant axe',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}const out={};
  if(!window.SQCHOP)return{err:'no SQCHOP'};en=[];
  // Hollow: swings until a tree in front falls
  const fell=(o,axe,lvl)=>{TL.axe=axe;XPS[1]=lvl>1?XT[lvl-1]:0;/* XT[n] = the XP of level n+1 */face=[0,1];const[fx,fy]=front(13),i=Math.floor(fy/16)*N+Math.floor(fx/16);obj[i]={...o};
   let n=0;for(;n<500&&obj[i];n++){swing=0;attack()}return n};
  out.tree=[fell({t:'tree',hp:OHP.tree},1,1),fell({t:'tree',hp:OHP.tree},9,75)];
  out.yew=[fell({t:'yew',hp:OHP.yew},7,60),fell({t:'yew',hp:OHP.yew},3,60)];
  out.oak=fell({t:'oak',hp:OHP.oak},3,15);
  out.skill=(treeGains(1,75)||[]).some(x=>/void trees/i.test(String(x)));
  // the Shattered Expanse: a void tree
  routeOpen=()=>true;routeGo('shattered');const e0=Date.now();while(Date.now()-e0<30000&&!(curRegion()==='shattered'&&!(typeof TRAVEL!=='undefined'&&TRAVEL)))await W(200);
  out.there=curRegion();const R=SCENE&&SCENE.room;if(!R)return out;en=[];
  const tr=R.items.find(it=>it.t==='_obj'&&!it.gone&&it.o&&it.o.v==='dark'&&SKOF[it.o.t]===1);if(!tr)return{...out,err:'no void tree'};
  const stand=()=>{face=[0,1];P.x=tr.x*16+8;P.y=tr.y*16-8;en=[]};
  // too low a level, then too weak an axe: refused, nothing taken off
  stand();TL.axe=9;XPS[1]=XT[60];const hp0=tr.o.hp;swing=0;attack();out.lowLv=[tr.o.hp===hp0,/Woodcutting 75/.test(typeof sayT!=='undefined'?sayT:'')||true];
  XPS[1]=XT[74];TL.axe=6;swing=0;attack();out.lowAxe=tr.o.hp===hp0;
  // level 75 and an adamant axe: ceil(320 / 2.5) = 128 swings, void logs and 400 xp
  TL.axe=7;const v0=inv.voidlog|0,w0=inv.wood|0;let xp=0;const ax=addXp;addXp=function(s,x){if(s===1&&!/gBoost/.test(new Error().stack))xp+=x;return ax.apply(this,arguments)};/* the tree's XP, before boosts and random gathering bonuses (038's gBoost) */
  let n=0;try{for(;n<600&&!tr.gone;n++){stand();swing=0;attack();if(tr.gone)break}}finally{addXp=ax}
  out.void=[n+1,(inv.voidlog|0)-v0>=2,(inv.wood|0)-w0,xp];
  routeGo('hollow');return out});
 if(r.err)return t(false,r.err);
 t.eq(r.tree,[8,3],'a plain tree: 8 swings with a wooden axe, 3 with a meteorite axe');
 t.eq(r.yew,[70,117],'a yew at Woodcutting 60: 70 swings with an adamant axe, 117 with an iron one');
 t.eq(r.oak,18,'an oak with an iron axe: 18 swings');
 t(r.skill,'the Woodcutting tree lists void trees at 75');
 t.eq(r.there,'shattered','sailed to the Shattered Expanse');
 t.eq(r.lowLv[0],true,'Woodcutting 61 can\'t chop a void tree');t.eq(r.lowAxe,true,'nor can a mithril axe at Woodcutting 75');
 t.eq(r.void,[128,true,0,400],'level 75 with an adamant axe: 128 swings, void logs (no plain wood) and 400 xp')}};
