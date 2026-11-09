// ---------------------------------------------------------------- 9. Chess
// Grandmaster Orla plays from a table in the village square. Wins train Tactics.
const CLV=[{n:'Novice',req:1,depth:1,noise:150,xp:80,g:10},{n:'Club player',req:5,depth:2,noise:40,xp:200,g:30},{n:'Expert',req:15,depth:3,noise:12,xp:450,g:80},{n:'Master',req:30,depth:4,noise:0,xp:900,g:200}];
let CHS={w:0,l:0,d:0},chessOpen=false,CG=null;
// stats + quest in saves (quest inserted at index 3; older saves are remapped)
QS.splice(3,0,{n:'Opening Moves',d:'Grandmaster Orla sits at the chess table in the village square. Beat her once on any difficulty.',type:'chess',amt:1,r:{g:100,xp:[7,300]}});
const _qv9=qVal;qVal=function(q){return q.type==='chess'?Q.k:_qv9(q)};
const _sn9=snap;snap=function(){const s=_sn9();s.qv=3;s.chess={...CHS};return s};
const _ap9=applySave;applySave=function(S){_ap9(S);if((S.qv||0)<3&&S.q&&Q.i>=3)Q.i++;if(S.chess)for(const k in CHS)CHS[k]=Math.max(0,+S.chess[k]||0)};

// Orla and her table
NPCS.push({kind:'chess',x:(VX+3)*16+8,y:(VY+1)*16+8,ch:{sk:3,hs:1,hc:0,sh:7,pn:1,ht:1,hcol:4,so:2}});
const TBX=VX+5,TBY=VY+1;BS.add(TBY*N+TBX);
const _nd9=NEWDRAW;NEWDRAW=function(...a){_nd9(...a);const tm=a[8],cx=TBX*16+8,b=(TBY+1)*16-2;
 shd(cx,b-1,16);Rg(cx-8,b-11,16,7,O);Rg(cx-7,b-10,14,5,'#a87850');for(let i=0;i<7;i++)for(let j=0;j<2;j++)if((i+j)%2)Rg(cx-7+i*2,b-10+j*2,2,2,'#f0e0b8');
 Rg(cx-6,b-4,2,4,O);Rg(cx+4,b-4,2,4,O);Rg(cx-5,b-4,1,3,'#7a4a20');Rg(cx+5,b-4,1,3,'#7a4a20');
 if(!dead&&Math.abs(P.x-cx)<15&&P.y+6>b&&P.y-16<b)pP(tm)};
// lobby (opened by talking to Orla)
function chessLobby(){const T=lvOf(7);let h='<div class="tl">Grandmaster Orla</div><div class="qc"><p>"Care for a game? Beat me and I will pay you. Win or lose, you will sharpen your Tactics."</p><p style="opacity:.75">Your record: '+CHS.w+' wins · '+CHS.d+' draws · '+CHS.l+' losses · Tactics '+T+'</p></div>';
 CLV.forEach((L,i)=>{const ok=T>=L.req;h+='<button class="cg sb" data-l="'+i+'" style="opacity:'+(ok?1:.45)+'">'+L.n+(ok?'':' (Tactics '+L.req+')')+'<br><small>Win: '+L.xp+' Tactics XP + '+L.g+' gold · draw: half</small></button>'});
 return h+'<div class="tl" style="font-size:11px;font-weight:400;opacity:.6">You play white. Tap a piece, then tap where it should go.</div>'}
const _r9=rPn;rPn=function(){if(ptab==2&&shop=='chess'){document.getElementById('t0').className='';document.getElementById('t1').className='';pbd.innerHTML=chessLobby();return}_r9()};
const _oc9=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('.cg');if(b){startChess(+b.dataset.l);return}_oc9(e)};
// board overlay
const st9=document.createElement('style');st9.textContent='#chs{position:fixed;inset:0;z-index:25;display:none;background:rgba(10,14,28,.97);color:#f4f0d8;font-family:"SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace;overflow:auto;touch-action:manipulation;padding:calc(env(safe-area-inset-top,0px) + 14px) 16px calc(env(safe-area-inset-bottom,0px) + 20px)}#chs .cw{max-width:480px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px}#chs .ct2{font-weight:700;color:#f8d848;letter-spacing:1px}#chb{position:static;inset:auto;flex:none;width:min(92vw,62vh,480px);height:min(92vw,62vh,480px);image-rendering:pixelated;border:3px solid #f4f0d8;border-radius:4px;touch-action:none;cursor:pointer}#chst{min-height:2.8em;text-align:center;font-size:14px;line-height:1.4}#chs .bt{display:flex;gap:10px}#chs .bt button{padding:10px 18px;border-radius:8px;border:2px solid #f4f0d8;background:#223;color:#f4f0d8;font:700 14px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace;cursor:pointer}#chs .bt button.pri{background:#38a828}';document.head.appendChild(st9);
const chs=document.createElement('div');chs.id='chs';chs.innerHTML='<div class="cw"><div class="ct2" id="cht"></div><canvas id="chb" width="128" height="128"></canvas><div id="chst"></div><div class="bt"><button id="chr">Resign</button><button id="chp" class="pri">Play again</button><button id="chl">Leave</button></div></div>';document.body.appendChild(chs);
const chb=document.getElementById('chb'),cx9=chb.getContext('2d'),chst=document.getElementById('chst');
// pixel piece sprites
const PM={p:['..........','....##....','...####...','...####...','....##....','...####...','....##....','....##....','...####...','..######..','.########.'],
 r:['.##.##.##.','.########.','..######..','...####...','...####...','...####...','...####...','...####...','..######..','.########.','.########.'],
 n:['....#.#...','...#####..','..##.####.','.#########','.####.###.','....####..','...#####..','...#####..','..######..','.########.','.########.'],
 b:['....##....','...#.##...','...##.#...','...####...','....##....','...####...','....##....','....##....','...####...','..######..','.########.'],
 q:['.#..##..#.','.#.####.#.','..######..','..######..','...####...','...####...','....##....','....##....','...####...','..######..','.########.'],
 k:['....##....','...####...','....##....','..######..','.########.','.########.','..######..','...####...','...####...','..######..','.########.']};
const PSP={};for(const t in PM)for(const w of[1,0]){const m=PM[t],c=document.createElement('canvas');c.width=12;c.height=13;const x=c.getContext('2d'),on=(i,j)=>j>=0&&j<m.length&&i>=0&&i<10&&m[j][i]==='#';
 for(let j=-1;j<=m.length;j++)for(let i=-1;i<=10;i++){if(on(i,j)){x.fillStyle=w?(j<3||i<4?'#ffffff':'#e8e0d0'):(j<3||i<4?'#706880':'#484058');x.fillRect(i+1,j+1,1,1)}else if(on(i-1,j)||on(i+1,j)||on(i,j-1)||on(i,j+1)){x.fillStyle=w?'#181018':'#f0e8d8';x.fillRect(i+1,j+1,1,1)}}
 PSP[w?t.toUpperCase():t]=c}
function drawBoard(){const g2=cx9,G=CG;g2.imageSmoothingEnabled=false;
 for(let i=0;i<64;i++){const r=i>>3,c=i&7;g2.fillStyle=(r+c)%2?'#a87850':'#f0dcb0';g2.fillRect(c*16,r*16,16,16)}
 if(G.last)for(const sq of[G.last.f,G.last.t]){g2.fillStyle='rgba(248,216,72,.35)';g2.fillRect((sq&7)*16,(sq>>3)*16,16,16)}
 if(G.sel>=0){g2.fillStyle='rgba(120,200,255,.5)';g2.fillRect((G.sel&7)*16,(G.sel>>3)*16,16,16)}
 if(!G.over&&CE.inCheck(G.st,G.st.turn)){const k=G.st.b.indexOf(G.st.turn==='w'?'K':'k');g2.fillStyle='rgba(232,48,48,.6)';g2.fillRect((k&7)*16,(k>>3)*16,16,16)}
 for(let i=0;i<64;i++){const p=G.st.b[i];if(p!=='.')g2.drawImage(PSP[p],(i&7)*16+2,(i>>3)*16+2)}
 for(const m of G.moves){const x=(m.t&7)*16,y=(m.t>>3)*16;g2.fillStyle='rgba(40,40,60,.55)';if(m.cap!=='.'){g2.fillRect(x,y,16,2);g2.fillRect(x,y+14,16,2);g2.fillRect(x,y,2,16);g2.fillRect(x+14,y,2,16)}else g2.fillRect(x+6,y+6,4,4)}}
function chUI(){document.getElementById('chr').style.display=CG.over?'none':'';document.getElementById('chp').style.display=CG.over?'':'none';document.getElementById('chl').style.display=CG.over?'':'none';drawBoard()}
function startChess(li){const L=CLV[li];if(!L)return;if(lvOf(7)<L.req){say('Need Tactics '+L.req);return}
 CG={li,st:CE.start(),sel:-1,moves:[],last:null,over:false,busy:false};chessOpen=true;pnOpen=true;pn.style.display='none';chs.style.display='block';
 document.getElementById('cht').textContent='Grandmaster Orla · '+L.n;chst.textContent='Your move. You play white.';sfx('talk');chUI()}
function endChess(res,why){const L=CLV[CG.li];CG.over=true;CG.moves=[];CG.sel=-1;let t;
 if(res==='w'){CHS.w++;GLD+=L.g;addXp(7,L.xp);if(Q.on&&QS[Q.i]&&QS[Q.i].type==='chess')Q.k++;t='You win '+why+'! +'+L.xp+' Tactics XP, +'+L.g+' gold';sfx('quest')}
 else if(res==='d'){CHS.d++;const x=Math.round(L.xp/2),g=Math.round(L.g/2);GLD+=g;addXp(7,x);t='Draw ('+why+'). +'+x+' Tactics XP, +'+g+' gold';sfx('coin')}
 else{CHS.l++;const x=Math.round(L.xp*.15);addXp(7,x);t='Orla wins '+why+'. +'+x+' Tactics XP for the lesson';sfx('death')}
 chst.textContent=t;saveLocal(true);saveCloud();chUI()}
function checkEnd(){const s=CE.status(CG.st);if(!s&&CG.st.ply<300)return false;const mover=CG.st.turn;
 if(s==='mate'){endChess(mover==='b'?'w':'l','by checkmate');return true}
 endChess('d',s==='stalemate'?'stalemate':s==='material'?'not enough pieces to mate':s==='draw50'?'50-move rule':'move limit');return true}
function doMove(m){const cap=m.cap!=='.';CG.st=CE.make(CG.st,m);CG.last=m;CG.sel=-1;CG.moves=[];sfx(cap?'hit':'talk')}
function aiMove(){if(!CG||CG.over)return;CG.busy=true;chst.textContent='Orla is thinking...';chUI();
 setTimeout(()=>{if(!CG||CG.over||!chessOpen){if(CG)CG.busy=false;return}const L=CLV[CG.li],m=CE.best(CG.st,L);if(m)doMove(m);CG.busy=false;
  if(!checkEnd()){chst.textContent=CE.inCheck(CG.st,'w')?'Check! Your move.':'Your move.';if(CE.inCheck(CG.st,'w'))sfx('block')}chUI()},60)}
chb.addEventListener('pointerdown',e=>{e.preventDefault();if(!CG||CG.over||CG.busy||CG.st.turn!=='w')return;const r=chb.getBoundingClientRect(),c=Math.floor((e.clientX-r.left)/r.width*8),rw=Math.floor((e.clientY-r.top)/r.height*8);
 if(c<0||c>7||rw<0||rw>7)return;const sq=rw*8+c,mv=CG.moves.find(m=>m.t===sq);
 if(mv){doMove(mv);chUI();if(!checkEnd())aiMove();return}
 const p=CG.st.b[sq];if(p!=='.'&&CE.isW(p)){CG.sel=sq;CG.moves=CE.legal(CG.st).filter(m=>m.f===sq);sfx('talk')}else{CG.sel=-1;CG.moves=[]}chUI()});
document.getElementById('chr').onclick=()=>{if(CG&&!CG.over)endChess('l','by resignation')};
document.getElementById('chp').onclick=()=>{if(CG)startChess(CG.li)};
document.getElementById('chl').onclick=()=>{chessOpen=false;CG=null;chs.style.display='none';pnOpen=true;ptab=2;shop='chess';pn.style.display='block';rPn()};
document.addEventListener('keydown',e=>{if(chessOpen){e.stopPropagation();if(e.key===' '||e.key.startsWith('Arrow'))e.preventDefault()}},true);
