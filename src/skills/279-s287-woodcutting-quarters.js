// ---- 287. Woodcutting: "all chop, no recovery" (Nov 24 evening, Jace) ----
// Jace's model: every chop takes the same time (base 1 s, set in Dev Suite > Balance > Woodcutting), with no level speed-up, recovery
// perk or axe-upgrade speed; 277's toughness numbers were cut to about 0.6 to match (1.67x the damage a chop). A tree pays as it goes
// down: each quarter of its hit points gives 1 log (qlog) and a quarter of its XP, and felling it gives 1 to "extra log limit" logs
// (start 1, +1 for each Bigger Haul perk, +1/+2/+3 for a +1/+2/+3 axe). Every 10 levels (10-90) the Woodcutting tree offers one of two
// perks: Quick Chop (every chop 0.05 s quicker; 9 of them: 0.55 s) or Bigger Haul (+1 extra log limit; 9 of them: up to 10). They
// replace all the old Woodcutting perks and the old speed and extra-log numbers; saves from before (no s.wcv) get their Woodcutting
// perks back to choose again, free. Rare wood (Heartwood) still rolls on a felled tree.
// How: the chop sites (004, 014, 050, 083) still run and give their old logs and XP. This HIT step runs around them: 277's dmg() notes
// the tree and its hit points before the chop (SQCHOP.last); afterwards the logs they gave are put back as they were, their Woodcutting
// XP was held back (the addXp step below), and the quarters the chop crossed are paid instead. 199's void-log swap and 116's treeling
// stand aside while busy; the treeling rolls on each payout here (SQTREELING.roll).
(()=>{
 const C=window.SQCHOP;if(!C)return;
 const DEF={base:1,step:.05,qlog:1,start:1},TDEF={...C.TOUGH,void:C.VOID.t},LV=[10,20,30,40,50,60,70,80,90];
 let WC={...DEF},busy=false,hold=false,held=0;
 const fmt=v=>String(Math.round(v*100)/100);
 const isLog=k=>k==='wood'||/log$/.test(k);
 const num=(v,lo,hi,d)=>{if(v===''||v==null)return d;v=+v;return isFinite(v)&&v>=lo&&v<=hi?v:d};
 // ---- settings: library balance.wc = {base, step, qlog, start, t:{tree, pine, oak, willow, maple, yew, void}} ----
 const qd=()=>'Every chop takes '+fmt(WC.step)+' s less ('+fmt(WC.base)+' s to start).';
 function calc(src){src=src||{};const w={base:num(src.base,.2,5,DEF.base),step:num(src.step,0,.5,DEF.step),qlog:Math.round(num(src.qlog,0,5,DEF.qlog)),start:Math.round(num(src.start,1,20,DEF.start))};
  const t=src.t||{},T={};for(const k in TDEF)T[k]=num(t[k],.25,999,TDEF[k]);return{w,T}}
 function apply(src){const c=calc(src);WC=c.w;for(const k in c.T){if(k==='void')C.VOID.t=c.T[k];else C.TOUGH[k]=c.T[k]}
  try{for(const l of LV){const c=TREES[1]&&TREES[1].choices[l];if(c&&c[0]&&c[0].id==='wc_quick')c[0].d=qd()}}catch(e){self.SQERR&&SQERR(e,'287-1')}
  try{if(window.SQWIKI2&&SQWIKI2.fixDescs)SQWIKI2.fixDescs()}catch(e){self.SQERR&&SQERR(e,'287-2')}}
 try{if(window.SQA&&SQA.onApply)SQA.onApply(lib=>apply(lib&&lib.balance&&lib.balance.wc))}catch(e){self.SQERR&&SQERR(e,'287-3')}
 // ---- the player's numbers ----
 const picks=()=>{const P2=(typeof PERKS!=='undefined'&&PERKS[1])||{},l=lvOf(1);let s=0,y=0;for(const v of LV){if(l<v)continue;if(P2[v]==='a')s++;else if(P2[v]==='b')y++}return{s,y}};
 const axeUp=()=>{try{return window.SQUPGRADE&&SQUPGRADE.lv?SQUPGRADE.lv('axe')|0:0}catch(e){return 0}};
 const chopTime=s=>Math.max(.1,WC.base-WC.step*(s==null?picks().s:s));
 const limit=()=>WC.start+picks().y+axeUp();
 // seconds to fell a tree of this toughness with this axe tier (no walking), with s Quick Chop perks
 const secs=(t,ax,s)=>Math.ceil(t/(C.POW[ax]||1)-1e-9)*chopTime(s||0);
 // what a tree gives: its log, its XP, and whether a tier tree's fall also gives 1 plain wood (as before)
 function kind(o){if(C.isVoid(o))return{log:'voidlog',xp:C.VOID.xp,wood:0};const T=window.SQTIER&&SQTIER[o.t];if(T&&(T.sk===1||T.base==='tree')&&T.item)return{log:T.item,xp:T.xp|0,wood:1};
  return{log:'wood',xp:o.t==='pine'?28:25,wood:0}}
 const lname=(k,n)=>{const s=String((typeof INAME!=='undefined'&&INAME[k])||k).toLowerCase();return k==='wood'?'wood':n===1?s.replace(/logs$/,'log'):s};
 // ---- the old fell XP is held back while a chop runs (paid by quarters below) ----
 SQADDXP.wrap('287 woodcutting XP comes every quarter of a tree',next=>function(i,x){if(hold&&+i===1){held+=+x||0;return}return next.apply(this,arguments)});
 // ---- 038's bonuses on a felled tree: only the rare-wood roll is left ----
 try{const _gb=gBoost;gBoost=function(sk,gains,x,y){if(sk!==1||!busy)return _gb.apply(this,arguments);
   if(Math.random()<gRare(1)){inv.heartwood=(inv.heartwood|0)+1;try{gTxt(x,y-30,'RARE: '+INAME.heartwood,'#58a8ff');sfx('quest')}catch(e){self.SQERR&&SQERR(e,'287-4')}}}}catch(e){self.SQERR&&SQERR(e,'287-5')}
 // ---- the chop ----
 function pay(L,snap,hw0){const o=L.o,K=kind(o),max=L.max||3,f=h=>Math.min(1,Math.max(0,1-Math.max(0,+h||0)/max));
  for(const k in inv)if((isLog(k)||k===K.log)&&(inv[k]|0)!==(snap[k]|0))inv[k]=snap[k]|0;// what the old code gave goes back
  swing=chopTime();try{if(typeof ACTN!=='undefined'&&ACTN&&ACTN.type==='chop'&&ACTN.t<.05)ACTN.dur=Math.min(.5,swing*.8)}catch(e){self.SQERR&&SQERR(e,'287-6')}
  const fell=!(o.hp>0),q0=Math.min(4,Math.floor(f(L.hp0)*4+1e-6)),q1=fell?4:Math.min(3,Math.floor(f(o.hp)*4+1e-6));
  const qx=j=>j<4?Math.floor(K.xp/4):K.xp-3*Math.floor(K.xp/4);let logs=0,xp=0,fellN=0;
  for(let j=q0+1;j<=q1;j++){xp+=qx(j);if(j<4)logs+=WC.qlog;else{fellN=1+Math.floor(Math.random()*Math.max(1,limit()));logs+=fellN}}
  if(logs>0)inv[K.log]=(inv[K.log]|0)+logs;const wood=fell&&K.wood?1:0;if(wood)inv.wood=(inv.wood|0)+1;
  let pet=0;if(logs>0)try{if(window.SQTREELING)pet=SQTREELING.roll(o,K.log)}catch(e){self.SQERR&&SQERR(e,'287-7')}
  if(xp>0){if(!fell)window.SQNOWEAR=1;try{addXp(1,xp)}finally{window.SQNOWEAR=0}}// the axe wears once a tree, on the chop that fells it (275)
  if(logs>0||wood){const[fx,fy]=front(13),rare=(inv.heartwood|0)>hw0;
   try{gTxt(fx,fy-22,'+'+logs+' '+lname(K.log,logs),'#7cd060')}catch(e){self.SQERR&&SQERR(e,'287-8')}
   say('+'+logs+' '+lname(K.log,logs)+(wood?' and +1 wood':'')+(fell?' (felled: '+fellN+' of up to '+Math.max(1,limit())+')':'')+(rare?'. Rare find: '+INAME.heartwood+'!':''))}}
 SQHIT.wrap('287 woodcutting: every chop takes the same time; logs and XP every quarter of a tree',next=>function(){
  C.last=null;busy=true;hold=true;held=0;const snap={};for(const k in inv)if(isLog(k))snap[k]=inv[k]|0;const hw0=inv.heartwood|0;let out;
  try{out=next.apply(this,arguments)}finally{busy=false;hold=false}
  const L=C.last;C.last=null;
  if(!L){// not a tree: give back any Woodcutting XP held, and the treeling's chance on other logs (a cactus's wood)
   try{if(held>0)addXp(1,held)}catch(e){self.SQERR&&SQERR(e,'287-9')}
   try{if(window.SQTREELING)for(const k in inv)if(isLog(k)&&(inv[k]|0)>(snap[k]|0)){SQTREELING.roll(null,k);break}}catch(e){self.SQERR&&SQERR(e,'287-10')}
   held=0;return out}
  held=0;try{pay(L,snap,hw0)}catch(e){self.SQERR&&SQERR(e,'287-11')}return out});
 // ---- the Woodcutting tree: the two perks every 10 levels, instead of the old ones ----
 try{TREES[1].choices=Object.fromEntries(LV.map(l=>[l,[{id:'wc_quick',n:'Quick Chop',d:qd()},{id:'wc_haul',n:'Bigger Haul',d:'+1 extra log limit: a felled tree can give 1 more log.'}]]));
  const T=TREES[1],_st=T.step;T.step=function(l){let a=_st.apply(this,arguments);a=a.filter(x=>!/chopping speed|extra-log chance/.test(String(x)));
   if(l===1)a.push('Every chop takes '+fmt(WC.base)+' s. Each quarter of a tree gives '+(WC.qlog===1?'1 log':WC.qlog+' logs')+' and a quarter of its XP; a felled tree gives 1 log up to your extra log limit ('+WC.start+' to start)');
   return a}}catch(e){self.SQERR&&SQERR(e,'287-12')}
 // saves from before: Woodcutting perks to choose again, free
 const WCV=2;
 SQSAVE.after('287:wcv',s=>{s.wcv=WCV});try{KNOWN49.add('wcv')}catch(e){self.SQERR&&SQERR(e,'287-13')}
 SQLOAD.after('287',S=>{try{if(!(+(S&&S.wcv)>=WCV)&&typeof PERKS!=='undefined'&&PERKS[1]&&Object.keys(PERKS[1]).length){PERKS[1]={};
   setTimeout(()=>{try{if(!dead){say('Woodcutting has changed! Pick your Woodcutting perks again in Skills (free): Quick Chop or Bigger Haul every 10 levels.');msgT=7}}catch(e){self.SQERR&&SQERR(e,'287-14')}},4000)}}catch(e){self.SQERR&&SQERR(e,'287-15')}});
 // ---- the wiki ----
 try{if(typeof WK_SKILL!=='undefined')WK_SKILL.Woodcutting='Chop trees with an axe: face a tree and press HIT. Every chop takes 1 second, and a better axe takes more off the tree, so it falls in fewer chops. '+
  'Each quarter of a tree gives 1 log and a quarter of its XP; when it falls you get 1 log up to your extra log limit. Your limit starts at 1: each Bigger Haul perk adds 1, and a +1, +2 or +3 axe adds 1, 2 or 3. '+
  'Every 10 levels pick Quick Chop (each chop 0.05 s quicker) or Bigger Haul. Oak needs Woodcutting 15, willow 30, maple 45, yew 60. Void trees need Woodcutting 75 and an adamant axe or better.'}catch(e){self.SQERR&&SQERR(e,'287-16')}
 // ---- Dev Suite > Balance > Woodcutting (163 calls view() with its draft balance.wc) ----
 const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const TN={tree:'Tree',pine:'Pine',oak:'Oak',willow:'Willow',maple:'Maple',yew:'Yew',void:'Void tree'},TL0={tree:1,pine:1,oak:15,willow:30,maple:45,yew:60,void:75};
 const AXN={1:'wooden',2:'stone',3:'iron',4:'steel',6:'mithril',7:'adamant',9:'meteorite'};
 function view(M){M=M||{};const c=calc(M),W2=c.w,TT=c.T,ct=s=>Math.max(.1,W2.base-W2.step*s);
  const inp=(path,v,d,step)=>'<input type="number" min="0" step="'+(step||'any')+'" data-bx="wc.'+path+'" value="'+v+'" style="width:80px'+(v!==d?';background:#fff2b0':'')+'">'+(v!==d?' <small class="dv-mut">was '+d+'</small>':'');
  let h='<div class="dv-card"><b>Woodcutting</b><p class="dv-mut">Every chop takes the base chop time, less the Quick Chop time for each Quick Chop perk (one can be picked every 10 levels). '+
   'A tree falls after toughness ÷ the axe\'s chopping power chops (rounded up). Each quarter of a tree gives the quarter logs and a quarter of its XP; the fall gives 1 up to the extra log limit '+
   '(the starting limit, +1 a Bigger Haul perk, +1/+2/+3 for a +1/+2/+3 axe). With Preview on, Save to draft tries it in your own game.</p><table>'+
   '<tr><td style="padding-right:10px">Base chop time (s)</td><td>'+inp('base',W2.base,DEF.base,'0.05')+'</td></tr>'+
   '<tr><td>Quick Chop: seconds off each</td><td>'+inp('step',W2.step,DEF.step,'0.01')+'</td></tr>'+
   '<tr><td>Logs for each quarter</td><td>'+inp('qlog',W2.qlog,DEF.qlog,'1')+'</td></tr>'+
   '<tr><td>Extra log limit to start</td><td>'+inp('start',W2.start,DEF.start,'1')+'</td></tr></table>'+
   '<p style="margin:10px 0 4px"><b>Toughness</b></p><table>'+Object.keys(TDEF).map(k=>'<tr><td style="padding-right:10px">'+TN[k]+'</td><td>'+inp('t.'+k,TT[k],TDEF[k],'0.25')+'</td></tr>').join('')+'</table></div>';
  // what that comes to: chops and seconds per tree with each axe
  const AX=[1,2,3,4,6,7,9];
  h+='<div class="dv-card" style="margin-top:8px"><b>Chops and seconds per tree</b><p class="dv-mut">Chops, then seconds with no Quick Chop perks / with all 9 ('+fmt(ct(9))+' s a chop). Walking between trees not counted.</p><table><tr><th style="text-align:left">Tree</th>'+
   AX.map(a=>'<th>'+AXN[a]+'</th>').join('')+'</tr>'+Object.keys(TDEF).map(k=>'<tr><td style="padding:2px 10px 2px 0">'+TN[k]+' <small class="dv-mut">'+TL0[k]+'</small></td>'+AX.map(a=>{
    if(k==='void'&&a<C.VOID.axe)return'<td class="dv-mut" style="text-align:center">–</td>';const n=Math.ceil(TT[k]/C.POW[a]-1e-9);return'<td style="text-align:center;padding:2px 6px">'+n+' <small class="dv-mut">'+fmt(n*ct(0))+' / '+fmt(n*ct(9))+' s</small></td>'}).join('')+'</tr>').join('')+'</table></div>';
  return h}
 function setV(M,rest,val){const[a,b]=rest;if(a==='t'){const t={...(M.t||{})};if(val===''||+val===TDEF[b])delete t[b];else t[b]=+val;if(Object.keys(t).length)M.t=t;else delete M.t;return}
  if(val===''||+val===DEF[a])delete M[a];else M[a]=+val}
 function changes(x,y){x=x||{};y=y||{};const out=[];for(const k of['base','step','qlog','start'])if(x[k]!==y[k])out.push('Woodcutting '+({base:'base chop time',step:'Quick Chop seconds',qlog:'logs a quarter',start:'starting extra log limit'})[k]+': '+(y[k]==null?'back to '+DEF[k]:y[k]));
  const a=x.t||{},b=y.t||{};for(const k of new Set([...Object.keys(a),...Object.keys(b)]))if(a[k]!==b[k])out.push(TN[k]+' toughness: '+(b[k]==null?'back to '+TDEF[k]:b[k]));return out}
 window.SQWC={DEF,TDEF,LV,calc,apply,picks,limit,chopTime,secs,kind,view,setV,changes,get WC(){return WC},get busy(){return busy}};
})();
