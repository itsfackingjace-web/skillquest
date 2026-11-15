// ---- 219. The Art Room: Patrons draw sprites and animations and send them to the developer ----
// Open to active Patrons who aren't under 13 (Options > PATRON > Open the Art Room; ptab 47). A pixel editor: canvas up to
// 48x48, palette (slot 0 = clear, the rest editable with a colour picker), pen / eraser / fill / picker, up to 8 frames with
// onion skin and a live preview at `ms` per frame, undo/redo, a draft kept on the device (localStorage sq_art_draft).
// SEND writes `art/<uid>/<push id>` {n, k (item|pet|prop|anim|other), w, h, f, ms, note, who, t}; f = JSON {p:[hex...], fr:[one
// character per pixel, index into p via CH ('.' = clear)]}. Name and note go through SQFILTER. The rules let only active
// 13+ Patrons create, never change a sent piece, and never set `st`/`re` (devs do). "My art" lists your pieces and their status.
// Dev Suite > Art Room (inbox): every submission animated, Approve / Not this time with a message (st 'ok'/'no', re, a gift
// message to the artist, and `artcred/<id>` for the credits on approval), "Copy frame to the clipboard" (sq_dev_clip, pasteable
// in every Dev Suite picture editor), and Patrons: grant or extend patron/<uid> {s,u,c} by player search.
(()=>{const myNm=()=>{try{const m=window.SQMP;return String((typeof PNAME!=='undefined'&&PNAME)||((m&&m.user&&m.user.displayName)||'').split(' ')[0]||'Adventurer').replace(/[<>]/g,'').slice(0,12)}catch(e){return'Adventurer'}};const ATAB=47,MAXF=8,MAXS=48,CH='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&()*+,-/:;<=>?@[]^_{|}~';
 const mp=()=>window.SQMP,F=()=>window.SQFB,uid=()=>{const m=mp();return m&&m.user?m.user.uid:''};
 const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const can=()=>!!(window.SQPATRON&&SQPATRON.active(uid())&&!(window.SQAGE&&SQAGE.child()));
 const PAL0=['','#000000','#1d2b53','#7e2553','#008751','#ab5236','#5f574f','#c2c3c7','#fff1e8','#ff004d','#ffa300','#ffec27','#00e436','#29adff','#83769c','#ff77a8','#ffccaa',
  '#2a1a10','#5a3a20','#8a5a30','#c8904a','#3a6a2a','#68a848','#a8d870','#1a3a6a','#3870d8','#88c0f0','#6a1a1a','#c83040','#f8a8a8','#404048','#909098'];
 const KINDS=[['item','Item icon'],['pet','Pet'],['prop','Decoration or object'],['anim','Animation or effect'],['other','Something else']];
 const blank=(w,h)=>new Uint8Array(w*h);
 let A=null;
 function fresh(){return{w:16,h:16,fr:[blank(16,16)],cur:0,pal:PAL0.slice(),col:1,tool:'pen',ms:200,onion:true,name:'',kind:'item',note:'',undo:[],redo:[],view:'draw',mine:null,sent:''}}
 function load(){if(A)return;try{const d=JSON.parse(localStorage.getItem('sq_art_draft')||'null');if(d&&d.w&&d.fr){A=Object.assign(fresh(),d,{fr:d.fr.map(s=>Uint8Array.from(s)),undo:[],redo:[],view:'draw',mine:null});return}}catch(e){}A=fresh()}
 let saveT=0;function keep(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem('sq_art_draft',JSON.stringify({w:A.w,h:A.h,fr:A.fr.map(f=>Array.from(f)),cur:A.cur,pal:A.pal,col:A.col,tool:A.tool,ms:A.ms,onion:A.onion,name:A.name,kind:A.kind,note:A.note}))}catch(e){}},400)}
 const snapU=()=>{A.undo.push({fr:A.fr.map(f=>f.slice()),cur:A.cur,w:A.w,h:A.h});if(A.undo.length>60)A.undo.shift();A.redo=[]};
 // ---- the panel ----
 {const st=document.createElement('style');st.textContent=`#pn .arw{display:flex;flex-wrap:wrap;gap:12px;font:500 14px ${PF}}#pn .arw>div{min-width:0}#pn .arw>div:first-child{flex:0 0 auto;max-width:100%}
#pn .arw canvas,#pn .arsub canvas{position:static!important;inset:auto!important;display:block}#pn .arcv{width:auto;height:auto;touch-action:none;image-rendering:pixelated;border:3px solid #485870;background:#fff;cursor:crosshair;max-width:100%}
#pn .arpal{display:grid;grid-template-columns:repeat(8,26px);gap:3px;margin:6px 0}#pn .arpal button{width:26px;height:26px;border:3px solid #485870;padding:0;cursor:pointer}
#pn .arpal button.on{border-color:#f8a020;outline:2px solid #f8a020}#pn .arpal .clr{background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/10px 10px}
#pn .arrow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}#pn .arb{font:700 13px ${PF};padding:6px 9px;border:3px solid #485870;background:#f8f8f8;color:#303030;cursor:pointer}
#pn .arb.on{background:#ffe8b0;border-color:#c88010}#pn .arb:disabled{opacity:.45;cursor:default}#pn .arb.pri{background:#3a8a4a;color:#fff;border-color:#1f5a2c}
#pn .arfr{display:flex;gap:6px;flex-wrap:wrap}#pn .arfr canvas{width:40px;height:40px;image-rendering:pixelated;border:3px solid #485870;background:#fff;cursor:pointer}#pn .arfr canvas.on{border-color:#f8a020}
#pn .arin{width:100%;box-sizing:border-box;font:500 15px ${PF};padding:6px;border:2px solid #485870;background:#fff;color:#303030}
#pn .arsub{display:flex;gap:10px;align-items:center;border-bottom:1px solid #c8c8c8;padding:8px 0}#pn .arsub canvas{width:48px;height:48px;image-rendering:pixelated;border:2px solid #485870;background:#fff;flex:none}
#pn .arst{font-weight:700}#pn .arst.ok{color:#2a7a3a}#pn .arst.no{color:#a83232}#pn .arsm{font-size:12px;opacity:.75}`;document.head.appendChild(st)}
 const cell=()=>Math.max(4,Math.floor(Math.min(Math.min(420,(pbd.clientWidth||360)-20),400)/Math.max(A.w,A.h)));
 function html(){if(!can())return'<div class="tl">ART ROOM</div><p>The Art Room is open to Patrons aged 13 and up.</p><button class="arb" data-ar="back">Back</button>';
  if(A.view==='mine')return mineHTML();
  const c=cell(),f=A.fr.length;
  return '<div class="tl">ART ROOM</div><p class="arsm" style="margin:0 0 8px">Draw something for SkillQuest and send it to the developer. Approved art goes into the game, with your name in the credits.</p>'+
   '<div class="arw"><div><canvas class="arcv" id="arcv" width="'+A.w*c+'" height="'+A.h*c+'" aria-label="Drawing canvas"></canvas>'+
   '<div class="arrow">'+[['pen','Pen'],['erase','Eraser'],['fill','Fill'],['pick','Pick colour']].map(([k,l])=>'<button class="arb'+(A.tool===k?' on':'')+'" data-ar="tool:'+k+'">'+l+'</button>').join('')+
   '<button class="arb" data-ar="undo"'+(A.undo.length?'':' disabled')+'>Undo</button><button class="arb" data-ar="redo"'+(A.redo.length?'':' disabled')+'>Redo</button><button class="arb" data-ar="clear">Clear frame</button></div>'+
   '<div class="arpal">'+A.pal.map((h,i)=>'<button class="'+(i===A.col?'on ':'')+(i?'':'clr')+'" data-ar="col:'+i+'" style="'+(i?'background:'+h:'')+'" aria-label="'+(i?'Colour '+i:'Clear')+'"></button>').join('')+'</div>'+
   (A.col?'<label class="arsm">Change this colour <input type="color" id="arcc" value="'+A.pal[A.col]+'"></label>':'')+'</div>'+
   '<div style="flex:1 1 220px"><div class="arsm">Frames ('+f+'/'+MAXF+')</div><div class="arfr">'+A.fr.map((_,i)=>'<canvas width="'+A.w+'" height="'+A.h+'" data-arf="'+i+'" class="'+(i===A.cur?'on':'')+'" aria-label="Frame '+(i+1)+'"></canvas>').join('')+'</div>'+
   '<div class="arrow"><button class="arb" data-ar="fadd"'+(f<MAXF?'':' disabled')+'>New frame</button><button class="arb" data-ar="fdup"'+(f<MAXF?'':' disabled')+'>Copy frame</button><button class="arb" data-ar="fdel"'+(f>1?'':' disabled')+'>Delete frame</button>'+
   '<button class="arb" data-ar="fl"'+(A.cur>0?'':' disabled')+'>◀ Move</button><button class="arb" data-ar="fr"'+(A.cur<f-1?'':' disabled')+'>Move ▶</button></div>'+
   '<div class="arrow"><button class="arb'+(A.onion?' on':'')+'" data-ar="onion">Show previous frame</button></div>'+
   '<div class="arsm">Preview</div><canvas id="arpv" width="'+A.w+'" height="'+A.h+'" style="width:96px;height:96px;image-rendering:pixelated;border:3px solid #485870;background:#fff"></canvas>'+
   '<label class="arsm" style="display:block">Speed: <span id="arms">'+A.ms+'</span> ms a frame<input type="range" id="arsp" min="60" max="1000" step="20" value="'+A.ms+'" style="width:100%"></label>'+
   '<label class="arsm" style="display:block;margin-top:8px">Size <select id="arsz" class="arin" style="width:auto">'+[8,12,16,20,24,32,40,48].map(n=>'<option value="'+n+'"'+(n===A.w&&n===A.h?' selected':'')+'>'+n+' x '+n+'</option>').join('')+(A.w!==A.h?'<option selected>'+A.w+' x '+A.h+'</option>':'')+'</select></label>'+
   '<label class="arsm" style="display:block;margin-top:8px">Name<input class="arin" id="arnm" maxlength="24" value="'+E(A.name)+'" placeholder="e.g. Ember sword"></label>'+
   '<label class="arsm" style="display:block;margin-top:6px">What is it?<select class="arin" id="arkd">'+KINDS.map(([k,l])=>'<option value="'+k+'"'+(k===A.kind?' selected':'')+'>'+l+'</option>').join('')+'</select></label>'+
   '<label class="arsm" style="display:block;margin-top:6px">Note for the developer (optional)<textarea class="arin" id="arnt" maxlength="300" rows="3">'+E(A.note)+'</textarea></label>'+
   '<div class="arrow"><button class="arb pri" data-ar="send">Send to the developer</button><button class="arb" data-ar="mine">My art</button><button class="arb" data-ar="new">Start over</button></div>'+
   (A.sent?'<p class="arsm">'+E(A.sent)+'</p>':'')+'<button class="arb" data-ar="back">Back</button></div></div>'}
 function mineHTML(){const L=A.mine;const S={ok:['Approved','ok'],no:['Not this time','no']};
  return '<div class="tl">MY ART</div>'+(L==null?'<p>Loading...</p>':L.length?L.map(x=>'<div class="arsub"><canvas width="'+x.w+'" height="'+x.h+'" data-arm="'+E(x.id)+'"></canvas><div><b>'+E(x.n)+'</b> <span class="arsm">'+E((KINDS.find(k=>k[0]===x.k)||['',''])[1])+'</span><br>'+
   '<span class="arst '+((S[x.st]||[])[1]||'')+'">'+((S[x.st]||['Waiting for the developer'])[0])+'</span>'+(x.re?'<div class="arsm">'+E(x.re)+'</div>':'')+'</div></div>').join(''):'<p>You haven\'t sent anything yet.</p>')+
   '<button class="arb" data-ar="draw">Back to drawing</button>'}
 // ---- drawing on the canvas ----
 const hex=i=>A.pal[i]||'';
 function paint(){const cv=document.getElementById('arcv');if(!cv)return;const c=cell(),x=cv.getContext('2d');x.imageSmoothingEnabled=false;
  for(let j=0;j<A.h;j++)for(let i=0;i<A.w;i++){x.fillStyle=(i+j)%2?'#e8e8e8':'#ffffff';x.fillRect(i*c,j*c,c,c)}
  if(A.onion&&A.cur>0){const pf=A.fr[A.cur-1];x.globalAlpha=.28;for(let k=0;k<pf.length;k++)if(pf[k]){x.fillStyle=hex(pf[k]);x.fillRect((k%A.w)*c,((k/A.w)|0)*c,c,c)}x.globalAlpha=1}
  const f=A.fr[A.cur];for(let k=0;k<f.length;k++)if(f[k]){x.fillStyle=hex(f[k]);x.fillRect((k%A.w)*c,((k/A.w)|0)*c,c,c)}
  if(c>=8){x.strokeStyle='rgba(0,0,0,.08)';x.lineWidth=1;x.beginPath();for(let i=1;i<A.w;i++){x.moveTo(i*c+.5,0);x.lineTo(i*c+.5,A.h*c)}for(let j=1;j<A.h;j++){x.moveTo(0,j*c+.5);x.lineTo(A.w*c,j*c+.5)}x.stroke()}
  thumbs();drawFrame(document.getElementById('arpv'),A.fr[pvF%A.fr.length]||A.fr[0],A.w,A.h,A.pal)}
 function drawFrame(cv,f,w,h,pal){if(!cv)return;const x=cv.getContext('2d');x.clearRect(0,0,w,h);for(let k=0;k<f.length;k++){const v=f[k];if(v&&pal[v]){x.fillStyle=pal[v];x.fillRect(k%w,(k/w)|0,1,1)}}}
 function thumbs(){document.querySelectorAll('#pn [data-arf]').forEach(cv=>drawFrame(cv,A.fr[+cv.dataset.arf],A.w,A.h,A.pal))}
 function fill(f,k,to){const from=f[k];if(from===to)return;const q=[k];while(q.length){const p=q.pop();if(f[p]!==from)continue;f[p]=to;const x=p%A.w,y=(p/A.w)|0;if(x>0)q.push(p-1);if(x<A.w-1)q.push(p+1);if(y>0)q.push(p-A.w);if(y<A.h-1)q.push(p+A.w)}}
 let drag=null;
 function at(e){const cv=document.getElementById('arcv'),r=cv.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*A.w),y=Math.floor((e.clientY-r.top)/r.height*A.h);return x>=0&&y>=0&&x<A.w&&y<A.h?[x,y]:null}
 function plot(x,y){const f=A.fr[A.cur];f[y*A.w+x]=A.tool==='erase'?0:A.col}
 function line(a,b){let[x0,y0]=a;const[x1,y1]=b;const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let er=dx+dy;for(let n=0;n<200;n++){plot(x0,y0);if(x0===x1&&y0===y1)break;const e2=2*er;if(e2>=dy){er+=dy;x0+=sx}if(e2<=dx){er+=dx;y0+=sy}}}
 pbd.addEventListener('pointerdown',e=>{if(ptab!==ATAB||e.target.id!=='arcv')return;e.preventDefault();e.stopPropagation();const p=at(e);if(!p)return;
  if(A.tool==='pick'){A.col=A.fr[A.cur][p[1]*A.w+p[0]];A.tool='pen';rPn();return}
  snapU();if(A.tool==='fill'){fill(A.fr[A.cur],p[1]*A.w+p[0],A.col);paint();keep();return}
  drag=p;plot(p[0],p[1]);paint();try{e.target.setPointerCapture(e.pointerId)}catch(_){}},true);
 pbd.addEventListener('pointermove',e=>{if(!drag||ptab!==ATAB||e.target.id!=='arcv')return;e.preventDefault();const p=at(e);if(!p)return;line(drag,p);drag=p;paint()},true);
 const endDrag=()=>{if(drag){drag=null;keep();rPnSoft()}};addEventListener('pointerup',endDrag,true);addEventListener('pointercancel',endDrag,true);
 // redraw buttons (undo state) without rebuilding the canvas mid-stroke
 function rPnSoft(){const u=document.querySelector('#pn [data-ar="undo"]'),r=document.querySelector('#pn [data-ar="redo"]');if(u)u.disabled=!A.undo.length;if(r)r.disabled=!A.redo.length}
 // ---- preview ----
 let pvF=0,pvT=0;setInterval(()=>{if(ptab!==ATAB||!pnOpen||!A||A.view!=='draw')return;const now=performance.now();if(now-pvT<A.ms)return;pvT=now;pvF=(pvF+1)%A.fr.length;drawFrame(document.getElementById('arpv'),A.fr[pvF],A.w,A.h,A.pal)},40);
 // ---- buttons and fields ----
 pbd.addEventListener('click',async e=>{if(ptab!==ATAB)return;const fc=e.target.closest&&e.target.closest('[data-arf]');if(fc){A.cur=+fc.dataset.arf;rPn();return}
  const b=e.target.closest&&e.target.closest('[data-ar]');if(!b)return;e.stopPropagation();e.preventDefault();const[a,v]=b.dataset.ar.split(':');
  if(a==='tool')A.tool=v;else if(a==='col'){A.col=+v;if(A.tool==='erase'||A.tool==='pick')A.tool='pen'}
  else if(a==='undo'&&A.undo.length){A.redo.push({fr:A.fr.map(f=>f.slice()),cur:A.cur,w:A.w,h:A.h});const s=A.undo.pop();Object.assign(A,s)}
  else if(a==='redo'&&A.redo.length){A.undo.push({fr:A.fr.map(f=>f.slice()),cur:A.cur,w:A.w,h:A.h});const s=A.redo.pop();Object.assign(A,s)}
  else if(a==='clear'){snapU();A.fr[A.cur]=blank(A.w,A.h)}
  else if(a==='fadd'&&A.fr.length<MAXF){snapU();A.fr.splice(A.cur+1,0,blank(A.w,A.h));A.cur++}
  else if(a==='fdup'&&A.fr.length<MAXF){snapU();A.fr.splice(A.cur+1,0,A.fr[A.cur].slice());A.cur++}
  else if(a==='fdel'&&A.fr.length>1){snapU();A.fr.splice(A.cur,1);A.cur=Math.min(A.cur,A.fr.length-1)}
  else if(a==='fl'&&A.cur>0){snapU();[A.fr[A.cur-1],A.fr[A.cur]]=[A.fr[A.cur],A.fr[A.cur-1]];A.cur--}
  else if(a==='fr'&&A.cur<A.fr.length-1){snapU();[A.fr[A.cur+1],A.fr[A.cur]]=[A.fr[A.cur],A.fr[A.cur+1]];A.cur++}
  else if(a==='onion')A.onion=!A.onion;
  else if(a==='new'){if(b.dataset.sure){A=fresh();try{localStorage.removeItem('sq_art_draft')}catch(x){}}else{b.dataset.sure=1;b.textContent='Sure? Tap again';return}}
  else if(a==='send'){await send();return}
  else if(a==='mine'){A.view='mine';A.mine=null;rPn();loadMine();return}
  else if(a==='draw')A.view='draw';
  else if(a==='back'){ptab=8;rPn();return}
  keep();rPn()},true);
 pbd.addEventListener('input',e=>{if(ptab!==ATAB||!A)return;const t=e.target;
  if(t.id==='arnm')A.name=t.value.slice(0,24);else if(t.id==='arnt')A.note=t.value.slice(0,300);
  else if(t.id==='arsp'){A.ms=+t.value;const s=document.getElementById('arms');if(s)s.textContent=A.ms}
  else if(t.id==='arcc'&&A.col){A.pal[A.col]=t.value;paint();const sw=document.querySelector('#pn [data-ar="col:'+A.col+'"]');if(sw)sw.style.background=t.value}
  keep()},true);
 pbd.addEventListener('change',e=>{if(ptab!==ATAB||!A)return;const t=e.target;
  if(t.id==='arkd'){A.kind=t.value;keep()}
  else if(t.id==='arsz'){const n=+t.value;if(!n||n===A.w&&n===A.h)return;snapU();A.fr=A.fr.map(f=>{const g2=blank(n,n);for(let y=0;y<Math.min(n,A.h);y++)for(let x=0;x<Math.min(n,A.w);x++)g2[y*n+x]=f[y*A.w+x];return g2});A.w=A.h=n;keep();rPn()}},true);
 // ---- sending ----
 function pack(){const used=[...new Set(A.fr.flatMap(f=>Array.from(f)))].filter(v=>v).slice(0,CH.length);const map=new Map(used.map((v,i)=>[v,CH[i]]));
  return JSON.stringify({p:used.map(v=>A.pal[v]),fr:A.fr.map(f=>Array.from(f,v=>v?map.get(v)||'.':'.').join(''))})}
 async function send(){const u=uid(),Fb=F();if(!u||!Fb){say('Sign in to send your art.');return}if(!can()){say('The Art Room is for Patrons aged 13 and up.');return}
  const clean=t=>window.SQFILTER?SQFILTER.clean(t):t;const name=clean(String(A.name||'').trim()).slice(0,24);if(!name){A.sent='Give your art a name first.';rPn();return}
  if(!A.fr.some(f=>f.some(v=>v))){A.sent='Draw something first.';rPn();return}
  const d={n:name,k:A.kind,w:A.w,h:A.h,f:pack(),ms:Math.max(40,Math.min(2000,A.ms|0)),who:myNm().slice(0,12)||'Patron',t:Fb.db.serverTimestamp()};const nt=clean(String(A.note||'').trim()).slice(0,300);if(nt)d.note=nt;
  A.sent='Sending...';rPn();
  try{await Fb.db.push(Fb.db.ref(Fb.D,'art/'+u),d);A.sent='Sent! You\'ll get a message when the developer has looked at "'+name+'".';say('Your art was sent to the developer.')}
  catch(e){A.sent='That didn\'t send. Check your connection and try again.'}rPn()}
 async function loadMine(){const u=uid(),Fb=F();if(!u||!Fb){A.mine=[];rPn();return}try{const v=(await Fb.db.get(Fb.db.ref(Fb.D,'art/'+u))).val()||{};
   A.mine=Object.entries(v).map(([id,x])=>Object.assign({id},x)).sort((a,b)=>(b.t||0)-(a.t||0))}catch(e){A.mine=[]}rPn()}
 const unpack=x=>{try{const d=JSON.parse(x.f);const pal=['',...d.p];return d.fr.map(s=>Uint8Array.from(s,c=>c==='.'?0:CH.indexOf(c)+1)).map(f=>({f,pal}))}catch(e){return[]}};
 // ---- the panel hook ----
 {const _r=rPn;rPn=function(){if(ptab===ATAB&&pnOpen){load();try{panelChrome('')}catch(e){}pbd.innerHTML=html();if(A.view==='draw')paint();else document.querySelectorAll('#pn [data-arm]').forEach(cv=>{const x=(A.mine||[]).find(m=>m.id===cv.dataset.arm);const fr=x?unpack(x):[];if(fr[0])drawFrame(cv,fr[0].f,x.w,x.h,fr[0].pal)});return}return _r.apply(this,arguments)}}
 function open(){if(!can()){say('The Art Room is for Patrons aged 13 and up.');return}load();A.view='draw';try{if(!pnOpen&&typeof openPanel==='function')openPanel(ATAB)}catch(e){}ptab=ATAB;pnOpen=true;try{pn.style.display='block'}catch(e){}rPn()}
 window.SQARTROOM={open,unpack,pack:()=>pack(),get state(){return A},CH};
 // ======================= Dev Suite > Art Room inbox =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,toast,fail}=API;
 const T={list:null,lb:null,msg:{},q:'',pat:{}};
 const D=()=>F().db,ref=p=>D().ref(F().D,p);
 async function inbox(){try{const[a,l,p,pc]=await Promise.all([D().get(ref('art')),D().get(ref('lb')),D().get(ref('patron')),D().get(ref('cfgpub/patreon'))]);const v=a.val()||{};T.lb=l.val()||{};T.pat=p.val()||{};T.pc=pc.val()||{};
   T.list=[];for(const u in v)for(const id in v[u])T.list.push(Object.assign({u,id},v[u][id]));T.list.sort((x,y)=>(x.st?1:0)-(y.st?1:0)||(y.t||0)-(x.t||0))}catch(e){fail(e);T.list=[]}API.draw()}
 const nm=u=>T.lb&&T.lb[u]&&T.lb[u].n||u.slice(0,8);
 function render(){if(!T.list){inbox();return'<p class="dv-mut">Loading…</p>'}
  const waiting=T.list.filter(x=>!x.st);
  let h='<div class="dv-card"><b>🎨 Art Room inbox</b><p class="dv-mut">Pieces Patrons drew in the Art Room. Approve to thank them and add them to the credits; then copy a frame to the clipboard and paste it into any picture editor here.</p>'+
   '<p>'+waiting.length+' waiting, '+(T.list.length-waiting.length)+' answered.</p></div>';
  for(const x of T.list){const k=x.u+'/'+x.id,fr=unpack(x);
   h+='<div class="dv-card" style="margin-top:10px"><div class="dv-row" style="gap:12px;align-items:flex-start;flex-wrap:wrap"><canvas data-arp="'+E(k)+'" width="'+x.w+'" height="'+x.h+'" style="position:static;display:block;width:'+Math.min(192,x.w*6)+'px;height:'+Math.min(192,x.h*6)+'px;image-rendering:pixelated;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/12px 12px;border:2px solid #485870"></canvas>'+
    '<div style="flex:1;min-width:200px"><b>'+E(x.n)+'</b> <span class="dv-mut">by '+E(x.who||nm(x.u))+' · '+E(x.k)+' · '+x.w+'x'+x.h+' · '+fr.length+' frame'+(fr.length===1?'':'s')+(fr.length>1?' at '+(x.ms||200)+' ms':'')+(x.t?' · '+new Date(x.t).toLocaleDateString():'')+'</span>'+
    (x.note?'<p>'+E(x.note)+'</p>':'')+(x.st?'<p><b>'+(x.st==='ok'?'Approved':'Not this time')+'</b>'+(x.re?': '+E(x.re):'')+'</p>':'')+
    '<div class="dv-row" style="flex-wrap:wrap;gap:6px">'+fr.map((_,i)=>'<button class="dv-b" data-arx="clip:'+E(k)+':'+i+'">Copy frame '+(i+1)+'</button>').join('')+'</div>'+
    (x.st?'':'<input data-arq="'+E(k)+'" placeholder="Message to the artist (optional)" value="'+E(T.msg[k]||'')+'" style="width:100%;margin-top:6px"><div class="dv-row" style="gap:6px;margin-top:6px"><button class="dv-b dv-pri" data-arx="ok:'+E(k)+'">Approve</button><button class="dv-b dv-bad" data-arx="no:'+E(k)+'">Not this time</button></div>')+
    '</div></div></div>'}
  // Patreon link settings: cfg/patreon (secrets; nobody can read them back, only the server functions) + cfgpub/patreon (client id, which ones are set)
  const pc=T.pc||{},yes=b=>b?'✓ saved':'✗ not set';
  h+='<div class="dv-card" style="margin-top:10px"><b>Patreon link</b><p class="dv-mut">From your Patreon developer portal (Clients &amp; API Keys). Secrets can\'t be read back once saved; paste them again to change them.</p>'+
   '<p class="dv-mut">Redirect URI to give Patreon: <code>https://us-central1-skillquest-913e2.cloudfunctions.net/patreonAuth</code><br>Webhook URL: <code>https://us-central1-skillquest-913e2.cloudfunctions.net/patreonHook</code> (triggers: members:create, members:update, members:delete, members:pledge:create, members:pledge:update, members:pledge:delete)</p>'+
   '<div class="dv-row" style="gap:6px;flex-wrap:wrap"><input data-arpc="cid" placeholder="Client ID '+(pc.cid?'(saved)':'')+'" value="'+E(T.pcf&&T.pcf.cid||pc.cid||'')+'" style="flex:1;min-width:220px"> <span class="dv-mut">'+yes(pc.cid)+'</span></div>'+
   '<div class="dv-row" style="gap:6px;flex-wrap:wrap"><input type="password" autocomplete="off" data-arpc="cs" placeholder="Client secret" value="'+E(T.pcf&&T.pcf.cs||'')+'" style="flex:1;min-width:220px"> <span class="dv-mut">'+yes(pc.cs)+'</span></div>'+
   '<div class="dv-row" style="gap:6px;flex-wrap:wrap"><input type="password" autocomplete="off" data-arpc="ws" placeholder="Webhook secret" value="'+E(T.pcf&&T.pcf.ws||'')+'" style="flex:1;min-width:220px"> <span class="dv-mut">'+yes(pc.ws)+'</span></div>'+
   '<div class="dv-row" style="gap:6px;flex-wrap:wrap"><input data-arpc="camp" placeholder="Campaign ID (optional)" value="'+E(T.pcf&&T.pcf.camp||'')+'" style="flex:1;min-width:220px"> <span class="dv-mut">'+yes(pc.camp)+'</span></div>'+
   '<button class="dv-b dv-pri" data-arx="pcsave" style="margin-top:6px">Save Patreon settings</button>'+(pc.t?' <span class="dv-mut">last saved '+new Date(pc.t).toLocaleString()+'</span>':'')+'</div>';
  // patrons
  const pats=Object.entries(T.pat||{}).sort((a,b)=>(b[1].u||0)-(a[1].u||0));
  h+='<div class="dv-card" style="margin-top:10px"><b><img src="'+(window.SQFLAMEURL||'')+'" alt="" style="width:12px;height:15px;image-rendering:pixelated"> Patrons ('+pats.length+')</b><p class="dv-mut">Until payments are connected, add or extend Patrons here. A Patron gets the flame while active, and keeps the fire cape for good.</p>'+
   pats.map(([u,r])=>'<div class="dv-hl"><span>'+E(nm(u))+' <small class="dv-mut">'+(r.u>Date.now()?'active until '+new Date(r.u).toLocaleDateString():'ended '+new Date(r.u).toLocaleDateString())+(r.c?' · fire cape':'')+'</small></span><span><button class="dv-b" data-arx="pm:'+E(u)+':1">+1 month</button> <button class="dv-b" data-arx="pend:'+E(u)+'">End now</button></span></div>').join('')+
   '<p class="dv-mut" style="margin-top:8px">Add a Patron:</p><input type="search" data-arpq="1" placeholder="Search players" value="'+E(T.q)+'" style="width:100%">';
  const q=T.q.toLowerCase();if(q){const L=Object.entries(T.lb||{}).filter(([u,r])=>r&&r.n&&String(r.n).toLowerCase().includes(q)).slice(0,10);h+=L.map(([u,r])=>'<div class="dv-hl"><span>'+E(r.n)+'</span><button class="dv-b" data-arx="pm:'+E(u)+':1">Make Patron (1 month)</button></div>').join('')||'<p class="dv-mut">No match.</p>'}
  return h+'</div>'}
 // animate the inbox previews
 setInterval(()=>{if(S.tab!=='artroom'||!T.list)return;const now=performance.now();document.querySelectorAll('#dvs [data-arp]').forEach(cv=>{const[u,id]=cv.dataset.arp.split('/');const x=T.list.find(y=>y.u===u&&y.id===id);if(!x)return;const fr=unpack(x);if(!fr.length)return;const i=Math.floor(now/(x.ms||200))%fr.length;drawFrame(cv,fr[i].f,x.w,x.h,fr[i].pal)})},60);
 document.addEventListener('input',e=>{if(S.tab!=='artroom')return;const t=e.target;if(t.dataset&&t.dataset.arq)T.msg[t.dataset.arq]=t.value.slice(0,300);
  if(t.dataset&&t.dataset.arpc){T.pcf=T.pcf||{};T.pcf[t.dataset.arpc]=t.value.trim().slice(0,200)}
  if(t.dataset&&t.dataset.arpq){T.q=t.value;const pos=t.selectionStart;API.draw();const n=document.querySelector('#dvs [data-arpq]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}}},true);
 document.addEventListener('click',async e=>{if(S.tab!=='artroom')return;const t=e.target.closest&&e.target.closest('[data-arx]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();
  const parts=t.dataset.arx.split(':'),a=parts[0];
  try{
   if(a==='clip'){const[u,id]=parts[1].split('/'),x=T.list.find(y=>y.u===u&&y.id===id),fr=unpack(x)[+parts[2]];if(!fr)return;const c={w:x.w,h:x.h,p:Array.from(fr.f,v=>v?fr.pal[v]||'':'')};
    try{localStorage.setItem('sq_dev_clip',JSON.stringify(c))}catch(_){}toast('Frame copied. Open a picture editor and press Paste.')}
   else if(a==='ok'||a==='no'){const k=parts[1],[u,id]=k.split('/'),x=T.list.find(y=>y.u===u&&y.id===id);const re=String(T.msg[k]||'').trim().slice(0,300);
    const up={['art/'+u+'/'+id+'/st']:a};if(re)up['art/'+u+'/'+id+'/re']=re;if(a==='ok')up['artcred/'+id]={n:String(x.who||nm(u)).slice(0,12),w:String(x.n||'Art').slice(0,40)};
    for(const pth of Object.keys(up))await D().set(ref(pth),up[pth]);
    const m=(a==='ok'?'Your art "'+x.n+'" was approved! Thank you. It will show up in the game, and your name is in the credits.':'About your art "'+x.n+'": not this time.')+(re?' '+re:'');
    try{await D().set(ref('gifts/'+u+'/a'+Date.now().toString(36)),{m:m.slice(0,300),t:D().serverTimestamp(),f:'dev'})}catch(_){}
    x.st=a;if(re)x.re=re;toast(a==='ok'?'Approved.':'Answered.');API.draw()}
   else if(a==='pm'){const u=parts[1],r=T.pat[u]||{},now=Date.now(),from=Math.max(now,r.u||0);const nr={s:r.s||now,u:from+30*864e5,c:true};await D().set(ref('patron/'+u),nr);T.pat[u]=nr;T.q='';toast(nm(u)+' is a Patron until '+new Date(nr.u).toLocaleDateString()+'.');API.draw()}
   else if(a==='pcsave'){const f=T.pcf||{},pc=T.pc||{};const up={};for(const k of['cid','cs','ws','camp'])if(f[k])up[k]=String(f[k]).trim().slice(0,k==='camp'?40:200);
    if(!Object.keys(up).length){toast('Nothing to save.');return}if(up.camp&&!/^[0-9]{1,20}$/.test(up.camp)){toast('The campaign ID is a number.');return}
    for(const k in up)await D().set(ref('cfg/patreon/'+k),up[k]);
    const pub={cid:up.cid||pc.cid||'',cs:!!(up.cs||pc.cs),ws:!!(up.ws||pc.ws),camp:!!(up.camp||pc.camp),t:Date.now()};if(!pub.cid)delete pub.cid;await D().set(ref('cfgpub/patreon'),pub);
    T.pc=pub;T.pcf={};toast('Patreon settings saved.');API.draw()}
   else if(a==='pend'){const u=parts[1],r=T.pat[u];if(!r)return;const nr=Object.assign({},r,{u:Date.now()-1000});await D().set(ref('patron/'+u),nr);T.pat[u]=nr;toast('Ended. They keep the fire cape.');API.draw()}
  }catch(err){fail(err)}},true);
 SQSUITE.addTab('artroom','Art Room',{render})})();
