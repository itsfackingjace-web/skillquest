// ---- 156. Controllers everywhere: popups, every control, and a Pokemon-style keyboard ----
// - Requests that pop up while you play (trade 062 #trpop, party 136 #ptpop, duel/chess 130 #dlpop, the update bar 125
//   #updbar) and the account boxes (#sqlost, 072's #sqsess) become the controller's screen (023's navRoot) half a second after
//   they appear (so a ✕ you were already pressing can't accept by accident): ✕ picks, ○ = its NO / LATER button.
// - Menus reach every control (023's navItems only took buttons and inputs): text boxes, dropdowns (✕ = next choice) and
//   checkboxes (✕ ticks).
// - Text boxes open an on-screen keyboard instead of the device's own (#sqosk): D-pad / stick move, ✕ types the key,
//   ○ deletes (closes it when empty, nothing changed), △ space, □ upper/lower case, R1 symbols, Options = OK. Number
//   boxes get digits only. OK writes the text into the box (input/change events); a one-line box in a form (chat, a name)
//   is sent, like pressing Enter.
// The keyboard's own buttons are taken in our pollPad wrapper before 023's (marked as held in GPPREV, so 023 ignores them).
(()=>{const vis=e=>!!(e&&e.isConnected&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'&&e.getBoundingClientRect().width>0);
 const $=id=>document.getElementById(id),POPS=['trpop','ptpop','dlpop','updbar'],BOX=['sqlost','sqsess'],since={};
 setInterval(()=>{const t=performance.now();for(const id of POPS)if(vis($(id))){if(!since[id])since[id]=t}else delete since[id]},100);
 const popRoot=()=>{if(!GPON)return null;for(const id of BOX){const e=$(id);if(vis(e))return e}const t=performance.now();for(const id of POPS){const e=$(id);if(vis(e)&&since[id]&&t-since[id]>500)return e}return null};
 // ---- the keyboard ----
 const PAGES={up:['ABCDEFGHIJ','KLMNOPQRST','UVWXYZ.,\'-','1234567890'],lo:['abcdefghij','klmnopqrst','uvwxyz.,\'-','1234567890'],sym:['!?:;"()/&+','@#%*=_<>[]','~^$€£{}|\\`','1234567890'],num:['123','456','789','0']};
 const K={open:false,el:null,buf:'',page:'up',num:false,max:0,lbl:''};
 const box=document.createElement('div');box.id='sqosk';document.body.appendChild(box);
 const st=document.createElement('style');st.textContent=`#sqosk{position:fixed;inset:0;z-index:300;display:none;align-items:flex-end;justify-content:center;background:rgba(8,12,24,.55)}
#sqosk .kb{width:min(100%,640px);margin:0 6px calc(env(safe-area-inset-bottom,0px) + 8px);background:#f8f8f8;border:4px solid #485870;box-shadow:inset 0 0 0 3px #a8c0e0;padding:10px;box-sizing:border-box;font:700 16px ${typeof PF!=='undefined'?PF:'monospace'};color:#404040}
#sqosk .kl{font-size:12px;letter-spacing:1px;color:#3058c8;margin-bottom:4px}#sqosk .kf{background:#fff;border:3px solid #485870;padding:8px 10px;min-height:22px;font-size:18px;word-break:break-all;white-space:pre-wrap}
#sqosk .kf i{display:inline-block;width:10px;height:3px;background:#404040;margin-left:1px;animation:kbl 1s steps(2) infinite}@keyframes kbl{50%{opacity:0}}
#sqosk .kg{display:grid;gap:4px;margin-top:8px}#sqosk button{font:700 16px inherit;font-family:inherit;padding:8px 0;background:#fff;border:2px solid #a8b8d0;color:#404040;min-width:0}
#sqosk .kr{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:6px}#sqosk .kr button{font-size:12px}#sqosk .kh{font-size:11px;font-weight:500;opacity:.7;margin-top:6px;text-align:center}
#sqosk button.gpf{background:#f8e0a8}#sqosk .kc{font-size:11px;font-weight:500;opacity:.6;text-align:right}`;document.head.appendChild(st);
 for(const ev of['touchstart','pointerdown','mousedown','keydown','keyup'])box.addEventListener(ev,e=>e.stopPropagation());
 const esc2=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 function draw(keep){const rows=PAGES[K.num?'num':K.page],cols=rows[0].length;
  box.innerHTML='<div class="kb"><div class="kl">'+esc2(K.lbl)+'</div><div class="kf">'+esc2(K.buf)+'<i></i></div>'+(K.max?'<div class="kc">'+K.buf.length+' / '+K.max+'</div>':'')+
   '<div class="kg" style="grid-template-columns:repeat('+cols+',1fr)">'+rows.map(r=>[...r].map(c=>'<button data-ch="'+esc2(c)+'">'+esc2(c)+'</button>').join('')).join('')+'</div>'+
   '<div class="kr">'+(K.num?'':'<button data-op="case">'+(K.page==='up'?'abc':'ABC')+'</button><button data-op="sym">'+(K.page==='sym'?'ABC':'#+=')+'</button><button data-op="space">SPACE</button>')+'<button data-op="del">DEL</button><button data-op="ok">OK</button></div>'+
   '<div class="kh">✕ type · ○ delete · '+(K.num?'':'△ space · □ abc/ABC · R1 symbols · ')+'Options OK</div></div>';
  if(keep){const b=[...box.querySelectorAll('button')].find(x=>(x.dataset.ch||x.dataset.op)===keep);if(b)setFocus(b)}}
 const typeCh=c=>{if(K.max&&K.buf.length>=K.max)return;K.buf+=c;if(K.page==='up'&&!K.num&&K.buf.length===1&&/[A-Z]/.test(c)){}draw(c)};
 function op(o,keep){if(o==='del')K.buf=K.buf.slice(0,-1);else if(o==='space'){if(!K.num)typeCh(' ');return}else if(o==='case')K.page=K.page==='up'?'lo':'up';else if(o==='sym')K.page=K.page==='sym'?'up':'sym';else if(o==='ok'){done(true);return}
  draw(keep||o)}
 box.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.ch!=null)typeCh(b.dataset.ch);else op(b.dataset.op)});
 function open(el){K.open=true;K.el=el;K.num=el.type==='number'||el.inputMode==='numeric';K.buf=String(el.value||'');K.max=el.maxLength>0?el.maxLength:0;K.page=K.buf&&/[a-z]$/.test(K.buf)?'lo':'up';
  const lab=el.labels&&el.labels[0]?el.labels[0].textContent:el.getAttribute('aria-label')||el.placeholder||'';K.lbl=String(lab).trim().slice(0,40).toUpperCase()||'TYPE';
  box.style.display='flex';draw();const f=box.querySelector('button');if(f)setFocus(f);try{sfx('talk')}catch(e){}}
 function done(ok){const el=K.el;K.open=false;box.style.display='none';box.innerHTML='';K.el=null;if(!el)return;
  if(ok){let v=K.buf;if(K.num){const n=parseFloat(v);v=isFinite(n)?String(n):el.value}el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
   if(el.tagName==='INPUT'&&el.type!=='number'&&el.form&&v){try{el.form.requestSubmit?el.form.requestSubmit():el.form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))}catch(e){}}}
  setTimeout(()=>{const r=navRoot();if(r&&r.contains(el)&&navItems(r).includes(el))setFocus(el);else setFocus(null)},0);try{sfx(ok?'pickup':'swish')}catch(e){}}
 window.SQOSK={open,done,state:K};
 // ---- 023's controller code: where the highlight lives, what it can reach, what ✕ does ----
 {const _nr=navRoot;navRoot=function(){if(K.open)return box;return popRoot()||_nr()}}
 {const _ni=navItems;navItems=function(root){const base=_ni(root);if(!root||root===box)return base;
   const more=[...root.querySelectorAll('textarea,select')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'&&!e.disabled});
   if(!more.length)return base;const all=new Set(base.concat(more));return[...root.querySelectorAll('button,input,textarea,select')].filter(e=>all.has(e))}}
 const texty=e=>e&&(e.tagName==='TEXTAREA'||e.tagName==='INPUT'&&/^(text|search|number|email|url|tel|password|)$/.test(e.type||''));
 {const _np=navPress;navPress=function(){const el=GPF;if(GPON&&el&&!el.disabled){
    if(texty(el)){open(el);return}
    if(el.tagName==='INPUT'&&(el.type==='checkbox'||el.type==='radio')){el.click();el.dispatchEvent(new Event('change',{bubbles:true}));try{sfx('talk')}catch(e){}return}
    if(el.tagName==='SELECT'){const n=el.options.length;if(n){el.selectedIndex=(el.selectedIndex+1)%n;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));try{sfx('talk')}catch(e){}}return}}
   return _np.apply(this,arguments)}}
 // ---- the keyboard's own buttons, and ○ on popups (taken before 023 sees them) ----
 const B={X:0,O:1,SQ:2,TRI:3,L1:4,R1:5,OPT:9};let prev=[];
 {const _pp=pollPad;pollPad=function(dt){let gp=null;try{const a=navigator.getGamepads?navigator.getGamepads():[];gp=(GPI!=null&&a[GPI])||[...a].find(g=>g&&g.connected)||null}catch(e){}
   if(gp&&GPON){const down=i=>!!(gp.buttons[i]&&(gp.buttons[i].pressed||gp.buttons[i].value>.5)),pr=i=>down(i)&&!prev[i]&&!GPPREV[i],take=i=>{GPPREV[i]=true};
    if(K.open){if(pr(B.O)){take(B.O);if(K.buf)op('del',GPF&&(GPF.dataset.ch||GPF.dataset.op));else done(false)}
     if(pr(B.TRI)&&!K.num){take(B.TRI);op('space')}if(pr(B.SQ)&&!K.num){take(B.SQ);op('case',GPF&&(GPF.dataset.ch||GPF.dataset.op))}
     if(pr(B.R1)&&!K.num){take(B.R1);op('sym',GPF&&(GPF.dataset.ch||GPF.dataset.op))}if(pr(B.OPT)){take(B.OPT);done(true)}if(down(B.L1))take(B.L1)}
    else{const r=popRoot();if(r&&pr(B.O)){take(B.O);const no=r.querySelector('.no');if(no)no.click()}if(r&&pr(B.OPT))take(B.OPT)}
    prev=gp.buttons.map(b=>b.pressed||b.value>.5)}
   return _pp.apply(this,arguments)}}
 // a keyboard or a tap closes the on-screen keyboard (keeping what was typed so far in it is not wanted: nothing changes)
 addEventListener('keydown',e=>{if(K.open&&e.isTrusted&&!GPON)done(false)},true)})();
