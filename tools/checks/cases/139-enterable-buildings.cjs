// Nov 26 (iPrint3D's report about walking into the hermit's doorway; Jace: make the hermit's hut and No Man's Land's buildings
// enterable, NML's not safe from PvP and with nothing aggressive inside): 296's rooms.
module.exports={name:'the hermit\'s hut and Dustwater\'s buildings can be entered; Dustwater\'s are not PvP safe zones',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);try{if(pnOpen)closePanel()}catch(e){}const out={};
  const walkIn=async(want)=>{face=[0,-1];for(let k=0;k<40&&!(SCENE&&SCENE.id===want);k++){P.y-=2;face=[0,-1];await W(50)}await W(200);return!!(SCENE&&SCENE.id===want)};
  // the hermit's hut, on Hollow
  SQPVP.on=true;P.x=HRM.x*16+8;P.y=HRM.y*16+14;face=[0,-1];await W(100);out.hut=await walkIn('hermithut');await W(400);
  out.hutSafe=/safe zone/.test(window.SQPVBADGE||'');out.hutLoc=mpLoc();
  // walking in for real, past the hermit standing in front of his door
  leaveScene();await W(200);P.x=HRM.x*16+8;P.y=(HRM.y+2)*16+8;face=[0,1];await W(150);K.w=true;for(let k=0;k<60&&!SCENE;k++)await W(50);K.w=false;out.walked=!!(SCENE&&SCENE.id==='hermithut');await W(200);
  const book=SCENE.room.items.find(i=>i.use==='look');const said=[],_s=say;say=function(m){said.push(String(m));return _s.apply(this,arguments)};
  try{useFurn(book)}finally{say=_s}out.look=said[0]||'';
  P.x=SCENE.room.ex*16+8;P.y=SCENE.room.h*16-2;face=[0,1];await W(400);out.hutOut=[SCENE===null,Math.round(P.y/16)===HRM.y];
  // Dustwater, No Man's Land
  routeOpen=()=>true;TRAVEL_UNLOCKS.nomansRoute=true;routeGo('nomans');const e=Date.now()+40000;
  while(Date.now()<e&&!(curRegion()==='nomans'&&!(typeof TRAVEL!=='undefined'&&TRAVEL)))await W(300);await W(800);
  out.doors=SQROOMS296.doors(SCENE.room).map(d=>d.room);out.rooms={};
  for(const room of out.doors){const d=SQROOMS296.doors(SCENE.room).find(q=>q.room===room),it=d.it;
   P.x=it.x*16+it.w*8;P.y=(it.y+it.h)*16+14;face=[0,1];await W(150);
   // a bandit right behind you stays outside
   en.push({x:P.x,y:P.y+20,hp:20,mhp:20,kx:0,ky:0,type:'bandit',rk:'bandit',rg:'nomans'});
   let ok;if(room==='nmsaloon'||room==='nmshack2'){K.w=true;for(let k=0;k<60&&!SCENE.prev;k++)await W(50);K.w=false;ok=!!(SCENE&&SCENE.id===room)}else ok=await walkIn(room);await W(500);// the saloon and a shack: walking up for real
   out.rooms[room]=[ok,mpLoc(),!!SCENE.prev,/PvP ON/.test(window.SQPVBADGE||'')&&!/safe zone/.test(window.SQPVBADGE||''),en.filter(n=>!n.dead).length];
   P.x=SCENE.room.ex*16+8;P.y=SCENE.room.h*16-2;face=[0,1];await W(500);out.rooms[room].push(curRegion())}
  SQPVP.on=false;return out});
 t.eq([r.hut,r.hutLoc,r.hutSafe],[true,'in:hermithut',true],'the hermit\'s hut: walked in, its place, safe like every Hollow room');
 t(r.walked,'holding up from below walks you in, past the hermit');t(/salt-stained/.test(r.look),'its books can be looked at: '+r.look);
 t.eq(r.hutOut,[true,true],'leaving puts you back outside his door');
 t.eq(r.doors,['nmsaloon','nmsheriff','nmshack1','nmshack2','nmshack3'],'Dustwater\'s buildings with doors');
 for(const k of r.doors||[])t.eq(r.rooms[k],[true,'in:'+k,true,true,0,'nomans'],k+' [walked in, place, island kept, PvP on and not safe, monsters inside, back on the island]')}};
