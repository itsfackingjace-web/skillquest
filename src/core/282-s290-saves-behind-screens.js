// ---- 290. Saves keep going behind screens (Nov 26, Joe: "I saved and quit [on my phone] and got on my PC within 2 minutes ... everything
// reverted back at least 1 hour") ----
// 006 saves this device every 3 s and the account every 15 s from a step on the frame (UPD), and the frame stops while a screen or the
// START menu is open. Fishing, brewing and make-alls go on behind screens, so an hour of that could reach neither save; anything that then
// closed the game without the page-hide save (an iPhone dropping the app, a crash) lost it all, and another device loaded the old save.
// When 006's timer hasn't moved for 5 s, this does its saves instead (the same unforced saves: nothing is written when nothing changed).
(()=>{let last=null,seen=performance.now(),cloudAt=0;
 setInterval(()=>{try{if(typeof cloudT==='undefined')return;const now=performance.now();
   if(cloudT!==last){last=cloudT;seen=now;return}// the frame's own timer is running
   if(now-seen<5000||dead)return;seen=now;saveLocal();if(now-cloudAt>=15000){cloudAt=now;saveCloud()}
   window.SQBGSAVE.n++}catch(e){self.SQERR&&SQERR(e,'290-1')}},1000);
 window.SQBGSAVE={n:0}})();
