// ---- 164. Controller: better d-pad moves, and item cards give the highlight back ----
// - 023's navMove aimed at button centres, so a wide button (the chest card's "Take all") was skipped and the d-pad
//   jumped past it or wrapped around. Now it measures to the nearest edge: the next button in that direction is the one
//   with the smallest gap, preferring buttons that line up with the current one. If nothing is that way, it still wraps.
// - Closing a card (011's chest item card, any [role=dialog] in a panel) with ○ put the highlight back on the chest's
//   first item; now it goes back to the item whose card you opened.
(()=>{
 navMove=function(dx,dy){const root=navRoot();if(!root)return;const items=navItems(root);if(!items.length)return;
  if(!GPF||!items.includes(GPF)){setFocus(items[0]);return}const a=GPF.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2;let best=null,bs=1e9;
  for(const e of items){if(e===GPF)continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;const cx=r.left+r.width/2,cy=r.top+r.height/2;
   if((cx-ax)*dx+(cy-ay)*dy<=4)continue;// not that way
   let d,gap,off;
   if(dy){d=dy>0?r.top-a.bottom:a.top-r.bottom;if(d<-Math.min(a.height,r.height)/2)continue;gap=Math.max(0,r.left-a.right,a.left-r.right);off=Math.abs(cx-ax)}
   else{d=dx>0?r.left-a.right:a.left-r.right;if(d<-Math.min(a.width,r.width)/2)continue;gap=Math.max(0,r.top-a.bottom,a.top-r.bottom);off=Math.abs(cy-ay)}
   const s=Math.max(0,d)+gap*3+off*.15;if(s<bs){bs=s;best=e}}
  if(!best){const i=items.indexOf(GPF);best=items[(i+(dx+dy>0?1:items.length-1))%items.length]}setFocus(best);try{sfx('talk')}catch(e){}};
 // remember the thing a card was opened from, and go back to it when the card closes
 const key=e=>e&&e.dataset?(e.dataset.k||'')+'|'+(e.dataset.a||'')+'|'+(e.dataset.cm||''):'';
 let from=null,wasCard=false;
 {const _np=navPress;navPress=function(){const before=GPF,bk=key(before);const out=_np.apply(this,arguments);
   try{const c=pn&&pn.querySelector('[role="dialog"]');if(c&&before&&!c.contains(before)&&bk!=='||')from=bk}catch(e){}return out}}
 setInterval(()=>{try{if(!GPON||!pnOpen){wasCard=false;return}const card=!!pn.querySelector('[role="dialog"]');
   if(wasCard&&!card&&from){const [k,a]=from.split('|');const el=[...navItems(pn)].find(e=>e.dataset&&e.dataset.k===k&&(e.dataset.a||'')===a);if(el)setFocus(el)}
   if(!card&&wasCard)from=null;wasCard=card}catch(e){}},60);
})();
