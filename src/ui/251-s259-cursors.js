// ---- 259. Cursors: pick a mouse pointer in Options, and move it with the controller's right stick (window.SQCURSOR) ----
// Nov 20 (Jace): free cursor choices (no unlocks): the normal pointer, a gold arrow, a sword, a wand, a gauntlet, a
// high-contrast white arrow, a yellow crosshair, an inverted crosshair (shows the opposite colour of what's under it) and
// your off-hand item (its bag picture turned 90° counter-clockwise; it changes when you change your off-hand), in Normal or Large size. Saved on this device (localStorage sq_cur, sq_curL).
// Controller: in menus and screens (start menu, any panel, chat) the right stick moves an on-screen cursor drawn with the
// same picture (it used to scroll the screen; moving the cursor to the top or bottom edge scrolls now). While that cursor is
// showing, ✕ clicks whatever is under it; the D-pad or left stick hides it and goes back to the highlight. Out in the world
// the right stick still aims, as before. Done by giving the game a copy of the controller (navigator.getGamepads, like 023's
// PS4 fix) with the right stick, and ✕ while the cursor clicks, taken out.
(()=>{const G={"invp": ".......kk.......|.......kk.......|.......kk.......|.......kk.......|.......kk.......|.......kk.......|................|kkkkkk....kkkkkk|kkkkkk....kkkkkk|................|.......kk.......|.......kk.......|.......kk.......|.......kk.......|.......kk.......|.......kk.......", "arrow": "k...............|kk..............|kyk.............|kyyk............|kyyyk...........|kyyyyk..........|kyyyyyk.........|kyyyyyyk........|kyyyyyyyk.......|kyyyyykkkk......|kyykyyk.........|kyk.kyyk........|kk..kyyk........|k....kyyk.......|.....kyyk.......|......kk........", "sword": ".kk.............|kwsk............|.kwsk...........|..kwsk..........|...kwsk.........|....kwsk........|.....kwsk.......|......kwsk......|.......kwskk....|........kwkyk...|.........kyk....|........kykbk...|.........k.kbk..|............kyk.|.............kgk|..............k.", "wand": "...k...k........|..kyk.kYk.......|.kYyYk.k........|kyywyyk.k.......|.kYyYk.kYk......|..kykbk.k.......|.k.k.kbk........|kYk...kbk.......|.k.....kbk......|........kbk.....|.........kbk....|..........kbk...|...........kbk..|............kBk.|.............k..|................", "glove": "....kk..........|...kwwk.........|...kwwk.........|...kwwk.........|...kwwkkk.......|...kwwkwwkkk....|.kkkwwkwwkwwk...|kwwkwwkwwkwwkk..|kwwkwwwwwwwwwk..|kwwwwwwwwwwwwk..|.kwwwwwwwwwwwk..|.kwwwwwwwwwwk...|..kwwwwwwwwwk...|..kkkkkkkkkkk...|..kyyyyyyyyyk...|..kkkkkkkkkkk...", "contrast": "k...............|kk..............|kwk.............|kwwk............|kwwwk...........|kwwwwk..........|kwwwwwk.........|kwwwwwwk........|kwwwwwwwk.......|kwwwwwkkkk......|kwwkwwk.........|kwk.kwwk........|kk..kwwk........|k....kwwk.......|.....kwwk.......|......kk........", "cross": "......kkk.......|......kyk.......|......kyk.......|......kyk.......|......kyk.......|......kyk.......|kkkkkkkkkkkkkkk.|kyyyyykykyyyyyk.|kkkkkkkkkkkkkkk.|......kyk.......|......kyk.......|......kyk.......|......kyk.......|......kyk.......|......kkk.......|................", "inv": ".......ww.......|.......ww.......|.......ww.......|.......ww.......|.......ww.......|.......ww.......|................|wwwwww....wwwwww|wwwwww....wwwwww|................|.......ww.......|.......ww.......|.......ww.......|.......ww.......|.......ww.......|.......ww......."};
 const PAL={k:'#181018',w:'#f8f8f8',y:'#f8d048',g:'#c89028',s:'#c8d0e0',S:'#8890a8',b:'#966030',B:'#603c1e',p:'#b070e8',P:'#7040b0',r:'#e84040',Y:'#fff078'};
 const KINDS=[['sys','Normal'],['arrow','Gold arrow'],['sword','Sword'],['wand','Wand'],['glove','Gauntlet'],['contrast','High contrast'],['cross','Crosshair'],['inv','Inverted crosshair'],['off','Off-hand item']];
 const HOT={arrow:[0,0],sword:[1,1],wand:[3,3],glove:[5,0],contrast:[0,0],cross:[7,7],inv:[8,8]};
 const LS=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}};
 let CUR=LS('sq_cur','sys'),BIG=LS('sq_curL','0')==='1';if(!KINDS.some(k=>k[0]===CUR))CUR='sys';
 const urls={};
 function url(k,sc){const key=k+sc;if(urls[key])return urls[key];const rows=G[k].split('|'),c=document.createElement('canvas');c.width=c.height=16*sc;const x=c.getContext('2d');
  rows.forEach((r,y)=>{for(let i=0;i<16;i++){const ch=r[i];if(ch&&ch!=='.'){x.fillStyle=PAL[ch];x.fillRect(i*sc,y*sc,sc,sc)}}});return urls[key]=c.toDataURL()}
 const sc=()=>BIG?3:2,pic=()=>CUR==='sys'||CUR==='off'?'arrow':CUR;
 // ---- the off-hand item as the cursor: its bag picture turned 90° counter-clockwise, pointing from the corner nearest the top-left ----
 const OFF={k:null,src:{},hot:{},busy:null};
 const offKey=()=>{try{const k=occ('off');return k&&typeof k==='string'?k:null}catch(e){return null}};
 function buildOff(k,done){OFF.k=k;OFF.src={};OFF.hot={};if(!k){done();return}const im=new Image();OFF.busy=k;
  im.onload=()=>{if(OFF.busy!==k)return;const w=im.width||16,h=im.height||16,n=Math.max(w,h),r=document.createElement('canvas');r.width=r.height=n;const rx=r.getContext('2d');
   rx.imageSmoothingEnabled=false;rx.translate(0,n);rx.rotate(-Math.PI/2);rx.drawImage(im,Math.floor((n-w)/2),Math.floor((n-h)/2));
   for(const s of[2,3]){const N=16*s,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(r,0,0,N,N);
    // the tip: the visible pixel nearest the top-left corner
    let best=[0,0],bd=1e9;try{const d=x.getImageData(0,0,N,N).data;for(let y=0;y<N;y++)for(let i=0;i<N;i++){if(d[(y*N+i)*4+3]>100){const q=i*i+y*y;if(q<bd){bd=q;best=[i,y]}}}}catch(e){self.SQERR&&SQERR(e,'251-7')}
    OFF.src[s]=c.toDataURL();OFF.hot[s]=best}done()};
  im.onerror=()=>{OFF.busy=null;done()};try{im.src=iconURL(k)}catch(e){self.SQERR&&SQERR(e,'251-8');done()}}
 // the picture and hot spot for the current choice (null = the system pointer)
 function cur(){const s=sc();if(CUR==='off'){if(!OFF.src[s])return null;return{src:OFF.src[s],hx:OFF.hot[s][0],hy:OFF.hot[s][1],n:16*s}}
  if(CUR==='sys'&&!BIG)return null;const k=pic(),h=HOT[k];return{src:url(k,s),hx:h[0]*s,hy:h[1]*s,n:16*s}}
 const st=document.createElement('style');document.head.appendChild(st);
 // the inverted crosshair: a browser can't invert colours under a pointer picture, so the real pointer is hidden and a white
 // crosshair drawn with mix-blend-mode:difference follows the mouse instead (it shows the opposite colour of whatever is under it)
 const INV=document.createElement('img');INV.alt='';INV.style.cssText='position:fixed;left:0;top:0;z-index:2147483002;pointer-events:none;display:none;image-rendering:pixelated;mix-blend-mode:difference';document.body.appendChild(INV);
 addEventListener('pointermove',e=>{if(CUR!=='inv'||e.pointerType==='touch')return;const s=sc(),h=HOT.inv;INV.style.display='block';INV.style.transform='translate('+(e.clientX-h[0]*s)+'px,'+(e.clientY-h[1]*s)+'px)'},true);
 document.addEventListener('mouseleave',()=>{INV.style.display='none'});
 function apply(){INV.style.display='none';if(CUR==='inv'){const s=sc();INV.src=url('inv',s);INV.style.width=INV.style.height=(16*s)+'px';st.textContent='html,body,*{cursor:none!important}input[type=text],input:not([type]),textarea{cursor:text!important}';return}
  const c=cur();if(!c){st.textContent='';return}
  st.textContent='html,body,*{cursor:url('+c.src+') '+c.hx+' '+c.hy+',auto!important}input[type=text],input:not([type]),textarea{cursor:text!important}'}
 apply();
 // follow what's in the off-hand
 setInterval(()=>{if(CUR!=='off')return;const k=offKey();if(k!==OFF.k)buildOff(k,()=>{apply();try{if(pnOpen&&ptab===8)rPn()}catch(e){self.SQERR&&SQERR(e,'251-9')}})},500);
 // ---- Options ----
 const OST=document.createElement('style');OST.textContent='.sqcur{display:grid!important;grid-template-columns:repeat(3,1fr);gap:6px;margin:6px 0}.sqcur button{width:auto!important;min-width:0!important;margin:0!important;padding:6px 4px!important;display:flex!important;flex-direction:column;align-items:center;gap:2px;font-size:11px!important;line-height:1.2}.sqcur img{width:32px;height:32px;image-rendering:pixelated}.sqcur .on{background:#fff6c8!important;border-color:#c89830!important}';document.head.appendChild(OST);
 SQOPTS.wrap('251',_o=>function(){const h=_o();
  let s='<div class="tl" style="margin-top:16px">CURSOR</div><div class="sqcur">';
  for(const[k,n]of KINDS){const off=k==='off',has=off&&OFF.k===offKey()&&OFF.src[2],pv=k==='sys'?url('contrast',2):k==='inv'?url('invp',2):off?(has?OFF.src[2]:url('contrast',2)):url(k,2);
   s+='<button class="sb'+(k===CUR?' on':'')+'" data-cur="'+k+'"><img alt="" src="'+pv+'"'+(k==='sys'||(off&&!has)?' style="opacity:.45"':'')+'>'+n+(off&&!offKey()?'<small>(empty)</small>':'')+'</button>'}
  s+='</div><button class="sb" data-curl="1" style="width:100%">Cursor size: '+(BIG?'LARGE':'NORMAL')+'</button>';
  const k=h.indexOf('<div class="tl" style="margin-top:16px">CONTROLLER</div>');return k<0?h+s:h.slice(0,k)+s+h.slice(k)});
 pbd.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-cur],[data-curl]');if(!b)return;e.stopPropagation();
  if(b.dataset.cur){CUR=b.dataset.cur;try{localStorage.setItem('sq_cur',CUR)}catch(err){self.SQERR&&SQERR(err,'251-1')}}else{BIG=!BIG;try{localStorage.setItem('sq_curL',BIG?'1':'0')}catch(err){self.SQERR&&SQERR(err,'251-2')}}
  const fin=()=>{apply();try{sfx('talk');rPn()}catch(err){self.SQERR&&SQERR(err,'251-3')}};if(CUR==='off'&&OFF.k!==offKey())buildOff(offKey(),fin);else fin()},true);
 if(CUR==='off')buildOff(offKey(),apply);
 // ---- the controller's cursor ----
 const VC={on:false,x:innerWidth/2,y:innerHeight/2,img:new Image(),prevX:false,clicks:0};
 VC.img.id='sqvcur';VC.img.alt='';
 const vst=document.createElement('style');vst.textContent='#sqvcur{position:fixed;left:0;top:0;z-index:2147483001;pointer-events:none;display:none;image-rendering:pixelated}';document.head.appendChild(vst);document.body.appendChild(VC.img);
 const inScreen=()=>{try{return!!(pnOpen||menuOpen||(typeof smOpen!=='undefined'&&smOpen)||(window.SQMP&&SQMP.open))}catch(e){return false}};
 const raw0=navigator.getGamepads?navigator.getGamepads.bind(navigator):null,raw=raw0&&(()=>window.__SQPADTEST?window.__SQPADTEST():raw0());// __SQPADTEST: tools/checks
 if(raw){try{navigator.getGamepads=function(){const a=raw();if(!inScreen()&&!VC.on)return a;
   return Array.from(a,gp=>{if(!gp)return gp;const ax=Array.from(gp.axes);ax[2]=0;ax[3]=0;let bt=gp.buttons;
    if(VC.on){bt=Array.from(gp.buttons);bt[0]={pressed:false,touched:false,value:0}}
    return{id:gp.id,index:gp.index,connected:gp.connected,timestamp:gp.timestamp,mapping:gp.mapping,buttons:bt,axes:ax,vibrationActuator:gp.vibrationActuator}})}}catch(e){self.SQERR&&SQERR(e,'251-4')}}
 function click(){const el=document.elementFromPoint(VC.x,VC.y);if(!el)return;VC.clicks++;const o={bubbles:true,cancelable:true,clientX:VC.x,clientY:VC.y,button:0,view:window};
  try{el.dispatchEvent(new PointerEvent('pointerdown',Object.assign({pointerType:'mouse',isPrimary:true},o)));el.dispatchEvent(new MouseEvent('mousedown',o));
   el.dispatchEvent(new PointerEvent('pointerup',Object.assign({pointerType:'mouse',isPrimary:true},o)));el.dispatchEvent(new MouseEvent('mouseup',o));
   if(/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))el.focus();el.dispatchEvent(new MouseEvent('click',o))}catch(e){self.SQERR&&SQERR(e,'251-5')}
  try{sfx('talk')}catch(e){/*quiet*/}}
 let last=performance.now();
 function tick(){const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;
  try{let gp=null;if(raw&&typeof GPON!=='undefined'&&GPON){const a=raw();gp=(GPI!=null&&a[GPI])||Array.from(a).find(g=>g&&g.connected)}
   if(!gp||!inScreen()){VC.on=false}
   else{const rx=gp.axes[2]||0,ry=gp.axes[3]||0,m=Math.hypot(rx,ry);
    if(m>.25){VC.on=true;const sp=1100*Math.min(1,(m-.25)/.75)**1.6;VC.x=Math.max(0,Math.min(innerWidth-2,VC.x+rx/m*sp*dt));VC.y=Math.max(0,Math.min(innerHeight-2,VC.y+ry/m*sp*dt));
     // at the top or bottom edge of a scrolling screen, scroll it
     const sc2=[pn,document.getElementById('mpl')].find(e=>e&&e.offsetParent&&e.scrollHeight>e.clientHeight+4);if(sc2){const r=sc2.getBoundingClientRect();
      if(VC.y<r.top+36&&ry<-.3)sc2.scrollTop-=600*dt;else if(VC.y>r.bottom-36&&ry>.3)sc2.scrollTop+=600*dt}}
    const b=i=>!!(gp.buttons[i]&&(gp.buttons[i].pressed||gp.buttons[i].value>.5));
    if(VC.on&&([12,13,14,15].some(b)||Math.hypot(gp.axes[0]||0,gp.axes[1]||0)>.5))VC.on=false;
    const x=b(0);if(VC.on&&x&&!VC.prevX)click();VC.prevX=x}
   VC.img.style.display=VC.on?'block':'none';VC.img.style.mixBlendMode=CUR==='inv'?'difference':'';if(VC.on){const c=cur()||{src:url('arrow',sc()),hx:0,hy:0,n:16*sc()};const src=CUR==='inv'?url('inv',sc()):c.src,hx=CUR==='inv'?HOT.inv[0]*sc():c.hx,hy=CUR==='inv'?HOT.inv[1]*sc():c.hy;if(VC.img.getAttribute('src')!==src)VC.img.src=src;VC.img.style.width=VC.img.style.height=c.n+'px';VC.img.style.transform='translate('+(VC.x-hx)+'px,'+(VC.y-hy)+'px)'}
   if(window.SQGPRING)SQGPRING.style.visibility=VC.on?'hidden':''}catch(e){self.SQERR&&SQERR(e,'251-6')}
  requestAnimationFrame(tick)}
 requestAnimationFrame(tick);
 window.SQCURSOR={get cur(){return CUR},get big(){return BIG},VC,url,KINDS,OFF,current:cur}})();
