// ---- 188. Eating and campfire cooking pick what you want ----
// EAT used to take the first food in FOODS (the best healer) and, next to a fire, cook the first raw food in COOKS.
//   Eating: a food pinned in the bag (★ EAT FIRST, saved as `eatp`) goes first; otherwise when hurt the smallest food that
//           heals what's missing (else the biggest), and at full health the food that heals least (saving the good ones).
//           Potions and buff meals (SQFOODBUFF) are left for USE in the bag; raw meat only when nothing else is there.
//           Full health and food 95+ with nothing pinned: "You're full." The choice is put first in FOODS for the call.
//   Cooking: next to a fire with two or more kinds of raw food, EAT opens a picker (ptab 41): cook 1 / all of one kind,
//           everything, or eat instead. A chosen kind runs as 109's timed 'cook' job whose steps call eat() with that
//           COOKS entry moved to the front for the call.
(()=>{const TAB=41;let PIN='',BYPASS=0;
 const isPot=f=>!f||/^pot_/.test(f.k)||f.pot;
 const buff=k=>!!(window.SQFOODBUFF&&SQFOODBUFF[k]);
 function pick(){const have=FOODS.filter(f=>(inv[f.k]|0)>0&&!isPot(f));if(!have.length)return null;
  if(PIN){const f=have.find(q=>q.k===PIN);if(f)return f}
  let L=have.filter(f=>!buff(f.k)&&f.k!=='meat');if(!L.length)L=have.filter(f=>!buff(f.k));if(!L.length)return null;
  const miss=6-P.hp,val=f=>SELLP[f.k]||0;
  if(miss>0){const H=L.filter(f=>f.heal>0);if(H.length){const fit=H.filter(f=>f.heal>=miss).sort((a,b)=>a.heal-b.heal||val(a)-val(b));return fit[0]||H.sort((a,b)=>b.heal-a.heal||val(a)-val(b))[0]}}
  return L.slice().sort((a,b)=>a.heal-b.heal||Math.abs(100-hunger-a.hun)-Math.abs(100-hunger-b.hun)||val(a)-val(b))[0]}
 const front=(arr,e,fn)=>{const i=arr.indexOf(e);if(i<=0)return fn();arr.splice(i,1);arr.unshift(e);try{return fn()}finally{const j=arr.indexOf(e);if(j>=0){arr.splice(j,1);arr.splice(Math.min(i,arr.length),0,e)}}};
 const cookable=()=>{const cl=lvOf(4),seen=new Set(),out=[];for(const c of COOKS){if(c.st||(inv[c.raw]|0)<1||seen.has(c.raw))continue;seen.add(c.raw);out.push({c,ok:cl>=c.lv})}return out};
 const atFire=()=>{try{return nearFire(P.x,P.y,45)}catch(e){return false}};
 {const _e=eat;eat=function(){if(BYPASS||dead||menuOpen||pnOpen||window.SQDO_STEP||(typeof SQDO!=='undefined'&&SQDO)||(typeof BUILD!=='undefined'&&BUILD))return _e.apply(this,arguments);
   if(atFire()){const L=cookable();if(L.filter(q=>q.ok).length>=2){openPick();return}if(L.length)return _e.apply(this,arguments)}
   const f=pick();if(!f){const any=FOODS.some(q=>(inv[q.k]|0)>0);if(!any)return _e.apply(this,arguments);say('Use potions and special meals from your Bag.');return}
   if(!PIN&&P.hp>=6&&hunger>=95){say('You\'re full.');try{sfx('swish')}catch(e){}return}
   return front(FOODS,f,()=>_e.apply(this,arguments))}}
 // ---- the cooking picker ----
 function cook(raw,n){const e=COOKS.find(c=>c.raw===raw&&!c.st);if(!e)return;closePanel();const all=n==='all',cnt=all?(inv[raw]|0):1;
  const step=()=>{if((inv[raw]|0)<1)return;BYPASS++;try{front(COOKS,e,()=>eat())}finally{BYPASS--}};
  if(typeof sqDo==='function'&&sqDo('cook',Math.max(1,cnt),step))return;step()}
 function cookAll(){closePanel();BYPASS++;try{eat()}finally{BYPASS--}}
 function eatNow(){closePanel();const f=pick();if(!f){say('Nothing to eat');return}BYPASS++;try{useFood(f.k)}finally{BYPASS--}}
 function openPick(){pnOpen=true;ptab=TAB;jx=jy=0;pn.style.display='block';rPn();try{sfx('talk')}catch(e){}}
 function html(){const L=cookable();let h='<div class="tl">COOK AT THE FIRE</div><div class="qc" style="font-size:13px">What do you want to cook? (Cooking '+lvOf(4)+')</div>';
  for(const{c,ok}of L){const n=inv[c.raw]|0;h+='<div class="qc" style="display:flex;align-items:center;gap:8px"><img src="'+iconURL(c.raw)+'" style="width:28px;height:28px;image-rendering:pixelated"><div style="flex:1"><b>'+(INAME[c.raw]||c.raw)+'</b> ×'+n+'<br><small>→ '+(INAME[c.ck]||c.ck)+(ok?'':' · needs Cooking '+c.lv)+'</small></div>'+
   (ok?'<button class="sb" data-ck1="'+c.raw+'" style="min-width:0;padding:8px 10px">COOK 1</button>'+(n>1?'<button class="sb" data-cka="'+c.raw+'" style="min-width:0;padding:8px 10px">ALL '+n+'</button>':''):'')+'</div>'}
  return h+'<div class="pmb"><button class="sb" data-ckx="every">COOK EVERYTHING</button><button class="sb" data-ckx="eat">EAT INSTEAD</button><button class="sb no" data-ckx="close">CLOSE</button></div>'}
 {const _r=rPn;rPn=function(){if(ptab!==TAB)return _r.apply(this,arguments);try{panelChrome('')}catch(e){}if(!cookable().length){closePanel();return}pbd.innerHTML=html()}}
 pbd.addEventListener('click',e=>{if(ptab!==TAB||!pnOpen)return;const b=e.target.closest('[data-ck1],[data-cka],[data-ckx]');if(!b)return;e.stopPropagation();e.preventDefault();
  if(b.dataset.ck1)return cook(b.dataset.ck1,1);if(b.dataset.cka)return cook(b.dataset.cka,'all');const a=b.dataset.ckx;if(a==='every')return cookAll();if(a==='eat')return eatNow();closePanel()},true);
 // ---- pinning a food in the bag ----
 {const _b=bagGridHTML;bagGridHTML=function(){let h=_b.apply(this,arguments);try{const k=invSel;if(k&&(inv[k]|0)>0&&FOODS.some(f=>f.k===k&&!isPot(f))){const on=PIN===k;
    h=h.replace('<button class="use" data-k="'+k+'">USE</button>','<button class="use" data-k="'+k+'">USE</button><button class="use" data-eatpin="'+k+'" title="EAT uses this food first"'+(on?' style="background:#f8d048;color:#181018"':'')+'>'+(on?'★ EATS FIRST':'☆ EAT FIRST')+'</button>')}}catch(e){}return h}}
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-eatpin]');if(!b)return;e.stopPropagation();e.preventDefault();const k=b.dataset.eatpin;PIN=PIN===k?'':k;
  say(PIN?'EAT will use '+(INAME[k]||k).toLowerCase()+' first.':'EAT picks food for you again.');try{sfx('talk');saveLocal()}catch(x){}try{rPn()}catch(x){}},true);
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);try{s.eatp=PIN}catch(e){}return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);try{PIN=S&&typeof S.eatp==='string'&&INAME[S.eatp]?S.eatp:''}catch(e){}return out}}
 window.SQEAT={pick,cookable,get pin(){return PIN},set pin(v){PIN=v||''},open:openPick,cook}})();
