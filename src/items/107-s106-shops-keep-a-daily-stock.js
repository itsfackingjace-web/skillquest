// ---- 106. Shops keep a daily stock ----
// Every shop item has a limited stock each day (shared across every shop, per player), so nobody can buy their way up a
// skill with ores, bars, logs or raw fish. What's left is shown on each item, and it all restocks every morning (each
// new game day). Raw materials: 8 a day; tools and gear: 2; everything else: 20; bait: 200.
{const RAW=new Set(['wood','stone','iron','gold','mith','adam','coal','meat','pelt','bone','hide','flax','clay','ruby','sapphire','emerald','diamond','heartwood',...FISH_T.map(f=>f.k)]);
 const max=k=>k==='bait'?200:RAW.has(k)||/bar$|log$|ore$/.test(k)?8:EQ[k]||TL[k]!==undefined||/^(axe|pick|rod|hoe|can|bow|sword|wand)/.test(k)?2:20;
 const day=()=>1+Math.floor(time/DAYLEN);let STK={d:0,n:{}};const cur=()=>{if(STK.d!==day())STK={d:day(),n:{}};return STK};
 const left=k=>Math.max(0,max(k)-(cur().n[k]|0));window.SQSTOCK={left,max,day,keyOf:t=>keyOf(t)};
 {const _s=snap;snap=function(){const s=_s();s.stk=cur();return s}}
 {const _a=applySave;applySave=function(S){_a(S);STK=S&&S.stk&&S.stk.n?{d:+S.stk.d||0,n:{...S.stk.n}}:{d:0,n:{}}}}
 const isShop=()=>pnOpen&&ptab===2&&shop&&shop!=='wmkt';
 // a purchase = gold went down and items came in. Over today's stock: undo it.
 pbd.addEventListener('click',ev=>{if(!isShop())return;const b=ev.target.closest('[data-a]');if(!b)return;const inv0={...inv},g0=GLD;
  const bk=/^b/.test(b.dataset.a||'')?keyOf((b.innerText||'').replace(/\n.*left today|\n.*restocks.*/,'')):null;if(bk&&!left(bk)){ev.stopImmediatePropagation();ev.preventDefault();say('Sold out of '+(SN[bk]||INAME[bk]||bk).toLowerCase()+' today. More arrive in the morning.');try{sfx('swish')}catch(e){}return}
  setTimeout(()=>{if(GLD>=g0)return;const got={};for(const k in inv){const d=(inv[k]|0)-(inv0[k]|0);if(d>0)got[k]=d}const ks=Object.keys(got);if(!ks.length){if(bk){cur().n[bk]=(cur().n[bk]|0)+1;try{if(isShop())rPn()}catch(e){}}return}
   const over=ks.find(k=>got[k]>left(k));
   if(over){for(const k of ks)inv[k]=inv0[k]|0;GLD=g0;const L=left(over);say(L?'Only '+L+' '+(SN[over]||INAME[over]||over).toLowerCase()+' left in stock today. More arrive in the morning.':'Sold out of '+(SN[over]||INAME[over]||over).toLowerCase()+' today. More arrive in the morning.');try{sfx('swish');svg();saveLocal(true)}catch(e){}}
   else{for(const k of ks)cur().n[k]=(cur().n[k]|0)+got[k];if(bk&&!got[bk])cur().n[bk]=(cur().n[bk]|0)+1}
   try{if(isShop())rPn()}catch(e){}},0)},true);
 // show what's left on every shop button: match the button's words to an item
 const names=()=>{const L=[];for(const k in INAME){const n=(INAME[k]||'').toLowerCase().replace(/ \(.*\)$/,'');if(n.length>2)L.push([n,k]);const p=(SN[k]||'').toLowerCase();if(p.length>2)L.push([p,k])}return L.sort((a,b)=>b[0].length-a[0].length)};let NM=null;
 const keyOf=t=>{t=t.toLowerCase();if(/fire kit/.test(t))return null;NM=NM||names();for(const[n,k]of NM)if(t.includes(n))return k;return null};
 const _r=rPn;rPn=function(){_r();if(!isShop())return;try{for(const b of pbd.querySelectorAll('[data-a]')){const a=b.dataset.a||'';if(!/^b/.test(a))continue;const old=b.querySelector('.stk');if(old)old.remove();const k=keyOf(b.innerText||'');if(!k)continue;
   const l=left(k),m=max(k),s=document.createElement('span');s.className='stk';b.style.opacity='';s.textContent=l?l+' / '+m+' left today':'Sold out · restocks in the morning';s.style.cssText='display:block;font:600 11px var(--pf);margin-top:2px;color:'+(l?l<=m/4?'#c06010':'#3a7a3a':'#c03030');b.appendChild(s);if(!l)b.style.opacity=.55}}catch(e){}}}
