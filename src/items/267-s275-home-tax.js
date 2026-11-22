// ---- 275. Home tax: Penny the Banker in Hollow Village, and the bank keeps homes whose tax ran out (window.SQHTAX) ----
// Nov 22 (Kevin in #ideas, approved by Jace: "instead of truly losing your stuff, you just lose access until you pay the bank ...
// include interest but do not continue adding property tax for time with no access"; Jace's picks: a house 50,000 gold and a castle
// 150,000 a month, the home goes off the map at once, paid at a banker's stall by the World Market, no castle perks for now).
// - One home per player (144), so the tax is per account: save `htax` {u: paid until (server ms, while you have a home), l: paid time
//   kept while you have no home (packed), k: 'house'|'castle' the time was paid for, f: 1 once the free first month was given,
//   h: {id,at,debt,k,w} while the bank holds your home}. Always written.
// - Time only runs while you have a home: packing it keeps what's left (`l`); placing one again carries on from there. The first
//   home (and every home standing when this came out) gets 30 free days. Switching between a house and a castle converts the time
//   left by the two prices. Pay a month (30 days) at a time, up to 90 days ahead.
// - When `u` passes (clock checked against the server: .info/serverTimeOffset), the bank takes the home: you're walked out, it's
//   taken out of HOUSES / SQRH (067), and the debt is a month's tax + 10% (no more tax while the bank has it). Placing a home is
//   refused until it's paid. Paying puts it back where it stood (Hollow: houseFits at that spot; islands: put back, and moved to your
//   bag if another player's home now stands there when you next visit) or, if the spot's taken, packs it into your bag with
//   everything (furniture, chests, yard, framed cards).
// - While held the home stays in your save: the outermost snap puts it back into HOUSES/SQRH for the length of the call, so every
//   section's save step writes it as usual; loading takes it out again. h._ypk stops 145 packing its yard into your bag when it vanishes.
// - Other players: 061's myHousesData sends `u` with each home, 067's island rows carry it as [6]; their games skip a home whose `u`
//   has passed (`gone`). Rows from games before this update have no `u` and count as paid until LEGACY (Dec 23), so homes of players
//   who never come back leave the map.
// - Homes on a guild island (`gi_` regions) pay CF.guild (half). `g` in the save: the paid time was at the guild price; the time left
//   is converted by price whenever the home's price changes (house <-> castle, onto or off a guild island).
// - Library `hometax` {house, castle, guild, days, free, interest, ahead} overrides the numbers.
(()=>{const DAY=864e5,CF={house:50000,castle:150000,guild:.5,days:30,free:30,interest:.1,ahead:90};const CF0=Object.assign({},CF);
 const LEGACY=Date.UTC(2026,11,23,6);// Dec 23, midnight in Chicago: 30 days after this came out
 try{if(window.SQA&&SQA.onApply)SQA.onApply(lib=>{Object.assign(CF,CF0);const c=lib&&lib.hometax;if(!c||typeof c!=='object')return;
  for(const k in CF0){const v=+c[k];if(isFinite(v)&&v>=0)CF[k]=k==='interest'||k==='guild'?Math.min(v,1):Math.round(v)}})}catch(e){self.SQERR&&SQERR(e,'267-1')}
 const fmt=n=>Math.round(n).toLocaleString('en-US');
 const now=()=>{try{if(window.SQMP&&SQMP.on)return Date.now()+(+SQMP.off||0)}catch(e){self.SQERR&&SQERR(e,'267-2')}return Date.now()};// the server's clock (061's mpNow isn't global)
 const rate=k=>k==='castle'?CF.castle:CF.house,kind=h=>h&&h.castle?'castle':'house';
 // Nov 22 (Jace: homes moving to guild islands frees up the main islands): a home on your guild's island pays CF.guild (half)
 const onGuild=o=>!!(o&&o.isl&&/^gi_/.test(String(o.h&&o.h.rg||''))),price=(k,g)=>Math.round(rate(k)*(g?CF.guild:1)),priceOf=o=>price(kind(o.h),onGuild(o));
 const homes=()=>{try{return window.SQONEHOME?SQONEHOME.homes():[]}catch(e){self.SQERR&&SQERR(e,'267-3');return[]}};
 const where=o=>o.isl?(WORLD_REGIONS[o.h.rg]?WORLD_REGIONS[o.h.rg].name:'an island'):'Hollow Island';
 const left=ms=>{ms=Math.max(0,ms);if(ms>DAY){const d=Math.ceil(ms/DAY-1e-9);return d+' days'}if(ms>36e5){const h=Math.ceil(ms/36e5-1e-9);return h+(h===1?' hour':' hours')}const m=Math.max(1,Math.ceil(ms/6e4));return m+(m===1?' minute':' minutes')};// rounded up: 29.9 days is "30 days"
 const day=t=>{try{return new Date(t).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}catch(e){return new Date(t).toDateString()}};
 let HT={u:0,l:0,k:'',f:0,h:null},HELD=null,ready=true,/* 114's boot load runs before the first tick */warned=-1,loginTold=false,freeTold=false;
 const fresh=()=>({u:0,l:0,k:'',g:0,f:0,h:null});
 // ---- the server's clock ----
 let clockOK=false,offSub=null;
 function watchClock(){try{const on=!!(window.SQMP&&SQMP.on&&window.SQFB);if(on&&!offSub){const F=SQFB;offSub=F.db.onValue(F.db.ref(F.D,'.info/serverTimeOffset'),()=>{clockOK=true})}
   else if(!on&&offSub){try{offSub()}catch(e){/*quiet*/}offSub=null;clockOK=false}}catch(e){self.SQERR&&SQERR(e,'267-4')}}
 // ---- taking a home off the map, and putting it back ----
 const inHome=h=>!!(SCENE&&(SCENE.house===h||(SCENE.house&&SCENE.house.base===h)));
 function unmap(o){const h=o.h;h._ypk=1;// 145: don't pack the yard into the bag when the house disappears
  if(o.isl){const L=window.SQRH||[],j=L.indexOf(h);if(j>=0)L.splice(j,1);try{rhSolidSync()}catch(e){self.SQERR&&SQERR(e,'267-5')}}
  else{HOUSES=HOUSES.filter(q=>q!==h);for(const i of houseTiles(h))BS.delete(i)}}
 function remap(o){const h=o.h;delete h._ypk;if(o.isl){const L=window.SQRH;if(!L.includes(h))L.push(h);h._htchk=performance.now();try{rhSolidSync()}catch(e){self.SQERR&&SQERR(e,'267-6')}}
  else{if(!HOUSES.includes(h))HOUSES.push(h);addHouseBS(h)}}
 function tell(m,t){try{say(m);msgT=t||8;try{mpLog('game',m)}catch(e){self.SQERR&&SQERR(e,'267-7')}}catch(e){self.SQERR&&SQERR(e,'267-8')}}
 function save(){try{saveLocal(true);saveCloud(true)}catch(e){self.SQERR&&SQERR(e,'267-9')}}
 function take(o){const h=o.h,k=kind(h);
  for(let n=0;n<3&&inHome(h);n++){try{leaveScene()}catch(e){self.SQERR&&SQERR(e,'267-10');break}}
  try{if(typeof BUILD!=='undefined'&&BUILD)endBuild()}catch(e){self.SQERR&&SQERR(e,'267-11')}
  try{if(pnOpen&&CHEST_H&&([...h.furn.values()].includes(CHEST_H)||(h.yf&&[...h.yf.values()].includes(CHEST_H))))closePanel()}catch(e){self.SQERR&&SQERR(e,'267-12')}
  unmap(o);HELD=o;HT.h={id:h.id,at:now(),debt:Math.round(priceOf(o)*(1+CF.interest)),k,w:where(o)};HT.u=0;HT.l=0;warned=-1;
  tell('Your '+k+' tax ran out, so the bank is looking after your '+k+' and everything in it. Pay '+fmt(HT.h.debt)+' gold at the bank in Hollow Village (next to the World Market) to get it back.',12);
  try{sfx('swish')}catch(e){self.SQERR&&SQERR(e,'267-13')}save()}
 // everything in a home into the bag (house/castle, furniture, chest contents, yard, framed cards)
 function toBag(h){const k=kind(h);inv[k]=(inv[k]|0)+1;const add=f=>{inv[f.t]=(inv[f.t]|0)+1;if(f.items)for(const k2 in f.items)inv[k2]=(inv[k2]|0)+(f.items[k2]|0)};
  try{const CFR=window.SQCARDFRAME;if(CFR){for(const[i,f]of h.furn)if(f.t==='cardframe')CFR.takeDown(h,i,true);if(h.yf)for(const[i,f]of h.yf)if(f.t==='cardframe')CFR.takeDown({id:h.id+'~y'},i,true)}}catch(e){self.SQERR&&SQERR(e,'267-14')}
  for(const f of h.furn.values())add(f);if(h.yf)for(const f of h.yf.values())add(f);h.furn=new Map();h.yf=new Map();h.yp=new Map();
  try{if(typeof HOMESP!=='undefined'&&HOMESP===h.id)HOMESP=null}catch(e){self.SQERR&&SQERR(e,'267-15')}}
 // can the house go back on its Hollow spot? (houseFits looks where you stand, so stand there for the call)
 function fitsHollow(h){const px=P.x,py=P.y;try{P.x=h.x*16+8;P.y=(h.y+1)*16+8;return!!houseFits()}catch(e){self.SQERR&&SQERR(e,'267-16');return false}finally{P.x=px;P.y=py}}
 function giveBack(){if(!HELD||!HT.h)return;const o=HELD,h=o.h,k=kind(h);HELD=null;HT.h=null;
  const ok=o.isl?!!WORLD_REGIONS[h.rg]:fitsHollow(h);
  HT.g=onGuild(o)?1:0;// the month just paid was at this home's price
  if(ok){remap(o);HT.u=now()+CF.days*DAY;HT.l=0;HT.k=k;tell('Your '+k+' is back where it stood on '+where(o)+', with everything inside. Its tax is paid for '+CF.days+' days.',9)}
  else{delete h._ypk;toBag(h);HT.u=0;HT.l=CF.days*DAY;HT.k=k;tell('Someone built where your '+k+' stood, so the bank put your '+k+' in your bag with everything that was in it. Place it somewhere new: its tax is paid for '+CF.days+' days.',12)}
  warned=-1;save()}
 // an island home put back while you were in Hollow: if another player's home stands there now, it goes to your bag
 function checkIsland(){const L=window.SQRH||[];for(const h of L){if(h._foreign||!h._htchk)continue;if(performance.now()-h._htchk>120000){delete h._htchk;continue}
   let here=[];try{here=window.rhList?rhList():[]}catch(e){self.SQERR&&SQERR(e,'267-17')}if(!here.includes(h))continue;
   if(here.some(q=>q._foreign&&Math.abs(q.x-h.x)<=6&&Math.abs(q.y-h.y)<=1)){for(let n=0;n<3&&inHome(h);n++)try{leaveScene()}catch(e){self.SQERR&&SQERR(e,'267-18');break}
    const j=L.indexOf(h);if(j>=0)L.splice(j,1);try{rhSolidSync()}catch(e){self.SQERR&&SQERR(e,'267-19')}const k=kind(h);toBag(h);if(HT.u){HT.l=Math.max(0,HT.u-now());HT.u=0}
    tell('Someone built where your '+k+' stood, so it\'s in your bag now with everything that was in it. Place it somewhere new.',10);save();return}}}
 // ---- every second: start the free month, keep the time, warn, take ----
 const WARN=[7*DAY,3*DAY,DAY,36e5];
 function tick(){watchClock();if(!ready)return;try{checkIsland()}catch(e){self.SQERR&&SQERR(e,'267-20')}if(HELD)return;const t=now(),o=homes()[0]||null;
  if(o){const k=kind(o.h),gi=onGuild(o)?1:0;
   if(!HT.u){if(HT.f)HT.u=t+HT.l;else{HT.u=t+CF.free*DAY;HT.f=1;HT.k=k;HT.g=gi;if(!freeTold)setTimeout(()=>tell('Homes pay a little tax now, at the bank in Hollow Village next to the World Market. Your first '+CF.free+' days are free!',10),loginTold?0:4000);freeTold=true}HT.l=0;if(!HT.k){HT.k=k;HT.g=gi}warned=-1}
   // the time left keeps its worth in gold when the price changes (house <-> castle, onto or off a guild island)
   if(HT.k!==k||(HT.g|0)!==gi){if(HT.u>t)HT.u=t+(HT.u-t)*price(HT.k,HT.g)/price(k,gi);HT.k=k;HT.g=gi;warned=-1}
   if(t>=HT.u){if(clockOK&&!dead)take(o);return}
   const ms=HT.u-t;let w=-1;for(let i=0;i<WARN.length;i++)if(ms<=WARN[i])w=i;
   if(w>warned||(!loginTold&&w>=0)){warned=Math.max(w,warned);loginTold=true;tell('Your '+k+' tax runs out in '+left(ms)+'. Pay at the bank in Hollow Village, next to the World Market.',8)}
   loginTold=true}
  else if(HT.u){HT.l=Math.max(0,HT.u-t);HT.u=0}}
 setInterval(()=>{try{tick()}catch(e){self.SQERR&&SQERR(e,'267-21')}},1000);
 // ---- saving and loading ----
 SQSAVE.wrap('267 held home',next=>function(){if(!HELD)return next.apply(this,arguments);const o=HELD,h=o.h;
  if(o.isl)window.SQRH.push(h);else HOUSES.push(h);
  try{return next.apply(this,arguments)}finally{if(o.isl){const L=window.SQRH,j=L.indexOf(h);if(j>=0)L.splice(j,1)}else HOUSES=HOUSES.filter(q=>q!==h)}});
 SQSAVE.after('267:htax',s=>{s.htax={u:HT.u,l:HT.l,k:HT.k,g:HT.g|0,f:HT.f,h:HT.h}});
 SQLOAD.after('267',(S)=>{const v=S&&S.htax,num=x=>Math.max(0,+x||0);HT=fresh();HELD=null;warned=-1;loginTold=false;
  if(v&&typeof v==='object'){HT.u=num(v.u);HT.l=num(v.l);HT.k=v.k==='castle'?'castle':v.k==='house'?'house':'';HT.g=v.g?1:0;HT.f=v.f?1:0;
   const q=v.h;if(q&&typeof q==='object'&&q.id!=null){const o=homes().find(o=>String(o.h.id)===String(q.id));
    if(o){unmap(o);HELD=o;HT.h={id:o.h.id,at:num(q.at),debt:num(q.debt)>0?Math.round(num(q.debt)):Math.round(priceOf(o)*(1+CF.interest)),k:kind(o.h),w:where(o)};HT.u=0}}}
  ready=true;if(HELD)setTimeout(()=>{if(HELD&&HT.h)tell('The bank is looking after your '+HT.h.k+'. Pay '+fmt(HT.h.debt)+' gold at the bank in Hollow Village (next to the World Market) to get it back.',10)},4000)});
 SQNEWGAME.before('267',()=>{ready=false;HT=fresh();HELD=null;warned=-1;loginTold=false});
 SQNEWGAME.after('267',()=>{ready=true});
 // ---- no new home while the bank has yours, or while the tax isn't paid ----
 SQSTARTB.wrap('267 home tax',_sb=>function(k){if(k==='house'||k==='castle'){
   if(HELD&&HT.h){tell('The bank is looking after your '+HT.h.k+' until you pay what you owe ('+fmt(HT.h.debt)+' gold) at the bank in Hollow Village. Then you get it back.',9);try{sfx('swish');closePanel()}catch(e){self.SQERR&&SQERR(e,'267-22')}return}
   if(!homes().length&&HT.f&&!HT.u&&HT.l<=0){tell('Your home tax has run out. Pay a month at the bank in Hollow Village (next to the World Market), then place your '+k+'.',9);try{sfx('swish');closePanel()}catch(e){self.SQERR&&SQERR(e,'267-23')}return}}
  return _sb.apply(this,arguments)});
 // ---- Penny's stall, beside the World Market ----
 const KIND='banker';let SX=0,SY=0,BNPC=null;
 (function place(){const M=window.SQWMK&&SQWMK.spot;if(!M)return;
  const free=(x,y)=>{const i=y*N+x;return x>1&&y>1&&x<N-2&&y<N-2&&(tile[i]===2||tile[i]===1)&&!BS.has(i)&&!PROT.has(i)&&!(typeof BRIDGE!=='undefined'&&BRIDGE.has(i))&&!STR.has(i)&&!ROADS.has(i)&&!(typeof inTownTiles==='function'&&inTownTiles(x,y))};
  // the stall is 2 tiles (SX, SX+1 on row SY), Penny stands at SX+2; keep the box around it clear: one row above for the awning, one below to walk up to it
  const C=[[M.tx-6,M.ty+1],[M.tx-7,M.ty+1],[M.tx+M.w+2,M.ty+1],[M.tx-6,M.ty+2],[M.tx+M.w+2,M.ty+2],[M.tx-6,M.ty+4],[M.tx+M.w+3,M.ty+4]];
  for(let r=0;r<10&&!SX;r++)for(const[cx,cy]of r?C.map(([x,y])=>[x-r,y+(r&1)]):C){let ok=true;for(let y=cy-1;y<=cy+1&&ok;y++)for(let x=cx-1;x<=cx+3;x++)if(!free(x,y)){ok=false;break}if(ok){SX=cx;SY=cy;break}}
  if(!SX)return;for(let y=SY-2;y<=SY+1;y++)for(let x=SX-1;x<=SX+3;x++){const i=y*N+x;if(obj[i])obj[i]=null;if(y>=SY-1)PROT.add(i)}BS.add(SY*N+SX);BS.add(SY*N+SX+1);
  const x=(SX+2)*16+8,y=SY*16+8;// she stays at her stall: wt never runs out (006's roaming), and H far from home reads as "on a routine" to 061's shared wandering
  BNPC={kind:KIND,name:'Penny the Banker',isle:'Hollow Village',x,y,hx:x,hy:y,tx:x,ty:y,wt:1e12,ph:0,dir:0,st:0,H:[-1e9,-1e9],ch:{sk:2,hs:2,hc:1,sh:6,pn:1,ht:0,hcol:0,so:3}};NPCS.push(BNPC)})();
 function drawStall(tm){const X=SX*16,b=(SY+1)*16-2,cx=X+16,R=Rg;shd(cx,b-1,34);
  // the back wall (so the stall looks built, not see-through), the posts and the striped awning
  R(X+3,b-28,26,16,O);R(X+4,b-28,24,15,'#c8a070');for(let xx=X+9;xx<X+28;xx+=6)R(xx,b-28,1,15,'#a88050');R(X+4,b-21,24,1,'#8a6038');R(X+6,b-25,6,4,O);R(X+7,b-24,4,2,'#5a6a80');R(X+8,b-24,2,1,'#f8d048');
  R(X+1,b-31,3,22,O);R(X+2,b-30,1,20,'#8a5a30');R(X+28,b-31,3,22,O);R(X+29,b-30,1,20,'#8a5a30');
  R(X-2,b-36,36,8,O);for(let k=0;k<8;k++)R(X-1+k*4,b-35,4,6,k%2?'#f0e8c8':'#2e8a50');R(X-1,b-35,34,1,'#58b878');for(let k=0;k<8;k++){R(X-1+k*4,b-29,4,2,O);R(X+k*4,b-29,2,1,k%2?'#f0e8c8':'#2e8a50')}
  // the sign
  const tw=30;R(cx-tw/2-1,b-48,tw+2,12,O);R(cx-tw/2,b-47,tw,10,'#f0d890');R(cx-tw/2,b-47,tw,1,'#fff0c0');R(cx-1,b-37,2,2,O);
  g.save();g.font='700 7px '+PF;g.fillStyle='#4a2a10';g.textAlign='center';g.textBaseline='middle';g.fillText('BANK',cx,b-41.5);g.restore();
  // the counter: wood top, green cloth front with a gold coin
  R(X,b-13,32,13,O);R(X+1,b-12,30,3,'#a86c3c');R(X+1,b-12,30,1,'#c88850');R(X+1,b-9,30,8,'#2e7048');R(X+1,b-9,30,1,'#e8b830');R(X+1,b-2,30,1,'#1e5034');
  R(cx-3,b-8,6,6,O);R(cx-2,b-7,4,4,'#f8d048');R(cx-2,b-7,4,1,'#fff0a0');R(cx-1,b-6,2,2,'#c08820');
  // on the counter: stacks of coins and a ledger
  for(const[sx,n]of[[X+4,3],[X+8,2]])for(let j=0;j<n;j++){R(sx-1,b-15-j*2,5,2,O);R(sx,b-15-j*2,3,1,j===n-1?'#fff0a0':'#f8d048')}
  R(X+21,b-17,8,5,O);R(X+22,b-16,6,3,'#f0ece0');R(X+25,b-16,1,3,'#a8a090');R(X+22,b-13,6,1,'#8a4a3a');
  const glint=Math.floor(tm*2)%7===0;if(glint)R(X+5,b-20,1,1,'#ffffff');
}
 if(SX){const _lh=LHOOK;LHOOK=(L,x0,y0,x1,y1,tm)=>{_lh(L,x0,y0,x1,y1,tm);if(SCENE||SX+2<x0-3||SX>x1+3||SY>y1+4||SY<y0-4)return;L.push([(SY+1)*16-2,4,()=>{try{drawStall(tm)}catch(e){self.SQERR&&SQERR(e,'267-24')}}])};
  SQDRAWMAP.after('267',()=>{const c=document.getElementById('mpc'),R=SCENE&&SCENE.room;if(!c||R&&R.region||(typeof MAPVIEW!=='undefined'&&MAPVIEW==='world'))return;const x=c.getContext('2d');x.fillStyle='#101010';x.fillRect(SX-1,SY-2,5,5);x.fillStyle='#38b868';x.fillRect(SX,SY-1,3,3)})}
 // ---- talking to Penny ----
 const LINES=['"Welcome to the bank! Every home pays a little tax to keep its spot on the map."','"Pay ahead and you won\'t have to worry. I\'ll take up to three months at a time."','"If a tax runs out, I look after the home and everything in it until you come and pay."'];
 let line=0;const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const btn=(a,label,on,why)=>'<button class="sb" data-bank="'+a+'"'+(on?'':' disabled style="opacity:.55"')+'>'+label+(why?'<br><small>'+why+'</small>':'')+'</button>';
 function html(){const t=now(),o=homes()[0]||null,M=CF.days*DAY;let h='<div class="tl">Penny the Banker</div><div class="qc"><p>'+LINES[line%LINES.length]+'</p></div><div class="qc bk-st">';
  if(HELD&&HT.h){const d=HT.h.debt;h+='<p>I\'m looking after your '+HT.h.k+' from '+esc(HT.h.w)+', and everything in it. You owe <b>'+fmt(d)+' gold</b>: one month of tax and '+Math.round(CF.interest*100)+'% interest.</p></div>'+
    btn('back','Pay '+fmt(d)+' gold and get my '+HT.h.k+' back',GLD>=d,GLD>=d?'':'You need '+fmt(d-GLD)+' more gold.')}
  else if(o){const k=kind(o.h),c=priceOf(o),ms=Math.max(0,HT.u-t),room=HT.u+M-t<=CF.ahead*DAY+6e4;
   h+='<p>Your '+k+' on '+esc(where(o))+': tax paid until <b>'+esc(day(HT.u))+'</b> ('+left(ms)+' left).'+(onGuild(o)?' It\'s on your guild\'s island, so it pays half.':'')+'</p></div>'+
    btn('pay','Pay 1 month ('+CF.days+' days) · '+fmt(c)+' gold',room&&GLD>=c,!room?'You\'ve paid as far ahead as you can ('+Math.round(CF.ahead/CF.days)+' months).':GLD<c?'You need '+fmt(c-GLD)+' more gold.':'')}
  else if(!HT.f)h+='<p>You don\'t have a home yet. When you place your first house or castle, its first '+CF.free+' days of tax are free.</p></div>';
  else if(HT.l>0)h+='<p>You don\'t have a home right now. You have '+left(HT.l)+' of tax paid: it\'s kept for when you place your home again.</p></div>';
  else h+='<p>You don\'t have a home right now, and your home tax has run out. Pay a month here before you place one.</p></div>'+
    btn('ph','Pay 1 month for a house · '+fmt(CF.house)+' gold',GLD>=CF.house,GLD<CF.house?'You need '+fmt(CF.house-GLD)+' more gold.':'')+btn('pc','Pay 1 month for a castle · '+fmt(CF.castle)+' gold',GLD>=CF.castle,GLD<CF.castle?'You need '+fmt(CF.castle-GLD)+' more gold.':'');
  return h+'<div class="tl" style="font-size:11px;font-weight:400;opacity:.75;margin-top:10px">A house costs '+fmt(CF.house)+' gold a month, a castle '+fmt(CF.castle)+'. Homes on your guild\'s island pay half. If the tax runs out, the bank takes the home off the map and keeps it safe with everything inside, until you pay one month and '+Math.round(CF.interest*100)+'% more.</div><div class="tl" style="margin-top:8px">Gold: '+fmt(GLD)+'</div>'}
 SQRPN.wrap('267',_r=>function(){if(ptab==2&&shop===KIND){try{panelChrome('')}catch(e){self.SQERR&&SQERR(e,'267-25')}pbd.innerHTML=html();return}return _r.apply(this,arguments)});
 SQCLOSEPN.before('267',()=>{if(shop===KIND)line++});
 function act(a){const t=now(),o=homes()[0]||null,M=CF.days*DAY;
  if(a==='back'){if(!HELD||!HT.h)return;const d=HT.h.debt;if(GLD<d){sfx('swish');return}GLD-=d;sfx('coin');giveBack();return}
  if(a==='pay'){if(!o||HELD)return;const k=kind(o.h),c=priceOf(o);if(GLD<c||HT.u+M-t>CF.ahead*DAY+6e4){sfx('swish');return}GLD-=c;HT.u=Math.max(HT.u,t)+M;HT.k=k;HT.g=onGuild(o)?1:0;warned=-1;sfx('coin');tell('Paid! Your '+k+' tax is paid until '+day(HT.u)+'.',6);save();return}
  if(a==='ph'||a==='pc'){if(o||HELD||HT.l>0)return;const k=a==='pc'?'castle':'house',c=rate(k);if(GLD<c){sfx('swish');return}GLD-=c;HT.l=M;HT.k=k;HT.g=0;sfx('coin');tell('Paid! You can place your '+k+' now: its tax is paid for '+CF.days+' days.',7);save()}}
 pbd.addEventListener('click',e=>{if(shop!==KIND||ptab!=2||!pnOpen)return;const b=e.target.closest('[data-bank]');if(!b)return;e.stopPropagation();e.preventDefault();if(b.disabled)return;
  try{act(b.dataset.bank)}catch(err){self.SQERR&&SQERR(err,'267-26')}try{svg()}catch(err){self.SQERR&&SQERR(err,'267-27')}rPn()},true);
 // ---- where to see it: the bag (under your gold) and the map ----
 function status(){if(HELD&&HT.h)return'The bank is looking after your '+HT.h.k+': pay '+fmt(HT.h.debt)+' gold at the bank in Hollow Village.';
  const o=homes()[0];if(o&&HT.u)return'Your '+kind(o.h)+' tax is paid for '+left(HT.u-now())+' more (until '+day(HT.u)+').';return''}
 {const _b=bagGridHTML;bagGridHTML=function(){const h=_b.apply(this,arguments);try{const s=status();if(s)return h+'<div class="bk-bag">'+esc(s)+'</div>'}catch(e){self.SQERR&&SQERR(e,'267-28')}return h}}
 SQMAPHTML.wrap('267',_m=>function(){const h=_m.apply(this,arguments);try{const s=status();if(s&&typeof h==='string')return h+'<div class="bk-bag" style="margin-top:6px">'+esc(s)+'</div>'}catch(e){self.SQERR&&SQERR(e,'267-29')}return h});
 const st=document.createElement('style');st.textContent='.bk-bag{text-align:center;font-size:12px;opacity:.85;margin-top:4px;line-height:1.35}.bk-st p{margin:0}';document.head.appendChild(st);
 // ---- words elsewhere ----
 IDESC.house=(IDESC.house||'')+' Homes pay a little tax at the bank in Hollow Village: '+fmt(CF.house)+' gold a month for a house, half on your guild\'s island (the first month is free).';
 IDESC.castle=(IDESC.castle||'')+' Castles pay '+fmt(CF.castle)+' gold a month of tax at the bank in Hollow Village (half on your guild\'s island).';
 try{if(typeof WK_ROLE!=='undefined')WK_ROLE[KIND]='Bank: pay the tax on your house or castle'}catch(e){self.SQERR&&SQERR(e,'267-30')}
 window.SQHTAX={CF,get state(){return HT},get held(){return HELD},heldIds:()=>HELD?[String(HELD.h.id)]:[],pubU:()=>HT.u||0,
  gone(u){const t=now();if(u==null||u==='')return t>LEGACY;u=+u;return isFinite(u)&&u>0&&t>u},
  take:()=>{const o=homes()[0];if(o&&!HELD)take(o)},giveBack,html,act,get stall(){return SX?{x:SX,y:SY,npc:BNPC}:null},get clockOK(){return clockOK},tick}})();
