// Nov 24 (Jace): "players cant actually see other players chopping trees" and "trees on the guild isle seem to be per device rather
// than shared ... they're able to chop the same tree immediately after i've already cut it". A chop or a mine now goes out as an fx
// event (280) that others draw in your hands; 061 shares guild islands' used-up trees, rocks and bushes like every other island's
// (world/res/r_gi_<guild>/<cell>), growing back after 60 s there. Also: the fall message says where the extra log limit comes from.
module.exports={name:'others see you chop; guild island trees are shared; the fall says where its log limit comes from',players:2,async run([A,B],t){
 const W=ms=>A.waitForTimeout(ms);
 const pos=await A.evaluate(()=>({x:P.x,y:P.y}));await B.evaluate(p=>{P.x=p.x+24;P.y=p.y},pos);
 const ids=[await A.evaluate(()=>SQMP.user.uid),await B.evaluate(()=>SQMP.user.uid)];
 for(let i=0;i<40;i++){const ok=await A.evaluate(u=>!!SQMP.players.get(u),ids[1])&&await B.evaluate(u=>!!SQMP.players.get(u),ids[0]);if(ok)break;await W(300)}
 await B.evaluate(()=>{const f=SQFXH.tl;window.__tl=[];SQFXH.tl=function(r,v){window.__tl.push([r&&r.uid,v.m,v.i,v.u]);const o=f.apply(this,arguments);window.__tool=r&&r.tool&&{type:r.tool.type,key:r.tool.key};return o}});
 // Ann chops a yew with an adamant axe +1
 const msg=await A.evaluate(()=>{try{if(pnOpen)closePanel()}catch(e){}XPS[1]=XT[69];inv.u1_eq_axe7=1;equipItem('u1_eq_axe7');PERKS[1]={};en=[];face=[0,-1];const[fx,fy]=front(13),i=Math.floor(fy/16)*N+Math.floor(fx/16);
  let said='';const s0=say;say=function(m){said=String(m);return s0.apply(this,arguments)};obj[i]={t:'yew',hp:OHP.yew};for(let k=0;k<20&&obj[i]&&obj[i].t==='yew';k++){swing=0;attack()}say=s0;return said});
 t(/\(felled: \d+ of 1-2: \+1 from your \+1 axe\)/.test(msg),'the fall says the limit comes from the +1 axe: '+msg);
 let seen=[];for(let i=0;i<20;i++){seen=await B.evaluate(()=>window.__tl);if(seen.length)break;await W(250)}
 t(seen.length>0,'Bob got Ann\'s chop');const s=seen[0]||[];t.eq([s[0],s[1],s[2]],[ids[0],'c','eq_axe7'],'a chop with the adamant axe, from Ann');
 t.eq(await B.evaluate(()=>window.__tool&&window.__tool.type),'chop','Bob draws an axe in Ann\'s hands');
 // a guild island: Ann's felled tree is shared, and one another member fells disappears for her
 const r=await A.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms)),G=SQGUILD,API=G.api,until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(200)}return false};
  GLD=6e6;API.create('Chop Guild','CHG',1);if(!await until(()=>G.id&&API.ready,8000))return{err:'guild was not founded'};
  routeOpen=()=>true;routeGo(G.isle());if(!await until(()=>API.onIsle()&&!(typeof TRAVEL!=='undefined'&&TRAVEL),30000))return{err:'never reached the guild island'};await W(800);
  const R=SCENE.room,out={loc:SQRES.rloc,regrow:[SQRES.regrow('r_gi_x'),SQRES.regrow('r_briarwood')]};
  // two trees: one in front of Ann, one two tiles further
  face=[0,-1];const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16);const mk=(x,y)=>{const old=rgObjAt(R,x,y);if(old){old.gone=true;rgCellDel(R,old)}const it={t:'_obj',x,y,o:{t:'tree',hp:OHP.tree}};R.items.push(it);rgCellAdd(R,it);R.solid.add(y*R.w+x);return it};
  const t1=mk(tx,ty),t2=mk(tx+2,ty);/* felled the way 050 does it (where Ann lands, HIT can face the water and fish) */t1.gone=true;rgCellDel(R,t1);R.solid.delete(ty*R.w+tx);R.gone.push({it:t1,at:CLK});out.fell=true;
  const F=SQFB,d=F.db,idx1=ty*R.w+tx,idx2=ty*R.w+tx+2;await until(()=>SQRES.r[idx1],6000);const s1=await d.get(d.ref(F.D,'world/res/'+SQRES.rloc+'/'+idx1));out.shared=!!s1.val();
  await d.set(d.ref(F.D,'world/res/'+SQRES.rloc+'/'+idx2),{t:'tree',at:d.serverTimestamp()});await until(()=>t2.gone,6000);out.other=t2.gone;
  routeGo('hollow');return out});
 if(r.err)return t(false,r.err);
 t(/^r_gi_/.test(r.loc||''),'the guild island is shared ('+r.loc+')');t.eq(r.regrow,[60000,240000],'guild island trees grow back after 60 s, other islands 4 minutes');
 t(r.fell,'Ann felled the tree');t(r.shared,'her felled tree is in the shared list');t(r.other,'a tree another member felled is gone for her too')}};
