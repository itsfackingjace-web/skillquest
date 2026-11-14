// ---- 198. Leaderboards in the START menu ----
// 068's leaderboard overlay (#sqlb, lbOpen/lbClose, SQLB.open) was only reachable from the title and chat. This adds a
// "Leaderboards" item after Achievements. While it is open the game is paused (pnOpen held true); closing it goes back to
// the menu when it was opened from there (like backScreen).
(()=>{if(typeof SMI==='undefined'||typeof lbOpen!=='function')return;let OURS=false,FROM=false;
 const at=SMI.findIndex(x=>x.id==='achievements');SMI.splice(at>=0?at+1:SMI.findIndex(x=>x.id==='options'),0,{id:'leaderboard',l:()=>'Leaderboards'});
 {const _ss=showScreen;showScreen=function(id){if(id!=='leaderboard')return _ss.apply(this,arguments);
   FROM=typeof fromMenu!=='undefined'&&fromMenu;try{if(typeof smOpen!=='undefined'&&smOpen)closeSM()}catch(e){}
   pnOpen=true;jx=jy=0;OURS=true;lbOpen()}}
 setInterval(()=>{if(!OURS||!window.SQLB)return;
  if(SQLB.open){pnOpen=true;return}
  OURS=false;if(FROM){FROM=false;try{fromMenu=false}catch(e){}if(!dead&&!menuOpen){openSM();return}}
  if(pn.style.display==='none'&&!(typeof smOpen!=='undefined'&&smOpen))pnOpen=false},100);
 window.SQMENULB={get open(){return OURS}}})();
// Landscape phones (short screens): the START menu's 20 items in two columns ran off the bottom (Options, Save & quit
// and Exit couldn't be reached). Three tighter columns there, and the menu scrolls if it still doesn't fit.
(()=>{const st=document.createElement('style');st.textContent=
 '#sm{max-height:calc(100dvh - 20px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));overflow-y:auto;scrollbar-width:none}#sm::-webkit-scrollbar{display:none}'+
 '@media (max-height:520px) and (min-width:560px){#sm{width:min(600px,calc(100vw - 20px))}#sm button{width:33.333%;font-size:16px!important;padding:6px 4px 6px 24px!important}#sm button.on::before{left:8px}}';
 document.head.appendChild(st)})();
