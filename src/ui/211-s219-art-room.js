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
 const SIZES=[8,12,16,20,24,32,40,48];
 const blank=(w,h)=>new Uint8Array(w*h);
 let A=null;
 // wearables: 48x76 pixels of the 96x112 worn layer (origin WO), one frame per facing (front, back, side), drawn over your character
 const WO=[24,28],WSL=[['helm','Hat or helmet'],['body','Top or chestplate'],['legs','Trousers or leg armour']],FACE=['Front','Back','Side'];
 function freshWear(){return Object.assign(fresh(),{mode:'wear',w:48,h:76,fr:[blank(48,76),blank(48,76),blank(48,76)],kind:'wear',sl:'helm',mirror:true,onion:false,under:1,gear:0})}
 // pets: four frames (Idle 1, Idle 2, Walk 1, Walk 2 = the pet look's a, c, b, d), drawn facing right, one pixel = one game pixel
 const PFN=['Idle 1','Idle 2','Walk 1','Walk 2'],PSZ=[12,16,20,24,32];
 function freshPet(){return Object.assign(fresh(),{mode:'pet',w:16,h:16,fr:[blank(16,16),blank(16,16),blank(16,16),blank(16,16)],kind:'pet',mirror:false,onion:true,pvm:'idle',scale:1})}
 const DR={pic:null,wear:null,pet:null};
 const mk=m=>m==='wear'?freshWear():m==='pet'?freshPet():fresh();
 function fresh(){return{mode:'pic',w:16,h:16,fr:[blank(16,16)],cur:0,pal:PAL0.slice(),col:1,tool:'pen',ms:200,onion:true,mirror:false,zoom:1,grid:true,name:'',kind:'item',note:'',undo:[],redo:[],view:'draw',mine:null,sent:''}}
 const LSK=m=>m==='wear'?'sq_art_wear':m==='pet'?'sq_art_pet':'sq_art_draft';
 function loadOne(m){try{const d=JSON.parse(localStorage.getItem(LSK(m))||'null');if(d&&d.w&&d.fr){const o=Object.assign(mk(m),d,{mode:m,fr:d.fr.map(s=>Uint8Array.from(s)),undo:[],redo:[],view:'draw',mine:null,sent:''});if(m==='pic'&&o.kind==='pet')o.kind='item';if(m==='pet'){o.kind='pet';if(o.fr.length!==4||o.w!==o.h||!PSZ.includes(o.w))return mk(m)}if(m!=='wear'||o.fr.length===3&&o.w===48&&o.h===76)return o}}catch(e){}return mk(m)}
 function load(){if(A)return;DR.pic=loadOne('pic');DR.wear=loadOne('wear');DR.pet=loadOne('pet');let m='pic';try{const v=localStorage.getItem('sq_art_mode');m=v==='wear'||v==='pet'?v:'pic'}catch(e){}A=DR[m]}
 const W=()=>A&&A.mode==='wear',PT=()=>A&&A.mode==='pet';
 let saveT=0;function keep(){clearTimeout(saveT);saveT=setTimeout(keepNow,400)}
 function keepNow(){clearTimeout(saveT);if(!A)return;try{localStorage.setItem(LSK(A.mode),JSON.stringify({w:A.w,h:A.h,fr:A.fr.map(f=>Array.from(f)),cur:A.cur,pal:A.pal,col:A.col,tool:A.tool,ms:A.ms,onion:A.onion,mirror:A.mirror,zoom:A.zoom,grid:A.grid,name:A.name,kind:A.kind,note:A.note,sl:A.sl,under:A.under,gear:A.gear,pvm:A.pvm,scale:A.scale}));localStorage.setItem('sq_art_mode',A.mode)}catch(e){}}
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
  grid:'M3 3h14v14H3zM8 3v14M13 3v14M3 8h14M3 13h14',onion:'M4 6h9v9H4zM7 3h9v9'};
 const ico=k=>'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="'+IC[k]+'"/></svg>';
 const tb=(act,k,label,on,dis)=>'<button class="arb'+(on?' on':'')+'" data-ar="'+act+'" title="'+label+'" aria-label="'+label+'"'+(dis?' disabled':'')+'>'+ico(k)+'</button>';
 // size of one pixel on screen: fill the width (and on phones, about half the screen height), times the zoom
 function fit(){const wide=innerWidth>=760,pw=Math.max(200,(pbd.clientWidth||340)-(wide?360:12)),ph=Math.max(180,innerHeight*(wide?.66:.5));
  return Math.max(3,Math.floor(Math.min(pw,ph)/Math.max(A.w,A.h)))}
 const cell=()=>fit()*A.zoom;
 function html(){if(!can())return'<div class="tl">ART ROOM</div><p>The Art Room is open to Patrons aged 13 and up.</p><button class="arb" data-ar="back">Back</button>';
  if(A.view==='mine')return mineHTML();if(A.view==='send')return sendHTML();
  const c=cell(),f=A.fr.length;
  const tools='<div class="artb">'+tb('tool:pen','pen','Pen (B)',A.tool==='pen')+tb('tool:erase','erase','Eraser (E)',A.tool==='erase')+tb('tool:fill','fill','Fill (G)',A.tool==='fill')+tb('tool:pick','pick','Pick a colour from the drawing (I)',A.tool==='pick')+
   (A.zoom>1?tb('tool:move','move','Move around (hold Space)',A.tool==='move'):'')+tb('mirror','mirror','Mirror: draw both sides at once (M)',A.mirror)+'<span class="sp"></span>'+
   tb('undo','undo','Undo (Ctrl+Z)',0,!A.undo.length)+tb('redo','redo','Redo (Ctrl+Y)',0,!A.redo.length)+tb('zout','zout','Zoom out',0,A.zoom<=1)+tb('zin','zin','Zoom in',0,A.zoom>=6)+tb('grid','grid','Grid lines',A.grid)+'</div>';
  const pal='<div class="arpalw"><label class="arcur'+(A.col?'':' clr')+'" style="'+(A.col?'background:'+A.pal[A.col]:'')+'" title="'+(A.col?'Tap to change this colour':'Clear (see-through)')+'">'+(A.col?'<input type="color" id="arcc" value="'+A.pal[A.col]+'" aria-label="Change this colour">':'')+'</label>'+
   '<div class="arpal">'+A.pal.map((h,i)=>'<button class="'+(i===A.col?'on ':'')+(i?'':'clr')+'" data-ar="col:'+i+'" style="'+(i?'background:'+h:'')+'" aria-label="'+(i?'Colour '+i:'See-through')+'"></button>').join('')+'</div></div>';
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
    '<button class="add" data-ar="fadd" title="New frame"'+(f<MAXF?'':' disabled')+'>+</button></div>'+
   '<div class="arrow"><span class="arsm">Frame '+(A.cur+1)+' of '+f+'</span><button class="arb" data-ar="fdup"'+(f<MAXF?'':' disabled')+'>Copy</button><button class="arb" data-ar="fdel"'+(f>1?'':' disabled')+'>Delete</button>'+
   '<button class="arb" data-ar="fl" aria-label="Move frame left"'+(A.cur>0?'':' disabled')+'>◀</button><button class="arb" data-ar="fr" aria-label="Move frame right"'+(A.cur<f-1?'':' disabled')+'>▶</button>'+(f>1?tb('onion','onion','Show the previous frame faintly',A.onion):'')+'</div>'+
   (f>1?'<label class="arsm" style="display:block">Speed: <span id="arms">'+A.ms+'</span> ms a frame<input type="range" id="arsp" min="60" max="1000" step="20" value="'+A.ms+'" style="width:100%"></label>':'')+'</div></div>';
  const more=PT()?'<div class="arrow"><label class="arsm">Size <select id="arsz" class="arin" style="width:auto;padding:4px;font-size:14px">'+PSZ.map(n=>'<option value="'+n+'"'+(n===A.w?' selected':'')+'>'+n+' x '+n+'</option>').join('')+'</select></label><button class="arb" data-ar="clear">Clear frame</button><button class="arb" data-ar="new">Start over</button></div>':W()?'<div class="arrow"><button class="arb" data-ar="clear">Clear this side</button><button class="arb" data-ar="new">Start over</button></div>':'<div class="arrow"><label class="arsm">Canvas <select id="arsz" class="arin" style="width:auto;padding:4px;font-size:14px">'+SIZES.map(n=>'<option value="'+n+'"'+(n===A.w&&n===A.h?' selected':'')+'>'+n+' x '+n+'</option>').join('')+(A.w!==A.h||!SIZES.includes(A.w)?'<option selected>'+A.w+' x '+A.h+'</option>':'')+'</select></label>'+
   '<button class="arb" data-ar="clear">Clear frame</button><button class="arb" data-ar="new">Start over</button></div>';
  return '<div class="arw"><div class="arhd"><div class="tl">ART ROOM</div><button class="arb" data-ar="mine">My art</button><button class="arb" data-ar="back">Back</button></div>'+modes+tools+
   '<div class="armain"><div class="arbox'+(A.zoom>1?' zm':'')+'" id="arbox"><canvas class="arcv" id="arcv" width="'+A.w*c+'" height="'+A.h*c+'" style="width:'+A.w*c+'px;height:'+A.h*c+'px" aria-label="Drawing canvas"></canvas></div>'+
   '<div class="arside">'+pal+frames+more+'<button class="arb pri wide" data-ar="next" style="width:100%;min-height:46px;font-size:15px">Done? Name it and send</button></div></div></div>'}
 function sendHTML(){return '<div class="arw"><div class="arhd"><div class="tl">SEND YOUR ART</div><button class="arb" data-ar="draw">Back to drawing</button></div>'+
   '<div class="arsend">'+(PT()?'<canvas class="big" id="arpv" width="96" height="'+PVH()+'" style="width:192px;height:'+2*PVH()+'px"></canvas>':'<canvas class="big" id="arpv" width="'+A.w+'" height="'+A.h+'"'+(W()?' style="width:120px;height:190px"':'')+'></canvas>')+'<div>'+
   '<p class="arsm" style="margin:0">'+(PT()?'A pet, '+A.w+' x '+A.h+', standing and walking. Approved pets can be given to a pet in the game, with your name in the credits.':W()?'Something to wear, from the front, back and side. Approved designs can become real gear.':A.w+' x '+A.h+', '+A.fr.length+' frame'+(A.fr.length>1?'s at '+A.ms+' ms':'')+'. Approved art goes into the game, with your name in the credits. Pictures can become paintings in the Patron Art Gallery.')+'</p>'+
   '<label class="arlb" for="arnm">Name</label><input class="arin" id="arnm" maxlength="24" value="'+E(A.name)+'" placeholder="e.g. Ember sword">'+
   (PT()?'':W()?'<p class="arsm" style="margin:8px 0 0">'+(WSL.find(q=>q[0]===A.sl)||WSL[0])[1]+', drawn from the front, back and side.</p>':'<label class="arlb" for="arkd">What is it?</label><select class="arin" id="arkd">'+KINDS.filter(q=>q[0]!=='pet').map(([k,l])=>'<option value="'+k+'"'+(k===A.kind?' selected':'')+'>'+l+'</option>').join('')+'</select>')+
   '<label class="arlb" for="arnt">Note for the developer (optional)</label><textarea class="arin" id="arnt" maxlength="300" rows="3" placeholder="Where would you like to see it?">'+E(A.note)+'</textarea>'+
   '<div class="arrow" style="margin-top:12px"><button class="arb pri wide" data-ar="send" style="min-height:46px;font-size:15px">Send to the developer</button></div>'+
   (A.sent?'<p style="font-weight:700">'+E(A.sent)+'</p>':'')+'</div></div></div>'}
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
  if(A.grid&&c>=6){x.strokeStyle='rgba(0,0,0,.1)';x.lineWidth=1;x.beginPath();for(let i=1;i<A.w;i++){x.moveTo(i*c+.5,0);x.lineTo(i*c+.5,A.h*c)}for(let j=1;j<A.h;j++){x.moveTo(0,j*c+.5);x.lineTo(A.w*c,j*c+.5)}x.stroke()}
  if(A.mirror){x.strokeStyle='rgba(56,112,216,.7)';x.setLineDash([4,4]);x.beginPath();x.moveTo(A.w*c/2+.5,0);x.lineTo(A.w*c/2+.5,A.h*c);x.stroke();x.setLineDash([])}
  thumbs();pv()}
 // the character under a wearable (211 shadows the game's CH, so 213 draws it): the 48x76 part of the 96x112 worn layer
 const UC=new Map();function under(d){const key=d+':'+(A.gear?1:0);if(UC.has(key))return UC.get(key);let c=null;try{const L=window.SQPAINT&&SQPAINT.charLayer(d,!!A.gear);if(L){c=document.createElement('canvas');c.width=48;c.height=76;c.getContext('2d').drawImage(L,WO[0],WO[1],48,76,0,0,48,76)}}catch(e){}UC.set(key,c);return c}
 function pv(){const cv=document.getElementById('arpv');if(!cv)return;if(PT())return petPv(cv);const i=W()?pvF%3:pvF%A.fr.length;if(!W())return drawFrame(cv,A.fr[i]||A.fr[0],A.w,A.h,A.pal);
  const x=cv.getContext('2d');x.clearRect(0,0,A.w,A.h);const u=under(i);if(u)x.drawImage(u,0,0);const t=document.createElement('canvas');t.width=A.w;t.height=A.h;drawFrame(t,A.fr[i],A.w,A.h,A.pal);x.drawImage(t,0,0)}
 // the pet preview: a strip of ground, the pet standing (Idle 1/2 every 0.5 s) or walking to and fro (Walk 1/2 every 125 ms, the game's step clock)
 const has=f=>f&&f.some(v=>v);
 function petFrame(fr,walk,now){const ok=i=>has(fr[i]);if(walk)return Math.floor(now/125)%2?(ok(3)?3:0):(ok(2)?2:0);return Math.floor(now/500)%2&&ok(1)?1:0}
 const PTC=document.createElement('canvas'),PVH=()=>Math.max(A.h,32)+8;
 function petPv(cv){const now=performance.now(),walk=A.pvm==='walk',x=cv.getContext('2d'),gy=cv.height-4;x.imageSmoothingEnabled=false;x.clearRect(0,0,cv.width,cv.height);
  x.fillStyle='#7cc05a';x.fillRect(0,gy,cv.width,4);x.fillStyle='#5a9a40';for(let i=0;i<cv.width;i+=6)x.fillRect(i+((i/6)%2?2:0),gy,1,1);
  if(A.scale){try{const L=window.SQPAINT&&SQPAINT.charLayer(2,false);if(L){x.globalAlpha=.85;x.drawImage(L,0,0,96,112,4-16,gy-51,48,56);x.globalAlpha=1}}catch(e){}}
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
 // two fingers on the canvas = move around (when zoomed) instead of drawing; the first finger's stroke is taken back
 const touches=new Map();
 pbd.addEventListener('pointerdown',e=>{if(ptab!==ATAB||e.target.id!=='arcv')return;e.preventDefault();e.stopPropagation();touches.set(e.pointerId,[e.clientX,e.clientY]);
  const box=document.getElementById('arbox');try{e.target.setPointerCapture(e.pointerId)}catch(_){}
  if(touches.size>=2||A.tool==='move'||space||e.button===1){if(drag&&touches.size>=2&&A.undo.length){const s=A.undo.pop();A.fr=s.fr;paint()}drag=null;pan={x:e.clientX,y:e.clientY,sl:box.scrollLeft,st:box.scrollTop};return}
  const p=at(e);if(!p)return;
  if(A.tool==='pick'){A.col=A.fr[A.cur][p[1]*A.w+p[0]];A.tool='pen';keep();rPn();return}
  snapU();if(A.tool==='fill'){fill(A.fr[A.cur],p[1]*A.w+p[0],A.tool==='fill'?A.col:0);if(A.mirror)fill(A.fr[A.cur],p[1]*A.w+(A.w-1-p[0]),A.col);paint();keep();rPnSoft();return}
  drag=p;plot(p[0],p[1]);paint()},true);
 pbd.addEventListener('pointermove',e=>{if(ptab!==ATAB||e.target.id!=='arcv')return;if(touches.has(e.pointerId))touches.set(e.pointerId,[e.clientX,e.clientY]);
  if(pan){e.preventDefault();const box=document.getElementById('arbox');if(box){box.scrollLeft=pan.sl-(e.clientX-pan.x);box.scrollTop=pan.st-(e.clientY-pan.y)}return}
  if(!drag)return;e.preventDefault();const p=at(e);if(!p)return;line(drag,p);drag=p;paint()},true);
 const endDrag=e=>{touches.delete(e.pointerId);if(!touches.size)pan=null;if(drag){drag=null;keep();rPnSoft()}};addEventListener('pointerup',endDrag,true);addEventListener('pointercancel',endDrag,true);
 // mouse wheel / trackpad: Ctrl+wheel zooms
 pbd.addEventListener('wheel',e=>{if(ptab!==ATAB||!A||A.view!=='draw'||!e.ctrlKey||!e.target.closest||!e.target.closest('#arbox'))return;e.preventDefault();zoomBy(e.deltaY<0?1:-1)},{passive:false,capture:true});
 function zoomBy(d){const z=Math.max(1,Math.min(6,A.zoom+d));if(z===A.zoom)return;const box=document.getElementById('arbox'),fx=box?(box.scrollLeft+box.clientWidth/2)/Math.max(1,box.scrollWidth):.5,fy=box?(box.scrollTop+box.clientHeight/2)/Math.max(1,box.scrollHeight):.5;
  A.zoom=z;if(z===1&&A.tool==='move')A.tool='pen';keep();rPn();const b2=document.getElementById('arbox');if(b2){b2.scrollLeft=fx*b2.scrollWidth-b2.clientWidth/2;b2.scrollTop=fy*b2.scrollHeight-b2.clientHeight/2}}
 // redraw buttons (undo state) without rebuilding the canvas mid-stroke
 function rPnSoft(){const u=document.querySelector('#pn [data-ar="undo"]'),r=document.querySelector('#pn [data-ar="redo"]');if(u)u.disabled=!A.undo.length;if(r)r.disabled=!A.redo.length}
 // ---- preview ----
 let pvF=0,pvT=0;setInterval(()=>{if(ptab!==ATAB||!pnOpen||!A||A.view==='mine')return;const now=performance.now();if(PT()){pv();return}if(now-pvT<(W()?900:A.ms))return;pvT=now;pvF=(pvF+1)%(W()?3:A.fr.length);pv()},40);
 // ---- buttons and fields ----
 function act(a,v,b){
  if(a==='tool')A.tool=v;else if(a==='col'){A.col=+v;if(A.tool==='erase'||A.tool==='pick'||A.tool==='move')A.tool='pen'}
  else if(a==='mirror')A.mirror=!A.mirror;else if(a==='grid')A.grid=!A.grid;else if(a==='zin'){zoomBy(1);return}else if(a==='zout'){zoomBy(-1);return}
  else if(a==='undo'&&A.undo.length){A.redo.push({fr:A.fr.map(f=>f.slice()),cur:A.cur,w:A.w,h:A.h});const s=A.undo.pop();Object.assign(A,s)}
  else if(a==='redo'&&A.redo.length){A.undo.push({fr:A.fr.map(f=>f.slice()),cur:A.cur,w:A.w,h:A.h});const s=A.redo.pop();Object.assign(A,s)}
  else if(a==='clear'){snapU();A.fr[A.cur]=blank(A.w,A.h)}
  else if(a==='fadd'&&A.fr.length<MAXF){snapU();A.fr.splice(A.cur+1,0,blank(A.w,A.h));A.cur++}
  else if(a==='fdup'&&A.fr.length<MAXF){snapU();A.fr.splice(A.cur+1,0,A.fr[A.cur].slice());A.cur++}
  else if(a==='fdel'&&A.fr.length>1){snapU();A.fr.splice(A.cur,1);A.cur=Math.min(A.cur,A.fr.length-1)}
  else if(a==='fl'&&A.cur>0){snapU();[A.fr[A.cur-1],A.fr[A.cur]]=[A.fr[A.cur],A.fr[A.cur-1]];A.cur--}
  else if(a==='fr'&&A.cur<A.fr.length-1){snapU();[A.fr[A.cur+1],A.fr[A.cur]]=[A.fr[A.cur],A.fr[A.cur+1]];A.cur++}
  else if(a==='onion')A.onion=!A.onion;
  else if(a==='mode'){if(A.mode!==v&&(v==='pic'||v==='wear'||v==='pet')){keepNow();A=DR[v]||(DR[v]=mk(v));A.view='draw';try{localStorage.setItem('sq_art_mode',v)}catch(x){}}}
  else if(a==='under'){A.under=A.under?0:1}else if(a==='gear'){A.gear=A.gear?0:1;UC.clear()}
  else if(a==='cpf'&&W()&&A.cur>0){snapU();A.fr[A.cur]=A.fr[0].slice()}
  else if(a==='cpi'&&PT()&&A.cur>0){snapU();A.fr[A.cur]=A.fr[0].slice()}else if(a==='cpw'&&PT()&&A.cur===3){snapU();A.fr[3]=A.fr[2].slice()}
  else if(a==='pvm'&&PT())A.pvm=v==='walk'?'walk':'idle';else if(a==='scale'&&PT())A.scale=A.scale?0:1;
  else if(a==='new'){if(b&&b.dataset.sure){const m=A.mode;A=DR[m]=mk(m);try{localStorage.removeItem(LSK(m))}catch(x){}}else{if(b){b.dataset.sure=1;b.textContent='Sure? Tap again'}return}}
  else if(a==='next'){if(!A.fr.some(f=>f.some(x=>x))){say('Draw something first.');return}if(PT()&&!has(A.fr[0])){say('Draw Idle 1 first: it\'s how your pet looks when it stands still.');return}A.view='send';A.sent=''}
  else if(a==='send'){send();return}
  else if(a==='mine'){A.view='mine';A.mine=null;rPn();loadMine();return}
  else if(a==='draw')A.view='draw';
  else if(a==='back'){ptab=window.SQPATRON&&SQPATRON.PTAB||8;rPn();return}
  keep();rPn()}
 pbd.addEventListener('click',e=>{if(ptab!==ATAB)return;const fc=e.target.closest&&e.target.closest('[data-arf]');if(fc){A.cur=+fc.dataset.arf;keep();rPn();return}
  const b=e.target.closest&&e.target.closest('[data-ar]');if(!b)return;e.stopPropagation();e.preventDefault();const[a,v]=b.dataset.ar.split(':');act(a,v,b)},true);
 pbd.addEventListener('input',e=>{if(ptab!==ATAB||!A)return;const t=e.target;
  if(t.id==='arnm')A.name=t.value.slice(0,24);else if(t.id==='arnt')A.note=t.value.slice(0,300);
  else if(t.id==='arsp'){A.ms=+t.value;const s=document.getElementById('arms');if(s)s.textContent=A.ms}
  else if(t.id==='arcc'&&A.col){A.pal[A.col]=t.value;paint();const sw=document.querySelector('#pn [data-ar="col:'+A.col+'"]');if(sw)sw.style.background=t.value;const cu=t.parentNode;if(cu)cu.style.background=t.value}
  keep()},true);
 pbd.addEventListener('change',e=>{if(ptab!==ATAB||!A)return;const t=e.target;
  if(t.id==='arkd'){A.kind=t.value;keep()}
  else if(t.id==='arsl'){A.sl=WSL.some(q=>q[0]===t.value)?t.value:'helm';keep()}
  else if(t.id==='arsz'){const n=+t.value;if(!n||n===A.w&&n===A.h)return;snapU();const dx=PT()?Math.floor((n-A.w)/2):0,dy=PT()?n-A.h:0;A.fr=A.fr.map(f=>{const g2=blank(n,n);for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<n&&Y<n)g2[Y*n+X]=f[y*A.w+x]}return g2});A.w=A.h=n;A.zoom=1;keep();rPn()}},true);
 // keyboard on a computer: B/E/G/I tools, M mirror, Ctrl+Z / Ctrl+Y, +/- zoom, hold Space to move around
 addEventListener('keydown',e=>{if(ptab!==ATAB||!pnOpen||!A||A.view!=='draw')return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'))return;
  const k=e.key.toLowerCase(),c=e.ctrlKey||e.metaKey;let a=null,v;
  if(c&&k==='z')a=e.shiftKey?'redo':'undo';else if(c&&k==='y')a='redo';else if(c)return;
  else if(k==='b'||k==='p'){a='tool';v='pen'}else if(k==='e'){a='tool';v='erase'}else if(k==='g'||k==='f'){a='tool';v='fill'}else if(k==='i'){a='tool';v='pick'}else if(k==='m')a='mirror';
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
 {const _r=rPn;rPn=function(){if(!(ptab===ATAB&&pnOpen))try{pn.classList.remove('sqart')}catch(e){}if(ptab===ATAB&&pnOpen){load();try{panelChrome('')}catch(e){}pbd.innerHTML=html();try{pn.classList.add('sqart')}catch(e){}if(A.view!=='mine')paint();else document.querySelectorAll('#pn [data-arm]').forEach(cv=>{const x=(A.mine||[]).find(m=>m.id===cv.dataset.arm);const fr=x?unpack(x):[];if(fr[0])drawFrame(cv,fr[0].f,x.w,x.h,fr[0].pal)});return}return _r.apply(this,arguments)}}
 function open(){if(!can()){say('The Art Room is for Patrons aged 13 and up.');return}load();if(A.view!=='send')A.view='draw';try{if(!pnOpen&&typeof openPanel==='function')openPanel(ATAB)}catch(e){}ptab=ATAB;pnOpen=true;try{pn.style.display='block'}catch(e){}rPn()}
 window.SQARTROOM={open,unpack,pack:()=>pack(),get state(){return A},CH};
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
 function petCtl(x,k){const L=(window.SQA&&SQA.petKinds?SQA.petKinds():[]).slice().sort((a,b)=>String(INAME[a]||a).localeCompare(String(INAME[b]||b)));if(!T.pk[k])T.pk[k]=L[0]||'';
  return'<p class="dv-mut" style="margin:8px 0 4px">'+'A pet: Idle 1 and 2 while it stands, Walk 1 and 2 while it walks (preview: walking, then standing).'+' Use it as the look of:</p><div class="dv-row" style="gap:6px;flex-wrap:wrap"><select data-arpk="'+E(k)+'">'+L.map(q=>'<option value="'+q+'"'+(T.pk[k]===q?' selected':'')+'>'+E(INAME[q]||q)+(S.draft&&S.draft.pets&&S.draft.pets[EQ[q].pet]?' (has a look)':'')+'</option>').join('')+'</select>'+
   '<button class="dv-b dv-pri" data-arx="pet:'+E(k)+'">Put it in the Pets editor</button></div><p class="dv-mut" style="margin:4px 0 0">Saves it to the draft as that pet\'s look (replacing a draft look) and opens it, so you can finish it and publish.</p>'}
 function petFrom(x){const fr=unpack(x);if(!fr.length||fr.length>8)return null;const PX=window.SQA&&SQA.PXC;if(!PX)return null;const pal=fr[0].pal.slice(1);if(pal.length>PX.length)return null;
  const w=x.w,h=x.h,o={w,h,s:2,ox:-Math.floor(w/2),oy:7-h};['a','c','b','d'].forEach((d,i)=>{const f=fr[i]&&fr[i].f;if(!f||!f.some(v=>v))return;o[d]={w,h,s:2,p:pal.join(','),r:SQA.pack(Array.from(f,v=>v?PX[v-1]:'.').join(''))}});
  return o.a?o:null}
 // a wearable preview: the facings in turn over the plain character
 function wearPv(cv,x,i){const fr=unpack(x);if(!fr[i])return;const c=cv.getContext('2d');c.clearRect(0,0,x.w,x.h);try{const L=window.SQPAINT&&SQPAINT.charLayer(i,false);if(L){c.globalAlpha=.55;c.drawImage(L,24,28,48,76,0,0,48,76);c.globalAlpha=1}}catch(e){}
  const t=document.createElement('canvas');t.width=x.w;t.height=x.h;drawFrame(t,fr[i].f,x.w,x.h,fr[i].pal);c.drawImage(t,0,0)}
 // animate the inbox previews
 setInterval(()=>{if(S.tab!=='artroom'||!T.list)return;const now=performance.now();document.querySelectorAll('#dvs [data-arp]').forEach(cv=>{const[u,id]=cv.dataset.arp.split('/');const x=T.list.find(y=>y.u===u&&y.id===id);if(!x)return;const fr=unpack(x);if(!fr.length)return;if(x.k==='wear'){wearPv(cv,x,Math.floor(now/900)%Math.min(3,fr.length));return}
   if(x.k==='pet'&&fr.length===4){const has=i=>fr[i].f.some(v=>v),walk=now%4000<2000,i=walk?(Math.floor(now/125)%2?(has(3)?3:0):(has(2)?2:0)):(Math.floor(now/500)%2&&has(1)?1:0);drawFrame(cv,fr[i].f,x.w,x.h,fr[i].pal);return}const i=Math.floor(now/(x.ms||200))%fr.length;drawFrame(cv,fr[i].f,x.w,x.h,fr[i].pal)})},60);
 document.addEventListener('input',e=>{if(S.tab!=='artroom')return;const t=e.target;if(t.dataset&&t.dataset.arq)T.msg[t.dataset.arq]=t.value.slice(0,300);
  if(t.dataset&&t.dataset.arpp)T.pp[t.dataset.arpp]=Math.max(100,Math.min(1e6,Math.round(+t.value||0)));
  if(t.dataset&&t.dataset.arwk)T.wk[t.dataset.arwk]=t.value;
  if(t.dataset&&t.dataset.arpk)T.pk[t.dataset.arpk]=t.value;
  if(t.dataset&&t.dataset.arpc){T.pcf=T.pcf||{};T.pcf[t.dataset.arpc]=t.value.trim().slice(0,200)}
  if(t.dataset&&t.dataset.arpq){T.q=t.value;const pos=t.selectionStart;API.draw();const n=document.querySelector('#dvs [data-arpq]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}}},true);
 document.addEventListener('click',async e=>{if(S.tab!=='artroom')return;const t=e.target.closest&&e.target.closest('[data-arx]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();
  const parts=t.dataset.arx.split(':'),a=parts[0];
  try{
   if(a==='clip'){const[u,id]=parts[1].split('/'),x=T.list.find(y=>y.u===u&&y.id===id),fr=unpack(x)[+parts[2]];if(!fr)return;const c={w:x.w,h:x.h,p:Array.from(fr.f,v=>v?fr.pal[v]||'':'')};
    try{localStorage.setItem('sq_dev_clip',JSON.stringify(c))}catch(_){}toast('Frame copied. Open a picture editor and press Paste.')}
   else if(a==='galhere'){const PG=window.SQPAINT;if(!PG)return;const c=PG.standHere();if(!c){toast('Go outside on Hollow Island first, then come back here.');return}
    if(!PG.tryPlace(c)){toast('Not enough room there: it needs 5 tiles across and 2 up clear of trees, rocks, houses and other buildings, above where you stand.');return}
    S.draft.places=S.draft.places||{};S.draft.places.gallery=c;await API.dset('draft/places/gallery',c);toast('Moved in your game. Publish it from the Publish tab and everyone sees it there.');API.draw()}
   else if(a==='galauto'){if(S.draft.places)delete S.draft.places.gallery;await API.dset('draft/places/gallery',null);try{SQPAINT.applyChosen(null)}catch(_){}toast('The game picks its spot again (after you publish).');API.draw()}
   else if(a==='paint'){const k=parts[1],[u,id]=k.split('/'),x=T.list.find(y=>y.u===u&&y.id===id);if(!x||x.k==='wear')return;const p=Math.max(100,Math.min(1e6,T.pp[k]||2500));
    const rec={n:String(x.n||'Painting').slice(0,24),by:String(x.who||nm(u)).slice(0,12),u,w:x.w,h:x.h,f:x.f,ms:Math.max(40,Math.min(2000,x.ms|0||200)),p,t:D().serverTimestamp()};
    await D().set(ref('paintings/'+id),rec);if(x.st!=='ok'){await D().set(ref('art/'+u+'/'+id+'/st'),'ok');await D().set(ref('artcred/'+id),{n:rec.by,w:String(x.n||'Art').slice(0,40)});x.st='ok'}
    const re=String(T.msg[k]||'').trim().slice(0,200);if(re)try{await D().set(ref('art/'+u+'/'+id+'/re'),re);x.re=re}catch(_){}
    try{await D().set(ref('gifts/'+u+'/p'+Date.now().toString(36)),{m:('Your art "'+x.n+'" is now a painting in the Patron Art Gallery in Hollow Village, with your name on it! Your own copy is in your bag.'+(re?' '+re:'')).slice(0,300),t:D().serverTimestamp(),f:'dev'})}catch(_){}
    T.paint[id]=Object.assign({},rec,{t:Date.now()});toast('It\'s a painting now. It hangs in the gallery and the artist gets a copy.');API.draw()}
   else if(a==='poff'||a==='pon'){const k=parts[1],id=k.split('/')[1];if(!T.paint[id])return;await D().set(ref('paintings/'+id+'/off'),a==='poff'?true:null);if(a==='poff')T.paint[id].off=true;else delete T.paint[id].off;toast(a==='poff'?'No longer sold. Copies players have stay.':'Sold in the gallery again.');API.draw()}
   else if(a==='wear'){const k=parts[1],[u,id]=k.split('/'),x=T.list.find(y=>y.u===u&&y.id===id),key=T.wk[k];if(!x||!key||!EQ[key]){toast('Pick an item first.');return}
    const o=wornFrom(x);if(!o){toast('This piece has nothing drawn.');return}S.draft.worn=S.draft.worn||{};S.draft.worn[key]=o;await API.dset('draft/worn/'+key,o);
    toast('Saved as the look of '+(INAME[key]||key)+' in the draft. Opening it...');const tb=document.querySelector('#dvs [data-tab="worn"]');if(tb){tb.click();setTimeout(()=>{const it=document.querySelector('#dvs [data-k="'+key+'"]');if(it)it.click()},150)}}
   else if(a==='pet'){const k=parts[1],[u,id]=k.split('/'),x=T.list.find(y=>y.u===u&&y.id===id),item=T.pk[k],e=item&&EQ[item];if(!x||!e||!e.pet){toast('Pick a pet first.');return}
    const o=petFrom(x);if(!o||!(SQA.validPet&&SQA.validPet(o))){toast('This piece has nothing drawn in its first frame.');return}S.draft.pets=S.draft.pets||{};S.draft.pets[e.pet]=o;await API.dset('draft/pets/'+e.pet,o);
    toast('Saved as the look of '+(INAME[item]||item)+' in the draft. Opening it...');const tb=document.querySelector('#dvs [data-tab="pets"]');if(tb){tb.click();setTimeout(()=>{const it=document.querySelector('#dvs [data-k="'+item+'"]');if(it)it.click()},150)}}
   else if(a==='ok'||a==='no'){const k=parts[1],[u,id]=k.split('/'),x=T.list.find(y=>y.u===u&&y.id===id);const re=String(T.msg[k]||'').trim().slice(0,300);
    const up={['art/'+u+'/'+id+'/st']:a};if(re)up['art/'+u+'/'+id+'/re']=re;if(a==='ok')up['artcred/'+id]={n:String(x.who||nm(u)).slice(0,12),w:String(x.n||'Art').slice(0,40)};
    for(const pth of Object.keys(up))await D().set(ref(pth),up[pth]);
    const m=(a==='ok'?'Your art "'+x.n+'" was approved! Thank you. It will show up in the game, and your name is in the credits.':'About your art "'+x.n+'": not this time.')+(re?' '+re:'');
    try{await D().set(ref('gifts/'+u+'/a'+Date.now().toString(36)),{m:m.slice(0,300),t:D().serverTimestamp(),f:'dev'})}catch(_){}
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
