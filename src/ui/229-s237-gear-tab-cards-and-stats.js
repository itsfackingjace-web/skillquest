// ---- Your character tab: item cards and every stat that matters (Nov 17) ----
// 028's equipHTML lists the slots and a few numbers. Tapping a slot opened only the equip/put-away choices, and the numbers left out
// armour, critical hits, gear effects (111a2's fx, summed by SQGEAR.fxSum incl. SQFXEXTRA perks), set bonuses (turtle 200, meteorite 216,
// ranger/mage already shown) and potion buffs (085's LUX.BUFF). Here:
//  - a tapped slot with something in it shows an item card first: icon, name, its description with stats (IDESC, built by 084/111a2),
//    what a shop pays and the market price (079's SQMKT);
//  - extra rows go right after 028's "Block chance" row.
(()=>{const pc=x=>Math.round(x*100)+'%',fm=n=>n>=1e6?(n/1e6).toFixed(n%1e6?1:0)+'M':n>=1e4?(n/1e3).toFixed(n%1e3?1:0)+'k':String(n);
 const valueLine=k=>{const sp=SELLP[k]|0;let m=null;try{m=window.SQMKT&&SQMKT.info(k)}catch(e){}
  return(sp?'Shop pays '+fm(sp)+' gold':'Shops don\'t buy it')+' · '+(m?'Market price '+fm(m.p)+' gold ('+m.n+' recent trade'+(m.n>1?'s':'')+')':'Market price: no recent trades')};
 window.SQVALUELINE=valueLine;
 const icon=k=>{try{return EQ[k]&&typeof eqIcon==='function'?eqIcon(k):iconURL(k)}catch(e){try{return iconURL(k)}catch(e2){return''}}};
 function card(k){const e=EQ[k],n=(e&&e.n)||INAME[k]||k,d=IDESC[k]||'';
  return'<div class="sqgcard"><img alt="" src="'+icon(k)+'"><div><b>'+esc(n)+'</b>'+(d?'<div class="sqgcd">'+esc(d)+'</div>':'')+'<small>'+esc(valueLine(k))+'</small></div></div>'}
 function extraRows(){const R=[];const row=(a,b)=>R.push('<div class="tc-r"><span>'+a+'</span><b>'+b+'</b></div>');
  try{row('Health',Math.max(0,P.hp)+' / 6 hearts')}catch(e){}
  try{if(typeof armorPts==='function')row('Armour',armorPts()+' points')}catch(e){}
  try{if(typeof blockCap==='function')row('Block limit',pc(blockCap()))}catch(e){}
  try{if(typeof critCh==='function'){const c=critCh(null);if(c>0)row('Critical hits',pc(Math.min(1,c))+' of hits')}}catch(e){}
  try{const G=window.SQGEAR;if(G&&G.fxSum&&G.FXN){for(const k in G.FXN){const v=+G.fxSum(k)||0;if(!v)continue;
    const t=k==='hreg'?'+1 heart every '+Math.max(1,Math.round(600/v))+'s':k==='hun'?v+'% slower hunger':(v>0?'+':'')+v+'%';row(G.FXN[k],t)}}}catch(e){}
  try{const T=window.SQTURT;if(T&&T.worn){const w=T.worn();if(w)row('Turtle armor',w+'/3 pieces')}}catch(e){}
  try{const M=window.SQMETGEAR;if(M&&M.worn){const w=M.worn();if(w)row('Meteorite armor',w+'/3 pieces')}}catch(e){}
  try{const B=window.LUX&&LUX.BUFF,now=performance.now(),N={str:'Strength',iron:'Iron skin',swift:'Swiftness',wis:'Wisdom (+20% XP)',regen:'Regeneration'};
   if(B)for(const k in N)if(B[k]>now){const s=Math.ceil((B[k]-now)/1000);row(N[k],Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+' left')}}catch(e){}
  return R.join('')}
 const _e=equipHTML;equipHTML=function(){let h=_e.apply(this,arguments);
  try{const s=typeof EQSEL!=='undefined'&&EQSEL,k=s&&occ(s);if(k){const a=h.indexOf('<div class="qc" style="margin-top:10px"><b>');if(a>=0){const b=h.indexOf('</b>',a);if(b>=0)h=h.slice(0,b+4)+card(k)+h.slice(b+4)}}}catch(e){}
  try{const m=h.indexOf('<span>Block chance</span>');if(m>=0){const end=h.indexOf('</div>',m);if(end>=0)h=h.slice(0,end+6)+extraRows()+h.slice(end+6)}}catch(e){}
  return h};
 // a newly tapped slot scrolls its card into view (on phones it sits below the slot grid)
 {let last=null;const _r=rPn;rPn=function(){const out=_r.apply(this,arguments);try{const s=ptab===3&&pnOpen&&typeof EQSEL!=='undefined'?EQSEL:null;
   if(s&&s!==last){const c=pbd.querySelector('.sqgcard')||pbd.querySelector('.eqo,.equ');if(c&&c.scrollIntoView)c.scrollIntoView({block:'nearest',behavior:'smooth'})}last=s}catch(e){}return out}}
 const st=document.createElement('style');st.textContent='#pn .sqgcard{display:flex;gap:10px;align-items:flex-start;text-align:left;margin:8px 0 6px;padding:8px;background:#f6f3ea;border:2px solid #c8bfa8}'+
  '#pn .sqgcard img{width:32px;height:32px;image-rendering:pixelated;flex:none}#pn .sqgcard b{display:block}#pn .sqgcard .sqgcd{font-size:13px;margin:2px 0 4px}#pn .sqgcard small{color:#7a5a20}';document.head.appendChild(st);
})();
