// ---- 183 (part 1). Fish made in Dev Suite > Gathering: the catch ----
// Sits right after 093's island fish and before 109 (which plays the reel and then calls the inner catchFish), so new fish
// get the same reel. window.SQGFISH is filled by dev/176 from the library: [{k item, n name, lv, xp, where [region keys] or
// null for everywhere, p chance per catch 0-1}]. A fish you're allowed to catch here bites with its chance; otherwise the
// game's own fish (and 093's island fish) as before.
(()=>{window.SQGFISH=window.SQGFISH||[];
 const _cf=catchFish;catchFish=function(){try{if(FISH&&SQGFISH.length){const reg=typeof curRegion==='function'?curRegion():'hollow',L=lvOf(9);
   for(const f of SQGFISH){if(L<f.lv||!INAME[f.k])continue;if(f.where&&!f.where.includes(reg))continue;if(Math.random()>=f.p)continue;
    if(Math.random()<Math.min(.85,.45+L*.01)){inv[f.k]=(inv[f.k]|0)+1;addXp(9,f.xp);say('You catch '+(/^[aeiou]/i.test(f.n)?'an ':'a ')+f.n.toLowerCase()+'!');sfx('pickup');try{gTxt(FISH.bx,FISH.by-24,f.n,'#58a8ff')}catch(e){}}
    else say('It got away...');FISH.t=0;FISH.bite=0;FISH.wait=(2+Math.random()*3)*Math.max(.6,1-L*.006);return}}}catch(e){}return _cf.apply(this,arguments)}})();
