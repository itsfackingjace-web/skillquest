// ---- 97. The World Market (Hollow Village): buy and sell with every player, like a grand exchange ----
// Put up an offer to sell (your items are held by the market) or to buy (your gold is held). Offers match
// automatically with other players' offers for the same item at a matching price, even while they're offline,
// and the trade happens at the price of the offer that was there first. What you get from a trade waits in your
// collection box at the market. Cancel an offer any time to get back what hasn't traded. Up to 8 offers at once.
// Data: market/offers/<id> {u,n,k,s:'b'|'s',p,q,f,t}, market/box/<uid>/<id> {k,n} (k 'gold' for coins), market/last/<k> {p,t}.
{const K='#181018',WMK={offers:{},box:{},last:{},unsub:[],busy:false,tab:'mine',form:null,seenBox:new Set(),spot:null,clerk:null,filter:''};window.SQWMK=WMK;
 const MAXO=8,me=()=>MP.user&&MP.user.uid,online=()=>MP.on&&!!me();
 // ---- where it stands: a market hall beside Hollow Village ----
 {const free=i=>{const x=i%N,y=(i/N)|0;return(tile[i]===2||tile[i]===1)&&!BS.has(i)&&!PROT.has(i)&&!BRIDGE.has(i)&&!STR.has(i)&&!(typeof inTownTiles==='function'&&inTownTiles(x,y))};
  let best=null,bd=1e9;for(let y=VY-26;y<VY+26;y++)for(let x=VX-26;x<VX+26;x++){const d=Math.hypot(x+4-VX,y-VY);if(d<11||d>26)continue;let ok=true;
   for(let b=-1;b<=3&&ok;b++)for(let a=-2;a<=10;a++){const i=(y+b)*N+x+a;if(!free(i)&&!(b===3&&ROADS.has(i))){ok=false;break}}if(!ok)continue;let road=false;for(let a=0;a<9&&!road;a++)for(let b=2;b<=4;b++)if(ROADS.has((y+b)*N+x+a)){road=true;break}
   const sc=d+(road?-8:0);if(sc<bd){bd=sc;best=[x,y]}}
  if(best){const[x,y]=best;WMK.spot={tx:x,ty:y,w:9};for(let b=-1;b<=3;b++)for(let a=-2;a<=10;a++){const i=(y+b)*N+x+a;obj[i]=null;PROT.add(i);if(b>=0&&b<=1&&a>=0&&a<9)BS.add(i)}for(let b=4;b<=5;b++)for(let a=-1;a<=9;a++){const i=(y+b)*N+x+a;if(obj[i]&&obj[i].t!=='rock')obj[i]=null}
   WMK.clerk={x:(x+4)*16+8,y:(y+2)*16+10}}}
 const sp=WMK.spot;
 function drawMarket(tm){const s=WMK.spot,X0=s.tx*16,w=s.w*16,base=(s.ty+2)*16,R=(a,b,c,d,e)=>Rg(a,b,c,d,e);shd(X0+w/2,base-2,w*.95);
  // stone hall with a tiled roof
  R(X0,base-34,w,34,K);R(X0+1,base-33,w-2,32,'#c8b898');for(let yy=base-29;yy<base;yy+=6)R(X0+1,yy,w-2,1,'#a89878');for(let xx=X0+12;xx<X0+w;xx+=16)R(xx,base-33,1,32,'#b0a080');
  R(X0-4,base-48,w+8,16,K);R(X0-3,base-47,w+6,14,'#3a5a9a');for(let xx=X0-3;xx<X0+w+3;xx+=6)R(xx,base-47,3,14,'#4a6ab0');R(X0-3,base-34,w+6,1,'#2a3a6a');
  // three stalls with striped awnings and goods
  for(let k=0;k<3;k++){const sx=X0+6+k*46,c1=['#d83830','#38a838','#e8a020'][k];R(sx-1,base-27,38,9,K);for(let j=0;j<6;j++)R(sx+j*6,base-26,6,7,j%2?'#f0f0f0':c1);for(let j=0;j<6;j++)R(sx+j*6+1,base-19,4,2,j%2?'#f0f0f0':c1);
   R(sx,base-12,36,12,K);R(sx+1,base-11,34,10,'#8a5a30');R(sx+1,base-11,34,2,'#a87040');
   const goods=[['#e04040','#f0c040','#40a0e0'],['#7ab060','#c88838','#b0b0c0'],['#f8d048','#9a7ad8','#e8e8e8']][k];for(let j=0;j<5;j++){R(sx+3+j*7,base-15,5,4,K);R(sx+4+j*7,base-14,3,2,goods[j%3])}}
  // sign
  const tw=74,sx=X0+w/2-tw/2;R(sx-1,base-60,tw+2,13,K);R(sx,base-59,tw,11,'#f0d890');R(sx,base-59,tw,1,'#fff0c0');g.save();g.font='700 7px '+PF;g.fillStyle='#4a2a10';g.textAlign='center';g.textBaseline='middle';g.fillText('WORLD MARKET',X0+w/2,base-53.5);g.restore();
  // flags
  for(const fx of[X0-2,X0+w-1]){R(fx,base-70,2,24,'#5a4a3a');const wv=Math.round(Math.sin(tm*4+fx)*1.5);R(fx+2,base-70,9,6+wv,'#d83830');R(fx+2,base-70,9,2,'#f05040')}}
 function drawClerk(tm){const c=WMK.clerk,near=Math.hypot(c.x-P.x,c.y-P.y)<60,dir=near?(Math.abs(P.x-c.x)>Math.abs(P.y-c.y)?2:P.y<c.y?1:0):0;shd(c.x,c.y+6,12);GC=g;
  try{cP({sk:1,hs:0,hc:2,sh:1,pn:1,ht:1,hcol:5,so:2},dir,0,Math.round(c.x),Math.round(c.y),near&&P.x<c.x)}catch(e){}
  g.save();g.font='700 6px '+PF;g.textAlign='center';g.textBaseline='bottom';g.lineWidth=2;g.strokeStyle=K;g.strokeText('Market clerk',c.x,c.y-22);g.fillStyle='#ffe8b0';g.fillText('Market clerk',c.x,c.y-22);g.restore();
  if(Object.keys(WMK.box).length&&Math.floor(tm*3)%2){Rg(c.x-2,c.y-36,4,8,K);Rg(c.x-1,c.y-35,2,5,'#f8d048');Rg(c.x-1,c.y-29,2,1,'#f8d048')}}
 if(sp){const _lh=LHOOK;LHOOK=(L,x0,y0,x1,y1,tm)=>{_lh(L,x0,y0,x1,y1,tm);const s=WMK.spot;if(s.tx+s.w<x0-3||s.tx>x1+3||s.ty>y1+5||s.ty+3<y0-4)return;L.push([(s.ty+2)*16,4,()=>drawMarket(tm)]);L.push([WMK.clerk.y+6,4,()=>drawClerk(tm)])};
  const _dm=drawMap;drawMap=function(){_dm();const c=document.getElementById('mpc'),R=SCENE&&SCENE.room;if(!c||R&&R.region||MAPVIEW==='world')return;const x=c.getContext('2d');x.fillStyle='#101010';x.fillRect(sp.tx+2,sp.ty-2,6,6);x.fillStyle='#f8d048';x.fillRect(sp.tx+3,sp.ty-1,4,4)}}
 const nearClerk=()=>sp&&!SCENE&&Math.hypot(WMK.clerk.x-P.x,WMK.clerk.y-P.y)<26;
 const atMarket=()=>sp&&!SCENE&&Math.hypot(WMK.clerk.x-P.x,WMK.clerk.y-P.y)<70;
 // ---- data ----
 function wmStart(){if(WMK.unsub.length||!online())return;const d=FB.db;
  WMK.unsub.push(d.onValue(d.ref(FB.D,'market/offers'),s=>{const v=s.val()||{};WMK.offers=v;for(const id in v){const o=v[id];if(o&&o.u===me()&&o.f>=o.q)d.remove(d.ref(FB.D,'market/offers/'+id)).catch(()=>{})}if(pnOpen&&shop==='wmkt'&&!WMK.busy&&!(typeof typing==='function'&&typing()))rPn()},e=>mpErr(e)));
  WMK.unsub.push(d.onValue(d.ref(FB.D,'market/box/'+me()),s=>{const v=s.val()||{};const fresh=Object.keys(v).filter(k=>!WMK.seenBox.has(k));WMK.box=v;for(const k of fresh)WMK.seenBox.add(k);
   if(fresh.length&&WMK.ready){say('World Market: one of your offers traded! Collect it at the World Market in Hollow Village.');msgT=5;try{sfx('coin')}catch(e){}}WMK.ready=true;if(pnOpen&&shop==='wmkt')rPn()},e=>mpErr(e)));
  WMK.unsub.push(d.onValue(d.ref(FB.D,'market/last'),s=>{WMK.last=s.val()||{}},e=>{}))}
 {const _ms=mpStart;mpStart=async function(u){await _ms(u);try{wmStart()}catch(e){mpErr(e)}if(MP.on)MP.unsub.push(()=>{for(const f of WMK.unsub)try{f()}catch(e){}WMK.unsub.length=0;WMK.offers={};WMK.box={};WMK.ready=false})}}
 const mine=()=>Object.entries(WMK.offers).filter(([,o])=>o&&o.u===me());
 const tradeable=k=>!!(sqBookReg(k),INAME[k]&&SELLP[k]&&k!=='gold'&&!/^ja_?$/.test(k));
 const nm=(k,n)=>n===1?(INAME[k]||k):(SN[k]||INAME[k]||k);
 const fmt=n=>n>=1e6?(n/1e6).toFixed(n%1e6?1:0)+'M':n>=1e4?(n/1e3).toFixed(n%1e3?1:0)+'k':String(n);
 // ---- placing an offer, then matching it ----
 async function place(side,k,q,p){if(!online()){say('The World Market needs you to be signed in.');return}if(WMK.busy)return;q=Math.floor(q);p=Math.floor(p);
  if(!tradeable(k)||!(q>=1)||!(p>=1)||p>1e7||q>1e5){say('That offer doesn\'t work.');return}
  if(mine().length>=MAXO){say('You already have '+MAXO+' offers. Cancel one first.');sfx('swish');return}
  if(side==='s'){if((inv[k]|0)<q){say('You don\'t have '+q+' '+nm(k,q).toLowerCase()+'.');sfx('swish');return}inv[k]-=q}
  else{if(GLD<q*p){say('You need '+(q*p)+' gold for that offer.');sfx('swish');return}GLD-=q*p}
  saveNow();WMK.busy=true;const d=FB.db,id=me()+'_'+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36);
  try{await d.set(d.ref(FB.D,'market/offers/'+id),{u:me(),n:myName().slice(0,12),k,s:side,p,q,f:0,t:Date.now()});WMK.offers[id]={u:me(),k,s:side,p,q,f:0,t:Date.now()};
   say((side==='s'?'Selling ':'Buying ')+q+' '+nm(k,q).toLowerCase()+' at '+p+' gold each.');sfx('coin');await match(id)}
  catch(e){mpErr(e);if(side==='s')inv[k]=(inv[k]|0)+q;else GLD+=q*p;say('The market couldn\'t take that offer. Try again.');saveNow()}
  finally{WMK.busy=false;try{svg()}catch(e){}if(pnOpen&&shop==='wmkt'){WMK.tab='mine';WMK.form=null;rPn()}}}
 async function match(id){const d=FB.db,o=WMK.offers[id];if(!o)return;let traded=0,got=0,spent=0;
  const others=Object.entries(WMK.offers).filter(([oid,c])=>oid!==id&&c&&c.k===o.k&&c.s!==o.s&&c.u!==o.u&&c.f<c.q&&(o.s==='s'?c.p>=o.p:c.p<=o.p))
   .sort((a,b)=>o.s==='s'?(b[1].p-a[1].p||a[1].t-b[1].t):(a[1].p-b[1].p||a[1].t-b[1].t));
  for(const[cid,c]of others){// 1. reserve on my own offer
   let want=0;const r1=await d.runTransaction(d.ref(FB.D,'market/offers/'+id),cur=>{want=0;if(!cur)return;want=Math.max(0,cur.q-cur.f);if(!want)return;cur.f+=want;return cur});if(!r1||!r1.committed||!want)break;
   // 2. take what the other offer still has
   let m=0,price=c.p,owner=c.u;const r2=await d.runTransaction(d.ref(FB.D,'market/offers/'+cid),cur=>{m=0;if(!cur||cur.f>=cur.q)return;m=Math.min(want,cur.q-cur.f);price=cur.p;owner=cur.u;cur.f+=m;return cur});
   if(!r2||!r2.committed)m=0;
   // 3. give back the part of my reservation that didn't trade
   if(m<want)await d.runTransaction(d.ref(FB.D,'market/offers/'+id),cur=>{if(!cur)return;cur.f=Math.max(0,cur.f-(want-m));return cur});
   if(!m)continue;traded+=m;
   const bid='b'+Date.now().toString(36)+Math.floor(Math.random()*1e6).toString(36);
   if(o.s==='s'){GLD+=m*price;got+=m*price;await d.set(d.ref(FB.D,'market/box/'+owner+'/'+bid),{k:o.k,n:m}).catch(e=>mpErr(e))}
   else{inv[o.k]=(inv[o.k]|0)+m;GLD+=(o.p-price)*m;spent+=m*price;await d.set(d.ref(FB.D,'market/box/'+owner+'/'+bid),{k:'gold',n:m*price}).catch(e=>mpErr(e))}
   d.set(d.ref(FB.D,'market/last/'+o.k),{p:price,t:Date.now()}).catch(()=>{});saveNow()}
  if(traded){say(o.s==='s'?'Sold '+traded+' '+nm(o.k,traded).toLowerCase()+' for '+got+' gold!':'Bought '+traded+' '+nm(o.k,traded).toLowerCase()+' for '+spent+' gold!');msgT=5;try{sfx('quest')}catch(e){}}}
 async function cancel(id){const d=FB.db;let last=null;const r=await d.runTransaction(d.ref(FB.D,'market/offers/'+id),cur=>{last=cur;if(!cur||cur.u!==me())return;return null}).catch(e=>{mpErr(e);return null});
  if(!r||!r.committed||!last)return;const left=Math.max(0,last.q-last.f);if(last.s==='s')inv[last.k]=(inv[last.k]|0)+left;else GLD+=left*last.p;delete WMK.offers[id];
  say('Offer cancelled.'+(left?' Back to you: '+(last.s==='s'?left+' '+nm(last.k,left).toLowerCase():left*last.p+' gold')+'.':''));sfx('coin');saveNow();try{svg()}catch(e){}}
 async function collect(){const d=FB.db;let items=0,gold=0;for(const bid of Object.keys(WMK.box)){let got=null;const r=await d.runTransaction(d.ref(FB.D,'market/box/'+me()+'/'+bid),cur=>{got=cur;if(!cur)return;return null}).catch(()=>null);
   if(!r||!r.committed||!got||!(got.n>0))continue;if(got.k==='gold'){GLD+=got.n;gold+=got.n}else if((sqBookReg(got.k),INAME[got.k])){inv[got.k]=(inv[got.k]|0)+got.n;items+=got.n}}
  if(items||gold){say('Collected'+(gold?' '+gold+' gold':'')+(gold&&items?' and':'')+(items?' '+items+' item'+(items>1?'s':''):'')+' from the market.');sfx('coin');saveNow();try{svg()}catch(e){}}}
 // ---- the panel ----
 function open(){if(!online()){say('The World Market needs you to be signed in (Menu > Online).');sfx('swish');return}wmStart();shop='wmkt';WMK.tab='mine';WMK.form=null;pnOpen=true;ptab=2;jx=jy=0;fromMenu=false;pn.style.display='block';rPn();sfx('talk');
  if(Object.keys(WMK.box).length)collect().then(()=>{if(pnOpen&&shop==='wmkt')rPn()})}
 window.SQWMOPEN=open;
 const ic=k=>{try{return'<img src="'+iconURL(k)+'" style="width:14px;height:14px;image-rendering:pixelated;vertical-align:-2px;margin-right:4px">'}catch(e){return''}};
 function book(k){let bs=null,bb=null,qs=0,qb=0;for(const o of Object.values(WMK.offers)){if(!o||o.k!==k||o.f>=o.q)continue;const r=o.q-o.f;if(o.s==='s'){qs+=r;if(bs==null||o.p<bs)bs=o.p}else{qb+=r;if(bb==null||o.p>bb)bb=o.p}}return{bs,bb,qs,qb}}
 const guide=k=>{const L=WMK.last[k];return L&&L.p?L.p:Math.max(1,Math.round((SELLP[k]||1)*1.3))};
 function formHTML(){const F=WMK.form,k=F.k,B=book(k),side=F.s;
  let h='<div class="qc"><b>'+ic(k)+esc(INAME[k]||k)+'</b><small><br>Shop value '+(SELLP[k]||0)+' · last trade '+(WMK.last[k]?WMK.last[k].p:'none')+(B.bs!=null?'<br>Cheapest for sale: '+B.bs+' ('+B.qs+' left)':'')+(B.bb!=null?'<br>Best buy offer: '+B.bb+' ('+B.qb+' wanted)':'')+(side==='s'?'<br>In your bag: '+(inv[k]|0):'<br>Your gold: '+GLD)+'</small></div>';
  h+='<div class="tl" style="margin-top:8px">How many</div><div style="display:flex;gap:4px;align-items:center;justify-content:center"><button class="sb" data-w="q:-10">-10</button><button class="sb" data-w="q:-1">-1</button><input id="wmq" type="number" min="1" value="'+F.q+'" style="width:70px;font:600 15px '+PF+';text-align:center"><button class="sb" data-w="q:1">+1</button><button class="sb" data-w="q:10">+10</button>'+(side==='s'?'<button class="sb" data-w="q:all">All</button>':'')+'</div>';
  h+='<div class="tl" style="margin-top:8px">Price each (gold)</div><div style="display:flex;gap:4px;align-items:center;justify-content:center"><button class="sb" data-w="p:-10%">-10%</button><button class="sb" data-w="p:-1">-1</button><input id="wmp" type="number" min="1" value="'+F.p+'" style="width:80px;font:600 15px '+PF+';text-align:center"><button class="sb" data-w="p:1">+1</button><button class="sb" data-w="p:10%">+10%</button></div>';
  if(side==='b'&&B.bs!=null)h+='<div style="text-align:center"><button class="sb" data-w="p:match">Match the cheapest ('+B.bs+')</button></div>';if(side==='s'&&B.bb!=null)h+='<div style="text-align:center"><button class="sb" data-w="p:match">Match the best buyer ('+B.bb+')</button></div>';
  const tot=F.q*F.p,ok=side==='s'?(inv[k]|0)>=F.q:GLD>=tot;h+='<button class="sb" data-w="go" style="width:100%;margin-top:10px;opacity:'+(ok?1:.45)+'"><b>'+(side==='s'?'SELL ':'BUY ')+F.q+' for '+fmt(tot)+' gold</b><br><small>'+(side==='s'?'Your items wait at the market until someone buys them.':'Your gold waits at the market until someone sells.')+'</small></button>';
  h+='<button class="sb" data-w="back" style="width:100%">Back</button>';return h}
 function wmHTML(){if(WMK.form)return'<div class="tl">WORLD MARKET</div>'+formHTML();
  const tabs=[['mine','My offers'],['browse','Browse'],['sell','Sell'],['buy','Buy']];let h='<div class="tl">WORLD MARKET</div><div style="display:flex;gap:4px;margin:4px 0">'+tabs.map(([t,l])=>'<button class="sb" data-w="tab:'+t+'" style="flex:1;opacity:'+(WMK.tab===t?1:.55)+'">'+l+'</button>').join('')+'</div>';
  const bx=Object.values(WMK.box);if(bx.length)h+='<button class="sb" data-w="collect" style="width:100%;background:#f8e8b0"><b>COLLECT</b> ('+bx.length+' waiting)</button>';
  if(WMK.tab==='mine'){const L=mine().sort((a,b)=>b[1].t-a[1].t);h+='<div class="qc"><small>Offers trade with other players automatically, even while you\'re away. Up to '+MAXO+' at once.</small></div>';
   if(!L.length)h+='<div class="tl" style="font-weight:400;opacity:.6">No offers yet. Use Sell or Buy.</div>';
   for(const[id,o]of L){const pr=Math.round(o.f/o.q*100);h+='<div class="qc" style="display:flex;align-items:center;gap:6px;text-align:left"><div style="flex:1;min-width:0"><b>'+(o.s==='s'?'Selling':'Buying')+'</b> '+ic(o.k)+o.q+' '+esc(nm(o.k,o.q))+' @ '+fmt(o.p)+'<br><small>'+o.f+' / '+o.q+' done</small><div style="height:5px;background:#ccc;margin-top:2px"><div style="height:5px;width:'+pr+'%;background:'+(o.s==='s'?'#d8a020':'#38a838')+'"></div></div></div><button class="sb" data-w="x:'+id+'" style="flex:0 0 auto;width:auto;min-width:0;padding:6px 10px">Cancel</button></div>'}}
  else if(WMK.tab==='browse'){const ks=[...new Set(Object.values(WMK.offers).filter(o=>o&&o.f<o.q).map(o=>o.k))].filter(tradeable).sort((a,b)=>(INAME[a]||a).localeCompare(INAME[b]||b));
   if(!ks.length)h+='<div class="tl" style="font-weight:400;opacity:.6">Nobody is trading anything right now. Be the first!</div>';
   for(const k of ks){const B=book(k);h+='<button class="sb" data-w="pick:b:'+k+'" style="width:100%;text-align:left">'+ic(k)+'<b>'+esc(INAME[k])+'</b><br><small>'+(B.bs!=null?'For sale: '+B.qs+' from '+fmt(B.bs):'None for sale')+' · '+(B.bb!=null?'Wanted: '+B.qb+' up to '+fmt(B.bb):'Nobody buying')+'</small></button>'}}
  else if(WMK.tab==='sell'){const ks=INVK.filter(k=>(inv[k]|0)>0&&tradeable(k));h+='<div class="qc"><small>Pick something from your bag to sell.</small></div>';if(!ks.length)h+='<div class="tl" style="font-weight:400;opacity:.6">Nothing in your bag can be sold.</div>';
   for(const k of ks){const B=book(k);h+='<button class="sb" data-w="pick:s:'+k+'" style="width:49%">'+ic(k)+esc(INAME[k])+' ('+inv[k]+')<br><small>'+(B.bb!=null?'buyers up to '+fmt(B.bb):'last '+(WMK.last[k]?fmt(WMK.last[k].p):'-'))+'</small></button>'}}
  else{h+='<input id="wmf" placeholder="Search for an item..." value="'+esc(WMK.filter)+'" style="width:100%;box-sizing:border-box;font:500 14px '+PF+';padding:6px;margin:4px 0">';const f=WMK.filter.toLowerCase();
   const ks=Object.keys(INAME).filter(k=>tradeable(k)&&(!f||(INAME[k]||'').toLowerCase().includes(f))).sort((a,b)=>{const A=book(a).bs!=null,Bb=book(b).bs!=null;return(Bb-A)||(INAME[a]||'').localeCompare(INAME[b]||'')}).slice(0,60);
   for(const k of ks){const B=book(k);h+='<button class="sb" data-w="pick:b:'+k+'" style="width:49%">'+ic(k)+esc(INAME[k])+'<br><small>'+(B.bs!=null?B.qs+' for sale from '+fmt(B.bs):'none for sale')+'</small></button>'}}
  return h}
 {const _r=rPn;rPn=function(){if(ptab===2&&shop==='wmkt'){try{panelChrome('')}catch(e){}const fo=document.activeElement&&document.activeElement.id==='wmf';pbd.innerHTML=wmHTML();
   const fi=document.getElementById('wmf');if(fi){fi.oninput=()=>{WMK.filter=fi.value;const pos=fi.selectionStart;rPn();const f2=document.getElementById('wmf');if(f2){f2.focus();try{f2.setSelectionRange(pos,pos)}catch(e){}}};if(fo){fi.focus()}}
   // typing a number just updates the offer (no redraw: a redraw while typing ate your next tap, e.g. on SELL / BUY)
   for(const id of['wmq','wmp']){const el=document.getElementById(id);if(el)el.oninput=()=>{if(!WMK.form)return;const v=Math.max(1,Math.floor(+el.value||1));if(id==='wmq')WMK.form.q=v;else WMK.form.p=Math.min(1e7,v);wmTotal()}}return}_r()}}
 // keep the SELL/BUY button's total right while typing, without rebuilding the panel
 function wmTotal(){const F=WMK.form,b=pbd.querySelector('[data-w="go"]');if(!F||!b)return;const tot=F.q*F.p,ok=F.s==='s'?(inv[F.k]|0)>=F.q:GLD>=tot;b.style.opacity=ok?1:.45;const t=b.querySelector('b');if(t)t.textContent=(F.s==='s'?'SELL ':'BUY ')+F.q+' for '+fmt(tot)+' gold'}
 // other players' offers changing shouldn't redraw the panel under your fingers while you type
 const typing=()=>{const a=document.activeElement;return!!(a&&(a.id==='wmq'||a.id==='wmp'||a.id==='wmf'))};
 {const _oc=pbd.onclick;pbd.onclick=e=>{if(shop==='wmkt'){const b=e.target.closest('[data-w]');if(!b)return;const a=b.dataset.w,F=WMK.form;
   if(a.startsWith('tab:')){WMK.tab=a.slice(4)}
   else if(a==='collect'){collect().then(()=>rPn());return}
   else if(a.startsWith('x:')){cancel(a.slice(2)).then(()=>rPn());return}
   else if(a.startsWith('pick:')){const[,s,k]=a.split(':');const B=book(k);WMK.form={s,k,q:s==='s'?Math.max(1,inv[k]|0):1,p:s==='s'?(B.bb!=null?B.bb:guide(k)):(B.bs!=null?B.bs:guide(k))}}
   else if(a==='back'){WMK.form=null}
   else if(F&&a.startsWith('q:')){const v=a.slice(2);F.q=v==='all'?Math.max(1,inv[F.k]|0):Math.max(1,F.q+(+v))}
   else if(F&&a.startsWith('p:')){const v=a.slice(2),B=book(F.k);if(v==='match')F.p=F.s==='s'?B.bb:B.bs;else if(v.endsWith('%'))F.p=Math.max(1,Math.round(F.p*(1+(+v.slice(0,-1))/100))+(+v.slice(0,-1)>0?0:0));else F.p=Math.max(1,F.p+(+v));F.p=Math.min(1e7,F.p)}
   else if(F&&a==='go'){if(WMK.busy)return;const q=document.getElementById('wmq'),p=document.getElementById('wmp');if(q)F.q=Math.max(1,Math.floor(+q.value||1));if(p)F.p=Math.max(1,Math.floor(+p.value||1));place(F.s,F.k,F.q,F.p);return}
   rPn();return}return _oc(e)}}
 {const _cp=closePanel;closePanel=function(){if(shop==='wmkt'){shop=null;WMK.form=null}return _cp()}}
 // talking to the clerk (T / TALK / ✕) or hitting the stalls opens it
 {const _t=talk;talk=function(){if(!pnOpen&&!menuOpen&&!dead&&nearClerk()){open();return}return _t()}}
 tk.addEventListener('touchstart',e=>{if(pnOpen||menuOpen||dead||!nearClerk())return;e.preventDefault();e.stopImmediatePropagation();open()},{passive:false,capture:true});
 {const _pu=window.SQPADUSE;window.SQPADUSE=()=>!!nearClerk()||!!(_pu&&_pu())}
 {let mineTk=false;const _u=upd;upd=function(dt){_u(dt);const n=!pnOpen&&!menuOpen&&!dead&&nearClerk();
   if(n){tk.style.display='flex';const lab='TRADE'+(isPC?'<small>T</small>':(typeof GPON!=='undefined'&&GPON?'<small>✕</small>':''));if(tk.innerHTML!==lab)tk.innerHTML=lab;mineTk=true}else if(mineTk){mineTk=false;if(!pnOpen)tk.style.display='none'}
   if(sp&&!SCENE)for(const m of en)if(!m.dead&&!m.big&&Math.hypot(m.x-WMK.clerk.x,m.y-WMK.clerk.y)<90){m.dead=1;m.dropped=1}}}
 {const _a=attack;attack=function(){if(!sp||SCENE||dead||menuOpen||pnOpen||BUILD||swing>0)return _a();const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16),s=WMK.spot;
   if(tx>=s.tx&&tx<s.tx+s.w&&ty>=s.ty&&ty<=s.ty+1&&!en.some(n=>!n.dead&&Math.hypot(n.x-fx,n.y-fy)<16)){open();return}return _a()}}
 try{WK_PLACES&&WK_PLACES.push&&WK_PLACES.push({n:'World Market',w:'Hollow Village',d:'Trade with every player: put up offers to buy or sell anything, and they match automatically.'})}catch(e){}
}
