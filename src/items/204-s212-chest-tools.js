// ---- 212. Chests: TAKE ALL, SORT, names and a placard on the front ----
// The chest screen (011's chestHTML, ptab 7) gets a header with the chest's name, a rename button (inline input, no prompt()),
// TAKE ALL (everything into the bag: own chests at once with one save, a friend's shared chest item by item through 072's
// chestMove transactions) and SORT, which cycles how both grids are ordered (type = the game's bag order, name, amount, value;
// remembered in localStorage sq_chsort). The name lives on the chest object as `nm` (at most NMAX characters) and is saved as
// the 4th entry of a furniture row [i, t, items, nm] by 012 (houses), 067 (island homes) and 145 (yards); 061 publishes it to
// visitors ([i,t,0,nm] in houses/<uid>, yards/<uid>), so friends see the placard too. The outermost drawStruct draws the
// placard: a small plate across the chest's front, text shrunk to fit (fillText's maxWidth squeezes the widest names).
(()=>{const NMAX=12;
 const clean=v=>typeof v==='string'?v.replace(/[\u0000-\u001f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,NMAX):'';
 window.SQCHNAME=clean;window.SQCHNMAX=NMAX;
 const chest=()=>{const s=CHEST_H||STR.get(CHEST_AT);return s&&s.t==='chest'&&s.items?s:null};
 // can this player rename it? not a friend's shared chest, not one in someone else's house
 const ownIt=s=>!!s&&!s._sh&&!s._foreign&&!(SCENE&&SCENE.house&&SCENE.house._foreign);
 // ---- sorting ----
 const MODES=[['type','TYPE'],['name','NAME'],['amount','AMOUNT'],['value','VALUE']];
 let mode='type';try{const m=localStorage.getItem('sq_chsort');if(MODES.some(x=>x[0]===m))mode=m}catch(e){self.SQERR&&SQERR(e,'204-1')}
 const nameOf=k=>String(INAME[k]||k).toLowerCase();
 function order(keys,count){if(mode==='type')return keys;const pos=new Map(keys.map((k,i)=>[k,i])),a=keys.slice();
  const by=mode==='name'?(x,y)=>nameOf(x).localeCompare(nameOf(y)):mode==='amount'?(x,y)=>(count(y)-count(x)):(x,y)=>((SELLP[y]|0)-(SELLP[x]|0));
  return a.sort((x,y)=>by(x,y)||pos.get(x)-pos.get(y))}
 // ---- TAKE ALL ----
 function takeAll(){const s=chest();if(!s)return;if(s._sh&&!s.ok){say('The chest is still opening...');return}
  const ks=Object.keys(s.items).filter(k=>(s.items[k]|0)>0);if(!ks.length){say('The chest is empty.');return}
  let n=0;for(const k of ks)n+=s.items[k]|0;
  if(s._sh){for(const k of ks)chestMove(k,'w')}
  else{for(const k of ks){inv[k]=(inv[k]|0)+(s.items[k]|0);delete s.items[k]}try{sfx('pickup')}catch(e){self.SQERR&&SQERR(e,'204-2')}saveLocal(true);try{saveCloud(true)}catch(e){self.SQERR&&SQERR(e,'204-3')}}
  CHCARD=null;say('Took '+n+' item'+(n===1?'':'s')+' out of the chest.');rPn()}
 // ---- renaming ----
 let REN=null;   // {s, v}: the chest being renamed and the text typed so far
 function rename(v){const s=REN&&REN.s;REN=null;if(!s||!ownIt(s)){rPn();return}const n=(window.SQCHNAME||clean)(v);if(n)s.nm=n;else delete s.nm;
  saveLocal(true);try{saveCloud(true)}catch(e){self.SQERR&&SQERR(e,'204-4')}say(n?'Chest named “'+n+'”.':'Chest name removed.');rPn()}
 // ---- the chest screen ----
 const CSS=document.createElement('style');CSS.textContent=
  '#pn .cht-h{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px}#pn .cht-n{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  '#pn .cht-b{width:auto;margin:0;padding:6px 10px;font-size:13px}#pn .cht-r{display:flex;gap:6px;align-items:center;flex:1 1 100%}'+
  '#pn .cht-r input{flex:1 1 auto;min-width:0;padding:7px 8px;font:600 15px '+PF+';box-sizing:border-box}#pn .cht-c{font-size:12px;opacity:.7;white-space:nowrap}';
 document.head.appendChild(CSS);
 {const _h=chestHTML;chestHTML=function(){const s=chest();if(!s)return _h.apply(this,arguments);
   const _g=gridHTML;let h;gridHTML=function(keys,count){return _g.apply(this,[order(keys,count)].concat([].slice.call(arguments,1)))};
   try{h=_h.apply(this,arguments)}finally{gridHTML=_g}
   const mark='<div class="tl">CHEST</div>';if(h.indexOf(mark)!==0)return h;
   const has=Object.keys(s.items).some(k=>(s.items[k]|0)>0),ml=MODES.find(x=>x[0]===mode)[1],me=ownIt(s);
   let head='<div class="tl cht-h"><span class="cht-n">'+esc(s.nm?s.nm.toUpperCase():'CHEST')+'</span>'+
    (me?'<button class="sb cht-b" data-cht="ren" aria-label="Rename this chest">✎ RENAME</button>':'')+
    (has?'<button class="sb cht-b" data-cht="take">TAKE ALL</button>':'')+'<button class="sb cht-b" data-cht="sort">SORT: '+ml+'</button></div>';
   if(REN&&REN.s===s&&me)head+='<form class="cht-r" data-cht-f><input id="chtnm" maxlength="'+NMAX+'" value="'+esc(REN.v)+'" placeholder="Name on the chest" autocomplete="off" spellcheck="false" aria-label="Chest name">'+
    '<span class="cht-c" id="chtct">'+REN.v.length+'/'+NMAX+'</span><button class="sb cht-b" type="submit">SAVE</button><button class="sb cht-b" type="button" data-cht="cancel">CANCEL</button></form>';
   return head+h.slice(mark.length)}}
 {const _r=rPn;rPn=function(){const a=document.activeElement,typing=a&&a.id==='chtnm',pos=typing?a.selectionStart:0;_r.apply(this,arguments);
   if(ptab!==7||!pnOpen){REN=null;return}const el=document.getElementById('chtnm');if(el&&(typing||REN&&REN.focus)){REN.focus=0;el.focus();try{el.setSelectionRange(typing?pos:el.value.length,typing?pos:el.value.length)}catch(e){self.SQERR&&SQERR(e,'204-5')}}}}
 pbd.addEventListener('click',e=>{if(ptab!==7)return;const b=e.target.closest&&e.target.closest('[data-cht]');if(!b)return;e.stopPropagation();e.preventDefault();const k=b.dataset.cht,s=chest();
  if(k==='take')takeAll();
  else if(k==='sort'){const i=MODES.findIndex(x=>x[0]===mode);mode=MODES[(i+1)%MODES.length][0];try{localStorage.setItem('sq_chsort',mode)}catch(_){self.SQERR&&SQERR(_,'204-6')}rPn()}
  else if(k==='ren'){if(!s||!ownIt(s))return;REN=REN&&REN.s===s?null:{s,v:s.nm||'',focus:1};rPn()}
  else if(k==='cancel'){REN=null;rPn()}},true);
 pbd.addEventListener('submit',e=>{const f=e.target.closest&&e.target.closest('[data-cht-f]');if(!f)return;e.preventDefault();e.stopPropagation();const el=document.getElementById('chtnm');rename(el?el.value:'')},true);
 pbd.addEventListener('input',e=>{if(e.target.id!=='chtnm'||!REN)return;REN.v=e.target.value.slice(0,NMAX);const c=document.getElementById('chtct');if(c)c.textContent=REN.v.length+'/'+NMAX},true);
 // 010's document keydown (capture) stops every key typed into an input and blurs on Enter, so Enter/Escape are taken on window first
 addEventListener('keydown',e=>{if(!e.target||e.target.id!=='chtnm')return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();REN=null;rPn()}else if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();rename(e.target.value)}},true);
 {const _cp=closePanel;closePanel=function(){REN=null;return _cp.apply(this,arguments)}}
 // ---- the placard ----
 function placard(nm,x0,y0){const t=clean(nm);if(!t)return;g.save();try{
   g.font='700 3px '+PF;let fs=2.8;g.font='700 '+fs+'px '+PF;while(fs>2&&g.measureText(t).width>11.4){fs-=.1;g.font='700 '+fs.toFixed(2)+'px '+PF}
   const tw=Math.min(11.4,g.measureText(t).width),pw=Math.max(7,Math.min(13,tw+1.6)),px=x0+8-pw/2,py=y0+8.4,ph=Math.max(3.6,fs+.9);
   g.fillStyle='#3a2410';g.fillRect(px-.5,py-.5,pw+1,ph+1);           // dark edge
   g.fillStyle='#e9d6a0';g.fillRect(px,py,pw,ph);                      // the plate
   g.fillStyle='#f8ecc4';g.fillRect(px,py,pw,.5);                      // light top edge
   g.fillStyle='#b89858';g.fillRect(px,py+ph-.5,pw,.5);                // shadow along the bottom
   g.fillStyle='#8a6a30';for(const cx of[px+.6,px+pw-.6])g.fillRect(cx-.25,py+ph/2-.25,.5,.5);   // two little pins
   g.fillStyle='#3a2410';g.textAlign='center';g.textBaseline='middle';g.fillText(t,x0+8,py+ph/2+.15,11.4)}catch(e){self.SQERR&&SQERR(e,'204-7')}g.restore()}
 {const _ds=drawStruct;drawStruct=function(i,s,ghost){const out=_ds.apply(this,arguments);try{if(s&&s.t==='chest'&&s.nm&&!ghost){const x0=(i%N)*16+(s.shake>0?Math.round(Math.sin(performance.now()/16)):0),y0=((i/N)|0)*16;placard(s.nm,x0,y0)}}catch(e){self.SQERR&&SQERR(e,'204-8')}return out}}
 window.SQCHEST={takeAll,rename(s,v){REN={s,v:''};rename(v)},get mode(){return mode},set mode(m){mode=m},order,NMAX,placard}})();
