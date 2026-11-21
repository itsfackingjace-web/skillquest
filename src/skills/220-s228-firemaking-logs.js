// ---- 228. Firemaking with better logs, and feeding fires ----
// Logs from the higher trees burn into their own campfires: oak (Firemaking 15), willow (30), maple (45), yew (60) and void
// logs (75). Building one takes 3 logs + 1 stone like wood, burns longer (`m`) and gives more XP (3 x `pl`). Standing by one of
// your own lit fires, F also lets you feed it one log at a time (+`fs` seconds, `pl` XP, up to 30 minutes of burn) instead
// of building a new one. A fire fed with a better log takes that log's flame colour.
// Since Nov 20 you can feed another player's fire too: it quietly becomes yours (061's window.SQFIRETAKE: the shared copy
// carries `tk` = the old owner for 20 s and their game drops its own copy), so it keeps burning after they log out.
//   F (the outermost `fire`) opens the picker (ptab 50) only when there's a choice: a tier log you can burn, or one of your own
//   fires next to you. Plain wood with nothing nearby builds straight away, as before.
//   Building with a tier log lends 3 wood for the game's own fire() (timed by 109): `PEND` remembers the kind and the fires
//   that already existed; the outermost `upd` finds the new fire (tags `lg`, scales life, adds the extra XP) or, once no job
//   is running, takes the lent wood back and returns the logs. Extra/feeding XP is added with `window.SQFIREXTRA` set, so
//   the daily/weekly/achievement fire counters (120/143/129) don't count it as another fire.
//   `lg` (1-5) travels with shared fires (061) and saved fires (061's snap). The outermost `pF` draws `lg` fires in the
//   log's colours (unless a Dev Suite `p:campfire` look exists).
(()=>{const TAB=50,FM=5,CAP=1800;
 const T=[{k:'wood',lv:1,pl:13,m:1,fs:30},{k:'oaklog',lv:15,pl:45,m:1.4,fs:45},{k:'willowlog',lv:30,pl:75,m:1.8,fs:55},
  {k:'maplelog',lv:45,pl:110,m:2.2,fs:65},{k:'yewlog',lv:60,pl:165,m:2.6,fs:80},{k:'voidlog',lv:75,pl:250,m:3,fs:95}];
 // flame colours per log (outer to core). Oak burns golden, willow blue, maple crimson, yew green, void purple: plain wood stays orange.
 const PAL=[null,{c:['#b86a10','#e09a18','#f8c838','#fff070','#fffde0'],s:1.1},{c:['#1e5aa8','#3a8ad8','#78c0f0','#d0f0ff','#ffffff'],s:1.15},
  {c:['#6a0a18','#a81428','#e03038','#ff8070','#ffe8e0'],s:1.2},{c:['#1f7a3a','#2fa850','#58d070','#c8f8a0','#f0fff0'],s:1.25},
  {c:['#4a1880','#7a38c8','#a868f0','#e8c8ff','#ffffff'],s:1.3}];
 const nm=k=>k==='wood'?'Wood':(INAME[k]||k),lv=()=>lvOf(FM),n=k=>inv[k]|0;
 const xtra=(x)=>{if(!(x>0))return;window.SQFIREXTRA=1;try{addXp(FM,Math.round(x))}finally{window.SQFIREXTRA=0}};
 const mmss=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
 const baseLife=()=>{let L=150+lv()*3;try{if(typeof fDur==='function')L*=1+fDur()}catch(e){self.SQERR&&SQERR(e,'220-1')}return L};
 // the fire next to you: yours, or (since Nov 20) another player's, which feeding takes over (061's SQFIRETAKE)
 function myFire(){let best=null,bd=30;const[fx,fy]=front(14);for(const f of fires){if(!f||f._glow||!(f.life>0)||(f._rp&&!window.SQFIRETAKE))continue;const d=Math.min(Math.hypot(f.x-fx,f.y-fy),Math.hypot(f.x-P.x,f.y-P.y)+4);if(d<bd){bd=d;best=f}}return best}
 const canBuild=t=>lv()>=t.lv&&n(t.k)>=3&&n('stone')>=1;
 // night glow (r,g,b) and kindling sticks [light, dark] per log, used by 001's night glow and 114's lighting look
 const GLOW=['255,150,40','255,196,70','110,175,255','255,70,70','80,230,120','170,90,255'];
 const STICK=[['#8a5a2a','#7a4a20','#6a4020'],['#d8a850','#a87830','#8a6020'],['#a8b870','#7a8a4a','#5a6a38'],['#c84a32','#9a3020','#7a2018'],['#7a4a38','#5a3020','#3a2014'],['#8a62d0','#5a3a98','#3a2470']];
 window.SQFIREGLOW=f=>GLOW[(f&&f.lg)|0]||GLOW[0];
 // the log being lit right now (a tier build waiting for 109's job): its sticks and flame colours, else null
 const lighting=()=>{if(!PEND||!PEND.i)return null;const p=PAL[PEND.i];return{st:STICK[PEND.i],fl:[p.c[1],p.c[2],p.c[3],p.c[4]]}};
 window.SQFIRELOGS={T,PAL,GLOW,STICK,myFire,lighting};
 // ---- building with a tier log ----
 let PEND=null;

 function build(i){const t=T[i];if(!t)return;if(i===0){window.SQFIREDIRECT=1;try{fire()}finally{window.SQFIREDIRECT=0}return}
  if(!canBuild(t)){say(lv()<t.lv?'Burning '+nm(t.k).toLowerCase()+' needs Firemaking '+t.lv+'.':'Need 3 '+nm(t.k).toLowerCase()+' + 1 stone.');return}
  if(PEND)settle(true);
  inv[t.k]-=3;inv.wood=n('wood')+3;PEND={i,k:t.k,before:new Set(fires),at:performance.now()};
  window.SQFIREDIRECT=1;try{fire()}finally{window.SQFIREDIRECT=0}check()}
 function check(){if(!PEND)return;const f=fires.find(q=>q&&!q._rp&&!q._glow&&!PEND.before.has(q)&&q.life>0);
  if(f){const t=T[PEND.i];f.lg=PEND.i;f.life=Math.min(CAP,f.life*t.m);f.mx=Math.max(f.mx||0,f.life);xtra(t.pl*3-40);
   try{gTxt(f.x,f.y-20,nm(t.k)+' fire',PAL[PEND.i].c[2])}catch(e){self.SQERR&&SQERR(e,'220-2')}PEND=null;return}
  const job=typeof SQDO!=='undefined'?SQDO:null;if(!job&&performance.now()-PEND.at>250)settle(false)}
 function settle(force){if(!PEND)return;const p=PEND;PEND=null;if((inv.wood|0)>=3){inv.wood-=3;inv[p.k]=n(p.k)+3}}
 // ---- feeding ----
 function feed(i){const t=T[i];let f=myFire();if(!t||!f){say('Stand next to a fire to feed it.');return}
  if(lv()<t.lv){say('Burning '+nm(t.k).toLowerCase()+' needs Firemaking '+t.lv+'.');return}if(n(t.k)<1){say('No '+nm(t.k).toLowerCase()+' left.');return}
  if(f.life>=CAP-5){say('That fire is roaring already.');return}
  if(f._rp){f=window.SQFIRETAKE(f);if(!f){say('That fire just went out.');return}}
  inv[t.k]-=1;f.life=Math.min(CAP,f.life+t.fs*(1+((typeof fDur==='function'&&fDur())||0)*.5));f.mx=Math.max(f.mx||0,f.life);if(i>(f.lg|0))f.lg=i;
  xtra(t.pl);try{sfx('fire')}catch(e){self.SQERR&&SQERR(e,'220-3')}try{gTxt(f.x,f.y-18,'+'+mmss(t.fs),i?PAL[i].c[2]:'#f88820')}catch(e){self.SQERR&&SQERR(e,'220-4')}try{saveLocal()}catch(e){self.SQERR&&SQERR(e,'220-5')}if(ptab===TAB&&pnOpen)rPn()}
 // ---- F ----
 SQFIRE.wrap('220',_f=>function(){if(window.SQFIREDIRECT||dead||menuOpen||pnOpen)return _f.apply(this,arguments);
  const near=myFire(),tier=T.slice(1).some(t=>n(t.k)>=3&&lv()>=t.lv);
  if(!near&&!tier)return _f.apply(this,arguments);
  if(near&&!tier&&!T.some(t=>n(t.k)>0&&lv()>=t.lv))return _f.apply(this,arguments);
  pnOpen=true;ptab=TAB;pn.style.display='block';rPn();try{sfx('talk')}catch(e){self.SQERR&&SQERR(e,'220-6')}});
 function row(i,mode){const t=T[i],have=n(t.k),ok=lv()>=t.lv,img='<img src="'+iconURL(t.k)+'" style="width:28px;height:28px;image-rendering:pixelated">';
  let info,btn='';if(mode==='b'){info=ok?(3*t.pl)+' XP · burns '+mmss(baseLife()*t.m)+' · needs 3 + 1 stone':'needs Firemaking '+t.lv;
   if(ok)btn='<button class="sb" data-fmb="'+i+'" style="min-width:0;padding:8px 10px"'+(canBuild(t)?'':' disabled')+'>BUILD</button>'}
  else{info=ok?'+'+mmss(t.fs)+' · '+t.pl+' XP':'needs Firemaking '+t.lv;if(ok)btn='<button class="sb" data-fmf="'+i+'" style="min-width:0;padding:8px 10px"'+(have>0?'':' disabled')+'>FEED 1</button>'}
  return '<div class="qc fmrow" style="display:flex;align-items:center;gap:8px;'+(ok&&(mode==='b'?have>=3:have>0)?'':'opacity:.55')+'">'+img+'<div style="flex:1;text-align:left"><b>'+nm(t.k)+'</b> ×'+have+'<br><small>'+info+'</small></div>'+btn+'</div>'}
 function html(){const f=myFire();let h='<div class="tl">CAMPFIRE</div>';
  if(f){h+='<div class="qc" style="font-size:13px">'+(f._rp?'This fire':'Your fire')+' has <b>'+mmss(f.life)+'</b> left. Feed it a log (Firemaking '+lv()+').</div>';for(let i=0;i<T.length;i++)if(n(T[i].k)>0||i===0)h+=row(i,'f')}
  h+='<div class="tl" style="font-size:14px;margin-top:8px">BUILD A NEW CAMPFIRE</div>';for(let i=0;i<T.length;i++)if(i===0||n(T[i].k)>0||lv()>=T[i].lv)h+=row(i,'b');
  return h+'<div class="pmb"><button class="sb no" data-fmx="1">CLOSE</button></div>'}
 {SQRPN.wrap('220',_r=>function(){if(ptab!==TAB)return _r.apply(this,arguments);try{panelChrome('')}catch(e){self.SQERR&&SQERR(e,'220-7')}pbd.innerHTML=html()})}
 pbd.addEventListener('click',e=>{if(ptab!==TAB||!pnOpen)return;const b=e.target.closest('[data-fmb],[data-fmf],[data-fmx]');if(!b)return;e.stopPropagation();e.preventDefault();if(b.disabled)return;
  if(b.dataset.fmb){closePanel();build(+b.dataset.fmb);return}if(b.dataset.fmf){feed(+b.dataset.fmf);return}closePanel()},true);
 // a save while the 3 lent wood is out (the fire is still being lit) records the logs, not the wood (Nov 18)
 {SQSAVE.wrap('220',_s=>function(){const p=PEND;if(!p||fires.some(q=>q&&!q._rp&&!p.before.has(q))||(inv.wood|0)<3)return _s.apply(this,arguments);
   inv.wood-=3;inv[p.k]=n(p.k)+3;try{return _s.apply(this,arguments)}finally{inv[p.k]-=3;inv.wood+=3}})}
 {SQUPD.after('220',(dt)=>{if(PEND)try{check()}catch(e){PEND=null}})}
 // ---- the look ----
 {const _p=pF;pF=function(f,tm){const P5=f&&f.lg&&PAL[f.lg];if(!P5||f._glow)return _p.apply(this,arguments);
   try{if(window.SQPROPS&&SQPROPS.looks&&SQPROPS.looks['p:campfire'])return _p.apply(this,arguments)}catch(e){self.SQERR&&SQERR(e,'220-8')}
   const x=Math.round(f.x),y=Math.round(f.y),s=P5.s,C=P5.c;shd(x,y+4,18);g.drawImage(hdFireBase(),x-9,y-2,18,8);
   const fl=(cx,by2,w,hh,col)=>{w*=s;hh*=s;g.fillStyle=col;for(let k=0;k<hh*2;k++){const t=k/(hh*2),ww=w*Math.sin(Math.PI*(1-t)*.5+.15)*(1-t*.55);g.fillRect(Math.round((cx-ww/2)*2)/2,by2-k*.5,Math.max(.5,Math.round(ww*2)/2),.5)}};
   const k=tm*9+f.x,a=Math.sin(k)*.6,bq=Math.sin(k*1.7)*.5;
   fl(x+a*.5,y+1,9,9+bq,C[0]);fl(x-2+a,y+1,5,7+Math.sin(k*1.3),C[1]);fl(x+2-a,y+1,5,7.5+Math.cos(k*1.1),C[1]);fl(x+a*.3,y+1,6,6+bq,C[2]);fl(x,y+1,3.5,3.5,C[3]);
   g.fillStyle=C[4];g.fillRect(x-.5,y-1,1,1.5);
   for(let i=0;i<3+(f.lg>3?2:0);i++){const ph=(tm*.8+i*.33+f.x*.01)%1;g.globalAlpha=1-ph;g.fillStyle=i%2?C[3]:C[2];g.fillRect(x+Math.sin(ph*9+i*2)*3*s,y-8*s-ph*12*s,.5+(i===1?.5:0),.5+(i===1?.5:0))}g.globalAlpha=1}}
 // ---- skill tree lines ----
 if(typeof treeGains==='function'){const _tg=treeGains;treeGains=function(sk,l){const a=_tg.apply(this,arguments);try{if(sk===FM){const t=T.find(q=>q.lv===l&&q.k!=='wood');
    if(t)a.push('Burn '+nm(t.k).toLowerCase()+': campfires that burn '+t.m+'x as long ('+(3*t.pl)+' XP), or feed one log into your fire ('+t.pl+' XP)')}}catch(e){self.SQERR&&SQERR(e,'220-9')}return a}}
})();
