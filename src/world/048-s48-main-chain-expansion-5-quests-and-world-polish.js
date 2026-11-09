// ---------------------------------------------------------------- 48. Main-chain expansion (5 quests) and world polish
// Five quests join Elder Rowan's chain (now 25): Northern Supplies and The Ranger's Warning after Into the Cold,
// Desert Provisions after Green Thumb, Across the Western Sea after The Road East, and Three Villages, One Island before
// Grandmaster (a new 'village' objective: finish all three village quest lines). Kill quests can now name an enemy
// (The Ranger's Warning counts wolves only; the old slime quests still count every kill).
// Old saves keep their progress: the chain remembers quests by name, so a player who is already past an insertion
// point is sent to the new quest they missed, and when it's done the chain skips everything they had already finished.
// A quest that was in progress when this happened keeps its progress for when the chain comes back to it.
const QOLD8=QS.map(q=>q.n);
const QNEW=[
 ['Into the Cold',{n:'Northern Supplies',d:'"Frosthollow needs timber before the next snowfall." Bring 15 wood for the lumber village up the stone trail north of here.',type:'give',item:'wood',amt:15,r:{g:180,xp:[1,450]},fin:'Excellent work. Their hearths will stay warm.'}],
 ['Northern Supplies',{n:'The Ranger\'s Warning',d:'"Torren reports wolves gathering along the mountain road." Defeat 8 wolves (they hunt on the snow at night, and in Frostfang Den).',type:'kill',item:'wolf',amt:8,r:{g:220,xp:[0,600]},fin:'That should make the northern trail safer.'}],
 ['Green Thumb',{n:'Desert Provisions',d:'"Travelers heading toward Dusthaven need provisions." Bring 5 bread (bake wheat at a campfire or stove, or buy it).',type:'give',item:'bread',amt:5,r:{g:200,xp:[4,550]},fin:'A fine meal makes a difficult journey easier.'}],
 ['The Road East',{n:'Across the Western Sea',d:'"Tidewatch could use a little help with its fishing." Catch 5 trout (Fishing 10) for the village on the western shore.',type:'give',item:'trout',amt:5,r:{g:180,xp:[9,500]},fin:'Those fish will make a fine supper.'}]];
for(const[after,q]of QNEW){const i=QS.findIndex(o=>o.n===after);QS.splice(i>=0?i+1:QS.length-1,0,q)}
{const gi=QS.findIndex(q=>q.n==='Grandmaster');QS.splice(gi>=0?gi:QS.length,0,{n:'Three Villages, One Island',d:'"Hollow Island is growing. Its villages need someone they can trust." Complete the quest lines of Frosthollow (north), Dusthaven (south) and Tidewatch (west).',type:'village',amt:3,r:{g:750,xp:[7,1800]},fin:'You\'ve become a friend to every corner of this island.'})}
function villageQuestProgress(){return['frosthollow','dusthaven','tidewatch'].filter(id=>SQ_SIDE[id]&&SQ_SIDE[id].completed).length}
const _qv48=qVal;qVal=function(q){return q.type==='village'?villageQuestProgress():_qv48(q)};
// kills: a quest that names an enemy only counts that enemy (wolves include snow wolves)
const _ed48=enemyDrop;enemyDrop=function(n){_ed48(n);const q=QS[Q.i];if(Q.on&&q&&q.type==='kill'&&q.item&&n.type===q.item){Q.k++;if(Q.k===q.amt){say('Quest updated: '+q.n+' - return to Elder Rowan.');msgT=3;sfx('quest')}saveLocal(true)}};
// finished quests by name, so the chain can skip what an old save already did
var QDONE=new Set(),QHOLD=null;
function qSkip(){while(QS[Q.i]&&QDONE.has(QS[Q.i].n))Q.i++;if(QHOLD&&QS[Q.i]&&QS[Q.i].n===QHOLD.n){Q.on=QHOLD.on;Q.k=QHOLD.k;QHOLD=null}}
const _qa48=questAct;questAct=function(a){const i0=Q.i,q=QS[Q.i];_qa48(a);if(Q.i!==i0&&q){QDONE.add(q.n);if(q.fin){TALKQ=q.fin;say('Quest complete: '+q.n+'! "'+q.fin+'"');msgT=5}qSkip();saveNow();rPn()}else if(a==='acc')saveNow()};
const _sn48=snap;snap=function(){const s=_sn48();s.qv=9;s.qdone=[...QDONE];if(QHOLD)s.qhold={...QHOLD};return s};
const _ap48=applySave;applySave=function(S){_ap48(S);QDONE=new Set();QHOLD=null;if(!S.q)return;
 if((S.qv||0)<9){// Q.i is an index into the 20-quest chain: turn it into names, then find the first quest not yet done
  const done=QOLD8.slice(0,Math.min(Q.i,QOLD8.length));if(GMDONE||Q.i>=QOLD8.length)done.push('Grandmaster');for(const n of done)QDONE.add(n);
  const cur=QOLD8[Q.i];if(cur&&Q.on)QHOLD={n:cur,on:true,k:Q.k};Q.i=0;Q.on=false;Q.k=0;qSkip();if(QHOLD&&QS[Q.i]&&QS[Q.i].n!==QHOLD.n){Q.on=false;Q.k=0}}
 else{if(Array.isArray(S.qdone))for(const n of S.qdone)if(typeof n==='string'&&QS.some(q=>q.n===n))QDONE.add(n);if(S.qhold&&typeof S.qhold.n==='string')QHOLD={n:S.qhold.n,on:!!S.qhold.on,k:Math.max(0,+S.qhold.k||0)}}
 Q.i=Math.max(0,Math.min(QS.length,Q.i))};
const _ng48=newGame;newGame=function(){QDONE=new Set();QHOLD=null;_ng48()};
// the quest list shows finished quests by name (an old save may have done later ones before an earlier new one)
const _qh48=questsHTML;questsHTML=function(){const full=_qh48(),cut=full.indexOf('<div class="tl" style="margin-top:14px">'),side=cut>=0?full.slice(cut):'';
 let h='<div class="tl">Quest points: '+Q.qp+' / '+QS.length+'</div>';
 QS.forEach((q,i)=>{if(i<Q.i||QDONE.has(q.n))h+='<div class="qrow qd">✓ '+q.n+'</div>';
  else if(i===Q.i)h+='<div class="qc"><b>▶ '+q.n+'</b><p>'+q.d+'</p><p>'+(Q.on?'Progress: '+qProg(q)+(qDone(q)?' - return to Elder Rowan!':''):'Talk to Elder Rowan to start this quest.')+'</p><p class="qr">Reward: '+rewardTxt(q)+'</p></div>';
  else h+='<div class="qrow qx">? ? ?</div>'});
 if(Q.i>=QS.length)h+='<div class="qc"><b>Every quest complete!</b></div>';return h+side};
// ---- polish ----
// shop prices: iron nails sell for 24 gold, so buying them for 12 would be free money; the villages charge 30
for(const S of[FHSHOP.fh_pine,FHSHOP.fh_work,DHSHOP.dh_forge,TWSHOP.tw_post])for(const it of S.items)if(it[0]==='nails')it[2]=30;
// a signpost by the Elder pointing to every settlement
{const cand=[];for(let y=VY-1;y<=VY+5;y++)for(let x=VX-6;x<=VX+6;x++){const i=y*N+x;if(tile[i]!==2||obj[i]||BS.has(i)||STR.has(i))continue;let road=false;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])if(tile[(y+b)*N+x+a]===1)road=true;if(!road)continue;if(NPCS.some(n=>!n.scene&&Math.abs(n.x/16-x)<1.5&&Math.abs(n.y/16-y)<1.5))continue;cand.push([Math.hypot(x-VX+2,y-VY-2),i])}
 cand.sort((a,b)=>a[0]-b[0]);if(cand.length){const i=cand[0][1];SIGNS.set(i,'HOLLOW VILLAGE. North: Frosthollow (snow, wolves, Frostfang Den). South: Dusthaven (desert, Scorpion Hollow). West: Tidewatch (the sea, the Drowned Grotto). East: Saltmere (the port).');BS.add(i);PROT.add(i)}}
// biome touches: snowmen in Frosthollow, clay pots in Dusthaven, crates and barrels on the Tidewatch dock
const DECO48=[];
{const put=(x,y,t)=>{const i=y*N+x;if(tile[i]===0||BS.has(i)||obj[i]||FHPATH.has(i)||DHPATH.has(i)||TWPATH.has(i)||BRIDGE.has(i)||ROADS.has(i))return;BS.add(i);PROT.add(i);DECO48.push([x,y,t])};
 if(FHON)for(const[dx,dy]of[[-8,-1],[9,-1]])put(FX+dx,FY+dy,'snowman');
 if(DHON)for(const[dx,dy]of[[-3,-2],[3,-2],[2,-3]])put(DX+dx,DY+dy,'pot');
 if(TWON&&TWDOCK.length){const top=TWDOCK[0],px=top%N,py=(top/N)|0;for(const[dx,dy,t]of[[-1,-1,'crate'],[1,-1,'barrel'],[-2,-1,'barrel'],[2,-2,'crate']])put(px+dx,py+dy,t)}}
function drawDeco48(x,y,t,tm){const px=x*16,py=y*16;
 if(t==='snowman'){shd(px+8,py+15,14);for(const[r,cy]of[[6,11],[4.5,3],[3.4,-3.5]]){g.fillStyle=O;g.beginPath();g.arc(px+8,py+cy,r+1,0,6.283);g.fill();g.fillStyle='#f4f8fc';g.beginPath();g.arc(px+8,py+cy,r,0,6.283);g.fill();g.fillStyle='#d8e2ee';g.fillRect(px+8-r*.6,py+cy+r*.4,r*1.2,1)}
  Rg(px+6,py-5,1,1,O);Rg(px+9,py-5,1,1,O);Rg(px+8,py-3.5,3,1,'#f08830');Rg(px+4,py-8,8,2,O);Rg(px+5,py-12,6,4,O);Rg(px+5,py+1,6,1.5,'#d83838');for(const k of[3,5])Rg(px+7.5,py+k,1,1,O)}
 else if(t==='pot'){shd(px+8,py+15,12);g.fillStyle=O;g.beginPath();g.ellipse(px+8,py+9,6,6,0,0,6.283);g.fill();g.fillStyle='#c86a3a';g.beginPath();g.ellipse(px+8,py+9,5,5,0,0,6.283);g.fill();Rg(px+5,py+2,6,2,O);Rg(px+5.5,py+2.5,5,1,'#e08a54');Rg(px+4,py+9,8,1,'#f0c890');Rg(px+6,py+6,1,2,'#e8a070')}
 else if(t==='crate'){shd(px+8,py+15,15);Rg(px+1,py+1,14,14,O);Rg(px+2,py+2,12,12,'#a87840');Rg(px+2,py+2,12,2,'#c89858');Rg(px+2,py+8,12,1,'#7a5228');Rg(px+7,py+2,1,12,'#7a5228')}
 else{shd(px+8,py+15,13);Rg(px+2,py,12,15,O);Rg(px+3,py+1,10,13,'#8a5a30');Rg(px+3,py+3,10,1,'#5a5a66');Rg(px+3,py+10,10,1,'#5a5a66');Rg(px+3,py+1,10,1,'#a87040')}}
const _lh48=LHOOK;LHOOK=(L,x0,y0,x1,y1,tm)=>{_lh48(L,x0,y0,x1,y1,tm);for(const[x,y,t]of DECO48)if(x>=x0-2&&x<=x1+2&&y>=y0-2&&y<=y1+3)L.push([(y+1)*16-2,4,()=>drawDeco48(x,y,t,tm)])};
// music: each new dungeon has its own theme, and a new song fades in instead of cutting in
SONGS.icecave={bpm:70,lead:'B4 - - D5 - - F#5 - E5 - - - D5 - B4 - - - A4 - - B4 - - D5 - C#5 - - - - - - -',bass:'B1 - - - F#2 - - - B1 - - - F#2 - - - G1 - - - D2 - - - F#1 - - - C#2 - - -'};
SONGS.sandcave={bpm:96,lead:'E5 - F5 E5 - D5 - C5 - B4 - C5 - D5 - - E5 - - G5 F5 E5 - D5 - E5 - - - - - -',bass:'E2 - - - B2 - - - E2 - - - B2 - - - A1 - - - E2 - - - B1 - - - E2 - - -'};
SONGS.seacave={bpm:76,lead:'G4 - B4 - D5 - - - C5 - B4 - A4 - - - G4 - B4 - E5 - D5 - C5 - - - B4 - - -',bass:'E2 - - - B2 - - - C2 - - - G2 - - - A1 - - - E2 - - - B1 - - - F#2 - - -'};
for(const k of['icecave','sandcave','seacave'])PARSED[k]={bpm:SONGS[k].bpm,lead:parseTrack(SONGS[k].lead),bass:parseTrack(SONGS[k].bass)};
const DSONG={frostfang:'icecave',scorpion:'sandcave',tidekeeper:'seacave'};
const _ws48=wantSong;wantSong=function(){const w=_ws48();const R=SCENE&&SCENE.room;if(R&&R.dun&&DSONG[R.dun.kind])return DSONG[R.dun.kind];return w};
// the map legend: towns first, then each village followed by its dungeon
const _mh48=mapHTML;mapHTML=function(){const h=_mh48(),re=/<span><i style="background:[^"]*"><\/i>[^<]*<\/span>/g,sp=h.match(re);if(!sp)return h;
 const ord=['You','Hollow Village','Frosthollow','Frostfang Den','Dusthaven','Scorpion Hollow','Tidewatch','Drowned Grotto','Bridge','Islets'],key=x=>{const t=x.replace(/<[^>]*>/g,'');const i=ord.findIndex(o=>t.startsWith(o));return i<0?99:i};
 const sorted=sp.slice().sort((a,b)=>key(a)-key(b));let k=0;return h.replace(re,()=>sorted[k++])};
var MFT=-9,MLAST=null;function MFADEF(){if(typeof ACX==='undefined'||!ACX)return 1;const w=wantSong();if(w!==MLAST){MLAST=w;MFT=ACX.currentTime}return Math.min(1,Math.max(0,(ACX.currentTime-MFT)/1.4))}
