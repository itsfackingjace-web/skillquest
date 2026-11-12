// ---- 126. On phones and tablets the chat window opens at the bottom of the screen ----
// (The CHAT button stays where it is; on a computer the window stays at the top.) While the on-screen keyboard is up,
// the window sits just above it: iPhones keep the page the same height and only shrink the visible part
// (visualViewport), so the gap below the visible part is the keyboard. The message list gets shorter to fit.
(()=>{const pc=document.getElementById('mpchat'),lst=document.getElementById('mpl');if(!pc)return;
 const st=document.createElement('style');st.textContent='#mpchat.sqbot{top:auto!important;bottom:calc(env(safe-area-inset-bottom,0px) + 8px)}';document.head.appendChild(st);
 function place(){const mob=typeof isPC!=='undefined'?!isPC:true;pc.classList.toggle('sqbot',mob);
  let kb=0;const vv=window.visualViewport;if(mob&&vv)kb=Math.max(0,window.innerHeight-(vv.height+vv.offsetTop));
  const up=mob&&kb>40,b=up?Math.round(kb+8)+'px':'',h=up?Math.max(70,Math.min(260,Math.round(vv.height-200)))+'px':'';
  if(pc.style.bottom!==b)pc.style.bottom=b;if(lst&&lst.style.height!==h)lst.style.height=h}
 if(window.visualViewport){visualViewport.addEventListener('resize',place);visualViewport.addEventListener('scroll',place)}
 addEventListener('resize',place);
 new MutationObserver(()=>{if(pc.style.display!=='none')place()}).observe(pc,{attributes:true,attributeFilter:['style']});
 place();window.SQCHATPOS=place})();
