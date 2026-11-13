// ---- 167. Dev Suite > Admin: bug inbox, players and gifts, news and events, economy (+ the game side of them) ----
// Database (rules in database.rules.json; devs = uids under devs/):
//   bugs/<id>        the in-game reports (061's BUG button); devs read them and set st ('fixed'|'wont'|'') and re (a reply)
//   saves/<uid>      devs can read anyone's account save (read only: the Players view)
//   gifts/<uid>/<id> {k item, n, g gold, m message, t, f from} written by devs; the player's game takes each one exactly once
//                    (a transaction removes it, the items/gold go to the bag) and shows the message. A reply to a bug
//                    report is a gift with only a message.
//   news             {m, t, until}: a banner at the top of everyone's screen until it's dismissed or runs out
//   events           {n name, xp multiplier, until}: XP gains are multiplied while it runs (outermost addXp), with a pill
// The Admin tab reads these straight from the database (not the asset library: nothing here needs publishing).
(()=>{const FBx=()=>window.SQFB,MPx=()=>window.SQMP,uid=()=>{const m=MPx();return m&&m.user&&m.user.uid};
 const esc2=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const lvFromXp=x=>{let L=1;while(L<99&&typeof XT!=='undefined'&&x>=XT[L])L++;return L};
 // ======================= game side =======================
 let EV=null,NEWS=null,giftsOn=null;
 // ---- gifts ----
 function giftsWatch(){const F=FBx(),u=uid();if(!F||!u||giftsOn===u)return;giftsOn=u;const d=F.db;
  d.onValue(d.ref(F.D,'gifts/'+u),s=>{const v=s.val()||{};for(const id of Object.keys(v))claim(id)},()=>{giftsOn=null})}
 const busy=new Set();
 async function claim(id){if(busy.has(id))return;busy.add(id);const F=FBx(),u=uid();if(!F||!u){busy.delete(id);return}const d=F.db;let got=null;
  try{const r=await d.runTransaction(d.ref(F.D,'gifts/'+u+'/'+id),cur=>{got=cur;return null});LOG.push([id,r&&r.committed,!!got]);
   if(r&&r.committed&&got){const parts=[];if(got.k&&INAME[got.k]&&got.n>0){inv[got.k]=(inv[got.k]|0)+(got.n|0);parts.push((got.n|0)+' × '+INAME[got.k])}
    if(got.g>0){GLD+=got.g|0;parts.push((got.g|0)+' gold')}
    const msg=(got.m?String(got.m).slice(0,500):'')+(parts.length?(got.m?' ':'')+'You received '+parts.join(' and ')+'.':'');
    if(msg){try{mpLog('game','📬 From the developer: '+msg)}catch(e){}say('📬 '+msg);msgT=8;try{sfx('quest')}catch(e){}}
    try{saveLocal(true);saveCloud(true)}catch(e){}}}catch(e){console.warn('gift',e);LOG.push([id,'error',String(e&&e.message||e)])}busy.delete(id)}
 // also look for waiting gifts every 15 s (in case the listener never delivered them)
 const LOG=[];setInterval(async()=>{try{const F=FBx(),u=uid();if(!F||!u)return;const d=F.db,s=await d.get(d.ref(F.D,'gifts/'+u)),v=s.val()||{};for(const id of Object.keys(v))claim(id)}catch(e){LOG.push(['poll','error',String(e&&e.message||e)])}},15000);
 // ---- news banner ----
 const nb=document.createElement('div');nb.id='sqnews';nb.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 44px);z-index:30;display:none;max-width:min(560px,calc(100vw - 24px));box-sizing:border-box;background:#f8f0d8;color:#403018;border:3px solid #806028;box-shadow:inset 0 0 0 2px #e8c878;padding:7px 34px 7px 12px;font:600 14px '+PF+';line-height:1.35;pointer-events:auto';
 nb.innerHTML='<span></span><button aria-label="Close" style="position:absolute;right:4px;top:3px;border:0;background:none;font:700 18px system-ui;color:#806028;cursor:pointer">×</button>';document.body.appendChild(nb);
 const seenKey=()=>'sq_news_'+(NEWS&&NEWS.t||0);
 nb.querySelector('button').onclick=e=>{e.stopPropagation();try{localStorage.setItem(seenKey(),'1')}catch(_){}nb.style.display='none'};
 for(const ev of['touchstart','pointerdown','mousedown'])nb.addEventListener(ev,e=>e.stopPropagation());
 function showNews(){let seen=false;try{seen=!!localStorage.getItem(seenKey())}catch(e){}const on=NEWS&&NEWS.m&&(!NEWS.until||NEWS.until>Date.now())&&!seen&&!(window.SQTITLE&&SQTITLE());
  nb.style.display=on&&!pnOpen&&!menuOpen?'block':'none';if(on)nb.querySelector('span').textContent='📢 '+NEWS.m}
 // ---- events (XP multiplier) ----
 const evOn=()=>EV&&EV.xp>1&&EV.until>Date.now();
 {const _ax=addXp;addXp=function(i,x){if(x>0&&evOn())x=Math.round(x*Math.min(5,EV.xp));return _ax.call(this,i,x)}}
 const pill=document.createElement('div');pill.id='sqevp';pill.style.cssText='position:fixed;right:10px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:25;display:none;background:#2a1838;color:#f8e0ff;border:2px solid #a050d0;padding:3px 9px;font:700 12px '+PF+';pointer-events:none';document.body.appendChild(pill);
 function showEv(){const on=evOn()&&!(window.SQTITLE&&SQTITLE())&&!pnOpen&&!menuOpen;pill.style.display=on?'block':'none';if(on){const m=Math.max(0,Math.ceil((EV.until-Date.now())/60000));pill.textContent='✨ '+(EV.n||'Bonus XP')+' · ×'+EV.xp+' XP · '+(m>90?Math.round(m/60)+' h':m+' min')+' left'}}
 let wired=false;function wire(){const F=FBx();if(!F||wired||!uid())return;wired=true;const d=F.db;
  d.onValue(d.ref(F.D,'news'),s=>{NEWS=s.val();showNews()},()=>{});d.onValue(d.ref(F.D,'events'),s=>{EV=s.val();showEv()},()=>{})}
 setInterval(()=>{try{wire();giftsWatch();showNews();showEv()}catch(e){}},2000);
 window.SQADMIN={claim,LOG,get news(){return NEWS},get event(){return EV},evOn,lvFromXp};
 // ======================= the Dev Suite tab =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,toast,fail}=API;
 const T={view:'bugs',bugs:null,bf:'open',shot:null,lb:null,q:'',pl:null,plS:null,eco:null,busy:false};
 const D=()=>FBx().db,ref=p=>D().ref(FBx().D,p),get=async p=>(await D().get(ref(p))).val();
 const ago=t=>{if(!t)return'';const s=(Date.now()-t)/1000;return s<3600?Math.round(s/60)+' min ago':s<86400*2?Math.round(s/3600)+' h ago':Math.round(s/86400)+' days ago'};
 async function loadBugs(){T.busy=true;API.draw();try{T.bugs=await get('bugs')||{}}catch(e){fail(e);T.bugs={}}T.busy=false;API.draw()}
 async function loadLb(){T.busy=true;API.draw();try{T.lb=await get('lb')||{}}catch(e){fail(e);T.lb={}}T.busy=false;API.draw()}
 async function loadPlayer(u){T.pl=u;T.plS=null;T.plG=null;API.draw();get('gifts/'+u).then(v=>{T.plG=v||{};API.draw()}).catch(()=>{});try{const v=await get('saves/'+u);T.plS=v&&v.json?JSON.parse(v.json):{none:1}}catch(e){fail(e);T.plS={none:1}}API.draw()}
 const nameOf=u=>{const r=T.lb&&T.lb[u];return r&&r.n||u.slice(0,8)};
 function bugsView(){if(!T.bugs){if(!T.busy)loadBugs();return'<p class="dv-mut">Loading reports…</p>'}
  const L=Object.entries(T.bugs).filter(([,b])=>b&&b.t).sort((a,b)=>b[1].t-a[1].t),st=b=>b.st||'';
  const shown=L.filter(([,b])=>T.bf==='all'||(T.bf==='open'?!st(b):!!st(b)));
  let h='<div class="dv-row" style="flex-wrap:wrap">'+[['open','Open'],['done','Done'],['all','All']].map(([k,n])=>'<button class="dv-b'+(T.bf===k?' dv-tl dv-on':'')+'" data-adm="bf:'+k+'">'+n+' ('+L.filter(([,b])=>k==='all'||(k==='open'?!st(b):!!st(b))).length+')</button>').join('')+'<button class="dv-b" data-adm="rbugs">↻ Refresh</button></div>';
  for(const[id,b]of shown.slice(0,80)){const i=b.info||{};h+='<div class="dv-card" style="margin:8px 0"><div class="dv-row" style="flex-wrap:wrap;gap:6px"><b>'+esc2(b.n||'?')+'</b><span class="dv-mut">'+esc2(new Date(b.t).toLocaleString())+' · '+ago(b.t)+' · '+esc2(i.where||i.region||'')+' · '+(i.pc?'PC':'phone')+(i.pad?' + controller':'')+' · v'+esc2(i.v||'?')+'</span>'+(st(b)?'<span class="dv-mut" style="color:#7c6">✔ '+esc2(st(b))+'</span>':'')+'</div>'+
   '<p style="margin:6px 0;white-space:pre-wrap">'+esc2(b.what||'(no text)')+'</p>'+(b.exp?'<p class="dv-mut" style="margin:4px 0">Expected: '+esc2(b.exp)+'</p>':'')+(i.last?'<p class="dv-mut" style="margin:4px 0;font-size:12px">Last messages: '+esc2(i.last)+'</p>':'')+(b.re?'<p style="margin:4px 0;color:#9bf">↩ Your reply: '+esc2(b.re)+'</p>':'')+
   '<div class="dv-row" style="flex-wrap:wrap">'+(b.shot?'<button class="dv-b" data-adm="shot:'+id+'">'+(T.shot===id?'Hide':'Show')+' screenshot</button>':'')+
   '<button class="dv-b" data-adm="st:'+id+':'+(st(b)?'':'fixed')+'">'+(st(b)?'Reopen':'Mark fixed')+'</button>'+(st(b)?'':'<button class="dv-b" data-adm="st:'+id+':wont">Won\'t fix</button>')+
   '<button class="dv-b" data-adm="rep:'+id+'">Reply…</button>'+(i.where&&isFinite(i.x)?'<button class="dv-b" data-adm="go:'+id+'">Go there</button>':'')+(b.u?'<button class="dv-b" data-adm="pl:'+esc2(b.u)+'">Player</button>':'')+'</div>'+
   (T.shot===id&&b.shot?'<img alt="Screenshot" src="'+esc2(b.shot)+'" style="max-width:100%;margin-top:8px;border:1px solid #333">':'')+'</div>'}
  if(!shown.length)h+='<p class="dv-mut">Nothing here.</p>';return h}
 function playersView(){if(!T.lb){if(!T.busy)loadLb();return'<p class="dv-mut">Loading players…</p>'}
  const q=T.q.toLowerCase(),L=Object.entries(T.lb).filter(([,r])=>r&&r.n&&(!q||String(r.n).toLowerCase().includes(q))).sort((a,b)=>(b[1].t||0)-(a[1].t||0));
  let h='<div class="dv-spr'+(T.pl?' dv-has':'')+'"><div class="dv-ls"><input type="search" placeholder="Search '+Object.keys(T.lb).length+' players" value="'+esc2(T.q)+'" data-adq="1"><div class="dv-grid" style="grid-template-columns:1fr">';
  for(const[u,r]of L.slice(0,200))h+='<button class="dv-it'+(T.pl===u?' dv-on':'')+'" data-adm="pl:'+esc2(u)+'" style="flex-direction:row;justify-content:space-between;padding:7px 10px"><span>'+esc2(r.n)+'</span><small class="dv-mut">'+ago(r.t)+'</small></button>';
  h+='</div></div><div class="dv-ed">';
  if(!T.pl)h+='<div class="dv-card"><b>Players</b><p class="dv-mut">Pick a player to see their character and send them a gift (items, gold and a message: it arrives in their bag the next time they play, or right away if they\'re on).</p></div>';
  else if(!T.plS)h+='<p class="dv-mut">Loading…</p>';
  else if(T.plS.none)h+='<div class="dv-card"><b>'+esc2(nameOf(T.pl))+'</b><p class="dv-mut">No account save.</p>'+giftForm()+'</div>';
  else{const S2=T.plS,xp=Array.isArray(S2.xp)?S2.xp:[],lv=xp.map(lvFromXp),tot=lv.reduce((a,b)=>a+b,0),inv2=S2.inv||{},items=Object.entries(inv2).filter(([k,n])=>n>0).sort((a,b)=>b[1]-a[1]);
   const reg=S2.region&&S2.region.id||'hollow',nm=S2.ch&&S2.ch.name||nameOf(T.pl);
   h+='<div class="dv-card"><div class="dv-row" style="flex-wrap:wrap"><b style="font-size:16px">'+esc2(nm)+'</b><span class="dv-mut">total level '+tot+' · '+(S2.gold|0).toLocaleString()+' gold · on '+esc2(reg)+' · saved '+ago(S2.savedAt)+'</span></div>'+
    '<p class="dv-mut" style="margin:6px 0">'+lv.map((L,i)=>esc2((typeof SKN!=='undefined'&&SKN[i])||'Skill '+i)+' '+L).join(' · ')+'</p>'+
    '<p class="dv-mut" style="margin:6px 0">Uid: <code>'+esc2(T.pl)+'</code></p>'+
    '<details><summary class="dv-mut">Bag ('+items.length+' kinds)</summary><p style="font-size:12px">'+items.map(([k,n])=>esc2(INAME[k]||k)+' ×'+n).join(', ')+'</p></details>'+giftForm()+'</div>'}
  return h+'</div></div>'}
 const waiting=()=>{const G=T.plG;if(!G)return'';const L=Object.values(G).filter(Boolean);return'<p class="dv-mut" style="margin:6px 0">'+(L.length?'⏳ Waiting to be picked up: '+L.map(g=>(g.k?(g.n||1)+' × '+esc2(INAME[g.k]||g.k):'')+(g.g?' '+g.g+' gold':'')+(!g.k&&!g.g?'a message':'')).join(', ')+' (it arrives the next time their game is online).':'No gifts waiting: everything sent has been picked up.')+'</p>'};
 function giftForm(){const opts=Object.keys(INAME).filter(k=>!/^eq_cu_/.test(k)||INAME[k]).sort((a,b)=>INAME[a].localeCompare(INAME[b])).map(k=>'<option value="'+k+'">'+esc2(INAME[k])+'</option>').join('');
  return'<div class="dv-card" style="margin-top:10px"><b>Send a gift</b>'+waiting()+'<div class="dv-row" style="flex-wrap:wrap;margin-top:6px"><label class="dv-mut">Item<br><select data-gf="k"><option value="">(none)</option>'+opts+'</select></label>'+
   '<label class="dv-mut">How many<br><input type="number" data-gf="n" min="1" max="1000000" value="1" style="width:80px"></label><label class="dv-mut">Gold<br><input type="number" data-gf="g" min="0" max="100000000" value="0" style="width:100px"></label></div>'+
   '<label class="dv-mut" style="display:block;margin-top:6px">Message<br><textarea data-gf="m" maxlength="500" rows="2" style="width:100%" placeholder="Sorry about the lost pet! Here\'s a new one."></textarea></label>'+
   '<div class="dv-row"><button class="dv-b dv-pri" data-adm="gift">Send</button><span class="dv-mut">Each gift is taken once, by the player\'s own game.</span></div></div>'}
 function newsView(){const N=T.newsV||{},X=T.evV||{};if(!T.newsLoaded){T.newsLoaded=1;Promise.all([get('news'),get('events')]).then(([a,b])=>{T.newsV=a||{};T.evV=b||{};API.draw()}).catch(fail)}
  const live=x=>x&&x.until>Date.now();
  return'<div class="dv-card"><b>📢 Announcement</b><p class="dv-mut">A banner at the top of everyone\'s screen (they can close it).'+(live(N)&&N.m?' Showing now: “'+esc2(N.m)+'”, '+Math.ceil((N.until-Date.now())/3600000)+' h left.':' Nothing showing.')+'</p>'+
   '<textarea data-nw="m" maxlength="300" rows="2" style="width:100%" placeholder="Double XP this weekend! / Server maintenance at 8 pm.">'+esc2(live(N)?N.m:'')+'</textarea><div class="dv-row"><label class="dv-mut">Show for <input type="number" data-nw="h" min="1" max="720" value="24" style="width:64px"> hours</label><button class="dv-b dv-pri" data-adm="news">Post</button><button class="dv-b dv-bad" data-adm="newsoff">Take down</button></div></div>'+
   '<div class="dv-card" style="margin-top:10px"><b>✨ XP event</b><p class="dv-mut">Everyone gets more XP while it runs; a small pill shows the time left.'+(live(X)?' Running now: '+esc2(X.n||'Bonus XP')+' ×'+X.xp+', '+Math.ceil((X.until-Date.now())/3600000)+' h left.':' Nothing running.')+'</p>'+
   '<div class="dv-row" style="flex-wrap:wrap"><label class="dv-mut">Name<br><input type="text" data-ev="n" maxlength="30" value="'+esc2(live(X)&&X.n||'Double XP Weekend')+'"></label><label class="dv-mut">XP ×<br><input type="number" data-ev="xp" min="1.1" max="5" step="0.1" value="'+(live(X)&&X.xp||2)+'" style="width:64px"></label><label class="dv-mut">Hours<br><input type="number" data-ev="h" min="1" max="720" value="48" style="width:64px"></label>'+
   '<button class="dv-b dv-pri" data-adm="ev" style="align-self:flex-end">Start</button><button class="dv-b dv-bad" data-adm="evoff" style="align-self:flex-end">Stop</button></div></div>'}
 async function loadEco(){T.busy=true;API.draw();try{const lb=T.lb||(T.lb=await get('lb')||{});const us=Object.keys(lb);const out={players:0,gold:0,rich:[],items:{},offers:0,last:{}};
   const saves=await Promise.all(us.map(u=>get('saves/'+u).then(v=>[u,v]).catch(()=>[u,null])));
   for(const[u,v]of saves){if(!v||!v.json)continue;let S2;try{S2=JSON.parse(v.json)}catch(e){continue}out.players++;const g=S2.gold|0;out.gold+=g;out.rich.push([lb[u]&&lb[u].n||u.slice(0,8),g,u]);for(const k in S2.inv||{}){const n=+S2.inv[k]||0;if(n>0)out.items[k]=(out.items[k]||0)+n}}
   out.rich.sort((a,b)=>b[1]-a[1]);const of=await get('market/offers')||{};out.offers=Object.keys(of).length;out.last=await get('market/last')||{};out.of=of;T.eco=out}catch(e){fail(e)}T.busy=false;API.draw()}
 function ecoView(){if(!T.eco){if(!T.busy)loadEco();return'<p class="dv-mut">Reading every account save… (this can take a moment)</p>'}const e=T.eco;
  const top=Object.entries(e.items).sort((a,b)=>b[1]*(SELLP[b[0]]||1)-a[1]*(SELLP[a[0]]||1)).slice(0,30);
  return'<div class="dv-row"><button class="dv-b" data-adm="reco">↻ Refresh</button></div><div class="dv-card"><b>Gold</b><p>'+e.gold.toLocaleString()+' gold across '+e.players+' players (average '+Math.round(e.gold/Math.max(1,e.players)).toLocaleString()+').</p>'+
   '<p class="dv-mut">Richest: '+e.rich.slice(0,10).map(r=>'<a href="#" data-adm="pl:'+esc2(r[2])+'">'+esc2(r[0])+'</a> '+r[1].toLocaleString()).join(' · ')+'</p></div>'+
   '<div class="dv-card" style="margin-top:10px"><b>Items in bags (by total shop value)</b><p style="font-size:12px">'+top.map(([k,n])=>esc2(INAME[k]||k)+' ×'+n.toLocaleString()).join(', ')+'</p></div>'+
   '<div class="dv-card" style="margin-top:10px"><b>World Market</b><p class="dv-mut">'+e.offers+' open offers. Last trades: '+Object.entries(e.last).sort((a,b)=>(b[1].t||0)-(a[1].t||0)).slice(0,20).map(([k,v])=>esc2(INAME[k]||k)+' '+v.p+'g ('+ago(v.t)+')').join(' · ')+'</p></div>'}
 function render(){const tabs=[['bugs','🐞 Bug reports'],['players','👤 Players'],['news','📢 News & events'],['eco','💰 Economy']];
  let h='<div class="dv-row" style="flex-wrap:wrap;margin-bottom:8px">'+tabs.map(([k,n])=>'<button class="dv-b'+(T.view===k?' dv-tl dv-on':'')+'" data-adm="v:'+k+'">'+n+'</button>').join('')+'</div>';
  return h+(T.view==='bugs'?bugsView():T.view==='players'?playersView():T.view==='news'?newsView():ecoView())}
 const gv=sel=>{const e=document.querySelector('#dvs '+sel);return e?e.value:''};
 document.addEventListener('input',e=>{if(S.tab!=='admin')return;const t=e.target;if(t.dataset&&t.dataset.adq){T.q=t.value;const pos=t.selectionStart;API.draw();const n=document.querySelector('#dvs [data-adq]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}}},true);
 document.addEventListener('click',async e=>{if(S.tab!=='admin')return;const t=e.target.closest('[data-adm]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();e.stopPropagation();
  const [a,b,c]=t.dataset.adm.split(':');
  try{if(a==='v'){T.view=b;API.draw()}
   else if(a==='bf'){T.bf=b;API.draw()}else if(a==='rbugs'){T.bugs=null;API.draw()}
   else if(a==='shot'){T.shot=T.shot===b?null:b;API.draw()}
   else if(a==='st'){await D().set(ref('bugs/'+b+'/st'),c||null);T.bugs[b].st=c||undefined;toast(c?'Marked '+c+'.':'Reopened.');API.draw()}
   else if(a==='rep'){const bug=T.bugs[b];const m=prompt('Reply to '+(bug.n||'the player')+' (they get it in the game):',bug.re||'Thanks! This is fixed in the latest update.');if(!m)return;
    await D().set(ref('bugs/'+b+'/re'),m.slice(0,500));if(bug.u)await D().set(ref('gifts/'+bug.u+'/r'+Date.now().toString(36)),{m:('About your bug report (“'+String(bug.what||'').slice(0,60)+'”): '+m).slice(0,500),t:Date.now(),f:uid()});bug.re=m;toast('Reply sent.');API.draw()}
   else if(a==='go'){const i=(T.bugs[b]||{}).info||{};SQSUITE.close();try{if(i.region&&i.region!=='hollow'&&window.SQTEST)SQTEST.goIsland(i.region);setTimeout(()=>{P.x=+i.x;P.y=+i.y},i.region&&i.region!=='hollow'?1500:0)}catch(e2){}toast('Moved to where it was reported.')}
   else if(a==='pl'){T.view='players';if(!T.lb)await loadLb();loadPlayer(b)}
   else if(a==='gift'){const k=gv('[data-gf="k"]'),n=Math.max(1,Math.min(1e6,gv('[data-gf="n"]')|0)),g=Math.max(0,Math.min(1e8,gv('[data-gf="g"]')|0)),m=gv('[data-gf="m"]').slice(0,500);
    if(!k&&!g&&!m){toast('Pick an item, some gold or write a message.');return}const o={t:Date.now(),f:uid()};if(k){o.k=k;o.n=n}if(g)o.g=g;if(m)o.m=m;
    await D().set(ref('gifts/'+T.pl+'/g'+Date.now().toString(36)),o);toast('Gift sent to '+nameOf(T.pl)+'.')}
   else if(a==='news'){const m=gv('[data-nw="m"]').trim().slice(0,300),h=Math.max(1,Math.min(720,+gv('[data-nw="h"]')||24));if(!m){toast('Write the announcement first.');return}T.newsV={m,t:Date.now(),until:Date.now()+h*3600000};await D().set(ref('news'),T.newsV);toast('Posted.');API.draw()}
   else if(a==='newsoff'){await D().set(ref('news'),null);T.newsV={};toast('Taken down.');API.draw()}
   else if(a==='ev'){const n=gv('[data-ev="n"]').trim().slice(0,30)||'Bonus XP',xp=Math.max(1.1,Math.min(5,+gv('[data-ev="xp"]')||2)),h=Math.max(1,Math.min(720,+gv('[data-ev="h"]')||48));T.evV={n,xp:Math.round(xp*10)/10,t:Date.now(),until:Date.now()+h*3600000};await D().set(ref('events'),T.evV);toast('Event started.');API.draw()}
   else if(a==='evoff'){await D().set(ref('events'),null);T.evV={};toast('Event stopped.');API.draw()}
   else if(a==='reco'){T.eco=null;API.draw()}}catch(e2){fail(e2)}},true);
 SQSUITE.addTab('admin','Admin',{render})})();
