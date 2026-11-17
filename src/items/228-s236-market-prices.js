// ---- Market prices on item cards (Nov 17) ----
// 079 works out each item's market price from recent World Market trades (window.SQMKT: the middle price of the last 30 days'
// trades, counted per item). The bag's item text and the chest's item card show it next to what the shop pays.
(()=>{const fm=n=>n>=1e6?(n/1e6).toFixed(n%1e6?1:0)+'M':n>=1e4?(n/1e3).toFixed(n%1e3?1:0)+'k':String(n);
 const line=k=>{try{const M=window.SQMKT&&SQMKT.info(k);if(!M)return'';return'Market price: '+fm(M.p)+' gold ('+M.n+' recent trade'+(M.n>1?'s':'')+')'}catch(e){return''}};
 const _b=bagGridHTML;bagGridHTML=function(){const h=_b.apply(this,arguments),k=invSel;if(!k)return h;const L=line(k);if(!L)return h;
  const cut='</div><div class="tl" style="margin-top:10px;font-size:15px">Gold:';const i=h.lastIndexOf(cut);return i<0?h:h.slice(0,i)+'<br><small style="color:#7a5a20">'+L+'</small>'+h.slice(i)};
 const _c=chestCardHTML;chestCardHTML=function(s){const h=_c.apply(this,arguments);const c=CHCARD;if(!h||!c)return h;const L=line(c.k);if(!L)return h;
  const i=h.indexOf('</small></div></div>');return i<0?h:h.slice(0,i)+'<br>'+L+h.slice(i)};
 window.SQMKTCARD={line};
})();
