// ---------------------------------------------------------------- 36. Skill trees (Magic first)
// Tap a skill on the Skills screen to open its tree: every level lists what it gives, and every 10 levels (plus 99)
// you choose one of two perks. Magic is the first skill with a full tree; the others show "coming soon".
// Choices are kept in PERKS[skill][level] = 'a' | 'b'; they can be reset for gold at any time.
let PERKS={},SKVIEW=-1,AVCNT=0,PHX_DAY=-1,ULTBOOST=false;
const perk=(sk,id)=>{const P2=PERKS[sk];if(!P2)return false;const T=TREES[sk];if(!T)return false;for(const lv in P2){const c=T.choices[lv];if(c&&(c[{a:0,b:1,c:2}[P2[lv]]]||{}).id===id&&lvOf(sk)>=+lv)return true}return false};
const TREES={};
TREES[ML]={
 every:l=>l===1?null:'+1% mana regeneration',
 extra:{1:'Use the Fire wand',5:'Wear the Wizard hat',8:'Wear Wizard leggings',10:'Use the Ice wand · wear the Wizard robe',20:'Use the Storm wand',25:'Ultimates recharge 2s faster',35:'Spells fly 10% further',55:'Ultimates recharge 2s faster',65:'+2 max mana',85:'Spells fly 10% further',95:'+3 max mana'},
 step:l=>{const a=[];if(l%5===0)a.push('+1 max mana');if(l%15===0)a.push('+1 spell damage');return a},
 choices:{
  10:[{id:'reservoir',n:'Arcane Reservoir',d:'+5 max mana.'},{id:'swift',n:'Swift Casting',d:'Cast 30% faster. Spells fly 25% faster and further.'}],
  20:[{id:'kindle',n:'Kindling',d:'Fire spells set enemies burning twice as long.'},{id:'deepfreeze',n:'Deep Freeze',d:'Ice spells have a 30% chance to freeze an enemy solid for 1.5s.'}],
  30:[{id:'siphon',n:'Mana Siphon',d:'Defeating an enemy with a spell gives back 2 mana.'},{id:'overcharge',n:'Overcharge',d:'Spells cost 1 more mana but deal +2 damage.'}],
  40:[{id:'chain',n:'Chain Spells',d:'Every spell arcs to a nearby enemy for half damage. Storm spells arc one extra time.'},{id:'twin',n:'Twin Cast',d:'20% chance to fire a free second spell.'}],
  50:[{id:'ultfocus',n:'Ultimate Focus',d:'Ultimates recharge 8 seconds faster.'},{id:'ultpower',n:'Ultimate Power',d:'Ultimates deal 50% more damage.'}],
  60:[{id:'shield',n:'Mana Shield',d:'When something hits you, 4 mana absorbs the blow instead of your health (if you have it).'},{id:'recovery',n:'Arcane Recovery',d:'Mana comes back 50% faster.'}],
  70:[{id:'pierce',n:'Piercing Spells',d:'Spells pass through the first enemy they hit and keep going.'},{id:'splash',n:'Splash',d:'Spells burst on impact, also hitting enemies around the target for half damage.'}],
  80:[{id:'mastery',n:'Elemental Mastery',d:'Burning, slowing and freezing last twice as long.'},{id:'crit',n:'Spell Crit',d:'15% chance for a spell to deal double damage.'}],
  90:[{id:'archmage',n:'Archmage',d:'+10 max mana and +1 spell damage.'},{id:'cheapult',n:'Effortless Ultimates',d:'Ultimates cost 5 mana instead of 10.'}],
  99:[{id:'avatar',n:'Elemental Avatar',d:'Every 8th spell you cast also unleashes a free ultimate of your wand\'s element.'},{id:'phoenix',n:'Phoenix Ward',d:'Once a day, a fatal blow leaves you at full health and mana instead.'}]}};
function treeGains(sk,l){const T=TREES[sk];if(!T)return[];const a=[];if(T.extra[l])a.push(T.extra[l]);a.push(...T.step(l));const e=T.every(l);if(e)a.push(e);return a}
const pendingChoices=sk=>{const T=TREES[sk];if(!T)return 0;let n=0;for(const lv in T.choices)if(lvOf(sk)>=+lv&&!(PERKS[sk]&&PERKS[sk][lv]))n++;return n};
// --- Magic perks in play ---
function magicMPBonus(){const l=lvOf(ML);return(l>=65?2:0)+(l>=95?3:0)+(perk(ML,'reservoir')?5:0)+(perk(ML,'archmage')?10:0)}
const _sd36=spellDmg;spellDmg=function(el){let d=_sd36(el)+(perk(ML,'overcharge')?2:0)+(perk(ML,'archmage')?1:0);if(ULTBOOST&&perk(ML,'ultpower'))d=Math.ceil(d*1.5);return d};
const spellRange=()=>{const l=lvOf(ML);return 1+(l>=35?.1:0)+(l>=85?.1:0)};
const _cs36=castSpell;castSpell=function(first){const W0=WAND&&WSP[WAND],c0=W0?W0.cost:0,n0=SPELLS.length;if(W0&&perk(ML,'overcharge'))W0.cost=c0+1;let r;try{r=_cs36(first)}finally{if(W0)W0.cost=c0}
 if(SPELLS.length>n0){const s=SPELLS[SPELLS.length-1],sp=perk(ML,'swift')?1.25:1;s.vx*=sp;s.vy*=sp;s.life*=spellRange();if(perk(ML,'swift'))swing=Math.min(swing,.28);
  if(perk(ML,'crit')&&Math.random()<.15)s.crit=1;if(perk(ML,'pierce'))s.pierce=1;
  if(perk(ML,'twin')&&Math.random()<.2){const a=.18,c=Math.cos(a),sn=Math.sin(a);SPELLS.push({...s,vx:s.vx*c-s.vy*sn,vy:s.vx*sn+s.vy*c,crit:perk(ML,'crit')&&Math.random()<.15?1:0});part(P.x,P.y-6,0,-30,.4,'#ffffff',0,2)}
  if(perk(ML,'avatar')&&++AVCNT>=8){AVCNT=0;const cd=ULTCD,m=MANA;ULTCD=0;MANA=Math.max(MANA,ULT_COST);castUlt();ULTCD=cd;MANA=Math.min(maxMP(),m)}}
 return r};
const _sh36=spellHit;spellHit=function(s,n,dmg){if(s.crit){dmg*=2;DMGS.push({x:n.x,y:n.y-24,v:'CRIT',t:0,c:'#ff70a0',sc:s.sc})}
 const wasAlive=!n.dead;_sh36(s,n,dmg);
 const mult=perk(ML,'mastery')?2:1;if(s.el==='fire'&&n.burn>0)n.burn*=(perk(ML,'kindle')?2:1)*mult;if(s.el==='ice'&&n.slow>0)n.slow*=mult;
 if(s.el==='ice'&&perk(ML,'deepfreeze')&&Math.random()<.3)n.frozen=Math.max(n.frozen||0,1.5*mult);
 if(perk(ML,'siphon')&&wasAlive&&(n.dead||n.hp<=0))MANA=Math.min(maxMP(),MANA+2);
 if(s.sub)return;const near=(r,skip)=>en.filter(o=>o!==n&&!o.dead&&!skip.includes(o)&&Math.hypot(o.x-n.x,o.y-n.y)<r);
 if(perk(ML,'splash')){for(const o of near(26,[]))_sh36({...s,sub:1},o,Math.max(1,Math.ceil(dmg/2)));for(let k=0;k<10;k++){const a=k/10*6.283;part(n.x,n.y-6,Math.cos(a)*80,Math.sin(a)*60,.3,WSP[s.el].col,0)}}
 if(perk(ML,'chain')){s.arcs=(s.arcs||0)+1;const cap=s.el==='storm'?3:1;if(s.arcs<=cap){const hit=s.hitL||(s.hitL=[n]);const o=near(60,hit).sort((a,b)=>Math.hypot(a.x-n.x,a.y-n.y)-Math.hypot(b.x-n.x,b.y-n.y))[0];
   if(o){hit.push(o);const l=Math.hypot(o.x-n.x,o.y-n.y)||1;for(let k=0;k<l;k+=3)part(n.x+(o.x-n.x)*k/l,n.y-6+(o.y-n.y)*k/l,0,0,.18,k%2?'#fff':WSP[s.el].col,0);spellHit({...s,arcs:s.arcs,hitL:hit},o,Math.max(1,Math.ceil(dmg/2)))}}}
 if(s.pierce&&!s.pierced){const l=Math.hypot(s.vx,s.vy)||1;SPELLS.push({...s,x:n.x+s.vx/l*16,y:n.y-4+s.vy/l*16,pierced:1,dead:0,t:s.t})}};
const _ul36=castUlt;castUlt=function(){const cd0=ULTCD,cheap=perk(ML,'cheapult');let lent=0;if(cheap&&MANA>=5&&MANA<ULT_COST){lent=ULT_COST-MANA;MANA+=lent}
 ULTBOOST=true;try{_ul36()}finally{ULTBOOST=false}const fired=ULTCD>cd0&&ULTCD>=19;
 if(fired){const l=lvOf(ML);ULTCD-=(l>=25?2:0)+(l>=55?2:0)+(perk(ML,'ultfocus')?8:0);if(cheap)MANA=Math.min(maxMP(),MANA+5-lent)}else if(lent)MANA-=lent};
// regen bonus, mana shield and the phoenix ward
const _u36=upd;upd=function(dt){const hp0=P.hp,was=dead,t0=time,m0=MANA;_u36(dt);if(menuOpen||pnOpen)return;
 if(!dead&&MANA<maxMP()){const ex=.01*(lvOf(ML)-1)+(perk(ML,'recovery')?.5:0);MANA=Math.min(maxMP(),MANA+dt*.5*(1+.4*nCls('m'))*ex)}
 if(perk(ML,'shield')&&P.hp<hp0&&m0>=4){P.hp=hp0;MANA=Math.max(0,MANA-4);if(dead&&!was){dead=false;time=t0}drops.push({x:P.x,y:P.y-22,t:0,tx:'Mana Shield',c:'#b080ff'});for(let k=0;k<14;k++){const a=k/14*6.283;part(P.x+Math.cos(a)*10,P.y-6+Math.sin(a)*9,Math.cos(a)*30,Math.sin(a)*30,.35,'#c8a8ff',0)}}
 if(dead&&!was&&perk(ML,'phoenix')&&PHX_DAY!==today()){PHX_DAY=today();dead=false;time=t0;P.hp=6;MANA=maxMP();hurt=1.6;FLASH=.6;say('PHOENIX WARD! You rise from the flames.');msgT=4;sfx('quest');
  for(let k=0;k<40;k++){const a=k/40*6.283;part(P.x,P.y-6,Math.cos(a)*110,Math.sin(a)*90-30,.7,k%2?'#f88830':'#f8e060',-40,2)}saveLocal(true)}};
// tell the player when a choice opens up
const _ax36=addXp;addXp=function(i,x){const b=lvOf(i);_ax36(i,x);const a=lvOf(i);if(a>b&&TREES[i]&&TREES[i].choices[a]&&!(PERKS[i]&&PERKS[i][a])){say(SKN[i]+' '+a+': a new perk to choose! Open Skills and tap '+SKN[i]+'.');msgT=5}};
// --- saving ---
const _sn36=snap;snap=function(){const s=_sn36();s.perks=PERKS;s.phx=PHX_DAY;return s};
const _ap36=applySave;applySave=function(S){_ap36(S);PERKS={};if(S.perks&&typeof S.perks==='object')for(const k in S.perks){const o=S.perks[k];if(!o||typeof o!=='object')continue;PERKS[k]={};for(const lv in o)if(o[lv]==='a'||o[lv]==='b'||o[lv]==='c')PERKS[k][lv]=o[lv]}PHX_DAY=isFinite(S.phx)?+S.phx:-1};
// --- the tree screen ---
const trst=document.createElement('style');trst.textContent=`
#pn .trh{display:flex;align-items:center;gap:8px;margin:2px 0 8px}#pn .trh img{width:28px;height:28px;image-rendering:pixelated}#pn .trh .tn{font-weight:700;font-size:17px}
#pn .trb{border:2px solid #c8d0e0;background:#fff;color:#404040;border-radius:8px;padding:6px 10px;font:700 13px var(--pf);cursor:pointer}
#pn .trx{height:8px;border-radius:4px;background:#dfe5f0;overflow:hidden;margin:4px 0 2px}#pn .trx i{display:block;height:100%}
#pn .trl{margin-top:8px;border-top:2px solid #e2e6ee}
#pn .trr{display:flex;gap:8px;padding:5px 4px;border-bottom:1px solid #eceff5;font-size:12px;color:#404040;align-items:flex-start}
#pn .trr .lv{flex:none;width:34px;font-weight:700;color:#8890a0}#pn .trr.got .lv{color:#2a8a3a}#pn .trr.cur{background:#fff6d8}#pn .trr.lock{opacity:.5}
#pn .trc{padding:8px 4px;border-bottom:2px solid #e2e6ee;background:#f6f3ff}#pn .trc.lock{opacity:.55}#pn .trc .ch{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}#pn .trc .ch.c3{grid-template-columns:1fr}
#pn .trc button{display:block;text-align:left;border:2px solid #c8c0e8;background:#fff;color:#404040;border-radius:8px;padding:7px;font:12px var(--pf);cursor:pointer;min-height:64px}
#pn .trc button b{display:block;font-size:13px;margin-bottom:2px}#pn .trc button.pick{border-color:#7a58d8;background:#ece4ff;box-shadow:0 0 0 2px #b8a0f8}#pn .trc button.no{opacity:.45}
#pn .trc .tt{font-weight:700;font-size:13px;color:#6a48c8}#pn .skc .bang{float:right;background:#e84848;color:#fff;border-radius:8px;padding:0 5px;font-size:10px;margin-left:4px}`;document.head.appendChild(trst);
function treeHTML(sk){const T=TREES[sk],l=lvOf(sk),x=Math.floor(XPS[sk]),b=XT[l-1],nx=l<99?XT[l]:b+1,pc=l<99?Math.min(100,(XPS[sk]-b)/(nx-b)*100):100;
 let h='<div class="trh"><button class="trb" data-tr="back">‹ Skills</button><img alt="" src="'+iconURL(SKICON[sk]||'wood')+'"><span class="tn" style="color:'+SKC[sk]+'">'+SKN[sk]+'</span><span style="margin-left:auto;font-weight:700">Level '+l+'</span></div>'
  +'<div class="trx"><i style="width:'+pc+'%;background:'+SKC[sk]+'"></i></div><div style="font-size:12px;color:#606878">'+x.toLocaleString()+' xp'+(l<99?' · '+(XT[l]-x).toLocaleString()+' to level '+(l+1):' · maxed!')+'</div>';
 if(!T)return h+'<div class="qc" style="margin-top:12px"><p>The '+SKN[sk]+' skill tree is coming soon. For now it works as before: training it makes you better at it.</p></div>';
 const pend=pendingChoices(sk);if(pend)h+='<div class="qc" style="margin-top:10px;background:#fff0f0"><p><b>'+pend+' perk'+(pend>1?'s':'')+' to choose!</b> Pick one of the two at each highlighted level.</p></div>';
 h+='<div class="trl">';for(let lv=1;lv<=99;lv++){const g2=treeGains(sk,lv),got=l>=lv,cur=l===lv,C=T.choices[lv];
  if(C){const pk=PERKS[sk]&&PERKS[sk][lv];h+='<div class="trc'+(got?'':' lock')+'" data-lvl="'+lv+'"><span class="tt">Level '+lv+' · choose one</span>'+(g2.length?'<div style="font-size:12px;color:#606878;margin-top:2px">Also: '+g2.join(' · ')+'</div>':'')+'<div class="ch'+(C.length>2?' c3':'')+'">';
   C.forEach((c,j)=>{const ab='abc'[j];h+='<button data-perk="'+sk+':'+lv+':'+ab+'" class="'+(pk===ab?'pick':pk?'no':'')+'"'+(got?'':' disabled')+'><b>'+(pk===ab?'✓ ':'')+c.n+'</b>'+c.d+'</button>'});h+='</div></div>'}
  else h+='<div class="trr'+(got?' got':' lock')+(cur?' cur':'')+'" data-lvl="'+lv+'"><span class="lv">'+lv+'</span><span>'+(g2.length?g2.join(' · '):'—')+'</span></div>'}
 h+='</div>';const any=PERKS[sk]&&Object.keys(PERKS[sk]).length;if(any)h+='<button class="ng" data-tr="reset" style="margin-top:12px">Reset '+SKN[sk]+' perks ('+respecCost(sk)+' gold)</button>';return h}
const respecCost=sk=>50*Object.keys(PERKS[sk]||{}).length;
const _r36=rPn;rPn=function(){if(!(ptab===0&&SKVIEW>=0&&pn.style.display!=='none'))return _r36();_r36();pbd.innerHTML=treeHTML(SKVIEW)};
// pending-choice badges on the skills grid
const _skh36=skillsHTML;skillsHTML=function(){let h=_skh36();h=h.replace('Tap a skill to see your XP.','Tap a skill to see its tree: what every level gives you, and perks to choose.');for(const sk in TREES){const n=pendingChoices(+sk);if(n)h=h.replace('data-sk="'+sk+'"><span class="t">','data-sk="'+sk+'"><span class="t"><span class="bang">'+n+'</span>')}return h};
function openTree(sk){SKVIEW=sk;if(typeof RKEY!=='undefined')RKEY=null;rPn();const row=pbd.querySelector('[data-lvl="'+Math.min(99,lvOf(sk))+'"]'),pend=pbd.querySelector('.trc:not(.lock) button:not(.pick):not(.no)');
 const tgt=pend?pend.closest('.trc'):row;if(tgt){pn.scrollTop=Math.max(0,tgt.offsetTop-pn.clientHeight*.35)}else pn.scrollTop=0}
const _oc36=pbd.onclick;pbd.onclick=e=>{const sk=e.target.closest('.skc');if(sk&&SKVIEW<0){SKSEL=+sk.dataset.sk;openTree(SKSEL);return}
 const tb=e.target.closest('[data-tr]');if(tb&&SKVIEW>=0){if(tb.dataset.tr==='back'){SKVIEW=-1;if(typeof RKEY!=='undefined')RKEY=null;rPn();pn.scrollTop=0;return}
  if(tb.dataset.tr==='reset'){const c=respecCost(SKVIEW);if(GLD<c){say('You need '+c+' gold to reset these perks.');return}GLD-=c;PERKS[SKVIEW]={};say(SKN[SKVIEW]+' perks reset. Choose again!');sfx('quest');saveNow();rPn();return}}
 const pb=e.target.closest('[data-perk]');if(pb&&!pb.disabled){const[s2,lv,ab]=pb.dataset.perk.split(':');if(lvOf(+s2)<+lv)return;PERKS[s2]=PERKS[s2]||{};if(PERKS[s2][lv]&&PERKS[s2][lv]!==ab){say('Already chosen. Reset your perks (bottom of this page) to change it.');return}
  if(PERKS[s2][lv]===ab)return;PERKS[s2][lv]=ab;const c=TREES[s2].choices[lv][{a:0,b:1,c:2}[ab]];if(!c)return;say('Learned '+c.n+'!');sfx('quest');saveNow();rPn();return}
 _oc36(e)};
const _bs36=backScreen;backScreen=function(){if(SKVIEW>=0&&ptab===0){SKVIEW=-1;if(typeof RKEY!=='undefined')RKEY=null;rPn();pn.scrollTop=0;return}_bs36()};
const _cp36=closePanel;closePanel=function(){SKVIEW=-1;_cp36()};
