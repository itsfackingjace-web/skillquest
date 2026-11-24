// Nov 24 (Jace): every furnace and anvil recipe takes its XP and time from its materials, strictly proportional (no minimum or
// maximum): XP = each material's XP × how many, time = each material's seconds × how many (284, values in SQMATXP.DEF).
module.exports={name:'furnace and anvil recipes take their XP and time from their materials, and the Dev Suite can change them live',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}const out={};
  const M=window.SQMATXP;if(!M)return{err:'no SQMATXP'};const D=M.DEF,S=k=>SM.find(r=>r.k===k);
  const sum=(c,f)=>Object.entries(c).reduce((a,[k,n])=>a+n*D[k][f],0);
  // every recipe of the game's own is covered and matches its materials exactly
  out.bad=SM.filter(r=>!r._cu).filter(r=>!r._mx||Math.abs(r.xp-sum(r.c,'x'))>1e-9||Math.abs(r._mt-sum(r.c,'t'))>1e-9).map(r=>r.n);
  out.chest=[S('eq_body5').xp,S('eq_body5')._mt];out.metbar=[S('metbar').xp,Math.round(S('metbar')._mt*10)/10];out.arrows=Math.round(S('arrow')._mt*10)/10;
  // a library apply (163 puts its own numbers back first) keeps them, and balance.mat changes them live
  SQA.preview({balance:{mat:{abar:{x:200},it_test_mat:{x:7,t:.5}},act:{'SM:eq_body5':5}}});await W(200);out.prev=[S('eq_body5').xp,S('eq_body5')._mt,S('eq_sword7').xp];
  SQA.preview(null);await W(200);out.back=S('eq_body5').xp;
  // a Dev Suite recipe with a material that has no values keeps its own XP and time; giving that material values covers it
  const cr={recipes:{r_mxtest:{sk:'smith',out:'idag',c:[{k:'bone',n:2}],lv:1,xp:99}}},C=()=>SM.find(r=>r._cu==='r_mxtest');
  SQA.preview({content:cr});await W(200);out.own=C()?[C().xp,!!C()._mx]:null;
  SQA.preview({content:cr,balance:{mat:{bone:{x:7,t:.5}}}});await W(200);out.cov=C()?[C().xp,C()._mt]:null;SQA.preview(null);await W(200);
  // smithing an iron dagger at Smithing 1: the action lasts the dagger's 0.6 s and gives its 30 xp
  XPS[10]=0;inv.ibar=3;inv.idag=0;
  // the anvil rows say how long (at your level) and how much
  out.row=smithRows(r=>r.k==='idag').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
  const i=SM.findIndex(r=>r.k==='idag');const x0=XPS[10];smithAct(i,false);out.d=window.SQDO?Math.round(SQDO.d*1000)/1000:null;
  for(let k=0;k<40&&window.SQDO;k++)await W(50);out.made=[inv.idag|0,inv.ibar|0,XPS[10]-x0];
  // a smelt: the meteorite bar's 13.2 s (no cap)
  inv.meteorore=15;inv.adamore=15;inv.stardust=3;XPS[10]=XT[80];const j=SM.findIndex(r=>r.k==='metbar');smithAct(j,false);out.d2=window.SQDO?SQDO.d:null;const sp=1+Math.max(0,pSpeed(10));out.d2base=out.d2==null?null:Math.round(out.d2*sp*10)/10;SQDO=null;
  return out});
 if(r.err)return t(false,r.err);
 t.eq(r.bad,[],'every furnace and anvil recipe gets exactly its materials\' XP and time');
 t.eq(r.chest,[680,4],'adamant chestplate: 4 adamant bars = 680 xp, 4 s');
 t.eq(r.metbar,[1530,13.2],'meteorite bar: 15 adamant ore, 15 meteorite ore, 3 stardust = 1,530 xp and 13.2 s (no cap)');
 t.eq(r.arrows,.4,'10 arrows take 0.4 s (no minimum)');
 t.eq(r.prev,[800,4,400],'the library\'s Material XP changes it live, and an old per-recipe XP for it is ignored');
 t.eq(r.back,680,'back to the game\'s numbers without the change');
 t.eq(r.own,[99,false],'a Dev Suite recipe with a material that has no values keeps its own XP');
 t.eq(r.cov,[14,1],'once that material has values (7 xp, 0.5 s) the recipe follows them: 2 bones = 14 xp, 1 s');
 t.eq(r.d,.6,'forging an iron dagger at Smithing 1 takes 0.6 s');
 t.eq(r.made,[1,2,30],'it makes the dagger, uses 1 bar and gives 30 xp');
 t.eq(r.d2base,13.2,'smelting a meteorite bar takes 13.2 s before the level speed-up');
 t(/0\.6 s · 30 xp/.test(r.row),'the anvil row shows the time and XP: '+r.row)}};
