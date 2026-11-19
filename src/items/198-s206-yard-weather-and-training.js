// ---- 206. Backyards are outdoors: rain, bows, wands and ultimates ----
// Yards and courtyards (145) are `home` scenes, so the game treated them as indoors:
//  - 021's drawHUD only draws weather outdoors or on islands (`!SCENE || room.region`), so it never rained in a yard;
//  - every "Not indoors!" check (`SCENE && !SCENE.room.cave`: 028 castSpell, 023 shootAim (mouse and controller shots go
//    through it), 029/086/096 castUlt) refused bows, wands and ultimates there, so players couldn't shoot or cast at the
//    training dummy in their yard (033's dummyAt already handles arrows/spells in a `home` scene).
// The yard rooms' `cave` flag becomes a getter that says "yes" only while one of those calls runs (FIGHT), so everything else
// that reads `cave` (014's cave darkness, cave music, caveAttack on HIT, 012's monster clearing) still sees a normal room.
// Weather in a yard follows the house's spot outside: 021's biomeHere returns 'in' for every scene (rain still builds up),
// so here it returns the Hollow biome around the house's door (snow/desert/grass), or grass for island homes.
(()=>{const isYard=()=>!!(SCENE&&SCENE.room&&(SCENE.room.yard||SCENE.room.court)&&SCENE.yardOf);
 let FIGHT=0;
 for(const k of['yard','court']){const R=ROOMS[k];if(!R)continue;const own=R.cave;try{delete R.cave}catch(e){}
  Object.defineProperty(R,'cave',{configurable:true,get(){return FIGHT>0||!!own},set(v){}})}
 const during=f=>function(){const y=isYard();if(y)FIGHT++;try{return f.apply(this,arguments)}finally{if(y)FIGHT--}};
 castSpell=during(castSpell);shootAim=during(shootAim);castUlt=during(castUlt);
 if(typeof drawCrosshair==='function')drawCrosshair=during(drawCrosshair);
 // rain/snow/haze in yards
 {SQHUD.before('198',()=>{try{if(isYard()&&typeof drawWeather==='function')drawWeather()}catch(e){}})}
 {const _b=biomeHere;biomeHere=function(){if(!isYard())return _b();try{const r=SCENE.ret;if(r&&!(SCENE.yardOf&&SCENE.yardOf.room&&SCENE.yardOf.room.region)&&typeof tile!=='undefined'){
    const x=Math.floor(r.x/16),y=Math.floor(r.y/16);let s=0,d=0;for(let dy=-4;dy<=4;dy+=2)for(let dx=-5;dx<=5;dx+=2){const t=tile[(y+dy)*N+x+dx];if(t===4)s++;else if(t===5)d++}
    return s>=10?'snow':d>=10?'desert':'grass'}}catch(e){}return'grass'}}
 window.SQYARDOUT={isYard,get fight(){return FIGHT}};
})();
