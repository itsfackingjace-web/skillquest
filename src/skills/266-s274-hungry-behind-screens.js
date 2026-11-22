// ---- 274. Skilling behind a screen uses food (window.SQSCREENFOOD) ----
// Nov 21 (sniffynose's report and snitzler in #bugs: "if your in your menu or skills ... ur food doesint go down ... so u can just
// forever"): an open screen (pnOpen) pauses the world (004's step skips the frame), but fishing and make-alls carry on behind it
// (109's SQDO, 007's FISH), so leaving a screen open let you skill for hours on a full stomach. Now, while a screen is open and you're
// skilling, food drains at the usual rate, and when it runs out the skilling stops ("too hungry"), as in a background tab (244).
// Still free: indoors in a house or castle (148), next to a real campfire with Hearthkeeper (087), and anything while not skilling.
// No starving damage while paused (the world is paused); gear that slows the drain (179's "hun") counts.
(()=>{const indoors=()=>!!(SCENE&&SCENE.id==='home'&&SCENE.house&&!SCENE.yardOf);
 const hearth=()=>{try{if(!(typeof perk==='function'&&perk(5,'fi_hearth')))return false;window.SQFIREONLY=1;try{return!!nearFire(P.x,P.y,50)}finally{window.SQFIREONLY=0}}catch(e){self.SQERR&&SQERR(e,'266-1');return false}};
 const skilling=()=>!!(window.SQDO||(typeof FISH!=='undefined'&&FISH));
 SQUPD.after('266 hungry behind screens',dt=>{if(!pnOpen||dead||typeof hunger!=='number'||!(dt>0)||!skilling())return;
  if(indoors()||hearth())return;
  let rate=.9*(typeof FOOD_RATE==='number'?FOOD_RATE:.25);
  try{const G=window.SQGEAR,hu=G&&G.fxSum?+G.fxSum('hun')||0:0;if(hu>0)rate*=1-Math.min(90,hu)/100}catch(e){self.SQERR&&SQERR(e,'266-2')}
  hunger=Math.max(0,hunger-dt*rate);if(hunger>0)return;
  let was=false;try{if(window.SQDO){SQDO=null;was=true}if(typeof FISH!=='undefined'&&FISH){FISH=null;was=true}}catch(e){self.SQERR&&SQERR(e,'266-3')}
  if(was)try{say('You were too hungry to keep going. Eat something!');msgT=8}catch(e){self.SQERR&&SQERR(e,'266-4')}});
 window.SQSCREENFOOD={indoors,hearth,skilling}})();
