// ---- 217. Delete my account, the Terms / Privacy / Refund links, and clearing out old data ----
// Options > ACCOUNT gets "Delete my account" (an inline card: type DELETE, then confirm). It stops all saving (`STOP`),
// deletes the account's records the rules let the owner delete (saves, bak, presence, lb, profiles, houses, yards, build,
// friends, trust, sess, the claimed name, the pm inbox one message at a time), tries Firebase Auth's deleteUser (needs a recent
// sign-in; the data is gone either way), signs out, clears this device's sq_* storage and reloads. A guild member must leave
// the guild first. The title screen and Options link to terms.html / privacy.html / refund.html (repo root, not built).
// Retention (what privacy.html promises): your own pm inbox is cleared of messages older than 90 days when you sign in; a
// developer's game, once a day (localStorage sq_prune_day), removes public chat older than 90 days, bug and player reports
// older than a year, and daily play-time days older than a year (rules: devs may delete bugs and stats/d days).
(()=>{const DAY=864e5;const mp=()=>window.SQMP,F=()=>window.SQFB;
 // ---- links ----
 const LINKS='<a href="terms.html" target="_blank" rel="noopener">Terms</a> · <a href="privacy.html" target="_blank" rel="noopener">Privacy</a> · <a href="refund.html" target="_blank" rel="noopener">Refunds</a>';
 {const st=document.createElement('style');st.textContent=`#sqlegal{position:absolute;left:0;right:0;bottom:max(6px,env(safe-area-inset-bottom,0px));text-align:center;font:600 12px ${PF};color:#e8e8e0;text-shadow:0 1px 2px #000;z-index:5;pointer-events:none}
#sqlegal a{color:inherit;pointer-events:auto;padding:4px}#pn .acdel{background:#a83232;color:#fff;border-color:#601818}#pn .acc{border:3px solid #a83232;padding:12px;margin:8px 0;background:#fff4f0;color:#402020;font:500 15px/1.45 ${PF}}
#pn .acc input{width:100%;box-sizing:border-box;font:600 16px ${PF};padding:8px;margin:8px 0;border:2px solid #a83232;background:#fff;color:#303030}#pn .aclinks{font:500 14px ${PF};margin:8px 0}#pn .aclinks a{color:#3058c8}`;document.head.appendChild(st)}
 {const ts=document.getElementById('sqts');if(ts){const d=document.createElement('div');d.id='sqlegal';d.innerHTML=LINKS;for(const ev of['touchstart','pointerdown','mousedown'])d.addEventListener(ev,e=>{if(e.target.closest('a'))e.stopPropagation()});ts.appendChild(d)}}
 // ---- Options ----
 let card=0;   // 0 = closed, 1 = asking, 2 = working
 {SQOPTS.wrap('209',_o=>function(){let h=_o();const u=mp()&&mp().user;
   let add='<div class="tl" style="margin-top:16px">ABOUT</div><div class="aclinks">'+LINKS+'</div>';
   if(u){add+=card===0?'<button class="sb acdel" data-acd="open">Delete my account</button>':
    card===1?'<div class="acc" role="dialog" aria-label="Delete my account"><b>Delete your account?</b><br>This deletes your character, save, backups, houses, friends and leaderboard entry for good. It can\'t be undone.<label for="acdin" style="display:block;margin-top:8px">Type DELETE to confirm</label><input id="acdin" autocomplete="off" spellcheck="false"><button class="sb acdel" data-acd="go">DELETE FOREVER</button><button class="sb" data-acd="cancel" aria-label="Close">Cancel</button></div>':
    '<div class="acc">Deleting your account...</div>'}
   return h+add})}
 pbd.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-acd]');if(!b)return;e.stopPropagation();e.preventDefault();const a=b.dataset.acd;
  if(a==='open'){if(window.SQGUILD&&SQGUILD.id){say('Leave your guild first (START > Guild), then delete your account.');return}card=1;rPn();setTimeout(()=>{const i=document.getElementById('acdin');if(i)i.focus()},30)}
  else if(a==='cancel'){card=0;rPn()}
  else if(a==='go'){const i=document.getElementById('acdin');if(!i||i.value.trim().toUpperCase()!=='DELETE'){say('Type DELETE in the box to confirm.');return}card=2;rPn();wipe()}},true);
 {SQCLOSEPN.before('209',()=>{if(card!==2)card=0;})}
 // ---- deleting ----
 let STOP=false;
 for(const k of['saveLocal','saveCloud']){const f=window[k];if(typeof f!=='function')continue;const w=function(){if(STOP)return Promise.resolve();return f.apply(this,arguments)};window[k]=w}
 async function wipe(){const m=mp(),Fb=F();if(!m||!m.user||!Fb){say('Sign in first.');card=0;rPn();return}
  const u=m.user.uid,db=Fb.db,D=Fb.D,R=p=>db.ref(D,p);STOP=true;const failed=[];
  const rm=async p=>{try{await db.remove(R(p))}catch(e){failed.push(p)}};
  try{const s=await db.get(R('pm/'+u));const v=s.val()||{};const up={};for(const id of Object.keys(v))up['pm/'+u+'/'+id]=null;if(Object.keys(up).length)await db.update(db.ref(D),up).catch(async()=>{for(const p of Object.keys(up))await rm(p)})}catch(e){self.SQERR&&SQERR(e,'209-1')}
  try{const n=(typeof PNAME!=='undefined'&&PNAME)||'';if(n){const key=String(n).trim().toLowerCase().replace(/[.#$\[\]\/]/g,'_').slice(0,12);const s=await db.get(R('names/'+key));if(s.val()===u)await rm('names/'+key)}}catch(e){self.SQERR&&SQERR(e,'209-2')}
  for(const p of['presence','lb','profiles','houses','yards','build','friends','trust','bak','saves','sess'])await rm(p+'/'+u);
  try{const A=Fb.auth;if(A&&A.deleteUser&&Fb.A.currentUser)await A.deleteUser(Fb.A.currentUser)}catch(e){self.SQERR&&SQERR(e,'209-3')}
  try{const so=document.getElementById('mpso');if(so)so.click()}catch(e){self.SQERR&&SQERR(e,'209-4')}
  try{for(const k of Object.keys(localStorage))if(/^sq_|^hw_|^sq/.test(k))localStorage.removeItem(k)}catch(e){self.SQERR&&SQERR(e,'209-5')}
  try{say(failed.length?'Your account was deleted, except '+failed.join(', ')+'. Report a bug and we\'ll finish it.':'Your account has been deleted.')}catch(e){self.SQERR&&SQERR(e,'209-6')}
  setTimeout(()=>{try{location.reload()}catch(e){self.SQERR&&SQERR(e,'209-7')}},2500)}
 // ---- clearing out old data ----
 let pmDone='';
 async function prune(){const m=mp(),Fb=F();if(!m||!m.on||!m.user||!Fb)return;const u=m.user.uid,db=Fb.db,D=Fb.D,R=p=>db.ref(D,p),now=Date.now();
  if(pmDone!==u){pmDone=u;try{const s=await db.get(db.query(R('pm/'+u),db.orderByKey(),db.limitToFirst(200)));const v=s.val()||{};for(const[id,x]of Object.entries(v))if(x&&typeof x.t==='number'&&x.t<now-90*DAY)db.remove(R('pm/'+u+'/'+id)).catch(()=>{})}catch(e){self.SQERR&&SQERR(e,'209-8')}}
  let isDev=false;try{isDev=(await db.get(R('devs/'+u))).val()===true}catch(e){self.SQERR&&SQERR(e,'209-9')}if(!isDev)return;
  const today=new Date(now).toISOString().slice(0,10);try{if(localStorage.getItem('sq_prune_day')===today)return;localStorage.setItem('sq_prune_day',today)}catch(e){self.SQERR&&SQERR(e,'209-10')}
  const old=async(path,days)=>{try{const s=await db.get(db.query(R(path),db.orderByKey(),db.limitToFirst(300)));const v=s.val()||{};let n=0;for(const[id,x]of Object.entries(v))if(x&&typeof x.t==='number'&&x.t<now-days*DAY){n++;db.remove(R(path+'/'+id)).catch(()=>{})}return n}catch(e){return 0}};
  await old('chat',90);await old('bugs',365);await old('reports',365);await old('errs',365);
  try{const cut=new Date(now-365*DAY).toISOString().slice(0,10);const s=await db.get(db.query(R('stats/d'),db.orderByKey(),db.endAt(cut),db.limitToFirst(40)));for(const day of Object.keys(s.val()||{}))if(day<cut)db.remove(R('stats/d/'+day)).catch(()=>{})}catch(e){self.SQERR&&SQERR(e,'209-11')}}
 setInterval(()=>{prune().catch(()=>{})},60000);setTimeout(()=>{prune().catch(()=>{})},15000);
 window.SQACCOUNT={wipe,prune,get stopped(){return STOP}}})();
