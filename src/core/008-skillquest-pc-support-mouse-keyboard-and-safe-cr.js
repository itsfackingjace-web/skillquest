// ===== SkillQuest: PC support (mouse + keyboard) and safe cross-device sync =====
let isPC=false;try{isPC=!!(window.matchMedia&&window.matchMedia('(hover: hover) and (pointer: fine)').matches)}catch(_){}
function talk(){const n=nearNpc();if(n&&!pnOpen&&!menuOpen&&!dead){shop=n.kind;pnOpen=true;ptab=2;jx=jy=0;pn.style.display='block';rPn();sfx('talk')}}
function openPanel(tab){if(menuOpen||dead)return;if(pnOpen&&ptab==tab){closePanel();return}pnOpen=true;ptab=tab;jx=jy=0;pn.style.display='block';rPn()}
function closePanel(){if(!pnOpen)return;pnOpen=false;pn.style.display='none'}
// mouse clicks on the on-screen buttons (touch already handled; skip touch-generated pointer events)
const ACT={a:()=>attack(),e:()=>eat(),f:()=>fire(),tk:()=>talk()};
for(const id in ACT){const el=document.getElementById(id);if(el)el.addEventListener('pointerdown',ev=>{if(ev.pointerType==='touch')return;ev.preventDefault();if(!dead&&!pnOpen&&!menuOpen)ACT[id]()})}
// click the world to respawn after falling
cv.addEventListener('pointerdown',ev=>{if(ev.pointerType==='touch')return;if(dead&&time>1.5)reset()});
cv.addEventListener('contextmenu',ev=>ev.preventDefault());
// keyboard
function onKey(e){const k=(e.key||'').toLowerCase();
 if([' ','arrowup','arrowdown','arrowleft','arrowright','tab'].includes(k)&&e.preventDefault)e.preventDefault();
 if(e.repeat&&k!==' ')return;
 if(menuOpen){if(k==='enter')document.getElementById('cgo').click();return}
 if(dead){if((k===' '||k==='enter')&&time>1.5)reset();return}
 if(k==='escape'){closePanel();return}
 if(k==='k'||k==='tab'){openPanel(0);return}
 if(k==='c'){openPanel(1);return}
 if(k==='m'){mb.onclick();return}
 if(k==='h'){helpOn=!helpOn;try{localStorage.setItem('sq_help',helpOn?'1':'0')}catch(_){}hp.style.display=helpOn?'block':'none';return}
 if(pnOpen)return;
 if(k==='t'||k==='enter')talk()}
addEventListener('keydown',onKey);
addEventListener('blur',()=>{for(const k in K)K[k]=0});
document.addEventListener('click',e=>{const a=document.activeElement;if(!a||a===document.body||!a.blur)return;
 const typing=a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.tagName==='SELECT'||a.isContentEditable;if(typing&&(a===e.target||a.contains(e.target)))return;a.blur()});   // never steal focus from the text box you just clicked into
// key hints + controls help on PC
let helpOn=true;try{helpOn=localStorage.getItem('sq_help')!=='0'}catch(_){}
const st7=document.createElement('style');st7.textContent='.b small{display:block;font-size:10px;font-weight:400;opacity:.75;margin-top:2px}.b{flex-direction:column;cursor:pointer;user-select:none}#hp{position:fixed;left:14px;bottom:14px;z-index:5;max-width:300px;padding:10px 12px;border-radius:8px;background:rgba(10,14,28,.72);border:1px solid rgba(244,240,216,.3);color:#f4f0d8;font:12px/1.6 "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace;pointer-events:none}#hp b{color:#f8d848}#pb2,#mb{cursor:pointer}';document.head.appendChild(st7);
const hp=document.createElement('div');hp.id='hp';hp.innerHTML='<b>Controls</b><br>WASD / arrows: move<br>Space: hit, chop, mine, fish<br>E: eat / cook at fire<br>F: build campfire<br>T or Enter: talk<br>K: skills · C: craft · Esc: close<br>M: mute · H: hide this help';document.body.appendChild(hp);
if(isPC){for(const[id,lab,key]of[['a','HIT','Space'],['e','EAT','E'],['f','FIRE','F'],['tk','TALK','T']]){const el=document.getElementById(id);if(el)el.innerHTML=lab+'<small>'+key+'</small>'}pb2.title='Skills (K)';mb.title='Mute (M)'}
hp.style.display=isPC&&helpOn?'block':'none';
const _dr7=draw;draw=function(){_dr7();if(!isPC||menuOpen)return;let f=true;try{f=document.hasFocus()}catch(_){}if(f)return;
 g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,H/2-24*D,W,48*D);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font='700 '+16*D+'px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace';g.fillText('Click the game to use your keyboard',W/2,H/2);g.restore()};
// --- cross-device sync: never overwrite progress another device saved ---
let lastWid=null;const myDev=Math.random().toString(36).slice(2,10);
const wOf=S=>S&&S.wid||'legacy';
const _ap7=applySave;applySave=function(S){_ap7(S);lastWid=wOf(S)};
// every save remembers which account save it continues from (bw), so a device's own unsent progress can be told apart
// from an old copy (061's account-only saves use it)
{const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);if(lastWid)s.bw=lastWid;return s}}
// What this device last synced with the account (the account save's id and how much progress it had). A save that
// another device wrote since then is taken automatically only when this device hasn't made progress of its own since
// and the other save isn't behind; otherwise the player picks. (Comparing save times was wrong: a device that was just
// opened saves straight away, so its old progress always looked "newest" and overwrote the account.)
const sqPf=S=>{try{const xp=(S.xp||[]).reduce((a,v)=>a+(+v||0),0),iv=S.inv?Object.values(S.inv).reduce((a,v)=>a+(+v||0),0):0;return xp+'|'+(+S.gold||0)+'|'+(S.q?S.q.i:0)+'|'+iv}catch(e){return'?'}};
const sqXpSum=S=>{try{return(S.xp||[]).reduce((a,v)=>a+(+v||0),0)}catch(e){return 0}};
function syncMark(S){try{localStorage.setItem('sq_spf',JSON.stringify({wid:wOf(S),pf:sqPf(S)}))}catch(e){}}
function syncDecide(L,S){// 'push' (the account hasn't changed since we synced), 'adopt' or 'ask'
 if(wOf(S)===lastWid)return'push';let rec=null;try{rec=JSON.parse(localStorage.getItem('sq_spf')||'null')}catch(e){}
 const localSame=!!(rec&&rec.pf===sqPf(L));// no progress here since the last sync (or a device from before this was tracked)
 if((localSame||!rec)&&sqXpSum(S)>=sqXpSum(L))return'adopt';return'ask'}
function adoptRemote(rs){const S=JSON.parse(JSON.stringify(rs));const L=snap();L.savedAt=LOCAL_AT;try{mpBackup('device',L)}catch(e){}applySave(S);FISH=null;hideCreator();closePanel();say('Synced progress from your other device');saveLocal(true);lastCloud=keyOf(snap());syncMark(S)}
function syncAsk(rs){if(window.SQMP&&SQMP.choose)return;const L=snap();L.savedAt=LOCAL_AT;const S=JSON.parse(JSON.stringify(rs));
 mpChooseSave(L,S,pick=>{if(pick==='account'){adoptRemote(S);say('Loaded your account save. This device\'s save is backed up (Options → Backups).')}
  else{mpBackup('account',S);lastWid=wOf(S);LOCAL_AT=Date.now();saveCloud(true);say('Kept this device\'s save. The other one is backed up (Options → Backups).')}})}
function syncCheck(rs){if(!(rs&&rs.v==1&&lastWid!==null))return false;const L=snap();if(keyOf(L)===keyOf(rs)){lastWid=wOf(rs);syncMark(rs);return false}
 const d=syncDecide(L,rs);if(d==='push')return false;if(d==='adopt')adoptRemote(rs);else syncAsk(rs);return true}
saveCloud=async function(force){if(!cloud||cloudBusy||dead||(window.SQMP&&SQMP.choose))return;if(keyOf(snap())===lastCloud&&!force)return;cloudBusy=true;
 try{const r=window.SQSTRICT?null:await cloud.get(),rs=r&&r.exists?r.data():null;
  // account-only saves (061, SQSTRICT): this session owns the account (sess/<uid>), so it just writes; the server refuses
  // writes from a session that lost it. Older rules: compare with the account first.
  if(window.SQSTRICT){if(window.SQSTRICT.lost)return}else if(syncCheck(rs))return;
  if(dead)return;const s=snap(),k=keyOf(s);s.savedAt=Date.now();s.wid=myDev+'-'+Date.now().toString(36);s.dev=myDev;if(window.SQSTRICT)s.as=1;await cloud.set(s);lastWid=s.wid;lastCloud=k;cloudOk=performance.now()/1000;syncMark(s)}
 catch(e){const c=e&&e.code;if(c=='invalid_argument'||c=='revoked'||c=='not_granted'||c=='capability_disabled'||c=='capability_removed')cloud=null;
  // the server refused: another device or tab has taken over this account
  if(window.SQSTRICT&&/PERMISSION_DENIED|permission/i.test(String(c||'')+' '+String(e&&e.message||'')))try{SQSTRICT.denied()}catch(e2){}}
 finally{cloudBusy=false}};
document.addEventListener('visibilitychange',async()=>{if(document.visibilityState!=='visible'||!cloud||cloudBusy||window.SQSTRICT)return;
 try{const r=await cloud.get(),rs=r&&r.exists?r.data():null;syncCheck(rs)}catch(e){}});
// ---- chess engine (board index 0 = a8, 63 = h1; uppercase = white) ----
const CE=(()=>{
 const VAL={p:100,n:320,b:330,r:500,q:900,k:0};
 const PST={p:[0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0],
  n:[-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
  b:[-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
  r:[0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0],
  q:[-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],
  k:[-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20]};
 const isW=c=>c>='A'&&c<='Z',col=c=>c==='.'?null:isW(c)?'w':'b',low=c=>c.toLowerCase();
 const RC=i=>[i>>3,i&7],ON=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
 const KN=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],KG=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],DI=[[-1,-1],[-1,1],[1,-1],[1,1]],OR=[[-1,0],[1,0],[0,-1],[0,1]];
 function start(){return{b:'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR'.split(''),turn:'w',cs:'KQkq',ep:-1,half:0,ply:0}}
 function attacked(b,sq,by){const[r,c]=RC(sq);
  const pr=by==='w'?r+1:r-1,P=by==='w'?'P':'p';for(const dc of[-1,1])if(ON(pr,c+dc)&&b[pr*8+c+dc]===P)return true;
  const Nn=by==='w'?'N':'n';for(const[a,d]of KN)if(ON(r+a,c+d)&&b[(r+a)*8+c+d]===Nn)return true;
  const Kk=by==='w'?'K':'k';for(const[a,d]of KG)if(ON(r+a,c+d)&&b[(r+a)*8+c+d]===Kk)return true;
  const B=by==='w'?'B':'b',Rr=by==='w'?'R':'r',Q=by==='w'?'Q':'q';
  for(const[a,d]of DI){let y=r+a,x=c+d;while(ON(y,x)){const p=b[y*8+x];if(p!=='.'){if(p===B||p===Q)return true;break}y+=a;x+=d}}
  for(const[a,d]of OR){let y=r+a,x=c+d;while(ON(y,x)){const p=b[y*8+x];if(p!=='.'){if(p===Rr||p===Q)return true;break}y+=a;x+=d}}
  return false}
 const kingSq=(b,s)=>b.indexOf(s==='w'?'K':'k');
 const inCheck=(st,s)=>attacked(st.b,kingSq(st.b,s),s==='w'?'b':'w');
 function pseudo(st){const b=st.b,s=st.turn,out=[],them=s==='w'?'b':'w';
  for(let i=0;i<64;i++){const p=b[i];if(p==='.'||col(p)!==s)continue;const t=low(p),[r,c]=RC(i);
   const add=(to,extra)=>out.push(Object.assign({f:i,t:to,p,cap:b[to]},extra||{}));
   if(t==='p'){const dir=s==='w'?-1:1,sr=s==='w'?6:1,lr=s==='w'?0:7,one=(r+dir)*8+c;
    if(ON(r+dir,c)&&b[one]==='.'){add(one,r+dir===lr?{pr:s==='w'?'Q':'q'}:0);if(r===sr&&b[one+dir*8]==='.')add(one+dir*8,{dbl:1})}
    for(const dc of[-1,1]){const y=r+dir,x=c+dc;if(!ON(y,x))continue;const to=y*8+x;
     if(b[to]!=='.'&&col(b[to])===them)add(to,y===lr?{pr:s==='w'?'Q':'q'}:0);else if(to===st.ep)add(to,{epc:(r)*8+x,cap:s==='w'?'p':'P'})}}
   else if(t==='n'||t==='k'){for(const[a,d]of(t==='n'?KN:KG)){const y=r+a,x=c+d;if(!ON(y,x))continue;const to=y*8+x;if(b[to]==='.'||col(b[to])===them)add(to)}
    if(t==='k'){const home=s==='w'?60:4,K=s==='w'?'K':'k',Qs=s==='w'?'Q':'q';
     if(i===home&&!attacked(b,home,them)){
      if(st.cs.includes(K)&&b[home+1]==='.'&&b[home+2]==='.'&&b[home+3]===(s==='w'?'R':'r')&&!attacked(b,home+1,them)&&!attacked(b,home+2,them))add(home+2,{cas:1});
      if(st.cs.includes(Qs)&&b[home-1]==='.'&&b[home-2]==='.'&&b[home-3]==='.'&&b[home-4]===(s==='w'?'R':'r')&&!attacked(b,home-1,them)&&!attacked(b,home-2,them))add(home-2,{cas:-1})}}}
   else{const dirs=t==='b'?DI:t==='r'?OR:DI.concat(OR);for(const[a,d]of dirs){let y=r+a,x=c+d;while(ON(y,x)){const to=y*8+x;if(b[to]==='.')add(to);else{if(col(b[to])===them)add(to);break}y+=a;x+=d}}}}
  return out}
 function make(st,m){const b=st.b.slice();let cs=st.cs;b[m.t]=m.pr||m.p;b[m.f]='.';
  if(m.epc!==undefined)b[m.epc]='.';
  if(m.cas){if(m.cas>0){b[m.t-1]=b[m.t+1];b[m.t+1]='.'}else{b[m.t+1]=b[m.t-2];b[m.t-2]='.'}}
  if(m.p==='K')cs=cs.replace('K','').replace('Q','');if(m.p==='k')cs=cs.replace('k','').replace('q','');
  for(const[sq,ch]of[[63,'K'],[56,'Q'],[7,'k'],[0,'q']])if(m.f===sq||m.t===sq)cs=cs.replace(ch,'');
  return{b,turn:st.turn==='w'?'b':'w',cs,ep:m.dbl?(m.f+m.t)/2:-1,half:(low(m.p)==='p'||m.cap!=='.')?0:st.half+1,ply:st.ply+1}}
 function legal(st){const s=st.turn;return pseudo(st).filter(m=>{const n=make(st,m);return!attacked(n.b,kingSq(n.b,s),s==='w'?'b':'w')})}
 function status(st){const L=legal(st);if(!L.length)return inCheck(st,st.turn)?'mate':'stalemate';
  if(st.half>=100)return'draw50';
  const pcs=st.b.filter(p=>p!=='.'&&low(p)!=='k');if(!pcs.length||(pcs.length===1&&'nbNB'.includes(pcs[0])))return'material';return null}
 function evalW(b){let v=0;for(let i=0;i<64;i++){const p=b[i];if(p==='.')continue;const t=low(p);if(isW(p))v+=VAL[t]+PST[t][i];else v-=VAL[t]+PST[t][(7-(i>>3))*8+(i&7)]}return v}
 const order=ms=>ms.sort((a,b)=>(b.cap!=='.'?10*VAL[low(b.cap)]-VAL[low(b.p)]:0)+(b.pr?800:0)-((a.cap!=='.'?10*VAL[low(a.cap)]-VAL[low(a.p)]:0)+(a.pr?800:0)));
 let nodes=0;
 function search(st,d,al,be){nodes++;const sg=st.turn==='w'?1:-1;
  if(d===0)return quies(st,al,be,4);
  const L=order(legal(st));if(!L.length)return inCheck(st,st.turn)?-100000-d:0;
  for(const m of L){const v=-search(make(st,m),d-1,-be,-al);if(v>=be)return v;if(v>al)al=v}return al}
 function quies(st,al,be,qd){nodes++;const sg=st.turn==='w'?1:-1,sp=sg*evalW(st.b);if(sp>=be||qd===0)return sp;if(sp>al)al=sp;
  for(const m of order(legal(st).filter(m=>m.cap!=='.'||m.pr))){const v=-quies(make(st,m),-be,-al,qd-1);if(v>=be)return v;if(v>al)al=v}return al}
 // level: {depth, noise}
 function best(st,lv){nodes=0;const L=order(legal(st));if(!L.length)return null;let res=[];
  let al=-1e9;for(const m of L){const v=-search(make(st,m),lv.depth-1,-1e9,lv.noise?1e9:-al)+(Math.random()*2-1)*lv.noise;if(v>al)al=v;res.push([v,m])}
  res.sort((a,b)=>b[0]-a[0]);return res[0][1]}
 return{start,legal,make,status,inCheck,best,low,isW,get nodes(){return nodes}}
})();
