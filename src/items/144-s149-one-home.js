// ---- 149. One home per player ----
// A player can have one house OR one castle in the whole world (Hollow's HOUSES and the islands' window.SQRH from 067).
// Placing another is refused while one stands ("pack it up first": HIT it). A save that has more than one (from before
// this rule) keeps one, a castle before a house and then the one with the most furniture, and packs the others into the
// bag: the house/castle item itself, every piece of furniture and everything in their chests. This happens once, when
// the save is loaded, and is saved right after.
(()=>{const ISL=()=>window.SQRH||[];
 const homes=()=>HOUSES.map(h=>({h,isl:false})).concat(ISL().map(h=>({h,isl:true})));
 const where=o=>o.isl?(WORLD_REGIONS[o.h.rg]?WORLD_REGIONS[o.h.rg].name:'an island'):'Hollow Island';
 const what=h=>h.castle?'castle':'house';
 function pack(o){const h=o.h;
  if(o.isl){const L=ISL(),j=L.indexOf(h);if(j>=0)L.splice(j,1);try{rhSolidSync()}catch(e){}}
  else{HOUSES=HOUSES.filter(q=>q!==h);try{for(const i of houseTiles(h))BS.delete(i)}catch(e){}}
  const k=h.castle?'castle':'house';inv[k]=(inv[k]|0)+1;
  for(const f of h.furn.values()){inv[f.t]=(inv[f.t]|0)+1;if(f.items)for(const k2 in f.items)inv[k2]=(inv[k2]|0)+(f.items[k2]|0)}
  if(HOMESP===h.id)HOMESP=null}
 function enforce(){const L=homes();if(L.length<2)return 0;
  const keep=L.slice().sort((a,b)=>(b.h.castle?1:0)-(a.h.castle?1:0)||b.h.furn.size-a.h.furn.size)[0];let n=0;const gone=[];
  for(const o of L){if(o===keep)continue;gone.push(what(o.h)+' on '+where(o));pack(o);n++}
  const m='You can only have one home now, so you kept your '+what(keep.h)+' on '+where(keep)+'. Your '+gone.join(' and your ')+(n>1?' were':' was')+' packed into your bag with everything inside.';
  setTimeout(()=>{try{say(m);msgT=9;try{mpLog('game',m)}catch(e){}saveLocal(true);saveCloud(true)}catch(e){}},2500);return n}
 // (with backyards (150) loaded, 150 calls SQONEHOME.enforce itself once the yards are read, so they get packed too)
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);try{if(!window.SQYARD)enforce()}catch(e){console.warn(e)}return out}}
 // placing a second one is refused
 {const _sb=startBuild;startBuild=function(k){if((k==='house'||k==='castle')&&homes().length){const o=homes()[0];
    say('You already have a '+what(o.h)+' on '+where(o)+'. You can only have one home: pack that one up first (HIT its walls), then place this one.');msgT=7;try{sfx('swish')}catch(e){}try{closePanel()}catch(e){}return}
   return _sb.apply(this,arguments)}}
 window.SQONEHOME={homes,enforce}})();
