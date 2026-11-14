// ---- 112. Dev Suite (developer only): edit item sprites, worn looks and game stats, then publish them to every player ----
// Open it from Options > Dev Suite, or type /suite in chat. Only shows for the developer's account, and the database
// only accepts writes to assets/ from accounts listed under devs/ (added by hand in the Firebase console).
// Edits go to assets/draft first. "Publish" copies the draft to assets/live (players get it within ~30 s, section 180) and
// keeps the version it replaced in assets/hist, so any earlier version can be restored.
(()=>{const A=window.SQA,PXC=A.PXC,MAXC=PXC.length;
 const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
 let down=false,last=-1;
 const clone=o=>o==null?o:JSON.parse(JSON.stringify(o));
 const S={open:false,tab:'sprites',ok:null,uid:'',live:null,draft:null,hist:null,q:'',only:false,sel:null,ed:null,statT:'items',statQ:'',gm:'look',note:'',arm:null,busy:false};
 // ---- database ----
 const fb=()=>window.SQFB,user=()=>window.SQMP&&SQMP.user;
 const R=p=>fb().db.ref(fb().D,'assets/'+p);
 const dget=async p=>(await fb().db.get(R(p))).val(),dset=(p,v)=>fb().db.set(R(p),v==null?null:v);
 const body=L=>{const o=clone(L)||{};delete o.v;delete o.at;delete o.by;return o};
 const norm=d=>{d.icons=d.icons||{};d.stats=d.stats||{};d.worn=d.worn||{};d.islands=d.islands||{};d.pets=d.pets||{};d.gear=d.gear||{};d.newgear=d.newgear||{};d.props=d.props||{};d.pnames=d.pnames||{};d.mobs=d.mobs||{};return d};
 const EXT={},LAY=k=>k==='worn'||k==='pet'||k==='prop';// extra tabs (the island builder lives in its own file)
 async function load(){S.ok=null;S.note='';draw();
  if(!fb()||!user()){S.ok='signin';draw();return}S.uid=user().uid;
  try{S.live=await dget('live');S.draft=await dget('draft')}catch(e){S.ok=/permission/i.test(e.message)?'setup':'error';S.note=e.message;draw();return}
  if(!S.draft){S.draft=body(S.live);try{await dset('draft',S.draft)}catch(e){}}
  norm(S.draft);S.ok='yes';syncNG();draw()}
 const syncNG=()=>{try{if(window.SQGEAR)SQGEAR.devItems(S.draft&&S.draft.newgear)}catch(e){console.warn(e)}};
 const toast=t=>{S.note=t;const n=document.querySelector('#dvs .dv-note');if(n)n.textContent=t;clearTimeout(toast.t);toast.t=setTimeout(()=>{S.note='';const n2=document.querySelector('#dvs .dv-note');if(n2)n2.textContent=''},4000)};
 const fail=e=>{console.error(e);toast('Could not save: '+(e&&e.message||e))};
 // ---- comparing draft and live ----
 const same=(a,b)=>JSON.stringify(a==null?null:a)===JSON.stringify(b==null?null:b);
 function changes(){const out=[],L=body(S.live),D=S.draft||{};
  const ik=new Set([...Object.keys(L.icons||{}),...Object.keys(D.icons||{})]);
  for(const k of ik)if(!same((L.icons||{})[k],(D.icons||{})[k]))out.push({kind:'sprite',k,what:(D.icons||{})[k]?((L.icons||{})[k]?'Sprite changed':'New sprite'):'Back to the original sprite'});
  const wk=new Set([...Object.keys(L.worn||{}),...Object.keys(D.worn||{})]);
  for(const k of wk)if(!same((L.worn||{})[k],(D.worn||{})[k]))out.push({kind:'worn',k,what:(D.worn||{})[k]?((L.worn||{})[k]?'Worn look changed':'New worn look'):'Back to the game\'s own worn look'});
  const pk=new Set([...Object.keys(L.pets||{}),...Object.keys(D.pets||{})]);
  for(const k of pk)if(!same((L.pets||{})[k],(D.pets||{})[k]))out.push({kind:'pet',k:'pet_'+k,what:(D.pets||{})[k]?((L.pets||{})[k]?'Pet look changed':'New pet look'):'Back to the game\'s own pet look'});
  const nk=new Set([...Object.keys(L.newgear||{}),...Object.keys(D.newgear||{})]);
  for(const k of nk)if(!same((L.newgear||{})[k],(D.newgear||{})[k]))out.push({kind:'gear',k,what:(D.newgear||{})[k]?((L.newgear||{})[k]?'New gear item changed':'New gear item'):'New gear item removed'});
  const gk=new Set([...Object.keys(L.gear||{}),...Object.keys(D.gear||{})]);
  for(const k of gk)if(!same((L.gear||{})[k],(D.gear||{})[k]))out.push({kind:'gear',k,what:(D.gear||{})[k]?((L.gear||{})[k]?'How it works changed':'New rules for how it works'):'Back to how the game made it work'});
  for(const t in A.TABLES){const l=(L.stats||{})[t]||{},d=(D.stats||{})[t]||{};
   for(const k of new Set([...Object.keys(l),...Object.keys(d)]))if(!same(l[k],d[k])){const T=A.TABLES[t];
    const f=Object.keys({...l[k],...d[k]}).map(f=>{const fd=T.fields.find(x=>x[0]===f);return fd?fd[1]:f});
    out.push({kind:'stat',t,k,what:T.name+': '+f.join(', ')+(d[k]?'':' (back to original)')})}}
  const ok2=new Set([...Object.keys(L.props||{}),...Object.keys(D.props||{})]);
  for(const k of ok2)if(!same((L.props||{})[k],(D.props||{})[k]))out.push({kind:'ext',html:'🏠 '+E(propName(k))+': '+((D.props||{})[k]?((L.props||{})[k]?'look changed':'new look'):'back to the game\'s own look')});
  const mk2=new Set([...Object.keys(L.mobs||{}),...Object.keys(D.mobs||{})]);
  for(const k of mk2)if(!same((L.mobs||{})[k],(D.mobs||{})[k]))out.push({kind:'ext',html:'👾 '+E(propName(k))+': '+((D.mobs||{})[k]?'rules changed':'back to the game\'s own rules')});
  const nk2=new Set([...Object.keys(L.pnames||{}),...Object.keys(D.pnames||{})]);
  for(const k of nk2)if(!same((L.pnames||{})[k],(D.pnames||{})[k]))out.push({kind:'ext',html:'🏷 '+E(gameName(k))+': '+((D.pnames||{})[k]?'renamed to "'+E(D.pnames[k])+'" in the Dev Suite':'back to its own name in the Dev Suite')});
  for(const k in EXT)if(EXT[k].changes)try{out.push(...EXT[k].changes(L,D))}catch(e){}
  return out}
 const wState=k=>{const d=S.draft&&S.draft.worn&&S.draft.worn[k],l=S.live&&S.live.worn&&S.live.worn[k];return d&&!same(d,l)?'draft':!d&&l?'draft':d?'live':''};
 const rState=k=>{const d0=S.draft||{},l0=S.live||{},d=(d0.gear||{})[k]||(d0.newgear||{})[k]?[(d0.gear||{})[k],(d0.newgear||{})[k]]:null,l=(l0.gear||{})[k]||(l0.newgear||{})[k]?[(l0.gear||{})[k],(l0.newgear||{})[k]]:null;return d&&!same(d,l)?'draft':!d&&l?'draft':d?'live':''};
 const gState=k=>{const a=[wState(k),state(k),rState(k)];return a.includes('draft')?'draft':a.includes('live')?'live':''};
 const state=k=>{const d=S.draft&&S.draft.icons[k],l=S.live&&S.live.icons&&S.live.icons[k];return d&&!same(d,l)?'draft':!d&&l?'draft':d?'live':''};
 // ---- sprites: turn any icon picture into an editable pixel grid ----
 const hex=(r,g,b)=>'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
 async function bake(url){const im=new Image();im.src=url;await im.decode();const W=im.width,H=im.height,c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0);const d=x.getImageData(0,0,W,H).data,px=(X,Y)=>{const i=(Y*W+X)*4;return d[i+3]<128?-1:(d[i]<<16|d[i+1]<<8|d[i+2])};
  let s=1;for(const t of[8,6,5,4,3,2]){if(W%t||H%t)continue;let ok=true;for(let Y=0;Y<H&&ok;Y++)for(let X=0;X<W;X++)if(px(X,Y)!==px(X-X%t,Y-Y%t)){ok=false;break}if(ok){s=t;break}}
  const w=W/s,h=H/s,raw=[];const cnt=new Map();for(let y=0;y<h;y++)for(let X=0;X<w;X++){const v=px(X*s,y*s);raw.push(v);if(v>=0)cnt.set(v,(cnt.get(v)||0)+1)}
  // too many colours (smooth art): merge the closest pairs until it fits the palette
  let cols=[...cnt].map(([v,n])=>({r:v>>16,g:v>>8&255,b:v&255,n,src:[v]}));
  while(cols.length>MAXC){let bi=0,bj=1,bd=1e9;for(let i=0;i<cols.length;i++)for(let j=i+1;j<cols.length;j++){const a=cols[i],b=cols[j],dd=(a.r-b.r)**2+(a.g-b.g)**2+(a.b-b.b)**2;if(dd<bd){bd=dd;bi=i;bj=j}}
   const a=cols[bi],b=cols[bj],n=a.n+b.n;cols[bi]={r:Math.round((a.r*a.n+b.r*b.n)/n),g:Math.round((a.g*a.n+b.g*b.n)/n),b:Math.round((a.b*a.n+b.b*b.n)/n),n,src:a.src.concat(b.src)};cols.splice(bj,1)}
  cols.sort((a,b)=>b.n-a.n);const idx=new Map();cols.forEach((c2,i)=>c2.src.forEach(v=>idx.set(v,i)));
  return{w,h,s,pal:cols.map(c2=>hex(c2.r,c2.g,c2.b)),px:Uint8Array.from(raw.map(v=>v<0?255:idx.get(v)))}}
 const fromSp=sp=>({w:sp.w,h:sp.h,s:sp.s,pal:String(sp.p).split(',').filter(Boolean),px:Uint8Array.from(sp.d,ch=>ch==='.'?255:PXC.indexOf(ch))});
 function toSpPx(ed,px){// drop unused colours, keep order
  const used=[...new Set([...px].filter(v=>v!==255))].sort((a,b)=>a-b),map=new Map(used.map((v,i)=>[v,i]));
  return{w:ed.w,h:ed.h,s:ed.s,p:used.map(i=>ed.pal[i]).join(','),d:[...px].map(v=>v===255?'.':PXC[map.get(v)]).join('')}}
 const toSp=ed=>toSpPx(ed,ed.px);
 // ---- worn looks: one 96 x 112 layer per facing, painted over the character ----
 const WDN=['Front','Back','Side'],WK=A.WDIR,SLN={helm:'Head',body:'Body',legs:'Legs',main:'Main hand',off:'Off hand'};
 // the character is drawn exactly as the game draws it (the 16 x 32 kit sprite), at the worn layer's 2x scale: world (-24,-44) is layer (0,0)
 const CHC=new Map(),KS=(L,dir,st,fl)=>{try{return typeof kitSprite==='function'?kitSprite(L,dir,st,fl):null}catch(e){console.warn('kit',e);return null}};
 const bare=(c,sl)=>{if(sl==='helm'){c.ht=CH.ht;c.hcol=CH.hcol;delete c.mh;delete c.fc;delete c.oh}else if(sl==='body'){c.sh=CH.sh;delete c.mr}else if(sl==='legs')c.pn=CH.pn;return c};
 // dyes: the editor never bakes your own dyes into a look; "Preview a dye" shows one on the character and the dyeable colours
 const DYK={helm:'dyh',body:'dyb',legs:'dyl'},DYES=()=>(window.LUX&&LUX.EMP&&LUX.EMP.DYES)||[];
 function lookFor(k,hide,dye){let c;try{c=k&&EQ[k]&&window.SQGEAR?SQGEAR.wearing(k,()=>gearCH()):gearCH()}catch(e){c={...CH}}c={...c};delete c.wr;delete c.dyb;delete c.dyl;delete c.dyh;
  if(hide&&k&&EQ[k])bare(c,EQ[k].slot);if(dye&&k&&EQ[k]&&DYK[EQ[k].slot])c[DYK[EQ[k].slot]]=dye;return c}
 const myLook=()=>lookFor(S.tab==='worn'&&S.sel&&S.sel!=='__new'?S.sel:null,!!(S.ed&&S.ed.kind==='worn'&&S.ed.hide),S.ed&&S.ed.kind==='worn'?S.ed.pvd|0:0);
 function charCan(dir,st,fl){const L=myLook(),key=JSON.stringify(L)+dir+st+(fl?1:0);let c=CHC.get(key);if(c)return c;
  const ks=KS(L,dir,st,fl);if(ks){c=document.createElement('canvas');c.width=A.WW;c.height=A.WH;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(ks,32,38,32,64)}
  else{try{c=hdTrainer(L,dir,st,fl)}catch(e){console.warn('character',e);c=null}}
  if(c){if(CHC.size>40)CHC.clear();CHC.set(key,c)}return c}
 // the game's own look of a piece of gear, as worn layers to start from: what the character gains by wearing it
 // (armour), or its icon held at the right hand (weapons only show in the game while swinging)
 const kpx=c=>{const x=document.createElement('canvas');x.width=16;x.height=32;const t=x.getContext('2d');t.drawImage(c,0,0);return t.getImageData(0,0,16,32).data};
 async function gameLook(k){const e=EQ[k];if(!e)return null;const sl=e.slot,out=[0,1,2].map(()=>new Int32Array(A.WW*A.WH).fill(-1)),dyed=new Set();let any=false;
  const put=(arr,X,Y,v)=>{for(const[a,b]of[[0,0],[1,0],[0,1],[1,1]]){const xx=X+a,yy=Y+b;if(xx>=0&&yy>=0&&xx<A.WW&&yy<A.WH)arr[yy*A.WW+xx]=v}};
  if(sl==='helm'||sl==='body'||sl==='legs'){for(let d=0;d<3;d++){const a=KS(lookFor(k,false),d,0,false),b=KS(lookFor(k,true),d,0,false),c=KS(lookFor(k,false,1),d,0,false);if(!a||!b)continue;const da=kpx(a),db=kpx(b),dc=c?kpx(c):da;
    for(let y=0;y<32;y++)for(let x=0;x<16;x++){const i=(y*16+x)*4;if(da[i+3]<128)continue;if(db[i+3]>=128&&da[i]===db[i]&&da[i+1]===db[i+1]&&da[i+2]===db[i+2])continue;const v=da[i]<<16|da[i+1]<<8|da[i+2];put(out[d],32+x*2,38+y*2,v);any=true;
     if(dc[i]!==da[i]||dc[i+1]!==da[i+1]||dc[i+2]!==da[i+2])dyed.add(hex(da[i],da[i+1],da[i+2]))}}}
  else{try{const im=new Image();im.src=typeof eqIcon==='function'?eqIcon(k):iconURL(k);await im.decode();const c=document.createElement('canvas');c.width=14;c.height=14;const t=c.getContext('2d');t.imageSmoothingEnabled=false;t.drawImage(im,0,0,14,14);const d=t.getImageData(0,0,14,14).data;
    const HX=[33,59,48];for(let dd=0;dd<3;dd++)for(let y=0;y<14;y++)for(let x=0;x<14;x++){const i=(y*14+x)*4;if(d[i+3]<128)continue;out[dd][(82+y)*A.WW+HX[dd]+x]=d[i]<<16|d[i+1]<<8|d[i+2];any=true}}catch(e){console.warn(e)}}
  if(any)out.dy=dyed;return any?out:null}
 function fillFromGame(ed,L){const pal=ed.pal,idx=new Map(pal.map((c,i)=>[c,i]));const near=v=>{let bi=0,bd=1e9;pal.forEach((c,i)=>{const n=parseInt(c.slice(1),16),dd=((n>>16)-(v>>16))**2+((n>>8&255)-(v>>8&255))**2+((n&255)-(v&255))**2;if(dd<bd){bd=dd;bi=i}});return bi};
  for(let d=0;d<3;d++){const lay=ed.layers[d];lay.fill(255);for(let i=0;i<L[d].length;i++){const v=L[d][i];if(v<0)continue;const h=hex(v>>16,v>>8&255,v&255);let j=idx.get(h);if(j==null){if(pal.length<MAXC){pal.push(h);j=pal.length-1;idx.set(h,j)}else j=near(v)}lay[i]=j}}
  ed.dyi=new Set();if(L.dy)for(const h of L.dy){const j=idx.get(h);if(j!=null)ed.dyi.add(j)}
  ed.px=ed.layers[ed.dir];ed.rcd=[1,1,1];ed.undo=[];ed.redo=[]}
 let CBB=null;function charBox(){if(CBB)return CBB;let x0=96,y0=112,x1=0,y1=0;for(const d of[0,1,2]){const c=charCan(d,0,false);if(!c)continue;const a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  for(let i=0;i<a.length;i+=4)if(a[i+3]>0){const X=(i/4)%c.width,Y=Math.floor(i/4/c.width);if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y}}
  if(x1<x0)return{x0:0,y0:0,x1:95,y1:111};return CBB={x0:Math.max(0,x0-10),y0:Math.max(0,y0-16),x1:Math.min(95,x1+10),y1:Math.min(111,y1+4)}}
 function openWorn(k){S.sel=k;CBB=null;const w=S.draft.worn[k],pal=[],N=A.WW*A.WH,layers=[0,1,2].map(()=>new Uint8Array(N).fill(255));
  if(w)for(let d=0;d<3;d++){const sp=w[WK[d]];if(!sp||!A.valid(sp))continue;const map=String(sp.p).split(',').map(c=>{let i=pal.indexOf(c);if(i<0&&pal.length<MAXC){pal.push(c);i=pal.length-1}return Math.max(0,i)});
   const dd=A.pix(sp);for(let i=0;i<N;i++){const ch=dd[i];if(ch&&ch!=='.')layers[d][i]=map[PXC.indexOf(ch)]}}
  const fresh=!pal.length;if(fresh)pal.push('#2a1c24','#4a5060','#7a8496','#a8b2c4','#d8e0ec','#f8d848','#b83838');
  const ed=S.ed={kind:'worn',k,w:A.WW,h:A.WH,s:1,dir:0,layers,px:layers[0],pal,col:0,tool:'pen',undo:[],redo:[],dirty:false,hide:!!(w&&w.h),zoom:0,under:true,rc:[null,null,null],rcd:[1,1,1],pvd:0,dyi:new Set((w&&Array.isArray(w.dy)?w.dy:[]).map(h=>pal.findIndex(c=>c.toLowerCase()===String(h).toLowerCase())).filter(i=>i>=0))};draw();
  if(!w)startFromGame(ed,true)}
 async function startFromGame(ed,auto){const L=await gameLook(ed.k);if(S.ed!==ed)return;if(!L){if(!auto)toast('The game draws nothing for this item on a standing character.');return}
  if(auto)ed.pal.length=0;fillFromGame(ed,L);const sl=EQ[ed.k]&&EQ[ed.k].slot;if(sl==='helm'||sl==='body'||sl==='legs')ed.hide=true;ed.fromGame=1;if(!auto)ed.dirty=true;CBB=null;ed.recenter=1;draw();
  toast(sl==='main'||sl==='off'?'Started from its icon held in the hand (weapons only show in the game while swinging). Edit it and save.':'This is how the game draws it now. Edit it and save to make it its own look.')}
 function wornOut(ed){const o={};if(ed.hide)o.h=1;let any=false;const used=new Set(ed.layers.flatMap(L=>[...L]));const dy=[...(ed.dyi||[])].filter(i=>used.has(i)&&ed.pal[i]).map(i=>ed.pal[i].toLowerCase());if(dy.length&&DYK[EQ[ed.k]&&EQ[ed.k].slot])o.dy=[...new Set(dy)];for(let d=0;d<3;d++){const px=ed.layers[d];if(!px.some(v=>v!==255))continue;any=true;const sp=toSpPx(ed,px);o[WK[d]]={w:sp.w,h:sp.h,s:1,p:sp.p,r:A.pack(sp.d)}}return any?o:null}
 async function saveWorn(){const ed=S.ed;if(!ed)return;const o=wornOut(ed);if(o)S.draft.worn[ed.k]=o;else delete S.draft.worn[ed.k];
  try{await dset('draft/worn/'+ed.k,o);ed.dirty=false;toast(o?'Saved to draft. Publish it from the Publish tab.':'Nothing drawn, so this item keeps the game\'s own look.')}catch(e){fail(e)}
  if(A.previewing)A.preview(S.draft);paint();const it=root.querySelector('.dv-it[data-k="'+ed.k+'"]');if(it){const b=it.querySelector('.dv-bd'),s2=wState(ed.k);if(b)b.remove();if(s2)it.insertAdjacentHTML('afterbegin','<i class="dv-bd dv-'+s2+'">'+(s2==='draft'?'DRAFT':'LIVE')+'</i>')}}
 // ---- pet looks: a standing and a walking frame, drawn facing right ----
 const PFN=['Standing 1','Standing 2','Walking 1','Walking 2','Attack 1','Attack 2'],PF=['a','c','b','d','k','l'];// attack frames: used while a pet fights (the Imp)
 const pState=k=>{const d=S.draft&&S.draft.pets&&S.draft.pets[k],l=S.live&&S.live.pets&&S.live.pets[k];return d&&!same(d,l)?'draft':!d&&l?'draft':d?'live':''};
 async function openPet(item,fresh){const k=EQ[item].pet;S.sel=item;S.ed=null;draw();const L=!fresh&&S.draft.pets[k];let ed;
  try{if(L&&A.validPet(L)){const pal=[],N=L.w*L.h,layers=PF.map(()=>new Uint8Array(N).fill(255));
    for(let d=0;d<PF.length;d++){const sp=L[PF[d]];if(!sp||!A.valid(sp))continue;const map=String(sp.p).split(',').map(c=>{let i=pal.indexOf(c);if(i<0&&pal.length<MAXC){pal.push(c);i=pal.length-1}return Math.max(0,i)});const dd=A.pix(sp);for(let i=0;i<N;i++){const ch=dd[i];if(ch&&ch!=='.')layers[d][i]=map[PXC.indexOf(ch)]}}
    // an older look (one standing and one walking frame) walked between them: fill the new frames to match
    if(!L.c)layers[1].set(layers[0]);if(!L.d)layers[3].set(layers[0]);
    ed={w:L.w,h:L.h,s:L.s,ox:L.ox,oy:L.oy,pal,layers}}
   else{const cap=A.capturePet(k);if(cap){const b=await bake(cap.url);ed={w:b.w,h:b.h,s:b.s,ox:cap.ox,oy:cap.oy,pal:b.pal,layers:[b.px,b.px.slice(),b.px.slice(),b.px.slice(),new Uint8Array(b.px.length).fill(255),new Uint8Array(b.px.length).fill(255)]}}
    else ed={w:16,h:16,s:2,ox:-8,oy:-9,pal:[],layers:PF.map(()=>new Uint8Array(256).fill(255))}}}
  catch(e){console.warn(e);toast('Could not read that pet.');return}
  if(S.sel!==item)return;if(!ed.pal.length)ed.pal.push('#181018','#7a5a3a','#c89858','#f8e8c8');
  S.ed={...ed,kind:'pet',k,item,dir:0,px:ed.layers[0],col:0,tool:'pen',undo:[],redo:[],dirty:!!fresh,zoom:1,rc:PF.map(()=>null),rcd:PF.map(()=>1)};draw()}
 function petOut(ed){const o={w:ed.w,h:ed.h,s:ed.s,ox:ed.ox,oy:ed.oy};let any=false;for(let d=0;d<PF.length;d++){const px=ed.layers[d];if(!px)continue;if(!px.some(v=>v!==255))continue;any=true;const sp=toSpPx(ed,px);o[PF[d]]={w:sp.w,h:sp.h,s:sp.s,p:sp.p,r:A.pack(sp.d)}}return any?o:null}
 async function savePet(){const ed=S.ed;if(!ed)return;const o=petOut(ed);if(o)S.draft.pets[ed.k]=o;else delete S.draft.pets[ed.k];
  try{await dset('draft/pets/'+ed.k,o);ed.dirty=false;toast(o?'Saved to draft. Publish it from the Publish tab.':'Nothing drawn, so this pet keeps the game\'s own look.')}catch(e){fail(e)}
  if(A.previewing)A.preview(S.draft);paint();const it=root.querySelector('.dv-it[data-k="'+ed.item+'"]');if(it){const bd=it.querySelector('.dv-bd'),s2=pState(ed.k);if(bd)bd.remove();if(s2)it.insertAdjacentHTML('afterbegin','<i class="dv-bd dv-'+s2+'">'+(s2==='draft'?'DRAFT':'LIVE')+'</i>')}}
 function petResize(w,h){const ed=S.ed,MX=ed.kind==='prop'?320:96;w=Math.max(4,Math.min(MX,w|0));h=Math.max(4,Math.min(MX,h|0));if(w===ed.w&&h===ed.h)return;snapEd();const ox=Math.floor((w-ed.w)/2),oy=h-ed.h;// keeps the feet where they are
  ed.layers=ed.layers.map(L=>{const n=new Uint8Array(w*h).fill(255);for(let y=0;y<ed.h;y++)for(let x=0;x<ed.w;x++){const X=x+ox,Y=y+oy;if(X>=0&&Y>=0&&X<w&&Y<h)n[Y*w+X]=L[y*ed.w+x]}return n});
  ed.ox-=ox*ed.s/2;ed.oy-=oy*ed.s/2;ed.w=w;ed.h=h;ed.px=ed.layers[ed.dir];ed.undo=[];ed.redo=[];ed.fit=0;ed.z=0;ed.rcd=ed.layers.map(()=>1);draw()}
 function pets(){const q=S.q.toLowerCase(),all=A.petKinds(),keys=all.filter(k=>(!q||(INAME[k]||'').toLowerCase().includes(q)||k.includes(q))&&(!S.only||pState(EQ[k].pet)));
  let h='<div class="dv-spr'+(S.sel?' dv-has':'')+'"><div class="dv-ls"><input type="search" placeholder="Search '+all.length+' pets" value="'+E(S.q)+'" data-in="q">'+
   '<label class="dv-mut"><input type="checkbox" data-a="only"'+(S.only?' checked':'')+'> Only pets with a new look</label><div class="dv-grid">';
  for(const k of keys){const s2=pState(EQ[k].pet);h+='<button class="dv-it'+(S.sel===k?' dv-on':'')+'" data-k="'+E(k)+'">'+(s2?'<i class="dv-bd dv-'+s2+'">'+(s2==='draft'?'DRAFT':'LIVE')+'</i>':'')+'<img alt="" src="'+thumb(k)+'"><span>'+E(EQ[k].n||k)+'</span></button>'}
  if(!keys.length)h+='<p class="dv-mut">Nothing matches.</p>';
  h+='</div></div><div class="dv-ed">';
  if(!S.sel)h+='<div class="dv-card"><b>Pick a pet.</b><p class="dv-mut">Change how a pet looks when it follows you around: two standing frames it idles between and two walking frames it steps between, drawn facing right (it turns around by itself when it walks left). It starts from the pet\'s current look. Everyone sees the new look on everyone\'s pet. (The Imp isn\'t here yet: its look is tied to its fighting.)</p></div>';
  else if(!S.ed)h+='<p class="dv-mut">Opening...</p>';
  else{const ed=S.ed;h+='<div class="dv-row"><button class="dv-b dv-back" data-a="back">‹ All pets</button><b style="font-size:16px">'+E(EQ[ed.item].n)+'</b><span class="dv-mut">'+E(ed.item)+' · '+ed.w+' × '+ed.h+' pixels</span></div>'+
   '<div class="dv-row">'+PFN.map((n,d)=>'<button class="dv-b'+(ed.dir===d?' dv-tl dv-on':'')+'" data-dir="'+d+'">'+n+(ed.layers[d].some(v=>v!==255)?' •':'')+'</button>').join('')+
   '<button class="dv-b" data-a="pflip">Flip</button></div><div class="dv-row"><span class="dv-mut">Copy into this frame from:</span>'+PFN.map((n,d)=>d===ed.dir?'':'<button class="dv-b" data-copy="'+d+'">'+n+'</button>').join('')+'<span class="dv-mut">It idles between the two standing frames and steps between the two walking frames.</span></div>'+
   '<div class="dv-row dv-tools"></div><div class="dv-cv dv-cvw'+(ed.tool==='pan'?' dv-pan':'')+'"><canvas id="dvc"></canvas></div><div class="dv-pal"></div>'+
   '<div class="dv-pvw"><canvas id="dvwalk" width="400" height="112"></canvas><span class="dv-stx dv-st" style="flex:1"></span></div>'+
   '<div class="dv-row"><span class="dv-mut">Canvas</span><input type="number" data-in="pw" min="4" max="96" value="'+ed.w+'" style="width:70px"> × <input type="number" data-in="ph" min="4" max="96" value="'+ed.h+'" style="width:70px"><button class="dv-b" data-a="presize">Resize</button><span class="dv-mut">keeps the feet in place</span></div>'+
   '<div class="dv-row"><button class="dv-b dv-pri" data-a="save">Save to draft</button><button class="dv-b" data-a="revert">Undo unsaved changes</button><button class="dv-b" data-a="pcap">Start again from the game\'s look</button><button class="dv-b dv-bad" data-a="orig">Use the game\'s own look</button></div>'+
   '<p class="dv-mut">Keys: P pen · E eraser · F fill · I pick a colour · M move · + / − zoom · Ctrl+Z undo · Ctrl+Y redo · Ctrl+C / Ctrl+V copy and paste a picture · Ctrl+S save</p>'}
  return h+'</div></div>'}
 // ---- prop looks: trees, rocks, ores, plants, buildings and island props as they stand in the world ----
 const PR=()=>window.SQPROPS,key=k=>k.replace(/[.#$\[\]\/]/g,'_');// database keys can't hold . # $ [ ] /
 const gameName=k=>{const nt=/@n$/.test(k),q=PR()&&PR().list().find(x=>x.k===k.replace(/@n$/,''));return(q?q.n:k)+(nt?' (night)':'')},propName=k=>{if(/@n$/.test(k))return propName(k.slice(0,-2))+' (night)';const n=S.draft&&S.draft.pnames&&S.draft.pnames[k];return n||gameName(k)};
 const prState=k=>{if(!/@n$/.test(k)){const a=prState(k+'@n'),b=prState1(k);return a==='draft'||b==='draft'?'draft':a||b}return prState1(k)},prState1=k=>{const d=S.draft&&S.draft.props&&S.draft.props[k],l=S.live&&S.live.props&&S.live.props[k];return d&&!same(d,l)?'draft':!d&&l?'draft':d?'live':''};
 const TPC=new Map();const pThumb=k=>{const d=S.draft&&S.draft.props&&S.draft.props[k];if(d&&PR().valid(d)){const j=JSON.stringify(d).length+k;if(!TPC.has(j))TPC.set(j,A.render(d).toDataURL());return TPC.get(j)}return PR().thumb(k)};
 async function openProp(k,fresh,night){S.sel=k;S.ed=null;draw();const pk=night?k+'@n':k;let L=!fresh&&S.draft.props[pk],ed;if(night&&!L&&!fresh)L=S.draft.props[k];
  try{if(L&&PR().valid(L)){const pal=[],N=L.w*L.h,n=PR().frames(L),layers=[];
    for(let f=0;f<n;f++){const sp=PR().frSp(L,f),map=String(sp.p).split(',').map(c=>{let i=pal.indexOf(c);if(i<0&&pal.length<MAXC){pal.push(c);i=pal.length-1}return Math.max(0,i)}),dd=A.pix(sp),px=new Uint8Array(N).fill(255);
     for(let i=0;i<N;i++){const ch=dd[i];if(ch&&ch!=='.')px[i]=map[PXC.indexOf(ch)]}layers.push(px)}
    ed={w:L.w,h:L.h,s:L.s,ox:L.ox,oy:L.oy,pal,layers,ms:L.ms|0||250,sy:!!L.sy,ak:!!L.ak,af:L.af!=null?Math.max(0,L.af|0):(L.ak?1:0),fw:!!L.fw}}
   else{const cap=PR().capture(k,night)||(k==='f:door:o'?PR().capture('f:door:c',night):null);if(cap){const b=await bake(cap.url),n=cap.n|0||1;if(n>1){const fw=b.w/n,layers=[];for(let f=0;f<n;f++){const px=new Uint8Array(fw*b.h);for(let y=0;y<b.h;y++)for(let x=0;x<fw;x++)px[y*fw+x]=b.px[y*b.w+f*fw+x];layers.push(px)}ed={w:fw,h:b.h,s:b.s,ox:cap.ox,oy:cap.oy,pal:b.pal,layers,ms:250}}else ed={w:b.w,h:b.h,s:b.s,ox:cap.ox,oy:cap.oy,pal:b.pal,layers:[b.px]}}
    else ed=/^x:/.test(k)?{w:32,h:32,s:1,ox:0,oy:0,pal:[],layers:[new Uint8Array(1024).fill(255)]}:{w:32,h:32,s:2,ox:-8,oy:-16,pal:[],layers:[new Uint8Array(1024).fill(255)]}}}
  catch(e){console.warn(e);toast('Could not read that prop.');return}
  if(S.sel!==k)return;if(!ed.pal.length)ed.pal.push('#181018','#7a5a3a','#c89858','#f8e8c8');
  S.ed={ms:250,sy:false,...ed,kind:'prop',k:pk,base:k,night:!!night,dir:0,px:ed.layers[0],col:0,tool:'pen',undo:[],redo:[],dirty:!!fresh,zoom:1,rc:ed.layers.map(()=>null),rcd:ed.layers.map(()=>1)};draw()}
 // frames: add (a copy of the one you're on) or delete one; undo history starts again, since it remembers frames by number
 function propFrames(add){const ed=S.ed;if(add){if(ed.layers.length>=12){toast('Up to 12 frames.');return}ed.layers.splice(ed.dir+1,0,ed.layers[ed.dir].slice());ed.dir++}
  else{if(ed.layers.length<2)return;ed.layers.splice(ed.dir,1);ed.dir=Math.min(ed.dir,ed.layers.length-1)}
  ed.px=ed.layers[ed.dir];ed.rc=ed.layers.map(()=>null);ed.rcd=ed.layers.map(()=>1);ed.undo=[];ed.redo=[];ed.dirty=true;draw()}
 function propOut(ed){if(!ed.layers.some(L=>L.some(v=>v!==255)))return null;const sp=toSpPx(ed,ed.layers[0]),o={w:sp.w,h:sp.h,s:sp.s,ox:ed.ox,oy:ed.oy,p:sp.p,r:A.pack(sp.d)};
  if(ed.layers.length>1){o.fr=ed.layers.slice(1).map(L=>{const f=toSpPx(ed,L);return{p:f.p,r:A.pack(f.d)}});o.ms=Math.max(60,Math.min(5000,ed.ms|0||250));if(ed.sy)o.sy=1;const af=Math.min(ed.layers.length-1,ed.af|0);if(af>0){o.af=af;if(af===1)o.ak=1}}if(ed.fw)o.fw=1;return o}
 async function saveProp(){const ed=S.ed;if(!ed)return;const o=propOut(ed);if(o)S.draft.props[ed.k]=o;else delete S.draft.props[ed.k];
  try{await dset('draft/props/'+key(ed.k),o);ed.dirty=false;toast(o?'Saved to draft. Publish it from the Publish tab.':'Nothing drawn, so this keeps the game\'s own look.')}catch(e){fail(e)}
  if(A.previewing)A.preview(S.draft);paint();const it=root.querySelector('.dv-it[data-k="'+ed.base+'"]');if(it){const bd=it.querySelector('.dv-bd'),s2=prState(ed.base),im=it.querySelector('img');if(bd)bd.remove();if(s2)it.insertAdjacentHTML('afterbegin','<i class="dv-bd dv-'+s2+'">'+(s2==='draft'?'DRAFT':'LIVE')+'</i>');if(im)im.src=pThumb(ed.base)}}
 // a monster's rules: health and speed in % of the game's own, extra gold, drops (up to 8 rows: item, how many from-to,
 // chance %), and "instead of the game's own drops" (rep): what the game itself gives at the kill (items, gold, a boss's
 // golden chest) is taken back first. Older rules with one drop (dk/dn/dc) open as the first row.
 const MRN=8;
 function mrDrops(r,items){const L=Array.isArray(r.dr)?r.dr.slice():r.dk?[{k:r.dk,n:r.dn||1,x:r.dn||1,c:r.dc!=null?r.dc:100}]:[];const rows=Math.min(MRN,Math.max(2,L.length+1));
  let h='<div style="margin-top:8px"><b>Drops</b> <span class="dv-mut">(rolled each time it\'s beaten)</span>';
  for(let i=0;i<rows;i++){const d=L[i]||{};h+='<div class="dv-row" style="flex-wrap:wrap;margin-top:4px"><select data-mr="dk'+i+'"><option value="">(no item)</option>'+items.map(k=>'<option value="'+k+'"'+(d.k===k?' selected':'')+'>'+E(INAME[k])+'</option>').join('')+'</select>'+
   '<label class="dv-mut">from <input type="number" data-mr="dn'+i+'" min="1" max="1000" value="'+(d.n||1)+'" style="width:60px"></label><label class="dv-mut">to <input type="number" data-mr="dx'+i+'" min="1" max="1000" value="'+(d.x||d.n||1)+'" style="width:60px"></label>'+
   '<label class="dv-mut">chance % <input type="number" data-mr="dc'+i+'" min="0" max="100" step="0.1" value="'+(d.c!=null?d.c:100)+'" style="width:64px"></label></div>'}
  return h+(rows<MRN?'<p class="dv-mut" style="margin:4px 0">Save to get another empty row.</p>':'')+'<label class="dv-mut" style="display:block;margin-top:6px"><input type="checkbox" data-mr="rep"'+(r.rep?' checked':'')+'> Instead of the game\'s own drops (the items and golden chest it gives when beaten). XP, quest progress and the few coins any kill gives stay.</label></div>'}
 // its shots (monsters that shoot, 160): attack rate, extra damage, status effects, and a link to the projectile's look
 function mrShots(k,r){const MA=window.SQMOBATK;if(!MA||!MA.shoots(k))return'';const j=r.pj||{},fx=j.fx||{},jk='j:'+k.slice(2);
  const FXN={slow:'Slow (half speed)',burn:'Burn (1 heart / 1.5 s)',freeze:'Freeze (can\'t move)',poison:'Poison (1 heart / 3 s)'};
  let h='<div class="dv-card" style="margin:8px 0"><b>Its shots</b> <span class="dv-mut">(this monster shoots)</span><div class="dv-row" style="flex-wrap:wrap;margin-top:6px">'+
   '<label class="dv-mut">Attack rate %<br><input type="number" data-mr="pjr" min="10" max="1000" value="'+(j.rate||100)+'" style="width:80px"></label>'+
   '<label class="dv-mut">Extra damage (hearts)<br><input type="number" data-mr="pjd" min="0" max="10" value="'+(j.dmg|0)+'" style="width:80px"></label>'+
   '<button class="dv-b" data-k="'+E(jk)+'" style="align-self:flex-end">Edit how its shots look</button></div>'+
   '<p class="dv-mut" style="margin:6px 0 2px">Status effects when a shot hits you:</p>';
  for(const f of MA.FX){const e=fx[f]||[0,3];h+='<div class="dv-row" style="flex-wrap:wrap"><span class="dv-mut" style="min-width:170px">'+FXN[f]+'</span><label class="dv-mut">chance % <input type="number" data-mr="fx_'+f+'_c" min="0" max="100" value="'+(e[0]||0)+'" style="width:64px"></label><label class="dv-mut">seconds <input type="number" data-mr="fx_'+f+'_t" min="0.5" max="30" step="0.5" value="'+(e[1]||3)+'" style="width:64px"></label></div>'}
  return h+'<p class="dv-mut" style="margin:4px 0 0">Shots are drawn facing right and turn the way they fly. Rate 200% = twice as often.</p></div>'}
 // a monster's rules: health and speed in % of the game's own, extra gold, drops
 function mobRules(k){const r=S.draft.mobs[k]||{},M=window.SQISLIFE&&SQISLIFE.MOBS&&SQISLIFE.MOBS[k.slice(2)],items=Object.keys(INAME).sort((a,b)=>INAME[a].localeCompare(INAME[b]));
  return'<div class="dv-card" style="margin:8px 0"><b>How tough it is</b>'+(M?' <span class="dv-mut">(the game gives it '+M.hp+' health where it lives)</span>':'')+'<div class="dv-row" style="flex-wrap:wrap;margin-top:6px">'+
   '<label class="dv-mut">Health %<br><input type="number" data-mr="hp" min="10" max="1000" value="'+(r.hp||100)+'" style="width:80px"></label>'+
   '<label class="dv-mut">Speed %<br><input type="number" data-mr="spd" min="10" max="400" value="'+(r.spd||100)+'" style="width:80px"></label>'+
   '<label class="dv-mut">Damage %<br><input type="number" data-mr="dmg" min="0" max="1000" value="'+(r.dmg!=null?r.dmg:100)+'" style="width:80px"></label>'+
   '<label class="dv-mut">Extra gold<br><input type="number" data-mr="gold" min="0" max="100000" value="'+(r.gold||0)+'" style="width:90px"></label>'+
   '</div>'+mrDrops(r,items)+mrShots(k,r)+
   '<div class="dv-row"><button class="dv-b dv-pri" data-a="mrsave">Save rules to draft</button><button class="dv-b dv-bad" data-a="mrclear">Use the game\'s own rules</button><span class="dv-mut">100% = unchanged.</span></div></div>'}
 const HINT=k=>/^f:.*:[ewns]$/.test(k)?'This is the part drawn towards a neighbouring piece on that side, on top of the post or block (draw only what joins them; the editor starts from what the game adds there). Draw the post too, or the game keeps drawing its own fence.':
  /^f:/.test(k)?'A fence or wall piece is built from this post or block plus a part for each side that has another piece next to it.':/^x:/.test(k)?'What players see on the spot while it grows back (the game normally shows nothing). The picture starts one tile big at the tile it stood on.':
  /^v:sail_/.test(k)?'Your boat is drawn in two parts so you sit in it: the part behind you is drawn first, then you, then the part in front of you. Sailing west uses the east picture, mirrored.':/^c:/.test(k)?'A farm plot is drawn as soil, then the crop on top.':'';
 function props(mode){if(!PR())return'<p class="dv-mut">Props aren\'t available in this version of the game.</p>';const q=S.q.toLowerCase(),all=PR().list().filter(x=>mode==='m'?x.grp==='Monsters':x.grp!=='Monsters'),keys=all.filter(x=>(!q||propName(x.k).toLowerCase().includes(q)||x.n.toLowerCase().includes(q)||x.k.includes(q)||x.grp.toLowerCase().includes(q))&&(!S.only||prState(x.k)));
  let h='<div class="dv-spr'+(S.sel?' dv-has':'')+'"><div class="dv-ls"><input type="search" placeholder="Search '+all.length+' '+(mode==='m'?'monsters':'props')+'" value="'+E(S.q)+'" data-in="q">'+
   '<label class="dv-mut"><input type="checkbox" data-a="only"'+(S.only?' checked':'')+'> Only '+(mode==='m'?'monsters':'props')+' with changes</label><div class="dv-grid">';let grp='';
  for(const x of keys){if(x.grp!==grp){grp=x.grp;h+='<div class="dv-mut" style="grid-column:1/-1;margin-top:6px">'+E(grp)+'</div>'}const s2=prState(x.k);
   h+='<button class="dv-it'+(S.sel===x.k?' dv-on':'')+'" data-k="'+E(x.k)+'">'+(s2?'<i class="dv-bd dv-'+s2+'">'+(s2==='draft'?'DRAFT':'LIVE')+'</i>':'')+'<img alt="" src="'+pThumb(x.k)+'"><span>'+E(propName(x.k))+'</span></button>'}
  if(!keys.length)h+='<p class="dv-mut">Nothing matches.</p>';
  h+='</div></div><div class="dv-ed">';
  if(!S.sel&&mode==='m')h+='<div class="dv-card"><b>Pick a monster.</b><p class="dv-mut">Redraw how a monster looks and change how tough it is. It opens with the game\'s own look, its walk cycle already split into frames. Pictures face right; the game mirrors them to face you. Tick "Last frame is its attack pose" to have one frame shown only while it\'s right next to you. It flashes white when hit, as now. Below the picture you can change its health and speed and give it extra gold or an extra drop. Use the Test tab to spawn one next to you and see it.</p></div>';
  else if(!S.sel)h+='<div class="dv-card"><b>Pick a prop.</b><p class="dv-mut">Change how things look in the world: trees, rocks, ores, mushrooms, cacti and bushes, the town buildings, players\' houses, village details, boats, everything players build (stations, furniture, fences and walls, campfires), farm soil and crops, things inside shops, homes, dungeons and caves, the island villages, the buildings and props on the islands, and the spot a tree, rock or plant leaves behind while it grows back. It starts from the game\'s own look. Add frames to animate it, and a night look to change it after dark. A new look replaces every one of that kind for every player (trees that came in a few shapes all take the new one). How they work doesn\'t change: a tree is still chopped from its tile, and a building keeps its doors and walls where they were.</p></div>';
  else if(!S.ed)h+='<p class="dv-mut">Opening...</p>';
  else{const ed=S.ed;h+='<div class="dv-row"><button class="dv-b dv-back" data-a="back">‹ All props</button><input type="text" data-in="pname" maxlength="40" value="'+E(propName(ed.base))+'" placeholder="'+E(gameName(ed.base))+'" title="Its name here in the Dev Suite" style="max-width:240px;font-weight:600;font-size:15px"><span class="dv-mut">'+ed.w+' × '+ed.h+' pixels · the name is only used here in the Dev Suite</span></div>'+
   '<div class="dv-row"><button class="dv-b'+(ed.night?'':' dv-tl dv-on')+'" data-a="pday">☀ Day look</button><button class="dv-b'+(ed.night?' dv-tl dv-on':'')+'" data-a="pnight">☾ Night look'+(S.draft.props[ed.base+'@n']?' •':'')+'</button><span class="dv-mut">'+(ed.night?'Used after dark, in place of the day look. It starts as a copy of the day look (or the game\'s look at night).':'A night look is optional: draw one to change it after dark (lit windows, a glowing lamp).')+'</span></div>'+
   (HINT(ed.base)?'<p class="dv-mut" style="margin:0">'+HINT(ed.base)+'</p>':'')+
   '<div class="dv-row">'+ed.layers.map((L,d)=>'<button class="dv-b'+(ed.dir===d?' dv-tl dv-on':'')+'" data-dir="'+d+'">Frame '+(d+1)+'</button>').join('')+
    '<button class="dv-b" data-a="fradd">+ Add frame</button>'+(ed.layers.length>1?'<button class="dv-b dv-bad" data-a="frdel">Delete this frame</button>':'')+'</div>'+
   (ed.layers.length>1?'<div class="dv-row"><span class="dv-mut">Each frame shows for</span><input type="number" data-in="pms" min="60" max="5000" step="10" value="'+ed.ms+'" style="width:90px"><span class="dv-mut">ms ('+(1000/ed.ms).toFixed(1)+' frames a second)</span>'+
    '<label class="dv-chk"><input type="checkbox" data-a="psy"'+(ed.sy?' checked':'')+'> All of them move together</label><span class="dv-mut">'+(ed.sy?'':'(otherwise each one starts at its own point, so they don\'t sway in step)')+'</span></div>'+
    '<div class="dv-row"><span class="dv-mut">Copy into this frame from:</span>'+ed.layers.map((L,d)=>d===ed.dir?'':'<button class="dv-b" data-copy="'+d+'">Frame '+(d+1)+'</button>').join('')+'</div>':'')+
   (/^m:/.test(ed.base)?'<div class="dv-row"><label class="dv-mut">Attack frames <input type="number" data-in="paf" min="0" max="'+Math.max(0,ed.layers.length-1)+'" value="'+(ed.af|0)+'" style="width:56px"'+(ed.layers.length<2?' disabled':'')+'></label><span class="dv-mut">'+(ed.layers.length<2?'(add frames first)':'the last frames, played while it attacks (right next to you, or just after it shoots)')+'</span><label class="dv-chk"><input type="checkbox" data-a="pfw"'+(ed.fw?' checked':'')+'> Faces the way it walks</label><span class="dv-mut">(otherwise it turns to face you)</span></div>':'')+
   '<div class="dv-row dv-tools"></div><div class="dv-cv dv-cvw'+(ed.tool==='pan'?' dv-pan':'')+'"><canvas id="dvc"></canvas></div><div class="dv-pal"></div>'+
   '<div class="dv-pvw"><canvas id="dvwalk" width="480" height="240" style="width:min(480px,100%);height:auto"></canvas><span class="dv-stx dv-st" style="flex:1"></span></div>'+
   '<div class="dv-row"><span class="dv-mut">Canvas</span><input type="number" data-in="pw" min="4" max="320" value="'+ed.w+'" style="width:70px"> × <input type="number" data-in="ph" min="4" max="320" value="'+ed.h+'" style="width:70px"><button class="dv-b" data-a="presize">Resize</button><span class="dv-mut">keeps the bottom in place</span></div>'+
   '<div class="dv-row"><button class="dv-b dv-pri" data-a="save">Save to draft</button><button class="dv-b" data-a="revert">Undo unsaved changes</button><button class="dv-b" data-a="rcap">Start again from the game\'s look</button><button class="dv-b dv-bad" data-a="orig">Use the game\'s own look</button></div>'+
   (/^m:/.test(ed.base)?mobRules(ed.base):'')+
   '<p class="dv-mut">The preview shows the game\'s look on the left and yours on the right, next to a player for size. The bottom-middle of the picture is where it stands. Keys: P pen · E eraser · F fill · I pick a colour · M move · + / − zoom · Ctrl+Z undo · Ctrl+C / Ctrl+V copy and paste · Ctrl+S save</p>'}
  return h+'</div></div>'}
 // before / after, on grass, with a player for size (everything at the game's 2x detail, scaled to fit)
 const PRV={};function propPreview(c,ed){for(let d=0;d<ed.layers.length;d++)if(ed.rcd[d]){ed.rcd[d]=0;ed.rc[d]=ed.layers[d].some(v=>v!==255)?A.render(toSpPx(ed,ed.layers[d])):null}
  const nf=ed.layers.length,fi=nf>1?Math.floor(performance.now()/Math.max(60,ed.ms||250))%nf:0;
  if(!PRV[ed.k]){PRV[ed.k]='…';const cap=PR().capture(ed.base,ed.night);if(cap){const im=new Image();im.onload=()=>{const n=cap.n|0||1,fr=[];if(n>1)for(let j=0;j<n;j++){const c2=document.createElement('canvas');c2.width=im.width/n;c2.height=im.height;c2.getContext('2d').drawImage(im,-j*c2.width,0);fr.push(c2)}PRV[ed.k]={im:n>1?fr[0]:im,fr:n>1?fr:null,ox:cap.ox,oy:cap.oy}};im.src=cap.url}else PRV[ed.k]=null}
  const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#78c050';x.fillRect(0,0,c.width,c.height);x.fillStyle='#68b044';for(let i=0;i<60;i++)x.fillRect((i*53)%c.width,(i*37)%c.height,4,2);
  const O=PRV[ed.k]&&PRV[ed.k].im?PRV[ed.k]:null;if(O&&O.fr)O.im=O.fr[Math.floor(performance.now()/250)%O.fr.length];
  const af=Math.min(nf-1,ed.af|0),wn=nf-af,tk=Math.floor(performance.now()/Math.max(60,ed.ms||250)),L=(af>0?ed.rc[tk%(wn+af*2)>=wn?wn+(tk%af):tk%wn]:ed.rc[fi])||ed.rc[0],me=charCan(0,0,false);
  // fit: world px -> canvas px
  const bw=Math.max(O?O.im.width/2:0,L?L.width/2:0,24),bh=Math.max(O?O.im.height/2:0,L?L.height/2:0,32),k=Math.max(.5,Math.min(3,Math.min((c.width/2-30)/bw,(c.height-30)/bh)));
  x.fillStyle='rgba(0,0,0,.35)';x.font='600 12px system-ui';x.fillText('Now',8,16);x.fillText('New',c.width/2+8,16);x.fillRect(c.width/2,0,1,c.height);
  const ref=O?{ox:O.ox,oy:O.oy,w:O.im.width/2,h:O.im.height/2}:L?{ox:ed.ox,oy:ed.oy,w:L.width/2,h:L.height/2}:null,gy=c.height-12;
  const put=(im,ox,oy,cx)=>{if(!ref)return;const ax=cx-(ref.ox+ref.w/2)*k,ay=gy-(ref.oy+ref.h)*k;x.drawImage(im,ax+ox*k,ay+oy*k,im.width/2*k,im.height/2*k)};
  if(O)put(O.im,O.ox,O.oy,c.width/4);if(L)put(L,ed.ox,ed.oy,c.width*3/4);
  if(me){const mw=48*k,mh=56*k;x.drawImage(me,c.width/2-mw-4,c.height-12-mh+4*k,mw,mh)}}
 // walking preview in all four directions
 let walkT=0;setInterval(()=>{const c=document.getElementById('dvwalk'),ed=S.ed;if(!S.open||!c||!ed||!LAY(ed.kind))return;walkT++;
  if(ed.kind==='prop'){propPreview(c,ed);return}
  if(ed.kind==='pet'){for(let d=0;d<ed.layers.length;d++)if(ed.rcd[d]){ed.rcd[d]=0;ed.rc[d]=ed.layers[d].some(v=>v!==255)?A.render(toSpPx(ed,ed.layers[d])):null}
   const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#78c050';x.fillRect(0,0,c.width,c.height);x.fillStyle='#68b044';for(let i=0;i<40;i++)x.fillRect((i*53)%c.width,(i*37)%c.height,4,2);
   const S2=3,ph=walkT%60,goR=ph<30,px=goR?60+ph*10:340-(ph-30)*10,py=86,f=(walkT%2)&&(ph%30<28)?3:2,L=ed.rc[f]||ed.rc[2]||ed.rc[0];
   const still=(Math.floor(walkT/3)%2&&ed.rc[1])||ed.rc[0];if(still){x.drawImage(still,20,py+ed.oy*S2,still.width/2*S2,still.height/2*S2)}
   if(L){x.save();if(!goR){x.translate(px*2,0);x.scale(-1,1)}x.drawImage(L,px+ed.ox*S2,py+ed.oy*S2,L.width/2*S2,L.height/2*S2);x.restore()}return}
  for(let d=0;d<3;d++)if(ed.rcd[d]){ed.rcd[d]=0;ed.rc[d]=ed.layers[d].some(v=>v!==255)?A.render(toSpPx(ed,ed.layers[d])):null}
  const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,c.width,c.height);const st=[1,0,2,0][walkT%4],bob=st&&EQ[ed.k]&&EQ[ed.k].slot!=='legs'?-1:0;
  [[0,0],[1,0],[2,1],[2,0]].forEach(([d,fl],i)=>{const ox=i*100+2;const ch=charCan(d,st,!!fl);if(ch)x.drawImage(ch,ox,0);const L=ed.rc[d];if(!L)return;
   if(fl){x.save();x.translate(ox+A.WW,0);x.scale(-1,1);x.drawImage(L,0,bob);x.restore()}else x.drawImage(L,ox,bob)})},170);
 const thumb=k=>{const sp=S.draft&&S.draft.icons[k];return sp&&A.valid(sp)?A.render(sp).toDataURL():A.origIcon(k)};
 async function openSprite(k){S.sel=k;S.ed=null;draw();const sp=S.draft.icons[k];let ed;
  try{ed=sp&&A.valid(sp)?fromSp(sp):await bake(A.origIcon(k))}catch(e){toast('Could not read that sprite.');return}
  if(S.sel!==k)return;S.ed={...ed,k,tool:'pen',col:Math.max(0,ed.pal.length?0:-1),undo:[],redo:[],dirty:false};if(!S.ed.pal.length){S.ed.pal.push('#000000');S.ed.col=0}draw()}
 // ---- drawing on the editor canvas ----
 function cell(){const c=document.getElementById('dvc');if(!c||!S.ed)return 0;const ed=S.ed,box=c.parentElement.getBoundingClientRect();
  if((LAY(ed.kind))&&ed.fit)return Math.max(2,Math.round(ed.fit*ed.zoom));
  const fit=Math.max(2,Math.floor(Math.min((box.width-8)/ed.w,(Math.min(box.height||9999,window.innerHeight*.62)-8)/ed.h)));
  if(ed.kind==='pet'||ed.kind==='prop'){ed.fit=fit;return Math.max(2,Math.round(fit*ed.zoom))}if(ed.kind!=='worn')return fit;ed.fit=fit;if(!ed.zoom){const B=charBox(),bw=B.x1-B.x0+1,bh=B.y1-B.y0+1,want=Math.floor(Math.min((box.width-8)/bw,(window.innerHeight*.62-8)/bh));ed.zoom=Math.max(1,Math.min(8,want/fit));ed.recenter=1}
  return Math.max(2,Math.round(fit*ed.zoom))}
 function paint(){const c=document.getElementById('dvc'),ed=S.ed;if(!c||!ed)return;const z=down&&ed.z?ed.z:(ed.z=cell());if(c.width!==ed.w*z)c.width=ed.w*z;if(c.height!==ed.h*z)c.height=ed.h*z;const x=c.getContext('2d');
  if(LAY(ed.kind)){if(ed.kind!=='worn')ed.rcd=ed.layers.map(()=>1);else ed.rcd[ed.dir]=1;x.imageSmoothingEnabled=false;x.fillStyle='#2c323e';x.fillRect(0,0,c.width,c.height);
   if(ed.kind!=='worn'){x.fillStyle='rgba(255,255,255,.04)';for(let yy=0;yy<ed.h;yy++)for(let xx=(yy&1);xx<ed.w;xx+=2)x.fillRect(xx*z,yy*z,z,z)}
   if(ed.kind==='worn'&&ed.under){const u=charCan(ed.dir,0,false);if(u){x.globalAlpha=.8;x.drawImage(u,0,0,c.width,c.height);x.globalAlpha=1}}
   const DM=ed.kind==='worn'&&ed.pvd&&ed.dyi&&ed.dyi.size&&DYES()[ed.pvd-1]?A.dyeMap([...ed.dyi].map(i=>ed.pal[i]),DYES()[ed.pvd-1].c):null;
   for(let i=0;i<ed.px.length;i++){const v=ed.px[i];if(v===255)continue;x.fillStyle=DM&&ed.dyi.has(v)?DM[ed.pal[v].toLowerCase()]||ed.pal[v]:ed.pal[v];x.fillRect((i%ed.w)*z,Math.floor(i/ed.w)*z,z,z)}
   if(ed.recenter&&ed.kind==='worn'){ed.recenter=0;const cv=c.parentElement,B=charBox();cv.scrollLeft=((B.x0+B.x1)/2)*z-cv.clientWidth/2;cv.scrollTop=((B.y0+B.y1)/2)*z-cv.clientHeight/2}
   if(z>=8){x.strokeStyle='rgba(255,255,255,.07)';x.lineWidth=1;x.beginPath();for(let i=1;i<ed.w;i++){x.moveTo(i*z+.5,0);x.lineTo(i*z+.5,c.height)}for(let i=1;i<ed.h;i++){x.moveTo(0,i*z+.5);x.lineTo(c.width,i*z+.5)}x.stroke()}
   const n=new Set(ed.layers.flatMap(L=>[...L].filter(v=>v!==255))).size,st=document.querySelector('#dvs .dv-st');
   if(st)st.textContent=(ed.kind==='prop'?'Frame '+(ed.dir+1)+' of '+ed.layers.length:ed.kind==='pet'?PFN[ed.dir]+' frame':WDN[ed.dir]+' layer')+' · '+ed.w+' × '+ed.h+' · '+n+' colours'+(ed.dirty?'  ·  unsaved changes':'');return}
  for(let y=0;y<ed.h;y++)for(let X=0;X<ed.w;X++){const v=ed.px[y*ed.w+X];x.fillStyle=v===255?((X+y)%2?'#3a4150':'#2c323e'):ed.pal[v];x.fillRect(X*z,y*z,z,z)}
  if(z>=8){x.strokeStyle='rgba(255,255,255,.08)';x.lineWidth=1;x.beginPath();for(let i=1;i<ed.w;i++){x.moveTo(i*z+.5,0);x.lineTo(i*z+.5,c.height)}for(let i=1;i<ed.h;i++){x.moveTo(0,i*z+.5);x.lineTo(c.width,i*z+.5)}x.stroke()}
  const sp=toSp(ed),u=A.render(sp).toDataURL();for(const im of document.querySelectorAll('#dvs .dv-pv img')){im.src=u;const k=im.dataset.x2?2:1;im.style.width=Math.min(220,sp.w*sp.s*k)+'px';im.style.height=Math.min(220,sp.h*sp.s*k)+'px'}
  const st=document.querySelector('#dvs .dv-st');if(st)st.textContent=ed.w+' × '+ed.h+' pixels, shown at '+ed.s+'×  ·  '+sp.p.split(',').filter(Boolean).length+' colours'+(ed.dirty?'  ·  unsaved changes':'')}
 // copy / paste between pictures (any editor): the clipboard keeps colours, not palette numbers, and lives in
 // localStorage sq_dev_clip so it carries over between sprites, props, pets, monsters and gear. A paste is lined up by the
 // bottom middle (where things stand) and cropped to the picture; its colours join this picture's palette.
 function pxCopy(){const ed=S.ed;if(!ed)return;const c={w:ed.w,h:ed.h,p:[...ed.px].map(v=>v===255?'':ed.pal[v]||'')};try{localStorage.setItem('sq_dev_clip',JSON.stringify(c))}catch(e){}pxCopy.mem=c;
  toast('Copied ('+ed.w+' × '+ed.h+'). Open another picture and press Paste.')}
 function pxPaste(){const ed=S.ed;if(!ed)return;let c=pxCopy.mem;try{const v=JSON.parse(localStorage.getItem('sq_dev_clip')||'null');if(v)c=v}catch(e){}
  if(!c||!Array.isArray(c.p)){toast('Nothing copied yet: open a picture and press Copy first.');return}
  snapEd();const dx=Math.floor((ed.w-c.w)/2),dy=ed.h-c.h;let n=0;
  for(let y=0;y<c.h;y++)for(let x=0;x<c.w;x++){const col=c.p[y*c.w+x];if(!col)continue;const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=ed.w||Y>=ed.h)continue;
   let i=ed.pal.findIndex(q=>String(q).toLowerCase()===col.toLowerCase());if(i<0){if(ed.pal.length>=255)continue;ed.pal.push(col);i=ed.pal.length-1}ed.px[Y*ed.w+X]=i;n++}
  if(ed.rcd)ed.rcd=ed.rcd.map(()=>1);ed.dirty=true;drawPal();paint();toast(n?'Pasted'+(c.w!==ed.w||c.h!==ed.h?' (lined up at the bottom middle; this picture is '+ed.w+' × '+ed.h+', the copy '+c.w+' × '+c.h+')':'')+'. Undo takes it back.':'The copy was empty.')}
 const snapEd=()=>{const ed=S.ed;ed.undo.push({px:ed.px.slice(),pal:ed.pal.slice(),dir:ed.dir});if(ed.undo.length>80)ed.undo.shift();ed.redo=[];ed.dirty=true};
 function undo(r){const ed=S.ed;if(!ed)return;const a=r?ed.redo:ed.undo,b=r?ed.undo:ed.redo,s=a.pop();if(!s)return;
  if(LAY(ed.kind)){b.push({px:ed.layers[s.dir].slice(),pal:ed.pal.slice(),dir:s.dir});ed.layers[s.dir]=s.px;ed.rcd=ed.layers.map(()=>1);const sw=ed.dir!==s.dir;ed.dir=s.dir;ed.px=ed.layers[ed.dir];ed.pal=s.pal;ed.dirty=true;if(ed.col>=ed.pal.length)ed.col=ed.pal.length-1;if(sw){draw();return}drawPal();paint();return}
  b.push({px:ed.px.slice(),pal:ed.pal.slice()});ed.px=s.px;ed.pal=s.pal;ed.dirty=true;if(ed.col>=ed.pal.length)ed.col=ed.pal.length-1;drawPal();paint()}
 function fill(i,to){const ed=S.ed,from=ed.px[i];if(from===to)return;const st=[i];while(st.length){const j=st.pop();if(ed.px[j]!==from)continue;ed.px[j]=to;const X=j%ed.w;
  if(X>0)st.push(j-1);if(X<ed.w-1)st.push(j+1);if(j>=ed.w)st.push(j-ed.w);if(j<ed.w*(ed.h-1))st.push(j+ed.w)}}
 function at(e){const c=document.getElementById('dvc'),r=c.getBoundingClientRect(),z=r.width/S.ed.w,X=Math.floor((e.clientX-r.left)/z),Y=Math.floor((e.clientY-r.top)/z);return X>=0&&Y>=0&&X<S.ed.w&&Y<S.ed.h?Y*S.ed.w+X:-1}
 function use(e,first){const ed=S.ed,i=at(e);if(i<0){last=-1;return}
  if(ed.tool==='pick'){if(ed.px[i]!==255){ed.col=ed.px[i];ed.tool='pen';drawPal();drawTools()}return}
  if(first){snapEd();last=-1}
  if(ed.tool==='fill'){if(first)fill(i,ed.col)}
  else{const v=ed.tool==='erase'?255:ed.col;// a continuous line from the last point, so fast strokes leave no gaps
   if(last<0)ed.px[i]=v;else{let x0=last%ed.w,y0=Math.floor(last/ed.w);const x1=i%ed.w,y1=Math.floor(i/ed.w),dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let er=dx+dy;
    for(;;){ed.px[y0*ed.w+x0]=v;if(x0===x1&&y0===y1)break;const e2=2*er;if(e2>=dy){er+=dy;x0+=sx}if(e2<=dx){er+=dx;y0+=sy}}}
   last=i}
  paint()}
 // ---- screens ----
 const root=document.createElement('div');root.id='dvs';root.style.display='none';document.body.appendChild(root);
 for(const ev of['touchstart','touchmove','touchend','pointerdown','pointerup','mousedown','mouseup','click','wheel','contextmenu'])root.addEventListener(ev,e=>e.stopPropagation());
 const st=document.createElement('style');st.textContent=`
#dvs{position:fixed;inset:0;z-index:400;background:#151a22;color:#e6eaf0;font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;display:flex;flex-direction:column;-webkit-user-select:text;user-select:text;touch-action:auto}
#dvs *{box-sizing:border-box}#dvs button,#dvs input,#dvs textarea,#dvs select{font:inherit;color:inherit}
#dvs .dv-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:calc(env(safe-area-inset-top,0px) + 8px) 12px 8px;background:#0e1218;border-bottom:1px solid #2a3240}
#dvs .dv-ttl{font:600 17px "Pixelify Sans",system-ui,sans-serif;letter-spacing:.5px;margin-right:10px;color:#f8d848}
#dvs .dv-tab{background:none;border:0;padding:7px 12px;border-radius:7px;cursor:pointer;color:#a8b2c2}#dvs .dv-tab.dv-on{background:#26303e;color:#fff}
#dvs .dv-sp1{flex:1}#dvs .dv-x{background:#26303e;border:0;border-radius:7px;padding:7px 12px;cursor:pointer}
#dvs .dv-main{flex:1;min-height:0;overflow:auto;padding:12px}
#dvs .dv-b{background:#26303e;border:1px solid #384356;border-radius:7px;padding:7px 12px;cursor:pointer}#dvs .dv-b:hover{background:#303c4e}
#dvs .dv-b.dv-pri{background:#2f6fd8;border-color:#2f6fd8;color:#fff}#dvs .dv-b.dv-pri:hover{background:#3b7deb}#dvs .dv-b.dv-bad{border-color:#a04848;color:#f0a0a0}#dvs .dv-b.dv-arm{background:#c83838;border-color:#c83838;color:#fff}
#dvs .dv-b:disabled{opacity:.45;cursor:default}
#dvs input[type=text],#dvs input[type=number],#dvs input[type=search],#dvs textarea{background:#0e1218;border:1px solid #384356;border-radius:6px;padding:6px 8px;width:100%}
#dvs .dv-note{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);transform:translateX(-50%);background:#0e1218;border:1px solid #384356;border-radius:8px;padding:0 12px;max-width:90vw;pointer-events:none}
#dvs .dv-note:not(:empty){padding:8px 12px}
#dvs .dv-card{background:#1c232e;border:1px solid #2a3240;border-radius:10px;padding:14px;max-width:760px}
#dvs code{background:#0e1218;padding:2px 6px;border-radius:5px;word-break:break-all}
#dvs .dv-spr{display:grid;grid-template-columns:minmax(240px,320px) 1fr;gap:12px;height:100%}
#dvs .dv-ls{display:flex;flex-direction:column;min-height:0;gap:8px}#dvs .dv-ls .dv-grid{flex:1;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(68px,1fr));gap:6px;align-content:start;padding-right:4px}
#dvs .dv-it{background:#1c232e;border:1px solid #2a3240;border-radius:8px;padding:6px 4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;position:relative}
#dvs .dv-it.dv-on{border-color:#f8d848}#dvs .dv-it img{width:40px;height:40px;object-fit:contain;image-rendering:pixelated}
#dvs .dv-it span{font-size:11px;line-height:1.15;text-align:center;color:#c0c8d6;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
#dvs .dv-bd{position:absolute;top:3px;right:3px;font-size:9px;font-weight:700;border-radius:4px;padding:0 4px}#dvs .dv-bd.dv-draft{background:#f8a020;color:#000}#dvs .dv-bd.dv-live{background:#3a9a58;color:#fff}
#dvs .dv-ed{display:flex;flex-direction:column;gap:10px;min-width:0}
#dvs .dv-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
#dvs .dv-cv{flex:1;min-height:260px;display:flex;align-items:center;justify-content:center;background:#0e1218;border-radius:10px;overflow:hidden}
#dvs canvas{position:static;inset:auto;width:auto;height:auto}#dvs #dvc{image-rendering:pixelated;touch-action:none;cursor:crosshair;max-width:100%}
#dvs .dv-tl.dv-on{background:#f8d848;color:#000;border-color:#f8d848}
#dvs .dv-pal{display:flex;flex-wrap:wrap;gap:4px;align-items:center}#dvs .dv-sw{width:26px;height:26px;border-radius:5px;border:2px solid #0e1218;cursor:pointer;padding:0}#dvs .dv-sw.dv-on{outline:2px solid #f8d848;outline-offset:1px}
#dvs .dv-pvw{display:flex;gap:14px;align-items:end;flex-wrap:wrap}#dvs .dv-pvw figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;color:#8a94a6}
#dvs .dv-pvw .dv-pvl,#dvs .dv-pvw .dv-pvd{display:block;padding:6px;border-radius:6px;background:#f0ece0}#dvs .dv-pvw .dv-pvd{background:#2a2a34}#dvs .dv-pvw img{image-rendering:pixelated;display:block;max-width:none;border:0;border-radius:0}
#dvs .dv-stx,#dvs .dv-mut{color:#8a94a6;font-size:12px}#dvs .dv-st{min-height:2.8em;display:flex;align-items:flex-end}
#dvs table{border-collapse:collapse;width:100%}#dvs th{text-align:left;font-weight:600;color:#8a94a6;font-size:12px;padding:6px;position:sticky;top:0;background:#151a22;z-index:1}
#dvs td{padding:4px 6px;border-top:1px solid #232b37;vertical-align:top}#dvs td.dv-k{white-space:nowrap}#dvs td.dv-k small{display:block;color:#6a7486;font-size:11px}
#dvs td input,#dvs td textarea{min-width:70px}#dvs td textarea{min-width:220px;height:54px;resize:vertical}#dvs .dv-chg{border-color:#f8a020!important;background:#2a2316!important}
#dvs .dv-chips{display:flex;gap:6px;flex-wrap:wrap}
#dvs .dv-cl li{margin:4px 0}#dvs .dv-hl{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 0;border-top:1px solid #2a3240}
#dvs .dv-back{display:none}#dvs .dv-pvs{display:none}
#dvs .dv-cvw{display:block;overflow:auto;text-align:center;max-height:62vh}#dvs .dv-cvw #dvc{max-width:none;display:inline-block}#dvs .dv-cvw.dv-pan #dvc{cursor:grab}
#dvs #dvwalk{image-rendering:pixelated;background:#e8e4d4;border-radius:8px;width:300px;height:84px;max-width:100%}
#dvs .dv-chk{display:flex;gap:6px;align-items:center;color:#c0c8d6}#dvs .dv-sw.dv-dy{position:relative}#dvs .dv-sw.dv-dy::after{content:'D';position:absolute;right:-3px;bottom:-4px;font:700 9px/1 sans-serif;color:#111;background:#f8d848;border-radius:3px;padding:1px 2px}
#dvs .dv-rules{display:flex;flex-direction:column;gap:12px;max-width:560px}#dvs .dv-gf{display:grid;grid-template-columns:150px 1fr;gap:4px 10px;align-items:center}#dvs .dv-gf>small{grid-column:2}#dvs .dv-gf input,#dvs .dv-gf select{max-width:200px}#dvs .dv-gq{display:flex;gap:6px}#dvs .dv-gq input{width:70px}#dvs .dv-modes{border-bottom:1px solid #2a3442;padding-bottom:8px}
@media (max-width:520px){#dvs .dv-gf{grid-template-columns:1fr}#dvs .dv-gf>small{grid-column:1}}
@media (max-width:760px){#dvs .dv-pvlong{display:none}#dvs .dv-pvs{display:inline}#dvs .dv-top{gap:2px;padding-left:8px;padding-right:8px}#dvs .dv-tab{padding:7px 9px}#dvs .dv-ttl{width:100%;margin:0 0 2px}#dvs .dv-spr{grid-template-columns:1fr;height:auto}#dvs .dv-spr.dv-has .dv-ls{display:none}#dvs .dv-spr:not(.dv-has) .dv-ed{display:none}#dvs .dv-back{display:inline-block}#dvs .dv-ls .dv-grid{max-height:none}
 #dvs table,#dvs tbody,#dvs tr,#dvs td{display:block}#dvs thead{display:none}#dvs tr{border-top:1px solid #2a3240;padding:8px 0}#dvs td{border:0;padding:3px 0}#dvs td[data-l]::before{content:attr(data-l);display:block;font-size:11px;color:#8a94a6}#dvs td textarea{min-width:0}}`;
 document.head.appendChild(st);
 const TABS=[['sprites','Sprites'],['worn','Gear'],['pets','Pets'],['props','Props'],['monsters','Monsters'],['stats','Stats'],['islands','Islands'],['publish','Publish']];
 function draw(){if(!S.open)return;const nch=S.draft?changes().length:0;
  let h='<div class="dv-top"><span class="dv-ttl">Dev Suite</span>'+TABS.map(([k,n])=>'<button class="dv-tab'+(S.tab===k?' dv-on':'')+'" data-tab="'+k+'">'+n+(k==='publish'&&nch?' ('+nch+')':'')+'</button>').join('')+
   '<span class="dv-sp1"></span>'+(S.ok==='yes'?'<label class="dv-mut" style="display:flex;gap:6px;align-items:center;margin-right:8px"><input type="checkbox" data-a="pv"'+(A.previewing?' checked':'')+'> <span class="dv-pvlong">Show unpublished edits in my game</span><span class="dv-pvs">Preview drafts</span></label>':'')+
   '<button class="dv-x" data-a="close">Close</button></div><div class="dv-main">'+main()+'</div><div class="dv-note">'+E(S.note)+'</div>';
  const sc=root.querySelector('.dv-ls .dv-grid'),top=sc?sc.scrollTop:0,mn=root.querySelector('.dv-main'),mtop=mn?mn.scrollTop:0,cw=root.querySelector('.dv-cvw'),cws=cw?[cw.scrollLeft,cw.scrollTop]:null;
  root.innerHTML=h;const sc2=root.querySelector('.dv-ls .dv-grid');if(sc2)sc2.scrollTop=top;const mn2=root.querySelector('.dv-main');if(mn2)mn2.scrollTop=mtop;const cw2=cws&&root.querySelector('.dv-cvw');if(cw2)requestAnimationFrame(()=>{cw2.scrollLeft=cws[0];cw2.scrollTop=cws[1]});
  if((S.tab==='sprites'||S.tab==='worn'||S.tab==='pets'||S.tab==='props'||S.tab==='monsters')&&S.ed){drawPal();drawTools();paint();requestAnimationFrame(paint)}
  if(S.ok==='yes'&&EXT[S.tab]&&EXT[S.tab].after)EXT[S.tab].after()}
 function main(){
  if(S.ok===null)return'<p class="dv-mut">Loading...</p>';
  if(S.ok==='signin')return'<div class="dv-card"><b>Sign in first.</b><p>The Dev Suite saves to the online database, so sign in with your Google account (Options > Sign in), then open it again.</p></div>';
  if(S.ok==='setup')return'<div class="dv-card"><b>One-time setup: let this account publish</b><p>The database doesn\'t know this account is the developer yet. In the Firebase console:</p><ol>'+
   '<li>Realtime Database &gt; <b>Rules</b>: paste the new <code>database.rules.json</code> and click <b>Publish</b>.</li>'+
   '<li>Realtime Database &gt; <b>Data</b>: hover the top line, click <b>+</b>, type <code>devs</code> as the key and leave the value empty, then click <b>+</b> next to <code>devs</code> and add your account ID below as the key with the value <code>true</code>.</li></ol>'+
   '<p>Your account ID:<br><code>'+E(S.uid)+'</code> <button class="dv-b" data-a="copyid">Copy</button></p><button class="dv-b dv-pri" data-a="retry">I\'ve done it, try again</button></div>';
  if(S.ok==='error')return'<div class="dv-card"><b>Couldn\'t reach the database.</b><p class="dv-mut">'+E(S.note)+'</p><button class="dv-b" data-a="retry">Try again</button></div>';
  if(EXT[S.tab])return EXT[S.tab].render();
  if(S.tab==='sprites')return sprites();if(S.tab==='worn')return worn();if(S.tab==='pets')return pets();if(S.tab==='props')return props();if(S.tab==='monsters')return props('m');if(S.tab==='stats')return stats();return publish()}
 function sprites(){const q=S.q.toLowerCase(),keys=A.itemKeys().filter(k=>(!q||(INAME[k]||'').toLowerCase().includes(q)||k.includes(q))&&(!S.only||state(k)));
  let h='<div class="dv-spr'+(S.sel?' dv-has':'')+'"><div class="dv-ls"><input type="search" placeholder="Search '+A.itemKeys().length+' item sprites" value="'+E(S.q)+'" data-in="q">'+
   '<label class="dv-mut"><input type="checkbox" data-a="only"'+(S.only?' checked':'')+'> Only edited sprites</label><div class="dv-grid">';
  for(const k of keys){const s=state(k);h+='<button class="dv-it'+(S.sel===k?' dv-on':'')+'" data-k="'+E(k)+'">'+(s?'<i class="dv-bd dv-'+s+'">'+(s==='draft'?'DRAFT':'LIVE')+'</i>':'')+'<img alt="" src="'+thumb(k)+'"><span>'+E(INAME[k]||k)+'</span></button>'}
  if(!keys.length)h+='<p class="dv-mut">Nothing matches.</p>';
  h+='</div></div><div class="dv-ed">';
  if(!S.sel)h+='<div class="dv-card"><b>Pick a sprite to edit.</b><p class="dv-mut">Every item\'s icon is here: what players see in bags, chests, shops and the equipment screen. Paint it, save it to your draft, then publish it from the Publish tab.</p></div>';
  else if(!S.ed)h+='<p class="dv-mut">Opening...</p>';
  else{const k=S.sel;h+='<div class="dv-row"><button class="dv-b dv-back" data-a="back">‹ All sprites</button><b style="font-size:16px">'+E(INAME[k]||k)+'</b><span class="dv-mut">'+E(k)+'</span></div>'+
   '<div class="dv-row dv-tools"></div><div class="dv-cv"><canvas id="dvc"></canvas></div><div class="dv-pal"></div>'+
   '<div class="dv-pvw dv-pv"><figure><span class="dv-pvl"><img alt=""></span>light</figure><figure><span class="dv-pvd"><img alt=""></span>dark</figure><figure><span class="dv-pvd"><img alt="" data-x2="1"></span>2× size</figure><span class="dv-stx dv-st" style="flex:1"></span></div>'+
   '<div class="dv-row"><button class="dv-b dv-pri" data-a="save">Save to draft</button><button class="dv-b" data-a="revert">Undo unsaved changes</button><button class="dv-b dv-bad" data-a="orig">Use the game\'s original</button></div>'+
   '<p class="dv-mut">Keys: P pen · E eraser · F fill · I pick a colour · Ctrl+Z undo · Ctrl+Y redo · Ctrl+C / Ctrl+V copy and paste a picture · Ctrl+S save</p>'}
  return h+'</div></div>'}
 // ---- Gear: one screen per weapon or armour piece: its look on the character, its icon, and how it works ----
 const GMODES=[['look','On the character'],['icon','Icon'],['rules','How it works']];
 function openGear(k){S.sel=k;if(S.gm==='icon')return openSprite(k);if(S.gm==='rules'){S.ed=null;draw();return}openWorn(k)}
 function worn(){const q=S.q.toLowerCase(),all=A.wornKeys(),keys=all.filter(k=>(!q||(INAME[k]||'').toLowerCase().includes(q)||k.includes(q))&&(!S.only||gState(k)));
  let h='<div class="dv-spr'+(S.sel?' dv-has':'')+'"><div class="dv-ls"><input type="search" placeholder="Search '+all.length+' weapons and armour" value="'+E(S.q)+'" data-in="q">'+
   '<label class="dv-mut"><input type="checkbox" data-a="only"'+(S.only?' checked':'')+'> Only edited gear</label><button class="dv-b'+(S.sel==='__new'?' dv-tl dv-on':'')+'" data-a="ngnew">+ New gear item</button><div class="dv-grid">';
  for(const k of keys){const s2=gState(k);h+='<button class="dv-it'+(S.sel===k?' dv-on':'')+'" data-k="'+E(k)+'">'+(s2?'<i class="dv-bd dv-'+s2+'">'+(s2==='draft'?'DRAFT':'LIVE')+'</i>':'')+'<img alt="" src="'+thumb(k)+'"><span>'+E(INAME[k]||k)+'</span></button>'}
  if(!keys.length)h+='<p class="dv-mut">Nothing matches.</p>';
  h+='</div></div><div class="dv-ed">';
  if(S.sel==='__new')return h+newHtml()+'</div></div>';
  if(!S.sel)return h+'<div class="dv-card"><b>Pick a helmet, body, legs, weapon or shield.</b><p class="dv-mut">Everything about a piece of gear is here. <b>On the character</b>: draw how it looks on the character from the front, back and side, with the character wearing it underneath. <b>Icon</b>: its picture in bags, chests and shops. <b>How it works</b>: its damage, range, block, mana cost and what it needs. Save each to your draft, then publish from the Publish tab. <b>+ New gear item</b> makes a brand-new piece that starts out working like one you pick.</p></div></div></div>';
  const k=S.sel,sl=EQ[k]&&EQ[k].slot;
  h+='<div class="dv-row"><button class="dv-b dv-back" data-a="back">‹ All gear</button><b style="font-size:16px">'+E(INAME[k]||k)+'</b><span class="dv-mut">'+E(SLN[sl]||sl)+' · '+E(k)+'</span></div>'+
   '<div class="dv-row dv-modes">'+GMODES.map(([m,n])=>'<button class="dv-b'+(S.gm===m?' dv-tl dv-on':'')+'" data-a="gm" data-m="'+m+'">'+n+'</button>').join('')+'</div>';
  if(S.gm==='rules')return h+rulesHtml(k)+'</div></div>';
  if(!S.ed)return h+'<p class="dv-mut">Opening...</p></div></div>';
  if(S.ed.kind!=='worn')return h+'<div class="dv-row dv-tools"></div><div class="dv-cv"><canvas id="dvc"></canvas></div><div class="dv-pal"></div>'+
   '<div class="dv-pvw dv-pv"><figure><span class="dv-pvl"><img alt=""></span>light</figure><figure><span class="dv-pvd"><img alt=""></span>dark</figure><figure><span class="dv-pvd"><img alt="" data-x2="1"></span>2× size</figure><span class="dv-stx dv-st" style="flex:1"></span></div>'+
   '<div class="dv-row"><button class="dv-b dv-pri" data-a="save">Save to draft</button><button class="dv-b" data-a="revert">Undo unsaved changes</button><button class="dv-b dv-bad" data-a="orig">Use the game\'s original</button></div>'+
   '<p class="dv-mut">Keys: P pen · E eraser · F fill · I pick a colour · Ctrl+Z undo · Ctrl+Y redo · Ctrl+C / Ctrl+V copy and paste a picture · Ctrl+S save</p></div></div>';
  const ed=S.ed;h+='<div class="dv-row">'+WDN.map((n,d)=>'<button class="dv-b'+(ed.dir===d?' dv-tl dv-on':'')+'" data-dir="'+d+'">'+n+(ed.layers[d].some(v=>v!==255)?' •':'')+'</button>').join('')+'<span class="dv-mut">'+(ed.dir===2?'Side faces right; facing left is mirrored for you.':'')+'</span></div>'+
   '<div class="dv-row dv-tools"></div><div class="dv-cv dv-cvw'+(ed.tool==='pan'?' dv-pan':'')+'"><canvas id="dvc"></canvas></div><div class="dv-pal"></div>'+
   '<div class="dv-pvw"><canvas id="dvwalk" width="400" height="112"></canvas><span class="dv-stx dv-st" style="flex:1"></span></div>'+
   '<div class="dv-row"><label class="dv-chk"><input type="checkbox" data-a="under"'+(ed.under?' checked':'')+'> Show the character wearing it underneath</label>'+
   (sl==='helm'||sl==='body'||sl==='legs'?'<label class="dv-chk"><input type="checkbox" data-a="hide"'+(ed.hide?' checked':'')+'> Hide the game\'s own '+(sl==='helm'?'hat':sl==='body'?'shirt colour':'trouser colour')+' for this item</label>':'')+'</div>'+
   (DYK[sl]?'<div class="dv-row"><span class="dv-mut">Dyes:</span><button class="dv-b'+(ed.dyi&&ed.dyi.has(ed.col)?' dv-tl dv-on':'')+'" data-a="dytog">'+(ed.dyi&&ed.dyi.has(ed.col)?'✓ Selected colour takes dye':'Make selected colour dyeable')+'</button>'+
    '<label class="dv-mut">Preview a dye <select data-in="pvd"><option value="0">None</option>'+DYES().map((d,i)=>'<option value="'+(i+1)+'"'+(ed.pvd===i+1?' selected':'')+'>'+E(d.n)+'</option>').join('')+'</select></label>'+
    '<span class="dv-mut">Dyeable colours (marked D) take a player\'s dye and keep your light and dark shades.</span></div>':'')+
   '<div class="dv-row"><span class="dv-mut">Copy into this layer from:</span>'+WDN.map((n,d)=>d===ed.dir?'':'<button class="dv-b" data-copy="'+d+'">'+n+'</button>').join('')+'<button class="dv-b dv-bad" data-a="clr">Clear this layer</button><button class="dv-b '+(S.arm==='wcap'?'dv-arm':'')+'" data-a="wcap">'+(S.arm==='wcap'?'Tap again: replaces all three layers':'Start again from the game\'s look')+'</button></div>'+
   '<div class="dv-row"><button class="dv-b dv-pri" data-a="save">Save to draft</button><button class="dv-b" data-a="revert">Undo unsaved changes</button><button class="dv-b dv-bad" data-a="orig">Use the game\'s own look</button></div>'+
   '<p class="dv-mut">Keys: P pen · E eraser · F fill · I pick a colour · M move · + / − zoom · Ctrl+Z undo · Ctrl+Y redo · Ctrl+C / Ctrl+V copy and paste a picture · Ctrl+S save</p>';
  return h+'</div></div>'}
 // "How it works": numbers are shown as they are for your character now; what's saved is the change from the game's own number
 const FXH={ls:'Chance to heal 1 heart when you hit',burn:'Chance to set what you hit on fire',slow:'Chance to slow what you hit',crit:'Chance to hit again for the same damage',spd:'Walk and run faster',xp:'More XP from everything'};
 function rulesHtml(k){const G=window.SQGEAR;if(!G)return'<p class="dv-mut">Gear rules aren\'t available.</p>';
  const b=G.base(k),d=S.draft.gear[k]||{},t=b.kind,ng=S.draft.newgear[k],lab=(n,f,val,orig,hint)=>{const chg=val!==orig;
   return'<label class="dv-gf"><span>'+n+'</span><input type="number" data-g="'+f+'" value="'+val+'"'+(chg?' class="dv-chg"':'')+'><small class="dv-mut">Game\'s own: '+orig+(hint||'')+'</small></label>'};
  let h='<div class="dv-card dv-rules">';
  if(ng){h+='<label class="dv-gf"><span>Name</span><input type="text" maxlength="40" data-gn="n" value="'+E(ng.n)+'"></label>'+
    '<label class="dv-gf"><span>Sell price</span><input type="number" min="0" data-gn="v" value="'+(ng.v|0)+'"><small class="dv-mut">Gold</small></label>'+
    '<label class="dv-gf"><span>Description</span><textarea maxlength="300" data-gn="d" rows="2">'+E(ng.d||'')+'</textarea><small class="dv-mut">Works like: '+E(INAME[ng.b]||ng.b)+' (same slot and look until you draw its own)</small></label>'}
  else{const io=merged0(k);h+='<label class="dv-gf"><span>Name</span><input type="text" data-gs="n" value="'+E(io.n)+'"'+(io.n!==A.TABLES.items.orig(k).n?' class="dv-chg"':'')+'></label>'+
   '<label class="dv-gf"><span>Sell price</span><input type="number" min="0" data-gs="v" value="'+io.v+'"'+(io.v!==A.TABLES.items.orig(k).v?' class="dv-chg"':'')+'><small class="dv-mut">Gold</small></label>'}
  if(t==='melee')h+=lab('Damage per hit','dmg',b.dmg+(d.dmg||0),b.dmg);
  if(t==='bow')h+=lab('Arrow damage','dmg',b.dmg+(d.dmg||0),b.dmg)+lab('Range','rng',b.rng+(d.rng||0),b.rng,' (about 16 per tile)');
  if(t==='wand')h+=lab('Spell damage','dmg',b.dmg+(d.dmg||0),b.dmg)+lab('Mana per spell','mp',d.mp!=null?d.mp:b.mp,b.mp,' · a '+E(EQ[k].el)+' wand sets the cost of every '+E(EQ[k].el)+' spell while it\'s in your hand');
  if(t==='armour')h+=lab('Block chance (%)','blk',b.blk+(d.blk||0),b.blk,' · added to the wearer\'s block chance (capped at 60-80% in total)');
  const q0=b.rq||{s:0,l:0},q=d.rq||q0;
  h+='<label class="dv-gf"><span>Needs</span><span class="dv-gq"><select data-g="rqs">'+SKN.map((n,i)=>'<option value="'+i+'"'+(i===q.s?' selected':'')+'>'+E(n)+'</option>').join('')+'</select>'+
   '<input type="number" min="0" max="99" data-g="rql" value="'+q.l+'"'+(d.rq?' class="dv-chg"':'')+' title="Level (0 = nothing needed)"></span><small class="dv-mut">Level 0 means anyone can use it. Game\'s own: '+(b.rq&&b.rq.l?E(SKN[b.rq.s])+' '+b.rq.l:'nothing')+'</small></label>';
  h+='<b style="margin-top:6px">Special effects</b><p class="dv-mut" style="margin:0">While it\'s worn. Effects from every piece a player wears add up. Hits are sword hits, arrows and spells.</p>';
  const fx=d.fx||{};for(const x in G.FXN)h+='<label class="dv-gf"><span>'+G.FXN[x]+' (%)</span><input type="number" min="0" max="'+G.FXMAX[x]+'" data-g="fx_'+x+'" value="'+(fx[x]|0)+'"'+(fx[x]?' class="dv-chg"':'')+'><small class="dv-mut">'+FXH[x]+(G.FXMAX[x]<100?' (up to '+G.FXMAX[x]+'%)':'')+'</small></label>';
  h+='<p class="dv-mut">Numbers are what your character gets right now: your levels, perks and other gear count too, so other players may see slightly different totals. What you change is added for everyone. Changes save to your draft as you go.</p>'+
   '<div class="dv-row">'+(S.draft.gear[k]?'<button class="dv-b '+(S.arm==='grst'?'dv-arm':'dv-bad')+'" data-a="grst">'+(S.arm==='grst'?'Tap again to go back to the game\'s own rules':'Use the game\'s own rules')+'</button>':'')+'</div></div>';
  if(ng)h+=ngHtml(k,ng);
  return h}
 // a new gear item: how players get it, a test copy for you, and removing it before it's published
 const mats=()=>{const m=new Set();for(const r of SM)if(!r._cu)for(const c in r.c||{})if(INAME[c])m.add(c);return[...m].sort((a,b)=>(INAME[a]>INAME[b]?1:-1))};
 function ngHtml(k,ng){const sm=ng.sm||{c:{},lv:1},rows=Object.entries(sm.c);while(rows.length<2)rows.push(['',0]);const M=mats(),pub=S.live&&S.live.newgear&&S.live.newgear[k];
  let h='<div class="dv-card dv-rules" style="margin-top:12px"><b>Getting it</b><p class="dv-mut" style="margin:0">Players can find it in island loot chests (pick it in the island builder) and, if you give it a recipe, make it at an anvil.</p>';
  rows.slice(0,3).forEach(([m,c],i)=>{h+='<label class="dv-gf"><span>'+(i?'and':'Anvil recipe')+'</span><span class="dv-gq"><select data-gr="m'+i+'"><option value="">'+(i?'(nothing else)':'(no recipe)')+'</option>'+M.map(x=>'<option value="'+x+'"'+(x===m?' selected':'')+'>'+E(INAME[x])+'</option>').join('')+'</select><input type="number" min="0" max="99" data-gr="c'+i+'" value="'+(c|0)+'"></span></label>'});
  h+='<label class="dv-gf"><span>Smithing level</span><input type="number" min="1" max="99" data-gr="lv" value="'+(sm.lv|0||1)+'"></label>';
  h+='<div class="dv-row"><button class="dv-b" data-a="nggive">Put one in my bag (to test)</button>'+(pub?'':'<button class="dv-b '+(S.arm==='ngdel'?'dv-arm':'dv-bad')+'" data-a="ngdel">'+(S.arm==='ngdel'?'Tap again to delete it':'Delete this item')+'</button>')+'</div>'+
   (pub?'<p class="dv-mut">Published items can\'t be deleted, because players may already have one.</p>':'<p class="dv-mut">It only exists in your game until you publish it.</p>')+'</div>';
  return h}
 function newHtml(){const G=window.SQGEAR,B=(G?G.gearKeys():[]).filter(k=>!EQ[k].custom);const by={};for(const k of B)(by[EQ[k].slot]=by[EQ[k].slot]||[]).push(k);
  return'<div class="dv-card dv-rules"><b>New gear item</b><p class="dv-mut" style="margin:0">It starts out working and looking like the item you pick. Then give it its own look, icon, numbers and effects.</p>'+
   '<label class="dv-gf"><span>Name</span><input type="text" maxlength="40" data-in="ngn" placeholder="Frostbite blade"></label>'+
   '<label class="dv-gf"><span>Works like</span><select data-in="ngb">'+['main','off','helm','body','legs'].filter(s=>by[s]).map(s=>'<optgroup label="'+E(SLN[s]||s)+'">'+by[s].map(k=>'<option value="'+k+'">'+E(INAME[k])+'</option>').join('')+'</optgroup>').join('')+'</select></label>'+
   '<div class="dv-row"><button class="dv-b dv-pri" data-a="ngmake">Create it</button></div></div>'}
 const merged0=k=>A.merged('items',k,(S.draft.stats.items||{})[k]);
 async function gearSet(k,f,v){const G=window.SQGEAR,b=G.base(k),cur={...(S.draft.gear[k]||{})};
  if(f==='dmg'||f==='rng'||f==='blk'){const n=Math.round(Number(v));if(!isFinite(n)||v==='')return draw();const dl=n-(b[f]|0);if(dl)cur[f]=dl;else delete cur[f]}
  else if(f==='mp'){const n=Math.max(0,Math.round(Number(v))||0);if(n===b.mp)delete cur.mp;else cur.mp=n}
  else if(f.startsWith('fx_')){const x=f.slice(3);cur.fx={...(cur.fx||{}),[x]:Math.max(0,Math.round(Number(v))||0)}}
  else if(f==='rqs'||f==='rql'){const dq=b.rq||{s:0,l:0},q={...(cur.rq||dq)};if(f==='rqs')q.s=+v;else q.l=Math.max(0,Math.min(99,Math.round(Number(v))||0));
   if((q.s===dq.s&&q.l===dq.l)||(!q.l&&!dq.l))delete cur.rq;else cur.rq=q}
  const r=G.clean(cur,k);if(r)S.draft.gear[k]=r;else delete S.draft.gear[k];
  try{await dset('draft/gear/'+k,r||null);toast('Saved to draft. Publish it from the Publish tab.')}catch(e){fail(e)}if(A.previewing)A.preview(S.draft);draw()}
 async function ngSave(k,o){const G=window.SQGEAR,r=o&&G.ngClean(o,k);if(r)S.draft.newgear[k]=r;else delete S.draft.newgear[k];syncNG();
  try{await dset('draft/newgear/'+k,r||null);toast(r?'Saved to draft. Publish it from the Publish tab.':'Deleted.')}catch(e){fail(e)}if(A.previewing)A.preview(S.draft);draw()}
 function ngSet(k,f,v){const o={...S.draft.newgear[k]};if(f==='v')o.v=Math.max(0,Math.round(Number(v))||0);else o[f]=v;return ngSave(k,o)}
 function ngRecipe(k){const o={...S.draft.newgear[k]},c={};for(let i=0;i<3;i++){const m=root.querySelector('[data-gr="m'+i+'"]'),n=root.querySelector('[data-gr="c'+i+'"]');if(m&&m.value)c[m.value]=(c[m.value]|0)+Math.max(1,+(n&&n.value)||1)}
  const lv=+(root.querySelector('[data-gr="lv"]')||{}).value||1;if(Object.keys(c).length)o.sm={c,lv};else delete o.sm;return ngSave(k,o)}
 function drawTools(){const t=root.querySelector('.dv-tools');if(!t||!S.ed)return;const T=[['pen','Pen'],['erase','Eraser'],['fill','Fill'],['pick','Pick colour']];
  if(LAY(S.ed.kind))T.push(['pan','Move']);
  t.innerHTML=T.map(([k,n])=>'<button class="dv-b dv-tl'+(S.ed.tool===k?' dv-on':'')+'" data-tool="'+k+'">'+n+'</button>').join('')+'<button class="dv-b" data-a="undo">Undo</button><button class="dv-b" data-a="redo">Redo</button><button class="dv-b" data-a="pxcopy" title="Copy this picture (Ctrl+C)">Copy</button><button class="dv-b" data-a="pxpaste" title="Paste a copied picture here (Ctrl+V)">Paste</button>'+
   (S.ed.kind==='worn'||S.ed.kind==='pet'?'<button class="dv-b" data-a="zout" title="Zoom out">−</button><button class="dv-b" data-a="zin" title="Zoom in">+</button>':'');
  const cv=root.querySelector('.dv-cvw');if(cv)cv.classList.toggle('dv-pan',S.ed.tool==='pan')}
 function drawPal(){const p=root.querySelector('.dv-pal'),ed=S.ed;if(!p||!ed)return;
  p.innerHTML=ed.pal.map((c,i)=>'<button class="dv-sw'+(i===ed.col?' dv-on':'')+(ed.dyi&&ed.dyi.has(i)?' dv-dy':'')+'" data-col="'+i+'" style="background:'+c+'" title="'+c+(ed.dyi&&ed.dyi.has(i)?' (dyeable)':'')+'"></button>').join('')+
   '<label class="dv-mut" style="margin-left:8px">Change this colour <input type="color" data-in="recol" value="'+(ed.pal[ed.col]||'#000000')+'"></label>'+
   (ed.pal.length<MAXC?'<label class="dv-mut" style="margin-left:8px">Add a colour <input type="color" data-in="addcol" value="#ffffff"></label>':'')+palExtra(ed)}
 // ---- palette tools: hex codes, copy / paste a whole palette, saved palettes (localStorage sq_dev_pals {name:[hex...]}) ----
 const HEXRE=/#?\b([0-9a-f]{6}|[0-9a-f]{3})\b/gi,normHex=h=>{h=String(h).replace('#','').toLowerCase();if(h.length===3)h=h.split('').map(c=>c+c).join('');return/^[0-9a-f]{6}$/.test(h)?'#'+h:null};
 const hexesIn=t=>{const out=[];for(const m of String(t||'').matchAll(HEXRE)){const h=normHex(m[1]);if(h&&!out.includes(h))out.push(h)}return out};
 const PALS=()=>{try{return JSON.parse(localStorage.getItem('sq_dev_pals')||'{}')||{}}catch(e){return{}}},setPALS=o=>{try{localStorage.setItem('sq_dev_pals',JSON.stringify(o))}catch(e){}};
 let PALUI=null;// null | 'paste' | 'save'
 function palExtra(ed){const cur=ed.pal[ed.col]||'',sv=Object.keys(PALS());
  return'<div class="dv-row" style="flex-basis:100%;flex-wrap:wrap;gap:6px;margin-top:6px">'+
   '<label class="dv-mut">Hex <input data-hex="cur" value="'+E(cur)+'" maxlength="7" spellcheck="false" style="width:86px;font-family:monospace" title="Type a hex code (like #c89858) to change this colour"></label>'+
   (ed.pal.length<MAXC?'<label class="dv-mut">Add hex <input data-hex="add" placeholder="#rrggbb" maxlength="7" spellcheck="false" style="width:86px;font-family:monospace"></label>':'')+
   '<button class="dv-b" data-pa="copy" title="Copies every colour as hex codes">Copy palette</button><button class="dv-b" data-pa="paste">Paste palette…</button><button class="dv-b" data-pa="save">Save palette…</button>'+
   (sv.length?'<select data-hex="saved" style="max-width:170px"><option value="">Saved palettes…</option>'+sv.map(n=>'<option value="'+E(n)+'">'+E(n)+' ('+PALS()[n].length+')</option>').join('')+'</select>':'')+'</div>'+
   (PALUI==='paste'?'<div class="dv-row" style="flex-basis:100%;flex-wrap:wrap;gap:6px"><textarea data-hex="ptext" rows="2" style="flex:1;min-width:220px;font-family:monospace" placeholder="Paste hex codes here (any text with #rrggbb codes works: a list, a palette from a website…)"></textarea><button class="dv-b dv-pri" data-pa="pasteok">Add these colours</button><button class="dv-b" data-pa="x">Cancel</button></div>':'')+
   (PALUI==='save'?'<div class="dv-row" style="flex-basis:100%;flex-wrap:wrap;gap:6px"><input data-hex="pname" placeholder="Name for this palette" maxlength="30" style="max-width:220px"><button class="dv-b dv-pri" data-pa="saveok">Save</button><button class="dv-b" data-pa="x">Cancel</button>'+(sv.length?'<span class="dv-mut">Saved: '+sv.map(n=>E(n)+' <button class="dv-b" data-pa="del:'+E(n)+'" title="Delete">×</button>').join(' ')+'</span>':'')+'</div>':'')}
 // add colours to the open picture's palette (skips ones it has; stops at the palette's limit)
 function palAdd(list){const ed=S.ed;if(!ed)return 0;let n=0;snapEd();for(const h of list){if(ed.pal.length>=MAXC)break;if(ed.pal.some(c=>c.toLowerCase()===h))continue;ed.pal.push(h);n++}
  if(n){ed.col=ed.pal.length-1;ed.tool='pen'}drawPal();drawTools();paint();return n}
 async function palCopy(){const ed=S.ed;if(!ed)return;const t=ed.pal.join(' ');let ok=false;try{await navigator.clipboard.writeText(t);ok=true}catch(e){}
  try{localStorage.setItem('sq_dev_palclip',t)}catch(e){}toast(ok?'Copied '+ed.pal.length+' colours: '+t.slice(0,60)+(t.length>60?'…':''):'Copied '+ed.pal.length+' colours (Paste palette in another picture adds them).')}
 root.addEventListener('click',async e=>{const t=e.target.closest('[data-pa]');if(!t||!S.ed)return;e.preventDefault();e.stopPropagation();const a=t.dataset.pa;
  if(a==='copy'){palCopy();return}
  if(a==='paste'){PALUI='paste';drawPal();const ta=root.querySelector('[data-hex="ptext"]');let clip='';try{clip=await navigator.clipboard.readText()}catch(e2){}if(!hexesIn(clip).length)try{clip=localStorage.getItem('sq_dev_palclip')||''}catch(e2){}
   if(ta){ta.value=hexesIn(clip).join(' ');ta.focus()}return}
  if(a==='pasteok'){const ta=root.querySelector('[data-hex="ptext"]'),L=hexesIn(ta&&ta.value);PALUI=null;if(!L.length){toast('No hex codes found (they look like #c89858).');drawPal();return}const n=palAdd(L);toast(n?'Added '+n+' colour'+(n===1?'':'s')+(n<L.length?' ('+(L.length-n)+' already there or no room)':'')+'.':'Those colours are already in this palette'+(S.ed.pal.length>=MAXC?' (or it\'s full)':'')+'.');return}
  if(a==='save'){PALUI='save';drawPal();const i=root.querySelector('[data-hex="pname"]');if(i)i.focus();return}
  if(a==='saveok'){const i=root.querySelector('[data-hex="pname"]'),nm=(i&&i.value||'').trim().slice(0,30);if(!nm){toast('Give the palette a name.');return}const o=PALS();o[nm]=S.ed.pal.slice();setPALS(o);PALUI=null;drawPal();toast('Saved the palette "'+nm+'" on this device.');return}
  if(a.startsWith('del:')){const o=PALS();delete o[a.slice(4)];setPALS(o);drawPal();return}
  if(a==='x'){PALUI=null;drawPal();return}},true);
 root.addEventListener('change',e=>{const t=e.target,h=t.dataset&&t.dataset.hex;if(!h||!S.ed)return;
  if(h==='cur'){const v=normHex(t.value);if(!v){toast('That isn\'t a hex colour (try #c89858).');t.value=S.ed.pal[S.ed.col]||'';return}if(S.ed.pal[S.ed.col]==null)return;snapEd();S.ed.pal[S.ed.col]=v;S.ed.dirty=true;drawPal();paint();return}
  if(h==='add'){const v=normHex(t.value);if(!v){toast('That isn\'t a hex colour (try #c89858).');return}const n=palAdd([v]);if(!n)toast('That colour is already in the palette'+(S.ed.pal.length>=MAXC?' (or it\'s full)':'')+'.');return}
  if(h==='saved'&&t.value){const L=PALS()[t.value]||[];const n=palAdd(L.map(normHex).filter(Boolean));toast(n?'Added '+n+' colour'+(n===1?'':'s')+' from "'+t.value+'".':'Every colour from "'+t.value+'" is already here.');return}},true);
 root.addEventListener('keydown',e=>{const t=e.target;if(t&&t.dataset&&(t.dataset.hex==='cur'||t.dataset.hex==='add')&&e.key==='Enter'){e.preventDefault();t.dispatchEvent(new Event('change',{bubbles:true}))}},true);
 // ---- stats ----
 function stats(){const T=A.TABLES[S.statT],q=S.statQ.toLowerCase(),d=((S.draft.stats||{})[S.statT])||{};
  let h='<div class="dv-row" style="margin-bottom:10px"><div class="dv-chips">'+Object.keys(A.TABLES).map(t=>'<button class="dv-b'+(S.statT===t?' dv-tl dv-on':'')+'" data-stat="'+t+'">'+A.TABLES[t].name+'</button>').join('')+'</div>'+
   (T.keys().length>8?'<input type="search" style="max-width:260px" placeholder="Search '+E(T.name.toLowerCase())+'" value="'+E(S.statQ)+'" data-in="sq">':'')+'</div>'+(T.note?'<p class="dv-mut">'+T.note+'</p>':'')+
   '<p class="dv-mut">Changes save to your draft as you go. Changed fields are highlighted; ↺ puts a row back to the game\'s original.'+(S.statT==='ib'?' Island bosses also hit harder than normal monsters; HP here is their full HP.':'')+(S.statT==='wb'?' Damage is in hearts per hit.':'')+'</p>';
  h+='<table><thead><tr><th>'+(T.col||(S.statT==='items'?'Item':'Boss'))+'</th>'+T.fields.map(f=>'<th>'+f[1]+'</th>').join('')+'<th></th></tr></thead><tbody>';
  for(const k of T.keys()){const o=T.orig(k);if(q&&!String(T.label?T.label(k):o.n).toLowerCase().includes(q)&&!String(o.n).toLowerCase().includes(q)&&!k.toLowerCase().includes(q))continue;const cur=A.merged(S.statT,k,d[k]);
   h+='<tr data-row="'+E(k)+'"><td class="dv-k">'+E(T.label?T.label(k):o.n)+'<small>'+E(T.sub?T.sub(k):k)+'</small></td>'+T.fields.map(([f,l,ty])=>{const chg=cur[f]!==o[f]?' dv-chg':'';if(ty==='bool')return'<td data-l="'+E(l)+'"><input type="checkbox" class="'+chg+'" data-f="'+f+'"'+(cur[f]?' checked':'')+'></td>';
    return'<td data-l="'+E(l)+'">'+(ty==='long'?'<textarea class="'+chg+'" data-f="'+f+'">'+E(cur[f])+'</textarea>':'<input class="'+chg+'" type="'+(ty==='num'?'number" min="0':'text')+'" data-f="'+f+'" value="'+E(cur[f])+'">')+'</td>'}).join('')+
    '<td>'+(d[k]?'<button class="dv-b" data-a="rowreset" title="Back to original">↺</button>':'')+'</td></tr>'}
  return h+'</tbody></table>'}
 async function statSet(t,k,f,val){const T=A.TABLES[t],o=T.orig(k),fd=T.fields.find(x=>x[0]===f);if(!fd)return;
  const v=fd[2]==='num'?Math.max(0,Math.round(Number(val)||0)):fd[2]==='bool'?(val&&val!=='0'?1:0):String(val);
  const all=S.draft.stats[t]=S.draft.stats[t]||{},row={...(all[k]||{})};if(v===o[f])delete row[f];else row[f]=v;
  if(Object.keys(row).length)all[k]=row;else delete all[k];
  try{await dset('draft/stats/'+t+'/'+k,all[k]||null);toast('Saved to draft.')}catch(e){fail(e)}
  if(A.previewing)A.preview(S.draft)}
 // ---- publish ----
 function publish(){const ch=changes(),L=S.live;
  let h='<div class="dv-card" style="margin-bottom:12px"><b>Live version: '+(L&&L.v?'v'+L.v+' · published '+new Date(L.at).toLocaleString():'nothing published yet (the game\'s own sprites, looks, islands and stats)')+'</b>';
  if(!ch.length)h+='<p class="dv-mut">Your draft matches what players have. Edit sprites, worn looks, islands or stats and they\'ll show up here.</p>';
  else{h+='<p>'+ch.length+' change'+(ch.length>1?'s':'')+' waiting to publish:</p><ul class="dv-cl">'+ch.map(c=>'<li>'+(c.kind==='ext'?c.html:(c.kind==='sprite'||c.kind==='worn'||c.kind==='pet'||c.kind==='gear'?'<img alt="" src="'+thumb(c.k)+'" style="width:22px;height:22px;image-rendering:pixelated;vertical-align:middle;margin-right:6px">'+E(INAME[c.k]||c.k)+': ':E((A.TABLES[c.t].label(c.k)))+': ')+E(c.what))+'</li>').join('')+'</ul>'+
   '<div class="dv-row"><button class="dv-b '+(S.arm==='pub'?'dv-arm':'dv-pri')+'" data-a="pub"'+(S.busy?' disabled':'')+'>'+(S.arm==='pub'?'Tap again to publish to every player':'Publish to every player')+'</button>'+
   '<button class="dv-b '+(S.arm==='disc'?'dv-arm':'dv-bad')+'" data-a="disc"'+(S.busy?' disabled':'')+'>'+(S.arm==='disc'?'Tap again to throw away these changes':'Discard draft changes')+'</button></div>'+
   '<p class="dv-mut">Players who are playing get a published version within about 30 seconds, without restarting; everyone else gets it when they start the game. The version it replaces is kept below, so you can always go back.</p>'}
  h+='</div><div class="dv-card"><b>Earlier versions</b>';
  if(S.hist==null){h+='<p class="dv-mut">Loading...</p>';loadHist()}
  else if(!S.hist.length)h+='<p class="dv-mut">None yet. Each time you publish, the version it replaces is saved here.</p>';
  else h+=S.hist.map(x=>'<div class="dv-hl"><span>v'+x.v+' · '+new Date(x.at).toLocaleString()+' · '+(Object.keys(x.icons||{}).length)+' sprites, '+(Object.keys(x.worn||{}).length)+' worn looks, '+(Object.keys(x.pets||{}).length)+' pets, '+(Object.keys(x.gear||{}).length)+' gear rules, '+(Object.keys(x.islands||{}).length)+' islands, '+Object.values(x.stats||{}).reduce((a,t)=>a+Object.keys(t).length,0)+' stat rows</span><button class="dv-b '+(S.arm==='h'+x.v?'dv-arm':'')+'" data-a="restore" data-v="'+x.v+'"'+(S.busy?' disabled':'')+'>'+(S.arm==='h'+x.v?'Tap again to make this live':'Restore')+'</button></div>').join('');
  if(L&&L.v)h+='<div class="dv-hl"><span>The game\'s own sprites, looks and stats (nothing published)</span><button class="dv-b '+(S.arm==='h0'?'dv-arm':'')+'" data-a="restore" data-v="0"'+(S.busy?' disabled':'')+'>'+(S.arm==='h0'?'Tap again to make this live':'Restore')+'</button></div>';
  return h+'</div>'}
 async function loadHist(){if(loadHist.on)return;loadHist.on=1;try{const H=await dget('hist');S.hist=H?Object.values(H).filter(x=>x&&x.v).sort((a,b)=>b.v-a.v):[]}catch(e){S.hist=[]}loadHist.on=0;draw()}
 async function goLive(L,label){S.busy=true;draw();try{const old=S.live;
   if(old&&old.v)await dset('hist/'+old.v,old);
   const next={...body(L),v:((old&&old.v)|0)+1,at:Date.now()};await dset('live',next);S.live=next;A.setLive(next);
   if(S.hist)S.hist=null;// prune: keep the 20 newest earlier versions
   try{const H=await dget('hist');if(H){const ks=Object.keys(H).map(Number).sort((a,b)=>b-a);for(const k of ks.slice(20))await dset('hist/'+k,null)}}catch(e){}
   toast(label+' Players get v'+next.v+' within about 30 seconds.')}catch(e){fail(e)}S.busy=false;S.arm=null;draw()}
 // ---- input ----
 const arm=(k,fn)=>{if(S.arm===k){S.arm=null;fn();return}S.arm=k;draw();clearTimeout(arm.t);arm.t=setTimeout(()=>{if(S.arm===k){S.arm=null;draw()}},4000)};
 root.addEventListener('click',async e=>{const t=e.target.closest('[data-tab],[data-a],[data-k],[data-tool],[data-col],[data-stat],[data-dir],[data-copy]');if(!t)return;
  if(t.dataset.tab){if(t.dataset.tab===S.tab)return;if(((S.ed&&S.ed.dirty)||(EXT[S.tab]&&EXT[S.tab].dirty&&EXT[S.tab].dirty()))&&!confirmLeave())return;if(EXT[S.tab]&&EXT[S.tab].leave)EXT[S.tab].leave();if(S.ed){S.ed.dirty=false}S.sel=null;S.ed=null;S.tab=t.dataset.tab;S.arm=null;draw();return}
  if(t.dataset.dir!=null&&S.ed){S.ed.dir=+t.dataset.dir;S.ed.px=S.ed.layers[S.ed.dir];draw();return}
  if(t.dataset.copy!=null&&S.ed){snapEd();S.ed.layers[S.ed.dir].set(S.ed.layers[+t.dataset.copy]);paint();draw();return}
  if(t.dataset.stat){S.statT=t.dataset.stat;draw();return}
  if(t.dataset.k){if(S.ed&&S.ed.dirty&&S.sel!==t.dataset.k&&!confirmLeave())return;if(S.tab==='worn')openGear(t.dataset.k);else if(S.tab==='pets')openPet(t.dataset.k);else if(S.tab==='props'||S.tab==='monsters')openProp(t.dataset.k);else openSprite(t.dataset.k);return}
  if(t.dataset.tool){S.ed.tool=t.dataset.tool;drawTools();return}
  if(t.dataset.col){S.ed.col=+t.dataset.col;if(S.ed.tool==='erase'||S.ed.tool==='pick')S.ed.tool='pen';drawPal();drawTools();return}
  const a=t.dataset.a;
  if(a==='close')return close();
  if(a==='retry')return load();
  if(a==='copyid'){try{await navigator.clipboard.writeText(S.uid);toast('Copied.')}catch(e2){toast('Select the ID and copy it.')}return}
  if(a==='pv'){A.preview(t.checked?S.draft:null);toast(t.checked?'Your game now shows your draft (only on this device).':'Your game shows the published version again.');return}
  if(a==='only'){S.only=t.checked;draw();return}
  if(a==='ngnew'){if(S.ed&&S.ed.dirty&&!confirmLeave())return;if(S.ed)S.ed.dirty=false;S.sel='__new';S.ed=null;draw();const i=root.querySelector('[data-in="ngn"]');if(i)i.focus();return}
  if(a==='ngmake'){const n=((root.querySelector('[data-in="ngn"]')||{}).value||'').trim(),b=(root.querySelector('[data-in="ngb"]')||{}).value;if(!n){toast('Give it a name first.');return}if(!EQ[b])return;
   const sl=n.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,24)||'item';let k='eq_cu_'+sl,i=2;while(EQ[k]||S.draft.newgear[k]||(S.live&&S.live.newgear&&S.live.newgear[k]))k='eq_cu_'+sl+'_'+(i++);
   await ngSave(k,{n,b,v:SELLP[b]|0,d:''});if(!EQ[k]){toast('Could not create that item.');return}S.gm='rules';openGear(k);toast('Created. Draw its look and icon, and set how it works.');return}
  if(a==='nggive'){const k=S.sel;if(EQ[k]){inv[k]=(inv[k]|0)+1;try{saveLocal(true)}catch(e2){}toast('One '+INAME[k]+' is in your bag.')}return}
  if(a==='ngdel'){const k=S.sel;return arm('ngdel',async()=>{for(const sec of['gear','worn','icons'])if(S.draft[sec]&&S.draft[sec][k]){delete S.draft[sec][k];try{await dset('draft/'+sec+'/'+k,null)}catch(e2){}}
   S.sel=null;S.ed=null;await ngSave(k,null)})}
  if(a==='gm'){const m=t.dataset.m;if(m===S.gm)return;if(S.ed&&S.ed.dirty&&!confirmLeave())return;if(S.ed)S.ed.dirty=false;S.gm=m;S.ed=null;openGear(S.sel);return}
  if(a==='grst'){const k=S.sel;return arm('grst',async()=>{delete S.draft.gear[k];try{await dset('draft/gear/'+k,null);toast('Back to how the game made it work (in your draft).')}catch(e2){fail(e2)}if(A.previewing)A.preview(S.draft);draw()})}
  if(a==='back'){if(S.ed&&S.ed.dirty&&!confirmLeave())return;S.sel=null;S.ed=null;draw();return}
  if(a==='undo')return undo(false);if(a==='redo')return undo(true);if(a==='pxcopy')return pxCopy();if(a==='pxpaste')return pxPaste();
  if(a==='save')return S.ed&&S.ed.kind==='worn'?saveWorn():S.ed&&S.ed.kind==='pet'?savePet():S.ed&&S.ed.kind==='prop'?saveProp():saveSprite();
  if(a==='revert'){S.ed.dirty=false;if(S.ed.kind==='worn')openWorn(S.sel);else if(S.ed.kind==='pet')openPet(S.sel);else if(S.ed.kind==='prop')openProp(S.sel,false,S.ed.night);else openSprite(S.sel);return}
  if(a==='pcap'){if(S.ed&&S.ed.dirty&&!confirmLeave())return;openPet(S.sel,true);return}
  if(a==='pflip'){const ed=S.ed;snapEd();const L=ed.layers[ed.dir];for(let y=0;y<ed.h;y++){for(let x=0;x<ed.w>>1;x++){const i=y*ed.w+x,j=y*ed.w+ed.w-1-x,t2=L[i];L[i]=L[j];L[j]=t2}}paint();return}
  if(a==='fradd'&&S.ed&&S.ed.kind==='prop'){propFrames(true);return}if(a==='frdel'&&S.ed&&S.ed.kind==='prop'){propFrames(false);return}
  if(a==='pak'&&S.ed){S.ed.ak=t.checked;S.ed.dirty=true;draw();return}if(a==='pfw'&&S.ed){S.ed.fw=t.checked;S.ed.dirty=true;draw();return}
  if((a==='mrsave'||a==='mrclear')&&S.ed){const k=S.ed.base;let r=null;if(a==='mrsave'){const v=f=>{const i=root.querySelector('[data-mr="'+f+'"]');return i?i.value:''};r={hp:Math.max(10,Math.min(1000,+v('hp')||100)),spd:Math.max(10,Math.min(400,+v('spd')||100)),dmg:Math.max(0,Math.min(1000,v('dmg')===''?100:+v('dmg'))),gold:Math.max(0,Math.min(100000,v('gold')|0))};
    const dr=[];for(let i=0;i<MRN;i++){const k=v('dk'+i);if(!k||!INAME[k])continue;const n=Math.max(1,Math.min(1000,v('dn'+i)|0||1)),x=Math.max(n,Math.min(1000,v('dx'+i)|0||n)),c=Math.max(0,Math.min(100,+v('dc'+i)));dr.push({k,n,x,c:isFinite(c)?c:100})}
    if(dr.length)r.dr=dr;const rp=root.querySelector('[data-mr="rep"]');if(rp&&rp.checked)r.rep=1;if(!(r.dmg>=0))r.dmg=100;if(r.dmg===100)delete r.dmg;
    if(root.querySelector('[data-mr="pjr"]')){const pj={rate:Math.max(10,Math.min(1000,+v('pjr')||100)),dmg:Math.max(0,Math.min(10,v('pjd')|0)),fx:{}};for(const f of(window.SQMOBATK?SQMOBATK.FX:[])){const c=Math.max(0,Math.min(100,+v('fx_'+f+'_c')||0)),tt=Math.max(.5,Math.min(30,+v('fx_'+f+'_t')||3));if(c>0)pj.fx[f]=[c,tt]}
     if(!Object.keys(pj.fx).length)delete pj.fx;if(pj.rate!==100||pj.dmg||pj.fx)r.pj=pj}
    if(r.hp===100&&r.spd===100&&!r.gold&&!r.dr&&!r.rep&&r.dmg==null&&!r.pj)r=null}
   if(r)S.draft.mobs[k]=r;else delete S.draft.mobs[k];try{await dset('draft/mobs/'+key(k),r);toast(r?'Rules saved to draft.':'Back to the game\'s own rules (in your draft).')}catch(e2){fail(e2)}if(A.previewing)A.preview(S.draft);draw();return}
  if(a==='psy'&&S.ed){S.ed.sy=t.checked;S.ed.dirty=true;draw();return}
  if(a==='rcap'){if(S.ed&&S.ed.dirty&&!confirmLeave())return;openProp(S.sel,true,S.ed&&S.ed.night);return}
  if((a==='pday'||a==='pnight')&&S.ed&&S.ed.kind==='prop'){const nt=a==='pnight';if(nt===S.ed.night)return;if(S.ed.dirty&&!confirmLeave())return;S.ed.dirty=false;openProp(S.sel,false,nt);return}
  if(a==='presize'){petResize(+(root.querySelector('[data-in="pw"]')||{}).value,+(root.querySelector('[data-in="ph"]')||{}).value);return}
  if(a==='under'){S.ed.under=t.checked;paint();return}
  if(a==='hide'){S.ed.hide=t.checked;S.ed.dirty=true;paint();return}
  if(a==='zin'||a==='zout'){const ed=S.ed,cv=root.querySelector('.dv-cvw'),c=document.getElementById('dvc');const fx=cv&&c.width?(cv.scrollLeft+cv.clientWidth/2)/c.width:.5,fy=cv&&c.height?(cv.scrollTop+cv.clientHeight/2)/c.height:.5;
   ed.zoom=Math.max(1,Math.min(12,(ed.zoom||1)*(a==='zin'?1.5:1/1.5)));if(a==='zin'&&ed.tool!=='pan')toast('Tip: use Move (M) to look around.');ed.z=0;paint();if(cv){cv.scrollLeft=fx*c.width-cv.clientWidth/2;cv.scrollTop=fy*c.height-cv.clientHeight/2}return}
  if(a==='clr'){snapEd();S.ed.px.fill(255);paint();draw();return}
  if(a==='dytog'&&S.ed&&S.ed.kind==='worn'){const ed=S.ed;ed.dyi=ed.dyi||new Set();if(ed.dyi.has(ed.col))ed.dyi.delete(ed.col);else ed.dyi.add(ed.col);ed.dirty=true;draw();return}
  if(a==='wcap'&&S.ed&&S.ed.kind==='worn'){const ed=S.ed;return arm('wcap',()=>startFromGame(ed,false))}
  if(a==='orig'&&S.ed&&S.ed.kind==='prop'){const k=S.ed.k,nt=S.ed.night;delete S.draft.props[k];try{await dset('draft/props/'+key(k),null);toast(nt?'Night look removed (in your draft).':'Back to the game\'s own look (in your draft).')}catch(e2){fail(e2)}if(A.previewing)A.preview(S.draft);S.ed=null;openProp(S.sel,false,nt);return}
  if(a==='orig'&&S.ed&&S.ed.kind==='pet'){const k=S.ed.k,item=S.sel;delete S.draft.pets[k];try{await dset('draft/pets/'+k,null);toast('Back to the game\'s own look (in your draft).')}catch(e2){fail(e2)}if(A.previewing)A.preview(S.draft);S.ed=null;openPet(item);return}
  if(a==='orig'&&S.ed&&S.ed.kind==='worn'){const k=S.sel;delete S.draft.worn[k];try{await dset('draft/worn/'+k,null);toast('Back to the game\'s own look (in your draft).')}catch(e2){fail(e2)}if(A.previewing)A.preview(S.draft);openWorn(k);return}
  if(a==='orig'){const k=S.sel;delete S.draft.icons[k];try{await dset('draft/icons/'+k,null);toast('Back to the game\'s original sprite (in your draft).')}catch(e2){fail(e2)}if(A.previewing)A.preview(S.draft);S.ed=null;openSprite(k);return}
  if(a==='rowreset'){const k=t.closest('[data-row]').dataset.row,all=S.draft.stats[S.statT]||{};delete all[k];try{await dset('draft/stats/'+S.statT+'/'+k,null);toast('Back to the original.')}catch(e2){fail(e2)}if(A.previewing)A.preview(S.draft);draw();return}
  if(a==='pub')return arm('pub',()=>goLive(S.draft,'Published.'));
  if(a==='disc')return arm('disc',async()=>{S.draft=norm(body(S.live));syncNG();try{await dset('draft',S.draft)}catch(e2){fail(e2)}if(A.previewing)A.preview(S.draft);S.sel=null;S.ed=null;toast('Draft reset to the live version.');draw()});
  if(a==='restore'){const v=+t.dataset.v;return arm('h'+v,async()=>{const H=v?S.hist.find(x=>x.v===v):{};await goLive(H,v?'Restored v'+v+' as the live version.':'Back to the game\'s own sprites and stats.');
   S.draft=norm(body(S.live));syncNG();try{await dset('draft',S.draft)}catch(e2){}draw()})}});
 let pendingLeave=0;const confirmLeave=()=>{if(Date.now()-pendingLeave<4000)return true;pendingLeave=Date.now();toast('Unsaved changes. Tap again to leave without saving.');return false};
 async function saveSprite(){const ed=S.ed;if(!ed)return;const sp=toSp(ed);S.draft.icons[ed.k]=sp;try{await dset('draft/icons/'+ed.k,sp);ed.dirty=false;toast('Saved to draft. Publish it from the Publish tab.')}catch(e){fail(e)}
  if(A.previewing)A.preview(S.draft);const it=root.querySelector('.dv-it[data-k="'+ed.k+'"]');if(it){const im=it.querySelector('img');if(im)im.src=thumb(ed.k)}paint()}
 root.addEventListener('input',e=>{const t=e.target,n=t.dataset.in;
  if(n==='q'){S.q=t.value;const pos=t.selectionStart;draw();const i=root.querySelector('[data-in="q"]');if(i){i.focus();i.setSelectionRange(pos,pos)}return}
  if(n==='sq'){S.statQ=t.value;const pos=t.selectionStart;draw();const i=root.querySelector('[data-in="sq"]');if(i){i.focus();i.setSelectionRange(pos,pos)}return}
  if(n==='recol'&&S.ed&&S.ed.pal[S.ed.col]!=null){if(!t._snap){snapEd();t._snap=1}S.ed.pal[S.ed.col]=t.value;const sw=root.querySelector('.dv-sw.dv-on');if(sw)sw.style.background=t.value;paint()}});
 root.addEventListener('change',async e=>{const t=e.target;
  if(t.dataset.in==='paf'&&S.ed){S.ed.af=Math.max(0,Math.min(S.ed.layers.length-1,t.value|0));S.ed.ak=S.ed.af>0;S.ed.dirty=true;draw();return}
  if(t.dataset.in==='addcol'&&S.ed){snapEd();S.ed.pal.push(t.value);S.ed.col=S.ed.pal.length-1;S.ed.tool='pen';drawPal();drawTools();paint();return}
  if(t.dataset.in==='recol'){t._snap=0;drawPal();return}
  if(t.dataset.in==='pname'&&S.ed&&S.ed.kind==='prop'){const k=S.ed.base,v=t.value.trim().slice(0,40),nv=v&&v!==gameName(k)?v:null;if(nv)S.draft.pnames[k]=nv;else delete S.draft.pnames[k];
   try{await dset('draft/pnames/'+key(k),nv);toast(nv?'Renamed.':'Back to its own name.')}catch(e2){fail(e2)}const sp=root.querySelector('.dv-it[data-k="'+k+'"] span');if(sp)sp.textContent=propName(k);return}
  if(t.dataset.in==='pms'&&S.ed){S.ed.ms=Math.max(60,Math.min(5000,t.value|0||250));S.ed.dirty=true;draw();return}
  if(t.dataset.in==='pvd'&&S.ed){S.ed.pvd=+t.value|0;draw();return}
  if(t.dataset.g&&S.sel){gearSet(S.sel,t.dataset.g,t.value);return}
  if(t.dataset.gn&&S.sel){ngSet(S.sel,t.dataset.gn,t.value);return}
  if(t.dataset.gr&&S.sel){ngRecipe(S.sel);return}
  if(t.dataset.gs&&S.sel){statSet('items',S.sel,t.dataset.gs,t.value).then(()=>{try{if(A.previewing)A.preview(S.draft)}catch(e2){}draw()});return}
  if(t.dataset.f){const k=t.closest('[data-row]').dataset.row;statSet(S.statT,k,t.dataset.f,t.type==='checkbox'?t.checked:t.value).then(()=>{const o=A.TABLES[S.statT].orig(k),cur=A.merged(S.statT,k,(S.draft.stats[S.statT]||{})[k]);t.classList.toggle('dv-chg',cur[t.dataset.f]!==o[t.dataset.f]);
   const last=t.closest('tr').lastElementChild;if(last)last.innerHTML=(S.draft.stats[S.statT]||{})[k]?'<button class="dv-b" data-a="rowreset" title="Back to original">↺</button>':''})}});
 let pan=null;
 root.addEventListener('pointerdown',e=>{if(e.target.id!=='dvc'||!S.ed)return;e.preventDefault();try{e.target.setPointerCapture(e.pointerId)}catch(_){}
  if(S.ed.tool==='pan'){const cv=e.target.parentElement;pan={x:e.clientX,y:e.clientY,sx:cv.scrollLeft,sy:cv.scrollTop,cv};return}down=true;use(e,true)});
 root.addEventListener('pointermove',e=>{if(down&&e.pointerType==='mouse'&&!(e.buttons&1)){endStroke();return}if(pan){pan.cv.scrollLeft=pan.sx-(e.clientX-pan.x);pan.cv.scrollTop=pan.sy-(e.clientY-pan.y);return}if(down&&e.target.id==='dvc'&&S.ed&&S.ed.tool!=='fill'&&S.ed.tool!=='pick')use(e,false)});
 addEventListener('pointerup',()=>{pan=null});
 // the suite stops taps reaching the game, so the end of a stroke is caught here too (and a mouse with no button held ends it)
 const endStroke=()=>{pan=null;if(down){down=false;last=-1;paint()}};for(const ev of['pointerup','pointercancel','lostpointercapture'])root.addEventListener(ev,endStroke);
 addEventListener('pointerup',()=>{if(down){down=false;last=-1;paint()}});
 addEventListener('resize',()=>{if(S.open&&S.ed){S.ed.fit=0;paint()}});
 // keys: the game must not see them while the suite is open
 addEventListener('keydown',e=>{if(!S.open)return;e.stopPropagation();const tg=e.target,typing=/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)&&tg.type!=='checkbox';
  if(e.key==='Escape'&&!typing){close();return}if(typing||!S.ed||(S.tab!=='sprites'&&S.tab!=='worn'&&S.tab!=='pets'&&S.tab!=='props'&&S.tab!=='monsters'))return;const k=e.key.toLowerCase(),m=e.ctrlKey||e.metaKey;
  if(m&&k==='z'){e.preventDefault();undo(e.shiftKey);return}if(m&&k==='c'){e.preventDefault();pxCopy();return}if(m&&k==='v'){e.preventDefault();pxPaste();return}if(m&&k==='y'){e.preventDefault();undo(true);return}if(m&&k==='s'){e.preventDefault();if(S.ed.kind==='worn')saveWorn();else if(S.ed.kind==='pet')savePet();else if(S.ed.kind==='prop')saveProp();else saveSprite();return}
  if((LAY(S.ed.kind))&&!m&&(k==='+'||k==='='||k==='-')){const b=root.querySelector('[data-a="'+(k==='-'?'zout':'zin')+'"]');if(b)b.click();return}
  const T={p:'pen',b:'pen',e:'erase',f:'fill',g:'fill',i:'pick'};if(LAY(S.ed.kind))T.m='pan';if(!m&&T[k]){S.ed.tool=T[k];drawTools()}},true);
 addEventListener('keyup',e=>{if(S.open)e.stopPropagation()},true);
 // you're safe while the suite is open: no damage, no hunger, nothing can kill you
 const _hp=hurtP;hurtP=function(){if(S.open)return;return _hp.apply(this,arguments)};
 const _uS=upd;upd=function(dt){if(!S.open)return _uS(dt);const h0=hunger,hp0=P&&P.hp,d0=dead;_uS(dt);try{if(hunger<h0)hunger=h0;if(P&&P.hp<hp0)P.hp=hp0;if(dead&&!d0&&P&&P.hp>0)dead=false}catch(e){}};
 // ... and it opens straight from the title screen once you're signed in
 window.SQTITLE=()=>{const t=document.getElementById('sqts');return!!(t&&t.style.display!=='none'&&getComputedStyle(t).display!=='none')};
 {const mn=document.getElementById('tsmn');const addBtn=()=>{if(!mn||mn.querySelector('[data-a="dvs"]')||!(window.SQDEV&&SQDEV()&&user()))return;const o=mn.querySelector('[data-a="opt"]');if(!o)return;
   const b=document.createElement('button');b.dataset.a='dvs';b.textContent='DEV SUITE';o.after(b)};
  if(mn){new MutationObserver(addBtn).observe(mn,{childList:true});setInterval(addBtn,1500);
   mn.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.a==='dvs'){e.stopPropagation();openSuite()}},true)}}
 function openSuite(){if(!(window.SQDEV&&SQDEV()))return;try{for(const k in K)K[k]=0}catch(e){}try{if(pnOpen)closePanel()}catch(e){}
  S.open=true;root.style.display='flex';draw();if(S.ok!=='yes')load()}
 function close(){if(((S.ed&&S.ed.dirty)||(EXT[S.tab]&&EXT[S.tab].dirty&&EXT[S.tab].dirty()))&&!confirmLeave())return;S.open=false;root.style.display='none';root.innerHTML=''}
 window.SQSUITE={open:openSuite,close,get state(){return S},
  // for extra tabs: addTab(key,label,{render,after,changes,dirty,leave}) and the helpers they share
  addTab(key,label,ext){EXT[key]=ext;const i=TABS.findIndex(t=>t[0]===key);if(i>=0)TABS[i][1]=label;else TABS.splice(TABS.length-1,0,[key,label]);if(S.open)draw()},
  api:{S,A,E,dget,dset,toast,fail,arm,same,body,clone,confirmLeave,draw:()=>draw(),thumb:k=>thumb(k)}};
 // entry points: Options (developer only) and /suite in chat
 const _o=optionsHTML;optionsHTML=function(){const h=_o();return window.SQDEV&&SQDEV()?h+'<div class="dv-tl" style="margin-top:16px">DEVELOPER</div><button class="sb dvopen">Dev Suite</button>':h};
 pbd.addEventListener('click',e=>{if(e.target.closest('.dvopen')){e.stopPropagation();openSuite()}},true);
 const _ms=mpSend;mpSend=function(t){if(/^\/suite\s*$/i.test(String(t||'').trim())&&window.SQDEV&&SQDEV()){openSuite();return}return _ms(t)}})();
