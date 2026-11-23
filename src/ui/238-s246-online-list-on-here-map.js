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
 SQMAPHTML.wrap('238',_mh=>function(){const h=_mh.apply(this,arguments);try{if(typeof MAPVIEW!=='undefined'&&MAPVIEW==='world')return h;return h+listHTML()}catch(e){self.SQERR&&SQERR(e,'238-1');return h}});
 // Nov 22 (Jace: "on the HERE map, other players' locations don't even show up"): the HUD minimap and the WORLD map had a dot for
 // everyone online, the HERE map only for party members (136, green). Everyone else on the island you're looking at gets a dot too,
 // drawn like 061's: friends green, other players blue, with a dark edge, at their outdoor spot (the door of the house they're in).
 // Party members are left to 136. The legend names the colours.
 const area=()=>{try{return typeof curRegion==='function'?curRegion():'hollow'}catch(e){return'hollow'}};
 const wide=a=>a==='hollow'?N:(typeof WORLD_REGIONS!=='undefined'&&WORLD_REGIONS[a]?WORLD_REGIONS[a].width:-1);
 const dots=()=>{const M=window.SQMP;if(!M||!M.on||!M.players)return[];const a=area(),now=performance.now(),out=[];
  for(const[u,r]of M.players){if(!r||now-r.seen>=20000||r.ar!==a||typeof r.ax!=='number'||!isFinite(r.ax)||!isFinite(r.ay))continue;
   try{if(window.SQPARTY&&SQPARTY.has(u))continue}catch(e){self.SQERR&&SQERR(e,'238-2')}out.push({u,x:Math.floor(r.ax/16),y:Math.floor(r.ay/16),f:!!(M.friends&&M.friends[u])})}return out};
 SQDRAWMAP.wrap('238 players on the HERE map',_dm=>function(){const out=_dm.apply(this,arguments);try{if(typeof MAPVIEW!=='undefined'&&MAPVIEW==='world')return out;
   const c=document.getElementById('mpc');if(!c||c.width!==wide(area()))return out;const x=c.getContext('2d');
   const FR=(a,b,w,h)=>CanvasRenderingContext2D.prototype.fillRect.call(x,a,b,w,h);// past 113's doubling: about the size of your own marker
   const D=dots();for(const d of D){x.fillStyle='#101018';FR(d.x-2,d.y-2,5,5);x.fillStyle=d.f?'#60e860':'#60c0ff';FR(d.x-1,d.y-1,3,3)}names(c,D)}catch(e){self.SQERR&&SQERR(e,'238-3')}return out});
 // names over the dots, in a layer over the map like 225's place labels (friends first, a name that would overlap one already
 // shown is left out); rebuilt only when something moved
 {const st=document.createElement('style');st.textContent=`#pn .sqmpn{position:absolute;inset:3px;pointer-events:none;overflow:hidden}#pn .sqmpn span{position:absolute;transform:translate(-50%,-135%);white-space:nowrap;font:700 9px var(--pf),monospace;color:#c8e8ff;line-height:1;
text-shadow:1px 0 #101018,-1px 0 #101018,0 1px #101018,0 -1px #101018,1px 1px #101018,-1px -1px #101018,1px -1px #101018,-1px 1px #101018}#pn .sqmpn span.f{color:#b8ffc0}`;document.head.appendChild(st)}
 let lastN='';
 function names(c,D){const w=c.parentElement;if(!w||!w.classList||!w.classList.contains('sqmpw'))return;let L=w.querySelector('.sqmpn');
  const M=window.SQMP,placed=[];let h='';
  for(const d of D.slice().sort((a,b)=>(+b.f)-(+a.f))){const r=M.players.get(d.u),n=String((r&&r.n)||'?').slice(0,12),lx=(d.x+.5)/c.width*100,ly=d.y/c.height*100,wd=(n.length*5.6+4)/380*100,ht=11/380*100;
   const bx={x0:lx-wd/2,x1:lx+wd/2,y0:ly-ht*1.5,y1:ly-ht*.3};if(placed.some(q=>bx.x0<q.x1&&bx.x1>q.x0&&bx.y0<q.y1&&bx.y1>q.y0))continue;placed.push(bx);
   h+='<span'+(d.f?' class="f"':'')+' style="left:'+lx.toFixed(2)+'%;top:'+ly.toFixed(2)+'%">'+esc(n)+'</span>'}
  if(!L){L=document.createElement('div');L.className='sqmpn';w.appendChild(L);lastN=null}if(h!==lastN){L.innerHTML=h;lastN=h}}
 SQMAPHTML.wrap('238 legend',_mh=>function(){const h=_mh.apply(this,arguments);try{if(typeof MAPVIEW!=='undefined'&&MAPVIEW==='world'||typeof h!=='string'||!window.SQMP||!SQMP.on)return h;
   return h.replace('<div class="lg">','<div class="lg"><span><i style="background:#60c0ff"></i>Players</span>'+(SQMP.friends&&Object.keys(SQMP.friends).length?'<span><i style="background:#60e860"></i>Friends</span>':''))}catch(e){self.SQERR&&SQERR(e,'238-4');return h}});
 window.SQONLINELIST=listHTML;window.SQHEREDOTS=dots})();
