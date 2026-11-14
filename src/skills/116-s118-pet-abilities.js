// ---- 118. Pets that help: treeling abilities and two mushroom pets ----
// - Treelings (every kind): when you chop a tree with your treeling following you, it can shake loose an extra log of
//   whatever you just got. Rarer treelings are better at it, and every treeling is twice as good with its own kind of tree.
// - Mushling (red cap, 1 in 1,000 from mushroom patches): healing spores. When you're hurt it heals you 1 heart now and
//   then; when you're not, it sometimes brings you mushrooms.
// - Glowcap (blue, 1 in 2,500 from mushroom patches): when something hits you, it can burst a cloud of spores that slows
//   every monster around you. It glows softly in the dark.
(()=>{const NP=window.SQNPET||{},LP=window.LUX&&LUX.PETS;
 const pet=()=>window.LUX&&LUX.COS&&LUX.COS.pet;
 const petPos=()=>{try{const s=PST&&PST.get&&PST.get('me');if(s)return{x:s.x,y:s.y}}catch(e){}return{x:P.x,y:P.y}};
 const pop=(t,c)=>{const p=petPos();try{gTxt(p.x,p.y-18,t,c||'#f8d048')}catch(e){}};
 // ---- treelings ----
 const TREEL={ptree:{ch:.10,kin:'tree'},ptoak:{ch:.12,kin:'oak'},ptwil:{ch:.14,kin:'willow'},ptmap:{ch:.16,kin:'maple'},ptpine:{ch:.16,kin:'pine'},ptyew:{ch:.20,kin:'yew'},ptdead:{ch:.18,kin:'dead'},ptvoid:{ch:.22,kin:'dark'}};
 const isLog=k=>k==='wood'||/log$/.test(k);
 const treeAt=()=>{try{const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16),R=SCENE&&SCENE.room;let o=null;
   if(R&&R.region){const it=rgObjAt(R,tx,ty);o=it&&it.o}else if(!SCENE&&tx>=0&&ty>=0&&tx<N&&ty<N)o=obj[ty*N+tx];return o}catch(e){return null}};
 const kinOf=o=>{if(!o)return'';if(o.v==='dark')return'dark';if(o.v==='dead')return'dead';const t=String(o.t||'');for(const k of['oak','willow','maple','yew','pine'])if(t.indexOf(k)===0)return k;return/tree/.test(t)?'tree':''};
 const _a=attack;attack=function(){const k=pet(),T=TREEL[k];if(!T||(window.SQPETOFF&&SQPETOFF(k)))return _a.apply(this,arguments);const o=treeAt(),before={};for(const i in inv)if(isLog(i))before[i]=inv[i]|0;
  const out=_a.apply(this,arguments);try{for(const i in inv){if(!isLog(i))continue;const d=(inv[i]|0)-(before[i]|0);if(d<=0)continue;
    const ch=T.ch*(kinOf(o)===T.kin?2:1);if(Math.random()<ch){inv[i]=(inv[i]|0)+1;const n=(NP[k]&&NP[k].n)||'treeling';pop('+1 '+(INAME[i]||i).toLowerCase(),'#7cd060');
     if(Math.random()<.35)say('Your '+n.toLowerCase()+' shakes loose an extra '+(INAME[i]||i).toLowerCase()+'!');try{sfx('rustle')}catch(e){}}break}}catch(e){}return out};
 // ---- mushroom pets ----
 const MP={pmush:{n:'Mushling',src:'mushroom patches (1 in 1,000)',odds:1/1000,cap:['#d83830','#a02020','#f86858'],dot:'#f8f0e0'},
  pglow:{n:'Glowcap',src:'mushroom patches (1 in 2,500)',odds:1/2500,cap:['#4878d8','#2c4ca0','#78b0f8'],dot:'#c8f8ff',glow:1}};
 for(const k in MP){NP[k]={n:MP[k].n,src:MP[k].src};if(LP&&!LP.some(p=>p.k===k))LP.push({k,n:MP[k].n,v:0,rare:1,c:[MP[k].cap[0],MP[k].cap[1],MP[k].cap[2]]})}
 // found while picking mushroom patches
 const _a2=attack;attack=function(){let o=null;try{o=treeAt()}catch(e){}const s0=inv.shroom|0;const out=_a2.apply(this,arguments);
  try{if(o&&o.t==='shroom'&&(inv.shroom|0)>s0)for(const k in MP)if(Math.random()<MP[k].odds||window.SQMUSHDROP===k){SQGIVEPET(k);break}}catch(e){}return out};
 // the Mushling: heals you, or brings mushrooms
 let mT=40;const _u=upd;upd=function(dt){_u.apply(this,arguments);if(pet()!=='pmush'||(window.SQPETOFF&&SQPETOFF('pmush'))||dead||menuOpen||(typeof pnOpen!=='undefined'&&pnOpen))return;mT-=dt;if(mT>0)return;
  if(P.hp<6){P.hp=Math.min(6,P.hp+1);mT=45+Math.random()*20;say('Your mushling puffs healing spores at you. +1 heart');pop('+1 heart','#f86868');
   const p=petPos();for(let k=0;k<12;k++)part(p.x,p.y-4,(Math.random()-.5)*50,-30-Math.random()*40,.7,k%2?'#f8b0b0':'#fff0f0',40,1);try{sfx('eat')}catch(e){}}
  else{mT=110+Math.random()*40;const n=1+(Math.random()<.4?1:0);inv.shroom=(inv.shroom|0)+n;say('Your mushling brings you '+n+' mushroom'+(n>1?'s':'')+'!');pop('+'+n+' mushroom'+(n>1?'s':''));try{sfx('pickup')}catch(e){}}
  try{saveLocal()}catch(e){}};
 // the Glowcap: a spore cloud slows everything around you when you get hit
 let gCd=0,lastHp=null;const _u2=upd;upd=function(dt){const h0=lastHp;_u2.apply(this,arguments);lastHp=P.hp;try{if(pet()!=='pglow'||(window.SQPETOFF&&SQPETOFF('pglow'))||dead||h0===null||!(P.hp<h0)||performance.now()<gCd||Math.random()>=.45)return;gCd=performance.now()+6000;let n=0;
   for(const e of en)if(!e.dead&&!e._rp&&!e._pet&&Math.hypot(e.x-P.x,e.y-P.y)<56){e.slow=Math.max(e.slow||0,3);n++}
   for(let k=0;k<26;k++){const an=k/26*6.283;part(P.x,P.y-2,Math.cos(an)*70,Math.sin(an)*40-10,.8,k%2?'#78b0f8':'#c8f8ff',30,2)}
   if(n)say('Your glowcap bursts into spores! '+n+' monster'+(n>1?'s are':' is')+' slowed.');try{sfx('rustle')}catch(e){}}catch(e){}};
 // ---- how mushroom pets look: a round cap with spots, a pale stem face, little feet; idles with a squash, hops when walking ----
 const MC={};function mushSp(k,f){const key=k+f;if(MC[key])return MC[key];const M=MP[k],[C,Cd,Cl]=M.cap,c=document.createElement('canvas');c.width=16;c.height=16;const x=c.getContext('2d'),on=new Uint8Array(256),p=(i,j,cl)=>{if(i<0||j<0||i>15||j>15)return;x.fillStyle=cl;x.fillRect(i,j,1,1);on[j*16+i]=1};
  const sq=f===1?1:0;// squash frame: cap a pixel lower and wider
  for(let j=0;j<6;j++)for(let i=0;i<14;i++){const nx=(i-6.5)/(7+sq*.5),ny=(j-5)/5.5;if(nx*nx+ny*ny>1)continue;p(i+1,j+2+sq,j<2&&i<7?Cl:j>3?Cd:C)}
  for(const[i,j]of[[4,4],[9,3],[11,6],[6,6]])p(i,j+sq,M.dot);
  for(let j=8;j<13;j++)for(let i=4;i<12;i++)p(i,j+sq*0,j===8?'#d8c8a8':'#f0e4c8');
  p(6,10,'#181018');p(9,10,'#181018');p(6,9,'#181018');p(9,9,'#181018');if(f!==2)p(7,11,'#c87060');
  const ft=f===2?[[4,13],[10,12]]:f===3?[[5,12],[11,13]]:[[5,13],[10,13]];for(const[i,j]of ft){p(i,j,'#e0d0b0');p(i+1,j,'#e0d0b0')}
  x.fillStyle='#181018';for(let j=0;j<16;j++)for(let i=0;i<16;i++){if(on[j*16+i])continue;if((i>0&&on[j*16+i-1])||(i<15&&on[j*16+i+1])||(j>0&&on[(j-1)*16+i])||(j<15&&on[(j+1)*16+i]))x.fillRect(i,j,1,1)}
  return MC[key]=c}
 window.SQPETDRAW=window.SQPETDRAW||{};
 for(const k in MP)SQPETDRAW[k]=(k2,s,tm)=>{const x=Math.round(s.x),y=Math.round(s.y),mv=s.mv>0,f=mv?2+Math.floor(s.t)%2:Math.floor(tm*2)%2,hop=mv&&f===2?2:0,sp=mushSp(k2,f);
  if(MP[k2].glow){const a=.18+.08*Math.sin(tm*3);g.globalAlpha=a;g.fillStyle='#78b0f8';g.beginPath();g.ellipse(x,y,14,9,0,0,6.283);g.fill();g.globalAlpha=1}
  try{shd(x,y+6,10)}catch(e){}g.save();g.imageSmoothingEnabled=false;if(s.fl){g.translate(x*2,0);g.scale(-1,1)}g.drawImage(sp,x-8,y+7-15-hop);g.restore();
  if(MP[k2].glow&&Math.floor(tm*2+x)%5===0)Rg(x+3,y-9,1,1,'#ffffff')};
 // the wiki's rare drops
 try{const W=window.WK_RARE||(typeof WK_RARE!=='undefined'?WK_RARE:null);if(W){W.push(['Mushling (pet)',null,'Mushroom patches','A little mushroom with healing spores: now and then it heals you 1 heart when you are hurt, or brings you mushrooms.','1 in 1,000 from mushroom patches.'],
   ['Glowcap (pet)',null,'Mushroom patches','A glowing blue mushroom. When something hits you it can burst into spores that slow every monster around you.','1 in 2,500 from mushroom patches.']);
  for(const r of W)if(/treeling \(pet\)/i.test(r[0]))r[3]='A little walking tree. When you chop trees it can shake loose an extra log, and it is twice as good with its own kind of tree.'}}catch(e){}
 window.SQPETAB={TREEL,MP}})();
