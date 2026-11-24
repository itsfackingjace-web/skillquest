// A chest's item card fits inside the visible panel, even with a full bag and a short panel (iPhone Safari clips fixed cards
// to the scrolling panel): every button on the card is inside the panel's box.
module.exports={name:'chest item card fits inside the panel with a full bag, also when the panel is scrolled on iPhone',async run(p,t){
 await p.setViewportSize({width:393,height:793});
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
  let n=0;for(const k of BAG_ORDER()){inv[k]=(inv[k]|0)+3;if(++n>60)break}
  CHEST_H={t:'chest',items:{ibar:2}};CHEST_AT=-1;fromMenu=false;pnOpen=true;ptab=7;pn.style.display='block';rPn();await W(300);
  pn.style.top='0';pn.style.bottom='auto';pn.style.height='55vh';pn.scrollTop=1e6;// like a short panel scrolled to the bottom
  const slots=[...pbd.querySelectorAll('.slot[data-a="d"]')];slots[slots.length-1].click();await W(400);
  const pr=pn.getBoundingClientRect(),card=document.querySelector('.chc');if(!card)return{card:false};
  const out=[...card.querySelectorAll('button,input')].filter(b=>{const q=b.getBoundingClientRect();return q.top<pr.top-1||q.bottom>pr.bottom+1}).map(b=>b.textContent.trim()||b.tagName);
  const c=card.getBoundingClientRect();return{card:true,out,inside:c.top>=pr.top-1&&c.bottom<=pr.bottom+1}});
 t(r.card,'no item card opened');t(r.inside,'the card sticks out of the panel');t.eq(r.out,[],'card buttons outside the panel');
 // Nov 23 (Amethyst): on iOS Safari the panel is the box its "fixed" children are placed in, counted from its scrolled content, so
 // tapping a bag item in a lower row put the card off the bottom of the screen. A transform on the panel does the same in Chromium.
 const r2=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));try{if(pnOpen)closePanel()}catch(e){}CHCARD=null;
  const it={};for(const k of BAG_ORDER().slice(0,30))it[k]=5;CHEST_H={t:'chest',items:it};CHEST_AT=-1;fromMenu=false;pnOpen=true;ptab=7;pn.style.cssText='';pn.style.display='block';rPn();await W(300);
  pn.style.transform='translateZ(0)';pn.scrollTop=1e6;await W(100);const slots=[...pbd.querySelectorAll('.slot[data-a="d"]')];slots[Math.min(7,slots.length-1)].click();await W(400);
  const pr=pn.getBoundingClientRect(),vt=Math.max(0,pr.top),vb=Math.min(innerHeight,pr.bottom),card=document.querySelector('.chc');if(!card)return{card:false};
  const out=[...card.querySelectorAll('button,input')].filter(b=>{const q=b.getBoundingClientRect();return q.top<vt-1||q.bottom>vb+1}).map(b=>b.textContent.trim()||b.tagName);
  pn.style.transform='';return{card:true,out,scrolled:pn.scrollTop>0}});
 t.eq([r2.card,r2.scrolled,r2.out],[true,true,[]],'with the panel scrolled down and placing its own fixed children (iOS), the card is on screen')}};
