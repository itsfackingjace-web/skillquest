// ---- 197. Dungeon builder (Dev Suite > Dungeons): dungeons drawn floor by floor ----
// Library `dungeons.dg_<id>` = {n, st (look: rock/mine/ice/root/sand/tomb), fl:[{w,h,g (w*h chars: '#' wall, '.' floor),
//   it:[{t,x,y,o?}] (t: dchest crystal boulder bones pillar urn ic_beam ic_cart stairs, or ore with o = rock/ore/gold/mith/adam),
//   m:[{k (SQISLIFE.MOBS key),x,y,hp?,b (boss: bigger, boss music, health bar)}]}]}. Each design is registered as an island-cave
// kind `dg_<id>` (093's SQICV + DKIND, so floors, the way back up, campfires and Dev Suite > Test's dungeon list all work), and
// the outermost buildFloor builds its floors exactly as drawn (entrance at the bottom middle, the stairs where placed; the last floor
// needs none). Island-builder dungeon entrances can use a design (`cv[].dg`, 111a regCaves / 111c). Floors already built today are
// dropped when the library changes (except the one you're standing in), so edits show on the next visit.
(()=>{if(typeof buildFloor!=='function'||!window.SQICV||typeof DKIND==='undefined')return;
 const ST={rock:{name:'Rock cave',floor:['#6a6058','#625850'],wall:'#4a423c',trim:'#2e2824',cavey:1},mine:{name:'Mine',floor:['#6e5c48','#665440'],wall:'#4e4034',trim:'#2e2620',mine:1},
  ice:{name:'Ice cave',floor:['#7c8ea0','#748698'],wall:'#506478',trim:'#2c3848',cavey:1},root:{name:'Root hollow',floor:['#4e5e3a','#465632'],wall:'#2e3a24',trim:'#18200f',cavey:1},
  sand:{name:'Sandstone dig',floor:['#c8a870','#c0a068'],wall:'#a08050',trim:'#5a4028',cavey:1},tomb:{name:'Tomb',floor:['#4a4458','#443e52'],wall:'#2e2a3a',trim:'#1a1622',tomb:1}};
 const ITEMS={dchest:{n:'Chest',solid:1,use:'dchest'},crystal:{n:'Crystal',solid:1},boulder:{n:'Boulder',solid:1},bones:{n:'Bones'},pillar:{n:'Pillar',solid:1},urn:{n:'Urn',solid:1},ic_beam:{n:'Mine beam',solid:1},ic_cart:{n:'Mine cart',solid:1},stairs:{n:'Stairs down'},ore:{n:'Ore vein',solid:1}};
 const ORES=['rock','ore','gold','mith','adam'];
 const num=(v,lo,hi,d)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v)):d};
 const clean=(v,n)=>String(v==null?'':v).replace(/[<>&"]/g,'').trim().slice(0,n);
 const arr=v=>Array.isArray(v)?v:v&&typeof v==='object'?Object.values(v):[];
 let DG={};const REG=new Set();
 function normFloor(F){if(!F||typeof F!=='object')return null;const w=num(F.w,12,72,40)|0,h=num(F.h,10,56,30)|0;let g=String(F.g||'');if(g.length!==w*h)g=('#'.repeat(w*h));
  const G=new Uint8Array(w*h);for(let i=0;i<w*h;i++)G[i]=g[i]==='.'?0:1;const ex=w>>1;G[(h-1)*w+ex]=0;G[(h-2)*w+ex]=0;
  const it=arr(F.it).map(q=>q&&ITEMS[q.t]?{t:q.t,x:q.x|0,y:q.y|0,o:q.t==='ore'&&ORES.includes(q.o)?q.o:undefined}:null).filter(q=>q&&q.x>0&&q.y>0&&q.x<w-1&&q.y<h-1).slice(0,200);
  const m=arr(F.m).map(q=>q&&typeof q.k==='string'?{k:q.k.slice(0,40),x:q.x|0,y:q.y|0,hp:num(q.hp,0,9999,0)|0,b:!!q.b}:null).filter(q=>q&&q.x>0&&q.y>0&&q.x<w-1&&q.y<h-1).slice(0,80);
  return{w,h,G,ex,it,m}}
 function apply(lib){const L=lib&&lib.dungeons||{};DG={};for(const id in L){const d=L[id];if(!/^dg_[a-z0-9_]{1,30}$/.test(id)||!d)continue;const fl=arr(d.fl).map(normFloor).filter(Boolean).slice(0,8);if(!fl.length)continue;DG[id]={n:clean(d.n,40)||'Dungeon',st:ST[d.st]?d.st:'rock',fl}}
  for(const k of[...REG])if(!DG[k]){delete SQICV[k];delete DKIND[k];REG.delete(k)}
  for(const id in DG){const D=DG[id],S=ST[D.st];SQICV[id]=DKIND[id]=Object.assign({},S,{name:D.n,W:D.fl[0].w,H:D.fl[0].h,floors:D.fl.length,noboss:1,dg:id,mob:[['bat',1]],rg:null,at:'dungeon0'});if(!S.mine)delete DKIND[id].mine;REG.add(id)}
  // island entrances that use a design take its number of floors
  for(const k in DKIND){const K=DKIND[k];if(K&&K.dgw&&DG[K.dgw])K.floors=DG[K.dgw].fl.length}
  // floors built today come back fresh (not the one you're on)
  try{const here=SCENE&&SCENE.id;for(const k in DUN.floors){const R=DUN.floors[k];const kind=R&&R.dun&&R.dun.kind,K=DKIND[kind];if(k===here)continue;if((K&&(K.dg||K.dgw))||/^dg_/.test(kind||'')){try{HDRM.delete(R)}catch(e){}delete DUN.floors[k];delete ROOMS[k]}}}catch(e){}}
 SQA.onApply(apply);
 const designOf=kind=>{const K=DKIND[kind];if(!K)return null;return DG[K.dg]||DG[K.dgw]||null};
 function build(kind,f){const D=designOf(kind),K=DKIND[kind],F=D.fl[Math.max(0,Math.min(D.fl.length-1,f-1))],W=F.w,H=F.h,S=ST[D.st];
  const G=F.G.slice(),R={w:W,h:H,ex:F.ex,cave:1,tomb:S.tomb?1:0,floor:S.floor,wall:S.wall,trim:S.trim,items:[],solid:new Set(),mobs:[],icv:1,dun:{kind,f,G,seen:new Uint8Array(W*H),mm:null,bossSpawned:1,label:K.name}};
  for(const q of F.it){if(q.t==='stairs'&&f>=D.fl.length)continue;const i=q.y*W+q.x;G[i]=0;
   if(q.t==='ore'){R.items.push({t:'_obj',o:{t:q.o||'rock',hp:(typeof OHP!=='undefined'&&OHP[q.o||'rock'])||4},x:q.x,y:q.y,solid:true,dmine:1});R.solid.add(i);continue}
   const it={t:q.t,x:q.x,y:q.y};if(ITEMS[q.t].solid){it.solid=1;R.solid.add(i)}if(q.t==='dchest'){it.use='dchest';it.id=kind+f+'_'+q.x+'_'+q.y}R.items.push(it)}
  if(f<D.fl.length&&!R.items.some(it=>it.t==='stairs')){// no stairs drawn: put them as far from the entrance as possible
   let best=-1,bd=-1;for(let i=0;i<W*H;i++)if(!G[i]&&!R.solid.has(i)){const d=Math.abs(i%W-F.ex)+Math.abs(((i/W)|0)-(H-1));if(d>bd){bd=d;best=i}}if(best>=0)R.items.push({t:'stairs',x:best%W,y:(best/W)|0})}
  const M=window.SQISLIFE&&SQISLIFE.MOBS||{};
  for(const q of F.m){const T=M[q.k];if(!T)continue;const hp=q.hp||(q.b?Math.round(T.hp*4):T.hp);let m=null;try{m=rgMake(q.k,hp,q.x*16+8,q.y*16+8)}catch(e){}if(!m)continue;m.mhp=hp;m.icv=1;if(q.b){m.big=1;m._dgb=1}R.mobs.push(m)}
  for(let i=0;i<W*H;i++)if(G[i])R.solid.add(i);return R}
 {const _bf=buildFloor;buildFloor=function(kind,f){if(designOf(kind)){try{return build(kind,f)}catch(e){console.warn('dungeon builder',e)}}return _bf.apply(this,arguments)}}
 window.SQDUNGEONS={get list(){return DG},ST,ITEMS,ORES,build,designOf};
 // ======================= Dev Suite > Dungeons =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,dset,toast,fail,arm}=API;
 const T={sel:null,w:null,f:0,tool:'wall',mob:'',ore:'ore',dirty:false,undo:[],z:0};
 const D0=()=>S.draft.dungeons||(S.draft.dungeons={});
 const mobList=()=>Object.entries(window.SQISLIFE&&SQISLIFE.MOBS||{}).map(([k,m])=>[k,m.n]).sort((a,b)=>a[1].localeCompare(b[1]));
 const TOOLS=[['wall','🧱 Wall'],['floor','⬜ Floor'],['dchest','🎁 Chest'],['stairs','🪜 Stairs down'],['mob','👾 Monster'],['boss','💀 Boss'],['ore','⛏ Ore'],['crystal','💎 Crystal'],['boulder','🪨 Boulder'],['pillar','🏛 Pillar'],['urn','🏺 Urn'],['bones','🦴 Bones'],['ic_beam','🪵 Beam'],['ic_cart','🛒 Cart'],['erase','✖ Remove thing']];
 const GLY={dchest:['#c89838','▣'],stairs:['#f8f0d0','▼'],crystal:['#78d8f8','◆'],boulder:['#8a8078','●'],pillar:['#b8b0c8','▮'],urn:['#c87848','◍'],bones:['#e8e0c8','✕'],ic_beam:['#8a5a30','╫'],ic_cart:['#6a6a72','▬'],ore:['#c8a058','◈']};
 const OREC={rock:'#8a8078',ore:'#c87848',gold:'#f8d048',mith:'#6888e8',adam:'#48b878'};
 function blankFloor(w,h,rnd){w=w||40;h=h||30;let g;try{const Gn=genCave(w,h,rnd||dRng(Date.now()%1e6));g=[...Gn.G].map(v=>v?'#':'.').join('')}catch(e){g=Array.from({length:w*h},(_,i)=>{const x=i%w,y=(i/w)|0;return x>1&&y>1&&x<w-2&&y<h-2?'.':'#'}).join('')}return{w,h,g,it:[],m:[]}}
 function blank(){return{n:'New dungeon',st:'rock',fl:[blankFloor(40,30)]}}
 const F=()=>T.w&&arr(T.w.fl)[T.f];
 function snapU(){T.undo.push(JSON.stringify(T.w.fl));if(T.undo.length>60)T.undo.shift();T.dirty=true}
 function setCell(x,y){const fl=F();if(!fl||x<0||y<0||x>=fl.w||y>=fl.h)return false;const i=y*fl.w+x,edge=x===0||y===0||x===fl.w-1||y===fl.h-1;fl.it=arr(fl.it);fl.m=arr(fl.m);
  const rmAt=()=>{fl.it=fl.it.filter(q=>!(q.x===x&&q.y===y));fl.m=fl.m.filter(q=>!(q.x===x&&q.y===y))};const put=c=>{if(fl.g[i]!==c)fl.g=fl.g.slice(0,i)+c+fl.g.slice(i+1)};
  const t=T.tool;if(t==='wall'){if(x===fl.w>>1&&y>=fl.h-2)return false;rmAt();put('#');return true}if(t==='floor'){if(edge)return false;put('.');return true}if(t==='erase'){rmAt();return true}
  if(edge)return false;rmAt();put('.');if(t==='mob'||t==='boss'){const k=T.mob||(mobList()[0]||[])[0];if(!k)return false;fl.m.push(t==='boss'?{k,x,y,b:1}:{k,x,y});return true}
  if(t==='stairs')fl.it=fl.it.filter(q=>q.t!=='stairs');fl.it.push(t==='ore'?{t,x,y,o:T.ore}:{t,x,y});return true}
 function paint(){const c=document.getElementById('dvdg');const fl=F();if(!c||!fl)return;const box=c.parentElement.getBoundingClientRect();const z=T.z=Math.max(6,Math.min(22,Math.floor(Math.min((box.width-4)/fl.w,(innerHeight*.62)/fl.h))));
  c.width=fl.w*z;c.height=fl.h*z;const x=c.getContext('2d'),S2=ST[T.w.st]||ST.rock;x.imageSmoothingEnabled=false;
  for(let yy=0;yy<fl.h;yy++)for(let xx=0;xx<fl.w;xx++){const wall=fl.g[yy*fl.w+xx]!=='.';x.fillStyle=wall?((xx+yy)%2?S2.wall:S2.trim):S2.floor[(xx+yy)%2];x.fillRect(xx*z,yy*z,z,z)}
  if(z>=10){x.strokeStyle='rgba(255,255,255,.05)';x.beginPath();for(let i=1;i<fl.w;i++){x.moveTo(i*z+.5,0);x.lineTo(i*z+.5,c.height)}for(let i=1;i<fl.h;i++){x.moveTo(0,i*z+.5);x.lineTo(c.width,i*z+.5)}x.stroke()}
  x.textAlign='center';x.textBaseline='middle';x.font='700 '+Math.round(z*.8)+'px system-ui,sans-serif';
  for(const q of arr(fl.it)){const[col,ch]=GLY[q.t]||['#fff','?'];x.fillStyle=q.t==='ore'?OREC[q.o]||col:col;if(q.t==='stairs'&&T.f>=T.w.fl.length-1)x.globalAlpha=.35;x.fillText(ch,q.x*z+z/2,q.y*z+z/2+1);x.globalAlpha=1}
  const M=window.SQISLIFE&&SQISLIFE.MOBS||{};for(const q of arr(fl.m)){x.fillStyle=q.b?'#e83838':'#e87830';x.beginPath();x.arc(q.x*z+z/2,q.y*z+z/2,z*(q.b?.48:.36),0,7);x.fill();x.fillStyle='#fff';x.font='700 '+Math.round(z*(q.b?.6:.5))+'px system-ui,sans-serif';x.fillText(q.b?'B':((M[q.k]||{}).n||q.k)[0].toUpperCase(),q.x*z+z/2,q.y*z+z/2+1)}
  const ex=fl.w>>1;x.fillStyle='#f8d048';x.font='700 '+Math.round(z*.9)+'px system-ui,sans-serif';x.fillText('▲',ex*z+z/2,(fl.h-1)*z+z/2);
  const st=document.getElementById('dvdgst');if(st){const n=arr(fl.m).length,b=arr(fl.m).filter(q=>q.b).length,ch=arr(fl.it).filter(q=>q.t==='dchest').length,sta=arr(fl.it).some(q=>q.t==='stairs');
   st.textContent='Floor '+(T.f+1)+' of '+T.w.fl.length+' · '+fl.w+' × '+fl.h+' · '+n+' monster'+(n===1?'':'s')+(b?' ('+b+' boss)':'')+' · '+ch+' chest'+(ch===1?'':'s')+(T.f<T.w.fl.length-1?(sta?' · stairs placed':' · stairs: put far from the entrance automatically'):' · last floor')+(reach()?'':'  ·  ⚠️ some floor can\'t be reached from the entrance')+(T.dirty?' · unsaved':'')}}
 function reach(){const fl=F();if(!fl)return true;const W=fl.w,H=fl.h,seen=new Uint8Array(W*H),q=[(H-1)*W+(W>>1)];seen[q[0]]=1;const open=i=>fl.g[i]==='.'||i===(H-1)*W+(W>>1)||i===(H-2)*W+(W>>1);
  while(q.length){const i=q.pop(),x=i%W,y=(i/W)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=W||Y>=H)continue;const j=Y*W+X;if(!seen[j]&&open(j)){seen[j]=1;q.push(j)}}}
  for(const t of[...arr(fl.it).filter(q=>q.t==='stairs'),...arr(fl.m)])if(!seen[t.y*W+t.x])return false;return true}
 function render(){const L=D0(),Lv=S.live&&S.live.dungeons||{},ids=Object.keys(L).sort();
  let h='<div class="dv-spr'+(T.sel?' dv-has':'')+'"><div class="dv-ls"><button class="dv-b dv-pri" data-dgx="new">+ New dungeon</button><div class="dv-grid" style="grid-template-columns:1fr">';
  for(const id of ids){const d=L[id],same=JSON.stringify(d)===JSON.stringify(Lv[id]);h+='<button class="dv-it'+(T.sel===id?' dv-on':'')+'" data-dgs="'+E(id)+'" style="flex-direction:row;justify-content:flex-start;padding:8px 10px"><i class="dv-bd dv-'+(same?'live':'draft')+'">'+(same?'LIVE':'DRAFT')+'</i><span style="font-size:13px;text-align:left">'+E(d.n||id)+'<br><small class="dv-mut">'+arr(d.fl).length+' floor'+(arr(d.fl).length===1?'':'s')+' · '+E((ST[d.st]||ST.rock).name)+'</small></span></button>'}
  if(!ids.length)h+='<p class="dv-mut">No dungeons yet.</p>';h+='</div></div><div class="dv-ed">';
  if(!T.sel||!T.w)return h+'<div class="dv-card"><b>🏰 Dungeons</b><p class="dv-mut">Draw dungeons floor by floor: walls and floor, chests, stairs, ore, decorations, monsters and a boss. Players reach them through a dungeon entrance on an island (Islands tab: pick the entrance and choose this layout), and you can walk them straight away with "Walk it".</p></div></div></div>';
  const w=T.w,fl=F();
  h+='<div class="dv-card"><div class="dv-row" style="flex-wrap:wrap;gap:8px"><input type="text" data-dgf="n" maxlength="40" value="'+E(w.n||'')+'" style="width:200px"><select data-dgf="st">'+Object.entries(ST).map(([k,s])=>'<option value="'+k+'"'+(w.st===k?' selected':'')+'>'+s.name+'</option>').join('')+'</select>'+
   '<span class="dv-mut">'+E(T.sel)+'</span></div>'+
   '<div class="dv-row" style="flex-wrap:wrap;margin-top:6px"><span class="dv-mut">Floors:</span>'+w.fl.map((_,i)=>'<button class="dv-b'+(T.f===i?' dv-tl dv-on':'')+'" data-dgfl="'+i+'">'+(i+1)+'</button>').join('')+(w.fl.length<8?'<button class="dv-b" data-dgx="addfl">+ Floor</button>':'')+(w.fl.length>1?'<button class="dv-b '+(S.arm==='dgdelfl'?'dv-arm':'dv-bad')+'" data-dgx="delfl">'+(S.arm==='dgdelfl'?'Tap again':'Remove this floor')+'</button>':'')+'</div>'+
   '<div class="dv-row dv-dgtools" style="flex-wrap:wrap;margin-top:6px">'+TOOLS.map(([k,l])=>'<button class="dv-b'+(T.tool===k?' dv-tl dv-on':'')+'" data-dgt="'+k+'">'+l+'</button>').join('')+'</div>'+
   ((T.tool==='mob'||T.tool==='boss')?'<div class="dv-row"><span class="dv-mut">Monster</span><select data-dgf="mob">'+mobList().map(([k,n])=>'<option value="'+E(k)+'"'+(T.mob===k?' selected':'')+'>'+E(n)+'</option>').join('')+'</select>'+(T.tool==='boss'?'<span class="dv-mut">A boss has 4× health and boss music.</span>':'')+'</div>':'')+
   (T.tool==='ore'?'<div class="dv-row"><span class="dv-mut">Ore</span><select data-dgf="ore">'+ORES.map(o=>'<option'+(T.ore===o?' selected':'')+'>'+o+'</option>').join('')+'</select></div>':'')+
   '<div class="dv-cv" style="overflow:auto;max-height:66vh;background:#0c0e12;border-radius:8px"><canvas id="dvdg" style="display:block;margin:0 auto;touch-action:none;cursor:crosshair"></canvas></div><p class="dv-mut" id="dvdgst"></p>'+
   '<div class="dv-row" style="flex-wrap:wrap"><span class="dv-mut">Size</span><input type="number" data-dgsz="w" min="12" max="72" value="'+fl.w+'" style="width:64px">×<input type="number" data-dgsz="h" min="10" max="56" value="'+fl.h+'" style="width:64px"><button class="dv-b" data-dgx="resize">Resize</button>'+
   '<button class="dv-b" data-dgx="cave">Carve a random cave</button><button class="dv-b" data-dgx="rooms">Rooms and halls</button><button class="dv-b" data-dgx="fill">All wall</button><button class="dv-b" data-dgx="undo">Undo</button></div>'+
   '<div class="dv-row" style="flex-wrap:wrap;margin-top:8px"><button class="dv-b dv-pri" data-dgx="save">Save to draft</button><button class="dv-b" data-dgx="walk">Walk it (this floor)</button><button class="dv-b '+(S.arm==='dgdel'?'dv-arm':'dv-bad')+'" data-dgx="del">'+(S.arm==='dgdel'?'Tap again to delete':'Delete')+'</button></div>'+
   '<p class="dv-mut" style="font-size:12px">▲ = the way in (bottom middle). Drag to paint. Monsters sleep until a player comes near, like other dungeons; chests give the usual dungeon loot and refill every day.</p></div>';
  return h+'</div></div>'}
 function genRooms(w,h){const rnd=dRng(Date.now()%1e6);try{const Gn=genTomb(w,h,rnd);return[...Gn.G].map(v=>v?'#':'.').join('')}catch(e){return blankFloor(w,h).g}}
 const inTab=t=>S.tab==='dungeons'&&t&&document.getElementById('dvs')&&document.getElementById('dvs').contains(t);
 let drag=false,last='';
 const cellAt=e=>{const c=document.getElementById('dvdg'),r=c.getBoundingClientRect();return[Math.floor((e.clientX-r.left)/r.width*F().w),Math.floor((e.clientY-r.top)/r.height*F().h)]};
 document.addEventListener('pointerdown',e=>{if(S.tab!=='dungeons'||!e.target||e.target.id!=='dvdg'||!F())return;e.preventDefault();snapU();drag=true;last='';const[x,y]=cellAt(e);last=x+','+y;if(setCell(x,y))paint()},true);
 document.addEventListener('pointermove',e=>{if(!drag||S.tab!=='dungeons'||!F())return;if(['dchest','stairs','mob','boss'].includes(T.tool))return;const[x,y]=cellAt(e);const k=x+','+y;if(k===last)return;last=k;if(setCell(x,y))paint()},true);
 addEventListener('pointerup',()=>{if(drag){drag=false;paint()}});
 document.addEventListener('change',e=>{const t=e.target;if(!inTab(t)||!T.w)return;const f=t.dataset.dgf;if(!f)return;if(f==='mob'){T.mob=t.value;return}if(f==='ore'){T.ore=t.value;return}T.w[f]=t.value;T.dirty=true;if(f==='st')API.draw()},true);
 document.addEventListener('input',e=>{const t=e.target;if(!inTab(t)||!T.w||t.dataset.dgf!=='n')return;T.w.n=t.value;T.dirty=true},true);
 document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-dgx],[data-dgs],[data-dgt],[data-dgfl]');if(!inTab(t))return;e.preventDefault();
  if(t.dataset.dgs){if(T.dirty&&T.sel!==t.dataset.dgs&&!API.confirmLeave())return;T.sel=t.dataset.dgs;T.w=JSON.parse(JSON.stringify(D0()[T.sel]));T.w.fl=arr(T.w.fl);T.f=0;T.undo=[];T.dirty=false;API.draw();paint();return}
  if(t.dataset.dgt){T.tool=t.dataset.dgt;if((T.tool==='mob'||T.tool==='boss')&&!T.mob)T.mob=(mobList().find(m=>m[0]==='skel')||mobList()[0]||[''])[0];API.draw();paint();return}
  if(t.dataset.dgfl){T.f=+t.dataset.dgfl;API.draw();paint();return}
  const a=t.dataset.dgx,fl=F();
  if(a==='new'){let i=Object.keys(D0()).length+1,id;do id='dg_'+(i++);while(D0()[id]);T.sel=id;T.w=blank();T.f=0;T.undo=[];T.dirty=true;API.draw();paint();return}
  if(a==='addfl'){snapU();T.w.fl.push(blankFloor(fl.w,fl.h));T.f=T.w.fl.length-1;API.draw();paint();return}
  if(a==='delfl')return arm('dgdelfl',()=>{snapU();T.w.fl.splice(T.f,1);T.f=Math.max(0,T.f-1);API.draw();paint()});
  if(a==='undo'){const u=T.undo.pop();if(u){T.w.fl=JSON.parse(u);T.f=Math.min(T.f,T.w.fl.length-1);API.draw();paint()}return}
  if(a==='cave'){snapU();Object.assign(fl,{g:blankFloor(fl.w,fl.h).g,it:arr(fl.it).filter(q=>false),m:[]});paint();return}
  if(a==='rooms'){snapU();fl.g=genRooms(fl.w,fl.h);fl.it=[];fl.m=[];paint();return}
  if(a==='fill'){snapU();fl.g='#'.repeat(fl.w*fl.h);fl.it=[];fl.m=[];paint();return}
  if(a==='resize'){const w=num((document.querySelector('#dvs [data-dgsz="w"]')||{}).value,12,72,fl.w)|0,h=num((document.querySelector('#dvs [data-dgsz="h"]')||{}).value,10,56,fl.h)|0;snapU();
   let g='';for(let y=0;y<h;y++)for(let x=0;x<w;x++)g+=x<fl.w&&y<fl.h&&x>0&&y>0&&x<w-1&&y<h-1?fl.g[y*fl.w+x]:'#';fl.g=g;fl.w=w;fl.h=h;fl.it=arr(fl.it).filter(q=>q.x<w-1&&q.y<h-1);fl.m=arr(fl.m).filter(q=>q.x<w-1&&q.y<h-1);API.draw();paint();return}
  if(a==='save'){const o=JSON.parse(JSON.stringify(T.w));o.n=clean(o.n,40)||'Dungeon';D0()[T.sel]=o;dset('draft/dungeons/'+T.sel,o).then(()=>{T.dirty=false;toast('Saved to draft. Publish it from the Publish tab.');if(SQA.previewing)SQA.preview(S.draft);API.draw();paint()}).catch(fail);return}
  if(a==='walk'){const o=JSON.parse(JSON.stringify(T.w));D0()[T.sel]=o;SQA.preview(S.draft);const f=T.f+1;if(window.SQTEST&&SQTEST.goDun){SQTEST.goDun(T.sel,f)}else toast('Test tools aren\'t loaded.');return}
  if(a==='del')return arm('dgdel',async()=>{delete D0()[T.sel];try{await dset('draft/dungeons/'+T.sel,null);toast('Deleted from your draft.')}catch(x){fail(x)}T.sel=T.w=null;T.dirty=false;if(SQA.previewing)SQA.preview(S.draft);API.draw()})},true);
 SQSUITE.addTab('dungeons','Dungeons',{render,after(){paint()},dirty:()=>T.dirty,leave(){T.sel=T.w=null;T.dirty=false},changes(L,Dr){const out=[],a=L&&L.dungeons||{},b=Dr&&Dr.dungeons||{};for(const id of new Set([...Object.keys(a),...Object.keys(b)]))if(JSON.stringify(a[id])!==JSON.stringify(b[id]))out.push({kind:'ext',html:'🏰 Dungeon '+E((b[id]||a[id]).n||id)+': '+(b[id]?(a[id]?'changed':'new'):'removed')});return out}})})();
