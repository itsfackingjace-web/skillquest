// ---- 134. Achievements and the collection log ----
// START > Achievements opens two pages:
//  - Achievements: goals across skills, gathering, combat, quests, travel, wealth and collecting. Each pays gold once,
//    the moment it's reached (a message and a jingle), and shows its progress until then.
//  - Collection log: every item, gear piece and pet in the game, by category. What you've had shows in colour, the rest
//    as a dark shape; tap one for its name.
// Counting (lifetime, from this update on): items arriving in a frame where the matching skill gained XP (like the daily
// challenges), fires by Firemaking XP gains, monsters by the game's `kills`, island bosses by sqEvent('islandboss').
// Achievements about levels, gold, quests, chess, pets and the log itself read the game's own state, so old saves get
// them straight away. The collection log starts with what's in your bag, on you and your pets.
// Saved as `ach` = {c: counters, d: {id: day reached}, col: [item keys], rg: [islands visited]}.
// Other sections can count things too: SQACH.add(counter, n) (duels won, trades...).
(()=>{const SK=n=>SKN.indexOf(n);
 let C={},D={},COL=new Set(),RG=new Set(),READY=false;
 const cnt=k=>C[k]|0;
 const pets=()=>{try{return LUX.COS.pets||[]}catch(e){return[]}};
 const maxLv=()=>Math.max(...XPS.map((_,i)=>lvOf(i)));
 const quests=()=>{try{return Math.max(QDONE.size,Math.min(Q.i,QS.length))}catch(e){return 0}};
 const lines=()=>{try{return Object.keys(SIDE_QS).filter(t=>SQ_SIDE[t]&&SQ_SIDE[t].completed).length}catch(e){return 0}};
 const linesAll=()=>{try{return Object.keys(SIDE_QS).filter(t=>SIDE_QS[t]&&SIDE_QS[t].length).length}catch(e){return 99}};
 const ibs=()=>{try{return SQCH2.ibk.size}catch(e){return 0}};
 const A=[];const add=(g,id,n,d,val,goal,gold)=>A.push({g,id,n,d,val,goal,gold});
 // skills
 add('Skills','lv10','Getting Good','Reach level 10 in any skill',maxLv,10,50);
 add('Skills','lv30','Skilled','Reach level 30 in any skill',maxLv,30,250);
 add('Skills','lv50','Expert','Reach level 50 in any skill',maxLv,50,800);
 add('Skills','lv99','Master','Reach level 99 in any skill',maxLv,99,10000);
 add('Skills','tot50','Jack of All Trades','Reach total level 50',()=>lvTot(),50,100);
 add('Skills','tot150','Well Rounded','Reach total level 150',()=>lvTot(),150,500);
 add('Skills','tot300','Island Veteran','Reach total level 300',()=>lvTot(),300,1500);
 add('Skills','tot600','Living Legend','Reach total level 600',()=>lvTot(),600,5000);
 // gathering and making
 add('Gathering','log100','Lumberjack','Chop 100 logs',()=>cnt('wc'),100,100);
 add('Gathering','log1k','Timberlord','Chop 1,000 logs',()=>cnt('wc'),1000,800);
 add('Gathering','ore100','Rock Bottom','Mine 100 ore or stone',()=>cnt('mine'),100,100);
 add('Gathering','ore1k','Deep Delver','Mine 1,000 ore or stone',()=>cnt('mine'),1000,800);
 add('Gathering','fish50','Gone Fishin\'','Catch 50 fish',()=>cnt('fish'),50,100);
 add('Gathering','fish500','Master Angler','Catch 500 fish',()=>cnt('fish'),500,800);
 add('Gathering','for100','Forager','Forage 100 berries, mushrooms or plants',()=>cnt('forage'),100,100);
 add('Gathering','crop50','Green Fingers','Harvest 50 crops',()=>cnt('farm'),50,250);
 add('Gathering','cook50','Line Cook','Cook 50 meals',()=>cnt('cook'),50,100);
 add('Gathering','cook500','Head Chef','Cook 500 meals',()=>cnt('cook'),500,800);
 add('Gathering','fire25','Firestarter','Light 25 fires',()=>cnt('fire'),25,100);
 add('Gathering','craft25','Handy','Craft 25 things',()=>cnt('craft'),25,150);
 add('Gathering','smith25','Anvil Ringer','Smith 25 things (bars count too)',()=>cnt('smith'),25,150);
 // combat
 add('Combat','kill1','First Blood','Beat a monster',()=>cnt('kill'),1,20);
 add('Combat','kill100','Monster Hunter','Beat 100 monsters',()=>cnt('kill'),100,200);
 add('Combat','kill1k','Slayer','Beat 1,000 monsters',()=>cnt('kill'),1000,1500);
 add('Combat','ib1','Door Opener','Defeat an island boss',()=>Math.max(ibs(),cnt('ibw')),1,500);
 add('Combat','ib5','Legend of the Isles','Defeat all five island bosses',ibs,5,5000);
 add('Combat','ib10','Boss Regular','Win 10 island boss fights',()=>cnt('ibw'),10,2000);
 add('Combat','duel1','Duelist','Win a duel against another player',()=>cnt('duelw'),1,200);
 add('Combat','duel10','Champion of the Ring','Win 10 duels',()=>cnt('duelw'),10,1500);
 // quests and travel
 add('Quests & travel','q10','Helping Hand','Finish 10 of Elder Rowan\'s quests',quests,10,200);
 add('Quests & travel','qall','Elder\'s Champion','Finish every one of Elder Rowan\'s quests',quests,()=>QS.length,3000);
 add('Quests & travel','line3','Friend of the Island','Finish 3 village quest lines',lines,3,500);
 add('Quests & travel','lineall','Friend of Every Shore','Finish every village quest line',lines,linesAll,3000);
 add('Quests & travel','sea1','Sea Legs','Set foot on another island',()=>RG.size,1,150);
 add('Quests & travel','sea5','World Traveller','Visit 5 islands beyond Hollow',()=>RG.size,5,1500);
 add('Quests & travel','chess5','Chess Champion','Win 5 games of chess',()=>CHS.w|0,5,300);
 add('Quests & travel','daily7','Every Day Counts','Keep a 7-day daily challenge streak',()=>{try{return SQDAILY.state.s|0}catch(e){return 0}},7,1000);
 add('Quests & travel','trade1','Trader','Finish a trade with another player',()=>cnt('trade'),1,100);
 // wealth and collecting
 add('Wealth & collecting','g1k','Pocket Change','Have 1,000 gold at once',()=>GLD,1000,0);
 add('Wealth & collecting','g10k','Well Off','Have 10,000 gold at once',()=>GLD,10000,0);
 add('Wealth & collecting','g100k','Tycoon','Have 100,000 gold at once',()=>GLD,100000,0);
 add('Wealth & collecting','col50','Collector','Fill 50 collection log slots',()=>colCount(),50,500);
 add('Wealth & collecting','col100','Hoarder','Fill 100 collection log slots',()=>colCount(),100,2000);
 add('Wealth & collecting','pet3','Pet Lover','Own 3 pets',()=>pets().length,3,300);
 add('Wealth & collecting','pet10','Menagerie','Own 10 pets',()=>pets().length,10,2000);
 const goalOf=a=>typeof a.goal==='function'?a.goal():a.goal;
 // ---- the collection log ----
 const CATS=[
  ['Logs',k=>/^(wood|heartwood|\w+log)$/.test(k)],
  ['Ores & bars',k=>/^(stone|iron|\w*ore|[isgma]bar)$/.test(k)],
  ['Fish',k=>['shrimp','trout','salmon','swordfish','rainbow','pike','gcarp','eeel','lsnap','icod','gchar','vray','cangl'].includes(k)],
  ['Cooking',k=>/^c(shrimp|trout|salmon|swordfish|rainbow|pike|gcarp|eeel|lsnap|icod|gchar|vray|cangl|shroom)$/.test(k)||['cooked','bread','rcarrot','pie','stew','jam','rnuts'].includes(k)],
  ['Farming & foraging',k=>['berry','wheat','carrot','pumpkin','honey','goldcrop','cfruit','nuts','shroom','meat','pelt','bone'].includes(k)],
  ['Rare finds',k=>/^ibs_/.test(k)||['elixir','coin','ftroph','eq_fcrown','eq_ohat','eq_sword8','ja_frost','ja_dsoul','ja_thorn','ja_ember','pet_pweb','pet_pvoidl'].includes(k)],
  ['Gems & jewellery',k=>/^(ruby|sapphire|emerald|diamond|jr_\w+|ja_\w+)$/.test(k)],
  ['Weapons & tools',k=>/^(eq_(sword|axe|pick|bow|w)\w*|eq_sledge|eq_rod|eq_hoe|eq_can|idag|sdag)$/.test(k)],
  ['Armour',k=>/^eq_(helm|body|legs|r(helm|body|legs)|m(helm|body|legs))\w*$/.test(k)],
  ['Pets',k=>/^pet_/.test(k)]];
 let CATL=null;
 function cats(){if(CATL)return CATL;const used=new Set(),out=[];for(const[n,f]of CATS){const L=[];for(const k in INAME){if(used.has(k)||/^eq_cu_/.test(k))continue;if(f(k)){L.push(k);used.add(k)}}out.push([n,L])}
  // rare finds first so they're not counted twice
  return CATL=out}
 const inLog=k=>cats().some(([,L])=>L.includes(k));
 const colCount=()=>{let n=0;for(const[,L]of cats())for(const k of L)if(COL.has(k))n++;return n};
 const colTotal=()=>cats().reduce((s,[,L])=>s+L.length,0);
 function seed(){try{for(const k in inv)if((inv[k]|0)>0)COL.add(k);for(const s of['main','off','axe','pick','helm','body','legs','rod','hoe','can']){try{const k=occ(s);if(k)COL.add(k)}catch(e){}}for(const p of pets())COL.add('pet_'+p)}catch(e){}}
 function note(k){if(COL.has(k)||!INAME[k]||!inLog(k))return;COL.add(k);const rare=cats().find(([n])=>n==='Rare finds')[1].includes(k)||/^pet_/.test(k);if(rare&&READY){say('New in your collection log: '+INAME[k].replace(/ \(pet\)$/,'')+'!');msgT=4}}
 // ---- counting ----
 const WHICH={1:'wc',2:'mine',3:'forage',9:'fish',4:'cook',11:'farm',6:'craft',10:'smith'},MIN1={craft:1,smith:1};
 let LAST=null,LK=null,XF=new Set(),t=0;
 const _ax=addXp;addXp=function(i,x){const out=_ax.apply(this,arguments);if(x>0){XF.add(i);if(i===SK('Firemaking'))C.fire=cnt('fire')+1}return out};
 const _se=sqEvent;sqEvent=function(type,item){if(type==='islandboss')C.ibw=cnt('ibw')+1;return _se.apply(this,arguments)};
 const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{if(!READY){seed();READY=true;LK=typeof kills==='number'?kills:null}if(dead)return out;
   if(LAST){const got={};let tot=0;for(const k in inv){const v=(inv[k]|0)-(LAST[k]|0);if(v>0){got[k]=v;tot+=v;note(k)}}
    if(XF.size)for(const i of XF){const c=WHICH[i];if(!c)continue;C[c]=cnt(c)+(MIN1[c]?Math.max(1,tot):tot)}}
   if(typeof kills==='number'){if(LK!=null&&kills>LK)C.kill=cnt('kill')+(kills-LK);LK=kills}
   XF.clear();LAST=Object.assign({},inv);
   if((t-=dt)<=0){t=1;for(const s of['main','off','axe','pick','helm','body','legs']){try{const k=occ(s);if(k)note(k)}catch(e){}}for(const p of pets())note('pet_'+p);
    try{const r=curRegion();if(r&&r!=='hollow')RG.add(r)}catch(e){}check()}}catch(e){}return out};
 function check(){for(const a of A){if(D[a.id])continue;let v=0;try{v=a.val()}catch(e){}if(v>=goalOf(a)){D[a.id]=Math.floor(Date.now()/864e5);if(a.gold)GLD+=a.gold;
   say('Achievement unlocked: '+a.n+'!'+(a.gold?' +'+a.gold+' gold':''));msgT=5;try{sfx('level')}catch(e){}try{svg()}catch(e){}try{saveLocal(true)}catch(e){}if(pnOpen&&ptab===ATAB)rPn();break}}}
 window.SQACH={add:(k,n)=>{C[k]=cnt(k)+(n||1)},get counters(){return C},get done(){return D},get col(){return COL},A,cats,check,colCount,colTotal};
 // ---- saves ----
 const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);s.ach={c:Object.assign({},C),d:Object.assign({},D),col:[...COL],rg:[...RG]};return s};
 const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);try{const v=S&&S.ach;C={};D={};COL=new Set();RG=new Set();
   if(v&&typeof v==='object'){for(const k in v.c||{}){const n=+v.c[k];if(isFinite(n)&&n>0)C[k]=Math.floor(n)}for(const k in v.d||{})if(A.some(a=>a.id===k))D[k]=+v.d[k]||1;
    for(const k of Array.isArray(v.col)?v.col:[])if(typeof k==='string'&&INAME[k])COL.add(k);for(const r of Array.isArray(v.rg)?v.rg:[])if(typeof r==='string')RG.add(r)}
   seed();LAST=null;LK=typeof kills==='number'?kills:null;READY=true}catch(e){console.warn(e)}return out};
 const _ng=newGame;newGame=function(){const out=_ng.apply(this,arguments);C={};D={};COL=new Set();RG=new Set();LAST=null;LK=typeof kills==='number'?kills:null;READY=true;return out};
 // ---- the screen ----
 const ATAB=35;let VIEW='a',PICK='';
 SMI.splice(SMI.findIndex(x=>x.id==='options'),0,{id:'achievements',l:()=>'Achievements'});
 {const _ss=showScreen;showScreen=function(id){if(id!=='achievements')return _ss(id);pnOpen=true;ptab=ATAB;jx=jy=0;pn.style.display='block';rPn();sfx('talk')}}
 const st=document.createElement('style');st.textContent=`#pn .ach{display:flex;gap:10px;align-items:center;padding:8px 6px;border-bottom:1px solid #d8e0f0;color:#404040}#pn .ach.done{background:#f4f8e8}
#pn .ach .ic{flex:none;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-weight:700;border:2px solid #485870;background:#e8e8f0;color:#485870}#pn .ach.done .ic{background:#f8d048;border-color:#a07010;color:#604000}
#pn .ach .tx{flex:1;min-width:0}#pn .ach b{display:block;font-size:14px}#pn .ach small{display:block;font-size:12px;opacity:.85}#pn .ach .bar{height:5px;background:#d0d8e8;margin-top:4px}#pn .ach .bar div{height:5px;background:#5878c0}
#pn .ach .gd{flex:none;font-size:12px;font-weight:700;color:#a07010}#pn .colg{display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:4px;margin:6px 0 12px}
#pn .colg button{all:unset;cursor:pointer;aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:#e8ecf4;border:2px solid #c8d0e0}#pn .colg button.on{background:#f8f4e0;border-color:#c8b070}
#pn .colg img{width:28px;height:28px;image-rendering:pixelated}#pn .colg button:not(.on) img{filter:brightness(0);opacity:.3}#pn .colh{display:flex;justify-content:space-between;font-weight:700;color:#304870;margin-top:6px}`;document.head.appendChild(st);
 const ICO={};const ico=k=>{if(ICO[k])return ICO[k];try{return ICO[k]=(EQ[k]&&typeof eqIcon==='function')?eqIcon(k):iconURL(k)}catch(e){return''}};
 function html(){let h='<div class="tl">ACHIEVEMENTS</div><div style="display:flex;gap:6px;margin:4px 0 8px"><button class="sb" data-ac="tab:a" style="flex:1;opacity:'+(VIEW==='a'?1:.55)+'">Achievements</button><button class="sb" data-ac="tab:c" style="flex:1;opacity:'+(VIEW==='c'?1:.55)+'">Collection log</button></div>';
  if(VIEW==='a'){const n=A.filter(a=>D[a.id]).length;h+='<div class="qc" style="font-size:13px">'+n+' of '+A.length+' achievements · each pays gold the moment you reach it.</div>';let grp='';
   for(const a of A){if(a.g!==grp){grp=a.g;h+='<div class="colh"><span>'+esc(grp)+'</span></div>'}const g=goalOf(a);let v=0;try{v=a.val()}catch(e){}const dn=!!D[a.id],pc=Math.min(100,Math.round(v/g*100));
    h+='<div class="ach'+(dn?' done':'')+'"><div class="ic">'+(dn?'✓':'?')+'</div><div class="tx"><b>'+esc(a.n)+'</b><small>'+esc(a.d)+'</small>'+(dn?'':'<div class="bar"><div style="width:'+pc+'%"></div></div><small>'+Math.min(v,g).toLocaleString()+' / '+g.toLocaleString()+'</small>')+'</div>'+(a.gold?'<div class="gd">'+a.gold.toLocaleString()+' g</div>':'')+'</div>'}}
  else{h+='<div class="qc" style="font-size:13px">'+colCount()+' of '+colTotal()+' found. '+'<b class="acpick">'+esc(PICK||'Tap a slot to see its name.')+'</b>'+'</div>';
   for(const[n,L]of cats()){const got=L.filter(k=>COL.has(k)).length;h+='<div class="colh"><span>'+esc(n)+'</span><span>'+got+'/'+L.length+'</span></div><div class="colg">';
    for(const k of L){const on=COL.has(k);h+='<button class="'+(on?'on':'')+'" data-acn="'+esc(on?INAME[k].replace(/ \(pet\)$/,''):'Not found yet')+'"><img alt="" src="'+ico(k)+'"></button>'}h+='</div>'}}
  return h}
 const _r=rPn;rPn=function(){if(ptab===ATAB){try{panelChrome('')}catch(e){}pbd.innerHTML=html();return}return _r.apply(this,arguments)};
 {const _oc=pbd.onclick;pbd.onclick=e=>{if(ptab!==ATAB)return _oc(e);const b=e.target.closest('[data-ac],[data-acn]');if(!b)return;
   if(b.dataset.ac){VIEW=b.dataset.ac.slice(4);PICK='';sfx('talk');rPn();return}PICK=b.dataset.acn;const q=pbd.querySelector('.acpick');if(q)q.textContent=PICK;else rPn()}}})();
