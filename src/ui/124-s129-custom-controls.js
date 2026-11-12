// ---- 129. Custom controls: your own keys, mouse buttons and controller buttons ----
// Options > Controls lists every action with its key (keyboard & mouse) and its button (controller). Tap Change, then
// press the new key / mouse button / controller button. Taking a key or button another action uses swaps the two.
// Saved on this device (localStorage sq_keys, sq_pad); "Reset" puts the game's own layout back.
// How it works:
//  - Keyboard: the game listens for its own keys everywhere (Space, E, F, T, W/A/S/D...). A capture listener on window
//    turns a real key press into the game's key for that action (a new KeyboardEvent on the same target) and swallows a
//    game key whose action moved to another key. Events the game sends itself (the controller sends key events too)
//    are never touched, and nothing is changed while you type in a text box or the Dev Suite is open.
//  - Mouse: the middle and the two side buttons can be bound to any action (left and right click keep their jobs).
//  - Controller: PADB (023) names the buttons the game reads; while you play (not in menus, the title screen or when
//    fallen) the wrapper gives those names your buttons for the length of each pollPad call.
(()=>{const LS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
 // ---------- keyboard & mouse ----------
 const KA=[['mvu','Move up','w'],['mvd','Move down','s'],['mvl','Move left','a'],['mvr','Move right','d'],['spr','Sprint (hold)','shift'],
  ['hit','Hit, chop, mine, fish',' '],['eat','Eat / cook','e'],['fire','Build a campfire','f'],['talk','Talk / use','t'],['roll','Dodge roll','r'],['ult','Wand ultimate','v'],
  ['bag','Bag','b'],['map','Map','m'],['quests','Quests','q'],['skills','Skills','k'],['craft','Craft','c'],['card','Character','p'],['help','Show / hide the help box','h']];
 const KDEF={};for(const[id,,k]of KA)KDEF[id]=k;
 let KB=Object.assign({},KDEF,LS('sq_keys')||{}),REV={},MOVED=new Set();
 function rebuild(){REV={};for(const id in KDEF)REV[KB[id]]=KDEF[id];MOVED=new Set();for(const id in KDEF)if(KB[id]!==KDEF[id]&&!(KDEF[id]in REV))MOVED.add(KDEF[id])}rebuild();
 const norm=k=>String(k||'').toLowerCase();
 const kname=k=>({' ':'Space',shift:'Shift',control:'Ctrl',alt:'Alt',arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→',enter:'Enter',tab:'Tab',backspace:'Backspace',mouse1:'Middle click',mouse3:'Mouse back',mouse4:'Mouse forward'})[k]||(k.length===1?k.toUpperCase():k[0].toUpperCase()+k.slice(1));
 const typing=t=>!!t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable);
 const suite=()=>!!(window.SQSUITE&&SQSUITE.state&&SQSUITE.state.open);
 const gameKey=k=>k==='shift'?'Shift':k;
 function send(type,k,rep,tgt){(tgt&&tgt.dispatchEvent?tgt:document).dispatchEvent(new KeyboardEvent(type,{key:gameKey(k),bubbles:true,cancelable:true,repeat:!!rep}))}
 let CAP=null;// {kind:'k'|'p', id}
 for(const type of['keydown','keyup'])addEventListener(type,e=>{if(!e.isTrusted)return;
  if(CAP&&CAP.kind==='k'){if(type!=='keydown')return;e.preventDefault();e.stopImmediatePropagation();const k=norm(e.key);if(k==='escape'){CAP=null;draw();return}bindKey(CAP.id,k);return}
  if(typing(e.target)||suite()||e.ctrlKey||e.metaKey||e.altKey)return;const p=norm(e.key),g2=REV[p];
  if(g2!==undefined){if(g2===p)return;e.preventDefault();e.stopImmediatePropagation();send(type,g2,e.repeat,e.target);return}
  if(MOVED.has(p)){e.preventDefault();e.stopImmediatePropagation()}},true);
 // mouse: middle (1), back (3), forward (4)
 addEventListener('pointerdown',e=>{if(!e.isTrusted||e.pointerType!=='mouse'||![1,3,4].includes(e.button))return;const k='mouse'+e.button;
  if(CAP&&CAP.kind==='k'){e.preventDefault();e.stopImmediatePropagation();bindKey(CAP.id,k);return}
  if(REV[k]!==undefined&&!suite()){e.preventDefault();send('keydown',REV[k],false,document.body)}},true);
 addEventListener('pointerup',e=>{if(!e.isTrusted||e.pointerType!=='mouse'||![1,3,4].includes(e.button))return;const k='mouse'+e.button;if(REV[k]!==undefined){e.preventDefault();if(!suite())send('keyup',REV[k],false,document.body)}},true);
 addEventListener('mouseup',e=>{if(e.isTrusted&&[3,4].includes(e.button)&&REV['mouse'+e.button]!==undefined)e.preventDefault()},true);
 addEventListener('auxclick',e=>{if(e.isTrusted&&REV['mouse'+e.button]!==undefined)e.preventDefault()},true);
 function bindKey(id,k){if(k==='escape')return;const old=KB[id];for(const o in KB)if(o!==id&&KB[o]===k){KB[o]=old}KB[id]=k;CAP=null;
  const diff={};for(const i in KB)if(KB[i]!==KDEF[i])diff[i]=KB[i];LS('sq_keys',Object.keys(diff).length?diff:null);rebuild();labels();sfx('talk');draw()}
 // ---------- controller ----------
 const PA=[['R2','Hit, chop, mine, fish (hold to repeat)'],['X','Talk / use (hits if nothing is there)'],['O','Dodge roll'],['SQ','Eat / cook'],['TRI','Build a campfire'],
  ['R1','Bow or wand (hold to repeat)'],['L1','Talk / use on release · with R1: wand ultimate'],['L2','Quests'],['L3','Sprint on / off'],['PAD','Bag'],['R3','Bag (controllers without a touchpad)'],['CREATE','Map']];
 const PDEF={};for(const[n]of PA)PDEF[n]=PADB[n];const OK=new Set(Object.values(PDEF));
 let PM=Object.assign({},PDEF);{const s=LS('sq_pad');if(s)for(const n in s)if(n in PDEF&&OK.has(s[n]))PM[n]=s[n];if(new Set(Object.values(PM)).size!==Object.keys(PM).length)PM=Object.assign({},PDEF)}
 const custom=()=>Object.keys(PDEF).some(n=>PM[n]!==PDEF[n]);
 const pname=i=>(typeof PADBN!=='undefined'&&PADBN[i])||('Button '+i);
 const inGame=()=>!dead&&!(window.SQTS&&SQTS.open)&&!(typeof chessOpen!=='undefined'&&chessOpen)&&!(typeof smOpen!=='undefined'&&smOpen)&&!(typeof navRoot==='function'&&navRoot());
 let CAPHOLD=false;
 const pad=()=>{try{const all=navigator.getGamepads?navigator.getGamepads():[];return(GPI!=null&&all[GPI])||[...all].find(g=>g&&g.connected)||null}catch(e){return null}};
 const down=gp=>gp.buttons.map(b=>!!b&&(b.pressed||b.value>.5));
 const _pp=pollPad;pollPad=function(dt){
  if(CAP&&CAP.kind==='p'){const gp=pad();if(gp){const d=down(gp);if(CAPHOLD){if(!d.some(Boolean))CAPHOLD=false}else{const i=d.findIndex((v,j)=>v&&OK.has(j));
     if(i>=0){bindPad(CAP.id,i);CAPHOLD=true}else if(d[PADB.OPT]){CAP=null;CAPHOLD=true;draw()}}GPPREV=d}return}
  if(CAPHOLD){const gp=pad();if(gp){const d=down(gp);GPPREV=d;if(d.some(Boolean))return}CAPHOLD=false}
  const swap=custom()&&inGame();if(swap)Object.assign(PADB,PM);try{return _pp.apply(this,arguments)}finally{if(swap)Object.assign(PADB,PDEF)}};
 function bindPad(n,i){const old=PM[n];for(const o in PM)if(o!==n&&PM[o]===i)PM[o]=old;PM[n]=i;CAP=null;LS('sq_pad',custom()?PM:null);labels();sfx('talk');draw()}
 // ---------- labels on the on-screen buttons and the help box ----------
 function labels(){try{if(typeof GPON!=='undefined'&&GPON){const L={a:pname(PM.R2),e:BUILD?pname(PM.O):pname(PM.SQ),f:pname(PM.TRI),tk:pname(PM.X),rl:pname(PM.O)};
    for(const id in L){const el=document.getElementById(id);if(!el)continue;const sm=el.querySelector('small');if(sm)sm.textContent=L[id];else el.insertAdjacentHTML('beforeend','<small>'+L[id]+'</small>')}
    if(custom()&&typeof hp!=='undefined'&&hp){const n=k=>pname(PM[k]);hp.innerHTML='<b>Controller</b> (your layout)<br>Left stick / D-pad: move · '+n('L3')+': sprint on/off<br>'+n('R2')+': sword, chop, mine, fish (hold to repeat)<br>Right stick: aim · '+n('R1')+': bow or wand<br>'+n('L1')+' + '+n('R1')+': wand ultimate<br>'+n('X')+': talk, use, read<br>'+n('O')+': dodge roll · '+n('SQ')+': eat · '+n('TRI')+': campfire · '+n('L2')+': quests<br>Options: menu · '+n('CREATE')+': map · '+n('PAD')+': bag<br>Menus: D-pad moves, ✕ picks, ○ back'}}
   else if(isPC){const L={a:kname(KB.hit),e:kname(KB.eat),f:kname(KB.fire),tk:kname(KB.talk),rl:kname(KB.roll)};for(const id in L){const el=document.getElementById(id);const sm=el&&el.querySelector('small');if(sm)sm.textContent=L[id]}
    if(typeof hp!=='undefined'&&hp&&!(typeof GPON!=='undefined'&&GPON)){const mv=[KB.mvu,KB.mvl,KB.mvd,KB.mvr].map(kname).join('');
     hp.innerHTML='<b>Controls</b><br>'+mv+' / arrows: move · '+kname(KB.spr)+': sprint<br>'+kname(KB.hit)+': hit, chop, mine, fish<br>'+kname(KB.eat)+': eat / cook at fire<br>'+kname(KB.fire)+': build campfire<br>'+kname(KB.talk)+' or Enter: talk<br>'+
      kname(KB.bag)+': bag · '+kname(KB.skills)+': skills · '+kname(KB.craft)+': craft · Esc: close<br>'+kname(KB.help)+': hide this help · Options > Controls: change keys'}}}catch(e){}}
 if(typeof gpLabels==='function'){const _gl=gpLabels;gpLabels=function(on){_gl.apply(this,arguments);labels()}}
 if(typeof setActionLabels==='function'){const _sl=setActionLabels;setActionLabels=function(){_sl.apply(this,arguments);labels()}}
 setTimeout(labels,0);
 // ---------- Options > Controls ----------
 const CTAB=34;let VIEW=null;
 {const st=document.createElement('style');st.textContent=`#pn .ctr{display:flex;align-items:center;gap:8px;padding:7px 4px;border-bottom:1px solid #d8e0f0;font-size:14px;color:#404040}
#pn .ctr span{flex:1;min-width:0;line-height:1.3}#pn .ctr b{flex:none;min-width:92px;text-align:center}
#pn .ctc{flex:none;width:auto;padding:7px 12px;border:2px solid #485870;border-radius:6px;background:#fff;color:#304060;font:700 13px var(--pf,inherit);cursor:pointer}`;document.head.appendChild(st)}
 const _oh=optionsHTML;optionsHTML=function(){const h=_oh(),add='<button class="sb ctlb" style="width:100%;margin-top:8px">Controls: keys and buttons</button>',k=h.indexOf('<div class="tl" style="margin-top:22px');return k<0?h+add:h.slice(0,k)+add+h.slice(k)};
 function html(){const gp=typeof GPON!=='undefined'&&GPON,pk=CAP&&CAP.kind==='p',kk=CAP&&CAP.kind==='k';
  let h='<div class="tl">CONTROLS</div><div style="display:flex;gap:6px;margin:4px 0 8px"><button class="sb" data-ct="tab:k" style="flex:1;opacity:'+(VIEW==='k'?1:.55)+'">Keyboard & mouse</button><button class="sb" data-ct="tab:p" style="flex:1;opacity:'+(VIEW==='p'?1:.55)+'">Controller</button><button class="sb" data-ct="tab:t" style="flex:1;opacity:'+(VIEW==='t'?1:.55)+'">Touch</button></div>';
  if(VIEW==='t'){h+=window.SQTOUCH?SQTOUCH.html():''}
  else if(VIEW==='k'){h+='<div class="qc" style="font-size:13px">Tap Change, then press a key (or the middle or side mouse buttons). Taking a key another action uses swaps them. The arrow keys always move; Esc always closes; left click hits and right click shoots.</div>';
   for(const[id,lab]of KA){const w=kk&&CAP.id===id;h+='<div class="ctr"><span>'+esc(lab)+'</span><b style="'+(KB[id]!==KDEF[id]?';color:#b06010':'')+'">'+(w?'Press a key…':esc(kname(KB[id])))+'</b><button class="ctc" data-ct="k:'+id+'">'+(w?'Cancel':'Change')+'</button></div>'}
   h+='<button class="sb" data-ct="kreset" style="width:100%;margin-top:10px">Reset keys to the game\'s own</button>'}
  else{h+='<div class="qc" style="font-size:13px">'+(gp?'Choose Change, then press the button you want for it (Options cancels). Taking a button another action uses swaps them. The stick and D-pad move; Options opens the menu; in menus ✕ picks and ○ goes back as always.':'Connect a controller (press any of its buttons) to change its buttons.')+'</div>';
   for(const[n,lab]of PA){const w=pk&&CAP.id===n;h+='<div class="ctr"><span>'+esc(lab)+'</span><b style="'+(PM[n]!==PDEF[n]?';color:#b06010':'')+'">'+(w?'Press a button…':esc(pname(PM[n])))+'</b>'+(gp?'<button class="ctc" data-ct="p:'+n+'">'+(w?'Cancel':'Change')+'</button>':'')+'</div>'}
   h+='<button class="sb" data-ct="preset" style="width:100%;margin-top:10px">Reset buttons to the game\'s own</button>'}
  return h+'<button class="sb" data-ct="back" style="width:100%">Back to Options</button>'}
 function draw(){if(pnOpen&&ptab===CTAB)rPn()}
 const _r=rPn;rPn=function(){if(ptab===CTAB){try{panelChrome('')}catch(e){}pbd.innerHTML=html();return}return _r.apply(this,arguments)};
 const open=()=>{VIEW=(typeof GPON!=='undefined'&&GPON)?'p':isPC?'k':'t';CAP=null;pnOpen=true;ptab=CTAB;jx=jy=0;pn.style.display='block';rPn();sfx('talk')};
 pbd.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.ctlb')){e.stopPropagation();open()}},true);
 {const _oc=pbd.onclick;pbd.onclick=e=>{if(ptab!==CTAB)return _oc(e);const b=e.target.closest('[data-ct]');if(!b)return;const a=b.dataset.ct;
   if(a.startsWith('tab:')){VIEW=a.slice(4);CAP=null}
   else if(a.startsWith('k:')){const id=a.slice(2);CAP=CAP&&CAP.id===id?null:{kind:'k',id}}
   else if(a.startsWith('p:')){const n=a.slice(2);CAP=CAP&&CAP.id===n?null:{kind:'p',id:n};CAPHOLD=true}
   else if(a==='kreset'){KB=Object.assign({},KDEF);LS('sq_keys',null);rebuild();labels();CAP=null}
   else if(a==='preset'){PM=Object.assign({},PDEF);LS('sq_pad',null);labels();CAP=null}
   else if(a==='back'){CAP=null;ptab=8}
   else if(a.startsWith('t')&&window.SQTOUCH){CAP=null;if(SQTOUCH.act(a)===false)return}
   sfx('talk');rPn()}}
 {const _cp=closePanel;closePanel=function(){CAP=null;return _cp.apply(this,arguments)}}
 window.SQKEYS={get keys(){return KB},get pad(){return PM},KDEF,PDEF,bindKey,bindPad,open,labels}})();
