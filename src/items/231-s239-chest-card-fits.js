// Chest item card always fits on screen (Amethyst, Nov 16). 011's card (.chcbg/.chc) is position:fixed inside #pn; iPhone Safari
// clips fixed things to the scrolling panel, so with a full bag the card sat at the panel's bottom edge and its buttons were cut
// off. After every render the backdrop is set to the panel's own visible box, the card's height is capped to fit inside it
// (it scrolls if needed), and the panel stops scrolling while the card is open (class sqchlock).
(()=>{
 const st=document.createElement('style');st.textContent='#pn.sqchlock{overflow:hidden!important}#pn .chcbg{box-sizing:border-box}#pn .chc{box-sizing:border-box}';document.head.appendChild(st);
 function fit(){try{const bg=pn.querySelector('.chcbg');pn.classList.toggle('sqchlock',!!bg&&pnOpen);if(!bg)return;
  const r=pn.getBoundingClientRect(),vh=window.innerHeight,vw=window.innerWidth;
  const top=Math.max(0,r.top),bot=Math.min(vh,r.bottom),left=Math.max(0,r.left),right=Math.min(vw,r.right);if(bot-top<120||right-left<120)return;
  Object.assign(bg.style,{top:top+'px',left:left+'px',width:(right-left)+'px',height:(bot-top)+'px',right:'auto',bottom:'auto',padding:'10px'});
  // Nov 23 (Amethyst again: the card ran off the bottom when a bag item in a lower row was tapped): where the panel is its
  // "fixed" children's box (iOS Safari, a transform), top/left count from the panel's scrolled content, not the screen. Measure
  // where the backdrop really landed and move it by the difference.
  const g=bg.getBoundingClientRect(),dy=top-g.top,dx=left-g.left;if(Math.abs(dy)>1||Math.abs(dx)>1){bg.style.top=(top+dy)+'px';bg.style.left=(left+dx)+'px'}
  const c=bg.querySelector('.chc');if(c){c.style.maxHeight=Math.max(100,bot-top-20)+'px';c.style.overflow='auto'}
 }catch(e){self.SQERR&&SQERR(e,'231-1')}}
 window.SQCHFIT=fit;
 SQRPN.after('231',()=>{fit();});
 SQCLOSEPN.after('231',()=>{try{pn.classList.remove('sqchlock')}catch(e){self.SQERR&&SQERR(e,'231-2')}});
 window.addEventListener('resize',fit);if(window.visualViewport)visualViewport.addEventListener('resize',fit);
})();
