// ---- 177. Player stats (Dev Suite > Stats) ----
// The game writes a few counters (rules: only devs read them):
//   stats/d/<day>/<uid> = minutes played that UTC day (sent every 5 min while playing, not on the title screen)
//   stats/f/<uid>       = the first day this account was seen (written once)
//   stats/dz/<day>/<where~monster> = deaths, counted up by one (where = island/area, monster = nearest within 48 px)
// The Stats tab shows players per day, minutes, new players and how many came back (next day / within a week), where
// players die, and (reading every account save, like Admin > Economy) where players who stopped coming got to: main
// quest, getting-started guide step and total level.
(()=>{const FBx=()=>window.SQFB,uid=()=>window.SQMP&&SQMP.user&&SQMP.user.uid;
 const day=(t=Date.now())=>new Date(t).toISOString().slice(0,10),safe=s=>String(s||'?').replace(/[.$#\[\]\/]/g,'_').slice(0,28);
 let pend=0,sent=false,mday=day(),firstDone=null;
 setInterval(()=>{try{const F=FBx(),u=uid();if(!F||!u)return;if(window.SQTITLE&&SQTITLE())return;if(document.hidden)return;
   const d0=day();if(d0!==mday){mday=d0;sent=false}pend++;const d=F.db;
   if(firstDone!==u){firstDone=u;d.get(d.ref(F.D,'stats/f/'+u)).then(s=>{if(!s.exists())return d.set(d.ref(F.D,'stats/f/'+u),d0)}).catch(()=>{})}
   if(!sent||pend>=5){const add=pend;pend=0;sent=true;d.runTransaction(d.ref(F.D,'stats/d/'+d0+'/'+u),cur=>Math.min(1440,(+cur||0)+add)).catch(()=>{pend+=add})}}catch(e){}},60000);
 // deaths
 let was=false;setInterval(()=>{try{const now=!!dead;if(now&&!was){const F=FBx(),u=uid();if(F&&u){let where='hollow';try{where=SCENE&&SCENE.id&&SCENE.id!=='region'?(SCENE.room&&SCENE.room.region?SCENE.room.region+'-':'')+SCENE.id:(typeof curRegion==='function'?curRegion():'hollow')}catch(e){}
     let mob='other',bd=48;for(const n of en||[]){if(!n||n.dead)continue;const dd=Math.hypot(n.x-P.x,n.y-P.y);if(dd<bd){bd=dd;mob=n.rk||n.type||'monster'}}
     const d=F.db;d.runTransaction(d.ref(F.D,'stats/dz/'+day()+'/'+safe(where)+'~'+safe(mob)),c=>(+c||0)+1).catch(()=>{})}}was=now}catch(e){}},250);
 window.SQSTATS={day};
 // ======================= Dev Suite > Stats =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,fail}=API;
 const T={st:null,lb:null,sv:null,busy:0};
 const D=()=>FBx().db,ref=p=>D().ref(FBx().D,p),get=async p=>(await D().get(ref(p))).val();
 async function load(){T.busy=1;API.draw();try{const[a,b]=await Promise.all([get('stats'),get('lb')]);T.st=a||{};T.lb=b||{}}catch(e){fail(e);T.st={};T.lb={}}T.busy=0;API.draw()}
 async function loadSaves(){T.busy=1;API.draw();try{const us=Object.keys(T.lb||{});const out=[];await Promise.all(us.map(async u=>{try{const v=await get('saves/'+u);if(v&&v.json){const S2=JSON.parse(v.json);out.push({u,S:S2,t:(T.lb[u]||{}).t||0})}}catch(e){}}));T.sv=out}catch(e){fail(e)}T.busy=0;API.draw()}
 const addDays=(d,n)=>day(Date.parse(d+'T12:00:00Z')+n*864e5);
 const bar=(v,max,lab,txt)=>'<div style="display:flex;align-items:center;gap:8px;margin:2px 0;font-size:12px"><span style="width:86px;flex:none" class="dv-mut">'+E(lab)+'</span><span style="flex:1;background:#1a2030;height:12px;border-radius:3px;overflow:hidden"><span style="display:block;height:100%;width:'+(max?Math.round(v/max*100):0)+'%;background:#e8b030"></span></span><span style="width:110px;flex:none;text-align:right">'+txt+'</span></div>';
 function render(){if(!T.st){if(!T.busy)load();return'<p class="dv-mut">Loading…</p>'}
  const Dd=T.st.d||{},F=T.st.f||{},Z=T.st.dz||{},today=day(),days=[];for(let i=13;i>=0;i--)days.push(addDays(today,-i));
  const pl=d=>Object.keys(Dd[d]||{}),mn=d=>Object.values(Dd[d]||{}).reduce((a,b)=>a+(+b||0),0);
  const maxP=Math.max(1,...days.map(d=>pl(d).length));
  let h='<div class="dv-row"><button class="dv-b" data-sx="reload">↻ Refresh</button></div><div class="dv-card"><b>Players per day</b> <small class="dv-mut">(UTC days, since the stats started)</small>'+
   days.map(d=>{const n=pl(d).length,m=mn(d);return bar(n,maxP,d.slice(5),n+' · '+(n?Math.round(m/n):0)+' min each')}).join('')+'</div>';
  // new players and coming back
  const byFirst={};for(const u in F){(byFirst[F[u]]=byFirst[F[u]]||[]).push(u)}
  h+='<div class="dv-card" style="margin-top:10px"><b>New players and who came back</b><table style="font-size:13px;margin-top:6px"><tr class="dv-mut"><td style="padding-right:14px">First day</td><td style="padding-right:14px">New</td><td style="padding-right:14px">Next day</td><td>Within a week</td></tr>';
  for(const d of days.slice().reverse()){const L=byFirst[d]||[];if(!L.length)continue;const n1=addDays(d,1),ok1=n1<today,r1=L.filter(u=>Dd[n1]&&Dd[n1][u]).length;
   let ok7=addDays(d,7)<=today,r7=L.filter(u=>{for(let i=1;i<=7;i++){const x=addDays(d,i);if(Dd[x]&&Dd[x][u])return true}return false}).length;
   const pc=(a,b)=>b?Math.round(a/b*100)+'%':'';h+='<tr><td>'+d.slice(5)+'</td><td>'+L.length+'</td><td>'+(ok1?r1+' ('+pc(r1,L.length)+')':'…')+'</td><td>'+(ok7?r7+' ('+pc(r7,L.length)+')':r7+' so far')+'</td></tr>'}
  h+='</table></div>';
  // deaths
  const dz={};for(const d of days.slice(-7))for(const k in Z[d]||{})dz[k]=(dz[k]||0)+(+Z[d][k]||0);const dl=Object.entries(dz).sort((a,b)=>b[1]-a[1]).slice(0,15),mx=dl.length?dl[0][1]:1;
  h+='<div class="dv-card" style="margin-top:10px"><b>Where players died (last 7 days)</b>'+(dl.map(([k,n])=>{const[w,m]=k.split('~');const mm=(window.SQISLIFE&&SQISLIFE.MOBS[m]||{}).n||m;return bar(n,mx,w,n+' · '+E(mm))}).join('')||'<p class="dv-mut">No deaths recorded yet.</p>')+'</div>';
  // where players stopped
  h+='<div class="dv-card" style="margin-top:10px"><b>Where players who stopped got to</b><p class="dv-mut">Players not seen for 7 days, from their account saves.</p>';
  if(!T.sv)h+='<button class="dv-b" data-sx="saves">'+(T.busy?'Reading…':'Read every save')+'</button>';
  else{const gone=T.sv.filter(x=>Date.now()-x.t>7*864e5),act=T.sv.length-gone.length;h+='<p>'+gone.length+' stopped · '+act+' still playing</p>';
   const qc={},gc={},lc={};for(const x of gone){const i=x.S.q&&x.S.q.i|0;qc[i]=(qc[i]||0)+1;const g=x.S.gd==null?'?':x.S.gd===99?'done':'step '+(+x.S.gd+1);gc[g]=(gc[g]||0)+1;
    const tl=(Array.isArray(x.S.xp)?x.S.xp:[]).map(v=>{let L=1;while(L<99&&v>=XT[L])L++;return L}).reduce((a,b)=>a+b,0),bk=tl<30?'under 30':tl<60?'30-59':tl<120?'60-119':tl<250?'120-249':'250+';lc[bk]=(lc[bk]||0)+1}
   const lst=(o,lab)=>{const L=Object.entries(o).sort((a,b)=>b[1]-a[1]),m=L.length?L[0][1]:1;return L.map(([k,n])=>bar(n,m,lab(k),String(n))).join('')};
   h+='<p class="dv-mut" style="margin:8px 0 2px">Main quest they were on</p>'+lst(qc,k=>'#'+(+k+1))+
    '<p class="dv-mut" style="margin:2px 0">'+Object.keys(qc).sort((a,b)=>a-b).map(k=>'#'+(+k+1)+' = '+E((typeof QS!=='undefined'&&QS[k]&&QS[k].n)||'?')).join(' · ')+'</p>'+
    '<p class="dv-mut" style="margin:8px 0 2px">Getting-started guide</p>'+lst(gc,k=>k)+'<p class="dv-mut" style="margin:8px 0 2px">Total level</p>'+lst(lc,k=>k)}
  return h+'</div>'}
 document.addEventListener('click',e=>{if(S.tab!=='pstats')return;const t=e.target.closest('[data-sx]');if(!t)return;e.preventDefault();const a=t.dataset.sx;if(a==='reload'){T.st=null;T.sv=null;API.draw()}else if(a==='saves')loadSaves()},true);
 SQSUITE.addTab('pstats','Player stats',{render})})();
