// ---- 227. Moderators: players the developers trust to moderate chat and private messages ----
// mods/<uid> = true, written by developers only (from the Moderators tab of this panel). A moderator must be an adult account
// (age/<uid>/b 'a'); the database rules check both. Moderators (and developers) get the Moderation panel (ptab 49, Options >
// MODERATION, or /mod in chat): open reports, recent public chat (delete), private messages (pm/*, readable by moderators and
// developers), mute 1 h / 24 h / 7 days, suspend 24 h / 7 days, lift. A moderator can't touch a developer or another moderator,
// or change a mute/suspension longer than 7 days (one set by a developer). Every action and every private-message view writes
// modlog/<id> {by,a,u,x,t} (create-only, developers read it in the Log tab). Players see a line in the Private chat tab saying
// moderators can read private messages. Guild chat tab: guilds from glb, gchat/<g> (moderators/devs may read and delete). Rules: mods, mod, reports, chat, pm, age, modlog (publish them).
(()=>{const F=()=>window.SQFB,me=()=>window.SQMP&&SQMP.user&&SQMP.user.uid,isDev=()=>!!(window.SQDEV&&SQDEV());
 let MOD=false,watching=null;const TAB=49,DAY=864e5,WEEK=7*DAY;
 const db=()=>F().db,ref=p=>db().ref(F().D,p),get=async p=>(await db().get(ref(p))).val();
 function watch(){const f=F(),u=me();if(!f||!u||watching===u)return;watching=u;
  db().onValue(ref('mods/'+u),s=>{MOD=s.val()===true},()=>{MOD=false})}
 setInterval(()=>{try{watch()}catch(e){self.SQERR&&SQERR(e,'219-1')}},3000);
 const can=()=>MOD||isDev();
 window.SQMODS={get on(){return can()},get isMod(){return MOD},open:()=>openP()};
 // ---- notice in the Private chat tab ----
 setInterval(()=>{try{const t=document.querySelector('#mpchat .tb.on[data-t="pm"],#mpchat .tb.on[data-t="gd"]'),l=document.getElementById('mpl');if(!t||!l||l.querySelector('.mdpn'))return;
   const d=document.createElement('div');d.className='mdpn';d.style.cssText='font-size:11px;opacity:.7;padding:2px 4px 4px';d.textContent='Moderators can read private messages and guild chat to keep players safe. Never share personal information.';l.prepend(d)}catch(e){self.SQERR&&SQERR(e,'219-2')}},700);
 // ---- entry points ----
 {SQOPTS.wrap('219',_o=>function(){const h=_o.apply(this,arguments);return can()?h+'<div class="dv-tl" style="margin-top:16px">MODERATION</div><button class="sb mdpopen">Moderation</button>':h})}
 pbd.addEventListener('click',e=>{if(e.target.closest('.mdpopen')){e.stopPropagation();e.preventDefault();openP()}},true);
 if(typeof window.mpSend==='function'){const _ms=window.mpSend;window.mpSend=function(t){if(/^\/mod\s*$/i.test(String(t||'').trim())){if(can())openP();else try{SQMPLOG('game','Only moderators can use /mod.')}catch(e){self.SQERR&&SQERR(e,'219-3')}return}return _ms.apply(this,arguments)}}
 // ---- the panel ----
 const V={v:'rep',busy:0,rep:{},chat:[],gl:{},gid:null,gch:null,mod:{},lb:{},pm:null,pmQ:'',pmU:null,mods:{},log:[],ages:{},why:''};
 const esc2=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const nm=u=>(V.lb[u]&&V.lb[u].n)||String(u).slice(0,8),now=()=>Date.now()+((window.SQMP&&SQMP.off)|0);
 const ago=t=>{const s=(now()-t)/1000;return s<3600?Math.max(1,Math.round(s/60))+'m':s<172800?Math.round(s/3600)+'h':Math.round(s/86400)+'d'};
 const until=t=>new Date(t).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
 const status=u=>{const m=V.mod[u]||{},o=[];if(m.ba>now())o.push('🚫 suspended until '+until(m.ba));if(m.mu>now())o.push('🔇 muted until '+until(m.mu));return o.join(' · ')};
 const prot=u=>!!(V.mods[u])||u===me();
 const kid=u=>V.ages[u]==='c'?' <span class="mdptag">under 13</span>':'';
 function log(a,u,x){try{db().push(ref('modlog'),{by:me(),a,u:String(u||'').slice(0,63),x:String(x||'').slice(0,200),t:db().serverTimestamp()})}catch(e){self.SQERR&&SQERR(e,'219-4')}}
 async function ages(us){for(const u of us)if(!(u in V.ages)){V.ages[u]=null;try{const a=await get('age/'+u+'/b');V.ages[u]=a}catch(e){self.SQERR&&SQERR(e,'219-5')}}}
 async function load(){V.busy=1;draw();try{const d=db();const[rep,mod,lb,ch,gl]=await Promise.all([get('reports'),get('mod'),get('lb'),d.get(d.query(ref('chat'),d.limitToLast(150))),get('glb').catch(()=>null)]);V.gl=gl||{};
   V.rep=rep||{};V.mod=mod||{};V.lb=lb||{};V.chat=Object.entries(ch.val()||{}).map(([id,v])=>({id,...v})).filter(m=>m&&m.m).sort((a,b)=>(b.t||0)-(a.t||0));
   if(isDev()){V.mods=(await get('mods'))||{};const l=(await get('modlog'))||{};V.log=Object.values(l).sort((a,b)=>(b.t||0)-(a.t||0)).slice(0,200)}
   else V.mods={}}catch(e){console.warn('mod load',e);try{say('Moderation: '+(e.message||e))}catch(_){self.SQERR&&SQERR(_,'219-6')}}V.busy=0;draw()}
 function openP(){if(!can())return;try{if(menuOpen)closeMenu()}catch(e){self.SQERR&&SQERR(e,'219-7')}pnOpen=true;ptab=TAB;pn.style.display='block';V.v=V.v||'rep';draw();load()}
 function acts(u){if(!u||prot(u)&&!isDev())return '';const s=status(u);return '<div class="mdpacts">'+(s?'<small>'+s+'</small><br>':'')+
  [['mu1','Mute 1h'],['mu24','Mute 24h'],['mu7','Mute 7d'],['ba1','Suspend 24h'],['ba7','Suspend 7d'],['lift','Lift']].map(([k,l])=>'<button class="sb mdpb" data-md="'+k+':'+u+'">'+l+'</button>').join('')+'</div>'}
 function draw(){if(ptab!==TAB||!pnOpen)return;try{panelChrome('')}catch(e){self.SQERR&&SQERR(e,'219-8')}
  const tabs=[['rep','Reports'],['chat','Chat'],['pm','Private messages'],['gchat','Guild chat'],['act','Muted']];if(isDev())tabs.push(['mods','Moderators'],['log','Log']);
  let h='<div class="tl">MODERATION</div><div class="mdptabs">'+tabs.map(([k,l])=>'<button class="sb'+(V.v===k?' mdpon':'')+'" data-mdt="'+k+'">'+l+'</button>').join('')+'</div>';
  h+='<input id="mdpwhy" maxlength="100" placeholder="Reason (shown to the player)" value="'+esc2(V.why)+'" style="width:100%;box-sizing:border-box;margin:4px 0;padding:6px;font:500 13px '+PF+'">';
  if(V.busy)h+='<div class="qc">Loading…</div>';
  else if(V.v==='rep'){const L=Object.entries(V.rep).map(([id,r])=>({id,...r})).filter(r=>r.st!=='done').sort((a,b)=>(b.t||0)-(a.t||0));
   h+=L.length?L.map(r=>'<div class="qc mdprow"><b>'+esc2(r.n||nm(r.u))+'</b>'+kid(r.u)+' <small>reported by '+esc2(r.byn||nm(r.by))+' · '+esc2(r.why)+' · '+ago(r.t)+(r.loc?' · '+esc2(r.loc):'')+'</small>'+(r.x?'<div>"'+esc2(r.x)+'"</div>':'')+(r.m?'<div class="mdpq">'+esc2(r.m).slice(0,800)+'</div>':'')+
    '<div><button class="sb mdpb" data-md="pmof:'+r.u+'">Their messages</button><button class="sb mdpb" data-md="done:'+r.id+'">Mark handled</button></div>'+acts(r.u)+'</div>').join(''):'<div class="qc">No open reports.</div>'}
  else if(V.v==='chat'){h+=V.chat.slice(0,100).map(m=>'<div class="qc mdprow"><b>'+esc2(m.n)+'</b>'+kid(m.u)+' <small>'+ago(m.t)+'</small><div>'+esc2(m.m)+(typeof m.r==='string'?'<br><small style="opacity:.75">As typed (shown only to adults with the chat filter off): '+esc2(m.r)+'</small>':'')+'</div><button class="sb mdpb" data-md="del:'+m.id+':'+m.u+'">Delete</button><button class="sb mdpb" data-md="pmof:'+m.u+'">Their messages</button>'+acts(m.u)+'</div>').join('')||'<div class="qc">No chat yet.</div>'}
  else if(V.v==='pm'){h+='<form id="mdpf" style="display:flex;gap:6px"><input id="mdpq" maxlength="12" placeholder="Player name" value="'+esc2(V.pmQ)+'" style="flex:1;padding:6px;font:500 14px '+PF+'"><button class="sb" type="submit">FIND</button></form>';
   if(V.pmU){const u=V.pmU,L=V.pm||[];h+='<div class="tl" style="font-size:14px">'+esc2(nm(u))+kid(u)+'</div>'+acts(u)+(L.length?L.map(m=>'<div class="qc mdprow"><small>'+(m.f===u?'to <b>'+esc2(nm(m.to))+'</b>'+kid(m.to):'from <b>'+esc2(m.n||nm(m.f))+'</b>'+kid(m.f))+' · '+ago(m.t)+'</small><div>'+esc2(m.m)+(typeof m.r==='string'?'<br><small style="opacity:.75">As typed (shown only to adults with the chat filter off): '+esc2(m.r)+'</small>':'')+'</div><button class="sb mdpb" data-md="pdel:'+m.to+':'+m.id+'">Delete</button></div>').join(''):'<div class="qc">No private messages in the last 90 days.</div>')}
   else h+='<div class="qc" style="font-size:13px">Find a player to read the private messages they sent and received. Every look is logged.</div>'}
  else if(V.v==='gchat'){const G=Object.entries(V.gl).filter(([g,v])=>v&&v.n).sort((a,b)=>String(a[1].n).localeCompare(String(b[1].n)));
   h+='<div class="mdptabs">'+(G.map(([g,v])=>'<button class="sb mdpb'+(V.gid===g?' mdpon':'')+'" data-md="gsel:'+g+'">['+esc2(v.tag||'')+'] '+esc2(v.n)+'</button>').join('')||'<div class="qc">No guilds yet.</div>')+'</div>';
   if(V.gid){const L=V.gch||[];h+=L.length?L.map(m=>'<div class="qc mdprow"><b>'+esc2(m.n)+'</b>'+kid(m.u)+' <small>'+ago(m.t)+'</small><div>'+esc2(m.m)+(typeof m.r==='string'?'<br><small style="opacity:.75">As typed (shown only to adults with the chat filter off): '+esc2(m.r)+'</small>':'')+'</div><button class="sb mdpb" data-md="gdel:'+V.gid+':'+m.id+'">Delete</button><button class="sb mdpb" data-md="pmof:'+m.u+'">Their messages</button>'+acts(m.u)+'</div>').join(''):'<div class="qc">No guild chat in the last 90 days.</div>'}
   else h+='<div class="qc" style="font-size:13px">Pick a guild to read its chat. Every look is logged.</div>'}
  else if(V.v==='act'){const L=Object.entries(V.mod).filter(([u,m])=>m&&(m.mu>now()||m.ba>now()));h+=L.length?L.map(([u,m])=>'<div class="qc mdprow"><b>'+esc2(nm(u))+'</b> <small>'+esc2(m.r||'')+'</small>'+acts(u)+'</div>').join(''):'<div class="qc">Nobody is muted or suspended.</div>'}
  else if(V.v==='mods'){h+='<div class="qc" style="font-size:13px">Moderators can read reports, public chat, private messages and guild chat, delete messages, and mute or suspend players for up to 7 days. They must be adults (the age question). Their actions are in the Log tab.</div>';
   h+=Object.keys(V.mods).map(u=>'<div class="qc mdprow"><b>'+esc2(nm(u))+'</b> <button class="sb mdpb" data-md="unmod:'+u+'">Remove</button></div>').join('')||'<div class="qc">No moderators yet.</div>';
   h+='<form id="mdpaf" style="display:flex;gap:6px;margin-top:6px"><input id="mdpan" maxlength="12" placeholder="Player name to make a moderator" style="flex:1;padding:6px;font:500 14px '+PF+'"><button class="sb" type="submit">ADD</button></form>'}
  else if(V.v==='log'){h+=V.log.map(l=>'<div class="qc mdprow" style="font-size:12px"><b>'+esc2(nm(l.by))+'</b> '+esc2(l.a)+(l.u?' → '+esc2(nm(l.u)):'')+(l.x?' · '+esc2(l.x):'')+' <small>'+ago(l.t)+'</small></div>').join('')||'<div class="qc">Nothing yet.</div>'}
  h+='<div class="pmb"><button class="sb" data-mdt="close">CLOSE</button></div>';pbd.innerHTML=h;
  const us=new Set();for(const r of Object.values(V.rep))us.add(r.u);for(const m of V.chat.slice(0,100))us.add(m.u);for(const m of V.gch||[])us.add(m.u);if(V.pmU){us.add(V.pmU);for(const m of V.pm||[]){us.add(m.f);us.add(m.to)}}
  const need=[...us].filter(u=>u&&!(u in V.ages));if(need.length)ages(need).then(()=>{if(ptab===TAB)draw()})}
 {SQRPN.wrap('219',_r=>function(){if(ptab===TAB&&pnOpen){draw();return}return _r.apply(this,arguments)})}
 const byName=q=>{q=String(q||'').trim().toLowerCase();if(!q)return null;const e=Object.entries(V.lb).find(([u,v])=>v&&String(v.n||'').toLowerCase()===q)||Object.entries(V.lb).find(([u,v])=>v&&String(v.n||'').toLowerCase().startsWith(q));return e?e[0]:null};
 async function pmOf(u){V.v='pm';V.pmU=u;V.pmQ=nm(u);V.pm=null;V.busy=1;draw();
  try{const all=(await get('pm'))||{},L=[];for(const to in all)for(const id in all[to]){const m=all[to][id];if(m&&(to===u||m.f===u))L.push({...m,to,id})}
   V.pm=L.sort((a,b)=>(b.t||0)-(a.t||0)).slice(0,200);log('pm',u,L.length+' messages')}catch(e){V.pm=[];try{say('Couldn\'t read private messages: '+(e.message||e))}catch(_){self.SQERR&&SQERR(_,'219-9')}}V.busy=0;draw()}
 async function setMod(u,kind,ms){const why=(document.getElementById('mdpwhy')||{}).value||'';V.why=why;const cur=V.mod[u]||{},rec={mu:cur.mu||0,ba:cur.ba||0,r:String(why||cur.r||'').slice(0,120),by:me(),t:now()};
  if(kind==='mu')rec.mu=now()+ms;else if(kind==='ba')rec.ba=now()+ms;else{rec.mu=0;rec.ba=0}
  if(!isDev()){if(rec.mu>now()+WEEK)rec.mu=now()+WEEK;if(rec.ba>now()+WEEK)rec.ba=now()+WEEK}
  try{await db().set(ref('mod/'+u),rec);V.mod[u]=rec;log(kind==='lift'?'lift':kind+' '+Math.round(ms/36e5)+'h',u,why);say((kind==='lift'?'Lifted for ':kind==='mu'?'Muted ':'Suspended ')+nm(u)+'.')}catch(e){say('Not allowed: '+(e.message||e))}draw()}
 pbd.addEventListener('submit',e=>{if(ptab!==TAB)return;e.preventDefault();e.stopPropagation();if(e.target.id==='mdpf'){const q=document.getElementById('mdpq').value;V.pmQ=q;const u=byName(q);if(u)pmOf(u);else say('No player called '+q+'.')}
  if(e.target.id==='mdpaf')addMod(document.getElementById('mdpan').value)},true);
 // Enter in the panel's text boxes (010 stops keys typed into inputs, so forms never get submit from Enter)
 addEventListener('keydown',e=>{if(e.key!=='Enter'||ptab!==TAB||!pnOpen)return;const t=e.target;if(t&&t.id==='mdpq'){e.preventDefault();e.stopPropagation();const u=byName(t.value);V.pmQ=t.value;if(u)pmOf(u);else say('No player called '+t.value+'.')}
  else if(t&&t.id==='mdpan'){e.preventDefault();e.stopPropagation();addMod(t.value)}},true);
 async function addMod(q){if(!isDev())return;const u=byName(q);if(!u){say('No player called '+q+'.');return}
  let a=null;try{a=await get('age/'+u+'/b')}catch(e){self.SQERR&&SQERR(e,'219-10')}if(a!=='a'){say(nm(u)+' isn\'t an adult account (or hasn\'t answered the age question), so they can\'t be a moderator.');return}
  try{await db().set(ref('mods/'+u),true);V.mods[u]=true;log('addmod',u);say(nm(u)+' is now a moderator.')}catch(e){say('Couldn\'t add: '+(e.message||e))}draw()}
 pbd.addEventListener('click',async e=>{if(ptab!==TAB)return;const b=e.target.closest('[data-mdt],[data-md]');if(!b)return;e.stopPropagation();e.preventDefault();
  const w=document.getElementById('mdpwhy');if(w)V.why=w.value;
  if(b.dataset.mdt){const t=b.dataset.mdt;if(t==='close'){closePanel();return}V.v=t;draw();return}
  const[a,x,y]=b.dataset.md.split(':');
  if(a==='mu1')return setMod(x,'mu',36e5);if(a==='mu24')return setMod(x,'mu',DAY);if(a==='mu7')return setMod(x,'mu',WEEK);
  if(a==='ba1')return setMod(x,'ba',DAY);if(a==='ba7')return setMod(x,'ba',WEEK);if(a==='lift')return setMod(x,'lift',0);
  if(a==='pmof')return pmOf(x);
  if(a==='gsel'){V.gid=x;V.gch=null;V.busy=1;draw();try{const d=db(),sn=await d.get(d.query(ref('gchat/'+x),d.limitToLast(150)));V.gch=Object.entries(sn.val()||{}).map(([id,v])=>({id,...v})).filter(m=>m&&m.m).sort((p,q)=>(q.t||0)-(p.t||0));log('gchat',x,(V.gl[x]&&V.gl[x].n||'')+' · '+V.gch.length+' messages')}catch(err){V.gch=[];say('Couldn\'t read guild chat: '+(err.message||err))}V.busy=0;draw();return}
  if(a==='gdel'){try{const m=(V.gch||[]).find(q=>q.id===y);await db().remove(ref('gchat/'+x+'/'+y));V.gch=V.gch.filter(q=>q.id!==y);log('delgchat',m&&m.u,m&&m.m)}catch(err){say('Not allowed: '+(err.message||err))}draw();return}
  if(a==='done'){try{await db().set(ref('reports/'+x+'/st'),'done');V.rep[x].st='done';log('report',V.rep[x].u,'handled')}catch(err){say('Not allowed: '+(err.message||err))}draw();return}
  if(a==='del'){try{const m=V.chat.find(q=>q.id===x);await db().remove(ref('chat/'+x));V.chat=V.chat.filter(q=>q.id!==x);log('delchat',y,m&&m.m)}catch(err){say('Not allowed: '+(err.message||err))}draw();return}
  if(a==='pdel'){try{const m=(V.pm||[]).find(q=>q.id===y);await db().remove(ref('pm/'+x+'/'+y));V.pm=V.pm.filter(q=>q.id!==y);log('delpm',m&&m.f,m&&m.m)}catch(err){say('Not allowed: '+(err.message||err))}draw();return}
  if(a==='unmod'&&isDev()){try{await db().remove(ref('mods/'+x));delete V.mods[x];log('unmod',x)}catch(err){say('Couldn\'t remove: '+(err.message||err))}draw();return}},true);
 const css=document.createElement('style');css.textContent='.mdptabs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px}.mdptabs .sb{flex:1 1 auto;padding:6px 8px;font-size:13px}.mdptabs .mdpon{background:#fff6c8;border-color:#c89830}'+
  '.mdprow{text-align:left;font-size:13px;line-height:1.35}.mdprow .mdpb,.mdpacts .mdpb{padding:4px 8px;font-size:12px;margin:3px 3px 0 0;width:auto;display:inline-block}.mdpq{white-space:pre-wrap;font-size:11px;opacity:.8;max-height:120px;overflow:auto;background:#f0f0f0;padding:4px;margin:4px 0}'+
  '.mdptag{background:#e05858;color:#fff;font-size:10px;padding:1px 4px;border-radius:3px}';document.head.appendChild(css)})();
