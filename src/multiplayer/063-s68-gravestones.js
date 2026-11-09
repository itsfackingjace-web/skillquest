// ---------------------------------------------------------------- 68. Gravestones
// When you fall, everything you'd normally lose (what's in your bag except gear) goes into a gravestone where you
// fell instead. Graves are strictly public: anyone who finds one can loot it, the owner included, and it crumbles
// (with whatever is left) 15 minutes after you fell. Your own grave shows a countdown and where it is.
// Fell at sea? The grave is on the last land you stood on. Playing offline, your graves are kept on this device.
// Database: graves/<id> = {u, n, loc, x, y, at, i:{item:count}}. The owner makes it; anyone can take items out
// (counts can only go down, through transactions, so two people can never take the same thing); anyone can clear
// it away once it has crumbled.
const GRV={list:{},local:{},unsub:null,lastSpot:null,lostN:0,hint:null,open:null,busy:false},GRAVE_LIFE=15*60*1000,GTAB=33;
const grvNow=()=>MP.on?mpNow():Date.now();
const grvLeft=g=>g.at+GRAVE_LIFE-grvNow();
const grvItems=g=>{const o={};const s=g&&g.i;if(s&&typeof s==='object')for(const k in s){sqBookReg(k);const n=Math.floor(+s[k]||0);if(n>0&&INAME[k])o[k]=n}return o};
const grvAll=()=>{const a=[];for(const id in GRV.list)a.push(GRV.list[id]);for(const id in GRV.local)a.push(GRV.local[id]);return a};
const grvMine=()=>grvAll().filter(g=>(g.local||(MP.user&&g.u===MP.user.uid))&&grvLeft(g)>0&&Object.keys(grvItems(g)).length);
// offline graves live on this device
try{const s=JSON.parse(localStorage.getItem('sq_graves')||'{}');for(const id in s){const g=s[id];if(g&&g.at+GRAVE_LIFE>Date.now()){g.local=true;g.id=id;GRV.local[id]=g}}}catch(e){}
const grvSaveLocal=()=>{try{const o={};for(const id in GRV.local){const g=GRV.local[id];if(Object.keys(grvItems(g)).length&&grvLeft(g)>0)o[id]={u:g.u,n:g.n,loc:g.loc,x:g.x,y:g.y,ar:g.ar,ax:g.ax,ay:g.ay,at:g.at,i:g.i}}localStorage.setItem('sq_graves',JSON.stringify(o))}catch(e){}};
// remember where you last stood on solid ground (mpLoc is blank once you've fallen)
setInterval(()=>{if(dead||typeof SAILING!=='undefined'&&SAILING&&!SCENE||window.SQRSAIL&&SQRSAIL.on)return;const L=mpLoc();
 // the outdoor area and spot (inside a building or dungeon: its door), so the grave can go on the map
 const R=SCENE&&SCENE.room;if(!SCENE||R&&R.region)GRV.lastOut=curRegion();const op=SCENE&&!(R&&R.region)&&SCENE.ret?[SCENE.ret.x,SCENE.ret.y]:[P.x,P.y];
 if(L)GRV.lastSpot={loc:L,x:Math.round(P.x),y:Math.round(P.y),ar:GRV.lastOut||'hollow',ax:Math.round(op[0]),ay:Math.round(op[1])}},250);
// the moment you get up again: fill a grave with what you were carrying
// it happens the moment you fall (not when you get up), and the game saves right away, so closing the game
// while you're down doesn't bring your things back
GRV.fell=false;GRV.fellN=0;
setInterval(()=>{if(!dead){GRV.fell=false;return}if(GRV.fell||NEWG)return;GRV.fell=true;const spot=GRV.lastSpot;if(!spot||typeof inv!=='object'){GRV.fellN=0;return}
 const lost={};for(const k in inv){const n=inv[k]|0;if(n>0&&!EQK.includes(k)&&INAME[k]){lost[k]=n;inv[k]=0}}GRV.fellN=Object.keys(lost).length;if(!GRV.fellN)return;
 grvMake(lost,spot);const hp0=P.hp;dead=false;P.hp=Math.max(1,hp0);try{saveLocal(true);saveCloud(true)}catch(e){}finally{dead=true;P.hp=hp0}},100);
function grvMake(items,spot){const g={u:MP.user?MP.user.uid:'me',n:myName().slice(0,12),loc:spot.loc,x:spot.x,y:spot.y,i:items},mk=spot.ar&&isFinite(spot.ax)&&isFinite(spot.ay)?{ar:spot.ar,ax:spot.ax,ay:spot.ay}:{};Object.assign(g,mk);
 const local=()=>{const id='L'+Date.now().toString(36);g.at=Date.now();g.local=true;g.id=id;GRV.local[id]=g;grvSaveLocal()};
 const n=Object.values(items).reduce((a,b)=>a+b,0);mpLog('game','You fell! '+n+' item'+(n>1?'s are':' is')+' in your grave ('+LOCN(spot.loc)+'). Anyone can loot it, and it crumbles in 15 minutes.');
 if(!MP.on||!MP.user){local();return}const d=FB.db;const id='g'+MP.user.uid.slice(0,8)+Date.now().toString(36);
 d.set(d.ref(FB.D,'graves/'+id),{u:g.u,n:g.n,loc:g.loc,x:g.x,y:g.y,...mk,i:items,at:d.serverTimestamp()}).then(()=>{if(!GRV.list[id])GRV.list[id]={...g,id,at:mpNow()}}).catch(e=>{mpErr(e);local()})}
// ---- shared graves ----
function grvStart(){const d=FB.db;GRV.unsub=d.onValue(d.ref(FB.D,'graves'),s=>{const v=s.val()||{},L={};for(const id in v){const g=v[id];if(!g||typeof g!=='object'||typeof g.x!=='number'||typeof g.y!=='number')continue;
   L[id]={id,u:String(g.u||''),n:String(g.n||'Someone').replace(/[<>]/g,'').slice(0,12),loc:String(g.loc||''),x:g.x,y:g.y,ar:typeof g.ar==='string'?g.ar.slice(0,20):'',ax:+g.ax,ay:+g.ay,at:+g.at||0,i:g.i||{}}}GRV.list=L;
  if(GRV.open&&!GRV.open.local&&!L[GRV.open.id]&&pnOpen&&ptab===GTAB){GRV.open=null;closePanel();say('The grave is empty now.')}else if(pnOpen&&ptab===GTAB)rPn()});
 MP.unsub.push(()=>{if(GRV.unsub)GRV.unsub();GRV.unsub=null;GRV.list={}})}
{const _ms=mpStart;mpStart=async function(u){await _ms(u);if(MP.on&&MP.user&&!GRV.unsub)try{grvStart()}catch(e){mpErr(e)}}}
// tidy up: crumbled graves disappear (anyone may clear one away once its time is up)
setInterval(()=>{for(const id in GRV.local)if(grvLeft(GRV.local[id])<=0||!Object.keys(grvItems(GRV.local[id])).length){delete GRV.local[id];grvSaveLocal()}
 if(!MP.on)return;for(const id in GRV.list){const g=GRV.list[id];if(grvLeft(g)<-5000||!Object.keys(grvItems(g)).length&&grvNow()-g.at>8000){delete GRV.list[id];FB.db.remove(FB.db.ref(FB.D,'graves/'+id)).catch(()=>{})}}},5000);
// ---- in the world ----
const grvHere=()=>{const L=mpLoc();if(!L)return[];return grvAll().filter(g=>g.loc===L&&grvLeft(g)>0&&Object.keys(grvItems(g)).length)};
function grvNear(){let best=null,bd=26;for(const g of grvHere()){const d=Math.hypot(g.x-P.x,g.y-(P.y-2));if(d<bd){bd=d;best=g}}return best}
function grvDraw(g,tm){const x=Math.round(g.x),y=Math.round(g.y),S='#7a8496',L='#b8c0d0',D='#4a5060',O='#202838',mine=g.local||(MP.user&&g.u===MP.user.uid);
 Rg(x-6,y+3,13,3,'rgba(0,0,0,.25)');Rg(x-5,y-11,10,15,O);Rg(x-4,y-12,8,1,O);Rg(x-4,y-10,8,13,S);Rg(x-3,y-11,6,1,S);Rg(x-4,y-10,1,13,L);Rg(x-3,y-11,2,1,L);Rg(x+3,y-9,1,12,D);
 Rg(x-1,y-8,2,8,D);Rg(x-3,y-6,6,2,D);Rg(x-6,y+2,12,2,'#6a4a2a');Rg(x-5,y+1,2,1,'#3a8a3a');Rg(x+3,y+1,2,1,'#3a8a3a');
 if(grvLeft(g)<60000&&Math.floor(tm*4)%2)Rg(x-4,y-10,8,13,'rgba(248,200,80,.35)'); // last minute: it flickers
 if(mine){const b=Math.round(Math.sin(tm*4)*1.5);Rg(x-1,y-17+b,3,3,'#f8d848');Rg(x,y-14+b,1,1,'#f8d848')}}
{const _pP=pP;pP=function(tm){try{for(const gv of grvHere())grvDraw(gv,tm)}catch(e){}return _pP(tm)}}
// the hint when you're close, and your own grave's countdown
{const st=document.createElement('style');st.textContent=`#grvh{position:fixed;left:50%;transform:translateX(-50%);top:58%;z-index:9;display:none;padding:6px 10px;font:600 13px ${PF};pointer-events:none;text-align:center;max-width:calc(100vw - 24px);box-sizing:border-box}
#grvt{position:fixed;left:14px;top:calc(env(safe-area-inset-top,0px) + 202px);z-index:9;display:none;padding:5px 9px;font:600 12px ${PF};pointer-events:none;color:#b03828;max-width:calc(100vw - 150px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box}
.grl{display:flex;align-items:center;gap:6px;padding:6px;border-bottom:1px solid #d8e0f0;font-size:14px}.grl span{flex:1}.grl button,.gra button{font:700 13px ${PF};padding:7px 10px;border:2px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer}.gra{display:flex;gap:8px;margin-top:10px}.gra button{flex:1;padding:11px}.gra .y{background:#38a828;color:#fff;border-color:#206818}`;document.head.appendChild(st)}
const grvH=el('div','grvh','g3',''),grvT=el('div','grvt','g3','');document.body.append(grvH,grvT);
const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
setInterval(()=>{const busy=dead||pnOpen||menuOpen||TS.open;const g=busy?null:grvNear();
 if(g){const mine=g.local||(MP.user&&g.u===MP.user.uid);grvH.textContent=(mine?'Your grave':g.n+'\'s grave')+' · crumbles in '+mmss(grvLeft(g))+' · '+(GPON?'✕ to loot':isPC?'T to loot':'tap LOOT');grvH.style.display='block'}else grvH.style.display='none';
 const m=busy?[]:grvMine().sort((a,b)=>grvLeft(a)-grvLeft(b));if(m.length){const a=m[0];grvT.textContent='Your grave '+mmss(grvLeft(a))+' · '+LOCN(a.loc)+(m.length>1?' (+'+(m.length-1)+')':'');grvT.style.display='block'}else grvT.style.display='none'},250);
// ---- looting ----
{const _t=talk;talk=function(){if(!pnOpen&&!menuOpen&&!dead){const g=grvNear();if(g){GRV.open=g;pnOpen=true;ptab=GTAB;jx=jy=0;fromMenu=false;pn.style.display='block';rPn();sfx('talk');return}}return _t()}}
function graveHTML(){const g=GRV.open&&(GRV.open.local?GRV.local[GRV.open.id]:GRV.list[GRV.open.id]);if(!g)return'<div class="tl">GRAVE</div><div class="qc"><p>Nothing left here.</p></div>';
 const mine=g.local||(MP.user&&g.u===MP.user.uid),it=grvItems(g),ks=Object.keys(it);
 let h='<div class="tl">'+(mine?'YOUR GRAVE':esc(g.n).toUpperCase()+'\'S GRAVE')+'</div><div class="trst" style="text-align:center;font-size:13px;margin:4px 0 8px">Crumbles in '+mmss(grvLeft(g))+(mine?'':' · finders keepers!')+'</div>';
 if(!ks.length)return h+'<div class="qc"><p>Someone got here first. It\'s empty.</p></div>';
 for(const k of ks)h+='<div class="grl"><span>'+esc(INAME[k])+' <i style="font-style:normal;opacity:.65">×'+it[k]+'</i></span><button data-gr="one" data-k="'+k+'">TAKE</button></div>';
 return h+'<div class="gra"><button class="y" data-gr="all"'+(GRV.busy?' disabled':'')+'>TAKE ALL</button></div>'}
async function grvTake(keys){const g0=GRV.open;if(!g0||GRV.busy)return;if(Math.hypot(g0.x-P.x,g0.y-P.y)>40){closePanel();return}GRV.busy=true;const got={};
 try{if(g0.local){const g=GRV.local[g0.id];if(!g)return;for(const k of keys){const n=grvItems(g)[k]|0;if(n>0){got[k]=n;delete g.i[k]}}grvSaveLocal()}
  else{const d=FB.db;for(const k of keys){let n=0;const ref=d.ref(FB.D,'graves/'+g0.id+'/i/'+k);
    if(d.runTransaction){const r=await d.runTransaction(ref,cur=>{n=0;if(!cur||cur<=0)return;n=cur;return null}).catch(e=>{mpErr(e);return null});if(!r||!r.committed)n=0}
    else{const s=await d.get(ref);n=+s.val()||0;if(n>0)await d.remove(ref)}
    if(n>0)got[k]=n}}
  const ks=Object.keys(got);for(const k of ks)inv[k]=(inv[k]|0)+got[k];
  if(ks.length){say('You took '+ks.map(k=>got[k]+' × '+INAME[k].toLowerCase()).join(', ')+'.');sfx('pickup');try{saveLocal(true);saveCloud(true)}catch(e){}
   if(!g0.local&&MP.user&&g0.u!==MP.user.uid)mpLog('game','You looted '+g0.n+'\'s grave.')}else{say('Too slow! Someone already took that.');sfx('swish')}}
 finally{GRV.busy=false}if(pnOpen&&ptab===GTAB)rPn()}
{const _r=rPn;rPn=function(){if(ptab===GTAB){panelChrome('');pbd.innerHTML=graveHTML();return}_r()}}
{const _oc=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('[data-gr]');if(b&&ptab===GTAB){const g=GRV.open&&(GRV.open.local?GRV.local[GRV.open.id]:GRV.list[GRV.open.id]);if(!g)return;
  grvTake(b.dataset.gr==='all'?Object.keys(grvItems(g)):[b.dataset.k]);return}_oc(e)}}
GRV.lostPreview=()=>GRV.fell?GRV.fellN:0;
window.SQGRV=GRV;
// touch: the TALK button (shown as LOOT) opens the grave
window.SQGRVNEAR=()=>{try{return!dead&&!pnOpen&&!menuOpen&&!TS.open&&!!grvNear()}catch(e){return false}};
tk.addEventListener('touchstart',e=>{if(pnOpen||menuOpen||dead||nearNpc())return;if(grvNear()){e.preventDefault();e.stopImmediatePropagation();talk()}},{passive:false,capture:true});
