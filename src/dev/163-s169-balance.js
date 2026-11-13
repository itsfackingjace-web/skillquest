// ---- 169. Balance numbers and a levelling simulator (Dev Suite > Balance) ----
// Library section balance = {xp:{<skill index>: %}, act:{'<table>:<key>': xp}, perk:{<perk id>: % value}}
//   xp    every XP gain in that skill is scaled (outermost addXp; 161's XP events stack on top)
//   act   XP for one action in the game's own tables: COOKS (cooked key), SM (bar/item key), GOODS, FISH_T (catching),
//         FREC (fletching), BREC (building), SQTIER (chopping/mining the higher-tier trees and ores). Content-tab entries (_cu)
//         are left alone (they have their own XP).
//   perk  the numbers in the perk tables 038/039 read on every use: GSPD (speed), GEXT (extra item), GRAR (rare find), GDBL
//         (double), STAYP (stays standing), FOODP (food drains slower), PSPD (production speed). Stored as a % (10 = 0.10).
//         The perk's description in the skill tree has its old % swapped for the new one.
// Originals are captured when this file loads, so removing a change puts the game's own number back.
(()=>{if(!window.SQA)return;const num=(v,lo,hi,d)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v)):d};
 const TB=[['COOKS','Cooking',()=>typeof COOKS!=='undefined'?COOKS:[],r=>r.ck,r=>'Cook '+(INAME[r.ck]||r.n),4,'cook'],
  ['SM','Smithing',()=>typeof SM!=='undefined'?SM:[],r=>r.k||r.n,r=>(r.smelt?'Smelt ':'Forge ')+r.n,10,r=>r.smelt?'smelt':'smith'],
  ['GOODS','Crafting',()=>typeof GOODS!=='undefined'?GOODS:[],r=>r.k,r=>'Craft '+r.n,6,'craft'],
  ['BREC','Crafting',()=>typeof BREC!=='undefined'?BREC:[],r=>r.k,r=>'Build '+r.n,6,'craft'],
  ['FREC','Archery',()=>typeof FREC!=='undefined'?FREC:[],r=>r.k,r=>'Fletch '+r.n,typeof FL!=='undefined'?FL:-1,'craft'],
  ['FISH_T','Fishing',()=>typeof FISH_T!=='undefined'?FISH_T:[],r=>r.k,r=>'Catch '+r.n,9,'gather']];
 const ACTS=()=>{const out=[];for(const[t,sn,L,key,lab,sk,kind]of TB)for(const r of L()){if(!r||r._cu||r.xp==null)continue;const k=key(r);if(!k)continue;out.push({id:t+':'+k,t,sn,r,lab:lab(r),sk,kind:typeof kind==='function'?kind(r):kind,f:'xp'})}
  if(typeof SQTIER!=='undefined')for(const k in SQTIER){const r=SQTIER[k];out.push({id:'SQTIER:'+k,t:'SQTIER',sn:SKN[r.sk],r,lab:(r.sk===1?'Chop ':'Mine ')+(INAME[r.item]||k),sk:r.sk,kind:'gather',f:'xp'})}return out};
 const OA={};for(const a of ACTS())OA[a.id]=a.r.xp;
 const PT={GSPD:'faster',GEXT:'extra item',GRAR:'rare find',GDBL:'double',STAYP:'stays standing',PSPD:'faster',FOODP:'food lasts'};
 const PTAB={GSPD:()=>typeof GSPD!=='undefined'&&GSPD,GEXT:()=>typeof GEXT!=='undefined'&&GEXT,GRAR:()=>typeof GRAR!=='undefined'&&GRAR,GDBL:()=>typeof GDBL!=='undefined'&&GDBL,STAYP:()=>typeof STAYP!=='undefined'&&STAYP,PSPD:()=>typeof PSPD!=='undefined'&&PSPD,FOODP:()=>typeof FOODP!=='undefined'&&FOODP};
 const PERKL=()=>{const out=[];for(const t in PT){const T=PTAB[t]();if(!T)continue;
   for(const sk in T){const L=T[sk];if(t==='FOODP'){out.push({t,sk:+sk,e:L});continue}for(const e of L)out.push({t,sk:+sk,e})}}return out};
 const OP={},OD={},pk=p=>p.t+':'+p.e[0];for(const p of PERKL()){OP[pk(p)]=p.e[1]}
 const perkObj=id=>{for(const sk in TREES){const T=TREES[sk];if(!T||!T.choices)continue;for(const lv in T.choices)for(const c of T.choices[lv]||[])if(c&&c.id===id)return{c,lv:+lv,sk:+sk}}return null};
 for(const k in OP){const id=k.split(':')[1],o=perkObj(id);if(o)OD[id]=o.c.d}
 const pc=v=>Math.round(v*1000)/10;
 let XPM={};
 SQA.onApply(lib=>{const B=lib&&lib.balance||{};XPM={};for(const k in B.xp||{}){const v=num(B.xp[k],0,1000,100);if(v!==100&&SKN[k])XPM[k]=v}
  const A=B.act||{};for(const a of ACTS()){const o=OA[a.id];if(o==null)continue;a.r.xp=A[a.id]!=null?num(A[a.id],0,100000,o)|0:o}
  const P=B.perk||{},DS={};for(const p of PERKL()){const id=p.e[0],k=pk(p),o=OP[k];if(o==null)continue;const v=P[k]!=null?num(P[k],0,100,pc(o))/100:o;p.e[1]=v;
   if(OD[id]!=null){if(DS[id]==null)DS[id]=OD[id];if(v!==o)DS[id]=DS[id].replace(new RegExp('(^|[^0-9.])'+String(pc(o)).replace('.','\\.')+'%'),'$1'+pc(v)+'%')}}
  for(const id in DS){const ob=perkObj(id);if(ob)ob.c.d=DS[id]}});
 {const _ax=addXp;addXp=function(i,x){if(x>0&&XPM[i]!=null)x=Math.max(0,Math.round(x*XPM[i]/100));return _ax.call(this,i,x)}}
 // ---- simulator ----
 const SECS={cook:2.4,craft:2.4,smelt:2.4,smith:2.6,gather:3.5};
 function sim(o){// {sk, from, to, xp per action, sec per action, mult %, val gold per action}
  const from=Math.max(1,Math.min(98,o.from|0)),to=Math.max(from+1,Math.min(99,o.to|0)),need=XT[to-1]-XT[from-1],per=Math.max(1e-6,o.xp*(o.mult||100)/100),n=Math.ceil(need/per),s=n*o.sec;
  const steps=[];for(let l=from+1;l<=to;l++)if(l===to||(l-from)%Math.max(1,Math.round((to-from)/8))===0){const nn=Math.ceil((XT[l-1]-XT[from-1])/per);steps.push({l,n:nn,h:nn*o.sec/3600})}
  return{need,n,h:s/3600,gold:n*(o.val||0),gph:o.val?Math.round(o.val*3600/o.sec):0,steps}}
 window.SQBAL={ACTS,PERKL,OA,OP,sim,get xpm(){return XPM}};
 // ---- Dev Suite > Balance ----
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,dset,toast,fail}=API;
 const ST={v:'xp',q:'',sim:{sk:1,from:1,to:50,a:'',sec:'',mult:''},out:null};
 const sec=()=>S.draft.balance||(S.draft.balance={});const part=k=>sec()[k]||(sec()[k]={});
 const fmtH=h=>h<1?Math.round(h*60)+' min':h<48?(Math.round(h*10)/10)+' h':(Math.round(h/24*10)/10)+' days';
 function xpView(){const X=part('xp');return'<div class="dv-card"><b>XP per skill</b><p class="dv-mut">100% = the game\'s own amounts. Every XP gain in that skill is scaled (XP events still multiply on top).</p><table>'+
   SKN.map((n,i)=>'<tr><td style="padding:3px 10px 3px 0">'+E(n)+'</td><td><input type="number" data-bx="xp.'+i+'" min="0" max="1000" value="'+(X[i]!=null?X[i]:100)+'" style="width:80px"> %</td></tr>').join('')+'</table></div>'}
 function actView(){const A=part('act'),q=ST.q.toLowerCase();const L=ACTS().filter(a=>!q||a.lab.toLowerCase().includes(q)||String(a.sn).toLowerCase().includes(q));
  return'<div class="dv-card"><b>XP per action</b><p class="dv-mut">One cook, bar, craft, catch or harvest. Changed numbers are highlighted.</p><input type="search" data-bq="1" placeholder="Search actions" value="'+E(ST.q)+'" style="width:100%;margin-bottom:6px"><table>'+
   L.slice(0,300).map(a=>{const v=A[a.id];return'<tr><td style="padding:3px 10px 3px 0">'+E(a.lab)+' <small class="dv-mut">'+E(a.sn||'')+' · level '+(a.r.lv||a.r.req||'?')+'</small></td><td><input type="number" data-bx="act.'+a.id+'" min="0" max="100000" value="'+(v!=null?v:OA[a.id])+'" style="width:90px'+(v!=null&&v!==OA[a.id]?';outline:2px solid #e8b030':'')+'"></td><td class="dv-mut" style="padding-left:6px">game: '+OA[a.id]+'</td></tr>'}).join('')+'</table></div>'}
 function perkView(){const Pv=part('perk'),q=ST.q.toLowerCase();const L=PERKL().map(p=>({...p,o:perkObj(p.e[0])})).filter(p=>p.o&&(!q||(p.o.c.n+' '+SKN[p.sk]).toLowerCase().includes(q)));
  return'<div class="dv-card"><b>Perk values</b><p class="dv-mut">The numbers behind the skill-tree perks that use a table. Their description in the skill tree changes with them. Other perks are written into the game\'s code.</p><input type="search" data-bq="1" placeholder="Search perks" value="'+E(ST.q)+'" style="width:100%;margin-bottom:6px"><table>'+
   L.map(p=>{const id=pk(p),v=Pv[id];return'<tr><td style="padding:3px 10px 3px 0">'+E(SKN[p.sk])+' '+p.o.lv+': <b>'+E(p.o.c.n)+'</b> <small class="dv-mut">('+PT[p.t]+')</small></td><td><input type="number" data-bx="perk.'+id+'" min="0" max="100" step="0.5" value="'+(v!=null?v:pc(OP[id]))+'" style="width:80px'+(v!=null&&v!==pc(OP[id])?';outline:2px solid #e8b030':'')+'"> %</td><td class="dv-mut" style="padding-left:6px">game: '+pc(OP[id])+'%</td></tr>'}).join('')+'</table></div>'}
 function simView(){const s=ST.sim,acts=ACTS().filter(a=>a.sk===+s.sk);const cus=window.SQCONTENT?Object.entries(SQCONTENT.C.recipes).filter(([,r])=>({craft:6,smith:10,smelt:10,cook:4})[r.sk]===+s.sk).map(([id,r])=>({id:'cu:'+id,lab:'(new) '+INAME[r.out],r:{xp:r.xp,lv:r.lv},kind:r.sk,out:r.out})):[];
  const all=acts.concat(cus);const a=all.find(x=>x.id===s.a)||all[0];
  let h='<div class="dv-card"><b>Levelling simulator</b><p class="dv-mut">How long it takes to level a skill doing one thing over and over, with the numbers in your draft.</p><div class="dv-row" style="flex-wrap:wrap">'+
   '<label class="dv-mut">Skill<br><select data-bs="sk">'+SKN.map((n,i)=>'<option value="'+i+'"'+(+s.sk===i?' selected':'')+'>'+E(n)+'</option>').join('')+'</select></label>'+
   '<label class="dv-mut">From level<br><input type="number" data-bs="from" min="1" max="98" value="'+s.from+'" style="width:70px"></label><label class="dv-mut">To level<br><input type="number" data-bs="to" min="2" max="99" value="'+s.to+'" style="width:70px"></label>'+
   '<label class="dv-mut">Doing<br><select data-bs="a">'+(all.length?all.map(x=>'<option value="'+E(x.id)+'"'+(a&&x.id===a.id?' selected':'')+'>'+E(x.lab)+' ('+x.r.xp+' XP)</option>').join(''):'<option value="">(type XP below)</option>')+'</select></label></div>';
  const xpA=a?a.r.xp:10,draftXp=a&&!/^cu:/.test(a.id)&&part('act')[a.id]!=null?+part('act')[a.id]:xpA,mult=s.mult!==''?+s.mult:(part('xp')[s.sk]!=null?+part('xp')[s.sk]:100),sec2=s.sec!==''?+s.sec:SECS[a&&a.kind]||3;
  const outK=a&&(a.out||a.r.ck||a.r.k),val=outK&&SELLP[outK]?SELLP[outK]:0;
  h+='<div class="dv-row" style="flex-wrap:wrap"><label class="dv-mut">XP each<br><input type="number" data-bs="xpv" value="'+draftXp+'" style="width:80px" disabled></label><label class="dv-mut">Seconds each<br><input type="number" data-bs="sec" min="0.2" max="600" step="0.1" value="'+sec2+'" style="width:80px"></label>'+
   '<label class="dv-mut">Skill XP %<br><input type="number" data-bs="mult" min="0" max="1000" value="'+mult+'" style="width:80px"></label></div>';
  const R=sim({sk:+s.sk,from:+s.from,to:+s.to,xp:draftXp,sec:sec2,mult,val});
  h+='<p style="font-size:15px;margin:10px 0 4px"><b>'+R.n.toLocaleString()+' actions · about '+fmtH(R.h)+'</b> of nonstop play ('+R.need.toLocaleString()+' XP)'+(val?' · worth about '+R.gold.toLocaleString()+' gold ('+R.gph.toLocaleString()+' gold/hour)':'')+'</p>'+
   '<p class="dv-mut" style="font-size:12px">Seconds each is a guess you can change: production actions take about this long at level 1 (faster with level and perks); gathering depends on the tool and the tree or rock.</p>'+
   '<table><tr class="dv-mut"><td style="padding-right:12px">Level</td><td style="padding-right:12px">Actions</td><td>Time</td></tr>'+R.steps.map(t=>'<tr><td>'+t.l+'</td><td>'+t.n.toLocaleString()+'</td><td>'+fmtH(t.h)+'</td></tr>').join('')+'</table></div>';
  return h}
 function render(){const tabs=[['xp','XP per skill'],['act','XP per action'],['perk','Perk values'],['sim','Simulator']];
  const ch=Object.keys(part('xp')).length+Object.keys(part('act')).length+Object.keys(part('perk')).length;
  return'<div class="dv-row" style="flex-wrap:wrap;margin-bottom:8px">'+tabs.map(([k,n])=>'<button class="dv-b'+(ST.v===k?' dv-tl dv-on':'')+'" data-bv="'+k+'">'+n+'</button>').join('')+
   '<button class="dv-b dv-pri" data-bv="save">Save to draft'+(ch?' ('+ch+' changed)':'')+'</button><button class="dv-b dv-bad" data-bv="reset">Back to the game\'s numbers</button></div>'+(ST.v==='xp'?xpView():ST.v==='act'?actView():ST.v==='perk'?perkView():simView())}
 const setV=(path,val)=>{const[p,...rest]=path.split('.');const k=rest.join('.');const P2=part(p);const base=p==='xp'?100:p==='act'?OA[k]:pc(OP[k]);if(val===''||+val===base)delete P2[k];else P2[k]=+val};
 document.addEventListener('change',e=>{if(S.tab!=='balance')return;const t=e.target;if(!document.getElementById('dvs').contains(t))return;
  if(t.dataset.bx){setV(t.dataset.bx,t.value);ST.dirty=1;API.draw()}else if(t.dataset.bs){ST.sim[t.dataset.bs]=t.value;if(t.dataset.bs==='sk'){ST.sim.a='';ST.sim.sec='';ST.sim.mult=''}if(t.dataset.bs==='a')ST.sim.sec='';API.draw()}},true);
 document.addEventListener('input',e=>{if(S.tab!=='balance')return;const t=e.target;if(t.dataset&&t.dataset.bq){ST.q=t.value;const pos=t.selectionStart;API.draw();const n=document.querySelector('#dvs [data-bq]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}}},true);
 document.addEventListener('click',async e=>{if(S.tab!=='balance')return;const t=e.target.closest('[data-bv]');if(!t||!document.getElementById('dvs').contains(t))return;const v=t.dataset.bv;
  if(v==='save'){try{await dset('draft/balance',sec());ST.dirty=0;toast('Saved to draft. Publish it from the Publish tab.')}catch(e2){fail(e2)}if(SQA.previewing)SQA.preview(S.draft);API.draw();return}
  if(v==='reset'){S.draft.balance={};ST.dirty=1;API.draw();toast('Cleared. Save to draft to keep it.');return}
  ST.v=v;ST.q='';API.draw()},true);
 SQSUITE.addTab('balance','Balance',{render,dirty:()=>!!ST.dirty,leave:()=>{ST.dirty=0},changes(L,D){const a=L&&L.balance||{},b=D&&D.balance||{},out=[];
   for(const p of['xp','act','perk']){const x=a[p]||{},y=b[p]||{};for(const k of new Set([...Object.keys(x),...Object.keys(y)]))if(x[k]!==y[k]){const lab=p==='xp'?SKN[k]+' XP':p==='act'?((ACTS().find(q=>q.id===k)||{}).lab||k)+' XP':((perkObj(k.split(':')[1])||{c:{n:k}}).c.n)+' value';
    out.push({kind:'ext',html:'⚖️ '+E(lab)+': '+(y[k]==null?'back to the game\'s number':y[k]+(p==='act'?'':'%'))})}}return out}})})();
