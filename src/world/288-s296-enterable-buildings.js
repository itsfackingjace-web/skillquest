// ---- Section 296: you can walk into the hermit's hut and the buildings of Dustwater (Nov 26, Jace; iPrint3D's report) ----
// iPrint3D: "the magic house lets you walk in the door and hide": the Old Hermit's hut (026, on Hermit's Isle) leaves its doorway tile
// open but had no inside, so you could stand half inside the wall. Jace: it, and the other houses you can't go into (No Man's Land's
// ghost town, Dustwater), should be places you can walk into.
// - The hermit's hut is one of 012's entrances (its open doorway, like a village door): a small room with his bed, books and rods.
// - Dustwater's saloon, the sheriff's office and its three shacks (099's `nmsaloon`/`nmshack` landmarks) open when you walk up into
//   their doors, like 096's Briarwood and Ashfall buildings. 067 keeps No Man's Land as SCENE.prev, so leaving puts you back at the door
//   and 099 keeps PvP on inside. They are not safe zones: 064's pvSafeAt treats `in:nm...` rooms like dungeons (players in the same
//   building can fight, with melee). No monsters come inside (012 clears them in rooms), and no one aggressive lives there.
// - New room items drawn here (SQFURN): nmbar (the back bar's bottles), nmpiano, nmcell (jail bars), nmposter (a WANTED poster),
//   nmstool, nmweb (cobwebs in the empty shacks), nmshelf (an empty, dusty shelf), hmrods (the hermit's rods on the wall).
(()=>{const mk=R=>{R.solid=new Set();for(const it of R.items)if(it.solid)for(let dy=0;dy<(it.sh||1);dy++)for(let dx=0;dx<(it.w||1);dx++)R.solid.add((it.y+dy)*R.w+it.x+dx);return R};
 const look=(name,text)=>({use:'look',name,text});
 const DESERT={floor:['#a88a62','#9c7e56'],wall:'#d2b48a',trim:'#6a4a2a'},DUSTY={floor:['#968060','#8a7454'],wall:'#b8a07c',trim:'#5a3e24'};
 // the Old Hermit's hut (Hollow, Hermit's Isle)
 ROOMS.hermithut=mk({w:7,h:6,ex:3,floor:['#b89868','#ac8c5c'],wall:'#e4d4b4',trim:'#7a5a3a',items:[
  Object.assign({t:'shelf',x:0,y:0,w:2},look('Old books','Books with salt-stained covers: tides, knots, fish of the western sea. One is just called "People, and why to avoid them."')),
  {t:'window',x:3,y:0},Object.assign({t:'hmrods',x:5,y:0,w:2},look('Fishing rods','Three old rods, mended many times. A note on one: "Gull Rock at dawn. Be patient."')),
  Object.assign({t:'table',x:1,y:3,w:2,solid:1},look('A letter','A letter he never sent: "Rowan, I\'m fine. The fish are fine. Don\'t send anyone." It\'s dated forty years ago.')),
  {t:'bed',x:6,y:2,sh:2,solid:1},{t:'barrel',x:0,y:5,solid:1},{t:'plant',x:6,y:5,solid:1},{t:'rug',x:2,y:5,w:3}]});
 // Dustwater (No Man's Land): the Last Chance Saloon, the sheriff's office and three shacks
 ROOMS.nmsaloon=mk(Object.assign({w:12,h:8,ex:6,items:[
  Object.assign({t:'nmbar',x:0,y:0,w:4},look('The back bar','Dusty bottles, most of them empty. The sign above them: "NO LAW. NO CREDIT. NO REFUNDS."')),
  {t:'window',x:5,y:0},{t:'window',x:7,y:0},Object.assign({t:'nmposter',x:10,y:0},look('A poster','"WANTED: anyone. REWARD: whatever they\'re carrying." Somebody has signed it "the management".')),
  Object.assign({t:'counter',x:0,y:3,w:4,solid:1},look('The bar','The bar is sticky and scarred with knife marks. Nobody is serving.')),
  {t:'nmstool',x:1,y:4},{t:'nmstool',x:3,y:4},
  Object.assign({t:'nmpiano',x:10,y:2,w:2,solid:1},look('The piano','An old upright piano. Half the keys stick. It still plays one song, badly.')),
  {t:'table',x:6,y:3,w:2,solid:1},{t:'table',x:9,y:5,w:2,solid:1},{t:'table',x:2,y:6,w:2,solid:1},{t:'barrel',x:0,y:6,solid:1},{t:'barrel',x:11,y:7,solid:1},{t:'rug',x:5,y:6,w:3}]},DESERT));
 ROOMS.nmsheriff=mk(Object.assign({w:9,h:7,ex:4,items:[
  Object.assign({t:'nmposter',x:0,y:0},look('WANTED posters','Faces nobody bothered to catch. One of them looks a lot like you.')),{t:'window',x:2,y:0},
  Object.assign({t:'rack',x:4,y:0,w:2},look('The weapon rack','Two rusty blades nobody wanted to take with them.')),
  Object.assign({t:'nmcell',x:6,y:0,w:3,sh:3,solid:1},look('The cell','The cell door hangs open. The key is still in the lock.')),
  Object.assign({t:'table',x:1,y:3,w:2,solid:1},look('The sheriff\'s desk','A tin star with a hole through it, and a ledger. The last line: "Gone fishing. Not coming back."')),
  {t:'barrel',x:0,y:5,solid:1},{t:'nmweb',x:8,y:4},{t:'rug',x:3,y:5,w:3}]},DESERT));
 const shack=(v,n)=>mk(Object.assign({w:7,h:6,ex:3,items:v?[
  {t:'window',x:1,y:0},Object.assign({t:'nmshelf',x:4,y:0,w:2},look('A shelf','Dust, a cracked cup and a spider that doesn\'t look happy to see you.')),
  {t:'nmweb',x:0,y:2},{t:'nmweb',x:6,y:2},{t:'table',x:1,y:3,w:2,solid:1},{t:'barrel',x:5,y:3,solid:1},{t:'barrel',x:6,y:5,solid:1},{t:'rug',x:2,y:5,w:3}]
  :[{t:'shelf',x:0,y:0,w:2},{t:'window',x:3,y:0},Object.assign({t:'nmposter',x:5,y:0},look('A note','"Gone to the silver mine. Back by sundown." The note is very old.')),
  {t:'bed',x:6,y:2,sh:2,solid:1},{t:'table',x:1,y:3,w:2,solid:1},{t:'nmstool',x:3,y:3},{t:'barrel',x:0,y:5,solid:1},{t:'plant',x:6,y:5,solid:1},{t:'rug',x:2,y:5,w:3}]},v?DUSTY:DESERT,{n}));
 ROOMS.nmshack1=shack(0,1);ROOMS.nmshack2=shack(1,2);ROOMS.nmshack3=shack(1,3);
 const MSG={hermithut:'The Old Hermit\'s hut. It smells of fish and pipe smoke.',nmsaloon:'The Last Chance Saloon. The doors swing shut behind you. PvP is still on in here.',
  nmsheriff:'The sheriff\'s office. Nobody has kept the law here for years.',nmshack1:'A shack in Dustwater. Someone lived here once.',nmshack2:'An empty shack. Cobwebs everywhere.',nmshack3:'An empty shack. Cobwebs everywhere.'};
 // "look" items say their text (096 does this for its own rooms only)
 SQUSEFURN.wrap('296',_uf=>function(it){if(it&&it.use==='look'&&SCENE&&MSG[SCENE.id]){say(it.text||it.name||'');msgT=6;try{sfx('talk')}catch(e){self.SQERR&&SQERR(e,'296-1')}return}return _uf.apply(this,arguments)});
 SQENTER.after('296',(id)=>{if(MSG[id])say(MSG[id])});
 // the hermit's hut: its open doorway is an entrance (012)
 {const _en=entrances;entrances=function(){const a=_en();try{if(typeof HRM!=='undefined')a.push({x:HRM.x,y:HRM.y-1,id:'hermithut',house:null})}catch(e){self.SQERR&&SQERR(e,'296-2')}return a}}
 // Dustwater: which building is which (the generator's order is fixed for the island's seed)
 const doors=R=>{if(R._nmb)return R._nmb;const L=[];let s=0;for(const it of R.items){if(it.t!=='lm')continue;
   if(it.k==='nmsaloon')L.push({it,room:'nmsaloon'});else if(it.k==='nmshack'){if(/Sheriff/i.test(it.name||''))L.push({it,room:'nmsheriff'});else if(s<3)L.push({it,room:'nmshack'+(++s)})}}
  return R._nmb=L};
 SQUPD.after('296 Dustwater doors',()=>{if(menuOpen||pnOpen||dead||(typeof TRAVEL49!=='undefined'&&TRAVEL49)||face[1]>=0||(window.SQRSAIL&&SQRSAIL.on))return;const R=SCENE&&SCENE.room;if(!R||R.region!=='nomans')return;
  for(const d of doors(R)){const it=d.it,cx=it.x*16+(it.w||1)*8,by=(it.y+(it.h||1))*16;if(Math.abs(P.x-cx)<9&&P.y<by+6&&P.y>by-20){enterScene(d.room,null,{x:cx,y:by+8});return}}});
 // drawing the new room items
 const O2=typeof O!=='undefined'?O:'#181018';
 SQFURN.wrap('296 new room items',next=>function(it,tm){const t=it&&it.t;if(!t||!/^(nmbar|nmshelf|nmpiano|nmcell|nmposter|nmstool|nmweb|hmrods)$/.test(t))return next.apply(this,arguments);
  const x0=it.x*16,y0=it.y*16,w=(it.w||1)*16,R=Rg;
  if(t==='nmbar'){R(x0+1,3,w-2,27,O2);R(x0+2,4,w-4,25,'#6a4a2a');for(const yy of[13,24])R(x0+2,yy,w-4,2,'#3e2a18');
   const C=['#3a7a3a','#8a3a2a','#c8a040','#3a5a8a','#6a3a6a','#a87040'];for(let i=0;i*7+5<w-4;i++){const bx=x0+4+i*7,c=C[i%C.length];R(bx,6,4,7,c);R(bx+1,4,2,2,c);R(bx+1,7,1,3,'#ffffff');if(i%2)R(bx,16,4,8,C[(i+3)%C.length]),R(bx+1,14,2,2,C[(i+3)%C.length])}return}
  if(t==='nmshelf'){R(x0+1,3,w-2,27,O2);R(x0+2,4,w-4,25,'#7a5a3a');for(const yy of[13,24])R(x0+2,yy,w-4,2,'#4a3220');R(x0+2,4,w-4,1,'#9a7a5a');
   R(x0+6,9,5,4,'#d8d0c0');R(x0+7,10,3,2,'#b8b0a0');R(x0+w-9,20,4,4,'#6a6a6a');for(let i=0;i<5;i++)R(x0+3+i*5,12,2,1,'rgba(200,190,170,.5)');return}
  if(t==='hmrods'){for(let i=0;i<3;i++){const rx=x0+6+i*9;R(rx,4,2,26,O2);R(rx,5,1,24,'#a07040');R(rx-3,22,6,4,O2);R(rx-2,23,4,2,'#6a6a72')}R(x0+2,6,w-4,2,'#5a3a20');return}
  if(t==='nmposter'){R(x0+2,7,12,16,O2);R(x0+3,8,10,14,'#e8d0a0');R(x0+4,9,8,2,'#7a2a14');R(x0+6,12,4,5,'#7a5a3a');R(x0+5,18,6,1,'#7a2a14');R(x0+5,20,6,1,'#7a2a14');return}
  if(t==='nmpiano'){shd(x0+w/2,y0+15,w-4);R(x0+1,y0-10,w-2,26,O2);R(x0+2,y0-9,w-4,24,'#4a2a18');R(x0+2,y0-9,w-4,2,'#6a4028');
   R(x0+3,y0+2,w-6,4,'#f0ece0');for(let k=x0+4;k<x0+w-4;k+=3)R(k,y0+2,1,2,'#181018');R(x0+3,y0+8,2,7,'#2a180c');R(x0+w-5,y0+8,2,7,'#2a180c');return}
  if(t==='nmcell'){const h=(it.sh||3)*16;R(x0,4,w,h-4,'rgba(20,16,24,.35)');for(let k=x0+2;k<x0+w;k+=5)R(k,4,2,h-4,'#5a5a62'),R(k,4,1,h-4,'#8a8a92');R(x0,4,w,2,'#5a5a62');R(x0,h-8,w,2,'#5a5a62');return}
  if(t==='nmstool'){shd(x0+8,y0+14,8);R(x0+4,y0+4,8,4,O2);R(x0+5,y0+5,6,2,'#8a5a30');R(x0+5,y0+8,2,6,O2);R(x0+9,y0+8,2,6,O2);return}
  if(t==='nmweb'){g.save();g.globalAlpha=.55;g.strokeStyle='#e8e8f0';g.lineWidth=.6;g.beginPath();const cx=x0+8,cy=y0+4;for(let a=0;a<6;a++){g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*9,cy+Math.sin(a)*7)}for(const r of[3,6])g.ellipse?g.ellipse(cx,cy,r,r*.75,0,0,6.283):0;g.stroke();g.restore();return}
  return next.apply(this,arguments)});
 window.SQROOMS296={MSG,doors};
})();
