// ---- 180. Dev Suite publishes reach players without restarting ----
// 111a fetched assets/live once, 0.4 s after the game started, so players only saw a publish after closing and reopening
// the game. Now the game watches the published version number assets/live/v: a realtime listener once Firebase is up
// (instant), plus a small fetch of v.json every 30 s and whenever the tab comes back (works signed out too). When v
// differs from the copy in use, SQA.refresh() fetches the whole library and applies it in place (111a's apply: sprites,
// stats, islands except the one you're on, pets, props, content...), then testers re-check their test copy (168).
(()=>{if(!window.SQA)return;const URL='https://skillquest-913e2-default-rtdb.firebaseio.com/assets/live/v.json';
 const cur=()=>(SQA.live&&SQA.live.v)|0;let busy=false,lastV=null,sub=false,told=-1e9;
 async function seen(v){v=v|0;if(!v||v===lastV&&v===cur())return;lastV=v;if(v===cur()||busy)return;busy=true;
  try{const before=cur();await SQA.refresh();const now=cur();
   if(now!==before&&now===v){try{if(window.SQBETA)SQBETA.check()}catch(e){}
    if(before&&performance.now()-told>20000&&!(window.SQSUITE&&SQSUITE.state&&SQSUITE.state.open)){told=performance.now();
     try{if(typeof SQTITLE!=='function'||!SQTITLE()){say('✨ The world was just updated with new things from the developers. Have a look around!');try{mpLog('game','The world was just updated with new content.')}catch(e){}}}catch(e){}}}}
  catch(e){}finally{busy=false}}
 async function poll(){if(document.hidden)return;try{const r=await fetch(URL+'?t='+Date.now(),{cache:'no-store'});if(r.ok)seen(await r.json())}catch(e){}}
 setInterval(poll,30000);setTimeout(poll,5000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll()});addEventListener('focus',poll);
 // realtime once the database is connected
 const t=setInterval(()=>{const F=window.SQFB;if(sub||!F||!F.db||!F.D)return;sub=true;clearInterval(t);
  try{F.db.onValue(F.db.ref(F.D,'assets/live/v'),s=>seen(s.val()),()=>{})}catch(e){sub=false}},2000);
 window.SQLIVEUPD={poll,seen}})();
