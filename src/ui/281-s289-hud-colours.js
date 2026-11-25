// ---- 289. HUD colours (Nov 25, Jace: "it's got that real trademark facebook look ... use #FFECA6 for Huds' background color, #69411B
// for Huds' text color, #35611D for Huds' border color") ----
// The old look was slate-blue frames (#485870) with a light-blue inner line (#a8c0e0), white boxes (#f8f8f8) and grey text (#404040),
// spread over the canvas HUD (010/059's g3box, g3bar, g3text) and the stylesheets of every screen. Here:
// 1. the canvas helpers draw with the theme (a light fill passed in, white or the old creams, becomes the theme background);
// 2. every game stylesheet (<style> made by the game, now and later) has the old palette swapped for the theme's, so the START menu,
//    message box, screens, tabs, slots and buttons follow without touching each file; inline colours in screens are swapped too;
// 3. a few extra rules for boxes that were plain white.
// window.SQTHEME holds the colours (bg, tx, bd and the shades made from them).
// Later that night (Jace and 2GirlsOne50Cal on Discord: the cream was "too vibrant"; a scroll tan with some gradient, brown borders between
// the text and background colours, and a dark brown text, never black): the parchment tan of their picture, a top-to-bottom gradient.
(()=>{const TH=window.SQTHEME={bg:'#D8B898',top:'#E6CDAE',bot:'#CBA882',tx:'#3A2412',bd:'#7A5A3A',ring:'#E8D6B8',sh:'#E9D7BA',lite:'#E8D6B8',tan:'#A8865E',tab:'#CDAD86',tabOn:'#5C3B1F',dark:'#3A2412',trough:'#EFE0C6',hi:'#F3E6CC',lo:'#A07E56',well:'#A88A66',wellTop:'#8C6E4C',stud:'#6A4A2C'};
 // ---- 1. canvas HUD ----
 const px=U=>Math.max(2,Math.round(U)),LIGHT=/^#(f8f8f8|f8f8e0|f8f0d8|fff|ffffff|f8f8f0)$/i,fillOf=f=>!f||LIGHT.test(f)?TH.bg:f;
 // text: the old grey becomes the theme's brown, the old blue accents (tracker titles, Lv. after the name) its green
 const ACC={'#404040':TH.tx,'#3058c8':TH.tabOn,'#3878b8':TH.tabOn,'#5878b8':TH.tabOn},txt=c=>!c?TH.tx:(ACC[String(c).toLowerCase()]||c);
 g3box=function(x,y,w,h,U,fill){const p=px(U);x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
  g.fillStyle=TH.bd;g.fillRect(x+p,y,w-2*p,h);g.fillRect(x,y+p,w,h-2*p);
  // a carved edge: light along the top and left, dark along the bottom and right (instead of one light line all round)
  g.fillStyle=TH.lo;g.fillRect(x+2*p,y+p,w-4*p,h-2*p);g.fillRect(x+p,y+2*p,w-2*p,h-4*p);
  g.fillStyle=TH.hi;g.fillRect(x+2*p,y+p,w-4*p,p);g.fillRect(x+p,y+2*p,p,h-4*p);
  const f=fillOf(fill),parch=f===TH.bg&&TH.top;if(parch){const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,TH.top);gr.addColorStop(1,TH.bot);g.fillStyle=gr}else g.fillStyle=f;
  g.fillRect(x+3*p,y+2*p,w-6*p,h-4*p);g.fillRect(x+2*p,y+3*p,w-4*p,h-6*p);
  if(parch){// parchment grain (a fixed speckle, in game pixels) and small studs in the corners of the bigger boxes
   const pat=grain(p);if(pat){g.fillStyle=pat;g.fillRect(x+3*p,y+2*p,w-6*p,h-4*p);g.fillRect(x+2*p,y+3*p,w-4*p,h-6*p)}
   if(w>40*p&&h>14*p){g.fillStyle=TH.stud;for(const[sx,sy]of[[x+3*p,y+3*p],[x+w-4*p,y+3*p],[x+3*p,y+h-4*p],[x+w-4*p,y+h-4*p]])g.fillRect(sx,sy,p,p)}}};
 // the grain: a 24x24 speckle in game pixels (p = one pixel on this screen), drawn once per pixel size
 const GR={};function grain(p){if(GR[p]!==undefined)return GR[p];let pat=null;try{const c=document.createElement('canvas');c.width=c.height=24*p;const x=c.getContext('2d');let r=7;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
   for(let j=0;j<24;j++)for(let i=0;i<24;i++){const v=rnd();if(v<.07){x.fillStyle='rgba(110,70,30,.13)';x.fillRect(i*p,j*p,p,p)}else if(v>.955){x.fillStyle='rgba(255,248,230,.22)';x.fillRect(i*p,j*p,p,p)}}
   pat=g.createPattern(c,'repeat')}catch(e){self.SQERR&&SQERR(e,'289-5')}return GR[p]=pat}
 g3text=function(t,x,y,size,U,col,align,wt){g.font=(wt||600)+' '+size*U+'px '+PF;g.textAlign=align||'left';g.textBaseline='middle';g.fillStyle=TH.sh;g.fillText(t,x+U,y+U);g.fillStyle=txt(col);g.fillText(t,x,y)};
 g3bar=function(lab,x,y,U,f,col,tx2,tx){const p=px(U),X=Math.round(x),Y=Math.round(y-5*U),lw=Math.round(30*U),lh=Math.round(10*U);
  g.fillStyle=TH.bd;g.fillRect(X+p,Y,lw-2*p,lh);g.fillRect(X,Y+p,lw,lh-2*p);
  g.font='700 '+8*U+'px '+PF;g.textAlign='center';g.textBaseline='middle';g.fillStyle=TH.trough;g.fillText(lab,x+15*U,y+.5*U);
  const bx=Math.round(x+33*U),bw=Math.round(90*U),by=Math.round(y-4*U),bh=Math.round(8*U),iw=bw-2*p,fw=Math.round(iw*Math.max(0,Math.min(1,f)));
  g.fillStyle=TH.bd;g.fillRect(bx+p,by,bw-2*p,bh);g.fillRect(bx,by+p,bw,bh-2*p);
  g.fillStyle=TH.well;g.fillRect(bx+p,by+p,iw,bh-2*p);g.fillStyle=TH.wellTop;g.fillRect(bx+p,by+p,iw,p);// a recessed groove
  if(fw>0){g.fillStyle=BARC[String(col).toLowerCase()]||col;g.fillRect(bx+p,by+p,fw,bh-2*p);g.fillStyle='rgba(255,250,230,.35)';g.fillRect(bx+p,by+p,fw,p);g.fillStyle='rgba(60,30,10,.18)';g.fillRect(bx+p,by+bh-2*p,fw,p)}
  g3text(tx2,tx,y,10,U,TH.tx,'right',600)};
 // the bars' bright colours, made earthier to sit on parchment (same meaning: green/amber/red health, blue food, purple mana)
 const BARC={'#48c878':'#5DA84A','#f8c030':'#DDA436','#f05030':'#C9503A','#40a8f0':'#4A8EC4','#a070f0':'#8A66C4'};
 // the message box: rolled scroll ends on its left and right
 SQHUD.after('289 scroll ends on the message box',()=>{const M=typeof MSGBOX!=='undefined'&&MSGBOX;if(!M||menuOpen)return;const L=typeof HUDL!=='undefined'&&HUDL,U=(L&&L.U)||1,p=px(U),d=typeof D!=='undefined'&&D||1;
  const x=Math.round(M.x*d),y=Math.round(M.y*d),w=Math.round(M.w*d),h=Math.round(M.h*d),rw=7*p,ov=3*p;g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=Math.min(1,(typeof msgT!=='undefined'?msgT:1)/.3);
  for(const rx of[x-ov,x+w+ov-rw]){g.fillStyle=TH.bd;g.fillRect(rx,y-ov,rw,h+2*ov);const gr=g.createLinearGradient(rx,0,rx+rw,0);gr.addColorStop(0,TH.lo);gr.addColorStop(.45,TH.hi);gr.addColorStop(1,TH.lo);g.fillStyle=gr;g.fillRect(rx+p,y-ov+p,rw-2*p,h+2*ov-2*p);
   g.fillStyle=TH.stud;g.fillRect(rx+p,y-ov+p,rw-2*p,p);g.fillRect(rx+p,y+h+ov-2*p,rw-2*p,p)}
  g.restore()});
 // the minimap: a frame like the boxes (225 draws it with a dark edge; the frame goes on that edge, 3 px a side)
 if(typeof drawMini52==='function'){const _dm=drawMini52;drawMini52=function(){const out=_dm.apply(this,arguments);try{const t=miniTarget();if(!t)return out;
   const L=hudLayout(),U=L.U,w=(L.mw||L.dw),hh=Math.round(w*t.h/t.w),bx=L.dx+L.dw-w,by=L.top+L.dh+46*U,p=px(U),fr=(c,o,th)=>{g.fillStyle=c;g.fillRect(bx-o,by-o,w+2*o,th);g.fillRect(bx-o,by+hh+o-th,w+2*o,th);g.fillRect(bx-o,by-o,th,hh+2*o);g.fillRect(bx+w+o-th,by-o,th,hh+2*o)};
   g.save();g.setTransform(1,0,0,1,0,0);fr(TH.bd,2*p,p+1);fr(TH.ring,p,p);g.restore()}catch(e){self.SQERR&&SQERR(e,'289-3')}return out}}
 // ---- 2. stylesheets: the old palette, swapped ----
 const MAP=[['#485870',TH.bd],['#384870',TH.dark],['#a8c0e0',TH.ring],['#8898b8',TH.tan],['#5878b8',TH.tabOn],['#e8ecf4',TH.tab],['#c8d0e0',TH.tan],
  ['#404040',TH.tx],['#d8d8d0',TH.sh],['#f8f8f8',TH.bg],['#e0ecf8',TH.lite],['#f8f0d0',TH.bg],['#f8f0d8',TH.bg],['#f8f8e0',TH.bg],
  ['#e8e4d8',TH.tab],['#505060',TH.tx],['#eef4fc',TH.lite],['#c8d4e8',TH.tan],['#7890b8',TH.tan],['#304870',TH.bd],['#c9d3e4',TH.tan],['#b8c4da',TH.tan],['rgba(248,248,248,',hexA(TH.bg)],['rgba(16,24,40,.55)','rgba(30,20,10,.55)']];
 function hexA(h){const n=parseInt(h.slice(1),16);return'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','}
 const RX=new RegExp(MAP.map(([a])=>a.replace(/[()|.,]/g,'\\$&')).join('|'),'gi'),TO=Object.fromEntries(MAP.map(([a,b])=>[a.toLowerCase(),b]));
 // plain white box backgrounds become a light cream (only backgrounds: white text stays white)
 const WBG=/(background(?:-color)?\s*:\s*)#fff(?:fff)?\b/gi;
 const RX0=new RegExp(RX.source+'|#fff','i'),N=TH.n={a:0,s:0,ms:0};// a quick test before swapping; N counts the work (checks)
 const swap=s=>s.replace(RX,m=>TO[m.toLowerCase()]||m).replace(WBG,'$1'+TH.lite);
 const OWN=document.createElement('style');OWN.id='sqtheme';
 function fixStyle(el){if(!el||el===OWN||el.tagName!=='STYLE')return;N.s++;try{const t=el.textContent,n=swap(t);if(n!==t)el.textContent=n}catch(e){self.SQERR&&SQERR(e,'289-1')}}
 function fixEl(el){const t=el.getAttribute('style');if(!t||!RX0.test(t))return;const n=swap(t);if(n!==t)el.setAttribute('style',n)}
 function fixInline(root){try{if(!root||root.nodeType!==1)return;const els=root.hasAttribute&&root.hasAttribute('style')?[root]:[];for(const el of root.querySelectorAll('[style]'))els.push(el);
   for(const el of els){const t=el.getAttribute('style'),n=swap(t);if(n!==t)el.setAttribute('style',n)}}catch(e){self.SQERR&&SQERR(e,'289-2')}}
 for(const el of document.querySelectorAll('style'))fixStyle(el);
 // the theme's own rules come last, and stay last when a screen adds its stylesheet later
 // the same grain for the screens (2 css px a speckle)
 let GRAIN='';try{const c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d');let r=7;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;for(let j=0;j<24;j++)for(let i=0;i<24;i++){const v=rnd();if(v<.07){x.fillStyle='rgba(110,70,30,.13)';x.fillRect(i*2,j*2,2,2)}else if(v>.955){x.fillStyle='rgba(255,248,230,.22)';x.fillRect(i*2,j*2,2,2)}}GRAIN=c.toDataURL()}catch(e){self.SQERR&&SQERR(e,'289-6')}
 OWN.textContent=`
#pn .sk,.bd,#pn .slot,.slot,#pn .ig,.ig{background:${TH.lite}!important;border-color:${TH.tan}!important}
.bd{background:linear-gradient(${TH.top},${TH.bot})!important;color:${TH.tx}!important;border-color:${TH.bd}!important;box-shadow:inset 0 0 0 2px ${TH.ring}!important}
#pn .pc,#sm,.g3,#cm .cc,#chs .cw{background:url(${GRAIN}),linear-gradient(${TH.top},${TH.bot})!important;color:${TH.tx}!important;box-shadow:inset 3px 3px 0 ${TH.hi},inset -3px -3px 0 ${TH.lo},0 4px 0 rgba(0,0,0,.3)!important}
#pn .pt button.on{color:${TH.bg}!important}
#hp,#hpc{background:${hexA(TH.bg)}.94)!important;color:${TH.tx}!important}`;
 document.head.appendChild(OWN);
 const keepLast=()=>{if(document.head.lastElementChild!==OWN)document.head.appendChild(OWN)};
 new MutationObserver(ms=>{const t0=performance.now();try{obs(ms)}finally{N.ms+=performance.now()-t0}}).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style']});
 function obs(ms){let moved=false;for(const m of ms){if(m.type==='characterData'){fixStyle(m.target.parentNode);continue}
   if(m.type==='attributes'){try{fixEl(m.target)}catch(e){self.SQERR&&SQERR(e,'289-4')}N.a++;continue}
   for(const n of m.addedNodes){if(n===OWN)continue;if(n.nodeType===3){fixStyle(n.parentNode);continue}if(n.tagName==='STYLE'){fixStyle(n);moved=true}else fixInline(n)}}
  if(moved)keepLast()}
 for(const id of['pn','sm','cm','chs','hp'])fixInline(document.getElementById(id));
})();
