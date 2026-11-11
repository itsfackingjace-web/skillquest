// ---- 120. Prop looks: how things in the world look (trees, rocks, ores, plants, buildings, village details, island props) ----
// The Dev Suite's Props tab paints a new look for a kind of prop; published looks live in the asset library as
// props.<key> = {w,h,s,ox,oy,p,r, fr:[{p,r},...], ms, sy}: frame 1 is p/r, any more frames are in fr (up to 12, all the
// same size), shown ms milliseconds each (sy: every one of that kind animates together; otherwise each starts at its own
// point, so a forest doesn't wave in step). s/2 world px per pixel (s=1 is the game's own HD detail), the top-left at
// (ox,oy) world px from the prop's anchor. Keys and anchors:
//   o:<type>[:<variant>]  a world object (tree, rock, ore, shroom...); anchor = its tile's top-left
//   b:<k>                 a town building on Hollow Island (BLD, by its k); anchor = the top-left of its 2-row footprint
//   b:house<w>, b:castle  players' houses (w tiles wide), castles
//   v:<kind>              village details: lamp, well, sign, bridgeh/bridgev (a bridge tile), grass (tall grass), wreck, hut;
//                         anchor = its tile's top-left (wreck and hut: one tile up and left of their spot, as the game draws them)
//   l:<kind>[:<variant>]  an island building or prop (SQA.ISL_LM); anchor = its top-left tile
// Anything without a published look is drawn by the game's own code, so removing a look puts the original back.
(()=>{if(!window.SQA)return;const A=SQA;
 const PL={},PC=new Map();let ver=0,off=0;// off > 0 while the editor captures the game's own look
 const vfr=(L,F)=>F&&typeof F.p==='string'&&(typeof F.r==='string'||typeof F.d==='string')&&A.pix({...F,w:L.w,h:L.h}).length===L.w*L.h;
 const vsp=L=>L&&L.w>0&&L.h>0&&L.w<=320&&L.h<=320&&L.s>=1&&L.s<=8&&isFinite(L.ox)&&isFinite(L.oy)&&vfr(L,L)&&(!L.fr||Array.isArray(L.fr)&&L.fr.length<=11&&L.fr.every(F=>vfr(L,F)));
 A.onApply(lib=>{for(const k in PL)delete PL[k];PC.clear();ver++;const P=lib&&lib.props||{};for(const k in P)if(vsp(P[k]))PL[k]=P[k]});
 const frames=L=>1+(L.fr?L.fr.length:0),frSp=(L,f)=>f?{w:L.w,h:L.h,s:L.s,p:L.fr[f-1].p,r:L.fr[f-1].r,d:L.fr[f-1].d}:{w:L.w,h:L.h,s:L.s,p:L.p,r:L.r,d:L.d};
 const frameAt=(L,ph)=>{const n=frames(L);if(n<2)return 0;const ms=Math.max(60,Math.min(5000,L.ms|0||250));return Math.floor(performance.now()/ms+(L.sy?0:ph||0))%n};
 const can=(k,L,f)=>{const key=k+'#'+f;let c=PC.get(key);if(!c){c=A.render(frSp(L,f));PC.set(key,c)}return c};
 // draw a look at an anchor; ph = this one's own start in the animation; L given = a look straight from the editor
 function drawLook(key,X,Y,L,ph){const live=!L;L=L||(off?null:PL[key]);if(!L)return false;const f=frameAt(L,ph),c=live?can(key,L,f):A.render(frSp(L,f)),w=L.w*L.s/2,h=L.h*L.s/2;
  g.save();g.imageSmoothingEnabled=false;g.drawImage(c,Math.round((X+L.ox)*2)/2,Math.round((Y+L.oy)*2)/2,w,h);g.restore();return true}
 const phase=(x,y)=>((x*7+y*13)%17)/17*5;
 const okey=o=>'o:'+o.t+(o.v!=null&&o.v!==''?':'+o.v:'');
 const has=k=>!off&&!!PL[k];
 // world objects: Hollow draws them through OBJHD, islands through drawFurn (some island variants never reach OBJHD)
 const objDraw=(o,bx,by,s)=>{const k=okey(o);if(!has(k))return false;const L=PL[k];try{shd(bx,by-1,Math.max(8,Math.min(30,L.w*L.s/2*.7)))}catch(e){}return drawLook(k,bx-8+(s||0),by-14,null,phase(bx>>4,by>>4))};
 const _oh=OBJHD;OBJHD=(o,x,y,bx,by,s,tm)=>{if(o&&objDraw(o,bx,by,s))return true;return _oh?_oh(o,x,y,bx,by,s,tm):false};
 const _df=drawFurn;drawFurn=function(it,tm){
  if(it&&it.t==='_obj'&&it.o&&has(okey(it.o))){const o=it.o,s=o.shake>0?(o.shake-=.016,Math.round(Math.sin(tm*60))):0;objDraw(o,it.x*16+8,it.y*16+14,s);return}
  if(it&&it.t==='lm'&&it.k!=='npc'){const k='l:'+it.k+(it.v!=null?':'+it.v:'');if(has(k)){drawLook(k,it.x*16,it.y*16,null,phase(it.x,it.y));return}}
  return _df.apply(this,arguments)};
 // buildings
 const HS=typeof HOUSE_STYLE!=='undefined'?HOUSE_STYLE:null;
 const bkey=b=>{if(!b)return null;if(b.castle)return'b:castle';if(HS&&b.k===HS.k&&b.wall===HS.wall&&b.roof===HS.roof)return'b:house'+(b.w|0);return typeof BLD!=='undefined'&&BLD.includes(b)?'b:'+b.k:null};
 const _db=drBld;drBld=function(b,tm){const k=bkey(b);if(k&&has(k)){drawLook(k,b.tx*16,b.ty*16,null,phase(b.tx,b.ty));return}return _db.apply(this,arguments)};
 // village details
 const wrapT=(name,key,fn)=>{if(typeof window[name]!=='function')return;const o=window[name];window[name]=function(){const r=fn.apply(this,arguments);if(r)return;return o.apply(this,arguments)}};
 wrapT('drawLamp','v:lamp',(x,y)=>{if(!has('v:lamp'))return false;try{shd(x*16+8,y*16+15,10)}catch(e){}return drawLook('v:lamp',x*16,y*16,null,phase(x,y))});
 wrapT('drawWell','v:well',(x,y)=>{if(!has('v:well'))return false;try{shd(x*16+8,y*16+15,20)}catch(e){}return drawLook('v:well',x*16,y*16,null,phase(x,y))});
 wrapT('drawSign','v:sign',i=>{if(!has('v:sign'))return false;const x=i%N,y=(i/N)|0;try{shd(x*16+8,y*16+15,10)}catch(e){}return drawLook('v:sign',x*16,y*16,null,phase(x,y))});
 const bhoriz=i=>ROADS.has(i-1)||ROADS.has(i+1)||(tile[i-1]>0&&!BRIDGE.has(i-1)&&tile[i-1]!==undefined&&!BRIDGE.has(i+N)&&!BRIDGE.has(i-N));
 wrapT('drawBridge','',i=>{const k=bhoriz(i)?'v:bridgeh':'v:bridgev';if(!has(k))return false;const x=i%N,y=(i/N)|0;return drawLook(k,x*16,y*16,null,phase(x,y))});
 wrapT('drawWreck','v:wreck',()=>{if(!has('v:wreck'))return false;const x0=(WRK.x-1)*16,y0=(WRK.y-1)*16;try{shd(x0+24,y0+28,48)}catch(e){}return drawLook('v:wreck',x0,y0)});
 wrapT('drawHut','v:hut',()=>{if(!has('v:hut'))return false;const x0=(HRM.x-1)*16,y0=(HRM.y-1)*16;try{shd(x0+24,HRM.y*16-2,52)}catch(e){}return drawLook('v:hut',x0,y0)});
 if(typeof TGDRAW==='function'){const _tg=TGDRAW;TGDRAW=(x,y,tm)=>{if(has('v:grass')&&drawLook('v:grass',x*16,y*16,null,phase(x,y)))return;return _tg(x,y,tm)}}
 // ---- what can be edited ----
 const TN={tree:'Tree',pine:'Pine',oak:'Oak tree',willow:'Willow',maple:'Maple',yew:'Yew',rock:'Rock',ore:'Iron ore',bush:'Berry bush',cactus:'Cactus',shroom:'Mushroom patch',nutbush:'Hazel bush',
  coal:'Coal',gold:'Gold ore',mith:'Mithril ore',adam:'Adamant ore',boulder:'Boulder',copper:'Copper ore',tin:'Tin ore',silver:'Silver ore',runite:'Runite ore'};
 const VN={'tree:dark':'Dark tree','tree:dead':'Dead tree','rock:moss':'Mossy rock','ore:crystal':'Crystal','shroom:brown':'Mushroom patch (brown)','shroom:void':'Mushroom patch (void)'};
 const pretty=s=>String(s).replace(/^[a-z]/,c=>c.toUpperCase()).replace(/_/g,' ');
 const TOWN={gen:'General store',smith:'Smithy',tackle:'Tackle shop',inn:'Inn',forge:'Forge'},TP={hv:'Hollow Village house',sm:'Saltmere house',fh:'Frosthollow building',dh:'Dusthaven building',tw:'Tidewatch building'};
 // village details: how to draw the game's own one at the anchor (0,0)
 const at11=(o,f)=>{const k=o&&{x:o.x,y:o.y};if(!o)return;o.x=1;o.y=1;try{f()}finally{o.x=k.x;o.y=k.y}};
 const VIL=[['v:lamp','Street lamp',()=>drawLamp(0,0,0)],['v:well','Well',()=>drawWell(0,0)],['v:sign','Signpost',()=>drawSign(0)],
  ['v:bridgeh','Bridge (east-west)',()=>hdPut(hdBridgeT(true,true),0,0)],['v:bridgev','Bridge (north-south)',()=>hdPut(hdBridgeT(false,true),0,0)],
  ['v:grass','Tall grass',()=>{try{(TGDRAW||(()=>{}))(-99,-99,0)}catch(e){}}],['v:wreck','Shipwreck',()=>at11(WRK,()=>drawWreck(0))],['v:hut','Hermit\'s hut',()=>at11(HRM,()=>drawHut())]];
 function list(){const out=[];const seen=new Set(),add=(k,n,grp,mk)=>{if(seen.has(k))return;seen.add(k);out.push({k,n,grp,mk})};
  const T=Object.keys(typeof OHP!=='undefined'?OHP:{});const order=['tree','pine','oak','willow','maple','yew','bush','nutbush','shroom','cactus','rock','ore'];
  for(const t of order.concat(T.filter(t=>!order.includes(t)).sort()))if(OHP[t]!=null){const o={t,hp:OHP[t]};add(okey(o),TN[t]||(window.SQBOUL&&SQBOUL[t]?pretty(SQBOUL[t].n||t):pretty(t)),'Nature',()=>({t:'_obj',x:0,y:0,o}))}
  for(const kv in VN){const[t,v]=kv.split(':');const o={t,v,hp:OHP[t]||3};add(okey(o),VN[kv],'Nature',()=>({t:'_obj',x:0,y:0,o}))}
  if(typeof BLD!=='undefined')for(const b of BLD){const m=/^([a-z]+)(\d+)$/.exec(b.k),m2=/^([a-z]{2})_(.+)$/.exec(b.k),TW={tw:'Tidewatch',fh:'Frosthollow',dh:'Dusthaven',sm:'Saltmere',hv:'Hollow Village'},n=TOWN[b.k]||(m&&TP[m[1]]?TP[m[1]]+' '+m[2]:m2&&TW[m2[1]]?TW[m2[1]]+' '+m2[2].replace(/_/g,' '):pretty(b.k));add('b:'+b.k,n,'Buildings',()=>({bld:{...b,tx:0,ty:0}}))}
  if(HS)for(const w of[5,7])add('b:house'+w,'Player house ('+w+' wide)','Buildings',()=>({bld:{...HS,w,tx:0,ty:0}}));
  add('b:castle','Castle','Buildings',()=>({bld:{...(HS||{}),k:'home',w:9,tx:0,ty:0,castle:true}}));
  for(const[k,n,f]of VIL)add(k,n,'Village details',()=>({fn:f}));
  for(const kk in A.ISL_LM){const[k,v]=kk.split(':'),L=A.ISL_LM[kk];add('l:'+kk,L[0],'Island props',()=>({t:'lm',k,v:L[3],x:0,y:0,w:L[1],h:L[2],sh:L[2],name:L[0]}))}
  return out}
 // ---- the game's own look, for the editor to start from: drawn by the game at 2x onto its hidden screen canvas ----
 function capture(key){const it=list().find(q=>q.k===key);if(!it)return null;const cvs=g.canvas,OX=80,OY=Math.min(260,cvs.height-120);off++;
  try{const m=it.mk();g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cvs.width,cvs.height);g.setTransform(2,0,0,2,OX,OY);GC=g;
   if(m.bld)drBld(m.bld,0);else if(m.fn){if(key==='v:grass')(TGDRAW||(()=>{}))(0,0,0);else m.fn()}else drawFurn(m,0);g.restore();
   const W=Math.min(cvs.width,OX+700),H=Math.min(cvs.height,OY+120),d=g.getImageData(0,0,W,H).data;let x0=W,y0=H,x1=-1,y1=-1;
   for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>=128){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
   if(x1<x0)return null;if((x0-OX)%2)x0--;if((y0-OY)%2)y0--;const c=document.createElement('canvas');c.width=Math.min(320,x1-x0+1);c.height=Math.min(320,y1-y0+1);c.getContext('2d').drawImage(cvs,x0,y0,c.width,c.height,0,0,c.width,c.height);
   return{url:c.toDataURL(),ox:(x0-OX)/2,oy:(y0-OY)/2}}
  catch(e){console.warn('prop capture',e);return null}finally{off--}}
 // a small picture of a prop as players see it now (the list's thumbnails)
 const TH=new Map();function thumb(key){if(TH.has(key+'@'+ver))return TH.get(key+'@'+ver);let u='';
  if(PL[key]){u=A.render(frSp(PL[key],0)).toDataURL()}else{const c=capture(key);u=c?c.url:''}if(!u)u='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';TH.set(key+'@'+ver,u);return u}
 window.SQPROPS={list,capture,thumb,drawLook,valid:vsp,frames,frSp,frameAt,get looks(){return PL},clearThumbs(){TH.clear()}}})();
