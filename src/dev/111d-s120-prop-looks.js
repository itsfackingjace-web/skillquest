// ---- 120. Prop looks: how things in the world look (trees, rocks, ores, plants, buildings, island props) ----
// The Dev Suite's Props tab paints a new look for a kind of prop; published looks live in the asset library as
// props.<key> = {w,h,s,ox,oy,p,r}: one picture, s/2 world px per pixel (s=1 is the game's own HD detail), its top-left
// at (ox,oy) world px from the prop's anchor. Keys and anchors:
//   o:<type>[:<variant>]  a world object (tree, rock, ore, shroom...); anchor = its tile's top-left
//   b:<k>                 a town building on Hollow Island (BLD, by its k); anchor = the top-left of its 2-row footprint
//   b:house<w>            players' houses (w tiles wide)
//   l:<kind>[:<variant>]  an island building or prop (SQA.ISL_LM); anchor = its top-left tile
// Anything without a published look is drawn by the game's own code, so removing a look puts the original back.
(()=>{if(!window.SQA)return;const A=SQA;
 const PL={},PC=new Map();let ver=0,off=0;// off > 0 while the editor captures the game's own look
 const vsp=L=>L&&L.w>0&&L.h>0&&L.w<=320&&L.h<=320&&L.s>=1&&L.s<=8&&isFinite(L.ox)&&isFinite(L.oy)&&typeof L.p==='string'&&(typeof L.r==='string'||typeof L.d==='string')&&A.pix(L).length===L.w*L.h;
 A.onApply(lib=>{for(const k in PL)delete PL[k];PC.clear();ver++;const P=lib&&lib.props||{};for(const k in P)if(vsp(P[k]))PL[k]=P[k]});
 const can=(k,L)=>{let c=PC.get(k);if(!c){c=A.render(L);PC.set(k,c)}return c};
 // draw a look; L given = a look straight from the editor (for previews)
 function drawLook(key,X,Y,L){L=L||(off?null:PL[key]);if(!L)return false;const c=L===PL[key]?can(key,L):A.render(L),w=L.w*L.s/2,h=L.h*L.s/2;
  g.save();g.imageSmoothingEnabled=false;g.drawImage(c,Math.round((X+L.ox)*2)/2,Math.round((Y+L.oy)*2)/2,w,h);g.restore();return true}
 const okey=o=>'o:'+o.t+(o.v!=null&&o.v!==''?':'+o.v:'');
 const has=k=>!off&&!!PL[k];
 // world objects: Hollow draws them through OBJHD, islands through drawFurn (some island variants never reach OBJHD)
 const objDraw=(o,bx,by,s)=>{const k=okey(o);if(!has(k))return false;const L=PL[k];try{shd(bx,by-1,Math.max(8,Math.min(30,L.w*L.s/2*.7)))}catch(e){}return drawLook(k,bx-8+(s||0),by-14)};
 const _oh=OBJHD;OBJHD=(o,x,y,bx,by,s,tm)=>{if(o&&objDraw(o,bx,by,s))return true;return _oh?_oh(o,x,y,bx,by,s,tm):false};
 const _df=drawFurn;drawFurn=function(it,tm){
  if(it&&it.t==='_obj'&&it.o&&has(okey(it.o))){const o=it.o,s=o.shake>0?(o.shake-=.016,Math.round(Math.sin(tm*60))):0;objDraw(o,it.x*16+8,it.y*16+14,s);return}
  if(it&&it.t==='lm'&&it.k!=='npc'){const k='l:'+it.k+(it.v!=null?':'+it.v:'');if(has(k)){drawLook(k,it.x*16,it.y*16);return}}
  return _df.apply(this,arguments)};
 // buildings
 const HS=typeof HOUSE_STYLE!=='undefined'?HOUSE_STYLE:null;
 const bkey=b=>{if(!b)return null;if(b.castle)return'b:castle';if(HS&&b.k===HS.k&&b.wall===HS.wall&&b.roof===HS.roof)return'b:house'+(b.w|0);return typeof BLD!=='undefined'&&BLD.includes(b)?'b:'+b.k:null};
 const _db=drBld;drBld=function(b,tm){const k=bkey(b);if(k&&has(k)){drawLook(k,b.tx*16,b.ty*16);return}return _db.apply(this,arguments)};
 // ---- what can be edited ----
 const TN={tree:'Tree',pine:'Pine',oak:'Oak tree',willow:'Willow',maple:'Maple',yew:'Yew',rock:'Rock',ore:'Iron ore',bush:'Berry bush',cactus:'Cactus',shroom:'Mushroom patch',nutbush:'Hazel bush',
  coal:'Coal',gold:'Gold ore',mith:'Mithril ore',adam:'Adamant ore',boulder:'Boulder',copper:'Copper ore',tin:'Tin ore',silver:'Silver ore',runite:'Runite ore'};
 const VN={'tree:dark':'Dark tree','tree:dead':'Dead tree','rock:moss':'Mossy rock','ore:crystal':'Crystal','shroom:brown':'Mushroom patch (brown)','shroom:void':'Mushroom patch (void)'};
 const pretty=s=>String(s).replace(/^[a-z]/,c=>c.toUpperCase()).replace(/_/g,' ');
 const TOWN={gen:'General store',smith:'Smithy',tackle:'Tackle shop',inn:'Inn',forge:'Forge'},TP={hv:'Hollow Village house',sm:'Saltmere house',fh:'Frosthollow building',dh:'Dusthaven building',tw:'Tidewatch building'};
 function list(){const out=[];const seen=new Set(),add=(k,n,grp,mk)=>{if(seen.has(k))return;seen.add(k);out.push({k,n,grp,mk})};
  const T=Object.keys(typeof OHP!=='undefined'?OHP:{});const order=['tree','pine','oak','willow','maple','yew','bush','nutbush','shroom','cactus','rock','ore'];
  for(const t of order.concat(T.filter(t=>!order.includes(t)).sort()))if(OHP[t]!=null){const o={t,hp:OHP[t]};add(okey(o),TN[t]||(window.SQBOUL&&SQBOUL[t]?pretty(SQBOUL[t].n||t):pretty(t)),'Nature',()=>({t:'_obj',x:0,y:0,o}))}
  for(const kv in VN){const[t,v]=kv.split(':');const o={t,v,hp:OHP[t]||3};add(okey(o),VN[kv],'Nature',()=>({t:'_obj',x:0,y:0,o}))}
  if(typeof BLD!=='undefined')for(const b of BLD){const m=/^([a-z]+)(\d+)$/.exec(b.k),n=TOWN[b.k]||(m&&TP[m[1]]?TP[m[1]]+' '+m[2]:pretty(b.k));add('b:'+b.k,n,'Buildings',()=>({bld:{...b,tx:0,ty:0}}))}
  if(HS)for(const w of[5,7])add('b:house'+w,'Player house ('+w+' wide)','Buildings',()=>({bld:{...HS,w,tx:0,ty:0}}));
  add('b:castle','Castle','Buildings',()=>({bld:{...(HS||{}),k:'home',w:9,tx:0,ty:0,castle:true}}));
  for(const kk in A.ISL_LM){const[k,v]=kk.split(':'),L=A.ISL_LM[kk];add('l:'+kk,L[0],'Island props',()=>({t:'lm',k,v:L[3],x:0,y:0,w:L[1],h:L[2],sh:L[2],name:L[0]}))}
  return out}
 // ---- the game's own look, for the editor to start from: drawn by the game at 2x onto its hidden screen canvas ----
 function capture(key){const it=list().find(q=>q.k===key);if(!it)return null;const cvs=g.canvas,OX=80,OY=Math.min(260,cvs.height-120);off++;
  try{const m=it.mk();g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cvs.width,cvs.height);g.setTransform(2,0,0,2,OX,OY);GC=g;
   if(m.bld)drBld(m.bld,0);else drawFurn(m,0);g.restore();
   const W=Math.min(cvs.width,OX+700),H=Math.min(cvs.height,OY+120),d=g.getImageData(0,0,W,H).data;let x0=W,y0=H,x1=-1,y1=-1;
   for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>=128){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
   if(x1<x0)return null;if((x0-OX)%2)x0--;if((y0-OY)%2)y0--;const c=document.createElement('canvas');c.width=Math.min(320,x1-x0+1);c.height=Math.min(320,y1-y0+1);c.getContext('2d').drawImage(cvs,x0,y0,c.width,c.height,0,0,c.width,c.height);
   return{url:c.toDataURL(),ox:(x0-OX)/2,oy:(y0-OY)/2}}
  catch(e){console.warn('prop capture',e);return null}finally{off--}}
 // a small picture of a prop as players see it now (the list's thumbnails)
 const TH=new Map();function thumb(key){if(TH.has(key+'@'+ver))return TH.get(key+'@'+ver);let u='';
  if(PL[key]){u=A.render(PL[key]).toDataURL()}else{const c=capture(key);u=c?c.url:''}TH.set(key+'@'+ver,u);return u}
 window.SQPROPS={list,capture,thumb,drawLook,valid:vsp,get looks(){return PL},clearThumbs(){TH.clear()}}})();
