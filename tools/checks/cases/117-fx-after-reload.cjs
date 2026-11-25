// Nov 24 (Jace: "I'm still not seeing my son actually swing his axe"): fx/<uid> events were numbered from 1 in every session and the
// others ignored any number at or below the highest they had seen, so after someone reloaded (e.g. for an update) their swings, arrows,
// spells, ultimates and chops were ignored by everyone who had seen them before. Now the count starts at the clock and a new record
// (number or time) is a new event.
module.exports={name:'after a player reloads, the others still see their swings and chops',players:2,async run([A,B],t){
 const W=ms=>A.waitForTimeout(ms);
 const pos=await A.evaluate(()=>({x:P.x,y:P.y}));await B.evaluate(p=>{P.x=p.x+30;P.y=p.y+4},pos);
 const ids=[await A.evaluate(()=>SQMP.user.uid),await B.evaluate(()=>SQMP.user.uid)];
 let met=false;for(let i=0;i<80&&!met;i++){met=await A.evaluate(u=>!!SQMP.players.get(u),ids[1])&&await B.evaluate(u=>!!SQMP.players.get(u),ids[0]);if(!met)await W(300)}
 if(!met)return t(false,'the two players never saw each other');
 await B.evaluate(()=>{const f=SQFXH.tl;window.__tl=0;SQFXH.tl=function(){window.__tl++;return f.apply(this,arguments)}});
 const seq=await A.evaluate(()=>SQPVP.fxSeq);t(seq>1e12,'a session numbers its events from the clock ('+seq+')');
 // (a slow start can leave a screen up for a moment: try again, and say what was in the way)
 const chop=async()=>{let r=null;for(let k=0;k<10;k++){r=await A.evaluate(()=>{try{if(pnOpen)closePanel()}catch(e){}en=[];TL.axe=3;XPS[1]=XT[69];face=[0,-1];const[fx,fy]=front(13),i=Math.floor(fy/16)*N+Math.floor(fx/16);obj[i]={t:'yew',hp:9999};swing=0;ACTN=null;attack();
   return ACTN&&ACTN.type==='chop'?'chop':JSON.stringify({menu:menuOpen,pn:pnOpen,dead,scene:!!SCENE,fish:!!FISH,build:!!BUILD,npc:!!facingNpc(),swing})});if(r==='chop')return r;await A.waitForTimeout(500)}return r};
 const got=async n=>{for(let i=0;i<20;i++){if(await B.evaluate(()=>window.__tl)>=n)return true;await W(250)}return false};
 t.eq(await chop(),'chop','Ann chops');t(await got(1),'Bob sees her chop');
 // Ann reloads with an older copy of the game (its count starts again at 1) and chops again
 await A.waitForTimeout(400);await A.evaluate(()=>{SQPVP.fxSeq=0});await chop();t(await got(2),'Bob still sees her chop after her count started again');
 await A.waitForTimeout(400);await chop();t(await got(3),'and the next one')}};
