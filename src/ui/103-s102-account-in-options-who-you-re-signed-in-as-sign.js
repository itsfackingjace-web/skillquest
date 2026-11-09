// ---- 102. Account in Options: who you're signed in as, Sign out, Switch account ----
{const _o=optionsHTML;optionsHTML=function(){const h=_o(),k=h.indexOf('data-o="myname"');const u=window.SQMP&&SQMP.user,E=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const add=u?'<div class="qc" style="font-size:14px;line-height:1.4;padding:10px 12px;margin:8px 0">Signed in as <b style="color:#3058c8">'+E(u.displayName||(typeof myName==='function'?myName():'')||'your account')+'</b>'+(u.email?'<br><small style="opacity:.75">'+E(u.email)+'</small>':'')+'</div><button class="sb mpacct" data-a="out">Sign out</button><button class="sb mpacct" data-a="switch">Switch Google account</button>'
   :'<button class="sb mpacct" data-a="in">Sign in with Google (play online)</button><div class="qc" style="font-size:13px;line-height:1.4;padding:8px 12px;margin:6px 0">Each Google account has its own character and save.</div>';
  const winApp=!window.sqDesktop&&/Windows/.test(navigator.userAgent)?'<a class="sb" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="https://github.com/itsfackingjace-web/skillquest/releases/latest/download/SkillQuest-Setup.exe">Get the Windows app</a>':'';
  if(k<0)return h+'<div class="tl" style="margin-top:16px">ONLINE</div>'+add+winApp;const e=h.indexOf('</button>',k)+9;return h.slice(0,e)+add+winApp+h.slice(e)};
 // sign out exactly the way the chat window's Sign out button does (its code lives with the online code), then wait for it
 const out=async()=>{try{if(typeof saveCloud==='function')await saveCloud(true)}catch(e){}const so=document.getElementById('mpso');if(so)so.click();
  for(let k=0;k<40&&window.SQMP&&SQMP.user;k++)await new Promise(r=>setTimeout(r,75))};
 pbd.addEventListener('click',async ev=>{const b=ev.target.closest('.mpacct');if(!b)return;ev.stopPropagation();const a=b.dataset.a;
  if(a==='in'){mpSignIn();return}b.disabled=true;b.textContent='Signing out...';await out();try{rPn()}catch(e){}
  if(a==='switch'){say('Signed out. Pick the account to play on.');mpSignIn()}},true)}
