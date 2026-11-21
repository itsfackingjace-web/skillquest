// ---- 251. Outlaw Country: a quest line through No Man's Land and its PvP (window.SQOUTLAW) ----
// Mira at Dusthaven's Oasis Rest hands out bounties that send you into No Man's Land, the lawless desert island where PvP is always
// on. A village quest line (042's SIDE_QS, line key `nomans`), even though Mira lives in Dusthaven: her NPC keeps town 'dusthaven' (that
// line has no quests from her), and 042's sideCard / sideAct / sqMark are wrapped to use the `nomans` line for her.
// New progress types (042's sqEvent(type,item)):
//   nmlm      'any'   reach a No Man's Land landmark you haven't reached for this quest (`SQ_SIDE.nomans.seen`)
//   kill      'bandit' bandits beaten on No Man's Land
//   nmmine    'any'   rocks or ores mined on No Man's Land (Mining XP gained there)
//   nmdeliver 'sat'   arrive at Dustwater with Mira's satchel (`nmsatchel`, given when you accept; if you lose it, Mira gives
//                     you another when you talk to her)
//   nmpvp     'any'   players you defeat on No Man's Land (064 calls SQPVKO(uid) on a KO)
//   islandboss 'nomans' Black Jack, the Outlaw King (100's sqEvent)
(()=>{if(typeof SIDE_QS==='undefined'||typeof SQ_SIDE==='undefined')return;
 const T='nomans',GIVER='mira',D=()=>SKN.indexOf('Defence')>=0?SKN.indexOf('Defence'):0;
 SQ_SIDE[T]={index:0,on:false,k:0,completed:false};SQTOWN[T]='Dusthaven\'s Oasis Rest';
 // 049 only counts a line's progress in its own region
 try{SQ_REGION[T]='nomans'}catch(e){self.SQERR&&SQERR(e,'243-0')}
 (window.SQGIVERAREA=window.SQGIVERAREA||{})[T]='hollow';// Mira is in Dusthaven, on Hollow Island (102's tracker)
 SIDE_QS[T]=[
  {n:'Scout the Badlands',d:'Reach three places in No Man\'s Land: Deadman\'s Gulch, Boot Hill, Dustwater, Rattlesnake Mesa or the Old Silver Mine.',type:'nmlm',item:'any',amt:3,r:{g:400,xp:[0,900]},giver:GIVER,
   start:'There\'s a desert across the sea with no law at all. Everyone fights everyone out there. Go have a look around, if you\'ve got the nerve.',finish:'You came back! Most don\'t, the first time.',note:'PvP is always on in No Man\'s Land: other players can attack you there.'},
  {n:'Bandit Bounty',d:'Defeat 12 bandits in No Man\'s Land.',type:'kill',item:'bandit',amt:12,r:{g:700,xp:[0,1400]},giver:GIVER,
   start:'The bandits out there rob every caravan that leaves Dustwater. Twelve of them. That\'s the bounty.',finish:'Twelve! The caravans will be singing your name.'},
  {n:'Dead Man\'s Delivery',d:'Carry Mira\'s satchel to Dustwater, the ghost town in No Man\'s Land, then come back to her. If you fall, you lose it.',type:'nmdeliver',item:'sat',amt:1,r:{g:1000,xp:[-1,1600]},giver:GIVER,
   start:'This satchel has to reach the old saloon in Dustwater. Don\'t open it, and don\'t let anyone take it off your body.',finish:'Delivered and back in one piece. I knew I could count on you.'},
  {n:'Silver Fever',d:'Mine 30 rocks or ores in No Man\'s Land.',type:'nmmine',item:'any',amt:30,r:{g:1100,xp:[2,2600]},giver:GIVER,req:[2,25],
   start:'Folk say the hills out there are still full of silver. Prove it: dig, and watch your back while you do.',finish:'Your hands are raw, but your pockets are full. Fair trade.'},
  {n:'Blood on the Sand',d:'Defeat 2 players in No Man\'s Land.',type:'nmpvp',item:'any',amt:2,r:{g:2500,xp:[0,3500]},giver:GIVER,req:[0,30],
   start:'Out there, the only law is who\'s still standing. Show them it\'s you. Twice.',finish:'Remind me never to get on your bad side.',note:'Any fight against another player on No Man\'s Land counts, duels too.'},
  {n:'The Outlaw King',d:'Defeat Black Jack, the Outlaw King, in the Old Silver Mine.',type:'islandboss',item:'nomans',amt:1,r:{g:3500,xp:[0,4500]},giver:GIVER,
   start:'Black Jack runs every bandit on that island from the Old Silver Mine. End him, and the desert is ours.',finish:'The Outlaw King is gone. Dusthaven will never forget you.',note:'Attack 40 recommended. Bring friends, and watch out for other players.'}];
 // the reward's skill -1 = Defence (its index is only known at run time)
 for(const q of SIDE_QS[T])if(q.r.xp[0]<0)q.r.xp[0]=D();
 const inNML=()=>{try{return curRegion()==='nomans'&&!dead}catch(e){return false}};
 const cur=()=>{const s=SQ_SIDE[T];return s&&s.on?sqCur(T):null};
 // ---- Mira hosts this line ----
 const asLine=n=>Object.assign({},n,{town:T});
 {const _c=sideCard;sideCard=function(n){let h=_c.apply(this,arguments);if(n&&n.id===GIVER){satchel();h+=_c.call(this,asLine(n))}return h}}
 {const _a=sideAct;sideAct=function(a,n){if(n&&n.id===GIVER){const q=sqCur(T),s=SQ_SIDE[T],was=s.on;const r=_a.call(this,a,asLine(n));
    if(a==='accept'&&!was&&s.on){s.seen=[];if(q&&q.type==='nmdeliver'){inv.nmsatchel=1;say('Mira hands you a heavy leather satchel.')}}
    if(a==='done'&&!s.on){delete s.seen;inv.nmsatchel=0}return r}return _a.apply(this,arguments)}}
 {const _m=sqMark;sqMark=function(n){const m=_m.apply(this,arguments);if(m||!n||n.id!==GIVER)return m;return _m.call(this,asLine(n))}}
 // a lost satchel: Mira gives you another when you talk to her
 function satchel(){const q=cur();if(q&&q.type==='nmdeliver'&&SQ_SIDE[T].k<1&&(inv.nmsatchel|0)<1){inv.nmsatchel=1;say('"You lost it? Here, take another. Be more careful this time."');msgT=4}}
 // the satchel item
 INAME.nmsatchel='Mira\'s satchel';IDESC.nmsatchel='A heavy leather satchel for the old saloon in Dustwater (No Man\'s Land). Don\'t open it.';SN.nmsatchel='Mira\'s satchels';SELLP.nmsatchel=0;
 try{SHORT.nmsatchel='satchel'}catch(e){self.SQERR&&SQERR(e,'243-1')}if(!INVK.includes('nmsatchel'))INVK.push('nmsatchel');if(!EXTRA_BAG.includes('nmsatchel'))EXTRA_BAG.push('nmsatchel');
 {SQICON.wrap('243 satchel',next=>function(k,col){if(k!=='nmsatchel')return next.apply(this,arguments);
   const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d'),R=(a,b,w,h,f)=>{x.fillStyle=f;x.fillRect(a,b,w,h)};
   R(3,5,10,9,'#181018');R(4,6,8,7,'#8a5a30');R(4,6,8,2,'#a8743c');R(5,3,6,3,'#181018');R(6,4,4,1,'#6a4224');R(7,8,2,2,'#e0b030');return c.toDataURL()})}
 // ---- progress ----
 // landmarks reached (each counts once per quest)
 let lmT=0;{SQUPD.after('243 outlaw country',dt=>{if((lmT-=dt)>0)return;lmT=.5;const q=cur();if(!q||!inNML())return;const R=SCENE&&SCENE.room;if(!R||!R.lms)return;const s=SQ_SIDE[T];
   for(const l of R.lms){if(Math.hypot(P.x-(l.x*16+8),P.y-(l.y*16+8))>56)continue;
    if(q.type==='nmlm'&&l.id!=='oasis'){s.seen=s.seen||[];if(!s.seen.includes(l.id)){s.seen.push(l.id);sqEvent('nmlm','any');try{saveLocal(true)}catch(e){self.SQERR&&SQERR(e,'243-2')}}}
    if(q.type==='nmdeliver'&&l.id==='dustwater'&&(inv.nmsatchel|0)>0&&s.k<1){inv.nmsatchel=0;sqEvent('nmdeliver','sat');say('You leave the satchel on the saloon\'s bar. Back to Mira!');msgT=4;try{saveLocal(true)}catch(e){self.SQERR&&SQERR(e,'243-3')}}}})}
 // bandits beaten on No Man's Land
 SQDROP.after('243',n=>{if(n&&n.type==='bandit'&&inNML()){sqEvent('kill','bandit',t=>t===T);try{saveLocal(true)}catch(e){self.SQERR&&SQERR(e,'243-4')}}});
 // rocks and ores mined there (Mining XP gained on No Man's Land)
 SQADDXP.after('243',(i,x)=>{if(i===2&&x>0&&inNML()){const q=cur();if(q&&q.type==='nmmine')sqEvent('nmmine','any')}});
 // players defeated there
 window.SQPVKO=u=>{if(!inNML())return;sqEvent('nmpvp','any');try{saveLocal(true)}catch(e){self.SQERR&&SQERR(e,'243-5')}};
 // the line's extra field (`seen`) is saved with sideQuests by 042; make sure it loads back as a list
 SQLOAD.after('243',S=>{const v=S&&S.sideQuests&&S.sideQuests[T];const s=SQ_SIDE[T];if(v&&Array.isArray(v.seen))s.seen=v.seen.filter(x=>typeof x==='string').slice(0,10);else delete s.seen});
 window.SQOUTLAW={T,GIVER,satchel}})();
