// ---------------------------------------------------------------- 37. Combat skill trees: Attack, Defence, Archery, Tactics
// Same format as Magic (section 36). Tactics also powers chess "insight": each level adds +1% chance that the
// best move is revealed (highlighted on the board) at the start of each of your turns.
TREES[0]={every:l=>(l===1?'1%':'+1%')+' chance of a heavy blow (+1 damage)',step:l=>l%15===0?['+1 melee damage']:[],
 extra:{25:'Swings 10% faster',55:'Swings 10% faster',95:'+1 melee damage'},
 choices:{10:[{id:'brawler',n:'Brawler',d:'+1 melee damage.'},{id:'quick',n:'Quick Hands',d:'Swing 20% faster.'}],
  20:[{id:'bloodthirst',n:'Bloodthirst',d:'Melee kills have a 15% chance to heal 1 heart.'},{id:'executioner',n:'Executioner',d:'+3 damage against enemies with 4 health or less.'}],
  30:[{id:'cleave',n:'Cleave',d:'Your swings also hit enemies around the target for half damage.'},{id:'heavy',n:'Heavy Blows',d:'Hits knock enemies twice as far, with a 20% chance to stun them for 1s.'}],
  40:[{id:'whirl',n:'Whirlwind',d:'Every 5th swing is a spin attack that hits every enemy around you.'},{id:'riposte',n:'Riposte',d:'After you block, your next swing deals double damage.'}],
  50:[{id:'berserk',n:'Berserker',d:'+1 damage for every heart you are missing.'},{id:'momentum',n:'Momentum',d:'Each hit within 2s of the last adds +1 damage (up to +3).'}],
  60:[{id:'crusher',n:'Giant Slayer',d:'+3 damage against bosses.'},{id:'reach',n:'Long Reach',d:'Your swings reach further: enemies a step beyond your sword are hit too.'}],
  70:[{id:'lifesteal',n:'Lifesteal',d:'Every hit has a 6% chance to heal 1 heart.'},{id:'bleed',n:'Rend',d:'Hits make enemies bleed: 1 damage a second for 3 seconds.'}],
  80:[{id:'deathblow',n:'Deathblow',d:'8% chance to instantly defeat any enemy that isn\'t a boss.'},{id:'twin',n:'Twin Strike',d:'Hits have a 20% chance to strike twice.'}],
  90:[{id:'weaponmaster',n:'Weapon Master',d:'+2 melee damage and swing 10% faster.'},{id:'laststand',n:'Last Stand',d:'At 1 heart, your hits deal triple damage.'}],
  99:[{id:'bladestorm',n:'Blade Storm',d:'Every 10th swing unleashes a storm of blades: double damage to every enemy around you.'},{id:'unstoppable',n:'Unstoppable',d:'Melee kills restore 1 heart (at most once every 8 seconds).'}]}};
TREES[8]={every:l=>(l===1?'0.4%':'+0.4%')+' block chance',step:()=>[],extra:{10:'Wear iron armor',20:'Wear steel armor',25:'+5% max block chance',75:'+5% max block chance'},
 choices:{10:[{id:'shieldwall',n:'Shield Wall',d:'+5% block chance.'},{id:'tough',n:'Toughness',d:'Hits that get through have a 20% chance to be shrugged off.'}],
  20:[{id:'thorns',n:'Thorns',d:'Blocking deals 2 damage to enemies next to you.'},{id:'recover',n:'Recovery',d:'Each block has a 15% chance to heal 1 heart.'}],
  30:[{id:'secondwind',n:'Second Wind',d:'Dropping to 1 heart heals you 2 hearts (once every 90 seconds).'},{id:'ironstomach',n:'Iron Stomach',d:'Food heals 1 extra heart.'}],
  40:[{id:'fortress',n:'Fortress',d:'+10% max block chance.'},{id:'evasion',n:'Evasion',d:'Dodge rolls carry you further and keep you untouchable longer.'}],
  50:[{id:'retaliate',n:'Retaliate',d:'After you block, your next attack deals +3 damage.'},{id:'unbreakable',n:'Unbreakable',d:'After taking a hit, you stay untouchable 60% longer.'}],
  60:[{id:'bastion',n:'Last Bastion',d:'At 1 heart, +25% block chance.'},{id:'secondskin',n:'Second Skin',d:'Hits have an extra 15% chance to be shrugged off.'}],
  70:[{id:'regen',n:'Regeneration',d:'Heal 1 heart every 40 seconds.'},{id:'armormaster',n:'Armor Mastery',d:'Each piece of armor gives +2% more block chance.'}],
  80:[{id:'shockwave',n:'Shockwave',d:'Blocking knocks every nearby enemy back.'},{id:'aegis',n:'Aegis',d:'Every 30 seconds, the next hit that gets through is fully absorbed.'}],
  90:[{id:'juggernaut',n:'Juggernaut',d:'+10% block chance and +10% max block chance.'},{id:'survivor',n:'Survivor',d:'A fatal blow leaves you at 1 heart instead (once every 3 minutes).'}],
  99:[{id:'invincible',n:'Invincible',d:'Every block makes you untouchable for 2 seconds.'},{id:'avenger',n:'Avenger',d:'Every block sends out a shockwave: 3 damage to all enemies around you.'}]}};
TREES[FL]={every:l=>l===1?null:'+1% chance an arrow isn\'t used up',step:l=>l%25===0?['+1 arrow damage']:[],
 extra:{1:'Make and use the Shortbow',15:'Make iron arrows',20:'Make and use the Longbow',35:'Arrows fly 10% faster',65:'+15 range',85:'Arrows fly 10% faster',95:'+1 arrow damage'},
 choices:{10:[{id:'longshot',n:'Long Shot',d:'+25 range.'},{id:'quickdraw',n:'Quick Draw',d:'Shoot 25% faster.'}],
  20:[{id:'multishot',n:'Multishot',d:'20% chance to fire two extra arrows in a spread.'},{id:'scavenger',n:'Scavenger',d:'+15% chance arrows aren\'t used up.'}],
  30:[{id:'pierce',n:'Piercing Arrows',d:'Arrows pass through the first enemy they hit.'},{id:'cripple',n:'Crippling Shot',d:'Arrows slow enemies for 2 seconds.'}],
  40:[{id:'headshot',n:'Headshot',d:'10% chance for triple damage.'},{id:'steady',n:'Steady Aim',d:'+1 arrow damage.'}],
  50:[{id:'volley',n:'Volley',d:'Every 6th shot fires a fan of 5 arrows.'},{id:'hunter',n:'Hunter',d:'+2 arrow damage against wolves, and wolves drop an extra pelt.'}],
  60:[{id:'explosive',n:'Blast Tips',d:'Iron arrows burst on impact, hitting enemies around the target for half damage.'},{id:'eagle',n:'Eagle Eye',d:'+40 range.'}],
  70:[{id:'poison',n:'Poison Arrows',d:'Arrows poison enemies: 1 damage a second for 4 seconds.'},{id:'ricochet',n:'Ricochet',d:'Arrows bounce to a second enemy for half damage.'}],
  80:[{id:'deadeye',n:'Deadeye',d:'20% chance for double damage.'},{id:'barrage',n:'Barrage',d:'25% chance to fire two extra arrows (stacks with Multishot).'}],
  90:[{id:'marksman',n:'Marksman',d:'+2 arrow damage and +20 range.'},{id:'quiver',n:'Endless Quiver',d:'Arrows are used up only half as often.'}],
  99:[{id:'phantom',n:'Phantom Arrow',d:'Every 5th shot also fires a ghost arrow that passes through every enemy.'},{id:'hail',n:'Hail of Arrows',d:'Every 10th shot rains arrows on every enemy in range (3 damage each).'}]}};
TREES[7]={every:l=>(l===1?'1% chance':'+1% chance')+' the best chess move is revealed each turn · +0.6% critical hit chance',step:()=>[],
 extra:{5:'Challenge Orla: Club player',15:'Challenge Orla: Expert',30:'Challenge Orla: Master'},
 choices:{10:[{id:'openingbook',n:'Opening Book',d:'+15% chance the best move is revealed.'},{id:'battletac',n:'Battle Tactician',d:'+5% critical hit chance.'}],
  20:[{id:'takeback',n:'Takeback',d:'Once per chess game, take back your last move.'},{id:'prize',n:'Prize Money',d:'Chess wins pay 50% more gold.'}],
  30:[{id:'flank',n:'Flanking',d:'Critical hits deal triple damage.'},{id:'patience',n:'Patience',d:'Chess draws pay as much as wins.'}],
  40:[{id:'gmeye',n:'Grandmaster\'s Eye',d:'+20% chance the best move is revealed.'},{id:'sucker',n:'Sucker Punch',d:'Your first hit on each enemy is always critical.'}],
  50:[{id:'studyhall',n:'Study Hall',d:'Chess losses give full XP.'},{id:'gambit',n:'Gambit',d:'Critical hits make enemies drop 3 gold.'}],
  60:[{id:'counter',n:'Counter-Attack',d:'After a dodge roll, your next hit is critical.'},{id:'pin',n:'Pin',d:'Critical hits freeze the enemy for 1 second.'}],
  70:[{id:'deepcalc',n:'Deep Calculation',d:'+10% reveal chance, and revealed moves are calculated deeper.'},{id:'focus',n:'Battle Focus',d:'+8% critical hit chance.'}],
  80:[{id:'tournament',n:'Tournament',d:'Wins against the Master pay double gold and XP.'},{id:'coupdegrace',n:'Coup de Grâce',d:'Critical hits on unhurt enemies deal x4 damage.'}],
  90:[{id:'checkstrike',n:'Checkmate Strike',d:'+10% critical hit chance, and crits deal triple damage.'},{id:'clairvoyance',n:'Clairvoyance',d:'+30% reveal chance, and Orla\'s best reply is shown too.'}],
  99:[{id:'mastermind',n:'Mastermind',d:'Critical hits also strike every enemy next to the target.'},{id:'grandstrat',n:'Grand Strategist',d:'+15% critical hit chance, and the best move is always revealed.'}]}};
// --- shared helpers ---
const isBoss=n=>n.type==='boss'||n.type==='bonelord'||n.big;
function hitE(n,dmg,col,how){if(n.dead||dmg<=0)return;n.hp-=dmg;DMGS.push({x:n.x,y:n.y-(isBoss(n)?30:14),v:String(dmg),t:0,c:col||'#ffffff',sc:curScene()});if(n.hp<=0)killEnemy(n,how||'melee')}
const healP=(k,why)=>{if(P.hp>=6)return;P.hp=Math.min(6,P.hp+k);drops.push({x:P.x,y:P.y-24,t:0,tx:'+'+k+' ♥ '+why,c:'#f05878'})};
// --- Attack ---
let SWN=0,MOMT=0,MOMN=0,RIPO=false,RETAL=false,UNSTOPT=0;
function meleeFlat(){return(lvOf(0)>=95?1:0)+(perk(0,'brawler')?1:0)+(perk(0,'weaponmaster')?2:0)}
function meleeBonus(){let b=meleeFlat();if(Math.random()<lvOf(0)/100)b++;if(perk(0,'berserk'))b+=Math.max(0,6-P.hp);if(perk(0,'momentum')&&MOMT>0)b+=MOMN;if(RETAL){b+=3;RETAL=false}return b}
const swingMul=()=>(lvOf(0)>=25?.9:1)*(lvOf(0)>=55?.9:1)*(perk(0,'quick')?.8:1)*(perk(0,'weaponmaster')?.9:1);
const _atk37=attack;attack=function(){const sw0=swing,hp0=new Map(en.map(n=>[n,n.hp])),np=PROJ.length,ns=SPELLS.length;_atk37();
 if(!(swing>sw0)||PROJ.length>np||SPELLS.length>ns)return;const D0=[...hp0.keys()].some(n=>n.hp<hp0.get(n));if(!D0&&typeof SKOF!=='undefined'){const[ox,oy]=frontObjTile(),fo=ox>=0&&oy>=0&&ox<N&&oy<N?obj[oy*N+ox]:null;if(fo&&SKOF[fo.t])return}swing*=swingMul();SWN++;
 const D=[...hp0.keys()].filter(n=>n.hp<hp0.get(n)),base=1+TL.sword+Math.floor(lvOf(0)/15)+meleeFlat();
 for(const n of D){const dealt=hp0.get(n)-n.hp,was=hp0.get(n)>0;let ex=0;n.tapped=1;
  if(perk(0,'executioner')&&hp0.get(n)<=4)ex+=3;if(perk(0,'crusher')&&isBoss(n))ex+=3;if(perk(0,'laststand')&&P.hp===1)ex+=dealt*2;if(RIPO)ex+=dealt;
  if(perk(0,'twin')&&Math.random()<.2){ex+=dealt;drops.push({x:n.x,y:n.y-22,t:0,tx:'x2',c:'#f8d848'})}if(perk(0,'deathblow')&&!isBoss(n)&&Math.random()<.08){ex+=999;drops.push({x:n.x,y:n.y-22,t:0,tx:'DEATHBLOW',c:'#ff5050'})}
  if(perk(0,'heavy')){n.kx*=2;n.ky*=2;if(Math.random()<.2)n.frozen=Math.max(n.frozen||0,1)}if(perk(0,'bleed'))n.bleed=3;if(perk(0,'lifesteal')&&Math.random()<.06)healP(1,'Lifesteal');
  if(ex>0&&!n.dead)hitE(n,ex,'#ffd060');
  if(was&&(n.dead||n.hp<=0)){if(perk(0,'bloodthirst')&&Math.random()<.15)healP(1,'Bloodthirst');if(perk(0,'unstoppable')&&UNSTOPT<=0){UNSTOPT=8;healP(1,'Unstoppable')}}}
 if(D.length){MOMN=MOMT>0?Math.min(3,MOMN+1):0;MOMT=2;RIPO=false}
 const around=(cx,cy,r,skip)=>en.filter(o=>!o.dead&&!skip.includes(o)&&Math.hypot(o.x-cx,o.y-cy)<r);
 if(perk(0,'cleave'))for(const n of D)for(const o of around(n.x,n.y,22,D))hitE(o,Math.max(1,Math.ceil((hp0.get(n)-n.hp)/2)||1),'#ffd060');
 if(perk(0,'reach')&&!D.length){const[fx,fy]=front(24);for(const o of around(fx,fy,14,[]))hitE(o,base,'#ffffff')}
 const spin=(r,dm,col)=>{for(const o of around(P.x,P.y,r,D))hitE(o,dm,col);for(let k=0;k<24;k++){const a=k/24*6.283;part(P.x+Math.cos(a)*r*.6,P.y-4+Math.sin(a)*r*.5,Math.cos(a)*100,Math.sin(a)*80,.3,k%2?'#ffffff':'#c8d8ff',0)}sfx('swish')};
 if(perk(0,'whirl')&&SWN%5===0){spin(28,base,'#c8e0ff');say('Whirlwind!')}
 if(perk(0,'bladestorm')&&SWN%10===0){spin(42,base*2,'#a0e8ff');say('BLADE STORM!');FLASH=.2}};
// --- Defence ---
function blockBonus(){return(perk(8,'shieldwall')?.05:0)+(perk(8,'juggernaut')?.1:0)+(perk(8,'armormaster')?armorPts()*.02:0)+(perk(8,'bastion')&&P.hp===1?.25:0)}
function blockCap(){return .6+(lvOf(8)>=25?.05:0)+(lvOf(8)>=75?.05:0)+(perk(8,'fortress')?.1:0)+(perk(8,'juggernaut')?.1:0)}
let SWDT=0,REGT=0,AEGT=0,SURVT=0;
function onBlock(){if(perk(0,'riposte'))RIPO=true;if(perk(8,'retaliate'))RETAL=true;const near=r=>en.filter(o=>!o.dead&&Math.hypot(o.x-P.x,o.y-P.y)<r);
 if(perk(8,'thorns'))for(const o of near(18))hitE(o,2,'#c8c8d8');if(perk(8,'recover')&&Math.random()<.15)healP(1,'Recovery');
 if(perk(8,'shockwave'))for(const o of near(36)){const dx=o.x-P.x,dy=o.y-P.y,l=Math.hypot(dx,dy)||1;o.kx=dx/l*7;o.ky=dy/l*7}
 if(perk(8,'invincible'))hurt=Math.max(hurt,2);
 if(perk(8,'avenger')){for(const o of near(32))hitE(o,3,'#b8c8ff');for(let k=0;k<20;k++){const a=k/20*6.283;part(P.x,P.y-4,Math.cos(a)*120,Math.sin(a)*90,.3,'#c8d8ff',0)}}}
const _sfx37=sfx;sfx=function(n){if(n==='block'&&!chessOpen)try{onBlock()}catch(e){}_sfx37(n)};
const _eat37=eat;eat=function(){const h0=P.hp;_eat37();if(perk(8,'ironstomach')&&P.hp>h0)P.hp=Math.min(6,P.hp+1)};
let NEXTCRIT=false;
const _roll37=roll;roll=function(){const r0=ROLLT;_roll37();if(ROLLT>r0){if(perk(8,'evasion'))ROLLT*=1.6;if(perk(7,'counter'))NEXTCRIT=true}};
// --- Archery ---
let SHOTN=0;
const _ad37=arrowDmg;arrowDmg=function(){return _ad37()+(lvOf(FL)>=95?1:0)+(perk(FL,'steady')?1:0)+(perk(FL,'marksman')?2:0)};
const _br37=bowRange;bowRange=function(){return _br37()+(lvOf(FL)>=65?15:0)+(perk(FL,'longshot')?25:0)+(perk(FL,'eagle')?40:0)+(perk(FL,'marksman')?20:0)};
function arrowsFired(n0){const L=PROJ.slice(n0).filter(p=>p.k==='arrow'&&!p.hostile&&!p.extra);if(!L.length)return;SHOTN++;const lv=lvOf(FL),sp=1+(lv>=35?.1:0)+(lv>=85?.1:0);
 if(perk(FL,'quickdraw'))swing*=.75;const save=Math.min(.9,(lv-1)/100+(perk(FL,'scavenger')?.15:0)+(perk(FL,'quiver')?.5:0));
 for(const p of L){p.vx*=sp;p.vy*=sp;p.life/=sp;if(Math.random()<save){if(p.iron)inv.iarrow=(inv.iarrow|0)+1;else inv.arrow=(inv.arrow|0)+1}
  if(perk(FL,'headshot')&&Math.random()<.1){p.dmg*=3;p.crit=1}else if(perk(FL,'deadeye')&&Math.random()<.2){p.dmg*=2;p.crit=1}}
 const p=L[0],fan=as=>{for(const a of as){const c=Math.cos(a),s=Math.sin(a);PROJ.push({...p,vx:p.vx*c-p.vy*s,vy:p.vx*s+p.vy*c,extra:1,crit:0,dmg:arrowDmg()})}};
 if(perk(FL,'multishot')&&Math.random()<.2)fan([-.2,.2]);if(perk(FL,'barrage')&&Math.random()<.25)fan([-.32,.32]);if(perk(FL,'volley')&&SHOTN%6===0){fan([-.4,-.2,.2,.4]);say('Volley!')}
 if(perk(FL,'phantom')&&SHOTN%5===0)PROJ.push({...p,extra:1,ghost:1,dmg:arrowDmg()});
 if(perk(FL,'hail')&&SHOTN%10===0){const tg=en.filter(n=>!n.dead&&Math.hypot(n.x-P.x,n.y-P.y)<bowRange());for(const n of tg){for(let k=0;k<6;k++)part(n.x+(Math.random()-.5)*16,n.y-40-Math.random()*20,0,240,.18,'#e0d0b0',0);hitE(n,3,'#e8d8a8','arrow')}say('Hail of arrows!')}}
const _sh37=shoot;shoot=function(){const n0=PROJ.length;_sh37();arrowsFired(n0)};
const _sa37=shootAim;shootAim=function(first){const n0=PROJ.length;_sa37(first);arrowsFired(n0)};
function arrowHit(p,n){if(p.crit)drops.push({x:n.x,y:n.y-26,t:0,tx:'CRIT',c:'#ff70a0'});const l=Math.hypot(p.vx,p.vy)||1;
 if((perk(FL,'pierce')&&!p.pierced)||p.ghost)PROJ.push({...p,x:n.x+p.vx/l*14,y:n.y-4+p.vy/l*14,dead:0,pierced:1,t:p.t});
 if(perk(FL,'cripple'))n.slow=Math.max(n.slow||0,2);if(perk(FL,'poison'))n.poison=4;
 if(perk(FL,'hunter')&&n.type==='wolf')hitE(n,2,'#ffffff','arrow');
 if(perk(FL,'explosive')&&p.iron){for(const o of en)if(o!==n&&!o.dead&&Math.hypot(o.x-n.x,o.y-n.y)<24)hitE(o,Math.ceil(p.dmg/2),'#f8a040','arrow');for(let k=0;k<12;k++){const a=k/12*6.283;part(n.x,n.y-6,Math.cos(a)*90,Math.sin(a)*70,.3,k%2?'#f88830':'#f8e060',0)}}
 if(perk(FL,'ricochet')&&!p.ric){let b=null,bd=72;for(const o of en){if(o===n||o.dead)continue;const d=Math.hypot(o.x-n.x,o.y-n.y);if(d<bd){bd=d;b=o}}
  if(b){const dx=b.x-n.x,dy=(b.y-4)-(n.y-4),d=Math.hypot(dx,dy)||1;PROJ.push({...p,x:n.x+dx/d*10,y:n.y-4+dy/d*10,vx:dx/d*270,vy:dy/d*270,t:0,life:1,dmg:Math.max(1,Math.ceil(p.dmg/2)),ric:1,extra:1,dead:0,crit:0,ghost:0,pierced:1})}}}
const _ed37=enemyDrop;enemyDrop=function(n){_ed37(n);if(n.type==='wolf'&&perk(FL,'hunter')){inv.pelt=(inv.pelt|0)+1}};
// --- Tactics: crits ---
function critCh(n){if(NEXTCRIT||(perk(7,'sucker')&&n&&!n.tapped))return 1;return lvOf(7)*.006+(perk(7,'battletac')?.05:0)+(perk(7,'focus')?.08:0)+(perk(7,'checkstrike')?.1:0)+(perk(7,'grandstrat')?.15:0)}
function critMul(n){if(perk(7,'coupdegrace')&&n&&n.mhp&&n.hp>=n.mhp)return 4;return perk(7,'flank')||perk(7,'checkstrike')?3:2}
function onCrit(n,d){NEXTCRIT=false;if(n)n.tapped=1;if(perk(7,'gambit')){GLD+=3;drops.push({x:n.x,y:n.y-26,t:0,tx:'+3 gold',c:'#f8d848'})}if(perk(7,'pin')&&n)n.frozen=Math.max(n.frozen||0,1);
 if(perk(7,'mastermind')&&n)for(const o of en)if(o!==n&&!o.dead&&Math.hypot(o.x-n.x,o.y-n.y)<22)hitE(o,d,'#ff70a0')}
// --- per-frame: momentum, damage over time, shrugging off hits, second wind, regeneration, survivor, arrow hits ---
const _u37=upd;upd=function(dt){const hp0=P.hp,was=dead,t0=time,paused=menuOpen||pnOpen,live=paused?[]:PROJ.filter(p=>p.k==='arrow'&&!p.hostile&&!p.dead),foes=en.slice();_u37(dt);if(paused)return;
 MOMT=Math.max(0,MOMT-dt);UNSTOPT=Math.max(0,UNSTOPT-dt);SWDT=Math.max(0,SWDT-dt);AEGT=Math.max(0,AEGT-dt);SURVT=Math.max(0,SURVT-dt);
 for(const n of en)if(n.mhp==null)n.mhp=n.hp;
 for(const p of live)if(p.dead){let n=null,bd=16;for(const o of foes){const d=Math.hypot(o.x-p.x,(o.y-4)-p.y);if(d<bd){bd=d;n=o}}if(n)arrowHit(p,n)}
 for(const n of en){if(n.dead||!(n.bleed>0||n.poison>0))continue;n.dotT=(n.dotT||0)+dt;if(n.bleed>0)n.bleed-=dt;if(n.poison>0)n.poison-=dt;if(n.dotT>=1){n.dotT-=1;hitE(n,1,n.poison>0?'#80e060':'#e04848',n.poison>0?'arrow':'melee')}}
 if(!dead&&P.hp<hp0){const shrug=(perk(8,'tough')?.2:0)+(perk(8,'secondskin')?.15:0);
  if(Math.random()<shrug){P.hp=hp0;drops.push({x:P.x,y:P.y-24,t:0,tx:'Shrugged off',c:'#c8d0e0'})}
  else if(perk(8,'aegis')&&AEGT<=0){AEGT=30;P.hp=hp0;drops.push({x:P.x,y:P.y-24,t:0,tx:'Aegis',c:'#f8d848'});for(let k=0;k<16;k++){const a=k/16*6.283;part(P.x+Math.cos(a)*11,P.y-6+Math.sin(a)*10,0,0,.4,'#f8e888',0)}}
  else if(perk(8,'unbreakable'))hurt*=1.6}
 if(!dead&&P.hp===1&&perk(8,'secondwind')&&SWDT<=0){SWDT=90;healP(2,'Second Wind')}
 if(!dead&&perk(8,'regen')&&P.hp<6){REGT+=dt;if(REGT>=40){REGT=0;healP(1,'Regeneration')}}else REGT=0;
 if(dead&&!was&&perk(8,'survivor')&&SURVT<=0){SURVT=180;dead=false;time=t0;P.hp=1;hurt=1.5;say('Survivor! You cling on with 1 heart.');msgT=3;sfx('block')}};
// --- Tactics: chess insight, takeback and prize perks ---
function hintCh(){if(perk(7,'grandstrat'))return 1;return Math.min(1,lvOf(7)/100+(perk(7,'openingbook')?.15:0)+(perk(7,'gmeye')?.2:0)+(perk(7,'deepcalc')?.1:0)+(perk(7,'clairvoyance')?.3:0))}
function chessInsight(){const G=CG;if(!G||G.over||G.busy||G.st.turn!=='w'||G.hintPly===G.st.ply)return;G.hintPly=G.st.ply;G.hint=null;G.reply=null;
 if(Math.random()>=hintCh())return;const ply=G.st.ply;setTimeout(()=>{if(!CG||CG!==G||G.over||G.st.ply!==ply)return;const deep=perk(7,'deepcalc');const m=CE.best(G.st,{depth:deep?3:2,noise:0});if(!m)return;G.hint=m;
  if(perk(7,'clairvoyance'))G.reply=CE.best(CE.make(G.st,m),{depth:2,noise:0});chst.textContent='Insight! Your Tactics reveal the best move.'+(G.reply?' Orla\'s reply is marked in red.':'');sfx('coin');drawBoard()},40)}
const _db37=drawBoard;drawBoard=function(){_db37();const G=CG;if(!G)return;chessInsight();if(G.over||G.st.turn!=='w')return;const g2=cx9,box=(sq,c)=>{const x=(sq&7)*16,y=(sq>>3)*16;g2.fillStyle=c;g2.fillRect(x,y,16,2);g2.fillRect(x,y+14,16,2);g2.fillRect(x,y,2,16);g2.fillRect(x+14,y,2,16)};
 if(G.hint&&G.hintPly===G.st.ply){box(G.hint.f,'rgba(60,220,90,.95)');box(G.hint.t,'rgba(60,220,90,.95)');const x=(G.hint.t&7)*16,y=(G.hint.t>>3)*16;g2.fillStyle='rgba(60,220,90,.35)';g2.fillRect(x+2,y+2,12,12)}
 if(G.reply&&G.hintPly===G.st.ply){box(G.reply.f,'rgba(230,60,60,.8)');box(G.reply.t,'rgba(230,60,60,.8)')}};
const _dm37=doMove;doMove=function(m){if(CG&&CG.st.turn==='w'){CG.hist=CG.hist||[];CG.hist.push(CG.st)}_dm37(m)};
const tbb=document.createElement('button');tbb.id='chu';tbb.textContent='Take back';tbb.style.display='none';document.querySelector('#chs .bt').insertBefore(tbb,document.getElementById('chr'));
tbb.addEventListener('click',()=>{const G=CG;if(!G||G.over||G.busy||G.st.turn!=='w'||!(G.hist&&G.hist.length)||(G.undos|0)>=1)return;G.st=G.hist.pop();G.undos=(G.undos|0)+1;G.last=null;G.sel=-1;G.moves=[];G.hint=null;G.hintPly=-1;chst.textContent='Move taken back. Your move.';sfx('talk');chUI()});
const _chu37=chUI;chUI=function(){_chu37();const G=CG;tbb.style.display=G&&!G.over&&perk(7,'takeback')&&G.hist&&G.hist.length&&!(G.undos>=1)?'':'none'};
const _ec37=endChess;endChess=function(res,why){const L=CLV[CG.li],li=CG.li;_ec37(res,why);let extra='';
 if(res==='w'){if(perk(7,'prize')){const g=Math.round(L.g*.5);GLD+=g;extra+=' +'+g+' prize gold.'}if(perk(7,'tournament')&&li===3){GLD+=L.g;addXp(7,L.xp);extra+=' Tournament: double rewards!'}}
 else if(res==='d'&&perk(7,'patience')){GLD+=L.g-Math.round(L.g/2);addXp(7,L.xp-Math.round(L.xp/2));extra+=' Patience: a draw pays like a win.'}
 else if(res!=='w'&&res!=='d'&&perk(7,'studyhall')&&!CG.noXp){addXp(7,L.xp-Math.round(L.xp*.15));extra+=' Study Hall: full XP.'}
 if(extra){chst.textContent+=extra;saveLocal(true)}};
