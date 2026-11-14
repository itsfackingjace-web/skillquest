// ---------------------------------------------------------------- 61. Multiplayer (Firebase): Google sign-in, account saves, other players, chat
// Only runs on the hosted copy (GitHub Pages), never inside the Claude artifact (that copy keeps its own account save).
// - Sign in with Google (ONLINE button). Your save goes to saves/<uid> as one JSON string; the cross-device rules from
//   section 8 apply unchanged (newest save wins, never overwrite another device's newer progress).
// - Everyone online shares one world: presence/<uid> holds where you are (Hollow or a region; indoors and dungeons are
//   private), your look and your name. Other players are drawn y-sorted with everything else, their names float
//   over their heads, and chat messages appear over the speaker's head in yellow.
// - Chat: chat/<id>, RuneScape-style box with All / Public / Game tabs; Game repeats the game's own messages.
// - Your skills, quests, items and world progress stay yours: nothing here changes what anyone else has.
{
const MP={og:{},ogTold:false,on:false,user:null,players:new Map(),log:[],tab:'all',seen:new Set(),unsub:[],off:0,T:null,Tat:0,selfSaid:null,lastSend:0,unread:0,open:false};
const FBV='10.12.2',FBC={apiKey:"AIzaSyDqKBIszPeg7y-cto-YRDzgPUfENSVXPjk",authDomain:"skillquest-913e2.firebaseapp.com",
 databaseURL:"https://skillquest-913e2-default-rtdb.firebaseio.com",projectId:"skillquest-913e2",storageBucket:"skillquest-913e2.firebasestorage.app",
 messagingSenderId:"711983472658",appId:"1:711983472658:web:43c695d15a29386c1ef8cb"};
const MP_OK=/^https?:$/.test(location.protocol)&&!(window.claude&&window.claude.use);
// Account-only saves (on skillquestmmo.com, and the Windows app, which loads it): you sign in to play, your Google account's
// save is THE save, and only one device or tab plays an account at a time. The newest session claims sess/<uid> {id,t};
// a session that loses it stops (overlay, PLAY HERE takes it back) and the database refuses saves from it (saves.sid must
// match sess.id). This device's own copy is only a cache. Tests elsewhere can opt in with localStorage sq_strict=1.
const STRICT=MP_OK&&(/(^|\.)skillquestmmo\.com$/.test(location.hostname)||(()=>{try{return localStorage.getItem('sq_strict')==='1'}catch(e){return false}})());
const SQSTRICT=STRICT?{sid:Math.random().toString(36).slice(2,10)+Date.now().toString(36),lost:false,ready:false,conn:true,offAt:0,denied:()=>{}}:null;window.SQSTRICT=SQSTRICT;
let FB=null;
const myName=()=>PNAME||((MP.user&&MP.user.displayName)||'').split(' ')[0].replace(/[<>]/g,'').slice(0,10)||'Adventurer';
let mpErrAt=0,mpErrLast='';
const mpErr=e=>{console.warn('[online]',e);const c=String((e&&(e.code||e.message))||'');const denied=/permission/i.test(c);
 const txt=denied?'The online server refused that. The game\'s database rules need updating (Firebase > Realtime Database > Rules).':'Online: '+c.replace(/^auth\//,'').slice(0,60);
 const n=performance.now();if(txt===mpErrLast&&n-mpErrAt<30000)return;mpErrAt=n;mpErrLast=txt;mpLog('game',txt);if(denied)say(txt)};
const mpNow=()=>Date.now()+MP.off;
// ---- where am I (only outdoors is shared) ----
// outdoors (Hollow or a region), public buildings (shops, inns, forges...), caves and dungeon floors are shared; your own house is private
function mpLoc(){if(dead||(typeof TRAVEL49!=='undefined'&&TRAVEL49))return'';if(!SCENE)return'hollow';const R=SCENE.room;if(!R)return'';if(R.region)return'r:'+R.region;
 if(SCENE.house)return houseLocOf(SCENE.house);if(SCENE.id==='home'||!ROOMS[SCENE.id])return'';return'in:'+SCENE.id}
// ---- UI ----
const css=document.createElement('style');css.textContent=`
#mpb{position:fixed;left:8px;top:52%;z-index:30;min-width:72px;height:40px;padding:0 10px;background:#f8f8f8;color:#404040;border:3px solid #485870;box-shadow:inset 0 0 0 2px #a8c0e0;font:700 14px ${PF};letter-spacing:1px;cursor:pointer;touch-action:manipulation;
 clip-path:polygon(2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px)}
#mpb i{font-style:normal;color:#3058c8;margin-left:6px}#mpb.unr::after{content:'';position:absolute;right:5px;top:5px;width:6px;height:6px;background:#e04838}
#mpo{position:fixed;left:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 22%);z-index:29;max-width:min(62vw,420px);pointer-events:none;display:flex;flex-direction:column;gap:3px}
#mpo div{background:rgba(248,248,248,.88);border:2px solid #485870;padding:3px 7px;font:500 13px ${PF};color:#404040;transition:opacity .6s;overflow-wrap:anywhere}
#mpo b,#mpl b{color:#3058c8;font-weight:700}#mpl .me b{color:#c04838}#mpl .gm{color:#707070}
#mpchat,#mps{position:fixed;left:8px;right:8px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:60;max-width:520px;margin:0 auto;background:#f8f8f8;color:#404040;font:500 14px ${PF};padding:10px;box-sizing:border-box;display:none}
#mpchat .hd{display:flex;align-items:center;gap:6px;margin-bottom:6px}#mpchat .hd .sp{flex:1;font-size:12px;color:#707070;text-align:right}
#mpchat button,#mps button{font:700 13px ${PF};color:#404040;background:#f8f8f8;border:2px solid #485870;padding:6px 10px;cursor:pointer;touch-action:manipulation}
#mpchat .tb.on{background:#485870;color:#f8f8f8}#mpchat .x{padding:6px 11px}
#mpl{height:min(34vh,260px);overflow-y:auto;border:2px solid #a8c0e0;padding:6px;background:#fff;display:flex;flex-direction:column;gap:3px;overflow-wrap:anywhere}
#mpf{display:flex;gap:6px;margin-top:8px}#mpi{flex:1;min-width:0;font:500 16px ${PF};padding:6px 8px;border:2px solid #485870;background:#fff;color:#404040;border-radius:0}
#mps{text-align:center}#mps p{margin:8px 0 12px;line-height:1.4}#mps .bt{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}#mps .pri{background:#485870;color:#f8f8f8}
#mpchat .ogc,#mpo .ogc{width:18px;height:14px;image-rendering:pixelated;vertical-align:-1px;margin-right:4px}#mpchat .so{font-size:11px;padding:4px 7px}`;document.head.appendChild(css);
const el=(t,id,cls,html)=>{const e=document.createElement(t);if(id)e.id=id;if(cls)e.className=cls;if(html)e.innerHTML=html;return e};
const btn=el('button','mpb','',''),ov=el('div','mpo'),pc=el('div','mpchat','g3',
 '<div class="hd"><button class="tb" data-t="all">All</button><button class="tb" data-t="pub">Public</button><button class="tb" data-t="game">Game</button><span class="sp" id="mpn"></span><button class="x" id="mpx" aria-label="Close chat">X</button></div>'+
 '<div id="mpl"></div><form id="mpf" autocomplete="off"><input id="mpi" maxlength="80" placeholder="Say something..." enterkeyhint="send" aria-label="Chat message"><button type="submit">SEND</button></form>'+
 '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:11px;color:#707070"><span id="mpu"></span><button type="button" class="so" id="mpso">Sign out</button></div>'),
 sg=el('div','mps','g3','<div style="font-weight:700;font-size:17px;letter-spacing:2px">PLAY ONLINE</div><p>Sign in with Google to see other players, chat, and keep your progress in your account on any device.</p><div class="bt"><button class="pri" id="mpgo">SIGN IN WITH GOOGLE</button><button id="mpno">NOT NOW</button></div>');
for(const e of[btn,ov,pc,sg])document.body.appendChild(e);
const stop=e=>e.stopPropagation();
for(const e of[btn,pc,sg])for(const ev of['touchstart','pointerdown','mousedown','keydown','keyup'])e.addEventListener(ev,stop);
const $=id=>document.getElementById(id),lst=$('mpl'),inp=$('mpi');
function mpClearKeys(){try{for(const k in K)K[k]=0}catch(e){}}
function mpOpenChat(){if(!MP.on){sg.style.display='block';return}MP.open=true;MP.unread=0;pc.style.display='block';mpRList();mpClearKeys();setTimeout(()=>inp.focus(),30)}
function mpCloseChat(){MP.open=false;pc.style.display='none';inp.blur()}
btn.onclick=()=>MP.open?mpCloseChat():mpOpenChat();
$('mpx').onclick=mpCloseChat;$('mpno').onclick=()=>{sg.style.display='none'};
$('mpgo').onclick=()=>{sg.style.display='none';mpSignIn()};
$('mpso').onclick=async()=>{mpCloseChat();if(STRICT)try{await saveCloud(true)}catch(e){}await mpStop(true);try{await FB.auth.signOut(FB.A)}catch(e){}say(STRICT?'Signed out.':'Signed out. Playing offline.')};
pc.querySelectorAll('.tb').forEach(b=>b.onclick=()=>{MP.tab=b.dataset.t;mpRList()});
// the game's keyboard handlers (capture phase on document) would swallow Enter, so the chat box gets the key first
addEventListener('keydown',e=>{if(e.target!==inp){const t=e.target;if(t&&t.tagName==='INPUT'&&t.closest&&t.closest('#mpchat')){e.stopImmediatePropagation();if(e.key==='Enter'&&!e.isComposing){e.preventDefault();const f=t.closest('form');if(f)f.requestSubmit()}else if(e.key==='Escape'){e.preventDefault();mpCloseChat()}}return}e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();mpCloseChat()}else if(e.key==='Enter'&&!e.isComposing){e.preventDefault();(window.mpSend||mpSend)(inp.value);inp.value=''}},true);
addEventListener('keyup',e=>{if(e.target===inp)e.stopImmediatePropagation()},true);
inp.addEventListener('focus',mpClearKeys);
$('mpf').onsubmit=e=>{e.preventDefault();(window.mpSend||mpSend)(inp.value);inp.value=''};
// PC: Enter opens the chat
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||MP.open||!MP.on)return;const tg=e.target;if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'))return;if(pnOpen||menuOpen||chessOpen)return;e.preventDefault();mpOpenChat()});
function mpRBtn(){const n=[...MP.players.values()].filter(live).length+1;btn.innerHTML=MP.on?'CHAT<i>'+n+'</i>':'ONLINE';btn.classList.toggle('unr',MP.on&&MP.unread>0&&!MP.open);
 const nn=$('mpn');if(nn)nn.textContent=MP.on?n+' online':'';const u=$('mpu');if(u){u.textContent=MP.user?'Signed in as '+myName():'';if(MP.user&&isOG(MP.user.uid)){u.prepend(crownImg());u.append(' · OG #'+ogRank(MP.user.uid))}}}
function mpLine(m){const d=document.createElement('div');if(m.k==='game'){d.className='gm';d.textContent=m.m}else{if(m.me)d.className='me';const b=document.createElement('b');b.textContent=m.n+': ';if(isOG(m.uid))d.append(crownImg());d.append(b,document.createTextNode(m.m))}return d}
function mpRList(){pc.querySelectorAll('.tb').forEach(b=>b.classList.toggle('on',b.dataset.t===MP.tab));lst.textContent='';
 for(const m of MP.log)if(MP.tab==='all'||m.k===MP.tab)lst.appendChild(mpLine(m));lst.scrollTop=lst.scrollHeight;mpRBtn()}
function mpROv(){const now=performance.now(),hide=MP.open||pnOpen||menuOpen||chessOpen,recent=MP.log.filter(m=>m.k==='pub'&&now-m.at<12000).slice(-3);
 ov.style.display=hide||TS.open?'none':'flex';btn.style.display=(pnOpen||menuOpen||chessOpen||TS.open)?'none':'block';
 const key=recent.map(m=>m.id).join(',');if(key!==ov.dataset.k){ov.dataset.k=key;ov.textContent='';for(const m of recent){const d=mpLine(m);d.dataset.at=m.at;ov.appendChild(d)}}
 for(const d of ov.children){const a=now-(+d.dataset.at);d.style.opacity=a>10000?'0':'1'}}
function mpLog(k,m,extra){const e=Object.assign({k,m,at:performance.now(),id:Math.random().toString(36).slice(2)},extra||{});MP.log.push(e);
 // each tab keeps its own last 100 lines (game messages used to push public chat out of the history)
 {let n=0;for(let i=MP.log.length-1;i>=0;i--)if(MP.log[i].k===k&&++n>100){MP.log.splice(i,1);break}}if(MP.log.length>450)MP.log.shift();
 if(MP.open&&(MP.tab==='all'||MP.tab===k)){lst.appendChild(mpLine(e));while(lst.children.length>120)lst.firstChild.remove();lst.scrollTop=lst.scrollHeight}}
// the game's own messages go to the Game tab
const _say61=say;let lastGame='',lastGameAt=0;say=function(s){_say61(s);const t=String(s||'');const n=performance.now();if(t&&(t!==lastGame||n-lastGameAt>4000)){lastGame=t;lastGameAt=n;mpLog('game',t)}};
// ---- OG crown: players who first signed in before the cutoff (server-enforced in database.rules.json) ----
const OG_CUTOFF=1796277600000; // Dec 3, 2026 00:00 Central
const CROWN=['Y..Y..Y','YY.Y.YY','YYYYYYY','YYYRYYY','DDDDDDD'],CRC={Y:'#f8d048',R:'#e04838',D:'#c89020'};
const crownCv=(()=>{const c=document.createElement('canvas');c.width=9;c.height=7;const x=c.getContext('2d'),on=(i,j)=>j>=0&&j<5&&i>=0&&i<7&&CROWN[j][i]!=='.';
 for(let j=-1;j<=5;j++)for(let i=-1;i<=7;i++){if(on(i,j)){x.fillStyle=CRC[CROWN[j][i]];x.fillRect(i+1,j+1,1,1)}else if(on(i-1,j)||on(i+1,j)||on(i,j-1)||on(i,j+1)){x.fillStyle='#402808';x.fillRect(i+1,j+1,1,1)}}return c})();
const crownURL=crownCv.toDataURL();
const isOG=uid=>!!(uid&&MP.og[uid]);
function ogRank(uid){const t=MP.og[uid];if(!t)return 0;let n=1;for(const k in MP.og){const v=MP.og[k];if(v<t||(v===t&&k<uid))n++}return n}
const crownImg=()=>{const i=document.createElement('img');i.src=crownURL;i.alt='OG';i.title='OG';i.className='ogc';return i};
// ---- Linking this device's save to your account ----
// This device remembers which account its save belongs to (sq_acct). The first time a device meets an account that already
// has a different save, the player chooses which one to keep, and the other is backed up on this device (sq_bak_*).
// Once linked, the cross-device rule from section 8 applies (newest save wins, another device's newer save is adopted).
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
function mpBackup(tag,S){try{const keys=Object.keys(localStorage).filter(k=>k.startsWith('sq_bak_')).sort();while(keys.length>=4)localStorage.removeItem(keys.shift());
 localStorage.setItem('sq_bak_'+Date.now()+'_'+tag,JSON.stringify(S))}catch(e){}cloudBak(tag,S)}
// the same backups also go to your account (bak/<uid>, the last 8), so any device can restore them (Options → Backups)
function cloudBak(tag,S){try{window.sqCloudBak&&sqCloudBak(tag,S)}catch(e){}}
const lvFromXp=x=>{let l=1;while(l<99&&(+x||0)>=XT[l])l++;return l};
function saveInfo(S){const xp=Array.isArray(S.xp)?S.xp:[];let tl=0;for(let i=0;i<SKN.length;i++)tl+=lvFromXp(xp[i]);
 const qi=Math.max(0,+(S.q&&S.q.i)||0);return{name:String(S.name||'?').slice(0,10),tl,q:Math.min(qi,QS.length),gold:Math.max(0,+S.gold||0),at:+S.savedAt||0,
  inv:S.inv?Object.values(S.inv).reduce((a,v)=>a+(+v||0),0):0}}
const ago=t=>{if(!t)return'unknown';const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' days ago'};
const localHasProgress=()=>!!(hadLocal||oldPlayer||PNAME&&!menuOpen);
async function mpLinkSave(uid,adapter){const r=await adapter.get(),linked=lsGet('sq_acct')===uid;
 const done=()=>{lsSet('sq_acct',uid);cloud=adapter;if(TS&&TS.open)TS.mh=''};
 // switching to a different Google account on this device: this device's save belongs to the other account (it's in
 // that account's cloud save, and backed up here), so load this account's own save, or start it fresh
 const prev=lsGet('sq_acct');if(prev&&prev!==uid&&localHasProgress()){const L=snap();L.savedAt=LOCAL_AT;try{mpBackup('device',L)}catch(e){}
  let S=null;if(r.exists){try{S=JSON.parse(JSON.stringify(r.data()))}catch(e){}}
  if(S&&S.v==1){applySave(S);hideCreator();say('Switched account: loaded this account\'s save.');saveLocal(true);lastCloud=keyOf(snap());syncMark(S);done();return}
  try{localStorage.removeItem('sq_spf')}catch(e){}newGame();done();say('Switched account: this account has no save yet, so make a new character.');return}
 if(!r.exists){done();if(localHasProgress())saveCloud(true);return}
 const S=JSON.parse(JSON.stringify(r.data()));if(S.v!=1){done();return}
 if(!localHasProgress()){applySave(S);hideCreator();say('Progress loaded from your account');saveLocal(true);lastCloud=keyOf(snap());syncMark(S);done();return}
 const L=snap();L.savedAt=LOCAL_AT;
 if(keyOf(L)===keyOf(S)){lastWid=wOf(S);syncMark(S);done();return}
 if(linked){ // same account as before: newest wins (another device's newer progress is adopted)
  const d=syncDecide(L,S);if(d==='adopt'){mpBackup('device',L);applySave(S);hideCreator();say('Synced progress from your account');saveLocal(true);lastCloud=keyOf(snap());syncMark(S);done();return}
  if(d==='push'){saveCloud(true);done();return}
  // both changed, or the account save is behind this one: the player picks (the other is backed up)
  mpChooseSave(L,S,pick=>{if(pick==='account'){mpBackup('device',L);applySave(S);hideCreator();say('Loaded your account save. This device\'s save is backed up (Options → Backups).');saveLocal(true);lastCloud=keyOf(snap());syncMark(S)}
   else{mpBackup('account',S);lastWid=wOf(S);LOCAL_AT=Date.now();done();saveCloud(true);say('Kept this device\'s save. The other one is backed up (Options → Backups).');return}done()});return}
 // first time this device meets this account and both have different progress: ask
 mpChooseSave(L,S,pick=>{if(pick==='account'){mpBackup('device',L);applySave(S);hideCreator();say('Loaded your account save. This device\'s old save is backed up (Options → Backups).');saveLocal(true);lastCloud=keyOf(snap());syncMark(S)}
  else{mpBackup('account',S);LOCAL_AT=Date.now();lastWid=wOf(S);done();saveCloud(true);say('Kept this device\'s save. It is now your account save.');return}done()})}
function mpChooseSave(L,S,cb){const a=saveInfo(L),b=saveInfo(S);const box=el('div','mpsave','g3');
 const card=(k,t,i)=>'<button class="sv" data-k="'+k+'"><b>'+t+'</b><span>Player</span><span>'+esc(i.name)+'</span><span>Total level</span><span>'+i.tl+'</span><span>Quest</span><span>'+i.q+' / '+QS.length+'</span><span>Gold</span><span>'+i.gold+'</span><span>Saved</span><span>'+ago(i.at)+'</span></button>';
 box.innerHTML='<div class="h">WHICH SAVE DO YOU WANT?</div><p>This device and your account have different progress. Pick the one to keep. The other is backed up on this device.</p>'+card('device','THIS DEVICE',a)+card('account','YOUR ACCOUNT',b);
 document.body.appendChild(box);for(const ev of['touchstart','pointerdown','mousedown','keydown','keyup'])box.addEventListener(ev,stop);
 MP.choose=box;box.onclick=e=>{const c=e.target.closest('.sv');if(!c)return;box.remove();MP.choose=null;setFocus(null);cb(c.dataset.k)}}
{const st=document.createElement('style');st.textContent=`#mpsave{position:fixed;left:8px;right:8px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:96;max-width:520px;margin:0 auto;background:#f8f8f8;color:#404040;font:500 14px ${PF};padding:14px;box-sizing:border-box;max-height:calc(100vh - 16px);overflow-y:auto}
#mpsave .h{font-weight:700;font-size:17px;letter-spacing:1px;text-align:center}#mpsave p{line-height:1.4;margin:8px 0 12px}
#mpsave .sv{display:grid;grid-template-columns:auto 1fr;gap:3px 14px;width:100%;text-align:left;margin-top:10px;padding:12px 14px;background:#fff;border:3px solid #485870;font:500 14px ${PF};color:#404040;cursor:pointer}
#mpsave .sv b{grid-column:1/-1;font-size:15px;letter-spacing:1px;margin-bottom:4px;color:#3058c8}#mpsave .sv span:nth-of-type(2n){text-align:right;font-weight:700}
#mpsave .sv.gpf,#mpsave .sv:hover{box-shadow:inset 0 0 0 3px #f8a020}`;document.head.appendChild(st)}
// ---- Firebase ----
async function mpLoad(){const b='https://www.gstatic.com/firebasejs/'+FBV+'/';
 const[app,auth,db]=await Promise.all([import(b+'firebase-app.js'),import(b+'firebase-auth.js'),import(b+'firebase-database.js')]);
 const a=app.initializeApp(FBC);FB={auth,db,A:auth.getAuth(a),D:db.getDatabase(a)};window.SQFB=FB;
 try{await auth.getRedirectResult(FB.A)}catch(e){mpErr(e);gsiNote(e)}
 try{await gsiReturn()}catch(e){mpErr(e);gsiNote(e)}
 auth.onAuthStateChanged(FB.A,u=>{if(u)mpStart(u).catch(mpErr);else mpStop(false)})}
// ---- Google sign-in ----
// Phones (iPhone Safari, the Home Screen app) block the storage Firebase's own redirect sign-in needs, so the sign-in
// would finish at Google and then quietly drop you back on the title screen. There we send you to Google ourselves and
// come straight back to this page with your Google ID token, then hand it to Firebase.
const GSI={id:'711983472658-56o2oshpk2ld2c3bj3pepjq5li2red7c.apps.googleusercontent.com',ready:true,
 on:()=>GSI.ready&&location.hostname==='skillquestmmo.com',
 phone:()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)||!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches))};
function gsiNote(e){const c=String((e&&(e.code||e.message))||e||'');if(/popup-closed|cancelled-popup/.test(c))return;
 let d=document.getElementById('gsinote');if(!d){d=document.createElement('div');d.id='gsinote';d.style.cssText='position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);max-width:460px;margin:0 auto;z-index:999;background:#f8f8f8;color:#404040;border:3px solid #c04040;padding:10px 12px;font:500 14px '+PF+';line-height:1.35;text-align:center';d.onclick=()=>d.remove();document.body.appendChild(d)}
 d.textContent='Google sign-in didn\'t finish ('+c.replace(/^auth\//,'').slice(0,70)+'). Tap Sign in to try again. Tap to close.';clearTimeout(d._t);d._t=setTimeout(()=>d.remove(),12000)}
const gsiRand=()=>{const a=new Uint8Array(16);crypto.getRandomValues(a);return[...a].map(b=>b.toString(16).padStart(2,'0')).join('')};
function gsiGo(){const st=gsiRand(),no=gsiRand();try{localStorage.setItem('sq_gsi',JSON.stringify({st,no,t:Date.now()}))}catch(e){}
 location.href='https://accounts.google.com/o/oauth2/v2/auth?'+new URLSearchParams({client_id:GSI.id,redirect_uri:location.origin+'/',response_type:'id_token',scope:'openid email profile',nonce:no,state:st,prompt:'select_account'})}
// the Windows app signs in through your browser: it opens skillquestmmo.com/?desktop=PORT&st=CODE, we sign in with Google
// here, then hand the sign-in to the app on this PC (http://127.0.0.1:PORT) instead of signing this browser in
function gsiDeskStart(){const sp=new URLSearchParams(location.search),dp=sp.get('desktop'),dst=sp.get('st')||'';if(!dp)return false;try{history.replaceState(null,'',location.pathname)}catch(e){}
 if(!/^\d{2,5}$/.test(dp)||!/^[0-9a-f]{32}$/.test(dst)||!GSI.on())return false;try{localStorage.setItem('sq_desk',JSON.stringify({p:dp,st:dst,t:Date.now()}))}catch(e){return false}gsiGo();return true}
function gsiDeskEnd(q){let d=null;try{d=JSON.parse(localStorage.getItem('sq_desk')||'null');localStorage.removeItem('sq_desk')}catch(e){}if(!d||Date.now()-d.t>600000||!/^\d{2,5}$/.test(d.p))return false;
 const o={st:d.st};if(q.get('id_token'))o.id_token=q.get('id_token');else o.error=q.get('error')||'failed';location.replace('http://127.0.0.1:'+d.p+'/cb#'+new URLSearchParams(o));return true}
async function gsiReturn(){if(gsiDeskStart())return;const h=location.hash;if(!/[#&](id_token|error)=/.test(h))return;const q=new URLSearchParams(h.slice(1));try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
 let saved=null;try{saved=JSON.parse(localStorage.getItem('sq_gsi')||'null');localStorage.removeItem('sq_gsi')}catch(e){}
 if(localStorage.getItem('sq_desk')&&gsiDeskEnd(q))return;if(q.get('error')){if(q.get('error')!=='access_denied')gsiNote(q.get('error'));return}
 if(saved&&q.get('state')!==saved.st)throw new Error('sign-in check failed');
 await FB.auth.signInWithCredential(FB.A,FB.auth.GoogleAuthProvider.credential(q.get('id_token')))}
window.SQGSI=GSI;
function mpSignIn(){if(!FB){say('Still connecting to the server... try again in a moment.');return}
 // in the Windows app: sign in through your browser, then come back here
 if(window.sqDesktop&&sqDesktop.signIn){say('Finish signing in with Google in your web browser, then come back here.');sqDesktop.signIn().then(r=>{if(r&&r.idToken)return FB.auth.signInWithCredential(FB.A,FB.auth.GoogleAuthProvider.credential(r.idToken));if(r&&r.error&&r.error!=='cancelled')gsiNote(r.error)}).catch(e=>{mpErr(e);gsiNote(e)});return}if(GSI.on())return gsiGo();const A=FB.auth,p=new A.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
 A.signInWithPopup(FB.A,p).catch(e=>{const c=e&&e.code||'';if(c==='auth/popup-blocked'||c==='auth/operation-not-supported-in-this-environment'){if(GSI.on())gsiGo();else A.signInWithRedirect(FB.A,p).catch(e=>{mpErr(e);gsiNote(e)})}else if(c!=='auth/popup-closed-by-user'&&c!=='auth/cancelled-popup-request'){mpErr(e);gsiNote(e)}})}
window.sqCloudBak=(tag,S)=>{const u=MP.user;if(!FB||!u||!S||S.v!=1)return Promise.resolve(false);const d=FB.db,D=FB.D,base='bak/'+u.uid;
 return d.set(d.ref(D,base+'/'+Date.now()+'_'+String(tag).slice(0,12)),{json:JSON.stringify(S),at:Date.now(),tag:String(tag).slice(0,12)}).then(async()=>{
  const s=await d.get(d.ref(D,base));if(!s.exists())return true;const ks=Object.keys(s.val()).sort();while(ks.length>8)await d.remove(d.ref(D,base+'/'+ks.shift()));return true}).catch(e=>{mpErr(e);return false})};
window.sqCloudBakList=async()=>{const u=MP.user;if(!FB||!u)return null;const d=FB.db,D=FB.D;const s=await d.get(d.ref(D,'bak/'+u.uid));if(!s.exists())return[];const v=s.val(),out=[];
 for(const k of Object.keys(v).sort().reverse()){let S=null;try{S=JSON.parse(v[k].json)}catch(e){}if(S&&S.v==1)out.push({k,at:+v[k].at||0,tag:v[k].tag||'',S})}return out};
// ---- account-only saves: the session lock, loading, losing the account to another device ----
async function sqClaim(uid){const d=FB.db;await d.set(d.ref(FB.D,'sess/'+uid),{id:SQSTRICT.sid,t:Date.now()});SQSTRICT.lost=false}
function sqWatch(uid){const d=FB.db;MP.unsub.push(d.onValue(d.ref(FB.D,'sess/'+uid),s=>{const v=s.val();if(v&&v.id&&v.id!==SQSTRICT.sid&&!SQSTRICT.lost&&MP.user&&MP.user.uid===uid)sqLost()}));
 MP.unsub.push(d.onValue(d.ref(FB.D,'.info/connected'),s=>{const c=s.val()===true;if(!c&&SQSTRICT.conn)SQSTRICT.offAt=Date.now();SQSTRICT.conn=c}))}
SQSTRICT&&(SQSTRICT.denied=async()=>{try{const u=MP.user;if(!u||SQSTRICT.lost)return;const s=await FB.db.get(FB.db.ref(FB.D,'sess/'+u.uid));const v=s.val();if(!v||v.id!==SQSTRICT.sid)sqLost()}catch(e){}});
// what to load when you sign in: the account save, except (a) the very first time under these rules, when the save with more
// progress wins (the other one is backed up), and (b) when this device's save continues the account save exactly (made after
// it, from it: bw = its wid) and simply hadn't reached the account yet. A save on this device from another account is never used.
function bakLocalOnly(tag,S){try{const keys=Object.keys(localStorage).filter(k=>k.startsWith('sq_bak_')).sort();while(keys.length>=4)localStorage.removeItem(keys.shift());localStorage.setItem('sq_bak_'+Date.now()+'_'+tag,JSON.stringify(S))}catch(e){}}
async function mpLinkStrict(uid,adapter){const r=await adapter.get();let S=r.exists?r.data():null;if(S&&S.v!=1)S=null;
 const prev=lsGet('sq_acct'),has=localHasProgress();let L=null;
 if(has){L=snap();L.savedAt=LOCAL_AT;const bw=lastWid&&lastWid!=='legacy'?lastWid:(typeof BOOT_LOCAL!=='undefined'&&BOOT_LOCAL&&BOOT_LOCAL.bw)||null;L.bw=bw}
 const mine=!!L&&(!prev||prev===uid);let pick;
 if(!S)pick=mine?'local':'none';else if(!L)pick='account';else if(!mine)pick='account';else if(keyOf(L)===keyOf(S))pick='same';
 else if(S.as)pick=L.bw&&L.bw===S.wid&&(+L.savedAt||0)>(+S.savedAt||0)?'local':'account';
 else{const a=sqXpSum(L),b=sqXpSum(S);pick=a>b||a===b&&(+L.savedAt||0)>(+S.savedAt||0)?'local':'account'}
 if(L&&(pick==='account'||pick==='none')&&!(S&&keyOf(L)===keyOf(S))){if(mine)mpBackup('device',L);else bakLocalOnly('other',L)}
 if(pick==='local'&&S)mpBackup('account',S);
 if(pick==='account'){applySave(S);hideCreator();say('Progress loaded from your account.')}
 else if(pick==='none'){if(L)newGame();say('Welcome! Make your character: it\'s saved to your Google account.')}
 else if(pick==='same')lastWid=wOf(S);
 lsSet('sq_acct',uid);cloud=adapter;SQSTRICT.ready=true;SQSTRICT.pick=pick;if(TS&&TS.open)TS.mh='';
 try{localStorage.removeItem('sq_spf')}catch(e){}
 saveLocal(true);if(pick!=='none')await saveCloud(true)}
let lostBox=null;
function sqLost(){SQSTRICT.lost=true;cloud=null;try{if(BUILD)endBuild()}catch(e){}FISH=null;
 if(!lostBox){lostBox=document.createElement('div');lostBox.id='sqlost';lostBox.innerHTML='<div class="sqlb"><div class="h">PLAYING ON ANOTHER DEVICE</div><p>Your account was opened on another device or tab, so this one has stopped. Your progress is saved there.</p><button data-a="here">PLAY HERE INSTEAD</button></div>';
  for(const ev of['touchstart','pointerdown','mousedown','keydown','keyup'])lostBox.addEventListener(ev,e=>e.stopPropagation());
  lostBox.querySelector('button').onclick=sqTakeBack;document.body.appendChild(lostBox)}
 lostBox.style.display='flex';try{mpLog('game','Your account was opened somewhere else, so this game stopped.')}catch(e){}}
async function sqTakeBack(){const b=lostBox.querySelector('button'),u=MP.user;if(!u||!MP.adapter){b.textContent='SIGN IN AGAIN';tsReopen();lostBox.style.display='none';return}
 b.disabled=true;b.textContent='LOADING...';
 try{await sqClaim(u.uid);const r=await MP.adapter.get();const S=r.exists?r.data():null;if(S&&S.v==1){applySave(S);hideCreator()}cloud=MP.adapter;SQSTRICT.lost=false;lostBox.style.display='none';
  saveLocal(true);say('Playing here. Your latest progress is loaded.');msgT=4}catch(e){mpErr(e);SQSTRICT.lost=true;say('Couldn\'t take over. Check your connection.')}
 b.disabled=false;b.textContent='PLAY HERE INSTEAD'}
if(STRICT){const st=document.createElement('style');st.textContent=`#sqlost{position:fixed;inset:0;z-index:120;display:none;align-items:center;justify-content:center;background:rgba(8,12,24,.72)}
#sqlost .sqlb{max-width:420px;margin:12px;background:#f8f8f8;color:#404040;border:4px solid #485870;box-shadow:inset 0 0 0 3px #a8c0e0;padding:16px;font:500 15px ${PF};text-align:center;line-height:1.4}
#sqlost .h{font-weight:700;font-size:17px;letter-spacing:1px;margin-bottom:8px}#sqlost button{margin-top:12px;width:100%;padding:12px;background:#fff;border:3px solid #485870;font:700 16px ${PF};color:#3058c8;cursor:pointer}
#sqoff{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 6px);transform:translateX(-50%);z-index:60;background:#f8e8c0;color:#5a3a10;border:2px solid #a87830;padding:3px 10px;font:700 12px ${PF};display:none;pointer-events:none}`;document.head.appendChild(st);
 const off=document.createElement('div');off.id='sqoff';off.textContent='Not saved: reconnecting...';document.body.appendChild(off);
 setInterval(()=>{const show=MP.on&&SQSTRICT.ready&&!SQSTRICT.conn&&!SQSTRICT.lost&&!(TS&&TS.open)&&Date.now()-SQSTRICT.offAt>4000;off.style.display=show?'block':'none'},500);
 // a stopped game stands still and writes nothing, not even to this device
 const _u=upd;upd=function(dt){if(SQSTRICT.lost)return;return _u.apply(this,arguments)};
 const _sl=saveLocal;saveLocal=function(){if(SQSTRICT.lost)return;return _sl.apply(this,arguments)}}
async function mpStart(u){if(MP.user&&MP.user.uid===u.uid&&MP.on)return;MP.user=u;const d=FB.db,D=FB.D,uid=u.uid;
 // account save: one JSON string per player
 const sref=d.ref(D,'saves/'+uid);
 const adapter={async get(){const s=await d.get(sref);if(!s.exists())return{exists:false,data:()=>null};let v=null;try{v=JSON.parse(s.val().json)}catch(e){}return{exists:!!v,data:()=>v}},
  async set(s){await d.set(sref,Object.assign({json:JSON.stringify(s),savedAt:+s.savedAt||Date.now()},STRICT?{sid:SQSTRICT.sid}:{}))}};
 MP.adapter=adapter;
 if(STRICT){try{await sqClaim(uid);await mpLinkStrict(uid,adapter);sqWatch(uid)}catch(e){mpErr(e);say('Couldn\'t load your save. Check your connection and try again.')}}
 else try{await mpLinkSave(uid,adapter)}catch(e){mpErr(e)}
 try{const kd='sq_dbak_'+uid,last=+lsGet(kd)||0;if(Date.now()-last>20*3600e3){const r=await adapter.get();if(r.exists){const S=r.data();if(S&&S.v==1&&await sqCloudBak('daily',S))lsSet(kd,String(Date.now()))}}}catch(e){}
 // presence
 MP.pref=d.ref(D,'presence/'+uid);MP.last='';MP.lastCh='';MP.lastN='';
 MP.unsub.push(d.onValue(d.ref(D,'.info/serverTimeOffset'),s=>{MP.off=+s.val()||0}));
 MP.unsub.push(d.onValue(d.ref(D,'.info/connected'),s=>{if(s.val()===true&&MP.on){d.onDisconnect(MP.pref).remove().catch(()=>{});MP.last='';MP.lastCh=''}}));
 const pr=d.ref(D,'presence');
 MP.unsub.push(d.onChildAdded(pr,s=>mpPeer(s.key,s.val())),d.onChildChanged(pr,s=>mpPeer(s.key,s.val())),d.onChildRemoved(pr,s=>{MP.players.delete(s.key);mpRBtn()}));
 // chat (the last 25 messages, then live)
 MP.unsub.push(d.onChildAdded(d.query(d.ref(D,'chat'),d.limitToLast(50)),s=>mpChat(s.key,s.val())));
 // OG list: everyone who first signed in before the cutoff (written once, by the server's clock; nobody can change it)
 MP.unsub.push(d.onValue(d.ref(D,'og'),s=>{const v=s.val()||{};MP.og={};for(const k in v)if(typeof v[k]==='number')MP.og[k]=v[k];
  if(isOG(uid)&&!MP.ogTold){MP.ogTold=true;mpLog('game','You are OG #'+ogRank(uid)+'! Your crown is permanent.')}
  if(MP.open)mpRList();else mpRBtn()}));
 try{const mine=await d.get(d.ref(D,'og/'+uid));if(!mine.exists()&&mpNow()<OG_CUTOFF){await d.set(d.ref(D,'og/'+uid),d.serverTimestamp());say('Welcome, OG! You joined SkillQuest early, so you get a permanent crown.')}}catch(e){}
 MP.on=true;mpRBtn();say('Online as '+myName()+'!')}
async function mpStop(manual){const was=MP.on;MP.on=false;for(const f of MP.unsub)try{f()}catch(e){}MP.unsub=[];
 if(manual&&MP.pref)try{await FB.db.remove(MP.pref)}catch(e){}
 MP.players.clear();try{mobStop()}catch(e){}MP.pref=null;MP.user=null;if(cloud&&cloud===MP.adapter)cloud=null;if(was)mpCloseChat();mpRBtn();
 if(STRICT){const wasReady=SQSTRICT.ready;SQSTRICT.ready=false;if(lostBox)lostBox.style.display='none';SQSTRICT.lost=false;if(wasReady&&!TS.open)try{tsReopen()}catch(e){}TS.mh=''}}
// ---- other players ----
const live=r=>performance.now()-r.seen<20000;
const cleanCh=c=>{const o={};if(c&&typeof c==='object')for(const k in c){const v=c[k];if(typeof v==='number'&&isFinite(v))o[k]=Math.max(0,Math.min(99,v|0))}
 // the gear with a new look that this player wears (drawn from the asset library): item keys only (the database may hand an array back as an object)
 if(c&&c.wr&&typeof c.wr==='object'){const w=Object.values(c.wr).filter(k=>typeof k==='string'&&/^eq_[a-z0-9_]{1,40}$/.test(k)).slice(0,6);if(w.length)o.wr=w}return o};
function mpPeer(k,v){if(!v||!MP.user||k===MP.user.uid)return;if(typeof v.x!=='number'||typeof v.y!=='number')return;let r=MP.players.get(k);
 if(!r){r={uid:k,x:v.x,y:v.y,w:0,said:null};MP.players.set(k,r)}
 if(r.loc!==v.loc||Math.hypot(r.x-v.x,r.y-v.y)>200){r.x=v.x;r.y=v.y}
 r.tx=v.x;r.ty=v.y;r.loc=typeof v.loc==='string'?v.loc:'';r.d=Math.max(0,Math.min(2,v.d|0));r.fl=!!v.fl;r.m=!!v.m;r.sl=!!v.sl;r.ar=typeof v.ar==='string'?v.ar:'';r.pet=typeof v.pet==='string'?v.pet.slice(0,12):'';r.pk=!!v.pk;r.au=!!v.au;r.ak=Math.max(0,Math.min(9,v.ak|0));r.dg=!!v.dg;r.br=!!v.br;{const q=v.fw&&typeof v.fw==='object'?Object.values(v.fw):null;r.fw=q&&q.length===2?[+q[0],+q[1]]:null}r.im=Array.isArray(v.im)?v.im.slice(0,4).map(Number):(v.im&&typeof v.im==='object'?Object.values(v.im).slice(0,4).map(Number):null);r.ax=+v.ax;r.ay=+v.ay;r.pt=typeof v.pt==='string'?v.pt.slice(0,40):'';r.hpv=Math.max(0,Math.min(99,+v.hp||0));r.em=typeof v.em==='string'?v.em.slice(0,16):'';
 r.n=String(v.n||r.n||(MP.prof&&MP.prof[k]&&MP.prof[k].n)||'Adventurer').replace(/[<>]/g,'').slice(0,12);r.ch=cleanCh(v.ch);
 // seen = when they last sent their position, by the server's clock (a player whose game closed without cleaning up leaves
 // an old entry behind: on loading, those count as gone right away instead of looking online for the first 20 seconds)
 r.seen=typeof v.t==='number'?performance.now()-Math.max(0,mpNow()-v.t):-1e9;mpRBtn()}
function mpTick(){if(!MP.on||!MP.pref||MP.passive)return;const d=FB.db,now=performance.now(),loc=mpLoc(),fx=face[0],fy=face[1];
 const op=outdoorPos(),st={n:myName().slice(0,12),loc,x:Math.round(P.x),y:Math.round(P.y),d:fx?2:fy<0?1:0,fl:fx<0?1:0,m:qm?1:0,sl:((typeof SAILING!=='undefined'&&SAILING&&!SCENE)||(window.SQRSAIL&&SQRSAIL.on))?1:0,ar:dead?'':curRegion(),ax:Math.round(op[0]),ay:Math.round(op[1]),pet:(window.LUX&&LUX.pet)?LUX.pet():'',pk:(window.SQPVP&&SQPVP.on&&!dead)?1:0,au:(window.SQAURA&&!dead&&SQAURA())?1:0,dg:(window.SQDF&&SQDF.on&&!dead)?1:0,br:(window.SQDF&&SQDF.br)?1:0,sid:MP.sid,s0:MP.s0,im:(window.SQIMP&&SQIMP.pres())||0,fw:(window.SQFW&&SQFW.pres())||0,ak:(window.SQACT&&SQACT())||0,pt:(window.SQPARTY&&SQPARTY.id)||'',hp:dead?0:Math.max(0,Math.min(99,Math.round(+P.hp||0))),em:(window.SQEMOTE&&SQEMOTE.pres())||''},k=JSON.stringify(st);
 let chk='{}';try{chk=JSON.stringify(gearCH())}catch(e){}const nm=myName();
 if(chk!==MP.lastCh||nm!==MP.lastN){MP.lastCh=chk;MP.lastN=nm;MP.last='';d.update(MP.pref,{ch:JSON.parse(chk),n:nm}).catch(()=>{MP.lastCh=''})}
 if(k!==MP.last||now-MP.beat>5000){MP.last=k;MP.beat=now;d.update(MP.pref,Object.assign(st,{t:d.serverTimestamp()})).catch(()=>{MP.last=''})}}
setInterval(()=>{mpTick();mpROv()},200);
let mpLastF=performance.now();
function mpStepAll(){const n=performance.now(),dt=Math.min(.1,(n-mpLastF)/1000);mpLastF=n;
 for(const r of MP.players.values()){const dx=r.tx-r.x,dy=r.ty-r.y,dd=Math.hypot(dx,dy),k=Math.min(1,dt*9);r.x+=dx*k;r.y+=dy*k;r.mv=dd>.6||r.m;r.w=r.mv?r.w+dt*15:0}}
function mpVis(){if(!MP.on)return[];const loc=mpLoc();if(!loc)return[];const out=[];const rx=W/Z+48,ry=H/Z+64;
 for(const r of MP.players.values())if(r.loc===loc&&live(r)&&Math.abs(r.x-P.x)<rx&&Math.abs(r.y-P.y)<ry)out.push(r);return out}
function mpDrawPeer(r,tm){const x=Math.round(r.x),y=Math.round(r.y),st=r.mv?[1,0,2,0][Math.floor(r.w)%4]:0;GC=g;shd(x,y+6,12);
 try{cP(r.ak?{...r.ch,ak:r.ak}:r.ch,r.d,st,x,y,r.fl)}catch(e){}MP.T=g.getTransform();MP.Tat=performance.now()}
// Hollow: join the y-sorted list
const _lh61=LHOOK;LHOOK=(L,x0,y0,x1,y1,tm)=>{if(_lh61)_lh61(L,x0,y0,x1,y1,tm);mpStepAll();for(const r of mpVis())L.push([r.y+6,4,t=>mpDrawPeer(r,t)])};
// regions: ride along as room items
const _rn61=rgNear;rgNear=function(R,...a){const out=_rn61(R,...a);if(SCENE&&SCENE.room===R){mpStepAll();for(const r of mpVis())out.push({t:'_mp',r,x:r.x/16,y:(r.y+6)/16-1})}return out};
// public buildings: other players join the room's y-sorted list as room items
const _drr61=drawRoom;drawRoom=function(tm){const R=SCENE&&SCENE.room;if(!R||R.region||!MP.on||!/^(in|h):/.test(mpLoc()))return _drr61(tm);
 mpStepAll();const add=mpVis().map(r=>({t:'_mp',r,x:r.x/16,y:(r.y+6)/16-1}));if(!add.length)return _drr61(tm);
 const all=R.items;R.items=all.concat(add);try{_drr61(tm)}finally{R.items=all}};
const _df61=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='_mp'){mpDrawPeer(it.r,tm);return}return _df61(it,tm)};
// remember the world transform every frame (the player is always drawn in world space)
const _pP61=pP;pP=function(tm){MP.T=g.getTransform();MP.Tat=performance.now();return _pP61(tm)};
// names and chat bubbles go over everything, in screen pixels
function mpLabel(txt,X,Y,sz,col){g.font='700 '+sz+'px '+PF;g.textAlign='center';g.textBaseline='alphabetic';g.lineJoin='round';g.lineWidth=Math.max(2,sz/4);g.strokeStyle='#202020';g.strokeText(txt,X,Y);g.fillStyle=col;g.fillText(txt,X,Y)}
const _dh61=drawHUD;drawHUD=function(){_dh61();if(!MP.on||!MP.T||performance.now()-MP.Tat>120||pnOpen||menuOpen)return;
 const u=Math.max(2,Math.round(Math.min(W,H)/160)),sz=Math.round(5*u),now=performance.now(),T=MP.T;g.save();g.setTransform(1,0,0,1,0,0);
 const cs=Math.max(1,Math.round(u*.7));
 const skull=(X,Y)=>{const q=cs,P2=[[1,0,5],[0,1,7],[0,2,7],[0,3,2],[3,3,1],[5,3,2],[1,4,5],[1,5,1],[3,5,1],[5,5,1]];g.fillStyle='#202020';g.fillRect(Math.round(X-q),Math.round(Y-q),9*q,8*q);g.fillStyle='#f8f8f8';for(const[a,b,w]of P2)g.fillRect(Math.round(X+a*q),Math.round(Y+b*q),w*q,q)};
 const one=(x,y,name,said,og,fr,pk)=>{const p=T.transformPoint({x,y:y-27});let Y=p.y;if(pk){g.font='700 '+sz+'px '+PF;const tw=name?g.measureText(name).width:0;skull(p.x+(name?tw/2+u*2:-3.5*cs),Y-sz*.8)}if(name){mpLabel(name,p.x,Y,sz,pk?'#f87060':fr?'#88f088':'#f8f8f8');
   if(og){g.font='700 '+sz+'px '+PF;const tw=g.measureText(name).width;g.imageSmoothingEnabled=false;g.drawImage(crownCv,Math.round(p.x-tw/2-9*cs-u),Math.round(Y-sz*.75),9*cs,7*cs)}Y-=sz+u}
  if(said&&now-said.at<5000)mpLabel(said.m.length>42?said.m.slice(0,41)+'…':said.m,p.x,Y,sz,'#f8f048')};
 for(const r of mpVis())one(r.x,r.y,r.n,r.said,isOG(r.uid),MP.friends&&MP.friends[r.uid],r.pk);
 if(mpLoc()||SCENE){const me=MP.selfName&&!dead;one(P.x,P.y,me?myName():'',MP.selfSaid,me&&MP.user&&isOG(MP.user.uid),false,window.SQPVP&&SQPVP.on&&!dead)}
 g.restore()};
// ---- chat ----
const CHAT_KEEP=24*3600*1000;
function mpChat(id,v){if(MP.seen.has(id)||!v||typeof v.m!=='string')return;MP.seen.add(id);if(typeof v.t==='number'&&mpNow()-v.t>CHAT_KEEP)return; // older than a day: not shown
 const mine=MP.user&&v.u===MP.user.uid,fresh=typeof v.t==='number'&&mpNow()-v.t<15000;
 const m=v.m.slice(0,80),n=String(v.n||'?').replace(/[<>]/g,'').slice(0,12);
 const e={me:mine,n,uid:v.u,t:typeof v.t==='number'?v.t:0};mpLog('pub',m,e);const last=MP.log[MP.log.length-1];if(!fresh)last.at=-1e9;
 if(fresh){if(mine)MP.selfSaid={m,at:performance.now()};else{const r=MP.players.get(v.u);if(r)r.said={m,at:performance.now()}}if(!MP.open&&!mine){MP.unread++;mpRBtn()}}}
function mpSend(t){t=String(t||'').replace(/\s+/g,' ').trim().slice(0,80);if(!t)return;if(!MP.on){mpOpenChat();return}if(window.SQMOD&&SQMOD.blockChat())return;
 const n=performance.now();if(n-MP.lastSend<1200){mpLog('game','Slow down a little!');return}MP.lastSend=n;
 const d=FB.db;d.push(d.ref(FB.D,'chat'),{u:MP.user.uid,n:myName().slice(0,12),m:t,t:d.serverTimestamp()}).catch(mpErr)}
// ---- Options: show your own name (and crown) over your head ----
MP.selfName=false;try{MP.selfName=localStorage.getItem('sq_myname')==='1'}catch(e){}
const _opt61=optionsHTML;optionsHTML=function(){const h=_opt61(),k=h.indexOf('<div class="tl" style="margin-top:22px');
 const add='<div class="tl" style="margin-top:16px">ONLINE</div><button class="sb mpo" data-o="myname">Show my name overhead: '+(MP.selfName?'ON':'OFF')+'</button>';
 return k<0?h+add:h.slice(0,k)+add+h.slice(k)};
const _oc61=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('.mpo');if(b){MP.selfName=!MP.selfName;try{localStorage.setItem('sq_myname',MP.selfName?'1':'0')}catch(_){}rPn();return}_oc61(e)};
// ---- controller: START menu entry, highlight navigation in the chat and sign-in boxes, ○ / Options closes them ----
SMI.splice(SMI.findIndex(x=>x.id==='options'),0,{id:'online',l:()=>MP.on?'Chat':'Play online'});
const _ss61=showScreen;showScreen=function(id){if(id!=='online')return _ss61(id);releaseMenu();mpOpenChat()};
// the START menu leaves pnOpen set for the screen it opens; our own boxes aren't that screen, so let go of it
function releaseMenu(){if(pn.style.display==='none'){pnOpen=false;fromMenu=false}jx=jy=0}
const _nr61=navRoot;navRoot=function(){if(sg.style.display==='block')return sg;if(MP.open)return pc;return _nr61()};
// ○ / Options arrive as an Escape key press; close our boxes first (the chat input handles its own Escape)
addEventListener('keydown',e=>{if(e.key!=='Escape'||e.target===inp)return;
 if(sg.style.display==='block'){sg.style.display='none';e.stopImmediatePropagation();e.preventDefault()}
 else if(MP.open){mpCloseChat();e.stopImmediatePropagation();e.preventDefault()}},true);
// opening the chat from the controller: highlight the message box instead of popping up the phone keyboard
const _oc61b=mpOpenChat;mpOpenChat=function(){if(GPON){if(!MP.on){sg.style.display='block';return}MP.open=true;MP.unread=0;pc.style.display='block';mpRList();mpClearKeys();setFocus(null);return}_oc61b()};
// ---- Title screen (Emerald-style): logo, PRESS START, then Continue / New Game, Google sign-in, Options ----
// Shown once per launch. While it is up the world is frozen and the game ignores input.
const TS={open:true,stage:0,cl:[]};window.SQTS=TS;
{const st=document.createElement('style');st.textContent=`
#sqts{position:fixed;inset:0;z-index:90;overflow-x:hidden;overflow-y:auto;background:linear-gradient(#051e15,#0b3624 40%,#17573a 72%,#2a7a4a);color:#f8f8f8;font-family:${PF};display:flex;flex-direction:column;align-items:center;user-select:none;-webkit-user-select:none;touch-action:manipulation;padding:env(safe-area-inset-top,0px) 16px env(safe-area-inset-bottom,0px);box-sizing:border-box}
#sqts .tsc{position:absolute;left:0;right:0;background-repeat:repeat-x;background-size:auto 100%;image-rendering:pixelated;pointer-events:none}
#sqts .tsc.c1{top:6%;height:18vh;opacity:.45}#sqts .tsc.c2{bottom:10%;height:26vh;opacity:.75}#sqts .tsc.c3{bottom:-2%;height:20vh;opacity:1}
#sqts .tssp{position:absolute;width:4px;height:4px;background:#d8f8c8;pointer-events:none;animation:tstw 2.4s steps(2) infinite}
@keyframes tstw{50%{opacity:0}}
#sqts .tslg{position:relative;margin-top:max(7vh,20px);text-align:center;z-index:2}
#sqts .tsl1{font-weight:700;font-size:clamp(42px,12.5vw,96px);letter-spacing:.05em;line-height:1;
 background:linear-gradient(100deg,transparent 42%,rgba(255,255,255,.95) 50%,transparent 58%) no-repeat,linear-gradient(#fffbd8,#f8d048 38%,#5cc454 60%,#1d7038);
 background-size:260% 100%,100% 100%;background-position:160% 0,0 0;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;
 filter:drop-shadow(3px 0 0 #0a2214) drop-shadow(-3px 0 0 #0a2214) drop-shadow(0 3px 0 #0a2214) drop-shadow(0 -3px 0 #0a2214) drop-shadow(0 7px 0 rgba(0,0,0,.35));animation:tssh 5s ease-in-out infinite}
@keyframes tssh{0%,55%{background-position:160% 0,0 0}100%{background-position:-70% 0,0 0}}
#sqts .tsl2{display:inline-block;margin-top:14px;padding:4px 16px;font-weight:700;font-size:clamp(14px,3.6vw,20px);letter-spacing:.5em;text-indent:.5em;color:#f8e080;background:#0c3a24;border:3px solid #f8d048;box-shadow:0 0 0 3px #0a2214}
#sqts .tshero{position:relative;z-index:2;margin-top:auto;display:flex;flex-direction:column;align-items:center}
#sqts .tshero canvas{position:static!important;inset:auto!important;display:block;width:80px!important;height:160px!important;image-rendering:pixelated;animation:tsbob 1.2s steps(2) infinite}
#sqts .tshero i{display:block;width:56px;height:10px;margin-top:-14px;background:rgba(0,0,0,.35);border-radius:50%}
@keyframes tsbob{50%{transform:translateY(-4px)}}
#sqts .tsps{position:relative;z-index:2;margin:5vh 0 0;background:none;border:0;color:#f8f8f8;font:700 clamp(20px,5.5vw,30px) ${PF};letter-spacing:.2em;padding:10px 18px;cursor:pointer;text-shadow:3px 3px 0 #0a2214;animation:tsbl 1.1s steps(1) infinite}
@keyframes tsbl{50%{opacity:0}}
#sqts .tsmn{position:relative;z-index:3;margin-top:4vh;width:min(100%,460px);display:none;flex-direction:column;gap:8px}
#sqts .tsmn button{display:block;width:100%;text-align:left;background:#f8f8f8;color:#404040;border:4px solid #485870;box-shadow:inset 0 0 0 3px #a8c0e0;padding:12px 16px 12px 34px;font:700 18px ${PF};letter-spacing:.06em;cursor:pointer;position:relative;
 clip-path:polygon(4px 0,calc(100% - 4px) 0,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0 calc(100% - 4px),0 4px)}
#sqts .tsmn button::before{content:'';position:absolute;left:14px;top:19px;border:7px solid transparent;border-left:9px solid #404040;border-right:0;opacity:0}
#sqts .tsmn button:hover::before,#sqts .tsmn button.gpf::before,#sqts .tsmn button:focus-visible::before{opacity:1}
#sqts .tsmn button.gpf{outline:none!important;box-shadow:inset 0 0 0 3px #f8a020!important}
#sqts .tsmn{flex-direction:row!important;flex-wrap:wrap}#sqts .tsmn .tsst{width:100%}
#sqts .tsmn button:not([data-a="go"]):not([data-a="in"]){width:calc(50% - 4px);padding:12px 6px 12px 20px;font-size:clamp(11px,3vw,17px);letter-spacing:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sqts .tsmn button:not([data-a="go"]):not([data-a="in"])::before{left:6px}
@media (max-height:820px){#sqts .tshero canvas{width:60px!important;height:120px!important}#sqts .tsmn{margin-top:2vh}#sqts .tslg{margin-top:max(4vh,14px)}}
#sqts .tsci{display:grid;grid-template-columns:auto 1fr;gap:4px 18px;margin-top:8px;font-weight:500;font-size:15px;color:#3058c8}
#sqts .tsci span:nth-child(2n){color:#404040;text-align:right}#sqts .tsci img{width:18px;height:14px;image-rendering:pixelated;vertical-align:-1px;margin-right:5px}
#sqts .tsmn .tsst{font-size:13px;color:#e8f8e0;text-align:center;text-shadow:2px 2px 0 #0a2214;min-height:16px}
#sqts .tsft{position:relative;z-index:2;margin-top:auto;width:100%;max-width:640px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 12px;padding:12px 2px;font-size:12px;letter-spacing:.08em;color:#c8e8c8;text-shadow:2px 2px 0 #0a2214}
#sqts .tsft b{color:#78e078}`;document.head.appendChild(st)}
const tsEl=el('div','sqts','',
 '<div class="tsc c1"></div><div class="tsc c2"></div><div class="tsc c3"></div>'+
 '<div class="tslg"><div class="tsl1">SKILLQUEST</div><div class="tsl2">MMO</div></div>'+
 '<div class="tshero"><canvas width="16" height="32" aria-hidden="true"></canvas><i></i></div>'+
 '<button class="tsps" id="tsps">PRESS START</button>'+
 '<div class="tsmn" id="tsmn"></div>'+
 '<div class="tsft"><span>&copy; 2026 SKILLQUEST</span><span id="tsft"></span></div>');
document.body.appendChild(tsEl);
for(const ev of['touchstart','pointerdown','mousedown'])tsEl.addEventListener(ev,stop);
// pixel clouds: three layers of soft blobs on a 2px grid
{const mk=(w,h,col,hi,seed,base=true)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');let r=seed;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
  const blobs=[];for(let i=0;i<9;i++)blobs.push([rnd()*w,h*(.45+rnd()*.4),6+rnd()*14]);
  for(let y=0;y<h;y+=2)for(let X=0;X<w;X+=2){let v=0;for(const[bx,by,br]of blobs)for(const o of[-w,0,w]){const d=Math.hypot(X+o-bx,(y-by)*1.6);if(d<br)v=Math.max(v,1-d/br)}
   if(base&&y>h*.78)v=1;if(v>0){x.fillStyle=v>.55&&y<h*.7?hi:col;x.fillRect(X,y,2,2)}}return c.toDataURL()};
 const L=[['1',mk(256,40,'#1f5c3c','#2f7a4e',7,false)],['2',mk(256,48,'#2a7048','#46965e',19)],['3',mk(256,40,'#2f7a4a','#58a868',31)]];
 for(const[k,u]of L){const e=tsEl.querySelector('.tsc.c'+k);e.style.backgroundImage='url('+u+')';TS.cl.push(e)}
 for(let i=0;i<14;i++){const s=document.createElement('i');s.className='tssp';s.style.left=(4+Math.random()*92)+'%';s.style.top=(3+Math.random()*45)+'%';s.style.animationDelay=(-Math.random()*2.4)+'s';tsEl.appendChild(s)}}
const tsHero=tsEl.querySelector('.tshero canvas'),tsMn=$('tsmn'),tsPs=$('tsps');
function tsDrawHero(){try{const x=tsHero.getContext('2d');x.clearRect(0,0,16,32);x.drawImage(kitSprite(gearCH(),0,0,false),0,0)}catch(e){}}
const hasSave=()=>!(cm.style.display!=='none'&&!PNAME);
const fmtT=s=>{s=Math.max(0,Math.floor(+s||0));const h=Math.floor(s/3600),m=Math.floor(s/60)%60;return h+':'+String(m).padStart(2,'0')};
function tsTotal(){let t=0;for(let i=0;i<XPS.length;i++)t+=lvOf(i);return t}
function tsMenu(){let h='';const btn=(a,html)=>{h+='<button data-a="'+a+'">'+html+'</button>'};
 const gate=STRICT&&!(MP.on&&SQSTRICT.ready);
 if(gate){}else if(hasSave()){const og=MP.user&&isOG(MP.user.uid);btn('go','CONTINUE<div class="tsci"><span>PLAYER</span><span>'+(og?'<img src="'+crownURL+'" alt="OG">':'')+esc(pname())+'</span><span>TIME</span><span>'+fmtT(CLK)+'</span><span>TOTAL LV</span><span>'+tsTotal()+'</span><span>GOLD</span><span>'+GLD+'</span></div>')}
 else btn('go','NEW GAME');
 if(MP_OK&&!MP.on)btn('in','SIGN IN WITH GOOGLE');
 btn('opt','OPTIONS');
 const st=gate?(!FB?'Connecting...':!MP.on?'Sign in with Google to play. Your character is saved to your Google account, on every device.':'Loading your save...'):MP.on?'Online as '+myName()+(MP.user&&isOG(MP.user.uid)?' · OG #'+ogRank(MP.user.uid):''):MP_OK?(FB?'Sign in to play with others and keep your progress on any device.':'Connecting...'):'';
 h+='<div class="tsst">'+esc(st)+'</div>';if(h===TS.mh)return;TS.mh=h;
 const keep=GPF&&tsMn.contains(GPF)?GPF.dataset.a:null;tsMn.innerHTML=h;
 if(keep){const k=tsMn.querySelector('[data-a="'+keep+'"]')||tsMn.querySelector('button');if(k)setFocus(k)}}
function tsFoot(){const f=$('tsft');if(!f)return;const parts=[];if(MP.on){const n=[...MP.players.values()].filter(live).length+1;parts.push('<b>&#9679;</b> '+n+' ONLINE')}
 const left=OG_CUTOFF-mpNow();if(left>0){const d=Math.ceil(left/864e5);parts.push('OG CROWNS: '+d+' DAY'+(d===1?'':'S')+' LEFT')}f.innerHTML=parts.join(' &middot; ')}
function tsStage(n){TS.stage=n;TS.mh='';tsPs.style.display=n?'none':'block';tsMn.style.display=n?'flex':'none';setFocus(null);if(n){tsMenu();const f=tsMn.querySelector('button');if(f&&(GPON||TS.kb))setFocus(f)}}
function tsClose(then){TS.open=false;tsEl.style.display='none';setFocus(null);menuOpen=cm.style.display!=='none';try{sfx('door')}catch(e){}if(then)then()}
tsPs.onclick=()=>{try{sfx('talk')}catch(e){}tsStage(1)};
tsEl.addEventListener('click',e=>{if(TS.stage===0&&e.target!==tsPs)tsPs.click()});
tsMn.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
 if(a==='go'){if(STRICT&&!(MP.on&&SQSTRICT.ready))return;tsClose()}else if(a==='in'){mpSignIn();}else if(a==='opt')tsClose(()=>{fromMenu=false;showScreen('options')})});
// keyboard: any key starts; arrows / Enter / Esc in the menu; the game never sees these keys while the title is up
addEventListener('keydown',e=>{if(!TS.open||(window.SQSUITE&&SQSUITE.state.open)||(e.target&&e.target.closest&&e.target.closest('#mpbugf,#mpsave,#sqwk')))return;e.stopImmediatePropagation();const k=e.key;
 if(typeof WK!=='undefined'&&WK.open){e.preventDefault();if(k==='Escape'||k==='Backspace'){wkClose();return}if(!e.isTrusted)return;TS.kb=true;
  if(k==='ArrowRight'||k==='d')navMove(1,0);else if(k==='ArrowLeft'||k==='a')navMove(-1,0);else if(k==='ArrowDown'||k==='s')navMove(0,1);else if(k==='ArrowUp'||k==='w')navMove(0,-1);else if(k==='Enter'||k===' '||k==='z')navPress();return}
 if(LB.open){e.preventDefault();if(k==='Escape'||k==='Backspace'){lbClose();return}if(!e.isTrusted)return;TS.kb=true;
  if(k==='ArrowRight'||k==='d')navMove(1,0);else if(k==='ArrowLeft'||k==='a')navMove(-1,0);else if(k==='ArrowDown'||k==='s')navMove(0,1);else if(k==='ArrowUp'||k==='w')navMove(0,-1);else if(k==='Enter'||k===' '||k==='z')navPress();return}
 if(TS.stage===0){if(e.isTrusted)TS.kb=true;if(k!=='Shift'){e.preventDefault();tsPs.click()}return}
 if(k==='Escape'){e.preventDefault();tsStage(0);return}
 if(!e.isTrusted)return; // controller keys are handled by the menu highlight
 TS.kb=true;if(k==='ArrowDown'||k==='s'){e.preventDefault();navMove(0,1)}else if(k==='ArrowUp'||k==='w'){e.preventDefault();navMove(0,-1)}else if(k==='Enter'||k===' '||k==='z'){e.preventDefault();navPress()}},true);
addEventListener('keyup',e=>{if(TS.open&&!(e.target&&e.target.closest&&e.target.closest('#mpbugf')))e.stopImmediatePropagation()},true);
// controller: the title is the screen being navigated
const _nr62=navRoot;navRoot=function(){if(TS.open)return TS.stage?tsMn:tsEl;return _nr62()};
// the world is frozen while the title is up
const _u62=upd;upd=function(dt){if(TS.open){try{pollPad(dt)}catch(e){}return}_u62(dt)}; // the controller still drives the title
let tsLast=0;const tsLoop=function(t){if(!TS.open)return;const s=t/1000;TS.cl.forEach((e,i)=>e.style.backgroundPositionX=Math.round(-s*[6,14,24][i])+'px');
 if(menuOpen)menuOpen=false; // the creator waits behind the title (restored on close)
 if(t-tsLast>700){tsLast=t;tsDrawHero();tsFoot();if(TS.stage)tsMenu()}requestAnimationFrame(tsLoop)};tsLoop(0);
setTimeout(()=>{tsDrawHero();tsFoot()},0);
// the save chooser sits above everything, the title included
const _nr63=navRoot;navRoot=function(){if(MP.choose)return MP.choose;return _nr63()};
// ---- Shared NPCs: villagers wander on a schedule from the shared clock, so every player sees them in the same spot ----
// While an NPC is at home (not heading somewhere for a routine), its position is a pure function of the time:
// every 5 s it picks a new spot near home from a hash of (NPC, time slot) and walks there at the usual pace.
{const SEG=5,h01=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v)};
 const feetOK=(x,y)=>!(solid(x-5,y+2)||solid(x+5,y+2)||solid(x-5,y+6)||solid(x+5,y+6));
 function npcSpot(n,i,k){if(!n._sp)n._sp=new Map();let v=n._sp.get(k);if(v)return v;const a=h01(i+1,k)*6.283,r=6+h01(k,i+7)*26;let x=n.H[0]+Math.cos(a)*r,y=n.H[1]+Math.sin(a)*r;
  if(!feetOK(x,y)||!feetOK((x+n.H[0])/2,(y+n.H[1])/2)){x=n.H[0];y=n.H[1]}v=[x,y];n._sp.set(k,v);if(n._sp.size>8)n._sp.delete(n._sp.keys().next().value);return v}
 const _roam62=roamNPCs;roamNPCs=function(dt){_roam62(dt);if(SCENE)return;const T=mpNow()/1000,k=Math.floor(T/SEG),u=T-k*SEG;
  NPCS.forEach((n,i)=>{if(n.scene||n.hx==null)return;if(!n.H)n.H=[n.hx,n.hy];
   if(Math.abs(n.hx-n.H[0])>1||Math.abs(n.hy-n.H[1])>1)return; // on a routine (going home at night etc.): the routine moves it
   const a=npcSpot(n,i,k-1),b=npcSpot(n,i,k),dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy),w=Math.min(d,u*20),mv=w<d-.5&&d>1;
   n.x=a[0]+(d?dx/d*w:0);n.y=a[1]+(d?dy/d*w:0);n.tx=n.x;n.ty=n.y;
   if(mv){n.st=[1,0,2,0][Math.floor(T*6)%4];if(Math.abs(dx)>Math.abs(dy)){n.dir=2;n.fl=dx<0}else{n.dir=dy<0?1:0;n.fl=false}}
   else{n.st=0;const px=P.x-n.x,py=P.y-n.y;if(!dead&&Math.hypot(px,py)<36){if(Math.abs(px)>Math.abs(py)){n.dir=2;n.fl=px<0}else{n.dir=py<0?1:0;n.fl=false}}}})}}
// ---- Shared world (online): one clock, shared trees / rocks / berries, shared monsters, dungeons together ----
// - Time of day and the day number come from the server clock, so everyone has the same day, night and daily dungeons.
//   (Sleeping still heals you, but the night passes for everyone together.)
// - A tree, rock, ore vein, bush or cactus you use up is gone for everyone (world/res/<place>/<cell>) and grows back for
//   everyone 4 minutes later.
// - Monsters: each player's game still runs the monsters around them, and shares them with anyone in the same place
//   (mobs/<place>/<uid>). You see everyone's monsters and can fight them: your hits are sent to the player whose game
//   runs that monster (hits/<uid>), and if your hit kills it you get the reward. They can hurt you too.
// - Dungeons and caves are shared: if someone is already on a floor when you arrive, you join their monsters instead of
//   getting your own copy. Chests stay your own.
const WT0=1793689200; // the shared clock starts at day 1 on launch night
const globalTime=()=>Math.max(1,mpNow()/1000-WT0);
const othersHere=()=>{const l=mpLoc();if(!l)return false;for(const r of MP.players.values())if(r.loc===l&&live(r))return true;return false};
const mobLeader=()=>{const l=mpLoc();if(!l||!MP.user)return true;for(const r of MP.players.values())if(r.loc===l&&live(r)&&r.uid<MP.user.uid)return false;return true};
const locKey=l=>String(l).replace(/[.#$\[\]\/:]/g,'_');
// sleeping: the night is shared, so the message changes
{const _say64=say;say=function(s){if(MP.on&&typeof s==='string'&&/Good morning!/.test(s))s=s.replace(/ ?Good morning!/,'')+' Nights pass for everyone together online, but you feel rested.';return _say64(s)}}
// ---- shared resources ----
const RES={h:{},r:{},rloc:null,unsubH:null,unsubR:null,stash:{}};window.SQRES=RES;
function resSubHollow(){if(RES.unsubH)return;const d=FB.db,ref=d.ref(FB.D,'world/res/hollow2');
 const add=s=>{const i=+s.key,v=s.val();if(!v||!(i>=0&&i<N*N))return;RES.h[i]=v;if(obj[i]&&obj[i].t===v.t)obj[i]=null;for(let j=REM.length-1;j>=0;j--)if(REM[j].i===i)REM.splice(j,1)};
 const u1=d.onChildAdded(ref,add),u2=d.onChildChanged(ref,add),u3=d.onChildRemoved(ref,s=>{const i=+s.key,v=s.val()||RES.h[i];delete RES.h[i];if(v&&!obj[i]&&OHP[v.t])obj[i]={t:v.t,hp:OHP[v.t]}});
 RES.unsubH=()=>{u1();u2();u3()};MP.unsub.push(()=>{if(RES.unsubH){RES.unsubH();RES.unsubH=null}})}
function resSubRegion(){const R=SCENE&&SCENE.room,loc=R&&R.region?'r_'+R.region:null;if(loc===RES.rloc)return;if(RES.unsubR){RES.unsubR();RES.unsubR=null}RES.r={};RES.rloc=loc;if(!loc||!MP.on)return;
 const d=FB.db,ref=d.ref(FB.D,'world/res/'+loc);
 const add=s=>{const R2=SCENE&&SCENE.room;if(!R2||'r_'+R2.region!==loc)return;const idx=+s.key,v=s.val();if(!v)return;RES.r[idx]=v;const x=idx%R2.w,y=Math.floor(idx/R2.w),it=rgObjAt(R2,x,y);
  if(it&&it.o&&it.o.t===v.t){it.gone=true;rgCellDel(R2,it);R2.solid.delete(idx);RES.stash[loc+':'+idx]=it}for(let j=R2.gone.length-1;j>=0;j--){const g2=R2.gone[j].it;if(g2.y*R2.w+g2.x===idx){RES.stash[loc+':'+idx]=g2;R2.gone.splice(j,1)}}};
 const u1=d.onChildAdded(ref,add),u2=d.onChildChanged(ref,add),u3=d.onChildRemoved(ref,s=>{const idx=+s.key;delete RES.r[idx];const it=RES.stash[loc+':'+idx],R2=SCENE&&SCENE.room;delete RES.stash[loc+':'+idx];
  if(it&&R2&&'r_'+R2.region===loc&&it.gone){it.gone=false;it.o.hp=OHP[it.o.t]||3;rgCellAdd(R2,it);R2.solid.add(idx)}});
 RES.unsubR=()=>{u1();u2();u3()}}
let resSweepAt=0;
function resTick(){if(!MP.on||!FB)return;const d=FB.db;resSubHollow();resSubRegion();
 // anything you used up goes to the shared list (and stops growing back on its own timer)
 for(let j=REM.length-1;j>=0;j--){const r=REM[j];if(r._s)continue;r._s=1;if(RES.h[r.i])continue;d.set(d.ref(FB.D,'world/res/hollow2/'+r.i),{t:r.t,at:d.serverTimestamp()}).catch(()=>{})}
 for(let j=REM.length-1;j>=0;j--)if(REM[j]._s&&RES.h[REM[j].i])REM.splice(j,1);
 const R=SCENE&&SCENE.room;if(R&&R.region&&R.gone&&RES.rloc){for(let j=R.gone.length-1;j>=0;j--){const g2=R.gone[j];if(g2._s)continue;g2._s=1;const idx=g2.it.y*R.w+g2.it.x;
   RES.stash[RES.rloc+':'+idx]=g2.it;if(!RES.r[idx])d.set(d.ref(FB.D,'world/res/'+RES.rloc+'/'+idx),{t:g2.it.o.t,at:d.serverTimestamp()}).catch(()=>{});R.gone.splice(j,1)}}
 // growing back: anyone online clears entries older than 4 minutes
 const now=performance.now();if(now-resSweepAt<5000)return;resSweepAt=now;const cut=mpNow()-240000;
 for(const i in RES.h){const v=RES.h[i];if(typeof v.at==='number'&&v.at<cut)d.remove(d.ref(FB.D,'world/res/hollow2/'+i)).catch(()=>{})}
 if(RES.rloc)for(const i in RES.r){const v=RES.r[i];if(typeof v.at==='number'&&v.at<cut)d.remove(d.ref(FB.D,'world/res/'+RES.rloc+'/'+i)).catch(()=>{})}}
// ---- shared monsters ----
const MOB={n:0,prox:new Map(),limbo:[],loc:null,unsub:null,pubAt:0,pubbed:false,arrAt:0,inbox:null};window.SQMOB=MOB;
const mid=n=>n._mid||(n._mid=MP.user.uid.slice(0,8)+'_'+(++MOB.n));
function mobPack(n){const o={};for(const k in n){if(k[0]==='_')continue;const v=n[k],t=typeof v;if(t==='number'){if(isFinite(v))o[k]=Math.round(v*10)/10}else if(t==='string'&&v.length<24)o[k]=v;else if(t==='boolean')o[k]=v}return o}
function mobSubscribe(){const l=mpLoc(),key=l?locKey(l):null;if(key===MOB.loc)return;
 if(MOB.unsub){MOB.unsub();MOB.unsub=null}if(MOB.pubbed&&MOB.loc&&MP.user){FB.db.remove(FB.db.ref(FB.D,'mobs/'+MOB.loc+'/'+MP.user.uid)).catch(()=>{});MOB.pubbed=false}
 for(const p of MOB.prox.values()){const j=en.indexOf(p);if(j>=0)en.splice(j,1)}MOB.prox.clear();for(const p of MOB.limbo){const j=en.indexOf(p);if(j>=0)en.splice(j,1)}MOB.limbo.length=0;MOB.loc=key;MOB.arrAt=performance.now();if(!key)return;
 const d=FB.db;MOB.unsub=d.onValue(d.ref(FB.D,'mobs/'+key),s=>{if(MOB.loc!==key)return;const all=s.val()||{},seen=new Set(),cut=mpNow()-6000;
  for(const owner in all){if(!MP.user||owner===MP.user.uid)continue;const rec=all[owner];if(!rec||!(rec.t>cut)||!rec.m)continue;
   for(const id in rec.m){const pk=rec.m[id];if(!pk||typeof pk.x!=='number')continue;seen.add(id);let p=MOB.prox.get(id);
    if(!p){const li=MOB.limbo.findIndex(q=>q._id===id);if(li>=0){p=MOB.limbo.splice(li,1)[0];delete p._gone;MOB.prox.set(id,p);if(en.indexOf(p)<0)en.push(p)}}
    if(!p){p=Object.assign({kx:0,ky:0},pk);p._rp=1;p._owner=owner;p._id=id;p._ref=pk.hp;p.tx=pk.x;p.ty=pk.y;MOB.prox.set(id,p);en.push(p)}
    else{if(p.dead&&p._deadAt&&performance.now()-p._deadAt>3000){p.dead=0;p._deadAt=0;p.hp=pk.hp;p._ref=pk.hp} // our kill didn't land: it's still alive for its owner
     for(const k in pk)if(k!=='x'&&k!=='y'&&k!=='hp'&&k!=='dead')p[k]=pk[k];p.tx=pk.x;p.ty=pk.y;if(!p.dead&&typeof pk.hp==='number'){p.hp=pk.hp;p._ref=pk.hp}}}}
  for(const owner in all){const rec=all[owner];if(MP.user&&owner!==MP.user.uid&&rec&&rec.x&&rec.t>cut&&window.SQMOBRX)try{SQMOBRX(owner,rec.x)}catch(e){console.warn(e)}}
  for(const[id,p]of MOB.prox)if(!seen.has(id)){MOB.prox.delete(id);if(p.dead){const j=en.indexOf(p);if(j>=0)en.splice(j,1);continue}p._gone=performance.now();MOB.limbo.push(p)}})}
function mobHitsCheck(){if(!MP.user)return;for(const p of MOB.prox.values()){if(typeof p.hp!=='number'||typeof p._ref!=='number')continue;if(p.hp<p._ref){const dmg=Math.min(50,Math.round((p._ref-p.hp)*10)/10);p._ref=p.hp;if(dmg<.5)continue; // slow drains (sunlight, burning) are simulated by the owner
  FB.db.push(FB.db.ref(FB.D,'hits/'+p._owner),{id:p._id,d:dmg}).catch(()=>{})}}}
function mobPre(){if(!MP.on||!MOB.loc)return;mobHitsCheck();for(const p of MOB.prox.values()){if(p.dead&&!p._deadAt)p._deadAt=performance.now();if(!p.dead&&en.indexOf(p)<0)en.push(p);p._px=p.x;p._py=p.y}}
function mobPost(dt){if(!MP.on||!FB)return;mobSubscribe();if(!MOB.loc)return;mobHitsCheck();const k=Math.min(1,dt*10);
 for(const p of MOB.prox.values()){if(p.dead)continue;const bx=p._px==null?p.x:p._px,by=p._py==null?p.y:p._py;p.x=bx+(p.tx-bx)*k;p.y=by+(p.ty-by)*k;p.kx=0;p.ky=0}
 // a monster whose owner left: you take it over (it keeps fighting); one that simply vanished (killed) goes away
 const now=performance.now();for(let i=MOB.limbo.length-1;i>=0;i--){const p=MOB.limbo[i],o=MP.players.get(p._owner),left=!o||!live(o)||o.loc!==mpLoc();
  if(left&&!p.dead&&p.hp>0&&Math.hypot(p.x-P.x,p.y-P.y)<260){for(const k of['_rp','_owner','_id','_ref','_deadAt','_gone','_px','_py','tx','ty'])delete p[k];MOB.limbo.splice(i,1)}
  else if(now-p._gone>2000||p.dead){MOB.limbo.splice(i,1);const j=en.indexOf(p);if(j>=0)en.splice(j,1)}}
 // arriving on a floor someone is already fighting on: use their monsters, not a second copy. Several of you arriving
 // together: the player with the lowest id keeps theirs, everyone else uses those.
 if(now-MOB.arrAt<2500&&othersHere()&&SCENE&&SCENE.room&&SCENE.room.cave&&(MOB.prox.size||!mobLeader()))en=en.filter(n=>n._rp)
 // share mine (only when someone else is here)
 if(now-MOB.pubAt<250)return;MOB.pubAt=now;const d=FB.db,ref=d.ref(FB.D,'mobs/'+MOB.loc+'/'+MP.user.uid);
 if(!othersHere()){if(MOB.pubbed){d.remove(ref).catch(()=>{});MOB.pubbed=false}return}
 const m={};let c=0;for(const n of en){if(n._rp||n._wb||n.dead||c>=24)continue;m[mid(n)]=mobPack(n);c++}
 // other sections can send extra state along with the monsters (island bosses: their attacks), read back by SQMOBRX
 let x=null;try{x=window.SQMOBX?SQMOBX():null}catch(e){}d.set(ref,x?{t:d.serverTimestamp(),m,x}:{t:d.serverTimestamp(),m}).catch(()=>{});MOB.pubbed=true;
 if(!MOB.odc||MOB.odc!==MOB.loc){MOB.odc=MOB.loc;d.onDisconnect(ref).remove().catch(()=>{})}}
// hits other players land on your monsters
function mobInbox(){if(MOB.inbox||!MP.user)return;const d=FB.db,ref=d.ref(FB.D,'hits/'+MP.user.uid);
 MOB.inbox=d.onChildAdded(ref,s=>{const v=s.val()||{};d.remove(d.ref(FB.D,'hits/'+MP.user.uid+'/'+s.key)).catch(()=>{});const n=en.find(e=>e._mid===v.id&&!e.dead);if(!n||typeof v.d!=='number')return;
  n.hp-=Math.max(0,Math.min(50,v.d));n.kx=(n.kx||0)*.5;if(n.hp<=0){n.dead=1;n.dropped=1}});MP.unsub.push(()=>{if(MOB.inbox)MOB.inbox();MOB.inbox=null})}
// ---- shared campfires: anyone in the same place sees your fire and can cook or warm up at it ----
const FIRE={prox:new Map(),loc:null,unsub:null,pubAt:0,pubbed:false};
function fireTick(){if(!MP.on||!FB||!MP.user)return;const l=mpLoc(),key=l?locKey(l):null,d=FB.db;
 for(const f of fires)if(!f._rp&&f._loc===undefined)f._loc=l;
 if(key!==FIRE.loc){if(FIRE.unsub){FIRE.unsub();FIRE.unsub=null}if(FIRE.pubbed&&FIRE.loc)d.remove(d.ref(FB.D,'fires/'+FIRE.loc+'/'+MP.user.uid)).catch(()=>{});FIRE.pubbed=false;
  for(const p of FIRE.prox.values()){const j=fires.indexOf(p);if(j>=0)fires.splice(j,1)}FIRE.prox.clear();FIRE.loc=key;
  if(key)FIRE.unsub=d.onValue(d.ref(FB.D,'fires/'+key),s=>{if(FIRE.loc!==key)return;const all=s.val()||{},seen=new Set(),cut=mpNow()-8000;
   for(const o in all){if(o===MP.user.uid)continue;const rec=all[o];if(!rec||!(rec.t>cut)||!rec.f||typeof rec.f!=='object')continue;
    (Array.isArray(rec.f)?rec.f:Object.values(rec.f)).forEach((v,i)=>{if(!v||typeof v.x!=='number')return;const id=o+'_'+i;seen.add(id);let p=FIRE.prox.get(id);if(!p){p={x:v.x,y:v.y,life:v.life,_rp:1};FIRE.prox.set(id,p);fires.push(p)}else{p.x=v.x;p.y=v.y;p.life=v.life}})}
   for(const[id,p]of FIRE.prox)if(!seen.has(id)){FIRE.prox.delete(id);const j=fires.indexOf(p);if(j>=0)fires.splice(j,1)}})}
 if(!key)return;for(const p of FIRE.prox.values())if(p.life>0&&fires.indexOf(p)<0)fires.push(p);
 const now=performance.now();if(now-FIRE.pubAt<2000)return;FIRE.pubAt=now;const ref=d.ref(FB.D,'fires/'+key+'/'+MP.user.uid);
 const mine=fires.filter(f=>!f._rp&&f._loc===l&&f.life>0).slice(0,8).map(f=>({x:Math.round(f.x),y:Math.round(f.y),life:Math.round(f.life)}));
 if(!othersHere()||!mine.length){if(FIRE.pubbed){d.remove(ref).catch(()=>{});FIRE.pubbed=false}return}
 d.set(ref,{t:d.serverTimestamp(),f:mine}).catch(()=>{});if(!FIRE.pubbed)d.onDisconnect(ref).remove().catch(()=>{});FIRE.pubbed=true}
{const _sn64=snap;snap=function(){const s=_sn64();s.fires=fires.filter(f=>!f._rp).map(f=>({x:Math.round(f.x),y:Math.round(f.y),life:Math.round(f.life)}));return s}}
// the frame: shared clock first, then the game, then sharing
{const _u64=upd;upd=function(dt){if(MP.on)time=globalTime();mobPre();_u64(dt);if(MP.on){time=globalTime();try{mobInbox();mobPost(dt);resTick();fireTick();housesTick();buildTick()}catch(e){console.warn(e)}}}}
// signing out: drop other players' monsters and stop sharing
function mobStop(){for(const p of FIRE.prox.values()){const j=fires.indexOf(p);if(j>=0)fires.splice(j,1)}FIRE.prox.clear();if(FIRE.unsub){FIRE.unsub();FIRE.unsub=null}FIRE.loc=null;FIRE.pubbed=false;for(const p of[...MOB.prox.values(),...MOB.limbo]){const j=en.indexOf(p);if(j>=0)en.splice(j,1)}MOB.prox.clear();MOB.limbo.length=0;if(MOB.unsub){MOB.unsub();MOB.unsub=null}MOB.loc=null;MOB.pubbed=false;
 if(RES.unsubR){RES.unsubR();RES.unsubR=null}RES.rloc=null;RES.h={};RES.r={}}
// ---- Friends list and private messages ----
// - profiles/<uid>: your name (so friends can find you), friends/<uid>/<friend uid>: your friends list,
//   pm/<uid>/<id>: private messages to you.
// - Chat gets two more tabs: Private (From / To lines) and Friends (who's online and where, Message, Remove, Add by name).
// - Tap a name in chat to add that player. Type "/w name message" to whisper from any tab.
// - Friends' names show in green over their heads.
MP.friends={};MP.prof={};MP.pmTo=null;
{const st=document.createElement('style');st.textContent=`#mpchat .hd{flex-wrap:wrap}#mpchat .tb{padding:6px 8px}#mpchat .pmf b,#mpchat .pmt b{color:#1888a0!important}#mpchat .pmf,#mpchat .pmt{color:#1888a0}#mpchat .pty,#mpo .pty{color:#2a8a3a}#mpchat .pty b,#mpo .pty b{color:#1f7a2e!important}
#mpo .pmf,#mpo .pmt{color:#1888a0}#mpo .pmf b{color:#1888a0}#mpl b.nm{cursor:pointer}
#mpl .fr{display:flex;align-items:center;gap:6px;padding:6px 4px;border-bottom:1px solid #e0e8f0}#mpl .fr .fn{flex:1;min-width:0}#mpl .fr small{display:block;color:#707070;font-size:11px}
#mpl .fr .on{color:#28a048}#mpl .fr button,#mpl .fa button{font:700 12px ${PF};padding:5px 8px;border:2px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer}
#mpl .fa{display:flex;gap:6px;margin-bottom:8px}#mpl .fa input{background:#fff!important;color:#404040!important;flex:1;min-width:0;font:500 15px ${PF};padding:5px 7px;border:2px solid #485870}#mpl .fh{font-size:12px;color:#707070;margin:6px 0}`;document.head.appendChild(st)}
// two more tabs
{const g2=pc.querySelector('.tb[data-t="game"]');const mk=(t,l)=>{const b=document.createElement('button');b.className='tb';b.dataset.t=t;b.textContent=l;b.onclick=()=>{MP.tab=t;mpRList()};g2.before(b)};mk('pm','Private');mk('fr','Friends');mk('pt','Party')}
const LOCN=l=>{if(!l)return'Somewhere private';if(l==='hollow')return'Hollow Island';if(l.startsWith('r:')){const R=WORLD_REGIONS[l.slice(2)];return R?R.name:'Overseas'}if(l.startsWith('in:dun')||l.startsWith('in:cave')||l.startsWith('in:tomb'))return'In a dungeon';if(l.startsWith('in:'))return'Indoors';if(l.startsWith('h:'))return'At a house';return'Online'};
const fname=u=>{const r=MP.players.get(u);return(r&&r.n)||(MP.prof[u]&&MP.prof[u].n)||'Someone'};
const isFriend=u=>!!(u&&MP.friends[u]);
// chat lines: names are tappable; private messages read "From X:" / "To X:"
mpLine=function(m){const d=document.createElement('div');if(m.k==='game'){d.className='gm';d.textContent=m.m;return d}
 if(m.k==='pt'){d.className='pty';const b=document.createElement('b');b.className='nm';if(m.uid)b.dataset.u=m.uid;b.textContent='[Party] '+m.n+': ';d.append(b,document.createTextNode(m.m));return d}
 if(m.k==='pm'){d.className=m.dir==='to'?'pmt':'pmf';const b=document.createElement('b');b.className='nm';b.dataset.u=m.uid;b.textContent=(m.dir==='to'?'To ':'From ')+m.n+': ';if(isOG(m.uid))d.append(crownImg());d.append(b,document.createTextNode(m.m));return d}
 if(m.me)d.className='me';const b=document.createElement('b');b.className='nm';b.dataset.u=m.uid||'';b.textContent=m.n+': ';if(isOG(m.uid))d.append(crownImg());d.append(b,document.createTextNode(m.m));return d};
// time sent, on chat and private messages (the chat list only, not the overlay)
{const _ml=mpLine;mpLine=function(m){const d=_ml(m);if(m&&m.t&&(m.k==='pub'||m.k==='pm')){const sp=document.createElement('span');sp.className='ts';
  try{sp.textContent=new Date(m.t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+' '}catch(e){sp.textContent=''}d.prepend(sp)}return d}}
{const st=document.createElement('style');st.textContent='#mpl .ts{opacity:.5;font-size:.82em;font-weight:500;margin-right:2px}#mpo .ts{display:none}';document.head.appendChild(st)}
function friendsView(){lst.textContent='';const fa=document.createElement('form');fa.className='fa';fa.innerHTML='<input id="mpfa" maxlength="12" placeholder="Add a friend by name" aria-label="Friend name"><button type="submit">ADD</button>';
 fa.onsubmit=e=>{e.preventDefault();addFriendByName(fa.querySelector('input').value)};lst.appendChild(fa);if(MP.addHint){const h=document.createElement('div');h.className='fh';h.append(...MP.addHint);lst.appendChild(h)}
 const rq=Object.keys(MP.req||{}).filter(u=>!isFriend(u)&&!ignored(u));if(rq.length){const h=document.createElement('div');h.className='fh';h.textContent='FRIEND REQUESTS';lst.appendChild(h);
  for(const u of rq){const row=document.createElement('div');row.className='fr';const nm=document.createElement('div');nm.className='fn';const b=document.createElement('b');b.textContent=String(MP.req[u].n||fname(u));nm.append(b);
   const s=document.createElement('small');s.textContent='added you as a friend';nm.append(s);const ok=document.createElement('button');ok.textContent='ADD BACK';ok.onclick=()=>addFriend(u);
   const no=document.createElement('button');no.textContent='DISMISS';no.onclick=()=>{FB.db.remove(FB.db.ref(FB.D,'freq/'+MP.user.uid+'/'+u)).catch(()=>{})};row.append(nm,ok,no);lst.appendChild(row)}}
 const ids=Object.keys(MP.friends);if(!ids.length){const h=document.createElement('div');h.className='fh';h.textContent='No friends yet. Add someone by name, or tap a name in chat.';lst.appendChild(h);return}
 ids.sort((a,b)=>(+!!liveP(b))-(+!!liveP(a))||fname(a).localeCompare(fname(b)));
 for(const u of ids){const r=liveP(u),row=document.createElement('div');row.className='fr';const nm=document.createElement('div');nm.className='fn';const b=document.createElement('b');b.textContent=fname(u);if(isOG(u))nm.append(crownImg());nm.append(b);
  const s=document.createElement('small');if(r){s.className='on';s.textContent='● Online · '+LOCN(r.loc)}else s.textContent='○ Offline';nm.append(s);
  const msg=document.createElement('button');msg.textContent='MESSAGE';msg.onclick=()=>{MP.pmTo=u;MP.tab='pm';mpRList();inp.placeholder='To '+fname(u)+'...';setTimeout(()=>inp.focus(),20)};
  const rm=document.createElement('button');rm.textContent='REMOVE';rm.onclick=()=>{if(rm.dataset.sure){FB.db.remove(FB.db.ref(FB.D,'friends/'+MP.user.uid+'/'+u)).catch(mpErr)}else{rm.dataset.sure=1;rm.textContent='SURE?'}};
  row.append(nm,msg,rm);lst.appendChild(row)}}
const liveP=u=>{const r=MP.players.get(u);return r&&live(r)?r:null};
mpRList=function(){pc.querySelectorAll('.tb').forEach(b=>b.classList.toggle('on',b.dataset.t===MP.tab));
 inp.placeholder=MP.tab==='pt'?((window.SQPARTY&&SQPARTY.id&&SQPARTY.members().length)?'Say something to your party...':'Not in a party: tap a player\'s name to invite them'):MP.tab==='pm'?(MP.pmTo?'To '+fname(MP.pmTo)+'...':'Pick a friend in Friends, or type /w name message'):'Say something...';
 if(MP.tab==='fr'){friendsView();mpRBtn();return}lst.textContent='';
 for(const m of MP.log)if(MP.tab==='all'||m.k===MP.tab)lst.appendChild(mpLine(m));lst.scrollTop=lst.scrollHeight;mpRBtn()};
lst.addEventListener('click',e=>{const b=e.target.closest('b.nm');if(!b||!b.dataset.u||!MP.user||b.dataset.u===MP.user.uid)return;const u=b.dataset.u;
 if(isFriend(u)){MP.pmTo=u;MP.tab='pm';mpRList();setTimeout(()=>inp.focus(),20)}else{MP.tab='fr';MP.addHint=null;mpRList();const i=$('mpfa');if(i){i.value=fname(u);MP.addUid=u}}});
window.SQADDFRIEND=u=>addFriend(u);
function addFriend(u){if(!MP.on||!u||u===MP.user.uid)return;const d=FB.db;
 d.set(d.ref(FB.D,'friends/'+MP.user.uid+'/'+u),true).then(()=>{mpLog('game',fname(u)+' is now on your friends list.');MP.addHint=null;
   if(MP.req&&MP.req[u])d.remove(d.ref(FB.D,'freq/'+MP.user.uid+'/'+u)).catch(()=>{});
   // let them know (they can add you back with one tap)
   d.set(d.ref(FB.D,'freq/'+u+'/'+MP.user.uid),{n:myName().slice(0,12),t:d.serverTimestamp()}).catch(()=>{});
   if(MP.tab==='fr')mpRList()}).catch(e=>{MP.addHint=[document.createTextNode('Could not add '+fname(u)+'. '+(/permission/i.test(String(e&&(e.code||e.message)))?'The database rules need updating.':'Try again in a moment.'))];if(MP.tab==='fr')mpRList();mpErr(e)})}
function addFriendByName(name){name=String(name||'').trim();if(!name||!MP.on)return;const nl=name.toLowerCase();
 if(MP.addUid&&fname(MP.addUid).toLowerCase()===nl){const u=MP.addUid;MP.addUid=null;addFriend(u);return}
 const hits=new Set();for(const u in MP.prof)if(u!==MP.user.uid&&MP.prof[u]&&MP.prof[u].nl===nl)hits.add(u);for(const[u,r]of MP.players)if(r.n&&r.n.toLowerCase()===nl)hits.add(u);
 const list=[...hits].filter(u=>!isFriend(u));
 if(!list.length){MP.addHint=[document.createTextNode(hits.size?'Already on your list.':'No player named "'+name+'" has played online yet.')];mpRList();return}
 if(list.length===1){addFriend(list[0]);return}
 const parts=[document.createTextNode('Several players are called '+name+'. Pick one: ')];list.forEach((u,i)=>{const b=document.createElement('button');b.textContent=fname(u)+(liveP(u)?' (online)':'')+(isOG(u)?' (OG)':' #'+(i+1));b.style.marginRight='6px';b.onclick=()=>addFriend(u);parts.push(b)});
 MP.addHint=parts;mpRList()}
// sending: Private tab or "/w name message"
mpSend=function(t){t=String(t||'').replace(/\s+/g,' ').trim();if(!t)return;if(!MP.on){mpOpenChat();return}
 {const pm=/^\/(?:p|party)\s+(.+)$/i.exec(t);if((pm||MP.tab==='pt'&&t[0]!=='/')&&window.SQPARTYSAY){SQPARTYSAY(pm?pm[1]:t);return}}
 let to=null,msg=t;const w=t.match(/^\/(?:w|msg|pm)\s+(\S+)\s+(.+)$/i);
 if(w){const nl=w[1].toLowerCase();to=Object.keys(MP.friends).find(u=>fname(u).toLowerCase()===nl)||[...MP.players.keys()].find(u=>(MP.players.get(u).n||'').toLowerCase()===nl);msg=w[2];if(!to){mpLog('game','No friend or nearby player called '+w[1]+'.');return}}
 else if(MP.tab==='pm'){to=MP.pmTo;if(!to){mpLog('game','Pick a friend in the Friends tab to message.');return}}
 msg=msg.slice(0,80);if(window.SQMOD&&SQMOD.blockChat())return;const n=performance.now();if(n-MP.lastSend<1200){mpLog('game','Slow down a little!');return}MP.lastSend=n;const d=FB.db;
 if(to){d.push(d.ref(FB.D,'pm/'+to),{f:MP.user.uid,n:myName().slice(0,12),m:msg,t:d.serverTimestamp()}).then(()=>{mpLog('pm',msg,{dir:'to',n:fname(to),uid:to,t:mpNow()});MP.pmTo=to}).catch(e=>{mpLog('game','Could not send that message.');mpErr(e)});return}
 d.push(d.ref(FB.D,'chat'),{u:MP.user.uid,n:myName().slice(0,12),m:msg,t:d.serverTimestamp()}).catch(mpErr)};
// the overlay shows private messages to you too
mpROv=function(){const now=performance.now(),hide=MP.open||pnOpen||menuOpen||chessOpen,recent=MP.log.filter(m=>(m.k==='pub'||m.k==='pt'&&!m.me||m.k==='pm'&&m.dir==='from')&&now-m.at<12000).slice(-3);
 ov.style.display=hide||TS.open?'none':'flex';btn.style.display=(pnOpen||menuOpen||chessOpen||TS.open)?'none':'block';
 const key=recent.map(m=>m.id).join(',');if(key!==ov.dataset.k){ov.dataset.k=key;ov.textContent='';for(const m of recent){const d=mpLine(m);d.dataset.at=m.at;ov.appendChild(d)}}
 for(const d of ov.children){const a=now-(+d.dataset.at);d.style.opacity=a>10000?'0':'1'}};
// listeners, started with the rest of the online features
function friendsStart(){const d=FB.db,D=FB.D,uid=MP.user.uid;
 const pub=()=>d.update(d.ref(D,'profiles/'+uid),{n:myName().slice(0,12),nl:myName().slice(0,12).toLowerCase(),at:d.serverTimestamp()}).catch(()=>{});pub();MP.profN=myName();
 MP.unsub.push(d.onValue(d.ref(D,'friends/'+uid),s=>{MP.friends=s.val()||{};if(MP.open&&MP.tab==='fr')mpRList()}));
 MP.unsub.push(d.onValue(d.ref(D,'profiles'),s=>{MP.prof=s.val()||{};if(MP.open&&MP.tab==='fr')mpRList()}));
 MP.unsub.push(d.onChildAdded(d.query(d.ref(D,'pm/'+uid),d.limitToLast(30)),s=>{const v=s.val();if(!v||typeof v.m!=='string'||MP.seen.has('pm'+s.key))return;MP.seen.add('pm'+s.key);if(ignored(v.f)){FB.db.remove(FB.db.ref(FB.D,'pm/'+uid+'/'+s.key)).catch(()=>{});return}
  const fresh=typeof v.t==='number'&&mpNow()-v.t<15000;if(v.m.startsWith('[Party] '))mpLog('pt',v.m.slice(8,88),{n:String(v.n||'?').slice(0,12),uid:v.f,t:typeof v.t==='number'?v.t:0});else mpLog('pm',v.m.slice(0,80),{dir:'from',n:String(v.n||'?').slice(0,12),uid:v.f,t:typeof v.t==='number'?v.t:0});const last=MP.log[MP.log.length-1];if(!fresh)last.at=-1e9;
  else{if(!v.m.startsWith('[Party] '))MP.pmTo=MP.pmTo||v.f;if(!MP.open){MP.unread++;mpRBtn()}try{sfx('talk')}catch(e){}}}));
 MP.req={};MP.unsub.push(d.onValue(d.ref(D,'freq/'+uid),s=>{const v=s.val()||{},old=MP.req||{};MP.req={};for(const k in v)if(v[k]&&typeof v[k]==='object')MP.req[k]=v[k];
  for(const k in MP.req)if(!old[k]&&!isFriend(k)&&!ignored(k)){mpLog('game',String(MP.req[k].n||'Someone')+' added you as a friend. Open Chat > Friends to add them back.');if(!MP.open){MP.unread++;mpRBtn()}}
  if(MP.open&&MP.tab==='fr')mpRList()}));
 MP.unsub.push(()=>{MP.friends={};MP.prof={};MP.pmTo=null;MP.req={}});MP.pubProf=pub}
setInterval(()=>{if(MP.on&&MP.user&&MP.pubProf&&MP.profN!==myName()){MP.profN=myName();MP.pubProf()}},5000);
{const _ms=mpStart;mpStart=async function(u){await _ms(u);if(MP.on&&MP.user&&!MP.frOn){MP.frOn=MP.user.uid;try{friendsStart()}catch(e){mpErr(e)}}}}
{const _st=mpStop;mpStop=async function(m){MP.frOn=null;return _st(m)}}
// ---- Bug reports (beta): a BUG button under CHAT, in the START menu, on the title screen and in Options ----
// The report form asks what happened (and optionally what you expected), attaches a small screenshot and the game's
// state (where you are, device, screen, version), and saves it to bugs/<id> in the database (Realtime Database > bugs).
// Not signed in: the report waits on this device and is sent the next time you sign in.
const BUGV='2026-11-03';
{const st=document.createElement('style');st.textContent=`#mpbug{position:fixed;left:92px;top:52%;z-index:30;min-width:56px;height:40px;padding:0 10px;background:#f8f0e8;color:#b03828;border:3px solid #485870;box-shadow:inset 0 0 0 2px #e8b8a8;font:700 13px ${PF};letter-spacing:1px;cursor:pointer;touch-action:manipulation;
 clip-path:polygon(2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px)}
#mpbugf{position:fixed;left:8px;right:8px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:97;max-width:520px;margin:0 auto;background:#f8f8f8;color:#404040;font:500 14px ${PF};padding:14px;box-sizing:border-box;display:none;max-height:calc(100vh - 16px);overflow-y:auto}
#mpbugf .h{font-weight:700;font-size:17px;letter-spacing:1px}#mpbugf label{display:block;margin:10px 0 4px;font-weight:700}#mpbugf textarea{width:100%;box-sizing:border-box;min-height:84px;font:500 16px ${PF};padding:8px;border:2px solid #485870;background:#fff;color:#404040;border-radius:0}
#mpbugf .row{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}#mpbugf button{font:700 14px ${PF};padding:9px 14px;border:3px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer}#mpbugf .pri{background:#485870;color:#f8f8f8}
#mpbugf .shot{display:flex;align-items:center;gap:8px;margin-top:8px}#mpbugf img{width:84px!important;max-width:84px!important;height:auto!important;border:2px solid #a8c0e0;image-rendering:auto!important}#mpbugf .st{margin-top:8px;font-size:13px;color:#707070;min-height:16px}`;document.head.appendChild(st)}
const bugBtn=el('button','mpbug','','BUG'),bugF=el('div','mpbugf','g3','<div class="h">REPORT A BUG</div><p style="margin:6px 0 0;line-height:1.4">Thanks for testing! Tell us what went wrong. A screenshot and your game details are attached.</p>'+
 '<label for="bgw">What happened?</label><textarea id="bgw" maxlength="1500" placeholder="e.g. I fell through the bridge near Saltmere"></textarea>'+
 '<label for="bge">What did you expect? (optional)</label><textarea id="bge" maxlength="600" style="min-height:52px"></textarea>'+
 '<div class="shot"><input type="checkbox" id="bgs" checked><label for="bgs" style="margin:0;font-weight:500">Attach a screenshot</label><img id="bgi" alt="Screenshot preview"></div>'+
 '<div class="row"><button class="pri" id="bgsend">SEND REPORT</button><button id="bgno">CANCEL</button></div><div class="st" id="bgst"></div>');
document.body.append(bugBtn,bugF);for(const e of[bugBtn,bugF])for(const ev of['touchstart','pointerdown','mousedown','keydown','keyup'])e.addEventListener(ev,stop);
let bugShot='';
function bugOpen(){try{const c=document.getElementById('c');bugShot='';for(const[w,q]of[[420,.6],[340,.5],[260,.45],[200,.4]]){const h=Math.round(Math.min(c.height*w/c.width,w*2.2)),t=document.createElement('canvas');t.width=w;t.height=h;t.getContext('2d').drawImage(c,0,0,w,h);const u=t.toDataURL('image/jpeg',q);if(u.length<300000){bugShot=u;break}}}catch(e){bugShot=''}
 $('bgi').src=bugShot||'';$('bgi').style.display=bugShot?'block':'none';$('bgst').textContent=MP.on?'':'You are offline: the report is kept on this device and sent when you sign in.';
 bugF.style.display='block';mpClearKeys();if(!GPON)setTimeout(()=>$('bgw').focus(),30)}
function bugClose(){bugF.style.display='none';setFocus(null)}
function bugInfo(){const R=SCENE&&SCENE.room;return{where:mpLoc()||(SCENE?'private:'+SCENE.id:'hollow'),x:Math.round(P.x),y:Math.round(P.y),region:curRegion(),day:Math.floor(time/DAYLEN)+1,
 hp:P.hp,quest:Q.i,dead:!!dead,pad:!!GPON,pc:!!isPC,ua:navigator.userAgent.slice(0,200),scr:innerWidth+'x'+innerHeight+'@'+(window.devicePixelRatio||1),standalone:!!(navigator.standalone||matchMedia('(display-mode: standalone)').matches),v:BUGV,last:(MP.log.slice(-6).map(m=>m.m).join(' | ')).slice(0,400)}}
function bugSendNow(r){const d=FB.db;return d.push(d.ref(FB.D,'bugs'),Object.assign(r,{u:MP.user.uid,n:myName().slice(0,12),t:d.serverTimestamp()}))}
function bugFlush(){if(!MP.on)return;let q=[];try{q=JSON.parse(lsGet('sq_bugq')||'[]')}catch(e){}if(!q.length)return;lsSet('sq_bugq','[]');for(const r of q)bugSendNow(r).catch(()=>{})}
$('bgsend').onclick=async()=>{const w=$('bgw').value.trim();if(w.length<3){$('bgst').textContent='Please describe what happened.';return}
 const r={what:w.slice(0,1500),exp:$('bge').value.trim().slice(0,600),info:bugInfo(),shot:$('bgs').checked?bugShot:''};
 if(!MP.on){let q=[];try{q=JSON.parse(lsGet('sq_bugq')||'[]')}catch(e){}q.push(r);while(q.length>5)q.shift();lsSet('sq_bugq',JSON.stringify(q));$('bgw').value='';$('bge').value='';bugClose();say('Bug report saved. It will be sent when you sign in.');return}
 $('bgst').textContent='Sending...';try{await bugSendNow(r);$('bgw').value='';$('bge').value='';bugClose();say('Bug report sent. Thank you!')}catch(e){$('bgst').textContent='Could not send. Try again in a moment.';mpErr(e)}};
$('bgno').onclick=bugClose;bugBtn.onclick=bugOpen;
// typing in the form never moves your character
addEventListener('keydown',e=>{const t=e.target;if(!t||!bugF.contains(t))return;e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();bugClose()}},true);
addEventListener('keyup',e=>{if(e.target&&bugF.contains(e.target))e.stopImmediatePropagation()},true);
setInterval(()=>{bugBtn.style.display=(pnOpen||menuOpen||chessOpen||TS.open||bugF.style.display==='block')?'none':'block'},250);
{const _ms=mpStart;mpStart=async function(u){await _ms(u);try{bugFlush()}catch(e){}}}
// also in the START menu, the title screen and Options
SMI.splice(SMI.findIndex(x=>x.id==='options'),0,{id:'bug',l:()=>'Report a bug'});
{const _ss=showScreen;showScreen=function(id){if(id!=='bug')return _ss(id);releaseMenu();bugOpen()}}
{const _opt=optionsHTML;optionsHTML=function(){const h=_opt(),k=h.indexOf('<div class="tl" style="margin-top:22px');const add='<button class="sb mpbg" data-o="bug">Report a bug</button>';return k<0?h+add:h.slice(0,k)+add+h.slice(k)}}
{const _oc=pbd.onclick;pbd.onclick=e=>{if(e.target.closest('.mpbg')){closePanel();bugOpen();return}_oc(e)}}
{const _tm=tsMenu;tsMenu=function(){_tm();if(!tsMn.querySelector('[data-a="bug"]')){const b=document.createElement('button');b.dataset.a='bug';b.textContent='REPORT A BUG';const st=tsMn.querySelector('.tsst');tsMn.insertBefore(b,st)}}}
tsMn.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.a==='bug'){bugOpen()}});
// controller: the form is navigable, ○ closes it
{const _nr=navRoot;navRoot=function(){if(bugF.style.display==='block')return bugF;return _nr()}}
addEventListener('keydown',e=>{if(e.key==='Escape'&&bugF.style.display==='block'&&!e.isTrusted){bugClose();e.stopImmediatePropagation()}},true);
// ---- Houses in the shared world: everyone's houses stand on the island; friends can go inside ----
// houses/<uid>: your houses (where they stand and their furniture; chest contents stay private).
// Other players' houses are added to the island (marked _foreign, never saved into your game). You can walk into a
// house if its owner has you on their friends list; inside you see their furniture and anyone else visiting.
// You can't open their chests, sleep in their bed, use their stations or redecorate.
const HS={pubKey:'',pubAt:0,data:{},fr:{},frUnsub:{},unsub:null,msgAt:0};
const isForeign=h=>!!(h&&h._foreign);
function houseLocOf(h){if(!h||!MP.user)return'';return'h:'+(h._owner||MP.user.uid)+':'+(h._oid||h.id)}
function myHousesData(){return HOUSES.filter(h=>!h._foreign).map(h=>({s2:1,id:h.id,x:h.x,y:h.y,w:h.w||5,f:[...h.furn].map(([i,f])=>[i,f.t])}))}
function canEnter(h){return!!(HS.fr[h._owner]&&MP.user&&HS.fr[h._owner][MP.user.uid])}
function buildForeign(owner,e){const RW=14,RH=10,h={id:owner.slice(0,6)+'_'+String(e.id).slice(0,12),_oid:String(e.id).slice(0,12),_owner:owner,_foreign:true,x:e.x|0,y:e.y|0,w:e.w===7?7:5,furn:new Map(),hp:12};
 const arr=v=>Array.isArray(v)?v:(v&&typeof v==='object'?Object.values(v):null);const fl=arr(e.f);if(fl)for(const q0 of fl){const q=arr(q0);if(!q)continue;const i=q[0]|0,t=q[1];if(i<2*RW||i>=RW*RH||!BK.includes(t)||t==='house')continue;h.furn.set(i,t==='chest'?{t,items:{}}:{t})}return h}
function overlapsMine(h){const hw=((h.w||5)-1)/2;for(const o of HOUSES){if(o===h||o._foreign&&o._owner===h._owner&&o._oid===h._oid)continue;const ow=((o.w||5)-1)/2;if(Math.abs(o.x-h.x)<=hw+ow+1&&Math.abs(o.y-h.y)<=2)return true}
 for(let dy=-1;dy<=0;dy++)for(let dx=-hw;dx<=hw;dx++){const i=(h.y+dy)*N+h.x+dx;if(STR.has(i))return true}return false}
function housesSync(){if(!MP.on)return;const want=new Map();
 for(const owner in HS.data){if(MP.user&&owner===MP.user.uid)continue;const list=HS.data[owner];if(!Array.isArray(list))continue;for(const e of list){if(!e||!isFinite(e.x)||!isFinite(e.y))continue;want.set(owner+'|'+e.id,{owner,e})}}
 for(let j=HOUSES.length-1;j>=0;j--){const h=HOUSES[j];if(!h._foreign)continue;const k=h._owner+'|'+h._oid,w=want.get(k);
  if(!w){if(SCENE&&SCENE.house===h){leaveScene();say('That house is gone.')}for(const i of houseTiles(h))BS.delete(i);HOUSES.splice(j,1);continue}
  const fresh=buildForeign(w.owner,w.e);if(fresh.x!==h.x||fresh.y!==h.y){for(const i of houseTiles(h))BS.delete(i);HOUSES.splice(j,1);continue}h.furn=fresh.furn;want.delete(k)}
 for(const{owner,e}of want.values()){const h=buildForeign(owner,e);if(h.x<4||h.y<3||h.x>N-5||h.y>N-3||overlapsMine(h))continue;HOUSES.push(h);addHouseBS(h);
  if(!HS.frUnsub[owner]){HS.frUnsub[owner]=FB.db.onValue(FB.db.ref(FB.D,'friends/'+owner),s=>{HS.fr[owner]=s.val()||{}})}}}
function housesStart(){const d=FB.db;HS.unsub=d.onValue(d.ref(FB.D,'houses'),s=>{HS.data=s.val()||{};for(const k in HS.data){const v=HS.data[k];if(v&&!Array.isArray(v)&&typeof v==='object')HS.data[k]=Object.values(v)}housesSync()});
 MP.unsub.push(()=>{if(HS.unsub)HS.unsub();HS.unsub=null;for(const k in HS.frUnsub)try{HS.frUnsub[k]()}catch(e){}HS.frUnsub={};HS.fr={};HS.data={};HS.pubKey='';
  if(SCENE&&SCENE.house&&SCENE.house._foreign)leaveScene();for(let j=HOUSES.length-1;j>=0;j--)if(HOUSES[j]._foreign){for(const i of houseTiles(HOUSES[j]))BS.delete(i);HOUSES.splice(j,1)}})}
function housesTick(){if(!MP.on||!FB||!MP.user)return;const now=performance.now();if(now-HS.pubAt<3000)return;HS.pubAt=now;
 const mine=myHousesData(),k=JSON.stringify(mine);if(k!==HS.pubKey){HS.pubKey=k;FB.db.set(FB.db.ref(FB.D,'houses/'+MP.user.uid),mine.length?mine:null).catch(()=>{HS.pubKey=''})}
 if(!HOUSES.some(h=>h._foreign)&&Object.keys(HS.data).some(o=>o!==MP.user.uid))housesSync()} // e.g. after a save was loaded
{const _ms=mpStart;mpStart=async function(u){await _ms(u);if(MP.on&&!HS.unsub)try{housesStart()}catch(e){mpErr(e)}}}
// never save other people's houses into your game
{const _sn=snap;snap=function(){const s=_sn();if(Array.isArray(s.houses)){const fids=new Set(HOUSES.filter(h=>h._foreign).map(h=>h.id));s.houses=s.houses.filter(h=>!fids.has(h.id))}if(s.home&&HOUSES.some(h=>h._foreign&&h.id===s.home))s.home=null;return s}}
// the door: friends only
{const _es=enterScene;enterScene=function(id,house,ret){if(house&&house._foreign&&!canEnter(house)){const now=performance.now();if(now-HS.msgAt>2500){HS.msgAt=now;const nm=fname(house._owner);say('This is '+nm+'\'s house. Only '+nm+'\'s friends can go in.');sfx('swish')}P.y+=6;return}
 _es(id,house,ret);if(house&&house._foreign)say('You visit '+fname(house._owner)+'\'s house.')}}
// inside someone else's house: look, don't touch
{const _uf=useFurn;useFurn=function(it){const h=SCENE&&SCENE.house;if(h&&h._foreign){const st=it&&(it.f?it.f.t:it.t);if(st&&typeof STN!=='undefined'&&STN.has(st)&&window.SQTRUTHEN){SQTRUTHEN(h._owner,()=>openStation({t:st,inside:true,i:it.i,f:it.f||{t:st},_foreign:h._owner,_ok:1}));return}say(it&&it.use==='chest'?'That chest belongs to '+fname(h._owner)+'.':it&&it.use==='bed'?'That\'s '+fname(h._owner)+'\'s bed.':'Better ask '+fname(h._owner)+' first.');sfx('swish');return}return _uf(it)}}
{const _sb=startBuild;startBuild=function(k){const h=SCENE&&SCENE.house;if(h&&h._foreign){say('You can only decorate your own house.');closePanel();return}return _sb(k)}}
// ---- START menu: Friends, and Save & quit to title ----
function tsReopen(){try{saveLocal(true);saveCloud(true)}catch(e){}closePanel();if(typeof closeSM==='function'&&typeof smOpen!=='undefined'&&smOpen)closeSM();if(MP.open)mpCloseChat();
 TS.open=true;TS.mh='';tsEl.style.display='flex';tsStage(0);tsDrawHero();tsFoot();requestAnimationFrame(tsLoop);say('Game saved.')}
SMI.splice(SMI.findIndex(x=>x.id==='online')+1,0,{id:'friends',l:()=>'Friends'});
// Craft straight from the START menu (it used to hide behind Skills > Craft)
if(!SMI.some(x=>x.id==='craft'))SMI.splice(SMI.findIndex(x=>x.id==='skills')+1,0,{id:'craft',l:()=>'Craft'});
SMI.splice(SMI.findIndex(x=>x.id==='exit'),0,{id:'title',l:()=>'Save & quit'});
{const _ss=showScreen;showScreen=function(id){if(id==='friends'){releaseMenu();if(!MP.on){sg.style.display='block';return}MP.tab='fr';mpOpenChat();return}if(id==='title'){releaseMenu();tsReopen();return}return _ss(id)}}
// ---- Other players' farms, built things and boats; nobody can damage what isn't theirs ----
// build/<uid>: your farm plots (crop, growth, water) and the things you built outside (fences, walls, chests, stations...;
// chest contents stay private). Other players' plots and builds appear on your island (marked _foreign, never saved).
// You can't hit, harvest, water, plant in, open or use anything that belongs to someone else, and their houses can't be
// knocked down. Sailing players show in their boat.
const BLDS={pubKey:'',pubAt:0,data:{},unsub:null,str:new Map(),farm:new Map(),msgAt:0};
const ownerOfTile=i=>{const s=STR.get(i);if(s&&s._foreign)return s._foreign;const p=FARM.get(i);if(p&&p._foreign)return p._foreign;return null};
function notYours(owner){const n=performance.now();if(n-BLDS.msgAt>1500){BLDS.msgAt=n;say('That belongs to '+fname(owner)+'.');sfx('swish')}swing=.25}
function buildSync(){if(!MP.on)return;const arr=v=>Array.isArray(v)?v:(v&&typeof v==='object'?Object.values(v):[]);const wantS=new Map(),wantF=new Map();
 for(const owner in BLDS.data){if(MP.user&&owner===MP.user.uid)continue;const rec=BLDS.data[owner];if(!rec)continue;
  for(const e0 of arr(rec.s)){const e=arr(e0);const i=e[0]|0,t=e[1];if(i<0||i>=N*N||!BK.includes(t)||t==='house'||tile[i]===0)continue;if(!wantS.has(i))wantS.set(i,{owner,t})}
  for(const e0 of []){const e=arr(e0);const i=e[0]|0;if(i<0||i>=N*N||tile[i]===0)continue;if(!e[1]&&+e[4]&&nowS()-e[4]>TILL_LIFE)continue;if(!wantF.has(i))wantF.set(i,{owner,c:CROPS[e[1]]?e[1]:null,g:+e[2]||0,w:+e[3]||0})}}
 // structures
 for(const[i,s]of[...STR])if(s._foreign){const w=wantS.get(i);if(!w||w.owner!==s._foreign||w.t!==s.t)STR.delete(i);else wantS.delete(i)}
 for(const[i,w]of wantS){if(STR.has(i)||FARM.has(i)||BS.has(i))continue;STR.set(i,{t:w.t,hp:BHP[w.t]||4,_foreign:w.owner,items:w.t==='chest'?{}:undefined});obj[i]=null}
 // farm plots
 for(const[i,p]of[...FARM])if(p._foreign){const w=wantF.get(i);if(!w||w.owner!==p._foreign)FARM.delete(i);else{p.c=w.c;p.g=w.g;p.w=w.w;wantF.delete(i)}}
 for(const[i,w]of wantF){if(FARM.has(i)||STR.has(i)||BS.has(i))continue;FARM.set(i,{c:w.c,g:w.g,w:w.w,_foreign:w.owner});obj[i]=null}}
function buildStart(){const d=FB.db;BLDS.unsub=d.onValue(d.ref(FB.D,'build'),s=>{BLDS.data=s.val()||{};buildSync()});
 MP.unsub.push(()=>{if(BLDS.unsub)BLDS.unsub();BLDS.unsub=null;BLDS.data={};BLDS.pubKey='';for(const[i,s]of[...STR])if(s._foreign)STR.delete(i);for(const[i,p]of[...FARM])if(p._foreign)FARM.delete(i)})}
function buildTick(){if(!MP.on||!FB||!MP.user)return;const now=performance.now();if(now-BLDS.pubAt<3000)return;BLDS.pubAt=now;
 const s=[...STR].filter(([i,v])=>!v._foreign).map(([i,v])=>[i,v.t]),f=[];
 const r=rbPub(),k=JSON.stringify([s,f.map(q=>[q[0],q[1],Math.round(q[2]/5)]),r]);if(k!==BLDS.pubKey){BLDS.pubKey=k;FB.db.set(FB.db.ref(FB.D,'build/'+MP.user.uid),s.length||f.length||r?Object.assign({s,f,h:2},r?{r}:{}):null).catch(()=>{BLDS.pubKey=''})}
 if(BLDS.data&&Object.keys(BLDS.data).length&&![...STR.values()].some(v=>v._foreign)&&![...FARM.values()].some(p=>p._foreign))buildSync()}
{const _ms=mpStart;mpStart=async function(u){await _ms(u);if(MP.on&&!BLDS.unsub)try{buildStart()}catch(e){mpErr(e)}}}
// never save other people's things
{const _sn=snap;snap=function(){const s=_sn();const fs=new Set([...STR].filter(([i,v])=>v._foreign).map(([i])=>i)),ff=new Set([...FARM].filter(([i,p])=>p._foreign).map(([i])=>i));
  if(Array.isArray(s.str))s.str=s.str.filter(e=>!fs.has(e[0]));if(Array.isArray(s.farm))s.farm=s.farm.filter(e=>!ff.has(e[0]));return s}}
// hands off: hitting, harvesting, watering, planting, opening, using
{const _atk=attack;attack=function(){if(!dead&&!menuOpen&&!pnOpen&&!SCENE&&swing<=0&&!FISH){const[x,y]=frontTile(),i=y*N+x,o=ownerOfTile(i);
   if(o){notYours(o);return}const h=houseAt(x,y);if(h&&h._foreign&&!(x===h.x&&y===h.y)){notYours(h._owner);return}}return _atk()}}
{const _hh=hitHouse;hitHouse=function(h){if(h&&h._foreign){notYours(h._owner);return}return _hh(h)}}
{const _hs=hitStructure;hitStructure=function(i){const s=STR.get(i);if(s&&s._foreign){notYours(s._foreign);return}return _hs(i)}}
{const _us=useStructure;useStructure=function(i){const s=STR.get(i);if(s&&s._foreign){notYours(s._foreign);return}return _us(i)}}
{const _cp=canPlace;canPlace=function(x,y){if(ownerOfTile(y*N+x))return false;return _cp(x,y)}}
// boats: sailing players show in their boat
{const _dp=mpDrawPeer;mpDrawPeer=function(r,tm){if(!r.sl)return _dp(r,tm);const px=P.x,py=P.y,f=face;P.x=r.x;P.y=r.y;face=r.d===2?[r.fl?-1:1,0]:[0,r.d===1?-1:1];
  const fc=face;try{drawBoat26(tm)}finally{P.x=px;P.y=py;face=f}
  const bob=Math.round(Math.sin(tm*2.6));g.save();g.translate(0,(window.BOAT85?BOAT85.dy:3)+bob);try{_dp(r,tm)}finally{g.restore()}
  drawBoatFront26(Math.round(r.x),Math.round(r.y)+bob,fc,tm);MP.T=g.getTransform();MP.Tat=performance.now()}}
// safety net: if the game thinks a screen is open but nothing is showing, let the player move again
{let stuck=0;setInterval(()=>{const hidden=pn.style.display==='none'&&!(typeof smOpen!=='undefined'&&smOpen)&&!chessOpen&&!TS.open;
  if(pnOpen&&hidden){if(++stuck>=2){pnOpen=false;fromMenu=false;stuck=0}}else stuck=0;
  if(menuOpen&&cm.style.display==='none'&&!TS.open&&!(typeof chessOpen!=='undefined'&&chessOpen)){menuOpen=false}},250)}
// ---- Unique names: first come, first served ----
// names/<lowercase name> = the uid that owns it (the server only lets you claim a free name, or let go of your own).
// Online, your name is claimed for you. If someone already has it, a box asks you to pick another (capitals don't
// make a different name). Renaming to a taken name puts your old name back. Changing your name frees the old one.
const NM={claimed:null,key:null,busy:false,box:null};
const nameKey=n=>String(n||'').trim().toLowerCase().replace(/[.#$\[\]\/]/g,'_').slice(0,12);
const cleanName=n=>String(n||'').replace(/[<>]/g,'').trim().slice(0,10);
async function nameClaim(n){const d=FB.db,k=nameKey(n);if(!k)return'bad';const ref=d.ref(FB.D,'names/'+k);let v=null;try{v=(await d.get(ref)).val()}catch(e){return'error'}
 if(v===MP.user.uid){NM.claimed=n;NM.key=k;return'ok'}if(v)return'taken';
 try{await d.set(ref,MP.user.uid)}catch(e){return/permission/i.test(String(e&&(e.code||e.message)))&&!v?'taken':'error'} // someone got there first
 const old=NM.key||(MP.prof&&MP.prof[MP.user.uid]&&MP.prof[MP.user.uid].k);if(old&&old!==k)d.remove(d.ref(FB.D,'names/'+old)).catch(()=>{});NM.claimed=n;NM.key=k;
 d.update(d.ref(FB.D,'profiles/'+MP.user.uid),{k}).catch(()=>{});return'ok'}
{const st=document.createElement('style');st.textContent=`#mpname{position:fixed;left:8px;right:8px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:98;max-width:460px;margin:0 auto;background:#f8f8f8;color:#404040;font:500 14px ${PF};padding:14px;box-sizing:border-box;display:none}
#mpname .h{font-weight:700;font-size:17px;letter-spacing:1px}#mpname p{line-height:1.4;margin:8px 0 10px}#mpname .row{display:flex;gap:8px}#mpname input{flex:1;min-width:0;font:500 17px ${PF};padding:7px 9px;border:2px solid #485870;background:#fff;color:#404040;border-radius:0}
#mpname button{font:700 14px ${PF};padding:8px 14px;border:3px solid #485870;background:#485870;color:#f8f8f8;cursor:pointer}#mpname .st{margin-top:8px;font-size:13px;color:#b03828;min-height:16px}`;document.head.appendChild(st)}
const nmBox=el('div','mpname','g3','<div class="h">CHOOSE A NAME</div><p id="nmwhy"></p><form class="row" id="nmf" autocomplete="off"><input id="nmin" maxlength="10" aria-label="New name" placeholder="New name"><button type="submit">SAVE</button></form><div class="st" id="nmst"></div>');
document.body.appendChild(nmBox);for(const ev of['touchstart','pointerdown','mousedown','keydown','keyup'])nmBox.addEventListener(ev,stop);
function nameAsk(taken){NM.box=true;$('nmwhy').textContent='"'+taken+'" already belongs to another player. Pick a different name to play online. (Capital letters don\'t count as different.)';$('nmst').textContent='';$('nmin').value='';
 nmBox.style.display='block';mpClearKeys();if(!GPON)setTimeout(()=>$('nmin').focus(),30)}
$('nmf').onsubmit=async e=>{e.preventDefault();const n=cleanName($('nmin').value);if(n.length<2){$('nmst').textContent='Names need at least 2 letters.';return}if(!MP.on){$('nmst').textContent='You are offline.';return}
 $('nmst').textContent='Checking...';const r=await nameClaim(n);if(r==='ok'){PNAME=n;try{saveLocal(true);saveCloud(true)}catch(e){}nmBox.style.display='none';NM.box=null;setFocus(null);say('Your name is now '+n+'.');MP.lastCh='';if(MP.pubProf)MP.pubProf()}
 else $('nmst').textContent=r==='taken'?'"'+n+'" is taken too. Try another.':'Could not check that name. Try again in a moment.'};
addEventListener('keydown',e=>{const t=e.target;if(!t||!nmBox.contains(t))return;e.stopImmediatePropagation();if(e.key==='Enter'&&!e.isComposing){e.preventDefault();$('nmf').requestSubmit()}},true);
addEventListener('keyup',e=>{if(e.target&&nmBox.contains(e.target))e.stopImmediatePropagation()},true);
{const _nr=navRoot;navRoot=function(){if(nmBox.style.display==='block')return nmBox;return _nr()}}
// keep the claim in step with your name (waits while you're typing it)
async function nameCheck(){if(!MP.on||!MP.user||NM.busy||NM.box)return;const n=cleanName(myName());if(!n||nameKey(n)===NM.key)return;
 const a=document.activeElement;if(menuOpen||TS.open||(a&&(a.id==='cni'||a.id==='nmi')))return;
 NM.busy=true;let r;try{r=await nameClaim(n)}finally{NM.busy=false}
 if(r==='taken'){if(NM.claimed&&nameKey(NM.claimed)!==nameKey(n)){PNAME=NM.claimed;try{saveLocal(true)}catch(e){}say('"'+n+'" belongs to another player. Your name is still '+NM.claimed+'.');sfx('swish')}else nameAsk(n)}}
setInterval(()=>{nameCheck().catch(()=>{})},1000);
{const _st=mpStop;mpStop=async function(m){NM.claimed=null;NM.key=null;if(NM.box){nmBox.style.display='none';NM.box=null}return _st(m)}}
// ---- Minimap: other players; house name signs ----
// Presence also carries your outdoor area and spot (inside a building it's the door you came in by), so the HUD minimap
// shows everyone in the same area: friends in green, other players in blue.
const outdoorPos=()=>{if(SCENE&&SCENE.room&&SCENE.room.region)return[P.x,P.y];if(SCENE&&SCENE.ret)return[SCENE.ret.x,SCENE.ret.y];return[P.x,P.y]};
{const _dm=drawMini52;drawMini52=function(){_dm();if(!MP.on)return;const t=miniTarget();if(!t)return;const area=t.k==='region'?t.R.region:'hollow';
  const L=hudLayout(),U=L.U,w=L.dw,hh=w*t.h/t.w,x0=L.dx,y0=L.top+L.dh+46*U;g.save();g.setTransform(1,0,0,1,0,0);
  const m=(tx,ty,c,s)=>{g.fillStyle=c;g.fillRect(Math.round(x0+(tx+.5)/t.w*w-s*U/2),Math.round(y0+(ty+.5)/t.h*hh-s*U/2),Math.round(s*U),Math.round(s*U))};
  for(const[u,r]of MP.players){if(!live(r)||r.ar!==area||typeof r.ax!=='number')continue;const tx=r.ax/16-.5,ty=r.ay/16-.5;m(tx,ty,'#101018',3.6);m(tx,ty,MP.friends&&MP.friends[u]?'#60e860':'#60c0ff',2.4)}
  g.restore()}}
// house name signs: a small plaque over each house door with the owner's name
{const _lh=LHOOK;LHOOK=(L,x0,y0,x1,y1,tm)=>{if(_lh)_lh(L,x0,y0,x1,y1,tm);if(SCENE)return;
  for(const h of HOUSES){if(h.x<x0-4||h.x>x1+4||h.y<y0-3||h.y>y1+3)continue;const nm=h._foreign?fname(h._owner):(MP.on?myName():pname());if(!nm)continue;
   L.push([(h.y+1)*16+1,4,()=>{const cx=h.x*16+8,y=(h.y+1)*16-27;g.save();g.font='700 6px '+PF;const tw=Math.ceil(g.measureText(nm).width)+6,X=Math.round(cx-tw/2);
    g.fillStyle='#3a2414';g.fillRect(X-1,y-1,tw+2,10);g.fillStyle='#f4e8c8';g.fillRect(X,y,tw,8);g.fillStyle='#d8c098';g.fillRect(X,y+7,tw,1);
    g.fillStyle='#3a2414';g.textAlign='center';g.textBaseline='middle';g.fillText(nm,cx,y+4.5);g.restore()}])}}}
// ---- World map: where everyone online is ----
// Dots on every island for players online (friends in green with their name), and a list under the map:
// friends first, with the island they're on.
{const _dw=drawWorld52;drawWorld52=function(){_dw();if(!MP.on)return;const c=document.getElementById('wmc');if(!c)return;const x=c.getContext('2d');
  for(const[u,r]of MP.players){if(!live(r)||!WORLD_REGIONS[r.ar]||typeof r.ax!=='number'||!isFinite(r.ax))continue;const D=WORLD_REGIONS[r.ar],R=wmRect(r.ar),fr=MP.friends&&MP.friends[u];
   const px=Math.round(R.x+(r.ax/16)/D.width*R.w),py=Math.round(R.y+(r.ay/16)/D.height*R.h);x.fillStyle='#101018';x.fillRect(px-2,py-2,5,5);x.fillStyle=fr?'#60e860':'#60c0ff';x.fillRect(px-1,py-1,3,3);
   if(fr){x.font='700 8px '+PF;x.textAlign='center';x.textBaseline='bottom';x.lineWidth=3;x.strokeStyle='#101018';x.strokeText(r.n,px,py-3);x.fillStyle='#e8ffe8';x.fillText(r.n,px,py-3)}}}}
{const _wh=worldHTML52;worldHTML52=function(){let h=_wh();if(!MP.on)return h;const rows=[...MP.players].filter(([u,r])=>live(r)).sort((a,b)=>(+!!(MP.friends&&MP.friends[b[0]]))-(+!!(MP.friends&&MP.friends[a[0]]))||String(a[1].n).localeCompare(String(b[1].n)));
  let t='<div class="qc"><b>Players online ('+(rows.length+1)+')</b><small>';if(!rows.length)t+='<br>Nobody else is online right now.';
  for(const[u,r]of rows){const fr=MP.friends&&MP.friends[u],where=r.ar&&WORLD_REGIONS[r.ar]?WORLD_REGIONS[r.ar].name:'At sea';t+='<br><span style="color:'+(fr?'#28a048':'#3070c0')+'">&#9632;</span> '+esc(r.n||'?')+(fr?' (friend)':'')+' · '+esc(where)}
  return h+t+'</small></div>'}}
{const _lg=worldHTML52;worldHTML52=function(){const h=_lg();return MP.on?h.replace('<span><i style="background:#f8f8f8"></i>Landmark</span></div>','<span><i style="background:#f8f8f8"></i>Landmark</span><span><i style="background:#60e860"></i>Friend</span><span><i style="background:#60c0ff"></i>Player</span></div>'):h}}
{const _dpp=mpDrawPeer;mpDrawPeer=function(r,tm){try{if(window.LUX&&LUX.drawPeerPet)LUX.drawPeerPet(r,tm)}catch(e){}return _dpp(r,tm)}}
