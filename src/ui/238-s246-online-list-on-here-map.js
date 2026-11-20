// ---- 246. Players online under the HERE map too ----
// 061 lists everyone online under the WORLD map (friends first, with the island they're on). The HERE map gets the same list,
// with players on the island you're on marked "here" and listed first after friends.
(()=>{const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 function listHTML(){const M=window.SQMP;if(!M||!M.on||!M.players)return'';const now=performance.now(),me=typeof curRegion==='function'?curRegion():'';
  const rows=[...M.players].filter(([u,r])=>r&&now-r.seen<20000),fr=u=>!!(M.friends&&M.friends[u]),here=r=>!!(me&&r.ar===me);
  rows.sort((a,b)=>(+fr(b[0]))-(+fr(a[0]))||(+here(b[1]))-(+here(a[1]))||String(a[1].n).localeCompare(String(b[1].n)));
  let t='<div class="qc sqonl"><b>Players online ('+(rows.length+1)+')</b><small>';if(!rows.length)t+='<br>Nobody else is online right now.';
  for(const[u,r]of rows){const f=fr(u),where=r.ar&&typeof WORLD_REGIONS!=='undefined'&&WORLD_REGIONS[r.ar]?WORLD_REGIONS[r.ar].name:'At sea';
   t+='<br><span style="color:'+(f?'#28a048':'#3070c0')+'">&#9632;</span> '+esc(r.n||'?')+(f?' (friend)':'')+' · '+esc(where)+(here(r)?' <b>(here)</b>':'')}
  return t+'</small></div>'}
 SQMAPHTML.wrap('238',_mh=>function(){const h=_mh.apply(this,arguments);try{if(typeof MAPVIEW!=='undefined'&&MAPVIEW==='world')return h;return h+listHTML()}catch(e){return h}});
 window.SQONLINELIST=listHTML})();
