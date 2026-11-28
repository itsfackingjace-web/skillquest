// ---- 298. Inside the guild hall (Nov 28, Jace: "Should Guild Halls be enterable? and what would be inside of them") ----
// Walk up into the hall's door (297's building on the guild island), or press USE (ENTER) at it, to go inside. Each guild has its
// own room, ROOMS['gh_<guild id>'], made the first time you go in (and again when the guild's colour changes), so 061's presence
// puts members in 'in:gh_<id>' and they see each other inside. Like every room on Hollow it's safe: no PvP, no monsters.
// What's in it (all drawn here, in 057's town style):
// - Back wall: the hearth (REST heals you fully, like the Sleepy Fern's beds) with the guild's crest and tag over the mantel; the
//   quest board (the guild screen's quests) and the members' board (a list of members with their rank and total level from the
//   public leaderboard `lb/<uid>.tot`, read when you open it, and this quest's top helpers); a banner for each guild quest skill
//   (wood, mine, forage, fish) that hangs once the guild has a rank in it, with a star per rank; two trophy plaques that get the
//   Void Treant's head and the Giant Turtle's shell once the guild has beaten them.
// - Floor: the guild bank's counter (BANK), the guild charter on a lectern (PERKS: the perks screen), a feast table, a Drop Card
//   table and a chess table (PLAY: pick a guildmate in the hall, then their player menu's PLAY DROP CARD / CHESS), a red carpet.
// Trophies: a boss record with `k` (beaten) counts at once; the first member's game that sees it writes `guilds/<g>/tro/<boss|turt>`
// = now (rules: members only, once, only after a kill), so the trophy stays after the next summon. 197 keeps it as G.tro.
// Room items with `use` are found by this file's nearFurn (closest edge within 14 px), their button word is `word` (118).
// The members' board and the game-table picker are panel 54 (GHTAB). window.SQGHIN = {room, enter, html, earned, near}.
(()=>{const GHTAB=54,OL=typeof O!=='undefined'?O:'#181018',W0=15,H0=10,EX=7;
 const G=()=>(window.SQGUILD&&SQGUILD.state)||{},gid=()=>(window.SQGUILD&&SQGUILD.id)||'';
 const col=()=>{try{return window.SQGHCOL?SQGHCOL():'#3870d8'}catch(e){return'#3870d8'}};
 const mix=(a,b,t)=>{try{return hdMix(a,b,t)}catch(e){return a}};
 const SK={wood:['Woodcutting','logs','wood'],mine:['Mining','ores and rocks','mine'],forage:['Foraging','berries, nuts and mushrooms','forage'],fish:['Fishing','fish','fish']};
 const BOSSN={boss:'Void Treant',turt:'Giant Turtle'};
 const rankOf=k=>Math.min(5,(G().prog&&G().prog[k])|0);
 const recOf=k=>k==='boss'?G().boss:G().turt;
 const earned=k=>{const t=G().tro&&G().tro[k];if(t)return typeof t==='number'?t:1;const r=recOf(k);return r&&r.k?r.k:0};
 // ---- the room ----
 const roomId=()=>{const g=gid();return g?'gh_'+String(g).replace(/[^A-Za-z0-9_]/g,'_'):''};
 function build(){const L=[],add=o=>L.push(o);
  add({t:'ghtroph',k:'boss',x:0,y:0,w:2,sh:2,use:'ghlook',word:'LOOK'});
  add({t:'ghban',k:'wood',x:2,y:0,sh:2,use:'ghlook',word:'LOOK'});
  add({t:'ghquest',x:3,y:0,w:2,sh:2,use:'ghquest',word:'QUESTS'});
  add({t:'ghban',k:'mine',x:5,y:0,sh:2,use:'ghlook',word:'LOOK'});
  add({t:'ghhearth',x:6,y:0,w:3,sh:3,solid:1,use:'ghrest',word:'REST'});
  add({t:'ghban',k:'forage',x:9,y:0,sh:2,use:'ghlook',word:'LOOK'});
  add({t:'ghboard',x:10,y:0,w:2,sh:2,use:'ghboard',word:'BOARD'});
  add({t:'ghban',k:'fish',x:12,y:0,sh:2,use:'ghlook',word:'LOOK'});
  add({t:'ghtroph',k:'turt',x:13,y:0,w:2,sh:2,use:'ghlook',word:'LOOK'});
  add({t:'rug',gh:1,x:6,y:3,w:3,sh:7});// the red carpet from the hearth to the door (a flat item, drawn under everyone)
  add({t:'ghbankc',x:0,y:3,w:3,solid:1,use:'ghbank',word:'BANK'});
  add({t:'ghlect',x:7,y:5,solid:1,use:'ghperks',word:'PERKS'});
  add({t:'ghfeast',x:10,y:4,w:4,solid:1});for(const[a,b]of[[10,3],[12,3],[11,5],[13,5]])add({t:'nmstool',x:a,y:b});
  add({t:'ghcards',x:1,y:7,w:2,solid:1,use:'ghplay',k:'card',word:'PLAY'});add({t:'nmstool',x:0,y:7});add({t:'nmstool',x:3,y:7});
  add({t:'ghchess',x:12,y:7,w:2,solid:1,use:'ghplay',k:'chess',word:'PLAY'});add({t:'nmstool',x:11,y:7});add({t:'nmstool',x:14,y:7});
  add({t:'plant',x:0,y:9,solid:1});add({t:'plant',x:14,y:9,solid:1});add({t:'barrel',x:14,y:3,solid:1});add({t:'barrel',x:4,y:9,solid:1});add({t:'barrel',x:10,y:9,solid:1});
  const c=col(),R={w:W0,h:H0,ex:EX,floor:['#b08a5e','#a67f54'],wall:'#d8c8a4',trim:c,items:L,_col:c,_gh:1,solid:new Set()};
  for(const it of L)if(it.solid)for(let dy=0;dy<(it.sh||1);dy++)for(let dx=0;dx<(it.w||1);dx++)R.solid.add((it.y+dy)*R.w+it.x+dx);return R}
 function room(){const id=roomId();if(!id)return'';const R=ROOMS[id];if(!R||R._col!==col())ROOMS[id]=build();return id}
 const inHall=()=>!!(SCENE&&SCENE.room&&SCENE.room._gh);
 function enter(ret){const id=room();if(!id)return false;enterScene(id,null,ret);return true}
 // the door of 297's building: walk up into it, or USE (ENTER) at it
 const hallItem=()=>{const R=SCENE&&SCENE.room;if(!R||!R.region||!/^gi_/.test(R.region))return null;return(R.items||[]).find(i=>i.t==='ghall')||null};
 const doorRet=it=>({x:it.x*16+40,y:(it.y+(it.h||2))*16+8});
 SQUPD.after('298 guild hall door',()=>{if(menuOpen||pnOpen||dead||(typeof TRAVEL49!=='undefined'&&TRAVEL49)||face[1]>=0||(window.SQRSAIL&&SQRSAIL.on))return;const it=hallItem();if(!it)return;
  const cx=it.x*16+40,by=(it.y+(it.h||2))*16;if(Math.abs(P.x-cx)<10&&P.y<by+6&&P.y>by-20)enter(doorRet(it))});
 SQENTER.after('298',(id)=>{if(!ROOMS[id]||!ROOMS[id]._gh)return;const I=G().info||{};say('The '+(I.n||'guild')+' hall. Rest by the hearth, check the boards, or play a guildmate at the tables.');msgT=6});
 // ---- what's near you inside (the closest edge of an item that has a use) ----
 {const _nf=nearFurn;nearFurn=function(){if(!inHall())return _nf.apply(this,arguments);let best=null,bd=14;
   for(const it of SCENE.room.items){if(!it.use)continue;const x0=it.x*16,y0=it.y*16,x1=x0+(it.w||1)*16,y1=y0+(it.sh||1)*16,d=Math.hypot(Math.max(x0-P.x,0,P.x-x1),Math.max(y0-P.y,0,P.y-y1));if(d<bd){bd=d;best=it}}return best}}
 // ---- using things ----
 const players=()=>{const L=[],M=window.SQMP;let here='';try{here=mpLoc()}catch(e){self.SQERR&&SQERR(e,'298-1')}if(!M||!M.players||!here)return L;
  for(const[u,r]of M.players){if(!r||!(performance.now()-r.seen<20000)||r.loc!==here)continue;if(M.user&&u===M.user.uid)continue;L.push({u,n:r.n||'Player'})}return L};
 let MODE='members',PLAY='card';const LB={},LBAT={};
 function lookText(it){if(it.t==='ghtroph'){const k=it.k,n=BOSSN[k],t=earned(k);
   return t?'The '+n+(k==='boss'?'\'s head':'\'s shell')+', mounted by the guild'+(t>1?' after beating it on '+new Date(t).toLocaleDateString():'')+'.':'An empty plaque. Beat the '+n+' together (Guild > Bosses) and it goes up here.'}
  if(it.t==='ghban'){const s=SK[it.k],r=rankOf(it.k);return r?'The '+s[0]+' banner: rank '+r+' of 5. Every member gets +'+(r*10)+'% '+s[0]+' XP and extra '+s[1]+' '+(r*10)+'% of the time.':'An empty banner hook. Finish a guild '+s[0]+' quest to hang the '+s[0]+' banner.'}
  return''}
 SQUSEFURN.wrap('298 guild hall',_uf=>function(it){const u=it&&it.use;
  if(u==='ghall'&&hallItem()===it){enter(doorRet(it));return}
  if(!u||!/^gh/.test(u)||!inHall())return _uf.apply(this,arguments);
  const S=window.SQGUILD;
  if(u==='ghlook'){say(lookText(it));msgT=6;try{sfx('talk')}catch(e){self.SQERR&&SQERR(e,'298-2')}return}
  if(u==='ghrest'){if(P.hp>=6&&hunger>40){say('You\'re already warm and rested.');return}P.hp=6;hunger=Math.max(hunger,60);say('You rest by the hearth a while. Fully healed!');try{sfx('quest')}catch(e){self.SQERR&&SQERR(e,'298-3')}saveLocal(true);return}
  if(u==='ghbank'){S&&S.open('bank');return}
  if(u==='ghquest'){S&&S.open('quest');return}
  if(u==='ghperks'){S&&S.open('perks');return}
  if(u==='ghboard'){MODE='members';openPn();loadLB();return}
  if(u==='ghplay'){PLAY=it.k==='chess'?'chess':'card';const L=players();const what=PLAY==='chess'?'chess':'Drop Card';
   if(!L.length){say('Nobody else is in the hall. Bring a guildmate here to play '+what+'.');try{sfx('swish')}catch(e){self.SQERR&&SQERR(e,'298-4')}return}
   if(L.length===1&&window.SQPLAYERMENU){SQPLAYERMENU(L[0].u);return}MODE='play';openPn();return}
  return _uf.apply(this,arguments)});
 // ---- panel 54: the members' board and the game-table picker ----
 function openPn(){pnOpen=true;ptab=GHTAB;jx=jy=0;fromMenu=false;pn.style.display='block';rPn();try{sfx('talk')}catch(e){self.SQERR&&SQERR(e,'298-5')}}
 function loadLB(){const F=window.SQFB;if(!F||!F.db)return;const m=G().m||{},now=performance.now();
  for(const u of Object.keys(m)){if(LBAT[u]&&now-LBAT[u]<60000)continue;LBAT[u]=now;
   try{F.db.get(F.db.ref(F.D,'lb/'+u)).then(s=>{const v=s&&s.val&&s.val();LB[u]=v&&+v.tot>0?+v.tot|0:-1;if(pnOpen&&ptab===GHTAB)rPn()}).catch(()=>{LB[u]=-1})}catch(e){self.SQERR&&SQERR(e,'298-6')}}}
 const RN={l:'Leader',o:'Officer',m:'Member'};
 function html(){const g=G(),I=g.info||{},M=window.SQMP;let h='';
  if(MODE==='play'){const L=players(),what=PLAY==='chess'?'chess':'Drop Card';h+='<div class="tl">PLAY '+(PLAY==='chess'?'CHESS':'DROP CARD')+'</div><div class="ghp-s">Who do you want to play '+what+' with? Their player menu opens: ask them to a game there.</div>';
   if(!L.length)h+='<div class="ghp-s">Nobody else is in the hall right now.</div>';
   for(const p of L)h+='<button class="sb ghp-b" data-gh="pm" data-u="'+esc(p.u)+'">'+esc(p.n)+'</button>';return h}
  const m=g.m||{},ids=Object.keys(m).sort((a,b)=>{const ra='lom'.indexOf((m[a]&&m[a].r)||'m'),rb='lom'.indexOf((m[b]&&m[b].r)||'m');return ra-rb||String((m[a]&&m[a].n)||'').localeCompare(String((m[b]&&m[b].n)||''))});
  h+='<div class="tl">'+esc(I.n||'GUILD')+(I.tag?' ['+esc(I.tag)+']':'')+'</div><div class="ghp-s">'+ids.length+(ids.length===1?' member':' members')+' · guild level '+((window.SQGUILD&&SQGUILD.glv)?SQGUILD.glv(g.prog&&g.prog.qd):1)+'</div>';
  h+='<div class="ghp-l">';for(const u of ids){const x=m[u]||{},on=!!(M&&M.players&&M.players.get(u)&&performance.now()-M.players.get(u).seen<20000)||(M&&M.user&&M.user.uid===u),lv=LB[u];
   h+='<div class="ghp-r"><span class="ghp-d'+(on?' on':'')+'" title="'+(on?'Online':'Offline')+'"></span><b>'+esc(x.n||'Player')+'</b><span class="ghp-k">'+(RN[x.r]||'Member')+'</span><span class="ghp-v">'+(lv>0?'Total level '+lv.toLocaleString('en-US'):lv===-1?'':'…')+'</span></div>'}
  h+='</div>';
  const q=g.q,QK=window.SQGUILD&&SQGUILD.QK;if(q&&q.c&&QK&&QK[q.k]){const top=Object.entries(q.c).sort((a,b)=>b[1]-a[1]).slice(0,5);
   if(top.length){h+='<div class="tl" style="margin-top:10px">TOP HELPERS: '+esc(QK[q.k].n.toUpperCase())+'</div><div class="ghp-l">';
    for(const[u,n]of top)h+='<div class="ghp-r"><b>'+esc((m[u]&&m[u].n)||'Player')+'</b><span class="ghp-v">'+(n|0).toLocaleString('en-US')+'</span></div>';h+='</div>'}}
  return h}
 SQRPN.wrap('298 guild hall panel',next=>function(){if(ptab===GHTAB){try{panelChrome(MODE==='play'?'GUILD HALL':'MEMBERS\' BOARD')}catch(e){self.SQERR&&SQERR(e,'298-7')}pbd.innerHTML=html();return}return next.apply(this,arguments)});
 pbd.addEventListener('click',e=>{if(ptab!==GHTAB)return;const b=e.target.closest('[data-gh]');if(!b)return;if(b.dataset.gh==='pm'&&window.SQPLAYERMENU){const u=b.dataset.u;closePanel();SQPLAYERMENU(u)}});
 const css=document.createElement('style');css.textContent='#pn .ghp-s{font-size:12px;opacity:.8;margin:2px 0 8px}#pn .ghp-l{display:flex;flex-direction:column;gap:3px}'+
  '#pn .ghp-r{display:flex;align-items:center;gap:8px;padding:5px 8px;background:rgba(255,255,255,.35);border:2px solid rgba(90,60,30,.25);font-size:13px}#pn .ghp-r b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  '#pn .ghp-k{font-size:11px;opacity:.75}#pn .ghp-v{font-size:11px;font-weight:700;min-width:84px;text-align:right}#pn .ghp-d{width:8px;height:8px;background:#9a9080;flex:none}#pn .ghp-d.on{background:#48b048}'+
  '#pn .ghp-b{display:block;width:100%;margin:4px 0}';document.head.appendChild(css);
 // ---- trophies stay: the first member's game that sees a beaten boss writes guilds/<g>/tro/<kind> ----
 const TRIED={};let trT=0;
 SQUPD.after('298 guild trophies',(dt)=>{if((trT-=dt)>0)return;trT=3;const S=window.SQGUILD;if(!S||!S.id||!S.api||!S.api.ready)return;const g=G();
  for(const k of['boss','turt']){const r=recOf(k);if(!r||!r.k||(g.tro&&g.tro[k])||TRIED[S.id+k])continue;TRIED[S.id+k]=1;
   try{const F=window.SQFB;S.api.DB().set(S.api.ref('guilds/'+S.id+'/tro/'+k),F.db.serverTimestamp()).catch(()=>{})}catch(e){self.SQERR&&SQERR(e,'298-8')}}});
 // ---- drawing ----
 const ramp=c=>[mix(c,'#000000',.45),mix(c,'#000000',.22),c,mix(c,'#ffffff',.3)];
 const WD=['#3a2210','#5a3418','#7a4a24','#9a6434','#b88048'],ST=['#3a3a46','#5e5e70','#7c7c90','#9a9aae','#c4c4d4'],GOLD=['#8a6010','#c89020','#f8d848','#fff8c0'];
 function ic(x,y,k,c){const R=Rg;// 7x6 skill icons
  if(k==='wood'){R(x+3,y,1,6,'#7a4a20');R(x+3,y,1,1,'#a87040');R(x+4,y,3,3,c);R(x+4,y,3,1,'#ffffff')}
  else if(k==='mine'){R(x+3,y+1,1,5,'#7a4a20');R(x,y,7,1,c);R(x,y+1,1,1,c);R(x+6,y+1,1,1,c)}
  else if(k==='forage'){R(x+1,y+2,3,3,c);R(x+4,y+2,3,3,c);R(x+2,y+3,1,1,'#ffffff');R(x+3,y,2,2,'#58a848')}
  else{R(x,y+2,5,3,c);R(x+1,y+2,3,1,'#ffffff');R(x+5,y+1,2,2,c);R(x+5,y+4,2,2,c);R(x+1,y+3,1,1,OL)}}
 const DRAW={
  ghtroph(it,tm){const x0=it.x*16,c=G()&&earned(it.k);const R=Rg;
   R(x0+7,5,18,21,OL);R(x0+8,6,16,19,WD[2]);R(x0+8,6,16,1,WD[4]);R(x0+8,24,16,1,WD[1]);R(x0+10,8,12,15,WD[1]);R(x0+11,9,10,13,WD[3]);
   if(!c){g.save();g.globalAlpha=.55;g.fillStyle='#3a2210';g.font='700 9px '+PF;g.textAlign='center';g.textBaseline='middle';g.fillText('?',x0+16,16);g.restore();return}
   if(it.k==='boss'){R(x0+9,2,2,6,'#3a2a4a');R(x0+21,2,2,6,'#3a2a4a');R(x0+7,1,4,2,'#3a2a4a');R(x0+21,1,4,2,'#3a2a4a');R(x0+11,9,10,12,OL);R(x0+12,10,8,10,'#4a3a2a');for(const a of[13,16,18])R(x0+a,10,1,10,'#2e2418');
    const gl=.6+.4*Math.sin((tm||0)*3);g.save();g.globalAlpha=gl;R(x0+13,13,2,2,'#c070ff');R(x0+17,13,2,2,'#c070ff');g.restore();R(x0+14,17,4,1,'#1a1420')}
   else{R(x0+9,11,14,9,OL);R(x0+10,10,12,9,'#3a7a4a');R(x0+10,10,12,1,'#5aa06a');for(const[a,b]of[[12,12],[16,12],[19,12],[14,15],[18,15]])R(x0+a,b,2,2,'#2a5a34');R(x0+11,18,10,2,'#c8b878');R(x0+6,13,4,4,OL);R(x0+6,14,3,2,'#6a9a5a')}},
  ghban(it,tm){const x0=it.x*16,r=rankOf(it.k),R=Rg;R(x0+2,4,12,2,OL);R(x0+3,4,10,1,GOLD[1]);
   if(!r){R(x0+7,6,2,3,'#6a6a72');g.save();g.globalAlpha=.25;R(x0+4,8,8,16,'#6a5a48');g.restore();return}
   const C=ramp(col());R(x0+3,6,10,19,OL);R(x0+4,6,8,18,C[2]);R(x0+4,6,1,18,C[3]);R(x0+11,6,1,18,C[1]);R(x0+3,24,4,3,OL);R(x0+9,24,4,3,OL);R(x0+4,24,2,2,C[2]);R(x0+10,24,2,2,C[2]);
   ic(x0+5,8,it.k,GOLD[2]);for(let i=0;i<r;i++)R(x0+5+(i%3)*2+(i>=3?1:0),16+(i>=3?3:0),1,1,GOLD[2])},
  ghquest(it,tm){const x0=it.x*16,R=Rg,q=G().q;R(x0+2,5,28,20,OL);R(x0+3,6,26,18,WD[2]);R(x0+5,8,22,14,'#c09060');for(const[a,b]of[[7,10],[18,9],[12,15]]){R(x0+a,b,7,7,'#f4ecd8');R(x0+a+1,b+2,5,1,'#a89878');R(x0+a+1,b+4,4,1,'#a89878');R(x0+a+3,b,1,1,'#c83020')}
   if(q&&q.goal){const p=Math.max(0,Math.min(1,(q.p|0)/q.goal));R(x0+5,23,22,2,OL);R(x0+5,23,Math.round(22*p),2,ramp(col())[3])}
   if(q&&q.done){const b=Math.sin((tm||0)*5)>0?0:1;R(x0+25,3+b,4,8,OL);R(x0+26,4+b,2,4,GOLD[2]);R(x0+26,9+b,2,1,GOLD[2])}},
  ghboard(it,tm){const x0=it.x*16,R=Rg,C=ramp(col());R(x0+2,5,28,21,OL);R(x0+3,6,26,19,'#3a2a1c');R(x0+3,6,26,4,C[2]);R(x0+3,6,26,1,C[3]);
   const n=Math.min(6,Object.keys(G().m||{}).length||1);for(let i=0;i<6;i++){const y=12+i*2;R(x0+6,y,i<n?16:10,1,i<n?'#e8dcc0':'#6a5a48');R(x0+24,y,2,1,i<n?GOLD[2]:'#6a5a48')}},
  ghhearth(it,tm){const x0=it.x*16,R=Rg,C=ramp(col());// the chimney breast, from the wall down into the first floor row
   R(x0+1,3,46,46,OL);R(x0+2,4,44,44,ST[2]);for(let r=0;r<7;r++){const y=4+r*6;R(x0+2,y+5,44,1,ST[1]);for(let k=(r%2?6:0);k<44;k+=12)R(x0+2+k,y,1,5,ST[1]);R(x0+2,y,44,1,ST[3])}
   R(x0+15,5,18,17,OL);R(x0+16,6,16,13,C[2]);R(x0+16,6,16,1,C[3]);R(x0+17,19,14,2,C[2]);R(x0+19,21,10,1,C[1]);R(x0+16,6,1,13,GOLD[1]);R(x0+31,6,1,13,GOLD[1]);
   const tag=String((G().info&&G().info.tag)||'').slice(0,4);if(tag){g.save();g.font='700 5px '+PF;g.textAlign='center';g.textBaseline='middle';g.fillStyle=OL;g.fillText(tag,x0+24.5,13.5);g.fillStyle=GOLD[3];g.fillText(tag,x0+24,13);g.restore()}
   R(x0,24,48,5,OL);R(x0+1,25,46,3,WD[2]);R(x0+1,25,46,1,WD[4]);for(const a of[6,40])R(x0+a,22,3,3,GOLD[1]);
   R(x0+11,30,26,18,OL);R(x0+12,31,24,17,'#201818');R(x0+12,31,24,2,'#2e2424');
   R(x0+14,44,20,3,WD[1]);R(x0+16,42,16,2,WD[2]);const f=Math.floor((tm||0)*8)%3;
   R(x0+16,36-f,6,8+f,'#e86018');R(x0+22,34+f,6,10-f,'#f08830');R(x0+27,37-f,5,7+f,'#e86018');R(x0+18,39-f,4,5+f,'#f8d848');R(x0+24,38,4,6,'#f8d848');R(x0+21,42,6,2,'#fff0a0');},
  ghlect(it,tm){const x0=it.x*16,y0=it.y*16,R=Rg;try{shd(x0+8,y0+15,10)}catch(e){/*quiet*/}R(x0+5,y0+2,6,13,OL);R(x0+6,y0+3,4,11,WD[2]);R(x0+3,y0+13,10,3,OL);R(x0+4,y0+13,8,2,WD[1]);
   R(x0,y0-6,16,8,OL);R(x0+1,y0-5,14,6,WD[3]);R(x0+1,y0-6,7,6,'#f4ecd8');R(x0+8,y0-6,7,6,'#e8dcc0');R(x0+2,y0-4,5,1,'#a89878');R(x0+9,y0-4,5,1,'#a89878');R(x0+2,y0-2,4,1,'#a89878');R(x0+9,y0-2,4,1,'#a89878');
   R(x0+7,y0-6,2,8,ramp(col())[2]);R(x0+13,y0-10,1,6,'#f4f4f4');R(x0+12,y0-11,2,2,'#e8e8e8')},
  ghbankc(it,tm){const x0=it.x*16,y0=it.y*16,w=(it.w||3)*16,R=Rg;try{shd(x0+w/2,y0+15,w-2)}catch(e){/*quiet*/}R(x0,y0-4,w,20,OL);R(x0+1,y0+2,w-2,13,WD[2]);for(let k=x0+4;k<x0+w-4;k+=12){R(k,y0+4,9,9,WD[1]);R(k+1,y0+5,7,7,WD[3])}
   R(x0+1,y0-3,w-2,5,WD[3]);R(x0+1,y0-3,w-2,1,WD[4]);
   for(const[a,n]of[[6,4],[11,6],[16,3]])for(let i=0;i<n;i++){R(x0+a,y0-4-i*2,5,2,GOLD[1]);R(x0+a,y0-4-i*2,5,1,GOLD[2])}
   R(x0+w-17,y0-11,13,9,OL);R(x0+w-16,y0-10,11,7,'#6a6a7a');R(x0+w-16,y0-10,11,1,'#9a9aae');R(x0+w-16,y0-7,11,1,'#3a3a46');R(x0+w-11,y0-8,2,2,GOLD[2]);
   R(x0+24,y0-6,8,4,'#6a2a2a');R(x0+25,y0-6,6,1,'#f4ecd8')},
  ghfeast(it,tm){const x0=it.x*16,y0=it.y*16,w=(it.w||4)*16,R=Rg;try{shd(x0+w/2,y0+15,w)}catch(e){/*quiet*/}R(x0,y0-3,w,12,OL);R(x0+1,y0-2,w-2,8,WD[3]);R(x0+1,y0-2,w-2,1,WD[4]);R(x0+1,y0+5,w-2,2,WD[1]);
   for(const a of[2,w-5])R(x0+a,y0+7,3,8,OL),R(x0+a+1,y0+7,1,7,WD[2]);R(x0+4,y0-1,w-8,2,'#f4ecd8');
   for(const a of[8,22,40,54]){R(x0+a,y0-2,5,3,'#e8e8e8');R(x0+a+1,y0-2,3,1,'#ffffff')}
   R(x0+28,y0-6,10,6,OL);R(x0+29,y0-5,8,4,'#b86a30');R(x0+30,y0-5,4,1,'#e0a060');for(const a of[16,48]){R(x0+a,y0-7,3,5,OL);R(x0+a+1,y0-6,1,3,'#c8b090');R(x0+a,y0-6,3,2,'#e8c050')}
   for(const a of[13,45]){const f=Math.sin((tm||0)*7+a)>0?1:0;R(x0+a,y0-10,2,5,'#f4ecd8');R(x0+a,y0-12-f,2,2,'#f8c848')}},
  ghcards(it,tm){const x0=it.x*16,y0=it.y*16,w=32,R=Rg;try{shd(x0+16,y0+15,28)}catch(e){/*quiet*/}R(x0+1,y0-4,w-2,12,OL);R(x0+2,y0-3,w-4,9,WD[2]);R(x0+3,y0-2,w-6,7,'#2e7a4a');R(x0+3,y0-2,w-6,1,'#48a068');
   for(const a of[5,w-8])R(x0+a,y0+8,3,7,OL),R(x0+a+1,y0+8,1,6,WD[2]);for(const[a,b,c]of[[8,0,'#c83020'],[12,-1,'#181018'],[16,0,'#c83020'],[22,1,'#181018']]){R(x0+a,y0+b-1,4,5,OL);R(x0+a+1,y0+b,2,3,'#f8f4e8');R(x0+a+1,y0+b+1,1,1,c)}},
  ghchess(it,tm){const x0=it.x*16,y0=it.y*16,R=Rg;try{shd(x0+16,y0+15,28)}catch(e){/*quiet*/}R(x0+1,y0-4,30,12,OL);R(x0+2,y0-3,28,9,WD[3]);R(x0+2,y0-3,28,1,WD[4]);for(const a of[5,24])R(x0+a,y0+8,3,7,OL),R(x0+a+1,y0+8,1,6,WD[2]);
   R(x0+8,y0-4,16,10,OL);for(let r=0;r<4;r++)for(let c=0;c<8;c++)R(x0+8+c*2,y0-3+r*2,2,2,(r+c)%2?'#5a3a24':'#e8dcc0');
   for(const[a,b,cc]of[[9,-5,'#f8f8f0'],[13,-5,'#f8f8f0'],[17,-6,'#f8f8f0'],[11,1,'#2a2a2a'],[19,1,'#2a2a2a'],[21,0,'#2a2a2a']]){R(x0+a,y0+b-1,2,3,OL);R(x0+a,y0+b-1,2,2,cc)}},
  rug(it,tm){const x0=it.x*16,y0=it.y*16,w=(it.w||1)*16,h=(it.sh||1)*16,R=Rg;R(x0+2,y0,w-4,h,'#7a1c1c');R(x0+3,y0,w-6,h,'#a82c2c');R(x0+4,y0,1,h,GOLD[1]);R(x0+w-5,y0,1,h,GOLD[1]);for(let y=y0+6;y<y0+h;y+=12)R(x0+w/2-2,y,4,4,'#c84040')}};
 SQFURN.wrap('298 guild hall items',next=>function(it,tm){const f=it&&DRAW[it.t];if(f&&(it.t!=='rug'||it.gh)){try{f(it,tm)}catch(e){self.SQERR&&SQERR(e,'298-9')}return}return next.apply(this,arguments)});
 window.SQGHIN={room,enter,html,earned,near:()=>inHall()?nearFurn():null,players,TAB:GHTAB,get mode(){return MODE}};
})();
