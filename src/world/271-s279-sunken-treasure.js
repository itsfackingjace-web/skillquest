// ---- 279. Sunken treasure and Davy the ghost pirate (fishing) ----
// Nov 23 (Jace): "players who are fishing may fish up a treasure chest ... 1/500 ... 1/100000 odds, players would fish up a skeleton.
// out of the skeleton Davy emerges ... a kinda spooky little cutscene ... and flies into the player's bag".
// - Every bite that's reeled in rolls once: 1 in 100,000 a skeleton (only when the Davy pet exists in the library, item pet_np_newpet),
//   else 1 in 500 a sunken treasure chest; otherwise the catch goes on as before. Both take the place of that catch, reeled in through
//   109's timed 'reel' job like a fish (moving away loses it). This wraps the outermost catchFish (109's), so it rolls at the bite.
// - A chest opens on the spot: gold (more at higher Fishing) and one or two finds from LOOT, shown in a card in the middle of the screen
//   (#sqtc, tap / key / 3.5 s to close); Fishing XP of twice your best fish. Fishing carries on.
// - The skeleton plays a short scene (CS) while the world holds still (every frame runs with a tiny dt, the player is held in place,
//   HIT / EAT / TALK do nothing): the screen darkens with letterbox bars, the line drags a skeleton onto the shore, it rattles, green mist
//   rises and Davy floats up out of it (the published look of np_newpet, or a plain ghost if there's none), says his two lines in speech
//   bubbles, then swoops into you. Then pet_np_newpet goes into the bag (a second one if you already have him), a card says so, everyone
//   online is told in chat (not for young players' accounts) and the game saves. Any key / tap after the skeleton lands skips to the swoop.
// - Developer accounts: /davy or /treasure in chat makes the next bite Davy's skeleton or a chest (OPEN=false: only devs roll at all, and nothing is announced).
// - window.SQTREASURE: force('chest'|'skel') makes the next bite one of those, speed scales the scene's clock (tests), state() = the scene.
(()=>{const CHEST=1/500,SKEL=1/100000,DAVY='np_newpet',DAVYI='pet_'+DAVY;
 // OPEN: the rolls are on for everyone. Until Jace OKs the release they're on for developer accounts only (window.SQDEV), who can also
 // type /davy or /treasure while fishing to make the next bite Davy's skeleton or a chest.
 const OPEN=false,dev=()=>!!(window.SQDEV&&SQDEV());
 const T={force:null,speed:1};let CS=null;
 const davyOK=()=>!!(typeof INAME!=='undefined'&&INAME[DAVYI]&&typeof EQ!=='undefined'&&EQ[DAVYI]);
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 // ---- little pictures (one letter per pixel) ----
 const PAL={o:'#2a221c',b:'#ece6cf',s:'#b9b096',e:'#120e0a',k:'#3f8f5a',K:'#2a6a40',w:'rgba(159,216,240,.7)',W:'#7a4a26',D:'#5a3418',L:'#9a6234',G:'#f2c14e',g:'#b5862a',Y:'#fff2a0',n:'#1a1410'};
 const CHESTP=['...oooooooooooo...','..oLLLLLLLLLLLLo..','.oLWWWWWWWWWWWWLo.','.oGGGGGGGGGGGGGGo.','.oYYGYYYYYYYGYYGo.','oGGGGGGGGGGGGGGGGo',
  'oWWGWWWWGgGWWWGWWo','oWWGWWWWGnGWWWGWWo','oDDGDDDDGGGDDDGDDo','oWWGWWWWWWWWWWGWWo','oDDGDDDDDDDDDDGDDo','.ooooooooooooooooo.'];
 const SKELP=['........osboo..............','o........oobboo........K...','bo.........ookbo......k....','bbooooooo.obbKbbo...ooooo..','oobbbbbbboobobkbo..obbbbbo.',
  '..ooobsbbooboKoboooobbbbbo.','....obssbsbbbbbbbsboeebeeo.','..ooobbsboobkboboooobbsbbo.','oobkbbbbboobobobo...obbbo..','bbooKoooo.obbbbbo...onono..',
  'bo.k.......oobwo....w......','o........oobboo............','........osboo..............'];
 const pic=(rows,k)=>{const c=document.createElement('canvas');c.width=rows[0].length*k;c.height=rows.length*k;const x=c.getContext('2d');
  rows.forEach((r,y)=>{for(let i=0;i<r.length;i++){const ch=r[i];if(ch==='.')continue;x.fillStyle=PAL[ch]||'#f0f';x.fillRect(i*k,y*k,k,k)}});return c};
 let CHESTC=null,SKELC=null;const chestURL=()=>{if(!CHESTC)CHESTC=pic(CHESTP,4).toDataURL();return CHESTC};const skelCan=()=>SKELC||(SKELC=pic(SKELP,1));
 // ---- sounds (006's tone / noise) ----
 try{if(typeof SFX==='object'&&typeof tone==='function'){
  SFX.ghostwail=()=>{tone(523,1.5,'sine',.05,-240);tone(392,1.7,'triangle',.035,-160,.3);tone(262,1.2,'sine',.03,-60,.8)};
  SFX.rattle=()=>{for(let i=0;i<6;i++)tone(900+Math.random()*600,.035,'square',.02,-300,i*.07)}}}catch(e){self.SQERR&&SQERR(e,'271-1')}
 // ---- the card in the middle of the screen ----
 const box=document.createElement('div');box.id='sqtc';box.setAttribute('role','status');box.style.display='none';document.body.appendChild(box);
 {const st=document.createElement('style');st.textContent=`#sqtc{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;pointer-events:none}
#sqtc .sqtc-c{pointer-events:auto;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;max-width:min(86vw,360px);padding:14px 18px 16px;background:#f8f4e8;border:4px solid #3a2818;border-radius:8px;
box-shadow:0 0 0 3px #f2c14e,0 10px 30px rgba(0,0,0,.45);font:600 14px var(--pf),monospace;color:#3a2818;text-align:center;animation:sqtc-pop .35s ease-out}
#sqtc.ghost .sqtc-c{background:#e8fff9;border-color:#0c2f38;box-shadow:0 0 0 3px #7ff0d8,0 0 40px rgba(120,255,220,.55)}
#sqtc img{width:96px;height:auto;image-rendering:pixelated}#sqtc .sqtc-t{font:800 17px var(--pf),monospace;letter-spacing:.5px;color:#a06010}#sqtc.ghost .sqtc-t{color:#0c5a50}
#sqtc .sqtc-l{font-size:13px;line-height:1.5}@keyframes sqtc-pop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.06);opacity:1}100%{transform:scale(1)}}`;document.head.appendChild(st)}
 let boxUntil=0,boxAt=0;
 function card(ghost,img,title,lines,ms){box.className=ghost?'ghost':'';box.innerHTML='<button class="sqtc-c" aria-label="Close"><img alt="" src="'+img+'"><span class="sqtc-t">'+esc(title)+'</span><span class="sqtc-l">'+lines.map(esc).join('<br>')+'</span></button>';
  box.style.display='flex';boxAt=performance.now();boxUntil=boxAt+(ms||3500)}
 const hideCard=()=>{box.style.display='none';boxUntil=0};
 box.addEventListener('click',e=>{e.stopPropagation();if(performance.now()-boxAt>250)hideCard()});
 addEventListener('keydown',()=>{if(boxUntil&&!CS&&performance.now()-boxAt>250)hideCard()},true);
 (function tick(){requestAnimationFrame(tick);if(boxUntil&&performance.now()>boxUntil)hideCard()})();
 // ---- the roll ----
 const resetFish=()=>{if(FISH){FISH.t=0;FISH.bite=0;FISH.wait=(2+Math.random()*3)*Math.max(.6,1-lvOf(9)*.006)}};
 {const _cf=catchFish;catchFish=function(){if(!FISH||window.SQDO_STEP||CS)return _cf.apply(this,arguments);
   let k=T.force;T.force=null;if(!k&&(OPEN||dev())){const r=Math.random();k=r<SKEL?'skel':r<SKEL+CHEST?'chest':null}
   if(k==='skel'&&!davyOK())k='chest';if(!k)return _cf.apply(this,arguments);
   FISH.t=-999;FISH.bite=0;const land=()=>{if(!FISH)return;try{if(k==='skel')skeleton();else chest()}catch(e){self.SQERR&&SQERR(e,'271-2')}};
   if(typeof sqDo==='function'&&sqDo('reel',1,land))return;land()}}
 // ---- a sunken treasure chest ----
 // [item, weight, min, max]: one or two different finds besides the gold
 const LOOT=[['gbar',30,1,2],['pot_heal',22,1,2],['iarrow',18,10,25],['sapphire',12,1,1],['emerald',9,1,1],['ruby',7,1,1],['diamond',2,1,1]];
 function chest(){const L=lvOf(9),gold=60+L*3+Math.floor(Math.random()*(60+L*5)),got=[gold.toLocaleString('en-US')+' gold'];GLD+=gold;
  const pool=LOOT.filter(r=>typeof INAME!=='undefined'&&INAME[r[0]]),n=Math.random()<.35?2:1;
  for(let i=0;i<n&&pool.length;i++){let w=pool.reduce((a,r)=>a+r[1],0)*Math.random(),j=0;while(j<pool.length-1&&(w-=pool[j][1])>0)j++;const[k,,a,b]=pool.splice(j,1)[0],q=a+Math.floor(Math.random()*(b-a+1));
   inv[k]=(inv[k]|0)+q;const nm=INAME[k];got.push(q>1?q+' '+(/s$/i.test(nm)?nm:nm+'s').toLowerCase():nm)}
  try{const open=FISH_T.filter(f=>L>=f.lv),best=open[open.length-1];addXp(9,(best?best.xp:15)*2)}catch(e){self.SQERR&&SQERR(e,'271-3')}
  try{gTxt(P.x,P.y-30,'+'+gold+' gold','#f8d048')}catch(e){self.SQERR&&SQERR(e,'271-4')}
  say('You fished up a sunken treasure chest!');msgT=4;sfx('quest');setTimeout(()=>sfx('coin'),250);card(false,chestURL(),'SUNKEN TREASURE!',got,3500);
  resetFish();try{saveLocal(true)}catch(e){self.SQERR&&SQERR(e,'271-5')}}
 // ---- Davy's skeleton: the scene ----
 const LINES=['Arrrgh... thank ye for freein\' me from the depths, matey.','I lost me vessel to the sea... I s\'pose ye\'ll have to do!'];
 // phase times (s): pull, drag in, rattle, rise, line 1, line 2, swoop, end
 const PH={drag:1.4,rattle:2.6,rise:3.6,l1:5,l2:7.8,fly:10.8,end:11.9};
 function skeleton(){const bx=FISH?FISH.bx:P.x+face[0]*24,by=FISH?FISH.by:P.y+face[1]*24;FISH=null;
  try{if(pnOpen)closePanel()}catch(e){self.SQERR&&SQERR(e,'271-6')}try{if(menuOpen&&typeof closeMenu==='function')closeMenu()}catch(e){self.SQERR&&SQERR(e,'271-7')}hideCard();
  // the bones are dragged up into the shallows in front of you
  const sx=P.x+face[0]*26,sy=P.y+face[1]*22+4;CS={t:0,bx,by,sx,sy,px:P.x,py:P.y,done:{}};say('Something heavy is on the line...');msgT=3;sfx('splash')}
 const once=(k,f)=>{if(CS&&!CS.done[k]){CS.done[k]=1;try{f()}catch(e){self.SQERR&&SQERR(e,'271-8')}}};
 function step(){const t=CS.t;
  if(t>=PH.drag)once('drag',()=>{say('You fished up... a skeleton?!');msgT=4;sfx('splash')});
  if(t>=PH.rattle)once('rattle',()=>sfx('rattle'));if(t>=PH.rattle+.5)once('rattle2',()=>sfx('rattle'));
  if(t>=PH.rise)once('rise',()=>sfx('ghostwail'));if(t>=PH.l1)once('l1',()=>sfx('talk'));if(t>=PH.l2)once('l2',()=>sfx('talk'));
  if(t>=PH.fly)once('fly',()=>sfx('swish'));
  if(t>=PH.end||dead)finish()}
 function finish(){if(!CS)return;CS=null;inv[DAVYI]=(inv[DAVYI]|0)+1;const nm=(INAME[DAVYI]||'Davy').replace(/ \(pet\)$/i,'');
  try{sfx('level')}catch(e){self.SQERR&&SQERR(e,'271-9')}say(nm+' is in your bag. Put him in your PET slot (Equip) and he\'ll follow you.');msgT=7;
  card(true,iconURL(DAVYI),nm.toUpperCase()+' JOINED YOU!','The ghost of a pirate captain, freed from the depths. He\'s in your bag: put him in your PET slot (Equip).'.split('. ').map((s,i,a)=>s+(i<a.length-1?'.':'')),6000);
  try{const M=window.SQMP;if(OPEN&&M&&M.on&&M.user&&typeof window.mpSend==='function'&&!(window.SQAGE&&SQAGE.child&&SQAGE.child()))setTimeout(()=>{try{mpSend('★ fished up '+nm+', the ghost pirate!')}catch(e){self.SQERR&&SQERR(e,'271-10')}},1200)}catch(e){self.SQERR&&SQERR(e,'271-11')}
  try{saveLocal(true);saveCloud(true)}catch(e){self.SQERR&&SQERR(e,'271-12')}}
 // the world holds still: every frame runs with a tiny dt, and you stay where you are
 SQUPD.wrap('271 Davy scene holds the world still',next=>function(dt){if(!CS)return next.apply(this,arguments);CS.t+=Math.min(.1,dt||0)*T.speed;try{step()}catch(e){self.SQERR&&SQERR(e,'271-13');CS=null}
  if(!CS)return next.apply(this,arguments);try{jx=jy=0}catch(e){/*quiet*/}const x=CS.px,y=CS.py,r=next.call(this,1e-4);P.x=x;P.y=y;return r});
 SQHIT.wrap('271 not during the Davy scene',next=>function(){if(CS)return;return next.apply(this,arguments)});
 SQEAT.wrap('271 not during the Davy scene',next=>function(){if(CS)return;return next.apply(this,arguments)});
 SQTALK.wrap('271 not during the Davy scene',next=>function(){if(CS)return;return next.apply(this,arguments)});
 const skip=()=>{if(CS&&CS.t>PH.rattle&&CS.t<PH.fly)CS.t=PH.fly};
 addEventListener('keydown',e=>{if(!CS||(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)))return;e.preventDefault();e.stopImmediatePropagation();skip()},true);
 addEventListener('pointerdown',e=>{if(!CS)return;if(e.target&&e.target.closest&&e.target.closest('#mpchat,#pn'))return;e.preventDefault();e.stopImmediatePropagation();skip()},{capture:true,passive:false});
 addEventListener('touchstart',e=>{if(!CS)return;if(e.target&&e.target.closest&&e.target.closest('#mpchat,#pn'))return;e.preventDefault();e.stopImmediatePropagation()},{capture:true,passive:false});
 // ---- drawing ----
 const ease=v=>v<0?0:v>1?1:v*v*(3-2*v),lerp=(a,b,v)=>a+(b-a)*v;
 let DV=null,DVK='';
 function davyCan(){let L=null;try{L=SQA.petLook(DAVY)}catch(e){/*quiet*/}// the look the game is using (live, or the Dev Suite's preview)
  const key=L?JSON.stringify(L.a&&L.a.p)+(L.a&&L.a.r||L.a&&L.a.d||'').length:'none';if(DV&&DVK===key)return DV;DVK=key;DV=null;
  try{if(L&&L.a&&SQA.valid(L.a)){const c=SQA.render(L.a);DV={c,w:c.width/2,h:c.height/2}}}catch(e){self.SQERR&&SQERR(e,'271-14')}
  if(!DV){const c=pic(['...oooo...','..offffo..','.offeffeo.','.offffffo.','.offffffo.','.offffffo.','.of.ff.fo.','..o.o..o..'],2);
   const x=c.getContext('2d');x.globalCompositeOperation='source-in';x.fillStyle='rgba(180,255,235,.75)';x.fillRect(0,0,c.width,c.height);DV={c,w:c.width/2,h:c.height/2}}
  return DV}
 SQHUD.before('271 Davy scene',()=>{if(!CS)return;const t=CS.t,cx=camX(),cy=camY();
  try{// the dark
   const dk=Math.min(1,t/1.2)*(t>PH.fly?Math.max(0,1-(t-PH.fly)/(PH.end-PH.fly)):1);g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(8,16,26,'+(.6*dk).toFixed(3)+')';g.fillRect(0,0,W,H);g.restore();
   g.save();g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);g.imageSmoothingEnabled=false;
   // the line, tight, until the bones land
   const land=ease((t-PH.drag)/(PH.rattle-PH.drag)),kx=lerp(CS.bx,CS.sx,land),ky=lerp(CS.by,CS.sy,land);
   if(t<PH.rattle){g.strokeStyle='rgba(230,240,255,.8)';g.lineWidth=.6;g.beginPath();g.moveTo(CS.px+face[0]*6,CS.py-6);g.lineTo(kx,ky-2);g.stroke();
    for(let i=0;i<3;i++){const ph=((t*1.6+i/3)%1);g.globalAlpha=(1-ph)*.7;g.strokeStyle='#e8f8ff';g.beginPath();g.ellipse(kx,ky+2,3+ph*9,1.5+ph*4,0,0,6.283);g.stroke()}g.globalAlpha=1}
   // the skeleton: under the water while it's pulled, then on the bank; it rattles, then crumbles away during the swoop
   if(t>=PH.drag-.3){const S=skelCan(),fade=t>PH.fly?Math.max(0,1-(t-PH.fly)/.9):1,sh=t>PH.rattle&&t<PH.rise+.4?Math.round(Math.sin(t*60)):0;
    g.globalAlpha=(t<PH.drag?.4:1)*fade;g.drawImage(S,Math.round(kx-S.width/2)+sh,Math.round(ky-S.height/2));g.globalAlpha=1}
   // green mist rising from the bones
   if(t>PH.rattle+.3){const fade=t>PH.fly?Math.max(0,1-(t-PH.fly)/.6):1;for(let i=0;i<18;i++){const ph=((t*.55+i*.137)%1),x0=CS.sx+(((i*53)%23)-11)+Math.sin(t*2+i)*2,y0=CS.sy-ph*26;
     g.globalAlpha=(1-ph)*.55*fade*Math.min(1,(t-PH.rattle-.3)*2);g.fillStyle=i%3?'#8ff0d4':'#c8fff0';g.fillRect(Math.round(x0),Math.round(y0),1+(i%2),1+(i%2))}g.globalAlpha=1}
   // Davy rises, floats, then swoops into you
   if(t>=PH.rise){const D=davyCan(),rise=ease((t-PH.rise)/1.3),bob=Math.sin(t*3)*1.2;let x=CS.sx,y=CS.sy-6-rise*12+bob,a=Math.min(1,(t-PH.rise)/1.1),sc=.5+.5*rise;
    if(t>=PH.fly){const f=ease((t-PH.fly)/(PH.end-PH.fly-.15));x=lerp(CS.sx,CS.px,f)+Math.sin(f*3.14)*14*(CS.px>=CS.sx?-1:1);y=lerp(y,CS.py-4,f)-Math.sin(f*3.14)*18;sc*=1-f*.85;a*=1-f*.3}
    const fl=CS.px<CS.sx;// face you
    // glow
    const r=Math.max(D.w,D.h)*.9*sc+4,G=g.createRadialGradient(x,y-D.h*sc*.45,1,x,y-D.h*sc*.45,r);G.addColorStop(0,'rgba(140,255,220,'+(.45*a).toFixed(3)+')');G.addColorStop(1,'rgba(140,255,220,0)');
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=G;g.fillRect(x-r,y-D.h*sc*.45-r,r*2,r*2);g.restore();
    g.save();g.globalAlpha=a;g.translate(Math.round(x),Math.round(y));if(fl)g.scale(-1,1);g.drawImage(D.c,-D.w*sc/2,-D.h*sc,D.w*sc,D.h*sc);g.restore();
    CS.dx=x;CS.dy=y-D.h*sc;// where his bubble goes
    if(t>=PH.fly)for(let i=0;i<8;i++){const ph=((t*3+i/8)%1);g.globalAlpha=(1-ph)*.8;g.fillStyle=i%2?'#fff6a0':'#c8fff0';g.fillRect(Math.round(x+Math.cos(i*.8+t*5)*6*ph),Math.round(y-6+Math.sin(i*.8+t*5)*6*ph),1,1)}g.globalAlpha=1}
   g.restore()}catch(e){self.SQERR&&SQERR(e,'271-15');try{g.restore()}catch(x){/*quiet*/}}});
 // letterbox bars and Davy's speech, over the HUD
 SQHUD.after('271 Davy scene bars and speech',()=>{if(!CS)return;const t=CS.t,U=(typeof HUDL!=='undefined'&&HUDL&&HUDL.U)||1;
  try{g.save();g.setTransform(1,0,0,1,0,0);const bar=Math.round(H*.09*Math.min(1,t/.8)*(t>PH.fly?Math.max(0,1-(t-PH.fly)/(PH.end-PH.fly)):1));
   g.fillStyle='#050608';g.fillRect(0,0,W,bar);g.fillRect(0,H-bar,W,bar);
   const li=t>=PH.l2&&t<PH.fly?1:t>=PH.l1&&t<PH.l2?0:-1;
   if(li>=0&&CS.dx!=null){const start=li?PH.l2:PH.l1,txt=LINES[li].slice(0,Math.floor((t-start)*34)),cx=camX(),cy=camY(),X=(CS.dx-cx)*Z,Y=(CS.dy-cy)*Z-8*U;
    g.font='700 '+Math.round(11*U)+'px '+PF;const maxW=Math.min(W*.8,250*U),words=LINES[li].split(' '),lines=[];let cur='';for(const w of words){const n=cur?cur+' '+w:w;if(g.measureText(n).width>maxW&&cur){lines.push(cur);cur=w}else cur=n}if(cur)lines.push(cur);
    // the full lines set the bubble's size; the typed text fills them
    const lh=14*U,bw=Math.max(...lines.map(s=>g.measureText(s).width))+16*U,bh=lines.length*lh+10*U,bx=Math.max(6,Math.min(W-bw-6,X-bw/2)),by=Math.max(bar+6,Y-bh-8*U);
    g.fillStyle='rgba(12,47,56,.92)';g.strokeStyle='#8ff0d4';g.lineWidth=2*U;g.beginPath();if(g.roundRect)g.roundRect(bx,by,bw,bh,6*U);else g.rect(bx,by,bw,bh);g.fill();g.stroke();
    g.beginPath();const tx=Math.max(bx+10*U,Math.min(bx+bw-10*U,X));g.moveTo(tx-5*U,by+bh);g.lineTo(tx,by+bh+7*U);g.lineTo(tx+5*U,by+bh);g.closePath();g.fill();
    g.fillStyle='#e8fff9';g.textAlign='left';g.textBaseline='top';let left=txt.length;lines.forEach((s,i)=>{const part=s.slice(0,Math.max(0,left));left-=s.length+1;g.fillText(part,bx+8*U,by+5*U+i*lh)})}
   if(t>PH.rattle+.4&&t<PH.fly){g.font='600 '+Math.round(9*U)+'px '+PF;g.textAlign='right';g.textBaseline='bottom';g.fillStyle='rgba(255,255,255,.55)';g.fillText(isPC?'Any key: skip':'Tap: skip',W-10*U,H-6*U)}
   g.restore()}catch(e){self.SQERR&&SQERR(e,'271-16');try{g.restore()}catch(x){/*quiet*/}}});
 // ---- developer commands: /davy, /treasure (the next bite) ----
 {const _ms=mpSend;mpSend=function(t){const m=/^\/(davy|treasure)\s*$/i.exec(String(t||'').trim());if(!m||!dev())return _ms.apply(this,arguments);
   const k=m[1].toLowerCase()==='davy'?'skel':'chest';if(k==='skel'&&!davyOK()){say('Davy isn\'t in the published library, so a skeleton would be a chest.');msgT=5}
   T.force=k;say((k==='skel'?'Davy\'s bones are':'A sunken chest is')+' on your line: '+(FISH?'wait for the next bite.':'cast your line, and the next bite brings '+(k==='skel'?'them':'it')+' up.'));msgT=5;return}}
 // Davy's bag description says where he comes from, unless the Dev Suite gives him one
 try{SQA.onApply(lib=>{const r=lib&&lib.newpets&&lib.newpets[DAVY];if(r&&!String(r.d||'').trim()&&typeof IDESC!=='undefined')IDESC[DAVYI]='Davy, the ghost of a pirate captain who went down with his ship. His bones lie somewhere in the deep: keep fishing and you might haul them up. Put him in your PET slot (Equip) and he follows you everywhere; other players see him too.'})}catch(e){self.SQERR&&SQERR(e,'271-17')}
 window.SQTREASURE={force:k=>{T.force=k},get forced(){return T.force},OPEN,set speed(v){T.speed=+v||1},get speed(){return T.speed},state:()=>CS,LOOT,CHEST,SKEL,chestURL}})();
