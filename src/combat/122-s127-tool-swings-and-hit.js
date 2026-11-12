// ---- 127. HIT does what's in front of you: tool swings everywhere, no surprise spells ----
// 1. Chopping and mining show only the axe / pickaxe swing, never the sword swing on top. The game only knew this for
//    plain trees, pines, cacti, rocks and ore on Hollow Island; now every tree, ore and boulder counts (by the object's
//    skill, SKOF), on every island and in dungeons too, and other players no longer see a sword swing when you chop.
// 2. HIT never casts a spell. With a wand it used to cast whenever a monster was somewhere ahead, even while you were
//    chopping a tree; spells are cast with the CAST button (touch), the mouse (computer) or the controller's aim.
// 3. The last moment of a cast no longer flashes a sword swing.
(()=>{if(typeof ACTN==='undefined'||typeof drawAct!=='function')return;
 const PICKT=new Set(['bush','cactus','shroom','nutbush']);
 const kindOf=t=>{if(!t)return null;const s=typeof SKOF!=='undefined'?SKOF[t]:0;if(t==='cactus')return'chop';if(s===1)return'chop';if(s===2||(window.SQBOUL&&SQBOUL[t])||t==='boulder')return'mine';if(s===3||PICKT.has(t))return null;
  if(/tree|pine|oak|willow|maple|yew/.test(t))return'chop';if(/rock|ore|gold|mith|adam|crystal/.test(t))return'mine';return null};
 // the object on the tile HIT reaches, and its kind
 function frontObj(){const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16),R=SCENE&&SCENE.room;let t=null;
  if(!SCENE){if(tx>=0&&ty>=0&&tx<N&&ty<N){const o=obj[ty*N+tx];t=o&&o.t}}
  else if(R&&R.region){try{const it=rgObjAt(R,tx,ty);t=it&&!it.gone&&it.o?it.o.t:null}catch(e){}}
  else if(R){const it=(R.items||[]).find(q=>q.x===tx&&q.y===ty&&!q.gone&&(q.t==='_obj'||q.t==='boulder'));t=it?(it.t==='boulder'?(it.ore||'boulder'):it.o&&it.o.t):null}
  return{tx,ty,t,k:kindOf(t)}}
 const monsterAhead=()=>{const[fx,fy]=front(13);return en.some(n=>!n.dead&&Math.hypot(n.x-fx,n.y-fy)<16)};
 let HIT=false;
 const _wt=wandTarget;wandTarget=function(){if(HIT)return null;return _wt.apply(this,arguments)};
 const _a=attack;attack=function(){if(dead||menuOpen||pnOpen||BUILD||swing>0||FISH){return _a.apply(this,arguments)}
  let f=null;try{f=frontObj();if(monsterAhead()||(typeof facingNpc==='function'&&facingNpc())||(window.SQSLEDGE&&SQSLEDGE()))f=null;
   if(f&&f.k&&!(f.k==='chop'?TL.axe>0:TL.pick>0))f=null}catch(e){f=null}
  const tool=f&&f.k,q0=window.SQPVQUIET,s0=swing;HIT=true;if(tool)window.SQPVQUIET=true;
  let out;try{out=_a.apply(this,arguments)}finally{HIT=false;if(tool)window.SQPVQUIET=q0}
  // the game swung at the tree/rock: make sure it's the tool swing that shows
  if(tool&&s0<=0&&swing>0&&!(ACTN&&ACTN.t<.05&&(ACTN.type==='chop'||ACTN.type==='mine')))
   ACTN={type:f.k,t:0,dur:.32,face:[face[0],face[1]],tx:f.tx,ty:f.ty,hit:false,tree:f.t};
  return out};
 // drawing: the tool swing indoors/on islands too (the game only drew it on Hollow), and no sword at the end of a cast
 let castUntil=0;
 const _pp=pP;pP=function(tm){const now=performance.now();if(typeof CASTT!=='undefined'&&CASTT>0)castUntil=now+swing*1000+30;
  const tool=ACTN&&(ACTN.type==='chop'||ACTN.type==='mine'),hide=swing>0&&(tool||now<castUntil),sw=swing;if(hide)swing=0;
  try{_pp.apply(this,arguments)}finally{swing=sw}
  if(tool&&SCENE&&!(hurt>0&&Math.floor(tm*20)%2))try{drawAct(tm)}catch(e){}};
 window.SQTOOLSW={front:frontObj,kindOf}})();
