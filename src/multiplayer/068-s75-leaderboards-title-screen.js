// ---------------------------------------------------------------- 75. Leaderboards (title screen)
// Your game posts your stats to lb/<uid> every so often while you're online: name, total level, XP in every skill,
// quest points, PvP kills and monsters slain. The title screen's LEADERBOARDS button shows the rankings for each,
// with the top three on podium cards and your own row highlighted (and your rank, even outside the top 50).
// Anyone can read the boards (even signed out); each player can only write their own row.
const LB={open:false,cat:'tot',data:{},unsub:null,pubKey:'',pubAt:-1e9,pk:0};
// PvP kills you've made (counted when the player you beat tells you so)
{const _in=pvIncoming;pvIncoming=function(id,v){if(v&&v.k==='ko'&&typeof v.t==='number'&&mpNow()-v.t<=5000){LB.pk++;try{saveLocal(true)}catch(e){}}return _in(id,v)}}
{const _sn=snap;snap=function(){const s=_sn();if(LB.pk)s.pvpk=LB.pk;return s}}
{const _ap=applySave;applySave=function(S){_ap(S);LB.pk=Math.max(0,+(S&&S.pvpk)||0)}}
function lbTick(){if(!MP.on||!MP.user||!FB)return;const now=performance.now();if(now-LB.pubAt<20000)return;LB.pubAt=now;
 const x=XPS.map(v=>Math.max(0,Math.floor(+v||0))),row={n:myName().slice(0,12),tot:lvTot(),x,qp:window.SQQPTOTAL?SQQPTOTAL():+(Q&&Q.qp)||0,pk:LB.pk,mk:+kills||0,bk:(window.SQWB&&SQWB.kills)||0};const k=JSON.stringify(row);if(k===LB.pubKey)return;
 LB.pubKey=k;FB.db.set(FB.db.ref(FB.D,'lb/'+MP.user.uid),Object.assign(row,{t:FB.db.serverTimestamp()})).catch(e=>{LB.pubKey='';mpErr(e)})}
setInterval(()=>{try{lbTick()}catch(e){}},5000);
window.SQLB=LB;
// ---- the categories ----
const lbCats=()=>{const c=[{k:'tot',n:'Overall',sub:'Total level',ic:'★',col:'#f8d048'},{k:'qp',n:'Quests',sub:'Quest points',ic:'!',col:'#68b8f8'},{k:'pk',n:'PvP kills',sub:'Players defeated',ic:'☠',col:'#e85848'},{k:'mk',n:'Monsters',sub:'Monsters slain',ic:'⚔',col:'#a8a8b8'},{k:'bk',n:'World bosses',sub:'World bosses defeated',ic:'♛',col:'#c83020'}];
 SKN.forEach((n,i)=>c.push({k:'s'+i,n,sub:n+' level',ic:n[0],col:SKC[i]||'#88a'}));return c};
const xpOf=(r,i)=>{const a=r&&r.x;if(!a)return 0;const v=Array.isArray(a)?a[i]:a[i];return Math.max(0,+v||0)};
function lbRows(cat){const out=[];for(const u in LB.data){const r=LB.data[u];if(!r||typeof r!=='object'||typeof r.n!=='string')continue;let v,s='',sort;
  if(cat==='tot'){let tx=0;const a=r.x?(Array.isArray(r.x)?r.x:Object.values(r.x)):[];for(const q of a)tx+=+q||0;v=+r.tot||0;sort=v*1e10+tx;s=tx.toLocaleString('en-US')+' xp'}
  else if(cat==='qp'||cat==='pk'||cat==='mk'||cat==='bk'){v=+r[cat]||0;sort=v}
  else{const i=+cat.slice(1),xp=xpOf(r,i);v=lvFromXp(xp);sort=xp;s=Math.floor(xp).toLocaleString('en-US')+' xp'}
  if(cat!=='tot'&&!(sort>0))continue;out.push({u,n:r.n.replace(/[<>]/g,'').slice(0,12),v,s,sort,t:+r.t||0})}
 return out.sort((a,b)=>b.sort-a.sort||a.t-b.t)}
// ---- the board ----
{const st=document.createElement('style');st.textContent=`#sqlb{position:fixed;inset:0;z-index:95;display:none;flex-direction:column;align-items:center;background:rgba(8,28,18,.86);padding:calc(env(safe-area-inset-top,0px) + 10px) 10px calc(env(safe-area-inset-bottom,0px) + 10px);box-sizing:border-box;font-family:${PF}}
#sqlb .lbw{width:100%;max-width:760px;height:100%;display:flex;flex-direction:column;background:#f8f8f8;color:#404040;border:4px solid #485870;box-shadow:inset 0 0 0 3px #a8c0e0,0 6px 0 rgba(0,0,0,.35);box-sizing:border-box;overflow:hidden}
#sqlb .lbh{display:flex;align-items:center;gap:10px;padding:12px 14px 8px;background:linear-gradient(#5878b8,#3c5898);color:#f8f8f8;border-bottom:4px solid #283c68}
#sqlb .lbh b{flex:1;font-size:clamp(18px,4.6vw,24px);letter-spacing:.12em;text-shadow:2px 2px 0 #1c2848}
#sqlb .lbh button{font:700 15px ${PF};padding:6px 12px;border:3px solid #f8f8f8;background:#283c68;color:#f8f8f8;cursor:pointer}
#sqlb .lbc{display:flex;gap:6px;overflow-x:auto;padding:10px 12px;border-bottom:3px solid #d8e0f0;scrollbar-width:thin;flex:none}
#sqlb .lbc button{flex:none;display:flex;align-items:center;gap:6px;font:700 13px ${PF};padding:7px 10px;border:3px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer;white-space:nowrap}
#sqlb .lbc button i{font-style:normal;display:inline-grid;place-items:center;width:18px;height:18px;font-size:11px;color:#fff;border:2px solid #202838;text-shadow:1px 1px 0 #202838}
#sqlb .lbc button.on{background:#485870;color:#f8f8f8}#sqlb .lbc button.gpf{box-shadow:inset 0 0 0 3px #f8a020}
#sqlb .lbb{flex:1;overflow-y:auto;padding:12px 14px}
#sqlb .lbt{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px}#sqlb .lbt b{font-size:18px}#sqlb .lbt small{color:#707888}
#sqlb .pod{display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:8px;align-items:end;margin-bottom:12px}
#sqlb .lbp{text-align:center;padding:10px 6px 8px;border:3px solid #202838;color:#202838;position:relative;min-width:0}
#sqlb .lbp .md{display:inline-grid;place-items:center;width:30px;height:30px;font-weight:700;font-size:16px;border:3px solid #202838;background:#fff;margin-bottom:4px}
#sqlb .lbp .nm{font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#sqlb .lbp .vl{font-weight:700;font-size:20px;margin-top:2px}#sqlb .lbp small{display:block;font-size:11px;opacity:.75}
#sqlb .p1{background:linear-gradient(#fff4a8,#f8c830);padding-top:22px;padding-bottom:14px}#sqlb .p2{background:linear-gradient(#f4f6fa,#b8c0d0)}#sqlb .p3{background:linear-gradient(#f8dcc0,#d89058)}
#sqlb .lbp.me{outline:3px solid #38a828;outline-offset:2px}
#sqlb .row{display:grid;grid-template-columns:44px 1fr auto;gap:8px;align-items:center;padding:8px 8px;border-bottom:2px solid #e2e6ee;font-size:15px}
#sqlb .row:nth-child(2n){background:#f0f3f8}#sqlb .row .rk{font-weight:700;color:#5878b8}#sqlb .row .nm{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#sqlb .row .vl{font-weight:700;text-align:right}
#sqlb .row .vl small{display:block;font-weight:500;font-size:11px;color:#808898}#sqlb .row.me{background:#e0f4d8!important;border-color:#98d088}
#sqlb .you{margin-left:6px;padding:1px 5px;font-size:10px;background:#38a828;color:#fff;vertical-align:2px}#sqlb img.cr{display:inline-block!important;position:static!important;width:16px!important;height:12px!important;image-rendering:pixelated;margin:0 4px 0 0!important;vertical-align:-1px}
#sqlb .gap{text-align:center;color:#a0a8b8;padding:4px 0;letter-spacing:.3em}#sqlb .emp{text-align:center;padding:30px 10px;color:#707888;line-height:1.5}
#sqlb .lbf{padding:7px 14px;font-size:12px;color:#707888;border-top:3px solid #d8e0f0;display:flex;justify-content:space-between;gap:10px;flex:none}
@media(max-width:480px){#sqlb .lbp .nm{font-size:13px}#sqlb .lbp .vl{font-size:17px}#sqlb .row{font-size:14px;grid-template-columns:36px 1fr auto}}`;document.head.appendChild(st)}
const lbEl=el('div','sqlb','','<div class="lbw"><div class="lbh"><b>LEADERBOARDS</b><button data-lb="x" aria-label="Close">CLOSE</button></div><div class="lbc" id="lbc"></div><div class="lbb" id="lbb"></div><div class="lbf"><span id="lbn"></span><span>Updates live</span></div></div>');
document.body.appendChild(lbEl);for(const ev of['touchstart','pointerdown','mousedown'])lbEl.addEventListener(ev,stop);
function lbOpen(){LB.open=true;lbEl.style.display='flex';try{sfx('talk')}catch(e){}lbRender();
 if(!LB.unsub&&FB&&FB.db){try{LB.unsub=FB.db.onValue(FB.db.ref(FB.D,'lb'),s=>{LB.data=s.val()||{};if(LB.open)lbRender()},e=>{LB.err=1;lbRender()})}catch(e){LB.err=1}}
 setTimeout(()=>{const b=lbEl.querySelector('.lbc button.on');if(b&&(GPON||TS.kb))setFocus(b)},30)}
function lbClose(){LB.open=false;lbEl.style.display='none';if(LB.unsub){try{LB.unsub()}catch(e){}LB.unsub=null}setFocus(null);try{sfx('talk')}catch(e){}
 if(TS.open&&TS.stage){const b=tsMn.querySelector('[data-a="lb"]');if(b&&(GPON||TS.kb))setFocus(b)}}
function lbRender(){const cats=lbCats(),C=cats.find(c=>c.k===LB.cat)||cats[0],me=MP.user&&MP.user.uid;
 $('lbc').innerHTML=cats.map(c=>'<button data-lbc="'+c.k+'" class="'+(c.k===C.k?'on':'')+'"><i style="background:'+c.col+'">'+esc(c.ic)+'</i>'+esc(c.n)+'</button>').join('');
 const B=$('lbb'),rows=lbRows(C.k),val=r=>C.k==='tot'?'Lv '+r.v:C.k[0]==='s'?'Lv '+r.v:r.v.toLocaleString('en-US'),nm=r=>(isOG(r.u)?'<img class="cr" src="'+crownURL+'" alt="OG">':'')+esc(r.n)+(r.u===me?'<span class="you">YOU</span>':'');
 $('lbn').textContent=Object.keys(LB.data).length?Object.keys(LB.data).length+' adventurers':'';
 let h='<div class="lbt"><b>'+esc(C.sub)+'</b><small>'+(rows.length?rows.length+' ranked':'')+'</small></div>';
 if(!FB||!FB.db){B.innerHTML=h+'<div class="emp">Connecting to the leaderboards...</div>';return}
 if(LB.err&&!rows.length){B.innerHTML=h+'<div class="emp">The leaderboards are being set up. Check back soon!</div>';return}
 if(!rows.length){B.innerHTML=h+'<div class="emp">Nobody is on this board yet.<br>'+(C.k==='pk'?'Turn on PvP (START menu) to start climbing it!':'Play online to claim the top spot!')+'</div>';return}
 const pod=[rows[1],rows[0],rows[2]],cls=['p2','p1','p3'],md=['2','1','3'];h+='<div class="pod">';
 pod.forEach((r,j)=>{if(!r){h+='<div></div>';return}h+='<div class="lbp '+cls[j]+(r.u===me?' me':'')+'"><div class="md">'+md[j]+'</div><div class="nm">'+nm(r)+'</div><div class="vl">'+esc(val(r))+'</div>'+(r.s?'<small>'+esc(r.s)+'</small>':'')+'</div>'});h+='</div>';
 const top=rows.slice(3,50);for(let i=0;i<top.length;i++){const r=top[i];h+='<div class="row'+(r.u===me?' me':'')+'"><span class="rk">#'+(i+4)+'</span><span class="nm">'+nm(r)+'</span><span class="vl">'+esc(val(r))+(r.s?'<small>'+esc(r.s)+'</small>':'')+'</span></div>'}
 const mi=me?rows.findIndex(r=>r.u===me):-1;if(mi>=50){const r=rows[mi];h+='<div class="gap">· · ·</div><div class="row me"><span class="rk">#'+(mi+1)+'</span><span class="nm">'+nm(r)+'</span><span class="vl">'+esc(val(r))+(r.s?'<small>'+esc(r.s)+'</small>':'')+'</span></div>'}
 else if(me&&mi<0&&MP.on)h+='<div class="emp" style="padding:14px">You\'re not on this board yet.</div>';else if(!MP.on)h+='<div class="emp" style="padding:14px">Sign in to get on the boards.</div>';
 // everyone else who has played online, until their game posts their stats
 const wait=Object.keys(MP.prof||{}).filter(u=>!LB.data[u]&&MP.prof[u]&&MP.prof[u].n).map(u=>String(MP.prof[u].n).replace(/[<>]/g,'').slice(0,12));
 if(wait.length)h+='<div class="emp" style="padding:16px 10px 6px;text-align:left"><b style="color:#485870">Not ranked yet</b><br>'+wait.map(esc).join(' · ')+'<br><small>They show up here automatically the next time they play.</small></div>';
 B.innerHTML=h}
lbEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.lb==='x'){lbClose();return}
 if(b.dataset.lbc){LB.cat=b.dataset.lbc;try{sfx('talk')}catch(e2){}lbRender();const nb=lbEl.querySelector('[data-lbc="'+LB.cat+'"]');if(nb){nb.scrollIntoView({block:'nearest',inline:'center'});if(GPF)setFocus(nb)}$('lbb').scrollTop=0}});
// on the title menu
{const _m=tsMenu;tsMenu=function(){const had=TS.mh;_m();if(tsMn.querySelector('[data-a="lb"]'))return;const o=tsMn.querySelector('[data-a="opt"]');if(!o)return;const b=document.createElement('button');b.dataset.a='lb';b.textContent='LEADERBOARDS';o.before(b)}}
tsMn.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.a==='lb')lbOpen()});
window.SQLB=LB;
