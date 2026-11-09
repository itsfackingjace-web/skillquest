// ---------------------------------------------------------------- 33. Every workstation draws on the house's chests
// The furnace, anvil and cooking stove work like the crafting bench: they use your bag first, then every chest in
// the same house (outdoors: chests within a few steps). Unused materials stay where they were; what you make goes
// to your bag.
const STCH=new Set(['furnace','anvil','stove']);
function stMerge(o){if(BMERGE||!o)return false;const b0=BENCH;BENCH=o;try{return benchMerge()}finally{BENCH=b0}}
const stUses=()=>shop==='station'&&STATION&&STCH.has(STATION.t);
const _sh33=stationHTML;stationHTML=function(o){const h=_sh33(o);if(!STCH.has(o.t))return h;const n=benchChests(o).length,i=h.indexOf('</div>')+6;
 const note='<div class="tl" style="font-size:12px;font-weight:400;opacity:.75">'+(n?'Using your bag and '+n+' chest'+(n>1?'s':'')+(o.inside?' in this house':' nearby'):'Using your bag. Put chests '+(o.inside?'in this house':'nearby')+' and their materials count too.')+'</div>';
 return h.slice(0,i)+note+h.slice(i)};
const _r33=rPn;rPn=function(){if(!(ptab===2&&stUses()&&pn.style.display!=='none'))return _r33();const m=stMerge(STATION);try{_r33()}finally{if(m)benchSplit()}};
const _oc33=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('button');
 if(b&&stUses()&&b.dataset.a!=='pickup'){const m=stMerge(STATION);try{_oc33(e)}finally{if(m)benchSplit()}saveLocal(true);if(stUses())rPn();return}
 _oc33(e)};
// --- the training dummy: trains Attack (HIT), Archery (arrows) and Magic (spells) up to level 30 ---
{const S=STNS.find(s=>s.k==='dummy');if(S)S.d='Practice target. Hit it, shoot it or cast at it: teaches Attack, Archery and Magic up to level 30. Press USE next to it to pick it up.'}
IDESC.dummy='Practice target. Hit it, shoot arrows at it or cast spells at it: it teaches Attack, Archery and Magic up to level 30. Stand next to it and press USE (T, L1 or the USE button) to pick it up.';
const DUMCAP=30,useKey=()=>GPON?'L1':isPC?'T':'the USE button';
let dumHintT=-99;
function dumHint(){const now=performance.now()/1000;if(now-dumHintT>40){dumHintT=now;say('Training dummy: press '+useKey()+' next to it to pick it up.')}}
// HIT on a dummy: same Attack practice as before, plus a reminder how to pick it up
const _atk33=attack;attack=function(){if(!dead&&!menuOpen&&!pnOpen&&!BUILD&&swing<=0&&!FISH&&!facingNpc()){const o=frontStation();if(o&&o.t==='dummy'&&dummyTip)dumHint()}_atk33()};
// arrows and spells that reach a dummy hit it
function dummyAt(px,py){const tx=Math.floor(px/16),ty=Math.floor(py/16);
 if(SCENE){if(!inHome())return null;const R=SCENE.room;if(tx<0||ty<0||tx>=R.w||ty>=R.h)return null;const f=SCENE.house.furn.get(ty*R.w+tx);return f&&f.t==='dummy'?f:null}
 if(tx<0||ty<0||tx>=N||ty>=N)return null;const s=STR.get(ty*N+tx);return s&&s.t==='dummy'?s:null}
function dummyStruck(d,x,y,dmg,skill,xpPer,word){d.wob=.3;setTimeout(()=>{d.wob=0},300);sfx('hit');
 DMGS.push({x,y:y-14,v:String(dmg),t:0,c:'#ffffff',sc:curScene()});
 if(lvOf(skill)<DUMCAP){addXp(skill,xpPer*dmg);if(!d.tip2){d.tip2=1;say('Good shot! The dummy teaches '+word+' up to level '+DUMCAP+'.')}}
 else if(!d.tip3){d.tip3=1;say('You\'ve learned all the dummy can teach about '+word+'. Try real enemies!')}}
const _u33=upd;upd=function(dt){if(!dead&&!menuOpen){const sc=curScene();
  for(const p of PROJ){if(p.dead||p.hostile||p.sc!==sc||p.k==='bone')continue;const d=dummyAt(p.x+p.vx*dt,p.y+p.vy*dt+4);if(d){p.life=-1;dummyStruck(d,p.x,p.y,p.dmg||1,FL,3,'Archery')}}
  for(const s of SPELLS){if(s.dead||s.sc!==sc)continue;const d=dummyAt(s.x+s.vx*dt,s.y+s.vy*dt+4);if(d){s.life=-1;dummyStruck(d,s.x,s.y,s.dmg||1,ML,4,'Magic')}}}
 _u33(dt)};
const _sh33b=stationHTML;stationHTML=function(o){if(o.t!=='dummy')return _sh33b(o);const S=STNS.find(s=>s.k==='dummy');
 const row=(n,sk)=>'<li>'+n+': level '+lvOf(sk)+(lvOf(sk)<DUMCAP?' (it can teach you up to '+DUMCAP+')':' (you\'ve outgrown it)')+'</li>';
 return'<div class="tl">'+S.n+'</div><div class="qc"><p>Practice on it from up close or from range:</p><ul style="margin:6px 0 0 18px;padding:0;text-align:left">'+row('HIT it — Attack',0)+row('Shoot arrows at it — Archery',FL)+row('Cast spells at it — Magic',ML)+'</ul></div>'
  +'<button class="ng stb" data-a="pickup" style="margin-top:16px">Pick up this training dummy</button>'};
// new art: a burlap target on a post with straw arms
let HDDUM=null;
function hdDummy(){if(HDDUM)return HDDUM;const b=hdBuf(36,50),p=hdPainter(b,18,47,true),WD2=hdP(['#4a2a14','#6e4220','#94602e','#b8824a']),BUR=hdP(['#7a5a30','#9a7840','#b89458','#d4b274']),STW=hdP(['#b88a28','#e0b848','#f4d878']);
 p.box(-10,-3,10,0,WD2,1);p.box(-2,-40,2,-1,WD2,1);
 p.box(-15,-31,15,-28,WD2,1);for(const sx of[-1,1])for(let k=0;k<5;k++){p.put(sx*(15+k%2)+(sx<0?-1:0),-32+k,STW[1+(k%2)]);p.put(sx*(16+(k>>1))+(sx<0?-1:0),-31+k,STW[k%3])}
 p.ell(0,-21,9,11,BUR,.05);for(let y=-31;y<-11;y+=3)p.put(-6+((y+40)%5),y,BUR[0]);for(let x=-8;x<9;x++)p.put(x,-15,BUR[0]);for(let x=-8;x<9;x+=2)p.put(x,-14,STW[1]);
 for(const[r,c]of[[6,'#e83838'],[4.5,'#ffffff'],[3,'#e83838'],[1.5,'#ffffff']])p.ell(0,-23,r,r,hdP([hdMix(c,'#000000',.2),c]),.2);
 p.ell(0,-37,6,6,BUR,.08);for(const ex of[-3,2])for(const[a,c]of[[0,0],[1,1],[1,0],[0,1]])p.put(ex+(a^c?0:0)+a,-38+c,hdC(a===c?'#3a2a18':'#3a2a18'));p.put(0,-43,STW[1]);p.put(-1,-44,STW[2]);p.put(1,-44,STW[0]);
 hdOutline(b,{1:hdC('#2a1a0c')});return HDDUM=hdCan(b)}
const _dst33=drawStation;drawStation=function(t,x,y,st,tm){if(t!=='dummy')return _dst33(t,x,y,st,tm);const x0=x*16,y0=y*16,w=st&&st.wob>0?Math.round(Math.sin(tm*40)*2)/2*2:0,c=hdDummy();shd(x0+8,y0+15,14);
 const cut=36;g.drawImage(c,0,0,c.width,cut,x0-1+w,y0+15.5-25,18,cut/2);g.drawImage(c,0,cut,c.width,c.height-cut,x0-1,y0+15.5-25+cut/2,18,(c.height-cut)/2)};
