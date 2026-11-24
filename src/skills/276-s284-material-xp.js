// ---- 284. XP and time per material (Nov 24, Jace) ----
// Every furnace and anvil recipe (SM: the game's own, Dev Suite content recipes and new gear made at the anvil) takes its XP and
// its time from what goes into it: XP = each material's XP × how many, added up; time = each material's seconds × how many,
// added up. Strictly proportional: no minimum, no maximum, no rounding. The time is the time at level 1: 109's level and perk
// speed-up divides it like every other timed action. A recipe with a material that has no values here keeps its own XP and
// 109's flat time (2.6 s forge, 2.4 s smelt), e.g. the Ancient helmet (an adamant helmet and coins).
// Values: DEF below (the "Material XP" tab of the SQ Blacksmith's Bench sheet, Nov 24), changed live through the library's
// balance.mat = {<item key>: {x, t}} (Dev Suite > Balance > Material XP, 163). A key that isn't in DEF counts once it has both.
// Covered recipes get r._mx=1 (163 leaves their XP alone, 183 shows it read-only) and r._mt (seconds); r._xp0 keeps the recipe's
// own XP for when a material loses its values. Perks that save a bar or make a bonus item don't change the XP (039's prodBoost
// never touches XP); XP boosts (meals, events, 163's per-skill %) multiply every recipe alike.
(()=>{
 const DEF={ibar:{x:30,t:.6},sbar:{x:65,t:.8},mbar:{x:110,t:.9},abar:{x:170,t:1},metbar:{x:1500,t:1.5},turtfrag:{x:800,t:2},
  wood:{x:5,t:.2},maplelog:{x:15,t:.3},yewlog:{x:25,t:.3},voidlog:{x:40,t:.4},ruby:{x:80,t:.5},sapphire:{x:80,t:.5},emerald:{x:80,t:.5},
  stardust:{x:60,t:.4},stone:{x:5,t:.2},iron:{x:15,t:.8},goldore:{x:65,t:1},mithore:{x:100,t:1.2},adamore:{x:80,t:.6},meteorore:{x:10,t:.2}};
 const BASE={smith:2.6,smelt:2.4};// 109's sqDo seconds at level 1, for recipes the table doesn't cover
 const ok=v=>v!=null&&v!==''&&isFinite(+v)&&+v>=0;
 // the table: DEF with the library's changes on top (a new key needs both numbers)
 function build(over){const o={};for(const k in DEF)o[k]={...DEF[k]};
  for(const k in over||{}){const v=over[k];if(!v||typeof v!=='object')continue;const b=o[k]||{},x=ok(v.x)?+v.x:b.x,t=ok(v.t)?+v.t:b.t;if(x!=null&&t!=null)o[k]={x,t}}return o}
 let T=build(null);
 // {x, t} for a list of materials ({key: count}), or null when one of them has no values
 function calc(c,tb){tb=tb||T;let x=0,t=0,any=0;for(const k in c||{}){const n=+c[k]||0;if(n<=0)continue;const m=tb[k];if(!m)return null;x+=n*m.x;t+=n*m.t;any=1}return any?{x,t}:null}
 function apply(){if(typeof SM==='undefined')return;for(const r of SM){if(!r||!r.c)continue;if(r._xp0==null)r._xp0=r.xp;const v=calc(r.c);
   if(v){r.xp=v.x;r._mt=v.t;r._mx=1}else if(r._mx){r.xp=r._xp0;delete r._mt;r._mx=0}}
  // upgrades (274) keep their own copy of each recipe's XP; repairs (275) read SM again after every library apply
  try{if(window.SQUPGRADE&&SQUPGRADE.reg)SQUPGRADE.reg()}catch(e){self.SQERR&&SQERR(e,'276-1')}}
 apply();
 // after 163 (Balance puts the game's own XP back), 162 (content recipes) and 111a2 (new gear) on every library apply
 try{if(window.SQA&&SQA.onApply)SQA.onApply(lib=>{T=build(lib&&lib.balance&&lib.balance.mat);apply()})}catch(e){self.SQERR&&SQERR(e,'276-2')}
 // ---- time: the outermost smithAct remembers its recipe; when sqDo starts a forge or smelt for it, the time is the recipe's ----
 let CUR=null;
 {const f=smithAct;smithAct=function(i){const p=CUR;CUR=typeof SM!=='undefined'&&SM[i]||null;try{return f.apply(this,arguments)}finally{CUR=p}}}
 // (205 hands sqDo a wrapped fn, so the new job is recognised as a new SQDO rather than by its fn)
 {const s=sqDo;sqDo=function(kind,n,fn){const D0=window.SQDO,r=s.apply(this,arguments);try{if(r&&!window.SQDO_STEP&&CUR&&CUR._mx&&BASE[kind]&&SQDO&&SQDO!==D0&&SQDO.kind===kind)SQDO.d=SQDO.d*CUR._mt/BASE[kind]}catch(e){self.SQERR&&SQERR(e,'276-3')}return r}}
 // ---- what the furnace and anvil rows show: "2.0 s · 340 xp" (the time with your level and perks) ----
 const spd=()=>{try{return 1+Math.max(0,typeof pSpeed==='function'?pSpeed(10):0)}catch(e){self.SQERR&&SQERR(e,'276-4');return 1}};
 const secs=r=>(r&&r._mx?r._mt:BASE[r&&r.smelt?'smelt':'smith'])/spd();
 const fmtS=s=>(Math.round(s*10)/10).toFixed(1)+' s',fmtX=x=>(Math.round((+x||0)*10)/10).toLocaleString('en-US');
 const tag=r=>fmtS(secs(r))+' · '+fmtX(r&&r.xp)+' xp';
 // ---- Dev Suite > Balance > Material XP (163 calls view() with its draft balance.mat) ----
 const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const nm=k=>(typeof INAME!=='undefined'&&INAME[k])||k;
 function uses(tb){const U={};if(typeof SM==='undefined')return U;for(const r of SM)for(const k in r&&r.c||{})if(tb[k])U[k]=(U[k]|0)+1;return U}
 function view(M){M=M||{};const tb=build(M),U=uses(tb),keys=Object.keys(tb);
  let h='<div class="dv-card"><b>XP and time per material</b><p class="dv-mut">Every furnace and anvil recipe gives the XP and takes the time of what goes into it: each material\'s number × how many, added up. '+
   'No minimum or maximum. Times are at Smithing 1 (levels and perks make them shorter). A recipe with a material that isn\'t listed keeps its own XP and the old time (2.6 s at the anvil, 2.4 s at the furnace).</p><table>'+
   '<tr><th style="text-align:left">Material</th><th>XP</th><th>Seconds</th><th>Recipes</th><th></th></tr>';
  for(const k of keys){const d=DEF[k],v=tb[k],chg=M[k]&&(M[k].x!=null||M[k].t!=null);
   h+='<tr><td style="padding:3px 10px 3px 0">'+E(nm(k))+' <small class="dv-mut">'+E(k)+'</small></td>'+
    '<td><input type="number" min="0" step="any" data-bx="mat.'+E(k)+'.x" value="'+v.x+'" style="width:80px'+(d&&v.x!==d.x?';background:#fff2b0':'')+'"></td>'+
    '<td><input type="number" min="0" step="any" data-bx="mat.'+E(k)+'.t" value="'+v.t+'" style="width:70px'+(d&&v.t!==d.t?';background:#fff2b0':'')+'"></td>'+
    '<td class="dv-mut" style="text-align:center">'+(U[k]|0)+'</td><td>'+(d?'':'<button class="dv-b" data-bv="matdel:'+E(k)+'" title="Take it off the list">✕</button>')+(chg&&d?' <small class="dv-mut">was '+d.x+' xp, '+d.t+' s</small>':'')+'</td></tr>'}
  h+='</table><div class="dv-row" style="gap:6px;margin-top:8px;flex-wrap:wrap;align-items:center"><input list="mxkeys" data-mxn="k" placeholder="Item key, e.g. it_new_item_2" style="width:200px"><datalist id="mxkeys">'+
   (typeof INAME!=='undefined'?Object.keys(INAME).filter(k=>!tb[k]&&!/^(u[123]_|w\d)/.test(k)).sort().map(k=>'<option value="'+E(k)+'">'+E(INAME[k])+'</option>').join(''):'')+'</datalist>'+
   '<input type="number" min="0" step="any" data-mxn="x" placeholder="XP" style="width:80px"><input type="number" min="0" step="any" data-mxn="t" placeholder="Seconds" style="width:80px"><button class="dv-b" data-bv="matadd">+ Add a material</button></div></div>';
  // what every furnace and anvil recipe comes to with these numbers
  const rows=(typeof SM!=='undefined'?SM:[]).filter(r=>r&&r.c).map(r=>{const v=calc(r.c,tb);return{r,v}}).sort((a,b)=>(!!b.r.smelt-!!a.r.smelt)||((a.r.lv|0)-(b.r.lv|0)));
  h+='<div class="dv-card" style="margin-top:8px"><b>What each recipe comes to</b><table><tr><th style="text-align:left">Recipe</th><th style="text-align:left">Materials</th><th>XP</th><th>Seconds</th><th>XP / s</th></tr>'+
   rows.map(({r,v})=>'<tr><td style="padding:2px 10px 2px 0">'+E((r.smelt?'Smelt ':'Forge ')+r.n)+' <small class="dv-mut">Smithing '+(r.lv|0)+'</small></td><td><small>'+E(Object.entries(r.c).map(([k,n])=>n+' '+nm(k)).join(', '))+'</small></td>'+
    (v?'<td style="text-align:right">'+fmtX(v.x)+'</td><td style="text-align:right">'+(Math.round(v.t*10)/10)+'</td><td style="text-align:right">'+(v.t>0?Math.round(v.x/v.t):'–')+'</td>'
     :'<td style="text-align:right">'+fmtX(r._xp0!=null?r._xp0:r.xp)+'</td><td style="text-align:right">'+BASE[r.smelt?'smelt':'smith']+'</td><td class="dv-mut">own numbers (a material isn\'t listed)</td>')+'</tr>').join('')+'</table></div>';
  return h}
 // the "+ Add a material" row (163 calls this with its draft balance.mat)
 function add(M){const q=s=>document.querySelector('#dvs [data-mxn="'+s+'"]');const k=(q('k')&&q('k').value||'').trim(),x=q('x')&&q('x').value,t=q('t')&&q('t').value;
  if(!k||!/^[A-Za-z0-9_]{1,60}$/.test(k))return'Type the item key of the material.';if(T[k]&&DEF[k])return'That material is on the list already.';if(!ok(x)||!ok(t))return'Give it an XP and a number of seconds.';
  M[k]={x:+x,t:+t};return''}
 window.SQMATXP={DEF,BASE,build,calc,apply,tag,secs,view,add,get T(){return T}};
})();
