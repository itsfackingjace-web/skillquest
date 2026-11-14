// ---- 184. Meals with buffs, and two new buffs ----
// window.SQFOODBUFF {foodKey:{b,s}} = eating that food (EAT at no fire, or USE from the bag) starts buff b for s seconds,
// like 085's potions (LUX.BUFF[kind] = end time; 085 shows the pill and the "wore off" message). Filled by 162 (Content
// food items) and 161b (Stats > Food & potions for the game's own food). Buffs: str (+2 melee, 085), iron (+15% block, 085),
// swift (free sprinting, 085), wis (+20% XP, outermost addXp here), regen (1 heart every 10 s, outermost upd here).
(()=>{const FB=window.SQFOODBUFF=window.SQFOODBUFF||{};
 window.SQBUFFK=[['str','Strength: +2 melee damage'],['iron','Iron skin: +15% block'],['swift','Swiftness: sprint for free'],['wis','Wisdom: +20% XP'],['regen','Regeneration: heal 1 heart every 10 s']];
 const NAME={str:'stronger hits',iron:'better blocks',swift:'free sprinting',wis:'+20% XP',regen:'regeneration'};
 const B=()=>window.LUX&&LUX.BUFF,on=k=>{const b=B();return!!(b&&b[k]&&b[k]>performance.now())};
 function give(k){const f=FB[k],b=B();if(!f||!b||!NAME[f.b])return;b[f.b]=Math.max(b[f.b]||0,performance.now()+f.s*1000);
  const t=f.s>=120?Math.round(f.s/60)+' min':f.s+' s';try{say('Yum! '+NAME[f.b][0].toUpperCase()+NAME[f.b].slice(1)+' for '+t+'.')}catch(e){}}
 function watch(fn){return function(){const ks=Object.keys(FB),b0=ks.map(k=>inv[k]|0);const out=fn.apply(this,arguments);ks.forEach((k,i)=>{if((inv[k]|0)<b0[i])give(k)});return out}}
 eat=watch(eat);if(typeof useFood==='function')useFood=watch(useFood);
 {const _ax=addXp;addXp=function(i,n){if(n>0&&on('wis'))n=Math.round(n*1.2);return _ax.call(this,i,n)}}
 let rg=0;{const _u=upd;upd=function(dt){const o=_u.apply(this,arguments);try{if(on('regen')&&!dead&&P.hp<6){rg+=dt;if(rg>=10){rg=0;P.hp=Math.min(6,P.hp+1)}}else rg=0}catch(e){}return o}}
 // ---- meals made on a cooking stove (Content recipes "Cooking (stove only)"): several ingredients, shown on the stove ----
 const SV=window.SQSTOVE=window.SQSTOVE||[];// {k out, n, c {item:count}, lv, xp}
 {const _sh=stationHTML;stationHTML=function(o){let h=_sh.apply(this,arguments);if(!o||o.t!=='stove'||!SV.length)return h;
   let m='<div class="tl" style="margin-top:12px">Meals</div>';SV.forEach((r,i)=>{if(!INAME[r.k])return;const need=Object.entries(r.c),ok=lvOf(4)>=r.lv&&need.every(([a,b])=>(inv[a]|0)>=b);
    m+=row22('sv_'+i,'Cook '+esc(INAME[r.k])+' <small>(have '+(inv[r.k]|0)+')</small>',need.map(([a,b])=>b+' '+esc(iname(a))+' ('+(inv[a]|0)+')').join(', ')+' · '+(lvOf(4)>=r.lv?r.xp+' xp':'Needs Cooking '+r.lv),ok)});
   const at=h.indexOf('<button class="ng stb" data-a="pickup"');return at>=0?h.slice(0,at)+m+h.slice(at):h+m}}
 {const _sa=stationAct;stationAct=function(a){if(typeof a!=='string'||!a.startsWith('sv_'))return _sa.apply(this,arguments);const r=SV[+a.slice(3)];if(!r||!INAME[r.k])return;
   if(lvOf(4)<r.lv){say('You need Cooking '+r.lv+' to cook '+INAME[r.k].toLowerCase()+'.');return}
   const need=Object.entries(r.c);if(!need.every(([k,n])=>(inv[k]|0)>=n)){say('Missing ingredients for '+INAME[r.k].toLowerCase()+'.');sfx('swish');return}
   if(typeof sqDo==='function'&&sqDo('cook',1,()=>stationAct(a)))return;
   for(const[k,n]of need)inv[k]-=n;inv[r.k]=(inv[r.k]|0)+1;addXp(4,r.xp);try{if(Q.on&&QS[Q.i]&&QS[Q.i].type==='cook')Q.k++}catch(e){}
   say('Cooked '+INAME[r.k].toLowerCase()+'.');sfx('sizzle');saveLocal(true);rPn()}}
 window.SQMEALS={give,on,SV}})();
