// ---------------------------------------------------------------- 23. Controller support (PS5 DualSense, and any standard gamepad)
// Left stick / D-pad: move · ✕: A (hit, talk, use, confirm) · ○: B (dodge roll, back) · □: eat · △: campfire
// L1: talk / use · R1 or R2 (hold): sprint · L2: quests · Options: START menu · Create: map · Touchpad: bag
// In menus the D-pad or stick moves a highlight, ✕ presses the highlighted button and ○ goes back.
let GPI=null,GPON=false,GPPREV=[],GPAX={},GPNAV=0,GPF=null,GPCUR=null,GPHP=6;
const GPKEYS={};
function gpKey(k,down){if(!!GPKEYS[k]===down)return;GPKEYS[k]=down;document.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key:k,bubbles:true,cancelable:true}))}
const gpTap=k=>{gpKey(k,true);gpKey(k,false)};
const gst=document.createElement('style');gst.textContent='.gpf{outline:3px solid #f8a020!important;outline-offset:2px;box-shadow:0 0 0 6px rgba(248,160,32,.25)!important}#gpcur{position:fixed;z-index:30;pointer-events:none;border:3px solid #f8a020;border-radius:3px;box-shadow:0 0 8px #f8a020;display:none}';document.head.appendChild(gst);
const gpc=document.createElement('div');gpc.id='gpcur';document.body.appendChild(gpc);
// --- highlight navigation inside screens ---
function navRoot(){if(chessOpen)return document.querySelector('#chs .bt');if(menuOpen&&cm.style.display!=='none')return cm;if(pnOpen&&pn.style.display!=='none')return pn;return null}
function navItems(root){return[...root.querySelectorAll('button,input')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'&&e.id!=='mb'})}
// controller focus memory: after a screen redraws, land on the same item (by item key or a unique label), else the same
// spot in the same group (e.g. the chest list or the bag list), else the same position overall
let GPMEM=null;const gpLbl=e=>e&&e.dataset&&e.dataset.k?'k:'+e.dataset.k+'|'+(e.dataset.a||''):((e&&e.textContent)||'').trim().split('\n')[0].replace(/\d+/g,'#').slice(0,40);
const gpGrp=e=>e&&e.dataset&&e.dataset.k?'g:'+(e.dataset.a||''):'';
function gpRemember(root,el){const it=navItems(root),l=gpLbl(el),gr=gpGrp(el),grp=gr?it.filter(e=>gpGrp(e)===gr):[];
 return{root,sk:typeof scrKey==='function'?scrKey():'',lbl:l,uniq:it.filter(e=>gpLbl(e)===l).length===1,gr,gi:grp.indexOf(el),idx:it.indexOf(el)}}
function gpRefind(root){const sk=typeof scrKey==='function'?scrKey():'';if(!GPMEM||GPMEM.root!==root||GPMEM.sk!==sk)return null;const it=navItems(root);
 if(GPMEM.uniq){const f=it.find(e=>gpLbl(e)===GPMEM.lbl);if(f)return f}
 if(GPMEM.gr){const grp=it.filter(e=>gpGrp(e)===GPMEM.gr);if(grp.length)return grp[Math.min(GPMEM.gi,grp.length-1)]}
 return it[Math.min(GPMEM.idx,it.length-1)]||null}
function setFocus(el){if(GPF&&GPF!==el)GPF.classList.remove('gpf');GPF=el;if(el){const r=navRoot();if(r)GPMEM=gpRemember(r,el);el.classList.add('gpf');try{el.scrollIntoView({block:'nearest',inline:'nearest'})}catch(e){}}}
function navMove(dx,dy){const root=navRoot();if(!root)return;const items=navItems(root);if(!items.length)return;
 if(!GPF||!items.includes(GPF)){setFocus(items[0]);return}const a=GPF.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2;let best=null,bs=1e9;
 for(const e of items){if(e===GPF)continue;const r=e.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,px=(cx-ax)*dx+(cy-ay)*dy;if(px<=4)continue;const off=Math.abs((cx-ax)*dy)+Math.abs((cy-ay)*dx),s=px+off*2.2;if(s<bs){bs=s;best=e}}
 if(!best){const i=items.indexOf(GPF);best=items[(i+(dx+dy>0?1:items.length-1))%items.length]}setFocus(best);sfx('talk')}
function navPress(){const root=navRoot();if(!root)return;const items=navItems(root);if(!GPF||!items.includes(GPF)){if(items.length)setFocus(items[0]);return}
 const el=GPF;if(el.tagName==='INPUT'){el.focus();return}el.click();
 const r1=navRoot();if(r1&&!navItems(r1).includes(GPF)){const f=gpRefind(r1);if(f)setFocus(f)}
 setTimeout(()=>{const r2=navRoot();if(!r2)return;const it=navItems(r2);if(!it.includes(GPF)){const f=gpRefind(r2);if(f)setFocus(f)}},30)}
// --- chess board cursor ---
let CHC={c:4,r:6};
function drawChessCursor(){if(!chessOpen||!GPON){gpc.style.display='none';return}const r=document.getElementById('chb').getBoundingClientRect(),w=r.width/8;
 gpc.style.display='block';gpc.style.left=(r.left+CHC.c*w-2)+'px';gpc.style.top=(r.top+CHC.r*w-2)+'px';gpc.style.width=(w-2)+'px';gpc.style.height=(w-2)+'px'}
function chessClick(){const b=document.getElementById('chb'),r=b.getBoundingClientRect(),w=r.width/8;const x=r.left+(CHC.c+.5)*w,y=r.top+(CHC.r+.5)*w;
 b.dispatchEvent(new PointerEvent('pointerdown',{clientX:x,clientY:y,bubbles:true,cancelable:true,pointerType:'mouse'}))}
// --- labels on the on-screen buttons ---
function gpLabels(on){const L=on?{a:'R2',e:BUILD?'○':'□',f:'△',tk:'✕',rl:'○'}:isPC?{a:'Space',e:'E',f:'F',tk:'T',rl:'R'}:{};
 for(const id of['a','e','f','tk','rl']){const el=document.getElementById(id);if(!el)continue;const sm=el.querySelector('small');if(L[id]){if(sm)sm.textContent=L[id];else el.insertAdjacentHTML('beforeend','<small>'+L[id]+'</small>')}else if(sm)sm.remove()}}
const _sal23=setActionLabels;setActionLabels=function(){_sal23();if(GPON)gpLabels(true)};
const HELP_PAD='<b>Controller</b><br>Left stick / D-pad: move · L3: sprint on/off<br>R2: sword, chop, mine, fish (hold to repeat)<br>Right stick: aim · R1: bow or wand in your off-hand<br>L1 + R1: wand ultimate (10 mana)<br>✕: talk, use, read (hits if nothing is there)<br>○: dodge roll · □: eat · △: campfire · L2: quests<br>Options: menu · Create: map (PC) · Touchpad or R3: bag<br>Building: R2 or ✕ place · ○ done<br>Menus: D-pad moves, ✕ picks, ○ back, L1 / R1 switch screens';
let helpWas='';
function gpActivate(on){if(on===GPON)return;GPON=on;gpLabels(on);if(on){helpWas=hp.innerHTML;let ds4=false;try{ds4=isDS4([...navigator.getGamepads()].find(x=>x&&x.connected))}catch(e){}hp.innerHTML=ds4?HELP_PAD.replace(/Create/g,'Share'):HELP_PAD;if(typeof PADBN!=='undefined')PADBN[8]=ds4?'Share':'Create';say('Controller connected! ✕ is A, ○ is B. Press Options for the menu.')}else{if(helpWas)hp.innerHTML=helpWas;setFocus(null);gpc.style.display='none'}}
addEventListener('gamepadconnected',e=>{GPI=e.gamepad.index;gpActivate(true)});
addEventListener('gamepaddisconnected',e=>{if(GPI===e.gamepad.index){GPI=null;gpActivate(false);for(const k in GPKEYS)gpKey(k,false);jx=jy=0;GPSPR=false;say('Controller disconnected.');if(!pnOpen&&!menuOpen&&!dead&&!chessOpen&&typeof openSM==='function')openSM()}});
// keyboard or touch input hands control back
addEventListener('keydown',e=>{if(e.isTrusted&&GPON&&!navRoot())setFocus(null)});
// --- rumble when you get hurt ---
// PS4 (DualShock 4): most browsers report it with the standard layout, which the controls above already use. Some
// (Firefox, older Edge, some Bluetooth drivers) report its raw layout instead; this turns that into the standard one,
// d-pad hat included. PS4 controllers also call the Create button "Share".
const isDS4=gp=>!!gp&&/054c/i.test(gp.id)&&/05c4|09cc|0ba0/i.test(gp.id)||!!gp&&/wireless controller/i.test(gp.id)&&!/0ce6|0df2|dualsense/i.test(gp.id);
(function(){if(!navigator.getGamepads)return;const raw=navigator.getGamepads.bind(navigator),B=(v)=>({pressed:v>.5,touched:v>.5,value:v});
 function norm(gp){if(!gp||gp.mapping==='standard'||!isDS4(gp)||gp.buttons.length<13)return gp;const b=gp.buttons,ax=gp.axes,v=i=>b[i]?b[i].value||(b[i].pressed?1:0):0;
  let up=0,dn=0,lf=0,rt=0;const h=ax[9];if(typeof h==='number'&&h>=-1.05&&h<=1.05){const k=Math.round((h+1)/(2/7));up=k===0||k===1||k===7;rt=k>=1&&k<=3;dn=k>=3&&k<=5;lf=k>=5&&k<=7}
  else if(b.length>=18){up=v(14);dn=v(15);lf=v(16);rt=v(17)}else if(ax.length>=8){up=ax[7]<-.5;dn=ax[7]>.5;lf=ax[6]<-.5;rt=ax[6]>.5}
  const l2=ax.length>3?Math.max(v(6),(ax[3]+1)/2):v(6),r2=ax.length>4?Math.max(v(7),(ax[4]+1)/2):v(7);
  const btn=[v(1),v(2),v(0),v(3),v(4),v(5),l2,r2,v(8),v(9),v(10),v(11),+up,+dn,+lf,+rt,v(12),v(13)].map(B);
  return{id:gp.id,index:gp.index,connected:gp.connected,timestamp:gp.timestamp,mapping:'standard',buttons:btn,axes:[ax[0]||0,ax[1]||0,ax[2]||0,ax.length>5?ax[5]:(ax[3]||0)],vibrationActuator:gp.vibrationActuator}}
 try{navigator.getGamepads=function(){const a=raw();return Array.from(a,norm)}}catch(e){}})();
function rumble(ms,s,w){try{const g2=navigator.getGamepads()[GPI];const a=g2&&g2.vibrationActuator;if(a&&a.playEffect)a.playEffect('dual-rumble',{duration:ms,strongMagnitude:s,weakMagnitude:w})}catch(e){}}
// --- polling ---
const PADB={X:0,O:1,SQ:2,TRI:3,L1:4,R1:5,L2:6,R2:7,CREATE:8,OPT:9,L3:10,R3:11,UP:12,DOWN:13,LEFT:14,RIGHT:15,PS:16,PAD:17};
function pollPad(dt){let gp=null;try{const all=navigator.getGamepads?navigator.getGamepads():[];if(GPI!=null)gp=all[GPI];if(!gp)for(const g2 of all)if(g2&&g2.connected){gp=g2;GPI=g2.index;break}}catch(e){}
 if(!gp)return;if(!GPON&&gp.buttons.some(b=>b.pressed))gpActivate(true);if(!GPON)return;
 const btn=i=>!!(gp.buttons[i]&&(gp.buttons[i].pressed||gp.buttons[i].value>.5)),was=i=>!!GPPREV[i],pr=i=>btn(i)&&!was(i);
 const ax=gp.axes[0]||0,ay=gp.axes[1]||0,mag=Math.hypot(ax,ay);
 let dx=(btn(PADB.RIGHT)?1:0)-(btn(PADB.LEFT)?1:0),dy=(btn(PADB.DOWN)?1:0)-(btn(PADB.UP)?1:0);
 // stick acts like a D-pad in menus (with key repeat)
 let ndx=dx,ndy=dy;if(!ndx&&!ndy&&mag>.6){if(Math.abs(ax)>Math.abs(ay))ndx=Math.sign(ax);else ndy=Math.sign(ay)}
 const navDir=ndx||ndy?ndx+','+ndy:'';if(navDir!==GPAX.dir){GPAX.dir=navDir;GPNAV=navDir?0:-1}else if(navDir)GPNAV+=dt;
 const navTick=navDir&&(GPNAV===0||GPNAV>.38&&((GPNAV-.38)%.12)<dt);if(navDir&&GPNAV===0)GPNAV=1e-6;
 const root=navRoot();
 if(chessOpen){gpKey('Shift',false);jx=jy=0;if(!GPAX.chess){GPAX.chess=1;setTimeout(()=>setFocus(null),60)}
  if(navTick){CHC.c=Math.max(0,Math.min(7,CHC.c+ndx));CHC.r=Math.max(0,Math.min(7,CHC.r+ndy));sfx('talk')}
  if(pr(PADB.X))chessClick();if((pr(PADB.SQ)||pr(PADB.OPT))&&GPF)navPress();if(pr(PADB.TRI)&&root)navMove(1,0);if(pr(PADB.O)){const l=document.getElementById('chl');if(l)l.click()}drawChessCursor()}
 if(!chessOpen)GPAX.chess=0;
 if(chessOpen){}else if(typeof smOpen!=='undefined'&&smOpen){gpKey('Shift',false);jx=jy=0;if(navTick&&ndy)gpTap(ndy>0?'ArrowDown':'ArrowUp');else if(navTick&&ndx)gpTap(ndx>0?'ArrowRight':'ArrowLeft');if(pr(PADB.X))gpTap('Enter');if(pr(PADB.O)||pr(PADB.OPT))gpTap('Escape')}
 else if(root){gpKey('Shift',false);jx=jy=0;for(const k of['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])gpKey(k,false);
  if(!GPF||!navItems(root).includes(GPF)){const it=navItems(root);const pick=gpRefind(root)||it.find(e=>e.classList.contains('on'))||it.find(e=>!/^[×✕x]$/i.test((e.textContent||'').trim()))||it[0];if(pick)setFocus(pick)}
  if(navTick)navMove(ndx,ndy);if(pr(PADB.X))navPress();
  if(pr(PADB.O)){if(menuOpen){if(typeof PNAME!=='undefined'&&PNAME)document.getElementById('cgo').click()}else gpTap('Escape')}
  if(pr(PADB.OPT)){if(menuOpen)document.getElementById('cgo').click();else gpTap('Escape')}
  if((pr(PADB.L1)||pr(PADB.R1))&&root===pn&&!menuOpen){const ids=['card','bag','skills','craft','map','quests','options'],cur={3:'card',4:'bag',0:'skills',1:'craft',5:'map',6:'quests',8:'options'}[ptab];
   if(cur&&ptab!==2&&ptab!==7){const fm=fromMenu,n=ids[(ids.indexOf(cur)+(pr(PADB.R1)?1:ids.length-1))%ids.length];showScreen(n);fromMenu=fm;setFocus(null)}}
  const ry=gp.axes[3]||0;if(Math.abs(ry)>.25&&root===pn)pn.scrollTop+=ry*dt*900}
 else{setFocus(null);gpc.style.display='none';
  if(dead){if((pr(PADB.X)||pr(PADB.R2))&&time>1.5)reset();GPSPR=false}
  else{// movement: left stick (analog) or D-pad; L3 (click the left stick) toggles sprint
   const moving=mag>.18||dx||dy;if(pr(PADB.L3)){GPSPR=!GPSPR;if(GPSPR&&!moving)GPAX.idle=0}
   if(moving)GPAX.idle=0;else if((GPAX.idle=(GPAX.idle||0)+dt)>.35)GPSPR=false;
   const run=GPSPR&&moving;gpKey('Shift',run);
   if(mag>.18){const m=Math.min(1,(mag-.18)/.75),s=run?1:Math.min(.94,m);jx=ax/mag*s;jy=ay/mag*s;GPAX.stick=1}
   else if(dx||dy){const l=Math.hypot(dx,dy);jx=dx/l*(run?1:.94);jy=dy/l*(run?1:.94);GPAX.stick=1}
   else if(GPAX.stick){jx=jy=0;GPAX.stick=0}
   // right stick: turn to face a direction (aim the bow, pick where to fish)
   const rx=gp.axes[2]||0,rY=gp.axes[3]||0,rm=Math.hypot(rx,rY);GPAX.aim=rm>.55?(Math.abs(rx)>Math.abs(rY)?[Math.sign(rx),0]:[0,Math.sign(rY)]):null;
   if(rm>.35){AIM.v=[rx/rm,rY/rm];AIM.t=performance.now()}
   // R2: hit (hold to keep swinging, chopping or shooting)
   if(pr(PADB.R2)){gpTap(' ');GPAX.r2=0}else if(btn(PADB.R2)){GPAX.r2=(GPAX.r2||0)+dt;if(GPAX.r2>.35&&swing<=0&&!FISH&&!pnOpen&&!BUILD&&!menuOpen)gpTap(' ')}
   // ✕: the A button - talk, use, read; hits when there's nothing to use
   if(pr(PADB.X)){if(BUILD)gpTap(' ');else{const use=!!facingNpc()||(SCENE?!!nearFurn():nearStruct()!==null)||(typeof canBoard==='function'&&(nearWreck()||canLand()||canBoard()))||!!(window.SQPADUSE&&SQPADUSE());gpTap(use?'t':' ')}}  // signs are read by the hit
   if(pr(PADB.O)){if(BUILD)gpTap('Escape');else roll()}
   if(pr(PADB.L1))GPAX.l1u=false;
   if((btn(PADB.L1)&&pr(PADB.R1))||(btn(PADB.R1)&&pr(PADB.L1))){GPAX.l1u=true;GPAX.r1=-9;if(typeof castUlt==='function')castUlt()}
   else if(!btn(PADB.L1)){if(pr(PADB.R1)){shootAim(true);GPAX.r1=0}else if(btn(PADB.R1)&&GPAX.r1>-1){GPAX.r1=(GPAX.r1||0)+dt;if(GPAX.r1>.35&&swing<=0)shootAim(false)}}
   if(pr(PADB.SQ)){if(BUILD)gpTap('Escape');else gpTap('e')}
   if(pr(PADB.TRI))gpTap('f');if(!btn(PADB.L1)&&was(PADB.L1)&&!GPAX.l1u)gpTap('t');
   if(pr(PADB.OPT))gpTap('Escape');if(pr(PADB.CREATE)&&!(typeof isMobileOS!=='undefined'&&isMobileOS))gpTap('m');if(pr(PADB.PAD)||(pr(PADB.R3)&&gp.buttons.length<18))gpTap('b');if(pr(PADB.L2))gpTap('q')}}  // on phones Create is the system screenshot button; R3 opens the Bag when there's no touchpad button
 if(!chessOpen)gpc.style.display='none';
 GPPREV=gp.buttons.map(b=>b.pressed||b.value>.5)}
let GPSPR=false,GPRUM=true;try{GPRUM=localStorage.getItem('sq_rumble')!=='0'}catch(e){}
const _rum23=rumble;rumble=function(ms,s,w){if(GPRUM)_rum23(ms,s,w)};
// Options screen: controller layout and a rumble switch
const _opt23=optionsHTML;optionsHTML=function(){const h=_opt23();if(!GPON)return h;const k=h.indexOf('<div class="tl" style="margin-top:22px');
 const add='<div class="tl" style="margin-top:16px">CONTROLLER</div><button class="sb gpo" data-o="rum">Rumble: '+(GPRUM?'ON':'OFF')+'</button><div class="qc" style="font-size:13px;line-height:1.6">'+HELP_PAD.replace('<b>Controller</b><br>','')+'</div>';
 return k<0?h+add:h.slice(0,k)+add+h.slice(k)};
const _oc23=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('.gpo');if(b){GPRUM=!GPRUM;try{localStorage.setItem('sq_rumble',GPRUM?'1':'0')}catch(_){}if(GPRUM)rumble(120,.6,.3);rPn();return}_oc23(e)};
// --- aiming the bow with the right stick ---
const AIM={v:null,t:-1e9};
const aimLive=()=>AIM.v&&performance.now()-AIM.t<1200;
function aimDir(){let d=aimLive()?AIM.v.slice():null;if(!d){const t=bowTarget&&bowTarget();if(t){const dx=t.x-P.x,dy=(t.y-4)-(P.y-2),l=Math.hypot(dx,dy)||1;return[dx/l,dy/l,t]}return[face[0],face[1],null]}
 // gentle aim assist: snap to an enemy within about 14 degrees of where you aim
 let best=null,bc=Math.cos(.25);for(const n of en){if(n.dead)continue;const dx=n.x-P.x,dy=(n.y-4)-(P.y-2),l=Math.hypot(dx,dy);if(l<10||l>bowRange())continue;const c=(dx*d[0]+dy*d[1])/l;if(c>bc){bc=c;best=[dx/l,dy/l,n]}}return best||[d[0],d[1],null]}
function shootAim(first){if(dead||menuOpen||pnOpen||BUILD||FISH||swing>0)return;if(SCENE&&!SCENE.room.cave){if(first)say('Not indoors!');return}
 if(!TL.bow){if(first){say('You need a bow. Make a shortbow in the Craft tab (Archery).');sfx('swish')}return}
 if((inv.arrow|0)+(inv.iarrow|0)<1){if(first){say('Out of arrows! Make more in the Craft tab.');sfx('swish')}return}
 const[dx,dy]=aimDir(),ia=(inv.iarrow|0)>0;if(ia)inv.iarrow--;else inv.arrow--;swing=.35;BOWT=.35;BOWD=[dx,dy];sfx('bow');
 face=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];
 PROJ.push({x:P.x+dx*8,y:P.y-2+dy*6,vx:dx*270,vy:dy*270,t:0,life:bowRange()/270,k:'arrow',dmg:arrowDmg(),sc:curScene(),iron:ia});
 if((inv.arrow|0)+(inv.iarrow|0)===0)say('That was your last arrow!')}
function drawCrosshair(tm){if(!GPON||!TL.bow||!aimLive()||dead||ROLLT>0)return;if(SCENE&&!SCENE.room.cave)return;const[dx,dy,tgt]=aimDir(),r=34,x=Math.round(P.x+dx*r),y=Math.round(P.y-4+dy*r),pu=Math.floor(tm*4)%2,c=tgt?'#f84030':'#f8f8f8',k=tgt?3:4+pu;
 g.globalAlpha=Math.min(1,1.2-(performance.now()-AIM.t)/1000);for(const[a,b,w,hh]of[[-k-2,-1,3,3],[k,-1,3,3],[-1,-k-2,3,3],[-1,k,3,3]]){Rg(x+a-1,y+b-1,w+2,hh+2,O)}
 Rg(x-k-2,y,3,1,c);Rg(x+k,y,3,1,c);Rg(x,y-k-2,1,3,c);Rg(x,y+k,1,3,c);Rg(x,y,1,1,c);g.globalAlpha=1}
// crosshair goes on top of the night tint so it stays easy to see
const _dh25=drawHUD;drawHUD=function(){if(GPON&&!menuOpen){const cx=camX(),cy=camY();g.save();g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);drawCrosshair(performance.now()/1000);g.restore()}_dh25()};
// shooting shows a drawn bow instead of the sword swing
let BOWT=0,BOWD=[0,1];
const _pP25=pP;pP=function(tm){if(BOWT<=0)return _pP25(tm);const sw=swing;swing=0;_pP25(tm);swing=sw;if(hurt>0&&Math.floor(tm*20)%2)return;
 const[dx,dy]=BOWD,px=-dy,py=dx,cx=P.x+dx*10,cy=P.y-5+dy*8,dr=(BOWT>.2?2:0),pts=[];
 for(let t=-6;t<=6;t++){const k=t*t/9;pts.push([Math.round(cx+px*t-dx*k),Math.round(cy+py*t-dy*k)])}
 for(const[x,y]of pts)Rg(x-1,y-1,4,4,O);for(let t=-5;t<=5;t++){const k=36/9+dr-Math.abs(t)*dr/5;Rg(Math.round(cx+px*t-dx*k),Math.round(cy+py*t-dy*k),1,1,'#f0f0f0')}
 for(const[x,y]of pts)Rg(x,y,2,2,'#a86830');Rg(pts[6][0],pts[6][1],2,2,'#7a4a20')};
const _u25=upd;upd=function(dt){_u25(dt);BOWT=Math.max(0,BOWT-dt)};
const _u23=upd;upd=function(dt){pollPad(dt);const hp0=P.hp;_u23(dt);if(GPON){if(GPAX.aim&&ROLLT<=0&&!pnOpen)face=GPAX.aim;const sm=tk.querySelector('small');if(sm&&sm.textContent!=='✕')sm.textContent='✕';else if(!sm&&tk.style.display!=='none')tk.insertAdjacentHTML('beforeend','<small>✕</small>')}if(GPON&&P.hp<hp0)rumble(140,.7,.4);if(GPON&&dead&&GPHP>0)rumble(400,1,1);GPHP=dead?0:P.hp};
