// Nov 28 (Jace: "Should Guild Halls be enterable? and what would be inside of them"): 298's hall interior. Walk up into the
// hall's door to go in; each guild has its own room; the hearth heals, the counter is the guild bank, the lectern the perks, the
// members' board lists members with their total level, the game tables need a guildmate, and a beaten guild boss goes up as a trophy
// that stays (guilds/<g>/tro/<kind>, written once by the rules' new branch). Saving inside puts you back outside the door.
module.exports={name:'the guild hall can be entered and its things work',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms)),G=SQGUILD,API=G.api,until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(200)}return false};
  try{if(pnOpen)closePanel()}catch(e){/*quiet*/}GLD=6e6;API.create('Hall Guild','HAL',5);if(!await until(()=>G.id&&API.ready,8000))return{err:'guild was not founded'};
  G.state.prog.qd=6;routeOpen=()=>true;routeGo(G.isle());if(!await until(()=>API.onIsle()&&!(typeof TRAVEL!=='undefined'&&TRAVEL),30000))return{err:'never reached the guild island'};await W(600);
  API.applyBuildings();const h=SCENE.room.items.find(i=>i.t==='ghall');if(!h)return{err:'no hall'};const out={};
  // walking up into the door
  P.x=h.x*16+40;P.y=(h.y+2)*16+14;face=[0,-1];en.length=0;await W(150);K.w=true;for(let k=0;k<60&&!(SCENE&&SCENE.room&&SCENE.room._gh);k++)await W(50);K.w=false;await W(300);
  const R=SCENE.room;out.in=[!!R._gh,SCENE.id==='gh_'+G.id,mpLoc()==='in:gh_'+G.id,en.filter(n=>!n.dead).length];
  const at=(use,k)=>{const it=R.items.find(i=>i.use===use&&(!k||i.k===k));const x1=it.x*16,x2=x1+(it.w||1)*16,y2=(it.y+(it.sh||1))*16;P.x=(x1+x2)/2;P.y=y2+(it.solid?7:3);face=[0,-1];return it};
  const said=[];const _s=say;say=function(m){said.push(String(m));return _s.apply(this,arguments)};
  try{
   // the hearth
   at('ghrest');await W(150);const nf=nearFurn();out.hearthWord=[nf&&nf.use,window.SQWORDS&&SQWORDS.useWord()];P.hp=2;talk();await W(100);out.heal=P.hp;
   // the bank counter, the lectern, the quest board
   at('ghbank');await W(150);talk();await W(200);out.bank=[pnOpen,ptab];try{closePanel()}catch(e){/*quiet*/}
   at('ghperks');await W(150);talk();await W(200);out.perks=[pnOpen&&ptab===44,/perk/i.test(pbd.innerText||'')];try{closePanel()}catch(e){/*quiet*/}
   // the members' board (total level from the public leaderboard)
   await SQFB.db.set(SQFB.db.ref(SQFB.D,'lb/'+SQMP.user.uid),{n:'Ann',tot:987,t:Date.now()});
   at('ghboard');await W(150);talk();await W(1200);const bt=(pbd.innerText||'').replace(/\s+/g,' ');out.board=[ptab===SQGHIN.TAB,/Hall Guild/.test(bt),/Leader/.test(bt),/Total level 987/.test(bt),/1 member /.test(bt)];try{closePanel()}catch(e){/*quiet*/}
   // a game table with nobody else in the hall
   at('ghplay','card');await W(150);said.length=0;talk();await W(100);out.table=said.join(' | ');
   // a trophy: the Void Treant beaten this week
   out.before=SQGHIN.earned('boss');const tb=R.items.find(i=>i.t==='ghtroph'&&i.k==='boss');at('ghlook','boss');await W(150);said.length=0;useFurn(tb);out.emptyText=said[0]||'';
   const wk=Math.floor((Date.now()-345600000)/604800000);await __dbForce({['guilds/'+G.id+'/boss']:{w:wk,t:Date.now()-60000,by:SQMP.user.uid,k:Date.now()-1000}});
   await until(()=>G.state.tro&&G.state.tro.boss,8000);out.tro=typeof(G.state.tro&&G.state.tro.boss);
   // a new summon (no k) keeps the trophy
   await __dbForce({['guilds/'+G.id+'/boss']:{w:wk+1,t:Date.now(),by:SQMP.user.uid}});await W(600);out.kept=SQGHIN.earned('boss')>0;said.length=0;useFurn(tb);out.trophyText=said[0]||'';
  }finally{say=_s}
  // leaving puts you outside the door
  P.x=R.ex*16+8;P.y=R.h*16-2;face=[0,1];await W(600);out.left=[!(SCENE&&SCENE.room&&SCENE.room._gh),curRegion()===G.isle(),Math.abs(P.x-(h.x*16+40))<12,Math.abs(P.y-((h.y+2)*16+8))<12];
  // USE (ENTER) at the door goes in too, and saving inside puts you back outside
  P.x=h.x*16+40;P.y=(h.y+2)*16+8;face=[0,1];await W(200);out.doorWord=window.SQWORDS&&SQWORDS.useWord();talk();await W(300);out.used=!!(SCENE&&SCENE.room&&SCENE.room._gh);
  const S=JSON.parse(JSON.stringify(snap()));applySave(S);await W(1200);out.loaded=[!(SCENE&&SCENE.room&&SCENE.room._gh),curRegion()===G.isle()];
  routeGo('hollow');return out});
 if(r.err)return t(false,r.err);
 t.eq(r.in,[true,true,true,0],'walking into the door [inside, the guild\'s own room, its place online, no monsters]');
 t.eq(r.hearthWord,['ghrest','REST'],'at the hearth the button says REST');t.eq(r.heal,6,'resting at the hearth heals you fully');
 t.eq(r.bank,[true,44],'the counter opens the guild screen');t.eq(r.perks,[true,true],'the lectern opens the perks');
 t.eq(r.board,[true,true,true,true,true],'the members\' board [panel, guild name, rank, total level from the leaderboard, "1 member"]');
 t(/Nobody else is in the hall/.test(r.table),'a game table with nobody else in the hall says so: '+r.table);
 t.eq(r.before,0,'no trophy before the boss is beaten');t(/empty plaque/.test(r.emptyText),'the empty plaque says how to fill it: '+r.emptyText);
 t.eq(r.tro,'number','beating the boss writes the trophy once (the rules allow it after a kill)');t(r.kept,'a new summon keeps the trophy');t(/Void Treant's head/.test(r.trophyText),'the trophy says what it is: '+r.trophyText);
 t.eq(r.left,[true,true,true,true],'leaving [out of the hall, on the guild island, at the door (x, y)]');
 t.eq([r.doorWord,r.used],['ENTER',true],'USE at the door says ENTER and goes in');t.eq(r.loaded,[true,true],'a save made inside loads outside the door, on the island')}};
