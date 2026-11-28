// Nov 26 (Spencer, in-game report: cotton seeds "eaten", XP given, nothing grows, "the tilled square exists forever"): shared plots
// (077, farm/<area>/<x_y>) cut the crop name to 10 letters and the rules allowed 11, so Cotton (it_new_item_2, a Dev Suite crop) was
// stored as 'it_new_ite' and showed as empty soil. Plots keep the whole name now, and an old cut-off name finds its crop again.
module.exports={name:'a Dev Suite crop planted on shared soil stays planted',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(600);try{if(pnOpen)closePanel()}catch(e){/*quiet*/}
  SQA.preview({content:{items:{it_cotton_seeds:{n:'Cotton seeds',pl:'Cotton seeds',t:'mat',v:20,d:'Plant on tilled soil.'},it_new_item_2:{n:'Cotton',t:'mat',v:50}}},
   gather:{crops:{gc_crop:{n:'Cotton',item:'it_new_item_2',seed:'it_cotton_seeds',lv:40,gm:3,y0:3,y1:6,xp:200,sh:'flower',col:['#dec6af','#d0946c','#f99b5d'],buy:100,ck:'',clv:1,cxp:40}}}});
  await W(300);const out={reg:SEED2CROP.it_cotton_seeds||null};
  XPS[11]=XT[60];TL.hoe=1;inv.it_cotton_seeds=5;en.length=0;
  const px=Math.floor(P.x/16),py=Math.floor(P.y/16);let spot=null;
  for(let d=2;d<40&&!spot;d++)for(let y=py-d;y<=py+d&&!spot;y++)for(let x=px-d;x<=px+d;x++)if(canTill(x,y)&&!solid(x*16+8,(y-1)*16+8)&&canTill(x,y-1)===canTill(x,y-1)){spot=[x,y];break}
  if(!spot)return{err:'no soil'};const[x,y]=spot,i=y*N+x;P.x=x*16+8;P.y=(y-1)*16+8;face=[0,1];swing=0;await W(100);
  TL.bow=0;try{WAND=null}catch(e){/*quiet*/}SQOFFHAND.use();await W(600);out.tilled=FARM.has(i);// the hoe works from the off-hand (140)
  startBuild('it_cotton_seeds');await W(100);face=[0,1];placeBuild();await W(100);try{endBuild()}catch(e){/*quiet*/}
  await W(2500);const pl=FARM.get(i);out.after=[pl&&pl.c,inv.it_cotton_seeds|0];
  const T=window.__db&&window.__db.T,rec=T&&T.farm&&T.farm.hollow2&&T.farm.hollow2[x+'_'+y];out.stored=rec&&rec.c;
  // planting again on it is refused
  startBuild('it_cotton_seeds');await W(100);face=[0,1];placeBuild();await W(100);try{endBuild()}catch(e){/*quiet*/}out.again=inv.it_cotton_seeds|0;
  // an old plot whose name was cut to 10 letters
  out.cut=window.SQSFCROP?SQSFCROP('it_new_ite'):'none';
  SQA.preview(null);return out});
 if(r.err){t(false,r.err);return}
 t.eq(r.reg,'it_new_item_2','the Dev Suite crop is registered');t(r.tilled,'the soil was tilled');
 t.eq(r.after,['it_new_item_2',4],'after the sync the plot still has cotton, one seed used [crop, seeds left]');
 t.eq(r.stored,'it_new_item_2','the shared plot stores the whole crop name');
 t.eq(r.again,4,'planting again on a growing crop uses no seed');
 t.eq(r.cut,'it_new_item_2','a name cut at 10 letters finds its crop')}};
