// ---------------------------------------------------------------- 67. Trading between players
// Stand near another player and ask to trade: START menu > Trade, /trade name in chat, or TRADE in the Friends list.
// They get a request (a pop-up plus a chat line); if both ask each other, the window opens straight away.
// The trade window: put items and gold from your bag on your side, watch theirs. Two rounds of accepting, like
// RuneScape: ACCEPT on the offer screen, then ACCEPT again on the "are you sure?" screen that lists exactly what
// you give and get. Any change to either offer clears both accepts, and a red warning shows when they change theirs.
// Walking away, closing the window, going offline or changing area cancels the trade. Nothing moves until both have
// accepted twice; then each side swaps its own bag and saves at once.
// Database: treq/<to>/<from> = a request (expires after a minute). trades/<a_b>/<uid> = that player's side:
// {i:{item:count}, g:gold, a:first-accept key, c:second-accept key, d:done key}. Each player only writes their own side.
const TR={st:'idle',w:null,tid:'',me:{},g:0,th:{},tg:0,my:{a:'',c:'',d:''},their:null,unsub:null,applied:false,warnAt:0,lastTh:'',sent:{},inbox:{},reqUnsub:null,pop:null,popU:null,closing:false};
const TTAB=32,TRNEAR=6*16,TRSTEP=[1,5,'all'];
const trTid=(a,b)=>a<b?a+'_'+b:b+'_'+a;
const trName=u=>{const r=MP.players.get(u);return(r&&r.n)||(MP.prof&&MP.prof[u]&&MP.prof[u].n)||(typeof fname==='function'?fname(u):'Player')};
// someone you can trade with: online, in the same place and within a few steps
function trNear(u){const r=MP.players.get(u);if(!r||!live(r)||!MP.on)return false;const L=mpLoc();if(!L||r.loc!==L)return false;return Math.hypot(r.tx-P.x,r.ty-P.y)<=TRNEAR}
function trNearList(){const a=[];for(const[u,r]of MP.players)if(trNear(u))a.push(u);return a.sort((x,y)=>trName(x).localeCompare(trName(y)))}
// what's in your bag that can be traded (minus what's already on your side)
const trCan=k=>(inv[k]|0)-(TR.me[k]|0);
function trBagKeys(){const seen=new Set(),out=[];for(const k of BAG_ORDER().concat(INVK))if(!seen.has(k)&&INAME[k]){seen.add(k);if(trCan(k)>0)out.push(k)}return out}
const trClean=o=>{const r={};if(o&&typeof o==='object')for(const k in o){sqBookReg(k);const n=Math.floor(+o[k]||0);if(n>0&&INAME[k]&&INVK.includes(k))r[k]=Math.min(n,1e6)}return r};
// the agreement key: both offers, in a fixed order. Changing anything changes the key, so old accepts stop counting.
function trKey(){const mine=MP.user.uid,[a]=TR.tid.split('_'),s=o=>Object.keys(o).sort().map(k=>k+':'+o[k]).join(',');
 const A=a===mine?[s(TR.me),TR.g]:[s(TR.th),TR.tg],B=a===mine?[s(TR.th),TR.tg]:[s(TR.me),TR.g];return JSON.stringify([A,B])}
const trRef=p=>FB.db.ref(FB.D,p);
function trPush(extra){if(!TR.tid||!MP.on)return;const v={i:TR.me,g:TR.g,a:TR.my.a,c:TR.my.c,d:TR.my.d,t:FB.db.serverTimestamp(),...(extra||{})};
 FB.db.set(trRef('trades/'+TR.tid+'/'+MP.user.uid),v).catch(e=>{mpErr(e);trEnd(/permission/i.test(String(e&&(e.code||e.message)))?'Trading needs the latest database rules.':'Lost the connection, so the trade was cancelled.')})}
// ---- requests ----
function trRequest(u){if(!MP.on||!MP.user){say('Sign in to trade with other players.');return}if(!u||u===MP.user.uid)return;
 if(TR.st!=='idle'){say('Finish your current trade first.');return}if(!trNear(u)){say(trName(u)+' is too far away. Stand next to them to trade.');sfx('swish');return}
 if(TR.inbox[u]){trAnswer(u,true);return} // they already asked you
 const n=performance.now();if(TR.sent[u]&&n-TR.sent[u].at<4000)return;
 const d=FB.db;TR.sent[u]={at:n,seen:false};d.set(trRef('treq/'+u+'/'+MP.user.uid),{n:myName().slice(0,12),t:d.serverTimestamp()}).then(()=>{
   say('Trade request sent to '+trName(u)+'.');mpLog('game','You asked '+trName(u)+' to trade.');trWatch(u)}).catch(e=>{delete TR.sent[u];mpErr(e);
   say(/permission/i.test(String(e&&(e.code||e.message)))?'Trading needs the latest database rules.':'Could not send the trade request.')})}
// after asking: open the window when they accept, tell you if they say no
function trWatch(u){const d=FB.db,tid=trTid(u,MP.user.uid),S=TR.sent[u];if(!S)return;
 const offs=[];const done=()=>{offs.forEach(f=>f());delete TR.sent[u]};S.done=done;
 offs.push(d.onValue(trRef('trades/'+tid+'/'+u),s=>{const v=s.val();if(v&&!v.d&&TR.st==='idle'&&TR.sent[u]){done();trOpen(u,false)}}));
 offs.push(d.onValue(trRef('treq/'+u+'/'+MP.user.uid),s=>{if(s.exists()){S.seen=true;return}if(S.seen&&TR.sent[u])setTimeout(()=>{if(TR.sent[u]&&TR.st==='idle'){done();mpLog('game',trName(u)+' did not want to trade.')}},2500)}));
 setTimeout(()=>{if(TR.sent[u]&&TR.st==='idle'){done();d.remove(trRef('treq/'+u+'/'+MP.user.uid)).catch(()=>{})}},60000)}
function trAnswer(u,yes){const d=FB.db;delete TR.inbox[u];trPopHide(u);d.remove(trRef('treq/'+MP.user.uid+'/'+u)).catch(()=>{});
 if(!yes)return;if(TR.st!=='idle'){say('Finish your current trade first.');return}if(!trNear(u)){say(trName(u)+' is too far away now.');sfx('swish');return}trOpen(u,true)}
// ---- the request pop-up (not modal: it never takes the controller away from the game) ----
{const st=document.createElement('style');st.textContent=`#trpop{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 10px);z-index:31;display:none;align-items:center;gap:8px;padding:8px 10px;max-width:calc(100vw - 24px);box-sizing:border-box;font:600 14px ${PF}}
#trpop span{flex:1;min-width:0}#trpop button{font:700 13px ${PF};padding:7px 12px;border:3px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer}#trpop .ok{background:#485870;color:#f8f8f8}
.trc{display:grid;grid-template-columns:1fr 1fr;gap:8px}.trs{border:2px solid #a8c0e0;padding:6px 8px;min-height:70px;background:#fff}.trs b{display:block;font-size:12px;letter-spacing:1px;color:#485870;margin-bottom:4px}
.trs.them{background:#f0f4fc}.tri{display:flex;justify-content:space-between;gap:6px;font-size:13px;padding:2px 0;cursor:pointer}.trs.them .tri{cursor:default}.tri i{font-style:normal;opacity:.7}.trg{color:#a07010;font-weight:700}
.trw{background:#f8d8d0;color:#b03828;border:2px solid #b03828;padding:6px 8px;margin:8px 0;font-weight:700;font-size:13px;text-align:center}.trst{text-align:center;font-size:13px;margin:8px 0;min-height:18px}
.trb{display:flex;align-items:center;gap:6px;padding:5px 6px;border-bottom:1px solid #d8e0f0;font-size:13px}.trb span{flex:1}.trb button,.trgb button{font:700 12px ${PF};padding:6px 8px;border:2px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer}
.trgb{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:6px 0}.tra{display:flex;gap:8px;margin-top:10px}.tra button{flex:1;font:700 15px ${PF};padding:11px;border:3px solid #485870;cursor:pointer}
.tra .y{background:#38a828;color:#fff;border-color:#206818}.tra .y.on{background:#a8d898;color:#206818}.tra .n{background:#f8f8f8;color:#b03828}.trh{font-size:12px;opacity:.75;margin:10px 0 2px;letter-spacing:1px;font-weight:700}
@media(max-width:420px){.trc{grid-template-columns:1fr}}`;document.head.appendChild(st)}
const trPopEl=el('div','trpop','g3','<span></span><button class="ok">TRADE</button><button class="no">NO</button>');document.body.appendChild(trPopEl);
for(const ev of['touchstart','pointerdown','mousedown'])trPopEl.addEventListener(ev,stop);
trPopEl.querySelector('.ok').onclick=()=>{const u=TR.popU;if(u)trAnswer(u,true)};trPopEl.querySelector('.no').onclick=()=>{const u=TR.popU;if(u)trAnswer(u,false)};
function trPopShow(u){TR.popU=u;trPopEl.querySelector('span').textContent=trName(u)+' wants to trade with you.';trPopEl.style.display='flex';clearTimeout(TR.pop);TR.pop=setTimeout(()=>trPopHide(u),30000)}
function trPopHide(u){if(u&&TR.popU!==u)return;TR.popU=null;trPopEl.style.display='none';clearTimeout(TR.pop)}
// ---- the trade session ----
function trOpen(u,iAccepted){const d=FB.db;TR.st='offer';TR.w=u;TR.tid=trTid(u,MP.user.uid);TR.me={};TR.g=0;TR.th={};TR.tg=0;TR.my={a:'',c:'',d:''};TR.their=null;TR.applied=false;TR.lastTh='';TR.warnAt=0;TR.seenThem=false;TR.closing=false;
 delete TR.inbox[u];trPopHide(u);if(TR.sent[u]&&TR.sent[u].done)TR.sent[u].done();
 try{if(typeof releaseMenu==='function')releaseMenu()}catch(e){}if(MP.open&&typeof mpCloseChat==='function')try{mpCloseChat()}catch(e){}
 trPush();TR.unsub=d.onValue(trRef('trades/'+TR.tid+'/'+u),s=>trTheirs(s.val()));
 TR.openAt=performance.now();pnOpen=true;ptab=TTAB;jx=jy=0;fromMenu=false;pn.style.display='block';rPn();sfx('talk');mpLog('game','Trading with '+trName(u)+'.')}
function trTheirs(v){if(TR.st==='idle')return;
 if(!v){if(TR.seenThem&&!TR.applied)trEnd(trName(TR.w)+' declined the trade.');return}
 const was=TR.their,th=trClean(v.i),tg=Math.max(0,Math.min(1e9,Math.floor(+v.g||0)));TR.seenThem=true;TR.their={a:String(v.a||''),c:String(v.c||''),d:String(v.d||'')};
 const k=JSON.stringify([th,tg]);if(TR.lastTh&&k!==TR.lastTh){
  // warn when something was taken away, or when either of you had already accepted (the classic switcheroo)
  const less=tg<TR.tg||Object.keys(TR.th).some(q=>(th[q]|0)<TR.th[q]);if(less||TR.my.a||(was&&was.a))TR.warnAt=performance.now();if(TR.st==='confirm')TR.st='offer';if(TR.my.a||TR.my.c){TR.my.a='';TR.my.c='';trPush()}sfx('swish')}
 TR.lastTh=k;TR.th=th;TR.tg=tg;trStep()}
// moves between the two screens and finishes the swap when both have accepted twice
function trStep(){if(TR.st==='idle'||!TR.their)return;const key=trKey(),t=TR.their;
 if(TR.my.a&&TR.my.a!==key){TR.my.a='';TR.my.c='';trPush()}
 if(TR.st==='offer'&&TR.my.a===key&&t.a===key){TR.st='confirm';sfx('talk')}
 if(TR.st==='confirm'&&(TR.my.a!==key||t.a!==key))TR.st='offer';
 if(TR.st==='confirm'&&TR.my.c===key&&(t.c===key||t.d===key)&&!TR.applied){trApply(key);return}
 if(pnOpen&&ptab===TTAB)rPn()}
function trApply(key){for(const k in TR.me)if((inv[k]|0)<TR.me[k]){trEnd('You no longer have everything you offered, so the trade was cancelled.');return}if(GLD<TR.g){trEnd('You no longer have that much gold.');return}
 TR.applied=true;for(const k in TR.me)inv[k]=(inv[k]|0)-TR.me[k];GLD-=TR.g;for(const k in TR.th)inv[k]=(inv[k]|0)+TR.th[k];GLD+=TR.tg;
 const got=trList(TR.th,TR.tg);try{saveLocal(true)}catch(e){}try{saveCloud(true)}catch(e){}TR.my.d=key;trPush();
 const w=TR.w;sfx('quest');try{setTimeout(()=>sfx('coin'),150)}catch(e){}say('Trade complete!'+(got?' You got '+got+'.':''));try{window.SQACH&&SQACH.add('trade')}catch(e){}mpLog('game','Trade with '+trName(w)+' complete.'+(got?' You got '+got+'.':''));
 trEnd(null)}
function trEnd(why){if(TR.st==='idle')return;const tid=TR.tid,me=MP.user&&MP.user.uid,keep=TR.applied;TR.st='idle';if(TR.unsub){TR.unsub();TR.unsub=null}
 // remove your side (after a moment when finished, so the other player sees your "done" first)
 if(tid&&me&&MP.on)setTimeout(()=>FB.db.remove(trRef('trades/'+tid+'/'+me)).catch(()=>{}),keep?4000:0);
 TR.w=null;TR.tid='';TR.me={};TR.g=0;TR.th={};TR.tg=0;TR.their=null;
 if(why){say(why);sfx('swish');mpLog('game',why)}if(pnOpen&&ptab===TTAB){TR.closing=true;closePanel();TR.closing=false}}
const trList=(o,g)=>{const a=Object.keys(o).map(k=>o[k]+' × '+(INAME[k]||k).toLowerCase());if(g)a.push(g.toLocaleString('en-US')+' gold');return a.join(', ')};
// ---- the window ----
function trSide(o,g,them){let h='';const ks=Object.keys(o);for(const k of ks)h+='<div class="tri"'+(them?'':' data-tr="rm" data-k="'+k+'"')+'><span>'+esc(INAME[k]||k)+'</span><i>×'+o[k]+'</i></div>';
 if(g)h+='<div class="tri trg"'+(them?'':' data-tr="g0"')+'><span>Gold</span><i>'+g.toLocaleString('en-US')+'</i></div>';if(!ks.length&&!g)h+='<div style="opacity:.55;font-size:12px">Nothing yet</div>';return h}
function tradeHTML(){if(TR.st==='idle')return'<div class="tl">TRADE</div>'+trPickHTML();const wn=esc(trName(TR.w)),key=trKey(),t=TR.their||{a:'',c:''};
 const warn=performance.now()-TR.warnAt<6000?'<div class="trw">'+wn+' changed their offer! Check it again.</div>':'';
 if(TR.st==='confirm'){const give=trList(TR.me,TR.g)||'nothing',get=trList(TR.th,TR.tg)||'nothing';
  return'<div class="tl">ARE YOU SURE?</div>'+warn+'<div class="qc"><b>You give '+wn+':</b><p>'+esc(give)+'</p><b>You get:</b><p>'+esc(get)+'</p></div>'+
   '<div class="trst">'+(TR.my.c===key?'Waiting for '+wn+' to accept...':t.c===key?wn+' has accepted. Your turn.':'Check everything, then accept.')+'</div>'+
   '<div class="tra"><button class="y'+(TR.my.c===key?' on':'')+'" data-tr="ok2">'+(TR.my.c===key?'ACCEPTED':'ACCEPT')+'</button><button class="n" data-tr="no">DECLINE</button></div>'}
 let h='<div class="tl">TRADING WITH '+wn.toUpperCase()+'</div>'+warn+'<div class="trc"><div class="trs"><b>YOUR OFFER</b>'+trSide(TR.me,TR.g,false)+'</div><div class="trs them"><b>'+wn.toUpperCase()+'\'S OFFER</b>'+trSide(TR.th,TR.tg,true)+'</div></div>';
 h+='<div class="trst">'+(TR.my.a===key?'Waiting for '+wn+' to accept...':t.a===key?wn+' has accepted. Your turn.':'Tap your offer to take things back.')+'</div>';
 h+='<div class="tra"><button class="y'+(TR.my.a===key?' on':'')+'" data-tr="ok1">'+(TR.my.a===key?'ACCEPTED':'ACCEPT')+'</button><button class="n" data-tr="no">DECLINE</button></div>';
 const left=GLD-TR.g;h+='<div class="trh">GOLD (you have '+left.toLocaleString('en-US')+' left)</div><div class="trgb">';for(const v of[10,100,1000,10000])h+='<button data-tr="g" data-v="'+v+'"'+(left<v?' disabled style="opacity:.4"':'')+'>+'+v.toLocaleString('en-US')+'</button>';
 h+='<button data-tr="g" data-v="all"'+(left<=0?' disabled style="opacity:.4"':'')+'>All</button>'+(TR.g?'<button data-tr="g0">Clear</button>':'')+'</div><div class="trh">YOUR BAG</div>';
 const ks=trBagKeys();if(!ks.length)h+='<div style="opacity:.6;font-size:13px;padding:6px">Nothing left to offer.</div>';
 for(const k of ks){const n=trCan(k);h+='<div class="trb"><span>'+esc(INAME[k])+' <i style="font-style:normal;opacity:.65">×'+n+'</i></span>';for(const s of TRSTEP)if(s==='all'||n>=s&&(s===1||n>s))h+='<button data-tr="add" data-k="'+k+'" data-v="'+s+'">'+(s==='all'?'All':'+'+s)+'</button>';h+='</div>'}
 return h}
function trPickHTML(){let h='';const ins=Object.keys(TR.inbox).filter(u=>trNear(u));if(ins.length){h+='<div class="trh">REQUESTS</div>';for(const u of ins)h+='<div class="trb"><span>'+esc(trName(u))+' wants to trade</span><button data-tr="yes" data-u="'+u+'">TRADE</button><button data-tr="nah" data-u="'+u+'">NO</button></div>'}
 if(!MP.on)return h+'<div class="qc"><p>Sign in on the title screen to trade with other players.</p></div>';
 const near=trNearList().filter(u=>!ins.includes(u));h+='<div class="trh">PLAYERS NEARBY</div>';if(!near.length&&!ins.length)h+='<div class="qc"><p>Nobody is close enough. Stand next to another player, then come back here (or type <b>/trade name</b> in chat).</p></div>';
 for(const u of near){const s=TR.sent[u];h+='<div class="trb"><span>'+esc(trName(u))+'</span><button data-tr="ask" data-u="'+u+'"'+(s?' disabled style="opacity:.5"':'')+'>'+(s?'ASKED':'TRADE')+'</button></div>'}return h}
function trClick(b){const a=b.dataset.tr,k=b.dataset.k;
 if(a==='ask'){trRequest(b.dataset.u);setTimeout(()=>{if(pnOpen&&ptab===TTAB)rPn()},300);return}if(a==='yes'){trAnswer(b.dataset.u,true);return}if(a==='nah'){trAnswer(b.dataset.u,false);rPn();return}
 if(TR.st==='idle')return;if(a==='no'){trEnd('You declined the trade.');return}
 if(a==='ok1'){if(TR.my.a===trKey())return;if(!Object.keys(TR.me).length&&!TR.g&&!Object.keys(TR.th).length&&!TR.tg){say('Put something in the trade first.');sfx('swish');return}TR.my.a=trKey();trPush();trStep();rPn();return}
 if(a==='ok2'){const key=trKey();if(TR.my.c===key)return;for(const q in TR.me)if((inv[q]|0)<TR.me[q]){trEnd('You no longer have everything you offered.');return}TR.my.c=key;trPush();trStep();return}
 if(TR.st!=='offer')return;let ch=false;
 if(a==='add'){const n=trCan(k);const v=b.dataset.v==='all'?n:Math.min(n,+b.dataset.v);if(v>0){TR.me[k]=(TR.me[k]|0)+v;ch=true}}
 else if(a==='rm'){if(TR.me[k]){if(--TR.me[k]<=0)delete TR.me[k];ch=true}}
 else if(a==='g'){const left=GLD-TR.g,v=b.dataset.v==='all'?left:Math.min(left,+b.dataset.v);if(v>0){TR.g+=v;ch=true}}
 else if(a==='g0'){if(TR.g){TR.g=0;ch=true}}
 if(ch){TR.my.a='';TR.my.c='';trPush();sfx('pickup');rPn()}}
// hooks: START menu entry, screen, clicks
SMI.splice(SMI.findIndex(x=>x.id==='options'),0,{id:'trade',l:()=>'Trade'});
{const _ss=showScreen;showScreen=function(id){if(id!=='trade')return _ss(id);pnOpen=true;ptab=TTAB;jx=jy=0;pn.style.display='block';rPn();sfx('talk')}}
{const _r=rPn;rPn=function(){if(ptab===TTAB){panelChrome('');pbd.innerHTML=tradeHTML();return}_r()}}
{const _oc=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('[data-tr]');if(b&&ptab===TTAB){if(!b.disabled)trClick(b);return}_oc(e)}}
// closing the window by any route (X, B button, Escape) declines; so does walking away or going offline
setInterval(()=>{if(TR.st==='idle')return;if(!MP.on){trEnd('You went offline, so the trade was cancelled.');return}
 if(!(pnOpen&&ptab===TTAB&&pn.style.display!=='none')&&!TR.closing){trEnd('You declined the trade.');return}
 const r=MP.players.get(TR.w);if(!r||!live(r)||performance.now()-r.seen>12000){trEnd(trName(TR.w)+' went offline, so the trade was cancelled.');return}
 if(r.loc!==mpLoc()||Math.hypot(r.tx-P.x,r.ty-P.y)>TRNEAR*2.5){trEnd(trName(TR.w)+' walked away, so the trade was cancelled.');return}
 if(TR.warnAt&&performance.now()-TR.warnAt>6000&&performance.now()-TR.warnAt<6600&&pnOpen&&ptab===TTAB)rPn()},500);
// incoming requests
function trStart(){const d=FB.db,uid=MP.user.uid;TR.inbox={};
 TR.reqUnsub=d.onValue(trRef('treq/'+uid),s=>{const v=s.val()||{},now=mpNow(),old=TR.inbox;TR.inbox={};
  for(const u in v){const q=v[u];if(!q||typeof q!=='object')continue;if(typeof q.t==='number'&&now-q.t>60000){d.remove(trRef('treq/'+uid+'/'+u)).catch(()=>{});continue}TR.inbox[u]={n:String(q.n||'').slice(0,12),t:q.t}}
  for(const u in TR.inbox)if(ignored(u)){delete TR.inbox[u];d.remove(trRef('treq/'+uid+'/'+u)).catch(()=>{})}else if(!old[u]){if(TR.sent[u]&&TR.st==='idle'){trAnswer(u,true);continue} // you asked each other
   mpLog('game',trName(u)+' wants to trade with you. Tap TRADE, or open START > Trade.');if(TR.st==='idle')trPopShow(u);try{sfx('talk')}catch(e){}}
  if(TR.popU&&!TR.inbox[TR.popU])trPopHide();if(pnOpen&&ptab===TTAB&&TR.st==='idle')rPn()});
}
{const _ms=mpStart;mpStart=async function(u){await _ms(u);if(MP.on&&MP.user&&!TR.reqUnsub)try{trStart()}catch(e){mpErr(e)}}}
{const _st=mpStop;mpStop=async function(m){if(TR.st!=='idle')trEnd('You went offline, so the trade was cancelled.');if(TR.reqUnsub){TR.reqUnsub();TR.reqUnsub=null}TR.inbox={};trPopHide();for(const u in TR.sent)if(TR.sent[u].done)TR.sent[u].done();TR.sent={};return _st(m)}}
// /trade name in chat
{const _s=mpSend;mpSend=function(t){const m=String(t||'').trim().match(/^\/trade\s+(\S+)\s*$/i);if(!m)return _s(t);const nl=m[1].toLowerCase();
  const u=[...MP.players.keys()].find(k=>(MP.players.get(k).n||'').toLowerCase()===nl);if(!u){mpLog('game','No player called '+m[1]+' is nearby.');return}
  if(typeof mpCloseChat==='function')try{mpCloseChat()}catch(e){}trRequest(u)}}
// a TRADE button next to friends who are standing near you
{const _fv=friendsView;friendsView=function(){_fv();for(const row of lst.querySelectorAll('.fr')){const msg=[...row.querySelectorAll('button')].find(b=>b.textContent==='MESSAGE');if(!msg)continue;
  const nm=row.querySelector('.fn b');const u=Object.keys(MP.friends).find(k=>fname(k)===(nm&&nm.textContent));if(!u||!trNear(u))continue;const b=document.createElement('button');b.textContent='TRADE';
  b.onclick=()=>{if(typeof mpCloseChat==='function')try{mpCloseChat()}catch(e){}trRequest(u)};msg.after(b)}}}
window.SQTRADE=TR;window.SQTRREQ=u=>trRequest(u);window.SQTRNEAR=()=>trNearList();
