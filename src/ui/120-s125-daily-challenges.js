// ---- 125. Daily challenges: three small tasks every real day, with a streak ----
// Each day (by the device's own date, new ones at midnight) you get three tasks such as "Chop 25 logs", "Catch 10 fish"
// or "Beat 12 monsters", picked from what your character can already do (the same day gives everyone the same order,
// so a family playing together often shares tasks). Finishing one pays gold and XP in that skill straight away;
// finishing all three keeps your streak going (days in a row) and pays a streak bonus that grows for 7 days.
// They're listed at the top of the quest log (tap the quest box or open Quests).
// Counting: items are counted when they arrive in the same frame the matching skill gains XP (so buying, trading or
// collecting doesn't count), fires by Firemaking XP gains, monsters by the game's own kill counter.
// Saved as `dly` = {d: day 'YYYY-MM-DD', q: [{t: task id, n: target, p: progress, c: 1 when paid}], s: streak, l: last full day}.
(()=>{const SK=n=>SKN.indexOf(n);
 const T={
  wc:{s:'Woodcutting',w:n=>'Chop '+n+' logs',a:[20,35],x:8,g:6},
  mine:{s:'Mining',w:n=>'Mine '+n+' ore or stone',a:[15,30],x:9,g:7,r:()=>TL.pick>=1},
  forage:{s:'Foraging',w:n=>'Forage '+n+' berries or plants',a:[15,25],x:6,g:5},
  fish:{s:'Fishing',w:n=>'Catch '+n+' fish',a:[8,16],x:14,g:10,r:()=>!!TL.rod},
  cook:{s:'Cooking',w:n=>'Cook '+n+' meals',a:[8,15],x:12,g:9},
  fire:{s:'Firemaking',w:n=>'Light '+n+' fires',a:[4,8],x:30,g:20,xpc:1},
  craft:{s:'Crafting',w:n=>'Craft '+n+' things',a:[4,8],x:25,g:18,min1:1},
  smith:{s:'Smithing',w:n=>'Smith '+n+' things',a:[3,6],x:30,g:22,min1:1,r:()=>lvOf(SK('Smithing'))>=2},
  farm:{s:'Farming',w:n=>'Harvest '+n+' crops',a:[5,10],x:20,g:14,r:()=>!!TL.hoe||(inv.eq_hoe|0)>0},
  kill:{s:'Attack',w:n=>'Beat '+n+' monsters',a:[8,15],x:20,g:12,kill:1}};
 const IDS=Object.keys(T);
 const pad=v=>String(v).padStart(2,'0'),dkey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
 const today=()=>dkey(new Date()),yday=()=>{const d=new Date();return dkey(new Date(d.getFullYear(),d.getMonth(),d.getDate()-1))};
 const dnum=k=>{const[y,m,d]=k.split('-').map(Number);return Math.floor(Date.UTC(y,m-1,d)/864e5)};
 const hsh=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return(h^(h>>>16))>>>0};
 let D=null,LASTINV=null,LASTK=0,XPF=new Set(),XPN={},PAYING=false,TOLD='';
 const lv=id=>Math.max(1,lvOf(SK(T[id].s)));
 // the day's three: the pool shuffled by the date, minus what this character can't do yet
 function pick(day){const n=dnum(day),ord=IDS.slice().sort((a,b)=>hsh(n,IDS.indexOf(a)+1)-hsh(n,IDS.indexOf(b)+1)),out=[];
  for(const id of ord){if(out.length>=3)break;const t=T[id];if(SK(t.s)<0)continue;try{if(t.r&&!t.r())continue}catch(e){continue}
   const base=t.a[0]+hsh(IDS.indexOf(id)+7,n)%(t.a[1]-t.a[0]+1);out.push({t:id,n:Math.max(1,Math.round(base*(1+(lv(id)-1)/60))),p:0,c:0})}return out}
 function fresh(){const day=today();const old=D;D={d:day,s:old?old.s|0:0,l:old?old.l||'':'',q:pick(day)};/* same field order as a loaded one, so a load isn't a change */if(D.l&&D.l!==yday()&&D.l!==day)D.s=0}
 const gold=q=>Math.round(T[q.t].g*q.n*(1+lv(q.t)/50));
 const xp=q=>Math.round(T[q.t].x*q.n*(1+lv(q.t)/40));
 const bonus=s=>100*Math.min(7,Math.max(1,s));
 function pay(q){const t=T[q.t];q.c=1;PAYING=true;try{const g=gold(q),x=xp(q);GLD+=g;addXp(SK(t.s),x);say('Daily challenge done: '+t.w(q.n)+'! +'+g+' gold, +'+x+' '+t.s+' XP');msgT=4;sfx('quest')}catch(e){}finally{PAYING=false}
  if(D.q.every(z=>z.c)){const day=D.d;D.s=D.l===yday()?(D.s|0)+1:D.l===day?D.s|0:1;D.l=day;const b=bonus(D.s);GLD+=b;
   setTimeout(()=>{say('All three daily challenges done! Streak: '+D.s+' day'+(D.s>1?'s':'')+'. Bonus +'+b+' gold');msgT=5;try{sfx('coin')}catch(e){}},1800)}
  try{svg()}catch(e){}try{saveLocal(true)}catch(e){}}
 function add(id,k){if(!D||!(k>0))return;for(const q of D.q)if(q.t===id&&!q.c){q.p=Math.min(q.n,q.p+k);if(q.p>=q.n)pay(q);else if(pnOpen&&ptab===6)rPn()}}
 // XP gains mark the skill for this frame
 const _ax=addXp;addXp=function(i,x){const out=_ax.apply(this,arguments);if(!PAYING&&x>0){XPF.add(i);XPN[i]=(XPN[i]|0)+1}return out};
 const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{if(dead)return out;
   if(!D||D.d!==today()){fresh();LASTINV=null;
    if(TOLD!==D.d){TOLD=D.d;let gd=null;try{gd=window.SQGUIDE&&SQGUIDE()}catch(e){}if(!gd)setTimeout(()=>{if(!dead){say('New daily challenges! Find them in your quest log.');msgT=4}},2500)}}
   // what arrived this frame, for the skills that just gained XP
   if(LASTINV&&XPF.size){const got={};let tot=0;for(const k in inv){const v=(inv[k]|0)-(LASTINV[k]|0);if(v>0){got[k]=v;tot+=v}}
    for(const q of D.q){if(q.c)continue;const t=T[q.t],si=SK(t.s);if(t.kill||!XPF.has(si))continue;
     if(t.xpc)add(q.t,XPN[si]|0);else add(q.t,t.min1?Math.max(1,tot):tot)}}
   if(typeof kills==='number'){if(kills>LASTK&&LASTINV)add('kill',kills-LASTK);LASTK=kills}
   XPF.clear();XPN={};LASTINV=Object.assign({},inv)}catch(e){}return out};
 // the quest log: the three of today at the top (below the getting-started box if it's showing)
 function html(){if(!D)return'';let h='<div class="sqdl-h"><b>DAILY CHALLENGES</b><span>'+(D.s>0?'Streak: '+D.s+' day'+(D.s>1?'s':''):'New ones every day')+'</span></div>';
  for(const q of D.q){const t=T[q.t],pc=Math.round(q.p/q.n*100);h+='<div class="sqdl-r'+(q.c?' done':'')+'"><div class="sqdl-t"><span>'+(q.c?'✔ ':'')+esc(t.w(q.n))+'</span><i>'+q.p+'/'+q.n+'</i></div>'+
   '<div class="sqdl-b"><div style="width:'+pc+'%"></div></div><small>'+(q.c?'Done!':'Reward: '+gold(q)+' gold, '+xp(q)+' '+t.s+' XP')+'</small></div>'}
  const all=D.q.every(z=>z.c),next=D.l===yday()?(D.s|0)+1:D.l===D.d?D.s|0:1;
  h+='<small class="sqdl-f">'+(all?'All done for today. Come back tomorrow to keep your streak!':'Finish all three for a streak bonus of '+bonus(next)+' gold (more each day in a row, up to 7).')+'</small>';return h}
 const _rp=rPn;rPn=function(){const out=_rp.apply(this,arguments);try{if(pnOpen&&ptab===6&&D){const d=document.createElement('div');d.className='sqdl';d.innerHTML=html();
   const gd=pbd.querySelector('.sqgd');if(gd)gd.after(d);else pbd.prepend(d)}}catch(e){}return out};
 // saves
 const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);try{if(D)s.dly=JSON.parse(JSON.stringify(D))}catch(e){}return s};
 const _ap=applySave;applySave=function(Sv){const out=_ap.apply(this,arguments);try{const v=Sv&&Sv.dly;
   if(v&&typeof v==='object'&&typeof v.d==='string'&&Array.isArray(v.q)){D={d:v.d,s:Math.max(0,v.s|0),l:typeof v.l==='string'?v.l:'',
     q:v.q.filter(q=>q&&T[q.t]).slice(0,3).map(q=>({t:q.t,n:Math.max(1,q.n|0),p:Math.max(0,q.p|0),c:q.c?1:0}))};if(!D.q.length)D=null}
   else D=null;LASTINV=null;LASTK=typeof kills==='number'?kills:0}catch(e){D=null}return out};
 const _ng=newGame;newGame=function(){const out=_ng.apply(this,arguments);D=null;LASTINV=null;LASTK=0;return out};
 {const st=document.createElement('style');st.textContent=`#pn .sqdl{background:#eef4fc;border:2px solid #7890b8;border-radius:8px;padding:8px 10px;margin:0 0 10px;font-size:13px;color:#404040;text-align:left}
#pn .sqdl-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}#pn .sqdl-h b{letter-spacing:1px;color:#304870}#pn .sqdl-h span{font-size:12px;color:#b06010;font-weight:700}
#pn .sqdl-r{margin:6px 0}#pn .sqdl-r.done{opacity:.6}#pn .sqdl-t{display:flex;justify-content:space-between;font-weight:700}#pn .sqdl-t i{font-style:normal}
#pn .sqdl-b{height:6px;background:#c8d4e8;margin:3px 0 2px}#pn .sqdl-b div{height:6px;background:#48a838}#pn .sqdl-r small,#pn .sqdl-f{font-size:11px;opacity:.85}#pn .sqdl-f{display:block;margin-top:6px}`;document.head.appendChild(st)}
 window.SQDAILY={get state(){return D},set state(v){D=v},T,pick,fresh,today,html}})();
