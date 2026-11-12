// ---- 133. Elder Rowan's chain: fixes and a second chapter ----
// Fixes: Slime Trouble / Slime Slayer count slimes only (item:'slime', counted by 048's enemyDrop hook; the any-kill
// counter in 006 only counts kill quests without an item). Night Watch is a real night: be on the quest at dusk, see the
// night through to dawn without falling ('night'). Three quests no longer repeat a village's own quest: Northern
// Supplies wants oak logs, The Ranger's Warning wolf pelts, Across the Western Sea cooked salmon. The Road East comes
// right after Gone Fishing (it's just a walk to the next town). Grandmaster asks for total level 150.
// Chapter two, between Three Villages and Grandmaster: sail to Briarwood ('visit'), finish Briarwood's and Ashfall's
// quest lines ('line', a village line by key), beat an island boss ('ib' = island bosses beaten, kept in `ibk`), then
// Grandmaster, and Legend of the Isles (all five island bosses) as the finale.
// Saves: 048 remembers finished quests by name (QDONE). A save from before this (qv 9) is turned into names with the old
// order, then the chain starts from the first quest not done (qSkip); a quest in progress keeps its progress (QHOLD).
(()=>{const QOLD9=QS.map(q=>q.n),by=n=>QS.find(q=>q.n===n);
 const set=(n,o)=>{const q=by(n);if(q)Object.assign(q,o)};
 set('Slime Trouble',{item:'slime'});set('Slime Slayer',{item:'slime'});
 set('Night Watch',{d:'Prove your grit: keep this quest from dusk until dawn and see one whole night through without falling.',type:'night',amt:1});
 set('Northern Supplies',{d:'"Frosthollow is building a longhouse before the snows." Bring 8 oak logs (Woodcutting 15) and I\'ll send them north.',item:'oaklog',amt:8,r:{g:220,xp:[1,600]}});
 set('The Ranger\'s Warning',{d:'"Torren\'s rangers need warm hoods for the night watch." Bring 4 wolf pelts (wolves hunt on the snow at night, and in Frostfang Den).',item:'pelt',amt:4,type:'give',r:{g:240,xp:[0,650]}});
 set('Across the Western Sea',{d:'"Tidewatch\'s feast day is coming, and they\'re short of salmon." Bring 4 cooked salmon (Fishing 20, Cooking 20) and I\'ll see they get there.',item:'csalmon',amt:4,r:{g:260,xp:[9,700]}});
 set('Grandmaster',{d:'Become a true master of many skills. Reach total level 150.',amt:150,r:{g:1500,xp:[7,4000]},fin:'Few have come so far. The islands will remember your name.'});
 // The Road East: right after Gone Fishing
 {const i=QS.findIndex(q=>q.n==='The Road East'),j=QS.findIndex(q=>q.n==='Gone Fishing');if(i>=0&&j>=0&&i>j+1){const[q]=QS.splice(i,1);QS.splice(j+1,0,q)}}
 const CH2=[
  {n:'Beyond the Horizon',d:'"Captains in Tidewatch talk of an island past the western reef." Take on the Western Route voyage from Sera, the Navigator in Tidewatch, and sail to Briarwood Isle.',type:'visit',item:'briarwood',amt:1,r:{g:400,xp:[9,1200]},fin:'Briarwood! I knew there was more out there.'},
  {n:'Thornbrook\'s Troubles',d:'"The people of Thornbrook on Briarwood could use a friend." Finish all of Briarwood\'s village quests.',type:'line',item:'briarwood',amt:1,r:{g:900,xp:[1,2500]},fin:'Word travels fast. Thornbrook speaks well of you.'},
  {n:'Fire Beneath the Mountain',d:'"Smoke rises from the Ashfall Coast in the east." Give your boat a reinforced hull, find the Eastern Waters, and finish all of Ashfall\'s quests.',type:'line',item:'ashfall',amt:1,r:{g:1200,xp:[10,3500]},fin:'The forge camp will be singing about you for years.'},
  {n:'The Sealed Doors',d:'"Every island hides a sealed door, and something waits behind it." Gather an island\'s sigil shards (its monsters drop them), open its door and defeat the island boss inside.',type:'ib',amt:1,r:{g:1500,xp:[0,4000]},fin:'You opened one of the old doors and lived. Remarkable.'}];
 {const gi=QS.findIndex(q=>q.n==='Grandmaster');QS.splice(gi>=0?gi:QS.length,0,...CH2)}
 QS.push({n:'Legend of the Isles',d:'"There are five sealed doors in these seas." Defeat all five island bosses: the Briar Queen, the Iron Warlord, the Frost Wyrm, the Void Herald and Black Jack.',type:'ib',amt:5,r:{g:5000,xp:[7,10000]},fin:'A legend of the isles. I\'m proud to have known you from the start.'});
 // ---- progress ----
 let IBK=new Set(),NW=0;// NW: 0 waiting for daylight, 1 seen daylight on the quest, 2 night has fallen
 const cur=()=>Q.on?QS[Q.i]:null;
 const _qv=qVal;qVal=function(q){const t=q.type;
  if(t==='night'||t==='visit')return Q.k;if(t==='line')return SQ_SIDE[q.item]&&SQ_SIDE[q.item].completed?1:0;if(t==='ib')return IBK.size;return _qv(q)};
 const done1=q=>{say('Quest updated: '+q.n+' - return to Elder Rowan.');msgT=4;sfx('quest');try{saveLocal(true)}catch(e){}};
 const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{const q=cur();if(!q){NW=0;return out}
   if(q.type==='night'&&Q.k<1){if(dead){if(NW===2){say('Night Watch: you fell. Try again tonight.');msgT=3}NW=0}else{const d=dark();
     if(NW===0&&d<.3)NW=1;else if(NW===1&&d>.6){NW=2;say('Night falls. Hold out until dawn!');msgT=3}else if(NW===2&&d<.05){Q.k=1;NW=0;done1(q)}}}
   else NW=0;
   if(q.type==='visit'&&Q.k<1&&typeof curRegion==='function'&&curRegion()===q.item){Q.k=1;done1(q)}}catch(e){}return out};
 const _se=sqEvent;sqEvent=function(type,item){try{if(type==='islandboss'&&item&&!IBK.has(item)){IBK.add(item);const q=cur();if(q&&q.type==='ib'&&IBK.size>=q.amt)setTimeout(()=>done1(q),2500)}}catch(e){}return _se.apply(this,arguments)};
 // Hollow's night slimes have no type: count them for the slime quests (048 counts the ones typed 'slime')
 const _ed=enemyDrop;enemyDrop=function(n){const out=_ed.apply(this,arguments);try{const q=cur();if(q&&q.type==='kill'&&q.item==='slime'&&n&&!n.type&&!n._rp){Q.k++;if(Q.k===q.amt)done1(q)}}catch(e){}return out};
 // ---- saves ----
 const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);s.qv=10;s.ibk=[...IBK];return s};
 const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);try{IBK=new Set(Array.isArray(S&&S.ibk)?S.ibk.filter(k=>typeof k==='string').slice(0,10):[]);NW=0;
   if(S&&S.q&&(S.qv|0)===9){const i=Math.max(0,Math.min(QOLD9.length,+S.q.i||0)),name=QOLD9[i];
    for(const n of QOLD9.slice(0,i))QDONE.add(n);
    if(name&&Q.on){const was=by(name);QHOLD={n:name,on:true,k:was&&(was.type==='night'||was.type==='visit')?0:Q.k}}
    Q.i=0;Q.on=false;Q.k=0;qSkip();if(QHOLD&&QS[Q.i]&&QS[Q.i].n!==QHOLD.n){Q.on=false;Q.k=0}}
   Q.i=Math.max(0,Math.min(QS.length,Q.i))}catch(e){console.warn(e)}return out};
 const _ng=newGame;newGame=function(){const out=_ng.apply(this,arguments);IBK=new Set();NW=0;return out};
 window.SQCH2={get ibk(){return IBK},get nw(){return NW},QOLD9}})();
