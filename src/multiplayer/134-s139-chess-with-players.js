// ---- 139. Chess: against other players (with stakes), Opening Moves as Orla's own side quest, no damage at the board ----
// Player chess runs through the duel machinery in section 135 (kind 'chess'): ask from the player menu, stake items and
// gold, accept twice, then play. The challenger's side record carries the moves (duels/<a_b>/<uid>.m, "from.to" square
// numbers, space separated); each game applies the other side's new moves only if they are legal. The player whose id
// comes first in the pair plays white. A move may take 3 minutes at most; going offline for 20 s loses; checkmate, a
// resignation or a draw (stalemate, bare kings, 50 moves, 300 plies) ends it. Games against players give no Tactics XP.
// Opening Moves left Elder Rowan's chain (saves: qv 11, older saves converted by quest name) and is Orla's side quest.
(()=>{
 // ---- Opening Moves: from the main chain to Orla ----
 const QOLD10=QS.map(q=>q.n);{const i=QS.findIndex(q=>q.n==='Opening Moves');if(i>=0)QS.splice(i,1)}
 const OM={n:'Opening Moves',d:'Beat Grandmaster Orla at chess once, on any difficulty. She plays at the table in the village square.',r:{g:100,xp:[7,300]}};
 const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);s.qv=11;return s};
 const _ap=applySave;applySave=function(S){const v=S&&S.q?(S.qv|0):11,raw=S&&Array.isArray(S.qdone)?S.qdone.slice():[],sq=S&&S.q?{...S.q}:null;
  const out=_ap.apply(this,arguments);
  try{if(sq&&v<11){const i=Math.max(0,+sq.i||0);let done=raw.includes(OM.n),cur=null;
    const list=v===10?QOLD10:v===9&&window.SQCH2?SQCH2.QOLD9:null;
    if(list){const oi=list.indexOf(OM.n);if(oi>=0){if(i>oi)done=true;else if(i===oi&&sq.on)cur={k:Math.max(0,+sq.k||0)}}}
    else{if(i>3)done=true;else if(i===3&&sq.on)cur={k:Math.max(0,+sq.k||0)}}
    CHS.om=done?3:cur?(cur.k>=1?2:1):0;
    if(v===10){// the saved index points into the old order: go by names
     for(const n of QOLD10.slice(0,Math.min(i,QOLD10.length)))if(QS.some(q=>q.n===n))QDONE.add(n);
     const name=QOLD10[i];QHOLD=sq.on&&name&&name!==OM.n?{n:name,on:true,k:Math.max(0,+sq.k||0)}:null;Q.i=0;Q.on=false;Q.k=0;qSkip();if(QHOLD&&QS[Q.i]&&QS[Q.i].n!==QHOLD.n){Q.on=false;Q.k=0}QHOLD=null;
     Q.i=Math.max(0,Math.min(QS.length,Q.i))}}}catch(e){console.warn('opening moves',e)}
  return out};
 // a win counts for it
 {const _ec=endChess;endChess=function(res,why){const out=_ec.apply(this,arguments);try{if(res==='w'&&(CHS.om|0)===1){CHS.om=2;chst.textContent+=' Opening Moves done: tell Orla!';saveLocal(true)}}catch(e){}return out}}
 // Orla's card
 function omCard(){const s=CHS.om|0;if(s>=3)return'<div class="qc" style="margin-top:8px"><b>✓ Opening Moves</b><p>"You have a feel for the game. Come back any time."</p></div>';
  let h='<div class="qc" style="margin-top:8px"><b>'+(s?'▶ ':'! ')+'Opening Moves</b><p>'+esc(OM.d)+'</p><p class="qr">Reward: 100 gold · 300 Tactics XP</p>';
  h+=s===0?'<button class="qb om139" data-o="acc">Accept quest</button>':s===1?'<p>Progress: 0 / 1 wins</p>':'<p>Progress: 1 / 1 wins</p><button class="qb om139" data-o="done">Hand in</button>';return h+'</div>'}
 {const _cl=chessLobby;chessLobby=function(){const h=_cl.apply(this,arguments),i=h.indexOf('<button class="cg');return i<0?h+omCard():h.slice(0,i)+omCard()+h.slice(i)}}
 {const _oc=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('.om139');if(b){const a=b.dataset.o;
   if(a==='acc'&&!(CHS.om|0)){CHS.om=1;say('Quest started: Opening Moves');sfx('quest')}
   else if(a==='done'&&(CHS.om|0)===2){CHS.om=3;GLD+=OM.r.g;addXp(OM.r.xp[0],OM.r.xp[1]);say('Quest complete: Opening Moves! "Well played. You will be a fine player."');msgT=5;sfx('quest')}
   try{saveLocal(true)}catch(x){}rPn();return}return _oc(e)}}
 // in the quest log
 const ORLA={area:'hollow',x:(TBX-2)*16+8,y:(TBY+1)*16+8};
 (window.SQQEXTRA=window.SQQEXTRA||[]).push(()=>{const s=CHS.om|0,e={id:'c:om',cat:'Grandmaster Orla',area:'hollow',name:OM.n,rew:'100 gold · 300 Tactics XP',at:ORLA};
  if(s>=3)return[{...e,st:'done'}];return[{...e,desc:OM.d,st:s?'active':'avail',step:s===0?'Talk to Grandmaster Orla in the village square':s===1?'Win a game of chess against Orla':'Return to Grandmaster Orla',prog:s?(s>=2?'1':'0')+'/1':'',ready:s===2,kind:'side'}]});

 // ---- no damage while you sit at a chess board (Orla's or another player's) ----
 {let held=false,hv=0;const want=()=>!!(chessOpen||PV.open);
  const _u=upd;upd=function(dt){const w=want();if(PV.open)pnOpen=true;if(w&&!held){const d=Object.getOwnPropertyDescriptor(P,'hp');if(!d||!d.get){hv=P.hp;Object.defineProperty(P,'hp',{configurable:true,enumerable:true,get(){return hv},set(v){if(v>hv)hv=v}});held=true}}
   else if(!w&&held){const v=hv;delete P.hp;P.hp=v;held=false}return _u.apply(this,arguments)}}

 // ---- chess against another player ----
 const PV={open:false,st:null,white:true,sel:-1,moves:[],last:null,at:0,over:false};
 const A=()=>window.SQDUELAPI,DD=()=>A()&&A().D;
 const css=document.createElement('style');css.textContent='#pvc{position:fixed;inset:0;z-index:26;display:none;background:rgba(10,14,28,.97);color:#f4f0d8;font-family:"SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace;overflow:auto;touch-action:manipulation;padding:calc(env(safe-area-inset-top,0px) + 14px) 16px calc(env(safe-area-inset-bottom,0px) + 20px)}#pvc .cw{max-width:480px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:8px}#pvc .ct2{font-weight:700;color:#f8d848;letter-spacing:1px;text-align:center}#pvc .who{font-size:13px;opacity:.85}#pvc_pvb{position:static;inset:auto;flex:none;width:min(92vw,58vh,480px);height:min(92vw,58vh,480px);image-rendering:pixelated;border:3px solid #f4f0d8;border-radius:4px;touch-action:none;cursor:pointer}#pvc_pvst{min-height:2.8em;text-align:center;font-size:14px;line-height:1.4}#pvc .bt{display:flex;gap:10px}#pvc .bt button{padding:10px 18px;border-radius:8px;border:2px solid #f4f0d8;background:#223;color:#f4f0d8;font:700 14px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace;cursor:pointer}';document.head.appendChild(css);
 const el=document.createElement('div');el.id='pvc';el.innerHTML='<div class="cw"><div class="ct2" id="pvc_pvt"></div><div class="who" id="pvc_pvw1"></div><canvas id="pvc_pvb" width="128" height="128"></canvas><div class="who" id="pvc_pvw2"></div><div id="pvc_pvst"></div><div class="bt"><button id="pvc_pvr">Resign</button><button id="pvc_pvl">Leave</button></div></div>';document.body.appendChild(el);
 for(const ev of['touchstart','pointerdown','mousedown'])el.addEventListener(ev,e=>e.stopPropagation());
 const cv=document.getElementById('pvc_pvb'),c2=cv.getContext('2d'),stx=document.getElementById('pvc_pvst');
 const enc=m=>m.f+'.'+m.t,mine=()=>PV.st&&(PV.st.turn==='w')===PV.white;
 const view=i=>PV.white?i:63-i;// board square under view cell i
 function drawB(){if(!PV.st)return;c2.imageSmoothingEnabled=false;const S=PV.st;
  for(let v=0;v<64;v++){const r=v>>3,c=v&7;c2.fillStyle=(r+c)%2?'#a87850':'#f0dcb0';c2.fillRect(c*16,r*16,16,16)}
  const at=(sq,col)=>{const v=view(sq);c2.fillStyle=col;c2.fillRect((v&7)*16,(v>>3)*16,16,16)};
  if(PV.last){at(PV.last.f,'rgba(248,216,72,.35)');at(PV.last.t,'rgba(248,216,72,.35)')}
  if(PV.sel>=0)at(PV.sel,'rgba(120,200,255,.5)');
  if(!PV.over&&CE.inCheck(S,S.turn))at(S.b.indexOf(S.turn==='w'?'K':'k'),'rgba(232,48,48,.6)');
  for(let i=0;i<64;i++){const p=S.b[i];if(p!=='.'){const v=view(i);c2.drawImage(PSP[p],(v&7)*16+2,(v>>3)*16+2)}}
  for(const m of PV.moves){const v=view(m.t),x=(v&7)*16,y=(v>>3)*16;c2.fillStyle='rgba(40,40,60,.55)';if(m.cap!=='.'){c2.fillRect(x,y,16,2);c2.fillRect(x,y+14,16,2);c2.fillRect(x,y,2,16);c2.fillRect(x+14,y,2,16)}else c2.fillRect(x+6,y+6,4,4)}}
 const LIMIT=180;
 function status(){if(PV.over)return;const left=Math.max(0,Math.ceil(LIMIT-(performance.now()-PV.at)/1000)),t=Math.floor(left/60)+':'+String(left%60).padStart(2,'0'),D=DD(),n=D?A().nameOf(D.foe):'They';
  stx.textContent=(mine()?(CE.inCheck(PV.st,PV.st.turn)?'Check! ':'')+'Your move ('+t+' left).':n+' is thinking... ('+t+')')}
 function ui(){document.getElementById('pvc_pvr').style.display=PV.over?'none':'';document.getElementById('pvc_pvl').style.display=PV.over?'':'none';drawB()}
 function apply(m,fromMe){const cap=m.cap!=='.';PV.st=CE.make(PV.st,m);PV.last=m;PV.sel=-1;PV.moves=[];PV.at=performance.now();try{sfx(cap?'hit':'talk')}catch(e){}
  if(fromMe){const D=DD();D.mv.push(enc(m));A().push()}checkEnd()}
 function checkEnd(){const s=CE.status(PV.st);if(!s&&PV.st.ply<300){status();ui();return}const D=DD();
  if(s==='mate'){const loser=PV.st.turn==='w'?'white':'black';if((loser==='white')===PV.white)A().lose('mate');else A().win('mate');return}
  D.why=s==='stalemate'?'stalemate':s==='material'?'not enough pieces to mate':s==='draw50'?'50-move rule':'move limit';A().draw3()}
 window.SQPVC={
  get open(){return PV.open},
  begin(){const D=DD();if(!D)return;PV.white=D.tid.split('_')[0]===A().me();PV.st=CE.start();PV.sel=-1;PV.moves=[];PV.last=null;PV.over=false;PV.at=performance.now();
   for(const s of D.mv){const[f,t]=s.split('.').map(Number),m=CE.legal(PV.st).find(x=>x.f===f&&x.t===t);if(m){PV.st=CE.make(PV.st,m);PV.last=m}}
   const n=A().nameOf(D.foe);document.getElementById('pvc_pvt').textContent='CHESS vs '+n.toUpperCase();
   document.getElementById('pvc_pvw1').textContent=n+' plays '+(PV.white?'black':'white');document.getElementById('pvc_pvw2').textContent='You play '+(PV.white?'white':'black')+(D.esc&&(Object.keys(D.esc.th).length||D.esc.tg)?' · the winner takes both stakes':'');
   PV.open=true;try{if(typeof releaseMenu==='function')releaseMenu()}catch(e){}pnOpen=true;jx=jy=0;pn.style.display='none';el.style.display='block';sfx('quest');status();ui()},
  theirMoves(str){const D=DD();if(!D||!PV.open||PV.over)return;const L=str?str.split(' ').filter(Boolean):[];if(L.length<=D.mv.length)return;
   for(let i=0;i<D.mv.length;i++)if(L[i]!==D.mv[i])return;// not the same game: ignore
   for(const s of L.slice(D.mv.length)){if(mine())return;const[f,t]=s.split('.').map(Number),m=CE.legal(PV.st).find(x=>x.f===f&&x.t===t);if(!m)return;D.mv.push(s);apply(m,false);if(PV.over)return}},
  tick(){if(!PV.open||PV.over)return;const el2=(performance.now()-PV.at)/1000;if(mine()&&el2>LIMIT)A().lose('time');else if(!mine()&&el2>LIMIT+10)A().win('time');else status()},
  over(t){if(!PV.open)return;PV.over=true;PV.sel=-1;PV.moves=[];stx.textContent=t;ui()},
  cancel(){if(PV.open&&!PV.over){stx.textContent='The game was cancelled.';window.SQPVC.close()}},
  close(){if(!PV.open)return;PV.open=false;PV.st=null;el.style.display='none';pnOpen=false;try{closePanel()}catch(e){}}};
 cv.addEventListener('pointerdown',e=>{e.preventDefault();if(!PV.open||PV.over||!mine())return;const r=cv.getBoundingClientRect(),c=Math.floor((e.clientX-r.left)/r.width*8),rw=Math.floor((e.clientY-r.top)/r.height*8);
  if(c<0||c>7||rw<0||rw>7)return;const sq=view(rw*8+c),mv=PV.moves.find(m=>m.t===sq);if(mv){apply(mv,true);return}
  const p=PV.st.b[sq];if(p!=='.'&&CE.isW(p)===PV.white){PV.sel=sq;PV.moves=CE.legal(PV.st).filter(m=>m.f===sq);try{sfx('talk')}catch(x){}}else{PV.sel=-1;PV.moves=[]}drawB()});
 document.getElementById('pvc_pvr').onclick=()=>{if(PV.open&&!PV.over)A().lose('resign')};
 document.getElementById('pvc_pvl').onclick=()=>{window.SQPVC.close()};
 window.SQPVCSTATE=PV})();
