// ---------------------------------------------------------------- 90. A new anvil, and the trash can
// The anvil (your own and the blacksmith's) is redrawn: a steel anvil with a horn on a wooden stump.
// The trash can is furniture for your house (Craft menu, Building): face it and press HIT to get rid of things
// you don't want any more, one at a time or all at once (you're asked twice before a whole stack goes).
{const ANV=["..KKKKKKKKKKKKK.",".KCCCCCCCCCCCCCK","KAAAAAAAAAAAAAAK",".KKAAAAAAAAAAABK","...KKKBAAAABKKK.",".....KBAAABK....",".....KBAAABK....","....KBAAAAABK...","...KKKKKKKKKKK..","...KWWwWWwWWWK..","...KWwWWWwWWwK..","...KwwwwwwwwwK..","...KKKKKKKKKKK.."];
 const TRS=["....KKKKKKKK....","...KCCCCCCCCK...","..KKKKKKKKKKKK..","..KCAAAAAAAABK..","...KAABAABABK...","...KAABAABABK...","...KAABAABABK...","...KAABAABABK...","...KAABAABABK...","...KAAAAAAABK...","...KKKKKKKKKK..."];
 const pal={K:'#181018',A:'#6a7284',B:'#464c5c',C:'#c8d0e0',W:'#a06a38',w:'#7a4a24'},tpal={K:'#181018',A:'#7a8a7a',B:'#56645a',C:'#a8b8a8'};
 const paint=(rows,P2)=>{const c=document.createElement('canvas');c.width=rows[0].length;c.height=rows.length;const x=c.getContext('2d');rows.forEach((r,y)=>{for(let i=0;i<r.length;i++){const col=P2[r[i]];if(col){x.fillStyle=col;x.fillRect(i,y,1,1)}}});return c};
 let AC=null,TC=null;const anv=()=>AC||(AC=paint(ANV,pal)),trs=()=>TC||(TC=paint(TRS,tpal));
 const drawAnvil=(x0,y0)=>{shd(x0+8,y0+15,14);g.drawImage(anv(),x0,y0+3)},drawTrash=(x0,y0,st)=>{shd(x0+8,y0+15,12);g.drawImage(trs(),x0,y0+(st&&st.bump>0?3:4))};
 {const _ds=drawStation;drawStation=function(t,x,y,st,tm){if(t==='anvil')return drawAnvil(x*16,y*16);if(t==='trash')return drawTrash(x*16,y*16,st);return _ds(t,x,y,st,tm)}}
 {const _df=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='anvil')return drawAnvil(it.x*16,it.y*16);return _df(it,tm)}}
 // the trash can
 STNS.push({k:'trash',n:'Trash can',c:{stone:6,wood:2},req:2,xp:15,hp:2,d:'Get rid of things you don\'t want.'});STN.add('trash');
 BREC.push({k:'trash',n:'Trash can',c:{stone:6,wood:2},req:2,xp:15,hp:2});BK.push('trash');BHP.trash=2;INVK.push('trash');INAME.trash='Trash can';SELLP.trash=3;SN.trash='Trash cans';if(typeof SHORT!=='undefined')SHORT.trash='trash can';
 IDESC.trash='Furniture for your house. Face it and press HIT to throw away items you don\'t want.';FURN_ONLY.add('trash');if(typeof EXTRA_BAG!=='undefined')EXTRA_BAG.push('trash');
 {const _ic=iconURL;iconURL=function(k,col){if(k!=='trash')return _ic(k,col);const key='trash14';if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(trs(),-1,2);return ICONC[key]=c.toDataURL()}}
 let SURE=null;
 {const _sh=stationHTML;stationHTML=function(o){const h=_sh(o);if(o.t!=='trash')return h;const keys=Object.keys(inv).filter(k=>(inv[k]|0)>0&&INAME[k]).sort((a,b)=>INAME[a].localeCompare(INAME[b]));
   let L='<div class="qc"><p>Throw away anything you don\'t want. It\'s gone for good.</p></div>';if(!keys.length)L+='<div class="tl" style="font-weight:400;opacity:.6">Your bag is empty.</div>';
   for(const k of keys){const n=inv[k]|0;L+='<div class="gr"><img class="gimg" alt="" src="'+iconURL(k)+'"><div class="gi"><b>'+esc(INAME[k])+'</b> <small>×'+n+'</small></div><button class="gc stb" data-a="tr1_'+k+'">1</button>'+
    (n>1?'<button class="gc stb" data-a="'+(SURE===k?'try_':'tra_')+k+'" style="'+(SURE===k?'background:#c83040;color:#fff':'')+'">'+(SURE===k?'Sure?':'All')+'</button>':'')+'</div>'}
   const i=h.lastIndexOf('<button class="ng stb" data-a="pickup"');return i>=0?h.slice(0,i)+L+h.slice(i):h+L}}
 {const _sa=stationAct;stationAct=function(a){if(typeof a!=='string'||!/^tr[1ay]_/.test(a))return _sa(a);const k=a.slice(4),n=inv[k]|0;if(n<=0){rPn();return}
   if(a.startsWith('tra_')){SURE=k;rPn();return}const m=a.startsWith('tr1_')?1:n;inv[k]=n-m;SURE=null;
   if(STATION&&STATION.f)STATION.f.bump=.2;say('Threw away '+m+' × '+INAME[k].toLowerCase()+'.');try{sfx('swish')}catch(e){}saveLocal(true);rPn()}}
 {const _cp=closePanel;closePanel=function(){SURE=null;return _cp()}}
}
