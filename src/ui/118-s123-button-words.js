// ---- 123. Buttons say what they'll do ----
// The action buttons change job with what's around you, so their word changes too:
//   HIT button: PLACE (building), TALK (facing someone), REEL (line out), a station's job (SMELT, SMITH, COOK, CRAFT,
//     CHANGE, TRASH, TRAIN), OPEN / SLEEP / MOVE (chest, bed, furniture at home), READ (a sign), CHOP / MINE / PICK
//     (what's in front of you), FISH (water in front), HIT otherwise or when a monster is in front.
//   EAT button: DONE (building), COOK (at a fire with something you can cook), EAT otherwise.
//   TALK button: where it said USE, the word for the thing: OPEN, SLEEP, READ, ENTER, REST, SAIL, or a station's job.
// The little key/controller hint under the word (PC, gamepad) is kept as it was.
(()=>{const STW={furnace:'SMELT',anvil:'SMITH',stove:'COOK',bench:'CRAFT',wardrobe:'CHANGE',trash:'TRASH',dummy:'TRAIN',planter:'PICK'};
 const USEW={chest:'OPEN',dchest:'OPEN',loot:'OPEN',bed:'SLEEP',look:'READ',icv:'ENTER',bwrest:'REST',regdock:'SAIL'};
 const MINE=new Set([...Object.values(STW),...Object.values(USEW)].filter(w=>w!=='SAIL'));
 const PICKT=new Set(['bush','cactus','shroom','nutbush']);
 const objWord=t=>{if(!t)return null;const s=typeof SKOF!=='undefined'?SKOF[t]:0;if(s===1)return'CHOP';if(s===2||(window.SQBOUL&&SQBOUL[t])||t==='boulder')return'MINE';if(s===3||PICKT.has(t))return'PICK';
  if(/tree|pine|oak|willow|maple|yew/.test(t))return'CHOP';if(/rock|ore|gold|mith|adam|crystal/.test(t))return'MINE';return null};
 // what's on the tile in front of you (the same spot the HIT button reaches)
 function frontThing(){const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16),R=SCENE&&SCENE.room;
  if(!SCENE){if(tx<0||ty<0||tx>=N||ty>=N)return null;const o=obj[ty*N+tx];return o?{t:o.t}:null}
  if(!R)return null;
  if(R.region){for(const l of R.useItems||[])if(l.use==='look'&&tx>=l.x&&ty>=l.y&&tx<l.x+(l.w||1)&&ty<l.y+(l.h||1))return{read:1};const it=rgObjAt(R,tx,ty);return it&&!it.gone&&it.o?{t:it.o.t}:null}
  const it=(R.items||[]).find(q=>q.x===tx&&q.y===ty&&!q.gone&&(q.t==='_obj'||q.t==='boulder'));return it?{t:it.t==='boulder'?(it.ore||'boulder'):it.o&&it.o.t}:null}
 function hitWord(){if(BUILD)return'PLACE';
  try{if(typeof facingNpc==='function'&&facingNpc())return'TALK'}catch(e){}
  if(typeof FISH!=='undefined'&&FISH)return'REEL';
  try{const st=typeof frontStation==='function'&&frontStation();if(st)return STW[st.t]||'USE'}catch(e){}
  try{if(SCENE&&typeof inHome==='function'&&inHome()){const R=SCENE.room,[x,y]=frontTile(),f=SCENE.house.furn.get(y*R.w+x);if(f)return f.t==='bed'?'SLEEP':f.t==='chest'?'OPEN':'MOVE'}
   if(!SCENE){const[x,y]=frontTile(),s=STR.get(y*N+x);if(s&&s.t==='chest')return'OPEN';if(s&&s.t==='bed')return'SLEEP'}}catch(e){}
  const[fx,fy]=front(13);if(en.some(n=>!n.dead&&Math.hypot(n.x-fx,n.y-fy)<16))return'HIT';
  try{const[f2x,f2y]=front(14);if(fishWaterAt(Math.floor(f2x/16),Math.floor(f2y/16)))return'FISH'}catch(e){}
  try{const th=frontThing();if(th&&th.read)return'READ';const w=th&&objWord(th.t);if(w)return w}catch(e){}
  return'HIT'}
 function eatWord(){if(BUILD)return'DONE';
  try{if(nearFire(P.x,P.y,45)&&((inv.meat|0)>0||typeof COOKS!=='undefined'&&COOKS.some(c=>(inv[c.raw]|0)>0&&lvOf(4)>=c.lv)))return'COOK'}catch(e){}
  return'EAT'}
 function useWord(){try{if(typeof nearFurn==='function'){const it=nearFurn();if(it){if(it.use&&USEW[it.use])return USEW[it.use];const f=it.f;if(f)return f.t==='bed'?'SLEEP':f.t==='chest'?'OPEN':STW[f.t]||null}}}catch(e){}
  try{if(typeof nearStruct==='function'){const i=nearStruct();if(i!=null){const s=STR.get(i);if(s)return s.t==='bed'?'SLEEP':s.t==='chest'?'OPEN':STW[s.t]||null}}}catch(e){}return null}
 // set a button's word, keeping whatever hint is under it
 function put(el,w){if(!el||!w)return;const h=el.innerHTML,i=h.indexOf('<small'),word=i<0?h:h.slice(0,i);if(word===w)return;el.innerHTML=w+(i<0?'':h.slice(i))}
 // HIT/EAT words are worked out every 0.1 s; the TALK button's word is put back every frame (other sections write USE on it
 // every frame, so doing it only every 0.1 s made it flip between USE and the word, e.g. SAIL on a pier)
 let t=0,uw=null;const _u=upd;upd=function(dt){_u.apply(this,arguments);if(dead)return;const fresh=(t-=dt)<=0;if(fresh)t=.1;
  try{if(fresh){put(document.getElementById('a'),hitWord());put(document.getElementById('e'),eatWord())}
   const tw=tk.innerHTML.split('<')[0];if(tk.style.display!=='none'&&(tw==='USE'||MINE.has(tw)&&typeof tkLab!=='undefined'&&tkLab==='USE')){if(fresh||uw===null)uw=useWord()||'USE';put(tk,uw)}else uw=null}catch(e){}};
 window.SQWORDS={hitWord,eatWord,useWord}})();
