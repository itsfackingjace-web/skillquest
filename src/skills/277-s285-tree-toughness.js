// ---- 285. Trees take longer the higher they are, and void trees need Woodcutting 75 (Nov 24, Jace) ----
// Before: each swing took 1 + the axe's tier off a tree (2 with a wooden axe, 8 adamant, 10 meteorite) while trees only had 3 (plain
// tree, pine) to 14 (yew), so every tree fell in under a second and an adamant axe felled most in one swing. Void trees (o.v 'dark':
// the Shattered Expanse, guild void saplings) were plain trees whose logs 199 swaps for void logs: any level, any axe.
// Now (the "Trees" tab of the SQ Blacksmith's Bench sheet): an axe has a chopping POWER (wooden 1 ... meteorite 3) and a tree a
// TOUGHNESS; a tree falls after ceil(toughness / power) swings. Chopping swings are slower and heavier than other swings: 0.6 s
// at Woodcutting 1 instead of 0.25 (CHOPSW; quicker with level, perks and axe upgrades, since the HIT wrap below scales whatever swing
// the chop site set, and the chop animation lasts longer), with the toughness numbers lowered to match (Nov 24 playtest: maples,
// yews and void trees also felt too slow). Every chop site asks SQCHOP.dmg(o) for what one swing takes off: 004 (Hollow trees), 014 (pines), 050 (island
// trees), 083 (oak/willow/maple/yew and Dev Suite trees). Objects keep their old hit points (OHP: obj, island items, regrowth,
// the "stays standing" perks all use them), so a swing takes power × OHP / toughness off instead (+1e-9 so a whole number of
// swings never misses by a rounding hair). Dev Suite trees (176's g_<id>, toughness = their hp) just use the new power.
// Void trees: Woodcutting 75 and an adamant axe or better (a HIT wrap refuses before 096/199 run), toughness 66, 400 XP a tree
// (199 adds what the plain tree didn't give). Only on islands, where 199 makes void logs; a dark tree on Hollow stays a plain tree.
(()=>{
 const POW={1:1,2:1.25,3:1.5,4:1.75,5:2,6:2.25,7:2.5,8:2.75,9:3};// by axe tier (TL.axe): wooden 1, stone 2, iron 3, steel 4, mithril 6, adamant 7, meteorite 9
 const TOUGH={tree:3,pine:3,oak:9,willow:16,maple:28,yew:42};// with a 0.6 s swing: tree 3 swings with a wooden axe, yew 17 with adamant
 const VOID={lv:75,axe:7,t:66,xp:400};// 22 swings with a meteorite axe, 27 with adamant
 const CHOPSW=.6,BASESW=.25;// a chopping swing at Woodcutting 1, and the swing the chop sites set
 let chopped=false;
 const pow=()=>{const a=TL.axe|0;return a<=0?1:POW[a]||(a>9?3+.25*(a-9):1)};
 const inIsland=()=>!!(typeof SCENE!=='undefined'&&SCENE&&SCENE.room&&SCENE.room.region);
 const isVoid=o=>!!(o&&o.v==='dark'&&typeof SKOF!=='undefined'&&SKOF[o.t]===1&&inIsland());
 // a tree's toughness, or null for anything that isn't a tree (cacti keep their old damage)
 function tough(o){if(!o)return null;if(isVoid(o))return VOID.t;if(TOUGH[o.t]!=null)return TOUGH[o.t];
  const T=window.SQTIER&&SQTIER[o.t];if(T&&(T.sk===1||T.base==='tree'))return T.hp||OHP[o.t]||3;return null}
 // what one swing takes off this object's hit points
 function dmg(o){const t=tough(o);if(t==null||!(t>0))return 1+(TL.axe|0);chopped=true;const hp=(typeof OHP!=='undefined'&&OHP[o.t])||3;return pow()*hp/t*(1+1e-9)}
 // 199 gives a void tree's extra XP: everything above what the plain tree it stands on already gave
 function voidXp(o){const t=o&&o.t,base=t==='pine'?28:t==='tree'?25:(window.SQTIER&&SQTIER[t]&&SQTIER[t].xp)||25;return Math.max(0,VOID.xp-base)}
 window.SQCHOP={POW,TOUGH,VOID,CHOPSW,pow,tough,dmg,voidXp,isVoid};
 // ---- void trees: Woodcutting 75 and an adamant axe ----
 const voidAhead=()=>{try{if(!inIsland()||dead||menuOpen||pnOpen||BUILD||swing>0)return null;const R=SCENE.room,[fx,fy]=front(13);let it=rgObjAt(R,Math.floor(fx/16),Math.floor(fy/16));
   if(!it&&R.region==='_yard'){const[gx,gy]=front(16);it=rgObjAt(R,Math.floor(gx/16),Math.floor(gy/16))}return it&&isVoid(it.o)?it:null}catch(e){self.SQERR&&SQERR(e,'277-1')}return null};
 SQHIT.wrap('277 trees: void trees need Woodcutting 75, slower chops',next=>function(){const it=voidAhead();
  if(it&&!(typeof facingNpc==='function'&&facingNpc())){const lv=lvOf(1)<VOID.lv,ax=(TL.axe|0)<VOID.axe;
   if(lv||ax){say(lv?'You need Woodcutting '+VOID.lv+' to chop void trees.':'You need an adamant axe or better for void trees.');try{sfx('swish')}catch(e){self.SQERR&&SQERR(e,'277-2')}swing=.25;
    try{gTxt(it.x*16+8,it.y*16-34,'Void Tree','#c8a0ff')}catch(e){self.SQERR&&SQERR(e,'277-3')}return}}
  // a chop: the swing the chop site set (0.25 s with the level/perk speed-ups) becomes a slower, heavier one
  chopped=false;const out=next.apply(this,arguments);
  try{if(chopped&&swing>0){swing*=CHOPSW/BASESW;if(typeof ACTN!=='undefined'&&ACTN&&ACTN.type==='chop'&&ACTN.t<.05)ACTN.dur=Math.min(.5,swing*.8)}}catch(e){self.SQERR&&SQERR(e,'277-6')}
  chopped=false;return out});
 // ---- the Woodcutting tree and the wiki say so ----
 {const _tg=treeGains;treeGains=function(sk,l){const a=_tg.apply(this,arguments);try{if(sk===1&&l===VOID.lv)return[...a,'Chop void trees (with an adamant axe or better)']}catch(e){self.SQERR&&SQERR(e,'277-4')}return a}}
 try{if(typeof WK_SKILL!=='undefined'&&WK_SKILL.Woodcutting)WK_SKILL.Woodcutting+=' Void trees need Woodcutting 75 and an adamant axe or better.'}catch(e){self.SQERR&&SQERR(e,'277-5')}
})();
