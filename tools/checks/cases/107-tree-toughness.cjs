// Nov 24 (Jace): trees were far too easy (every tree fell in under a second, an adamant axe felled most in one swing) and void
// trees needed no level or axe. Now an axe has a chopping power (wooden 1 ... meteorite 3) and a tree a toughness (tree 3, oak 9,
// yew 42, void 66) with slower 0.6 s chopping swings (later on Nov 24: chops slower and heavier, maple/yew/void quicker); void trees need Woodcutting 75 and an adamant axe and give 400 XP (285).
// Nov 24 evening (287): every chop takes 1 s and toughness is about 0.6 of that (tree 2, oak 5, yew 24, void 39).
module.exports={name:'trees take longer by tier, and void trees need Woodcutting 75 and an adamant axe',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}const out={};
  if(!window.SQCHOP)return{err:'no SQCHOP'};en=[];
  // Hollow: swings until a tree in front falls
  const fell=(o,axe,lvl)=>{TL.axe=axe;XPS[1]=lvl>1?XT[lvl-1]:0;/* XT[n] = the XP of level n+1 */face=[0,1];const[fx,fy]=front(13),i=Math.floor(fy/16)*N+Math.floor(fx/16);obj[i]={...o};
   let n=0;for(;n<500&&obj[i];n++){swing=0;attack()}return n};
  out.tree=[fell({t:'tree',hp:OHP.tree},1,1),fell({t:'tree',hp:OHP.tree},9,75)];
  // a chop is 1 s (287's base chop time, no Quick Chop perks); a swing at nothing stays 0.25 s
  {TL.axe=1;XPS[1]=0;face=[0,1];const[fx,fy]=front(13),i=Math.floor(fy/16)*N+Math.floor(fx/16);obj[i]={t:'tree',hp:OHP.tree};swing=0;attack();const s1=swing;obj[i]=null;swing=0;attack();out.swing=[Math.round(s1*1000)/1000,Math.round(swing*1000)/1000]}
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
  // level 75 and an adamant axe: ceil(39 / 2.5) = 16 chops, void logs and 400 xp
  TL.axe=7;const v0=inv.voidlog|0,w0=inv.wood|0;let xp=0;const ax=addXp;addXp=function(s,x){if(s===1&&!/gBoost/.test(new Error().stack)&&!(window.SQWC&&SQWC.busy))xp+=x;/* 287 holds back the old fell XP while a chop runs and pays by quarters */return ax.apply(this,arguments)};/* the tree's XP, before boosts and random gathering bonuses (038's gBoost) */
  let n=0;try{for(;n<600&&!tr.gone;n++){stand();swing=0;attack();if(tr.gone)break}}finally{addXp=ax}
  out.void=[n+1,(inv.voidlog|0)-v0>=2,(inv.wood|0)-w0,xp];
  routeGo('hollow');return out});
 if(r.err)return t(false,r.err);
 t.eq(r.tree,[2,1],'a plain tree: 2 chops with a wooden axe, 1 with a meteorite axe');
 t.eq(r.swing,[1,.25],'a chop takes 1 s, other swings 0.25 s');
 t.eq(r.yew,[10,16],'a yew: 10 chops with an adamant axe, 16 with an iron one');
 t.eq(r.oak,4,'an oak with an iron axe: 4 chops');
 t(r.skill,'the Woodcutting tree lists void trees at 75');
 t.eq(r.there,'shattered','sailed to the Shattered Expanse');
 t.eq(r.lowLv[0],true,'Woodcutting 61 can\'t chop a void tree');t.eq(r.lowAxe,true,'nor can a mithril axe at Woodcutting 75');
 t.eq(r.void,[16,true,0,400],'level 75 with an adamant axe: 16 chops, void logs (no plain wood) and 400 xp')}};
