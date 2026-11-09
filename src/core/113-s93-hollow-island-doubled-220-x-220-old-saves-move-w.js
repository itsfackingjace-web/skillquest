// ---------------------------------------------------------------- 93. Hollow Island doubled (220 x 220): old saves move with the map
// Saves from before the change (no "hsc" field) are scaled up as they load: your position, houses and castles, the
// things you built outside, berry planters, beds and farm plots all move to the matching spot on the bigger island.
// Anything that lands in the water, on rock, or inside a town is packed into your bag instead (with what was in it).
{const OLD=110,sc=i=>{const x=i%OLD,y=(i/OLD)|0;return(y*HSC)*N+x*HSC};
 let OWN=new Set();const bad=i=>i<0||i>=N*N||tile[i]===0||tile[i]===3||PROT.has(i)||(BS.has(i)&&!OWN.has(i))||TOWNZ.has(i)||inVillage(i%N,(i/N)|0);
 const addInv=(S,k,n)=>{if(!S.inv||typeof S.inv!=='object')S.inv={};S.inv[k]=(+S.inv[k]||0)+n};
 const addItems=(S,o)=>{if(o&&typeof o==='object')for(const k in o){const n=Math.max(0,+o[k]||0);if(n)addInv(S,k,n)}};
 function hMigrate(S){const packed=[];OWN=new Set(STR.keys());for(const h of HOUSES){try{for(const i of houseTiles(h))OWN.add(i)}catch(e){}}const inH=!S.region||!S.region.id||S.region.id==='hollow';
  if(S.p&&typeof S.p==='object'&&inH&&isFinite(S.p.x)&&isFinite(S.p.y)){S.p.x=S.p.x*HSC-8;S.p.y=S.p.y*HSC-8}
  S.fires=[];S.rm=[];
  if(Array.isArray(S.str)){const keep=[];for(const e of S.str){if(!Array.isArray(e))continue;const ni=sc(e[0]|0);if(bad(ni)){addInv(S,e[1],1);addItems(S,e[2]);packed.push(INAME[e[1]]||e[1]);if(+S.bsp===(e[0]|0))S.bsp=-1;continue}if(+S.bsp===(e[0]|0))S.bsp=ni;e[0]=ni;keep.push(e)}S.str=keep}
  if(S.plant&&typeof S.plant==='object'){const o={};for(const k in S.plant)o[/^o\d+$/.test(k)?'o'+sc(+k.slice(1)):k]=S.plant[k];S.plant=o}
  if(Array.isArray(S.houses)){const keep=[];for(const h of S.houses){if(!h||!isFinite(h.x)||!isFinite(h.y)){continue}const x=h.x*HSC,y=h.y*HSC,w=h.w||5,hw=(w-1)/2;let ok=x>4&&y>3&&x<N-5&&y<N-3;
    for(let dy=-1;dy<=0&&ok;dy++)for(let dx=-hw;dx<=hw;dx++)if(bad((y+dy)*N+x+dx)){ok=false;break}if(ok&&tile[(y+1)*N+x]===0)ok=false;
    if(ok){h.x=x;h.y=y;keep.push(h);continue}
    addInv(S,h.c?'castle':'house',1);packed.push(h.c?'Castle':'House');if(Array.isArray(h.f))for(const q of h.f)if(Array.isArray(q)&&q[1]){addInv(S,q[1],1);addItems(S,q[2])}if(S.home===h.id)S.home=null}S.houses=keep}
  if(Array.isArray(S.farm))S.farm=S.farm.filter(e=>Array.isArray(e)).map(e=>{e[0]=sc(e[0]|0);return e}).filter(e=>!bad(e[0]));
  if(S.sf&&S.sf.hollow&&typeof S.sf.hollow==='object'){const o={};for(const k in S.sf.hollow){const m=/^(\d+)_(\d+)$/.exec(k);if(!m)continue;const x=+m[1]*HSC,y=+m[2]*HSC;if(!bad(y*N+x))o[x+'_'+y]=S.sf.hollow[k]}S.sf.hollow=o}
  return packed}
 const _ap=applySave;applySave=function(S){let packed=null;if(S&&typeof S==='object'&&S.hsc!==HSC){try{packed=hMigrate(S)}catch(e){console.warn('hollow migrate',e)}}_ap(S);
  if(packed){S.hsc=HSC;try{if(!SCENE&&(solid(P.x-5,P.y-3)||solid(P.x+5,P.y+6))){const tx=Math.floor(P.x/16),ty=Math.floor(P.y/16);let done=false;for(let r=1;r<14&&!done;r++)for(let dy=-r;dy<=r&&!done;dy++)for(let dx=-r;dx<=r&&!done;dx++){const x=(tx+dx)*16+8,y=(ty+dy)*16+8;if(!solid(x-5,y-3)&&!solid(x+5,y+6)&&!solid(x,y)){P.x=x;P.y=y;done=true}}if(!done){P.x=SPX;P.y=SPY}}}catch(e){}
   setTimeout(()=>{try{say('Hollow Island has grown! It\'s twice as big now'+(packed.length?'. Some of your builds landed in water or on rock, so they\'re in your bag: '+[...new Set(packed)].join(', ')+'.':', and your builds moved with it.'));msgT=8;saveLocal(true);saveCloud(true)}catch(e){}},1500)}};
 const _sn=snap;snap=function(){const s=_sn();s.hsc=HSC;return s};
 try{KNOWN49.add('hsc')}catch(e){}
 // the island map: markers keep their size on the bigger island (each 3x3 marker and its centre dot are drawn HSC times as big)
 {const _dm=drawMap;drawMap=function(){const c=document.getElementById('mpc'),R=SCENE&&SCENE.room;if(!c||(R&&R.region)||c.width!==N)return _dm();const x=c.getContext('2d'),fr=x.fillRect;let last=null;
   x.fillRect=function(X,Y,w,h){if(w>=3&&h>=3&&w<=7&&h<=7){const cx=X+w/2,cy=Y+h/2;last=[X,Y];return fr.call(this,cx-w*HSC/2,cy-h*HSC/2,w*HSC,h*HSC)}
    if(w===1&&h===1&&last&&X===last[0]+1&&Y===last[1]+1){last=null;return fr.call(this,X+.5-HSC/2+.5,Y+.5-HSC/2+.5,HSC,HSC)}last=null;return fr.call(this,X,Y,w,h)};
   try{return _dm()}finally{x.fillRect=fr}}}
 // nothing grows under a build (the bigger island has new trees where old builds now stand)
 let chk=0;const _u=upd;upd=function(dt){_u(dt);if((chk-=dt)>0)return;chk=1.5;for(const i of STR.keys())if(obj[i])obj[i]=null;for(const i of FARM.keys())if(obj[i])obj[i]=null;
  for(const h of HOUSES){try{for(const i of houseTiles(h))if(obj[i])obj[i]=null}catch(e){}}}}
