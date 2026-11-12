// ---- 120. Prop looks: how things in the world look ----
// The Dev Suite's Props tab paints a new look for a kind of prop; published looks live in the asset library as
// props.<key> = {w,h,s,ox,oy,p,r, fr:[{p,r},...], ms, sy}: frame 1 is p/r, any more frames are in fr (up to 12, all the
// same size), shown ms milliseconds each (sy: every one of that kind animates together; otherwise each starts at its own
// point, so a forest doesn't wave in step). s/2 world px per pixel (s=1 is the game's own HD detail), the top-left at
// (ox,oy) world px from the prop's anchor. <key>@n is the same prop's night look (used after dark when there is one).
// Keys and anchors (an anchor is a tile's top-left unless it says otherwise):
//   o:<type>[:<variant>]  world objects (tree, rock, ore, shroom...)        x:<type>  the spot it leaves while it grows back
//   b:<k>, b:house<w>, b:castle   town buildings, players' houses, castles (anchor = the top-left of the 2-row footprint)
//   v:<kind>              village details: lamp, well, sign, bridgeh/bridgev, grass, wreck, hut (wreck/hut: one tile up-left)
//   v:moored, v:sail_<e|n|s>_<back|front>   boats at the docks; the boat you sail (back = under you, front = over your
//                         legs; west is east mirrored); anchor = the boat's centre point as the game places it
//   p:<k>[:ready]         things players build (stations, furniture, chest, bed) and p:campfire (anchor: the fire's tile)
//   f:<wwall|swall|door>:<c|o|e|w|n|s>   fence and wall pieces: c the post or block itself (o = an open door), e/w/n/s
//                         the part drawn towards a neighbouring piece on that side
//   c:soil, c:soil:wet, c:<crop>:<0|1|2|ripe>   farm plots and crops by growth stage
//   r:<item>[:<w>]        things inside shops, homes, dungeons and caves (and r:icvdoor:<kind> island cave entrances,
//                         r:bwbld:<name> / r:afbld:<name> island village buildings, anchor = their footprint's top-left)
//   l:<kind>[:<variant>]  island buildings and props the island builder places (SQA.ISL_LM)
//   m:<type>[:<variant>]  monsters (the region key, e.g. wolf:briar; anchor = the monster's position). Frames are its walk
//                         cycle (ak: the last frame is its attack pose, shown while it's right next to you); drawn facing
//                         right and mirrored to face you (fw: to face the way it walks); flashes white when hit.
// Anything without a published look is drawn by the game's own code, so removing a look puts the original back.
(()=>{if(!window.SQA)return;const A=SQA;
 const PL={},PC=new Map();let ver=0,off=0,anyX=false,anyR=false,nAt=0,nightNow=false;// off > 0 while the editor captures the game's own look
 const vfr=(L,F)=>F&&typeof F.p==='string'&&(typeof F.r==='string'||typeof F.d==='string')&&A.pix({...F,w:L.w,h:L.h}).length===L.w*L.h;
 const vsp=L=>L&&L.w>0&&L.h>0&&L.w<=320&&L.h<=320&&L.s>=1&&L.s<=8&&isFinite(L.ox)&&isFinite(L.oy)&&vfr(L,L)&&(!L.fr||Array.isArray(L.fr)&&L.fr.length<=11&&L.fr.every(F=>vfr(L,F)));
 A.onApply(lib=>{for(const k in PL)delete PL[k];PC.clear();ver++;const P=lib&&lib.props||{};for(const k in P)if(vsp(P[k]))PL[k]=P[k];anyX=Object.keys(PL).some(k=>k[0]==='x');anyR=Object.keys(PL).some(k=>k[0]==='r')});
 const isNight=()=>{const t=performance.now();if(t-nAt>300){nAt=t;try{nightNow=dark()>.15}catch(e){nightNow=false}}return nightNow};
 const pick=k=>off?null:PL[k+'@n']&&isNight()?k+'@n':PL[k]?k:null,has=k=>!!pick(k);
 const frames=L=>1+(L.fr?L.fr.length:0),frSp=(L,f)=>f?{w:L.w,h:L.h,s:L.s,p:L.fr[f-1].p,r:L.fr[f-1].r,d:L.fr[f-1].d}:{w:L.w,h:L.h,s:L.s,p:L.p,r:L.r,d:L.d};
 const frameAt=(L,ph)=>{const n=frames(L);if(n<2)return 0;const ms=Math.max(60,Math.min(5000,L.ms|0||250));return Math.floor(performance.now()/ms+(L.sy?0:ph||0))%n};
 const can=(k,L,f)=>{const key=k+'#'+f;let c=PC.get(key);if(!c){c=A.render(frSp(L,f));PC.set(key,c)}return c};
 // draw a look at an anchor; ph = this one's own start in the animation; flip = mirrored around the anchor;
 // L given = a look straight from the editor (previews)
 function drawLook(key,X,Y,L,ph,flip,alpha){let k=null;if(!L){k=pick(key);if(!k)return false;L=PL[k]}const f=frameAt(L,ph),c=k?can(k,L,f):A.render(frSp(L,f)),w=L.w*L.s/2,h=L.h*L.s/2;
  g.save();g.imageSmoothingEnabled=false;if(alpha!=null)g.globalAlpha*=alpha;if(flip){g.translate(X*2,0);g.scale(-1,1)}g.drawImage(c,Math.round((X+L.ox)*2)/2,Math.round((Y+L.oy)*2)/2,w,h);g.restore();return true}
 const lookOf=k=>{const q=pick(k);return q?PL[q]:null};
 const phase=(x,y)=>((x*7+y*13)%17)/17*5;
 const okey=o=>'o:'+o.t+(o.v!=null&&o.v!==''?':'+o.v:'');
 // ---- world objects: Hollow draws them through OBJHD, islands through drawFurn ----
 const objDraw=(o,bx,by,s)=>{const k=okey(o),L=lookOf(k);if(!L)return false;try{shd(bx,by-1,Math.max(8,Math.min(30,L.w*L.s/2*.7)))}catch(e){}return drawLook(k,bx-8+(s||0),by-14,null,phase(bx>>4,by>>4))};
 const _oh=OBJHD;OBJHD=(o,x,y,bx,by,s,tm)=>{if(o&&objDraw(o,bx,by,s))return true;return _oh?_oh(o,x,y,bx,by,s,tm):false};
 // ---- things in rooms, dungeons, island villages, island props ----
 const SKIP=new Set(['_obj','lm','bwnpc','afnpc','npc','house','gwater']);
 const rkey=it=>it.t==='icvdoor'?'r:icvdoor:'+it.kind:(it.t==='bwbld'||it.t==='afbld')&&it.b?'r:'+it.t+':'+it.b.name:'r:'+it.t+((it.w|0)>1?':'+(it.w|0):'');
 const _df=drawFurn;drawFurn=function(it,tm){
  if(it&&it.t==='_obj'&&it.o&&has(okey(it.o))){const o=it.o,s=o.shake>0?(o.shake-=.016,Math.round(Math.sin(tm*60))):0;objDraw(o,it.x*16+8,it.y*16+14,s);return}
  if(it&&it.t==='lm'&&it.k!=='npc'){const k='l:'+it.k+(it.v!=null?':'+it.v:'');if(has(k)){drawLook(k,it.x*16,it.y*16,null,phase(it.x,it.y));return}}
  else if(anyR&&it&&typeof it.t==='string'&&!SKIP.has(it.t)&&it.t[0]!=='_'){const k=rkey(it);if(has(k)){const b=it.b,X=b?b.tx*16:it.x*16,Y=b?b.ty*16:it.y*16;drawLook(k,X,Y,null,phase(it.x|0,it.y|0));return}}
  return _df.apply(this,arguments)};
 // ---- buildings ----
 const HS=typeof HOUSE_STYLE!=='undefined'?HOUSE_STYLE:null;
 const bkey=b=>{if(!b)return null;if(b.castle)return'b:castle';if(HS&&b.k===HS.k&&b.wall===HS.wall&&b.roof===HS.roof)return'b:house'+(b.w|0);return typeof BLD!=='undefined'&&BLD.includes(b)?'b:'+b.k:null};
 const _db=drBld;drBld=function(b,tm){const k=bkey(b);if(k&&has(k)){drawLook(k,b.tx*16,b.ty*16,null,phase(b.tx,b.ty));return}return _db.apply(this,arguments)};
 // ---- monsters ----
 const mkey=n=>'m:'+(n.rk||((n.type||'slime')+(n.rv?':'+n.rv:'')));
 const WC=new Map();// white versions of frames, for the hit flash
 function white(k,L,f){const key=k+'#'+f;let c=WC.get(key);if(!c){const b=can(k,L,f);c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d');x.drawImage(b,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);WC.set(key,c)}return c}
 function mobDraw(n,tm){if(!n||n._wb||n.type==='ib')return false;const k=mkey(n),q=pick(k);if(!q)return false;const L=PL[q],x=Math.round(n.x),y=Math.round(n.y),nf=frames(L);
  // which way it faces: towards you (most monsters do), or the way it's walking
  if(n._lx==null)n._lx=n.x;const mv=n.x-n._lx;n._lx=n.x;if(Math.abs(mv)>.05)n._dir=mv<0?-1:1;const fl=L.fw?n._dir<0:P.x<n.x;
  let f;if(L.ak&&nf>1&&Math.hypot(P.x-n.x,P.y-n.y)<20)f=nf-1;else{const wn=L.ak&&nf>1?nf-1:nf,ms=Math.max(60,Math.min(5000,L.ms|0||250));f=wn>1?Math.floor(performance.now()/ms+((x*7+y*3)%11)/11*wn)%wn:0}
  const hit=Math.abs(n.kx||0)+Math.abs(n.ky||0)>.5,c=hit?white(q,L,f):can(q,L,f),w=L.w*L.s/2,h=L.h*L.s/2;
  try{shd(x,y+5,Math.max(8,Math.min(40,w*.7)))}catch(e){}g.save();g.imageSmoothingEnabled=false;if(n.frozen>0)g.globalAlpha*=.85;if(fl){g.translate(x*2,0);g.scale(-1,1)}g.drawImage(c,Math.round((x+L.ox)*2)/2,Math.round((y+L.oy)*2)/2,w,h);g.restore();
  if(n.frozen>0){g.save();g.globalAlpha=.35;g.fillStyle='#a8e0ff';g.fillRect(x+L.ox,y+L.oy,w,h);g.restore()}
  // bosses keep their health bar over their head
  if(n.type==='boss'||n.type==='bonelord'){const mh=n.mhp||(n.type==='boss'?30:45),by=Math.round(y+L.oy-8);Rg(x-16,by,32,4,'#181018');Rg(x-15,by+1,Math.max(0,Math.round(30*n.hp/mh)),2,n.type==='boss'?'#e03030':'#a050e0')}return true}
 const _ps=pS;pS=function(n,tm){if(mobDraw(n,tm))return;return _ps.apply(this,arguments)};
 // ---- village details and boats (globals the game calls by name) ----
 const wrapG=(name,fn)=>{if(typeof window[name]!=='function')return;const o=window[name];window[name]=function(){if(fn.apply(this,arguments))return;return o.apply(this,arguments)}};
 wrapG('drawLamp',(x,y)=>{if(!has('v:lamp'))return false;try{shd(x*16+8,y*16+15,10)}catch(e){}return drawLook('v:lamp',x*16,y*16,null,phase(x,y))});
 wrapG('drawWell',(x,y)=>{if(!has('v:well'))return false;try{shd(x*16+8,y*16+15,20)}catch(e){}return drawLook('v:well',x*16,y*16,null,phase(x,y))});
 wrapG('drawSign',i=>{if(!has('v:sign'))return false;const x=i%N,y=(i/N)|0;try{shd(x*16+8,y*16+15,10)}catch(e){}return drawLook('v:sign',x*16,y*16,null,phase(x,y))});
 const bhoriz=i=>ROADS.has(i-1)||ROADS.has(i+1)||(tile[i-1]>0&&!BRIDGE.has(i-1)&&tile[i-1]!==undefined&&!BRIDGE.has(i+N)&&!BRIDGE.has(i-N));
 wrapG('drawBridge',i=>{const k=bhoriz(i)?'v:bridgeh':'v:bridgev';if(!has(k))return false;const x=i%N,y=(i/N)|0;return drawLook(k,x*16,y*16,null,phase(x,y))});
 wrapG('drawWreck',()=>{if(!has('v:wreck'))return false;const x0=(WRK.x-1)*16,y0=(WRK.y-1)*16;try{shd(x0+24,y0+28,48)}catch(e){}return drawLook('v:wreck',x0,y0)});
 wrapG('drawHut',()=>{if(!has('v:hut'))return false;const x0=(HRM.x-1)*16,y0=(HRM.y-1)*16;try{shd(x0+24,HRM.y*16-2,52)}catch(e){}return drawLook('v:hut',x0,y0)});
 if(typeof TGDRAW==='function'){const _tg=TGDRAW;TGDRAW=(x,y,tm)=>{if(has('v:grass')&&drawLook('v:grass',x*16,y*16,null,phase(x,y)))return;return _tg(x,y,tm)}}
 const DIRL=fc=>fc&&fc[0]>0?'e':fc&&fc[0]<0?'w':fc&&fc[1]<0?'n':'s';
 const sailKey=(fc,part)=>{const d=DIRL(fc);return['v:sail_'+(d==='w'?'e':d)+'_'+part,d==='w']};
 wrapG('drawBoat26',tm=>{const[k,fl]=sailKey(face,'back');if(!has(k))return false;const x=Math.round(P.x),y=Math.round(P.y)+Math.round(Math.sin(tm*2.6));try{BOAT85.foam(x,y,face,tm)}catch(e){}return drawLook(k,x,y,null,0,fl)});
 wrapG('drawBoatFront26',(x,y,fc,tm)=>{const[k,fl]=sailKey(fc,'front');if(!has(k))return false;return drawLook(k,x,y,null,0,fl)});
 wrapG('drawBoat',(x,y,tm)=>{if(!has('v:moored'))return false;const px=x*16+8,py=y*16+6+Math.round(Math.sin(tm*1.6+x));try{BOAT85.foam(px,py,[1,0],tm*.5)}catch(e){}return drawLook('v:moored',px,py,null,phase(x,y))});
 // ---- things players build ----
 wrapG('drawStation',(t,x,y,st,tm)=>{const k=t==='planter'&&st&&st.ready&&has('p:planter:ready')?'p:planter:ready':'p:'+t;if(!has(k))return false;try{shd(x*16+8,y*16+14,12)}catch(e){}return drawLook(k,x*16,y*16,null,phase(x,y))});
 wrapG('drawPiece',(t,x,y,f,ghost)=>{if(t==='wwall'||t==='swall'||t==='door'||t==='bed'||t==='chest')return false;const k='p:'+t;if(!has(k))return false;return drawLook(k,x*16,y*16,null,phase(x,y),false,ghost?.55:null)});
 wrapG('drawStruct',(i,s,ghost)=>{if(!s||(s.t!=='chest'&&s.t!=='bed'))return false;const k='p:'+s.t;if(!has(k))return false;const x=i%N,y=(i/N)|0,sh=s.shake>0?Math.round(Math.sin(performance.now()/16)):0;
  try{shd(x*16+8,y*16+14,14)}catch(e){}return drawLook(k,x*16+sh,y*16,null,phase(x,y),false,ghost?.55:null)});
 wrapG('pF',(f,tm)=>{if(!f||f._glow||!has('p:campfire'))return false;const x=Math.round(f.x),y=Math.round(f.y);try{shd(x,y+4,18)}catch(e){}return drawLook('p:campfire',x-8,y-8,null,phase(x>>4,y>>4))});
 // fences and walls: the post/block, then a part towards each neighbour that's a fence too
 wrapG('drawFence',(i,s,ghost)=>{if(!s)return false;const t=s.t,x=i%N,y=(i/N)|0;let open=false;try{open=t==='door'&&!ghost&&doorOpen(i)}catch(e){}
  const ck=open&&has('f:door:o')?'f:door:o':'f:'+t+':c';if(!has(ck))return false;const px=x*16+(s.shake>0?Math.round(Math.sin(performance.now()/16)):0),py=y*16,a=ghost?.55:null,nb=(dx,dy)=>!ghost&&fenceNb(x+dx,y+dy);
  for(const[d,dx,dy]of[['n',0,-1],['w',-1,0],['e',1,0]])if(nb(dx,dy)&&has('f:'+t+':'+d))drawLook('f:'+t+':'+d,px,py,null,0,false,a);
  drawLook(ck,px,py,null,phase(x,y),false,a);if(nb(0,1)&&has('f:'+t+':s'))drawLook('f:'+t+':s',px,py,null,0,false,a);return true});
 // farm plots
 wrapG('drawPlot',(i,p,tm,X,Y,hasF)=>{const x=X!=null?X:i%N,y=Y!=null?Y:(i/N)|0,w=!!(p&&wet(p)),sk=w&&has('c:soil:wet')?'c:soil:wet':'c:soil';
  let ck=null;if(p&&p.c){const rp=ripe(p),s=Math.min(stageOf(p),2);ck='c:'+p.c+':'+(rp?'ripe':s);if(!has(ck))ck=null}if(!has(sk)&&!ck)return false;
  const px=x*16,py=y*16,hn=hasF||((dx,dy)=>FARM.has((y+dy)*N+x+dx)),m=(hn(-1,0)?1:0)|(hn(1,0)?2:0)|(hn(0,-1)?4:0)|(hn(0,1)?8:0);
  if(has(sk))drawLook(sk,px,py,null,phase(x,y));else hdPut(hdSoil(m,w),px,py);if(!p||!p.c)return true;
  const rp=ripe(p);if(ck)drawLook(ck,px,py,null,phase(x,y));else hdPut(hdCropS(p.c,rp?9:Math.min(stageOf(p),2),rp),px,py,rp&&p.c==='wheat'?Math.round(Math.sin(tm*1.5+x)*1)/2:0);return true});
 // ---- the spot a chopped tree, mined rock or picked plant leaves while it grows back ----
 const RES=()=>window.SQRES||null;
 function stumpsHollow(x0,y0,x1,y1){const out=[],seen=new Set(),add=(i,t)=>{if(seen.has(i)||obj[i]||!has('x:'+t))return;const x=i%N,y=(i/N)|0;if(x<x0-1||x>x1+1||y<y0-1||y>y1+2)return;seen.add(i);out.push([x,y,t])};
  for(const r of REM)add(r.i,r.t);const R=RES();if(R)for(const i in R.h){const v=R.h[i];if(v&&v.t)add(+i,v.t)}return out}
 if(typeof LHOOK!=='undefined'){const _lh=LHOOK;LHOOK=(L,x0,y0,x1,y1,tm)=>{if(_lh)_lh(L,x0,y0,x1,y1,tm);if(SCENE||!anyX)return;
   try{for(const[x,y,t]of stumpsHollow(x0,y0,x1,y1))L.push([y*16+13,4,()=>drawLook('x:'+t,x*16,y*16,null,phase(x,y))])}catch(e){}}}
 if(typeof ROOMBG!=='undefined'){const _bg=ROOMBG;ROOMBG=function(R2){const out=_bg.apply(this,arguments);try{const R=R2&&R2.region?R2:null;if(!R||!anyX)return out;const v=rgView(),seen=new Set();
   const put=(x,y,t)=>{const i=y*R.w+x;if(seen.has(i)||x<v.x0/16-1||x>v.x1/16+1||y<v.y0/16-1||y>v.y1/16+2||!has('x:'+t))return;const it=rgObjAt(R,x,y);if(it&&!it.gone)return;seen.add(i);drawLook('x:'+t,x*16,y*16,null,phase(x,y))};
   for(const g2 of R.gone||[])if(g2&&g2.it&&g2.it.o)put(g2.it.x,g2.it.y,g2.it.o.t);
   const S=RES();if(S&&S.rloc==='r_'+R.region)for(const idx in S.r){const q=S.r[idx];if(q&&q.t)put(idx%R.w,Math.floor(idx/R.w),q.t)}}catch(e){}return out}}
 // ---- what can be edited ----
 const TN={tree:'Tree',pine:'Pine',oak:'Oak tree',willow:'Willow',maple:'Maple',yew:'Yew',rock:'Rock',ore:'Iron ore',bush:'Berry bush',cactus:'Cactus',shroom:'Mushroom patch',nutbush:'Hazel bush',
  coal:'Coal',gold:'Gold ore',mith:'Mithril ore',adam:'Adamant ore',boulder:'Boulder'};
 const VN={'tree:dark':'Dark tree','tree:dead':'Dead tree','rock:moss':'Mossy rock','ore:crystal':'Crystal','shroom:brown':'Mushroom patch (brown)','shroom:void':'Mushroom patch (void)'};
 const pretty=s=>String(s).replace(/_/g,' ').replace(/^[a-z]/,c=>c.toUpperCase());
 const TOWN={gen:'General store',smith:'Smithy',tackle:'Tackle shop',inn:'Inn',forge:'Forge'},TP={hv:'Hollow Village house',sm:'Saltmere house',fh:'Frosthollow building',dh:'Dusthaven building',tw:'Tidewatch building'},
  TW={tw:'Tidewatch',fh:'Frosthollow',dh:'Dusthaven',sm:'Saltmere',hv:'Hollow Village'};
 const RN={pillar:'Pillar',urn:'Urn',dchest:'Dungeon chest',stairs:'Stairs down',dexit:'Way out',c_pillar:'Castle pillar',c_throne:'Throne',c_torch:'Wall torch',c_banner:'Banner',c_window:'Castle window',
  ic_beam:'Mine beam',ic_cart:'Mine cart',icepillar:'Ice pillar',icicle:'Icicles',fpool:'Frozen pool',crate:'Crate',bpillar:'Sandstone pillar',minecart:'Minecart',ocrystal:'Ore crystal',pickrack:'Pick rack',
  sandpile:'Sand pile',algae:'Algae',coral:'Coral',gpool:'Tide pool',plank:'Planks',timber:'Timber',aflavap:'Lava pool',bwstall:'Market stall (Thornbrook)',bwsign:'Thornbrook sign',afbraz:'Brazier (Emberwatch)',afsign:'Emberwatch sign',
  window:'Window',barrel:'Barrel',table:'Table',rug:'Rug',shelf:'Shelf',rack:'Rack',plant:'Plant',counter:'Counter',furnace:'Furnace',anvil:'Anvil',bed:'Bed',chest:'Chest',boulder:'Boulder',crystal:'Crystal',orecase:'Ore case'};
 const at11=(o,f)=>{if(!o)return;const k={x:o.x,y:o.y};o.x=1;o.y=1;try{f()}finally{o.x=k.x;o.y=k.y}};
 // fences: the post alone, and (for a side) what the game adds when a neighbour is there
 const FX=3,FY=3,withNb=(t,dx,dy,f)=>{const i0=FY*N+FX,j=i0+dy*N+dx,keep=[[i0,STR.get(i0)],[j,STR.get(j)]];STR.set(i0,{t});STR.set(j,{t});
  try{g.save();g.translate(-FX*16,-FY*16);f(i0);g.restore()}finally{for(const[i,v]of keep){if(v===undefined)STR.delete(i);else STR.set(i,v)}}};
 let CAT=null;
 function list(){if(CAT)return CAT;const out=[];const seen=new Set(),add=(k,n,grp,draw,diff,mob)=>{if(seen.has(k))return;seen.add(k);out.push({k,n,grp,draw,diff,mob})};
  // nature, and what each leaves behind
  const T=Object.keys(typeof OHP!=='undefined'?OHP:{});const order=['tree','pine','oak','willow','maple','yew','bush','nutbush','shroom','cactus','rock','ore'];const types=order.concat(T.filter(t=>!order.includes(t)).sort()).filter(t=>OHP[t]!=null);
  const tn=t=>TN[t]||(window.SQBOUL&&SQBOUL[t]?pretty(SQBOUL[t].n||t):pretty(t));
  for(const t of types){const o={t,hp:OHP[t]};add(okey(o),tn(t),'Nature',()=>drawFurn({t:'_obj',x:0,y:0,o},0))}
  for(const kv in VN){const[t,v]=kv.split(':');const o={t,v,hp:OHP[t]||3};add(okey(o),VN[kv],'Nature',()=>drawFurn({t:'_obj',x:0,y:0,o},0))}
  for(const t of types)add('x:'+t,tn(t)+(/tree|pine|oak|willow|maple|yew/.test(t)?' (chopped)':/bush|shroom|cactus/.test(t)?' (picked)':' (mined)'),'Chopped and mined',null);
  // buildings
  if(typeof BLD!=='undefined')for(const b of BLD){const m=/^([a-z]+)(\d+)$/.exec(b.k),m2=/^([a-z]{2})_(.+)$/.exec(b.k),n=TOWN[b.k]||(m&&TP[m[1]]?TP[m[1]]+' '+m[2]:m2&&TW[m2[1]]?TW[m2[1]]+' '+m2[2].replace(/_/g,' '):pretty(b.k));add('b:'+b.k,n,'Buildings',()=>drBld({...b,tx:0,ty:0},0))}
  if(HS)for(const w of[5,7])add('b:house'+w,'Player house ('+w+' wide)','Buildings',()=>drBld({...HS,w,tx:0,ty:0},0));
  add('b:castle','Castle','Buildings',()=>drBld({...(HS||{}),k:'home',w:9,tx:0,ty:0,castle:true},0));
  // village details
  for(const[k,n,f]of[['v:lamp','Street lamp',()=>drawLamp(0,0,0)],['v:well','Well',()=>drawWell(0,0)],['v:sign','Signpost',()=>drawSign(0)],
   ['v:bridgeh','Bridge (east-west)',()=>hdPut(hdBridgeT(true,true),0,0)],['v:bridgev','Bridge (north-south)',()=>hdPut(hdBridgeT(false,true),0,0)],
   ['v:grass','Tall grass',()=>TGDRAW(0,0,0)],['v:wreck','Shipwreck',()=>at11(WRK,()=>drawWreck(0))],['v:hut','Hermit\'s hut',()=>at11(HRM,()=>drawHut())]])add(k,n,'Village details',f);
  // boats
  if(window.BOAT85){add('v:moored','Boat at the docks','Boats',()=>hdPut(BOAT85.full([1,0],false),0,0));
   for(const[d,fc,n]of[['e',[1,0],'sideways (east; west is mirrored)'],['n',[0,-1],'sailing north'],['s',[0,1],'sailing south']]){
    add('v:sail_'+d+'_back','Your boat, '+n+': behind you','Boats',()=>hdPut(BOAT85.back(fc,true,0),0,0));add('v:sail_'+d+'_front','Your boat, '+n+': in front of you','Boats',()=>hdPut(BOAT85.front(fc),0,0))}}
  // things players build
  const pn=k=>{const all=[].concat(typeof STNS!=='undefined'?STNS:[],typeof FURN!=='undefined'?FURN:[],typeof BREC!=='undefined'?BREC:[],(window.LUX&&LUX.EMP&&LUX.EMP.FURN2)||[]);const q=all.find(z=>z.k===k);return q?q.n:pretty(k)};
  const pk=[].concat(typeof STNS!=='undefined'?STNS.map(s=>s.k):[],typeof FURN!=='undefined'?FURN.map(s=>s.k):[],((window.LUX&&LUX.EMP&&LUX.EMP.FURN2)||[]).map(s=>s.k));
  for(const k of pk){if(typeof STN!=='undefined'&&STN.has(k))add('p:'+k,pn(k),'Things players build',()=>drawStation(k,0,0,{},0));else add('p:'+k,pn(k),'Things players build',()=>drawPiece(k,0,0,{t:k},true,0))}
  if(pk.includes('planter'))add('p:planter:ready','Berry planter (ready to pick)','Things players build',()=>drawStation('planter',0,0,{ready:true},0));
  add('p:chest','Chest','Things players build',()=>drawStruct(0,{t:'chest'},true));add('p:bed','Bed','Things players build',()=>drawStruct(0,{t:'bed'},true));
  add('p:campfire','Campfire','Things players build',()=>pF({x:8,y:8,life:100},0));
  // fences and walls
  const FN={wwall:'Wooden fence',swall:'Stone wall',door:'Gate'};
  for(const t of['wwall','swall','door']){add('f:'+t+':c',FN[t]+(t==='door'?' (closed)':': post'),'Fences and walls',()=>drawFence(0,{t},true));
   if(t==='door')add('f:door:o','Gate (open)','Fences and walls',null);
   for(const[d,dx,dy,n]of[['e',1,0,'towards the east'],['w',-1,0,'towards the west'],['n',0,-1,'towards the north'],['s',0,1,'towards the south']])
    add('f:'+t+':'+d,FN[t]+': '+n,'Fences and walls',null,{base:()=>withNb(t,0,0,i=>drawFence(i,{t},true)),with:()=>withNb(t,dx,dy,i=>drawFence(i,{t},false))})}
  // farming
  add('c:soil','Farm soil (dry)','Farming',()=>hdPut(hdSoil(0,false),0,0));add('c:soil:wet','Farm soil (watered)','Farming',()=>hdPut(hdSoil(0,true),0,0));
  if(typeof CROPS!=='undefined')for(const c in CROPS){const n=CROPS[c].n;for(const[s,sn]of[[0,'just planted'],[1,'sprouting'],[2,'growing'],['ripe','ripe']])add('c:'+c+':'+s,n+' ('+sn+')','Farming',()=>hdPut(hdCropS(c,s==='ripe'?9:s,s==='ripe'),0,0))}
  // island villages
  const vb=[['bwbld',{w:5,wall:'#c8a878',roof:'#3e7a3a',name:'Ranger Lodge'}],['bwbld',{w:7,wall:'#d8c098',roof:'#7a4a2a',name:'The Sleepy Fern'}],['afbld',{w:5,wall:'#8a7060',roof:'#a83818',name:'Warden\'s Hall'}],['afbld',{w:7,wall:'#6a5a50',roof:'#3a3030',name:'The Forge',smoke:1}]];
  for(const[t,b]of vb){const B={...b,tx:0,ty:0};add('r:'+t+':'+b.name,b.name+(t==='bwbld'?' (Thornbrook)':' (Emberwatch)'),'Island villages',()=>drawFurn({t,b:B,x:B.w>>1,y:1,w:B.w,h:2},0))}
  for(const[t,w]of[['bwstall',3],['bwsign',1],['afbraz',1],['afsign',1]])add('r:'+t+(w>1?':'+w:''),RN[t],'Island villages',()=>drawFurn({t,x:0,y:0,w,h:1},0));
  // shops, homes, dungeons and caves: whatever their rooms hold (dungeons are built once here to see what's in them)
  const roomItems=(R,grp)=>{for(const it of R&&R.items||[]){if(!it||typeof it.t!=='string'||SKIP.has(it.t)||it.t[0]==='_'||it.n)continue;const k=rkey(it);if(seen.has(k))continue;
   const tpl={...it,x:0,y:0};delete tpl.open;add(k,(RN[it.t]||pretty(it.t))+((it.w|0)>1?' ('+it.w+' wide)':''),grp,()=>drawFurn(tpl,0))}};
  try{for(const id in ROOMS){const R=ROOMS[id];if(!R||R.region||R.dun||/^dun_|^reg_/.test(id))continue;roomItems(R,'Inside shops and homes')}}catch(e){}
  if(typeof DKIND!=='undefined'&&typeof buildFloor==='function')for(const kind in DKIND){if(/^cv_/.test(kind))continue;for(const f of[1,DKIND[kind].floors||3])try{roomItems(buildFloor(kind,f),'Dungeons and caves')}catch(e){}}
  if(window.SQICV)for(const kind in SQICV){if(/^cv_/.test(kind))continue;add('r:icvdoor:'+kind,'Cave entrance: '+SQICV[kind].name,'Dungeons and caves',()=>drawFurn({t:'icvdoor',kind,x:0,y:0,name:SQICV[kind].name,w:1,h:1},0))}
  // monsters
  const MB=window.SQISLIFE&&SQISLIFE.MOBS||{},MX=[['boss','Slime King (boss)',30],['bonelord','Bone Lord (boss)',40]];
  const mobTpl=(k,hp)=>()=>{const[t]=k.split(':');try{return MB[k]?rgMake(k,hp,0,0):{x:0,y:0,hp,mhp:hp,kx:0,ky:0,type:t}}catch(e){return{x:0,y:0,hp,mhp:hp,kx:0,ky:0,type:t}}};
  for(const k of Object.keys(MB).sort((a,b)=>MB[a].n.localeCompare(MB[b].n)))add('m:'+k,MB[k].n,'Monsters',null,null,mobTpl(k,MB[k].hp));
  for(const[k,n,hp]of MX)add('m:'+k,n,'Monsters',null,null,mobTpl(k,hp));
  // island props
  for(const kk in A.ISL_LM){const[k,v]=kk.split(':'),L=A.ISL_LM[kk];add('l:'+kk,L[0],'Island props',()=>drawFurn({t:'lm',k,v:L[3],x:0,y:0,w:L[1],h:L[2],sh:L[2],name:L[0]},0))}
  return CAT=out}
 // ---- the game's own look, for the editor to start from: drawn by the game at 2x onto its hidden screen canvas ----
 const cvs=()=>g.canvas;
 function snapDraw(fn,night){const c=cvs(),OX=160,OY=Math.min(300,c.height-140);const d0=night?dark:null;if(night)dark=()=>1;nAt=0;
  try{g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.setTransform(2,0,0,2,OX,OY);GC=g;fn();g.restore();
   const W=Math.min(c.width,OX+700),H=Math.min(c.height,OY+140);return{d:g.getImageData(0,0,W,H).data,W,H,OX,OY}}finally{if(night)dark=d0;nAt=0}}
 function crop(S,keep){const{d,W,H,OX,OY}=S;let x0=W,y0=H,x1=-1,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(d[i+3]>=128&&(!keep||keep[y*W+x])){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
  if(x1<x0)return null;if((x0-OX)%2)x0--;if((y0-OY)%2)y0--;const w=Math.min(320,x1-x0+1),h=Math.min(320,y1-y0+1),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),im=x.createImageData(w,h);
  for(let y=0;y<h;y++)for(let X=0;X<w;X++){const s=((y+y0)*W+X+x0),i=s*4,o=(y*w+X)*4;if(keep&&!keep[s])continue;im.data[o]=d[i];im.data[o+1]=d[i+1];im.data[o+2]=d[i+2];im.data[o+3]=d[i+3]}
  x.putImageData(im,0,0);return{url:c.toDataURL(),ox:(x0-OX)/2,oy:(y0-OY)/2}}
 // a monster: drawn by the game at a few moments of its walk, cut to one box, as a strip of frames side by side
 // (bosses draw their health bar themselves: left out here, the game adds one over any new look)
 function capMob(it,night){const fr=[],pk={x:P.x,y:P.y},fr0=g.fillRect;P.x=4000;P.y=0;g.fillRect=function(x,y,w,h){if((x===-16&&w===32&&h===4)||(x===-15&&h===2&&w<=30))return;return fr0.apply(this,arguments)};
  try{for(const tm of[0,.13,.26,.39,.52,.65]){const n=it.mob();n.x=0;n.y=0;n.kx=n.ky=0;fr.push(snapDraw(()=>{pS(n,tm)},night))}}finally{P.x=pk.x;P.y=pk.y;delete g.fillRect;if(g.fillRect!==fr0)g.fillRect=fr0}
  const{W,H,OX,OY}=fr[0];let x0=W,y0=H,x1=-1,y1=-1;for(const S of fr){const d=S.d;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>=128){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
  if(x1<x0)return null;if((x0-OX)%2)x0--;if((y0-OY)%2)y0--;let w=Math.min(320,x1-x0+1),h=Math.min(320,y1-y0+1);if(w%2)w++;if(h%2)h++;
  // drop repeated frames (a monster that changes every 0.33 s shows the same picture twice in a row)
  const sig=S=>{let a=0;for(let y=y0;y<y0+h;y+=1)for(let x=x0;x<x0+w;x+=1){const i=(y*W+x)*4;a=(a*31+S.d[i]+S.d[i+1]*3+S.d[i+2]*7+(S.d[i+3]>127?1:0))|0}return a};
  const uniq=[];const seen=new Set();for(const S of fr){const k=sig(S);if(seen.has(k))continue;seen.add(k);uniq.push(S)}
  const c=document.createElement('canvas');c.width=w*uniq.length;c.height=h;const x=c.getContext('2d'),im=x.createImageData(c.width,h);
  uniq.forEach((S,j)=>{for(let y=0;y<h;y++)for(let X=0;X<w;X++){const sy=y+y0,sx=X+x0;if(sy>=H||sx>=W)continue;const i=(sy*W+sx)*4,o=(y*c.width+j*w+X)*4;if(S.d[i+3]<128)continue;im.data[o]=S.d[i];im.data[o+1]=S.d[i+1];im.data[o+2]=S.d[i+2];im.data[o+3]=255}});
  x.putImageData(im,0,0);return{url:c.toDataURL(),ox:(x0-OX)/2,oy:(y0-OY)/2,n:uniq.length}}
 function capture(key,night){const base=key.replace(/@n$/,''),it=list().find(q=>q.k===base);if(!it||(!it.draw&&!it.diff&&!it.mob))return null;off++;
  if(it.mob){try{return capMob(it,night)}catch(e){console.warn('monster capture',key,e);return null}finally{off--}}
  try{if(it.diff){const A0=snapDraw(it.diff.base,night),B=snapDraw(it.diff.with,night),keep=new Uint8Array(B.W*B.H);
    for(let i=0;i<keep.length;i++){const j=i*4;if(B.d[j+3]>=128&&(A0.d[j+3]<128||Math.abs(A0.d[j]-B.d[j])+Math.abs(A0.d[j+1]-B.d[j+1])+Math.abs(A0.d[j+2]-B.d[j+2])>24))keep[i]=1}return crop(B,keep)}
   return crop(snapDraw(it.draw,night))}catch(e){console.warn('prop capture',key,e);return null}finally{off--}}
 // a small picture of a prop as players see it now (the list's thumbnails)
 const TH=new Map(),BLANK='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
 function thumb(key){if(TH.has(key+'@'+ver))return TH.get(key+'@'+ver);let u='';
  if(PL[key])u=A.render(frSp(PL[key],0)).toDataURL();else{const c=capture(key);u=c?c.url:'';if(c&&c.n>1){const im=new Image();im.src=c.url;const cv=document.createElement('canvas');im.onload=()=>{cv.width=im.width/c.n;cv.height=im.height;cv.getContext('2d').drawImage(im,0,0);TH.set(key+'@'+ver,cv.toDataURL())}}}if(!u&&key[0]==='x'){const t=list().find(q=>q.k==='o:'+key.slice(2));if(t)u=thumb('o:'+key.slice(2))}
  u=u||BLANK;TH.set(key+'@'+ver,u);return u}
 window.SQPROPS={mkey,list,capture,thumb,drawLook,valid:vsp,frames,frSp,frameAt,get looks(){return PL},clearThumbs(){TH.clear()}}})();
