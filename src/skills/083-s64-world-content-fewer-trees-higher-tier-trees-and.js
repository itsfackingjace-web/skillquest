// ---------------------------------------------------------------- 64. World content: fewer trees, higher-tier trees and ores, dungeon mining, campfires overseas
// - About 40% fewer trees everywhere (picked by a fixed hash, so every player has the same forest).
// - Higher-tier trees (Woodcutting): Oak 15, Willow 30, Maple 45, Yew 60. Higher-tier ores (Mining): Gold 30, Mithril 45, Adamant 60.
//   They are more common the farther you go from Hollow Village and on the outer islands. Logs and ores sell well;
//   ores smelt into bars at a furnace (Smithing 30 / 45 / 60).
// - Dungeon floors have rocks and ore veins to mine (they come back with the floor each day).
// - Campfires can be built on the other islands too.
{const h01=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v)};
 const SMI_=SKN.indexOf('Smithing');
 const TIER={
  oak:{base:'tree',sk:1,lv:15,hp:6,axe:1,item:'oaklog',xp:60,col:['#3f8a2c','#5aa83a','#7cc650','#2a6420']},
  willow:{base:'tree',sk:1,lv:30,hp:8,axe:1,item:'willowlog',xp:100,col:['#4c8a3a','#6fae4a','#9cd070','#33602a']},
  maple:{base:'tree',sk:1,lv:45,hp:10,axe:2,item:'maplelog',xp:160,col:['#a83a20','#d0582a','#f08a40','#78281a']},
  yew:{base:'tree',sk:1,lv:60,hp:14,axe:3,item:'yewlog',xp:250,col:['#1e4a3a','#2c6a50','#3e8a68','#12302a']},
  gold:{base:'ore',sk:2,lv:30,hp:8,pick:2,item:'goldore',xp:90,ore:'#f8d048'},
  mith:{base:'ore',sk:2,lv:45,hp:10,pick:3,item:'mithore',xp:140,ore:'#5870e8'},
  adam:{base:'ore',sk:2,lv:60,hp:14,pick:3,item:'adamore',xp:220,ore:'#40b868'}};
 window.SQTIER=TIER;
 for(const k in TIER){OHP[k]=TIER[k].hp;SKOF[k]=TIER[k].sk}
 const ITEMS={oaklog:['Oak logs','Heavy oak. Sells well, and burns longer in a campfire.',8],willowlog:['Willow logs','Light, springy wood.',14],maplelog:['Maple logs','Fine-grained wood that sells for a good price.',24],yewlog:['Yew logs','Rare, prized wood.',40],
  goldore:['Gold ore','Smelt into gold bars at a furnace (Smithing 30).',20],mithore:['Mithril ore','A light blue metal. Smelt at a furnace (Smithing 45).',32],adamore:['Adamant ore','A tough green metal. Smelt at a furnace (Smithing 60).',50],
  gbar:['Gold bar','A gleaming bar. Merchants pay well for it.',60],mbar:['Mithril bar','Light and strong.',90],abar:['Adamant bar','Very hard to work.',140]};
 for(const k in ITEMS){INVK.push(k);INAME[k]=ITEMS[k][0];if(typeof IDESC!=='undefined')IDESC[k]=ITEMS[k][1];SELLP[k]=ITEMS[k][2];SN[k]=ITEMS[k][0];if(typeof SHORT!=='undefined')SHORT[k]=ITEMS[k][0].toLowerCase()}
 SM.push({k:'gbar',n:'Gold bar',smelt:1,c:{goldore:1,wood:1},lv:30,xp:70},{k:'mbar',n:'Mithril bar',smelt:1,c:{mithore:1,wood:2},lv:45,xp:110},{k:'abar',n:'Adamant bar',smelt:1,c:{adamore:2,wood:2},lv:60,xp:170});
 // icons
 const _ic64=iconURL;iconURL=function(k,col){const L=ITEMS[k];if(!L)return _ic64(k,col);const key='t64'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a+1,b+1,w,h)};
  const LOG={oaklog:['#8a5a28','#b07838','#d8a868'],willowlog:['#a89058','#c8b070','#e8d8a0'],maplelog:['#9a4a28','#c06a38','#e8a070'],yewlog:['#5a3a20','#7a5030','#b08858']},BAR={gbar:['#f8f0a0','#f0c838','#b88a18'],mbar:['#c8d8f8','#6880e0','#3848a0'],abar:['#b8f0c0','#48b860','#287838']},ORE={goldore:'#f8d048',mithore:'#6880f0',adamore:'#48c070'};
  if(LOG[k]){const[a,b,cc]=LOG[k];r(1,4,10,5,a);r(1,4,10,1,b);r(9,4,2,5,cc);r(10,5,1,3,a)}
  else if(BAR[k]){const[a,b,cc]=BAR[k];r(3,4,6,1,a);r(2,5,8,2,b);r(1,7,10,2,cc)}
  else{for(let j=0;j<12;j++)for(let i=0;i<12;i++)if(((i+.5-6)/5)**2+((j+.5-7)/3.8)**2<=1)r(i,j,1,1,'#8888a0');r(3,6,2,1,ORE[k]);r(7,8,2,1,ORE[k]);r(6,4,1,1,ORE[k]);r(4,9,1,1,ORE[k])}
  return ICONC[key]=c.toDataURL()};
 // sprites: recolor the tree and ore-vein sprites for each tier
 const recolor=(src,fn)=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');x.drawImage(src,0,0);const im=x.getImageData(0,0,c.width,c.height),d=im.data;
  for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const o=fn(d[i],d[i+1],d[i+2]);if(o){d[i]=o[0];d[i+1]=o[1];d[i+2]=o[2]}}x.putImageData(im,0,0);return c};
 const hx=s=>[parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)];
 const _hs64=hdSprites;hdSprites=function(){const S=_hs64();if(S&&!S._t64&&S.tree&&S.ore){S._t64=1;
  for(const k in TIER){const T=TIER[k];if(T.base==='tree'){const pal=T.col.map(hx);S[k]=S.tree.map(sp=>recolor(sp,(r,g,b)=>{if(!(g>r+12&&g>=b))return null;const l=(r+g+b)/3;return l<60?pal[3]:l<100?pal[0]:l<150?pal[1]:pal[2]}))}
   else{const oc=hx(T.ore);S[k]=S.ore.map(sp=>recolor(sp,(r,g,b)=>r>170&&g>90&&g<190&&b<130?oc:null))}}}return S};
 // fewer trees, and some trees / rocks / veins become higher tiers (same for every player)
 const VCX=(typeof VX!=='undefined'?VX:N/2),VCY=(typeof VY!=='undefined'?VY:N/2);
 function tierFor(t,a,b,far){const r=h01(a+3.1,b+7.7);
  if(t==='tree'){const p=.06+far*.22;if(r<p*.08&&far>.55)return'yew';if(r<p*.22&&far>.4)return'maple';if(r<p*.5)return'willow';if(r<p)return'oak';return t}
  if(t==='rock'||t==='ore'){const p=(t==='ore'?.15:.04)+far*.1;if(r<p*.15&&far>.5)return'adam';if(r<p*.4&&far>.3)return'mith';if(r<p)return'gold';return t}return t}
 for(let i=0;i<obj.length;i++){const o=obj[i];if(!o)continue;const x=i%N,y=(i/N)|0;
  if((o.t==='tree'||o.t==='pine')&&h01(x,y)<.4){obj[i]=null;continue}
  const far=Math.min(1,Math.hypot(x-VCX,y-VCY)/(N*.6)),nt=tierFor(o.t,x,y,far);if(nt!==o.t){obj[i]={t:nt,hp:OHP[nt]}}}
 if(typeof HDCH!=='undefined'&&HDCH&&HDCH.clear)try{HDCH.clear()}catch(e){}
 function tierRegion(R){if(!R||R._t64)return;R._t64=1;const seed=(R.region||'').split('').reduce((a,c)=>a*31+c.charCodeAt(0),7)%9973;const keep=[];
  for(const it of R.items){if(it.t!=='_obj'||!it.o){keep.push(it);continue}const t=it.o.t;
   if((t==='tree'||t==='pine')&&h01(it.x+seed,it.y)<.4){rgCellDel(R,it);R.solid.delete(it.y*R.w+it.x);continue}
   const nt=tierFor(t,it.x+seed*.37,it.y+seed*.11,.55+h01(seed,it.x*.01)*.3);if(nt!==t){it.o.t=nt;it.o.hp=OHP[nt]}keep.push(it)}
  R.items.length=0;R.items.push(...keep)}
 const _lr64=loadRegion;loadRegion=function(id,want,ret){const ok=_lr64(id,want,ret);try{const R=SCENE&&SCENE.room;if(R&&R.region)tierRegion(R)}catch(e){console.warn(e)}return ok};
 // dungeon floors: rocks and ore veins in open spots
 const _bf64=buildFloor;buildFloor=function(kind,f){const R=_bf64(kind,f);try{const D=R.dun,G=D&&D.G,W=R.w,H=R.h;if(!G)return R;const used=new Set();for(const it of R.items)for(let dy=0;dy<(it.sh||1);dy++)for(let dx=0;dx<(it.w||1);dx++)used.add((it.y+dy)*W+it.x+dx);
  const open=i=>{const x=i%W,y=(i/W)|0;if(x<2||y<3||x>W-3||y>H-3)return false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const j=(y+dy)*W+x+dx;if(G[j]||used.has(j))return false}return Math.abs(x-R.ex)>3||y<H-4};
  const seed=today()*7919+f*104729+kind.length*13;let placed=0;const want=4+Math.floor(h01(seed,1)*4);
  for(let t=0;t<600&&placed<want;t++){const i=Math.floor(h01(seed,t+2)*W*H);if(!open(i))continue;const x=i%W,y=(i/W)|0,r=h01(seed+5,t),deep=Math.min(1,.3+f*.25);
   const ty=r<.45?'rock':r<.7?'ore':tierFor('ore',x+seed,y,deep);R.items.push({t:'_obj',o:{t:ty,hp:OHP[ty]||4},x,y,solid:true,dmine:1});R.solid.add(i);used.add(i);placed++}}catch(e){console.warn(e)}return R};
 // gathering the new trees and ores, and mining in dungeons
 function tierHit(o,done){const T=TIER[o.t];if(T){if(T.sk===1&&TL.axe<T.axe){say('You need a better axe for '+INAME[T.item].replace(' logs','').toLowerCase()+' trees.');sfx('swish');swing=.25;return}
   if(T.sk===2&&TL.pick<T.pick){say('You need a better pickaxe for this vein.');sfx('swish');swing=.25;return}
   if(lvOf(T.sk)<T.lv){say('You need '+SKN[T.sk]+' '+T.lv+' for this.');sfx('swish');swing=.25;return}}
  else if(o.t==='rock'&&TL.pick<1){say('Need a pickaxe - craft one!');swing=.25;sfx('swish');return}
  else if(o.t==='ore'&&(TL.pick<2||lvOf(2)<5)){say(TL.pick<2?'This vein needs a stone pickaxe or better.':'You need Mining 5 to mine iron.');swing=.25;sfx('swish');return}
  const sk=T?T.sk:o.t==='rock'||o.t==='ore'?2:1;swing=.25/(1+(typeof gSpeed==='function'?gSpeed(sk):0));o.hp-=sk===1?1+TL.axe:Math.max(1,TL.pick);o.shake=.15;sfx(sk===1?'chop':'mine');if(o.hp>0)return;
  if(T){const n=1+(Math.random()<lvOf(sk)*.006?1:0);inv[T.item]=(inv[T.item]|0)+n;if(sk===1)inv.wood=(inv.wood|0)+1;say('+'+n+' '+INAME[T.item].toLowerCase()+(sk===1?' and +1 wood':''));addXp(sk,T.xp)}
  else if(o.t==='rock'){const n=2;inv.stone=(inv.stone|0)+n;say('+2 stone');addXp(2,18)}else{inv.iron=(inv.iron|0)+1;say('+1 iron ore');addXp(2,40)}
  done();setTimeout(()=>sfx('pickup'),90);saveLocal()}
 const _atk64=attack;attack=function(){if(!dead&&!menuOpen&&!pnOpen&&!BUILD&&!FISH&&swing<=0&&!facingNpc()){const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16);
   if(!en.some(n=>!n.dead&&Math.hypot(n.x-fx,n.y-fy)<(n.big?24:16))){
    if(!SCENE&&tx>=0&&ty>=0&&tx<N&&ty<N){const i=ty*N+tx,o=obj[i];if(o&&TIER[o.t]){tierHit(o,()=>{obj[i]=null;REM.push({i,t:o.t,at:CLK})});return}}
    const R=SCENE&&SCENE.room;
    if(R&&R.region){const it=rgObjAt(R,tx,ty);if(it&&TIER[it.o.t]){tierHit(it.o,()=>{it.gone=true;rgCellDel(R,it);R.solid.delete(it.y*R.w+it.x);R.gone.push({it,at:CLK})});return}}
    else if(R&&R.dun){const it=R.items.find(q=>q.dmine&&q.x===tx&&q.y===ty);if(it){tierHit(it.o,()=>{const j=R.items.indexOf(it);if(j>=0)R.items.splice(j,1);R.solid.delete(ty*R.w+tx)});return}}}}
  _atk64()};
 // campfires on the other islands: each island keeps its own fires
 const fireStash={};window.FIRESTASH=fireStash;let fireReg=curRegion();
 const _u64c=upd;upd=function(dt){const r=window.fireKey64?fireKey64():curRegion();if(r!==fireReg){fireStash[fireReg]=fires.filter(f=>!f._rp);fires=(fireStash[r]||[]).filter(f=>f.life>0);fireReg=r}_u64c(dt)};
 const _fi64=fire;fire=function(){const R=SCENE&&SCENE.room;if(!R||!R.region)return _fi64();if(dead||(typeof SAILING!=='undefined'&&SAILING))return;
  if(!((inv.wood|0)>=3&&(inv.stone|0)>=1)){say('Need 3 wood + 1 stone');return}const[fx,fy]=front(16);if(solid(fx,fy)){say('No room there');return}
  inv.wood-=3;inv.stone--;const life=(150+lvOf(5)*3)*(1+(typeof fDur==='function'?fDur():0));fires.push({x:fx,y:fy,life,mx:life});say('Campfire built');addXp(5,40);sfx('fire');saveLocal()};
 const _rn64=rgNear;rgNear=function(R,...a){const out=_rn64(R,...a);if(SCENE&&SCENE.room===R)for(const f of fires)if(!f._glow)out.push({t:'_fire',f,x:f.x/16,y:(f.y+3)/16-1});return out};
 const _df64=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='_fire'){pF(it.f,tm);return}return _df64(it,tm)}}
