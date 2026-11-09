// ---- 112. Dev Suite (developer only): edit item sprites, worn looks and game stats, then publish them to every player ----
// Open it from Options > Dev Suite, or type /suite in chat. Only shows for the developer's account, and the database
// only accepts writes to assets/ from accounts listed under devs/ (added by hand in the Firebase console).
// Edits go to assets/draft first. "Publish" copies the draft to assets/live (players get it on their next load) and
// keeps the version it replaced in assets/hist, so any earlier version can be restored.
(()=>{const A=window.SQA,PXC=A.PXC,MAXC=PXC.length;
 const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
 let down=false,last=-1;
 const clone=o=>o==null?o:JSON.parse(JSON.stringify(o));
 const S={open:false,tab:'sprites',ok:null,uid:'',live:null,draft:null,hist:null,q:'',only:false,sel:null,ed:null,statT:'items',statQ:'',note:'',arm:null,busy:false};
 // ---- database ----
 const fb=()=>window.SQFB,user=()=>window.SQMP&&SQMP.user;
 const R=p=>fb().db.ref(fb().D,'assets/'+p);
 const dget=async p=>(await fb().db.get(R(p))).val(),dset=(p,v)=>fb().db.set(R(p),v==null?null:v);
 const body=L=>{const o=clone(L)||{};delete o.v;delete o.at;delete o.by;return o};
 const norm=d=>{d.icons=d.icons||{};d.stats=d.stats||{};d.worn=d.worn||{};return d};
 async function load(){S.ok=null;S.note='';draw();
  if(!fb()||!user()){S.ok='signin';draw();return}S.uid=user().uid;
  try{S.live=await dget('live');S.draft=await dget('draft')}catch(e){S.ok=/permission/i.test(e.message)?'setup':'error';S.note=e.message;draw();return}
  if(!S.draft){S.draft=body(S.live);try{await dset('draft',S.draft)}catch(e){}}
  norm(S.draft);S.ok='yes';draw()}
 const toast=t=>{S.note=t;const n=document.querySelector('#dvs .dv-note');if(n)n.textContent=t;clearTimeout(toast.t);toast.t=setTimeout(()=>{S.note='';const n2=document.querySelector('#dvs .dv-note');if(n2)n2.textContent=''},4000)};
 const fail=e=>{console.error(e);toast('Could not save: '+(e&&e.message||e))};
 // ---- comparing draft and live ----
 const same=(a,b)=>JSON.stringify(a==null?null:a)===JSON.stringify(b==null?null:b);
 function changes(){const out=[],L=body(S.live),D=S.draft||{};
  const ik=new Set([...Object.keys(L.icons||{}),...Object.keys(D.icons||{})]);
  for(const k of ik)if(!same((L.icons||{})[k],(D.icons||{})[k]))out.push({kind:'sprite',k,what:(D.icons||{})[k]?((L.icons||{})[k]?'Sprite changed':'New sprite'):'Back to the original sprite'});
  const wk=new Set([...Object.keys(L.worn||{}),...Object.keys(D.worn||{})]);
  for(const k of wk)if(!same((L.worn||{})[k],(D.worn||{})[k]))out.push({kind:'worn',k,what:(D.worn||{})[k]?((L.worn||{})[k]?'Worn look changed':'New worn look'):'Back to the game\'s own worn look'});
  for(const t in A.TABLES){const l=(L.stats||{})[t]||{},d=(D.stats||{})[t]||{};
   for(const k of new Set([...Object.keys(l),...Object.keys(d)]))if(!same(l[k],d[k])){const T=A.TABLES[t];
    const f=Object.keys({...l[k],...d[k]}).map(f=>{const fd=T.fields.find(x=>x[0]===f);return fd?fd[1]:f});
    out.push({kind:'stat',t,k,what:T.name+': '+f.join(', ')+(d[k]?'':' (back to original)')})}}
  return out}
 const wState=k=>{const d=S.draft&&S.draft.worn&&S.draft.worn[k],l=S.live&&S.live.worn&&S.live.worn[k];return d&&!same(d,l)?'draft':!d&&l?'draft':d?'live':''};
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
 const CHC=new Map();const myLook=()=>{let c;try{c=gearCH()}catch(e){c={...CH}}delete c.wr;return c};
 function charCan(dir,st,fl){const L=myLook(),key=JSON.stringify(L)+dir+st+(fl?1:0);let c=CHC.get(key);if(!c){try{c=hdTrainer(L,dir,st,fl)}catch(e){c=null}if(CHC.size>40)CHC.clear();CHC.set(key,c)}return c}
 let CBB=null;function charBox(){if(CBB)return CBB;let x0=96,y0=112,x1=0,y1=0;for(const d of[0,1,2]){const c=charCan(d,0,false);if(!c)continue;const a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  for(let i=0;i<a.length;i+=4)if(a[i+3]>0){const X=(i/4)%c.width,Y=Math.floor(i/4/c.width);if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y}}
  if(x1<x0)return{x0:0,y0:0,x1:95,y1:111};return CBB={x0:Math.max(0,x0-10),y0:Math.max(0,y0-16),x1:Math.min(95,x1+10),y1:Math.min(111,y1+4)}}
 function openWorn(k){S.sel=k;const w=S.draft.worn[k],pal=[],N=A.WW*A.WH,layers=[0,1,2].map(()=>new Uint8Array(N).fill(255));
  if(w)for(let d=0;d<3;d++){const sp=w[WK[d]];if(!sp||!A.valid(sp))continue;const map=String(sp.p).split(',').map(c=>{let i=pal.indexOf(c);if(i<0&&pal.length<MAXC){pal.push(c);i=pal.length-1}return Math.max(0,i)});
   const dd=A.pix(sp);for(let i=0;i<N;i++){const ch=dd[i];if(ch&&ch!=='.')layers[d][i]=map[PXC.indexOf(ch)]}}
  if(!pal.length)pal.push('#2a1c24','#4a5060','#7a8496','#a8b2c4','#d8e0ec','#f8d848','#b83838');
  S.ed={kind:'worn',k,w:A.WW,h:A.WH,s:1,dir:0,layers,px:layers[0],pal,col:0,tool:'pen',undo:[],redo:[],dirty:false,hide:!!(w&&w.h),zoom:0,under:true,rc:[null,null,null],rcd:[1,1,1]};draw()}
 function wornOut(ed){const o={};if(ed.hide)o.h=1;let any=false;for(let d=0;d<3;d++){const px=ed.layers[d];if(!px.some(v=>v!==255))continue;any=true;const sp=toSpPx(ed,px);o[WK[d]]={w:sp.w,h:sp.h,s:1,p:sp.p,r:A.pack(sp.d)}}return any?o:null}
 async function saveWorn(){const ed=S.ed;if(!ed)return;const o=wornOut(ed);if(o)S.draft.worn[ed.k]=o;else delete S.draft.worn[ed.k];
  try{await dset('draft/worn/'+ed.k,o);ed.dirty=false;toast(o?'Saved to draft. Publish it from the Publish tab.':'Nothing drawn, so this item keeps the game\'s own look.')}catch(e){fail(e)}
  if(A.previewing)A.preview(S.draft);paint();const it=root.querySelector('.dv-it[data-k="'+ed.k+'"]');if(it){const b=it.querySelector('.dv-bd'),s2=wState(ed.k);if(b)b.remove();if(s2)it.insertAdjacentHTML('afterbegin','<i class="dv-bd dv-'+s2+'">'+(s2==='draft'?'DRAFT':'LIVE')+'</i>')}}
 // walking preview in all four directions
 let walkT=0;setInterval(()=>{const c=document.getElementById('dvwalk'),ed=S.ed;if(!S.open||!c||!ed||ed.kind!=='worn')return;walkT++;
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
  if(ed.kind==='worn'&&ed.fit)return Math.max(2,Math.round(ed.fit*ed.zoom));
  const fit=Math.max(2,Math.floor(Math.min((box.width-8)/ed.w,(Math.min(box.height||9999,window.innerHeight*.62)-8)/ed.h)));
  if(ed.kind!=='worn')return fit;ed.fit=fit;if(!ed.zoom){const B=charBox(),bw=B.x1-B.x0+1,bh=B.y1-B.y0+1,want=Math.floor(Math.min((box.width-8)/bw,(window.innerHeight*.62-8)/bh));ed.zoom=Math.max(1,Math.min(8,want/fit));ed.recenter=1}
  return Math.max(2,Math.round(fit*ed.zoom))}
 function paint(){const c=document.getElementById('dvc'),ed=S.ed;if(!c||!ed)return;const z=down&&ed.z?ed.z:(ed.z=cell());if(c.width!==ed.w*z)c.width=ed.w*z;if(c.height!==ed.h*z)c.height=ed.h*z;const x=c.getContext('2d');
  if(ed.kind==='worn'){ed.rcd[ed.dir]=1;x.imageSmoothingEnabled=false;x.fillStyle='#2c323e';x.fillRect(0,0,c.width,c.height);
   if(ed.under){const u=charCan(ed.dir,0,false);if(u){x.globalAlpha=.5;x.drawImage(u,0,0,c.width,c.height);x.globalAlpha=1}}
   for(let i=0;i<ed.px.length;i++){const v=ed.px[i];if(v===255)continue;x.fillStyle=ed.pal[v];x.fillRect((i%ed.w)*z,Math.floor(i/ed.w)*z,z,z)}
   if(ed.recenter){ed.recenter=0;const cv=c.parentElement,B=charBox();cv.scrollLeft=((B.x0+B.x1)/2)*z-cv.clientWidth/2;cv.scrollTop=((B.y0+B.y1)/2)*z-cv.clientHeight/2}
   if(z>=8){x.strokeStyle='rgba(255,255,255,.07)';x.lineWidth=1;x.beginPath();for(let i=1;i<ed.w;i++){x.moveTo(i*z+.5,0);x.lineTo(i*z+.5,c.height)}for(let i=1;i<ed.h;i++){x.moveTo(0,i*z+.5);x.lineTo(c.width,i*z+.5)}x.stroke()}
   const n=new Set(ed.layers.flatMap(L=>[...L].filter(v=>v!==255))).size,st=document.querySelector('#dvs .dv-st');
   if(st)st.textContent=WDN[ed.dir]+' layer · '+ed.w+' × '+ed.h+' · '+n+' colours'+(ed.dirty?'  ·  unsaved changes':'');return}
  for(let y=0;y<ed.h;y++)for(let X=0;X<ed.w;X++){const v=ed.px[y*ed.w+X];x.fillStyle=v===255?((X+y)%2?'#3a4150':'#2c323e'):ed.pal[v];x.fillRect(X*z,y*z,z,z)}
  if(z>=8){x.strokeStyle='rgba(255,255,255,.08)';x.lineWidth=1;x.beginPath();for(let i=1;i<ed.w;i++){x.moveTo(i*z+.5,0);x.lineTo(i*z+.5,c.height)}for(let i=1;i<ed.h;i++){x.moveTo(0,i*z+.5);x.lineTo(c.width,i*z+.5)}x.stroke()}
  const sp=toSp(ed),u=A.render(sp).toDataURL();for(const im of document.querySelectorAll('#dvs .dv-pv img')){im.src=u;const k=im.dataset.x2?2:1;im.style.width=Math.min(220,sp.w*sp.s*k)+'px';im.style.height=Math.min(220,sp.h*sp.s*k)+'px'}
  const st=document.querySelector('#dvs .dv-st');if(st)st.textContent=ed.w+' × '+ed.h+' pixels, shown at '+ed.s+'×  ·  '+sp.p.split(',').filter(Boolean).length+' colours'+(ed.dirty?'  ·  unsaved changes':'')}
 const snapEd=()=>{const ed=S.ed;ed.undo.push({px:ed.px.slice(),pal:ed.pal.slice(),dir:ed.dir});if(ed.undo.length>80)ed.undo.shift();ed.redo=[];ed.dirty=true};
 function undo(r){const ed=S.ed;if(!ed)return;const a=r?ed.redo:ed.undo,b=r?ed.undo:ed.redo,s=a.pop();if(!s)return;
  if(ed.kind==='worn'){b.push({px:ed.layers[s.dir].slice(),pal:ed.pal.slice(),dir:s.dir});ed.layers[s.dir]=s.px;ed.rcd=[1,1,1];const sw=ed.dir!==s.dir;ed.dir=s.dir;ed.px=ed.layers[ed.dir];ed.pal=s.pal;ed.dirty=true;if(ed.col>=ed.pal.length)ed.col=ed.pal.length-1;if(sw){draw();return}drawPal();paint();return}
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
#dvs .dv-chk{display:flex;gap:6px;align-items:center;color:#c0c8d6}
@media (max-width:760px){#dvs .dv-pvlong{display:none}#dvs .dv-pvs{display:inline}#dvs .dv-top{gap:2px;padding-left:8px;padding-right:8px}#dvs .dv-tab{padding:7px 9px}#dvs .dv-ttl{width:100%;margin:0 0 2px}#dvs .dv-spr{grid-template-columns:1fr;height:auto}#dvs .dv-spr.dv-has .dv-ls{display:none}#dvs .dv-spr:not(.dv-has) .dv-ed{display:none}#dvs .dv-back{display:inline-block}#dvs .dv-ls .dv-grid{max-height:none}
 #dvs table,#dvs tbody,#dvs tr,#dvs td{display:block}#dvs thead{display:none}#dvs tr{border-top:1px solid #2a3240;padding:8px 0}#dvs td{border:0;padding:3px 0}#dvs td[data-l]::before{content:attr(data-l);display:block;font-size:11px;color:#8a94a6}#dvs td textarea{min-width:0}}`;
 document.head.appendChild(st);
 const TABS=[['sprites','Sprites'],['worn','Worn looks'],['stats','Stats'],['islands','Islands'],['publish','Publish']];
 function draw(){if(!S.open)return;const nch=S.draft?changes().length:0;
  let h='<div class="dv-top"><span class="dv-ttl">Dev Suite</span>'+TABS.map(([k,n])=>'<button class="dv-tab'+(S.tab===k?' dv-on':'')+'" data-tab="'+k+'">'+n+(k==='publish'&&nch?' ('+nch+')':'')+'</button>').join('')+
   '<span class="dv-sp1"></span>'+(S.ok==='yes'?'<label class="dv-mut" style="display:flex;gap:6px;align-items:center;margin-right:8px"><input type="checkbox" data-a="pv"'+(A.previewing?' checked':'')+'> <span class="dv-pvlong">Show unpublished edits in my game</span><span class="dv-pvs">Preview drafts</span></label>':'')+
   '<button class="dv-x" data-a="close">Close</button></div><div class="dv-main">'+main()+'</div><div class="dv-note">'+E(S.note)+'</div>';
  const sc=root.querySelector('.dv-ls .dv-grid'),top=sc?sc.scrollTop:0,mn=root.querySelector('.dv-main'),mtop=mn?mn.scrollTop:0;
  root.innerHTML=h;const sc2=root.querySelector('.dv-ls .dv-grid');if(sc2)sc2.scrollTop=top;const mn2=root.querySelector('.dv-main');if(mn2)mn2.scrollTop=mtop;
  if((S.tab==='sprites'||S.tab==='worn')&&S.ed){drawPal();drawTools();paint();requestAnimationFrame(paint)}}
 function main(){
  if(S.ok===null)return'<p class="dv-mut">Loading...</p>';
  if(S.ok==='signin')return'<div class="dv-card"><b>Sign in first.</b><p>The Dev Suite saves to the online database, so sign in with your Google account (Options > Sign in), then open it again.</p></div>';
  if(S.ok==='setup')return'<div class="dv-card"><b>One-time setup: let this account publish</b><p>The database doesn\'t know this account is the developer yet. In the Firebase console:</p><ol>'+
   '<li>Realtime Database &gt; <b>Rules</b>: paste the new <code>database.rules.json</code> and click <b>Publish</b>.</li>'+
   '<li>Realtime Database &gt; <b>Data</b>: hover the top line, click <b>+</b>, type <code>devs</code> as the key and leave the value empty, then click <b>+</b> next to <code>devs</code> and add your account ID below as the key with the value <code>true</code>.</li></ol>'+
   '<p>Your account ID:<br><code>'+E(S.uid)+'</code> <button class="dv-b" data-a="copyid">Copy</button></p><button class="dv-b dv-pri" data-a="retry">I\'ve done it, try again</button></div>';
  if(S.ok==='error')return'<div class="dv-card"><b>Couldn\'t reach the database.</b><p class="dv-mut">'+E(S.note)+'</p><button class="dv-b" data-a="retry">Try again</button></div>';
  if(S.tab==='sprites')return sprites();if(S.tab==='worn')return worn();if(S.tab==='stats')return stats();if(S.tab==='islands')return islands();return publish()}
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
   '<p class="dv-mut">Keys: P pen · E eraser · F fill · I pick a colour · Ctrl+Z undo · Ctrl+Y redo · Ctrl+S save</p>'}
  return h+'</div></div>'}
 function worn(){const q=S.q.toLowerCase(),all=A.wornKeys(),keys=all.filter(k=>(!q||(INAME[k]||'').toLowerCase().includes(q)||k.includes(q))&&(!S.only||wState(k)));
  let h='<div class="dv-spr'+(S.sel?' dv-has':'')+'"><div class="dv-ls"><input type="search" placeholder="Search '+all.length+' wearable items" value="'+E(S.q)+'" data-in="q">'+
   '<label class="dv-mut"><input type="checkbox" data-a="only"'+(S.only?' checked':'')+'> Only items with a worn look</label><div class="dv-grid">';
  for(const k of keys){const s2=wState(k);h+='<button class="dv-it'+(S.sel===k?' dv-on':'')+'" data-k="'+E(k)+'">'+(s2?'<i class="dv-bd dv-'+s2+'">'+(s2==='draft'?'DRAFT':'LIVE')+'</i>':'')+'<img alt="" src="'+thumb(k)+'"><span>'+E(INAME[k]||k)+'</span></button>'}
  if(!keys.length)h+='<p class="dv-mut">Nothing matches.</p>';
  h+='</div></div><div class="dv-ed">';
  if(!S.sel||!S.ed)h+='<div class="dv-card"><b>Pick a helmet, body, legs, weapon or shield.</b><p class="dv-mut">Draw how it looks on the character from the front, back and side (facing left is the side mirrored). Your character is shown underneath as a guide. Anything you don\'t draw keeps the game\'s own look, and every player sees the published look on everyone wearing it.</p></div>';
  else{const ed=S.ed,k=S.sel,sl=EQ[k]&&EQ[k].slot;h+='<div class="dv-row"><button class="dv-b dv-back" data-a="back">‹ All items</button><b style="font-size:16px">'+E(INAME[k]||k)+'</b><span class="dv-mut">'+E(SLN[sl]||sl)+' · '+E(k)+'</span></div>'+
   '<div class="dv-row">'+WDN.map((n,d)=>'<button class="dv-b'+(ed.dir===d?' dv-tl dv-on':'')+'" data-dir="'+d+'">'+n+(ed.layers[d].some(v=>v!==255)?' •':'')+'</button>').join('')+'<span class="dv-mut">'+(ed.dir===2?'Side faces right; facing left is mirrored for you.':'')+'</span></div>'+
   '<div class="dv-row dv-tools"></div><div class="dv-cv dv-cvw'+(ed.tool==='pan'?' dv-pan':'')+'"><canvas id="dvc"></canvas></div><div class="dv-pal"></div>'+
   '<div class="dv-pvw"><canvas id="dvwalk" width="400" height="112"></canvas><span class="dv-stx dv-st" style="flex:1"></span></div>'+
   '<div class="dv-row"><label class="dv-chk"><input type="checkbox" data-a="under"'+(ed.under?' checked':'')+'> Show my character underneath</label>'+
   (sl==='helm'||sl==='body'||sl==='legs'?'<label class="dv-chk"><input type="checkbox" data-a="hide"'+(ed.hide?' checked':'')+'> Hide the game\'s own '+(sl==='helm'?'hat':sl==='body'?'shirt colour':'trouser colour')+' for this item</label>':'')+'</div>'+
   '<div class="dv-row"><span class="dv-mut">Copy into this layer from:</span>'+WDN.map((n,d)=>d===ed.dir?'':'<button class="dv-b" data-copy="'+d+'">'+n+'</button>').join('')+'<button class="dv-b dv-bad" data-a="clr">Clear this layer</button></div>'+
   '<div class="dv-row"><button class="dv-b dv-pri" data-a="save">Save to draft</button><button class="dv-b" data-a="revert">Undo unsaved changes</button><button class="dv-b dv-bad" data-a="orig">Use the game\'s own look</button></div>'+
   '<p class="dv-mut">Keys: P pen · E eraser · F fill · I pick a colour · M move · + / − zoom · Ctrl+Z undo · Ctrl+Y redo · Ctrl+S save</p>'}
  return h+'</div></div>'}
 function drawTools(){const t=root.querySelector('.dv-tools');if(!t||!S.ed)return;const T=[['pen','Pen'],['erase','Eraser'],['fill','Fill'],['pick','Pick colour']];
  if(S.ed.kind==='worn')T.push(['pan','Move']);
  t.innerHTML=T.map(([k,n])=>'<button class="dv-b dv-tl'+(S.ed.tool===k?' dv-on':'')+'" data-tool="'+k+'">'+n+'</button>').join('')+'<button class="dv-b" data-a="undo">Undo</button><button class="dv-b" data-a="redo">Redo</button>'+
   (S.ed.kind==='worn'?'<button class="dv-b" data-a="zout" title="Zoom out">−</button><button class="dv-b" data-a="zin" title="Zoom in">+</button>':'');
  const cv=root.querySelector('.dv-cvw');if(cv)cv.classList.toggle('dv-pan',S.ed.tool==='pan')}
 function drawPal(){const p=root.querySelector('.dv-pal'),ed=S.ed;if(!p||!ed)return;
  p.innerHTML=ed.pal.map((c,i)=>'<button class="dv-sw'+(i===ed.col?' dv-on':'')+'" data-col="'+i+'" style="background:'+c+'" title="'+c+'"></button>').join('')+
   '<label class="dv-mut" style="margin-left:8px">Change this colour <input type="color" data-in="recol" value="'+(ed.pal[ed.col]||'#000000')+'"></label>'+
   (ed.pal.length<MAXC?'<label class="dv-mut" style="margin-left:8px">Add a colour <input type="color" data-in="addcol" value="#ffffff"></label>':'')}
 // ---- stats ----
 function stats(){const T=A.TABLES[S.statT],q=S.statQ.toLowerCase(),d=((S.draft.stats||{})[S.statT])||{};
  let h='<div class="dv-row" style="margin-bottom:10px"><div class="dv-chips">'+Object.keys(A.TABLES).map(t=>'<button class="dv-b'+(S.statT===t?' dv-tl dv-on':'')+'" data-stat="'+t+'">'+A.TABLES[t].name+'</button>').join('')+'</div>'+
   (S.statT==='items'?'<input type="search" style="max-width:260px" placeholder="Search items" value="'+E(S.statQ)+'" data-in="sq">':'')+'</div>'+
   '<p class="dv-mut">Changes save to your draft as you go. Changed fields are highlighted; ↺ puts a row back to the game\'s original.'+(S.statT==='ib'?' Island bosses also hit harder than normal monsters; HP here is their full HP.':'')+(S.statT==='wb'?' Damage is in hearts per hit.':'')+'</p>';
  h+='<table><thead><tr><th>'+(S.statT==='items'?'Item':'Boss')+'</th>'+T.fields.map(f=>'<th>'+f[1]+'</th>').join('')+'<th></th></tr></thead><tbody>';
  for(const k of T.keys()){const o=T.orig(k);if(q&&!String(o.n).toLowerCase().includes(q)&&!k.includes(q))continue;const cur=A.merged(S.statT,k,d[k]);
   h+='<tr data-row="'+E(k)+'"><td class="dv-k">'+E(o.n)+'<small>'+E(k)+'</small></td>'+T.fields.map(([f,l,ty])=>{const chg=cur[f]!==o[f]?' dv-chg':'';
    return'<td data-l="'+E(l)+'">'+(ty==='long'?'<textarea class="'+chg+'" data-f="'+f+'">'+E(cur[f])+'</textarea>':'<input class="'+chg+'" type="'+(ty==='num'?'number" min="0':'text')+'" data-f="'+f+'" value="'+E(cur[f])+'">')+'</td>'}).join('')+
    '<td>'+(d[k]?'<button class="dv-b" data-a="rowreset" title="Back to original">↺</button>':'')+'</td></tr>'}
  return h+'</tbody></table>'}
 async function statSet(t,k,f,val){const T=A.TABLES[t],o=T.orig(k),fd=T.fields.find(x=>x[0]===f);if(!fd)return;
  const v=fd[2]==='num'?Math.max(0,Math.round(Number(val)||0)):String(val);
  const all=S.draft.stats[t]=S.draft.stats[t]||{},row={...(all[k]||{})};if(v===o[f])delete row[f];else row[f]=v;
  if(Object.keys(row).length)all[k]=row;else delete all[k];
  try{await dset('draft/stats/'+t+'/'+k,all[k]||null);toast('Saved to draft.')}catch(e){fail(e)}
  if(A.previewing)A.preview(S.draft)}
 // ---- islands (next) ----
 function islands(){return'<div class="dv-card"><b>Island builder: coming next.</b><p>Islands are generated by the game\'s code today, so they first need a map format the builder can save and the game can load. That is the next piece of work: a tile canvas with drag-and-drop tiles, new tiles drawn in the sprite editor, and islands published the same way as sprites and stats.</p></div>'}
 // ---- publish ----
 function publish(){const ch=changes(),L=S.live;
  let h='<div class="dv-card" style="margin-bottom:12px"><b>Live version: '+(L&&L.v?'v'+L.v+' · published '+new Date(L.at).toLocaleString():'nothing published yet (the game\'s own sprites, looks and stats)')+'</b>';
  if(!ch.length)h+='<p class="dv-mut">Your draft matches what players have. Edit sprites, worn looks or stats and they\'ll show up here.</p>';
  else{h+='<p>'+ch.length+' change'+(ch.length>1?'s':'')+' waiting to publish:</p><ul class="dv-cl">'+ch.map(c=>'<li>'+(c.kind==='sprite'||c.kind==='worn'?'<img alt="" src="'+thumb(c.k)+'" style="width:22px;height:22px;image-rendering:pixelated;vertical-align:middle;margin-right:6px">'+E(INAME[c.k]||c.k)+': ':E((A.TABLES[c.t].label(c.k)))+': ')+E(c.what)+'</li>').join('')+'</ul>'+
   '<div class="dv-row"><button class="dv-b '+(S.arm==='pub'?'dv-arm':'dv-pri')+'" data-a="pub"'+(S.busy?' disabled':'')+'>'+(S.arm==='pub'?'Tap again to publish to every player':'Publish to every player')+'</button>'+
   '<button class="dv-b '+(S.arm==='disc'?'dv-arm':'dv-bad')+'" data-a="disc"'+(S.busy?' disabled':'')+'>'+(S.arm==='disc'?'Tap again to throw away these changes':'Discard draft changes')+'</button></div>'+
   '<p class="dv-mut">Players get a published version the next time they load the game. The version it replaces is kept below, so you can always go back.</p>'}
  h+='</div><div class="dv-card"><b>Earlier versions</b>';
  if(S.hist==null){h+='<p class="dv-mut">Loading...</p>';loadHist()}
  else if(!S.hist.length)h+='<p class="dv-mut">None yet. Each time you publish, the version it replaces is saved here.</p>';
  else h+=S.hist.map(x=>'<div class="dv-hl"><span>v'+x.v+' · '+new Date(x.at).toLocaleString()+' · '+(Object.keys(x.icons||{}).length)+' sprites, '+(Object.keys(x.worn||{}).length)+' worn looks, '+Object.values(x.stats||{}).reduce((a,t)=>a+Object.keys(t).length,0)+' stat rows</span><button class="dv-b '+(S.arm==='h'+x.v?'dv-arm':'')+'" data-a="restore" data-v="'+x.v+'"'+(S.busy?' disabled':'')+'>'+(S.arm==='h'+x.v?'Tap again to make this live':'Restore')+'</button></div>').join('');
  if(L&&L.v)h+='<div class="dv-hl"><span>The game\'s own sprites and stats (nothing published)</span><button class="dv-b '+(S.arm==='h0'?'dv-arm':'')+'" data-a="restore" data-v="0"'+(S.busy?' disabled':'')+'>'+(S.arm==='h0'?'Tap again to make this live':'Restore')+'</button></div>';
  return h+'</div>'}
 async function loadHist(){if(loadHist.on)return;loadHist.on=1;try{const H=await dget('hist');S.hist=H?Object.values(H).filter(x=>x&&x.v).sort((a,b)=>b.v-a.v):[]}catch(e){S.hist=[]}loadHist.on=0;draw()}
 async function goLive(L,label){S.busy=true;draw();try{const old=S.live;
   if(old&&old.v)await dset('hist/'+old.v,old);
   const next={...body(L),v:((old&&old.v)|0)+1,at:Date.now()};await dset('live',next);S.live=next;A.setLive(next);
   if(S.hist)S.hist=null;// prune: keep the 20 newest earlier versions
   try{const H=await dget('hist');if(H){const ks=Object.keys(H).map(Number).sort((a,b)=>b-a);for(const k of ks.slice(20))await dset('hist/'+k,null)}}catch(e){}
   toast(label+' Players get v'+next.v+' on their next load.')}catch(e){fail(e)}S.busy=false;S.arm=null;draw()}
 // ---- input ----
 const arm=(k,fn)=>{if(S.arm===k){S.arm=null;fn();return}S.arm=k;draw();clearTimeout(arm.t);arm.t=setTimeout(()=>{if(S.arm===k){S.arm=null;draw()}},4000)};
 root.addEventListener('click',async e=>{const t=e.target.closest('[data-tab],[data-a],[data-k],[data-tool],[data-col],[data-stat],[data-dir],[data-copy]');if(!t)return;
  if(t.dataset.tab){if(t.dataset.tab===S.tab)return;if(S.ed&&S.ed.dirty&&!confirmLeave())return;if(S.ed){S.ed.dirty=false}S.sel=null;S.ed=null;S.tab=t.dataset.tab;S.arm=null;draw();return}
  if(t.dataset.dir!=null&&S.ed){S.ed.dir=+t.dataset.dir;S.ed.px=S.ed.layers[S.ed.dir];draw();return}
  if(t.dataset.copy!=null&&S.ed){snapEd();S.ed.layers[S.ed.dir].set(S.ed.layers[+t.dataset.copy]);paint();draw();return}
  if(t.dataset.stat){S.statT=t.dataset.stat;draw();return}
  if(t.dataset.k){if(S.ed&&S.ed.dirty&&S.sel!==t.dataset.k&&!confirmLeave())return;if(S.tab==='worn')openWorn(t.dataset.k);else openSprite(t.dataset.k);return}
  if(t.dataset.tool){S.ed.tool=t.dataset.tool;drawTools();return}
  if(t.dataset.col){S.ed.col=+t.dataset.col;if(S.ed.tool==='erase'||S.ed.tool==='pick')S.ed.tool='pen';drawPal();drawTools();return}
  const a=t.dataset.a;
  if(a==='close')return close();
  if(a==='retry')return load();
  if(a==='copyid'){try{await navigator.clipboard.writeText(S.uid);toast('Copied.')}catch(e2){toast('Select the ID and copy it.')}return}
  if(a==='pv'){A.preview(t.checked?S.draft:null);toast(t.checked?'Your game now shows your draft (only on this device).':'Your game shows the published version again.');return}
  if(a==='only'){S.only=t.checked;draw();return}
  if(a==='back'){if(S.ed&&S.ed.dirty&&!confirmLeave())return;S.sel=null;S.ed=null;draw();return}
  if(a==='undo')return undo(false);if(a==='redo')return undo(true);
  if(a==='save')return S.ed&&S.ed.kind==='worn'?saveWorn():saveSprite();
  if(a==='revert'){S.ed.dirty=false;if(S.ed.kind==='worn')openWorn(S.sel);else openSprite(S.sel);return}
  if(a==='under'){S.ed.under=t.checked;paint();return}
  if(a==='hide'){S.ed.hide=t.checked;S.ed.dirty=true;paint();return}
  if(a==='zin'||a==='zout'){const ed=S.ed,cv=root.querySelector('.dv-cvw'),c=document.getElementById('dvc');const fx=cv&&c.width?(cv.scrollLeft+cv.clientWidth/2)/c.width:.5,fy=cv&&c.height?(cv.scrollTop+cv.clientHeight/2)/c.height:.5;
   ed.zoom=Math.max(1,Math.min(12,(ed.zoom||1)*(a==='zin'?1.5:1/1.5)));if(a==='zin'&&ed.tool!=='pan')toast('Tip: use Move (M) to look around.');ed.z=0;paint();if(cv){cv.scrollLeft=fx*c.width-cv.clientWidth/2;cv.scrollTop=fy*c.height-cv.clientHeight/2}return}
  if(a==='clr'){snapEd();S.ed.px.fill(255);paint();draw();return}
  if(a==='orig'&&S.ed&&S.ed.kind==='worn'){const k=S.sel;delete S.draft.worn[k];try{await dset('draft/worn/'+k,null);toast('Back to the game\'s own look (in your draft).')}catch(e2){fail(e2)}if(A.previewing)A.preview(S.draft);openWorn(k);return}
  if(a==='orig'){const k=S.sel;delete S.draft.icons[k];try{await dset('draft/icons/'+k,null);toast('Back to the game\'s original sprite (in your draft).')}catch(e2){fail(e2)}if(A.previewing)A.preview(S.draft);S.ed=null;openSprite(k);return}
  if(a==='rowreset'){const k=t.closest('[data-row]').dataset.row,all=S.draft.stats[S.statT]||{};delete all[k];try{await dset('draft/stats/'+S.statT+'/'+k,null);toast('Back to the original.')}catch(e2){fail(e2)}if(A.previewing)A.preview(S.draft);draw();return}
  if(a==='pub')return arm('pub',()=>goLive(S.draft,'Published.'));
  if(a==='disc')return arm('disc',async()=>{S.draft=norm(body(S.live));try{await dset('draft',S.draft)}catch(e2){fail(e2)}if(A.previewing)A.preview(S.draft);S.sel=null;S.ed=null;toast('Draft reset to the live version.');draw()});
  if(a==='restore'){const v=+t.dataset.v;return arm('h'+v,async()=>{const H=v?S.hist.find(x=>x.v===v):{};await goLive(H,v?'Restored v'+v+' as the live version.':'Back to the game\'s own sprites and stats.');
   S.draft=norm(body(S.live));try{await dset('draft',S.draft)}catch(e2){}draw()})}});
 let pendingLeave=0;const confirmLeave=()=>{if(Date.now()-pendingLeave<4000)return true;pendingLeave=Date.now();toast('Unsaved changes. Tap again to leave without saving.');return false};
 async function saveSprite(){const ed=S.ed;if(!ed)return;const sp=toSp(ed);S.draft.icons[ed.k]=sp;try{await dset('draft/icons/'+ed.k,sp);ed.dirty=false;toast('Saved to draft. Publish it from the Publish tab.')}catch(e){fail(e)}
  if(A.previewing)A.preview(S.draft);const it=root.querySelector('.dv-it[data-k="'+ed.k+'"]');if(it){const im=it.querySelector('img');if(im)im.src=thumb(ed.k)}paint()}
 root.addEventListener('input',e=>{const t=e.target,n=t.dataset.in;
  if(n==='q'){S.q=t.value;const pos=t.selectionStart;draw();const i=root.querySelector('[data-in="q"]');if(i){i.focus();i.setSelectionRange(pos,pos)}return}
  if(n==='sq'){S.statQ=t.value;const pos=t.selectionStart;draw();const i=root.querySelector('[data-in="sq"]');if(i){i.focus();i.setSelectionRange(pos,pos)}return}
  if(n==='recol'&&S.ed&&S.ed.pal[S.ed.col]!=null){if(!t._snap){snapEd();t._snap=1}S.ed.pal[S.ed.col]=t.value;const sw=root.querySelector('.dv-sw.dv-on');if(sw)sw.style.background=t.value;paint()}});
 root.addEventListener('change',e=>{const t=e.target;
  if(t.dataset.in==='addcol'&&S.ed){snapEd();S.ed.pal.push(t.value);S.ed.col=S.ed.pal.length-1;S.ed.tool='pen';drawPal();drawTools();paint();return}
  if(t.dataset.in==='recol'){t._snap=0;drawPal();return}
  if(t.dataset.f){const k=t.closest('[data-row]').dataset.row;statSet(S.statT,k,t.dataset.f,t.value).then(()=>{const o=A.TABLES[S.statT].orig(k),cur=A.merged(S.statT,k,(S.draft.stats[S.statT]||{})[k]);t.classList.toggle('dv-chg',cur[t.dataset.f]!==o[t.dataset.f]);
   const last=t.closest('tr').lastElementChild;if(last)last.innerHTML=(S.draft.stats[S.statT]||{})[k]?'<button class="dv-b" data-a="rowreset" title="Back to original">↺</button>':''})}});
 let pan=null;
 root.addEventListener('pointerdown',e=>{if(e.target.id!=='dvc'||!S.ed)return;e.preventDefault();try{e.target.setPointerCapture(e.pointerId)}catch(_){}
  if(S.ed.tool==='pan'){const cv=e.target.parentElement;pan={x:e.clientX,y:e.clientY,sx:cv.scrollLeft,sy:cv.scrollTop,cv};return}down=true;use(e,true)});
 root.addEventListener('pointermove',e=>{if(pan){pan.cv.scrollLeft=pan.sx-(e.clientX-pan.x);pan.cv.scrollTop=pan.sy-(e.clientY-pan.y);return}if(down&&e.target.id==='dvc'&&S.ed&&S.ed.tool!=='fill'&&S.ed.tool!=='pick')use(e,false)});
 addEventListener('pointerup',()=>{pan=null});
 addEventListener('pointerup',()=>{if(down){down=false;last=-1;paint()}});
 addEventListener('resize',()=>{if(S.open&&S.ed){S.ed.fit=0;paint()}});
 // keys: the game must not see them while the suite is open
 addEventListener('keydown',e=>{if(!S.open)return;e.stopPropagation();const tg=e.target,typing=/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)&&tg.type!=='checkbox';
  if(e.key==='Escape'&&!typing){close();return}if(typing||!S.ed||(S.tab!=='sprites'&&S.tab!=='worn'))return;const k=e.key.toLowerCase(),m=e.ctrlKey||e.metaKey;
  if(m&&k==='z'){e.preventDefault();undo(e.shiftKey);return}if(m&&k==='y'){e.preventDefault();undo(true);return}if(m&&k==='s'){e.preventDefault();if(S.ed.kind==='worn')saveWorn();else saveSprite();return}
  if(S.ed.kind==='worn'&&!m&&(k==='+'||k==='='||k==='-')){const b=root.querySelector('[data-a="'+(k==='-'?'zout':'zin')+'"]');if(b)b.click();return}
  const T={p:'pen',b:'pen',e:'erase',f:'fill',g:'fill',i:'pick'};if(S.ed.kind==='worn')T.m='pan';if(!m&&T[k]){S.ed.tool=T[k];drawTools()}},true);
 addEventListener('keyup',e=>{if(S.open)e.stopPropagation()},true);
 // no damage while you're in the suite
 const _hp=hurtP;hurtP=function(){if(S.open)return;return _hp.apply(this,arguments)};
 function openSuite(){if(!(window.SQDEV&&SQDEV()))return;try{for(const k in K)K[k]=0}catch(e){}try{if(pnOpen)closePanel()}catch(e){}
  S.open=true;root.style.display='flex';draw();if(S.ok!=='yes')load()}
 function close(){if(S.ed&&S.ed.dirty&&!confirmLeave())return;S.open=false;root.style.display='none';root.innerHTML=''}
 window.SQSUITE={open:openSuite,close,get state(){return S}};
 // entry points: Options (developer only) and /suite in chat
 const _o=optionsHTML;optionsHTML=function(){const h=_o();return window.SQDEV&&SQDEV()?h+'<div class="dv-tl" style="margin-top:16px">DEVELOPER</div><button class="sb dvopen">Dev Suite</button>':h};
 pbd.addEventListener('click',e=>{if(e.target.closest('.dvopen')){e.stopPropagation();openSuite()}},true);
 const _ms=mpSend;mpSend=function(t){if(/^\/suite\s*$/i.test(String(t||'').trim())&&window.SQDEV&&SQDEV()){openSuite();return}return _ms(t)}})();
