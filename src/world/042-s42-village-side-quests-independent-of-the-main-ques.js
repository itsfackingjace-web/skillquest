// ---------------------------------------------------------------- 42. Village side quests (independent of the main quest line)
// Each village has its own quest line, one active quest at a time, accepted and handed in at the quest's giver.
// The main quest (Q.i) is never touched. Progress events (kills, dungeon bosses) update every eligible active quest.
// Rewards are paid once (the line moves on); finished lines stay finished. Saved as sideQuests.
const SQ_SIDE={frosthollow:{index:0,on:false,k:0,completed:false},dusthaven:{index:0,on:false,k:0,completed:false},tidewatch:{index:0,on:false,k:0,completed:false}};
const SIDE_QS={frosthollow:[
 {n:'A Winter\'s Fire',d:'Bring Elowen 12 wood for the lodge.',type:'give',item:'wood',amt:12,r:{g:100,xp:[5,250]},giver:'elowen',start:'The firewood pile is getting terribly small.',finish:'Now that\'s enough wood for a proper fire!'},
 {n:'Broken Trail',d:'Bring 10 stone to repair the mountain trail.',type:'give',item:'stone',amt:10,r:{g:140,xp:[6,350]},giver:'nessa',start:'The trail markers have fallen apart.',finish:'That should keep travelers from getting lost.'},
 {n:'Hungry Wolves',d:'Defeat 6 wolves near Frosthollow.',type:'kill',item:'wolf',amt:6,r:{g:180,xp:[0,450]},giver:'torren',start:'The wolves are coming closer every night.',finish:'You\'ve bought us some breathing room.'},
 {n:'Heart of Frostfang',d:'Defeat the Frostfang Alpha.',type:'dungeonboss',item:'frostfang',amt:1,r:{g:350,xp:[8,900]},giver:'torren',start:'The Alpha is hiding deep inside Frostfang Den.',finish:'Frosthollow can finally sleep peacefully.',note:'Attack 12 recommended.'}],
 dusthaven:[],tidewatch:[]};
const SQTOWN={frosthollow:'Frosthollow',dusthaven:'Dusthaven',tidewatch:'Tidewatch'};
const sqCur=t=>{const s=SQ_SIDE[t],L=SIDE_QS[t];return!s||s.completed||s.index>=L.length?null:L[s.index]};
const sqProg=t=>{const q=sqCur(t),s=SQ_SIDE[t];if(!q)return 0;return Math.min(q.amt,q.type==='give'?(inv[q.item]|0):s.k)};
const sqReady=t=>{const q=sqCur(t);return!!q&&SQ_SIDE[t].on&&sqProg(t)>=q.amt};
const sqGiverName=id=>{const n=NPCS.find(o=>o.id===id);return n?n.name:id};
function sqReward(q){const r=q.r;return r.g+' gold · '+r.xp[1]+' '+SKN[r.xp[0]]+' XP'}
// a quest card on the giver's panel
function sideCard(n){const t=n.town;if(!t||!SIDE_QS[t])return'';const s=SQ_SIDE[t],q=sqCur(t);
 if(s.completed&&n.id===SIDE_QS[t][SIDE_QS[t].length-1].giver)return'<div class="qc" style="margin-top:10px"><b>✓ '+SQTOWN[t]+' quests complete</b><p>"'+esc(SIDE_QS[t][SIDE_QS[t].length-1].finish)+'"</p></div>';
 if(!q||q.giver!==n.id)return'';
 let h='<div class="qc" style="margin-top:10px"><b>'+(s.on?'▶ ':'! ')+esc(q.n)+'</b><p>"'+esc(s.on?(sqReady(t)?q.finish:q.start):q.start)+'"</p><p>'+esc(q.d)+(q.note?' '+esc(q.note):'')+'</p>';
 if(s.on)h+='<p>Progress: '+sqProg(t)+' / '+q.amt+'</p>';h+='<p class="qr">Reward: '+sqReward(q)+'</p>';
 const rq=q.req&&lvOf(q.req[0])<q.req[1],nd=q.need&&!q.need.f();if(q.req)h+='<p>Requires '+SKN[q.req[0]]+' '+q.req[1]+(rq?' (you have '+lvOf(q.req[0])+')':' ✓')+'</p>';if(q.need)h+='<p>Requires: '+esc(q.need.txt)+(nd?'':' ✓')+'</p>';
 if(!s.on)h+=rq?'<p style="opacity:.7">Come back when your '+SKN[q.req[0]]+' reaches '+q.req[1]+'.</p>':nd?'<p style="opacity:.7">Come back when you can: '+esc(q.need.txt.toLowerCase())+'.</p>':'<button class="qb xb" data-a="sq_accept">Accept quest</button>';else if(sqReady(t))h+='<button class="qb xb" data-a="sq_done">'+(q.type==='give'?'Hand over '+q.amt+' '+esc(iname(q.item,q.amt===1)):'Report back')+'</button>';
 return h+'</div>'}
function sideAct(a,n){const t=n&&n.town,q=t&&sqCur(t),s=t&&SQ_SIDE[t];if(!q||q.giver!==n.id)return;
 if(a==='accept'&&!s.on){if(q.req&&lvOf(q.req[0])<q.req[1]){say('You need '+SKN[q.req[0]]+' '+q.req[1]+' for this quest.');sfx('swish');return}if(q.need&&!q.need.f()){say('First: '+q.need.txt.toLowerCase()+'.');sfx('swish');return}s.on=true;s.k=0;TALKQ=q.start;say('Quest started: '+q.n);sfx('quest');return}
 if(a==='done'&&sqReady(t)){if(q.type==='give')inv[q.item]=(inv[q.item]|0)-q.amt;GLD+=q.r.g;addXp(q.r.xp[0],q.r.xp[1]);
  s.on=false;s.k=0;s.index++;if(s.index>=SIDE_QS[t].length)s.completed=true;TALKQ=q.finish;
  say('Quest complete: '+q.n+'! +'+q.r.g+' gold'+(s.completed?' · '+SQTOWN[t]+' is grateful.':''));msgT=4;sfx('quest');setTimeout(()=>sfx('coin'),150);svg()}}
// progress events: every village's active quest that matches gets a tick
function sqEvent(type,item,test){for(const t in SQ_SIDE){const s=SQ_SIDE[t],q=sqCur(t);if(!q||!s.on||q.type!==type||q.item!==item)continue;if(test&&!test(t))continue;if(s.k>=q.amt)continue;
  s.k++;if(s.k>=q.amt){say('Quest updated: '+q.n+' - return to '+sqGiverName(q.giver)+' in '+SQTOWN[t]+'.');msgT=3;sfx('quest')}else drops.push({x:P.x,y:P.y-30,t:0,tx:q.n+' '+s.k+'/'+q.amt,c:'#a8e0ff'})}}
// kills: wolves (and snow wolves) count for Hungry Wolves when they fall near Frosthollow or inside Frostfang Den
const _ed42=enemyDrop;enemyDrop=function(n){_ed42(n);if(n.type==='wolf'){const R=SCENE&&SCENE.room,inDen=!!(R&&R.dun&&R.dun.kind==='frostfang');
  sqEvent('kill','wolf',t=>t!=='frosthollow'||inDen||(!SCENE&&FHON&&Math.hypot(n.x/16-FX,n.y/16-FY)<40));saveLocal(true)}};
// the quest screen lists village quests under the main line
const _qh42=questsHTML;questsHTML=function(){let h=_qh42(),any='';
 for(const t in SIDE_QS){const L=SIDE_QS[t],s=SQ_SIDE[t];if(!L.length)continue;if(t==='frosthollow'&&!FHON)continue;
  any+='<div class="tl" style="margin-top:14px">'+SQTOWN[t]+' quests ('+(s.completed?L.length:s.index)+' / '+L.length+')</div>';
  L.forEach((q,i)=>{if(s.completed||i<s.index)any+='<div class="qrow qd">✓ '+esc(q.n)+'</div>';
   else if(i===s.index)any+='<div class="qc"><b>▶ '+esc(q.n)+'</b><p>'+esc(q.d)+'</p><p>'+(s.on?'Progress: '+sqProg(t)+' / '+q.amt+(sqReady(t)?' - return to '+esc(sqGiverName(q.giver))+'!':''):'Talk to '+esc(sqGiverName(q.giver))+' in '+SQTOWN[t]+' to start this quest.')+'</p><p class="qr">Reward: '+sqReward(q)+'</p></div>';
   else any+='<div class="qrow qx">? ? ?</div>'})}
 return h+any};
// "!" (a quest to start) and "?" (ready to hand in) over the giver's head, outdoors and inside their shop
function sqMark(n){const t=n.town;if(!t)return'';const q=sqCur(t);if(!q||q.giver!==n.id)return'';return!SQ_SIDE[t].on?'!':sqReady(t)?'?':''}
function sqDrawMarks(tm,inScene){for(const n of NPCS){if(!n.town)continue;if(inScene?n.scene!==SCENE.id:n.scene)continue;const mk=sqMark(n);if(!mk)continue;
  const bx=Math.round(n.x),by=Math.round(n.y-30+Math.sin(tm*4)*1.5);g.save();g.font='700 11px "SQ Digits","Pixelify Sans",monospace';g.textAlign='center';g.textBaseline='alphabetic';g.lineWidth=3;g.lineJoin='round';
  g.strokeStyle=O;g.strokeText(mk,bx,by);g.fillStyle=mk==='?'?'#a8e0ff':'#f8d848';g.fillText(mk,bx,by);g.restore()}}
const _nd42=NEWDRAW;NEWDRAW=function(...a){_nd42(...a);if(!SCENE)sqDrawMarks(a[8],false)};
const _dr42=drawRoom;drawRoom=function(tm){_dr42(tm);if(SCENE)sqDrawMarks(tm,true)};
// saving: optional field, older saves start every line fresh
const _sn42=snap;snap=function(){const s=_sn42();s.sideQuests=JSON.parse(JSON.stringify(SQ_SIDE));return s};
function sqReset(){for(const t in SQ_SIDE)Object.assign(SQ_SIDE[t],{index:0,on:false,k:0,completed:false})}
const _ap42=applySave;applySave=function(S){_ap42(S);sqReset();const o=S.sideQuests;if(!o||typeof o!=='object')return;
 for(const t in SQ_SIDE){const v=o[t];if(!v||typeof v!=='object')continue;const L=SIDE_QS[t].length,s=SQ_SIDE[t];
  s.index=Math.max(0,Math.min(L,+v.index||0));s.completed=!!v.completed||(L>0&&s.index>=L);s.on=!s.completed&&!!v.on;s.k=Math.max(0,+v.k||0)}};
const _ng42=newGame;newGame=function(){sqReset();_ng42()};
