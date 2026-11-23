// ---- 219. The Art Room: Patrons draw sprites and animations and send them to the developer ----
// Open to active Patrons who aren't under 13 (Options > PATRON > Open the Art Room; ptab 47). A pixel editor: canvas up to 96x96 (Nov 22; was
// 48x48), palette (slot 0 = clear, the rest editable with a colour picker), pen / eraser / fill / picker / select, up to 8 frames (fewer on big canvases) with
// onion skin and a live preview at `ms` per frame, undo/redo, a draft kept on the device (localStorage sq_art_draft).
// SEND writes `art/<uid>/<push id>` {n, k (item|pet|prop|anim|other), w, h, f, ms, note, who, t}; f = JSON {p:[hex...], fr:[one
// character per pixel, index into p via CH ('.' = clear)]}. Name and note go through SQFILTER. The rules let only active
// 13+ Patrons create, never change a sent piece, and never set `st`/`re` (devs do). "My art" lists your pieces and their status.
// Dev Suite > Art Room (inbox): every submission animated, Approve / Not this time with a message (st 'ok'/'no', re, a gift
// message to the artist, and `artcred/<id>` for the credits on approval), "Copy frame to the clipboard" (sq_dev_clip, pasteable
// in every Dev Suite picture editor), and Patrons: grant or extend patron/<uid> {s,u,c} by player search.
(()=>{const myNm=()=>{try{const m=window.SQMP;return String((typeof PNAME!=='undefined'&&PNAME)||((m&&m.user&&m.user.displayName)||'').split(' ')[0]||'Adventurer').replace(/[<>]/g,'').slice(0,12)}catch(e){return'Adventurer'}};const ATAB=47,MAXF=8,MAXS=96,CH='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&()*+,-/:;<=>?@[]^_{|}~';
 const mp=()=>window.SQMP,F=()=>window.SQFB,uid=()=>{const m=mp();return m&&m.user?m.user.uid:''};
 const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const can=()=>!!(window.SQPATRON&&SQPATRON.active(uid())&&!(window.SQAGE&&SQAGE.child()));
 // see-through colours are #rrggbbaa (111a's SQA.alpha)
 const AL=window.SQA&&SQA.alpha||{a:()=>255,rgb:c=>String(c||'').slice(0,7),set:c=>String(c||'').slice(0,7),bg:c=>c},apc=c=>Math.round(AL.a(c)/2.55);
 const PAL0=['','#000000','#1d2b53','#7e2553','#008751','#ab5236','#5f574f','#c2c3c7','#fff1e8','#ff004d','#ffa300','#ffec27','#00e436','#29adff','#83769c','#ff77a8','#ffccaa',
  '#2a1a10','#5a3a20','#8a5a30','#c8904a','#3a6a2a','#68a848','#a8d870','#1a3a6a','#3870d8','#88c0f0','#6a1a1a','#c83040','#f8a8a8','#404048','#909098'];
 const KINDS=[['item','Item icon'],['pet','Pet'],['prop','Decoration or object'],['anim','Animation or effect'],['other','Something else']];
 // Nov 22 (a Patron's list: "higher pixel res options for new art"): canvases up to 96 x 96. A sent piece must stay under 60,000
 // characters (one per pixel per frame), so big canvases get fewer frames: maxF() (96 x 96: 6, 64 x 64 and below: 8).
 const SIZES=[8,12,16,20,24,32,40,48,64,80,96];
 const maxF=()=>A?Math.max(1,Math.min(MAXF,Math.floor(56000/(A.w*A.h)))):MAXF;
 const blank=(w,h)=>new Uint8Array(w*h),ZMAX=8;
 let A=null;
 // wearables: 48x76 pixels of the 96x112 worn layer (origin WO), one frame per facing (front, back, side), drawn over your character
 const WO=[24,28],WSL=[['helm','Hat or helmet'],['body','Top or chestplate'],['legs','Trousers or leg armour']],FACE=['Front','Back','Side'];
 function freshWear(){return Object.assign(fresh(),{mode:'wear',w:48,h:76,fr:[blank(48,76),blank(48,76),blank(48,76)],kind:'wear',sl:'helm',mirror:true,onion:false,under:1,gear:0})}
 // pets: four frames (Idle 1, Idle 2, Walk 1, Walk 2 = the pet look's a, c, b, d), drawn facing right, one pixel = one game pixel
 const PFN=['Idle 1','Idle 2','Walk 1','Walk 2'],PSZ=[12,16,20,24,32];
 function freshPet(){return Object.assign(fresh(),{mode:'pet',w:16,h:16,fr:[blank(16,16),blank(16,16),blank(16,16),blank(16,16)],kind:'pet',mirror:false,onion:true,pvm:'idle',scale:1})}
 const DR={pic:null,wear:null,pet:null};
 const mk=m=>m==='wear'?freshWear():m==='pet'?freshPet():fresh();
 function fresh(){return{mode:'pic',w:16,h:16,fr:[blank(16,16)],cur:0,pal:PAL0.slice(),col:1,tool:'pen',selm:'rect',sel:null,pid:null,ms:200,onion:true,mirror:false,zoom:1,grid:true,name:'',kind:'item',note:'',undo:[],redo:[],view:'draw',mine:null,sent:''}}
 const LSK=m=>m==='wear'?'sq_art_wear':m==='pet'?'sq_art_pet':'sq_art_draft';
 function loadOne(m){try{const d=JSON.parse(localStorage.getItem(LSK(m))||'null');if(d&&d.w&&d.fr){const o=Object.assign(mk(m),d,{mode:m,fr:d.fr.map(s=>Uint8Array.from(s)),undo:[],redo:[],view:'draw',mine:null,sent:''});if(m==='pic'&&o.kind==='pet')o.kind='item';if(m==='pet'){o.kind='pet';if(o.fr.length!==4||o.w!==o.h||!PSZ.includes(o.w))return mk(m)}if(m!=='wear'||o.fr.length===3&&o.w===48&&o.h===76)return o}}catch(e){self.SQERR&&SQERR(e,'211-1')}return mk(m)}
 function load(){if(A)return;DR.pic=loadOne('pic');DR.wear=loadOne('wear');DR.pet=loadOne('pet');let m='pic';try{const v=localStorage.getItem('sq_art_mode');m=v==='wear'||v==='pet'?v:'pic'}catch(e){self.SQERR&&SQERR(e,'211-2')}A=DR[m]}
 const W=()=>A&&A.mode==='wear',PT=()=>A&&A.mode==='pet';
 let saveT=0;function keep(){clearTimeout(saveT);saveT=setTimeout(keepNow,400)}
 function keepNow(){clearTimeout(saveT);if(!A||A.edit)return;try{localStorage.setItem(LSK(A.mode),JSON.stringify({w:A.w,h:A.h,fr:A.fr.map(f=>Array.from(f)),cur:A.cur,pal:A.pal,col:A.col,tool:A.tool,ms:A.ms,onion:A.onion,mirror:A.mirror,zoom:A.zoom,grid:A.grid,name:A.name,kind:A.kind,note:A.note,sl:A.sl,under:A.under,gear:A.gear,pvm:A.pvm,scale:A.scale,pid:A.pid||null,selm:A.selm}));localStorage.setItem('sq_art_mode',A.mode)}
  catch(e){self.SQERR&&SQERR(e,'211-31')}try{projTouch()}catch(e){self.SQERR&&SQERR(e,'211-3')}}
 const snapU=()=>{A.undo.push({fr:A.fr.map(f=>f.slice()),cur:A.cur,w:A.w,h:A.h});if(A.undo.length>60)A.undo.shift();A.redo=[]};
 // ---- the panel: tools on top, the canvas, the colours right under it, frames under those; name and sending on their own page ----
 {const st=document.createElement('style');st.textContent=`#pn.sqart .pc{max-width:980px}
#pn .arw{font:500 14px ${PF};color:#303030}#pn .arw canvas,#pn .arsub canvas{position:static!important;inset:auto!important;display:block}
#pn .arhd{display:flex;align-items:center;gap:6px;margin:0 0 6px}#pn .arhd .tl{flex:1;margin:0;text-align:left}
#pn .artb{position:sticky;top:0;z-index:2;background:#f8f8f8;display:flex;flex-wrap:wrap;gap:4px;padding:4px 0 6px;border-bottom:2px solid #d8dce4}
#pn .arb{font:700 13px ${PF};min-height:38px;min-width:38px;padding:4px 8px;border:3px solid #485870;background:#fff;color:#303030;cursor:pointer;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;gap:4px;touch-action:manipulation}
#pn .arb.on{background:#ffe8b0;border-color:#c88010}#pn .arb:disabled{opacity:.4;cursor:default}#pn .arb.pri{background:#3a8a4a;color:#fff;border-color:#1f5a2c}#pn .arb.wide{flex:1}
#pn .arb svg{width:20px;height:20px;display:block}#pn .arb .lb{font-size:11px}#pn .artb .sp{flex:1}
#pn .arside{min-width:0}#pn .armain{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;margin-top:8px}
#pn .arbox{overflow:hidden;border:3px solid #485870;background:#fff;max-width:100%;justify-self:center;position:relative;touch-action:none}
#pn .arbox.zm{overflow:auto;max-height:62vh;justify-self:stretch}#pn .arcv{touch-action:none;image-rendering:pixelated;cursor:crosshair}
#pn .arpalw{display:flex;gap:6px;align-items:center}#pn .arcur{flex:none;width:44px;height:44px;border:3px solid #303030;border-radius:4px;position:relative;cursor:pointer}
#pn .arcur input{position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer}#pn .arcur.clr,#pn .arpal .clr{background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/10px 10px}
#pn .arpal{display:grid;grid-auto-flow:column;grid-template-rows:repeat(2,32px);grid-auto-columns:32px;gap:3px;overflow-x:auto;padding-bottom:4px;flex:1;scrollbar-width:thin}
#pn .arpal button{width:32px;height:32px;border:3px solid #485870;padding:0;cursor:pointer;border-radius:3px;touch-action:manipulation}#pn .arpal button.on{border-color:#f8a020;box-shadow:0 0 0 2px #f8a020}
#pn .arfrw{display:flex;gap:8px;align-items:flex-start}#pn .arfr{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;flex:1}
#pn .arfr canvas,#pn .arfr .add{flex:none;width:48px;height:48px;image-rendering:pixelated;border:3px solid #485870;background:#fff;cursor:pointer;border-radius:3px}
#pn .arfr canvas.on{border-color:#f8a020;box-shadow:0 0 0 2px #f8a020}#pn .arfr .add{display:flex;align-items:center;justify-content:center;font:700 24px ${PF};color:#485870;padding:0}#pn .arfr .add:disabled{opacity:.4}
#pn .arpv{flex:none;width:64px;height:64px;image-rendering:pixelated;border:3px solid #485870;background:repeating-conic-gradient(#eee 0 25%,#fff 0 50%) 0 0/8px 8px}
#pn .arrow{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:4px 0}
#pn .arin{width:100%;box-sizing:border-box;font:500 16px ${PF};padding:8px;border:2px solid #485870;background:#fff;color:#303030;border-radius:4px}
#pn .arlb{display:block;font-size:13px;margin:10px 0 3px;font-weight:700}#pn .arsm{font-size:12px;opacity:.75}
#pn .arsub{display:flex;gap:10px;align-items:center;border-bottom:1px solid #c8c8c8;padding:8px 0}#pn .arsub canvas{width:48px;height:48px;image-rendering:pixelated;border:2px solid #485870;background:#fff;flex:none}
#pn .arst{font-weight:700}#pn .arst.ok{color:#2a7a3a}#pn .arst.no{color:#a83232}
#pn .arsend{display:grid;gap:12px}#pn .arsend .big{width:192px;height:192px;max-width:60vw;max-height:60vw;image-rendering:pixelated;border:3px solid #485870;background:repeating-conic-gradient(#eee 0 25%,#fff 0 50%) 0 0/12px 12px;justify-self:center}
@media (min-width:760px){#pn .armain{grid-template-columns:auto minmax(260px,330px);align-items:start}#pn .arside{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;min-width:0}
 #pn .arpal{grid-auto-flow:row;grid-template-columns:repeat(8,32px);grid-template-rows:none;overflow:visible}#pn .arsend{grid-template-columns:auto 1fr;align-items:start}}`;document.head.appendChild(st)}
 // small pictures for the tool buttons (drawn as pixels, no emoji)
 const IC={pen:'M3 17l1-4 9-9 3 3-9 9zM12 5l3 3',erase:'M8 17h9M4 13l7-7 6 6-5 5H8z',fill:'M4 10l6-6 7 7-6 6zM17 13c0 2 1 3 1 4a1 1 0 01-2 0c0-1 1-2 1-4z',pick:'M10 2c3 4 6 7 6 10a6 6 0 01-12 0c0-3 3-6 6-10zM8 13a2 2 0 002 2',
  move:'M10 2v16M2 10h16M10 2l-2 2M10 2l2 2M10 18l-2-2M10 18l2-2M2 10l2-2M2 10l2 2M18 10l-2-2M18 10l-2 2',mirror:'M10 2v16M7 5L3 10l4 5zM13 5l4 5-4 5z',
  undo:'M7 6L3 10l4 4M3 10h9a5 5 0 010 10h-2',redo:'M13 6l4 4-4 4M17 10H8a5 5 0 000 10h2',zin:'M8 3a5 5 0 100 10A5 5 0 008 3zM12 12l5 5M6 8h4M8 6v4',zout:'M8 3a5 5 0 100 10A5 5 0 008 3zM12 12l5 5M6 8h4',
  grid:'M3 3h14v14H3zM8 3v14M13 3v14M3 8h14M3 13h14',onion:'M4 6h9v9H4zM7 3h9v9',sel:'M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4',crop:'M6 2v12h12M2 6h12v12'};
 const ico=k=>'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="'+IC[k]+'"/></svg>';
 const tb=(act,k,label,on,dis)=>'<button class="arb'+(on?' on':'')+'" data-ar="'+act+'" title="'+label+'" aria-label="'+label+'"'+(dis?' disabled':'')+'>'+ico(k)+'</button>';
 // size of one pixel on screen: fill the width (and on phones, about half the screen height), times the zoom
 function fit(){const wide=innerWidth>=760,pw=Math.max(200,(pbd.clientWidth||340)-(wide?360:12)),ph=Math.max(180,innerHeight*(wide?.66:.5));
  return Math.max(3,Math.floor(Math.min(pw,ph)/Math.max(A.w,A.h)))}
 const cell=()=>fit()*A.zoom;
 function html(){if(!can()&&!(A&&A.edit))return'<div class="tl">ART ROOM</div><p>The Art Room is open to Patrons aged 13 and up.</p><button class="arb" data-ar="back">Back</button>';
  if(A.view==='mine')return mineHTML();if(A.view==='send')return sendHTML();if(A.view==='drafts')return draftsHTML();
  const c=cell(),f=A.fr.length;
  const tools='<div class="artb">'+tb('tool:pen','pen','Pen (B)',A.tool==='pen')+tb('tool:erase','erase','Eraser (E)',A.tool==='erase')+tb('tool:fill','fill','Fill (G)',A.tool==='fill')+tb('tool:pick','pick','Pick a colour from the drawing (I)',A.tool==='pick')+tb('tool:sel','sel','Select (S): drag a box, or draw around something; then drag it to move it',A.tool==='sel')+
   (A.zoom>1?tb('tool:move','move','Move around (hold Space)',A.tool==='move'):'')+tb('mirror','mirror','Mirror: draw both sides at once (M)',A.mirror)+'<span class="sp"></span>'+
   tb('undo','undo','Undo (Ctrl+Z)',0,!A.undo.length)+tb('redo','redo','Redo (Ctrl+Y)',0,!A.redo.length)+tb('zout','zout','Zoom out',0,A.zoom<=1)+tb('zin','zin','Zoom in',0,A.zoom>=ZMAX)+tb('grid','grid','Grid lines',A.grid)+'</div>'+(A.tool==='sel'?selRow():'');
  const pal='<div class="arpalw"><label class="arcur'+(A.col?'':' clr')+'" style="'+(A.col?'background:'+AL.bg(A.pal[A.col]):'')+'" title="'+(A.col?'Tap to change this colour':'Clear (see-through)')+'">'+(A.col?'<input type="color" id="arcc" value="'+AL.rgb(A.pal[A.col])+'" aria-label="Change this colour">':'')+'</label>'+
   '<div class="arpal">'+A.pal.map((h,i)=>'<button class="'+(i===A.col?'on ':'')+(i?'':'clr')+'" data-ar="col:'+i+'" style="'+(i?'background:'+AL.bg(h):'')+'" aria-label="'+(i?'Colour '+i+(AL.a(h)<255?', '+apc(h)+'% solid':''):'See-through')+'"></button>').join('')+'</div></div>'+
   // Nov 22 (Jace: "I want to be able to make ghosts"): how solid the chosen colour is; lower = see-through
   (A.col?'<label class="arsm" style="display:flex;align-items:center;gap:8px;margin:2px 0 4px" title="Lower it to make this colour see-through: ghosts, glass, water, glows">Opacity <input type="range" id="aral" min="10" max="100" step="5" value="'+apc(A.pal[A.col])+'" style="flex:1;max-width:220px"> <b id="aralv" style="min-width:3.2em">'+apc(A.pal[A.col])+'%</b></label>':'');
  const mb=(m,l)=>'<button class="arb'+(A.mode===m?' on':'')+'" data-ar="mode:'+m+'" role="tab" aria-selected="'+(A.mode===m)+'">'+l+'</button>';
  const modes='<div class="arrow" role="tablist" style="margin:0 0 4px">'+mb('pic','Picture or sprite')+mb('wear','Something to wear')+mb('pet','A pet')+'</div>';
  const wearSide='<div class="arfrw"><canvas class="arpv" id="arpv" width="'+A.w+'" height="'+A.h+'" title="Preview" style="width:48px;height:76px"></canvas><div style="flex:1;min-width:0"><div class="arfr">'+A.fr.map((_,i)=>'<button class="arb'+(i===A.cur?' on':'')+'" data-arf="'+i+'" style="flex:none">'+FACE[i]+'</button>').join('')+'</div>'+
   '<label class="arsm" style="display:block;margin-top:4px">It\'s a <select id="arsl" class="arin" style="width:auto;padding:4px;font-size:14px">'+WSL.map(([k,l])=>'<option value="'+k+'"'+(A.sl===k?' selected':'')+'>'+l+'</option>').join('')+'</select></label>'+
   '<div class="arrow"><button class="arb'+(A.under?' on':'')+'" data-ar="under">Show my character</button>'+(A.under?'<button class="arb'+(A.gear?' on':'')+'" data-ar="gear">With my gear</button>':'')+(A.cur>0?'<button class="arb" data-ar="cpf">Copy the front</button>':'')+'</div>'+
   '<p class="arsm" style="margin:2px 0">Draw it on your character from the front, the back and the side (facing right). The developer can turn it into real gear.</p></div></div>';
  const petSide='<div><canvas class="arpv" id="arpv" width="96" height="'+PVH()+'" title="Preview" style="width:'+192+'px;height:'+(2*PVH())+'px"></canvas>'+
   '<div class="arrow" role="tablist"><button class="arb'+(A.pvm!=='walk'?' on':'')+'" data-ar="pvm:idle" role="tab">Standing</button><button class="arb'+(A.pvm==='walk'?' on':'')+'" data-ar="pvm:walk" role="tab">Walking</button><button class="arb'+(A.scale?' on':'')+'" data-ar="scale">Next to my character</button></div>'+
   '<div class="arfr">'+A.fr.map((_,i)=>'<button class="arb arpf'+(i===A.cur?' on':'')+'" data-arf="'+i+'" style="flex:none;flex-direction:column;padding:3px 4px"><canvas width="'+A.w+'" height="'+A.h+'" data-arf="'+i+'" style="width:40px;height:40px;border:0;image-rendering:pixelated;background:#fff"></canvas><span class="lb">'+PFN[i]+'</span></button>').join('')+'</div>'+
   '<div class="arrow">'+(A.cur>0?'<button class="arb" data-ar="cpi">Copy Idle 1</button>':'')+(A.cur===3?'<button class="arb" data-ar="cpw">Copy Walk 1</button>':'')+tb('onion','onion','Show Idle 1 faintly',A.onion)+'</div>'+
   '<p class="arsm" style="margin:2px 0">Draw your pet facing right; it\'s turned around when it walks left. Idle 1 and 2 take turns while it stands (half a second each), Walk 1 and 2 while it follows you. One square here is one pixel in the game.</p></div>';
  const frames=PT()?petSide:W()?wearSide:'<div class="arfrw"><canvas class="arpv" id="arpv" width="'+A.w+'" height="'+A.h+'" title="Preview"></canvas><div style="flex:1;min-width:0"><div class="arfr">'+A.fr.map((_,i)=>'<canvas width="'+A.w+'" height="'+A.h+'" data-arf="'+i+'" class="'+(i===A.cur?'on':'')+'" aria-label="Frame '+(i+1)+'"></canvas>').join('')+
    '<button class="add" data-ar="fadd" title="New frame"'+(f<maxF()?'':' disabled')+'>+</button></div>'+
   '<div class="arrow"><span class="arsm">Frame '+(A.cur+1)+' of '+f+'</span><button class="arb" data-ar="fdup"'+(f<maxF()?'':' disabled')+'>Copy</button><button class="arb" data-ar="fdel"'+(f>1?'':' disabled')+'>Delete</button>'+
   '<button class="arb" data-ar="fl" aria-label="Move frame left"'+(A.cur>0?'':' disabled')+'>◀</button><button class="arb" data-ar="fr" aria-label="Move frame right"'+(A.cur<f-1?'':' disabled')+'>▶</button>'+(f>1?tb('onion','onion','Show the previous frame faintly',A.onion):'')+'</div>'+
   (f>1?'<label class="arsm" style="display:block">Speed: <span id="arms">'+A.ms+'</span> ms a frame<input type="range" id="arsp" min="60" max="1000" step="20" value="'+A.ms+'" style="width:100%"></label>':'')+'</div></div>';
  const more=PT()?'<div class="arrow"><label class="arsm">Size <select id="arsz" class="arin" style="width:auto;padding:4px;font-size:14px">'+PSZ.map(n=>'<option value="'+n+'"'+(n===A.w?' selected':'')+'>'+n+' x '+n+'</option>').join('')+'</select></label><button class="arb" data-ar="clear">Clear frame</button><button class="arb" data-ar="new">Start over</button></div>':W()?'<div class="arrow"><button class="arb" data-ar="clear">Clear this side</button><button class="arb" data-ar="new">Start over</button></div>':'<div class="arrow"><label class="arsm">Canvas <select id="arsz" class="arin" style="width:auto;padding:4px;font-size:14px">'+SIZES.map(n=>'<option value="'+n+'"'+(n===A.w&&n===A.h?' selected':'')+'>'+n+' x '+n+'</option>').join('')+(A.w!==A.h||!SIZES.includes(A.w)?'<option selected>'+A.w+' x '+A.h+'</option>':'')+'</select></label>'+
   '<button class="arb" data-ar="clear">Clear frame</button><button class="arb" data-ar="new">Start over</button></div>';
  const ED=A.edit;return '<div class="arw"><div class="arhd"><div class="tl">'+(ED?'EDITING "'+E(A.name)+'" BY '+E(ED.who).toUpperCase():'ART ROOM')+'</div>'+(ED?'':'<button class="arb" data-ar="drafts">Drafts</button><button class="arb" data-ar="mine">My art</button>')+'<button class="arb" data-ar="back">'+(ED?'Cancel':'Back')+'</button></div>'+(ED?'<p class="arsm" style="margin:0 0 4px">Fix it before approving: delete a stray frame, tidy pixels, change the speed. Saving replaces the artist\'s version (the first version is kept so you can put it back).</p>':modes)+tools+
   '<div class="armain"><div class="arbox'+(A.zoom>1?' zm':'')+'" id="arbox"><canvas class="arcv" id="arcv" width="'+A.w*c+'" height="'+A.h*c+'" style="width:'+A.w*c+'px;height:'+A.h*c+'px" aria-label="Drawing canvas"></canvas></div>'+
   '<div class="arside">'+pal+frames+(ED?more.replace(/<button class="arb" data-ar="new">Start over<\/button>/,''):more)+(ED?'<label class="arsm" style="display:block;margin:4px 0">Name <input id="aren" class="arin" maxlength="24" value="'+E(A.name)+'"></label><button class="arb pri wide" data-ar="esave" style="width:100%;min-height:46px;font-size:15px">Save changes</button>'+(ED.msg?'<p class="arsm">'+E(ED.msg)+'</p>':''):'<button class="arb pri wide" data-ar="next" style="width:100%;min-height:46px;font-size:15px">Done? Name it and send</button>')+'</div></div></div>'}
 function sendHTML(){return '<div class="arw"><div class="arhd"><div class="tl">SEND YOUR ART</div><button class="arb" data-ar="draw">Back to drawing</button></div>'+
   '<div class="arsend">'+(PT()?'<canvas class="big" id="arpv" width="96" height="'+PVH()+'" style="width:192px;height:'+2*PVH()+'px"></canvas>':'<canvas class="big" id="arpv" width="'+A.w+'" height="'+A.h+'"'+(W()?' style="width:120px;height:190px"':'')+'></canvas>')+'<div>'+
   '<p class="arsm" style="margin:0">'+(PT()?'A pet, '+A.w+' x '+A.h+', standing and walking. Approved pets can be given to a pet in the game, with your name in the credits.':W()?'Something to wear, from the front, back and side. Approved designs can become real gear.':A.w+' x '+A.h+', '+A.fr.length+' frame'+(A.fr.length>1?'s at '+A.ms+' ms':'')+'. Approved art goes into the game, with your name in the credits. Pictures can become paintings in the Patron Art Gallery.')+'</p>'+
   '<label class="arlb" for="arnm">Name</label><input class="arin" id="arnm" maxlength="24" value="'+E(A.name)+'" placeholder="e.g. Ember sword">'+
   (PT()?'':W()?'<p class="arsm" style="margin:8px 0 0">'+(WSL.find(q=>q[0]===A.sl)||WSL[0])[1]+', drawn from the front, back and side.</p>':'<label class="arlb" for="arkd">What is it?</label><select class="arin" id="arkd">'+KINDS.filter(q=>q[0]!=='pet').map(([k,l])=>'<option value="'+k+'"'+(k===A.kind?' selected':'')+'>'+l+'</option>').join('')+'</select>')+
   '<label class="arlb" for="arnt">Note for the developer (optional)</label><textarea class="arin" id="arnt" maxlength="300" rows="3" placeholder="Where would you like to see it?">'+E(A.note)+'</textarea>'+
   '<div class="arrow" style="margin-top:12px"><button class="arb pri wide" data-ar="send" style="min-height:46px;font-size:15px">Send to the developer</button></div>'+
   (A.sent?'<p style="font-weight:700">'+E(A.sent)+'</p>':'')+'</div></div></div>'}
 // ---- drafts (Nov 22, a Patron's list: "a Save Draft and Edit option so I can have multiple projects at once"): drawings kept on this
 // device under a name, in localStorage sq_art_proj [{id, nm, mode, t, d}] (d = the drawing, its frames one character per pixel). The
 // drawing you're on stays linked to its draft (A.pid) and keeps it up to date; opening another one first files the current drawing
 // away (as a new draft when it isn't one yet), so nothing is lost. Up to PJMAX drafts.
 const PJK='sq_art_proj',PJMAX=24;
 const encF=f=>Array.from(f,v=>CH[v]||'0').join(''),decF=t=>Uint8Array.from(String(t),c=>Math.max(0,CH.indexOf(c)));
 function projs(){try{const v=JSON.parse(localStorage.getItem(PJK)||'[]');return Array.isArray(v)?v.filter(q=>q&&q.id&&q.d&&Array.isArray(q.d.fr)):[]}catch(e){return[]}}
 function projPut(L){try{localStorage.setItem(PJK,JSON.stringify(L));return true}catch(e){return false}}
 const hasArt=()=>A&&A.fr.some(f=>f.some(v=>v));
 const projData=()=>({w:A.w,h:A.h,fr:A.fr.map(encF),pal:A.pal.slice(),ms:A.ms,name:A.name,kind:A.kind,note:A.note,sl:A.sl,pvm:A.pvm,scale:A.scale,mirror:A.mirror,onion:A.onion,cur:A.cur,col:A.col});
 // asNew: a new draft even if this drawing is linked to one
 function projSave(asNew){if(!A||A.edit)return'';const L=projs();let P=A.pid&&!asNew?L.find(q=>q.id===A.pid):null;
  if(!P){if(L.length>=PJMAX)return'You have '+PJMAX+' drafts, the most this device keeps. Delete one first.';P={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6)};L.unshift(P)}
  P.mode=A.mode;P.nm=String(A.name||'').trim().slice(0,24)||P.nm||'Untitled '+new Date().toLocaleDateString(undefined,{month:'short',day:'numeric'});P.t=Date.now();P.d=projData();
  if(!projPut(L))return'This device is out of room for drafts. Delete an old one and try again.';A.pid=P.id;keepNow();return'Saved as "'+P.nm+'".'}
 let pjT=0;function projTouch(){if(!A||!A.pid||A.edit)return;const now=Date.now();if(now-pjT<3000)return;pjT=now;const L=projs(),P=L.find(q=>q.id===A.pid);if(!P){A.pid=null;return}P.t=now;P.d=projData();if(A.name)P.nm=String(A.name).slice(0,24);projPut(L)}
 // file the drawing away before leaving it: its draft brought up to date, or a new draft when it has something on it
 function projStash(){if(!A||A.edit)return;if(A.pid){pjT=0;projTouch()}else if(hasArt())projSave(true)}
 function projOpen(id){const P=projs().find(q=>q.id===id);if(!P||!A)return;projStash();keepNow();const m=P.mode==='wear'||P.mode==='pet'?P.mode:'pic',d=P.d;
  const o=Object.assign(mk(m),d,{mode:m,fr:d.fr.map(decF),pal:Array.isArray(d.pal)&&d.pal.length?d.pal.slice():PAL0.slice(),pid:P.id,view:'draw',undo:[],redo:[],mine:null,sent:'',sel:null,zoom:1,tool:'pen'});
  o.cur=Math.min(o.cur|0,o.fr.length-1);DR[m]=o;A=o;try{localStorage.setItem('sq_art_mode',m)}catch(e){self.SQERR&&SQERR(e,'211-30')}keepNow();rPn()}
 function projDel(id){projPut(projs().filter(q=>q.id!==id));for(const k in DR)if(DR[k]&&DR[k].pid===id)DR[k].pid=null;A.pmsg='Draft deleted.'}
 function projNew(){const m=A.mode;projStash();A=DR[m]=mk(m);keepNow();A.view='draw'}
 const MODEN={pic:'Picture',wear:'Something to wear',pet:'Pet'};
 function draftsHTML(){const L=projs();
  return'<div class="arw"><div class="arhd"><div class="tl">MY DRAFTS</div><button class="arb" data-ar="draw">Back to drawing</button></div>'+
   '<p class="arsm" style="margin:0 0 6px">Keep several drawings going and come back to any of them. Drafts are kept on this device (up to '+PJMAX+'). The drawing you\'re on is saved to its draft as you go.</p>'+
   '<div class="arrow"><button class="arb pri" data-ar="psave">'+(A.pid?'Save my drawing now':'Save my drawing as a draft')+'</button>'+(A.pid?'<button class="arb" data-ar="psave2">Save a copy</button>':'')+'<button class="arb" data-ar="pnew">Start a new drawing</button></div>'+
   (A.pmsg?'<p class="arsm" style="font-weight:700;opacity:1">'+E(A.pmsg)+'</p>':'')+
   (L.length?L.map(P=>'<div class="arsub"><canvas width="'+(P.d.w|0)+'" height="'+(P.d.h|0)+'" data-arp="'+E(P.id)+'"></canvas><div style="flex:1;min-width:0"><b>'+E(P.nm)+'</b>'+(P.id===A.pid?' <span class="arsm">(open now)</span>':'')+
     '<br><span class="arsm">'+E(MODEN[P.mode]||'Picture')+' · '+(P.d.w|0)+' x '+(P.d.h|0)+(P.d.fr.length>1?' · '+P.d.fr.length+' frames':'')+' · '+E(new Date(P.t||0).toLocaleDateString(undefined,{month:'short',day:'numeric'}))+'</span></div>'+
     (P.id===A.pid?'':'<button class="arb" data-ar="popen:'+E(P.id)+'">Open</button>')+'<button class="arb" data-ar="pdel:'+E(P.id)+'">Delete</button></div>').join(''):'<p>No drafts yet. Save the drawing you\'re on, then start another.</p>')+'</div>'}
 function mineHTML(){const L=A.mine;const S={ok:['Approved','ok'],no:['Not this time','no']};
  return '<div class="arw"><div class="arhd"><div class="tl">MY ART</div><button class="arb" data-ar="draw">Back to drawing</button></div>'+(L==null?'<p>Loading...</p>':L.length?L.map(x=>'<div class="arsub"><canvas width="'+x.w+'" height="'+x.h+'" data-arm="'+E(x.id)+'"></canvas><div><b>'+E(x.n)+'</b> <span class="arsm">'+E((KINDS.find(k=>k[0]===x.k)||(x.k==='wear'?['','Something to wear']:['','']))[1])+'</span><br>'+
   '<span class="arst '+((S[x.st]||[])[1]||'')+'">'+((S[x.st]||['Waiting for the developer'])[0])+'</span>'+(x.re?'<div class="arsm">'+E(x.re)+'</div>':'')+'</div></div>').join(''):'<p>You haven\'t sent anything yet.</p>')+'</div>'}
 // ---- drawing on the canvas ----
 const hex=i=>A.pal[i]||'';
 function paint(){const cv=document.getElementById('arcv');if(!cv)return;const c=cell(),x=cv.getContext('2d');x.imageSmoothingEnabled=false;
  for(let j=0;j<A.h;j++)for(let i=0;i<A.w;i++){x.fillStyle=(i+j)%2?'#e8e8e8':'#ffffff';x.fillRect(i*c,j*c,c,c)}
  if(W()&&A.under){const u=under(A.cur);if(u){x.globalAlpha=.5;x.drawImage(u,0,0,A.w*c,A.h*c);x.globalAlpha=1}}
  if(A.onion&&A.cur>0&&A.fr.length>1){const pf=A.fr[PT()?(A.cur===3?2:0):A.cur-1];x.globalAlpha=.28;for(let k=0;k<pf.length;k++)if(pf[k]){x.fillStyle=hex(pf[k]);x.fillRect((k%A.w)*c,((k/A.w)|0)*c,c,c)}x.globalAlpha=1}
  const f=A.fr[A.cur];for(let k=0;k<f.length;k++)if(f[k]){x.fillStyle=hex(f[k]);x.fillRect((k%A.w)*c,((k/A.w)|0)*c,c,c)}
  if(selDrag&&selDrag.k==='move'){const D=selDrag;for(let k=0;k<D.lift.length;k++)if(D.lift[k]){const X=k%A.w+D.dx,Y=((k/A.w)|0)+D.dy;if(X<0||Y<0||X>=A.w||Y>=A.h)continue;x.fillStyle=hex(D.lift[k]);x.fillRect(X*c,Y*c,c,c)}}
  if(A.grid&&c>=6){x.strokeStyle='rgba(0,0,0,.1)';x.lineWidth=1;x.beginPath();for(let i=1;i<A.w;i++){x.moveTo(i*c+.5,0);x.lineTo(i*c+.5,A.h*c)}for(let j=1;j<A.h;j++){x.moveTo(0,j*c+.5);x.lineTo(A.w*c,j*c+.5)}x.stroke()}
  if(A.mirror){x.strokeStyle='rgba(56,112,216,.7)';x.setLineDash([4,4]);x.beginPath();x.moveTo(A.w*c/2+.5,0);x.lineTo(A.w*c/2+.5,A.h*c);x.stroke();x.setLineDash([])}
  selPaint(x,c);thumbs();pv()}
 // the character under a wearable (211 shadows the game's CH, so 213 draws it): the 48x76 part of the 96x112 worn layer
 const UC=new Map();function under(d){const key=d+':'+(A.gear?1:0);if(UC.has(key))return UC.get(key);let c=null;try{const L=window.SQPAINT&&SQPAINT.charLayer(d,!!A.gear);if(L){c=document.createElement('canvas');c.width=48;c.height=76;c.getContext('2d').drawImage(L,WO[0],WO[1],48,76,0,0,48,76)}}catch(e){self.SQERR&&SQERR(e,'211-4')}UC.set(key,c);return c}
 function pv(){const cv=document.getElementById('arpv');if(!cv)return;if(PT())return petPv(cv);const i=W()?pvF%3:pvF%A.fr.length;if(!W())return drawFrame(cv,A.fr[i]||A.fr[0],A.w,A.h,A.pal);
  const x=cv.getContext('2d');x.clearRect(0,0,A.w,A.h);const u=under(i);if(u)x.drawImage(u,0,0);const t=document.createElement('canvas');t.width=A.w;t.height=A.h;drawFrame(t,A.fr[i],A.w,A.h,A.pal);x.drawImage(t,0,0)}
 // the pet preview: a strip of ground, the pet standing (Idle 1/2 every 0.5 s) or walking to and fro (Walk 1/2 every 125 ms, the game's step clock)
 const has=f=>f&&f.some(v=>v);
 function petFrame(fr,walk,now){const ok=i=>has(fr[i]);if(walk)return Math.floor(now/125)%2?(ok(3)?3:0):(ok(2)?2:0);return Math.floor(now/500)%2&&ok(1)?1:0}
 const PTC=document.createElement('canvas'),PVH=()=>Math.max(A.h,32)+8;
 function petPv(cv){const now=performance.now(),walk=A.pvm==='walk',x=cv.getContext('2d'),gy=cv.height-4;x.imageSmoothingEnabled=false;x.clearRect(0,0,cv.width,cv.height);
  x.fillStyle='#7cc05a';x.fillRect(0,gy,cv.width,4);x.fillStyle='#5a9a40';for(let i=0;i<cv.width;i+=6)x.fillRect(i+((i/6)%2?2:0),gy,1,1);
  if(A.scale){try{const L=window.SQPAINT&&SQPAINT.charLayer(2,false);if(L){x.globalAlpha=.85;x.drawImage(L,0,0,96,112,4-16,gy-51,48,56);x.globalAlpha=1}}catch(e){self.SQERR&&SQERR(e,'211-5')}}
  const i=petFrame(A.fr,walk,now),span=cv.width-A.w-(A.scale?22:4),per=span/24*1000,ph=walk?(now%(2*per))/per:0,right=ph<1;
  const px=Math.round((A.scale?22:2)+(walk?(right?ph:2-ph)*span:span/2));
  PTC.width=A.w;PTC.height=A.h;drawFrame(PTC,A.fr[i],A.w,A.h,A.pal);x.fillStyle='rgba(0,0,0,.18)';x.beginPath();x.ellipse(px+A.w/2,gy,Math.max(4,A.w*.35),2,0,0,7);x.fill();
  x.save();if(walk&&!right){x.translate(px*2+A.w,0);x.scale(-1,1)}x.drawImage(PTC,px,gy-A.h);x.restore()}
 function drawFrame(cv,f,w,h,pal){if(!cv)return;const x=cv.getContext('2d');x.clearRect(0,0,w,h);for(let k=0;k<f.length;k++){const v=f[k];if(v&&pal[v]){x.fillStyle=pal[v];x.fillRect(k%w,(k/w)|0,1,1)}}}
 function thumbs(){document.querySelectorAll('#pn canvas[data-arf]').forEach(cv=>drawFrame(cv,A.fr[+cv.dataset.arf],A.w,A.h,A.pal))}
 function fill(f,k,to){const from=f[k];if(from===to)return;const q=[k];while(q.length){const p=q.pop();if(f[p]!==from)continue;f[p]=to;const x=p%A.w,y=(p/A.w)|0;if(x>0)q.push(p-1);if(x<A.w-1)q.push(p+1);if(y>0)q.push(p-A.w);if(y<A.h-1)q.push(p+A.w)}}
 let drag=null,pan=null,space=false;
 function at(e){const cv=document.getElementById('arcv'),r=cv.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*A.w),y=Math.floor((e.clientY-r.top)/r.height*A.h);return x>=0&&y>=0&&x<A.w&&y<A.h?[x,y]:null}
 function plot(x,y){const f=A.fr[A.cur],v=A.tool==='erase'?0:A.col;f[y*A.w+x]=v;if(A.mirror)f[y*A.w+(A.w-1-x)]=v}
 function line(a,b){let[x0,y0]=a;const[x1,y1]=b;const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let er=dx+dy;for(let n=0;n<200;n++){plot(x0,y0);if(x0===x1&&y0===y1)break;const e2=2*er;if(e2>=dy){er+=dy;x0+=sx}if(e2<=dx){er+=dx;y0+=sy}}}

 // ---- selecting (Nov 22, a Patron's list: "crop, grab and move ... free grab and squared"): the Select tool (S) marks a box, or in free
 // mode the shape you draw around; dragging inside it lifts those pixels and drops them where you let go (clear pixels don't cover what's
 // under them). Crop keeps only the selection (a picture's canvas shrinks to it, every frame; a pet or something to wear keeps its size and
 // clears around it), Delete clears it, Deselect (Esc) lets go. Arrow keys nudge it by one pixel. It's for the frame you're on.
 let selDrag=null;
 const atC=e=>{const cv=document.getElementById('arcv'),r=cv.getBoundingClientRect();return[Math.max(0,Math.min(A.w-1,Math.floor((e.clientX-r.left)/r.width*A.w))),Math.max(0,Math.min(A.h-1,Math.floor((e.clientY-r.top)/r.height*A.h)))]};
 function selBox(m){let x0=A.w,y0=A.h,x1=-1,y1=-1;for(let i=0;i<m.length;i++)if(m[i]){const X=i%A.w,Y=(i/A.w)|0;if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y}return x1<0?null:{x0,y0,x1,y1}}
 const inPoly=(px,py,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const xi=P[i][0]+.5,yi=P[i][1]+.5,xj=P[j][0]+.5,yj=P[j][1]+.5;if((yi>py)!==(yj>py)&&px<(xj-xi)*(py-yi)/(yj-yi)+xi)c=!c}return c};
 function selDown(p){const S=A.sel;
  if(S&&S.m[p[1]*A.w+p[0]]){snapU();const f=A.fr[A.cur],lift=new Uint8Array(f.length);for(let i=0;i<f.length;i++)if(S.m[i]){lift[i]=f[i];f[i]=0}selDrag={k:'move',p0:p,lift,m0:S.m,dx:0,dy:0};paint();return}
  A.sel=null;selDrag={k:A.selm==='free'?'free':'rect',p0:p,p1:p,pts:[p]};paint()}
 function selMove(p){const D=selDrag;if(!D)return;if(D.k==='move'){D.dx=p[0]-D.p0[0];D.dy=p[1]-D.p0[1]}else{D.p1=p;const L=D.pts[D.pts.length-1];if(L[0]!==p[0]||L[1]!==p[1])D.pts.push(p)}paint()}
 function selStamp(D){const f=A.fr[A.cur],m=new Uint8Array(f.length);for(let i=0;i<f.length;i++)if(D.m0[i]){const X=i%A.w+D.dx,Y=((i/A.w)|0)+D.dy;if(X<0||Y<0||X>=A.w||Y>=A.h)continue;const j=Y*A.w+X;m[j]=1;if(D.lift[i])f[j]=D.lift[i]}A.sel=m.some(v=>v)?{m}:null}
 function selUp(){const D=selDrag;selDrag=null;if(!D)return;if(D.k==='move'){selStamp(D);keep();rPn();return}
  const m=new Uint8Array(A.w*A.h);
  if(D.k==='rect'){const x0=Math.min(D.p0[0],D.p1[0]),x1=Math.max(D.p0[0],D.p1[0]),y0=Math.min(D.p0[1],D.p1[1]),y1=Math.max(D.p0[1],D.p1[1]);for(let y=y0;y<=y1;y++)for(let X=x0;X<=x1;X++)m[y*A.w+X]=1}
  else if(D.pts.length>=3){for(let y=0;y<A.h;y++)for(let X=0;X<A.w;X++)if(inPoly(X+.5,y+.5,D.pts))m[y*A.w+X]=1;for(const[X,y]of D.pts)m[y*A.w+X]=1}
  A.sel=m.some(v=>v)?{m}:null;rPn()}
 function selNudge(dx,dy){const S=A.sel;if(!S)return;snapU();const f=A.fr[A.cur],lift=new Uint8Array(f.length);for(let i=0;i<f.length;i++)if(S.m[i]){lift[i]=f[i];f[i]=0}selStamp({lift,m0:S.m,dx,dy});keep();paint();rPnSoft()}
 function selDel(){const S=A.sel;if(!S)return;snapU();const f=A.fr[A.cur];for(let i=0;i<f.length;i++)if(S.m[i])f[i]=0}
 function selCrop(){const S=A.sel;if(!S)return;const B=selBox(S.m);if(!B)return;snapU();const f=A.fr[A.cur];for(let i=0;i<f.length;i++)if(!S.m[i])f[i]=0;
  if(PT()||W()||A.edit&&A.edit.fixed){A.sel=null;return}
  // a picture: the canvas becomes the selection's box (at least 4 x 4, the smallest a piece can be), every frame cut the same way
  let w=B.x1-B.x0+1,h=B.y1-B.y0+1,x0=B.x0,y0=B.y0;if(w<4){x0=Math.max(0,Math.min(A.w-4,x0-Math.floor((4-w)/2)));w=Math.min(A.w,4)}if(h<4){y0=Math.max(0,Math.min(A.h-4,y0-Math.floor((4-h)/2)));h=Math.min(A.h,4)}
  A.fr=A.fr.map(g=>{const o=blank(w,h);for(let y=0;y<h;y++)for(let X=0;X<w;X++)o[y*w+X]=g[(y+y0)*A.w+X+x0];return o});A.w=w;A.h=h;A.sel=null;A.zoom=1}
 function selPaint(x,c){const D=selDrag;let m=null,dx=0,dy=0;
  if(D&&D.k==='move'){m=D.m0;dx=D.dx;dy=D.dy}else if(A.sel)m=A.sel.m;
  x.save();x.lineWidth=2;
  if(m){x.beginPath();for(let i=0;i<m.length;i++){if(!m[i])continue;const X=i%A.w,Y=(i/A.w)|0,px=(X+dx)*c,py=(Y+dy)*c;
    if(X===0||!m[i-1]){x.moveTo(px,py);x.lineTo(px,py+c)}if(X===A.w-1||!m[i+1]){x.moveTo(px+c,py);x.lineTo(px+c,py+c)}if(Y===0||!m[i-A.w]){x.moveTo(px,py);x.lineTo(px+c,py)}if(Y===A.h-1||!m[i+A.w]){x.moveTo(px,py+c);x.lineTo(px+c,py+c)}}
   x.strokeStyle='#ffffff';x.stroke();x.setLineDash([4,3]);x.strokeStyle='#202840';x.stroke()}
  else if(D&&D.k==='rect'){const x0=Math.min(D.p0[0],D.p1[0]),x1=Math.max(D.p0[0],D.p1[0])+1,y0=Math.min(D.p0[1],D.p1[1]),y1=Math.max(D.p0[1],D.p1[1])+1;x.strokeStyle='#ffffff';x.strokeRect(x0*c,y0*c,(x1-x0)*c,(y1-y0)*c);x.setLineDash([4,3]);x.strokeStyle='#202840';x.strokeRect(x0*c,y0*c,(x1-x0)*c,(y1-y0)*c)}
  else if(D&&D.k==='free'&&D.pts.length){x.beginPath();D.pts.forEach(([X,Y],i)=>{const px=(X+.5)*c,py=(Y+.5)*c;if(i)x.lineTo(px,py);else x.moveTo(px,py)});x.strokeStyle='#ffffff';x.stroke();x.setLineDash([4,3]);x.strokeStyle='#202840';x.stroke()}
  x.restore()}
 function selRow(){const fx=PT()||W();return'<div class="arrow arselr">'+'<button class="arb'+(A.selm!=='free'?' on':'')+'" data-ar="selm:rect">Box</button><button class="arb'+(A.selm==='free'?' on':'')+'" data-ar="selm:free">Free</button>'+
   (A.sel?'<button class="arb" data-ar="scrop" title="'+(fx?'Clear everything outside the selection':'Shrink the canvas to the selection (every frame)')+'">'+ico('crop')+(fx?'Keep only this':'Crop')+'</button><button class="arb" data-ar="sdel">Delete</button><button class="arb" data-ar="snone">Deselect</button><span class="arsm">Drag inside it to move it. Arrow keys nudge it.</span>':
    '<span class="arsm">'+(A.selm==='free'?'Draw around what you want to grab.':'Drag a box around what you want to grab.')+'</span>')+'</div>'}
 // two fingers on the canvas = move around (when zoomed) instead of drawing; the first finger's stroke is taken back
 const touches=new Map();
 pbd.addEventListener('pointerdown',e=>{if(ptab!==ATAB||e.target.id!=='arcv')return;e.preventDefault();e.stopPropagation();touches.set(e.pointerId,[e.clientX,e.clientY]);
  const box=document.getElementById('arbox');try{e.target.setPointerCapture(e.pointerId)}catch(_){self.SQERR&&SQERR(_,'211-6')}
  if(touches.size>=2||A.tool==='move'||space||e.button===1){if(drag&&touches.size>=2&&A.undo.length){const s=A.undo.pop();A.fr=s.fr;paint()}if(selDrag&&selDrag.k==='move'&&A.undo.length){const s=A.undo.pop();A.fr=s.fr}selDrag=null;drag=null;pan={x:e.clientX,y:e.clientY,sl:box.scrollLeft,st:box.scrollTop};return}
  if(A.tool==='sel'){selDown(atC(e));return}
  const p=at(e);if(!p)return;
  if(A.tool==='pick'){A.col=A.fr[A.cur][p[1]*A.w+p[0]];A.tool='pen';keep();rPn();return}
  snapU();if(A.tool==='fill'){fill(A.fr[A.cur],p[1]*A.w+p[0],A.tool==='fill'?A.col:0);if(A.mirror)fill(A.fr[A.cur],p[1]*A.w+(A.w-1-p[0]),A.col);paint();keep();rPnSoft();return}
  drag=p;plot(p[0],p[1]);paint()},true);
 pbd.addEventListener('pointermove',e=>{if(ptab!==ATAB||e.target.id!=='arcv')return;if(touches.has(e.pointerId))touches.set(e.pointerId,[e.clientX,e.clientY]);
  if(pan){e.preventDefault();const box=document.getElementById('arbox');if(box){box.scrollLeft=pan.sl-(e.clientX-pan.x);box.scrollTop=pan.st-(e.clientY-pan.y)}return}
  if(selDrag){e.preventDefault();selMove(atC(e));return}
  if(!drag)return;e.preventDefault();const p=at(e);if(!p)return;line(drag,p);drag=p;paint()},true);
 const endDrag=e=>{touches.delete(e.pointerId);if(!touches.size)pan=null;if(selDrag&&ptab===ATAB){selUp();return}if(drag){drag=null;keep();rPnSoft()}};addEventListener('pointerup',endDrag,true);addEventListener('pointercancel',endDrag,true);
 // Nov 22 (a Patron: "zoom with scroll wheel"): a mouse wheel (line steps, or whole notches of 50+ pixels) and Ctrl+wheel / a pinch zoom
 // in and out around the pointer; a trackpad's smooth two-finger scroll still moves around a zoomed drawing
 let wheelT=0;pbd.addEventListener('wheel',e=>{if(ptab!==ATAB||!A||A.view!=='draw'||!e.target.closest||!e.target.closest('#arbox'))return;
  const notch=e.ctrlKey||e.deltaMode===1||(Math.abs(e.deltaY)>=50&&Math.abs(e.deltaX)<1&&Number.isInteger(e.deltaY));if(!notch)return;
  e.preventDefault();const now=performance.now();if(now-wheelT<70)return;wheelT=now;zoomBy(e.deltaY<0?1:-1,e)},{passive:false,capture:true});
 // ev (a wheel event): keep the drawing's pixel under the pointer where it is; otherwise keep the middle of the view
 function zoomBy(d,ev){const z=Math.max(1,Math.min(ZMAX,A.zoom+d));if(z===A.zoom)return;const box=document.getElementById('arbox'),cv=document.getElementById('arcv');let ax=.5,ay=.5,px=null,py=null;
  if(box&&cv){const br=box.getBoundingClientRect(),cr=cv.getBoundingClientRect();if(ev&&cr.width){px=ev.clientX-br.left;py=ev.clientY-br.top;ax=(ev.clientX-cr.left)/cr.width;ay=(ev.clientY-cr.top)/cr.height}
   else{ax=(box.scrollLeft+box.clientWidth/2-(cv.offsetLeft||0))/Math.max(1,cv.offsetWidth);ay=(box.scrollTop+box.clientHeight/2-(cv.offsetTop||0))/Math.max(1,cv.offsetHeight)}}
  ax=Math.max(0,Math.min(1,ax));ay=Math.max(0,Math.min(1,ay));A.zoom=z;if(z===1&&A.tool==='move')A.tool='pen';keep();rPn();const b2=document.getElementById('arbox'),c2=document.getElementById('arcv');
  if(b2&&c2){const X=(c2.offsetLeft||0)+ax*c2.offsetWidth,Y=(c2.offsetTop||0)+ay*c2.offsetHeight;b2.scrollLeft=X-(px!=null?px:b2.clientWidth/2);b2.scrollTop=Y-(py!=null?py:b2.clientHeight/2)}}
 // redraw buttons (undo state) without rebuilding the canvas mid-stroke
 function rPnSoft(){const u=document.querySelector('#pn [data-ar="undo"]'),r=document.querySelector('#pn [data-ar="redo"]');if(u)u.disabled=!A.undo.length;if(r)r.disabled=!A.redo.length}
 // ---- preview ----
 let pvF=0,pvT=0;setInterval(()=>{if(ptab!==ATAB||!pnOpen||!A||A.view==='mine')return;const now=performance.now();if(PT()){pv();return}if(now-pvT<(W()?900:A.ms))return;pvT=now;pvF=(pvF+1)%(W()?3:A.fr.length);pv()},40);
 // ---- buttons and fields ----
 function act(a,v,b){if(a==='undo'||a==='redo')A.sel=null;
  if(a==='tool'){A.tool=v;if(v!=='sel')A.sel=null}else if(a==='col'){A.col=+v;if(A.tool==='erase'||A.tool==='pick'||A.tool==='move'||A.tool==='sel'){A.tool='pen';A.sel=null}}
  else if(a==='selm')A.selm=v==='free'?'free':'rect';else if(a==='snone')A.sel=null;else if(a==='sdel')selDel();else if(a==='scrop')selCrop();
  else if(a==='drafts'){keepNow();A.view='drafts';A.pmsg=''}else if(a==='psave'){A.pmsg=projSave(false)}else if(a==='psave2'){A.pmsg=projSave(true)}else if(a==='pnew'){projNew()}
  else if(a==='popen'){projOpen(v);return}else if(a==='pdel'){if(b&&b.dataset.sure){projDel(v)}else{if(b){b.dataset.sure=1;b.textContent='Sure? Tap again'}return}}
  else if(a==='mirror')A.mirror=!A.mirror;else if(a==='grid')A.grid=!A.grid;else if(a==='zin'){zoomBy(1);return}else if(a==='zout'){zoomBy(-1);return}
  else if(a==='undo'&&A.undo.length){A.redo.push({fr:A.fr.map(f=>f.slice()),cur:A.cur,w:A.w,h:A.h});const s=A.undo.pop();Object.assign(A,s)}
  else if(a==='redo'&&A.redo.length){A.undo.push({fr:A.fr.map(f=>f.slice()),cur:A.cur,w:A.w,h:A.h});const s=A.redo.pop();Object.assign(A,s)}
  else if(a==='clear'){snapU();A.fr[A.cur]=blank(A.w,A.h)}
  else if(a==='fadd'&&A.fr.length<maxF()){snapU();A.fr.splice(A.cur+1,0,blank(A.w,A.h));A.cur++}
  else if(a==='fdup'&&A.fr.length<maxF()){snapU();A.fr.splice(A.cur+1,0,A.fr[A.cur].slice());A.cur++}
  else if(a==='fdel'&&A.fr.length>1){snapU();A.fr.splice(A.cur,1);A.cur=Math.min(A.cur,A.fr.length-1)}
  else if(a==='fl'&&A.cur>0){snapU();[A.fr[A.cur-1],A.fr[A.cur]]=[A.fr[A.cur],A.fr[A.cur-1]];A.cur--}
  else if(a==='fr'&&A.cur<A.fr.length-1){snapU();[A.fr[A.cur+1],A.fr[A.cur]]=[A.fr[A.cur],A.fr[A.cur+1]];A.cur++}
  else if(a==='onion')A.onion=!A.onion;
  else if(a==='mode'){if(A.mode!==v&&(v==='pic'||v==='wear'||v==='pet')){if(A.pid)projSave(false);keepNow();A=DR[v]||(DR[v]=mk(v));A.view='draw';try{localStorage.setItem('sq_art_mode',v)}catch(x){self.SQERR&&SQERR(x,'211-7')}}}
  else if(a==='under'){A.under=A.under?0:1}else if(a==='gear'){A.gear=A.gear?0:1;UC.clear()}
  else if(a==='cpf'&&W()&&A.cur>0){snapU();A.fr[A.cur]=A.fr[0].slice()}
  else if(a==='cpi'&&PT()&&A.cur>0){snapU();A.fr[A.cur]=A.fr[0].slice()}else if(a==='cpw'&&PT()&&A.cur===3){snapU();A.fr[3]=A.fr[2].slice()}
  else if(a==='pvm'&&PT())A.pvm=v==='walk'?'walk':'idle';else if(a==='scale'&&PT())A.scale=A.scale?0:1;
  else if(a==='new'){if(b&&b.dataset.sure){const m=A.mode;A=DR[m]=mk(m);try{localStorage.removeItem(LSK(m))}catch(x){self.SQERR&&SQERR(x,'211-8')}}else{if(b){b.dataset.sure=1;b.textContent='Sure? Tap again'}return}}
  else if(a==='next'){if(!A.fr.some(f=>f.some(x=>x))){say('Draw something first.');return}if(PT()&&!has(A.fr[0])){say('Draw Idle 1 first: it\'s how your pet looks when it stands still.');return}A.view='send';A.sent=''}
  else if(a==='send'){send();return}
  else if(a==='mine'){A.view='mine';A.mine=null;rPn();loadMine();return}
  else if(a==='draw')A.view='draw';
  else if(a==='esave'){saveEdit();return}
  else if(a==='back'){if(A.edit){endEdit();return}ptab=window.SQPATRON&&SQPATRON.PTAB||8;rPn();return}
  keep();rPn()}
 pbd.addEventListener('click',e=>{if(ptab!==ATAB)return;const fc=e.target.closest&&e.target.closest('[data-arf]');if(fc){A.cur=+fc.dataset.arf;A.sel=null;keep();rPn();return}
  const b=e.target.closest&&e.target.closest('[data-ar]');if(!b)return;e.stopPropagation();e.preventDefault();const[a,v]=b.dataset.ar.split(':');act(a,v,b)},true);
 pbd.addEventListener('input',e=>{if(ptab!==ATAB||!A)return;const t=e.target;
  if(t.id==='arnm'||t.id==='aren')A.name=t.value.slice(0,24);else if(t.id==='arnt')A.note=t.value.slice(0,300);
  else if(t.id==='arsp'){A.ms=+t.value;const s=document.getElementById('arms');if(s)s.textContent=A.ms}
  else if((t.id==='arcc'||t.id==='aral')&&A.col){const o=A.pal[A.col],c=t.id==='arcc'?AL.set(t.value,AL.a(o)):AL.set(o,Math.max(10,Math.min(100,+t.value||100))*255/100);A.pal[A.col]=c;paint();
   const sw=document.querySelector('#pn [data-ar="col:'+A.col+'"]');if(sw)sw.style.background=AL.bg(c);const cu=document.querySelector('#pn .arcur');if(cu)cu.style.background=AL.bg(c);const v=document.getElementById('aralv');if(v)v.textContent=apc(c)+'%';try{thumbs();pv()}catch(x){self.SQERR&&SQERR(x,'211-27')}}
  keep()},true);
 pbd.addEventListener('change',e=>{if(ptab!==ATAB||!A)return;const t=e.target;
  if(t.id==='arkd'){A.kind=t.value;keep()}
  else if(t.id==='arsl'){A.sl=WSL.some(q=>q[0]===t.value)?t.value:'helm';keep()}
  else if(t.id==='arsz'){const n=+t.value;if(!n||n===A.w&&n===A.h)return;const cap=Math.max(1,Math.min(MAXF,Math.floor(56000/(n*n))));if(!PT()&&A.fr.length>cap){say('At '+n+' x '+n+' a drawing can have up to '+cap+' frames. Delete some frames first.');rPn();return}snapU();A.sel=null;const dx=PT()?Math.floor((n-A.w)/2):0,dy=PT()?n-A.h:0;A.fr=A.fr.map(f=>{const g2=blank(n,n);for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<n&&Y<n)g2[Y*n+X]=f[y*A.w+x]}return g2});A.w=A.h=n;A.zoom=1;keep();rPn()}},true);
 // keyboard on a computer: B/E/G/I tools, M mirror, Ctrl+Z / Ctrl+Y, +/- zoom, hold Space to move around
 addEventListener('keydown',e=>{if(ptab!==ATAB||!pnOpen||!A||A.view!=='draw')return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'))return;
  const k=e.key.toLowerCase(),c=e.ctrlKey||e.metaKey;let a=null,v;
  if(c&&k==='z')a=e.shiftKey?'redo':'undo';else if(c&&k==='y')a='redo';else if(c)return;
  else if(k==='b'||k==='p'){a='tool';v='pen'}else if(k==='e'){a='tool';v='erase'}else if(k==='g'||k==='f'){a='tool';v='fill'}else if(k==='i'){a='tool';v='pick'}else if(k==='m')a='mirror';else if(k==='s'){a='tool';v='sel'}
  else if((k==='delete'||k==='backspace')&&A.sel)a='sdel';else if(k==='escape'&&A.sel)a='snone';
  else if(A.sel&&k.startsWith('arrow')){e.preventDefault();e.stopPropagation();selNudge(k==='arrowleft'?-1:k==='arrowright'?1:0,k==='arrowup'?-1:k==='arrowdown'?1:0);return}
  else if(k==='+'||k==='=')a='zin';else if(k==='-')a='zout';else if(k===' '){space=true;e.preventDefault();e.stopPropagation();return}
  if(!a)return;e.preventDefault();e.stopPropagation();act(a,v)},true);
 addEventListener('keyup',e=>{if(e.key===' ')space=false},true);
 // ---- sending ----
 function pack(){const used=[...new Set(A.fr.flatMap(f=>Array.from(f)))].filter(v=>v).slice(0,CH.length);const map=new Map(used.map((v,i)=>[v,CH[i]]));
  return JSON.stringify({p:used.map(v=>A.pal[v]),fr:A.fr.map(f=>Array.from(f,v=>v?map.get(v)||'.':'.').join(''))})}
 async function send(){const u=uid(),Fb=F();if(!u||!Fb){say('Sign in to send your art.');return}if(!can()){say('The Art Room is for Patrons aged 13 and up.');return}
  const clean=t=>window.SQFILTER?SQFILTER.clean(t):t;const name=clean(String(A.name||'').trim()).slice(0,24);if(!name){A.sent='Give your art a name first.';rPn();return}
  if(!A.fr.some(f=>f.some(v=>v))||PT()&&!has(A.fr[0])){A.sent=PT()?'Draw Idle 1 first.':'Draw something first.';rPn();return}
  const d={n:name,k:W()?'wear':PT()?'pet':(A.kind==='wear'||A.kind==='pet'?'item':A.kind),w:A.w,h:A.h,f:pack(),ms:Math.max(40,Math.min(2000,A.ms|0)),who:myNm().slice(0,12)||'Patron',t:Fb.db.serverTimestamp()};const nt=clean(String(A.note||'').trim()).slice(0,300);if(nt)d.note=nt;if(W())d.sl=A.sl;
  A.sent='Sending...';rPn();
  try{await Fb.db.push(Fb.db.ref(Fb.D,'art/'+u),d);A.sent='Sent! You\'ll get a message when the developer has looked at "'+name+'".';say('Your art was sent to the developer.')}
  catch(e){A.sent='That didn\'t send. Check your connection and try again.'}rPn()}
 async function loadMine(){const u=uid(),Fb=F();if(!u||!Fb){A.mine=[];rPn();return}try{const v=(await Fb.db.get(Fb.db.ref(Fb.D,'art/'+u))).val()||{};
   A.mine=Object.entries(v).map(([id,x])=>Object.assign({id},x)).sort((a,b)=>(b.t||0)-(a.t||0))}catch(e){A.mine=[]}rPn()}
 const unpack=x=>{try{const d=JSON.parse(x.f);const pal=['',...d.p];return d.fr.map(s=>Uint8Array.from(s,c=>c==='.'?0:CH.indexOf(c)+1)).map(f=>({f,pal}))}catch(e){return[]}};
 // ---- the panel hook ----
 {SQRPN.wrap('211',_r=>function(){if(!(ptab===ATAB&&pnOpen))try{pn.classList.remove('sqart')}catch(e){self.SQERR&&SQERR(e,'211-9')}if(ptab===ATAB&&pnOpen){load();try{panelChrome('')}catch(e){self.SQERR&&SQERR(e,'211-10')}/* Nov 22: the zoomed view stays where it was (it jumped to the top left on every button) */const b0=document.getElementById('arbox'),sv=b0?[b0.scrollLeft,b0.scrollTop]:null;pbd.innerHTML=html();{const b1=document.getElementById('arbox');if(sv&&b1){b1.scrollLeft=sv[0];b1.scrollTop=sv[1]}}try{pn.classList.add('sqart')}catch(e){self.SQERR&&SQERR(e,'211-11')}if(A.view==='drafts'){const L=projs();document.querySelectorAll('#pn [data-arp]').forEach(cv=>{const P=L.find(q=>q.id===cv.dataset.arp);if(P&&P.d.fr[0])drawFrame(cv,decF(P.d.fr[0]),P.d.w,P.d.h,P.d.pal||PAL0)})}else if(A.view!=='mine')paint();else document.querySelectorAll('#pn [data-arm]').forEach(cv=>{const x=(A.mine||[]).find(m=>m.id===cv.dataset.arm);const fr=x?unpack(x):[];if(fr[0])drawFrame(cv,fr[0].f,x.w,x.h,fr[0].pal)});return}return _r.apply(this,arguments)})}
 function open(){if(!can()){say('The Art Room is for Patrons aged 13 and up.');return}load();if(A.view!=='send')A.view='draw';try{if(!pnOpen&&typeof openPanel==='function')openPanel(ATAB)}catch(e){self.SQERR&&SQERR(e,'211-12')}ptab=ATAB;pnOpen=true;try{pn.style.display='block'}catch(e){self.SQERR&&SQERR(e,'211-13')}rPn()}
 // ---- developer editing (Dev Suite > Art Room > Edit before approving): the piece opens in this editor, drafts on the device untouched ----
 let BEFORE=null;
 function edit(x,done){const fr=unpack(x);if(!fr.length)return false;const pal=fr[0].pal.slice();for(const c of PAL0.slice(1))if(!pal.includes(c))pal.push(c);
  const m=x.k==='wear'&&x.w===48&&x.h===76&&fr.length===3?'wear':x.k==='pet'&&fr.length===4&&x.w===x.h?'pet':'pic';
  BEFORE=A;A=Object.assign(mk(m),{w:x.w,h:x.h,fr:fr.map(o=>o.f.slice()),cur:0,pal,col:1,ms:x.ms|0||200,name:String(x.n||''),kind:x.k,note:x.note||'',sl:x.sl||'helm',zoom:1,
   edit:{u:x.u,id:x.id,who:x.who||'a Patron',fo:x.fo||x.f,fw:x.fo?x.fw||x.w:x.w,fh:x.fo?x.fh||x.h:x.h,fms:x.fo?x.fms||x.ms||200:x.ms||200,done,msg:''}});
  try{if(window.SQSUITE)SQSUITE.close()}catch(e){self.SQERR&&SQERR(e,'211-14')}try{if(!pnOpen&&typeof openPanel==='function')openPanel(ATAB)}catch(e){self.SQERR&&SQERR(e,'211-15')}ptab=ATAB;pnOpen=true;try{pn.style.display='block'}catch(e){self.SQERR&&SQERR(e,'211-16')}rPn();return true}
 function endEdit(saved){const ed=A&&A.edit;A=BEFORE;BEFORE=null;try{if(typeof closePanel==='function')closePanel()}catch(e){self.SQERR&&SQERR(e,'211-17')}pnOpen=false;try{if(window.SQSUITE)SQSUITE.open()}catch(e){self.SQERR&&SQERR(e,'211-18')}if(ed&&ed.done)try{ed.done(saved)}catch(e){self.SQERR&&SQERR(e,'211-19')}}
 async function saveEdit(){const ed=A.edit,Fb=F();if(!Fb){ed.msg='Not connected.';rPn();return}const n=String(A.name||'').trim().slice(0,24);if(!n){ed.msg='It needs a name.';rPn();return}
  if(!A.fr.some(f=>f.some(v=>v))){ed.msg='There\'s nothing drawn.';rPn();return}
  const up={n,w:A.w,h:A.h,f:pack(),ms:Math.max(40,Math.min(2000,A.ms|0)),fo:ed.fo,fw:ed.fw,fh:ed.fh,fms:ed.fms};ed.msg='Saving...';rPn();
  try{await Fb.db.update(Fb.db.ref(Fb.D,'art/'+ed.u+'/'+ed.id),up);endEdit(up)}catch(e){ed.msg='That didn\'t save: '+(e&&e.message||e);rPn()}}
 window.SQARTROOM={open,edit,unpack,pack:()=>pack(),get state(){return A},CH};
 // ======================= Dev Suite > Art Room inbox =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,toast,fail}=API;
 const T={list:null,lb:null,msg:{},q:'',pat:{},paint:{},pp:{},wk:{},pk:{}};
 const D=()=>F().db,ref=p=>D().ref(F().D,p);
 async function inbox(){try{const[a,l,p,pc,ps]=await Promise.all([D().get(ref('art')),D().get(ref('lb')),D().get(ref('patron')),D().get(ref('cfgpub/patreon')),D().get(ref('cfgpub/psync'))]);T.ps=ps.val()||null;try{T.paint=(await D().get(ref('paintings'))).val()||{}}catch(_){T.paint={}}const v=a.val()||{};T.lb=l.val()||{};T.pat=p.val()||{};T.pc=pc.val()||{};
   T.list=[];for(const u in v)for(const id in v[u])T.list.push(Object.assign({u,id},v[u][id]));T.list.sort((x,y)=>(x.st?1:0)-(y.st?1:0)||(y.t||0)-(x.t||0))}catch(e){fail(e);T.list=[]}API.draw()}
 const nm=u=>T.lb&&T.lb[u]&&T.lb[u].n||u.slice(0,8);
 function render(){if(!T.list){inbox();return'<p class="dv-mut">Loading…</p>'}
  const waiting=T.list.filter(x=>!x.st);
  let h='<div class="dv-card"><b>🎨 Art Room inbox</b><p class="dv-mut">Pieces Patrons drew in the Art Room. Approve to thank them and add them to the credits; then copy a frame to the clipboard and paste it into any picture editor here.</p>'+
   '<p>'+waiting.length+' waiting, '+(T.list.length-waiting.length)+' answered.</p></div>';
  for(const x of T.list){const k=x.u+'/'+x.id,fr=unpack(x);
   const wear=x.k==='wear',pet=x.k==='pet'&&fr.length===4;
   h+='<div class="dv-card" style="margin-top:10px"><div class="dv-row" style="gap:12px;align-items:flex-start;flex-wrap:wrap"><canvas data-arp="'+E(k)+'" width="'+x.w+'" height="'+x.h+'" style="position:static;display:block;width:'+(wear?144:Math.min(192,x.w*6))+'px;height:'+(wear?228:Math.min(192,x.h*6))+'px;image-rendering:pixelated;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/12px 12px;border:2px solid #485870"></canvas>'+
    '<div style="flex:1;min-width:200px"><b>'+E(x.n)+'</b> <span class="dv-mut">by '+E(x.who||nm(x.u))+' · '+E(x.k)+' · '+x.w+'x'+x.h+' · '+fr.length+' frame'+(fr.length===1?'':'s')+(fr.length>1&&!pet?' at '+(x.ms||200)+' ms':'')+(x.t?' · '+new Date(x.t).toLocaleDateString():'')+'</span>'+
    (x.note?'<p>'+E(x.note)+'</p>':'')+(x.st?'<p><b>'+(x.st==='ok'?'Approved':'Not this time')+'</b>'+(x.re?': '+E(x.re):'')+'</p>':'')+
    '<div class="dv-row" style="flex-wrap:wrap;gap:6px;margin-bottom:6px"><button class="dv-b dv-pri" data-arx="edit:'+E(k)+'">✎ Edit it</button>'+(x.fo&&x.fo!==x.f?'<button class="dv-b" data-arx="orig:'+E(k)+'">Put back the artist\'s version</button><span class="dv-mut">you edited this</span>':'')+'</div>'+
    '<div class="dv-row" style="flex-wrap:wrap;gap:6px">'+fr.map((_,i)=>'<button class="dv-b" data-arx="clip:'+E(k)+':'+i+'">Copy '+(pet?PFN[i]:'frame '+(i+1))+'</button>').join('')+'</div>'+
    (x.st?'':'<input data-arq="'+E(k)+'" placeholder="Message to the artist (optional)" value="'+E(T.msg[k]||'')+'" style="width:100%;margin-top:6px"><div class="dv-row" style="gap:6px;margin-top:6px"><button class="dv-b dv-pri" data-arx="ok:'+E(k)+'">Approve</button><button class="dv-b dv-bad" data-arx="no:'+E(k)+'">Not this time</button></div>')+
    (wear?wearCtl(x,k):pet?petCtl(x,k):paintCtl(x,k))+
    '</div></div></div>'}
  // where the Patron Art Gallery stands (213): library places.gallery {tx,ty}
  {const PG=window.SQPAINT,dc=S.draft&&S.draft.places&&S.draft.places.gallery,lc=S.live&&S.live.places&&S.live.places.gallery;
   h+='<div class="dv-card" style="margin-top:10px"><b>🖼️ Patron Art Gallery building</b><p class="dv-mut">'+(lc?'Published spot: placed by you.':'Published spot: picked by the game (inside the village).')+(dc&&JSON.stringify(dc)!==JSON.stringify(lc)?' Your draft moves it (publish to show everyone).':'')+'</p>'+
    '<p class="dv-mut">To move it: close the Dev Suite, walk on Hollow to where its front door should open onto (stand on that doorstep tile, the building goes above you), open the Dev Suite again and press the button. It needs 5 tiles across and 2 up free above you.</p>'+
    '<button class="dv-b dv-pri" data-arx="galhere">Put the gallery\'s door where I\'m standing</button>'+(dc?' <button class="dv-b" data-arx="galauto">Let the game pick again</button>':'')+'</div>'}
  // Patreon link settings: cfg/patreon (secrets; nobody can read them back, only the server functions) + cfgpub/patreon (client id, which ones are set)
  const pc=T.pc||{},yes=b=>b?'✓ saved':'✗ not set';
  h+='<div class="dv-card" style="margin-top:10px"><b>Patreon link</b><p class="dv-mut">From your Patreon developer portal (Clients &amp; API Keys). Secrets can\'t be read back once saved; paste them again to change them.</p>'+
   '<p class="dv-mut">Redirect URI to give Patreon: <code>https://us-central1-skillquest-913e2.cloudfunctions.net/patreonAuth</code><br>Webhook URL: <code>https://us-central1-skillquest-913e2.cloudfunctions.net/patreonHook</code> (triggers: members:create, members:update, members:delete, members:pledge:create, members:pledge:update, members:pledge:delete)</p>'+
   '<div class="dv-row" style="gap:6px;flex-wrap:wrap"><input data-arpc="cid" placeholder="Client ID '+(pc.cid?'(saved)':'')+'" value="'+E(T.pcf&&T.pcf.cid||pc.cid||'')+'" style="flex:1;min-width:220px"> <span class="dv-mut">'+yes(pc.cid)+'</span></div>'+
   '<div class="dv-row" style="gap:6px;flex-wrap:wrap"><input type="password" autocomplete="off" data-arpc="cs" placeholder="Client secret" value="'+E(T.pcf&&T.pcf.cs||'')+'" style="flex:1;min-width:220px"> <span class="dv-mut">'+yes(pc.cs)+'</span></div>'+
   '<div class="dv-row" style="gap:6px;flex-wrap:wrap"><input type="password" autocomplete="off" data-arpc="ws" placeholder="Webhook secret" value="'+E(T.pcf&&T.pcf.ws||'')+'" style="flex:1;min-width:220px"> <span class="dv-mut">'+yes(pc.ws)+'</span></div>'+
   '<div class="dv-row" style="gap:6px;flex-wrap:wrap"><input data-arpc="camp" placeholder="Campaign ID (optional)" value="'+E(T.pcf&&T.pcf.camp||'')+'" style="flex:1;min-width:220px"> <span class="dv-mut">'+yes(pc.camp)+'</span></div>'+
   '<p class="dv-mut" style="margin-top:8px">Finding Patrons by themselves: paste the <b>Creator\'s Access Token</b> and <b>Creator\'s Refresh Token</b> from the same Patreon client page. Every 6 hours (and on Sync now) the server matches members whose Patreon email is their game account\'s email, so they don\'t need Link Patreon. Emails are only compared, never stored.</p>'+
   '<div class="dv-row" style="gap:6px;flex-wrap:wrap"><input type="password" autocomplete="off" data-arpc="ct" placeholder="Creator\'s Access Token" value="'+E(T.pcf&&T.pcf.ct||'')+'" style="flex:1;min-width:220px"> <span class="dv-mut">'+yes(pc.ct)+'</span></div>'+
   '<div class="dv-row" style="gap:6px;flex-wrap:wrap"><input type="password" autocomplete="off" data-arpc="crt" placeholder="Creator\'s Refresh Token" value="'+E(T.pcf&&T.pcf.crt||'')+'" style="flex:1;min-width:220px"></div>'+
   '<button class="dv-b dv-pri" data-arx="pcsave" style="margin-top:6px">Save Patreon settings</button> <button class="dv-b" data-arx="psync" style="margin-top:6px">Sync now</button>'+(pc.t?' <span class="dv-mut">last saved '+new Date(pc.t).toLocaleString()+'</span>':'')+
   (T.ps?'<p class="dv-mut">Last sync '+new Date(T.ps.t).toLocaleString()+': '+(T.ps.ok?T.ps.n+' members ('+T.ps.act+' active), '+T.ps.lk+' already linked, '+T.ps.nw+' newly matched by email'+(T.ps.um?', '+T.ps.um+' active without a matching game account (they can use Link Patreon)':''):'didn\'t work: '+E(T.ps.e||'?'))+'</p>':'')+'</div>';
  // patrons
  const pats=Object.entries(T.pat||{}).sort((a,b)=>(b[1].u||0)-(a[1].u||0));
  h+='<div class="dv-card" style="margin-top:10px"><b><img src="'+(window.SQFLAMEURL||'')+'" alt="" style="width:12px;height:15px;image-rendering:pixelated"> Patrons ('+pats.length+')</b><p class="dv-mut">Patreon members who use Link Patreon appear here by themselves. You can also add or extend Patrons by hand. A Patron gets the flame while active, and keeps the fire cape for good.</p>'+
   pats.map(([u,r])=>'<div class="dv-hl"><span>'+E(nm(u))+' <small class="dv-mut">'+(r.u>Date.now()?'active until '+new Date(r.u).toLocaleDateString():'ended '+new Date(r.u).toLocaleDateString())+(r.c?' · fire cape':'')+'</small></span><span><button class="dv-b" data-arx="pm:'+E(u)+':1">+1 month</button> <button class="dv-b" data-arx="pend:'+E(u)+'">End now</button></span></div>').join('')+
   '<p class="dv-mut" style="margin-top:8px">Add a Patron:</p><input type="search" data-arpq="1" placeholder="Search players" value="'+E(T.q)+'" style="width:100%">';
  const q=T.q.toLowerCase();if(q){const L=Object.entries(T.lb||{}).filter(([u,r])=>r&&r.n&&String(r.n).toLowerCase().includes(q)).slice(0,10);h+=L.map(([u,r])=>'<div class="dv-hl"><span>'+E(r.n)+'</span><button class="dv-b" data-arx="pm:'+E(u)+':1">Make Patron (1 month)</button></div>').join('')||'<p class="dv-mut">No match.</p>'}
  return h+'</div>'}
 // Sync now: the server function patreonSyncNow runs when cfg/patreon/go changes and writes cfgpub/psync
 async function psync(){const t0=Date.now();await D().set(ref('cfg/patreon/go'),t0);toast('Syncing with Patreon...');
  for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,2000));const v=(await D().get(ref('cfgpub/psync'))).val();
   if(v&&v.t>=t0-5000){T.ps=v;T.pat=(await D().get(ref('patron'))).val()||{};toast(v.ok?'Synced: '+v.nw+' newly matched.':'Sync didn\'t work: '+(v.e||'?'));API.draw();return}}
  toast('No answer from the server yet. Check again in a minute.')}
 // a picture as a painting in the Patron Art Gallery (213): paintings/<id>, sold as prints there
 function paintCtl(x,k){const P0=T.paint[x.id];if(P0)return'<div class="dv-row" style="gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap"><span>🖼️ A painting in the gallery'+(P0.off?' (not sold now)':', '+(P0.p|0).toLocaleString('en-US')+' gold a print')+'</span>'+
   '<button class="dv-b" data-arx="'+(P0.off?'pon':'poff')+':'+E(k)+'">'+(P0.off?'Sell it again':'Stop selling')+'</button></div>';
  return'<div class="dv-row" style="gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap"><label class="dv-mut">Print price <input data-arpp="'+E(k)+'" type="number" min="100" max="1000000" step="100" value="'+(T.pp[k]||2500)+'" style="width:110px"></label>'+
   '<button class="dv-b dv-pri" data-arx="paint:'+E(k)+'">'+(x.st==='ok'?'Make it a painting':'Approve as a painting')+'</button><span class="dv-mut">Hung in the Patron Art Gallery with their name; the artist gets a copy.</span></div>'}
 // a wearable: becomes the worn look of a gear item in the draft, then opens the Gear editor on it
 const SLN={helm:'Hat or helmet',body:'Top or chestplate',legs:'Trousers or leg armour'};
 const slotItems=sl=>Object.keys(EQ).filter(q=>EQ[q]&&EQ[q].slot===sl).sort((a,b)=>String(INAME[a]||a).localeCompare(String(INAME[b]||b)));
 function wearCtl(x,k){const L=slotItems(x.sl||'helm');if(!T.wk[k])T.wk[k]=L[0]||'';
  return'<p class="dv-mut" style="margin:8px 0 4px">'+E(SLN[x.sl]||'Something to wear')+'. Use it as the look of:</p><div class="dv-row" style="gap:6px;flex-wrap:wrap"><select data-arwk="'+E(k)+'">'+L.map(q=>'<option value="'+q+'"'+(T.wk[k]===q?' selected':'')+'>'+E(INAME[q]||q)+'</option>').join('')+'</select>'+
   '<button class="dv-b dv-pri" data-arx="wear:'+E(k)+'">Put it in the Gear editor</button></div><p class="dv-mut" style="margin:4px 0 0">Saves it to the draft as that item\'s look (replacing a draft look) and opens it, so you can finish it and publish. To make it a new item, add the item in Gear first.</p>'}
 function wornFrom(x){const fr=unpack(x);if(fr.length<3||x.w!==48||x.h!==76)return null;const PX=window.SQA&&SQA.PXC;if(!PX)return null;const pal=fr[0].pal.slice(1);if(pal.length>PX.length)return null;
  const o={h:1};['f','b','s'].forEach((d,i)=>{const a=new Array(96*112).fill('.');const f=fr[i].f;let any=false;for(let q=0;q<f.length;q++){const v=f[q];if(!v)continue;any=true;a[(28+((q/48)|0))*96+24+(q%48)]=PX[v-1]}
   if(any)o[d]={w:96,h:112,s:1,p:pal.join(','),r:SQA.pack(a.join(''))}});return o.f||o.b||o.s?o:null}
 // a pet: becomes the look of a pet in the draft (pets.<kind>: frames a/c standing, b/d walking), then opens the Pets editor on it
 function petCtl(x,k){const L=(window.SQA&&SQA.petKinds?SQA.petKinds():[]).slice().sort((a,b)=>String(INAME[a]||a).localeCompare(String(INAME[b]||b)));if(!T.pk[k])T.pk[k]=window.SQNEWPETS&&SQNEWPETS.create?'__new':L[0]||'';
  return'<p class="dv-mut" style="margin:8px 0 4px">'+'A pet: Idle 1 and 2 while it stands, Walk 1 and 2 while it walks (preview: walking, then standing).'+' Use it as the look of:</p><div class="dv-row" style="gap:6px;flex-wrap:wrap"><select data-arpk="'+E(k)+'">'+(window.SQNEWPETS&&SQNEWPETS.create?'<option value="__new"'+(T.pk[k]==='__new'?' selected':'')+'>＋ A new pet called "'+E(x.n)+'"</option>':'')+L.map(q=>'<option value="'+q+'"'+(T.pk[k]===q?' selected':'')+'>'+E(INAME[q]||q)+(S.draft&&S.draft.pets&&S.draft.pets[EQ[q].pet]?' (has a look)':'')+'</option>').join('')+'</select>'+
   '<button class="dv-b dv-pri" data-arx="pet:'+E(k)+'">Put it in the Pets editor</button></div><p class="dv-mut" style="margin:4px 0 0">Saves it to the draft as that pet\'s look (replacing a draft look) and opens it, so you can finish it and publish.</p>'}
 function petFrom(x){const fr=unpack(x);if(!fr.length||fr.length>8)return null;const PX=window.SQA&&SQA.PXC;if(!PX)return null;const pal=fr[0].pal.slice(1);if(pal.length>PX.length)return null;
  const w=x.w,h=x.h,o={w,h,s:2,ox:-Math.floor(w/2),oy:7-h};['a','c','b','d'].forEach((d,i)=>{const f=fr[i]&&fr[i].f;if(!f||!f.some(v=>v))return;o[d]={w,h,s:2,p:pal.join(','),r:SQA.pack(Array.from(f,v=>v?PX[v-1]:'.').join(''))}});
  return o.a?o:null}
 // a wearable preview: the facings in turn over the plain character
 function wearPv(cv,x,i){const fr=unpack(x);if(!fr[i])return;const c=cv.getContext('2d');c.clearRect(0,0,x.w,x.h);try{const L=window.SQPAINT&&SQPAINT.charLayer(i,false);if(L){c.globalAlpha=.55;c.drawImage(L,24,28,48,76,0,0,48,76);c.globalAlpha=1}}catch(e){self.SQERR&&SQERR(e,'211-20')}
  const t=document.createElement('canvas');t.width=x.w;t.height=x.h;drawFrame(t,fr[i].f,x.w,x.h,fr[i].pal);c.drawImage(t,0,0)}
 // animate the inbox previews
 setInterval(()=>{if(S.tab!=='artroom'||!T.list)return;const now=performance.now();document.querySelectorAll('#dvs [data-arp]').forEach(cv=>{const[u,id]=cv.dataset.arp.split('/');const x=T.list.find(y=>y.u===u&&y.id===id);if(!x)return;const fr=unpack(x);if(!fr.length)return;if(x.k==='wear'){wearPv(cv,x,Math.floor(now/900)%Math.min(3,fr.length));return}
   if(x.k==='pet'&&fr.length===4){const has=i=>fr[i].f.some(v=>v),walk=now%4000<2000,i=walk?(Math.floor(now/125)%2?(has(3)?3:0):(has(2)?2:0)):(Math.floor(now/500)%2&&has(1)?1:0);drawFrame(cv,fr[i].f,x.w,x.h,fr[i].pal);return}const i=Math.floor(now/(x.ms||200))%fr.length;drawFrame(cv,fr[i].f,x.w,x.h,fr[i].pal)})},60);
 document.addEventListener('input',e=>{if(S.tab!=='artroom')return;const t=e.target;if(t.dataset&&t.dataset.arq)T.msg[t.dataset.arq]=t.value.slice(0,300);
  if(t.dataset&&t.dataset.arpp)T.pp[t.dataset.arpp]=Math.max(100,Math.min(1e6,Math.round(+t.value||0)));
  if(t.dataset&&t.dataset.arwk)T.wk[t.dataset.arwk]=t.value;
  if(t.dataset&&t.dataset.arpk)T.pk[t.dataset.arpk]=t.value;
  if(t.dataset&&t.dataset.arpc){T.pcf=T.pcf||{};T.pcf[t.dataset.arpc]=t.value.trim().slice(0,200)}
  if(t.dataset&&t.dataset.arpq){T.q=t.value;const pos=t.selectionStart;API.draw();const n=document.querySelector('#dvs [data-arpq]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){self.SQERR&&SQERR(_,'211-21')}}}},true);
 document.addEventListener('click',async e=>{if(S.tab!=='artroom')return;const t=e.target.closest&&e.target.closest('[data-arx]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();
  const parts=t.dataset.arx.split(':'),a=parts[0];
  try{
   if(a==='clip'){const[u,id]=parts[1].split('/'),x=T.list.find(y=>y.u===u&&y.id===id),fr=unpack(x)[+parts[2]];if(!fr)return;const c={w:x.w,h:x.h,p:Array.from(fr.f,v=>v?fr.pal[v]||'':'')};
    try{localStorage.setItem('sq_dev_clip',JSON.stringify(c))}catch(_){self.SQERR&&SQERR(_,'211-22')}toast('Frame copied. Open a picture editor and press Paste.')}
   else if(a==='edit'){const[u,id]=parts[1].split('/'),x=T.list.find(y=>y.u===u&&y.id===id);if(!x)return;
    if(!SQARTROOM.edit(x,saved=>{if(saved){Object.assign(x,saved);toast('Saved. Approve it or make it a painting now.')}API.draw()}))toast('This piece can\'t be opened (no frames).')}
   else if(a==='orig'){const[u,id]=parts[1].split('/'),x=T.list.find(y=>y.u===u&&y.id===id);if(!x||!x.fo)return;
    if(t.dataset.sure!=='1'){t.dataset.sure='1';t.textContent='Sure? Your edits are lost. Tap again';return}
    const o={f:x.fo,w:x.fw||x.w,h:x.fh||x.h,ms:x.fms||x.ms||200};await D().update(ref('art/'+u+'/'+id),o);Object.assign(x,o);toast('The artist\'s version is back.');API.draw()}
   else if(a==='galhere'){const PG=window.SQPAINT;if(!PG)return;const c=PG.standHere();if(!c){toast('Go outside on Hollow Island first, then come back here.');return}
    if(!PG.tryPlace(c)){toast('Not enough room there: it needs 5 tiles across and 2 up clear of trees, rocks, houses and other buildings, above where you stand.');return}
    S.draft.places=S.draft.places||{};S.draft.places.gallery=c;await API.dset('draft/places/gallery',c);toast('Moved in your game. Publish it from the Publish tab and everyone sees it there.');API.draw()}
   else if(a==='galauto'){if(S.draft.places)delete S.draft.places.gallery;await API.dset('draft/places/gallery',null);try{SQPAINT.applyChosen(null)}catch(_){self.SQERR&&SQERR(_,'211-23')}toast('The game picks its spot again (after you publish).');API.draw()}
   else if(a==='paint'){const k=parts[1],[u,id]=k.split('/'),x=T.list.find(y=>y.u===u&&y.id===id);if(!x||x.k==='wear')return;const p=Math.max(100,Math.min(1e6,T.pp[k]||2500));
    const rec={n:String(x.n||'Painting').slice(0,24),by:String(x.who||nm(u)).slice(0,12),u,w:x.w,h:x.h,f:x.f,ms:Math.max(40,Math.min(2000,x.ms|0||200)),p,t:D().serverTimestamp()};
    await D().set(ref('paintings/'+id),rec);if(x.st!=='ok'){await D().set(ref('art/'+u+'/'+id+'/st'),'ok');await D().set(ref('artcred/'+id),{n:rec.by,w:String(x.n||'Art').slice(0,40)});x.st='ok'}
    const re=String(T.msg[k]||'').trim().slice(0,200);if(re)try{await D().set(ref('art/'+u+'/'+id+'/re'),re);x.re=re}catch(_){self.SQERR&&SQERR(_,'211-24')}
    try{await D().set(ref('gifts/'+u+'/p'+Date.now().toString(36)),{m:('Your art "'+x.n+'" is now a painting in the Patron Art Gallery in Hollow Village, with your name on it! Your own copy is in your bag.'+(re?' '+re:'')).slice(0,300),t:D().serverTimestamp(),f:'dev'})}catch(_){self.SQERR&&SQERR(_,'211-25')}
    T.paint[id]=Object.assign({},rec,{t:Date.now()});toast('It\'s a painting now. It hangs in the gallery and the artist gets a copy.');API.draw()}
   else if(a==='poff'||a==='pon'){const k=parts[1],id=k.split('/')[1];if(!T.paint[id])return;await D().set(ref('paintings/'+id+'/off'),a==='poff'?true:null);if(a==='poff')T.paint[id].off=true;else delete T.paint[id].off;toast(a==='poff'?'No longer sold. Copies players have stay.':'Sold in the gallery again.');API.draw()}
   else if(a==='wear'){const k=parts[1],[u,id]=k.split('/'),x=T.list.find(y=>y.u===u&&y.id===id),key=T.wk[k];if(!x||!key||!EQ[key]){toast('Pick an item first.');return}
    const o=wornFrom(x);if(!o){toast('This piece has nothing drawn.');return}S.draft.worn=S.draft.worn||{};S.draft.worn[key]=o;await API.dset('draft/worn/'+key,o);
    toast('Saved as the look of '+(INAME[key]||key)+' in the draft. Opening it...');const tb=document.querySelector('#dvs [data-tab="worn"]');if(tb){tb.click();setTimeout(()=>{const it=document.querySelector('#dvs [data-k="'+key+'"]');if(it)it.click()},150)}}
   else if(a==='pet'){const k=parts[1],[u,id]=k.split('/'),x=T.list.find(y=>y.u===u&&y.id===id);if(x&&T.pk[k]==='__new'){if(!petFrom(x)){toast('This piece has nothing drawn in its first frame.');return}T.pk[k]=await SQNEWPETS.create(x.n)}const item=T.pk[k],e=item&&EQ[item];if(!x||!e||!e.pet){toast('Pick a pet first.');return}
    const o=petFrom(x);if(!o||!(SQA.validPet&&SQA.validPet(o))){toast('This piece has nothing drawn in its first frame.');return}S.draft.pets=S.draft.pets||{};S.draft.pets[e.pet]=o;await API.dset('draft/pets/'+e.pet,o);
    toast('Saved as the look of '+(INAME[item]||item)+' in the draft. Opening it...');const tb=document.querySelector('#dvs [data-tab="pets"]');if(tb){tb.click();setTimeout(()=>{const it=document.querySelector('#dvs [data-k="'+item+'"]');if(it)it.click()},150)}}
   else if(a==='ok'||a==='no'){const k=parts[1],[u,id]=k.split('/'),x=T.list.find(y=>y.u===u&&y.id===id);const re=String(T.msg[k]||'').trim().slice(0,300);
    const up={['art/'+u+'/'+id+'/st']:a};if(re)up['art/'+u+'/'+id+'/re']=re;if(a==='ok')up['artcred/'+id]={n:String(x.who||nm(u)).slice(0,12),w:String(x.n||'Art').slice(0,40)};
    for(const pth of Object.keys(up))await D().set(ref(pth),up[pth]);
    const m=(a==='ok'?'Your art "'+x.n+'" was approved! Thank you. It will show up in the game, and your name is in the credits.':'About your art "'+x.n+'": not this time.')+(re?' '+re:'');
    try{await D().set(ref('gifts/'+u+'/a'+Date.now().toString(36)),{m:m.slice(0,300),t:D().serverTimestamp(),f:'dev'})}catch(_){self.SQERR&&SQERR(_,'211-26')}
    x.st=a;if(re)x.re=re;toast(a==='ok'?'Approved.':'Answered.');API.draw()}
   else if(a==='pm'){const u=parts[1],r=T.pat[u]||{},now=Date.now(),from=Math.max(now,r.u||0);const nr={s:r.s||now,u:from+30*864e5,c:true};await D().set(ref('patron/'+u),nr);T.pat[u]=nr;T.q='';toast(nm(u)+' is a Patron until '+new Date(nr.u).toLocaleDateString()+'.');API.draw()}
   else if(a==='pcsave'){const f=T.pcf||{},pc=T.pc||{};const up={};for(const k of['cid','cs','ws','camp','ct','crt'])if(f[k])up[k]=String(f[k]).trim().slice(0,k==='camp'?40:k==='ct'||k==='crt'?500:200);
    if(!Object.keys(up).length){toast('Nothing to save.');return}if(up.camp&&!/^[0-9]{1,20}$/.test(up.camp)){toast('The campaign ID is a number.');return}
    for(const k in up)await D().set(ref('cfg/patreon/'+k),up[k]);
    const pub={cid:up.cid||pc.cid||'',cs:!!(up.cs||pc.cs),ws:!!(up.ws||pc.ws),camp:!!(up.camp||pc.camp),ct:!!(up.ct||pc.ct),t:Date.now()};if(!pub.cid)delete pub.cid;await D().set(ref('cfgpub/patreon'),pub);
    T.pc=pub;T.pcf={};toast('Patreon settings saved.');API.draw();if(up.ct)await psync()}
   else if(a==='psync')await psync();
   else if(a==='pend'){const u=parts[1],r=T.pat[u];if(!r)return;const nr=Object.assign({},r,{u:Date.now()-1000});await D().set(ref('patron/'+u),nr);T.pat[u]=nr;toast('Ended. They keep the fire cape.');API.draw()}
  }catch(err){fail(err)}},true);
 SQSUITE.addTab('artroom','Art Room',{render,changes:(L,D)=>{const l=L&&L.places&&L.places.gallery,d=D&&D.places&&D.places.gallery;return JSON.stringify(l||null)===JSON.stringify(d||null)?[]:[{kind:'ext',html:'🖼️ Patron Art Gallery building: '+(d?'moved to where you chose':'back to the spot the game picks')}]}})})();
