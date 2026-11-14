// ---- 185. The title screen shows gear with its own look ----
// 061's title hero is a 16x32 canvas drawn from kitSprite(gearCH()), so worn looks from the Dev Suite (ch.wr, drawn by 111a's
// outermost cP) never showed there. When you wear such a piece, a bigger canvas (48x56 world px at 2x, flagged hd2 so 111a
// draws on it) is laid over the hero and the whole character is drawn through cP like in the game; the kit sits at (16,19)
// inside it, so the overlay is placed that much up and left and sized from the hero's on-screen size. Without such gear
// the original hero shows as before.
(()=>{const st=document.createElement('style');st.textContent='#sqts .tshero canvas.sqtwh{position:absolute!important;image-rendering:pixelated;pointer-events:none;animation:tsbob 1.2s steps(2) infinite}';document.head.appendChild(st);
 let ov=null,last='';
 function draw(){const hero=document.querySelector('#sqts .tshero canvas:not(.sqtwh)');if(!hero)return;const vis=!(typeof SQTITLE==='function')||SQTITLE();
  let ch=null;try{ch=gearCH()}catch(e){}const want=vis&&ch&&Array.isArray(ch.wr)&&ch.wr.length;
  if(!want){if(ov)ov.style.setProperty('display','none','important');hero.style.visibility='';last='';return}
  if(!ov){ov=document.createElement('canvas');ov.className='sqtwh';ov.width=96;ov.height=112;ov.hd2=1;hero.parentElement.appendChild(ov)}
  const k=hero.clientWidth/16||5,S=(p,v)=>ov.style.setProperty(p,v,'important');// 061's '.tshero canvas' rule forces size/position with !important
  S('width',48*k+'px');S('height',56*k+'px');S('position','absolute');S('inset','auto');S('left',hero.offsetLeft-16*k+'px');S('top',hero.offsetTop-19*k+'px');S('display','block');
  const key=JSON.stringify(ch)+'|'+(window.SQA&&SQA.live&&SQA.live.v);if(key!==last){last=key;const x=ov.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,96,112);x.imageSmoothingEnabled=false;x.setTransform(2,0,0,2,0,0);
   const C=GC;GC=x;try{cP(ch,0,0,24,44,false)}catch(e){}finally{GC=C}}
  hero.style.visibility='hidden'}
 setInterval(()=>{try{draw()}catch(e){}},400);window.SQTITLEHERO={draw}})();
