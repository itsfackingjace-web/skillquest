// ---- 130. Check for updates ----
// Options > "Check for updates" asks the website for the newest copy of the game (skipping every cache) and reads its
// version (the first PATCH_NOTES entry). If it's newer than the one running, an UPDATE NOW button saves your game and
// loads the new version. The game also checks by itself every 10 minutes (and when you come back to the tab), and shows a
// small bar when an update is ready. Only on the website (http/https), never in a saved copy of the file.
(()=>{if(!/^https?:$/.test(location.protocol))return;
 const CUR=window.SQVER||'0',num=v=>String(v||'').split(/[.-]/).map(n=>+n||0),newer=(a,b)=>{const A=num(a),B=num(b);for(let i=0;i<Math.max(A.length,B.length);i++){if((A[i]|0)!==(B[i]|0))return(A[i]|0)>(B[i]|0)}return false};
 const U={st:'',v:null,busy:false,at:0,dismissed:null};
 async function check(){if(U.busy)return U.v;U.busy=true;U.st='checking';draw();
  try{const r=await fetch(location.pathname+'?upd='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(r.status);const t=await r.text();
   const m=t.match(/const PATCH_NOTES=\[\s*\{v:'([0-9.\-]+)'/);if(!m)throw new Error('no version');U.v=newer(m[1],CUR)?m[1]:null;U.st=U.v?'new':'latest'}
  catch(e){U.st='fail'}finally{U.busy=false;U.at=Date.now()}draw();bar();return U.v}
 async function update(){U.st='saving';draw();bar();
  try{saveLocal(true)}catch(e){}try{await Promise.race([saveCloud(true),new Promise(r=>setTimeout(r,2500))])}catch(e){}
  location.replace(location.pathname+'?v='+encodeURIComponent(U.v||Date.now())+location.hash)}
 // after an update the address keeps ?v=...; tidy it away so a bookmark or a share isn't stuck on it
 try{if(/[?&](v|upd)=/.test(location.search))history.replaceState(null,'',location.pathname+location.hash)}catch(e){}
 // ---- Options ----
 function row(){const t=U.st==='checking'?'Checking…':U.st==='latest'?'You have the newest version ('+CUR+').':U.st==='fail'?'Couldn\'t reach the website. Check your connection and try again.':U.st==='saving'?'Saving your game and updating…':U.st==='new'?'Update '+U.v+' is ready!':'You have version '+CUR+'.';
  return'<div class="upd-r"><button class="sb upb" data-up="'+(U.st==='new'?'go':'check')+'" style="width:100%;margin-top:8px'+(U.st==='new'?';background:#f8e8b0':'')+'"'+(U.busy||U.st==='saving'?' disabled':'')+'><b>'+(U.st==='new'?'UPDATE NOW':'Check for updates')+'</b><br><small>'+t+'</small></button></div>'}
 const _oh=optionsHTML;optionsHTML=function(){const h=_oh(),k=h.indexOf('<div class="tl" style="margin-top:22px');return k<0?h+row():h.slice(0,k)+row()+h.slice(k)};
 function draw(){try{if(pnOpen&&ptab===8){const el=pbd.querySelector('.upd-r');if(el)el.outerHTML=row();else rPn()}}catch(e){}}
 pbd.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-up]');if(!b)return;e.stopPropagation();if(b.dataset.up==='go')update();else check()},true);
 // ---- the "update ready" bar ----
 const st=document.createElement('style');st.textContent=`#updbar{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 10px);z-index:32;display:none;align-items:center;gap:8px;padding:8px 10px;max-width:calc(100vw - 24px);background:#f8f0d8;color:#404040;border:3px solid #485870;font:600 13px ${PF}}
#updbar span{flex:1;min-width:0}#updbar button{font:700 13px ${PF};padding:7px 12px;border:3px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer}#updbar .ok{background:#485870;color:#f8f8f8}`;document.head.appendChild(st);
 const el=document.createElement('div');el.id='updbar';el.innerHTML='<span></span><button class="ok">UPDATE</button><button class="no">LATER</button>';document.body.appendChild(el);
 for(const ev of['touchstart','pointerdown','mousedown'])el.addEventListener(ev,e=>e.stopPropagation());
 el.querySelector('.ok').onclick=()=>update();el.querySelector('.no').onclick=()=>{U.dismissed=U.v;bar()};
 function bar(){const show=U.v&&U.dismissed!==U.v&&!(window.SQTS&&SQTS.open)&&!pnOpen&&!menuOpen&&U.st!=='saving';el.style.display=show?'flex':'none';if(show)el.querySelector('span').textContent='Update '+U.v+' is ready.'}
 {const _cp=closePanel;closePanel=function(){const r=_cp.apply(this,arguments);try{bar()}catch(e){}return r}}
 setInterval(()=>{bar();if(!document.hidden&&Date.now()-U.at>10*60e3)check()},60e3);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-U.at>5*60e3)check()});
 setTimeout(()=>{if(!U.at)check()},20e3);
 window.SQUPD={check,update,newer,get state(){return U}}})();
