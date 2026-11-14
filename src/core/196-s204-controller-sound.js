// ---- 204. Sound for controller players ----
// Browsers keep a page silent until a click, tap or key press (006's ac() resumes ACX on touchstart/pointerdown, 153 on
// keydown), and a controller button doesn't count. Someone who only uses a controller never woke the audio.
// - Every newly pressed controller button calls ac() (enough where the browser allows it: the Windows app, or after any
//   earlier click/key).
// - If the audio is still asleep while a controller is in use, a small bar asks for one click or key press (#sqsnd); any
//   trusted pointer/key event resumes and hides it. Not shown while muted (MUTE) or with music and sounds both off.
(()=>{const bar=document.createElement('div');bar.id='sqsnd';bar.setAttribute('role','button');bar.tabIndex=0;
 bar.textContent='🔇 Your browser keeps the game silent until you click or press a key once. Click here for sound.';
 const st=document.createElement('style');st.textContent='#sqsnd{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 8px);transform:translateX(-50%);z-index:9998;display:none;max-width:min(92vw,560px);padding:9px 14px;background:#fff8e6;color:#3a2a18;border:3px solid #3a2a18;box-shadow:0 3px 0 #3a2a18;font:600 14px/1.35 system-ui,sans-serif;cursor:pointer;text-align:center}';
 document.head.appendChild(st);document.body.appendChild(bar);
 const wake=()=>{try{ac()}catch(e){}};
 bar.addEventListener('click',e=>{e.stopPropagation();wake();bar.style.display='none'});
 for(const ev of['pointerdown','keydown','touchstart'])addEventListener(ev,e=>{if(e.isTrusted&&!document.hidden){wake();if(bar.style.display!=='none')setTimeout(chk,50)}},{capture:true,passive:true});
 const asleep=()=>{try{const a=ac();return !!a&&a.state!=='running'}catch(e){return false}};
 const wanted=()=>!(typeof MUTE!=='undefined'&&MUTE)&&!((typeof MUSIC!=='undefined'&&!MUSIC)&&(typeof SFXV==='number'&&SFXV<=0));
 let since=0;function chk(){const show=GPON&&!document.hidden&&wanted()&&asleep();if(!show){since=0;bar.style.display='none';return}
  if(!since)since=performance.now();if(performance.now()-since>1500)bar.style.display='block'}
 // a newly pressed button wakes the audio where that's allowed
 let PREV=[];{const _pp=pollPad;pollPad=function(dt){const out=_pp.apply(this,arguments);try{const gp=GPI!=null?navigator.getGamepads()[GPI]:null;
   if(gp){const now=gp.buttons.map(b=>!!b.pressed);if(now.some((p,i)=>p&&!PREV[i]))wake();PREV=now}}catch(e){}return out}}
 setInterval(chk,500);window.SQPADSND={chk,asleep}})();
