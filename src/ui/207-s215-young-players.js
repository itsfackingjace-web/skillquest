// ---- 215. Age check and protected mode for younger players, plus quick chat phrases for everyone ----
// Once per account the game asks for a birth year (a neutral question, any year allowed) and keeps only the age band:
// `age/<uid>` = {b:'c'|'t'|'a', t} (c = under 13, t = 13-17, a = adult; write-once for the player, devs can correct it),
// cached in localStorage `sq_age_<uid>` (offline / signed out: `sq_age_local`). The birth year itself is never stored.
// Under 13 (`SQAGE.child()`): chat is the PHRASES list only (also enforced by the database rules: chat, gchat and pm
// messages from a 'c' account must match the same list, and pm / treq / dreq to or from a 'c' account need the child's
// friends list), trade requests only with friends, and the character is never named after the Google account (PNAME
// becomes "Adventurer" until they pick a name). `SQAGE.minor()` (under 18) is for the supporter checkout's ask-a-parent step.
// The PHRASES button (chat box, everyone) sends a ready-made line. Keep `PHRASES` in step with the regex in database.rules.json.
(()=>{const PHRASES=["Hi!","Hello!","Bye!","See you later!","Thanks!","You're welcome!","Good game!","Nice!","Well done!","Good luck!","Sorry!","OK","Yes","No","Maybe","LOL","Brb","Want to team up?","Want to be friends?","Follow me!","Wait for me!","Over here!","Help!","Let's trade!","Let's fight the boss!","Let's go on an adventure!","I'm going fishing.","I'm going mining.","I'm going to chop trees.","I'm cooking.","I have to go now.","Cool house!","Cute pet!"];
 const ok=t=>PHRASES.includes(String(t).replace(/^\[Party\] /,''));
 const mp=()=>window.SQMP,uid=()=>{const m=mp();return m&&m.user?m.user.uid:''};
 const LK=()=>uid()?'sq_age_'+uid():'sq_age_local';
 let band='',bandFor=null,asking=false,fetching=null;
 const get=()=>{try{return localStorage.getItem(LK())||''}catch(e){return''}};
 const API={get band(){return band},child:()=>band==='c',minor:()=>band==='c'||band==='t',known:()=>!!band,PHRASES,ok};window.SQAGE=API;
 // ---- the question ----
 const st=document.createElement('style');st.textContent=`#sqage{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:rgba(10,12,20,.72);padding:16px}
#sqage .ag-c{width:min(420px,100%);background:#f8f8f0;color:#303030;border:4px solid #485870;box-shadow:inset 0 0 0 3px #a8b8d0;padding:20px;font:500 17px/1.45 ${PF}}
#sqage .ag-t{font-weight:700;font-size:21px;margin:0 0 8px}#sqage label{display:block;margin:14px 0 6px;font-weight:700}
#sqage select{width:100%;font:600 18px ${PF};padding:8px;border:3px solid #485870;background:#fff;color:#303030}
#sqage button{margin-top:16px;width:100%;font:700 18px ${PF};padding:12px;background:#3a8a4a;color:#fff;border:4px solid #1f5a2c;cursor:pointer}
#sqage button:disabled{opacity:.5;cursor:default}#sqage .ag-n{font-size:13px;opacity:.75;margin-top:10px}
#mpf .agph{flex:0 0 auto;font:700 13px ${PF};padding:6px 8px}
#agpl{display:none;flex-wrap:wrap;gap:6px;margin-top:6px;max-height:150px;overflow:auto}#agpl.on{display:flex}
#agpl button{font:600 14px ${PF};padding:5px 8px;border:2px solid #485870;background:#fff;color:#303030;cursor:pointer}`;document.head.appendChild(st);
 const box=document.createElement('div');box.id='sqage';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','agt');
 const yNow=new Date().getFullYear();let opts='<option value="">Choose a year</option>';for(let y=yNow;y>=yNow-100;y--)opts+='<option value="'+y+'">'+y+'</option>';
 box.innerHTML='<div class="ag-c"><p class="ag-t" id="agt">One quick question</p><p>The game uses this to set up chat and other features for you.</p><label for="agy">What year were you born?</label><select id="agy">'+opts+'</select><button id="agok" disabled>CONTINUE</button><p class="ag-n">Only your age group is kept, not the year.</p></div>';
 document.body.appendChild(box);for(const ev of['touchstart','pointerdown','mousedown','keydown','keyup'])box.addEventListener(ev,e=>e.stopPropagation());
 const sel=box.querySelector('#agy'),okb=box.querySelector('#agok');sel.onchange=()=>{okb.disabled=!sel.value};
 okb.onclick=()=>{const y=+sel.value;if(!y)return;const a=yNow-y;const b=a<=13?'c':a<=18?'t':'a';choose(b,true)};
 function show(){asking=true;box.style.display='flex';setTimeout(()=>{try{sel.focus()}catch(e){}},50)}
 function choose(b,fresh){band=b;bandFor=uid()||'local';try{localStorage.setItem(LK(),b)}catch(e){}box.style.display='none';asking=false;
  if(fresh&&uid()&&window.SQFB){const F=SQFB;F.db.set(F.db.ref(F.D,'age/'+uid()),{b,t:F.db.serverTimestamp()}).catch(()=>{})}
  apply();if(fresh)try{say(b==='c'?'Chat for you uses ready-made phrases: tap PHRASES in the chat box.':'All set. Have fun!')}catch(e){}}
 // ---- what changes for younger players ----
 function apply(){try{const inp=document.getElementById('mpi');if(inp){inp.readOnly=API.child();inp.placeholder=API.child()?'Tap PHRASES to chat':'Say something...'}}catch(e){}
  try{if(API.child()&&typeof PNAME!=='undefined'&&!PNAME)PNAME='Adventurer'}catch(e){}}
 // decide (or look up) the age band for whoever is playing now
 function check(){if(window.SQTS&&SQTS.open)return;const who=uid()||'local';if(bandFor===who&&band){return}
  if(bandFor!==who){band='';bandFor=null}
  const c=get();if(c){band=c;bandFor=who;apply();return}
  if(asking)return;
  if(uid()&&window.SQFB){if(fetching===who)return;fetching=who;const F=SQFB;F.db.get(F.db.ref(F.D,'age/'+who)).then(s=>{fetching=null;const v=s.val();if(v&&/^[cta]$/.test(v.b)){if(uid()===who)choose(v.b,false)}else if(uid()===who)show()}).catch(()=>{fetching=null});return}
  show()}
 setInterval(check,700);
 // the game waits while the question is up
 {SQUPD.wrap('207',_u=>function(){if(asking)return;return _u.apply(this,arguments)})}
 {const _nr=navRoot;navRoot=function(){if(asking)return box;return _nr()}}
 // ---- chat: phrases only for under 13 ----
 {const _s=window.mpSend;window.mpSend=function(t){if(API.child()){const s=String(t||'').replace(/\s+/g,' ').trim();
    const w=/^\/(?:w|msg|pm|g|guild|p|party)\s+(?:(\S+)\s+)?(.+)$/i.exec(s);const body=w?(/^\/(?:g|guild|p|party)\s/i.test(s)?s.replace(/^\/\S+\s+/,''):w[2]):s;
    if(s[0]==='/'&&!w){return _s.apply(this,arguments)}
    if(!ok(body)){try{(window.SQMPLOG||(()=>{}))('game','Tap PHRASES to pick something to say.')}catch(e){}return}}
   return _s.apply(this,arguments)}}
 // ---- trades: only with friends for under 13 ----
 const friend=u=>{try{return!!(mp().friends&&mp().friends[u])}catch(e){return false}};
 if(window.SQTRREQ){const _t=SQTRREQ;window.SQTRREQ=u=>{if(API.child()&&!friend(u)){say('You can trade with friends. Add them as a friend first.');return}return _t(u)}}
 // ---- the PHRASES button in the chat box ----
 function addBtn(){const f=document.getElementById('mpf');if(!f||f.querySelector('.agph'))return;const b=document.createElement('button');b.type='button';b.className='agph';b.textContent='PHRASES';b.setAttribute('aria-expanded','false');
  const list=document.createElement('div');list.id='agpl';list.setAttribute('role','list');
  for(const p of PHRASES){const x=document.createElement('button');x.type='button';x.textContent=p;x.setAttribute('role','listitem');x.onclick=()=>{list.classList.remove('on');b.setAttribute('aria-expanded','false');(window.mpSend||(()=>{}))(p)};list.appendChild(x)}
  b.onclick=()=>{const on=list.classList.toggle('on');b.setAttribute('aria-expanded',on?'true':'false')};
  f.insertBefore(b,f.querySelector('button[type="submit"]'));f.after(list);
  document.getElementById('mpi').addEventListener('click',()=>{if(API.child()){list.classList.add('on');b.setAttribute('aria-expanded','true')}});apply()}
 addBtn();setTimeout(addBtn,1500)})();
