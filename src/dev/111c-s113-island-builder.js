// ---- 113. Island builder (Dev Suite > Islands): paint a new island, then publish it as a sailing destination ----
// Ground is painted with the 15 region ground types and objects (trees, rocks, ore...) placed tile by tile. The island
// is saved in the asset library (islands.cu_<name>) and the asset library turns it into a normal region (section 111).
(()=>{if(!window.SQSUITE||!window.SQA)return;const API=SQSUITE.api,{S,A,E,dset,toast,fail,arm,same,confirmLeave}=API,PXC=A.PXC,HEX='0123456789abcdef';
 const TILES=[[0,'Water'],[1,'Sand'],[2,'Grass'],[7,'Forest floor'],[14,'Dirt trail'],[11,'Stone paving'],[5,'Desert sand'],[10,'Cracked earth'],[13,'Dark ground'],
  [8,'Black sand'],[4,'Snow'],[12,'Ice'],[3,'Mountain'],[9,'Lava'],[15,'Sulfur spring']];
 const OBJN={tree:'Tree','tree:dark':'Dark tree','tree:dead':'Dead tree',pine:'Pine',oak:'Oak',willow:'Willow',maple:'Maple',yew:'Yew',bush:'Berry bush',nutbush:'Nut bush',
  shroom:'Mushroom',rock:'Rock','rock:moss':'Mossy rock',ore:'Ore','ore:crystal':'Crystal',cactus:'Cactus'};
 const OBJC={tree:'#2c7c30','tree:dark':'#5a3a80','tree:dead':'#3a2c24',pine:'#1e5a38',oak:'#4a9a3a',willow:'#9ac85a',maple:'#e0782a',yew:'#245a40',bush:'#c84860',nutbush:'#a07a40',
  shroom:'#e83a3a',rock:'#a09888','rock:moss':'#7a8a58',ore:'#e08a38','ore:crystal':'#b080f0',cactus:'#3c9a38'};
 const OBJ=A.ISL_OBJ,COL=RG_MAPCOL,WALK=RG_WALK,NONE=255;
 const SIZES=[['Small',60,48],['Medium',100,80],['Large',150,120]];
 const DIRS=[['n','North'],['ne','North-east'],['e','East'],['se','South-east'],['s','South'],['sw','South-west'],['w','West'],['nw','North-west']];
 const SIDES=[['e','East'],['w','West'],['n','North'],['s','South']];
 const I={sel:null,ed:null,make:false};let down=false,last=-1,pan=null;
 const isl=()=>S.draft.islands||(S.draft.islands={});
 // ---- the data <-> the editor ----
 function fromData(id,d){const N=d.w*d.h,t=new Uint8Array(N),o=new Uint8Array(N).fill(NONE),ts=A.unpack(d.t),os=d.o?A.unpack(d.o):'';
  for(let i=0;i<N;i++){const v=HEX.indexOf(ts[i]);t[i]=v>=0?v:0;const c=os[i];if(c&&c!=='.'){const k=PXC.indexOf(c);if(k>=0&&k<OBJ.length)o[i]=k}}
  return{id,w:d.w,h:d.h,t,o,meta:{n:d.n||'',b:d.b||'',lv:d.lv||'',dir:d.dir||'e',pier:d.pier||'e',mob:d.mob||'',max:d.max==null?12:d.max},
   tool:'paint',pal:'tile',tile:2,obj:0,brush:1,zoom:0,fit:0,undo:[],redo:[],dirty:false,check:null}}
 function toData(ed){let t='',o='',any=false;for(let i=0;i<ed.t.length;i++){t+=HEX[ed.t[i]];const v=ed.o[i];if(v!==NONE){any=true;o+=PXC[v]}else o+='.'}
  const m=ed.meta,d={n:m.n.trim()||'Unnamed Isle',b:m.b.trim(),lv:m.lv.trim(),dir:m.dir,pier:m.pier,w:ed.w,h:ed.h,t:A.pack(t)};if(any)d.o=A.pack(o);if(m.mob){d.mob=m.mob;d.max=Math.max(0,Math.min(30,m.max|0))}return d}
 function blank(w,h){const N=w*h,t=new Uint8Array(N),cx=w/2,cy=h/2;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const d=Math.hypot((x-cx)/(w*.36),(y-cy)/(h*.36));t[y*w+x]=d<.86?2:d<1?1:0}return t}
 const slug=n=>'cu_'+(String(n).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,24)||'isle');
 // ---- what to publish ----
 const name=id=>((isl()[id]||(S.live&&S.live.islands||{})[id]||{}).n)||id;
 function changes(L,D){const out=[],l=L.islands||{},d=D.islands||{};for(const id of new Set([...Object.keys(l),...Object.keys(d)]))if(!same(l[id],d[id]))
  out.push({kind:'ext',html:'🏝 '+E(name(id))+': '+(d[id]?(l[id]?'island changed':'new island'):'island removed')});return out}
 // ---- screen ----
 function render(){const ids=Object.keys(isl()).sort();if(I.ed&&!ids.includes(I.ed.id))ids.unshift(I.ed.id);let h='<div class="dv-spr'+(I.sel?' dv-has':'')+'"><div class="dv-ls"><button class="dv-b dv-pri" data-ia="new">+ New island</button>';
  if(I.make){h+='<div class="dv-card" style="padding:10px"><b>New island</b><p><input type="text" data-if="newname" placeholder="Island name" maxlength="40" value="'+E(I.newName||'')+'"></p>'+
   '<p class="dv-chips">'+SIZES.map((z,k)=>'<button class="dv-b'+((I.newSize|0)===k?' dv-tl dv-on':'')+'" data-ia="size'+k+'">'+z[0]+'<br><small>'+z[1]+' × '+z[2]+'</small></button>').join('')+'</p>'+
   '<button class="dv-b dv-pri" data-ia="create">Create</button> <button class="dv-b" data-ia="cancelnew">Cancel</button></div>'}
  h+='<div class="dv-grid" style="grid-template-columns:1fr">';for(const id of ids){const d=isl()[id]||(I.ed&&I.ed.id===id?{n:I.ed.meta.n,w:I.ed.w,h:I.ed.h}:{}),l=S.live&&S.live.islands&&S.live.islands[id],st=!same(d,l)?'draft':'live';
   h+='<button class="dv-it'+(I.sel===id?' dv-on':'')+'" data-isl="'+E(id)+'" style="flex-direction:row;justify-content:flex-start;padding:8px 10px"><i class="dv-bd dv-'+st+'">'+(st==='draft'?'DRAFT':'LIVE')+'</i><span style="font-size:13px;-webkit-line-clamp:1;text-align:left">🏝 '+E(d.n||id)+'<br><small style="color:#8a94a6">'+d.w+' × '+d.h+'</small></span></button>'}
  if(!ids.length&&!I.make)h+='<p class="dv-mut">No islands yet. Make one with "New island".</p>';
  h+='</div></div><div class="dv-ed">';
  if(!I.ed)h+='<div class="dv-card"><b>Build a new island.</b><p class="dv-mut">Paint the ground, place trees, rocks and ore, choose where the pier goes, then publish it. Players sail to it from any harbor post, like the other islands. Your island gets open sea around it automatically.</p></div>';
  else{const ed=I.ed,m=ed.meta;
   h+='<div class="dv-row"><button class="dv-b dv-back" data-ia="back">‹ All islands</button><b style="font-size:16px">🏝 '+E(m.n||ed.id)+'</b><span class="dv-mut">'+ed.w+' × '+ed.h+' tiles · '+E(ed.id)+'</span></div>'+
    '<div class="dv-row dv-itools"></div><div class="dv-cv dv-cvw" id="dvicv"><canvas id="dvi"></canvas></div>'+
    '<div class="dv-mut" id="dvihint" style="min-height:1.4em"></div>'+
    '<div><div class="dv-mut" style="margin:4px 0">Ground</div><div class="dv-pal dv-ipal-t"></div><div class="dv-mut" style="margin:8px 0 4px">Objects</div><div class="dv-pal dv-ipal-o"></div></div>'+
    '<div class="dv-card" style="margin-top:6px"><b>Island details</b>'+
    '<p><label class="dv-mut">Name<input type="text" data-im="n" maxlength="40" value="'+E(m.n)+'"></label></p>'+
    '<p><label class="dv-mut">Description (shown on the sailing routes and world map)<input type="text" data-im="b" maxlength="120" value="'+E(m.b)+'" placeholder="Meadows, a quiet lake and an old ruin"></label></p>'+
    '<div class="dv-row"><label class="dv-mut">Suggested level<input type="text" data-im="lv" maxlength="12" value="'+E(m.lv)+'" placeholder="1–20" style="width:110px"></label>'+
    '<label class="dv-mut">Lies to the<br><select data-im="dir">'+DIRS.map(([k,n])=>'<option value="'+k+'"'+(m.dir===k?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'+
    '<label class="dv-mut">Pier on the<br><select data-im="pier">'+SIDES.map(([k,n])=>'<option value="'+k+'"'+(m.pier===k?' selected':'')+'>'+n+' coast</option>').join('')+'</select></label>'+
    '<label class="dv-mut">Monsters at night<br><select data-im="mob"><option value="">None (peaceful)</option>'+Object.keys(typeof RG_MOBS!=='undefined'?RG_MOBS:{}).filter(k=>WORLD_REGIONS[k]&&!WORLD_REGIONS[k].custom).map(k=>'<option value="'+k+'"'+(m.mob===k?' selected':'')+'>Like '+E(WORLD_REGIONS[k].name)+'</option>').join('')+'</select></label>'+
    (m.mob?'<label class="dv-mut">At most<input type="number" data-im="max" min="0" max="30" value="'+(m.max|0)+'" style="width:70px"></label>':'')+'</div>'+
    '<div class="dv-row" style="margin-top:8px"><span class="dv-mut">Size</span><input type="number" data-im="w" min="20" max="200" value="'+ed.w+'" style="width:76px"> × <input type="number" data-im="h" min="20" max="200" value="'+ed.h+'" style="width:76px"><button class="dv-b" data-ia="resize">Resize</button><span class="dv-mut">keeps the middle</span></div></div>'+
    '<div class="dv-row"><button class="dv-b dv-pri" data-ia="save">Save to draft</button><button class="dv-b" data-ia="check">Check island</button><button class="dv-b" data-ia="sail">Sail there now</button>'+
    '<button class="dv-b '+(S.arm==='idel'?'dv-arm':'dv-bad')+'" data-ia="del">'+(S.arm==='idel'?'Tap again to delete this island':'Delete island')+'</button></div>'+
    '<div class="dv-mut" id="dvicheck">'+(ed.check||'')+'</div>'+
    '<p class="dv-mut">Keys: B paint · F fill · E erase objects · I pick · M move · 1–5 brush size · + / − zoom · Ctrl+Z undo · Ctrl+Y redo · Ctrl+S save</p>'}
  return h+'</div></div>'}
 function after(){const ed=I.ed;if(!ed)return;tools();pals();paint(true);hint()}
 function tools(){const t=document.querySelector('#dvs .dv-itools'),ed=I.ed;if(!t||!ed)return;const T=[['paint','Paint'],['fill','Fill'],['erase','Erase objects'],['pick','Pick'],['pan','Move']];
  t.innerHTML=T.map(([k,n])=>'<button class="dv-b dv-tl'+(ed.tool===k?' dv-on':'')+'" data-itool="'+k+'">'+n+'</button>').join('')+
   '<span class="dv-mut">Brush</span>'+[1,2,3,5].map(b=>'<button class="dv-b dv-tl'+(ed.brush===b?' dv-on':'')+'" data-ibrush="'+b+'">'+b+'</button>').join('')+
   '<button class="dv-b" data-ia="undo">Undo</button><button class="dv-b" data-ia="redo">Redo</button><button class="dv-b" data-ia="zout">−</button><button class="dv-b" data-ia="zin">+</button>';
  const cv=document.getElementById('dvicv');if(cv)cv.classList.toggle('dv-pan',ed.tool==='pan')}
 function pals(){const ed=I.ed,a=document.querySelector('#dvs .dv-ipal-t'),b=document.querySelector('#dvs .dv-ipal-o');if(!a||!ed)return;
  a.innerHTML=TILES.map(([v,n])=>'<button class="dv-sw'+(ed.pal==='tile'&&ed.tile===v?' dv-on':'')+'" data-itile="'+v+'" title="'+n+'" style="background:'+COL[v]+';width:auto;min-width:26px;padding:0 6px;color:'+(v===4||v===12||v===1||v===5||v===15?'#222':'#fff')+';font-size:11px;height:28px">'+n+'</button>').join('');
  b.innerHTML=OBJ.map((k,i)=>'<button class="dv-sw'+(ed.pal==='obj'&&ed.obj===i?' dv-on':'')+'" data-iobj="'+i+'" title="'+OBJN[k]+'" style="background:#1c232e;width:auto;padding:0 8px 0 6px;height:28px;font-size:11px;color:#dfe5ee"><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+OBJC[k]+';margin-right:5px;vertical-align:-1px"></i>'+OBJN[k]+'</button>').join('')}
 function hint(){const h=document.getElementById('dvihint'),ed=I.ed;if(!h||!ed)return;const what=ed.tool==='erase'?'Erasing objects':ed.tool==='pan'?'Drag to look around':ed.tool==='pick'?'Tap a tile to pick its ground or object':ed.pal==='tile'?(ed.tool==='fill'?'Filling with ':'Painting ')+TILES.find(t=>t[0]===ed.tile)[1]:'Placing '+OBJN[OBJ[ed.obj]]+(ed.tool==='fill'?' (fill paints ground only)':'');
  h.textContent=what+(ed.dirty?'  ·  unsaved changes':'')}
 // ---- drawing the map ----
 function cell(){const ed=I.ed,c=document.getElementById('dvi');if(!c)return 4;if(!ed.fit){const box=c.parentElement.getBoundingClientRect();ed.fit=Math.max(1,Math.min((box.width-8)/ed.w,(window.innerHeight*.62-8)/ed.h))}
  if(!ed.zoom)ed.zoom=1;return Math.max(1,Math.round(ed.fit*ed.zoom))}
 function cellDraw(x,i,z){const ed=I.ed,X=(i%ed.w)*z,Y=Math.floor(i/ed.w)*z;x.fillStyle=COL[ed.t[i]];x.fillRect(X,Y,z,z);const o=ed.o[i];
  if(o!==NONE){x.fillStyle=OBJC[OBJ[o]];if(z>=6){x.beginPath();x.arc(X+z/2,Y+z/2,z*.36,0,7);x.fill();x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=1;x.stroke()}else{const s=Math.max(1,z-1);x.fillRect(X,Y,s,s)}}}
 function paint(full,list){const c=document.getElementById('dvi'),ed=I.ed;if(!c||!ed)return;const z=down&&ed.z?ed.z:(ed.z=cell());
  if(full||c.width!==ed.w*z){c.width=ed.w*z;c.height=ed.h*z;list=null}const x=c.getContext('2d');
  if(list)for(const i of list)cellDraw(x,i,z);else for(let i=0;i<ed.t.length;i++)cellDraw(x,i,z);
  if(!list){// where the pier goes, and the open sea added around the island
   x.fillStyle='rgba(248,216,72,.9)';const p=ed.meta.pier,W=c.width,H=c.height,s=Math.max(4,z*2);
   if(p==='e')x.fillRect(W-s,H/2-s*2,s,s*4);else if(p==='w')x.fillRect(0,H/2-s*2,s,s*4);else if(p==='n')x.fillRect(W/2-s*2,0,s*4,s);else x.fillRect(W/2-s*2,H-s,s*4,s)}
  if(ed.recenter){ed.recenter=0;const cv=c.parentElement;cv.scrollLeft=(c.width-cv.clientWidth)/2;cv.scrollTop=(c.height-cv.clientHeight)/2}}
 // ---- editing ----
 const snap=()=>{const ed=I.ed;ed.undo.push({t:ed.t.slice(),o:ed.o.slice()});if(ed.undo.length>40)ed.undo.shift();ed.redo=[];ed.dirty=true;ed.check=null};
 function undo(r){const ed=I.ed;if(!ed)return;const a=r?ed.redo:ed.undo,b=r?ed.undo:ed.redo,s=a.pop();if(!s)return;b.push({t:ed.t.slice(),o:ed.o.slice()});ed.t=s.t;ed.o=s.o;ed.dirty=true;paint(true);hint()}
 function at(e){const c=document.getElementById('dvi'),r=c.getBoundingClientRect(),z=r.width/I.ed.w,X=Math.floor((e.clientX-r.left)/z),Y=Math.floor((e.clientY-r.top)/z);return X>=0&&Y>=0&&X<I.ed.w&&Y<I.ed.h?Y*I.ed.w+X:-1}
 function stamp(i,ch){const ed=I.ed,b=ed.brush,x0=i%ed.w,y0=Math.floor(i/ed.w),r=(b-1)/2;
  for(let y=Math.round(y0-r);y<=Math.round(y0+r);y++)for(let x=Math.round(x0-r);x<=Math.round(x0+r);x++){if(x<0||y<0||x>=ed.w||y>=ed.h)continue;if(b>=3&&Math.hypot(x-x0,y-y0)>r+.5)continue;const j=y*ed.w+x;
   if(ed.tool==='erase'){ed.o[j]=NONE}else if(ed.pal==='tile'){ed.t[j]=ed.tile;if(!WALK[ed.tile])ed.o[j]=NONE}else if(WALK[ed.t[j]])ed.o[j]=ed.obj;ch.push(j)}}
 function fillAt(i){const ed=I.ed,from=ed.t[i],to=ed.tile;if(from===to)return[];const ch=[],st=[i],seen=new Uint8Array(ed.t.length);
  while(st.length){const j=st.pop();if(seen[j]||ed.t[j]!==from)continue;seen[j]=1;ed.t[j]=to;if(!WALK[to])ed.o[j]=NONE;ch.push(j);const x=j%ed.w;if(x>0)st.push(j-1);if(x<ed.w-1)st.push(j+1);if(j>=ed.w)st.push(j-ed.w);if(j<ed.t.length-ed.w)st.push(j+ed.w)}return ch}
 function use(e,first){const ed=I.ed,i=at(e);if(i<0){last=-1;return}
  if(ed.tool==='pick'){if(ed.o[i]!==NONE){ed.pal='obj';ed.obj=ed.o[i]}else{ed.pal='tile';ed.tile=ed.t[i]}ed.tool='paint';tools();pals();hint();return}
  if(ed.tool==='fill'){if(!first)return;if(ed.pal!=='tile'){toast('Fill paints ground. Pick a ground type first.');return}snap();paint(false,fillAt(i));hint();return}
  if(first){snap();last=-1}const ch=[];
  if(last<0)stamp(i,ch);else{let x0=last%ed.w,y0=Math.floor(last/ed.w);const x1=i%ed.w,y1=Math.floor(i/ed.w),dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let er=dx+dy;
   for(;;){stamp(y0*ed.w+x0,ch);if(x0===x1&&y0===y1)break;const e2=2*er;if(e2>=dy){er+=dy;x0+=sx}if(e2<=dx){er+=dx;y0+=sy}}}
  last=i;paint(false,ch);if(first)hint()}
 // ---- checking: build it exactly like the game will, and walk it from the pier ----
 function check(){const ed=I.ed,d=toData(ed);let msg;
  try{const D={id:ed.id,width:d.w+A.ISL_PAD*2,height:d.h+A.ISL_PAD*2,seed:1,generationVersion:1},G=rgRunSync(A.islandGen(d)(D)),W=D.width,H=D.height;
   const solid=G.solid,seen=new Uint8Array(W*H),s0=G.spawn[1]*W+G.spawn[0],st=[s0];seen[s0]=1;let n=0,land=0;
   while(st.length){const i=st.pop();n++;const x=i%W,y=(i/W)|0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b,j=Y*W+X;if(X<0||Y<2||X>=W||Y>=H||seen[j]||solid.has(j))continue;seen[j]=1;st.push(j)}}
   for(let i=0;i<W*H;i++)if(G.tiles[i]&&RG_WALK[G.tiles[i]]&&!solid.has(i))land++;
   const objs=G.items.filter(it=>it.t==='_obj').length,pct=land?Math.round(n/land*100):0;
   msg='✓ The pier fits on the '+SIDES.find(s=>s[0]===ed.meta.pier)[1].toLowerCase()+' coast. Players can walk to '+n.toLocaleString()+' tiles from it ('+pct+'% of the open ground)'+(pct<90?'. Some ground is cut off by water, mountains or objects':'')+'. '+objs+' objects.'}
  catch(e){msg='✗ '+(/pier/.test(e.message)?'There\'s no room for a pier on the '+SIDES.find(s=>s[0]===ed.meta.pier)[1].toLowerCase()+' coast: it needs land facing open sea near the middle of that side. Try another side, or paint some coast there.':'This island can\'t be built: '+e.message)}
  ed.check=msg;const c=document.getElementById('dvicheck');if(c)c.textContent=msg;return msg.startsWith('✓')}
 async function save(){const ed=I.ed;if(!ed)return;if(!check()){toast('Saved anyway, but players can\'t sail there until the check passes.')}
  const d=toData(ed);isl()[ed.id]=d;try{await dset('draft/islands/'+ed.id,d);ed.dirty=false;toast('Saved to draft. Publish it from the Publish tab.')}catch(e){fail(e)}
  if(A.previewing)A.preview(S.draft);API.draw()}
 function resize(){const ed=I.ed,iw=document.querySelector('#dvs [data-im="w"]'),ih=document.querySelector('#dvs [data-im="h"]'),w=Math.max(20,Math.min(200,iw.value|0)),h=Math.max(20,Math.min(200,ih.value|0));
  if(w===ed.w&&h===ed.h)return;snap();const t=new Uint8Array(w*h),o=new Uint8Array(w*h).fill(NONE),ox=Math.floor((w-ed.w)/2),oy=Math.floor((h-ed.h)/2);
  for(let y=0;y<ed.h;y++)for(let x=0;x<ed.w;x++){const X=x+ox,Y=y+oy;if(X<0||Y<0||X>=w||Y>=h)continue;t[Y*w+X]=ed.t[y*ed.w+x];o[Y*w+X]=ed.o[y*ed.w+x]}
  ed.undo=[];ed.redo=[];ed.w=w;ed.h=h;ed.t=t;ed.o=o;ed.fit=0;ed.recenter=1;API.draw()}
 function open(id){const d=isl()[id];if(!d)return;I.sel=id;I.ed=fromData(id,d);I.ed.recenter=1;S.arm=null;API.draw()}
 // ---- input ----
 const root=document.getElementById('dvs');
 root.addEventListener('click',e=>{if(S.tab!=='islands')return;const t=e.target.closest('[data-ia],[data-isl],[data-itool],[data-ibrush],[data-itile],[data-iobj]');if(!t)return;const ed=I.ed;
  if(t.dataset.isl){if(ed&&ed.dirty&&I.sel!==t.dataset.isl&&!confirmLeave())return;open(t.dataset.isl);return}
  if(t.dataset.itool){ed.tool=t.dataset.itool;tools();hint();return}
  if(t.dataset.ibrush){ed.brush=+t.dataset.ibrush;tools();return}
  if(t.dataset.itile){ed.pal='tile';ed.tile=+t.dataset.itile;if(ed.tool==='erase'||ed.tool==='pick'||ed.tool==='pan')ed.tool='paint';tools();pals();hint();return}
  if(t.dataset.iobj){ed.pal='obj';ed.obj=+t.dataset.iobj;if(ed.tool!=='paint')ed.tool='paint';tools();pals();hint();return}
  const a=t.dataset.ia;
  if(a==='new'){I.make=true;I.newSize=I.newSize|0;API.draw();const n=root.querySelector('[data-if="newname"]');if(n)n.focus();return}
  if(a==='cancelnew'){I.make=false;API.draw();return}
  if(a&&a.startsWith('size')){I.newSize=+a.slice(4);const n=root.querySelector('[data-if="newname"]');I.newName=n?n.value:'';API.draw();return}
  if(a==='create'){const n=(root.querySelector('[data-if="newname"]')||{}).value||'',nm=n.trim()||'New Isle';let id=slug(nm),k=2;while(isl()[id]||(WORLD_REGIONS[id]&&!WORLD_REGIONS[id].custom))id=slug(nm).slice(0,27)+'_'+k++;
   const[,w,h]=SIZES[I.newSize|0];I.make=false;I.newName='';I.sel=id;I.ed={...fromData(id,{w,h,t:A.pack([...blank(w,h)].map(v=>HEX[v]).join('')),n:nm,dir:'e',pier:'e'}),dirty:true,recenter:1};API.draw();toast('New island. Paint it, then Save to draft.');return}
  if(a==='back'){if(ed&&ed.dirty&&!confirmLeave())return;I.sel=null;I.ed=null;API.draw();return}
  if(a==='undo')return undo(false);if(a==='redo')return undo(true);
  if(a==='zin'||a==='zout'){const cv=document.getElementById('dvicv'),c=document.getElementById('dvi'),fx=(cv.scrollLeft+cv.clientWidth/2)/c.width,fy=(cv.scrollTop+cv.clientHeight/2)/c.height;
   ed.zoom=Math.max(1,Math.min(16,ed.zoom*(a==='zin'?1.5:1/1.5)));ed.z=0;paint(true);cv.scrollLeft=fx*c.width-cv.clientWidth/2;cv.scrollTop=fy*c.height-cv.clientHeight/2;return}
  if(a==='save')return save();
  if(a==='check'){check();return}
  if(a==='resize')return resize();
  if(a==='sail'){if(!check()){toast('Fix the island first (see the check below).');return}
   if(typeof curRegion==='function'&&curRegion()===ed.id){toast('You are on this island now. Sail home first, then come back to see your changes.');return}
   const prev=Object.assign({},S.draft,{islands:Object.assign({},isl(),{[ed.id]:toData(ed)})});A.preview(prev);const dd=ed.dirty;ed.dirty=false;SQSUITE.close();ed.dirty=dd;
   setTimeout(()=>{try{routeGo(ed.id)}catch(e2){console.warn(e2)}},50);return}
  if(a==='del')return arm('idel',async()=>{const id=ed.id;delete isl()[id];try{await dset('draft/islands/'+id,null);toast('Island deleted from your draft. Publish to remove it for players.')}catch(e2){fail(e2)}I.sel=null;I.ed=null;API.draw()})});
 root.addEventListener('change',e=>{if(S.tab!=='islands'||!I.ed)return;const t=e.target,f=t.dataset.im;if(!f||f==='w'||f==='h')return;const m=I.ed.meta;
  m[f]=f==='max'?Math.max(0,Math.min(30,t.value|0)):t.value;I.ed.dirty=true;I.ed.check=null;if(f==='mob'||f==='pier')API.draw();else hint()});
 root.addEventListener('input',e=>{if(S.tab!=='islands')return;if(e.target.dataset.if==='newname')I.newName=e.target.value});
 root.addEventListener('pointerdown',e=>{if(e.target.id!=='dvi'||!I.ed)return;e.preventDefault();try{e.target.setPointerCapture(e.pointerId)}catch(_){}
  if(I.ed.tool==='pan'){const cv=e.target.parentElement;pan={x:e.clientX,y:e.clientY,sx:cv.scrollLeft,sy:cv.scrollTop,cv};return}down=true;use(e,true)});
 root.addEventListener('pointermove',e=>{if(down&&e.pointerType==='mouse'&&!(e.buttons&1)){endStroke();return}if(pan){pan.cv.scrollLeft=pan.sx-(e.clientX-pan.x);pan.cv.scrollTop=pan.sy-(e.clientY-pan.y);return}if(down&&e.target.id==='dvi'&&I.ed)use(e,false)});
 const endStroke=()=>{pan=null;if(down){down=false;last=-1;hint()}};addEventListener('pointerup',endStroke);for(const ev of['pointerup','pointercancel','lostpointercapture'])root.addEventListener(ev,endStroke);
 addEventListener('resize',()=>{if(S.open&&S.tab==='islands'&&I.ed){I.ed.fit=0;paint(true)}});
 addEventListener('keydown',e=>{if(!S.open||S.tab!=='islands'||!I.ed)return;const tg=e.target;if(/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)&&tg.type!=='checkbox')return;
  const k=e.key.toLowerCase(),m=e.ctrlKey||e.metaKey,ed=I.ed;
  if(m&&k==='z'){e.preventDefault();undo(e.shiftKey);return}if(m&&k==='y'){e.preventDefault();undo(true);return}if(m&&k==='s'){e.preventDefault();save();return}if(m)return;
  const T={b:'paint',p:'paint',f:'fill',e:'erase',i:'pick',m:'pan'};if(T[k]){ed.tool=T[k];tools();hint();return}
  if('1235'.includes(k)&&k.length===1){ed.brush=+k;tools();return}if(k==='4'){ed.brush=5;tools();return}
  if(k==='+'||k==='='||k==='-'){const b=root.querySelector('[data-ia="'+(k==='-'?'zout':'zin')+'"]');if(b)b.click()}},true);
 SQSUITE.addTab('islands','Islands',{render,after,changes,dirty:()=>!!(I.ed&&I.ed.dirty),leave(){I.sel=null;I.ed=null;I.make=false}})})();
