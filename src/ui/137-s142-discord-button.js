// ---- 142. A Discord button on the title screen ----
// A real link (<a target="_blank">) styled like the title buttons: phones (iPhone home-screen apps especially) can block
// window.open, but they always follow a link the player taps. The Windows app opens it in the browser (desktop/main.js).
// tsMenu (061) rebuilds the title buttons now and then, so the link is put back (after OPTIONS) whenever the list changes.
(()=>{const URL_='https://discord.gg/aatNxU9MNf';if(!/^https:\/\/(discord\.gg|discord\.com\/invite)\//.test(URL_))return;const tsMn=document.getElementById('tsmn');if(!tsMn)return;
 {const st=document.createElement('style');st.textContent=`#sqts .tsmn a.tsdc{display:block;box-sizing:border-box;width:calc(50% - 4px);text-align:left;text-decoration:none;background:#5865f2;color:#fff;border:4px solid #2c34a0;box-shadow:inset 0 0 0 3px #a8b4ff;padding:12px 6px 12px 20px;font:700 clamp(11px,3vw,17px) ${PF};letter-spacing:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;position:relative;-webkit-tap-highlight-color:transparent;
 clip-path:polygon(4px 0,calc(100% - 4px) 0,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0 calc(100% - 4px),0 4px)}#sqts .tsmn a.tsdc:hover,#sqts .tsmn a.tsdc:focus-visible{background:#4752c4;outline:none}`;document.head.appendChild(st)}
 const add=()=>{if(tsMn.querySelector('.tsdc'))return;const o=tsMn.querySelector('[data-a="opt"]');if(!o)return;const a=document.createElement('a');a.className='tsdc';a.href=URL_;a.target='_blank';a.rel='noopener noreferrer';a.textContent='JOIN OUR DISCORD';
  // the title screen listens for taps too: keep this one to the link
  for(const ev of['touchstart','pointerdown','mousedown'])a.addEventListener(ev,e=>e.stopPropagation());a.addEventListener('click',e=>{e.stopPropagation();try{sfx('talk')}catch(x){}});o.after(a)};
 new MutationObserver(add).observe(tsMn,{childList:true});add();
 window.SQDISCORD=URL_})();
