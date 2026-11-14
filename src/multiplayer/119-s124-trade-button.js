// ---- 124. The player's name on the TALK button when you stand next to them ----
// (Since section 135 the button shows the player's name and opens the player menu: trade, add friend, duel.)
// Trading (section 67) used to start from START > Trade, /trade name or the Friends list. Now, when another player
// stands right next to you and the TALK button isn't busy with anything else (a person, a door, a chest...), it says
// TRADE: one tap (T on a computer, ✕ on a controller) asks the nearest of them to trade. If they already asked you,
// the same tap says yes. With PvP on, players who also have PvP on never get it (on a controller ✕ is also the attack
// button, so it would turn a hit into a trade request mid-fight); START > Trade still works. Uses window.SQTRREQ / SQTRNEAR / SQTRADE from 062.
(()=>{{const st=document.createElement('style');st.textContent='#tk.sqpn{font-size:11px!important;letter-spacing:0!important;line-height:1.1;text-align:center;word-break:break-all}';document.head.appendChild(st)}
 const CLOSE=34;let mine=false,who=null,t=0,lab='';
 const ok=()=>!!(window.SQTRREQ&&window.SQTRNEAR&&window.SQTRADE&&window.SQMP&&SQMP.on&&SQMP.user);
 // the nearest player within a couple of steps (the trade itself allows a little more room)
 function nearest(){if(!ok()||SQTRADE.st!=='idle'||(window.SQDUEL&&SQDUEL.st!=='idle'))return null;let best=null,bd=CLOSE;const foes=!!(window.SQPVP&&SQPVP.on);
  for(const u of SQTRNEAR()){const r=SQMP.players.get(u);if(!r||(foes&&r.pk))continue;const d=Math.hypot(r.tx-P.x,r.ty-P.y);if(d<bd){bd=d;best=u}}return best}
 const short=u=>{const r=SQMP.players.get(u),n=String((r&&r.n)||'PLAYER').toUpperCase();return n.length>8?n.slice(0,7)+'…':n};
 const pad=()=>typeof GPON!=='undefined'&&GPON,label=()=>esc(short(who))+(pad()?'<small>✕</small>':isPC?'<small>T</small>':'');
 // only the word counts: the key hint after it (T / ✕) is rewritten by the controller labels (023/124), and treating that as
 // someone else's label made the button let go and grab it again every 0.15 s (it flashed on controllers)
 const word=h=>String(h||'').split('<small')[0];
 const ask=()=>{const u=who;if(!u)return false;try{if(window.SQPLAYERMENU)SQPLAYERMENU(u);else{SQTRREQ(u);sfx('talk')}}catch(e){}return true};
 // the button is ours only while nothing else wants it: hide it before the game's own code runs each frame; if that
 // code shows it again (a person, a chest, a boat...), it's theirs, and their word goes back on it
 const giveBack=()=>{mine=false;who=null;tk.classList.remove('sqpn');if(word(tk.innerHTML)===word(lab)){let w='TALK';try{if(typeof tkLab!=='undefined'&&tkLab)w=tkLab}catch(e){}tk.innerHTML=w+(isPC?'<small>T</small>':'')}};
 const _u=upd;upd=function(dt){if(mine)tk.style.display='none';const out=_u.apply(this,arguments);
  if(mine&&(tk.style.display!=='none'||word(tk.innerHTML)!==word(lab)))giveBack();
  if(mine&&!pnOpen&&!menuOpen&&!dead)tk.style.display='flex';
  if((t-=dt)>0)return out;t=.15;
  const busy=pnOpen||menuOpen||dead||BUILD||(tk.style.display!=='none'&&!mine);
  const u=busy?null:nearest();
  if(u){who=u;lab=label();if(word(tk.innerHTML)!==word(lab))tk.innerHTML=lab;tk.classList.add('sqpn');tk.style.display='flex';mine=true}
  else if(mine){giveBack();tk.style.display='none'}
  return out};
 tk.addEventListener('touchstart',e=>{if(!mine||pnOpen||menuOpen||dead)return;e.preventDefault();e.stopImmediatePropagation();ask()},{passive:false,capture:true});
 const _t=talk;talk=function(){if(mine&&!pnOpen&&!menuOpen&&!dead&&ask())return;return _t.apply(this,arguments)};
 {const _pu=window.SQPADUSE;window.SQPADUSE=()=>!!(mine&&who)||!!(_pu&&_pu())}
 window.SQTRBTN={nearest,get on(){return mine},get who(){return who}}})();
