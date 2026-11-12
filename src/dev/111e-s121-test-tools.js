// ---- 121. Dev Suite > Test: tools for checking things in the game quickly ----
// Go anywhere (an island, a town on Hollow, any dungeon floor), set the time of day, spawn monsters next to you,
// clear them, heal, can't be hurt, give yourself items and gold, set skill levels, and a checkpoint of your character to
// go back to after testing. Everything here changes the developer's own character only (it is saved like normal play),
// which is why the checkpoint exists.
(()=>{if(!window.SQSUITE)return;const api=SQSUITE.api,{E,toast}=api,root=document.getElementById('dvs');
 const T={q:'',qty:1,mob:'',mobN:1,mobHp:0,dun:'',floor:1};
 // ---- can't be hurt: P.hp can still go up, never down ----
 let god=false,hpv=null;
 function setGod(on){if(on===god)return;god=on;if(on){hpv=P.hp;Object.defineProperty(P,'hp',{configurable:true,enumerable:true,get(){return hpv},set(v){v=+v;if(!(v<hpv))hpv=v}})}
  else{const v=hpv;delete P.hp;P.hp=v}}
 // monsters you spawn stay until beaten, even in a town (towns clear monsters) or in Hollow's daylight (which wears them down)
 const DEVM=new Set();let devScene=null;
 const _u=upd;upd=function(dt){const r=_u.apply(this,arguments);if(god&&dead){dead=false}
  if(DEVM.size){const sc=SCENE?SCENE.id:'hollow';if(sc!==devScene){DEVM.clear();return r}const melt=!SCENE&&dark()<.05?(+dt||0)*.5:0;
   for(const m of DEVM){if(m.dead||m.hp<=0){DEVM.delete(m);continue}if(melt)m.hp+=melt;if(!en.includes(m)&&Math.hypot(m.x-P.x,m.y-P.y)<400)en.push(m)}}return r};
 // ---- places ----
 const here=()=>{const R=SCENE&&SCENE.room;return R&&R.region?'island':SCENE?'inside':'hollow'};
 const regions=()=>Object.keys(WORLD_REGIONS).filter(id=>id==='hollow'||RG_GEN[id]).map(id=>[id,WORLD_REGIONS[id].name||id]);
 const TOWNS=[['gen','Hollow Village'],['sm1','Saltmere'],['fh1','Frosthollow'],['dh1','Dusthaven'],['tw1','Tidewatch']];
 const dkinds=()=>Object.keys(DKIND).filter(k=>DKIND[k]).map(k=>[k,DKIND[k].name||k]).sort((a,b)=>a[1].localeCompare(b[1]));
 // out of any dungeon or building, back to the island or Hollow you came from
 function outside(){for(let k=0;k<12&&SCENE&&!(SCENE.room&&SCENE.room.region);k++){const id=SCENE.id;try{leaveScene()}catch(e){break}if(SCENE&&SCENE.id===id)break}return!(SCENE&&!(SCENE.room&&SCENE.room.region))}
 function goIsland(id){if(!outside()){toast('Could not get outside from here.');return}if(id===curRegion()){toast('You are already there.');return}
  const ro=routeOpen;routeOpen=()=>true;try{SQSUITE.close();routeGo(id)}finally{routeOpen=ro}}
 function goTown(k){outside();if(here()!=='hollow'){toast('Towns are on Hollow Island. Go to Hollow first.');return}const b=BLD.find(q=>q.k===k)||BLD.find(q=>q.k.indexOf(k.replace(/\d+$/,''))===0);if(!b){toast('That town isn\'t on this map.');return}
  P.x=(b.tx+(b.w>>1))*16+8;P.y=(b.ty+3)*16+8;en=[];SQSUITE.close();toast('Moved to '+(TOWNS.find(t=>t[0]===k)||[0,k])[1]+'.')}
 function goDun(kind,f){if(!outside()){toast('Could not get outside from here.');return}const K=DKIND[kind];if(!K)return;f=Math.max(1,Math.min(K.floors||5,f|0||1));
  const ret={x:P.x,y:P.y};try{SQSUITE.close();const R=dFloor(kind,f);enterScene(dKey(kind,f),null,ret);dArrive(R,null);toast(K.name+', floor '+f+'. The way out brings you back here.')}catch(e){console.warn(e);toast('Could not go there: '+e.message)}}
 // ---- monsters ----
 const mobs=()=>{const M=window.SQISLIFE&&SQISLIFE.MOBS||{};return Object.keys(M).map(k=>[k,M[k].n,M[k].hp,M[k].rg]).sort((a,b)=>a[1].localeCompare(b[1]))};
 function spawn(k,n,hp){const M=window.SQISLIFE&&SQISLIFE.MOBS&&SQISLIFE.MOBS[k];if(!M)return;let made=0;
  for(let j=0;j<n;j++)for(let t=0;t<20;t++){const a=Math.random()*6.283,d=40+Math.random()*30,x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;if(solid(x,y))continue;
   const h=hp>0?hp:M.hp,e=rgMake(k,h,x,y);e.mhp=h;if(M.rg)e.rg=M.rg;delete e.night;e._dev=1;try{RG_OWN.add(e)}catch(_){}en.push(e);DEVM.add(e);devScene=SCENE?SCENE.id:'hollow';made++;break}
  toast(made?'Spawned '+made+' '+M.n.toLowerCase()+(made>1?'s':'')+'.':'No room to spawn here.')}
 // ---- checkpoint: the whole save, kept on this device ----
 const CK='sq_dev_ckpt';const ck=()=>{try{return JSON.parse(localStorage.getItem(CK)||'null')}catch(e){return null}};
 function ckSave(){try{const s=snap();localStorage.setItem(CK,JSON.stringify({at:Date.now(),s}));toast('Checkpoint saved.')}catch(e){toast('Could not save a checkpoint: '+e.message)}}
 function ckLoad(){const c=ck();if(!c){toast('No checkpoint yet.');return}if(!confirm('Put your character back to the checkpoint from '+new Date(c.at).toLocaleString()+'? Everything since then is lost.'))return;
  try{setGod(false);applySave(c.s);saveLocal(true);try{saveCloud(true)}catch(e){}toast('Back to the checkpoint.');api.draw()}catch(e){console.warn(e);toast('Could not load the checkpoint: '+e.message)}}
 // ---- the tab ----
 const tm=()=>{const p=time%DAYLEN;return p<DAYLIGHT?(p<160?'morning':p<330?'midday':'afternoon'):'night'};
 function render(){const items=Object.keys(INAME).filter(k=>INAME[k]&&(!T.q||INAME[k].toLowerCase().includes(T.q.toLowerCase())||k.includes(T.q.toLowerCase()))).sort((a,b)=>INAME[a].localeCompare(INAME[b])).slice(0,60);
  const c=ck(),card=(t,b)=>'<div class="dv-card" style="margin:0 0 10px"><b>'+t+'</b>'+b+'</div>',M=mobs(),D=dkinds();
  return'<div style="max-width:900px">'+
  '<p class="dv-mut">Quick tools for checking your work in the game. They change your own character (saved like normal play), so save a checkpoint first if you want to go back afterwards.</p>'+
  card('Checkpoint','<p class="dv-mut">'+(c?'Saved '+new Date(c.at).toLocaleString()+'.':'None yet.')+' Kept on this device.</p><div class="dv-row"><button class="dv-b dv-pri" data-tt="cks">Save a checkpoint now</button><button class="dv-b" data-tt="ckl"'+(c?'':' disabled')+'>Put my character back to it</button></div>')+
  card('Go somewhere','<p class="dv-mut">You are '+(here()==='hollow'?'on Hollow Island':here()==='island'?'on '+(WORLD_REGIONS[curRegion()]||{}).name:'inside ('+E(SCENE.id)+') <button class="dv-b" data-tt="out">Go back outside</button>')+'.</p>'+
   '<div class="dv-mut">Islands (sails straight there)</div><div class="dv-chips">'+regions().map(([id,n])=>'<button class="dv-b'+(id===curRegion()?' dv-tl dv-on':'')+'" data-tt="isl" data-v="'+id+'">'+E(n)+'</button>').join('')+'</div>'+
   '<div class="dv-mut" style="margin-top:6px">Towns on Hollow</div><div class="dv-chips">'+TOWNS.map(([k,n])=>'<button class="dv-b" data-tt="town" data-v="'+k+'">'+n+'</button>').join('')+'</div>'+
   '<div class="dv-row" style="margin-top:6px"><span class="dv-mut">Dungeon</span><select data-ti="dun">'+D.map(([k,n])=>'<option value="'+k+'"'+(T.dun===k?' selected':'')+'>'+E(n)+'</option>').join('')+'</select><span class="dv-mut">floor</span><input type="number" data-ti="floor" min="1" max="9" value="'+T.floor+'" style="width:60px"><button class="dv-b" data-tt="dun">Go down</button></div>')+
  card('Time of day','<p class="dv-mut">Now: '+tm()+'.</p><div class="dv-chips">'+[['m','Morning'],['d','Midday'],['e','Evening'],['n','Night']].map(([k,n])=>'<button class="dv-b" data-tt="time" data-v="'+k+'">'+n+'</button>').join('')+'</div>')+
  card('Monsters','<div class="dv-row"><select data-ti="mob">'+M.map(([k,n,hp])=>'<option value="'+k+'"'+(T.mob===k?' selected':'')+'>'+E(n)+' ('+hp+' hp)</option>').join('')+'</select><span class="dv-mut">how many</span><input type="number" data-ti="mobN" min="1" max="12" value="'+T.mobN+'" style="width:60px">'+
   '<span class="dv-mut">health</span><input type="number" data-ti="mobHp" min="0" max="9999" value="'+T.mobHp+'" style="width:80px" title="0 = its usual health"><button class="dv-b dv-pri" data-tt="spawn">Spawn next to me</button><button class="dv-b" data-tt="clear">Clear monsters near me</button></div>')+
  card('Health','<div class="dv-row"><button class="dv-b" data-tt="heal">Heal fully</button><label class="dv-chk"><input type="checkbox" data-tt="god"'+(god?' checked':'')+'> Can\'t be hurt</label><span class="dv-mut">(until you untick it or reload)</span></div>')+
  card('Items and gold','<div class="dv-row"><input type="search" data-ti="q" placeholder="Search items" value="'+E(T.q)+'" style="max-width:220px"><span class="dv-mut">how many</span><input type="number" data-ti="qty" min="1" max="100000" value="'+T.qty+'" style="width:90px"></div>'+
   '<div class="dv-chips" style="max-height:220px;overflow:auto;margin-top:6px">'+items.map(k=>'<button class="dv-b" data-tt="give" data-v="'+k+'" title="'+E(k)+'">'+E(INAME[k])+(inv[k]?' <small>('+inv[k]+')</small>':'')+'</button>').join('')+(items.length===60?'<span class="dv-mut">…search to find more</span>':'')+'</div>'+
   '<div class="dv-row" style="margin-top:6px"><span class="dv-mut">Gold</span><input type="number" data-ti="gold" min="0" max="100000000" value="'+GLD+'" style="width:120px"><button class="dv-b" data-tt="gold">Set</button></div>')+
  card('Skill levels','<div class="dv-row" style="flex-wrap:wrap">'+SKN.map((n,i)=>'<label class="dv-mut" style="font-size:12px">'+E(n)+'<br><input type="number" data-sk="'+i+'" min="1" max="99" value="'+lvOf(i)+'" style="width:60px"></label>').join('')+'</div><p class="dv-mut">Type a level and tap away to set it.</p>')+
  '</div>'}
 function after(){}
 root.addEventListener('click',e=>{const t=e.target.closest('[data-tt]');if(!t||!root.querySelector('[data-tt]'))return;const a=t.dataset.tt,v=t.dataset.v;
  if(a==='god'){setGod(t.checked);toast(god?'You can\'t be hurt now.':'You can be hurt again.');return}
  if(a==='cks')return ckSave(),api.draw();if(a==='ckl')return ckLoad();
  if(a==='out'){outside();toast('Outside.');api.draw();return}if(a==='isl')return goIsland(v);if(a==='town')return goTown(v);if(a==='dun')return goDun(T.dun||dkinds()[0][0],T.floor);
  if(a==='time'){const d=Math.floor(time/DAYLEN)*DAYLEN;time=d+({m:40,d:240,e:DAYLIGHT-30,n:DAYLIGHT+(DAYLEN-DAYLIGHT)/2})[v];toast('Time set.');api.draw();return}
  if(a==='spawn'){const k=T.mob||(mobs()[0]||[])[0];if(!k)return;SQSUITE.close();spawn(k,Math.max(1,Math.min(12,T.mobN|0)),T.mobHp|0);return}
  if(a==='clear'){let n=0;for(const m of en)if(!m.dead&&!m._rp&&m.type!=='boss'&&Math.hypot(m.x-P.x,m.y-P.y)<260){m.dead=1;m.dropped=1;n++}toast(n+' monster'+(n===1?'':'s')+' cleared.');return}
  if(a==='heal'){P.hp=6;toast('Healed.');return}
  if(a==='give'){const n=Math.max(1,Math.min(100000,T.qty|0||1));inv[v]=(inv[v]|0)+n;try{saveLocal()}catch(_){}toast('+'+n+' '+INAME[v]+'.');api.draw();return}
  if(a==='gold'){const i=root.querySelector('[data-ti="gold"]');GLD=Math.max(0,Math.min(1e8,+i.value|0));try{saveLocal()}catch(_){}toast('Gold set to '+GLD+'.');return}});
 root.addEventListener('change',e=>{const t=e.target;if(t.dataset.ti){const f=t.dataset.ti;if(f==='gold')return;T[f]=f==='q'||f==='mob'||f==='dun'?t.value:+t.value;if(f==='q')api.draw();return}
  if(t.dataset.sk!=null){const i=+t.dataset.sk,L=Math.max(1,Math.min(99,t.value|0||1));XPS[i]=L>1?XT[L-1]:0;try{saveLocal()}catch(_){}toast(SKN[i]+' set to level '+L+'.')}});
 root.addEventListener('input',e=>{const t=e.target;if(t.dataset.ti==='q'){T.q=t.value;clearTimeout(T.qt);T.qt=setTimeout(()=>{api.draw();const s=root.querySelector('[data-ti="q"]');if(s){s.focus();s.setSelectionRange(s.value.length,s.value.length)}},250)}});
 SQSUITE.addTab('test','Test',{render,after});
 window.SQTEST={setGod,spawn,goDun,goTown,goIsland,ckSave,ckLoad,get god(){return god}}})();
