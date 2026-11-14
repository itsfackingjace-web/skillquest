// ---------------------------------------------------------------- 52. World map and minimaps
// A HUD minimap on Hollow Island and in every region (scaled to the area's shape, terrain cached, markers drawn on
// top each frame, drawn under the message box so text stays readable). The new regions are charted as you walk:
// each tile you come near is revealed (fog of war, one byte per tile in memory, saved per region as a short
// run-length string). The map screen has two views: HERE (the area you're in) and WORLD (all five areas laid out
// around Hollow Island with known sea routes, departure posts and discovered landmarks; tap an area for details).
// Hollow Island is fully charted, and regions visited before this update stay fully charted. Reserved sites for
// future towns and dungeons are never marked.
const FOG_R=8;
function fogEncode(a){if(a.every(v=>v))return'full';const out=[];let cur=0,n=0;for(let i=0;i<a.length;i++){const v=a[i]?1:0;if(v===cur)n++;else{out.push(n.toString(36));cur=v;n=1}}out.push(n.toString(36));return out.join('.')}
function fogDecode(s,len){const a=new Uint8Array(len);if(s==='full'){a.fill(1);return a}if(!s)return a;let i=0,v=0;for(const t of String(s).split('.')){const n=parseInt(t,36)||0;if(v)a.fill(1,i,Math.min(len,i+n));i+=n;v^=1;if(i>=len)break}return a}
let FOG_LEGACY=new Set();
function rgFogAttach(R){const ws=WORLD_STATE[R.region]||(WORLD_STATE[R.region]={});if(ws.fog===undefined)ws.fog=FOG_LEGACY.has(R.region)?'full':'';
 if(R.fogSrc!==ws.fog||!R.fog){R.fog=fogDecode(ws.fog,R.w*R.h);R.fogSrc=ws.fog;R.fogDirty=false;R.mmF=null}return R}
const _rp52=rgPrepare;rgPrepare=function(id){return rgFogAttach(_rp52(id))};
function fogFlush(){for(const id in RG_CACHE){const R=RG_CACHE[id];if(R&&R.fogDirty&&R.fog){const s=fogEncode(R.fog);(WORLD_STATE[id]||(WORLD_STATE[id]={})).fog=s;R.fogSrc=s;R.fogDirty=false}}}
const _sn52=snap;snap=function(){fogFlush();return _sn52()};
const _ap52=applySave;applySave=function(S){FOG_LEGACY=new Set();try{const ws=S&&S.worldState||{};for(const id of(S&&Array.isArray(S.unlockedRegions)?S.unlockedRegions:[]))if(id!=='hollow'&&!(ws[id]&&ws[id].fog!==undefined))FOG_LEGACY.add(id)}catch(e){}
 for(const id in RG_CACHE)if(RG_CACHE[id])RG_CACHE[id].fogSrc=null;
 _ap52(S);for(const id of FOG_LEGACY)if(WORLD_STATE[id]&&WORLD_STATE[id].fog===undefined)WORLD_STATE[id].fog='full';FOG_LEGACY=new Set();
 const R=SCENE&&SCENE.room;if(R&&R.region)rgFogAttach(R)};
// reveal around the player
let FOGT=0;
function fogReveal(R){if(!R.fog)rgFogAttach(R);const cx=Math.floor(P.x/16),cy=Math.floor(P.y/16),W=R.w;let n=0;
 for(let y=Math.max(0,cy-FOG_R);y<=Math.min(R.h-1,cy+FOG_R);y++)for(let x=Math.max(0,cx-FOG_R);x<=Math.min(W-1,cx+FOG_R);x++){const i=y*W+x;if(R.fog[i]||(x-cx)*(x-cx)+(y-cy)*(y-cy)>FOG_R*FOG_R+2)continue;R.fog[i]=1;n++;
  if(R.mmFU)R.mmFU[i]=R.mmT[i]}
 if(n){R.fogDirty=true;R.mmFD=true}return n}
const _u52=upd;upd=function(dt){_u52(dt);const R=SCENE&&SCENE.room;if(!R||!R.region||dead||TRAVEL49)return;if((FOGT-=dt)>0)return;FOGT=.2;fogReveal(R)};
// --- cached map layers ---
const MAPC={sea:hdC('#2a6cc2'),fogL:hdC('#3a4152'),fogS:hdC('#1e2c48')};
function rgTerrainU(R){if(R.mmT)return R.mmT;const u=new Uint32Array(R.w*R.h),COL=RG_MAPCOL.map(hdC);for(let i=0;i<u.length;i++)u[i]=COL[R.tiles[i]]||COL[2];
 for(const it of R.items){if(it.t==='_obj')u[it.y*R.w+it.x]=hdC(RG_OBJCOL[it.o.v||it.o.t]||'#2c7c30');else if(it.t==='lm')for(let b=0;b<(it.h||1);b++)for(let a=0;a<(it.w||1);a++)u[(it.y+b)*R.w+it.x+a]=hdC('#d8d0c0')}
 for(const[a,b]of R.pier)u[b*R.w+a]=hdC('#a87850');return R.mmT=u}
// the fogged map of a region: explored tiles in colour, the rest a dim silhouette (coast shape only)
function rgFogCanvas(R){if(!R.fog)rgFogAttach(R);const T=rgTerrainU(R);
 if(!R.mmF){const c=document.createElement('canvas');c.width=R.w;c.height=R.h;const x=c.getContext('2d'),im=x.createImageData(R.w,R.h),u=new Uint32Array(im.data.buffer);
  for(let i=0;i<u.length;i++)u[i]=R.fog[i]?T[i]:R.tiles[i]===0?MAPC.fogS:MAPC.fogL;R.mmF=c;R.mmFI=im;R.mmFU=u;R.mmFD=true}
 if(R.mmFD){R.mmFD=false;R.mmF.getContext('2d').putImageData(R.mmFI,0,0)}return R.mmF}
// Hollow's map layer (same colours as the map screen), rebuilt only when trees fall or regrow or buildings change
let HMAP=null,HMAPT=-99,HMAPK='';
function hollowMapCanvas(){const now=performance.now()/1000,k=REM.length+'/'+BS.size+'/'+HOUSES.length+'/'+REM.reduce((s,r)=>s+r.i,0);if(HMAP&&(k===HMAPK||now-HMAPT<2))return HMAP;HMAPT=now;HMAPK=k;const c=HMAP||document.createElement('canvas');c.width=N;c.height=N;const x=c.getContext('2d'),im=x.createImageData(N,N),d=im.data,
 COL=[[56,120,216],[232,208,136],[88,176,72],[160,144,128],[238,242,248],[232,188,112]];
 for(let i=0;i<N*N;i++){let cl=COL[tile[i]]||COL[2];const o=obj[i];if(o)cl=o.t==='tree'?[44,124,48]:o.t==='rock'?[120,120,140]:o.t==='ore'?[216,128,56]:o.t==='pine'?[30,90,60]:o.t==='cactus'?[60,150,56]:o.t==='bush'?[200,72,96]:cl;if(BS.has(i))cl=[200,80,64];if(BRIDGE.has(i))cl=[168,120,80];const j=i*4;d[j]=cl[0];d[j+1]=cl[1];d[j+2]=cl[2];d[j+3]=255}
 x.putImageData(im,0,0);return HMAP=c}
// --- the HUD minimap (all five areas) ---
function miniTarget(){if(menuOpen||dead||TRAVEL49)return null;const R=SCENE&&SCENE.room;if(R&&R.region)return{k:'region',R,w:R.w,h:R.h};if(!SCENE)return{k:'hollow',w:N,h:N};return null}
function drawMini52(){const t=miniTarget();if(!t)return;const L=hudLayout(),U=L.U,w=(L.mw||L.dw),hh=w*t.h/t.w,x0=L.dx+L.dw-w,y0=L.top+L.dh+46*U;g.save();g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;
 g.fillStyle='rgba(10,8,16,.72)';g.fillRect(x0-3*U,y0-3*U,w+6*U,hh+6*U);g.drawImage(t.k==='region'?rgFogCanvas(t.R):hollowMapCanvas(),x0,y0,w,hh);
 const m=(tx,ty,c,s)=>{g.fillStyle=c;g.fillRect(x0+(tx+.5)/t.w*w-s*U/2,y0+(ty+.5)/t.h*hh-s*U/2,s*U,s*U)};
 if(t.k==='region'){const R=t.R;m(R.dock[0],R.dock[1],'#f8d848',3);for(const l of R.lms)if(rgSeen(R.region,l.id))m(l.x,l.y,'#f8f8f8',2)}
 else{for(const d of DUNGEON_REG)if(d.on)m(d.x,d.y,'#2a1a10',3),m(d.x,d.y,'#e8b048',1.6);for(const p of HARBOR_POSTS)m(p.x,p.y,'#58d8ff',2.4);
  const V=VQ();if((performance.now()/350|0)%2)for(const q of VOYS)if(V[q.id]===1){const tg=q.buoy?BUOYS[q.buoy]:q.cairn?CAIRN:null;if(tg)m(tg.x,tg.y,'#f83030',2.4)}}
 const px=P.x/16-.5,py=P.y/16-.5;m(px,py,'#000',4.2);m(px,py,(performance.now()/300|0)%2?'#ff4060':'#ffffff',3);g.restore()}
const _dh52=drawHUD;drawHUD=function(){drawMini52();_dh52()};   // under the rest of the HUD: the message box always stays on top
// --- the WORLD view ---
let MAPVIEW='local',WSEL=null;const WM={W:300,H:300,s:.45};
const WM_POS={hollow:[150,150],briarwood:[44,146],ashfall:[256,146],ironcrest:[150,44],shattered:[150,256]};   // centres, laid out as the chart in the plan
const RG_THUMB={};   // per region: terrain colours + dock, kept small so the world map never needs the full region again
const THUMB_JOB={};
function rgThumb(id){if(RG_THUMB[id])return RG_THUMB[id];const D=WORLD_REGIONS[id];let R=RG_CACHE[id];
 if(!R){const J=THUMB_JOB[id]||(THUMB_JOB[id]=rgJob(id));if(!rgJobStep(J,10))return null;delete THUMB_JOB[id];if(J.err)return null;const G=J.G;R={w:D.width,h:D.height,tiles:G.tiles,items:G.items,pier:G.pier,dock:G.dock,lms:G.lms}}
 return RG_THUMB[id]={w:R.w,h:R.h,T:rgTerrainU({w:R.w,h:R.h,tiles:R.tiles,items:R.items,pier:R.pier}),land:Uint8Array.from(R.tiles,t=>t?1:0),dock:R.dock.slice(),lms:R.lms.map(l=>({...l}))}}
function wmRect(id){const D=WORLD_REGIONS[id],w=D.width*WM.s,h=D.height*WM.s,[cx,cy]=WM_POS[id];return{x:cx-w/2,y:cy-h/2,w,h}}
const wmKnown=id=>id==='hollow'||UNLOCKED_REGIONS.includes(id);
const wmNamed=id=>wmKnown(id)||routeOpen(id);
function wmThumbCanvas(id){const th=RG_THUMB[id];if(!th)return null;const known=wmKnown(id),R=RG_CACHE[id],live=known&&R&&R.fog,key=!known?'sil':live?null:((WORLD_STATE[id]&&WORLD_STATE[id].fog)||'');
 if(key!==null&&th.key===key&&th.c)return th.c;const c=th.c||document.createElement('canvas');c.width=th.w;c.height=th.h;const x=c.getContext('2d'),im=x.createImageData(th.w,th.h),u=new Uint32Array(im.data.buffer),
 fog=!known?null:live?R.fog:fogDecode(key,th.w*th.h);for(let i=0;i<u.length;i++)u[i]=fog&&fog[i]?th.T[i]:th.land[i]?MAPC.fogL:0;x.putImageData(im,0,0);th.c=c;th.key=key;return c}
function worldHTML52(){const sel=WSEL||curRegion(),D=WORLD_REGIONS[sel],known=wmKnown(sel);let h='<canvas id="wmc" width="'+WM.W+'" height="'+WM.H+'" style="position:static;inset:auto;display:block;margin:6px auto;width:min(84vw,52vh,380px);height:auto;image-rendering:pixelated;border:3px solid #485870;border-radius:6px;background:#1d3f7a"></canvas>'+
 '<div class="lg"><span><i style="background:#f83030"></i>You</span><span><i style="background:#f8d848"></i>Sea route</span><span><i style="background:#58d8ff"></i>Harbor post</span><span><i style="background:#f8f8f8"></i>Landmark</span></div>';
 h+='<div class="qc"><b>'+(wmNamed(sel)?D.name:'Uncharted waters')+(sel===curRegion()?' · you are here':'')+'</b><small>';
 if(!wmNamed(sel))h+='<br>Nobody has charted a route here yet. Ask Sera, the Navigator in Tidewatch.';
 else{h+='<br>'+D.biome+(D.lv?' · suggested combat '+D.lv:'');
  if(sel==='hollow'){h+='<br>Towns: '+TOWN_REG.filter(t=>t.on).map(t=>t.name).join(', ')+'<br>Dungeons: '+DUNGEON_REG.filter(d=>d.on).map(d=>d.name).join(', ')+'<br>Harbor posts: '+HARBOR_POSTS.map(p=>p.name).join(', ')}
  else{const seen=(WORLD_STATE[sel]&&WORLD_STATE[sel].seen)||[],names=[...new Set(seen.map(lmName))];
   h+='<br>'+(known?'Landmarks found: '+seen.length+' / '+(RG_LMCOUNT[sel]||'?')+(names.length?' ('+names.join(', ')+')':''):'Not yet visited');
   h+='<br>Route: '+(routeOpen(sel)?'open from every harbor post (departs '+WM_ROUTE[sel].from+')':'locked · '+routeReq(sel).filter(r=>!r.ok).map(r=>r.t).join(', '))}}
 h+='</small></div><div style="text-align:center;font-size:12px;opacity:.7">Tap an area for details. The map is for planning: sail from a harbor post.</div>';return h}
const LM_NAMES={elder_grove:'The Elder Grove',whispering_ruins:'Whispering Ruins',thornwater:'Thornwater Lake',camp:'Abandoned Camp',emberfield:'Emberfield',black_lighthouse:'The Black Lighthouse',fallen_bastion:'The Fallen Bastion',
 observatory:'The Broken Observatory',silverfall:'Silverfall Valley',giants_stair:'The Giant\'s Stair',mcamp:'Abandoned Mining Camp',tower0:'North Watchtower',tower1:'East Watchtower',tower2:'South Watchtower',fractured_temple:'The Fractured Temple',spire:'A Silent Spire',crystal_basin:'The Crystal Basin'};
const lmName=id=>LM_NAMES[id]||LM_NAMES[id.replace(/\d+$/,'')]||id;
const WM_ROUTE={briarwood:{from:'Tidewatch',post:'tidewatch'},ashfall:{from:'Saltmere',post:'saltmere'},ironcrest:{from:'Frosthollow',post:'frosthollow'},shattered:{from:'Tidewatch',post:'tidewatch'}};
let WMGEN=0;
function drawWorld52(){const c=document.getElementById('wmc');if(!c)return;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,c.width,c.height);
 // a missing area outline is built at most once per refresh, so opening the map never stalls
 for(const id of ROUTE_ORDER)if(id!=='hollow'&&!RG_THUMB[id]){try{rgThumb(id)}catch(e){console.warn(e)}break}
 const cur=curRegion(),bl=(performance.now()/350|0)%2,hp=wmRect('hollow');
 // routes first (under the islands)
 x.lineWidth=2;for(const id of ROUTE_ORDER){if(id==='hollow'||!routeOpen(id)||!RG_THUMB[id])continue;const p=HARBOR_POSTS.find(q=>q.id===WM_ROUTE[id].post)||HARBOR_POSTS[0],r=wmRect(id),th=RG_THUMB[id];
  const ax=hp.x+(p.x+.5)/N*hp.w,ay=hp.y+(p.y+.5)/N*hp.h,bx=r.x+(th.dock[0]+.5)/th.w*r.w,by=r.y+(th.dock[1]+.5)/th.h*r.h;x.setLineDash([5,4]);x.strokeStyle='#f8d848';x.beginPath();x.moveTo(ax,ay);
  const mx=(ax+bx)/2+(ay-by)*.12,my=(ay+by)/2+(bx-ax)*.12;x.quadraticCurveTo(mx,my,bx,by);x.stroke();x.setLineDash([])}
 for(const id of ROUTE_ORDER){const r=wmRect(id);let img=null;if(id==='hollow')img=hollowMapCanvas();else if(RG_THUMB[id])img=wmThumbCanvas(id);
  if(img)x.drawImage(img,r.x,r.y,r.w,r.h);else{x.fillStyle='rgba(58,65,82,.6)';x.fillRect(r.x+r.w*.2,r.y+r.h*.2,r.w*.6,r.h*.6)}
  if((WSEL||cur)===id){x.strokeStyle=id===cur?'#ff8090':'#ffffff';x.lineWidth=2;x.strokeRect(r.x-2,r.y-2,r.w+4,r.h+4)}
  x.font='bold 10px "Pixelify Sans",monospace';x.textAlign='center';x.fillStyle='rgba(0,0,0,.6)';const nm=wmNamed(id)?WORLD_REGIONS[id].name:'? ? ?';x.fillText(nm,r.x+r.w/2+1,id==='shattered'?r.y-3:r.y+r.h+11);x.fillStyle=wmKnown(id)?'#ffffff':'#a8b0c8';x.fillText(nm,r.x+r.w/2,id==='shattered'?r.y-4:r.y+r.h+10);
  // markers: posts and dungeons on Hollow, piers and found landmarks elsewhere
  const dot=(tx,ty,W,H,col,s)=>{x.fillStyle=col;x.fillRect(r.x+(tx+.5)/W*r.w-s/2,r.y+(ty+.5)/H*r.h-s/2,s,s)};
  if(id==='hollow'){for(const p of HARBOR_POSTS)dot(p.x,p.y,N,N,'#58d8ff',3)}
  else if(RG_THUMB[id]&&wmKnown(id)){const th=RG_THUMB[id],seen=(WORLD_STATE[id]&&WORLD_STATE[id].seen)||[];dot(th.dock[0],th.dock[1],th.w,th.h,'#f8d848',3);for(const l of th.lms)if(seen.includes(l.id))dot(l.x,l.y,th.w,th.h,'#f8f8f8',2)}
  if(id===cur&&bl){const W=id==='hollow'?N:WORLD_REGIONS[id].width,H=id==='hollow'?N:WORLD_REGIONS[id].height,wp=id==='hollow'?worldPos():{x:P.x,y:P.y};dot(wp.x/16-.5,wp.y/16-.5,W,H,'#f83030',4)}}}
// HERE / WORLD switch on the map screen
const _mh52=mapHTML;mapHTML=function(){const tabs='<div style="display:flex;gap:6px;justify-content:center;margin:2px 0 4px"><button class="sb mp52" data-m="local" style="flex:1;opacity:'+(MAPVIEW==='local'?1:.55)+'">HERE</button><button class="sb mp52" data-m="world" style="flex:1;opacity:'+(MAPVIEW==='world'?1:.55)+'">WORLD</button></div>';
 return tabs+(MAPVIEW==='world'?worldHTML52():_mh52())};
const _dmap52=drawMap;drawMap=function(){if(MAPVIEW==='world'){drawWorld52();return}_dmap52()};
const _oc52=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('.mp52');if(b){MAPVIEW=b.dataset.m;WSEL=null;rPn();return}
 if(e.target&&e.target.id==='wmc'){const c=e.target,rc=c.getBoundingClientRect(),mx=(e.clientX-rc.left)/rc.width*c.width,my=(e.clientY-rc.top)/rc.height*c.height;
  for(const id of ROUTE_ORDER){const r=wmRect(id);if(mx>=r.x-6&&mx<=r.x+r.w+6&&my>=r.y-6&&my<=r.y+r.h+6){WSEL=id;rPn();return}}return}_oc52(e)};
const _ng52=newGame;newGame=function(){for(const id in RG_CACHE)if(RG_CACHE[id]){RG_CACHE[id].fog=null;RG_CACHE[id].fogDirty=false;RG_CACHE[id].mmF=null}MAPVIEW='local';_ng52()};
