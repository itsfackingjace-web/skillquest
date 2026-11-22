// ---- 268. Card frames: show off a Drop Card in your house (window.SQCARDFRAME) ----
// Nov 20 (Jace's pick: "framed cards for your house"; craft it at the workbench with wood + an iron bar, or buy it at Marlo's
// Emporium; the framed card leaves your binder while it's up and comes back when you take it down).
// - `cardframe` is furniture (013's BREC/BK like the chair, and in Marlo's furniture tab through LUX.EMP.FURN2). A little wooden
//   stand with the card on it, drawn by the outermost drawPiece.
// - HIT facing it (your own house) opens panel FTAB: the card on it, TAKE IT DOWN, PICK UP THE FRAME, and your cards to put up.
//   Earned cards only (Starter Deck cards never leave the binder).
// - Which card is on which frame: save `dcf` {"<house id>:<tile>": item key}, always written. Picking the frame up (here or with
//   013's pickFurn) gives the card back first. Visitors see the card too (Nov 21: 061's myHousesData sends it as the row's 5th entry).
(()=>{const D=window.SQDROPCARD,B=window.SQBINDER;if(!D||!B)return;const K='cardframe',FTAB=53;
 const def={k:K,n:'Card frame',c:{wood:4,ibar:1},req:8,xp:40,hp:1};
 BREC.push(def);BK.push(K);BHP[K]=1;if(!INVK.includes(K))INVK.push(K);INAME[K]=def.n;SN[K]='Card frames';SHORT[K]='card frame';SELLP[K]=60;inv[K]=inv[K]|0;
 IDESC[K]='A little stand for showing off one of your Drop Cards. Furniture for your house: place it, then face it and press HIT.';
 try{FURN_ONLY.add(K)}catch(e){self.SQERR&&SQERR(e,'260-1')}
 try{const F2=window.LUX&&LUX.EMP&&LUX.EMP.FURN2;if(F2&&!F2.some(f=>f.k===K))F2.push({k:K,n:'Card frame',d:'A little stand for showing off one of your Drop Cards.',v:250})}catch(e){self.SQERR&&SQERR(e,'260-2')}
 if(!EXTRA_BAG.includes(K))EXTRA_BAG.push(K);
 // ---- which card is where ----
 let ON={};const hk=(h,i)=>String(h&&h.id||'home')+':'+i;
 SQSAVE.after('260:dcf',s=>{s.dcf=ON});SQLOAD.after('260',(S)=>{ON={};const v=S&&S.dcf;if(v&&typeof v==='object')for(const k in v)if(typeof v[k]==='string'&&D.ITEM[v[k]])ON[k]=v[k];READY=true});
 // Nov 22: packing a whole house or castle (HIT its walls, 144's one-home packing, a guild island you left...) left the framed cards
 // in `dcf` with no frame to show them: a card whose home is gone goes back to your binder. Homes the bank holds (267) still count.
 let READY=true;/* 114's boot load runs before the first sweep */SQNEWGAME.before('260',()=>{READY=false});SQNEWGAME.after('260',()=>{READY=true});
 setInterval(()=>{try{if(!READY)return;const ids=new Set(),add=id=>{ids.add(String(id));ids.add(String(id)+'~y')};/* a yard's frames: '<house id>~y:<tile>' (145's yard object) */
   for(const h of HOUSES)if(!h._foreign)add(h.id);for(const h of(window.SQRH||[]))if(!h._foreign)add(h.id);for(const id of(window.SQHTAX?SQHTAX.heldIds():[]))add(id);let n=0;for(const k of Object.keys(ON)){const id=k.slice(0,k.lastIndexOf(':'));if(ids.has(id))continue;const c=ON[k];delete ON[k];inv[c]=(inv[c]|0)+1;n++}
   if(n){say(n>1?n+' framed cards are back in your Card Binder.':'Your framed card is back in your Card Binder.');try{saveLocal(true)}catch(e){self.SQERR&&SQERR(e,'260-9')}}}catch(e){self.SQERR&&SQERR(e,'260-10')}},3000);
 const mine=()=>{const h=inHome();return h&&!h._foreign?h:null};
 function takeDown(h,i,quiet){const k=hk(h,i),c=ON[k];if(!c)return false;delete ON[k];inv[c]=(inv[c]|0)+1;if(!quiet){say(INAME[c]+' is back in your Card Binder.');sfx('pickup')}try{saveLocal(true)}catch(e){self.SQERR&&SQERR(e,'260-3')}return true}
 function putUp(h,i,c){if((inv[c]|0)<1)return false;takeDown(h,i,true);inv[c]--;ON[hk(h,i)]=c;say(INAME[c]+' is on display.');sfx('quest');try{saveLocal(true)}catch(e){self.SQERR&&SQERR(e,'260-4')}return true}
 {const _pf=pickFurn;pickFurn=function(i){try{const h=SCENE&&SCENE.house,f=h&&h.furn.get(i);if(f&&f.t===K&&!h._foreign)takeDown(h,i,true)}catch(e){self.SQERR&&SQERR(e,'260-5')}return _pf.apply(this,arguments)}}
 // ---- the panel ----
 let AT=null;// {h, i}
 function openFrame(h,i){AT={h,i};pnOpen=true;ptab=FTAB;jx=jy=0;pn.style.display='block';rPn();try{sfx('talk')}catch(e){self.SQERR&&SQERR(e,'260-6')}}
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function html(){if(!AT)return'';const c=ON[hk(AT.h,AT.i)];
  let h='<div class="qc dcfr-now">'+(c?'<img src="'+iconURL(c)+'" alt=""><div><b>'+esc(String(INAME[c]).replace(/^(Shiny )?(Drop|Pet) Card: /,'$1'))+'</b><br><small>On display. It\'s out of your binder until you take it down.</small></div>':'<div>This frame is empty. Pick a card to show off.</div>')+'</div>';
  h+='<div class="dcb-row">'+(c?'<button class="sb dcb-act" data-dcfr="down">TAKE IT DOWN</button>':'')+'<button class="sb dcb-act" data-dcfr="pick">PICK UP THE FRAME</button></div>';
  const keys=[];for(const k0 of B.ORDER()){const C=D.ITEM[k0];for(const k of[k0,C&&C.key===k0?C.sh:null])if(k&&(inv[k]|0)>0)keys.push(k)}
  h+='<div class="dcb-sub">'+(keys.length?'Your cards (tap one to put it up):':'You have no cards to put up yet. Starter Deck cards stay in your binder.')+'</div><div class="dcb-g">';
  for(const k of keys)h+='<button class="dcb-c" data-dcfr="put:'+k+'" aria-label="'+esc(INAME[k])+'"><img src="'+iconURL(k)+'" alt=""><span class="dcb-n">'+(inv[k]|0)+'</span>'+(/_sh$/.test(k)?'<span class="dcb-sh">★</span>':'')+'</button>';
  return h+'</div>'}
 SQRPN.wrap('260',_r=>function(){if(ptab!==FTAB)return _r.apply(this,arguments);try{panelChrome('Card frame')}catch(e){self.SQERR&&SQERR(e,'260-7')}pbd.innerHTML='<div class="dcb">'+html()+'</div>'});
 pbd.addEventListener('click',e=>{if(ptab!==FTAB||!pnOpen||!AT)return;const b=e.target.closest('[data-dcfr]');if(!b)return;e.stopPropagation();e.preventDefault();const a=b.dataset.dcfr;
  if(a==='down')takeDown(AT.h,AT.i);else if(a==='pick'){const i=AT.i;AT=null;closePanel();pickFurn(i);return}else if(a.indexOf('put:')===0)putUp(AT.h,AT.i,a.slice(4));rPn()},true);
 // HIT facing a frame at home opens it (013 would pick it up)
 SQHIT.wrap('260 card frame',next=>function(){try{if(!dead&&!menuOpen&&!pnOpen&&!BUILD&&swing<=0){const h=mine();if(h){const R=SCENE.room,[x,y]=frontTile(),i=y*R.w+x,f=h.furn.get(i);if(f&&f.t===K){swing=.25;openFrame(h,i);return}}}}catch(e){self.SQERR&&SQERR(e,'260-8')}return next.apply(this,arguments)});
 // ---- drawing ----
 const IMG={};const img=k=>{let m=IMG[k];if(!m){m=IMG[k]=new Image();m.src=iconURL(k)}return m.complete&&m.naturalWidth?m:null};
 {const _dp=drawPiece;drawPiece=function(t,x,y,f,ghost,tm){if(t!==K)return _dp.apply(this,arguments);const x0=x*16,y0=y*16;
  shd(x0+8,y0+15,10);Rg(x0+3,y0+5,2,10,O);Rg(x0+11,y0+5,2,10,O);Rg(x0+4,y0+6,1,8,'#8a5428');Rg(x0+12,y0+6,1,8,'#8a5428');Rg(x0+2,y0+11,12,2,O);Rg(x0+3,y0+11,10,1,'#a87850');
  Rg(x0+2,y0-8,12,16,O);Rg(x0+3,y0-7,10,14,'#c89860');
  let c=null;try{const h=SCENE&&SCENE.house;if(h&&!ghost){const i=y*SCENE.room.w+x;if(!h._foreign)c=ON[hk(h,i)];else{const fr=h.furn&&h.furn.get(i),k=(f&&f.card)||(fr&&fr.card);if(k&&D.ITEM[k])c=k}}}catch(e){/*quiet*/}// Nov 21: a visitor sees the card too (061 sends it with the frame's row)
  const m=c&&img(c);if(m){g.save();g.imageSmoothingEnabled=false;g.drawImage(m,x0+1,y0-7,14,14);g.restore()}else Rg(x0+4,y0-6,8,12,'#7a5838')}}
 const st=document.createElement('style');st.textContent='.dcfr-now{display:flex;gap:10px;align-items:center;font-size:14px;line-height:1.4}.dcfr-now img{width:56px;height:56px;image-rendering:pixelated}';document.head.appendChild(st);
 window.SQCARDFRAME={get on(){return ON},putUp,takeDown,openFrame,K,FTAB}})();
