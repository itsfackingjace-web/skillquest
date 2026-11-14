// ---- 176. Moderation: report a player, mute, suspend (+ Dev Suite > Moderation) ----
// mod/<uid> = {mu: muted until (ms), ba: suspended until (ms), r: reason, by, t}: written by developers. The rules refuse chat
// and pm from a muted account, and chat, pm, presence and World Market offers from a suspended one; the game also stops a
// suspended player with a full-screen notice (#sqban) and tells a muted one when they try to chat (061's mpSend asks
// SQMOD.blockChat()).
// reports/<id> = {u reported uid, n their name, by, byn, why, x note, loc, t, st status, re}: the player menu's REPORT button.
// The Moderation tab shows reports (with the reported player's recent chat, read from `chat`), recent chat with delete /
// mute / suspend, and everyone currently muted or suspended.
(()=>{const FBx=()=>window.SQFB,uid=()=>window.SQMP&&SQMP.user&&SQMP.user.uid;
 let M=null,on=null;const nowS=()=>Date.now()+((window.SQMP&&SQMP.off)|0);
 const until=t=>{const d=new Date(t);return t>nowS()+3e10?'further notice':d.toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})};
 const muted=()=>M&&M.mu>nowS(),banned=()=>M&&M.ba>nowS();
 function watch(){const F=FBx(),u=uid();if(!F||!u||on===u)return;on=u;const d=F.db;d.onValue(d.ref(F.D,'mod/'+u),s=>{M=s.val();show()},()=>{on=null})}
 setInterval(()=>{try{watch();show()}catch(e){}},3000);
 // suspended: a full-screen notice, and the game stops
 const box=document.createElement('div');box.id='sqban';box.style.cssText='position:fixed;inset:0;z-index:130;display:none;align-items:center;justify-content:center;background:rgba(8,12,24,.86)';
 box.innerHTML='<div style="max-width:420px;margin:12px;background:#f8f8f8;color:#404040;border:4px solid #804848;box-shadow:inset 0 0 0 3px #e0b0b0;padding:16px;font:500 15px '+PF+';text-align:center;line-height:1.4"><div style="font-weight:700;font-size:17px;margin-bottom:8px">ACCOUNT SUSPENDED</div><div id="sqbant"></div></div>';
 document.body.appendChild(box);
 function show(){const b=banned()&&!(window.SQTITLE&&SQTITLE()&&!uid());box.style.display=b?'flex':'none';
  if(b)document.getElementById('sqbant').textContent='This account can\'t play until '+until(M.ba)+'.'+(M.r?' Reason: '+M.r.replace(/[.!?]?$/,'.'):'')+' If you think this is a mistake, ask on the Discord.'}
 {const _u=upd;upd=function(){if(banned())return;return _u.apply(this,arguments)}}
 window.SQMOD={get state(){return M},muted,banned,blockChat(){if(banned()){try{mpLog('game','This account is suspended.')}catch(e){}return true}
   if(muted()){try{mpLog('game','You can\'t chat until '+until(M.mu)+'.'+(M.r?' ('+M.r+')':''))}catch(e){}return true}return false}};
 // ---- REPORT from the player menu (130 adds the button) ----
 const RTAB=40;let RU=null,RN='',RS=0;
 const WHY=[['chat','Rude or hurtful chat'],['cheat','Cheating or using a bug'],['scam','Scamming in a trade'],['name','Bad name'],['other','Something else']];
 window.SQREPORT=(u,n)=>{RU=u;RN=n||'';RS=0;pnOpen=true;ptab=RTAB;pn.style.display='block';rPn()};
 {const _r=rPn;rPn=function(){if(ptab!==RTAB)return _r.apply(this,arguments);try{panelChrome('')}catch(e){}
   pbd.innerHTML=RS?'<div class="tl">THANK YOU</div><div class="qc" style="text-align:center">Your report about '+esc(RN)+' was sent to the developer.</div><div class="pmb"><button class="sb" data-rp="close">CLOSE</button></div>'
    :'<div class="tl">REPORT '+esc(RN).toUpperCase()+'</div><div class="qc" style="font-size:13px">What happened? The developer sees the report and their recent chat.</div><div class="pmb">'+WHY.map(([k,l])=>'<button class="sb" data-rp="'+k+'">'+l+'</button>').join('')+
     '<input id="sqrpx" maxlength="200" placeholder="Anything to add? (optional)" style="width:100%;box-sizing:border-box;margin:6px 0;padding:8px;font:500 14px '+PF+'"><button class="sb" data-rp="close">CANCEL</button></div>'}}
 pbd.addEventListener('click',async e=>{if(ptab!==RTAB)return;const b=e.target.closest('[data-rp]');if(!b)return;e.stopPropagation();e.preventDefault();const k=b.dataset.rp;
  if(k==='close'){closePanel();return}const F=FBx(),me=uid();if(!F||!me){say('Sign in to report.');return}if(RS)return;RS=1;
  const x=(document.getElementById('sqrpx')||{}).value||'';let loc='';try{loc=SCENE&&SCENE.room&&SCENE.room.region||((typeof curRegion==='function')?curRegion():'')}catch(_){}
  try{const d=F.db;await d.push(d.ref(F.D,'reports'),{u:RU,n:String(RN).slice(0,12),by:me,byn:String((typeof PNAME!=='undefined'&&PNAME)||'').slice(0,12),why:k,x:String(x).slice(0,200),loc:String(loc||'').slice(0,40),t:d.serverTimestamp()});sfx('quest')}
  catch(err){RS=0;say('Couldn\'t send the report. Check your connection.');return}rPn()},true);
 // ======================= Dev Suite > Moderation =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,toast,fail}=API;
 const T={v:'rep',rep:null,chat:null,mod:null,lb:null,rf:'open',who:null};
 const D=()=>FBx().db,ref=p=>D().ref(FBx().D,p),get=async p=>(await D().get(ref(p))).val();
 const ago=t=>{const s=(Date.now()-t)/1000;return s<3600?Math.max(1,Math.round(s/60))+' min ago':s<86400*2?Math.round(s/3600)+' h ago':Math.round(s/86400)+' days ago'};
 async function load(){T.busy=1;API.draw();try{const d=D();const[rep,mod,lb,ch]=await Promise.all([get('reports'),get('mod'),get('lb'),d.get(d.query(ref('chat'),d.limitToLast(300)))]);
   T.rep=rep||{};T.mod=mod||{};T.lb=lb||{};T.chat=Object.entries(ch.val()||{}).map(([id,v])=>({id,...v})).filter(m=>m&&m.m).sort((a,b)=>(b.t||0)-(a.t||0))}catch(e){fail(e);T.rep=T.rep||{};T.mod=T.mod||{};T.lb=T.lb||{};T.chat=T.chat||[]}T.busy=0;API.draw()}
 const nm=u=>T.lb&&T.lb[u]&&T.lb[u].n||(T.chat||[]).find(m=>m.u===u)?.n||String(u).slice(0,8);
 const st=u=>{const m=(T.mod||{})[u]||{},n=Date.now(),o=[];if(m.ba>n)o.push('🚫 suspended until '+until(m.ba));if(m.mu>n)o.push('🔇 muted until '+until(m.mu));return o.join(' · ')};
 const acts=u=>'<span class="dv-row" style="flex-wrap:wrap;gap:4px"><button class="dv-b" data-md="mu:'+E(u)+':1">Mute 1 h</button><button class="dv-b" data-md="mu:'+E(u)+':24">Mute 1 day</button><button class="dv-b dv-bad" data-md="ba:'+E(u)+':168">Suspend 7 days</button><button class="dv-b dv-bad" data-md="ba:'+E(u)+':876000">Suspend for good</button>'+(((T.mod||{})[u]||{}).mu>Date.now()||((T.mod||{})[u]||{}).ba>Date.now()?'<button class="dv-b" data-md="clr:'+E(u)+'">Lift</button>':'')+'</span>';
 const chatOf=u=>(T.chat||[]).filter(m=>m.u===u).slice(0,12);
 const WN=Object.fromEntries(WHY);
 function repView(){const L=Object.entries(T.rep).filter(([,r])=>r&&r.t).sort((a,b)=>b[1].t-a[1].t),open=([,r])=>!r.st;
  const sh=L.filter(x=>T.rf==='all'||(T.rf==='open'?open(x):!open(x)));
  let h='<div class="dv-row" style="flex-wrap:wrap">'+[['open','Open'],['done','Handled'],['all','All']].map(([k,n])=>'<button class="dv-b'+(T.rf===k?' dv-tl dv-on':'')+'" data-md="rf:'+k+'">'+n+' ('+L.filter(x=>k==='all'||(k==='open'?open(x):!open(x))).length+')</button>').join('')+'</div>';
  for(const[id,r]of sh){const c=chatOf(r.u);h+='<div class="dv-card" style="margin:8px 0"><div class="dv-row" style="flex-wrap:wrap"><b>'+E((T.lb&&T.lb[r.u]&&T.lb[r.u].n)||r.n||nm(r.u))+'</b><span class="dv-mut">reported by '+E(r.byn||nm(r.by))+' · '+ago(r.t)+(r.loc?' · '+E(r.loc):'')+'</span>'+(r.st?'<span style="color:#7c6">✔ '+E(r.st)+'</span>':'')+'</div>'+
   '<p style="margin:6px 0">'+E(WN[r.why]||r.why)+(r.x?': “'+E(r.x)+'”':'')+'</p>'+(st(r.u)?'<p class="dv-mut">'+st(r.u)+'</p>':'')+
   '<details><summary class="dv-mut">Their recent chat ('+c.length+')</summary>'+(c.map(m=>'<div style="font-size:13px">'+E(m.m)+' <small class="dv-mut">'+ago(m.t)+'</small></div>').join('')||'<p class="dv-mut">Nothing in the last 300 messages.</p>')+'</details>'+
   '<div style="margin-top:6px">'+acts(r.u)+'</div><div class="dv-row" style="margin-top:6px"><button class="dv-b" data-md="rst:'+id+':'+(r.st?'':'handled')+'">'+(r.st?'Reopen':'Mark handled')+'</button>'+(r.st?'':'<button class="dv-b" data-md="rst:'+id+':no action">No action needed</button>')+'</div></div>'}
  return h+(sh.length?'':'<p class="dv-mut">Nothing here.</p>')}
 function chatView(){let h='<p class="dv-mut">The last '+T.chat.length+' messages in public chat, newest first.</p>';
  for(const m of T.chat.slice(0,300)){h+='<div class="dv-hl" style="flex-wrap:wrap"><span><b>'+E(m.n||nm(m.u))+'</b> '+E(m.m)+' <small class="dv-mut">'+(m.t?ago(m.t):'')+'</small>'+(st(m.u)?' <small>'+st(m.u)+'</small>':'')+'</span><span class="dv-row" style="gap:4px"><button class="dv-b" data-md="del:'+E(m.id)+'">Delete</button><button class="dv-b" data-md="who:'+E(m.u)+'">…</button></span>'+(T.who===m.u?'<div style="width:100%;margin-top:4px">'+acts(m.u)+'</div>':'')+'</div>'}
  return h}
 function modView(){const L=Object.entries(T.mod).filter(([,m])=>m&&(m.mu>Date.now()||m.ba>Date.now()));
  return'<p class="dv-mut">Accounts muted or suspended right now.</p>'+(L.map(([u,m])=>'<div class="dv-hl" style="flex-wrap:wrap"><span><b>'+E(nm(u))+'</b> '+st(u)+(m.r?' <small class="dv-mut">('+E(m.r)+')</small>':'')+'</span><button class="dv-b" data-md="clr:'+E(u)+'">Lift</button></div>').join('')||'<p class="dv-mut">Nobody.</p>')}
 function render(){if(!T.rep){if(!T.busy)load();return'<p class="dv-mut">Loading…</p>'}const n=Object.values(T.rep).filter(r=>r&&!r.st).length;
  return'<div class="dv-row" style="flex-wrap:wrap;margin-bottom:8px">'+[['rep','🚩 Reports'+(n?' ('+n+')':'')],['chat','💬 Recent chat'],['mod','🛡 Muted & suspended']].map(([k,l])=>'<button class="dv-b'+(T.v===k?' dv-tl dv-on':'')+'" data-md="v:'+k+'">'+l+'</button>').join('')+'<button class="dv-b" data-md="reload">↻ Refresh</button></div>'+
   (T.v==='rep'?repView():T.v==='chat'?chatView():modView())}
 document.addEventListener('click',async e=>{if(S.tab!=='mod')return;const t=e.target.closest('[data-md]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();e.stopPropagation();
  const[a,b,c]=t.dataset.md.split(':');
  try{if(a==='v'){T.v=b}else if(a==='rf'){T.rf=b}else if(a==='reload'){T.rep=null}else if(a==='who'){T.who=T.who===b?null:b}
   else if(a==='del'){await D().set(ref('chat/'+b),null);T.chat=T.chat.filter(m=>m.id!==b);toast('Message deleted.')}
   else if(a==='rst'){await D().update(ref('reports/'+b),{st:c||null});T.rep[b].st=c||undefined;toast(c?'Marked '+c+'.':'Reopened.')}
   else if(a==='mu'||a==='ba'){const r=(prompt('Reason (shown to them, optional):','')||'').slice(0,120);const o={...(T.mod[b]||{}),[a]:Date.now()+(+c)*3600e3,by:uid(),t:Date.now()};if(r)o.r=r;else delete o.r;
    await D().set(ref('mod/'+b),o);T.mod[b]=o;toast(nm(b)+(a==='mu'?' muted.':' suspended.'))}
   else if(a==='clr'){await D().set(ref('mod/'+b),null);delete T.mod[b];toast('Lifted for '+nm(b)+'.')}}catch(e2){fail(e2)}API.draw()},true);
 SQSUITE.addTab('mod','Moderation',{render});
 window.SQMODADMIN={load}})();
