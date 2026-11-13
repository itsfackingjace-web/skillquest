// ---- 113. Island builder (Dev Suite > Islands): paint a new island, then publish it as a sailing destination ----
// Ground is painted with the 15 region ground types, objects (trees, rocks, ore...) placed tile by tile or scattered,
// and buildings, props, signs and loot chests placed on top. "Real look" draws it all with the game's own art.
// The island is saved in the asset library (islands.cu_<name>); the asset library turns it into a region (section 111).
(()=>{if(!window.SQSUITE||!window.SQA)return;const API=SQSUITE.api,{S,A,E,dset,toast,fail,arm,same,confirmLeave}=API,PXC=A.PXC,HEX='0123456789abcdef';
 const TILES=[[0,'Water'],[1,'Sand'],[2,'Grass'],[7,'Forest floor'],[14,'Dirt trail'],[11,'Stone paving'],[5,'Desert sand'],[10,'Cracked earth'],[13,'Dark ground'],
  [8,'Black sand'],[4,'Snow'],[12,'Ice'],[3,'Mountain'],[9,'Lava'],[15,'Sulfur spring']];
 const OBJN={tree:'Tree','tree:dark':'Dark tree','tree:dead':'Dead tree',pine:'Pine',oak:'Oak',willow:'Willow',maple:'Maple',yew:'Yew',bush:'Berry bush',nutbush:'Nut bush',
  shroom:'Mushroom',rock:'Rock','rock:moss':'Mossy rock',ore:'Ore','ore:crystal':'Crystal',cactus:'Cactus'};
 const OBJC={tree:'#2c7c30','tree:dark':'#5a3a80','tree:dead':'#3a2c24',pine:'#1e5a38',oak:'#4a9a3a',willow:'#9ac85a',maple:'#e0782a',yew:'#245a40',bush:'#c84860',nutbush:'#a07a40',
  shroom:'#e83a3a',rock:'#a09888','rock:moss':'#7a8a58',ore:'#e08a38','ore:crystal':'#b080f0',cactus:'#3c9a38'};
 const OBJ=A.ISL_OBJ,LMK=Object.keys(A.ISL_LM),LM=A.ISL_LM,COL=RG_MAPCOL,WALK=RG_WALK,NONE=255,MAXPX=4096;
 const SIZES=[['Small',60,48],['Medium',100,80],['Large',150,120]];
 const DIRS=[['n','North'],['ne','North-east'],['e','East'],['se','South-east'],['s','South'],['sw','South-west'],['w','West'],['nw','North-west']];
 const SIDES=[['e','East'],['w','West'],['n','North'],['s','South']];
 const TOOLS=[['paint','Paint'],['scatter','Scatter'],['fill','Fill'],['line','Line'],['rect','Box'],['ellipse','Oval'],['erase','Erase'],['pick','Pick'],['pan','Move']];
 const I={sel:null,ed:null,make:false};let down=false,last=-1,pan=null,shape=null;
 const isl=()=>S.draft.islands||(S.draft.islands={});
 const lmSize=k=>{const L=LM[k];return L?[L[1],L[2]]:[1,1]};
 // ---- the data <-> the editor ----
 function fromData(id,d){const N=d.w*d.h,t=new Uint8Array(N),o=new Uint8Array(N).fill(NONE),ts=A.unpack(d.t),os=d.o?A.unpack(d.o):'';
  for(let i=0;i<N;i++){const v=HEX.indexOf(ts[i]);t[i]=v>=0?v:0;const c=os[i];if(c&&c!=='.'){const k=PXC.indexOf(c);if(k>=0&&k<OBJ.length)o[i]=k}}
  const lm=(Array.isArray(d.lm)?d.lm:Object.values(d.lm||{})).filter(L=>L&&LM[L.k]).map(L=>({k:L.k,x:L.x|0,y:L.y|0,n:L.n||'',tx:L.tx||'',loot:L.loot?{...L.loot}:undefined}));
  const cl=d.c?A.unpack(d.c):'',c=new Uint8Array(N).fill(NONE);for(let i=0;i<N;i++){const ch=cl[i];if(ch&&ch!=='.'){const k=HEX.indexOf(ch);if(k>=0)c[i]=k}}
  const arr=v=>Array.isArray(v)?v:Object.values(v||{});
  const npc=arr(d.npc).filter(Boolean).map(Q=>({x:Q.x|0,y:Q.y|0,n:Q.n||'',lk:Object.assign({sk:0,hs:0,hc:1,sh:2,pn:1,ht:0,hcol:0,so:0},Q.lk||{}),s:arr(Q.s).join('\n'),ro:Q.ro||''}));
  const cv=arr(d.cv).filter(Boolean).map(V=>({x:V.x|0,y:V.y|0,n:V.n||'',st:V.st||'rock',f:V.f|0||3,m:arr(V.m).slice()}));
  const zn=arr(d.zn).filter(Boolean).map(Z=>({x:Z.x|0,y:Z.y|0,w:Math.max(1,Z.w|0),h:Math.max(1,Z.h|0),n:Z.n|0||4,m:arr(Z.m).slice(),hp:Z.hp|0}));
  const ct=arr(d.ct).filter(T=>T&&LIFE().okUrl(T.p)).slice(0,8).map(T=>({n:T.n||'Tile',p:T.p}));
  return{id,w:d.w,h:d.h,t,o,lm,c,npc,cv,zn,ct,cti:0,sk:'lm',meta:{mx:isFinite(d.mx)?+d.mx:null,my:isFinite(d.my)?+d.my:null,n:d.n||'',b:d.b||'',lv:d.lv||'',dir:d.dir||'e',pier:d.pier||'e',mob:d.mob||'',max:d.max==null?12:d.max},
   tool:'paint',pal:'tile',tile:2,obj:0,lmk:'sign',brush:1,dens:25,zoom:0,fit:0,undo:[],redo:[],dirty:false,check:null,sel:-1,view:'map'}}
 function toData(ed){let t='',o='',any=false;for(let i=0;i<ed.t.length;i++){t+=HEX[ed.t[i]];const v=ed.o[i];if(v!==NONE){any=true;o+=PXC[v]}else o+='.'}
  const m=ed.meta,d={n:m.n.trim()||'Unnamed Isle',b:m.b.trim(),lv:m.lv.trim(),dir:m.dir,pier:m.pier,w:ed.w,h:ed.h,t:A.pack(t)};if(any)d.o=A.pack(o);if(m.mob){d.mob=m.mob;d.max=Math.max(0,Math.min(30,m.max|0))}
  if(ed.lm.length)d.lm=ed.lm.map(L=>{const r={k:L.k,x:L.x,y:L.y};if(L.n&&L.n.trim())r.n=L.n.trim().slice(0,40);if(L.tx&&L.tx.trim())r.tx=L.tx.trim().slice(0,300);
   if(L.k==='chest'){const lo={};for(const k in L.loot||{}){const n=Math.max(0,Math.min(100000,L.loot[k]|0));if(n)lo[k]=n}r.loot=lo}return r});
  if(m.mx!=null&&m.my!=null){d.mx=Math.round(m.mx);d.my=Math.round(m.my)}
  if(ed.npc.length)d.npc=ed.npc.map(Q=>{const r={x:Q.x,y:Q.y,n:(Q.n||'').trim().slice(0,24)||'Islander',lk:{...Q.lk}};const ls=String(Q.s||'').split('\n').map(l=>l.trim().slice(0,160)).filter(Boolean).slice(0,8);if(ls.length)r.s=ls;if(Q.ro)r.ro=String(Q.ro).slice(0,120);return r});
  if(ed.cv.length)d.cv=ed.cv.map(V=>({x:V.x,y:V.y,n:(V.n||'').trim().slice(0,40)||'Hidden Cave',st:V.st,f:Math.max(1,Math.min(6,V.f|0)),m:V.m.slice(0,6)}));
  if(ed.zn.length)d.zn=ed.zn.map(Z=>({x:Z.x,y:Z.y,w:Z.w,h:Z.h,n:Math.max(1,Math.min(12,Z.n|0)),m:Z.m.slice(0,6),hp:Math.max(0,Math.min(3,Z.hp|0))}));
  if(ed.ct.length){d.ct=ed.ct.map(T=>({n:(T.n||'Tile').slice(0,24),p:T.p}));let c='',any2=false;for(let i=0;i<ed.c.length;i++){const v=ed.c[i];if(v!==NONE&&v<ed.ct.length){c+=HEX[v];any2=true}else c+='.'}if(any2)d.c=A.pack(c)}
  return d}
 const LIFE=()=>window.SQISLIFE||{MOBS:{},okUrl:()=>false};
 const MOBN=()=>Object.entries(LIFE().MOBS).map(([k,v])=>[k,v.n]).sort((a,b)=>a[1].localeCompare(b[1]));
 const CAVES=[['rock','Rock cave'],['mine','Mine'],['ice','Ice cave'],['root','Root hollow'],['sand','Sandstone dig']],TOUGHN=['Normal','Tough','Very tough','Deadly'];
 const LOOKF=[['sk','Skin',5],['hs','Hair',4],['hc','Hair colour',8],['sh','Shirt',8],['pn','Trousers',6],['ht','Hat',3],['hcol','Hat colour',6],['so','Shoes',5]];
 function blank(w,h){const N=w*h,t=new Uint8Array(N),cx=w/2,cy=h/2;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const d=Math.hypot((x-cx)/(w*.36),(y-cy)/(h*.36));t[y*w+x]=d<.86?2:d<1?1:0}return t}
 const slug=n=>'cu_'+(String(n).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,24)||'isle');
 // ---- what to publish ----
 const name=id=>((isl()[id]||(S.live&&S.live.islands||{})[id]||{}).n)||id;
 function changes(L,D){const out=[],l=L.islands||{},d=D.islands||{};for(const id of new Set([...Object.keys(l),...Object.keys(d)]))if(!same(l[id],d[id]))
  out.push({kind:'ext',html:'🏝 '+E(name(id))+': '+(d[id]?(l[id]?'island changed':'new island'):'island removed')});return out}
 // ---- the game's own art, for the "Real look" view ----
 // ground: baked in 8 x 8 tile pieces by the game's terrain painter. Objects and buildings: each kind is drawn once by the
 // game onto its own (hidden) screen canvas and copied, then stamped wherever it's placed.
 const ART=new Map();
 function artOf(key,it){if(ART.has(key))return ART.get(key);let out=null;const cvs=g.canvas;
  try{const OX=220,OY=Math.min(560,cvs.height-80),s=2;if(cvs.width<OX*2||cvs.height<200)throw 0;g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cvs.width,cvs.height);g.setTransform(s,0,0,s,OX,OY);
   drawFurn(Object.assign({x:0,y:0},it),0);g.restore();const W=Math.min(cvs.width,OX+260*s),H=Math.min(cvs.height,OY+80*s),d=g.getImageData(0,0,W,H).data;let x0=W,y0=H,x1=-1,y1=-1;
   for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
   if(x1>=x0){const c=document.createElement('canvas');c.width=x1-x0+1;c.height=y1-y0+1;c.getContext('2d').drawImage(cvs,x0,y0,c.width,c.height,0,0,c.width,c.height);out={c,ox:(x0-OX)/s,oy:(y0-OY)/s,s}}}
  catch(e){out=null}ART.set(key,out);return out}
 const objArt=k=>{const[t,v]=k.split(':');return artOf('o:'+k,{t:'_obj',o:{t,v,hp:3}})};
 const lmArt=k=>{const[kk,v]=k.split(':');const[w,h]=lmSize(k);return artOf('l:'+k,{t:'lm',k:kk,v:v==null?undefined:(isNaN(+v)?v:+v),w,h})};
 function chunk(ed,kx,ky){const key=kx+','+ky;let c=ed.ck.get(key);if(c)return c;try{c=hdBakeR(kx,ky,(x,y)=>x<0||y<0||x>=ed.w||y>=ed.h?0:(ed.t[y*ed.w+x]===6?0:ed.t[y*ed.w+x]))}catch(e){c=null}ed.ck.set(key,c);return c}
 function dirtyChunks(ed,cells){if(!ed.ck)return;for(const i of cells){const x=i%ed.w,y=(i/ed.w)|0;for(const[a,b]of[[0,0],[-1,0],[1,0],[0,-1],[0,1]])ed.ck.delete(((x+a)>>3)+','+((y+b)>>3))}}
 // ---- screen ----
 function render(){const ids=Object.keys(isl()).sort();if(I.ed&&!ids.includes(I.ed.id))ids.unshift(I.ed.id);let h='<div class="dv-spr'+(I.sel?' dv-has':'')+'"><div class="dv-ls"><button class="dv-b dv-pri" data-ia="new">+ New island</button>';
  if(I.make){h+='<div class="dv-card" style="padding:10px"><b>New island</b><p><input type="text" data-if="newname" placeholder="Island name" maxlength="40" value="'+E(I.newName||'')+'"></p>'+
   '<p class="dv-chips">'+SIZES.map((z,k)=>'<button class="dv-b'+((I.newSize|0)===k?' dv-tl dv-on':'')+'" data-ia="size'+k+'">'+z[0]+'<br><small>'+z[1]+' × '+z[2]+'</small></button>').join('')+'</p>'+
   '<button class="dv-b dv-pri" data-ia="create">Create</button> <button class="dv-b" data-ia="cancelnew">Cancel</button></div>'}
  h+='<div class="dv-grid" style="grid-template-columns:1fr">';for(const id of ids){const d=isl()[id]||(I.ed&&I.ed.id===id?{n:I.ed.meta.n,w:I.ed.w,h:I.ed.h}:{}),l=S.live&&S.live.islands&&S.live.islands[id],st=!same(d,l)?'draft':'live';
   h+='<button class="dv-it'+(I.sel===id?' dv-on':'')+'" data-isl="'+E(id)+'" style="flex-direction:row;justify-content:flex-start;padding:8px 10px"><i class="dv-bd dv-'+st+'">'+(st==='draft'?'DRAFT':'LIVE')+'</i><span style="font-size:13px;-webkit-line-clamp:1;text-align:left">🏝 '+E(d.n||id)+'<br><small style="color:#8a94a6">'+d.w+' × '+d.h+'</small></span></button>'}
  if(!ids.length&&!I.make)h+='<p class="dv-mut">No islands yet. Make one with "New island".</p>';
  {const B=Object.keys(WORLD_REGIONS).filter(k=>!WORLD_REGIONS[k].custom&&typeof RG_GENS!=='undefined'&&RG_GENS[k]&&!ids.includes('ed_'+k));if(B.length)h+='<div class="dv-mut" style="margin:10px 0 4px">Built-in islands <small>(paint changes on top of them)</small></div>'+B.map(k=>'<button class="dv-it" data-ia="bi:'+E(k)+'" style="flex-direction:row;justify-content:flex-start;padding:6px 10px"><span style="font-size:13px;text-align:left">✎ '+E(WORLD_REGIONS[k].name)+'</span></button>').join('')}
  h+='</div></div><div class="dv-ed">';
  if(!I.ed)h+='<div class="dv-card"><b>Build a new island.</b><p class="dv-mut">Paint the ground, scatter forests and rocks, place buildings, signs and loot chests, choose where the pier goes, then publish it. Players sail to it from any harbor post, like the other islands. Your island gets open sea around it automatically.</p></div>';
  else{const ed=I.ed,m=ed.meta;
   h+='<div class="dv-row"><button class="dv-b dv-back" data-ia="back">‹ All islands</button><b style="font-size:16px">🏝 '+E(m.n||ed.id)+'</b><span class="dv-mut">'+ed.w+' × '+ed.h+' tiles · '+E(ed.id)+'</span>'+
    '<span class="dv-sp1"></span><span class="dv-chips"><button class="dv-b'+(ed.view==='map'?' dv-tl dv-on':'')+'" data-ia="vmap">Map</button><button class="dv-b'+(ed.view==='art'?' dv-tl dv-on':'')+'" data-ia="vart">Real look</button></span></div>'+
    '<div class="dv-row dv-itools"></div><div class="dv-cv dv-cvw" id="dvicv"><div class="dv-stack"><canvas id="dvi"></canvas><canvas id="dvio"></canvas></div></div>'+
    '<div class="dv-mut" id="dvihint" style="min-height:1.4em"></div><div id="dvisel"></div>'+
    '<div><div class="dv-mut" style="margin:4px 0">Ground</div><div class="dv-pal dv-ipal-t"></div><div class="dv-mut" style="margin:8px 0 4px">Objects</div><div class="dv-pal dv-ipal-o"></div>'+
    '<div class="dv-mut" style="margin:8px 0 4px">Buildings and props <small>(tap to place, then Pick to select one)</small></div><div class="dv-pal dv-ipal-l"></div>'+
    '<div class="dv-mut" style="margin:8px 0 4px">People, dungeons and monsters <small>(a monster zone is drawn with a drag)</small></div><div class="dv-pal dv-ipal-x"></div>'+
    '<div class="dv-mut" style="margin:8px 0 4px">Your own ground tiles <small>(drawn over the ground; the ground under them still decides where players can walk)</small></div><div class="dv-pal dv-ipal-c"></div><div id="dvitile"></div></div>'+
    '<div class="dv-row" style="margin-top:6px"><button class="dv-b" data-ia="beach">Add beaches</button><span class="dv-mut">turns land along the water into sand</span></div>'+
    (ed.bi?'<div class="dv-card" style="margin-top:6px"><b>Changes to '+E(WORLD_REGIONS[ed.bi]?WORLD_REGIONS[ed.bi].name:ed.bi)+'</b><p class="dv-mut">You are painting on top of the island the game makes. The darkened parts (villages, the harbor and the game\'s own buildings and landmarks) are locked.</p><label class="dv-mut" style="display:block;margin:4px 0"><input type="checkbox" data-ia="biul"'+(ed.ul?' checked':'')+'> Unlock them (the buildings\' own tiles still stay; painting a village over can make it hard to walk through)</label><p class="dv-mut">The island\'s size and its harbor stay the game\'s own, since villages, quests and the voyage all depend on them. Trees and rocks keep exactly the places you give them.</p>'+'<div class="dv-row"><button class="dv-b dv-pri" data-ia="save">Save to draft</button><button class="dv-b '+(S.arm==='idel'?'dv-arm':'dv-bad')+'" data-ia="del">'+(S.arm==='idel'?'Tap again to undo every change':'Undo all my changes')+'</button></div><p class="dv-mut">Publish to send the changes to players. Use Dev Suite &gt; Test to go there.</p></div>':'')+
    (ed.bi?'':'<div class="dv-card" style="margin-top:6px"><b>Island details</b>'+
    '<p><label class="dv-mut">Name<input type="text" data-im="n" maxlength="40" value="'+E(m.n)+'"></label></p>'+
    '<p><label class="dv-mut">Description (shown on the sailing routes and world map)<input type="text" data-im="b" maxlength="120" value="'+E(m.b)+'" placeholder="Meadows, a quiet lake and an old ruin"></label></p>'+
    '<div class="dv-row"><label class="dv-mut">Suggested level<input type="text" data-im="lv" maxlength="12" value="'+E(m.lv)+'" placeholder="1–20" style="width:110px"></label>'+
    '<label class="dv-mut">Lies to the<br><select data-im="dir">'+DIRS.map(([k,n])=>'<option value="'+k+'"'+(m.dir===k?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'+
    '<label class="dv-mut">Pier on the<br><select data-im="pier">'+SIDES.map(([k,n])=>'<option value="'+k+'"'+(m.pier===k?' selected':'')+'>'+n+' coast</option>').join('')+'</select></label>'+
    '<label class="dv-mut">Monsters roaming the island<br><select data-im="mob"><option value="">None (peaceful)</option>'+Object.keys(typeof RG_MOBS!=='undefined'?RG_MOBS:{}).filter(k=>WORLD_REGIONS[k]&&!WORLD_REGIONS[k].custom).map(k=>'<option value="'+k+'"'+(m.mob===k?' selected':'')+'>Like '+E(WORLD_REGIONS[k].name)+'</option>').join('')+'</select></label>'+
    (m.mob?'<label class="dv-mut">At most<input type="number" data-im="max" min="0" max="30" value="'+(m.max|0)+'" style="width:70px"></label>':'')+'</div>'+
    '<div style="margin-top:8px"><span class="dv-mut">Where it lies on the sea chart <small>(tap to move it'+(m.mx!=null?'':'; now placed by its direction')+')</small></span><br><canvas id="dvichart" width="360" height="360" style="width:min(360px,100%);aspect-ratio:1;border-radius:8px;cursor:crosshair;margin-top:4px;touch-action:none"></canvas>'+
     (m.mx!=null?'<br><button class="dv-b" data-ia="chartreset">Place it by its direction again</button>':'')+'</div>'+
    '')+(ed.bi?'':'<div class="dv-row" style="margin-top:8px"><span class="dv-mut">Size</span><input type="number" data-im="w" min="20" max="200" value="'+ed.w+'" style="width:76px"> × <input type="number" data-im="h" min="20" max="200" value="'+ed.h+'" style="width:76px"><button class="dv-b" data-ia="resize">Resize</button><span class="dv-mut">keeps the middle</span></div></div>'+
    '<div class="dv-row"><button class="dv-b dv-pri" data-ia="save">Save to draft</button><button class="dv-b" data-ia="check">Check island</button><button class="dv-b" data-ia="sail">Sail there now</button>'+
    '<button class="dv-b '+(S.arm==='idel'?'dv-arm':'dv-bad')+'" data-ia="del">'+(S.arm==='idel'?'Tap again to delete this island':'Delete island')+'</button></div>')+
    '<div class="dv-mut" id="dvicheck">'+(ed.check||'')+'</div>'+
    '<p class="dv-mut">Keys: B paint · S scatter · F fill · L line · R box · O oval · E erase · I pick · M move · 1–5 brush · V real look · + / − zoom · Ctrl+Z undo · Ctrl+S save</p>'}
  return h+'</div></div>'}
 function after(){const ed=I.ed;if(!ed)return;tools();pals();selPanel();tilePanel();chart();paint(true);hint()}
 function tools(){const t=document.querySelector('#dvs .dv-itools'),ed=I.ed;if(!t||!ed)return;
  t.innerHTML=TOOLS.map(([k,n])=>'<button class="dv-b dv-tl'+(ed.tool===k?' dv-on':'')+'" data-itool="'+k+'">'+n+'</button>').join('')+
   '<span class="dv-mut">Brush</span>'+[1,2,3,5,9].map(b=>'<button class="dv-b dv-tl'+(ed.brush===b?' dv-on':'')+'" data-ibrush="'+b+'">'+b+'</button>').join('')+
   (ed.tool==='scatter'?'<label class="dv-mut">Density <input type="range" data-im="dens" min="3" max="70" value="'+ed.dens+'" style="width:90px;vertical-align:middle"> '+ed.dens+'%</label>':'')+
   '<button class="dv-b" data-ia="undo">Undo</button><button class="dv-b" data-ia="redo">Redo</button><button class="dv-b" data-ia="zout">−</button><button class="dv-b" data-ia="zin">+</button>';
  const cv=document.getElementById('dvicv');if(cv)cv.classList.toggle('dv-pan',ed.tool==='pan')}
 function pals(){const ed=I.ed,a=document.querySelector('#dvs .dv-ipal-t'),b=document.querySelector('#dvs .dv-ipal-o'),c=document.querySelector('#dvs .dv-ipal-l');if(!a||!ed)return;
  a.innerHTML=TILES.map(([v,n])=>'<button class="dv-sw'+(ed.pal==='tile'&&ed.tile===v?' dv-on':'')+'" data-itile="'+v+'" title="'+n+'" style="background:'+COL[v]+';width:auto;min-width:26px;padding:0 6px;color:'+(v===4||v===12||v===1||v===5||v===15?'#222':'#fff')+';font-size:11px;height:28px">'+n+'</button>').join('');
  b.innerHTML=OBJ.map((k,i)=>'<button class="dv-sw'+(ed.pal==='obj'&&ed.obj===i?' dv-on':'')+'" data-iobj="'+i+'" title="'+OBJN[k]+'" style="background:#1c232e;width:auto;padding:0 8px 0 6px;height:28px;font-size:11px;color:#dfe5ee"><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+OBJC[k]+';margin-right:5px;vertical-align:-1px"></i>'+OBJN[k]+'</button>').join('');
  c.innerHTML=LMK.map(k=>{const[w,h]=lmSize(k);return'<button class="dv-sw'+(ed.pal==='lm'&&ed.lmk===k?' dv-on':'')+'" data-ilm="'+k+'" style="background:#1c232e;width:auto;padding:0 8px;height:28px;font-size:11px;color:#dfe5ee">'+E(LM[k][0])+(w*h>1?' <small style="color:#8a94a6">'+w+'×'+h+'</small>':'')+'</button>'}).join('');
  const sw='background:#1c232e;width:auto;padding:0 8px;height:28px;font-size:11px;color:#dfe5ee',x=document.querySelector('#dvs .dv-ipal-x'),cc=document.querySelector('#dvs .dv-ipal-c');
  if(x)x.innerHTML=[['npc','🧑 Person'],['cv','🕳 Dungeon entrance'],['zn','👾 Monster zone']].map(([k,n])=>'<button class="dv-sw'+(ed.pal===k?' dv-on':'')+'" data-ix="'+k+'" style="'+sw+'">'+n+'</button>').join('');
  if(cc)cc.innerHTML=ed.ct.map((T,i)=>'<button class="dv-sw'+(ed.pal==='ct'&&ed.cti===i?' dv-on':'')+'" data-ict="'+i+'" title="'+E(T.n)+'" style="'+sw+';padding:0 8px 0 3px"><img src="'+T.p+'" style="width:20px;height:20px;image-rendering:pixelated;vertical-align:middle;margin-right:5px">'+E(T.n)+'</button>').join('')+
   (ed.pal==='ct'&&ed.ct[ed.cti]?'<button class="dv-b" data-ia="ctedit">Edit this tile</button>':'')+(ed.ct.length<8?'<button class="dv-b" data-ia="ctnew">+ New tile</button>':'')}
 function hint(){const h=document.getElementById('dvihint'),ed=I.ed;if(!h||!ed)return;const what=ed.pal==='tile'?TILES.find(t=>t[0]===ed.tile)[1]:ed.pal==='obj'?OBJN[OBJ[ed.obj]]:ed.pal==='npc'?'Person':ed.pal==='cv'?'Dungeon entrance':ed.pal==='zn'?'Monster zone':ed.pal==='ct'?((ed.ct[ed.cti]||{}).n||'Tile'):LM[ed.lmk][0];
  if(ed.pal==='zn'&&!['erase','pick','pan'].includes(ed.tool)){h.textContent='Drag a box where the monsters should live'+(ed.dirty?'  ·  unsaved changes':'');return}
  const T={erase:'Erasing objects and buildings',pan:'Drag to look around',pick:'Tap to pick a ground or object, or select a building',fill:ed.pal==='tile'?'Filling with '+what:'Fill paints ground: pick a ground type',
   scatter:'Scattering '+what+' ('+ed.dens+'%)',line:'Drawing a line of '+what,rect:'Drawing a box of '+what,ellipse:'Drawing an oval of '+what,paint:ed.pal==='lm'||ed.pal==='npc'||ed.pal==='cv'?'Tap to place a '+what.toLowerCase():'Painting '+what};
  h.textContent=(T[ed.tool]||'')+(ed.dirty?'  ·  unsaved changes':'')}
 // ---- the selected building / sign / chest ----
 const itemOpts=()=>['gold',...A.itemKeys()].map(k=>[k,k==='gold'?'Gold':INAME[k]]).sort((a,b)=>a[0]==='gold'?-1:b[0]==='gold'?1:a[1].localeCompare(b[1])).concat(window.SQCONTENT?SQCONTENT.tables().map(([k,n])=>[k,'🎲 '+n+' (loot table, rolls)']):[]);
 function selPanel(){const box=document.getElementById('dvisel'),ed=I.ed;if(!box)return;if(ed&&ed.sk!=='lm'&&ed.sel>=0){box.innerHTML=xPanel(ed);if(ed.sk==='npc')lookPrev();return}const L=ed&&ed.lm[ed.sel];if(!L){box.innerHTML='';return}
  let h='<div class="dv-card" style="margin:6px 0"><div class="dv-row"><b>'+E(LM[L.k][0])+'</b><span class="dv-mut">at '+L.x+', '+L.y+'</span><span class="dv-sp1"></span><button class="dv-b dv-bad" data-ia="lmdel">Remove</button><button class="dv-b" data-ia="lmdone">Done</button></div>';
  if(L.k==='sign')h+='<p><label class="dv-mut">Sign title<input type="text" data-ilf="n" maxlength="40" value="'+E(L.n)+'" placeholder="Welcome"></label></p><p><label class="dv-mut">What it says<textarea data-ilf="tx" maxlength="300" style="height:60px">'+E(L.tx)+'</textarea></label></p>';
  else if(L.k==='chest'){const lo=L.loot||(L.loot={}),O=itemOpts();h+='<p><label class="dv-mut">Chest name<input type="text" data-ilf="n" maxlength="40" value="'+E(L.n)+'" placeholder="Old sea chest"></label></p><div class="dv-mut">Inside (each player can take it once)</div>';
   for(const k in lo)h+='<div class="dv-row" style="margin:4px 0"><select data-iloot-k="'+E(k)+'">'+O.map(([v,n])=>'<option value="'+v+'"'+(v===k?' selected':'')+'>'+E(n)+'</option>').join('')+'</select><input type="number" min="1" max="100000" data-iloot-n="'+E(k)+'" value="'+(lo[k]|0)+'" style="width:90px"><button class="dv-b" data-iloot-x="'+E(k)+'">✕</button></div>';
   h+='<button class="dv-b" data-ia="lootadd">+ Add an item</button>'}
  else h+='<p><label class="dv-mut">What players see when they look at it (optional)<input type="text" data-ilf="tx" maxlength="300" value="'+E(L.tx)+'" placeholder="Leave empty for none"></label></p>';
  box.innerHTML=h+'</div>'}
 // people, dungeon entrances and monster zones
 const mobPick=(m,attr)=>'<div class="dv-chips" style="margin:4px 0">'+MOBN().map(([k,n])=>'<button class="dv-b'+(m.includes(k)?' dv-tl dv-on':'')+'" '+attr+'="'+k+'" style="font-size:11px;padding:4px 7px">'+E(n)+'</button>').join('')+'</div>';
 function xPanel(ed){const k=ed.sk,X=ed[k][ed.sel];if(!X)return'';const head=(t,at)=>'<div class="dv-card" style="margin:6px 0"><div class="dv-row"><b>'+t+'</b><span class="dv-mut">'+at+'</span><span class="dv-sp1"></span><button class="dv-b dv-bad" data-ia="xdel">Remove</button><button class="dv-b" data-ia="lmdone">Done</button></div>';
  if(k==='npc')return head('🧑 Person','at '+X.x+', '+X.y)+'<div class="dv-row" style="align-items:flex-start"><canvas id="dvinpc" width="64" height="80" style="width:64px;height:80px;image-rendering:pixelated;background:#2a3a2a;border-radius:6px"></canvas><div style="flex:1">'+
   '<p><label class="dv-mut">Name<input type="text" data-ixf="n" maxlength="24" value="'+E(X.n)+'" placeholder="Old Mara"></label></p><div class="dv-row" style="flex-wrap:wrap">'+
   LOOKF.map(([f,n,max])=>'<label class="dv-mut" style="font-size:11px">'+n+'<br><select data-ixl="'+f+'">'+Array.from({length:max},(_,i)=>'<option value="'+i+'"'+((X.lk[f]|0)===i?' selected':'')+'>'+(f==='hs'?HNAME[i]:f==='ht'?HATN[i]:i+1)+'</option>').join('')+'</select></label>').join('')+
   '</div></div></div><p><label class="dv-mut">What they say <small>(one line each time you talk to them, up to 8 lines)</small><textarea data-ixf="s" maxlength="1300" style="height:80px">'+E(X.s)+'</textarea></label></p>'+(window.SQCONTENT?'<p><label class="dv-mut">Job <small>(shops and quests are made in the Content tab)</small><br><select data-ixf="ro">'+SQCONTENT.roleOpts(X.ro)+'</select></label></p>':'')+'</div>';
  if(k==='cv')return head('🕳 Dungeon entrance','at '+X.x+', '+X.y)+'<p><label class="dv-mut">Name<input type="text" data-ixf="n" maxlength="40" value="'+E(X.n)+'" placeholder="Batroost Cave"></label></p>'+
   '<div class="dv-row"><label class="dv-mut">Looks like<br><select data-ixf="st">'+CAVES.map(([v,n])=>'<option value="'+v+'"'+(X.st===v?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'+
   '<label class="dv-mut">Floors<br><select data-ixf="f">'+[1,2,3,4,5,6].map(n=>'<option'+((X.f|0)===n?' selected':'')+'>'+n+'</option>').join('')+'</select></label></div>'+
   '<div class="dv-mut" style="margin-top:6px">Monsters inside <small>(up to 6; none picked = bats and slimes)</small></div>'+mobPick(X.m,'data-ixm')+'<p class="dv-mut">Players walk up into the opening to go down. Each floor is rebuilt every day, with ore and chests; the deeper floors are tougher. A mine has lots of ore.</p></div>';
  return head('👾 Monster zone',X.w+' × '+X.h+' at '+X.x+', '+X.y)+'<div class="dv-row"><label class="dv-mut">How many at once<input type="number" data-ixf="n" min="1" max="12" value="'+X.n+'" style="width:70px"></label>'+
   '<label class="dv-mut">How tough<br><select data-ixf="hp">'+TOUGHN.map((n,i)=>'<option value="'+i+'"'+((X.hp|0)===i?' selected':'')+'>'+n+'</option>').join('')+'</select></label></div>'+
   '<div class="dv-mut" style="margin-top:6px">Monsters <small>(up to 6)</small></div>'+mobPick(X.m,'data-ixm')+'<p class="dv-mut">They appear inside the box while a player is near, come back a little while after they\'re beaten, and drift home if they wander off.'+(X.m.length?'':' <b style="color:#f0a040">Pick at least one monster.</b>')+'</p></div>'}
 function lookPrev(){const c=document.getElementById('dvinpc'),ed=I.ed,X=ed&&ed.npc[ed.sel];if(!c||!X)return;const x=c.getContext('2d');x.clearRect(0,0,64,80);
  const k=JSON.stringify(X.lk),a=artOf('n:'+k,{t:'lm',k:'npc',name:'',look:X.lk});if(a){x.imageSmoothingEnabled=false;x.drawImage(a.c,32+(a.ox-8)*2,74+(a.oy-16)*2,a.c.width/a.s*2,a.c.height/a.s*2)}}
 // ---- your own ground tiles: a 32 x 32 picture editor ----
 const TPAL=['#181018','#ffffff','#5a3a20','#8a5a30','#c89858','#e8d0a0','#3c8a32','#6cc850','#2a5a8a','#58a8e8','#7a7a86','#b8b8c4','#c83830','#f0a030','#f8e060','#9a6ad8'];
 const TE={ed:null};// {i (tile index or -1), px: Uint32 colours (0 = clear), col, tool}
 function tileOpen(i){const ed=I.ed,T=i>=0?ed.ct[i]:null;TE.ed={i,n:T?T.n:'Tile '+(ed.ct.length+1),px:new Array(1024).fill('#6cc850'),col:'#3c8a32',tool:'pen',from:2};
  if(T){const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=32;c.height=32;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,32,32).data;
    for(let j=0;j<1024;j++)TE.ed.px[j]='#'+[d[j*4],d[j*4+1],d[j*4+2]].map(v=>v.toString(16).padStart(2,'0')).join('');tileDraw()};im.src=T.p}else tileFrom(2);tilePanel()}
 // start from one of the game's grounds (its real baked look)
 function tileFrom(v){try{const C=hdBakeR(0,0,()=>v),x=C.getContext?C.getContext('2d'):null;if(x){const d=x.getImageData(64,64,32,32).data;for(let j=0;j<1024;j++)TE.ed.px[j]='#'+[d[j*4],d[j*4+1],d[j*4+2]].map(q=>q.toString(16).padStart(2,'0')).join('')}}catch(e){}tileDraw()}
 function tilePanel(){const box=document.getElementById('dvitile'),T=TE.ed;if(!box)return;if(!T){box.innerHTML='';return}
  box.innerHTML='<div class="dv-card" style="margin:6px 0"><div class="dv-row"><b>'+(T.i>=0?'Edit tile':'New tile')+'</b><input type="text" data-itf="n" maxlength="24" value="'+E(T.n)+'" style="width:140px"><span class="dv-sp1"></span>'+(T.i>=0?'<button class="dv-b dv-bad" data-ia="ctdel">Delete tile</button>':'')+'<button class="dv-b" data-ia="ctcancel">Cancel</button><button class="dv-b dv-pri" data-ia="ctsave">Use this tile</button></div>'+
   '<div class="dv-row" style="align-items:flex-start;margin-top:6px"><canvas id="dvitc" width="256" height="256" style="width:256px;height:256px;image-rendering:pixelated;touch-action:none;cursor:crosshair;border:1px solid #2a3240"></canvas>'+
   '<div style="flex:1;min-width:160px"><div class="dv-chips">'+[['pen','Pencil'],['fill','Fill'],['pick','Pick colour']].map(([k,n])=>'<button class="dv-b'+(T.tool===k?' dv-tl dv-on':'')+'" data-itt="'+k+'">'+n+'</button>').join('')+'</div>'+
   '<div class="dv-pal" style="margin:8px 0">'+TPAL.map(c=>'<button class="dv-sw'+(T.col===c?' dv-on':'')+'" data-itc="'+c+'" style="background:'+c+'"></button>').join('')+'<input type="color" data-itf="col" value="'+T.col+'" style="width:34px;height:28px;padding:0;border:0;background:none"></div>'+
   '<label class="dv-mut">Start from a ground<br><select data-itf="from">'+TILES.filter(t=>t[0]).map(([v,n])=>'<option value="'+v+'"'+(T.from===v?' selected':'')+'>'+n+'</option>').join('')+'</select></label> <button class="dv-b" data-ia="ctfrom">Start over from it</button>'+
   '<p class="dv-mut">32 × 32 pixels, drawn on one tile of the island (twice as fine as the old tile art, the same as the game\'s ground).</p></div></div></div>';tileDraw()}
 function tileDraw(){const c=document.getElementById('dvitc'),T=TE.ed;if(!c||!T)return;const x=c.getContext('2d');for(let j=0;j<1024;j++){x.fillStyle=T.px[j];x.fillRect((j%32)*8,((j/32)|0)*8,8,8)}}
 function tileUse(e,first){const T=TE.ed,c=document.getElementById('dvitc');if(!T||!c)return;const r=c.getBoundingClientRect(),X=Math.floor((e.clientX-r.left)/r.width*32),Y=Math.floor((e.clientY-r.top)/r.height*32);if(X<0||Y<0||X>31||Y>31)return;const j=Y*32+X;
  if(T.tool==='pick'){if(first){T.col=T.px[j];T.tool='pen';tilePanel()}return}
  if(T.tool==='fill'){if(!first)return;const from=T.px[j],to=T.col;if(from===to)return;const st=[j];while(st.length){const q=st.pop();if(T.px[q]!==from)continue;T.px[q]=to;const qx=q%32;if(qx>0)st.push(q-1);if(qx<31)st.push(q+1);if(q>=32)st.push(q-32);if(q<992)st.push(q+32)}tileDraw();return}
  T.px[j]=T.col;tileDraw()}
 function tileSave(){const T=TE.ed,ed=I.ed;if(!T||!ed)return;const c=document.createElement('canvas');c.width=32;c.height=32;const x=c.getContext('2d');for(let j=0;j<1024;j++){x.fillStyle=T.px[j];x.fillRect(j%32,(j/32)|0,1,1)}
  const url=c.toDataURL('image/png');if(!LIFE().okUrl(url)){toast('That tile is too detailed to save. Use fewer colours.');return}snap();const t={n:(T.n||'Tile').trim().slice(0,24)||'Tile',p:url};
  if(T.i>=0)ed.ct[T.i]=t;else{ed.ct.push(t);ed.cti=ed.ct.length-1}ed.pal='ct';if(['erase','pick','pan'].includes(ed.tool))ed.tool='paint';TE.ed=null;ed.ck=null;TIMG.clear();tilePanel();pals();tools();hint();paint(true)}
 const TIMG=new Map();function timg(u){let m=TIMG.get(u);if(!m){m=new Image();m.onload=()=>{if(I.ed)paint(true)};m.src=u;TIMG.set(u,m)}return m.complete&&m.naturalWidth?m:null}
 // ---- where it lies on the sea chart ----
 function chart(){const c=document.getElementById('dvichart'),ed=I.ed;if(!c||!ed)return;const x=c.getContext('2d'),S2=c.width/360;x.fillStyle='#1d4f8c';x.fillRect(0,0,c.width,c.height);
  x.strokeStyle='rgba(255,255,255,.08)';for(let k=0;k<=360;k+=40){x.beginPath();x.moveTo(k*S2,0);x.lineTo(k*S2,c.height);x.moveTo(0,k*S2);x.lineTo(c.width,k*S2);x.stroke()}
  x.font='600 10px system-ui';x.textAlign='center';for(const id in WM_POS){if(id===ed.id)continue;const[px,py]=WM_POS[id];const R=WORLD_REGIONS[id];x.fillStyle=id==='hollow'?'#6cc850':'#c8b890';x.beginPath();x.arc(px*S2,py*S2,id==='hollow'?9:5,0,7);x.fill();x.fillStyle='#e8eef8';x.fillText(R?R.name:id,px*S2,py*S2-9)}
  const m=ed.meta,pos=m.mx!=null?[m.mx,m.my]:(A.ISL_POS[m.dir]||[338,180]);x.fillStyle='#f8d848';x.beginPath();x.arc(pos[0]*S2,pos[1]*S2,7,0,7);x.fill();x.strokeStyle='#181018';x.lineWidth=2;x.stroke();x.fillStyle='#fff';x.fillText(m.n||'Your island',pos[0]*S2,pos[1]*S2+18)}
 // ---- drawing the map ----
 const zmax=ed=>Math.max(1,Math.floor(MAXPX/Math.max(ed.w,ed.h)));
 function cell(){const ed=I.ed,c=document.getElementById('dvi');if(!c)return 4;if(!ed.fit){const box=c.parentElement.parentElement.getBoundingClientRect();ed.fit=Math.max(1,Math.min((box.width-8)/ed.w,(window.innerHeight*.62-8)/ed.h))}
  if(!ed.zoom)ed.zoom=1;return Math.max(1,Math.min(zmax(ed),Math.round(ed.fit*ed.zoom)))}
 function cellDraw(x,i,z){const ed=I.ed,X=(i%ed.w)*z,Y=Math.floor(i/ed.w)*z;if(ed.prot&&ed.prot[i]){x.fillStyle=COL[ed.t[i]];x.fillRect(X,Y,z,z);x.fillStyle='rgba(20,20,30,.45)';x.fillRect(X,Y,z,z);if(z>=4){x.fillStyle='rgba(255,255,255,.25)';x.fillRect(X,Y,1,1)}return}x.fillStyle=COL[ed.t[i]];x.fillRect(X,Y,z,z);const cv=ed.c[i];if(cv!==NONE&&ed.ct[cv]){const m=timg(ed.ct[cv].p);if(m){x.imageSmoothingEnabled=false;x.drawImage(m,X,Y,z,z)}else{x.fillStyle='#e0a0f0';x.fillRect(X+z/4,Y+z/4,z/2,z/2)}}const o=ed.o[i];
  if(o!==NONE){x.fillStyle=OBJC[OBJ[o]];if(z>=6){x.beginPath();x.arc(X+z/2,Y+z/2,z*.36,0,7);x.fill();x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=1;x.stroke()}else{const s=Math.max(1,z-1);x.fillRect(X,Y,s,s)}}}
 function lmDrawMap(x,L,z,sel){const[w,h]=lmSize(L.k);x.fillStyle=L.k==='chest'?'#e0a030':L.k==='sign'?'#c89858':'#8a7a6a';x.fillRect(L.x*z,L.y*z,w*z,h*z);x.strokeStyle=sel?'#f8d848':'rgba(0,0,0,.6)';x.lineWidth=sel?Math.max(2,z/4):1;x.strokeRect(L.x*z+.5,L.y*z+.5,w*z-1,h*z-1);
  if(z>=10){x.fillStyle='#fff';x.font='700 '+Math.min(12,Math.round(z*.6))+'px system-ui';x.textBaseline='top';x.fillText(L.k==='chest'?'$':L.k==='sign'?'!':LM[L.k][0][0],L.x*z+2,L.y*z+1)}}
 function xDrawMap(x,z,art){const ed=I.ed;
  ed.zn.forEach((Z,k)=>{x.fillStyle='rgba(216,56,48,.22)';x.fillRect(Z.x*z,Z.y*z,Z.w*z,Z.h*z);x.strokeStyle=ed.sk==='zn'&&ed.sel===k?'#f8d848':'rgba(240,80,64,.9)';x.lineWidth=ed.sk==='zn'&&ed.sel===k?Math.max(2,z/4):Math.max(1,z/8);x.setLineDash([Math.max(2,z/2),Math.max(2,z/3)]);x.strokeRect(Z.x*z+.5,Z.y*z+.5,Z.w*z-1,Z.h*z-1);x.setLineDash([]);
   if(z>=4){x.fillStyle='#fff';x.font='700 '+Math.max(9,Math.min(13,z))+'px system-ui';x.textBaseline='top';x.fillText('👾 '+Z.n+' × '+(Z.m.map(m=>(LIFE().MOBS[m]||{}).n||m).join(', ')||'?'),Z.x*z+3,Z.y*z+2)}});
  ed.cv.forEach((V,k)=>{x.fillStyle='#4a423c';x.fillRect((V.x-1)*z,(V.y-1)*z,3*z,2*z);x.fillStyle='#0c0a10';x.fillRect(V.x*z,(V.y-.6)*z,z,1.6*z);x.strokeStyle=ed.sk==='cv'&&ed.sel===k?'#f8d848':'rgba(0,0,0,.6)';x.lineWidth=ed.sk==='cv'&&ed.sel===k?Math.max(2,z/4):1;x.strokeRect((V.x-1)*z+.5,(V.y-1)*z+.5,3*z-1,2*z-1)});
  if(!art)ed.npc.forEach((Q,k)=>{x.fillStyle='#f0c890';x.beginPath();x.arc(Q.x*z+z/2,Q.y*z+z/2,Math.max(2,z*.42),0,7);x.fill();x.strokeStyle=ed.sk==='npc'&&ed.sel===k?'#f8d848':'#181018';x.lineWidth=ed.sk==='npc'&&ed.sel===k?Math.max(2,z/4):1;x.stroke();
   if(z>=8){x.fillStyle='#fff';x.font='700 '+Math.min(12,Math.round(z*.7))+'px system-ui';x.textBaseline='bottom';x.textAlign='center';x.fillText(Q.n||'Person',Q.x*z+z/2,Q.y*z-1);x.textAlign='left'}})}
 function pierMark(x,c,z){x.fillStyle='rgba(248,216,72,.9)';const p=I.ed.meta.pier,W=c.width,H=c.height,s=Math.max(4,z*2);
  if(p==='e')x.fillRect(W-s,H/2-s*2,s,s*4);else if(p==='w')x.fillRect(0,H/2-s*2,s,s*4);else if(p==='n')x.fillRect(W/2-s*2,0,s*4,s);else x.fillRect(W/2-s*2,H-s,s*4,s)}
 function paint(full,list){const c=document.getElementById('dvi'),ed=I.ed;if(!c||!ed)return;const z=down&&ed.z?ed.z:(ed.z=cell());
  if(full||c.width!==ed.w*z){c.width=ed.w*z;c.height=ed.h*z;const o=document.getElementById('dvio');if(o){o.width=c.width;o.height=c.height}list=null}const x=c.getContext('2d');
  if(ed.view==='art'&&!list){artPaint();return}
  if(list){for(const i of list)cellDraw(x,i,z);if(ed.view==='art')dirtyChunks(ed,list);return}
  for(let i=0;i<ed.t.length;i++)cellDraw(x,i,z);ed.lm.forEach((L,k)=>lmDrawMap(x,L,z,ed.sk==='lm'&&k===ed.sel));xDrawMap(x,z);pierMark(x,c,z);
  if(ed.recenter){ed.recenter=0;const cv=document.getElementById('dvicv');cv.scrollLeft=(c.width-cv.clientWidth)/2;cv.scrollTop=(c.height-cv.clientHeight)/2}}
 // real look: flat colours first, then the baked ground arrives piece by piece (what's on screen first), objects on top
 let artT=0;function artPaint(){const c=document.getElementById('dvi'),ed=I.ed;if(!c||!ed)return;const z=ed.z,x=c.getContext('2d'),sc=z/32;ed.ck=ed.ck||new Map();x.imageSmoothingEnabled=z<16;
  const cv=document.getElementById('dvicv'),vx0=cv?cv.scrollLeft/z:0,vy0=cv?cv.scrollTop/z:0,vx1=vx0+(cv?cv.clientWidth:c.width)/z,vy1=vy0+(cv?cv.clientHeight:c.height)/z;
  const KX=Math.ceil(ed.w/8),KY=Math.ceil(ed.h/8),need=[];
  for(let ky=0;ky<KY;ky++)for(let kx=0;kx<KX;kx++){const k=kx+','+ky,ch=ed.ck.get(k);if(ch)x.drawImage(ch,kx*8*z,ky*8*z,8*z,8*z);else{for(let y=ky*8;y<Math.min(ed.h,ky*8+8);y++)for(let xx=kx*8;xx<Math.min(ed.w,kx*8+8);xx++){x.fillStyle=COL[ed.t[y*ed.w+xx]];x.fillRect(xx*z,y*z,z,z)}
   if(ch===undefined)need.push([kx,ky,Math.hypot(kx*8+4-(vx0+vx1)/2,ky*8+4-(vy0+vy1)/2)])}}
  for(let i=0;i<ed.c.length;i++){const v=ed.c[i];if(v===NONE||!ed.ct[v])continue;const m=timg(ed.ct[v].p);if(m)x.drawImage(m,(i%ed.w)*z,Math.floor(i/ed.w)*z,z,z)}
  // objects and buildings, back to front
  const things=[];ed.npc.forEach(Q=>things.push([Q.y+1,Q.x,Q.y,'npc',2,Q]));for(let i=0;i<ed.o.length;i++)if(ed.o[i]!==NONE)things.push([Math.floor(i/ed.w)+1,i%ed.w,Math.floor(i/ed.w),OBJ[ed.o[i]],0]);
  ed.lm.forEach((L,k)=>{const[,h]=lmSize(L.k);things.push([L.y+h,L.x,L.y,L.k,1,k])});things.sort((a,b)=>a[0]-b[0]);
  for(const[,tx,ty,k,isLm,li]of things){if(isLm===2){const a=artOf('n:'+JSON.stringify(li.lk),{t:'lm',k:'npc',name:'',look:li.lk});if(a)x.drawImage(a.c,(tx*16+a.ox)*z/16,(ty*16+a.oy)*z/16,a.c.width/a.s*z/16,a.c.height/a.s*z/16);continue}
   const a=isLm?lmArt(k):objArt(k);if(a)x.drawImage(a.c,(tx*16+a.ox)*z/16,(ty*16+a.oy)*z/16,a.c.width/a.s*z/16,a.c.height/a.s*z/16);
   else if(isLm)lmDrawMap(x,ed.lm[li],z,false);else{x.fillStyle=OBJC[k];x.fillRect(tx*z+z/4,ty*z+z/4,z/2,z/2)}
   if(isLm&&ed.sk==='lm'&&li===ed.sel){const[w,h]=lmSize(k);x.strokeStyle='#f8d848';x.lineWidth=Math.max(2,z/6);x.strokeRect(tx*z,ty*z,w*z,h*z)}}
  xDrawMap(x,z,1);pierMark(x,c,z);
  if(ed.recenter){ed.recenter=0;cv.scrollLeft=(c.width-cv.clientWidth)/2;cv.scrollTop=(c.height-cv.clientHeight)/2}
  if(need.length){need.sort((a,b)=>a[2]-b[2]);cancelAnimationFrame(artT);artT=requestAnimationFrame(()=>{if(I.ed!==ed||ed.view!=='art'||down)return;const t0=performance.now();
   for(const[kx,ky]of need){chunk(ed,kx,ky);if(performance.now()-t0>24)break}artPaint()})}}
 // ---- editing ----
 const xs=ed=>JSON.stringify({lm:ed.lm,npc:ed.npc,cv:ed.cv,zn:ed.zn,ct:ed.ct});const xl=(ed,s)=>{const o=JSON.parse(s);ed.lm=o.lm;ed.npc=o.npc||[];ed.cv=o.cv||[];ed.zn=o.zn||[];ed.ct=o.ct||[]};
 const snap=()=>{const ed=I.ed;ed.undo.push({t:ed.t.slice(),o:ed.o.slice(),c:ed.c.slice(),lm:xs(ed)});if(ed.undo.length>40)ed.undo.shift();ed.redo=[];ed.dirty=true;ed.check=null};
 function undo(r){const ed=I.ed;if(!ed)return;const a=r?ed.redo:ed.undo,b=r?ed.undo:ed.redo,s=a.pop();if(!s)return;b.push({t:ed.t.slice(),o:ed.o.slice(),c:ed.c.slice(),lm:xs(ed)});ed.t=s.t;ed.o=s.o;ed.c=s.c;xl(ed,s.lm);
  if(ed.sel>=(ed[ed.sk]||[]).length)ed.sel=-1;if(ed.cti>=ed.ct.length){ed.cti=0;if(ed.pal==='ct')ed.pal='tile'}pals();ed.dirty=true;ed.ck=null;selPanel();paint(true);hint()}
 function at(e){const c=document.getElementById('dvi'),r=c.getBoundingClientRect(),z=r.width/I.ed.w,X=Math.floor((e.clientX-r.left)/z),Y=Math.floor((e.clientY-r.top)/z);return X>=0&&Y>=0&&X<I.ed.w&&Y<I.ed.h?Y*I.ed.w+X:-1}
 const lmAt=(ed,x,y)=>ed.lm.findIndex(L=>{const[w,h]=lmSize(L.k);return x>=L.x&&x<L.x+w&&y>=L.y&&y<L.y+h});
 // what else is on a tile: a person, a dungeon entrance (3 wide, 2 tall around its opening) or a monster zone
 function xAt(ed,x,y){let k=ed.npc.findIndex(Q=>Q.x===x&&Q.y===y);if(k>=0)return['npc',k];k=ed.cv.findIndex(V=>x>=V.x-1&&x<=V.x+1&&y>=V.y-1&&y<=V.y);if(k>=0)return['cv',k];
  for(let j=ed.zn.length-1;j>=0;j--){const Z=ed.zn[j];if(x>=Z.x&&y>=Z.y&&x<Z.x+Z.w&&y<Z.y+Z.h)return['zn',j]}return null}
 function xPlace(i){const ed=I.ed,x=i%ed.w,y=(i/ed.w)|0,k=ed.pal;if(lmAt(ed,x,y)>=0||(xAt(ed,x,y)||[])[0]==='npc'||(xAt(ed,x,y)||[])[0]==='cv'){toast('Something is already there.');return}
  if(k==='cv'&&(x<1||y<1||x>=ed.w-1||y>=ed.h-1)){toast('Not enough room there.');return}if(k==='npc'&&ed.npc.length>=40){toast('That\'s the most people one island can hold (40).');return}if(k==='cv'&&ed.cv.length>=6){toast('That\'s the most dungeons one island can hold (6).');return}
  snap();if(k==='npc')ed.npc.push({x,y,n:'',lk:{sk:Math.floor(Math.random()*5),hs:Math.floor(Math.random()*4),hc:Math.floor(Math.random()*8),sh:Math.floor(Math.random()*8),pn:Math.floor(Math.random()*6),ht:0,hcol:0,so:0},s:''});
  else{ed.cv.push({x,y,n:'',st:'rock',f:3,m:['bat','slime']});for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const j=(y+b)*ed.w+x+a;if(j>=0&&j<ed.o.length)ed.o[j]=NONE}}
  ed.sk=k;ed.sel=ed[k].length-1;selPanel();paint(true);hint();if(k==='npc')setTimeout(()=>{const f=document.querySelector('#dvisel [data-ixf="n"]');if(f)f.focus()},50)}
 function setCell(j,ch,rnd){const ed=I.ed;if(ed.prot&&ed.prot[j])return;if(rnd&&Math.random()*100>=ed.dens)return;
  if(ed.tool==='erase'){if(ed.o[j]!==NONE){ed.o[j]=NONE;ch.push(j)}if(ed.c[j]!==NONE){ed.c[j]=NONE;ch.push(j)}const li=lmAt(ed,j%ed.w,(j/ed.w)|0);if(li>=0){ed.lm.splice(li,1);if(ed.sk==='lm'){if(ed.sel===li)ed.sel=-1;else if(ed.sel>li)ed.sel--}ch.lm=1}
   const xa=xAt(ed,j%ed.w,(j/ed.w)|0);if(xa&&(xa[0]!=='zn'||ed.pal==='zn')){ed[xa[0]].splice(xa[1],1);if(ed.sk===xa[0]){if(ed.sel===xa[1])ed.sel=-1;else if(ed.sel>xa[1])ed.sel--}ch.lm=1}return}
  if(ed.pal==='ct'){if(!ed.ct[ed.cti])return;ed.c[j]=ed.cti;ch.push(j);return}
  if(ed.pal==='tile'){ed.t[j]=ed.tile;if(!WALK[ed.tile])ed.o[j]=NONE;ch.push(j)}else if(ed.pal==='obj'){if(!WALK[ed.t[j]]||(rnd&&ed.o[j]!==NONE))return;ed.o[j]=ed.obj;ch.push(j)}}
 function stamp(i,ch){const ed=I.ed,b=ed.brush,x0=i%ed.w,y0=Math.floor(i/ed.w),r=(b-1)/2,rnd=ed.tool==='scatter';
  for(let y=Math.round(y0-r);y<=Math.round(y0+r);y++)for(let x=Math.round(x0-r);x<=Math.round(x0+r);x++){if(x<0||y<0||x>=ed.w||y>=ed.h)continue;if(b>=3&&Math.hypot(x-x0,y-y0)>r+.5)continue;const j=y*ed.w+x;
   if(rnd&&ch.seen){if(ch.seen.has(j))continue;ch.seen.add(j)}setCell(j,ch,rnd)}}
 function fillAt(i){const ed=I.ed,from=ed.t[i],to=ed.tile;if(from===to)return[];const ch=[],st=[i],seen=new Uint8Array(ed.t.length);
  while(st.length){const j=st.pop();if(seen[j]||ed.t[j]!==from)continue;seen[j]=1;ed.t[j]=to;if(!WALK[to])ed.o[j]=NONE;ch.push(j);const x=j%ed.w;if(x>0)st.push(j-1);if(x<ed.w-1)st.push(j+1);if(j>=ed.w)st.push(j-ed.w);if(j<ed.t.length-ed.w)st.push(j+ed.w)}return ch}
 function lineCells(a,b,w,fn){let x0=a%w,y0=Math.floor(a/w);const x1=b%w,y1=Math.floor(b/w),dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let er=dx+dy;
  for(;;){fn(y0*w+x0);if(x0===x1&&y0===y1)break;const e2=2*er;if(e2>=dy){er+=dy;x0+=sx}if(e2<=dx){er+=dx;y0+=sy}}}
 function shapeCells(kind,a,b){const ed=I.ed,w=ed.w,out=[];if(kind==='line'){lineCells(a,b,w,i=>out.push(i));return out}
  const x0=Math.min(a%w,b%w),x1=Math.max(a%w,b%w),y0=Math.min(a/w|0,b/w|0),y1=Math.max(a/w|0,b/w|0),cx=(x0+x1)/2,cy=(y0+y1)/2,rx=(x1-x0)/2+.5,ry=(y1-y0)/2+.5;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(kind==='rect'||((x-cx)/rx)**2+((y-cy)/ry)**2<=1)out.push(y*w+x);return out}
 function overlay(cells){const o=document.getElementById('dvio'),ed=I.ed;if(!o)return;const x=o.getContext('2d'),z=ed.z;x.clearRect(0,0,o.width,o.height);if(!cells)return;
  x.fillStyle=ed.pal==='tile'?COL[ed.tile]:ed.pal==='obj'?OBJC[OBJ[ed.obj]]:ed.pal==='zn'?'#e04030':'#f8d848';x.globalAlpha=.6;for(const i of cells)x.fillRect((i%ed.w)*z,Math.floor(i/ed.w)*z,z,z);x.globalAlpha=1}
 function placeLm(i){const ed=I.ed,x=i%ed.w,y=(i/ed.w)|0,[w,h]=lmSize(ed.lmk);if(x+w>ed.w||y+h>ed.h){toast('Not enough room there.');return}
  for(let b=0;b<h;b++)for(let a=0;a<w;a++)if(lmAt(ed,x+a,y+b)>=0){toast('Something is already built there.');return}
  snap();const L={k:ed.lmk,x,y,n:'',tx:''};if(L.k==='chest')L.loot={gold:50};ed.lm.push(L);ed.sk='lm';ed.sel=ed.lm.length-1;for(let b=0;b<h;b++)for(let a=0;a<w;a++)ed.o[(y+b)*ed.w+x+a]=NONE;
  selPanel();paint(true);hint();if(L.k==='sign'||L.k==='chest')setTimeout(()=>{const f=document.querySelector('#dvisel [data-ilf="n"]');if(f)f.focus()},50)}
 function use(e,first){const ed=I.ed,i=at(e);if(i<0){last=-1;return}
  if(ed.tool==='pick'){if(!first)return;const li=lmAt(ed,i%ed.w,(i/ed.w)|0);if(li>=0){ed.sk='lm';ed.sel=li;selPanel();paint(true);return}
   const xa=xAt(ed,i%ed.w,(i/ed.w)|0);if(xa){ed.sk=xa[0];ed.sel=xa[1];selPanel();paint(true);return}
   if(ed.c[i]!==NONE&&ed.ct[ed.c[i]]){ed.pal='ct';ed.cti=ed.c[i]}else if(ed.o[i]!==NONE){ed.pal='obj';ed.obj=ed.o[i]}else{ed.pal='tile';ed.tile=ed.t[i]}ed.tool='paint';ed.sel=-1;selPanel();tools();pals();hint();paint(true);return}
  if(ed.pal==='lm'&&ed.tool!=='erase'){if(first)placeLm(i);return}
  if((ed.pal==='npc'||ed.pal==='cv')&&ed.tool!=='erase'){if(first)xPlace(i);return}
  if(ed.pal==='zn'&&ed.tool!=='erase'){if(first)shape={a:i,b:i,zn:1};else if(shape)shape.b=i;if(shape)overlay(shapeCells('rect',shape.a,shape.b));return}
  if(ed.tool==='fill'){if(!first)return;if(ed.pal!=='tile'){toast('Fill paints ground. Pick a ground type first.');return}snap();const ch=fillAt(i);paint(false,ch);hint();return}
  if(ed.tool==='line'||ed.tool==='rect'||ed.tool==='ellipse'){if(first)shape={a:i,b:i};else shape.b=i;overlay(shapeCells(ed.tool,shape.a,shape.b));return}
  if(first){snap();last=-1;ed.stroke=[];ed.stroke.seen=new Set()}const ch=ed.stroke||[];
  if(last<0)stamp(i,ch);else lineCells(last,i,ed.w,j=>stamp(j,ch));
  last=i;if(ch.lm){ch.lm=0;paint(true)}else paint(false,ch.splice(0))}
 function endShape(){const ed=I.ed;if(!shape||!ed)return;if(shape.zn){const a=shape.a,b=shape.b,w=ed.w;shape=null;overlay(null);const x0=Math.min(a%w,b%w),y0=Math.min(a/w|0,b/w|0),x1=Math.max(a%w,b%w),y1=Math.max(a/w|0,b/w|0);
   if(x1-x0<2||y1-y0<2){toast('Drag a bigger box (at least 3 × 3 tiles).');return}if(ed.zn.length>=24){toast('That\'s the most monster zones one island can hold (24).');return}
   snap();ed.zn.push({x:x0,y:y0,w:x1-x0+1,h:y1-y0+1,n:4,m:[],hp:0});ed.sk='zn';ed.sel=ed.zn.length-1;selPanel();paint(true);hint();return}
  const cells=shapeCells(ed.tool,shape.a,shape.b);shape=null;overlay(null);snap();const ch=[];
  if(ed.tool==='line'&&ed.brush>1){const s=new Set();for(const i of cells){const tmp=[];const b0=ed.tool;stamp(i,tmp);tmp.forEach(j=>s.add(j))}ch.push(...s)}else for(const i of cells)setCell(i,ch,false);
  paint(true);hint()}
 function beaches(){const ed=I.ed,w=ed.w,h=ed.h,ch=[];snap();const water=i=>ed.t[i]===0,LAND=new Set([2,7,13,14,10,5,8]);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!LAND.has(ed.t[i]))continue;if((x>0&&water(i-1))||(x<w-1&&water(i+1))||(y>0&&water(i-w))||(y<h-1&&water(i+w))){ch.push(i)}}
  for(const i of ch)ed.t[i]=ed.t[i]===13||ed.t[i]===10||ed.t[i]===8?8:1;if(ed.ck)dirtyChunks(ed,ch);paint(true);toast(ch.length?'Added '+ch.length+' tiles of beach.':'No land touches the water.');hint()}
 // ---- checking: build it exactly like the game will, and walk it from the pier ----
 function check(){const ed=I.ed,d=toData(ed);let msg;
  try{const D={id:ed.id,width:d.w+A.ISL_PAD*2,height:d.h+A.ISL_PAD*2,seed:1,generationVersion:1},G=rgRunSync(A.islandGen(d)(D)),W=D.width,H=D.height;
   const solid=G.solid,seen=new Uint8Array(W*H),s0=G.spawn[1]*W+G.spawn[0],st=[s0];seen[s0]=1;let n=0,land=0;
   while(st.length){const i=st.pop();n++;const x=i%W,y=(i/W)|0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b,j=Y*W+X;if(X<0||Y<2||X>=W||Y>=H||seen[j]||solid.has(j))continue;seen[j]=1;st.push(j)}}
   for(let i=0;i<W*H;i++)if(G.tiles[i]&&RG_WALK[G.tiles[i]]&&!solid.has(i))land++;
   const objs=G.items.filter(it=>it.t==='_obj').length,lms=G.items.filter(it=>it.t==='lm'&&it.k!=='npc').length,pct=land?Math.round(n/land*100):0;
   // things players use (signs, chests) must be reachable from the pier
   const cut=G.items.filter(it=>it.use&&it.use!=='regdock').filter(it=>{for(let b=-1;b<=(it.h||1);b++)for(let a=-1;a<=(it.w||1);a++){const X=it.x+a,Y=it.y+b;if(X>=0&&Y>=0&&X<W&&Y<H&&seen[Y*W+X])return false}return true});
   const lost=ed.lm.length-lms+ed.npc.length-G.items.filter(it=>it.k==='npc').length+ed.cv.length-G.items.filter(it=>it.t==='icvdoor').length,emptyZ=ed.zn.filter(Z=>!Z.m.length).length;
   msg='✓ The pier fits on the '+SIDES.find(s=>s[0]===ed.meta.pier)[1].toLowerCase()+' coast. Players can walk to '+n.toLocaleString()+' tiles from it ('+pct+'% of the open ground)'+(pct<90?'. Some ground is cut off by water, mountains or objects':'')+'. '+objs+' objects, '+lms+' buildings and props.'+
    (cut.length?' ⚠ '+cut.length+' sign'+(cut.length>1?'s or chests':' or chest')+' can\'t be reached from the pier.':'')+(lost>0?' ⚠ '+lost+' building'+(lost>1?'s, people or entrances are':', person or entrance is')+' too close to the pier and will be left out.':'')+(emptyZ?' ⚠ '+emptyZ+' monster zone'+(emptyZ>1?'s have':' has')+' no monsters picked.':'')+
    (ed.npc.length||ed.cv.length||ed.zn.length?' '+ed.npc.length+' people, '+ed.cv.length+' dungeon'+(ed.cv.length===1?'':'s')+', '+ed.zn.length+' monster zone'+(ed.zn.length===1?'':'s')+'.':'')}
  catch(e){msg='✗ '+(/pier/.test(e.message)?'There\'s no room for a pier on the '+SIDES.find(s=>s[0]===ed.meta.pier)[1].toLowerCase()+' coast: it needs land facing open sea near the middle of that side. Try another side, or paint some coast there.':'This island can\'t be built: '+e.message)}
  ed.check=msg;const c=document.getElementById('dvicheck');if(c)c.textContent=msg;return msg.startsWith('✓')}
 async function save(){const ed=I.ed;if(!ed)return;if(ed.bi)return saveBuiltin();if(!check()){toast('Saved anyway, but players can\'t sail there until the check passes.')}
  const d=toData(ed);isl()[ed.id]=d;try{await dset('draft/islands/'+ed.id,d);ed.dirty=false;toast('Saved to draft. Publish it from the Publish tab.')}catch(e){fail(e)}
  if(A.previewing)A.preview(S.draft);redraw()}
 function resize(){const ed=I.ed,iw=document.querySelector('#dvs [data-im="w"]'),ih=document.querySelector('#dvs [data-im="h"]'),w=Math.max(20,Math.min(200,iw.value|0)),h=Math.max(20,Math.min(200,ih.value|0));
  if(w===ed.w&&h===ed.h)return;snap();const t=new Uint8Array(w*h),o=new Uint8Array(w*h).fill(NONE),ox=Math.floor((w-ed.w)/2),oy=Math.floor((h-ed.h)/2);
  const c=new Uint8Array(w*h).fill(NONE);for(let y=0;y<ed.h;y++)for(let x=0;x<ed.w;x++){const X=x+ox,Y=y+oy;if(X<0||Y<0||X>=w||Y>=h)continue;t[Y*w+X]=ed.t[y*ed.w+x];o[Y*w+X]=ed.o[y*ed.w+x];c[Y*w+X]=ed.c[y*ed.w+x]}ed.c=c;
  const inb=(X,Y)=>X>=0&&Y>=0&&X<w&&Y<h;ed.npc=ed.npc.map(Q=>({...Q,x:Q.x+ox,y:Q.y+oy})).filter(Q=>inb(Q.x,Q.y));ed.cv=ed.cv.map(V=>({...V,x:V.x+ox,y:V.y+oy})).filter(V=>V.x>=1&&V.y>=1&&V.x<w-1&&V.y<h-1);
  ed.zn=ed.zn.map(Z=>{const x0=Math.max(0,Z.x+ox),y0=Math.max(0,Z.y+oy),x1=Math.min(w,Z.x+ox+Z.w),y1=Math.min(h,Z.y+oy+Z.h);return{...Z,x:x0,y:y0,w:x1-x0,h:y1-y0}}).filter(Z=>Z.w>=1&&Z.h>=1);
  ed.lm=ed.lm.map(L=>({...L,x:L.x+ox,y:L.y+oy})).filter(L=>{const[a,b]=lmSize(L.k);return L.x>=0&&L.y>=0&&L.x+a<=w&&L.y+b<=h});ed.sel=-1;
  ed.undo=[];ed.redo=[];ed.w=w;ed.h=h;ed.t=t;ed.o=o;ed.fit=0;ed.ck=null;ed.recenter=1;redraw()}
 // a full redraw that keeps where you were looking on the map
 function redraw(){const cv=document.getElementById('dvicv'),ed=I.ed;if(cv&&ed&&!ed.recenter){ed.sx=cv.scrollLeft;ed.sy=cv.scrollTop}API.draw();const c2=document.getElementById('dvicv');if(c2&&ed&&ed.sx!=null){c2.scrollLeft=ed.sx;c2.scrollTop=ed.sy;ed.sx=null}}
 // built-in islands: the editor starts from the island as the game makes it, with the draft's changes on top
 const EDB=()=>A.islandEdits;
 function openBuiltin(rid){const X=EDB();if(!X)return;let G;try{G=X.base(rid)}catch(e){toast('Can\'t open that island: '+e.message);return}
  const D=WORLD_REGIONS[rid],W=D.width,H=D.height,N=W*H,t=new Uint8Array(N),o=new Uint8Array(N).fill(NONE);for(let i=0;i<N;i++)t[i]=G.tiles[i]|0;
  for(const it of G.items){if(it.t!=='_obj'||!it.o)continue;const k=OBJ.indexOf(it.o.t+(it.o.v?':'+it.o.v:''));const k2=k>=0?k:OBJ.indexOf(it.o.t);if(k2>=0)o[it.y*W+it.x]=k2}
  const base={t:t.slice(),o:o.slice()},d0=isl()['ed_'+rid];
  let tt='',oo='';for(let i=0;i<N;i++){tt+=HEX[t[i]];oo+=o[i]===NONE?'.':PXC[o[i]]}
  const ed=fromData('ed_'+rid,{w:W,h:H,t:A.pack?A.pack(tt):tt,o:A.pack?A.pack(oo):oo,lm:d0&&d0.lm,npc:d0&&d0.npc,cv:d0&&d0.cv,zn:d0&&d0.zn,ct:d0&&d0.ct,c:d0&&d0.c,n:D.name});
  if(d0)for(const[i,ti,c]of X.parse(d0)){if(i<0||i>=N)continue;if(ti>=0)ed.t[i]=ti;if(c==='.')ed.o[i]=NONE;else if(c){const k=PXC.indexOf(c);if(k>=0&&k<OBJ.length)ed.o[i]=k}}
  ed.keep=G._keep||null;ed.ul=!!(d0&&d0.ul);ed.prot=ed.ul?null:ed.keep;ed.bi=rid;ed.base=base;ed.meta.n=D.name;I.sel='ed_'+rid;I.ed=ed;ed.recenter=1;S.arm=null;API.draw()}
 async function saveBuiltin(){const ed=I.ed,b=ed.base,parts=[];for(let i=0;i<ed.t.length;i++){const dt=ed.t[i]!==b.t[i],dob=ed.o[i]!==b.o[i];if(!dt&&!dob)continue;parts.push(i+'.'+(dt?HEX[ed.t[i]]:'')+'.'+(dob?(ed.o[i]===NONE?'.':PXC[ed.o[i]]):''))}
  const full=toData(ed),d={bi:ed.bi,n:WORLD_REGIONS[ed.bi].name,w:ed.w,h:ed.h,x:parts.join(';')};for(const k of['lm','npc','cv','zn','ct'])if(full[k]&&full[k].length)d[k]=full[k];if(d.ct&&full.c)d.c=full.c;if(ed.ul)d.ul=1;
  const empty=!parts.length&&!d.lm&&!d.npc&&!d.cv&&!d.zn&&!d.ct&&!d.ul;if(empty)delete isl()[ed.id];else isl()[ed.id]=d;
  try{await dset('draft/islands/'+ed.id,empty?null:d);ed.dirty=false;toast(empty?'No changes, so nothing is saved.':'Saved to draft ('+parts.length+' tiles changed). Publish it from the Publish tab.')}catch(e){fail(e)}if(A.previewing)A.preview(S.draft);redraw()}
 function open(id){if(/^ed_/.test(id))return openBuiltin(id.slice(3));const d=isl()[id];if(!d)return;I.sel=id;I.ed=fromData(id,d);I.ed.recenter=1;S.arm=null;API.draw()}
 // ---- input ----
 const root=document.getElementById('dvs');
 root.addEventListener('click',e=>{if(S.tab!=='islands')return;const t=e.target.closest('[data-ia],[data-isl],[data-itool],[data-ibrush],[data-itile],[data-iobj],[data-ilm],[data-iloot-x],[data-ix],[data-ict],[data-ixm],[data-itt],[data-itc]');if(!t)return;const ed=I.ed;
  if(t.dataset.ia==='biul'&&ed&&ed.bi){ed.ul=t.checked;ed.prot=ed.ul?null:ed.keep;ed.dirty=true;paint(true);return}
  if(t.dataset.ia&&t.dataset.ia.startsWith('bi:')){if(ed&&ed.dirty&&!confirmLeave())return;openBuiltin(t.dataset.ia.slice(3));return}
  if(t.dataset.ix){ed.pal=t.dataset.ix;ed.tool=ed.pal==='zn'?'rect':'paint';tools();pals();hint();return}
  if(t.dataset.ict!=null){ed.pal='ct';ed.cti=+t.dataset.ict;if(['erase','pick','pan','fill'].includes(ed.tool))ed.tool='paint';tools();pals();hint();return}
  if(t.dataset.ixm){const X=ed[ed.sk]&&ed[ed.sk][ed.sel];if(!X||!X.m)return;snap();const k=t.dataset.ixm,j=X.m.indexOf(k);if(j>=0)X.m.splice(j,1);else if(X.m.length<6)X.m.push(k);else{toast('Up to 6 kinds of monster.');return}selPanel();paint(true);hint();return}
  if(t.dataset.itt){TE.ed.tool=t.dataset.itt;tilePanel();return}
  if(t.dataset.itc){TE.ed.col=t.dataset.itc;if(TE.ed.tool==='pick')TE.ed.tool='pen';tilePanel();return}
  if(t.dataset.isl){if(ed&&ed.dirty&&I.sel!==t.dataset.isl&&!confirmLeave())return;open(t.dataset.isl);return}
  if(t.dataset.itool){ed.tool=t.dataset.itool;if(ed.tool==='scatter'&&ed.brush<5)ed.brush=5;if(['lm','npc','cv'].includes(ed.pal)&&!['erase','pick','pan'].includes(ed.tool)||ed.pal==='zn'&&!['erase','pick','pan','rect'].includes(ed.tool))ed.pal='obj';tools();pals();hint();return}
  if(t.dataset.ibrush){ed.brush=+t.dataset.ibrush;tools();return}
  if(t.dataset.itile){ed.pal='tile';ed.tile=+t.dataset.itile;if(['erase','pick','pan'].includes(ed.tool))ed.tool='paint';tools();pals();hint();return}
  if(t.dataset.iobj){ed.pal='obj';ed.obj=+t.dataset.iobj;if(['erase','pick','pan','fill'].includes(ed.tool))ed.tool='paint';tools();pals();hint();return}
  if(t.dataset.ilm){ed.pal='lm';ed.lmk=t.dataset.ilm;ed.tool='paint';tools();pals();hint();return}
  if(t.dataset.ia==='xdel'){if(ed.sel<0||ed.sk==='lm')return;snap();ed[ed.sk].splice(ed.sel,1);ed.sel=-1;selPanel();paint(true);hint();return}
  if(t.dataset.ia==='ctnew'){tileOpen(-1);return}if(t.dataset.ia==='ctedit'){tileOpen(ed.cti);return}if(t.dataset.ia==='ctcancel'){TE.ed=null;tilePanel();return}if(t.dataset.ia==='ctsave'){tileSave();return}
  if(t.dataset.ia==='ctfrom'){tileFrom(TE.ed.from);return}
  if(t.dataset.ia==='ctdel'){const i=TE.ed.i;if(i<0)return;snap();ed.ct.splice(i,1);for(let j=0;j<ed.c.length;j++){if(ed.c[j]===i)ed.c[j]=NONE;else if(ed.c[j]!==NONE&&ed.c[j]>i)ed.c[j]--}ed.cti=0;if(ed.pal==='ct')ed.pal='tile';TE.ed=null;tilePanel();pals();paint(true);hint();return}
  if(t.dataset.ia==='chartreset'){ed.meta.mx=ed.meta.my=null;ed.dirty=true;redraw();return}
  if(t.dataset.ilootX!=null){const L=ed.lm[ed.sel];if(L&&L.loot){snap();delete L.loot[t.dataset.ilootX];selPanel()}return}
  const a=t.dataset.ia;
  if(a==='new'){I.make=true;I.newSize=I.newSize|0;API.draw();const n=root.querySelector('[data-if="newname"]');if(n)n.focus();return}
  if(a==='cancelnew'){I.make=false;API.draw();return}
  if(a&&a.startsWith('size')){I.newSize=+a.slice(4);const n=root.querySelector('[data-if="newname"]');I.newName=n?n.value:'';API.draw();return}
  if(a==='create'){const n=(root.querySelector('[data-if="newname"]')||{}).value||'',nm=n.trim()||'New Isle';let id=slug(nm),k=2;while(isl()[id]||(WORLD_REGIONS[id]&&!WORLD_REGIONS[id].custom))id=slug(nm).slice(0,27)+'_'+k++;
   const[,w,h]=SIZES[I.newSize|0];I.make=false;I.newName='';I.sel=id;I.ed={...fromData(id,{w,h,t:A.pack([...blank(w,h)].map(v=>HEX[v]).join('')),n:nm,dir:'e',pier:'e'}),dirty:true,recenter:1};API.draw();toast('New island. Paint it, then Save to draft.');return}
  if(a==='back'){if(ed&&ed.dirty&&!confirmLeave())return;I.sel=null;I.ed=null;API.draw();return}
  if(a==='vmap'||a==='vart'){ed.view=a==='vart'?'art':'map';redraw();return}
  if(a==='undo')return undo(false);if(a==='redo')return undo(true);
  if(a==='zin'||a==='zout'){const cv=document.getElementById('dvicv'),c=document.getElementById('dvi'),fx=(cv.scrollLeft+cv.clientWidth/2)/c.width,fy=(cv.scrollTop+cv.clientHeight/2)/c.height,z0=ed.z;
   ed.zoom=Math.max(1,Math.min(32,ed.zoom*(a==='zin'?1.5:1/1.5)));ed.z=0;if(cell()===z0&&a==='zin'){ed.zoom/=1.5;toast('That\'s as close as this island goes.');return}paint(true);cv.scrollLeft=fx*c.width-cv.clientWidth/2;cv.scrollTop=fy*c.height-cv.clientHeight/2;if(ed.view==='art')paint(true);return}
  if(a==='beach')return beaches();
  if(a==='lmdone'){ed.sel=-1;ed.sk='lm';selPanel();paint(true);return}
  if(a==='lmdel'){if(ed.sel<0||ed.sk!=='lm')return;snap();ed.lm.splice(ed.sel,1);ed.sel=-1;selPanel();paint(true);hint();return}
  if(a==='lootadd'){const L=ed.lm[ed.sel];if(!L)return;snap();L.loot=L.loot||{};const k=itemOpts().map(o=>o[0]).find(k=>!(k in L.loot));if(k)L.loot[k]=1;selPanel();return}
  if(a==='save')return save();
  if(a==='check'){check();return}
  if(a==='resize')return resize();
  if(a==='sail'){if(!check()){toast('Fix the island first (see the check below).');return}
   if(window.SQTITLE&&SQTITLE()){toast('Start your game first (Continue on the title screen), then sail there.');return}
   if(typeof curRegion==='function'&&curRegion()===ed.id){toast('You are on this island now. Sail home first, then come back to see your changes.');return}
   const prev=Object.assign({},S.draft,{islands:Object.assign({},isl(),{[ed.id]:toData(ed)})});A.preview(prev);const dd=ed.dirty;ed.dirty=false;SQSUITE.close();ed.dirty=dd;
   setTimeout(()=>{try{routeGo(ed.id)}catch(e2){console.warn(e2)}},50);return}
  if(a==='del')return arm('idel',async()=>{const id=ed.id;delete isl()[id];try{await dset('draft/islands/'+id,null);toast('Island deleted from your draft. Publish to remove it for players.')}catch(e2){fail(e2)}I.sel=null;I.ed=null;API.draw()})});
 root.addEventListener('change',e=>{if(S.tab!=='islands'||!I.ed)return;const t=e.target,ed=I.ed;
  if(t.dataset.ilootK!=null||t.dataset.ilootN!=null){const L=ed.lm[ed.sel];if(!L)return;snap();L.loot=L.loot||{};
   if(t.dataset.ilootK!=null){const old=t.dataset.ilootK,nv=t.value;if(nv!==old){const n=L.loot[old]|0;delete L.loot[old];L.loot[nv]=(L.loot[nv]|0)+Math.max(1,n)}selPanel()}
   else L.loot[t.dataset.ilootN]=Math.max(1,Math.min(100000,t.value|0));hint();return}
  if(t.dataset.ilf){const L=ed.lm[ed.sel];if(!L)return;snap();L[t.dataset.ilf]=t.value;hint();return}
  if(t.dataset.ixf){const X=ed[ed.sk]&&ed[ed.sk][ed.sel];if(!X)return;snap();const f=t.dataset.ixf;X[f]=f==='f'||f==='hp'?t.value|0:f==='n'&&ed.sk==='zn'?Math.max(1,Math.min(12,t.value|0)):t.value;if(f!=='s'&&f!=='n'||ed.sk==='zn')selPanel();paint(true);hint();return}
  if(t.dataset.ixl){const X=ed.npc[ed.sel];if(!X)return;snap();X.lk[t.dataset.ixl]=t.value|0;lookPrev();if(ed.view==='art')paint(true);hint();return}
  if(t.dataset.itf&&TE.ed){const f=t.dataset.itf;if(f==='col'){TE.ed.col=t.value;TE.ed.tool=TE.ed.tool==='pick'?'pen':TE.ed.tool}else if(f==='from')TE.ed.from=t.value|0;else TE.ed.n=t.value;return}
  const f=t.dataset.im;if(!f||f==='w'||f==='h')return;if(f==='dens'){ed.dens=Math.max(3,Math.min(70,t.value|0));tools();hint();return}const m=ed.meta;
  m[f]=f==='max'?Math.max(0,Math.min(30,t.value|0)):t.value;ed.dirty=true;ed.check=null;if(f==='mob'||f==='pier')redraw();else hint()});
 root.addEventListener('input',e=>{if(S.tab!=='islands')return;if(e.target.dataset.if==='newname')I.newName=e.target.value;if(e.target.dataset.im==='dens'&&I.ed){I.ed.dens=e.target.value|0;const l=e.target.parentElement;if(l&&l.lastChild&&l.lastChild.nodeType===3)l.lastChild.textContent=' '+I.ed.dens+'%'}});
 let tdown=false;
 root.addEventListener('pointerdown',e=>{if(e.target.id==='dvitc'&&TE.ed){e.preventDefault();tdown=true;try{e.target.setPointerCapture(e.pointerId)}catch(_){}tileUse(e,true);return}
  if(e.target.id==='dvichart'&&I.ed){const r=e.target.getBoundingClientRect(),m=I.ed.meta;m.mx=Math.max(10,Math.min(350,Math.round((e.clientX-r.left)/r.width*360)));m.my=Math.max(10,Math.min(350,Math.round((e.clientY-r.top)/r.height*360)));I.ed.dirty=true;chart();hint();
   const b=root.querySelector('[data-ia="chartreset"]');if(!b)redraw();return}});
 root.addEventListener('pointermove',e=>{if(tdown&&e.target.id==='dvitc')tileUse(e,false)});addEventListener('pointerup',()=>{tdown=false});
 root.addEventListener('pointerdown',e=>{if(e.target.id!=='dvi'||!I.ed)return;e.preventDefault();try{e.target.setPointerCapture(e.pointerId)}catch(_){}
  if(I.ed.tool==='pan'){const cv=document.getElementById('dvicv');pan={x:e.clientX,y:e.clientY,sx:cv.scrollLeft,sy:cv.scrollTop,cv};return}down=true;use(e,true)});
 root.addEventListener('pointermove',e=>{if(down&&e.pointerType==='mouse'&&!(e.buttons&1)){endStroke();return}if(pan){pan.cv.scrollLeft=pan.sx-(e.clientX-pan.x);pan.cv.scrollTop=pan.sy-(e.clientY-pan.y);return}if(down&&e.target.id==='dvi'&&I.ed)use(e,false)});
 const endStroke=()=>{const wasPan=pan;pan=null;if(wasPan&&I.ed&&I.ed.view==='art')paint(true);if(down){down=false;last=-1;if(shape)endShape();if(I.ed){I.ed.stroke=null;if(I.ed.view==='art')paint(true)}hint()}};
 addEventListener('pointerup',endStroke);for(const ev of['pointerup','pointercancel','lostpointercapture'])root.addEventListener(ev,endStroke);
 root.addEventListener('scroll',e=>{if(e.target.id==='dvicv'&&I.ed&&I.ed.view==='art'&&!pan){clearTimeout(root._ast);root._ast=setTimeout(()=>paint(true),150)}},true);
 addEventListener('resize',()=>{if(S.open&&S.tab==='islands'&&I.ed){I.ed.fit=0;paint(true)}});
 addEventListener('keydown',e=>{if(!S.open||S.tab!=='islands'||!I.ed)return;const tg=e.target;if(/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)&&tg.type!=='checkbox'&&tg.type!=='range')return;
  const k=e.key.toLowerCase(),m=e.ctrlKey||e.metaKey,ed=I.ed;
  if(m&&k==='z'){e.preventDefault();undo(e.shiftKey);return}if(m&&k==='y'){e.preventDefault();undo(true);return}if(m&&k==='s'){e.preventDefault();save();return}if(m)return;
  if(k==='v'){ed.view=ed.view==='art'?'map':'art';redraw();return}
  if((k==='delete'||k==='backspace')&&ed.sel>=0){const b=root.querySelector('[data-ia="'+(ed.sk==='lm'?'lmdel':'xdel')+'"]');if(b)b.click();return}
  const T={b:'paint',p:'paint',s:'scatter',f:'fill',l:'line',r:'rect',o:'ellipse',e:'erase',i:'pick',m:'pan'};if(T[k]){const b=root.querySelector('[data-itool="'+T[k]+'"]');if(b)b.click();return}
  if('12345'.includes(k)&&k.length===1){ed.brush=[1,2,3,5,9][+k-1];tools();return}
  if(k==='+'||k==='='||k==='-'){const b=root.querySelector('[data-ia="'+(k==='-'?'zout':'zin')+'"]');if(b)b.click()}},true);
 const css=document.createElement('style');css.textContent='#dvs .dv-stack{position:relative;display:inline-block;line-height:0}#dvs #dvio{position:absolute;left:0;top:0;pointer-events:none}#dvs #dvi{touch-action:none;cursor:crosshair;image-rendering:pixelated}#dvs .dv-cvw.dv-pan #dvi{cursor:grab}';document.head.appendChild(css);
 SQSUITE.addTab('islands','Islands',{render,after,changes,dirty:()=>!!(I.ed&&I.ed.dirty),leave(){I.sel=null;I.ed=null;I.make=false;TE.ed=null}})})();
