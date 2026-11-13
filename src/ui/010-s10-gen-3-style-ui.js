// ---------------------------------------------------------------- 10. Gen 3-style UI
// START menu (name / Bag / Skills / Map / Quests / Exit), trainer card, bag, map, quest log,
// battle-style HUD boxes and a bottom text box. All panels share the Gen 3 white box look.
const PF='"SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace';
try{document.fonts&&(document.fonts.load('16px "Pixelify Sans"'),document.fonts.load('16px "SQ Digits"','0123456789'))}catch(e){}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// --- player name (saved) ---
let PNAME='';
const _sn10=snap;snap=function(){const s=_sn10();s.name=PNAME;return s};
const _ap10=applySave;applySave=function(S){_ap10(S);if(typeof S.name==='string')PNAME=S.name.slice(0,10)};

const pname=()=>(PNAME||'Player');
// --- styles ---
const st10=document.createElement('style');st10.textContent=`
:root{--pf:${PF}}
.g3,#sm,#pn .pc,#cm .cc,#chs .cw{background:#f8f8f8;color:#404040;border:3px solid #485870;border-radius:10px;box-shadow:inset 0 0 0 2px #a8c0e0,0 4px 0 rgba(0,0,0,.3);text-shadow:1px 1px 0 #d8d8d0;font-family:var(--pf)}
#sm{position:fixed;z-index:30;display:none;right:10px;top:calc(env(safe-area-inset-top,0px) + 10px);min-width:180px;padding:10px 6px}
#sqts,#cm{scrollbar-width:none}#sqts::-webkit-scrollbar,#cm::-webkit-scrollbar{display:none}#sm{width:min(400px,calc(100vw - 20px))}#sm button{font-size:20px!important}@media(max-width:430px){#sm button{font-size:17px!important;padding-left:26px!important}#sm button.on::before{left:9px}}
#sm button{display:inline-block;vertical-align:top;width:50%;background:none;border:0;padding:8px 8px 8px 30px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:left;font:500 22px var(--pf);color:#404040;text-shadow:1px 1px 0 #d8d8d0;position:relative;cursor:pointer}
#sm button.on::before,.bi.on::before{content:'';position:absolute;left:12px;top:50%;margin-top:-7px;border-style:solid;border-width:7px 0 7px 10px;border-color:transparent transparent transparent #404040}
#pn{background:rgba(16,24,40,.55)!important;color:#404040!important;font-family:var(--pf)}
#pn .pc{max-width:420px;padding:12px 14px 16px;margin:0 auto}
#pn .pt{align-items:center}
#pn .pt button{background:#e8ecf4;color:#404040;border:2px solid #8898b8;font:600 16px var(--pf);border-radius:8px;text-shadow:none}
#pn .pt button.on{background:#5878b8;color:#fff;border-color:#384870}
.ptt{flex:1;font:700 20px var(--pf);letter-spacing:1px;padding-left:4px}
#pn .tl{color:#404040;font-family:var(--pf)}
#pn .sk{background:#fff;border:2px solid #c8d0e0}
#pn .sk>div:first-child{color:#404040!important;font-weight:600}
#pn .sk b{font-family:var(--pf)}#pn .sk small{opacity:.7}
#pn .br{background:#d8dee8}
#pn .qc{background:#fff;border:2px solid #c8d0e0;color:#404040;font-family:var(--pf)}
#pn .qc b{color:#d05030}#pn .qc p{font-size:15px}
#pn .qr{color:#2f8a3a}
#pn .sb,#pn .rc,#pn .gr{background:#fff;color:#404040;border:2px solid #c8d0e0;text-shadow:none;font-family:var(--pf)}
#pn .sb,#pn .rc{font:600 16px var(--pf)}
#pn .sb small,#pn .rc small,#pn .gi small{font-weight:400;opacity:.75}
#pn .gi{font-size:15px}
#pn .qb,#pn .gc,#pn .fg{background:#5878b8;border:2px solid #384870;color:#fff;font-family:var(--pf);text-shadow:none}
#pn .ng{border-color:#d05030;color:#d05030;font-family:var(--pf)}
.pk{display:flex;align-items:center;justify-content:space-between;background:#5878b8;color:#fff;border-radius:8px;padding:4px 6px;font:700 18px var(--pf);text-shadow:1px 1px 0 #384870}
.pk button{background:none;border:0;color:#fff;font:700 18px var(--pf);padding:6px 12px;cursor:pointer}
.bl{margin:8px 0;max-height:44vh;overflow:auto;background:#fff;border:2px solid #c8d0e0;border-radius:8px}
.bi{display:flex;width:100%;justify-content:space-between;background:none;border:0;border-bottom:1px solid #e4e8f0;padding:10px 12px 10px 30px;font:500 18px var(--pf);color:#404040;position:relative;text-align:left;cursor:pointer}
.be{padding:16px;text-align:center;opacity:.6;font-size:16px}
.bd{min-height:3.4em;padding:10px 12px;border:3px solid #485870;border-radius:8px;box-shadow:inset 0 0 0 2px #a8c0e0;background:#fff;font:16px/1.35 var(--pf)}
.bd .use{float:right;margin:0 0 6px 10px;background:#5878b8;color:#fff;border:2px solid #384870;border-radius:6px;font:700 15px var(--pf);padding:6px 14px;cursor:pointer}
.tcard{border:3px solid #485870;border-radius:10px;overflow:hidden;background:#f8f0d0}
.tc-h{background:#5878b8;color:#fff;font:700 18px var(--pf);padding:8px 12px;text-shadow:1px 1px 0 #384870;letter-spacing:1px}
.tc-b{display:flex;gap:12px;padding:10px 12px}.tc-i{flex:1;min-width:0}
.tc-i label{font-size:13px;opacity:.7}
.tc-r{display:flex;justify-content:space-between;border-bottom:1px dashed #c8b880;padding:5px 0;font-size:16px}
#nmi,#cni{width:100%;box-sizing:border-box;font:600 18px var(--pf);padding:5px 8px;border:2px solid #8898b8;border-radius:6px;background:#fff;color:#404040;-webkit-user-select:text;user-select:text}
#cni{width:auto;flex:1}
#tcs{position:static;inset:auto;flex:none;width:96px;height:120px;image-rendering:pixelated;align-self:center;background:#e0ecf8;border:2px solid #8898b8;border-radius:8px}
#mpc{position:static;inset:auto;display:block;margin:8px auto;width:min(84vw,52vh,380px);height:min(84vw,52vh,380px);image-rendering:pixelated;border:3px solid #485870;border-radius:6px;background:#3878d8}
.lg{display:flex;gap:14px;justify-content:center;font-size:15px;flex-wrap:wrap}
.lg i{display:inline-block;width:10px;height:10px;margin-right:5px;border:1px solid #404040;vertical-align:-1px}
.qrow{padding:9px 12px;margin:6px 0;border-radius:8px;border:2px solid #c8d0e0;background:#fff;font-size:16px}
.qd{color:#8a8a8a;text-decoration:line-through}.qx{color:#a0a0a0;letter-spacing:2px}
#cm{background:#304868!important}
#cm .cc{padding:16px 14px}
#cm .ct{color:#404040!important;font-family:var(--pf)}
#cm .ct:first-child{color:#d05030!important;text-shadow:2px 2px 0 #f8c8b0}
#cm .cl{color:#404040;opacity:1;font-family:var(--pf);font-size:15px}
#cm .bx span{font-family:var(--pf);font-size:16px}
#cm .sw{border-color:#c8d0e0}#cm .sw.on{border-color:#404040;box-shadow:0 0 0 2px #f8d848}
#cm .ab{background:#fff;color:#404040;border:2px solid #8898b8}
#cm #cgo{background:#5878b8;border-color:#384870;font-family:var(--pf);font-size:18px}
#cm #cpv{border-color:#485870;background:#e0ecf8}
#chs{background:rgba(16,24,40,.85)!important}
#chs .cw{padding:14px}
#chs .ct2{color:#404040!important;font-family:var(--pf);font-size:18px}
#chst{color:#404040;font-family:var(--pf);font-size:16px!important}
#chs .bt button{background:#fff;color:#404040;border:2px solid #8898b8;font-family:var(--pf);font-size:16px}
#chs .bt button.pri{background:#5878b8;color:#fff;border-color:#384870}
.b{background:rgba(248,248,248,.9)!important;color:#404040!important;border:3px solid #485870!important;box-shadow:inset 0 0 0 2px #a8c0e0;font-family:var(--pf)!important;font-size:18px!important;text-shadow:1px 1px 0 #d8d8d0}
.b small{font-size:11px!important;opacity:.65}
#pb2{width:auto!important;min-width:76px;padding:0 12px;border-radius:10px!important;background:#f8f8f8!important;color:#404040!important;border:3px solid #485870!important;box-shadow:inset 0 0 0 2px #a8c0e0;font:700 16px var(--pf)!important;height:40px!important;letter-spacing:1px}
#mb{background:#f8f8f8!important;border:3px solid #485870!important;box-shadow:inset 0 0 0 2px #a8c0e0;width:40px!important;height:40px!important;font-size:16px!important}
#hp{background:rgba(248,248,248,.92)!important;color:#404040!important;border:3px solid #485870!important;box-shadow:inset 0 0 0 2px #a8c0e0;font:15px/1.55 var(--pf)!important}
#hp b{color:#d05030!important}`;
document.head.appendChild(st10);
// --- START menu ---
const SMI=[{id:'card',l:()=>pname()},{id:'bag',l:()=>'Bag'},{id:'skills',l:()=>'Skills'},{id:'map',l:()=>'Map'},{id:'quests',l:()=>'Quests'},{id:'exit',l:()=>'Exit'}];
let smOpen=false,smSel=0,fromMenu=false,mapT=null;
const sm=document.createElement('div');sm.id='sm';document.body.appendChild(sm);
function rSM(){sm.innerHTML=SMI.map((it,i)=>'<button data-i="'+i+'" class="'+(i===smSel?'on':'')+'">'+esc(it.l())+'</button>').join('')}
function openSM(){if(menuOpen||dead||chessOpen)return;closeScreenOnly();smOpen=true;pnOpen=true;jx=jy=0;sm.style.display='block';rSM();sfx('talk')}
function closeSM(){smOpen=false;sm.style.display='none';pnOpen=false}
function pickSM(i){const it=SMI[i];if(!it)return;smSel=i;if(it.id==='exit'){closeSM();return}sm.style.display='none';smOpen=false;fromMenu=true;showScreen(it.id)}
function showScreen(id){const tab={card:3,bag:4,skills:0,map:5,quests:6,craft:1}[id];if(tab===undefined)return;pnOpen=true;ptab=tab;jx=jy=0;pn.style.display='block';rPn();sfx('talk')}
function closeScreenOnly(){pn.style.display='none';if(mapT){clearInterval(mapT);mapT=null}}
function backScreen(){closeScreenOnly();if(fromMenu){fromMenu=false;openSM()}else pnOpen=false}
sm.addEventListener('click',e=>{const b=e.target.closest('button');if(b)pickSM(+b.dataset.i)});
sm.addEventListener('pointermove',e=>{const b=e.target.closest('button');if(b&&+b.dataset.i!==smSel){smSel=+b.dataset.i;sm.querySelectorAll('button').forEach((x,i)=>x.className=i===smSel?'on':'')}});
cv.addEventListener('pointerdown',()=>{if(smOpen)closeSM()});
pb2.textContent='MENU';pb2.title='Menu (Esc)';pb2.onclick=()=>{if(smOpen)closeSM();else openSM()};
document.getElementById('px').onclick=backScreen;
const _cp10=closePanel;closePanel=function(){_cp10();closeScreenOnly();fromMenu=false;if(smOpen)closeSM()};
const ptt=document.createElement('span');ptt.className='ptt';{const px=document.getElementById('px');px.parentNode.insertBefore(ptt,px)}
// --- bag ---
const INAME={wood:'Wood',stone:'Stone',iron:'Iron ore',ibar:'Iron bar',sbar:'Steel bar',berry:'Berries',meat:'Raw meat',cooked:'Cooked meat',idag:'Iron dagger',sdag:'Steel dagger'};
const IDESC={wood:'Chopped from trees. Used for campfires, crafting and as furnace fuel.',stone:'Mined from rocks. Used for campfires, crafting and steel.',iron:'Rare ore from rocks (Mining 15 and a stone pickaxe). Smelt it at the furnace.',ibar:'Smelted iron. Forge it into daggers and armor at the anvil.',sbar:'Strong steel. Forges the best armor in the land.',berry:'Sweet wild berries. Restores a little food.',meat:'Dropped by slimes. Cook it at a campfire before eating.',cooked:'Hearty cooked meat. Restores food and 2 hearts.',idag:'A simple iron dagger. The blacksmith pays well for these.',sdag:'A fine steel dagger. The blacksmith pays well for these.'};
for(const f of FISH_T){INAME[f.k]='Raw '+f.n.toLowerCase();INAME['c'+f.k]='Cooked '+f.n.toLowerCase();IDESC[f.k]='Caught at the shoreline. Cook it at a campfire (Cooking '+f.cook+').';IDESC['c'+f.k]='Restores food and '+f.heal+' heart'+(f.heal>1?'s':'')+'.'}
for(const gd of GOODS){INAME[gd.k]=gd.n;IDESC[gd.k]='Crafted goods. The general store buys these for '+gd.v+' gold.'}
const POCK=[{n:'ITEMS',k:['wood','stone','iron','ibar','sbar']},{n:'FOOD',k:['berry','meat','cooked',...FISH_T.map(f=>'c'+f.k),...FISH_T.map(f=>f.k)]},{n:'GOODS',k:[...GOODS.map(gd=>gd.k),'idag','sdag']},{n:'KEY ITEMS',key:1}];
function keyItems(){const a=[],TN={axe:'axe',pick:'pickaxe',sword:'sword'},TD={axe:'Chops trees in fewer hits.',pick:'Breaks rocks. Better pickaxes mine faster.',sword:'Hits slimes harder.'};
 for(const k of['axe','pick','sword'])if(TL[k]>0)a.push({n:TIT[TL[k]]+' '+TN[k],d:TD[k]});
 if(TL.rod)a.push({n:'Fishing rod',d:'Face water and press HIT to cast your line.'});
 for(const[k,nm]of[['helm','helmet'],['body','chestplate'],['legs','legs']])if(ARM[k])a.push({n:AT[ARM[k]-1]+' '+nm,d:'Armor. Gives a chance to block slime attacks.'});
 return a}
let bagPk=0,bagSel=null;
const isFood=k=>FOODS.some(f=>f.k===k);
function bagHTML(){const pk=POCK[bagPk];const rows=pk.key?keyItems().map((it,i)=>({id:'key'+i,n:it.n,q:'',d:it.d})):pk.k.filter(k=>(inv[k]|0)>0).map(k=>({id:k,n:INAME[k]||k,q:'×'+(inv[k]|0),d:IDESC[k]||''}));
 if(!rows.some(r=>r.id===bagSel))bagSel=rows.length?rows[0].id:null;const cur=rows.find(r=>r.id===bagSel);
 let h='<div class="pk"><button class="bp" data-d="-1">◀</button><span>'+pk.n+'</span><button class="bp" data-d="1">▶</button></div><div class="bl">';
 h+=rows.length?rows.map(r=>'<button class="bi'+(r.id===bagSel?' on':'')+'" data-k="'+r.id+'"><span>'+esc(r.n)+'</span><span>'+r.q+'</span></button>').join(''):'<div class="be">Nothing in this pocket yet.</div>';
 return h+'</div><div class="bd">'+(cur?(isFood(cur.id)?'<button class="use" data-k="'+cur.id+'">USE</button>':'')+esc(cur.d):'Gather, craft and fish to fill your bag.')+'</div><div class="tl" style="margin-top:10px;font-size:15px">Gold: '+GLD+'</div>'}
function useFood(k){const f=FOODS.find(x=>x.k===k);if(!f||(inv[k]|0)<1)return;inv[k]--;hunger=Math.min(100,hunger+f.hun);P.hp=Math.min(6,P.hp+f.heal);sfx('eat');say('You ate the '+(INAME[k]||k).toLowerCase()+'.');saveLocal(true);rPn()}
function drawCardSprite(){const c=document.getElementById('tcs');if(!c)return;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,32,40);GC=x;x.fillStyle='rgba(0,0,0,.2)';x.fillRect(10,34,12,2);cP(gearCH(),0,0,16,29,false)}
// --- map ---
function mapHTML(){return '<div class="tl" style="font-size:17px">HOLLOW ISLAND</div><canvas id="mpc" width="'+N+'" height="'+N+'"></canvas><div class="lg"><span><i style="background:#f83030"></i>You</span><span><i style="background:#c85040"></i>Hollow Village</span><span><i style="background:#f89020"></i>Campfire</span><span><i style="background:#f8f8f8"></i>Villager</span></div><div class="tl" style="font-size:14px;font-weight:400;margin-top:8px">Day '+(1+Math.floor(time/DAYLEN))+(dark()>.4?' · Night':' · Day')+'</div>'}
function drawMap(){const c=document.getElementById('mpc');if(!c)return;const x=c.getContext('2d'),im=x.createImageData(N,N),d=im.data,COL=[[56,120,216],[232,208,136],[88,176,72],[160,144,128],[238,242,248],[232,188,112]];
 for(let i=0;i<N*N;i++){let cl=COL[tile[i]];const o=obj[i];if(o&&o.t==='tree')cl=[44,124,48];else if(o&&o.t==='rock')cl=[120,120,140];else if(o&&o.t==='ore')cl=[216,128,56];else if(o&&o.t==='pine')cl=[30,90,60];else if(o&&o.t==='cactus')cl=[60,150,56];else if(o&&o.t==='bush')cl=[200,72,96];if(BS.has(i))cl=[200,80,64];const j=i*4;d[j]=cl[0];d[j+1]=cl[1];d[j+2]=cl[2];d[j+3]=255}
 x.putImageData(im,0,0);x.fillStyle='#f89020';for(const f of fires)x.fillRect(Math.floor(f.x/16),Math.floor(f.y/16),1,1);
 x.fillStyle='#f8f8f8';for(const n of NPCS)if(!n.scene)x.fillRect(Math.floor(n.x/16),Math.floor(n.y/16),1,1);
 const wp=worldPos(),px=Math.floor(wp.x/16),py=Math.floor(wp.y/16);if(Math.floor(performance.now()/350)%2){x.fillStyle='#f83030';x.fillRect(px-1,py-1,3,3)}x.fillStyle='#fff';x.fillRect(px,py,1,1)}
// --- quest log ---
function questsHTML(){let h='<div class="tl">Quest points: '+Q.qp+' / '+QS.length+'</div>';
 QS.forEach((q,i)=>{if(i<Q.i)h+='<div class="qrow qd">✓ '+q.n+'</div>';
  else if(i===Q.i)h+='<div class="qc"><b>▶ '+q.n+'</b><p>'+q.d+'</p><p>'+(Q.on?'Progress: '+qProg(q)+(qDone(q)?' - return to Elder Rowan!':''):'Talk to Elder Rowan to start this quest.')+'</p><p class="qr">Reward: '+rewardTxt(q)+'</p></div>';
  else h+='<div class="qrow qx">? ? ?</div>'});
 if(Q.i>=QS.length)h+='<div class="qc"><b>Every quest complete!</b></div>';return h}
// --- panel routing (screens 3-6 live in the same panel as skills and shops) ---
const _r10=rPn;rPn=function(){const tabs=ptab<=1;document.getElementById('t0').style.display=tabs?'':'none';document.getElementById('t1').style.display=tabs?'':'none';
 ptt.textContent={4:'BAG',5:'MAP',6:'QUESTS'}[ptab]||'';if(mapT&&ptab!==5){clearInterval(mapT);mapT=null}
 
 if(ptab===4){pbd.innerHTML=bagHTML();return}
 if(ptab===5){pbd.innerHTML=mapHTML();drawMap();if(!mapT)mapT=setInterval(()=>{if(pn.style.display!=='none'&&ptab===5)drawMap()},350);return}
 if(ptab===6){pbd.innerHTML=questsHTML();return}
 _r10()};
const _oc10=pbd.onclick;pbd.onclick=e=>{const t=e.target;let b;
 if((b=t.closest('.bp'))){bagPk=(bagPk+(+b.dataset.d)+POCK.length)%POCK.length;bagSel=null;sfx('talk');rPn();return}
 if((b=t.closest('.use'))){useFood(b.dataset.k);return}
 if((b=t.closest('.bi'))){bagSel=b.dataset.k;rPn();return}
 if((b=t.closest('.opt'))){if(b.dataset.o==='snd')mb.onclick();else{helpOn=!helpOn;try{localStorage.setItem('sq_help',helpOn?'1':'0')}catch(_){}hp.style.display=helpOn?'block':'none'}rPn();return}
 if(t.id==='nmi')return;_oc10(e)};
pbd.addEventListener('input',e=>{if(e.target.id==='nmi'){PNAME=e.target.value.replace(/[<>]/g,'').trim().slice(0,10);saveLocal(true)}});
pbd.addEventListener('change',e=>{if(e.target.id==='nmi')saveCloud(true)});
// name field in the character creator
{const nr=document.createElement('div');nr.className='cr';nr.innerHTML='<span class="cl">Name</span><input id="cni" maxlength="10" autocomplete="off" placeholder="Your name">';crows.parentNode.insertBefore(nr,crows);
 const ci=document.getElementById('cni');if(ci){ci.value=PNAME;ci.addEventListener('input',()=>{PNAME=ci.value.replace(/[<>]/g,'').trim().slice(0,10)})}}
// --- keyboard: menu navigation and hotkeys (runs before the older handlers) ---
document.addEventListener('keydown',e=>{const tg=e.target;
 if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA')){e.stopPropagation();if(e.key==='Enter'){tg.blur();if(menuOpen&&tg.id==='cni')document.getElementById('cgo').click()}return}
 if(chessOpen||menuOpen)return;const k=(e.key||'').toLowerCase(),stop=()=>{e.preventDefault();e.stopPropagation()};
 if(smOpen){const n2=SMI.length;if(k==='arrowdown'||k==='s'){smSel=smSel+2<n2?smSel+2:smSel%2===0&&smSel+1<n2&&smSel+1>=n2-1?smSel+1:smSel%2;rSM()}else if(k==='arrowup'||k==='w'){smSel=smSel-2>=0?smSel-2:(Math.ceil(n2/2)-1)*2+smSel%2<n2?(Math.ceil(n2/2)-1)*2+smSel%2:(Math.ceil(n2/2)-1)*2;rSM()}
  else if(k==='arrowright'||k==='d'){smSel=(smSel+1)%n2;rSM()}else if(k==='arrowleft'||k==='a'){smSel=(smSel+n2-1)%n2;rSM()}
  else if(k==='enter'||k===' '||k==='e'){pickSM(smSel)}else if(k==='escape'||k==='x'||k==='backspace'){closeSM()}else return;stop();return}
 const HK={b:'bag',m:'map',q:'quests',k:'skills',c:'craft',p:'card'};
 if(pnOpen){if(k==='escape'||k==='backspace'){backScreen();stop();return}
  if(HK[k]&&!e.repeat){const tab={card:3,bag:4,skills:0,map:5,quests:6,craft:1}[HK[k]];if(ptab===tab&&pn.style.display!=='none'){backScreen()}else{fromMenu=false;showScreen(HK[k])}stop()}return}
 if(dead)return;
 if(k==='escape'){openSM();stop();return}
 if(HK[k]&&!e.repeat){fromMenu=false;showScreen(HK[k]);stop()}},true);
hp.innerHTML='<b>Controls</b><br>WASD / arrows: move<br>Space: hit, chop, mine, fish<br>E: eat / cook at fire<br>F: build campfire<br>T or Enter: talk<br>Esc: menu · B: bag · M: map<br>Q: quests · K: skills · C: craft<br>P: trainer card · H: hide this help';
// --- HUD (canvas) ---
const _say10=say;let msgAt=0;say=function(s){if(s!==msg||msgT<.5)msgAt=performance.now();_say10(s)};
function g3box(x,y,w,h,U,fill){g.beginPath();g.roundRect(x,y,w,h,6*U);g.fillStyle='#485870';g.fill();g.beginPath();g.roundRect(x+2*U,y+2*U,w-4*U,h-4*U,4*U);g.fillStyle='#a8c0e0';g.fill();g.beginPath();g.roundRect(x+4*U,y+4*U,w-8*U,h-8*U,3*U);g.fillStyle=fill||'#f8f8f8';g.fill()}
function g3text(t,x,y,size,U,col,align,wt){g.font=(wt||600)+' '+size*U+'px '+PF;g.textAlign=align||'left';g.textBaseline='middle';g.fillStyle='#d8d8d0';g.fillText(t,x+U,y+U);g.fillStyle=col||'#404040';g.fillText(t,x,y)}
function g3bar(lab,x,y,U,f,col,txt,tx){g.fillStyle='#485870';g.beginPath();g.roundRect(x,y-5*U,30*U,10*U,3*U);g.fill();g.font='700 '+8*U+'px '+PF;g.textAlign='center';g.textBaseline='middle';g.fillStyle='#f8d048';g.fillText(lab,x+15*U,y+.5*U);
 const bx=x+33*U,bw=90*U;g.fillStyle='#485870';g.fillRect(bx,y-4*U,bw,8*U);g.fillStyle='#e8f0e8';g.fillRect(bx+U,y-3*U,bw-2*U,6*U);g.fillStyle=col;g.fillRect(bx+U,y-3*U,Math.max(0,(bw-2*U)*Math.min(1,f)),6*U);g.fillStyle='rgba(255,255,255,.45)';g.fillRect(bx+U,y-3*U,Math.max(0,(bw-2*U)*Math.min(1,f)),2*U);
 g3text(txt,tx,y,10,U,'#404040','right',600)}
function fitText(t,maxW){if(g.measureText(t).width<=maxW)return t;while(t.length>1&&g.measureText(t+'…').width>maxW)t=t.slice(0,-1);return t+'…'}
const uiS=()=>D*Math.max(1,Math.min(1.6,Math.min(innerWidth,innerHeight)/480));
const HUDIMG={};function hudIcon(k){if(!HUDIMG[k]){const im=new Image();im.src=iconURL(k);HUDIMG[k]=im}return HUDIMG[k]}
let MP={at:-1,p:0,pat:0},MSGBOX=null,HUDL=null;
function hudLayout(){const U=uiS(),ins=12*U,top=50*U,bw=180*U,bh=74*U,qy=top+bh+4*U,qw=Math.min(W-2*ins,250*U),dw=100*U,dh=34*U;
 const chips=[];if(typeof TL!=='undefined'&&TL.bow)chips.push(['arrow',String((inv.arrow|0)+(inv.iarrow|0))]);if((inv.bait|0)>0)chips.push(['bait',String(inv.bait|0)]);if(typeof GPSPR!=='undefined'&&GPSPR&&GPON)chips.push(['run','RUN']);if(typeof ultReady==='function'&&WAND)chips.push(['ult',ultReady()?'ULT':'ULT '+Math.ceil(ULTCD)+'s']);
 const cy=qy+30*U,stackBottom=chips.length?cy+22*U:qy+26*U;return{U,ins,top,bw,bh,qy,qw,dw,dh,dx:W-ins-dw,cy,chips,stackBottom}}
function drawHUD(){if(menuOpen)return;const L=hudLayout(),{U,ins,top,bw,bh,qy,qw,dw,dh,dx}=L;HUDL=L;g.save();g.shadowBlur=0;
 // status box: name and gold, HP, FOOD
 const hpf=Math.max(0,P.hp)/6;g3box(ins,top,bw,bh,U,'#f8f8e0');
 g.font='700 '+13*U+'px '+PF;const gs=String(GLD),gw=g.measureText(gs).width;
 g.font='700 '+14*U+'px '+PF;g3text(fitText(pname().toUpperCase(),bw-gw-52*U),ins+12*U,top+16*U,14,U,'#404040','left',700);
 const gx=ins+bw-12*U-gw;g.fillStyle='#a87818';g.beginPath();g.arc(gx-9*U,top+16*U,5.5*U,0,6.283);g.fill();g.fillStyle='#f8d030';g.beginPath();g.arc(gx-9*U,top+16*U,4*U,0,6.283);g.fill();
 g3text(gs,ins+bw-12*U,top+16.5*U,13,U,'#404040','right',700);
 g3bar('HP',ins+12*U,top+32*U,U,hpf,hpf>.5?'#48c878':hpf>.2?'#f8c030':'#f05030',Math.max(0,P.hp)+'/6',ins+bw-10*U);
 g3bar('FOOD',ins+12*U,top+46*U,U,hunger/100,'#40a8f0',Math.round(hunger)+'%',ins+bw-10*U);
 if(typeof maxMP==='function')g3bar('MANA',ins+12*U,top+60*U,U,MANA/maxMP(),'#a070f0',Math.floor(MANA)+'/'+maxMP(),ins+bw-10*U);
 // quest tracker
 const q=QS[Q.i];let qt=q?(Q.on?q.n+'  '+qProg(q)+(qDone(q)?'  ✓':''):'! New quest - see the Elder'):'All quests complete!';
 if(!(window.SQTRKOFF&&SQTRKOFF())){g3box(ins,qy,qw,26*U,U,'#f8f0d8');g.font='600 '+12*U+'px '+PF;g3text(fitText(qt,qw-22*U),ins+11*U,qy+13.5*U,12,U,Q.on&&q&&qDone(q)?'#2f8a3a':'#404040','left',600);}
 // small chips: arrows, bait, sprint
 let cx=ins;g.imageSmoothingEnabled=false;for(const[k,t]of L.chips){g.font='700 '+11*U+'px '+PF;const w=(k==='run'||k==='ult'?14:30)*U+g.measureText(t).width;g3box(cx,L.cy,w,22*U,U);
  if(k==='ult'){g3text(t,cx+7*U,L.cy+11.5*U,11,U,t==='ULT'?'#8a50e0':'#a0a0b0','left',700)}else if(k!=='run'){const im=hudIcon(k);if(im.complete)g.drawImage(im,cx+5*U,L.cy+4*U,14*U,14*U);g3text(t,cx+23*U,L.cy+11.5*U,11,U,'#404040','left',700)}else g3text(t,cx+7*U,L.cy+11.5*U,11,U,'#d05030','left',700);cx+=w+4*U}
 // day box with a daylight bar
 const dk=dark();g3box(dx,top,dw,dh,U);
 if(dk>.4){g.fillStyle='#f8e070';g.beginPath();g.arc(dx+18*U,top+14*U,6*U,0,6.283);g.fill();g.fillStyle='#f8f8f8';g.beginPath();g.arc(dx+21*U,top+12*U,5.5*U,0,6.283);g.fill()}
 else{g.fillStyle='#f8a020';g.beginPath();g.arc(dx+18*U,top+14*U,6*U,0,6.283);g.fill();g.fillStyle='#f8d848';g.beginPath();g.arc(dx+18*U,top+14*U,4*U,0,6.283);g.fill()}
 g3text('DAY '+(1+Math.floor(time/DAYLEN)),dx+dw-12*U,top+14.5*U,13,U,'#404040','right',700);
 {const bx=dx+8*U,by=top+dh-10*U,bw2=dw-16*U,f=(time%DAYLEN)/DAYLEN,dl=DAYLIGHT/DAYLEN;g.fillStyle='#485870';g.fillRect(bx-U,by-U,bw2+2*U,5*U);g.fillStyle='#f8c840';g.fillRect(bx,by,bw2*dl,3*U);g.fillStyle='#384890';g.fillRect(bx+bw2*dl,by,bw2*(1-dl),3*U);
  g.fillStyle='#ffffff';g.fillRect(bx+bw2*f-U,by-2*U,2*U,7*U)}
 const sa=performance.now()/1000-cloudOk;if(sa<2.5){g.globalAlpha=Math.min(1,2.5-sa);g3text('SAVED',dx-8*U,top+17*U,10,U,'#f8f8f8','right',700);g.globalAlpha=1}
 // text box: pages of two lines; tap it to skip ahead
 MSGBOX=null;
 if(msgT>0&&msg){const touchUI=!isPC&&!GPON,atTop=touchUI&&H>=W,th=(atTop?44:54)*U;let tw,tx,ty;
  if(!touchUI){const hpW=isPC&&hp.style.display==='block'?(hp.getBoundingClientRect().right+14)*D:0;tw=Math.min(W-2*ins,470*U);tx=(W-tw)/2;if(hpW&&tx<hpW){tx=hpW;tw=Math.min(tw,W-ins-hpW)}ty=H-th-18*U}
  else if(H>=W){tx=ins;tw=W-2*ins;ty=Math.max(2*U,top-th-3*U)}// phones held upright: the strip above the status box
  else{tx=ins+Math.max(bw,qw)+10*U;tw=Math.min(470*U,dx-10*U-tx);if(tw<240*U){tx=ins;tw=W-2*ins;ty=L.stackBottom+6*U}else ty=top}
  g.font='600 '+15*U+'px '+PF;const full=String(msg),words=full.split(' '),lines=[''];
  for(const w of words){const tl=lines[lines.length-1]?lines[lines.length-1]+' '+w:w;if(g.measureText(tl).width>tw-48*U&&lines[lines.length-1])lines.push(w);else lines[lines.length-1]=tl}
  const pages=[];for(let i=0;i<lines.length;i+=2)pages.push(lines.slice(i,i+2));
  const now=performance.now();if(MP.at!==msgAt){MP={at:msgAt,p:0,pat:msgAt}}if(MP.p>=pages.length)MP.p=pages.length-1;
  const pg=pages[MP.p],plen=pg.join(' ').length,n=Math.floor((now-MP.pat)/1000*75),done=n>=plen,more=MP.p<pages.length-1;
  if(more){msgT=Math.max(msgT,1);if(done&&now-MP.pat>plen/75*1000+1500+plen*25){MP.p++;MP.pat=now;msgT=Math.max(msgT,2.6)}}
  g.globalAlpha=Math.min(1,msgT/.3);g3box(tx,ty,tw,th,U);let left=n;
  pg.forEach((l,i)=>{const s=l.slice(0,Math.max(0,left));left-=l.length+1;g3text(s,tx+16*U,ty+(atTop?(pg.length>1?17:24):(pg.length>1?19:27))*U+i*17*U,15,U,'#404040','left',600)});
  if(done&&Math.floor(now/350)%2){g.fillStyle='#e04830';g.beginPath();g.moveTo(tx+tw-24*U,ty+th-18*U);g.lineTo(tx+tw-14*U,ty+th-18*U);g.lineTo(tx+tw-19*U,ty+th-12*U);g.fill()}
  g.globalAlpha=1;MSGBOX={x:tx/D,y:ty/D,w:tw/D,h:th/D,more,done,top:atTop}}
 g.restore()}
function drawDead(){const U=uiS();g.save();g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H);const bw=Math.min(W-24*U,360*U),bh=118*U,x=(W-bw)/2,y=H*.34;g3box(x,y,bw,bh,U);
 g3text('You fell!',x+bw/2,y+26*U,22,U,'#d05030','center',700);{const gl=window.SQGRV&&SQGRV.lostPreview?SQGRV.lostPreview():0;g3text(gl?'Your things are in a grave where you fell. It\'s on your map.':'You weren\'t carrying anything.',x+bw/2,y+52*U,13,U,'#404040','center',500);g3text(gl?'Anyone can loot it! Gold and gear are safe.':'Skills, gold and gear are safe.',x+bw/2,y+70*U,13,U,'#404040','center',500)}
 if(time>1.5)g3text((isPC?'Click or press Space':'Tap')+' to try again',x+bw/2,y+96*U,14,U,'#5878b8','center',700);g.restore()}
