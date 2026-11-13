// ---- 159. Fixes from the Nov 13 audit ----
// - Sound in the background: the music (014) is scheduled by a timer that browsers slow to about once a second in a
//   background tab, so it kept playing as stray fragments (rain too). The audio now pauses while the page is hidden and
//   comes back when you return.
// - Keyboard players: the audio only woke up on a tap or click (006's ac()); a key press counts too now, so music starts
//   for someone who only uses the keyboard.
// - Backyards and courtyards (145) are outdoors: they play the day/night music, not the house tune (014's wantSong
//   treats every scene as indoors; 049 does the same fix for the islands).
(()=>{let paused=false;
 document.addEventListener('visibilitychange',()=>{try{if(!ACX)return;if(document.hidden){if(ACX.state==='running'){paused=true;ACX.suspend()}}
   else if(paused){paused=false;ACX.resume()}}catch(e){}});
 addEventListener('keydown',e=>{if(e.isTrusted&&!document.hidden)try{ac()}catch(_){}},{capture:true});
 {const _ws=wantSong;wantSong=function(){const R=SCENE&&SCENE.room;if(R&&(R.yard||R.court))return dark()>.4?'night':'day';return _ws.apply(this,arguments)}}})();
