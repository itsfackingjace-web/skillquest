// ---- 142. A Discord button on the title screen ----
// Opens the SkillQuest Discord invite in a new tab. tsMenu (061) rebuilds the title buttons now and then, so the button
// is put back (after OPTIONS) whenever the list changes. No link set = no button.
(()=>{const URL_='https://discord.gg/aatNxU9MNf';if(!/^https:\/\/(discord\.gg|discord\.com\/invite)\//.test(URL_))return;const tsMn=document.getElementById('tsmn');if(!tsMn)return;
 {const st=document.createElement('style');st.textContent='#tsmn button[data-a="dc"]{background:#5865f2;color:#fff;border-color:#2c34a0}#tsmn button[data-a="dc"]:hover,#tsmn button[data-a="dc"].gpf{background:#4752c4}';document.head.appendChild(st)}
 const add=()=>{if(tsMn.querySelector('[data-a="dc"]'))return;const o=tsMn.querySelector('[data-a="opt"]');if(!o)return;const b=document.createElement('button');b.dataset.a='dc';b.textContent='JOIN OUR DISCORD';o.after(b)};
 new MutationObserver(add).observe(tsMn,{childList:true});add();
 tsMn.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.a==='dc'){try{sfx('talk')}catch(x){}window.open(URL_,'_blank','noopener')}});
 window.SQDISCORD=URL_})();
