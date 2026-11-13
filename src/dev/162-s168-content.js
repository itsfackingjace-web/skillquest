// ---- 168. Content without code: Dev Suite > Content (items, recipes, shops, quests, monsters, loot tables) ----
// Library section content = {items, recipes, shops, quests, mobs, loot}; every entry is a plain record, checked here before
// it touches the game, and taken back out of the game's lists when it changes or goes away (so preview/publish can redo it).
//   items.it_<id>   {n, pl, d, v sell price, t:'mat'|'food'|'pot', heal hearts, hun food 0-100, mana, buff 'str'|'iron'|'swift', bs seconds}
//                   new bag items (INVK/INAME/IDESC/SELLP/SN/SHORT, EXTRA_BAG); food goes in FOODS (EAT/USE), potions in
//                   FOODS with pot:1 (USE from the bag only; EAT skips them). Icons: Sprites tab (same key). Saves keep counts
//                   of items that haven't loaded yet (PEND, like 111a2's new gear), so never rename a published item.
//   recipes.r_<id>  {sk:'craft'|'smith'|'smelt'|'cook', out, c:[{k,n}] (cook: raw = the one input), lv, xp}
//                   craft -> GOODS (crafting menu), smith/smelt -> SM (anvil/furnace; 039's ulSmith rebuilt), cook -> COOKS.
//   shops.<id>      {n, add:[{k,m,c}]}: ids gen (Hollow general store, GEN), bw (Briarwood, SHOPBW), af (Ashfall, SHOPAF) add
//                   stock to those shops; cs_<id> are new shops, run by island-builder people whose job is shop:cs_<id>.
//   quests.q_<id>   {n, d, t:'gather'|'kill'|'visit', k (item / monster key / region), amt, take, g, xs skill, xp, rk, rn, after}
//                   given by island-builder people whose job is quest:<ids> (comma separated: the first one open is offered).
//                   Shown in the quest log through SQQEXTRA. Saved as `cq` {id: 1 active | 99 done, id+'#': kills so far}.
//   mobs.cm_<id>    {n, base, hp}: a new normal monster kind cm:<letters> (SQISLIFE.MOBS) that moves like `base`; its look,
//                   damage, speed and drops are the Monsters tab's (props/mobs m:cm:...).
//   loot.lt_<id>    {n, r rolls, g:[min,max] gold, e:[{k,a,b,w}], on:[monster keys], p chance %}: rolled when one of `on` is
//                   beaten, and by island chests that list the table (count = rolls of the table).
(()=>{if(!window.SQA)return;
 const num=(v,lo,hi,d)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v)):d};
 const clean=(v,n)=>String(v==null?'':v).replace(/[<>&"]/g,'').trim().slice(0,n);
 const arr=v=>Array.isArray(v)?v:v&&typeof v==='object'?Object.values(v):[];
 const MOBS=()=>window.SQISLIFE&&SQISLIFE.MOBS||{};
 const C={items:{},recipes:{},shops:{},quests:{},mobs:{},loot:{}};// what's applied now
 const isItem=k=>typeof k==='string'&&!!INAME[k];
 // ======================= items =======================
 const REG=new Set(),PEND={},POT={};
 function unregItem(k){if(inv[k]|0)PEND[k]=(PEND[k]|0)+(inv[k]|0);delete inv[k];for(const L of[INVK,typeof EXTRA_BAG!=='undefined'?EXTRA_BAG:[]]){let i;while((i=L.indexOf(k))>=0)L.splice(i,1)}
  for(let i=FOODS.length-1;i>=0;i--)if(FOODS[i].k===k)FOODS.splice(i,1);delete INAME[k];delete IDESC[k];delete SELLP[k];delete SN[k];if(typeof SHORT!=='undefined')delete SHORT[k];delete POT[k];REG.delete(k)}
 function regItem(k,o){if(INAME[k]&&!REG.has(k))return;// never take over one of the game's own items
  if(REG.has(k))unregItem(k);REG.add(k);INVK.push(k);if(typeof EXTRA_BAG!=='undefined')EXTRA_BAG.push(k);
  INAME[k]=o.n;IDESC[k]=o.d;SELLP[k]=o.v;SN[k]=o.pl;if(typeof SHORT!=='undefined')SHORT[k]=o.n.toLowerCase();
  if(o.t==='food')FOODS.push({k,n:o.n.toLowerCase(),heal:o.heal,hun:o.hun});
  if(o.t==='pot'){FOODS.push({k,n:o.n.toLowerCase(),heal:o.heal,hun:0,pot:1});POT[k]=o}
  FOODS.sort((a,b)=>b.heal-a.heal||b.hun-a.hun);if(PEND[k]){inv[k]=(inv[k]|0)+PEND[k];delete PEND[k]}else inv[k]=inv[k]|0}
 function items(L){const want={};for(const id in L){const o=L[id];if(!/^it_[a-z0-9_]{1,30}$/.test(id)||!o||typeof o!=='object')continue;const n=clean(o.n,30);if(!n)continue;
   const t=['food','pot'].includes(o.t)?o.t:'mat';want[id]={n,pl:clean(o.pl,32)||n,d:clean(o.d,300),v:num(o.v,0,1e7,1)|0,t,heal:num(o.heal,0,6,0)|0,hun:num(o.hun,0,100,t==='food'?20:0)|0,
    mana:num(o.mana,0,50,0)|0,buff:['str','iron','swift'].includes(o.buff)?o.buff:'',bs:num(o.bs,10,1800,120)|0}}
  for(const k of[...REG])if(!want[k])unregItem(k);for(const k in want)if(JSON.stringify(C.items[k])!==JSON.stringify(want[k])||!REG.has(k))regItem(k,want[k]);C.items=want}
 {const _uf=useFood;useFood=function(k){const o=POT[k];if(!o)return _uf.apply(this,arguments);if((inv[k]|0)<1)return;inv[k]--;const got=[];
   if(o.heal){P.hp=Math.min(6,P.hp+o.heal);got.push('+'+o.heal+' HP')}if(o.mana){MANA=Math.min(typeof maxMP==='function'?maxMP():10,MANA+o.mana);got.push('+'+o.mana+' mana')}
   if(o.buff&&window.LUX&&LUX.BUFF){LUX.BUFF[o.buff]=performance.now()+o.bs*1000;got.push({str:'stronger hits',iron:'better blocks',swift:'free sprinting'}[o.buff]+' for '+(o.bs>=120?Math.round(o.bs/60)+' min':o.bs+' s'))}
   say('You drink the '+o.n.toLowerCase()+(got.length?': '+got.join(', '):'')+'.');try{sfx('quest')}catch(e){}saveLocal(true);if(pnOpen)rPn()}}
 {const _e=eat;eat=function(){const keep={};for(const k in POT){keep[k]=inv[k]|0;inv[k]=0}try{return _e.apply(this,arguments)}finally{for(const k in keep)inv[k]=(inv[k]|0)+keep[k]}}}
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);try{for(const k in PEND)if(PEND[k])s.inv[k]=(s.inv[k]|0)+PEND[k];if(Object.keys(CQ).length)s.cq={...CQ}}catch(e){}return s}}
 {const _ap=applySave;applySave=function(S){for(const k in PEND)delete PEND[k];const out=_ap.apply(this,arguments);
   try{if(S&&S.inv)for(const k in S.inv)if(/^it_/.test(k)&&+S.inv[k]>0){if(REG.has(k))inv[k]=Math.min(1e6,+S.inv[k]|0);else PEND[k]=Math.min(1e6,+S.inv[k]|0)}}catch(e){}
   for(const k in CQ)delete CQ[k];try{if(S&&S.cq&&typeof S.cq==='object')for(const k in S.cq){const v=+S.cq[k];if(/^q_[a-z0-9_]{1,30}#?$/.test(k)&&isFinite(v))CQ[k]=Math.max(0,Math.min(1e6,v|0))}}catch(e){}return out}}
 {const _ng=newGame;newGame=function(){for(const k in PEND)delete PEND[k];for(const k in CQ)delete CQ[k];return _ng.apply(this,arguments)}}
 try{KNOWN49.add('cq')}catch(e){}
 // ======================= recipes =======================
 const ADDED={GOODS:[],SM:[],COOKS:[]};
 const takeOut=(L,name)=>{for(const r of ADDED[name]){const i=L.indexOf(r);if(i>=0)L.splice(i,1)}ADDED[name]=[]};
 function recipes(L){takeOut(GOODS,'GOODS');takeOut(SM,'SM');takeOut(COOKS,'COOKS');const out={};
  for(const id in L){const r=L[id];if(!/^r_[a-z0-9_]{1,30}$/.test(id)||!r||typeof r!=='object')continue;const sk=['craft','smith','smelt','cook'].includes(r.sk)?r.sk:'craft';
   if(!isItem(r.out))continue;const c={};for(const q of arr(r.c)){if(q&&isItem(q.k)&&q.k!==r.out){const n=num(q.n,1,999,1)|0;c[q.k]=(c[q.k]|0)+n}}if(!Object.keys(c).length)continue;
   const lv=num(r.lv,1,99,1)|0,xp=num(r.xp,0,5000,10)|0,n=INAME[r.out];out[id]={sk,out:r.out,c,lv,xp};
   if(sk==='craft'){const g={k:r.out,n,c,req:lv,xp,v:SELLP[r.out]|0,_cu:id};GOODS.push(g);ADDED.GOODS.push(g)}
   else if(sk==='cook'){const raw=Object.keys(c)[0];const g={raw,ck:r.out,n:(INAME[raw]||raw).toLowerCase(),lv,xp,_cu:id};COOKS.push(g);ADDED.COOKS.push(g)}
   else{const g={k:r.out,n,c,lv,xp,_cu:id};if(sk==='smelt')g.smelt=1;SM.push(g);ADDED.SM.push(g)}}
  try{if(typeof UL39==='function'&&typeof ulSmith!=='undefined'){const o=UL39(SM,r=>r.lv,r=>(r.smelt?'Smelt ':'Forge ')+r.n.toLowerCase()+(r.def?' (wear at Defence '+r.def+')':''));for(const k in ulSmith)delete ulSmith[k];Object.assign(ulSmith,o)}}catch(e){}
  C.recipes=out}
 // ======================= shops =======================
 const SHOPL={gen:typeof GEN!=='undefined'?GEN:null,bw:typeof SHOPBW!=='undefined'?SHOPBW:null,af:typeof SHOPAF!=='undefined'?SHOPAF:null};
 const SHOPN={gen:'Hollow general store',bw:'Briarwood shop',af:'Ashfall forge camp'};const SADD={gen:[],bw:[],af:[]};
 const stock=o=>arr(o&&o.add).map(q=>q&&isItem(q.k)?{k:q.k,m:num(q.m,1,1000,1)|0,c:num(q.c,0,1e7,10)|0}:null).filter(Boolean).slice(0,30);
 function shops(L){for(const s in SADD){const A=SHOPL[s];if(A)for(const e of SADD[s]){const i=A.indexOf(e);if(i>=0)A.splice(i,1)}SADD[s]=[]}const out={};
  for(const id in L){const o=L[id];if(!o||typeof o!=='object')continue;const st=stock(o);
   if(SHOPL[id]){for(const q of st){const nm=(q.m>1?q.m+' ':'')+(q.m>1?(SN[q.k]||INAME[q.k]):INAME[q.k]);const e=id==='gen'?{n:nm,c:q.c,f:()=>{inv[q.k]=(inv[q.k]|0)+q.m}}:{n:nm,c:q.c,k:q.k,m:q.m};SHOPL[id].push(e);SADD[id].push(e)}out[id]={add:st}}
   else if(/^cs_[a-z0-9_]{1,30}$/.test(id))out[id]={n:clean(o.n,40)||'Shop',add:st}}
  C.shops=out}
 let CS=null;// the custom shop open now
 function openShop(id,who){const o=C.shops[id];if(!o)return false;CS={id,who};shop='cshop';pnOpen=true;ptab=2;jx=jy=0;try{fromMenu=false}catch(e){}pn.style.display='block';rPn();try{sfx('talk')}catch(e){}return true}
 function shopHTML(){const o=C.shops[CS.id];if(!o)return'';let h='<div class="tl">'+esc(o.n)+'</div>'+(CS.who?'<div class="tl" style="font-weight:400;font-size:12px;opacity:.7;margin-top:-6px">Run by '+esc(CS.who)+'</div>':'')+'<div class="tl" style="margin-top:12px">Buy</div><div class="qc"><small>Gold: '+GLD+'</small></div>';
  o.add.forEach((q,i)=>{h+='<button class="sb" data-csh="b'+i+'" style="opacity:'+(GLD>=q.c?1:.45)+'">'+(q.m>1?q.m+' ':'')+esc(q.m>1?(SN[q.k]||INAME[q.k]):INAME[q.k])+'<br><small>'+q.c+' gold</small></button>'});
  if(!o.add.length)h+='<div class="tl" style="font-weight:400;opacity:.6">Nothing for sale right now.</div>';
  h+='<div class="tl" style="margin-top:12px">Sell</div>';let any=0;for(const k in SELLP){const c=inv[k]|0;if(c<=0||!SELLP[k])continue;any=1;h+='<button class="sb" data-csh="s'+k+'">Sell all '+esc(SN[k]||INAME[k]||k)+' ('+c+')<br><small>+'+c*SELLP[k]+' gold</small></button>'}
  if(!any)h+='<div class="tl" style="font-weight:400;opacity:.6">Nothing to sell</div>';return h}
 {const _r=rPn;rPn=function(){if(ptab===2&&shop==='cshop'&&CS){try{panelChrome('')}catch(e){}pbd.innerHTML=shopHTML();return}return _r.apply(this,arguments)}}
 {const _oc=pbd.onclick;pbd.onclick=e=>{if(shop==='cshop'&&CS){const b=e.target.closest('[data-csh]');if(b){const a=b.dataset.csh,o=C.shops[CS.id];
     if(a[0]==='b'){const q=o&&o.add[+a.slice(1)];if(!q)return;if(GLD<q.c){say('Not enough gold');sfx('swish');return}GLD-=q.c;inv[q.k]=(inv[q.k]|0)+q.m;say('Bought '+(q.m>1?q.m+' ':'')+(q.m>1?SN[q.k]||INAME[q.k]:INAME[q.k]).toLowerCase()+'.');sfx('coin')}
     else{const k=a.slice(1),c=inv[k]|0;if(c>0&&SELLP[k]){const v=c*SELLP[k];GLD+=v;inv[k]=0;say('Sold for '+v+' gold');sfx('coin')}}try{svg()}catch(_){}saveLocal(true);rPn();return}}return _oc(e)}}
 {const _cp=closePanel;closePanel=function(){if(shop==='cshop'){CS=null;shop=null}return _cp.apply(this,arguments)}}
 // ======================= quests =======================
 const CQ={};
 function quests(L){const out={};for(const id in L){const q=L[id];if(!/^q_[a-z0-9_]{1,30}$/.test(id)||!q||typeof q!=='object')continue;const t=['gather','kill','visit'].includes(q.t)?q.t:'gather';
   const o={n:clean(q.n,40)||'A favour',d:clean(q.d,400),t,k:clean(q.k,40),amt:t==='visit'?1:num(q.amt,1,10000,1)|0,take:!!q.take&&t==='gather',g:num(q.g,0,1e6,0)|0,
    xs:num(q.xs,-1,40,-1)|0,xp:num(q.xp,0,1e6,0)|0,rk:isItem(q.rk)?q.rk:'',rn:num(q.rn,1,1e5,1)|0,after:/^q_[a-z0-9_]{1,30}$/.test(q.after)?q.after:''};
   if(t==='gather'&&!isItem(o.k))continue;if(t==='visit'&&!(typeof WORLD_REGIONS!=='undefined'&&WORLD_REGIONS[o.k]))continue;if(t==='kill'&&!o.k)continue;out[id]=o}
  C.quests=out;GIVERS=findGivers()}
 let LIB={},GIVERS={};// quest id -> {area, x, y, name}
 function findGivers(){const G={},I=LIB.islands||{};for(const iid in I){const isl=I[iid];if(!isl)continue;const area=/^cu_/.test(iid)?iid:/^ed_/.test(iid)?iid.slice(3):null;if(!area)continue;
   for(const Q of arr(isl.npc)){if(!Q||typeof Q.ro!=='string')continue;const m=/^quest:(.*)$/.exec(Q.ro);if(!m)continue;for(const qid of m[1].split(','))if(!G[qid])G[qid]={area,x:(Q.x|0)*16+8,y:(Q.y|0)*16+8,name:clean(Q.n,24)||'Islander'}}}return G}
 const mkeyOf=n=>{try{return window.SQPROPS?SQPROPS.mkey(n).replace(/^m:/,''):n.type}catch(e){return n.type}};
 const prog=(id,q)=>q.t==='gather'?Math.min(q.amt,inv[q.k]|0):q.t==='kill'?Math.min(q.amt,CQ[id+'#']|0):(CQ[id+'#']|0)?1:0;
 const ready=(id,q)=>prog(id,q)>=q.amt;
 const open=(id,q)=>CQ[id]!==99&&(!q.after||CQ[q.after]===99);
 const rewTxt=q=>{const p=[];if(q.g)p.push(q.g+' gold');if(q.xp&&q.xs>=0)p.push(q.xp+' '+(SKN[q.xs]||'')+' XP');if(q.rk)p.push((q.rn>1?q.rn+' × ':'')+INAME[q.rk]);return p.join(' · ')};
 const stepTxt=q=>q.t==='gather'?'Bring '+q.amt+' '+((q.amt>1?SN[q.k]:INAME[q.k])||q.k).toLowerCase():q.t==='kill'?'Defeat '+q.amt+' '+mobName(q.k)+(q.amt>1?'s':''):'Travel to '+(WORLD_REGIONS[q.k]&&WORLD_REGIONS[q.k].name||q.k);
 const mobName=k=>{const m=MOBS()[k];return(m&&m.n||k.replace(/^.*:/,'')).toLowerCase()};
 (window.SQQEXTRA=window.SQQEXTRA||[]).push(()=>{const out=[];for(const id in C.quests){const q=C.quests[id],G=GIVERS[id];if(!G)continue;const e={id:'cq:'+id,cat:G.name,area:G.area,name:q.n,rew:rewTxt(q),at:G};
   if(CQ[id]===99){out.push({...e,st:'done'});continue}if(!open(id,q))continue;const on=CQ[id]===1,r=on&&ready(id,q);
   out.push({...e,desc:q.d,st:on?'active':'avail',kind:'side',step:on?(r?'Return to '+G.name:stepTxt(q)):'Talk to '+G.name,prog:on?prog(id,q)+'/'+q.amt:'',ready:r,at:on&&!r?null:G})}return out});
 function finish(id,q,who){if(q.take)inv[q.k]=Math.max(0,(inv[q.k]|0)-q.amt);CQ[id]=99;delete CQ[id+'#'];if(q.g)GLD+=q.g;if(q.xp&&q.xs>=0)addXp(q.xs,q.xp);if(q.rk)inv[q.rk]=(inv[q.rk]|0)+q.rn;
  say(who+': "Thank you!" Quest complete: '+q.n+(rewTxt(q)?' ('+rewTxt(q)+')':'')+'.');msgT=7;try{sfx('quest');svg()}catch(e){}saveLocal(true)}
 // ======================= island people with a job =======================
 window.SQNPCROLE=function(it){const ro=String(it&&it.ro||'');let m=/^shop:(cs_[a-z0-9_]+)$/.exec(ro);if(m)return openShop(m[1],it.name);
  m=/^quest:(.+)$/.exec(ro);if(!m)return false;const who=it.name||'Islander';
  for(const id of m[1].split(',')){const q=C.quests[id];if(!q||!open(id,q))continue;
   if(CQ[id]===1){if(ready(id,q)){finish(id,q,who);return true}say(who+': "'+stepTxt(q)+(q.t==='visit'?'':' ('+prog(id,q)+'/'+q.amt+')')+'."');msgT=6;try{sfx('talk')}catch(e){}return true}
   CQ[id]=1;if(q.t==='kill')CQ[id+'#']=0;say(who+': "'+(q.d||q.n)+'" New quest: '+q.n+'. '+stepTxt(q)+'.');msgT=Math.min(10,4+(q.d||'').length/20);try{sfx('quest')}catch(e){}saveLocal(true);return true}
  return false};
 // kills and visits
 {const _ed=enemyDrop;enemyDrop=function(n){const out=_ed.apply(this,arguments);try{if(n&&!n._rp){const k=mkeyOf(n);
   for(const id in C.quests){const q=C.quests[id];if(CQ[id]===1&&q.t==='kill'&&(q.k===k||q.k===n.type||q.k===n.rk)){CQ[id+'#']=(CQ[id+'#']|0)+1;if(CQ[id+'#']===q.amt){say('Quest: '+q.n+' — done! Go back to '+(GIVERS[id]?GIVERS[id].name:'them')+'.');msgT=5}}}
   for(const tid in C.loot){const T=C.loot[tid];if(T.on.length&&(T.on.includes(k)||T.on.includes(n.type))&&Math.random()*100<T.p)give(roll(tid),'Loot')}}}catch(e){console.warn('content',e)}return out}}
 setInterval(()=>{try{const r=typeof curRegion==='function'?curRegion():'hollow';for(const id in C.quests){const q=C.quests[id];if(CQ[id]===1&&q.t==='visit'&&q.k===r&&!CQ[id+'#']){CQ[id+'#']=1;say('Quest: '+q.n+' — you made it! Go back to '+(GIVERS[id]?GIVERS[id].name:'them')+'.');msgT=5}}}catch(e){}},1000);
 // ======================= monsters =======================
 const keyOf=id=>'cm:'+id.slice(3).replace(/_/g,'').replace(/[0-9]/g,d=>'abcdefghij'[d]);const CM={};
 function mobs(L){for(const k in CM){delete MOBS()[k];delete CM[k]}const out={};for(const id in L){const m=L[id];if(!/^cm_[a-z0-9_]{1,24}$/.test(id)||!m||typeof m!=='object')continue;
   const base=typeof m.base==='string'&&MOBS()[m.base]&&!/^c[bm]:/.test(m.base)?m.base:'wolf',key=keyOf(id),o={n:clean(m.n,30)||'Monster',base,hp:num(m.hp,1,3000,10)|0,key};
   CM[key]=o;MOBS()[key]={n:o.n,hp:o.hp,rg:null};out[id]=o}C.mobs=out;try{window.SQPROPS&&SQPROPS.recat&&SQPROPS.recat()}catch(e){}}
 {const _mk=rgMake;rgMake=function(key,hp,x,y){const M=CM[key];if(!M)return _mk.apply(this,arguments);const n=_mk(M.base,hp,x,y);if(n){n.hp=n.mhp=M.hp;n.rk=key;delete n.rv;n.cm=key}return n}}
 // ======================= loot tables =======================
 function loot(L){const out={};for(const id in L){const T=L[id];if(!/^lt_[a-z0-9_]{1,30}$/.test(id)||!T||typeof T!=='object')continue;
   const e=arr(T.e).map(q=>q&&isItem(q.k)?{k:q.k,a:num(q.a,1,1e5,1)|0,b:0,w:num(q.w,1,1000,10)|0}:null).filter(Boolean).map((q,i,A)=>{const s=arr(T.e).filter(z=>z&&isItem(z.k))[i];q.b=Math.max(q.a,num(s&&s.b,1,1e5,q.a)|0);return q}).slice(0,30);
   const g=arr(T.g);out[id]={n:clean(T.n,40)||'Loot',r:num(T.r,1,10,1)|0,g:[num(g[0],0,1e6,0)|0,Math.max(num(g[0],0,1e6,0)|0,num(g[1],0,1e6,0)|0)],e,on:arr(T.on).filter(k=>typeof k==='string'&&k.length<40).slice(0,20),p:num(T.p,0,100,100)}}
  C.loot=out}
 const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
 function roll(id){const T=C.loot[id],r={};if(!T)return r;if(T.g[1]>0){const v=rnd(T.g[0],T.g[1]);if(v)r.gold=v}const W=T.e.reduce((s,q)=>s+q.w,0);
  for(let i=0;i<T.r&&W>0;i++){let x=Math.random()*W;for(const q of T.e){x-=q.w;if(x<0){r[q.k]=(r[q.k]|0)+rnd(q.a,q.b);break}}}return r}
 function give(r,why){const parts=[];for(const k in r){if(k==='gold'){GLD+=r[k];parts.push(r[k]+' gold')}else if(INAME[k]){inv[k]=(inv[k]|0)+r[k];parts.push(r[k]+' '+(r[k]>1?SN[k]||INAME[k]:INAME[k]).toLowerCase())}}
  if(parts.length){try{drops.push({x:P.x,y:P.y-18,t:0,tx:'+'+parts.join(', '),c:'#f8d848'})}catch(e){}try{svg()}catch(e){}}return parts}
 // ======================= apply =======================
 SQA.onApply(lib=>{LIB=lib||{};const L=LIB.content||{};try{items(L.items||{})}catch(e){console.warn('content items',e)}try{recipes(L.recipes||{})}catch(e){console.warn('content recipes',e)}
  try{shops(L.shops||{})}catch(e){console.warn('content shops',e)}try{mobs(L.mobs||{})}catch(e){console.warn('content mobs',e)}try{loot(L.loot||{})}catch(e){console.warn('content loot',e)}try{quests(L.quests||{})}catch(e){console.warn('content quests',e)}});
 const roleOpts=v=>{v=v||'';let h='<option value="">Just talks</option>';for(const id in C.shops)if(/^cs_/.test(id))h+='<option value="shop:'+id+'"'+(v==='shop:'+id?' selected':'')+'>🛒 Shopkeeper: '+esc(C.shops[id].n)+'</option>';
  const qs=Object.keys(C.quests);for(const id of qs){const ch=[id];let cur=id;for(let i=0;i<10;i++){const nx=qs.find(q=>C.quests[q].after===cur);if(!nx)break;ch.push(nx);cur=nx}if(C.quests[id].after)continue;const val='quest:'+ch.join(',');h+='<option value="'+val+'"'+(v===val?' selected':'')+'>❗ Quest giver: '+esc(ch.map(q=>C.quests[q].n).join(' → '))+'</option>'}
  if(v&&!h.includes('value="'+v+'"'))h+='<option value="'+esc(v)+'" selected>'+esc(v)+' (not found)</option>';return h};
 window.SQCONTENT={C,CQ,PEND,roll,give,roleOpts,openShop,tables:()=>Object.entries(C.loot).map(([k,T])=>[k,T.n]),keyOf,SHOPN};
 // ======================= Dev Suite > Content =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,dset,toast,fail,arm}=API;
 const itemList=()=>SQA.itemKeys().map(k=>[k,INAME[k]]).sort((a,b)=>a[1].localeCompare(b[1]));
 const mobList=()=>Object.entries(MOBS()).map(([k,m])=>[k,m.n]).sort((a,b)=>a[1].localeCompare(b[1]));
 const skillList=()=>SKN.map((n,i)=>[String(i),n]);
 const SECS={
  items:{l:'🎒 Items',pre:'it_',blank:()=>({n:'New item',d:'',v:5,t:'mat'}),hint:'New things for the bag: materials, food and potions. Draw its icon in Sprites. Once published, never delete an item players may have.',
   F:[{f:'n',l:'Name',t:'text',max:30},{f:'pl',l:'Plural (for "Sell all …")',t:'text',max:32},{f:'d',l:'Description',t:'long'},{f:'v',l:'Sell price (gold)',t:'num',min:0,max:1e7},
    {f:'t',l:'Kind',t:'sel',o:()=>[['mat','Material'],['food','Food (EAT / USE)'],['pot','Potion (USE from the bag)']]},
    {f:'heal',l:'Hearts healed (0-6)',t:'num',min:0,max:6,if:o=>o.t!=='mat'},{f:'hun',l:'Food restored (0-100)',t:'num',min:0,max:100,if:o=>o.t==='food'},
    {f:'mana',l:'Mana restored',t:'num',min:0,max:50,if:o=>o.t==='pot'},{f:'buff',l:'Effect',t:'sel',o:()=>[['','None'],['str','+2 melee damage'],['iron','+15% block'],['swift','Sprint for free']],if:o=>o.t==='pot'},
    {f:'bs',l:'Effect lasts (seconds)',t:'num',min:10,max:1800,if:o=>o.t==='pot'&&o.buff}]},
  recipes:{l:'🔨 Recipes',pre:'r_',blank:()=>({sk:'craft',out:'',c:[{k:'wood',n:2}],lv:1,xp:20}),hint:'Crafting recipes show in the crafting menu, smithing at the anvil, smelting at the furnace, cooking at a fire (cooking takes the first material as the raw food).',
   F:[{f:'sk',l:'Skill',t:'sel',o:()=>[['craft','Crafting'],['smith','Smithing (anvil)'],['smelt','Smithing (furnace)'],['cook','Cooking (fire)']]},{f:'out',l:'Makes',t:'item'},
    {f:'c',l:'Materials',t:'rows',cols:[{f:'k',l:'Item',t:'item'},{f:'n',l:'How many',t:'num',min:1,max:999}]},{f:'lv',l:'Level needed',t:'num',min:1,max:99},{f:'xp',l:'XP each',t:'num',min:0,max:5000}],
   title:o=>(o.out&&INAME[o.out]||'(pick what it makes)')+' · '+({craft:'Crafting',smith:'Anvil',smelt:'Furnace',cook:'Cooking'}[o.sk]||'Crafting')},
  shops:{l:'🛒 Shops',pre:'cs_',fixed:['gen','bw','af'],blank:()=>({n:'New shop',add:[]}),hint:'Add stock to the game\'s shops, or make new shops: give an island-builder person the job "Shopkeeper".',
   F:[{f:'n',l:'Shop name',t:'text',max:40,if:(o,id)=>/^cs_/.test(id)},{f:'add',l:'For sale',t:'rows',cols:[{f:'k',l:'Item',t:'item'},{f:'m',l:'How many',t:'num',min:1,max:1000},{f:'c',l:'Price (gold)',t:'num',min:0,max:1e7}]}],
   title:(o,id)=>SHOPN[id]||o.n},
  quests:{l:'❗ Quests',pre:'q_',blank:()=>({n:'New quest',d:'',t:'gather',k:'wood',amt:10,take:1,g:50,xs:-1,xp:0}),hint:'Give a quest to an island-builder person (job "Quest giver"). Quests with "Comes after" are offered by the same person once the first is done.',
   F:[{f:'n',l:'Name',t:'text',max:40},{f:'d',l:'What they say when they give it',t:'long'},{f:'t',l:'Task',t:'sel',o:()=>[['gather','Bring items'],['kill','Defeat monsters'],['visit','Go somewhere']]},
    {f:'k',l:'Item',t:'item',if:o=>o.t==='gather'},{f:'k',l:'Monster',t:'sel',o:mobList,if:o=>o.t==='kill'},{f:'k',l:'Island',t:'sel',o:()=>Object.values(WORLD_REGIONS).map(r=>[r.id,r.name]),if:o=>o.t==='visit'},
    {f:'amt',l:'How many',t:'num',min:1,max:10000,if:o=>o.t!=='visit'},{f:'take',l:'Takes the items',t:'chk',if:o=>o.t==='gather'},
    {f:'g',l:'Reward: gold',t:'num',min:0,max:1e6},{f:'xs',l:'Reward: XP in',t:'sel',o:()=>[['-1','(none)'],...skillList()]},{f:'xp',l:'XP',t:'num',min:0,max:1e6},
    {f:'rk',l:'Reward: item',t:'sel',o:()=>[['','(none)'],...itemList()]},{f:'rn',l:'How many',t:'num',min:1,max:1e5,if:o=>o.rk},
    {f:'after',l:'Comes after',t:'sel',o:(o,id)=>[['','(nothing)'],...Object.entries(sec('quests')).filter(([q])=>q!==id).map(([q,v])=>[q,v.n||q])]}]},
  mobs:{l:'👾 Monsters',pre:'cm_',blank:()=>({n:'New monster',base:'wolf',hp:12}),hint:'A new kind of monster that moves like one the game has. Draw its look, set its damage, speed and drops in Monsters; put it in island monster zones or dungeons.',
   F:[{f:'n',l:'Name',t:'text',max:30},{f:'base',l:'Moves like',t:'sel',o:()=>mobList().filter(([k])=>!/^c[bm]:/.test(k))},{f:'hp',l:'Health',t:'num',min:1,max:3000}]},
  loot:{l:'🎲 Loot',pre:'lt_',blank:()=>({n:'New loot table',r:1,g:[0,0],e:[{k:'wood',a:1,b:3,w:10}],on:[],p:100}),hint:'Rolled when one of its monsters is beaten (with its chance), and by island chests that list it.',
   F:[{f:'n',l:'Name',t:'text',max:40},{f:'r',l:'Rolls',t:'num',min:1,max:10},{f:'g',l:'Gold (min, max)',t:'pair',min:0,max:1e6},
    {f:'e',l:'Possible items (weight = how likely)',t:'rows',cols:[{f:'k',l:'Item',t:'item'},{f:'a',l:'Min',t:'num',min:1,max:1e5},{f:'b',l:'Max',t:'num',min:1,max:1e5},{f:'w',l:'Weight',t:'num',min:1,max:1000}]},
    {f:'on',l:'Monsters that drop it',t:'multi',o:mobList},{f:'p',l:'Chance per monster (%)',t:'num',min:0,max:100}]}};
 const ST={sec:'items',sel:null,w:null};
 const C0=()=>S.draft.content||(S.draft.content={});const sec=s=>C0()[s]||(C0()[s]={});
 const slug=(pre,n)=>pre+(String(n).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,20)||'x');
 const titleOf=(s,id,o)=>{const T=SECS[s].title;return T?T(o||{},id):(o&&o.n)||id};
 const opt=(L,v)=>L.map(([k,n])=>'<option value="'+E(k)+'"'+(String(v)===String(k)?' selected':'')+'>'+E(n)+'</option>').join('');
 function fieldHTML(F,o,id){const v=o[F.f],p='data-cf="'+F.f+'"';
  if(F.t==='text')return'<input type="text" '+p+' maxlength="'+(F.max||40)+'" value="'+E(v||'')+'">';
  if(F.t==='long')return'<textarea '+p+' maxlength="400" rows="2" style="width:100%">'+E(v||'')+'</textarea>';
  if(F.t==='num')return'<input type="number" '+p+' min="'+F.min+'" max="'+F.max+'" value="'+(v==null?'':E(v))+'" style="width:110px">';
  if(F.t==='chk')return'<input type="checkbox" '+p+(v?' checked':'')+'>';
  if(F.t==='item')return'<select '+p+'><option value="">(pick)</option>'+opt(itemList(),v)+'</select>';
  if(F.t==='sel'){const L=F.o(o,id);let cur=v==null?'':String(v);if(L.length&&!L.some(([k])=>String(k)===cur)){cur=String(L[0][0]);o[F.f]=F.f==='xs'?+cur:cur}return'<select '+p+'>'+opt(L,cur)+'</select>'}
  if(F.t==='pair'){const a=arr(v);return'<input type="number" data-cf="'+F.f+'.0" min="'+F.min+'" max="'+F.max+'" value="'+(a[0]|0)+'" style="width:90px"> – <input type="number" data-cf="'+F.f+'.1" min="'+F.min+'" max="'+F.max+'" value="'+(a[1]|0)+'" style="width:90px">'}
  if(F.t==='multi'){const a=arr(v);return'<div>'+a.map((k,i)=>'<span class="dv-b" style="display:inline-flex;gap:4px;margin:2px">'+E((MOBS()[k]||{}).n||k)+'<a href="#" data-cfx="mdel:'+F.f+':'+i+'">×</a></span>').join('')+'<select data-cfm="'+F.f+'"><option value="">+ add</option>'+opt(F.o(),'')+'</select></div>'}
  if(F.t==='rows'){const a=arr(v);let h='<table style="border-collapse:collapse"><tr>'+F.cols.map(c=>'<th class="dv-mut" style="text-align:left;font-weight:400;padding:2px 4px">'+c.l+'</th>').join('')+'<th></th></tr>';
   a.forEach((r,i)=>{h+='<tr>'+F.cols.map(c=>'<td style="padding:2px 4px">'+(c.t==='item'?'<select data-cf="'+F.f+'.'+i+'.'+c.f+'"><option value="">(pick)</option>'+opt(itemList(),r&&r[c.f])+'</select>':'<input type="number" data-cf="'+F.f+'.'+i+'.'+c.f+'" min="'+c.min+'" max="'+c.max+'" value="'+(r&&r[c.f]!=null?E(r[c.f]):'')+'" style="width:80px">')+'</td>').join('')+'<td><button class="dv-b" data-cfx="rdel:'+F.f+':'+i+'">×</button></td></tr>'});
   return h+'</table><button class="dv-b" data-cfx="radd:'+F.f+'">+ Add a row</button>'}return''}
 function render(){const s=ST.sec,D=SECS[s],L=sec(s),Lv=S.live&&S.live.content&&S.live.content[s]||{};
  let h='<div class="dv-row" style="flex-wrap:wrap;margin-bottom:8px">'+Object.entries(SECS).map(([k,d])=>'<button class="dv-b'+(ST.sec===k?' dv-tl dv-on':'')+'" data-cfx="sec:'+k+'">'+d.l+'</button>').join('')+'</div>';
  const ids=[...(D.fixed||[]),...Object.keys(L).filter(k=>!(D.fixed||[]).includes(k)).sort()];
  h+='<div class="dv-spr'+(ST.sel?' dv-has':'')+'"><div class="dv-ls"><button class="dv-b dv-pri" data-cfx="new">+ New</button><div class="dv-grid" style="grid-template-columns:1fr">';
  for(const id of ids){const o=L[id],same=JSON.stringify(o)===JSON.stringify(Lv[id]);h+='<button class="dv-it'+(ST.sel===id?' dv-on':'')+'" data-cfs="'+E(id)+'" style="flex-direction:row;justify-content:flex-start;padding:8px 10px">'+(o?'<i class="dv-bd dv-'+(same?'live':'draft')+'">'+(same?'LIVE':'DRAFT')+'</i>':'')+
   (s==='items'&&o?'<img src="'+iconURL(id)+'" style="width:20px;height:20px;image-rendering:pixelated;margin-right:6px" alt="">':'')+'<span style="font-size:13px;text-align:left">'+E(titleOf(s,id,o))+'</span></button>'}
  if(!ids.length)h+='<p class="dv-mut">Nothing yet.</p>';h+='</div></div><div class="dv-ed">';
  if(!ST.sel||!ST.w)h+='<div class="dv-card"><b>'+D.l+'</b><p class="dv-mut">'+D.hint+'</p></div>';
  else{const o=ST.w,id=ST.sel;h+='<div class="dv-card"><div class="dv-row"><b style="font-size:16px">'+E(titleOf(s,id,o))+'</b><span class="dv-mut">'+E(s==='mobs'?'monster key '+keyOf(id):id)+'</span></div>';
   for(const F of D.F){if(F.if&&!F.if(o,id))continue;h+='<div style="margin:8px 0"><label class="dv-mut" style="display:block;margin-bottom:2px">'+F.l+'</label>'+fieldHTML(F,o,id)+'</div>'}
   if(s==='quests'){const G=GIVERS[id];h+='<p class="dv-mut">'+(G?'Given by '+E(G.name)+' on '+E((WORLD_REGIONS[G.area]||{}).name||G.area)+'.':'Nobody gives it yet: in the island builder, pick a person and set their job to this quest (save the island).')+'</p>'}
   if(s==='shops'&&/^cs_/.test(id))h+='<p class="dv-mut">Shopkeepers: in the island builder, pick a person and set their job to this shop. Players can also sell anything with a sell price there.</p>';
   h+='<div class="dv-row" style="margin-top:10px;flex-wrap:wrap"><button class="dv-b dv-pri" data-cfx="save">Save to draft</button>'+(s==='items'?'<button class="dv-b" data-cfx="icon">Draw its icon</button>':'')+(s==='mobs'?'<button class="dv-b" data-cfx="look">Its look, damage and drops (Monsters)</button>':'')+
    (s==='loot'?'<button class="dv-b" data-cfx="try">Roll it 10 times</button>':'')+((D.fixed||[]).includes(id)&&!sec(s)[id]?'':'<button class="dv-b '+(S.arm==='cfdel'?'dv-arm':'dv-bad')+'" data-cfx="del">'+(S.arm==='cfdel'?'Tap again to delete':(D.fixed||[]).includes(id)?'Remove added stock':'Delete')+'</button>')+'</div>'+
    '<p class="dv-mut" style="font-size:12px">Changes show in your game once saved with "Show unpublished edits in my game" on, and for everyone after Publish.</p><div id="dvcfout" class="dv-mut"></div></div>'}
  return h+'</div></div>'}
 const setPath=(o,path,val)=>{const ks=path.split('.');let x=o;for(let i=0;i<ks.length-1;i++){const k=ks[i];if(x[k]==null||typeof x[k]!=='object')x[k]=/^\d+$/.test(ks[i+1])?[]:{};else if(!Array.isArray(x[k])&&/^\d+$/.test(ks[i+1]))x[k]=arr(x[k]);x=x[k]}x[ks[ks.length-1]]=val};
 function fieldFor(f){return SECS[ST.sec].F.find(F=>F.f===f.split('.')[0])}
 function onEdit(t){const path=t.dataset.cf,F=fieldFor(path);if(!F||!ST.w)return;let v=t.type==='checkbox'?(t.checked?1:0):t.value;
  const sub=path.split('.');const col=F.t==='rows'?F.cols.find(c=>c.f===sub[2]):null;const ty=col?col.t:F.t;
  if(ty==='num'||ty==='pair'||(F.f==='xs'))v=v===''?'':+v;setPath(ST.w,path,v);if(F.t==='sel'||F.t==='item'||F.t==='chk'||F.f==='t')API.draw()}
 document.addEventListener('change',e=>{if(S.tab!=='content')return;const t=e.target;if(!document.getElementById('dvs').contains(t))return;
  if(t.dataset.cf)onEdit(t);else if(t.dataset.cfm&&t.value){const a=arr(ST.w[t.dataset.cfm]);if(!a.includes(t.value))a.push(t.value);ST.w[t.dataset.cfm]=a;API.draw()}},true);
 document.addEventListener('input',e=>{if(S.tab!=='content')return;const t=e.target;if(t.dataset&&t.dataset.cf&&(t.type==='text'||t.type==='number'||t.tagName==='TEXTAREA')){const F=fieldFor(t.dataset.cf);if(F&&F.t!=='sel')onEdit(t)}},true);
 const tidy=(s,o)=>{const r=JSON.parse(JSON.stringify(o));for(const F of SECS[s].F){if(F.if&&!F.if(r,ST.sel)&&F.f!=='k')delete r[F.f];if(F.t==='rows')r[F.f]=arr(r[F.f]).filter(q=>q&&Object.values(q).some(v=>v!==''&&v!=null))}
  for(const k in r)if(r[k]===''||r[k]==null)delete r[k];return r};
 async function save(){const s=ST.sec,id=ST.sel,o=tidy(s,ST.w);sec(s)[id]=o;try{await dset('draft/content/'+s+'/'+id,o);toast('Saved to draft. Publish it from the Publish tab.')}catch(e){fail(e)}if(SQA.previewing)SQA.preview(S.draft);API.draw()}
 document.addEventListener('click',e=>{if(S.tab!=='content')return;const t=e.target.closest('[data-cfx],[data-cfs]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();
  if(t.dataset.cfs){ST.sel=t.dataset.cfs;const o=sec(ST.sec)[ST.sel];ST.w=JSON.parse(JSON.stringify(o||SECS[ST.sec].blank()));if(!o&&ST.sec==='shops')delete ST.w.n;API.draw();return}
  const[a,b,c]=t.dataset.cfx.split(':');
  if(a==='sec'){ST.sec=b;ST.sel=null;ST.w=null;API.draw();return}
  if(a==='new'){const D=SECS[ST.sec],o=D.blank();const nm=o.n||'recipe';let id=slug(D.pre,nm+' '+(Object.keys(sec(ST.sec)).length+1)),k=2;while(sec(ST.sec)[id]||(ST.sec==='items'&&INAME[id]))id=slug(D.pre,nm+' '+(Object.keys(sec(ST.sec)).length+(k++)));
   ST.sel=id;ST.w=o;API.draw();setTimeout(()=>{const f=document.querySelector('#dvs [data-cf="n"]');if(f){f.focus();f.select()}},50);return}
  if(a==='radd'){const L=arr(ST.w[b]);const F=fieldFor(b);const r={};for(const c2 of F.cols)r[c2.f]=c2.t==='num'?c2.min:'';L.push(r);ST.w[b]=L;API.draw();return}
  if(a==='rdel'){const L=arr(ST.w[b]);L.splice(+c,1);ST.w[b]=L;API.draw();return}
  if(a==='mdel'){const L=arr(ST.w[b]);L.splice(+c,1);ST.w[b]=L;API.draw();return}
  if(a==='save'){if(ST.sec==='items'&&!/^it_/.test(ST.sel))return;save();return}
  if(a==='icon'){save().then(()=>{SQA.preview(S.draft);S.tab='sprites';API.draw();setTimeout(()=>{const x=document.querySelector('#dvs .dv-it[data-k="'+ST.sel+'"]');if(x)x.click();else toast('Save it with "Show unpublished edits in my game" on first.')},300)});return}
  if(a==='look'){save().then(()=>{SQA.preview(S.draft);S.tab='monsters';API.draw();setTimeout(()=>{const x=document.querySelector('#dvs [data-k="m:'+keyOf(ST.sel)+'"]');if(x)x.click();else toast('Save it with "Show unpublished edits in my game" on first.')},300)});return}
  if(a==='try'){const was=C.loot[ST.sel];const tmp={...C.loot};loot({...Object.fromEntries(Object.entries(C.loot)),[ST.sel]:tidy('loot',ST.w)});const tot={};for(let i=0;i<10;i++){const r=roll(ST.sel);for(const k in r)tot[k]=(tot[k]|0)+r[k]}C.loot=tmp;if(!was)delete C.loot[ST.sel];
   const out=document.getElementById('dvcfout');if(out)out.textContent='10 rolls: '+(Object.entries(tot).map(([k,n])=>n+' '+(k==='gold'?'gold':INAME[k])).join(', ')||'nothing');return}
  if(a==='del')return arm('cfdel',async()=>{const s=ST.sec,id=ST.sel;delete sec(s)[id];try{await dset('draft/content/'+s+'/'+id,null);toast('Deleted from your draft.')}catch(e2){fail(e2)}ST.sel=null;ST.w=null;if(SQA.previewing)SQA.preview(S.draft);API.draw()})},true);
 SQSUITE.addTab('content','Content',{render,changes(L,D){const out=[],l=L&&L.content||{},d=D&&D.content||{};for(const s in SECS){const a=l[s]||{},b=d[s]||{};for(const id of new Set([...Object.keys(a),...Object.keys(b)]))if(JSON.stringify(a[id])!==JSON.stringify(b[id]))
   out.push({kind:'ext',html:SECS[s].l+' '+E(titleOf(s,id,b[id]||a[id]))+': '+(b[id]?(a[id]?'changed':'new'):'removed')})}return out}})})();
