// ---- 199. Hide chat (Options) ----
// "Chat: SHOWN/HIDDEN" in Options, kept in localStorage sq_hidechat. Hidden = no chat bubbles over players (yours too;
// 187 skips them via SQHIDECHAT()) and no CHAT button on screen (body.sqnochat). Chat still works from START > Chat
// (and Enter on a keyboard); island people's lines still show.
(()=>{let on=false;try{on=localStorage.getItem('sq_hidechat')==='1'}catch(e){self.SQERR&&SQERR(e,'191-1')}
 const set=v=>{on=!!v;try{localStorage.setItem('sq_hidechat',on?'1':'0')}catch(e){self.SQERR&&SQERR(e,'191-2')}document.body.classList.toggle('sqnochat',on)};
 const st=document.createElement('style');st.textContent='body.sqnochat #mpb{display:none!important}';document.head.appendChild(st);set(on);
 window.SQHIDECHAT=()=>on;
 const _o=optionsHTML;optionsHTML=function(){const h=_o(),add='<button class="sb sqhc">Chat: '+(on?'HIDDEN':'SHOWN')+'</button>'+
   (on?'<div class="qc" style="font-size:13px;line-height:1.4;padding:6px 12px;margin:4px 0 8px">No chat bubbles over players and no CHAT button. You can still open chat from the menu (START → Chat).</div>':'');
  let k=h.indexOf('<div class="tl" style="margin-top:16px">CONTROLLER</div>');if(k<0)k=h.indexOf('<div class="tl" style="margin-top:22px');return k<0?h+add:h.slice(0,k)+add+h.slice(k)};
 pbd.addEventListener('click',e=>{if(!e.target.closest('.sqhc'))return;e.stopPropagation();set(!on);try{sfx('talk')}catch(err){self.SQERR&&SQERR(err,'191-3')}try{rPn()}catch(err){self.SQERR&&SQERR(err,'191-4')}},true)})();
