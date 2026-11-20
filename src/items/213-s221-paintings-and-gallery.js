// ---- 221. Paintings by Patrons, and the Patron Art Gallery in Hollow Village ----
// The developer approves an Art Room piece as a painting (Dev Suite > Art Room): `paintings/<id>` {n, by (artist's credit name),
// u (artist uid), w, h, f (211's packed frames), ms, p (print price), t, off (no longer sold)} — devs write, signed-in players
// read (onValue on the node: small and rarely written). Cached on the device in localStorage `sq_paint` so the items exist
// before a save loads; any `pt_`/`pw_` key in a save that isn't known yet gets a placeholder until the record arrives.
// Items: `pt_<id>` = the painting (bag, buy, trade). Placed at home: facing a floor tile = on an easel (`pt_<id>` furniture);
// facing the wall (front tile on wall row 1, standing on row 2) = hung (`pw_<id>` stored on the floor tile you stand on,
// row 2, because every home loader drops rows 0-1; not solid, drawn on the wall above). Picking either up gives `pt_<id>` back.
// Credit: the description, the gallery, and a label naming the painting and its artist whenever you face one.
// The artist gets one copy of their own painting (`ptg` in the save = ids already given).
// The Gallery: building `gallery` (5x2, placed by `spot()` on free village ground), room `gallery` with wall frames `_ptw`
// and easels `_pte` (room items filled from the newest paintings), curator Iris (kind `gallery`, ptab 2 shop) selling prints.
(()=>{const PTAB_SHOP='gallery';
 const uid=()=>{const m=window.SQMP;return m&&m.user?m.user.uid:''};
 const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const PT={},REG=new Set();
 const okId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{4,34}$/.test(id);
 const idOf=k=>{const m=/^p[tw]_([A-Za-z0-9_-]{4,34})$/.exec(String(k||''));return m?m[1]:null};
 const nameOf=id=>{const r=PT[id];return r&&r.n?String(r.n):'Painting'},byOf=id=>{const r=PT[id];return r&&r.by?String(r.by):'a Patron'};
 // ---- items ----
 function reg(id){if(!okId(id))return;const k='pt_'+id,w='pw_'+id;
  if(!REG.has(id)){REG.add(id);if(!INVK.includes(k))INVK.push(k);for(const q of[k,w]){if(!BK.includes(q))BK.push(q);BHP[q]=1;try{FURN_ONLY.add(q)}catch(e){self.SQERR&&SQERR(e,'213-1')}}
   try{if(!EXTRA_BAG.includes(k))EXTRA_BAG.push(k)}catch(e){self.SQERR&&SQERR(e,'213-2')}}
  const n=nameOf(id),by=byOf(id);INAME[k]=INAME[w]=n+' (painting)';
  IDESC[k]=IDESC[w]='“'+n+'” by '+by+'. A painting by a SkillQuest Patron. At home, face a wall and PLACE to hang it, or place it on the floor to stand it on an easel.';
  try{delete ICONC['ptg'+id]}catch(e){self.SQERR&&SQERR(e,'213-3')}}
 function setRec(id,r){if(!okId(id)||!r||typeof r!=='object')return;PT[id]=r;FR.delete(id);reg(id)}
 // device cache, so paintings exist before the save loads
 try{const c=JSON.parse(localStorage.getItem('sq_paint')||'null');if(c&&typeof c==='object')for(const id in c)setRec(id,c[id])}catch(e){self.SQERR&&SQERR(e,'213-4')}
 const keepCache=()=>{try{localStorage.setItem('sq_paint',JSON.stringify(PT))}catch(e){self.SQERR&&SQERR(e,'213-5')}};
 // any painting key in a save becomes known (placeholder) before the save's loaders run
 function scan(o,d){if(d>7||!o)return;if(typeof o==='string'){const id=idOf(o);if(id&&!REG.has(id))reg(id);return}if(typeof o!=='object')return;
  for(const k in o){const id=idOf(k);if(id&&!REG.has(id))reg(id);scan(o[k],d+1)}}
 let GOT=new Set(),APPLIED=false;
 {SQLOAD.wrap('213',_a=>function(S){try{scan(S,0)}catch(e){self.SQERR&&SQERR(e,'213-6')}const r=_a.apply(this,arguments);try{GOT=new Set(Array.isArray(S&&S.ptg)?S.ptg.filter(okId):[]);APPLIED=true}catch(e){self.SQERR&&SQERR(e,'213-7')}return r})}
 {SQSAVE.after('213:ptg',o=>{try{if(GOT.size)o.ptg=[...GOT]}catch(e){self.SQERR&&SQERR(e,'213-8')}})}
 try{KNOWN49.add('ptg')}catch(e){self.SQERR&&SQERR(e,'213-9')}
 {const _ng=newGame;newGame=function(){GOT=new Set();APPLIED=true;return _ng.apply(this,arguments)}}
 // ---- pictures ----
 const FR=new Map();// id -> [{c:canvas}]
 function frames(id){let L=FR.get(id);if(L)return L;L=[];const r=PT[id];
  try{if(r&&window.SQARTROOM)for(const fr of SQARTROOM.unpack(r)){const c=document.createElement('canvas');c.width=r.w;c.height=r.h;const x=c.getContext('2d');
   for(let i=0;i<fr.f.length;i++){const v=fr.f[i];if(v&&fr.pal[v]){x.fillStyle=fr.pal[v];x.fillRect(i%r.w,(i/r.w)|0,1,1)}}L.push(c)}}catch(e){self.SQERR&&SQERR(e,'213-10')}
  FR.set(id,L);return L}
 const frameAt=(id,tm)=>{const L=frames(id);if(!L.length)return null;const r=PT[id]||{};return L[Math.floor((tm||performance.now()/1000)*1000/Math.max(40,r.ms||200))%L.length]};
 // draw the picture fitted into a box (world pixels), with a frame around it
 const O='#201418',GOLD='#c89838',GOLD2='#8a6420';
 function framed(id,cx,cy,mw,mh,tm){const r=PT[id],c=frameAt(id,tm);let w=mw,h=mh;
  if(r&&r.w&&r.h){const s=Math.min(mw/r.w,mh/r.h);w=Math.max(4,Math.round(r.w*s));h=Math.max(4,Math.round(r.h*s))}
  const x=Math.round(cx-w/2),y=Math.round(cy-h/2);Rg(x-3,y-3,w+6,h+6,O);Rg(x-2,y-2,w+4,h+4,GOLD);Rg(x-2,y+h+1,w+4,1,GOLD2);Rg(x+w+1,y-2,1,h+4,GOLD2);Rg(x,y,w,h,'#f4ecd8');
  if(c){const sm=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;g.drawImage(c,x,y,w,h);g.imageSmoothingEnabled=sm}
  else{Rg(x,y,w,h,'#9cc4e8');Rg(x,y+Math.round(h*.6),w,h-Math.round(h*.6),'#58a848')}}
 // on the wall of a room (column x, wall band y 4..28)
 const hung=(id,x,tm,wide)=>framed(id,x*16+(wide?16:8),16,wide?26:12,wide?18:17,tm);
 // on an easel standing on floor tile (x,y)
 function easel(id,x,y,tm){const x0=x*16,y0=y*16;shd(x0+8,y0+14,12);Rg(x0+3,y0-6,2,21,O);Rg(x0+4,y0-5,1,19,'#9a6a3a');Rg(x0+11,y0-6,2,21,O);Rg(x0+11,y0-5,1,19,'#9a6a3a');
  Rg(x0+7,y0-8,2,20,O);Rg(x0+7,y0-7,1,18,'#7a4a20');Rg(x0+2,y0+3,12,2,O);Rg(x0+3,y0+3,10,1,'#b88050');framed(id,x0+8,y0-8,13,13,tm)}
 {const _dp=drawPiece;drawPiece=function(t,x,y,f,ghost,tm){const id=idOf(t);if(!id)return _dp.apply(this,arguments);
   if(t[1]==='w')hung(id,x,tm);else if(y===1)hung(id,x,tm);else easel(id,x,y,tm)}}
 {const _ic=iconURL;iconURL=function(k,col){const id=idOf(k);if(!id)return _ic(k,col);const key='ptg'+id;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d');
   x.fillStyle=O;x.fillRect(0,1,14,12);x.fillStyle=GOLD;x.fillRect(1,2,12,10);const L=frames(id);x.imageSmoothingEnabled=false;if(L[0]){const r=PT[id],s=Math.min(10/r.w,8/r.h),w=Math.max(2,Math.round(r.w*s)),h=Math.max(2,Math.round(r.h*s));x.fillStyle='#f4ecd8';x.fillRect(2,3,10,8);x.drawImage(L[0],7-w/2|0,7-h/2|0,w,h)}
   else{x.fillStyle='#9cc4e8';x.fillRect(2,3,10,8);x.fillStyle='#58a848';x.fillRect(2,8,10,3)}const u=c.toDataURL();if(L[0])ICONC[key]=u;return u}}
 // ---- placing at home: wall or easel ----
 const inHomeRoom=()=>typeof inHome==='function'&&inHome()&&SCENE.room&&!SCENE.room.yard&&!SCENE.room.court;
 const wallCols=R=>{const s=new Set();for(const it of R.items||[])if((it.y|0)<=1&&!/^_/.test(it.t))for(let d=0;d<(it.w||1);d++)s.add(it.x+d);return s};
 // can a painting hang on the wall above floor tile (x,2)? the tile itself must be free for it (and not a door)
 function wallOK(x){if(!inHomeRoom())return false;const R=SCENE.room,h=SCENE.house;if(x<0||x>=R.w||wallCols(R).has(x)||h.furn.has(2*R.w+x))return false;
  const sv=BUILD&&BUILD.k;try{if(BUILD)BUILD.k='rug';return canPlaceIn(x,2)}catch(e){return false}finally{if(BUILD)BUILD.k=sv}}
 const facingWall=()=>{const[x,y]=frontTile();return y===1&&face[1]<0?x:-1};
 {const _cp=canPlace;canPlace=function(x,y){if(BUILD&&idOf(BUILD.k)&&SCENE&&y===1)return wallOK(x);return _cp.apply(this,arguments)}}
 {const _pb=placeBuild;placeBuild=function(){const k=BUILD&&BUILD.k,id=idOf(k);if(!id||!SCENE)return _pb.apply(this,arguments);
   const wx=facingWall();if(wx<0)return _pb.apply(this,arguments);if(!wallOK(wx)){say(inHomeRoom()?'You can\'t hang it there.':'Paintings only hang on the walls of a house or castle. Stand it on the floor instead.');try{sfx('swish')}catch(e){self.SQERR&&SQERR(e,'213-11')}return}
   const R=SCENE.room;inv[k]--;SCENE.house.furn.set(2*R.w+wx,{t:'pw_'+id});try{sfx('chop')}catch(e){self.SQERR&&SQERR(e,'213-12')}say('You hung “'+nameOf(id)+'” on the wall.');saveLocal(true);try{saveCloud(true)}catch(e){self.SQERR&&SQERR(e,'213-13')}
   if((inv[k]|0)<1)endBuild('')}}
 // a hung painting doesn't block the floor under it
 {const _so=solid;solid=function(px,py){if(inHomeRoom()){const R=SCENE.room,x=Math.floor(px/16),y=Math.floor(py/16),f=SCENE.house.furn.get(y*R.w+x);if(f&&/^pw_/.test(f.t)&&!_baseSolid(px,py))return false}return _so.apply(this,arguments)}}
 const _baseSolid=(px,py)=>{const R=SCENE.room,x=Math.floor(px/16),y=Math.floor(py/16);return x<0||y<2||x>=R.w||y>=R.h||(R.solid&&R.solid.has(y*R.w+x))};
 // picking it up: a hung painting comes back as the painting
 {const _pf=pickFurn;pickFurn=function(i){try{const h=SCENE&&SCENE.house,f=h&&h.furn.get(i);if(f&&/^pw_/.test(f.t))f.t='pt_'+idOf(f.t)}catch(e){self.SQERR&&SQERR(e,'213-14')}return _pf.apply(this,arguments)}}
 // HIT facing a hung painting picks it up (it's stored on the tile you stand on)
 {SQHIT.wrap('213 paintings and gallery',next=>function(){try{if(!BUILD&&inHomeRoom()&&!dead&&!pnOpen&&!menuOpen&&swing<=0){const wx=facingWall();if(wx>=0){const R=SCENE.room,i=2*R.w+wx,f=SCENE.house.furn.get(i);
     if(f&&/^pw_/.test(f.t)&&!SCENE.house.ro&&!SCENE.house._foreign){swing=.25;pickFurn(i);return}}}}catch(e){self.SQERR&&SQERR(e,'213-15')}
 return next.apply(this,arguments)})}
 // ---- who made it: a label when you face a painting ----
 function facedPainting(){if(!SCENE)return null;const R=SCENE.room;const[x,y]=frontTile();
  if(SCENE.id==='gallery'){for(const it of R.items){if(it.t!=='_ptw'&&it.t!=='_pte'||!it.pid)continue;const w=it.w||1;if(x>=it.x&&x<it.x+w&&(it.t==='_ptw'?y<=1:y===it.y))return it.pid}return null}
  const h=SCENE.house;if(!h||!h.furn)return null;const wx=facingWall();if(wx>=0){const f=h.furn.get(2*R.w+wx);if(f&&/^pw_/.test(f.t))return idOf(f.t)}
  const f=h.furn.get(y*R.w+x);if(f&&/^pt_/.test(f.t))return idOf(f.t);return null}
 {SQHUD.wrap('213',_dh=>function(){const out=_dh.apply(this,arguments);try{if(pnOpen||menuOpen||dead||!SCENE)return out;const id=facedPainting();if(!id)return out;
    const u=Math.max(2,Math.round(Math.min(W,H)/160)),fs=Math.round(5.5*u),t1='“'+nameOf(id)+'”',t2='by '+byOf(id);g.save();g.setTransform(1,0,0,1,0,0);g.font='700 '+fs+'px '+PF;
    const w=Math.max(g.measureText(t1).width,g.measureText(t2).width)+fs*1.6,hh=fs*3.2,x=Math.round(W/2-w/2),y=Math.round(H*.16);
    g.fillStyle='rgba(32,20,24,.88)';g.fillRect(x,y,w,hh);g.fillStyle=GOLD;g.fillRect(x,y,w,Math.max(2,u));g.fillRect(x,y+hh-Math.max(2,u),w,Math.max(2,u));
    g.textAlign='center';g.textBaseline='middle';g.fillStyle='#f8ecd0';g.fillText(t1,W/2,y+hh*.36);g.font='500 '+Math.round(fs*.85)+'px '+PF;g.fillStyle='#e8c878';g.fillText(t2,W/2,y+hh*.7);g.restore()}catch(e){self.SQERR&&SQERR(e,'213-16')}return out})}
 // ---- the gallery building ----
 // Its spot: the developer's choice (library `places.gallery` {tx,ty}, set in Dev Suite > Art Room with "Put the gallery
 // where I'm standing") or else the nearest free spot inside the village (players can't build there). Moving it puts back
 // everything the old spot changed (objects, blocked tiles, its signpost).
 let SPOT=null,BL=null;const UNDO={obj:new Map(),bs:new Set(),prot:new Set(),sign:-1};
 const inV=(x,y)=>typeof inVillage==='function'?inVillage(x,y):true;
 const homeAt=(x,y)=>{try{return HOUSES.some(h=>{const hw=((h.w||5)-1)/2;return x>=h.x-hw-1&&x<=h.x+hw+1&&y>=h.y-2&&y<=h.y+1})}catch(e){return false}};
 function fits(tx,ty,strict){const free=(x,y)=>{const i=y*N+x;return x>1&&y>1&&x<N-2&&y<N-2&&tile[i]!==0&&!obj[i]&&!BS.has(i)&&!(typeof STR!=='undefined'&&STR.has(i))&&!(typeof BRIDGE!=='undefined'&&BRIDGE.has(i))&&!(typeof SIGNS!=='undefined'&&SIGNS.has(i))&&!homeAt(x,y)};
  const road=i=>(typeof ROADS!=='undefined'&&ROADS.has(i))||tile[i]===2;
  for(let y=ty;y<ty+2;y++)for(let x=tx;x<tx+5;x++){const i=y*N+x;if(!free(x,y)||(strict!==0&&road(i)))return false}
  if(strict===true){for(let x=tx;x<tx+5;x++)if(!free(x,ty+2)&&!road((ty+2)*N+x))return false}else{const di=(ty+2)*N+tx+2;if(!free(tx+2,ty+2)&&!(road(di)&&!obj[di]&&!BS.has(di)))return false}
  if(NPCS.some(n=>!n.scene&&n.x>tx*16-8&&n.x<(tx+5)*16+8&&n.y>ty*16-8&&n.y<(ty+3)*16+8))return false;return true}
 function spot(){if(typeof VX==='undefined')return null;const road=i=>(typeof ROADS!=='undefined'&&ROADS.has(i))||tile[i]===2;
  const nearHome=(tx,ty)=>{for(let y=ty-1;y<ty+4;y++)for(let x=tx-1;x<tx+6;x++)if(homeAt(x,y))return true;return false};
  for(const strict of[true,1]){let best=null,bd=1e9;
   for(let ty=VY-30;ty<=VY+30;ty++)for(let tx=VX-30;tx<=VX+30;tx++){if(!fits(tx,ty,strict)||nearHome(tx,ty))continue;let inside=true;for(let y=ty;y<ty+3;y++)for(let x=tx;x<tx+5;x++)if(!inV(x,y))inside=false;
    const di=(ty+2)*N+tx+2;const d=Math.abs(tx+2-VX)+Math.abs(ty-VY)*1.2-(road(di)?6:0)+(inside?0:100);if(d<bd){bd=d;best={tx,ty}}}
   if(best)return best}return null}
 function unplace(){if(!BL)return;const i0=BLD.indexOf(BL);if(i0>=0)BLD.splice(i0,1);for(const[i,o]of UNDO.obj)if(!obj[i])obj[i]=o;for(const i of UNDO.bs)BS.delete(i);try{for(const i of UNDO.prot)PROT.delete(i)}catch(e){self.SQERR&&SQERR(e,'213-17')}
  if(UNDO.sign>=0)try{SIGNS.delete(UNDO.sign)}catch(e){self.SQERR&&SQERR(e,'213-18')}UNDO.obj.clear();UNDO.bs.clear();UNDO.prot.clear();UNDO.sign=-1;BL=null;SPOT=null}
 function place(tx,ty){unplace();const b={k:'gallery',tx,ty,w:5,wall:'#f4ecf8',roof:'#7848c0',sc:'#e8b830',ic:'star',n:'Patron Art Gallery'};BLD.push(b);BL=b;SPOT={tx,ty};
  const clr=i=>{if(obj[i]&&!UNDO.obj.has(i))UNDO.obj.set(i,obj[i]);obj[i]=null},bs=i=>{if(!BS.has(i)){BS.add(i);UNDO.bs.add(i)}},pr=i=>{try{if(!PROT.has(i)){PROT.add(i);UNDO.prot.add(i)}}catch(e){self.SQERR&&SQERR(e,'213-19')}};
  for(let y=ty;y<ty+2;y++)for(let x=tx;x<tx+5;x++){const i=y*N+x;clr(i);if(!(x===tx+2&&y===ty+1))bs(i);pr(i)}
  const fi=(ty+2)*N+tx+2;clr(fi);pr(fi);
  try{for(const[x,y]of[[tx+5,ty+1],[tx-1,ty+1],[tx+5,ty+2],[tx-1,ty+2]]){const i=y*N+x;if(tile[i]===0||obj[i]||BS.has(i)||SIGNS.has(i)||homeAt(x,y)||(typeof ROADS!=='undefined'&&ROADS.has(i)))continue;
    SIGNS.set(i,'PATRON ART GALLERY - paintings by SkillQuest Patrons. Prints for sale inside.');UNDO.sign=i;bs(i);pr(i);break}}catch(e){self.SQERR&&SQERR(e,'213-20')}
  try{if(typeof HMAP!=='undefined')HMAP=null}catch(e){self.SQERR&&SQERR(e,'213-21')}}
 let CHOSEN=null;
 try{const s0=spot();if(s0)place(s0.tx,s0.ty)}catch(e){console.warn('gallery',e)}
 // the developer's spot, from the published library (or the draft while previewing)
 function applyChosen(c){if(!c||!(c.tx>1&&c.ty>1&&c.tx<N-6&&c.ty<N-4)){if(CHOSEN){CHOSEN=null;try{const s0=spot();if(s0&&!(SPOT&&SPOT.tx===s0.tx&&SPOT.ty===s0.ty))place(s0.tx,s0.ty)}catch(e){self.SQERR&&SQERR(e,'213-22')}}return}
  if(SPOT&&SPOT.tx===(c.tx|0)&&SPOT.ty===(c.ty|0))return;CHOSEN={tx:c.tx|0,ty:c.ty|0};if(SCENE&&SCENE.id==='gallery')return;place(CHOSEN.tx,CHOSEN.ty)}
 try{if(window.SQA&&SQA.onApply)SQA.onApply(L=>{try{applyChosen(L&&L.places&&L.places.gallery)}catch(e){self.SQERR&&SQERR(e,'213-23')}})}catch(e){self.SQERR&&SQERR(e,'213-24')}
 // where the developer is standing now, as the building's top-left (door just above the tile in front of you)
 // houses load after this runs: without a chosen spot, move away from any house it touches (checked every few seconds)
 setInterval(()=>{try{if(CHOSEN||!SPOT||SCENE)return;let hit=false;for(let y=SPOT.ty-1;y<SPOT.ty+4&&!hit;y++)for(let x=SPOT.tx-1;x<SPOT.tx+6;x++)if(homeAt(x,y)){hit=true;break}
   if(!hit)return;const old=SPOT;unplace();const s1=spot();if(s1)place(s1.tx,s1.ty);else place(old.tx,old.ty)}catch(e){self.SQERR&&SQERR(e,'213-25')}},4000);
 // where you stand = the gallery's doorstep (the tile in front of its door)
 function standHere(){if(SCENE)return null;const x=Math.floor(P.x/16),y=Math.floor(P.y/16);return{tx:x-2,ty:y-2}}
 // move it there if it fits (its own old spot doesn't count as taken); otherwise leave it where it was
 function tryPlace(c){const old=SPOT;unplace();if(fits(c.tx,c.ty,0)){place(c.tx,c.ty);CHOSEN=c;return true}if(old)place(old.tx,old.ty);return false}
 // the room: frames along the wall, easels on the floor, a desk for Iris
 const GW=16,GH=10;
 ROOMS.gallery={w:GW,h:GH,ex:GW>>1,floor:['#d8c8b0','#ccbca4'],wall:'#f0e8f4',trim:'#7848c0',items:[],solid:new Set(),gallery:1};
 const WALLX=[1,4,10,13],EASELS=[[3,5],[6,5],[9,5],[12,5],[3,7],[12,7]];
 function fill(){const R=ROOMS.gallery,ids=Object.keys(PT).filter(id=>PT[id]&&!PT[id].off).sort((a,b)=>(PT[b].t||0)-(PT[a].t||0));let n=0;
  R.items=[{t:'window',x:7,y:0},{t:'window',x:8,y:0},{t:'rug',x:6,y:7,w:4},{t:'plant',x:0,y:2,solid:1},{t:'plant',x:15,y:2,solid:1},{t:'counter',x:6,y:3,w:4,solid:1}];
  for(const x of WALLX){const pid=ids[n++];if(pid)R.items.push({t:'_ptw',x,y:0,w:2,pid})}
  for(const[x,y]of EASELS){const pid=ids[n++];R.items.push({t:'_pte',x,y,solid:1,pid:pid||null})}
  R.solid=new Set();for(const it of R.items)if(it.solid)for(let dy=0;dy<(it.sh||1);dy++)for(let dx=0;dx<(it.w||1);dx++)R.solid.add((it.y+dy)*R.w+it.x+dx);R.n=ids.length}
 fill();
 {const _df=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='_ptw'){if(it.pid)hung(it.pid,it.x,tm,true);return}if(it&&it.t==='_pte'){if(it.pid)easel(it.pid,it.x,it.y,tm);else{const x0=it.x*16,y0=it.y*16;shd(x0+8,y0+14,12);Rg(x0+3,y0-6,2,21,O);Rg(x0+11,y0-6,2,21,O);Rg(x0+7,y0-8,2,20,O);Rg(x0+2,y0+3,12,2,O);Rg(x0+1,y0-14,14,12,O);Rg(x0+2,y0-13,12,10,'#f4ecd8')}return}return _df.apply(this,arguments)}}
 NPCS.push({kind:PTAB_SHOP,name:'Iris',scene:'gallery',x:8*16,y:2*16+10,dir:0,st:0,ch:{sk:1,hs:4,hc:6,sh:9,pn:2,hcol:7,so:1}});
 if(typeof LINES!=='undefined')LINES.gallery={d:['Welcome to the Patron Art Gallery! Every painting here was made by a SkillQuest Patron.','Take a print home and hang it on your wall.']};
 // ---- Iris's shop: prints of every painting ----
 const price=id=>Math.max(100,Math.min(1e6,(PT[id]&&PT[id].p)|0||2500));
 function shopHTML(){const ids=Object.keys(PT).filter(id=>PT[id]&&!PT[id].off).sort((a,b)=>(PT[b].t||0)-(PT[a].t||0));
  let h='<div class="tl">Gold: '+GLD.toLocaleString('en-US')+'</div><p style="font-size:14px;line-height:1.4;margin:4px 2px 8px">Every painting here was drawn by a SkillQuest Patron. Buy a print to hang on your wall at home, or to stand on an easel.</p>';
  if(!ids.length)h+='<div class="qc">No paintings yet. Patrons can draw them in the Art Room, and the best ones are hung here.</div>';
  for(const id of ids){const c=frames(id)[0],u=c?c.toDataURL():'',have=(inv['pt_'+id]|0);
   h+='<div class="qc" style="display:flex;gap:10px;align-items:center;padding:8px 10px;margin:6px 0">'+(u?'<img alt="" src="'+u+'" style="width:56px;height:56px;object-fit:contain;image-rendering:pixelated;background:#f4ecd8;border:3px solid '+GOLD+';flex:none">':'')+
    '<div style="flex:1;min-width:0;font-size:14px;line-height:1.35"><b>“'+E(nameOf(id))+'”</b><br>by '+E(byOf(id))+(have?'<br><small>You have '+have+'</small>':'')+'</div>'+
    '<button class="qb" data-ptbuy="'+E(id)+'" style="flex:none;width:auto;min-width:96px;margin:0;padding:8px 10px"'+(GLD<price(id)?' disabled':'')+'>'+price(id).toLocaleString('en-US')+' gold</button></div>'}
  return h}
 {const _r=rPn;rPn=function(){if(ptab===2&&shop===PTAB_SHOP&&pnOpen){try{panelChrome('Patron Art Gallery')}catch(e){self.SQERR&&SQERR(e,'213-26')}pbd.innerHTML=shopHTML();return}return _r.apply(this,arguments)}}
 pbd.addEventListener('click',e=>{if(!(ptab===2&&shop===PTAB_SHOP))return;const b=e.target.closest&&e.target.closest('[data-ptbuy]');if(!b)return;e.stopPropagation();e.preventDefault();const id=b.dataset.ptbuy;if(!PT[id]||PT[id].off)return;
  const p=price(id);if(GLD<p){say('Not enough gold.');return}GLD-=p;inv['pt_'+id]=(inv['pt_'+id]|0)+1;say('You bought a print of “'+nameOf(id)+'” by '+byOf(id)+'. Hang it at home!');try{sfx('coin')}catch(x){try{sfx('pickup')}catch(y){self.SQERR&&SQERR(y,'213-27')}}
  try{if(typeof svg==='function')svg()}catch(x){self.SQERR&&SQERR(x,'213-28')}saveLocal(true);try{saveCloud(true)}catch(x){self.SQERR&&SQERR(x,'213-29')}rPn()},true);
 // ---- keeping up with new paintings ----
 let LIS='';
 function listen(){const m=window.SQMP,F=window.SQFB;if(!m||!m.user||!F)return;if(LIS===m.user.uid)return;LIS=m.user.uid;
  try{F.db.onValue(F.db.ref(F.D,'paintings'),s=>{const v=s.val()||{};for(const id in v)setRec(id,v[id]);keepCache();fill();give()},()=>{LIS=''})}catch(e){LIS=''}}
 setInterval(listen,2000);
 // the artist's own copy, once
 function give(){const u=uid();if(!u||!APPLIED||(window.SQTITLE&&SQTITLE()))return;let any=false;
  for(const id in PT){const r=PT[id];if(!r||r.u!==u||GOT.has(id))continue;GOT.add(id);inv['pt_'+id]=(inv['pt_'+id]|0)+1;any=true;
   say('🖼️ “'+nameOf(id)+'” is now a painting in the Patron Art Gallery! Here is your own copy to hang at home.');try{sfx('quest')}catch(e){self.SQERR&&SQERR(e,'213-30')}}
  if(any){saveLocal(true);try{saveCloud(true)}catch(e){self.SQERR&&SQERR(e,'213-31')}}}
 setInterval(give,5000);
 // your character as the Art Room draws wearables over it: the whole 96x112 worn layer (48x56 box at 2x, anchor 24,44),
 // bare (the look you made, no armour, capes or worn looks) or with your gear
 const CL=new Map();function charLayer(dir,gear){const key=dir+':'+(gear?1:0);if(CL.has(key))return CL.get(key);let c=null;
  try{let ch=gear?gearCH():Object.assign({},CH);if(!gear){for(const f of['cape','gcp','fcp','wr','gcs','gpt','gtr','gce','gex','dyb','dyl','dyh'])delete ch[f]}
   c=document.createElement('canvas');c.width=96;c.height=112;c.hd2=true;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.setTransform(2,0,0,2,0,0);
   const sv=GC;GC=x;try{cP(ch,dir,0,24,44,false)}finally{GC=sv;x.setTransform(1,0,0,1,0,0)}}catch(e){c=null}CL.set(key,c);return c}
 window.SQPAINT={tryPlace,get chosen(){return CHOSEN},place,unplace,standHere,applyChosen,fits,charLayer,PT,frames,setRec,fill,spot:()=>SPOT,findSpot:()=>spot(),nameOf,byOf,idOf,give,draw:{framed,hung,easel}}})();
