// ---------------------------------------------------------------- 77. Ignore and report players
// Tap a name in chat for a player menu: Message / Add friend, Trade (when they're close), Ignore and Report.
// Ignoring someone hides their public chat (and the speech over their head), and drops their private messages,
// friend requests and trade requests. The list travels with your account; Chat > Friends shows it with UNIGNORE.
// /ignore name and /unignore name work in chat too. Reports go to the bug reports (Realtime Database > bugs) marked
// PLAYER REPORT, with their last few messages attached.
const IGN={m:new Map(),pm:null,rep:null};
const ignored=u=>!!u&&IGN.m.has(u);
function ignSet(u,on){if(!u||!MP.user||u===MP.user.uid)return;const nm=trName(u);if(on){IGN.m.set(u,nm);mpLog('game','You ignore '+nm+'. You won\'t see their messages or requests.');
  for(const r of[MP.players.get(u)])if(r)r.said=null;if(TR.inbox[u]){delete TR.inbox[u];trPopHide(u);FB.db.remove(FB.db.ref(FB.D,'treq/'+MP.user.uid+'/'+u)).catch(()=>{})}
  if(MP.req&&MP.req[u])FB.db.remove(FB.db.ref(FB.D,'freq/'+MP.user.uid+'/'+u)).catch(()=>{})}
 else{IGN.m.delete(u);mpLog('game','You no longer ignore '+nm+'.')}
 try{saveLocal(true);saveCloud(true)}catch(e){}if(MP.open)mpRList()}
// what gets hidden
{const _c=mpChat;mpChat=function(id,v){if(v&&ignored(v.u)){MP.seen.add(id);return}return _c(id,v)}}
{const _s=snap;snap=function(){const s=_s();if(IGN.m.size)s.ign=[...IGN.m].map(([u,n])=>[u,String(n).slice(0,12)]);return s}}
{const _a=applySave;applySave=function(S){_a(S);IGN.m.clear();if(S&&Array.isArray(S.ign))for(const e of S.ign)if(Array.isArray(e)&&typeof e[0]==='string')IGN.m.set(e[0].slice(0,64),String(e[1]||'Someone').slice(0,12))}}
// ---- the player menu ----
{const st=document.createElement('style');st.textContent=`#mppm{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 70px);transform:translateX(-50%);z-index:70;width:min(320px,calc(100vw - 24px));display:none;flex-direction:column;gap:6px;padding:12px;box-sizing:border-box;font:500 14px ${PF}}
#mppm .h{font-weight:700;font-size:17px;letter-spacing:.04em;margin-bottom:2px;display:flex;align-items:center;gap:6px}#mppm .h small{font-weight:500;font-size:12px;color:#707070}
#mppm button{font:700 14px ${PF};padding:9px 12px;border:3px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer;text-align:left}#mppm button.dg{color:#b03828}#mppm button.gpf{box-shadow:inset 0 0 0 3px #f8a020}
#mppm .rs{display:flex;flex-wrap:wrap;gap:6px}#mppm .rs button{flex:1 1 40%;text-align:center;padding:7px 6px}#mppm .rs button.on{background:#485870;color:#f8f8f8}
#mppm textarea{width:100%;box-sizing:border-box;min-height:60px;font:500 15px ${PF};padding:6px;border:2px solid #485870;border-radius:0}#mppm .st{font-size:12px;color:#707070;min-height:14px}`;document.head.appendChild(st)}
const pmEl=el('div','mppm','g3','');document.body.appendChild(pmEl);for(const ev of['touchstart','pointerdown','mousedown','keydown','keyup'])pmEl.addEventListener(ev,stop);
function pmOpen(u){if(!MP.on||!MP.user||!u||u===MP.user.uid)return;IGN.pm=u;IGN.rep=null;pmDraw();pmEl.style.display='flex';setTimeout(()=>{const b=pmEl.querySelector('button');if(b&&GPON)setFocus(b)},20)}
function pmClose(){pmEl.style.display='none';IGN.pm=null;IGN.rep=null;setFocus(null)}
function pmDraw(){const u=IGN.pm,nm=esc(trName(u));if(IGN.rep){const R=IGN.rep;
  pmEl.innerHTML='<div class="h">REPORT '+nm.toUpperCase()+'</div><div class="rs">'+['Harassment','Spam','Cheating','Bad name','Other'].map(r=>'<button data-pm="why" data-v="'+r+'" class="'+(R.why===r?'on':'')+'">'+r+'</button>').join('')+'</div>'+
   '<textarea id="pmtx" maxlength="600" placeholder="What happened? (optional)">'+esc(R.txt||'')+'</textarea><label style="font-size:13px"><input type="checkbox" id="pmig" '+(ignored(u)?'checked disabled':'checked')+'> Also ignore them</label>'+
   '<button data-pm="send" style="background:#485870;color:#f8f8f8">SEND REPORT</button><button data-pm="back">BACK</button><div class="st" id="pmst"></div>';return}
 const fr=isFriend(u),near=typeof trNear==='function'&&trNear(u),ig=ignored(u);let h='<div class="h">'+(isOG(u)?'<img src="'+crownURL+'" alt="OG" style="width:18px;height:14px;image-rendering:pixelated">':'')+nm+(fr?' <small>friend</small>':'')+'</div>';
 if(fr)h+='<button data-pm="msg">MESSAGE</button>';else if(!ig)h+='<button data-pm="add">ADD FRIEND</button>';
 if(near&&!ig)h+='<button data-pm="trade">TRADE</button>';
 h+='<button data-pm="ign" class="dg">'+(ig?'UNIGNORE':'IGNORE')+'</button><button data-pm="rep" class="dg">REPORT</button><button data-pm="x">CANCEL</button>';pmEl.innerHTML=h}
pmEl.addEventListener('click',async e=>{const b=e.target.closest('[data-pm]');if(!b)return;const a=b.dataset.pm,u=IGN.pm;if(!u)return;
 if(a==='x'){pmClose();return}if(a==='msg'){pmClose();MP.pmTo=u;MP.tab='pm';mpOpenChat();mpRList();setTimeout(()=>inp.focus(),20);return}
 if(a==='add'){pmClose();addFriend(u);return}if(a==='trade'){pmClose();if(MP.open)mpCloseChat();trRequest(u);return}
 if(a==='ign'){ignSet(u,!ignored(u));pmClose();return}if(a==='rep'){IGN.rep={why:'',txt:''};pmDraw();return}if(a==='back'){IGN.rep=null;pmDraw();return}
 if(a==='why'){IGN.rep.txt=($('pmtx')||{}).value||'';IGN.rep.why=b.dataset.v;pmDraw();return}
 if(a==='send'){const R=IGN.rep;R.txt=($('pmtx')||{}).value||'';if(!R.why){$('pmst').textContent='Pick a reason first.';return}const also=$('pmig')&&$('pmig').checked;
  const msgs=MP.log.filter(m=>m.uid===u&&(m.k==='pub'||m.k==='pm')).slice(-10).map(m=>m.m).join(' | ').slice(0,800);
  const r={what:('PLAYER REPORT: '+trName(u)+' ('+u+') · '+R.why+(R.txt?' · '+R.txt:'')).slice(0,1500),exp:('Their recent messages: '+(msgs||'(none seen)')).slice(0,600),info:Object.assign(bugInfo(),{reported:u,reportedName:trName(u)}),shot:''};
  $('pmst').textContent='Sending...';try{await bugSendNow(r);if(also&&!ignored(u))ignSet(u,true);pmClose();say('Report sent. Thank you for keeping SkillQuest friendly.');mpLog('game','You reported '+trName(u)+'.')}
  catch(err){$('pmst').textContent='Could not send. Try again in a moment.';mpErr(err)}}});
// tapping a name in chat opens the menu (instead of jumping straight to messages)
lst.addEventListener('click',e=>{const b=e.target.closest('b.nm');if(!b||!b.dataset.u||!MP.user||b.dataset.u===MP.user.uid)return;e.stopImmediatePropagation();pmOpen(b.dataset.u)},true);
{const _nr=navRoot;navRoot=function(){if(pmEl.style.display==='flex')return pmEl;return _nr()}}
// Friends tab: the ignore list
{const _fv=friendsView;friendsView=function(){_fv();if(!IGN.m.size)return;const h=document.createElement('div');h.className='fh';h.textContent='IGNORED';lst.appendChild(h);
  for(const[u,n]of IGN.m){const row=document.createElement('div');row.className='fr';const nm=document.createElement('div');nm.className='fn';const b=document.createElement('b');b.textContent=n;nm.append(b);
   const un=document.createElement('button');un.textContent='UNIGNORE';un.onclick=()=>ignSet(u,false);row.append(nm,un);lst.appendChild(row)}}}
// /ignore name, /unignore name
{const _s=mpSend;mpSend=function(t){const m=String(t||'').trim().match(/^\/(ignore|unignore|block|unblock)\s+(\S+)\s*$/i);if(!m)return _s(t);const nl=m[2].toLowerCase(),on=/^(ignore|block)$/i.test(m[1]);
  let u=[...MP.players.keys()].find(k=>(MP.players.get(k).n||'').toLowerCase()===nl)||Object.keys(MP.prof||{}).find(k=>MP.prof[k]&&MP.prof[k].nl===nl)||[...IGN.m].find(([k,n])=>n.toLowerCase()===nl)?.[0];
  if(!u){mpLog('game','No player called '+m[2]+'.');return}ignSet(u,on)}}
window.SQIGN=IGN;
// other players' Flame Aura glows on your screen too
{const _dh=drawHUD;drawHUD=function(){try{const indoors=SCENE&&!(SCENE.room&&(SCENE.room.region||SCENE.room.cave));const dk=indoors?0:dark();
  if(dk>.05&&MP.on){const cx=camX(),cy=camY();let st=false;
   for(const r of mpVis()){if(!r.au)continue;if(!st){g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';st=true}
    const sx=(r.x-cx)*Z,sy=(r.y-4-cy)*Z,rad=120*Z,gr=g.createRadialGradient(sx,sy,0,sx,sy,rad);gr.addColorStop(0,'rgba(255,215,150,'+(.4*dk)+')');gr.addColorStop(.55,'rgba(255,180,90,'+(.2*dk)+')');gr.addColorStop(1,'rgba(255,160,60,0)');
    g.fillStyle=gr;g.fillRect(sx-rad*1.1,sy-rad*1.1,rad*2.2,rad*2.2)}if(st)g.restore()}}catch(e){}_dh()}}
