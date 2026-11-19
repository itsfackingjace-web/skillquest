// A chest's item card fits inside the visible panel, even with a full bag and a short panel (iPhone Safari clips fixed cards
// to the scrolling panel): every button on the card is inside the panel's box.
module.exports={name:'chest item card fits inside the panel with a full bag',async run(p,t){
 await p.setViewportSize({width:393,height:793});
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
  let n=0;for(const k of BAG_ORDER()){inv[k]=(inv[k]|0)+3;if(++n>60)break}
  CHEST_H={t:'chest',items:{ibar:2}};CHEST_AT=-1;fromMenu=false;pnOpen=true;ptab=7;pn.style.display='block';rPn();await W(300);
  pn.style.top='0';pn.style.bottom='auto';pn.style.height='55vh';pn.scrollTop=1e6;// like a short panel scrolled to the bottom
  const slots=[...pbd.querySelectorAll('.slot[data-a="d"]')];slots[slots.length-1].click();await W(400);
  const pr=pn.getBoundingClientRect(),card=document.querySelector('.chc');if(!card)return{card:false};
  const out=[...card.querySelectorAll('button,input')].filter(b=>{const q=b.getBoundingClientRect();return q.top<pr.top-1||q.bottom>pr.bottom+1}).map(b=>b.textContent.trim()||b.tagName);
  const c=card.getBoundingClientRect();return{card:true,out,inside:c.top>=pr.top-1&&c.bottom<=pr.bottom+1}});
 t(r.card,'no item card opened');t(r.inside,'the card sticks out of the panel');t.eq(r.out,[],'card buttons outside the panel')}};
