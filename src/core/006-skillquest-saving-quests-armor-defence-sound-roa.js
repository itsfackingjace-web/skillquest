// ===== SkillQuest: saving, quests, armor + Defence, sound, roaming NPCs =====
SKN.push('Defence');AB.push('DEF');SKC.push('#7aa0e0');while(XPS.length<SKN.length)XPS.push(0);
let ARM={helm:0,body:0,legs:0},Q={i:0,on:false,k:0,qp:0},REM=[],CLK=0,MUTE=false,lastK=kills,cloud=null,cloudBusy=false,lastLocal='',lastCloud='',saveT=0,cloudT=0,cloudOk=-9,LOCAL_AT=0,ngArm=false;
const AT=['Leather','Iron','Steel'],OHP={tree:3,rock:4,bush:1},LS='sq_save';
const GOODS=[{k:'bowl',n:'Wooden bowl',c:{wood:2},req:1,xp:25,v:5},{k:'jam',n:'Berry jam',c:{berry:3,wood:1},req:3,xp:35,v:9},{k:'brick',n:'Stone brick',c:{stone:2},req:5,xp:45,v:10},{k:'statue',n:'Stone statue',c:{stone:6,wood:2},req:10,xp:110,v:32},{k:'nails',n:'Iron nails',c:{iron:1,wood:1},req:15,xp:90,v:24},{k:'lantern',n:'Iron lantern',c:{iron:2,wood:2},req:20,xp:180,v:55}];
const INVK=['wood','stone','berry','meat','cooked','iron',...GOODS.map(g=>g.k)];
for(const g of GOODS){SELLP[g.k]=g.v;SN[g.k]=g.n+'s'}
function makeGood(i,all){const r=GOODS[i];if(!r)return;if(sqDo('craft',all?999:1,()=>makeGood(i,false)))return;if(lvOf(6)<r.req){say('Need Crafting '+r.req);return}let n=0;const mx=all?999:1;
 while(n<mx&&Object.entries(r.c).every(([a,b])=>(inv[a]|0)>=b)){for(const a in r.c)inv[a]-=r.c[a];inv[r.k]=(inv[r.k]|0)+1;n++}
 if(!n){say('Missing materials');return}addXp(6,r.xp*n);say('Made '+n+' '+r.n+(n>1?'s':''));sfx('pickup');saveLocal(true);rPn()}
function goodsHTML(){let h='<div class="tl" style="margin-top:18px">Goods</div><div class="tl" style="font-size:11px;font-weight:400;opacity:.65;margin-top:-6px">Repeatable. Trains Crafting. Sell them at the general store.</div>';
 GOODS.forEach((r,i)=>{const can=lvOf(6)>=r.req&&Object.entries(r.c).every(([a,b])=>(inv[a]|0)>=b);h+='<div class="gr" style="opacity:'+(can?1:.5)+'"><div class="gi"><b>'+r.n+'</b> <small>(have '+(inv[r.k]|0)+')</small><br><small>'+Object.entries(r.c).map(([a,b])=>b+' '+a).join(', ')+' · Crafting '+r.req+' · '+r.xp+' xp · sells '+r.v+'g</small></div><button class="gc" data-i="'+i+'" data-a="1">Make</button><button class="gc" data-i="'+i+'" data-a="all">All</button></div>'});return h}
// --- armor visuals (extra palette slots; creator keeps its own swatches) ---
RD.forEach(r=>{if(Array.isArray(r[3]))r[3]=r[3].slice()});
const AC3=['#9a6438','#b8c0c8','#6c84b0'],HB=OPT.hatc.length,SB=OPT.shirt.length,PB=OPT.pants.length;
OPT.hatc.push(...AC3);OPT.shirt.push(...AC3);OPT.pants.push(...AC3.map(c=>sh2(c,.85)));
const armorPts=()=>ARM.helm+ARM.body+ARM.legs,blockCh=()=>Math.min(typeof blockCap==='function'?blockCap():.6,armorPts()*.05+lvOf(8)*.004+(typeof blockBonus==='function'?blockBonus():0));
function gearCH(){const c={...CH};if(ARM.helm){c.ht=2;c.hcol=HB+ARM.helm-1}if(ARM.body)c.sh=SB+ARM.body-1;if(ARM.legs)c.pn=PB+ARM.legs-1;return c}
const _pP5=pP;pP=function(tm){const c0=CH;CH=gearCH();try{_pP5(tm)}finally{CH=c0}};
// --- sound (WebAudio chiptune) ---
let ACX=null;
function ac(){if(!ACX){try{ACX=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}try{if(ACX.state=='suspended')ACX.resume()}catch(e){}return ACX}
addEventListener('touchstart',()=>ac(),{capture:true,passive:true});addEventListener('pointerdown',()=>ac(),{capture:true});
function tone(f,d,type,v,slide,delay){const a=ac();if(!a||MUTE)return;const t=a.currentTime+(delay||0),o=a.createOscillator(),gn=a.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d);gn.gain.setValueAtTime(v||.06,t);gn.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(gn);gn.connect(a.destination);o.start(t);o.stop(t+d+.02)}
function noise(d,v,fq,delay){const a=ac();if(!a||MUTE)return;const t=a.currentTime+(delay||0),b=a.createBuffer(1,Math.max(1,Math.floor(a.sampleRate*d)),a.sampleRate),c=b.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=(Math.random()*2-1)*(1-i/c.length);const s=a.createBufferSource(),f=a.createBiquadFilter(),gn=a.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=fq||1000;gn.gain.value=v||.1;s.connect(f);f.connect(gn);gn.connect(a.destination);s.start(t)}
const SFX={swish:()=>noise(.08,.07,2500),chop:()=>{noise(.07,.22,420);tone(170,.06,'square',.05,-70)},mine:()=>{tone(1300,.05,'square',.04,-400);noise(.05,.14,3200)},rustle:()=>noise(.14,.1,1800),
 hit:()=>{tone(320,.08,'square',.07,-220);noise(.05,.12,1200)},hurt:()=>tone(240,.22,'sawtooth',.08,-160),block:()=>{tone(900,.05,'square',.05);tone(1500,.09,'triangle',.06,0,.04)},
 pickup:()=>{tone(660,.05,'square',.05);tone(990,.08,'square',.05,0,.05)},coin:()=>{tone(988,.06,'square',.05);tone(1319,.14,'square',.05,0,.06)},eat:()=>{noise(.05,.12,900);noise(.05,.12,700,.09)},
 sizzle:()=>noise(.45,.09,3500),fire:()=>noise(.4,.14,500),talk:()=>tone(520,.05,'square',.04),
 level:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.15,'square',.06,0,i*.1)),quest:()=>[392,523,659,784,659,784,1047].forEach((f,i)=>tone(f,.14,'square',.06,0,i*.09)),
 death:()=>[392,330,262,196].forEach((f,i)=>tone(f,.28,'triangle',.09,0,i*.22))};
function sfx(n){try{SFX[n]&&SFX[n]()}catch(e){}}
// --- quests ---
const QS=[
 {n:'Firewood',d:'The village is running low on firewood. Bring the Elder 10 wood.',type:'give',item:'wood',amt:10,r:{g:30,xp:[1,150]}},
 {n:'Slime Trouble',d:'Slimes have been creeping toward the village at night. Defeat 5 of them.',type:'kill',amt:5,r:{g:50,arm:['helm',1]}},
 {n:'Hearth & Home',d:'Show you can feed yourself. Cook 3 meat at a campfire.',type:'cook',amt:3,r:{g:40,xp:[4,200]}},
 {n:'Stone Mason',d:'The well needs repairs. Bring 15 stone.',type:'give',item:'stone',amt:15,r:{g:60,xp:[2,250]}},
 {n:'Night Watch',d:'Prove your grit: survive until Day 2 without falling.',type:'day',amt:2,r:{g:80,arm:['body',1]}},
 {n:'Iron Will',d:'The blacksmith needs ore. Bring 5 iron ore.',type:'give',item:'iron',amt:5,r:{g:150,xp:[6,500]}},
 {n:'Slime Slayer',d:'Thin out the slime hordes for good. Defeat 25 slimes.',type:'kill',amt:25,r:{g:200,arm:['legs',2]}},
 {n:'Grandmaster',d:'Become a true master of many skills. Reach total level 60.',type:'total',amt:60,r:{g:500,xp:[7,2000]}}];
const lvTot=()=>XPS.reduce((s,_,i)=>s+lvOf(i),0);
function qVal(q){return q.type=='give'?(inv[q.item]|0):q.type=='kill'||q.type=='cook'?Q.k:q.type=='day'?1+Math.floor(time/DAYLEN):lvTot()}
const qDone=q=>qVal(q)>=q.amt,qProg=q=>Math.min(qVal(q),q.amt)+'/'+q.amt;
function rewardTxt(q){const r=q.r,a=[r.g+' gold'];if(r.xp)a.push(r.xp[1]+' '+SKN[r.xp[0]]+' XP');if(r.arm)a.push(AT[r.arm[1]-1]+' '+{helm:'helmet',body:'chestplate',legs:'legs'}[r.arm[0]]);return a.join(' · ')}
NPCS.push({kind:'elder',x:(VX-3)*16+8,y:(VY+1)*16+8,ch:{sk:0,hs:2,hc:6,sh:5,pn:2,ht:0,hcol:0,so:3}});
function rQuest(){const q=QS[Q.i];let h='<div class="tl">Elder Rowan</div><div class="tl" style="font-size:12px;font-weight:400;opacity:.75">Quest points: '+Q.qp+' / '+QS.length+'</div>';
 if(!q)h+='<div class="qc"><p>"You have done all I could ask, hero. Hollow Village is safe thanks to you."</p></div>';
 else{h+='<div class="qc"><b>'+q.n+'</b><p>'+q.d+'</p><p class="qr">Reward: '+rewardTxt(q)+'</p>';
  if(!Q.on)h+='<button class="qb" data-a="acc">Accept quest</button>';
  else h+='<p>Progress: '+qProg(q)+'</p>'+(qDone(q)?'<button class="qb" data-a="done">Complete quest</button>':'<p style="opacity:.7">"Come back when it is done."</p>');
  h+='</div>'}
 pbd.innerHTML=h}
function questAct(a){const q=QS[Q.i];if(!q)return;
 if(a=='acc'&&!Q.on){Q.on=true;Q.k=0;sfx('talk');say('Quest started: '+q.n)}
 else if(a=='done'&&Q.on&&qDone(q)){if(q.type=='give')inv[q.item]-=q.amt;GLD+=q.r.g;if(q.r.xp)addXp(q.r.xp[0],q.r.xp[1]);if(q.r.arm){const[sl,t]=q.r.arm;ARM[sl]=Math.max(ARM[sl],t)}
  Q.i++;Q.on=false;Q.k=0;Q.qp++;sfx('quest');say('Quest complete: '+q.n+'!');msgT=4;saveLocal(true);saveCloud()}
 rPn()}
const _r5=rPn;rPn=function(){if(ptab==2&&shop=='elder'){document.getElementById('t0').className='';document.getElementById('t1').className='';rQuest();return}_r5();if(ptab==1)pbd.insertAdjacentHTML('beforeend',goodsHTML())};
const _oc5=pbd.onclick;pbd.onclick=e=>{const gc=e.target.closest('.gc');if(gc){makeGood(+gc.dataset.i,gc.dataset.a=='all');return}const q=e.target.closest('.qb');if(q){questAct(q.dataset.a);return}
 if(e.target.closest('#ngb')){if(ngArm){ngArm=false;newGame()}else{ngArm=true;rPn();setTimeout(()=>{ngArm=false},4000)}return}_oc5(e)};
const st6=document.createElement('style');st6.textContent='.gr{display:flex;align-items:center;gap:6px;margin:8px 0;padding:8px 10px;border:2px solid rgba(244,240,216,.35);border-radius:8px;background:#161d30}.gi{flex:1;font-size:13px;line-height:1.4}.gi small{opacity:.75;font-size:11px}.gc,.fg{flex:none;padding:10px 8px;border-radius:8px;border:2px solid #f4f0d8;background:#2a6a22;color:#fff;font:700 12px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace}.qc{border:2px solid rgba(244,240,216,.35);border-radius:8px;padding:10px 12px;background:#161d30;line-height:1.45}.qc b{color:#f8d848}.qc p{margin:6px 0;font-size:13px}.qr{color:#a8e090}.qb{display:block;width:100%;margin:10px 0 2px;padding:12px;border-radius:8px;border:2px solid #f4f0d8;background:#c89020;color:#fff;font:700 14px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace}.ng{display:block;width:100%;margin:16px 0 4px;padding:10px;border-radius:8px;border:2px solid #d84838;background:transparent;color:#f08070;font:700 13px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace}#mb{position:fixed;z-index:10;right:14px;top:calc(env(safe-area-inset-top,0px) + 190px);width:44px;height:44px;border-radius:10px;border:2px solid rgba(244,240,216,.6);background:rgba(244,240,216,.18);font-size:20px;color:#fff}';document.head.appendChild(st6);
const mb=document.createElement('button');mb.id='mb';mb.textContent='🔊';document.body.appendChild(mb);
mb.onclick=()=>{MUTE=!MUTE;mb.textContent=MUTE?'🔇':'🔊';if(!MUTE)sfx('talk');saveLocal(true)};
tk.addEventListener('touchstart',()=>sfx('talk'),{passive:true});
// --- roaming NPCs ---
function roamNPCs(dt){for(const n of NPCS){if(n.scene||SCENE)continue;if(n.hx==null){n.hx=n.x;n.hy=n.y;n.tx=n.x;n.ty=n.y;n.wt=Math.random()*2;n.ph=0;n.dir=0;n.st=0}
 const px=P.x-n.x,py=P.y-n.y;
 if(!dead&&Math.hypot(px,py)<36){n.st=0;if(Math.abs(px)>Math.abs(py)){n.dir=2;n.fl=px<0}else{n.dir=py<0?1:0;n.fl=false}n.tx=n.x;n.ty=n.y;continue}
 const dx=n.tx-n.x,dy=n.ty-n.y,d=Math.hypot(dx,dy);
 if(d<.8){n.st=0;if((n.wt-=dt)<=0){const a=Math.random()*6.283,r=6+Math.random()*26;n.tx=n.hx+Math.cos(a)*r;n.ty=n.hy+Math.sin(a)*r;n.wt=1.5+Math.random()*3.5}continue}
 const s=Math.min(d,20*dt),nx=n.x+dx/d*s,ny=n.y+dy/d*s;
 if(solid(nx-5,ny+2)||solid(nx+5,ny+2)||solid(nx-5,ny+6)||solid(nx+5,ny+6)){n.tx=n.x;n.ty=n.y;continue}
 n.x=nx;n.y=ny;if(Math.abs(dx)>Math.abs(dy)){n.dir=2;n.fl=dx<0}else{n.dir=dy<0?1:0;n.fl=false}
 n.ph+=dt*7;n.st=[1,0,2,0][Math.floor(n.ph)%4]}}
// --- action wrappers: sounds, quest counters, world tracking ---
const _atk5=attack;attack=function(){if(swing>0||dead||menuOpen||pnOpen)return;
 const[fx,fy]=front(13),tx=Math.floor(fx/T),ty=Math.floor(fy/T),okk=tx>=0&&ty>=0&&tx<N&&ty<N,ti=ty*N+tx,o=okk?obj[ti]:null,oh=o?o.hp:0,eh=en.reduce((a,n)=>a+n.hp,0);
 _atk5();
 if(en.reduce((a,n)=>a+n.hp,0)<eh)sfx('hit');else if(o&&o.hp<oh)sfx(o.t=='tree'?'chop':o.t=='rock'?'mine':'rustle');else sfx('swish');
 if(o&&okk&&!obj[ti]){REM.push({i:ti,t:o.t,at:CLK});setTimeout(()=>sfx('pickup'),90)}};
const _eat5=eat;eat=function(){if(dead)return;const c0=inv.cooked||0,h0=hunger;_eat5();if((inv.cooked||0)>c0){sfx('sizzle');if(Q.on&&QS[Q.i]&&QS[Q.i].type=='cook')Q.k++}else if(hunger>h0)sfx('eat')};
const _fi5=fire;fire=function(){const n0=fires.length;_fi5();if(fires.length>n0)sfx('fire')};
const _ax5=addXp;addXp=function(i,x){const b=lvOf(i);_ax5(i,x);if(lvOf(i)>b)sfx('level')};
const _sa5=shopAct;shopAct=function(a){const g0=GLD;_sa5(a);if(GLD!==g0)sfx('coin');saveLocal(true)};
const SPX=VX*16+8,SPY=(VY+2)*16+8;
const _rs5=reset;reset=function(){_rs5();P.x=SPX;P.y=SPY;inv.cooked=0;inv.iron=0;lastK=kills;saveLocal(true);saveCloud()};
// --- update loop additions ---
const _u5=upd;upd=function(dt){
 const paused=menuOpen||pnOpen,wasDead=dead,hp0=P.hp;
 if(!paused&&!dead&&hurt<=0&&!(ROLLT>0)&&en.some(n=>!n.dead&&!(n.frozen>0)&&Math.hypot(P.x-n.x,P.y-n.y)<10)&&Math.random()<blockCh()){hurt=.6;say('Blocked!');sfx('block');addXp(8,10)}
 _u5(dt);
 if(paused)return;
 CLK+=dt;
 if(P.hp<hp0){sfx('hurt');if(hurt>.9)addXp(8,6)}
 if(!wasDead&&dead)sfx('death');
 if(kills>lastK){const d=kills-lastK;if(Q.on&&QS[Q.i]&&QS[Q.i].type=='kill'&&!QS[Q.i].item)Q.k+=d;addXp(8,8*d)}lastK=kills;
 for(let j=REM.length-1;j>=0;j--){const r=REM[j];if(obj[r.i]){REM.splice(j,1);continue}if(CLK-r.at>240){const x=r.i%N,y=(r.i/N)|0;if(Math.hypot(P.x-(x*16+8),P.y-(y*16+8))>40){obj[r.i]={t:r.t,hp:OHP[r.t]};REM.splice(j,1)}}}
 roamNPCs(dt);
 if(!dead){if((saveT+=dt)>3){saveT=0;saveLocal()}if((cloudT+=dt)>15){cloudT=0;saveCloud()}}};
// --- drawing: quest marker + HUD ---
const _nd5=NEWDRAW;NEWDRAW=function(...a){_nd5(...a);const tm=a[8],q=QS[Q.i];if(!q)return;
 for(const n of NPCS){if(n.kind!='elder')continue;const mk=!Q.on?'!':qDone(q)?'?':'';if(!mk)continue;const bx=Math.round(n.x),by=Math.round(n.y-30+Math.sin(tm*4)*1.5);
  g.save();g.font='700 11px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace';g.textAlign='center';g.textBaseline='alphabetic';g.lineWidth=3;g.lineJoin='round';g.strokeStyle=O;g.strokeText(mk,bx,by);g.fillStyle='#f8d848';g.fillText(mk,bx,by);g.restore()}};
// (quest tracker and save indicator are drawn by drawHUD in section 10)
// --- saving ---
function snap(){return{v:1,ch:{...CH},xp:XPS.slice(),tl:{...TL},gold:GLD,arm:{...ARM},q:{...Q},
 inv:Object.fromEntries(INVK.map(k=>[k,inv[k]|0])),
 p:{x:Math.round(P.x),y:Math.round(P.y),hp:P.hp},hunger:Math.round(hunger),time:Math.round(time),kills,
 fires:fires.map(f=>({x:Math.round(f.x),y:Math.round(f.y),life:Math.round(f.life)})),rm:REM.map(r=>({i:r.i,t:r.t,at:Math.round(r.at)})),clk:Math.round(CLK),mute:MUTE}}
const keyOf=s=>{const o={...s};for(const k of['time','clk','hunger','mp','savedAt','wid','dev','bw','as'])delete o[k];o.p=s.p?[s.p.x>>4,s.p.y>>4,s.p.hp]:0;o.fires=(s.fires||[]).length;return JSON.stringify(o)};
function saveLocal(force){if(dead)return;const s=snap(),k=keyOf(s);if(k===lastLocal&&!force)return;lastLocal=k;s.savedAt=Date.now();LOCAL_AT=s.savedAt;try{localStorage.setItem(LS,JSON.stringify(s))}catch(e){}}
async function saveCloud(force){if(!cloud||cloudBusy||dead)return;const s=snap(),k=keyOf(s);if(k===lastCloud&&!force)return;cloudBusy=true;s.savedAt=Date.now();
 try{await cloud.set(s);lastCloud=k;cloudOk=performance.now()/1000}catch(e){const c=e&&e.code;if(c=='invalid_argument'||c=='revoked'||c=='not_granted'||c=='capability_disabled'||c=='capability_removed')cloud=null}finally{cloudBusy=false}}
function applySave(S){
 if(S.ch)for(const k in LIM)if(S.ch[k]>=0&&S.ch[k]<LIM[k])CH[k]=S.ch[k]|0;
 if(Array.isArray(S.xp))for(let i=0;i<XPS.length;i++)XPS[i]=Math.max(0,+S.xp[i]||0);
 if(S.tl)for(const k in TL)TL[k]=Math.max(0,Math.min(3,+S.tl[k]||0));
 if(S.arm)for(const k in ARM)ARM[k]=Math.max(0,Math.min(3,+S.arm[k]||0));
 GLD=Math.max(0,+S.gold||0);
 if(S.q){Q.i=Math.max(0,Math.min(QS.length,+S.q.i||0));Q.on=!!S.q.on;Q.k=Math.max(0,+S.q.k||0);Q.qp=Math.max(0,+S.q.qp||0)}
 if(S.inv)for(const k of INVK)inv[k]=Math.max(0,+S.inv[k]||0);
 for(const r of REM)if(!obj[r.i])obj[r.i]={t:r.t,hp:OHP[r.t]};REM=[];
 for(const r of(S.rm||[])){const i=r.i|0;if(i>=0&&i<N*N&&OHP[r.t]&&obj[i]&&obj[i].t==r.t){obj[i]=null;REM.push({i,t:r.t,at:+r.at||0})}}
 CLK=Math.max(0,+S.clk||0);time=Math.max(0,+S.time||0);hunger=Math.max(0,Math.min(100,+S.hunger||100));kills=Math.max(0,+S.kills||0);lastK=kills;
 fires=(S.fires||[]).filter(f=>isFinite(f.x)&&isFinite(f.y)&&f.life>0).map(f=>({x:+f.x,y:+f.y,life:+f.life}));
 if(S.p){const x=+S.p.x,y=+S.p.y;if(isFinite(x)&&isFinite(y)&&!(solid(x-5,y-3)||solid(x+5,y-3)||solid(x-5,y+6)||solid(x+5,y+6))){P.x=x;P.y=y}else{P.x=SPX;P.y=SPY}P.hp=Math.max(1,Math.min(6,+S.p.hp||6))}
 MUTE=!!S.mute;mb.textContent=MUTE?'🔇':'🔊';en=[];dead=false;svs();svg()}
function hideCreator(){menuOpen=false;cm.style.display='none'}
function newGame(){XPS.fill(0);for(const k in TL)TL[k]=0;for(const k in ARM)ARM[k]=0;GLD=0;Object.assign(Q,{i:0,on:false,k:0,qp:0});
 for(const r of REM)if(!obj[r.i])obj[r.i]={t:r.t,hp:OHP[r.t]};REM=[];CLK=0;
 try{['hw_sk','hw_g','hw_ch'].forEach(k=>localStorage.removeItem(k))}catch(e){}
 reset();time=0;hunger=100;saveLocal(true);saveCloud(true);
 pnOpen=false;pn.style.display='none';menuOpen=true;cm.style.display='flex';document.getElementById('cgo').textContent='START';build();rp()}
const _go=document.getElementById('cgo'),_goOld=_go.onclick;_go.onclick=()=>{_goOld();saveLocal(true);saveCloud(true)};
// load: this device first, then the account save (newer wins)
let hadLocal=false;
// the save is applied once, at the very end of the script, after every system is set up (see BOOT LOAD)
const BOOT_LOCAL=(()=>{try{const b=JSON.parse(localStorage.getItem(LS));return b&&b.v==1?b:null}catch(e){return null}})();if(BOOT_LOCAL){LOCAL_AT=+BOOT_LOCAL.savedAt||0;hadLocal=true}
let oldPlayer=false;try{oldPlayer=!!localStorage.getItem('hw_ch')}catch(e){}
if(hadLocal||oldPlayer)hideCreator();
if(hadLocal)say('Welcome back to SkillQuest!');
(async()=>{try{const C=window.claude;if(!C||!C.use)return;const[db,user]=await Promise.all([C.use('db'),C.use('user')]);if(!db||!user)return;
 const id=await user.id();if(!id)return;const ref=db.collection('data/users/'+id).doc('save');let sn;
 try{sn=await ref.get()}catch(e){if(e&&e.code=='unavailable'){await new Promise(r=>setTimeout(r,700+Math.random()*700));try{sn=await ref.get()}catch(e2){return}}else return}
 cloud=ref;
 if(sn&&sn.exists){const S=JSON.parse(JSON.stringify(sn.data()||{}));if(S.v==1&&(+S.savedAt||0)>LOCAL_AT+2000){applySave(S);hideCreator();say('Progress loaded from your account');saveLocal(true)}else saveCloud(true)}
 else if(hadLocal||!menuOpen)saveCloud(true);
}catch(e){}})();
addEventListener('pagehide',()=>saveHide());addEventListener('beforeunload',()=>saveHide());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState=='hidden')saveHide()});
